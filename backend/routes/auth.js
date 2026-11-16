/**
 * Auth route — create/fetch user profile with role
 */
const express = require("express");
const router = express.Router();
const { admin, db } = require("../services/firebase");
const { verifyToken } = require("../middleware/auth");

const VALID_ROLES = ["manager", "kitchen_staff", "sustainability_officer", "university_admin"];

/**
 * POST /api/auth/profile
 * Called after Firebase login to create/sync user profile in Firestore.
 * Body: { role, canteenId, displayName }
 */
router.post("/profile", verifyToken, async (req, res) => {
  try {
    const { role, canteenId, displayName } = req.body;
    const uid = req.user.uid;

    const ref = db.collection("users").doc(uid);
    const existing = await ref.get();

    if (!existing.exists) {
      // New user — set role
      const safeRole = VALID_ROLES.includes(role) ? role : "kitchen_staff";
      await ref.set({
        uid,
        email: req.user.email,
        role: safeRole,
        canteenId: canteenId || "default",
        displayName: displayName || req.user.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const created = await ref.get();
      return res.json({ user: created.data(), created: true });
    }

    // Existing user — return profile
    return res.json({ user: existing.data(), created: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
