import AppShell from "../../components/AppShell";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import WasteLoggingForm from "../../components/WasteLoggingForm";
import DemandForecastModule from "../../components/DemandForecastModule";
import CarbonFootprintModule from "../../components/CarbonFootprintModule";
import AIInsightsModule from "../../components/AIInsightsModule";
import WasteHistoryTable from "../../components/WasteHistoryTable";
import { useAuth } from "../../contexts/AuthContext";
import { getCanteen } from "../../lib/canteens";

export default function ManagerDashboard() {
  const { profile } = useAuth();
  const canteenId = profile?.canteenId || "central_dining";
  const canteen = getCanteen(canteenId);

  const navItems = [
    {
      key: "overview",
      label: "Canteen Overview",
      icon: "📊",
      component: (
        <div>
          <div className="page-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>{canteen.icon}</span>
                <span className="badge badge-green" style={{ fontSize: 12 }}>
                  {canteen.name} ({canteen.campus})
                </span>
              </div>
              <h1 className="page-title">Operations & Waste Intelligence</h1>
              <p className="page-subtitle">
                Operational metrics strictly partitioned for {canteen.name}.
              </p>
            </div>
          </div>
          <AnalyticsDashboard showFull={true} canteenId={canteenId} isCampusAdmin={false} />
        </div>
      ),
    },
    {
      key: "logging",
      label: "Log Scale Weigh-in",
      icon: "⚖️",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">{canteen.name} — Waste Scale Entry</h1>
              <p className="page-subtitle">Record daily preparation, service leftovers, and scrap quantities for this facility.</p>
            </div>
          </div>
          <WasteLoggingForm />
        </div>
      ),
    },
    {
      key: "history",
      label: "Facility Waste Logs",
      icon: "📋",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">{canteen.name} — Historical Audit</h1>
              <p className="page-subtitle">Entries submitted by kitchen staff assigned to {canteen.name}.</p>
            </div>
          </div>
          <WasteHistoryTable allowDelete={true} canteenId={canteenId} showCanteenColumn={false} />
        </div>
      ),
    },
    {
      key: "forecast",
      label: "Demand & Prep Forecast",
      icon: "🔮",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">ML Demand & Waste Predictor</h1>
              <p className="page-subtitle">
                RandomForest model predicting future discards and suggesting ideal batch quantities for {canteen.name}.
              </p>
            </div>
          </div>
          <DemandForecastModule />
        </div>
      ),
    },
    {
      key: "carbon",
      label: "Scope 3 Carbon Assessment",
      icon: "🌿",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">{canteen.name} — Embodied Carbon Footprint</h1>
              <p className="page-subtitle">
                Traceable CO₂e quantification with verified IPCC/FAO emission factor breakdowns.
              </p>
            </div>
          </div>
          <CarbonFootprintModule canteenId={canteenId} />
        </div>
      ),
    },
    {
      key: "insights",
      label: "AI Root-Cause & Action",
      icon: "🧠",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Evidence-Grounded AI Root Cause</h1>
              <p className="page-subtitle">
                Agent-driven root-cause hypotheses and prioritized interventions formulated for {canteen.name}.
              </p>
            </div>
          </div>
          <AIInsightsModule canteenId={canteenId} />
        </div>
      ),
    },
  ];

  return <AppShell navItems={navItems} title={`${canteen.name} • Manager Portal`} />;
}
