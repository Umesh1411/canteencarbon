import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1ILbek9c0U3aRnFGoWXAJAW--auqxkvQ",
  authDomain: "canteencarbon.firebaseapp.com",
  projectId: "canteencarbon",
  storageBucket: "canteencarbon.firebasestorage.app",
  messagingSenderId: "1088954007444",
  appId: "1:1088954007444:web:d9c7f885ee59632ee75981",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper to create or login a user
async function getOrCreateUser(email, password, role, displayName, canteenId, canteenName) {
  let user;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    user = cred.user;
    console.log(`✓ Signed in existing user: ${email} (${user.uid})`);
  } catch (err) {
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        user = cred.user;
        console.log(`✓ Created new user: ${email} (${user.uid})`);
      } catch (createErr) {
        console.error(`Failed to create ${email}:`, createErr.message);
        return null;
      }
    } else {
      console.error(`Auth error for ${email}:`, err.message);
      return null;
    }
  }

  // Set/update profile in Firestore
  if (user) {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email,
        role,
        displayName,
        canteenId,
        canteenName,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`✓ Profile synced in Firestore for ${email} as [${role}] @ ${canteenName}`);
  }
  return user;
}

const SEED_ENTRIES = [
  // ── Central Dining Hall ──────────────────────────────────────────────────
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Steamed Basmati Rice",
    category: "rice",
    mealPeriod: "Lunch",
    dateOffset: 0,
    preparedKg: 55.0,
    servedKg: 48.0,
    edibleLeftoverKg: 4.5,
    prepScrapsKg: 1.5,
    spoiledKg: 0.0,
    mealsServed: 320,
    notes: "Normal lunch service, slight over-portioning in warmers",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Dal Tadka (Yellow Lentil)",
    category: "legumes",
    mealPeriod: "Lunch",
    dateOffset: 0,
    preparedKg: 35.0,
    servedKg: 31.5,
    edibleLeftoverKg: 2.5,
    prepScrapsKg: 0.8,
    spoiledKg: 0.0,
    mealsServed: 320,
    notes: "High consumption rate",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Paneer Butter Masala",
    category: "dairy",
    mealPeriod: "Dinner",
    dateOffset: 0,
    preparedKg: 38.0,
    servedKg: 34.0,
    edibleLeftoverKg: 2.2,
    prepScrapsKg: 1.1,
    spoiledKg: 0.0,
    mealsServed: 290,
    notes: "Popular item, low scrap loss",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Mixed Vegetable Sabzi",
    category: "Vegetables",
    mealPeriod: "Dinner",
    dateOffset: 0,
    preparedKg: 42.0,
    servedKg: 33.0,
    edibleLeftoverKg: 5.5,
    prepScrapsKg: 3.2,
    spoiledKg: 0.3,
    mealsServed: 290,
    notes: "High prep peelings trimmings recorded",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Idli & Coconut Chutney",
    category: "rice",
    mealPeriod: "Breakfast",
    dateOffset: 1,
    preparedKg: 28.0,
    servedKg: 25.0,
    edibleLeftoverKg: 2.0,
    prepScrapsKg: 0.5,
    spoiledKg: 0.0,
    mealsServed: 210,
    notes: "Breakfast batching well balanced",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Vegetable Dum Biryani",
    category: "rice",
    mealPeriod: "Lunch",
    dateOffset: 1,
    preparedKg: 65.0,
    servedKg: 54.0,
    edibleLeftoverKg: 7.0,
    prepScrapsKg: 2.8,
    spoiledKg: 0.5,
    mealsServed: 360,
    notes: "Friday special rush, surplus in bottom layer",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Tandoori Chicken Curry",
    category: "poultry",
    mealPeriod: "Dinner",
    dateOffset: 1,
    preparedKg: 40.0,
    servedKg: 36.5,
    edibleLeftoverKg: 2.0,
    prepScrapsKg: 1.2,
    spoiledKg: 0.0,
    mealsServed: 310,
    notes: "Minimal waste",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Chole Bhature",
    category: "legumes",
    mealPeriod: "Lunch",
    dateOffset: 2,
    preparedKg: 48.0,
    servedKg: 42.0,
    edibleLeftoverKg: 4.0,
    prepScrapsKg: 1.6,
    spoiledKg: 0.0,
    mealsServed: 330,
    notes: "Leftover gravy repurposed according to safety standards",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Aloo Gobi Dry",
    category: "Vegetables",
    mealPeriod: "Dinner",
    dateOffset: 2,
    preparedKg: 36.0,
    servedKg: 28.0,
    edibleLeftoverKg: 5.0,
    prepScrapsKg: 2.5,
    spoiledKg: 0.2,
    mealsServed: 280,
    notes: "Cauliflower stalks contributed to prep scraps",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Masala Dosa with Sambar",
    category: "legumes",
    mealPeriod: "Breakfast",
    dateOffset: 3,
    preparedKg: 30.0,
    servedKg: 26.5,
    edibleLeftoverKg: 2.2,
    prepScrapsKg: 0.9,
    spoiledKg: 0.0,
    mealsServed: 230,
    notes: "Quick service",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Jeera Rice & Rajma",
    category: "legumes",
    mealPeriod: "Lunch",
    dateOffset: 3,
    preparedKg: 52.0,
    servedKg: 45.0,
    edibleLeftoverKg: 4.8,
    prepScrapsKg: 1.8,
    spoiledKg: 0.0,
    mealsServed: 315,
    notes: "Slight cold weather boost in attendance",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Curd Rice with Pomegranate",
    category: "dairy",
    mealPeriod: "Lunch",
    dateOffset: 4,
    preparedKg: 25.0,
    servedKg: 21.0,
    edibleLeftoverKg: 3.0,
    prepScrapsKg: 0.5,
    spoiledKg: 0.0,
    mealsServed: 300,
    notes: "Summer cooler item",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Palak Paneer",
    category: "dairy",
    mealPeriod: "Dinner",
    dateOffset: 5,
    preparedKg: 40.0,
    servedKg: 33.0,
    edibleLeftoverKg: 4.5,
    prepScrapsKg: 2.1,
    spoiledKg: 0.0,
    mealsServed: 285,
    notes: "Spinach trimming loss was 1.8 kg",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Steamed Rice",
    category: "rice",
    mealPeriod: "Lunch",
    dateOffset: 6,
    preparedKg: 50.0,
    servedKg: 44.0,
    edibleLeftoverKg: 4.2,
    prepScrapsKg: 1.2,
    spoiledKg: 0.0,
    mealsServed: 305,
    notes: "Standard weekly rotation",
  },
  {
    canteenId: "central_dining",
    canteenName: "Central Dining Hall",
    dishName: "Egg Bhurji & Pav",
    category: "poultry",
    mealPeriod: "Dinner",
    dateOffset: 7,
    preparedKg: 32.0,
    servedKg: 29.0,
    edibleLeftoverKg: 1.8,
    prepScrapsKg: 1.0,
    spoiledKg: 0.0,
    mealsServed: 260,
    notes: "Egg shells classified as preparation scraps",
  },

  // ── North Campus Cafeteria ───────────────────────────────────────────────
  {
    canteenId: "north_cafeteria",
    canteenName: "North Campus Cafeteria",
    dishName: "Rajma Chawal Bowl",
    category: "legumes",
    mealPeriod: "Lunch",
    dateOffset: 0,
    preparedKg: 35.0,
    servedKg: 29.0,
    edibleLeftoverKg: 4.2,
    prepScrapsKg: 1.3,
    spoiledKg: 0.0,
    mealsServed: 190,
    notes: "North campus medical wing lunchtime",
  },
  {
    canteenId: "north_cafeteria",
    canteenName: "North Campus Cafeteria",
    dishName: "Mediterranean Pasta",
    category: "GRAINS",
    mealPeriod: "Dinner",
    dateOffset: 0,
    preparedKg: 28.0,
    servedKg: 22.5,
    edibleLeftoverKg: 4.0,
    prepScrapsKg: 1.1,
    spoiledKg: 0.2,
    mealsServed: 160,
    notes: "Higher plate waste due to olive garnish",
  },
  {
    canteenId: "north_cafeteria",
    canteenName: "North Campus Cafeteria",
    dishName: "Poha with Roasted Peanuts",
    category: "rice",
    mealPeriod: "Breakfast",
    dateOffset: 1,
    preparedKg: 20.0,
    servedKg: 18.0,
    edibleLeftoverKg: 1.5,
    prepScrapsKg: 0.4,
    spoiledKg: 0.0,
    mealsServed: 140,
    notes: "Light breakfast",
  },
  {
    canteenId: "north_cafeteria",
    canteenName: "North Campus Cafeteria",
    dishName: "Kadai Paneer & Naan",
    category: "dairy",
    mealPeriod: "Dinner",
    dateOffset: 1,
    preparedKg: 32.0,
    servedKg: 27.0,
    edibleLeftoverKg: 3.5,
    prepScrapsKg: 1.2,
    spoiledKg: 0.0,
    mealsServed: 180,
    notes: "Good turnout",
  },
  {
    canteenId: "north_cafeteria",
    canteenName: "North Campus Cafeteria",
    dishName: "Mixed Fruit Custard",
    category: "fruits",
    mealPeriod: "Lunch",
    dateOffset: 2,
    preparedKg: 22.0,
    servedKg: 17.0,
    edibleLeftoverKg: 3.8,
    prepScrapsKg: 1.2,
    spoiledKg: 0.0,
    mealsServed: 175,
    notes: "Fruit peels loss",
  },
  {
    canteenId: "north_cafeteria",
    canteenName: "North Campus Cafeteria",
    dishName: "Dal Makhani with Roti",
    category: "legumes",
    mealPeriod: "Dinner",
    dateOffset: 3,
    preparedKg: 30.0,
    servedKg: 24.5,
    edibleLeftoverKg: 4.0,
    prepScrapsKg: 1.0,
    spoiledKg: 0.0,
    mealsServed: 170,
    notes: "Slow evening exam week",
  },

  // ── Engineering Block Canteen ─────────────────────────────────────────────
  {
    canteenId: "eng_canteen",
    canteenName: "Engineering Block Canteen",
    dishName: "South Indian Thali Meal",
    category: "Vegetables",
    mealPeriod: "Lunch",
    dateOffset: 0,
    preparedKg: 45.0,
    servedKg: 39.0,
    edibleLeftoverKg: 3.8,
    prepScrapsKg: 1.8,
    spoiledKg: 0.0,
    mealsServed: 240,
    notes: "High engineering student volume",
  },
  {
    canteenId: "eng_canteen",
    canteenName: "Engineering Block Canteen",
    dishName: "Veg Hakka Noodles & Manchurian",
    category: "GRAINS",
    mealPeriod: "Dinner",
    dateOffset: 0,
    preparedKg: 38.0,
    servedKg: 32.0,
    edibleLeftoverKg: 4.2,
    prepScrapsKg: 1.4,
    spoiledKg: 0.0,
    mealsServed: 210,
    notes: "Popular fast service option",
  },
  {
    canteenId: "eng_canteen",
    canteenName: "Engineering Block Canteen",
    dishName: "Pav Bhaji (Butter Toasted)",
    category: "Vegetables",
    mealPeriod: "Lunch",
    dateOffset: 1,
    preparedKg: 40.0,
    servedKg: 35.0,
    edibleLeftoverKg: 3.2,
    prepScrapsKg: 1.5,
    spoiledKg: 0.0,
    mealsServed: 230,
    notes: "Potato peeling scraps accounted",
  },
  {
    canteenId: "eng_canteen",
    canteenName: "Engineering Block Canteen",
    dishName: "Chicken Fried Rice",
    category: "poultry",
    mealPeriod: "Dinner",
    dateOffset: 2,
    preparedKg: 35.0,
    servedKg: 31.0,
    edibleLeftoverKg: 2.5,
    prepScrapsKg: 1.0,
    spoiledKg: 0.0,
    mealsServed: 200,
    notes: "Balanced preparation",
  },

  // ── South Hostel Mess ─────────────────────────────────────────────────────
  {
    canteenId: "south_hostel",
    canteenName: "South Hostel Mess",
    dishName: "Upma with Coconut Chutney",
    category: "GRAINS",
    mealPeriod: "Breakfast",
    dateOffset: 0,
    preparedKg: 30.0,
    servedKg: 26.0,
    edibleLeftoverKg: 2.8,
    prepScrapsKg: 0.8,
    spoiledKg: 0.0,
    mealsServed: 220,
    notes: "Hostel residents breakfast",
  },
  {
    canteenId: "south_hostel",
    canteenName: "South Hostel Mess",
    dishName: "Khichdi with Kadhi",
    category: "rice",
    mealPeriod: "Dinner",
    dateOffset: 0,
    preparedKg: 42.0,
    servedKg: 36.0,
    edibleLeftoverKg: 4.5,
    prepScrapsKg: 1.0,
    spoiledKg: 0.0,
    mealsServed: 250,
    notes: "Comfort meal, low spoilage",
  },
  {
    canteenId: "south_hostel",
    canteenName: "South Hostel Mess",
    dishName: "Sambar Rice with Potato Fry",
    category: "Vegetables",
    mealPeriod: "Lunch",
    dateOffset: 1,
    preparedKg: 48.0,
    servedKg: 41.0,
    edibleLeftoverKg: 4.8,
    prepScrapsKg: 1.7,
    spoiledKg: 0.0,
    mealsServed: 265,
    notes: "High vegetable trimming scraps",
  },
  {
    canteenId: "south_hostel",
    canteenName: "South Hostel Mess",
    dishName: "Poori Bhaji",
    category: "GRAINS",
    mealPeriod: "Breakfast",
    dateOffset: 2,
    preparedKg: 35.0,
    servedKg: 30.0,
    edibleLeftoverKg: 3.5,
    prepScrapsKg: 1.2,
    spoiledKg: 0.0,
    mealsServed: 240,
    notes: "Weekend breakfast demand spike",
  },
];

function getDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
}

async function runSeed() {
  console.log("🌱 Starting CanteenCarbon Firestore Data Seeding...");
  console.log("==================================================");

  // 1. Authenticate with staff@example.com (the user's requested credentials)
  console.log("\n[1/3] Setting up User Accounts & Hierarchy...");
  const staffUser = await getOrCreateUser(
    "staff@example.com",
    "123456",
    "kitchen_staff",
    "Chef Vikram (Kitchen Staff)",
    "central_dining",
    "Central Dining Hall"
  );

  // Set up manager for Central Dining Hall
  await getOrCreateUser(
    "manager.central@example.com",
    "123456",
    "manager",
    "Chef Rajesh (Central Dining Manager)",
    "central_dining",
    "Central Dining Hall"
  );

  // Set up manager for North Campus Cafeteria
  await getOrCreateUser(
    "manager.north@example.com",
    "123456",
    "manager",
    "Chef Meera (North Campus Manager)",
    "north_cafeteria",
    "North Campus Cafeteria"
  );

  // Set up campus administrator
  await getOrCreateUser(
    "admin@example.com",
    "123456",
    "university_admin",
    "Dr. Sharma (Campus Administrator)",
    "ALL",
    "All Campus Canteens"
  );

  // Set up sustainability officer
  await getOrCreateUser(
    "sustainability@example.com",
    "123456",
    "sustainability_officer",
    "Ananya Sen (Sustainability Officer)",
    "ALL",
    "All Campus Canteens"
  );

  // 2. Sign in as staff@example.com to feed the waste records
  console.log("\n[2/3] Authenticating as staff@example.com to insert waste records...");
  const authCred = await signInWithEmailAndPassword(auth, "staff@example.com", "123456");
  const activeUid = authCred.user.uid;

  console.log("\n[3/3] Inserting 30+ empirical dish logs into Firestore...");
  let count = 0;
  for (const item of SEED_ENTRIES) {
    const totalWasteKg = item.edibleLeftoverKg + item.prepScrapsKg + item.spoiledKg;
    const wastePerMealG =
      item.mealsServed > 0 ? (totalWasteKg / item.mealsServed) * 1000 : 0;

    const docData = {
      date: getDateStr(item.dateOffset),
      mealPeriod: item.mealPeriod,
      dishName: item.dishName,
      category: item.category,
      preparedKg: item.preparedKg,
      servedKg: item.servedKg,
      edibleLeftoverKg: item.edibleLeftoverKg,
      prepScrapsKg: item.prepScrapsKg,
      spoiledKg: item.spoiledKg,
      totalWasteKg: parseFloat(totalWasteKg.toFixed(2)),
      mealsServed: item.mealsServed,
      wastePerMealG: parseFloat(wastePerMealG.toFixed(1)),
      notes: item.notes,
      recordedBy: activeUid,
      recordedByName: "Chef Vikram",
      canteenId: item.canteenId,
      canteenName: item.canteenName,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "wasteEntries"), docData);
    count++;
    process.stdout.write(`\r  Inserted: ${count}/${SEED_ENTRIES.length} entries (${item.dishName} @ ${item.canteenName})`);
  }

  console.log("\n\n==================================================");
  console.log("✨ DATA SEEDING COMPLETE!");
  console.log(`✓ Inserted ${count} historical dish records across 4 canteens into Firestore.`);
  console.log(`✓ staff@example.com is configured as Kitchen Staff @ Central Dining Hall.`);
  console.log(`✓ manager.central@example.com (pwd: 123456) is configured as Manager @ Central Dining Hall.`);
  console.log(`✓ manager.north@example.com (pwd: 123456) is configured as Manager @ North Campus.`);
  console.log(`✓ admin@example.com (pwd: 123456) is configured as Campus Administrator (All Canteens).`);
  console.log("==================================================");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("\n❌ Seeding failed:", err);
  process.exit(1);
});
