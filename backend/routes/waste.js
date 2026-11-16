/**
 * Waste logging routes
 * Kitchen staff logs daily waste; manager can view all entries.
 */
const express = require("express");
const router = express.Router();
const { db, admin } = require("../services/firebase");
const { verifyToken, requireRole } = require("../middleware/auth");

const WASTE_SOURCES = ["Preparation", "Unserved", "Plate"];
const MEAL_PERIODS = ["Breakfast", "Lunch", "Dinner"];

/**
 * POST /api/waste/log
 * Log a new waste entry (kitchen_staff, manager)
 */
router.post(
  "/log",
  verifyToken,
  requireRole("kitchen_staff", "manager"),
  async (req, res) => {
    try {
      const {
        date,
        mealPeriod,
        dishName,
        category,
        preparedKg,
        servedKg,
        edibleLeftoverKg,
        prepScrapsKg,
        spoiledKg,
        mealsServed,
        notes,
      } = req.body;

      // Basic validation
      if (!date || !mealPeriod || !dishName)
        return res.status(400).json({ error: "date, mealPeriod, dishName required" });
      if (!MEAL_PERIODS.includes(mealPeriod))
        return res.status(400).json({ error: `mealPeriod must be one of: ${MEAL_PERIODS}` });

      const totalWasteKg =
        (parseFloat(edibleLeftoverKg) || 0) +
        (parseFloat(prepScrapsKg) || 0) +
        (parseFloat(spoiledKg) || 0);

      const entry = {
        date,
        mealPeriod,
        dishName,
        category: category || "Other",
        preparedKg: parseFloat(preparedKg) || 0,
        servedKg: parseFloat(servedKg) || 0,
        edibleLeftoverKg: parseFloat(edibleLeftoverKg) || 0,
        prepScrapsKg: parseFloat(prepScrapsKg) || 0,
        spoiledKg: parseFloat(spoiledKg) || 0,
        totalWasteKg,
        mealsServed: parseInt(mealsServed) || 0,
        wastePerMealG: mealsServed > 0 ? (totalWasteKg / mealsServed) * 1000 : 0,
        notes: notes || "",
        recordedBy: req.user.uid,
        recordedByName: req.user.displayName,
        canteenId: req.user.canteenId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("wasteEntries").add(entry);
      res.json({ id: docRef.id, ...entry });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET /api/waste/entries
 * Manager: all entries for their canteen. Staff: only their own.
 */
router.get("/entries", verifyToken, async (req, res) => {
  try {
    const { from, to, mealPeriod, limit = 100 } = req.query;
    let q = db
      .collection("wasteEntries")
      .where("canteenId", "==", req.user.canteenId)
      .orderBy("date", "desc")
      .limit(parseInt(limit));

    if (req.user.role === "kitchen_staff") {
      q = q.where("recordedBy", "==", req.user.uid);
    }
    if (from) q = q.where("date", ">=", from);
    if (to) q = q.where("date", "<=", to);
    if (mealPeriod) q = q.where("mealPeriod", "==", mealPeriod);

    const snap = await q.get();
    const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ entries, count: entries.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/waste/entries/:id — manager only
 */
router.delete(
  "/entries/:id",
  verifyToken,
  requireRole("manager", "university_admin"),
  async (req, res) => {
    try {
      await db.collection("wasteEntries").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
