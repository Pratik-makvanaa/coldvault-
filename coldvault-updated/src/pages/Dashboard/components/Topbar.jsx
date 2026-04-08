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
        left: collapsed ? 68 : 240,
        right: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.10)",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Left */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(15, 23, 42, 0.10)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--text-secondary)",
            fontSize: 19,
          }}
        >
          <Icons.search />
          <span style={{ opacity: 0.5 }}>Search chambers, customers…</span>
          <span style={{ marginLeft: 16, fontSize: 16, opacity: 0.3 }}>⌘K</span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Live clock */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--accent-ice)",
              letterSpacing: "0.05em",
            }}
          >
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ fontSize: 16, color: "var(--text-muted)" }}>
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
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #2563eb, #60a5fa)",
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
        <button onClick={onBack} className="btn-ghost" style={{ padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 17,backgroundColor:"#E34234" }}>
          LogOut
        </button>
      </div>
    </div>
  );
}



