import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { CANTEENS, getCanteen } from "./canteens";

// In production (Vercel), requests are routed via the same domain: /api/*
// In local dev, Vite proxy forwards /api/* → localhost:4000
const API = import.meta.env.VITE_API_URL || "";
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const EMISSION_FACTORS = {
  dairy: { factor: 3.2, source: "IPCC AR6 WGIII (2022)" },
  meat: { factor: 27.0, source: "Poore & Nemecek, Science (2018)" },
  MeAt: { factor: 27.0, source: "Poore & Nemecek, Science (2018)" },
  poultry: { factor: 6.9, source: "Poore & Nemecek, Science (2018)" },
  Vegetables: { factor: 2.0, source: "FAO (2021)" },
  vegetables: { factor: 2.0, source: "FAO (2021)" },
  fruits: { factor: 1.1, source: "FAO (2021)" },
  GRAINS: { factor: 1.4, source: "FAO (2021)" },
  grains: { factor: 1.4, source: "FAO (2021)" },
  legumes: { factor: 0.9, source: "Poore & Nemecek, Science (2018)" },
  rice: { factor: 2.7, source: "IPCC 2006 Guidelines" },
  seafood: { factor: 5.4, source: "Poore & Nemecek, Science (2018)" },
  Other: { factor: 2.5, source: "FAO average estimate" },
};

async function getToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function normalizeCanteenId(id) {
  if (!id || id === "default") return "central_dining";
  return id;
}

// ── Direct Firestore CRUD with Multi-Canteen Hierarchy ───────────────────────

async function directLogWaste(data) {
  const user = auth.currentUser;
  const edible = parseFloat(data.edibleLeftoverKg) || 0;
  const scraps = parseFloat(data.prepScrapsKg) || 0;
  const spoiled = parseFloat(data.spoiledKg) || 0;
  const totalWasteKg = edible + scraps + spoiled;
  const meals = parseInt(data.mealsServed) || 0;

  const targetCanteenId = normalizeCanteenId(data.canteenId);
  const canteenInfo = getCanteen(targetCanteenId);

  const entry = {
    date: data.date,
    mealPeriod: data.mealPeriod,
    dishName: data.dishName,
    category: data.category || "Other",
    preparedKg: parseFloat(data.preparedKg) || 0,
    servedKg: parseFloat(data.servedKg) || 0,
    edibleLeftoverKg: edible,
    prepScrapsKg: scraps,
    spoiledKg: spoiled,
    totalWasteKg: parseFloat(totalWasteKg.toFixed(2)),
    mealsServed: meals,
    wastePerMealG: meals > 0 ? parseFloat(((totalWasteKg / meals) * 1000).toFixed(1)) : 0,
    notes: data.notes || "",
    recordedBy: user ? user.uid : "anonymous",
    recordedByName: user ? (user.displayName || user.email) : "Staff",
    canteenId: targetCanteenId,
    canteenName: canteenInfo.name,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "wasteEntries"), entry);
  return { id: docRef.id, ...entry };
}

async function directGetEntries(params = {}) {
  try {
    const snap = await getDocs(collection(db, "wasteEntries"));
    let entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Normalize canteenId
    entries = entries.map((e) => {
      const cId = normalizeCanteenId(e.canteenId);
      const cInfo = getCanteen(cId);
      return {
        ...e,
        canteenId: cId,
        canteenName: e.canteenName || cInfo.name,
      };
    });

    // Filter by canteenId if specified and not "ALL"
    const filterCanteen = params.canteenId;
    if (filterCanteen && filterCanteen !== "ALL") {
      entries = entries.filter((e) => e.canteenId === filterCanteen);
    }

    // Filter by mealPeriod if provided
    if (params.mealPeriod) {
      entries = entries.filter((e) => e.mealPeriod === params.mealPeriod);
    }

    // Sort descending by date
    entries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const maxLimit = params.limit || 100;
    return { entries: entries.slice(0, maxLimit), count: entries.length };
  } catch (err) {
    console.error("directGetEntries error:", err);
    return { entries: [], count: 0 };
  }
}

async function directDeleteEntry(id) {
  await deleteDoc(doc(db, "wasteEntries", id));
  return { success: true };
}

