export function AlertsPanel() {
  const alerts = [
    { type: "info", chamber: "C-02", msg: "Booking created — invoice ready", time: "Just now" },
    { type: "warning", chamber: "C-04", msg: "Chamber nearing full capacity", time: "8m ago" },
    { type: "info", chamber: "C-01", msg: "Payment reminder scheduled", time: "1h ago" },
  ];

  const colors = { warning: "#f59e0b", error: "#ef4444", info: "#2563eb" };

  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, marginBottom: 18, color: "var(--text-primary)" }}>
        Recent Alerts
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.map((a, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              background: `${colors[a.type]}08`,
              border: `1px solid ${colors[a.type]}20`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: colors[a.type],
                boxShadow: `0 0 8px ${colors[a.type]}`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>{a.msg}</div>
              <div style={{ fontSize: 16, color: "var(--text-muted)" }}>Chamber {a.chamber}</div>
            </div>
            <div style={{ fontSize: 16, color: "var(--text-muted)", flexShrink: 0 }}>{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}



