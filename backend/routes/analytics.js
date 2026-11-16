/**
 * Analytics routes — waste summary, carbon, trends
 * Accessible by manager, sustainability_officer, university_admin
 */
const express = require("express");
const router = express.Router();
const { db } = require("../services/firebase");
const { verifyToken, requireRole } = require("../middleware/auth");

// Emission factors (kg CO2e per kg food) — IPCC / FAO sourced
const EMISSION_FACTORS = {
  dairy: 3.2,
  meat: 27.0,
  MeAt: 27.0,
  poultry: 6.9,
  vegetables: 2.0,
  fruits: 1.1,
  grains: 1.4,
  legumes: 0.9,
  rice: 2.7,
  seafood: 5.4,
  Other: 2.5,
};

/**
 * GET /api/analytics/summary
 * Returns aggregated waste KPIs for the canteen
 */
router.get(
  "/summary",
  verifyToken,
  requireRole("manager", "sustainability_officer", "university_admin"),
  async (req, res) => {
    try {
      const { from, to } = req.query;
      let q = db
        .collection("wasteEntries")
        .where("canteenId", "==", req.user.canteenId);
      if (from) q = q.where("date", ">=", from);
      if (to) q = q.where("date", "<=", to);

      const snap = await q.get();
      const entries = snap.docs.map((d) => d.data());

      if (!entries.length) return res.json(emptyAnalytics());

      const totalWasteKg = entries.reduce((s, e) => s + (e.totalWasteKg || 0), 0);
      const totalMealsServed = entries.reduce((s, e) => s + (e.mealsServed || 0), 0);
      const totalPreparedKg = entries.reduce((s, e) => s + (e.preparedKg || 0), 0);

      // By source
      const bySource = {
        Preparation: entries.reduce((s, e) => s + (e.prepScrapsKg || 0), 0),
        Unserved: entries.reduce((s, e) => s + (e.edibleLeftoverKg || 0), 0),
        Plate: entries.reduce((s, e) => s + (e.spoiledKg || 0), 0),
      };

      // By meal period
      const byMeal = {};
      for (const e of entries) {
        byMeal[e.mealPeriod] = (byMeal[e.mealPeriod] || 0) + (e.totalWasteKg || 0);
      }

      // By category
      const byCategory = {};
      for (const e of entries) {
        const cat = e.category || "Other";
        byCategory[cat] = (byCategory[cat] || 0) + (e.totalWasteKg || 0);
      }

      // Carbon estimate
      let totalCarbonKgCO2e = 0;
      for (const [cat, kg] of Object.entries(byCategory)) {
        const ef = EMISSION_FACTORS[cat] || EMISSION_FACTORS.Other;
        totalCarbonKgCO2e += kg * ef;
      }

      // Waste trend (daily)
      const dailyMap = {};
      for (const e of entries) {
        dailyMap[e.date] = (dailyMap[e.date] || 0) + (e.totalWasteKg || 0);
      }
      const trend = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, kg]) => ({ date, wasteKg: parseFloat(kg.toFixed(2)) }));

      res.json({
        totalWasteKg: parseFloat(totalWasteKg.toFixed(2)),
        totalMealsServed,
        totalPreparedKg: parseFloat(totalPreparedKg.toFixed(2)),
        wastePerMealG:
          totalMealsServed > 0
            ? parseFloat(((totalWasteKg / totalMealsServed) * 1000).toFixed(1))
            : 0,
        wasteRate:
          totalPreparedKg > 0
            ? parseFloat(((totalWasteKg / totalPreparedKg) * 100).toFixed(1))
            : 0,
        totalCarbonKgCO2e: parseFloat(totalCarbonKgCO2e.toFixed(2)),
        bySource,
        byMeal,
        byCategory,
        trend,
        entryCount: entries.length,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

function emptyAnalytics() {
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
  };
}

module.exports = router;
