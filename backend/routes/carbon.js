/**
 * Carbon footprint route — sustainability officer + manager
 */
const express = require("express");
const router = express.Router();
const { db } = require("../services/firebase");
const { verifyToken, requireRole } = require("../middleware/auth");

const EF = {
  dairy: { factor: 3.2, source: "IPCC AR6 WGIII (2022)" },
  meat: { factor: 27.0, source: "Poore & Nemecek, Science (2018)" },
  MeAt: { factor: 27.0, source: "Poore & Nemecek, Science (2018)" },
  poultry: { factor: 6.9, source: "Poore & Nemecek, Science (2018)" },
  vegetables: { factor: 2.0, source: "FAO (2021)" },
  fruits: { factor: 1.1, source: "FAO (2021)" },
  grains: { factor: 1.4, source: "FAO (2021)" },
  legumes: { factor: 0.9, source: "Poore & Nemecek, Science (2018)" },
  rice: { factor: 2.7, source: "IPCC 2006 Guidelines" },
  seafood: { factor: 5.4, source: "Poore & Nemecek, Science (2018)" },
  Other: { factor: 2.5, source: "FAO average estimate" },
};

router.get(
  "/footprint",
  verifyToken,
  requireRole("manager", "sustainability_officer", "university_admin"),
  async (req, res) => {
    try {
      const { from, to } = req.query;
      let q = db.collection("wasteEntries").where("canteenId", "==", req.user.canteenId);
      if (from) q = q.where("date", ">=", from);
      if (to) q = q.where("date", "<=", to);
      const snap = await q.get();
      const entries = snap.docs.map((d) => d.data());

      const categoryBreakdown = {};
      for (const e of entries) {
        const cat = e.category || "Other";
        if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { wasteKg: 0, co2eKg: 0 };
        categoryBreakdown[cat].wasteKg += e.totalWasteKg || 0;
      }

      let totalCO2e = 0;
      const breakdown = Object.entries(categoryBreakdown).map(([cat, data]) => {
        const { factor, source } = EF[cat] || EF.Other;
        const co2e = data.wasteKg * factor;
        totalCO2e += co2e;
        return {
          category: cat,
          wasteKg: parseFloat(data.wasteKg.toFixed(2)),
          emissionFactor: factor,
          source,
          co2eKg: parseFloat(co2e.toFixed(2)),
        };
      });

      res.json({
        totalCO2eKg: parseFloat(totalCO2e.toFixed(2)),
        totalCO2eTonnes: parseFloat((totalCO2e / 1000).toFixed(3)),
        systemBoundary: "Food production & supply chain (cradle-to-gate). Transport and disposal not included.",
        disclaimer: "Estimates based on published emission factors. Not verified measurements.",
        breakdown,
        emissionFactors: EF,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
