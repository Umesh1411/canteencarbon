import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CANTEENS } from "../lib/canteens";

const ROLES = [
  { value: "kitchen_staff", label: "🥣 Kitchen Staff", desc: "Daily scale weigh-in, portion logs" },
  { value: "manager", label: "👨‍🍳 Canteen Manager", desc: "Oversees their assigned canteen & kitchen crew" },
  { value: "sustainability_officer", label: "🌱 Sustainability Officer", desc: "Scope 3 carbon, SDG 12 targets" },
  { value: "university_admin", label: "🏛️ University Administrator", desc: "Campus-wide executive oversight across all canteens" },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "kitchen_staff",
    displayName: "",
    canteenId: "central_dining",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await register(form.email, form.password, form.role, form.displayName, form.canteenId);
      navigate("/");
    } catch (err) {
      setError(err.message.includes("email-already-in-use") ? "Email already registered." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLocationSpecific = form.role === "kitchen_staff" || form.role === "manager";

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-title">Create your account</div>
        <div className="auth-subtitle">Join CanteenCarbon — define your role & canteen assignment</div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={form.displayName}
                onChange={(e) => set("displayName", e.target.value)}
                placeholder="e.g. Chef Vikram"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="staff@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select your organizational role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ROLES.map((r) => (
                <div
                  key={r.value}
                  onClick={() => set("role", r.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    border: form.role === r.value ? "2px solid #059669" : "2px solid #e2e8f0",
                    background: form.role === r.value ? "#f0fdf4" : "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: form.role === r.value ? "#15803d" : "#1e293b",
                    }}
                  >
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Canteen Assignment Selector for Manager & Kitchen Staff */}
          {isLocationSpecific ? (
            <div
              className="form-group"
              style={{
                background: "#f0fdf4",
                border: "1.5px solid #a7f3d0",
                borderRadius: 10,
                padding: "14px 16px",
                marginTop: 6,
              }}
            >
              <label className="form-label" style={{ color: "#065f46", fontWeight: 700 }}>
                🏢 Assigned Canteen / Facility
              </label>
              <select
                className="form-input"
                value={form.canteenId}
                onChange={(e) => set("canteenId", e.target.value)}
                style={{ borderColor: "#6ee7b7", background: "#fff" }}
              >
                {CANTEENS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name} ({c.campus})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: "#047857", marginTop: 6 }}>
                <strong>Role Boundary:</strong> You will only manage and view waste data belonging to this specific canteen facility.
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#eff6ff",
                border: "1.5px solid #bfdbfe",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 12,
                color: "#1e40af",
                marginBottom: 16,
              }}
            >
              🌐 <strong>Campus-Wide Scope:</strong> As a {form.role === "university_admin" ? "University Administrator" : "Sustainability Officer"}, you have consolidated visibility across all 4 university dining facilities.
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <div className="auth-divider">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
