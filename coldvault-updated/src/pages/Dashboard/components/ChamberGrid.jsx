export function ChamberGrid({ chambers, onSelectChamber }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {chambers.map((ch) => {
        const usedSlots = ch.bookings?.reduce((sum, b) => sum + b.slots, 0) || 0;
        const totalSlots = ch.totalSlots || 0;
        const capacityPct = totalSlots ? Math.round((usedSlots / totalSlots) * 100) : 0;
        const accent = capacityPct > 90 ? "#ef4444" : capacityPct > 70 ? "#f59e0b" : "#10b981";
        const availableSlots = Math.max(0, totalSlots - usedSlots);

        return (
          <div key={ch.id} className="chamber-card" style={{ padding: 18, cursor: "pointer" }} onClick={() => onSelectChamber(ch.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 16, color: "var(--text-muted)", fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>
                {ch.id}
              </span>
              <div style={{ fontSize: 16, color: "var(--text-muted)" }}>
                {availableSlots} / {totalSlots} slots available
              </div>
            </div>

            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", marginBottom: 12 }}>{ch.name}</div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 36, fontFamily: "var(--font-display)", fontWeight: 800, color: accent, lineHeight: 1 }}>
                {capacityPct}%
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, color: "var(--text-muted)" }}>Price</div>
                <div style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}>
                  ₹{Number(ch.pricePerSlotPerDay).toLocaleString()} <span style={{ fontSize: 16, color: "var(--text-muted)" }}>/slot/day</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 12 }}>
              Used slots: {usedSlots} · Bookings: {ch.bookings?.length ?? 0}
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 16, color: "var(--text-muted)" }}>Capacity used</span>
                <span style={{ fontSize: 16, color: capacityPct > 90 ? "#ef4444" : "var(--text-secondary)" }}>{capacityPct}%</span>
              </div>
              <div style={{ height: 8, background: "rgba(15,23,42,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${capacityPct}%`,
                    background: capacityPct > 90 ? "linear-gradient(90deg, #ef4444, #fb7185)" : "linear-gradient(90deg, #2563eb, #60a5fa)",
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ fontSize: 15, color: "var(--text-muted)" }}>Tap to create booking →</div>
          </div>
        );
      })}
    </div>
  );
}



