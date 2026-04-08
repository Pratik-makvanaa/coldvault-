// ─── CHAMBERS PAGE ────────────────────────────────────────────────────────────
// Drop this component into your coldstorage.jsx and render it when
// activeNav === "chambers" inside the Dashboard component.
//
// INTEGRATION STEPS:
// 1. Copy this entire file's content into coldstorage.jsx (before the App export)
// 2. In Dashboard(), add:  import or paste ChambersPage above App
// 3. In Dashboard's return, replace the chamber grid section with:
//
//    {activeNav === "chambers" ? (
//      <ChambersPage />
//    ) : (
//      /* your existing dashboard JSX */
//    )}
//
// The component uses the same CSS variables and utility classes already
// defined in your `styles` string (glass-card, btn-primary, btn-ghost, etc.)

import { useState, useRef, useEffect } from "react";

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INITIAL_CHAMBERS = [
  { id: "A-01", name: "Pharma Cold",    zone: "A", status: "online",  temp: -20.4, humidity: 78, totalSlots: 120, usedSlots: 101, pricePerSlot: 18, minTemp: -25, maxTemp: -18, description: "Pharmaceutical grade storage" },
  { id: "A-02", name: "Vaccine Store",  zone: "A", status: "online",  temp: -22.1, humidity: 82, totalSlots: 80,  usedSlots: 54,  pricePerSlot: 24, minTemp: -25, maxTemp: -20, description: "Vaccine and biologics cold store" },
  { id: "B-01", name: "Meat & Poultry", zone: "B", status: "warning", temp: -18.7, humidity: 90, totalSlots: 200, usedSlots: 190, pricePerSlot: 14, minTemp: -22, maxTemp: -16, description: "Meat and poultry primary zone" },
  { id: "B-02", name: "Seafood Zone",   zone: "B", status: "online",  temp: -21.0, humidity: 88, totalSlots: 150, usedSlots: 107, pricePerSlot: 16, minTemp: -24, maxTemp: -18, description: "Seafood and marine products" },
  { id: "C-01", name: "Dairy Storage",  zone: "C", status: "online",  temp: -8.3,  humidity: 75, totalSlots: 100, usedSlots: 58,  pricePerSlot: 12, minTemp: -12, maxTemp: -4,  description: "Dairy and cheese cold storage" },
  { id: "C-02", name: "Produce Zone",   zone: "C", status: "online",  temp: -4.0,  humidity: 92, totalSlots: 90,  usedSlots: 39,  pricePerSlot: 10, minTemp: -6,  maxTemp: -2,  description: "Fresh produce and vegetables" },
  { id: "D-01", name: "Deep Freeze",    zone: "D", status: "online",  temp: -35.2, humidity: 68, totalSlots: 60,  usedSlots: 53,  pricePerSlot: 28, minTemp: -40, maxTemp: -30, description: "Ultra-low temperature storage" },
  { id: "D-02", name: "Blast Chill",    zone: "D", status: "offline", temp: -30.0, humidity: 72, totalSlots: 40,  usedSlots: 0,   pricePerSlot: 22, minTemp: -35, maxTemp: -25, description: "Rapid blast chilling unit" },
];

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
const statusColor = { online: "#10b981", warning: "#f59e0b", offline: "#f43f5e" };
const zoneColor   = { A: "#4dd9f0", B: "#a78bfa", C: "#34d399", D: "#f59e0b" };

function Badge({ status }) {
  const c = statusColor[status] || "#4dd9f0";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: `${c}15`, border: `1px solid ${c}30`,
      fontSize: 11, color: c, fontWeight: 500,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
}

