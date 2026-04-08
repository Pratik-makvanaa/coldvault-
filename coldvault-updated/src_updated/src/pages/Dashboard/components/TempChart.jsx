export function TempChart() {
  const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
  const zoneA = [-20, -20.5, -21, -20.8, -19.5, -18, -18.5, -19, -20, -21, -20.5, -20.2];
  const zoneB = [-22, -22.5, -23, -22.8, -21.5, -21, -21.5, -22, -22.5, -23, -22.8, -22.4];

  const W = 520;
  const H = 140;
  const padX = 10;
  const padY = 10;
  const allVals = [...zoneA, ...zoneB];
  const minV = Math.min(...allVals) - 1;
  const maxV = Math.max(...allVals) + 1;

  const toX = (i) => padX + (i / (hours.length - 1)) * (W - 2 * padX);
  const toY = (v) => H - padY - ((v - minV) / (maxV - minV)) * (H - 2 * padY);

  const pathA = zoneA.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const fillA = `M${toX(0)},${H} ` + zoneA.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ") + ` L${toX(zoneA.length - 1)},${H} Z`;

  const pathB = zoneB.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const fillB = `M${toX(0)},${H} ` + zoneB.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ") + ` L${toX(zoneB.length - 1)},${H} Z`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--text-primary)" }}>
            Temperature Trends
          </div>
          <div style={{ fontSize: 17, color: "var(--text-muted)", marginTop: 2 }}>24-hour rolling window</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[["Zone A", "#4dd9f0"], ["Zone B", "#a78bfa"]].map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 17, color: "var(--text-secondary)" }}>
              <div style={{ width: 24, height: 2, background: color, borderRadius: 1 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4dd9f0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4dd9f0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={i}
            x1={padX}
            y1={padY + t * (H - 2 * padX)}
            x2={W - padX}
            y2={padY + t * (H - 2 * padX)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {/* Fill areas */}
        <path d={fillA} fill="url(#gradA)" />
        <path d={fillB} fill="url(#gradB)" />

        {/* Lines */}
        <path
          d={pathA}
          fill="none"
          stroke="#4dd9f0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(77,217,240,0.5))" }}
        />
        <path
          d={pathB}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.5))" }}
        />

        {/* Hour labels */}
        {hours.map((h, i) => (
          <text key={h} x={toX(i)} y={H + 14} textAnchor="middle" fontSize="9" fill="rgba(100,150,175,0.5)">
            {h}:00
          </text>
        ))}
      </svg>
    </div>
  );
}



