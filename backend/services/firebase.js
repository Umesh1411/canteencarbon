const admin = require("firebase-admin");

if (admin.getApps().length === 0) {
  try {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin initialized with service account.");
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "canteencarbon",
      });
      console.log("Firebase Admin initialized with Project ID:", process.env.FIREBASE_PROJECT_ID || "canteencarbon");
    }
  } catch (err) {
    console.warn("Firebase Admin initialization warning:", err.message);
  }
}

let db;
try {
  const { getFirestore } = require("firebase-admin/firestore");
  db = getFirestore();
} catch (e) {
  db = null;
}

module.exports = { admin, db };
