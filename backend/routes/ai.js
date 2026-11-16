/**
 * AI Insights route — Gemini multi-agent analysis with offline fallback
 */
const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");

const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai").catch(() => null) || {};
  if (!GoogleGenerativeAI || !GEMINI_KEY) throw new Error("Gemini not available");
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Parse JSON from response
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  return { raw: text };
}

function offlineFallback(analytics) {
  const topSource = Object.entries(analytics.bySource || {})
    .sort(([, a], [, b]) => b - a)[0];
  return {
    hypothesis: `The largest waste source is ${topSource?.[0] || "preparation"} at ${topSource?.[1]?.toFixed(1) || 0} kg, suggesting overproduction or portion sizing issues.`,
    supporting_evidence: [
      `Total waste: ${analytics.totalWasteKg} kg from ${analytics.entryCount} logged entries.`,
      `Waste per meal: ${analytics.wastePerMealG} g — above 15g/meal indicates systemic overproduction.`,
    ],
    alternative_explanations: [
      "Demand variation due to academic calendar (exams, holidays).",
      "Menu preferences not aligned with student demand.",
      "Portion sizes may be standardized but not demand-responsive.",
    ],
    confidence: "medium",
    limitations: ["Analysis based only on logged entries. Unrecorded waste is not captured."],
    follow_up_questions: [
      "Are waste levels higher on specific days of the week?",
      "Does weather or attendance influence waste?",
      "Have any menu changes been tried recently?",
    ],
    recommendations: [
      "Reduce batch sizes by 10% for dishes with consistent leftover.",
      "Introduce demand forecasting for high-waste meal periods.",
      "Train kitchen staff on portion control.",
    ],
    source: "offline_deterministic",
  };
}

/**
 * POST /api/ai/insights
 * Body: analytics summary object
 */
router.post(
  "/insights",
  verifyToken,
  requireRole("manager", "sustainability_officer", "university_admin"),
  async (req, res) => {
    const analytics = req.body.analytics || {};
    try {
      if (!GEMINI_KEY || GEMINI_KEY === "your_gemini_api_key") {
        return res.json(offlineFallback(analytics));
      }
      const prompt = `
ROLE: You are the Root-Cause Analyst Agent in CanteenCarbon, a university-canteen food-waste analysis system.
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
  "supporting_evidence": [],
  "alternative_explanations": [],
  "confidence": "low | medium | high",
  "limitations": [],
  "follow_up_questions": [],
  "recommendations": []
}`;

      const result = await callGemini(prompt);
      result.source = "gemini";
      return res.json(result);
    } catch (err) {
      return res.json({ ...offlineFallback(analytics), gemini_error: err.message });
    }
  }
);

module.exports = router;
