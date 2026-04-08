import { useState } from "react";
import { Icons } from "../../components/icons/index.jsx";

export function SignupPage({ onSignup, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim() || !businessName.trim()) {
      setError("All fields are required"); return;
    }
    if (!totalCapacity || isNaN(Number(totalCapacity)) || Number(totalCapacity) <= 0) {
      setError("Please enter a valid total capacity"); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    try {
      await onSignup({ username: username.trim(), password, businessName: businessName.trim(), totalCapacity: Number(totalCapacity) });
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1.5px solid var(--border-subtle)",
    background: "var(--surface-2)", fontSize: 15,
    color: "var(--text-primary)", fontFamily: "var(--font-body)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onBack} style={{ position: "absolute", top: 28, left: 36, background: "none", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "8px 18px", cursor: "pointer", color: "var(--text-secondary)", fontSize: 15, fontFamily: "var(--font-body)" }}>
        ← Back to Login
      </button>

      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)", borderRadius: 20, padding: "48px 44px", width: "100%", maxWidth: 440, boxShadow: "var(--shadow-md)", animation: "fadeInUp 0.4s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #2563eb, #60a5fa)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.snowflake />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            COLD<span style={{ color: "var(--accent-ice)" }}>VAULT</span>
          </span>
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Create Account</h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 32 }}>Register your cold storage business</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Business Name</label>
          <input style={inp} placeholder="e.g. Sharma Cold Storage" value={businessName} onChange={e => { setBusinessName(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
            Total Capacity of Cold Storage
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>(in metric tons / slots)</span>
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              style={{ ...inp, paddingRight: 44 }}
              type="number"
              min="1"
              placeholder="e.g. 500"
              value={totalCapacity}
              onChange={e => { setTotalCapacity(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <span style={{ position: "absolute", right: 14, color: "var(--text-muted)", fontSize: 12, pointerEvents: "none" }}>MT</span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Username</label>
          <input style={inp} placeholder="Choose a username" value={username} onChange={e => { setUsername(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...inp, paddingRight: 44 }} type={showPass ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#ef4444" }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 16, fontFamily: "var(--font-display)", fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Creating account…" : "Create Account →"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent-ice)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)" }}>Sign in</button>
        </p>
      </div>
    </div>
  );
}