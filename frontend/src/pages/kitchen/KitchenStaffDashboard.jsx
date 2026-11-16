import AppShell from "../../components/AppShell";
import WasteLoggingForm from "../../components/WasteLoggingForm";
import WasteHistoryTable from "../../components/WasteHistoryTable";
import { useAuth } from "../../contexts/AuthContext";
import { getCanteen } from "../../lib/canteens";

export default function KitchenStaffDashboard() {
  const { profile } = useAuth();
  const canteenId = profile?.canteenId || "central_dining";
  const canteen = getCanteen(canteenId);

  const navItems = [
    {
      key: "log",
      label: "Kitchen Scale Log",
      icon: "⚖️",
      component: (
        <div>
          <div className="page-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>{canteen.icon}</span>
                <span className="badge badge-amber" style={{ fontSize: 12 }}>
                  Station: {canteen.name} ({canteen.campus})
                </span>
              </div>
              <h1 className="page-title">Service Scale Logging Station</h1>
              <p className="page-subtitle">
                Quick, mobile-ready scale weigh-in for preparation scraps, unserved surplus, and plate returns.
              </p>
            </div>
          </div>
          <WasteLoggingForm />
        </div>
      ),
    },
    {
      key: "history",
      label: "Facility Shift Records",
      icon: "📋",
      component: (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">{canteen.name} — Shift Logs</h1>
              <p className="page-subtitle">Historical records logged for {canteen.name}.</p>
            </div>
          </div>
          <WasteHistoryTable allowDelete={false} canteenId={canteenId} showCanteenColumn={false} />
        </div>
      ),
    },
  ];

  return <AppShell navItems={navItems} title={`${canteen.name} • Kitchen Staff Station`} />;
}
