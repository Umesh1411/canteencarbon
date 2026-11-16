import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { getCanteenName } from "../lib/canteens";

export default function AIInsightsModule({ canteenId = null }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canteenName = getCanteenName(canteenId || "central_dining");

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await api.getSummary({ canteenId });
      const res = await api.getInsights(summary, canteenName);
      setInsights(res);
    } catch (err) {
      setError(err.message || "Failed to trigger AI Root-Cause Analyst");
    } finally {
      setLoading(false);
    }
  }, [canteenId, canteenName]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span>🧠 Multi-Agent Root-Cause & Strategy Engine — {canteenName}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {insights?.source && (
              <span className={`badge ${insights.source === "gemini" ? "badge-green" : "badge-amber"}`}>
                {insights.source === "gemini" ? "✨ Gemini Pro Agent" : "⚡ Offline Deterministic Engine"}
              </span>
            )}
            <button className="btn btn-secondary btn-sm" onClick={runAnalysis} disabled={loading}>
              {loading ? "Synthesizing..." : "↻ Refresh Analysis"}
            </button>
          </div>
        </div>
        <div className="card-body">
          {error && <div className="error-msg">{error}</div>}

          {loading ? (
            <div className="loading-screen" style={{ height: 240 }}>
              <div className="spinner" />
              <span>Grounding quantitative evidence and evaluating causes for {canteenName}...</span>
            </div>
          ) : insights ? (
            <div>
              {/* Primary Hypothesis Card */}
              <div className="insight-item insight-purple" style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#6b21a8",
                  }}
                >
                  Formulated Operational Hypothesis ({canteenName})
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: "#3b0764" }}>
                  {insights.hypothesis}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${insights.confidence === "high" ? "badge-green" : "badge-amber"}`}>
                    Confidence: {insights.confidence?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Evidences */}
                <div className="card" style={{ marginBottom: 0 }}>
                  <div className="card-header">
                    <div className="card-title" style={{ fontSize: 14 }}>
                      🔍 Empirical Grounding & Evidence
                    </div>
                  </div>
                  <div className="card-body">
                    <ul style={{ paddingLeft: 18, fontSize: 13.5, color: "#334155", lineHeight: 1.7 }}>
                      {(insights.supporting_evidence || []).map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Alternative Explanations */}
                <div className="card" style={{ marginBottom: 0 }}>
                  <div className="card-header">
                    <div className="card-title" style={{ fontSize: 14 }}>
                      ⚖️ Alternative Hypotheses Evaluated
                    </div>
                  </div>
                  <div className="card-body">
                    <ul style={{ paddingLeft: 18, fontSize: 13.5, color: "#334155", lineHeight: 1.7 }}>
                      {(insights.alternative_explanations || []).map((alt, i) => (
                        <li key={i}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actionable Interventions Recommended */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                  🛠️ Recommended Operational Interventions for {canteenName}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 14,
                  }}
                >
                  {(insights.recommendations || []).map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#f0fdf4",
                        border: "1.5px solid #bbf7d0",
                        borderRadius: 10,
                        padding: "14px 16px",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>Action {i + 1}</div>
                      <div style={{ fontSize: 13, color: "#14532d", marginTop: 4, lineHeight: 1.5 }}>
                        {rec}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Limitations */}
              {insights.limitations?.length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 12,
                    background: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Traceability & Data Boundary Limitations:{" "}
                  </span>
                  <span style={{ fontSize: 12.5, color: "#475569" }}>{insights.limitations.join(" ")}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🤖</div>
              <div className="empty-title">No Insights Generated</div>
              <div className="empty-desc">Click Refresh Analysis to synthesize the recorded kitchen data.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
