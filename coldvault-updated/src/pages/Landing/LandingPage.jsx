import { useEffect, useState } from "react";
import { Icons } from "../../components/icons/index.jsx";
import { HeroVisual } from "./components/HeroVisual.jsx";

export function LandingPage({ onEnterDashboard }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const stats = [
    { value: "100%", label: "Active Chamber Tracking" },
    { value: "Real-time", label: "Temperature + Capacity" },
    { value: "500+", label: "Managed Items" },
    { value: "24/7", label: "Billing & Reporting" },
  ];

  const features = [
    {
      icon: Icons.thermometer,
      title: "Full Chamber Management",
      desc: "Add and monitor Chambers with temperature, humidity, zone, and status, with capacity shown as first priority.",
    },
    {
      icon: Icons.shield,
      title: "Customer Storage Owners",
      desc: "Record customer, product, quantity, storage duration, and storage price for each inventory line item.",
    },
    {
      icon: Icons.activity,
      title: "Inventory and Capacity Tracking",
      desc: "Live inventory feed with per-chamber usage, remaining capacity, and alerts for high usage.",
    },
    {
      icon: Icons.zap,
      title: "Operational Billing",
      desc: "Calculate storage fees automatically using quantity, duration, and rate data (ready for DB persistence).",
    },
    {
      icon: Icons.package,
      title: "Reporting & CSV Export",
      desc: "Generate and download reports with customer, product, capacity, chamber, price, and time data.",
    },
    {
      icon: Icons.truck,
      title: "Future-Ready Data Model",
      desc: "Everything is structured for a later database integration (chambers + inventory + customers).",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        minHeight: "100vh",
        background: "var(--bg-void)",
        overflow: "hidden",
      }}
    >
      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.35 }} />
        <div
          className="hero-orb"
          style={{
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)",
            top: "10%",
            left: "60%",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
            transition: "transform 0.5s ease",
          }}
        />
        <div
          className="hero-orb"
          style={{
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(96,165,250,0.10), transparent 70%)",
            bottom: "20%",
            left: "10%",
            transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`,
            transition: "transform 0.7s ease",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "20px 60px",
          background: "rgba(255,255,255,0.92)",
          borderBottom: "1px solid rgba(15,23,42,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #2563eb, #60a5fa)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icons.snowflake />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 21,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            COLD<span style={{ color: "var(--accent-ice)" }}>VAULT</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Platform", "Solutions", "Pricing", "Docs"].map((item) => (
            <span
              key={item}
              style={{
                fontSize: 17,
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--accent-ice)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
            >
              {item}
            </span>
          ))}
          <button
            className="btn-primary"
            onClick={onEnterDashboard}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 17,
            }}
          >
            Enter Dashboard
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "180px 60px 100px",
          maxWidth: 1300,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 100 }}>
          {/* Left content */}
          <div style={{ flex: 1 }}>
            <div
              className="animate-fadeInUp stagger-1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 100,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.18)",
                marginBottom: 28,
                color: "var(--accent-ice)",
                fontSize: 15,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent-emerald)",
                  boxShadow: "0 0 0 3px rgba(16,185,129,0.15)",
                }}
              />
              {/* INTELLIGENT COLD CHAIN PLATFORM v4.2 */}
            </div>

            <h1
              className="animate-fadeInUp stagger-2"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 71,
                lineHeight: 1.05,
                marginBottom: 24,
              }}
            >
              <span style={{ color: "var(--text-primary)" }}>Cold </span>
              <br />
              <span className="shimmer-text">Storage</span>
            </h1>

            <p
              className="animate-fadeInUp stagger-3"
              style={{
                fontSize: 21,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                maxWidth: 520,
                marginBottom: 48,
                fontWeight: 300,
              }}
            >
              Our mission is clear: Help cold storage operators manage chambers, inventory, and customer storage orders with capacity-first insights, automated billing, and fast reporting.
              
              Track product name, customer, stored duration, and chamber utilization in one single dashboard.
            </p>

            <div className="animate-fadeInUp stagger-4" style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button
                className="btn-primary"
                onClick={onEnterDashboard}
                style={{
                  padding: "16px 36px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                Launch Dashboard
                <Icons.arrowRight />
              </button>
              <button
                className="btn-ghost"
                style={{
                  padding: "16px 36px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Icons.eye />
                Live Demo
              </button>
            </div>

            {/* Stat row */}
            <div
              className="animate-fadeInUp stagger-5"
              style={{
                display: "flex",
                gap: 40,
                marginTop: 60,
                paddingTop: 40,
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 31,
                      fontWeight: 700,
                      color: "var(--accent-ice)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero visual */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 60px", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 45,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
           Critical Cold <span style={{ color: "var(--accent-ice)" }}>Features</span>
          </h2>
          {/* <p style={{ color: "var(--text-secondary)", fontSize: 19, maxWidth: 500, margin: "0 auto" }}>
            Every feature purpose-built for pharmaceutical, food & beverage, and industrial cold storage operations.
          </p> */}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card"
              style={{
                padding: 28,
                cursor: "default",
                transition: "all 0.3s ease",
                animation: `fadeInUp 0.6s ease ${0.1 * i}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.4), 0 0 40px rgba(77,217,240,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(77,217,240,0.15), rgba(0,180,216,0.05))",
                  border: "1px solid rgba(77,217,240,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "var(--accent-ice)",
                }}
              >
                <f.icon />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 20,
                  marginBottom: 10,
                  color: "var(--text-primary)",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 60px 100px", maxWidth: 1300, margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(14,165,201,0.15), rgba(77,217,240,0.05))",
            border: "1px solid rgba(77,217,240,0.2)",
            borderRadius: 24,
            padding: "60px 80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -60,
              top: -60,
              width: 300,
              height: 300,
              background: "radial-gradient(circle, rgba(77,217,240,0.1), transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 37, fontWeight: 700, marginBottom: 12 }}>
              Ready to go below zero?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 19 }}>
              Join 800+ facilities running on ColdVault infrastructure.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={onEnterDashboard}
            style={{
              padding: "18px 44px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontSize: 19,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            Open Dashboard
            <Icons.arrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}


