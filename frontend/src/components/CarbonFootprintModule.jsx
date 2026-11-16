import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { getCanteenName } from "../lib/canteens";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CarbonFootprintModule({ canteenId = null }) {
  const [carbonData, setCarbonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFootprint = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCarbonFootprint({ canteenId });
      setCarbonData(res);
    } catch (err) {
      setError(err.message || "Failed to load footprint data");
    } finally {
      setLoading(false);
    }
  }, [canteenId]);

  useEffect(() => {
    fetchFootprint();
  }, [fetchFootprint]);

  if (loading)
    return (
      <div className="loading-screen" style={{ height: 200 }}>
        <div className="spinner" />
      </div>
    );
  if (error) return <div className="error-msg">{error}</div>;
  if (!carbonData) return null;

  const chartData = (carbonData.breakdown || []).map((b) => ({
    name: b.category,
    co2eKg: b.co2eKg,
    wasteKg: b.wasteKg,
    factor: b.emissionFactor,
  }));

  const facilityName = getCanteenName(canteenId || "central_dining");

  return (
    <div>
      {/* Scope 3 Carbon Header Card */}
      <div
        className="card"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #0d9488 100%)", color: "white" }}
      >
        <div className="card-body" style={{ padding: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <span
                className="badge"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff", marginBottom: 12 }}
              >
                GHG Protocol • Scope 3 Category 1 • {facilityName}
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0", color: "#fff" }}>
                Institutional Food-Waste Carbon Footprint
              </h2>
              <p
                style={{
                  maxWidth: 650,
                  fontSize: 13.5,
                  opacity: 0.9,
                  lineHeight: 1.6,
                  color: "#e2e8f0",
                }}
              >
                {carbonData.systemBoundary}
              </p>
            </div>

            <div
              style={{
                textAlign: "right",
                background: "rgba(0,0,0,0.2)",
                padding: "16px 24px",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  opacity: 0.8,
                }}
              >
                Embodied Emissions ({facilityName})
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, marginTop: 4 }}>
                {carbonData.totalCO2eTonnes} <span style={{ fontSize: 18, fontWeight: 600 }}>t CO₂e</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                ({carbonData.totalCO2eKg.toLocaleString()} kg CO₂e)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginTop: 20 }}>
        {/* Category Contribution Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>📊 Emissions by Food Commodity</span>
            </div>
            <span className="badge badge-purple">kg CO₂e</span>
          </div>
          <div className="card-body">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" kg" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#334155" }} width={80} />
                  <Tooltip formatter={(val) => [`${val} kg CO₂e`, "Emissions"]} />
                  <Bar dataKey="co2eKg" fill="#10b981" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.factor > 10 ? "#e11d48" : entry.factor > 4 ? "#f59e0b" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-desc">No category breakdown available</div>
              </div>
            )}
          </div>
        </div>

        {/* Methodology & Factors Reference */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>📚 IPCC / FAO Emission Factors</span>
            </div>
            <span className="badge badge-blue">Cradle-to-Gate</span>
          </div>
          <div className="card-body" style={{ maxHeight: 290, overflowY: "auto" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Factor (kg CO₂e/kg)</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {(carbonData.breakdown || []).map((b, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{b.category}</strong>
                      </td>
                      <td>
                        <span className={`badge ${b.emissionFactor > 10 ? "badge-rose" : "badge-green"}`}>
                          {b.emissionFactor.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: "#64748b" }}>{b.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
