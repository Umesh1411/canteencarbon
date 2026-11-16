import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ROLE_CONFIG = {
  manager: { label: "Canteen Manager", color: "#059669", bg: "#f0fdf4", badge: "badge-green" },
  kitchen_staff: { label: "Kitchen Staff", color: "#d97706", bg: "#fffbeb", badge: "badge-amber" },
  sustainability_officer: { label: "Sustainability Officer", color: "#0d9488", bg: "#f0fdfa", badge: "badge-teal" },
  university_admin: { label: "University Admin", color: "#2563eb", bg: "#eff6ff", badge: "badge-blue" },
};

export default function AppShell({ navItems, children, title }) {
  const { profile, logout } = useAuth();
  const [activeNav, setActiveNav] = useState(navItems[0]?.key || "");
  const roleConfig = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.kitchen_staff;

  const initials = (profile?.displayName || profile?.email || "U")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const activeItem = navItems.find(n => n.key === activeNav) || navItems[0];

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">🌱</div>
            <div>
              <div className="brand-name">CanteenCarbon</div>
              <div className="brand-tagline">Sustainability Intelligence</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.key}
              className={`nav-item ${activeNav === item.key ? "active" : ""}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-card" onClick={logout} title="Click to sign out">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {profile?.displayName || profile?.email || "User"}
              </div>
              <div className="user-role-badge" style={{ color: roleConfig.color }}>
                {roleConfig.label}
              </div>
            </div>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>↩</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">{activeItem?.label || title}</div>
          <div className="topbar-actions">
            <div className={`badge ${roleConfig.badge}`} style={{ background: roleConfig.bg, color: roleConfig.color }}>
              {roleConfig.label}
            </div>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {navItems.map(item => (
            <div key={item.key} style={{ display: activeNav === item.key ? "block" : "none" }}>
              {item.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
