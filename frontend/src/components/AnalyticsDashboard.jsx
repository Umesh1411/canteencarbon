import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { getCanteenName } from "../lib/canteens";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#e11d48", "#3b82f6", "#a855f7", "#14b8a6"];
const SOURCE_COLORS = { Preparation: "#f59e0b", Unserved: "#10b981", Plate: "#e11d48" };

function KpiCard({ icon, label, value, unit, sub, color }) {
  return (
    <div className={`kpi-card ${color}`}>
      <span className="kpi-icon">{icon}</span>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

export default function AnalyticsDashboard({ showFull = true, canteenId = null, isCampusAdmin = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const summary = await api.getSummary({ canteenId });
      setData(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [canteenId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="loading-screen" style={{ height: 200 }}>
        <div className="spinner" />
      </div>
    );
  if (error) return <div className="error-msg">Failed to load analytics: {error}</div>;
  if (!data) return null;

  const sourceData = Object.entries(data.bySource || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  const mealData = Object.entries(data.byMeal || {}).map(([name, value]) => ({
    name,
    wasteKg: parseFloat(value.toFixed(2)),
  }));

  const categoryData = Object.entries(data.byCategory || {})
    .map(([name, value]) => ({
      name,
      wasteKg: parseFloat(value.toFixed(2)),
    }))
    .sort((a, b) => b.wasteKg - a.wasteKg);

  const facilityLabel = getCanteenName(canteenId || "central_dining");

  return (
    <div>
      {/* Scope Banner */}
      <div
        style={{
          background: canteenId === "ALL" ? "#eff6ff" : "#f0fdf4",
          border: `1.5px solid ${canteenId === "ALL" ? "#bfdbfe" : "#bbf7d0"}`,
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{canteenId === "ALL" ? "🌐" : "🏢"}</span>
          <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>
            Active Analytics Scope:{" "}
            <strong style={{ color: canteenId === "ALL" ? "#1e40af" : "#166534" }}>{facilityLabel}</strong>
          </span>
        </div>
        <span
          className={`badge ${canteenId === "ALL" ? "badge-blue" : "badge-green"}`}
          style={{ fontSize: 11 }}
        >
          {canteenId === "ALL" ? "Campus Executive View" : "Facility-Restricted View"}
        </span>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard
          icon="🗑️"
          label="Total Food Waste"
          value={data.totalWasteKg.toFixed(1)}
          unit="kg"
          sub={`${data.entryCount} recorded scale logs`}
          color="rose"
        />
        <KpiCard
          icon="🍽️"
          label="Meals Served"
          value={data.totalMealsServed.toLocaleString()}
          sub="Student / faculty portions"
          color="green"
        />
        <KpiCard
          icon="📊"
          label="Waste per Meal"
          value={data.wastePerMealG.toFixed(1)}
          unit="g/meal"
          sub="Target: < 15 g/meal (SDG 12.3)"
          color="amber"
        />
        <KpiCard
          icon="🌡️"
          label="Waste Rate"
          value={data.wasteRate.toFixed(1)}
          unit="%"
          sub="of gross food prepared"
          color="teal"
        />
        <KpiCard
          icon="🌿"
          label="Scope 3 Carbon"
          value={(data.totalCarbonKgCO2e / 1000).toFixed(2)}
          unit="t CO₂e"
          sub="Embodied lifecycle impact"
          color="purple"
        />
        <KpiCard
          icon="🍲"
          label="Gross Food Prepared"
          value={data.totalPreparedKg.toFixed(0)}
          unit="kg"
          sub="Total production volume"
          color="blue"
        />
      </div>

      {/* Cross-Canteen Comparison Matrix (Exclusive for Campus Administrator) */}
      {isCampusAdmin && data.canteenBreakdown?.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderTop: "4px solid #2563eb" }}>
          <div className="card-header">
            <div className="card-title">
              <span>🏛️ Campus Dining Facilities — Comparative Performance Matrix</span>
            </div>
            <span className="badge badge-blue">University-Wide Breakdown</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Canteen Facility</th>
                    <th>Campus Wing</th>
                    <th>Meals Served</th>
                    <th>Prepared (kg)</th>
                    <th>Waste (kg)</th>
                    <th>Waste Rate</th>
                    <th>Waste/Meal</th>
                    <th>Est. Carbon</th>
                    <th>Efficiency Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.canteenBreakdown.map((c) => (
                    <tr key={c.canteenId}>
                      <td>
                        <strong>
                          {c.icon} {c.name}
                        </strong>
                      </td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{c.campus}</td>
                      <td>{c.totalMealsServed.toLocaleString()}</td>
                      <td>{c.totalPreparedKg.toFixed(1)} kg</td>
                      <td>
                        <span className="badge badge-rose" style={{ fontWeight: 800 }}>
                          {c.totalWasteKg.toFixed(1)} kg
                        </span>
                      </td>
                      <td>
                        <strong>{c.wasteRate.toFixed(1)}%</strong>
                      </td>
                      <td>{c.wastePerMealG.toFixed(1)} g</td>
                      <td>{(c.carbonKgCO2e / 1000).toFixed(2)} t CO₂e</td>
                      <td>
                        {c.wasteRate > 18 ? (
                          <span className="badge badge-rose">High Waste Alert</span>
                        ) : c.wasteRate > 12 ? (
                          <span className="badge badge-amber">Standard</span>
                        ) : (
                          <span className="badge badge-green">Optimal Efficiency</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Waste Trend */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📈 Daily Waste Progression ({facilityLabel})</div>
          </div>
          <div className="card-body">
            {data.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" kg" />
                  <Tooltip formatter={(v) => [`${v} kg`, "Waste"]} />
                  <Area
                    type="monotone"
                    dataKey="wasteKg"
                    stroke="#10b981"
                    fill="url(#wasteGrad)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No trend data yet</div>
                <div className="empty-desc">Log waste entries to generate trend analytics</div>
              </div>
            )}
          </div>
        </div>

        {/* Waste by Source Donut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔵 Discard Streams Breakdown</div>
          </div>
          <div className="card-body">
            {sourceData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[entry.name] || COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} kg`, "Waste"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <div className="empty-title">No data yet</div>
                <div className="empty-desc">Log waste entries first</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFull && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* By Meal Period */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🕐 Waste by Meal Period</div>
            </div>
            <div className="card-body">
              {mealData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mealData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" kg" />
                    <Tooltip formatter={(v) => [`${v} kg`, "Waste"]} />
                    <Bar dataKey="wasteKg" radius={[6, 6, 0, 0]}>
                      {mealData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <div className="empty-desc">No meal period data</div>
                </div>
              )}
            </div>
          </div>

          {/* By Category */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🥩 Waste by Food Commodity</div>
            </div>
            <div className="card-body">
              {categoryData.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Waste (kg)</th>
                        <th>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.slice(0, 6).map((row, i) => (
                        <tr key={i}>
                          <td>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{row.name}</span>
                          </td>
                          <td>
                            <span className="badge badge-rose">{row.wasteKg.toFixed(1)} kg</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3 }}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${((row.wasteKg / data.totalWasteKg) * 100).toFixed(0)}%`,
                                    background: `hsl(${i * 40},70%,55%)`,
                                    borderRadius: 3,
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 11, color: "#94a3b8", minWidth: 30 }}>
                                {data.totalWasteKg > 0
                                  ? ((row.wasteKg / data.totalWasteKg) * 100).toFixed(0)
                                  : 0}
                                %
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-desc">No category data</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
