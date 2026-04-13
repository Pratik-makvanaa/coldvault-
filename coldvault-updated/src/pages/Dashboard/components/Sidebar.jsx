import { Icons } from "../../../components/icons/index.jsx";

export function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const navItems = [
    { id: "dashboard",    label: "Dashboard",    icon: Icons.dashboard },
    { id: "chambers",     label: "Chambers",     icon: Icons.warehouse },
    { id: "all-bookings", label: "All Bookings", icon: Icons.chart },
    { id: "alerts",       label: "Alerts",       icon: Icons.alert},
    { id: "reports",      label: "Reports",      icon: Icons.package },
    { id: "users",        label: "Users",        icon: Icons.users },
  ];

  return (
    <div
      className="sidebar"
      style={{
        width: collapsed ? 68 : 240,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        background: "var(--surface-1)",
        borderRight: "1px solid rgba(15, 23, 42, 0.10)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 14px" : "20px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 68,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              background: "linear-gradient(135deg, #2563eb, #60a5fa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 22px rgba(37,99,235,0.18)",
            }}
          >
            <Icons.snowflake />
          </div>
          {!collapsed && (
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap" }}>
              COLD<span style={{ color: "var(--accent-ice)" }}>VAULT</span>
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
          >
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <div
              key={item.id}
              className={isActive ? "nav-item-active" : ""}
              onClick={() => setActive(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "12px" : "11px 14px",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 2,
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive
                  ? "linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04))"
                  : "transparent",
                color: isActive ? "var(--accent-ice)" : "var(--text-secondary)",
                position: "relative",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(37,99,235,0.06)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ flexShrink: 0 }}>
                <item.icon />
              </div>
              {!collapsed && (
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: isActive ? 500 : 400, whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: 6, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                  {item.badge}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border-subtle)" }}>
        {collapsed && (
          <div onClick={() => setCollapsed(false)} style={{ display: "flex", justifyContent: "center", padding: 12, borderRadius: 10, cursor: "pointer", color: "var(--text-muted)", marginBottom: 8 }}>
            <Icons.menu />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "12px" : "12px 14px", borderRadius: 10, justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer", color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-ice)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <Icons.settings />
          {!collapsed && <span style={{ fontSize: 14 }}>Settings</span>}
        </div>
      </div>
    </div>
  );
}