import { useState } from "react";
import { Icons } from "../../components/icons/index.jsx";
import { GoogleLogin } from "@react-oauth/google";

export function LoginPage({ onLogin, onBack, onGoSignup, error, setError }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(username.trim(), password);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-void)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-body)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)",
            top: "-10%",
            left: "60%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(96,165,250,0.07), transparent 70%)",
            bottom: "10%",
            left: "5%",
          }}
        />
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 28,
          left: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          padding: "8px 18px",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: 15,
          fontFamily: "var(--font-body)",
          zIndex: 10,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(37,99,235,0.06)";
          e.currentTarget.style.borderColor = "var(--accent-ice)";
          e.currentTarget.style.color = "var(--accent-ice)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        ← Back
      </button>

      {/* Login card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--surface-1)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 20,
          padding: "48px 44px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "var(--shadow-md)",
          animation: "fadeInUp 0.4s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div
            style={{
              width: 42,
              height: 42,
              background: "linear-gradient(135deg, #2563eb, #60a5fa)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icons.snowflake />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            COLD<span style={{ color: "var(--accent-ice)" }}>VAULT</span>
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Admin Login
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 32 }}>
          Sign in to access the dashboard
        </p>

        {/* Username */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="Enter admin username"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: error ? "1.5px solid #ef4444" : "1.5px solid var(--border-subtle)",
              background: "var(--surface-2)",
              fontSize: 15,
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent-ice)")}
            onBlur={(e) => (e.target.style.borderColor = error ? "#ef4444" : "var(--border-subtle)")}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter admin password"
              style={{
                width: "100%",
                padding: "12px 44px 12px 16px",
                borderRadius: 10,
                border: error ? "1.5px solid #ef4444" : "1.5px solid var(--border-subtle)",
                background: "var(--surface-2)",
                fontSize: 15,
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-ice)")}
              onBlur={(e) => (e.target.style.borderColor = error ? "#ef4444" : "var(--border-subtle)")}
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: 16,
                padding: 4,
              }}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 14,
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: 16,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            opacity: isLoading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {isLoading ? (
            <>
              <span style={{ display: "inline-block", animation: "spin-slow 1s linear infinite" }}>⟳</span>
              Signing in…
            </>
          ) : (
            "Sign In →"
          )}
        </button>
        <div style={{ textAlign: "center", margin: "18px 0", color: "var(--text-muted)" }}>
  ─── OR ───
</div>

{/* 🔥 Google Login */}
<div style={{ display: "flex", justifyContent: "center" }}>
  <GoogleLogin
    onSuccess={(res) => {
      console.log("Google Token:", res.credential);

      // 🔥 backend call yaha karega next step me
    }}
    onError={() => console.log("Google Login Failed")}
  />
</div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
  New user?{" "}
  <button onClick={onGoSignup} style={{ background: "none", border: "none", color: "var(--accent-ice)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)" }}>
    Create an account
  </button>
</p>
      </div>
    </div>
  );
}
