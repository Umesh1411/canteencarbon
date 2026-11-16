export const CANTEENS = [
  {
    id: "central_dining",
    name: "Central Dining Hall",
    campus: "Main Campus (Student Center)",
    capacity: 800,
    icon: "🏛️",
    managerEmail: "manager.central@university.edu",
  },
  {
    id: "north_cafeteria",
    name: "North Campus Cafeteria",
    campus: "Sciences & Medical Wing",
    capacity: 450,
    icon: "🍲",
    managerEmail: "manager.north@university.edu",
  },
  {
    id: "eng_canteen",
    name: "Engineering Block Canteen",
    campus: "Tech & Innovation Complex",
    capacity: 550,
    icon: "⚡",
    managerEmail: "manager.eng@university.edu",
  },
  {
    id: "south_hostel",
    name: "South Hostel Mess",
    campus: "Residential Hostel Quad",
    capacity: 650,
    icon: "🍛",
    managerEmail: "manager.south@university.edu",
  },
];

export function getCanteen(id) {
  if (!id || id === "default" || id === "central_dining") {
    return CANTEENS[0];
  }
  return CANTEENS.find((c) => c.id === id) || CANTEENS[0];
}

export function getCanteenName(id) {
  if (id === "ALL") return "All Campus Canteens (Consolidated)";
  return getCanteen(id).name;
}
