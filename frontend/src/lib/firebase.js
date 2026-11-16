import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC1ILbek9c0U3aRnFGoWXAJAW--auqxkvQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "canteencarbon.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "canteencarbon",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "canteencarbon.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1088954007444",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1088954007444:web:d9c7f885ee59632ee75981",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2WSHGC0BHC",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics Initialization
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
