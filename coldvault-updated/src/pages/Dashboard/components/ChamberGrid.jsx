export function ChamberGrid({ chambers, onSelectChamber }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
      {chambers.map((ch) => {
        const activeBookings = (ch.bookings || []).filter((b) => b?.checkoutStatus !== "CHECKED_OUT" && !b?.actualPickupDate);
        const usedSlots = activeBookings.reduce((sum, b) => sum + b.slots, 0);
        const totalSlots = ch.totalSlots || 0;
        const capacityPct = totalSlots ? Math.round((usedSlots / totalSlots) * 100) : 0;
        const displayCapacityPct = Math.min(100, Math.max(0, capacityPct));
        const accent = displayCapacityPct > 90 ? "#ef4444" : displayCapacityPct > 70 ? "#f59e0b" : "#10b981";
        const availableSlots = Math.max(0, totalSlots - usedSlots);

        return (
          <div key={ch.id} className="chamber-card" style={{ padding: 18, cursor: "pointer" }} onClick={() => onSelectChamber(ch.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>
                {ch.id}
              </span>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {availableSlots} / {totalSlots} slots available
              </div>
            </div>

            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>{ch.name}</div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 34, fontFamily: "var(--font-display)", fontWeight: 700, color: accent, lineHeight: 1 }}>
                {displayCapacityPct}%
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Price</div>
                <div style={{ fontSize: 17, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}>
                  ₹{Number(ch.pricePerSlotPerDay).toLocaleString()} <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/slot/day</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 10 }}>
              Used slots: {usedSlots} · Bookings: {activeBookings.length}
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Capacity used</span>
                <span style={{ fontSize: 13, color: displayCapacityPct > 90 ? "#ef4444" : "var(--text-secondary)" }}>{displayCapacityPct}%</span>
              </div>
              <div style={{ height: 8, background: "rgba(15,23,42,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${displayCapacityPct}%`,
                    background: displayCapacityPct > 90 ? "linear-gradient(90deg, #ef4444, #fb7185)" : "linear-gradient(90deg, #2563eb, #60a5fa)",
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Click to open bookings</div>
          </div>
        );
      })}
    </div>
  );
}