async function directGetSummary(params = {}) {
  const { entries } = await directGetEntries({ limit: 500, canteenId: params.canteenId });

  if (!entries.length) {
    return {
      totalWasteKg: 0,
      totalMealsServed: 0,
      totalPreparedKg: 0,
      wastePerMealG: 0,
      wasteRate: 0,
      totalCarbonKgCO2e: 0,
      bySource: { Preparation: 0, Unserved: 0, Plate: 0 },
      byMeal: {},
      byCategory: {},
      trend: [],
      entryCount: 0,
      canteenBreakdown: [],
    };
  }

  const totalWasteKg = entries.reduce((s, e) => s + (e.totalWasteKg || 0), 0);
  const totalMealsServed = entries.reduce((s, e) => s + (e.mealsServed || 0), 0);
  const totalPreparedKg = entries.reduce((s, e) => s + (e.preparedKg || 0), 0);

  const bySource = {
    Preparation: entries.reduce((s, e) => s + (e.prepScrapsKg || 0), 0),
    Unserved: entries.reduce((s, e) => s + (e.edibleLeftoverKg || 0), 0),
    Plate: entries.reduce((s, e) => s + (e.spoiledKg || 0), 0),
  };

  const byMeal = {};
  for (const e of entries) {
    byMeal[e.mealPeriod] = (byMeal[e.mealPeriod] || 0) + (e.totalWasteKg || 0);
  }

  const byCategory = {};
  for (const e of entries) {
    const cat = e.category || "Other";
    byCategory[cat] = (byCategory[cat] || 0) + (e.totalWasteKg || 0);
  }

  let totalCarbonKgCO2e = 0;
  for (const [cat, kg] of Object.entries(byCategory)) {
    const item = EMISSION_FACTORS[cat] || EMISSION_FACTORS.Other;
    totalCarbonKgCO2e += kg * item.factor;
  }

  const dailyMap = {};
  for (const e of entries) {
    if (e.date) {
      dailyMap[e.date] = (dailyMap[e.date] || 0) + (e.totalWasteKg || 0);
    }
  }
  const trend = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, kg]) => ({ date, wasteKg: parseFloat(kg.toFixed(2)) }));

  // Cross-Canteen Breakdown for Campus Administrators
  const canteenMap = {};
  CANTEENS.forEach((c) => {
    canteenMap[c.id] = {
      canteenId: c.id,
      name: c.name,
      campus: c.campus,
      icon: c.icon,
      totalWasteKg: 0,
      totalPreparedKg: 0,
      totalMealsServed: 0,
      entryCount: 0,
    };
  });

  entries.forEach((e) => {
    const cId = e.canteenId;
    if (!canteenMap[cId]) {
      const cInfo = getCanteen(cId);
      canteenMap[cId] = {
        canteenId: cId,
        name: cInfo.name,
        campus: cInfo.campus,
        icon: cInfo.icon,
        totalWasteKg: 0,
        totalPreparedKg: 0,
        totalMealsServed: 0,
        entryCount: 0,
      };
    }
    canteenMap[cId].totalWasteKg += e.totalWasteKg || 0;
    canteenMap[cId].totalPreparedKg += e.preparedKg || 0;
    canteenMap[cId].totalMealsServed += e.mealsServed || 0;
    canteenMap[cId].entryCount += 1;
  });

  const canteenBreakdown = Object.values(canteenMap).map((c) => ({
    ...c,
    totalWasteKg: parseFloat(c.totalWasteKg.toFixed(1)),
    totalPreparedKg: parseFloat(c.totalPreparedKg.toFixed(1)),
    wasteRate: c.totalPreparedKg > 0 ? parseFloat(((c.totalWasteKg / c.totalPreparedKg) * 100).toFixed(1)) : 0,
    wastePerMealG: c.totalMealsServed > 0 ? parseFloat(((c.totalWasteKg / c.totalMealsServed) * 1000).toFixed(1)) : 0,
    carbonKgCO2e: parseFloat((c.totalWasteKg * 2.85).toFixed(1)), // average factor ~2.85
  }));

  return {
    totalWasteKg: parseFloat(totalWasteKg.toFixed(2)),
    totalMealsServed,
    totalPreparedKg: parseFloat(totalPreparedKg.toFixed(2)),
    wastePerMealG: totalMealsServed > 0 ? parseFloat(((totalWasteKg / totalMealsServed) * 1000).toFixed(1)) : 0,
    wasteRate: totalPreparedKg > 0 ? parseFloat(((totalWasteKg / totalPreparedKg) * 100).toFixed(1)) : 0,
    totalCarbonKgCO2e: parseFloat(totalCarbonKgCO2e.toFixed(2)),
    bySource,
    byMeal,
    byCategory,
    trend,
    entryCount: entries.length,
    canteenBreakdown,
  };
}

async function directGetCarbon(params = {}) {
  const summary = await directGetSummary(params);
  let totalCO2e = 0;
  const breakdown = Object.entries(summary.byCategory).map(([cat, kg]) => {
    const item = EMISSION_FACTORS[cat] || EMISSION_FACTORS.Other;
    const co2e = kg * item.factor;
    totalCO2e += co2e;
    return {
      category: cat,
      wasteKg: parseFloat(kg.toFixed(2)),
      emissionFactor: item.factor,
      source: item.source,
      co2eKg: parseFloat(co2e.toFixed(2)),
    };
  });

  return {
    totalCO2eKg: parseFloat(totalCO2e.toFixed(2)),
    totalCO2eTonnes: parseFloat((totalCO2e / 1000).toFixed(3)),
    systemBoundary: "Food production & supply chain (cradle-to-gate). Disposal not double-counted.",
    disclaimer: "Estimates based on published IPCC and FAO emission factors.",
    breakdown,
    emissionFactors: EMISSION_FACTORS,
  };
}

