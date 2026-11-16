/**
 * ML prediction route — calls Python FastAPI service
 */
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { verifyToken, requireRole } = require("../middleware/auth");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/ml/predict
 * Body: { meals_served, kitchen_staff, temperature_C, humidity_percent,
 *         day_of_week, special_event, past_waste_kg, staff_experience, waste_category }
 */
router.post(
  "/predict",
  verifyToken,
  requireRole("manager", "sustainability_officer"),
  async (req, res) => {
    try {
      const response = await axios.post(`${ML_URL}/predict`, req.body, { timeout: 10000 });
      res.json(response.data);
    } catch (err) {
      // Offline fallback — simple linear estimate
      const { meals_served = 200, past_waste_kg = 30 } = req.body;
      const predicted = parseFloat((past_waste_kg * 0.85 + meals_served * 0.05).toFixed(2));
      res.json({
        predicted_waste_kg: predicted,
        model: "offline_fallback",
        note: "ML service unavailable. Using deterministic fallback estimate.",
        confidence_interval: [parseFloat((predicted * 0.8).toFixed(2)), parseFloat((predicted * 1.2).toFixed(2))],
      });
    }
  }
);

/**
 * GET /api/ml/health
 */
router.get("/health", verifyToken, async (req, res) => {
  try {
    const r = await axios.get(`${ML_URL}/health`, { timeout: 3000 });
    res.json({ ml_service: "online", ...r.data });
  } catch {
    res.json({ ml_service: "offline", fallback: "deterministic" });
  }
});

module.exports = router;
