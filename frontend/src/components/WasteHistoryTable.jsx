import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { getCanteenName } from "../lib/canteens";

export default function WasteHistoryTable({ allowDelete = false, canteenId = null, showCanteenColumn = false }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getEntries({ limit: 100, canteenId });
      setEntries(res.entries || []);
    } catch (err) {
      setError(err.message || "Failed to load waste entries");
    } finally {
      setLoading(false);
    }
  }, [canteenId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recorded log?")) return;
    try {
      await api.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="loading-screen" style={{ height: 180 }}>
        <div className="spinner" />
      </div>
    );
  if (error) return <div className="error-msg">{error}</div>;

  const currentCanteenTitle = canteenId && canteenId !== "ALL" ? getCanteenName(canteenId) : "Campus Master Logs";

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span>📋 Recorded Scale Weigh-ins ({entries.length}) — {currentCanteenTitle}</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadEntries}>
          ↻ Refresh
        </button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <div className="empty-title">No Entries Logged for This Facility</div>
            <div className="empty-desc">New scale weigh-ins will appear here immediately after submission.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {(showCanteenColumn || canteenId === "ALL") && <th>Canteen Facility</th>}
                  <th>Meal</th>
                  <th>Dish Name</th>
                  <th>Category</th>
                  <th>Prepared</th>
                  <th>Served</th>
                  <th>Leftover</th>
                  <th>Scraps</th>
                  <th>Total Waste</th>
                  <th>Meals</th>
                  <th>Logged By</th>
                  {allowDelete && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{entry.date}</span>
                    </td>
                    {(showCanteenColumn || canteenId === "ALL") && (
                      <td>
                        <span className="badge badge-teal" style={{ fontSize: 11 }}>
                          {entry.canteenName || getCanteenName(entry.canteenId)}
                        </span>
                      </td>
                    )}
                    <td>
                      <span
                        className={`badge ${
                          entry.mealPeriod === "Lunch"
                            ? "badge-amber"
                            : entry.mealPeriod === "Dinner"
                            ? "badge-blue"
                            : "badge-green"
                        }`}
                      >
                        {entry.mealPeriod}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{entry.dishName}</strong>
                    </td>
                    <td>{entry.category}</td>
                    <td>{entry.preparedKg ? `${entry.preparedKg} kg` : "—"}</td>
                    <td>{entry.servedKg ? `${entry.servedKg} kg` : "—"}</td>
                    <td>{entry.edibleLeftoverKg ? `${entry.edibleLeftoverKg} kg` : "0"}</td>
                    <td>{entry.prepScrapsKg ? `${entry.prepScrapsKg} kg` : "0"}</td>
                    <td>
                      <span className="badge badge-rose" style={{ fontWeight: 800 }}>
                        {entry.totalWasteKg?.toFixed(1)} kg
                      </span>
                    </td>
                    <td>{entry.mealsServed || "—"}</td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>{entry.recordedByName || "Staff"}</td>
                    {allowDelete && (
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: "4px 8px", fontSize: 11 }}
                          onClick={() => handleDelete(entry.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
