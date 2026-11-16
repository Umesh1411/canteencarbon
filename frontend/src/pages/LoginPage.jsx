import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DEMO_ACCOUNTS = [
  {
    role: "🥣 Kitchen Staff",
    email: "staff@example.com",
    label: "Staff (Central Dining Hall)",
    desc: "Weigh-in scale logger for Central Dining",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    role: "👨‍🍳 Canteen Manager A",
    email: "manager.central@example.com",
    label: "Manager (Central Dining Hall)",
    desc: "Oversees ONLY Central Dining Hall",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    role: "👨‍🍳 Canteen Manager B",
    email: "manager.north@example.com",
    label: "Manager (North Campus)",
    desc: "Oversees ONLY North Campus Cafeteria",
    color: "#0d9488",
    bg: "#f0fdfa",
    border: "#99f6e4",
  },
  {
    role: "🏛️ Campus Administrator",
    email: "admin@example.com",
    label: "University Executive (All Canteens)",
    desc: "Consolidated multi-facility matrix & audit",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.message.includes("invalid-credential")
          ? "Invalid email or password."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("123456");
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg,#10b981,#0d9488)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
              }}
            >
              🌱
            </div>
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                }}
              >
                CanteenCarbon
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#059669",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Sustainability Intelligence
              </div>
            </div>
          </div>
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to your role-partitioned dashboard</div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <div className="auth-divider">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register here
          </Link>
        </div>

        {/* Quick-Fill Seeded Accounts */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "14px 16px",
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 10,
            }}
          >
            ⚡ One-Click Role Testing Accounts (Password: 123456)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.email}
                onClick={() => handleQuickLogin(acc.email)}
                style={{
                  background: acc.bg,
                  border: `1.5px solid ${acc.border}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title={`Click to fill ${acc.email}`}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: acc.color }}>
                  {acc.role}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {acc.email}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, textAlign: "center" }}>
            Click any role above to pre-fill the form, then click <strong>Sign in</strong>!
          </div>
        </div>
      </div>
    </div>
  );
}
