import { useState } from "react";
import AppShell from "../../components/AppShell";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import CarbonFootprintModule from "../../components/CarbonFootprintModule";
import WasteHistoryTable from "../../components/WasteHistoryTable";
import { CANTEENS } from "../../lib/canteens";

export default function AdminDashboard() {
  const [selectedCanteen, setSelectedCanteen] = useState("ALL");

  const navItems = [
    {
      key: "executive",
      label: "Executive Briefing",
      icon: "🏛️",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">University Executive Canteen Intelligence</h1>
              <p className="page-subtitle">
                High-level operational metrics, financial cost avoidance, and campus-wide ESG environmental footprint.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* University Campus Canteen Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "4px 10px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Filter Facility:</span>
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

              <button className="btn btn-primary" onClick={() => window.print()}>
                📥 Export Executive PDF
              </button>
            </div>
          </div>
          <AnalyticsDashboard showFull={true} canteenId={selectedCanteen} isCampusAdmin={selectedCanteen === "ALL"} />
        </div>
      ),
    },
    {
      key: "carbon",
      label: "Campus ESG Carbon Report",
      icon: "🌿",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Institutional Carbon Accountability</h1>
              <p className="page-subtitle">Audited emissions data ready for campus annual sustainability reports.</p>
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
      key: "audit",
      label: "Master Logs & Audit Trail",
      icon: "🔒",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Comprehensive Waste Logs & Cross-Facility Audit</h1>
              <p className="page-subtitle">Full system transparency with administrative oversight and deletion capabilities across all dining centers.</p>
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
          <WasteHistoryTable allowDelete={true} canteenId={selectedCanteen} showCanteenColumn={true} />
        </div>
      ),
    },
  ];

  return <AppShell navItems={navItems} title="University Executive Administration" />;
}
