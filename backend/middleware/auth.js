/**
 * Auth middleware — verifies Firebase ID token and attaches user + role to req.
 * Roles: manager | kitchen_staff | sustainability_officer | university_admin
 */
const { admin, db } = require("../services/firebase");

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // Fetch user profile from Firestore to get role
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: userData.role || "kitchen_staff",
      canteenId: userData.canteenId || null,
      displayName: userData.displayName || decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Role guard middleware factory */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
