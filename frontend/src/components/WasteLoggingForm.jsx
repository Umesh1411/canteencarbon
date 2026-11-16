import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { getCanteen } from "../lib/canteens";

const CATEGORIES = ["Vegetables", "MeAt", "dairy", "GRAINS", "poultry", "fruits", "seafood", "Other"];
const MEAL_PERIODS = ["Breakfast", "Lunch", "Dinner"];

export default function WasteLoggingForm({ onLogSuccess }) {
  const { profile } = useAuth();
  const assignedCanteenId = profile?.canteenId || "central_dining";
  const canteen = getCanteen(assignedCanteenId);

  const todayStr = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    date: todayStr,
    mealPeriod: "Lunch",
    dishName: "",
    category: "Vegetables",
    preparedKg: "",
    servedKg: "",
    edibleLeftoverKg: "",
    prepScrapsKg: "",
    spoiledKg: "",
    mealsServed: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculatedWaste =
    (parseFloat(formData.edibleLeftoverKg) || 0) +
    (parseFloat(formData.prepScrapsKg) || 0) +
    (parseFloat(formData.spoiledKg) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.dishName.trim()) {
      setError("Please specify the dish name.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        canteenId: assignedCanteenId,
      };
      const res = await api.logWaste(payload);
      setSuccess(`✓ Successfully logged record for "${formData.dishName}" (${res.totalWasteKg.toFixed(2)} kg waste) for ${canteen.name}`);
      setFormData({
        date: todayStr,
        mealPeriod: "Lunch",
        dishName: "",
        category: "Vegetables",
        preparedKg: "",
        servedKg: "",
        edibleLeftoverKg: "",
        prepScrapsKg: "",
        spoiledKg: "",
        mealsServed: "",
        notes: "",
      });
      if (onLogSuccess) onLogSuccess(res);
    } catch (err) {
      setError(err.message || "Failed to log entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span>🥣 Quick Kitchen Scale Entry</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-green">
            {canteen.icon} {canteen.name}
          </span>
          <span className="badge badge-teal">Standardized Mass (kg)</span>
        </div>
      </div>
      <div className="card-body">
        {/* Notice of Canteen Boundary */}
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            color: "#166534",
            marginBottom: 16,
          }}
        >
          📍 Weigh-in entries recorded here will automatically be cataloged under <strong>{canteen.name}</strong> ({canteen.campus}).
        </div>

        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Service Date</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meal Period</label>
              <select
                name="mealPeriod"
                className="form-input"
                value={formData.mealPeriod}
                onChange={handleChange}
              >
                {MEAL_PERIODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dish Name</label>
              <input
                type="text"
                name="dishName"
                className="form-input"
                placeholder="e.g., Dal Tadka, Steamed Rice"
                value={formData.dishName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Food Category</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              margin: "12px 0 20px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
              Scale Weigh-ins & Portions
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Prepared (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="preparedKg"
                  className="form-input"
                  placeholder="0.0"
                  value={formData.preparedKg}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Served (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="servedKg"
                  className="form-input"
                  placeholder="0.0"
                  value={formData.servedKg}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unserved Leftovers (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="edibleLeftoverKg"
                  className="form-input"
                  placeholder="0.0"
                  value={formData.edibleLeftoverKg}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prep Scraps (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="prepScrapsKg"
                  className="form-input"
                  placeholder="0.0"
                  value={formData.prepScrapsKg}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Plate / Spoiled (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="spoiledKg"
                  className="form-input"
                  placeholder="0.0"
                  value={formData.spoiledKg}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meals / Students Count</label>
                <input
                  type="number"
                  name="mealsServed"
                  className="form-input"
                  placeholder="e.g., 220"
                  value={formData.mealsServed}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px solid #cbd5e1",
              }}
            >
              <span style={{ fontSize: 13, color: "#475569" }}>Auto-computed total waste:</span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: calculatedWaste > 20 ? "#e11d48" : "#059669",
                }}
              >
                {calculatedWaste.toFixed(2)} kg
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kitchen Notes / Observations</label>
            <input
              type="text"
              name="notes"
              className="form-input"
              placeholder="e.g. Rainy day, lower turn-out than expected"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Recording Weigh-in..." : "Save Scale Entry →"}
          </button>
        </form>
      </div>
    </div>
  );
}
