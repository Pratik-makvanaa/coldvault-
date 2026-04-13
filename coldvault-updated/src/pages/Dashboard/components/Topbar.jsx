import { useEffect, useState } from "react";
import { Icons } from "../../../components/icons/index.jsx";

export function Topbar({ collapsed, onBack }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        height: 68,
        position: "fixed",
        top: 0,
        left: collapsed ? 84 : 264,
        right: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.10)",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{ flex: 1 }} />

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Live clock */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 19,
              fontWeight: 600,
              color: "var(--accent-ice)",
              letterSpacing: "0.05em",
            }}
          >
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 30, background: "var(--border-subtle)" }} />

        {/* Alert bell */}
        <div
          style={{ position: "relative", cursor: "pointer", color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-ice)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <Icons.bell />
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            3
          </div>
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #0f766e, #14b8a6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 18,
            color: "#ffffff",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          AD
        </div>

        {/* Back to landing */}
        <button onClick={onBack} className="btn-ghost" style={{ padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 15 }}>
          ← Log out
        </button>
      </div>
    </div>
  );
}



