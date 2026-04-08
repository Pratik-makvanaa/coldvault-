import { useEffect, useState } from "react";
import { Icons } from "../../../components/icons/index.jsx";

export function HeroVisual() {
  const [temps, setTemps] = useState([-18, -22, -8, -35]);

  useEffect(() => {
    const id = setInterval(() => {
      setTemps((t) => t.map((v) => v + (Math.random() - 0.5) * 0.4));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const chambers = [
    { label: "Zone A", color: "#4dd9f0" },
    { label: "Zone B", color: "#a78bfa" },
    { label: "Zone C", color: "#34d399" },
    { label: "Zone D", color: "#f59e0b" },
  ];

  return (
    <div className="animate-float" style={{ width: 380, position: "relative" }}>
      {/* Outer glow ring */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Main card */}
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(15,23,42,0.10)",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div
              style={{
                fontSize: 16,
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                fontFamily: "var(--font-display)",
              }}
            >
              FACILITY STATUS
            </div>
            <div
              style={{
                fontSize: 23,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginTop: 2,
              }}
            >
              Sector 04 Overview
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
          </div>
        </div>

        {/* Temperature rings */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {chambers.map((ch, i) => {
            const temp = temps[i];
            const progress = Math.min(1, Math.max(0, (temp + 40) / 35));
            const circumference = 2 * Math.PI * 28;
            const offset = circumference * (1 - progress);
            return (
              <div
                key={ch.label}
                style={{
                  background: "var(--surface-2)",
                  borderRadius: 12,
                  padding: "14px",
                  border: "1px solid rgba(15,23,42,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <svg width="68" height="68" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="4" />
                  <circle
                    cx="34"
                    cy="34"
                    r="28"
                    fill="none"
                    stroke={ch.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.5s ease", filter: `drop-shadow(0 0 6px ${ch.color})` }}
                  />
                </svg>
                <div
                  style={{
                    position: "relative",
                    marginTop: -50,
                    marginBottom: 6,
                    fontSize: 20,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: ch.color,
                  }}
                >
                  {temp.toFixed(1)}°
                </div>
                <div style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 4 }}>{ch.label}</div>
              </div>
            );
          })}
        </div>

        {/* Alert */}
        <div
          style={{
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.22)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ color: "#f59e0b", flexShrink: 0 }}>
            <Icons.alert />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#f59e0b" }}>Zone B — Temp Drift</div>
            <div style={{ fontSize: 16, color: "var(--text-muted)" }}>0.8°C above threshold · 2 min ago</div>
          </div>
        </div>
      </div>

      {/* Floating mini-cards */}
      <div
        className="animate-float-delay"
        style={{
          position: "absolute",
          right: -70,
          top: 40,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(15,23,42,0.10)",
          borderRadius: 14,
          padding: "12px 16px",
          boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
        }}
      >
        <div style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 4, letterSpacing: "0.1em" }}>HUMIDITY</div>
        <div style={{ fontSize: 27, fontFamily: "var(--font-display)", fontWeight: 700, color: "#a8edff" }}>82%</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: -55,
          bottom: 60,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(15,23,42,0.10)",
          borderRadius: 14,
          padding: "12px 16px",
          boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
        }}
      >
        <div style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 4, letterSpacing: "0.1em" }}>ACTIVE ZONES</div>
        <div style={{ fontSize: 27, fontFamily: "var(--font-display)", fontWeight: 700, color: "#10b981" }}>24/24</div>
      </div>
    </div>
  );
}



