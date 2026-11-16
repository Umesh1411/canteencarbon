import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { getCanteen } from "../lib/canteens";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const normalizedCanteenId =
              data.canteenId === "default" || !data.canteenId ? "central_dining" : data.canteenId;
            const canteen = getCanteen(normalizedCanteenId);
            const userProf = {
              ...data,
              canteenId: normalizedCanteenId,
              canteenName: canteen.name,
              canteenIcon: canteen.icon,
            };
            setProfile(userProf);
          } else {
            // Default fallback profile if not found
            const canteen = getCanteen("central_dining");
            const defaultProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "kitchen_staff",
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Staff",
              canteenId: "central_dining",
              canteenName: canteen.name,
              canteenIcon: canteen.icon,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, defaultProfile, { merge: true });
            setProfile(defaultProfile);
          }
        } catch (err) {
          console.warn("Direct Firestore read failed, using auth profile:", err);
          const canteen = getCanteen("central_dining");
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "kitchen_staff",
            displayName: firebaseUser.email?.split("@")[0] || "Staff",
            canteenId: "central_dining",
            canteenName: canteen.name,
            canteenIcon: canteen.icon,
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, role, displayName, canteenId = "central_dining") => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const canteen = getCanteen(canteenId);
    const userProfile = {
      uid: cred.user.uid,
      email,
      role: role || "kitchen_staff",
      displayName: displayName || email.split("@")[0],
      canteenId: role === "university_admin" || role === "sustainability_officer" ? "ALL" : canteenId,
      canteenName: role === "university_admin" || role === "sustainability_officer" ? "All Campus Canteens" : canteen.name,
      canteenIcon: canteen.icon,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, "users", cred.user.uid), userProfile);
    } catch (e) {
      console.warn("Could not save profile directly to Firestore:", e);
    }
    setProfile(userProfile);
    return cred;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
