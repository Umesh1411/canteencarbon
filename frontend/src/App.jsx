import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import KitchenStaffDashboard from "./pages/kitchen/KitchenStaffDashboard";
import SustainabilityDashboard from "./pages/sustainability/SustainabilityDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function RoleRouter() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading CanteenCarbon...</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/register" replace />;

  const role = profile.role;
  if (role === "manager") return <ManagerDashboard />;
  if (role === "kitchen_staff") return <KitchenStaffDashboard />;
  if (role === "sustainability_officer") return <SustainabilityDashboard />;
  if (role === "university_admin") return <AdminDashboard />;
  return <KitchenStaffDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<RoleRouter />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