function CapacityBar({ used, total, danger = 90 }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const isHigh = pct >= danger;
  const fill = isHigh
    ? "linear-gradient(90deg,#f43f5e,#fb7185)"
    : "linear-gradient(90deg,#0ea5c9,#4dd9f0)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11, color: "var(--text-muted)" }}>
        <span>{used} / {total} slots</span>
        <span style={{ color: isHigh ? "#f43f5e" : "var(--text-secondary)" }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: fill, borderRadius: 3,
          transition: "width 0.8s ease",
          boxShadow: isHigh ? "0 0 8px rgba(244,63,94,0.4)" : "0 0 6px rgba(77,217,240,0.25)",
        }} />
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", prefix, suffix, min, max, step = "1", readOnly = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{label.toUpperCase()}</label>
      <div style={{
        display: "flex", alignItems: "center",
        background: "rgba(3,11,20,0.6)", border: "1px solid rgba(77,217,240,0.15)",
        borderRadius: 8, overflow: "hidden",
        opacity: readOnly ? 0.5 : 1,
        transition: "border-color 0.2s",
      }}
        onFocus={() => {}}
      >
        {prefix && (
          <span style={{ padding: "0 10px", color: "var(--text-muted)", fontSize: 13, borderRight: "1px solid rgba(77,217,240,0.1)" }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          readOnly={readOnly}
          min={min} max={max} step={step}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: readOnly ? "var(--text-muted)" : "var(--text-primary)",
            fontSize: 14, padding: "9px 12px",
            fontFamily: "var(--font-body)",
          }}
          onFocus={e => !readOnly && (e.target.parentElement.style.borderColor = "rgba(77,217,240,0.5)")}
          onBlur={e => (e.target.parentElement.style.borderColor = "rgba(77,217,240,0.15)")}
        />
        {suffix && (
          <span style={{ padding: "0 10px", color: "var(--text-muted)", fontSize: 12, borderLeft: "1px solid rgba(77,217,240,0.1)" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditChamberModal({ chamber, onSave, onClose }) {
  const [form, setForm] = useState({ ...chamber });
  const [tab, setTab] = useState("general");

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const tabs = ["general", "capacity", "pricing", "temperature"];

  const handleSave = () => {
    const parsed = {
      ...form,
      totalSlots:   parseInt(form.totalSlots)   || 0,
      pricePerSlot: parseFloat(form.pricePerSlot) || 0,
      minTemp:      parseFloat(form.minTemp)      || 0,
      maxTemp:      parseFloat(form.maxTemp)      || 0,
    };
    onSave(parsed);
  };

  const freeSlots = (parseInt(form.totalSlots) || 0) - chamber.usedSlots;
  const estimatedRevenue = ((parseInt(form.totalSlots) || 0) * (parseFloat(form.pricePerSlot) || 0)).toFixed(0);

  return (
    // backdrop
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(3,11,20,0.85)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: 600,
        background: "rgba(8,18,36,0.98)",
        border: "1px solid rgba(77,217,240,0.25)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(77,217,240,0.06)",
        animation: "fadeInUp 0.25s ease",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "22px 28px",
          borderBottom: "1px solid rgba(77,217,240,0.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(14,165,201,0.06)",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>
              EDIT CHAMBER — {chamber.id}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              {chamber.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "var(--text-muted)",
              fontSize: 18, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 2, padding: "14px 28px 0",
          borderBottom: "1px solid rgba(77,217,240,0.08)",
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 16px", borderRadius: "8px 8px 0 0", fontSize: 13,
              fontFamily: "var(--font-display)", fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "var(--accent-ice)" : "var(--text-muted)",
              borderBottom: tab === t ? "2px solid var(--accent-ice)" : "2px solid transparent",
              transition: "all 0.2s",
              textTransform: "capitalize",
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "24px 28px", minHeight: 220 }}>
          {tab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InputField label="Chamber name" value={form.name} onChange={set("name")} />
              <InputField label="Chamber ID" value={form.id} onChange={() => {}} readOnly />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>ZONE</label>
                  <select
                    value={form.zone}
                    onChange={e => set("zone")(e.target.value)}
                    style={{
                      background: "rgba(3,11,20,0.6)", border: "1px solid rgba(77,217,240,0.15)",
                      borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                      padding: "9px 12px", fontFamily: "var(--font-body)", outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {["A", "B", "C", "D"].map(z => <option key={z} value={z} style={{ background: "#060f1c" }}>Zone {z}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>STATUS</label>
                  <select
                    value={form.status}
                    onChange={e => set("status")(e.target.value)}
                    style={{
                      background: "rgba(3,11,20,0.6)", border: "1px solid rgba(77,217,240,0.15)",
                      borderRadius: 8, color: statusColor[form.status] || "var(--text-primary)", fontSize: 14,
                      padding: "9px 12px", fontFamily: "var(--font-body)", outline: "none", cursor: "pointer",
                    }}
                  >
                    {["online", "warning", "offline"].map(s => (
                      <option key={s} value={s} style={{ background: "#060f1c", color: statusColor[s] }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <InputField label="Description" value={form.description} onChange={set("description")} />
            </div>
          )}

          {tab === "capacity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InputField label="Total slots" value={form.totalSlots} onChange={set("totalSlots")} type="number" min="1" step="1" suffix="slots" />
              <InputField label="Currently used slots" value={chamber.usedSlots} onChange={() => {}} readOnly suffix="slots" />
              <div style={{
                background: "rgba(77,217,240,0.05)", border: "1px solid rgba(77,217,240,0.15)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>CAPACITY PREVIEW</div>
                <CapacityBar used={chamber.usedSlots} total={parseInt(form.totalSlots) || 0} />
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)" }}>
                  Free after save: <span style={{ color: freeSlots < 0 ? "#f43f5e" : "#10b981", fontWeight: 600 }}>{freeSlots} slots</span>
                  {freeSlots < 0 && <span style={{ color: "#f43f5e", marginLeft: 8 }}>⚠ Cannot be less than used slots</span>}
                </div>
              </div>
            </div>
          )}

          {tab === "pricing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InputField label="Price per slot / day" value={form.pricePerSlot} onChange={set("pricePerSlot")} type="number" min="0" step="0.5" prefix="₹" suffix="/ slot / day" />
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>MAX DAILY REVENUE</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#10b981" }}>
                    ₹{(parseInt(form.totalSlots) * parseFloat(form.pricePerSlot || 0)).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>if all slots filled</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>CURRENT DAILY REVENUE</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#4dd9f0" }}>
                    ₹{(chamber.usedSlots * parseFloat(form.pricePerSlot || 0)).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{chamber.usedSlots} slots active</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "10px 14px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8 }}>
                ⚠ Changing price affects new bookings only. Existing bookings retain their original rate.
              </div>
            </div>
          )}

          {tab === "temperature" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InputField label="Min temp threshold" value={form.minTemp} onChange={set("minTemp")} type="number" step="0.5" suffix="°C" />
                <InputField label="Max temp threshold" value={form.maxTemp} onChange={set("maxTemp")} type="number" step="0.5" suffix="°C" />
              </div>
              <div style={{
                background: "rgba(77,217,240,0.04)", border: "1px solid rgba(77,217,240,0.12)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>CURRENT READING</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent-ice)" }}>
                    {chamber.temp.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Range: {form.minTemp}°C → {form.maxTemp}°C<br />
                    Humidity: {chamber.humidity}% RH
                  </div>
                </div>
                {(chamber.temp < parseFloat(form.minTemp) || chamber.temp > parseFloat(form.maxTemp)) && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#f43f5e", display: "flex", gap: 6, alignItems: "center" }}>
                    ⚠ Current reading is outside the set range
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div style={{
          padding: "16px 28px",
          borderTop: "1px solid rgba(77,217,240,0.08)",
          display: "flex", justifyContent: "flex-end", gap: 10,
          background: "rgba(3,11,20,0.4)",
        }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "9px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={freeSlots < 0}
            className="btn-primary"
            style={{
              padding: "9px 22px", borderRadius: 10, border: "none", cursor: freeSlots < 0 ? "not-allowed" : "pointer",
              fontSize: 13, opacity: freeSlots < 0 ? 0.5 : 1,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD CHAMBER MODAL ────────────────────────────────────────────────────────
function AddChamberModal({ onSave, onClose, existingIds }) {
  const newId = `${["A","B","C","D"][Math.floor(Math.random()*4)]}-${String(existingIds.length + 1).padStart(2,"0")}`;
  const [form, setForm] = useState({
    id: newId, name: "", zone: "A", status: "online",
    totalSlots: 100, usedSlots: 0, pricePerSlot: 15,
    minTemp: -22, maxTemp: -18, temp: -20.0, humidity: 75,
    description: "",
  });

  const set = key => val => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(3,11,20,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: 560,
        background: "rgba(8,18,36,0.98)",
        border: "1px solid rgba(77,217,240,0.25)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        animation: "fadeInUp 0.25s ease",
      }}>
        <div style={{
          padding: "22px 28px", borderBottom: "1px solid rgba(77,217,240,0.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(16,185,129,0.06)",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>NEW CHAMBER</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Add Chamber</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "var(--text-muted)", fontSize: 18,
          }}>×</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <InputField label="Chamber name" value={form.name} onChange={set("name")} />
            <InputField label="Auto ID" value={form.id} onChange={() => {}} readOnly />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>ZONE</label>
              <select value={form.zone} onChange={e => set("zone")(e.target.value)} style={{
                background: "rgba(3,11,20,0.6)", border: "1px solid rgba(77,217,240,0.15)",
                borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
                padding: "9px 12px", fontFamily: "var(--font-body)", outline: "none",
              }}>
                {["A","B","C","D"].map(z => <option key={z} value={z} style={{ background: "#060f1c" }}>Zone {z}</option>)}
              </select>
            </div>
            <InputField label="Total slots" value={form.totalSlots} onChange={set("totalSlots")} type="number" min="1" suffix="slots" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <InputField label="Price / slot / day" value={form.pricePerSlot} onChange={set("pricePerSlot")} type="number" min="0" step="0.5" prefix="₹" />
            <InputField label="Description" value={form.description} onChange={set("description")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <InputField label="Min temp" value={form.minTemp} onChange={set("minTemp")} type="number" step="0.5" suffix="°C" />
            <InputField label="Max temp" value={form.maxTemp} onChange={set("maxTemp")} type="number" step="0.5" suffix="°C" />
          </div>
        </div>

        <div style={{
          padding: "16px 28px", borderTop: "1px solid rgba(77,217,240,0.08)",
          display: "flex", justifyContent: "flex-end", gap: 10,
          background: "rgba(3,11,20,0.4)",
        }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "9px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button
            onClick={() => form.name.trim() && onSave({ ...form, totalSlots: parseInt(form.totalSlots), pricePerSlot: parseFloat(form.pricePerSlot), minTemp: parseFloat(form.minTemp), maxTemp: parseFloat(form.maxTemp) })}
            className="btn-primary"
            style={{ padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, opacity: form.name.trim() ? 1 : 0.5 }}
          >
            Add Chamber
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────
function DeleteConfirmModal({ chamber, onConfirm, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(3,11,20,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(8,18,36,0.98)",
        border: "1px solid rgba(244,63,94,0.3)",
        borderRadius: 20, overflow: "hidden",
        animation: "fadeInUp 0.2s ease",
        boxShadow: "0 0 60px rgba(244,63,94,0.1)",
      }}>
        <div style={{ padding: "28px 28px 20px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, marginBottom: 16,
          }}>⚠</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            Delete {chamber.name}?
          </div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            This will permanently remove chamber <span style={{ color: "var(--accent-ice)" }}>{chamber.id}</span> and all its configuration.
            {chamber.usedSlots > 0 && (
              <div style={{ marginTop: 10, color: "#f43f5e", fontSize: 13 }}>
                ⚠ This chamber has {chamber.usedSlots} active slots. Remove all bookings first.
              </div>
            )}
          </div>
        </div>
        <div style={{
          padding: "16px 28px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 10, justifyContent: "flex-end",
          background: "rgba(3,11,20,0.4)",
        }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "9px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button
            onClick={() => chamber.usedSlots === 0 && onConfirm()}
            style={{
              padding: "9px 22px", borderRadius: 10, border: "none", fontSize: 13,
              background: chamber.usedSlots > 0 ? "rgba(244,63,94,0.2)" : "#f43f5e",
              color: "#fff", cursor: chamber.usedSlots > 0 ? "not-allowed" : "pointer",
              fontFamily: "var(--font-display)", fontWeight: 600, opacity: chamber.usedSlots > 0 ? 0.5 : 1,
            }}
          >
            Delete Chamber
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHAMBERS PAGE (main export) ──────────────────────────────────────────────
export default function ChambersPage() {
  const [chambers, setChambers]       = useState(INITIAL_CHAMBERS);
  const [search, setSearch]           = useState("");
  const [filterZone, setFilterZone]   = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy]           = useState("id");
  const [editTarget, setEditTarget]   = useState(null);   // chamber being edited
  const [addOpen, setAddOpen]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]             = useState(null);   // { msg, type }
  const [viewMode, setViewMode]       = useState("grid"); // "grid" | "table"

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Derived filtered list ─────────────────────────────────────────────────
  const filtered = chambers
    .filter(c => {
      const q = search.toLowerCase();
      return (
        (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) &&
        (filterZone === "All" || c.zone === filterZone) &&
        (filterStatus === "All" || c.status === filterStatus)
      );
    })
    .sort((a, b) => {
      if (sortBy === "id")       return a.id.localeCompare(b.id);
      if (sortBy === "capacity") return (b.usedSlots / b.totalSlots) - (a.usedSlots / a.totalSlots);
      if (sortBy === "price")    return b.pricePerSlot - a.pricePerSlot;
      if (sortBy === "name")     return a.name.localeCompare(b.name);
      return 0;
    });

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalSlots   = chambers.reduce((s, c) => s + c.totalSlots, 0);
  const usedSlots    = chambers.reduce((s, c) => s + c.usedSlots, 0);
  const dailyRevenue = chambers.reduce((s, c) => s + c.usedSlots * c.pricePerSlot, 0);
  const onlineCount  = chambers.filter(c => c.status === "online").length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSaveEdit = (updated) => {
    setChambers(cs => cs.map(c => c.id === updated.id ? updated : c));
    setEditTarget(null);
    showToast(`Chamber ${updated.id} updated successfully`);
  };

  const handleAdd = (newChamber) => {
    setChambers(cs => [...cs, newChamber]);
    setAddOpen(false);
    showToast(`Chamber ${newChamber.id} added`, "success");
  };

  const handleDelete = () => {
    setChambers(cs => cs.filter(c => c.id !== deleteTarget.id));
    showToast(`Chamber ${deleteTarget.id} deleted`, "error");
    setDeleteTarget(null);
  };

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh" }}>

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 300,
          background: toast.type === "error" ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)",
          border: `1px solid ${toast.type === "error" ? "rgba(244,63,94,0.4)" : "rgba(16,185,129,0.4)"}`,
          borderRadius: 12, padding: "14px 20px", backdropFilter: "blur(20px)",
          color: toast.type === "error" ? "#f43f5e" : "#10b981",
          fontSize: 14, fontWeight: 500,
          animation: "fadeInUp 0.3s ease",
          boxShadow: `0 8px 32px ${toast.type === "error" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              Chamber Management
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
              Configure capacity, pricing &amp; thresholds · {chambers.length} chambers registered
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {/* View toggle */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(77,217,240,0.12)", borderRadius: 10, overflow: "hidden" }}>
              {["grid", "table"].map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 12,
                  background: viewMode === mode ? "rgba(77,217,240,0.15)" : "transparent",
                  color: viewMode === mode ? "var(--accent-ice)" : "var(--text-muted)",
                  fontFamily: "var(--font-display)", fontWeight: viewMode === mode ? 600 : 400,
                  transition: "all 0.2s",
                }}>
                  {mode === "grid" ? "⊞ Grid" : "☰ Table"}
                </button>
              ))}
            </div>
            <button onClick={() => setAddOpen(true)} className="btn-primary" style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13 }}>
              + Add Chamber
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary stats ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total chambers",   value: chambers.length, sub: `${onlineCount} online`,     color: "#4dd9f0" },
          { label: "Total slots",      value: totalSlots,       sub: `${usedSlots} used`,         color: "#a78bfa" },
          { label: "Occupancy",        value: totalSlots > 0 ? `${Math.round((usedSlots/totalSlots)*100)}%` : "0%", sub: `${totalSlots - usedSlots} free`, color: usedSlots/totalSlots > 0.9 ? "#f43f5e" : "#10b981" },
          { label: "Daily revenue",    value: `₹${dailyRevenue.toLocaleString()}`, sub: "from active slots", color: "#f59e0b" },
        ].map((s, i) => (
          <div key={s.label} className="metric-card" style={{ background: "rgba(8,18,36,0.8)", padding: "18px 22px", animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(77,217,240,0.15)",
          borderRadius: 10, padding: "8px 14px", flex: "1 1 200px", minWidth: 160,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search chambers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, width: "100%", fontFamily: "var(--font-body)" }}
          />
        </div>

        {/* Zone filter */}
        <div style={{ display: "flex", gap: 4 }}>
          {["All", "A", "B", "C", "D"].map(z => (
            <button key={z} onClick={() => setFilterZone(z)} style={{
              padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12,
              background: filterZone === z ? (z === "All" ? "rgba(77,217,240,0.2)" : `${zoneColor[z]}20`) : "rgba(255,255,255,0.04)",
              color: filterZone === z ? (z === "All" ? "var(--accent-ice)" : zoneColor[z]) : "var(--text-muted)",
              fontFamily: "var(--font-display)", fontWeight: filterZone === z ? 600 : 400,
              border: filterZone === z ? `1px solid ${z === "All" ? "rgba(77,217,240,0.3)" : `${zoneColor[z]}40`}` : "1px solid transparent",
              transition: "all 0.2s",
            }}>
              {z === "All" ? "All Zones" : `Zone ${z}`}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: 4 }}>
          {["All", "online", "warning", "offline"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12,
              background: filterStatus === s ? (s === "All" ? "rgba(255,255,255,0.08)" : `${statusColor[s]}15`) : "rgba(255,255,255,0.04)",
              color: filterStatus === s ? (s === "All" ? "var(--text-primary)" : statusColor[s]) : "var(--text-muted)",
              fontFamily: "var(--font-display)", fontWeight: filterStatus === s ? 600 : 400,
              border: filterStatus === s ? `1px solid ${s === "All" ? "rgba(255,255,255,0.15)" : `${statusColor[s]}30`}` : "1px solid transparent",
              transition: "all 0.2s", textTransform: "capitalize",
            }}>
              {s === "All" ? "All Status" : s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(77,217,240,0.15)",
          borderRadius: 8, color: "var(--text-secondary)", fontSize: 12,
          padding: "8px 12px", fontFamily: "var(--font-body)", outline: "none", cursor: "pointer",
        }}>
          <option value="id"       style={{ background: "#060f1c" }}>Sort: ID</option>
          <option value="name"     style={{ background: "#060f1c" }}>Sort: Name</option>
          <option value="capacity" style={{ background: "#060f1c" }}>Sort: Capacity</option>
          <option value="price"    style={{ background: "#060f1c" }}>Sort: Price</option>
        </select>

        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
          Showing {filtered.length} of {chambers.length}
        </span>
      </div>

      {/* ── GRID VIEW ─────────────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {filtered.map((ch, i) => (
            <div key={ch.id} className="chamber-card" style={{
              padding: 20,
              animation: `fadeInUp 0.5s ease ${i * 0.05}s both`,
              position: "relative", overflow: "hidden",
            }}>
              {/* Zone accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${zoneColor[ch.zone]}, transparent)`,
              }} />

              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: zoneColor[ch.zone], letterSpacing: "0.12em", fontFamily: "var(--font-display)", marginBottom: 3 }}>
                    {ch.id} · ZONE {ch.zone}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{ch.name}</div>
                </div>
                <Badge status={ch.status} />
              </div>

              {/* Temp */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--accent-ice)", lineHeight: 1 }}>
                  {ch.temp.toFixed(1)}°
                </span>
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>C</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>
                  Range: {ch.minTemp}° → {ch.maxTemp}°
                </span>
              </div>

              {/* Capacity bar */}
              <div style={{ marginBottom: 14 }}>
                <CapacityBar used={ch.usedSlots} total={ch.totalSlots} />
              </div>

              {/* Info row */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 12, color: "var(--text-muted)" }}>
                <span>💧 {ch.humidity}% RH</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>₹{ch.pricePerSlot}/slot/day</span>
                <span>Rev: ₹{(ch.usedSlots * ch.pricePerSlot).toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setEditTarget(ch)}
                  className="btn-ghost"
                  style={{ flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 12, textAlign: "center" }}
                >
                  Edit Settings
                </button>
                <button
                  onClick={() => setDeleteTarget(ch)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(244,63,94,0.25)",
                    background: "rgba(244,63,94,0.06)", color: "#f43f5e", cursor: "pointer", fontSize: 12,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.15)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,63,94,0.06)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.25)"; }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABLE VIEW ────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(77,217,240,0.1)" }}>
                {["ID", "Name", "Zone", "Status", "Temp (°C)", "Capacity", "Price/slot", "Daily Rev.", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "14px 16px", textAlign: "left",
                    fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em",
                    fontFamily: "var(--font-display)", fontWeight: 500,
                    background: "rgba(3,11,20,0.4)",
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ch, i) => (
                <tr key={ch.id} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(77,217,240,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
                >
                  <td style={{ padding: "13px 16px", fontFamily: "var(--font-display)", fontSize: 12, color: zoneColor[ch.zone], letterSpacing: "0.06em" }}>{ch.id}</td>
                  <td style={{ padding: "13px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{ch.name}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: 11, color: zoneColor[ch.zone], background: `${zoneColor[ch.zone]}15`, border: `1px solid ${zoneColor[ch.zone]}25`, borderRadius: 6, padding: "3px 8px" }}>Zone {ch.zone}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}><Badge status={ch.status} /></td>
                  <td style={{ padding: "13px 16px", fontFamily: "var(--font-display)", color: "var(--accent-ice)", fontWeight: 600 }}>{ch.temp.toFixed(1)}</td>
                  <td style={{ padding: "13px 16px", minWidth: 160 }}>
                    <CapacityBar used={ch.usedSlots} total={ch.totalSlots} />
                  </td>
                  <td style={{ padding: "13px 16px", color: "#10b981", fontWeight: 600 }}>₹{ch.pricePerSlot}</td>
                  <td style={{ padding: "13px 16px", color: "#f59e0b" }}>₹{(ch.usedSlots * ch.pricePerSlot).toLocaleString()}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setEditTarget(ch)} className="btn-ghost" style={{ padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}>Edit</button>
                      <button onClick={() => setDeleteTarget(ch)} style={{
                        padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(244,63,94,0.25)",
                        background: "rgba(244,63,94,0.06)", color: "#f43f5e", cursor: "pointer", fontSize: 11,
                      }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
              No chambers match your filters.
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 && viewMode === "grid" && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>
          No chambers match your filters.
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {editTarget   && <EditChamberModal   chamber={editTarget}   onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
      {addOpen      && <AddChamberModal    onSave={handleAdd}     onClose={() => setAddOpen(false)} existingIds={chambers.map(c => c.id)} />}
      {deleteTarget && <DeleteConfirmModal chamber={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}