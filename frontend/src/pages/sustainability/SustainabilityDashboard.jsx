import { useState } from "react";
import AppShell from "../../components/AppShell";
import CarbonFootprintModule from "../../components/CarbonFootprintModule";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import AIInsightsModule from "../../components/AIInsightsModule";
import { CANTEENS } from "../../lib/canteens";

export default function SustainabilityDashboard() {
  const [selectedCanteen, setSelectedCanteen] = useState("ALL");

  const navItems = [
    {
      key: "carbon",
      label: "Carbon Accounting",
      icon: "🌿",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Scope 3 GHG Food Assessment</h1>
              <p className="page-subtitle">
                Emissions accounting mapped against FAO and IPCC cradle-to-gate lifecycle emission factors.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "4px 10px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Facility Scope:</span>
              <select
                value={selectedCanteen}
                onChange={(e) => setSelectedCanteen(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#0f172a", background: "transparent", cursor: "pointer" }}
              >
                <option value="ALL">🌐 All Campus Canteens (Consolidated)</option>
                {CANTEENS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <CarbonFootprintModule canteenId={selectedCanteen} />
        </div>
      ),
    },
    {
      key: "sdg",
      label: "SDG 12 Target 12.3",
      icon: "🎯",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">UN Sustainable Development Goals (SDG 12)</h1>
              <p className="page-subtitle">Tracking institutional progress towards halving per-capita food waste.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "4px 10px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Filter Canteen:</span>
              <select
                value={selectedCanteen}
                onChange={(e) => setSelectedCanteen(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#0f172a", background: "transparent", cursor: "pointer" }}
              >
                <option value="ALL">🌐 All Facilities</option>
                {CANTEENS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 24 }}>
            <div className="card" style={{ borderLeft: "5px solid #10b981" }}>
              <div className="card-body">
                <span className="badge badge-green" style={{ marginBottom: 6 }}>Target 12.3</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#065f46" }}>Halve Per-Capita Food Waste</div>
                <p style={{ fontSize: 12.5, color: "#334155", marginTop: 6, lineHeight: 1.5 }}>
                  Continuous weight audit per meal served to maintain threshold below 15 g/meal.
                </p>
              </div>
            </div>

            <div className="card" style={{ borderLeft: "5px solid #3b82f6" }}>
              <div className="card-body">
                <span className="badge badge-blue" style={{ marginBottom: 6 }}>Target 12.5</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1e40af" }}>Waste Prevention & Reduction</div>
                <p style={{ fontSize: 12.5, color: "#334155", marginTop: 6, lineHeight: 1.5 }}>
                  Operational adjustments to preparation batch sizes preventing surplus before serving.
                </p>
              </div>
            </div>

            <div className="card" style={{ borderLeft: "5px solid #a855f7" }}>
              <div className="card-body">
                <span className="badge badge-purple" style={{ marginBottom: 6 }}>Target 12.8</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#6b21a8" }}>Awareness & Lifestyles</div>
                <p style={{ fontSize: 12.5, color: "#334155", marginTop: 6, lineHeight: 1.5 }}>
                  Feedback to students and university administrators on collective environmental savings.
                </p>
              </div>
            </div>
          </div>

          <AnalyticsDashboard showFull={false} canteenId={selectedCanteen} isCampusAdmin={selectedCanteen === "ALL"} />
        </div>
      ),
    },
    {
      key: "insights",
      label: "Intervention Strategies",
      icon: "💡",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Sustainability Interventions</h1>
              <p className="page-subtitle">Actionable suggestions generated with evidence-constrained reasoning.</p>
            </div>
          </div>
          <AIInsightsModule canteenId={selectedCanteen} />
        </div>
      ),
    },
  ];

  return <AppShell navItems={navItems} title="Sustainability & Climate Station" />;
}