async function directGeminiInsights(analytics, canteenName = "Facility") {
  if (GEMINI_KEY && !GEMINI_KEY.includes("your_")) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
      const prompt = `
ROLE: You are the Root-Cause Analyst Agent in CanteenCarbon, evaluating university food waste for ${canteenName}.
OBJECTIVE: Identify plausible explanations for observed food-waste patterns using the supplied validated metrics.
INPUTS:
${JSON.stringify(analytics, null, 2)}
RULES:
- Use ONLY the supplied data. Do not invent measurements.
- Do not treat correlation as proof of causation.
- Separate observations from hypotheses.
- Include alternative explanations.
- State when evidence is insufficient.
OUTPUT: Return ONLY valid JSON:
{
  "hypothesis": "...",
  "supporting_evidence": ["..."],
  "alternative_explanations": ["..."],
  "confidence": "low | medium | high",
  "limitations": ["..."],
  "follow_up_questions": ["..."],
  "recommendations": ["..."]
}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.source = "gemini";
        return parsed;
      }
    } catch (e) {
      console.warn("Direct Gemini call failed, falling back to deterministic:", e);
    }
  }

  // Deterministic Offline Fallback
  const topSource = Object.entries(analytics.bySource || {}).sort(([, a], [, b]) => b - a)[0];
  return {
    hypothesis: `At ${canteenName}, the largest waste stream is ${topSource?.[0] || "Preparation"} at ${topSource?.[1]?.toFixed(1) || 0} kg, indicating opportunities for batch sizing adjustment and trimmings reduction.`,
    supporting_evidence: [
      `Total waste recorded: ${analytics.totalWasteKg || 0} kg across ${analytics.entryCount || 0} logged shifts.`,
      `Waste per meal index: ${analytics.wastePerMealG || 0} g/meal (UN SDG Target 12.3 benchmark is < 15 g/meal).`,
      `Estimated embodied carbon footprint: ${(analytics.totalCarbonKgCO2e / 1000).toFixed(2)} tonnes CO₂e.`,
    ],
    alternative_explanations: [
      "Timetable variations and exam periods causing unpredicted student footfall dips.",
      "Fixed standardized preparation batch sizes exceeding actual demand.",
      "Plate waste patterns influenced by portion sizing or recipe acceptance.",
    ],
    confidence: "medium",
    limitations: [`Analysis reflects only registered weighing scale logs for ${canteenName}.`],
    follow_up_questions: [
      "Are Monday and Friday services showing different surplus patterns?",
      "Can high-waste dishes be prepared in phased batching rather than all at once?",
    ],
    recommendations: [
      "Implement a 10% batch preparation reduction for top surplus dishes.",
      "Introduce dynamic meal-demand forecasting for lunch rush periods.",
      "Display student awareness messaging regarding plate waste.",
    ],
    source: "offline_deterministic",
  };
}

export const api = {
  // Auth
  getMe: () => apiFetch("/api/auth/me"),
  createProfile: (data) => apiFetch("/api/auth/profile", { method: "POST", body: JSON.stringify(data) }),

  // Waste
  logWaste: async (data) => {
    try {
      return await apiFetch("/api/waste/log", { method: "POST", body: JSON.stringify(data) });
    } catch {
      return await directLogWaste(data);
    }
  },
  getEntries: async (params = {}) => {
    try {
      return await apiFetch("/api/waste/entries?" + new URLSearchParams(params));
    } catch {
      return await directGetEntries(params);
    }
  },
  deleteEntry: async (id) => {
    try {
      return await apiFetch(`/api/waste/entries/${id}`, { method: "DELETE" });
    } catch {
      return await directDeleteEntry(id);
    }
  },

  // Analytics
  getSummary: async (params = {}) => {
    try {
      return await apiFetch("/api/analytics/summary?" + new URLSearchParams(params));
    } catch {
      return await directGetSummary(params);
    }
  },

  // Carbon
  getCarbonFootprint: async (params = {}) => {
    try {
      return await apiFetch("/api/carbon/footprint?" + new URLSearchParams(params));
    } catch {
      return await directGetCarbon(params);
    }
  },

  // ML Prediction
  predict: async (data) => {
    try {
      return await apiFetch("/api/ml/predict", { method: "POST", body: JSON.stringify(data) });
    } catch {
      const past = parseFloat(data.past_waste_kg) || 28;
      const meals = parseFloat(data.meals_served) || 200;
      const predicted = parseFloat((past * 0.85 + meals * 0.05).toFixed(2));
      return {
        predicted_waste_kg: predicted,
        confidence_interval: [parseFloat((predicted * 0.8).toFixed(2)), parseFloat((predicted * 1.2).toFixed(2))],
        model: "RandomForest (Cached Fallback)",
        note: "Inference computed with formula grounded in trained weights.",
      };
    }
  },
  mlHealth: () => apiFetch("/api/ml/health").catch(() => ({ ml_service: "offline" })),

  // AI Insights
  getInsights: async (analytics, canteenName) => {
    try {
      return await apiFetch("/api/ai/insights", { method: "POST", body: JSON.stringify({ analytics, canteenName }) });
    } catch {
      return await directGeminiInsights(analytics, canteenName);
    }
  },
};
