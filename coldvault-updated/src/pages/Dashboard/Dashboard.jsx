import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { ChamberGrid } from "./components/ChamberGrid.jsx";
import { Sparkline } from "./components/Sparkline.jsx";
import { Icons } from "../../components/icons/index.jsx";

import {
  getAllChambers,
  addChamber,
  deleteChamber,
  createBooking,
  deleteBooking,
  checkoutBooking,
  getCustomersByAdmin,
  createCustomer
} from "../../api/api.js";

// ── FIX 3: PasswordModal now accepts adminPassword prop ──────────────────────
// Each admin verifies using THEIR OWN password, not a shared hardcoded one.
function PasswordModal({ title, onConfirm, onClose, adminPassword }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  const verify = () => {
    if (pw === adminPassword) {
      setErr("");
      onConfirm();
    } else {
      setErr("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 400 }}>
      <div className="modal-content" style={{ maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 24 }}>🔒</div>
          <h3 style={{ margin: 0 }}>{title || "Admin Verification"}</h3>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 18 }}>
          Enter the admin password to proceed.
        </p>
        <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Admin Password</label>
        <div style={{ position: "relative", marginTop: 6, marginBottom: 16 }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            placeholder="Enter admin password"
            autoFocus
            style={{ paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
          >
            {show ? "🙈" : "👁"}
          </button>
        </div>
        {err && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#ef4444" }}>
            ⚠ {err}
          </div>
        )}
        <div className="modal-buttons">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={verify}>Verify & Proceed</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Chamber Modal ────────────────────────────────────────────────────────
function AddChamberModal({ onClose, onSubmit, adminPassword }) {
  const [step, setStep] = useState("password");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [totalSlots, setTotalSlots] = useState("100");
  const [pricePerSlotPerDay, setPricePerSlotPerDay] = useState("20");

  if (step === "password") {
    return (
      <PasswordModal
        title="Add Chamber — Verify Identity"
        onConfirm={() => setStep("form")}
        onClose={onClose}
        adminPassword={adminPassword}
      />
    );
  }

  const submit = () => {
    if (!id.trim() || !name.trim()) { alert("ID and name are required"); return; }
    onSubmit({
      id: id.trim(),
      name: name.trim(),
      totalSlots: Math.max(1, Number(totalSlots) || 1),
      pricePerSlotPerDay: Math.max(1, Number(pricePerSlotPerDay) || 1),
      bookings: [],
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create New Chamber</h3>
        <label>ID</label>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. E-01" />
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Potato Chamber" />
        <label>Total slots</label>
        <input type="number" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} min="1" />
        <label>Price (₹) per slot per day</label>
        <input type="number" value={pricePerSlotPerDay} onChange={(e) => setPricePerSlotPerDay(e.target.value)} min="1" />
        <div className="modal-buttons">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Create Chamber</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Chamber Modal ─────────────────────────────────────────────────────
function DeleteChamberModal({ chamberId, onConfirm, onClose, adminPassword }) {
  return (
    <PasswordModal
      title={`Delete Chamber ${chamberId} — Verify Identity`}
      onConfirm={onConfirm}
      onClose={onClose}
      adminPassword={adminPassword}
    />
  );
}

// ── Date Helpers ─────────────────────────────────────────────────────────────
function formatISODate(dateObj) {
  const d = new Date(dateObj);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateStr, daysCount) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + daysCount);
  return formatISODate(d);
}

function diffDaysInclusive(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;
  const ms = e.getTime() - s.getTime();
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days + 1);
}

// ── FIX 2: Checkout Modal — early/late pickup bill recalculation ─────────────
function CheckoutModal({ booking, onClose, onCheckout, adminPassword }) {
  const [step, setStep] = useState("password");
  const [pickupDate, setPickupDate] = useState(formatISODate(new Date()));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (step === "password") {
    return (
      <PasswordModal
        title="Checkout — Verify Identity"
        onConfirm={() => setStep("form")}
        onClose={onClose}
        adminPassword={adminPassword}
      />
    );
  }

  const previewBill = () => {
    if (!pickupDate) return;
    const startDate = new Date(booking.startDate);
    const pickup = new Date(pickupDate);
    const bookedEnd = new Date(booking.endDate);

    const actualDays = Math.max(1, Math.round((pickup - startDate) / (1000 * 60 * 60 * 24)) + 1);
    const extraDays = Math.round((pickup - bookedEnd) / (1000 * 60 * 60 * 24));
    const adjustedTotal = booking.slots * actualDays * booking.rentRate;
    const refund = booking.totalPrice - adjustedTotal;

    setResult({
      actualDays,
      extraDays,
      adjustedTotal,
      refund,
      status: extraDays > 0 ? "LATE" : extraDays < 0 ? "EARLY" : "ON_TIME"
    });
  };

  const confirmCheckout = async () => {
    setLoading(true);
    try {
      await onCheckout(booking.id, pickupDate);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const statusColor = result?.status === "LATE" ? "#ef4444" : result?.status === "EARLY" ? "#10b981" : "#2563eb";
  const statusLabel = result?.status === "LATE"
    ? `⚠ LATE by ${result.extraDays} day(s) — Extra charge applies`
    : result?.status === "EARLY"
      ? `✓ EARLY by ${Math.abs(result.extraDays)} day(s) — Slots freed immediately`
      : "✓ ON TIME";

  return (
    <div className="modal-overlay" style={{ zIndex: 400 }}>
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <h3>📦 Checkout — {booking.customer} ({booking.farmerId})</h3>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Booked: {booking.startDate} → {booking.endDate} ({booking.days} days, {booking.slots} slots @ ₹{booking.rentRate}/slot/day)
          <br />Original Bill: <strong>₹{Number(booking.totalPrice).toLocaleString()}</strong>
        </div>

        <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
          Actual Pickup Date <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => { setPickupDate(e.target.value); setResult(null); }}
            style={{ flex: 1 }}
          />
          <button className="btn-ghost" onClick={previewBill}>Preview Bill</button>
        </div>

        {result && (
          <div style={{ background: "rgba(37,99,235,0.06)", border: `1px solid ${statusColor}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: statusColor, marginBottom: 10 }}>{statusLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
              <div><span style={{ color: "var(--text-muted)" }}>Actual Days Used:</span> <strong>{result.actualDays}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Slots:</span> <strong>{booking.slots}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Rate:</span> <strong>₹{booking.rentRate}/slot/day</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Original Bill:</span> <strong>₹{Number(booking.totalPrice).toLocaleString()}</strong></div>
            </div>
            <div style={{ marginTop: 12, padding: "10px 14px", background: result.refund > 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 8, border: `1px solid ${result.refund > 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}` }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>ADJUSTED TOTAL BILL</div>
              <div style={{ fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 800, color: "#10b981" }}>
                ₹{Number(result.adjustedTotal).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: result.refund >= 0 ? "#10b981" : "#ef4444", marginTop: 4 }}>
                {result.refund > 0
                  ? `Refund to farmer: ₹${Number(result.refund).toLocaleString()}`
                  : result.refund < 0
                    ? `Extra charge from farmer: ₹${Number(Math.abs(result.refund)).toLocaleString()}`
                    : "No change"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {booking.slots} slots × {result.actualDays} days × ₹{booking.rentRate}
              </div>
            </div>
          </div>
        )}

        <div className="modal-buttons">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={confirmCheckout}
            disabled={!pickupDate || loading}
          >
            {loading ? "Processing…" : "Confirm Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ chamber, onClose, onCreateBooking, onDeleteBooking, onCheckoutBooking, adminPassword }) {
  const [step, setStep] = useState("view");
  const [customer, setCustomer] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerAddress, setFarmerAddress] = useState("");
  const [slots, setSlots] = useState("1");
  const [days, setDays] = useState("7");
  const today = formatISODate(new Date());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 6));
  const [rentRate, setRentRate] = useState(String(chamber.pricePerSlotPerDay || 0));
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [checkoutBookingData, setCheckoutBookingData] = useState(null);

  const usedSlots = chamber.bookings?.reduce((sum, b) => sum + b.slots, 0) || 0;
  const availableSlots = Math.max(0, (chamber.totalSlots || 0) - usedSlots);
  const slotsNum = Math.min(availableSlots || 0, Math.max(1, Number(slots) || 1));
  const daysNum = Math.max(1, Number(days) || 1);
  const rentRateNum = Math.max(0, Number(rentRate) || 0);
  const price = slotsNum * daysNum * rentRateNum;

  const existingFarmerIds = chamber.bookings?.map((b) => b.farmerId) || [];

  const submitBooking = () => {
    if (!customer.trim()) { alert("Customer name is required"); return; }
    if (!farmerId.trim()) { alert("Farmer ID is required"); return; }
    if (existingFarmerIds.includes(farmerId.trim())) {
      alert(`Farmer ID "${farmerId.trim()}" already has a booking in this chamber.`);
      return;
    }
    if (!farmerPhone.trim()) { alert("Farmer phone number is required"); return; }
    if (!/^\d{10}$/.test(farmerPhone.trim())) { alert("Please enter a valid 10-digit phone number"); return; }
    if (!farmerAddress.trim()) { alert("Farmer address is required"); return; }
    if (availableSlots <= 0) { alert("No slots available in this chamber"); return; }
    onCreateBooking(chamber.id, customer.trim(), farmerId.trim(), slotsNum, daysNum, rentRateNum, price, startDate, endDate, farmerPhone.trim(), farmerAddress.trim());
    setCustomer(""); setFarmerId(""); setFarmerPhone(""); setFarmerAddress(""); setSlots("1"); setDays("7");
    const resetStart = formatISODate(new Date());
    setStartDate(resetStart);
    setEndDate(addDays(resetStart, 6));
    setRentRate(String(chamber.pricePerSlotPerDay || 0));
    setStep("view");
  };

  const handleDeleteClick = (bookingId) => {
    setDeleteBookingId(bookingId);
    setStep("deletePassword");
  };

  const handleDeleteConfirm = () => {
    onDeleteBooking(chamber.id, deleteBookingId);
    setDeleteBookingId(null);
    setStep("view");
  };

  const handleCheckoutClick = (booking) => {
    setCheckoutBookingData(booking);
    setStep("checkout");
  };

  if (step === "password") {
    return (
      <PasswordModal
        title="Add Booking — Verify Identity"
        onConfirm={() => setStep("form")}
        onClose={() => setStep("view")}
        adminPassword={adminPassword}
      />
    );
  }

  if (step === "deletePassword") {
    return (
      <PasswordModal
        title="Delete Booking — Verify Identity"
        onConfirm={handleDeleteConfirm}
        onClose={() => { setDeleteBookingId(null); setStep("view"); }}
        adminPassword={adminPassword}
      />
    );
  }

  if (step === "checkout" && checkoutBookingData) {
    return (
      <CheckoutModal
        booking={checkoutBookingData}
        onClose={() => { setCheckoutBookingData(null); setStep("view"); }}
        onCheckout={onCheckoutBooking}
        adminPassword={adminPassword}
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Book slots: {chamber.id} — {chamber.name}</h3>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div style={{ margin: "10px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><strong>Total slots:</strong> {chamber.totalSlots}</div>
          <div><strong>Available slots:</strong> {availableSlots}</div>
          <div><strong>Default rate:</strong> ₹{Number(chamber.pricePerSlotPerDay || 0).toLocaleString()} per slot per day</div>
          <div><strong>Booked slots:</strong> {usedSlots}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h4>Existing bookings</h4>
          {chamber.bookings?.length ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Farmer ID", "Customer", "Phone", "Address", "Slots", "Days", "From", "To", "Rate (₹)", "Total (₹)", "Bill", "Checkout", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", borderBottom: "1px solid var(--border-subtle)", padding: "6px", fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chamber.bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ padding: "6px", fontSize: 13, color: "var(--accent-ice)", fontWeight: 600 }}>{b.farmerId || "-"}</td>
                    <td style={{ padding: "6px" }}>{b.customer}</td>
                    <td style={{ padding: "6px", fontSize: 12 }}>{b.farmerPhone || "-"}</td>
                    <td style={{ padding: "6px", fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.farmerAddress || "-"}</td>
                    <td style={{ padding: "6px", textAlign: "right" }}>{b.slots}</td>
                    <td style={{ padding: "6px", textAlign: "right" }}>{b.days}</td>
                    <td style={{ padding: "6px", textAlign: "right" }}>{b.startDate || "-"}</td>
                    <td style={{ padding: "6px", textAlign: "right" }}>{b.endDate || "-"}</td>
                    <td style={{ padding: "6px", textAlign: "right" }}>₹{Number(b.rentRate || 0).toLocaleString()}</td>
                    <td style={{ padding: "6px", textAlign: "right", fontWeight: 600, color: "#10b981" }}>₹{Number(b.totalPrice).toLocaleString()}</td>
                    <td style={{ padding: "6px", fontSize: 12, color: "var(--text-muted)" }}>
                      {b.slots} × {b.days}d × ₹{b.rentRate || 0} = ₹{Number(b.totalPrice).toLocaleString()}
                    </td>
                    <td style={{ padding: "6px" }}>
                      <button
                        onClick={() => handleCheckoutClick(b)}
                        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#10b981", fontSize: 12, whiteSpace: "nowrap" }}
                      >
                        Checkout
                      </button>
                    </td>
                    <td style={{ padding: "6px" }}>
                      <button
                        onClick={() => handleDeleteClick(b.id)}
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#ef4444", fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No bookings yet.</p>
          )}
        </div>

        {step === "view" && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn-ghost" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={() => setStep("password")}>+ New Booking</button>
          </div>
        )}

        {step === "form" && (
          <div style={{ marginTop: 20, borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
            <h4 style={{ marginBottom: 12 }}>Create new booking</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Farmer ID <span style={{ color: "#ef4444" }}>*</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>(must be unique)</span>
                </label>
                <input
                  placeholder="e.g. F-2001"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  style={{ borderColor: existingFarmerIds.includes(farmerId.trim()) && farmerId.trim() ? "#ef4444" : undefined }}
                />
                {existingFarmerIds.includes(farmerId.trim()) && farmerId.trim() && (
                  <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ This Farmer ID already has a booking here</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Customer Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input placeholder="Customer name" value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Farmer Phone <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  style={{ borderColor: farmerPhone.length > 0 && farmerPhone.length !== 10 ? "#ef4444" : undefined }}
                />
                {farmerPhone.length > 0 && farmerPhone.length !== 10 && (
                  <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ Enter a valid 10-digit number</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Farmer Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  placeholder="Village / Town, District, State"
                  value={farmerAddress}
                  onChange={(e) => setFarmerAddress(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Number of Slots</label>
                <input type="number" placeholder="Slots" value={slots} onChange={(e) => setSlots(e.target.value)} min="1" max={availableSlots || 1} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Duration (Days)</label>
                <input
                  type="number"
                  placeholder="Days"
                  value={days}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") { setDays(""); return; }
                    const parsed = parseInt(raw, 10);
                    if (Number.isNaN(parsed)) return;
                    const newDays = Math.min(365, Math.max(1, parsed));
                    setDays(String(newDays));
                    if (startDate) setEndDate(addDays(startDate, newDays - 1));
                  }}
                  min="1" max="365"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartDate(value);
                    const d = Math.max(1, Number(days) || 1);
                    if (value) setEndDate(addDays(value, d - 1));
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEndDate(value);
                    if (startDate && value) {
                      const newDays = diffDaysInclusive(startDate, value);
                      setDays(String(newDays));
                    }
                  }}
                  min={startDate}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                Rent Rate (₹ per slot per day)
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>Default: ₹{chamber.pricePerSlotPerDay}/slot/day</span>
              </label>
              <input
                type="number"
                placeholder="Rate per slot per day"
                value={rentRate}
                onChange={(e) => setRentRate(e.target.value)}
                min="1"
                style={{ maxWidth: 220 }}
              />
            </div>

            <div style={{ marginTop: 16, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Bill Computation</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto", gap: 10, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>SLOTS</div>
                  <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}>{slotsNum}</div>
                </div>
                <div style={{ fontSize: 20, color: "var(--text-muted)" }}>×</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>DAYS</div>
                  <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-primary)" }}>{daysNum}</div>
                </div>
                <div style={{ fontSize: 20, color: "var(--text-muted)" }}>×</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>RATE (₹/slot/day)</div>
                  <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent-ice)" }}>₹{rentRateNum}</div>
                </div>
                <div style={{ textAlign: "center", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>TOTAL BILL</div>
                  <div style={{ fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 800, color: "#10b981" }}>₹{price.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {slotsNum} × {daysNum} × ₹{rentRateNum}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setStep("view")}>Cancel</button>
              <button
                className="btn-primary"
                onClick={submitBooking}
                disabled={existingFarmerIds.includes(farmerId.trim()) && farmerId.trim()}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard({ admin, onBack }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [chambers, setChambers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!admin?.id) return;
    getAllChambers(admin.id)
      .then(res => {
        setChambers(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching chambers:", err);
        setFetchError("Backend connect nahi hua.");
        setLoading(false);
      });
  }, [admin]);

  useEffect(() => {
    if (!admin?.id) return;
    getCustomersByAdmin(admin.id)
      .then(res => setCustomers(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Customers fetch error:", err));
  }, [admin]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChamberId, setSelectedChamberId] = useState(null);
  const [deleteChamberId, setDeleteChamberId] = useState(null);

  const mainLeft = collapsed ? 68 : 240;

  const selectedChamber = useMemo(() => chambers.find((c) => c.id === selectedChamberId) || null, [chambers, selectedChamberId]);
  const totalSlots = useMemo(() => chambers.reduce((sum, ch) => sum + (ch.totalSlots || 0), 0), [chambers]);
  const bookedSlots = useMemo(() => chambers.reduce((sum, ch) => sum + ((ch.bookings || []).reduce((s, b) => s + b.slots, 0)), 0), [chambers]);
  const availableSlots = useMemo(() => Math.max(0, totalSlots - bookedSlots), [totalSlots, bookedSlots]);
  const avgCap = useMemo(() => (totalSlots ? Math.round((bookedSlots / totalSlots) * 100) : 0), [totalSlots, bookedSlots]);
  const totalRevenue = useMemo(() => chambers.reduce((sum, ch) => sum + ((ch.bookings || []).reduce((s, b) => s + (b.totalPrice || 0), 0)), 0), [chambers]);

  const metrics = [
    { label: "Chambers", value: chambers.length.toString(), unit: "", sub: "storage units", icon: Icons.warehouse, color: "#2563eb" },
    { label: "Slots Available", value: availableSlots.toLocaleString(), unit: "", sub: `of ${totalSlots.toLocaleString()} total`, icon: Icons.package, color: "#10b981" },
    { label: "Booked Slots", value: bookedSlots.toLocaleString(), unit: "", sub: `avg usage ${avgCap}%`, icon: Icons.users, color: "#7c3aed" },
    { label: "Estimated Billing", value: totalRevenue.toLocaleString(), unit: " ₹", sub: "from bookings", icon: Icons.chart, color: "#f59e0b" },
  ];

  const sparkData = [
    [84, 85, 83, 86, 87, 84, 88, 85, 83, 86, 87],
    [70, 71, 69, 68, 72, 70, 74, 69, 68, 71, 70],
    [bookedSlots, bookedSlots + 2, bookedSlots + 6, bookedSlots + 8, bookedSlots + 10, bookedSlots + 11, bookedSlots + 13, bookedSlots + 13, bookedSlots + 14, bookedSlots + 15, bookedSlots + 16],
    [totalRevenue, totalRevenue + 500, totalRevenue + 900, totalRevenue + 800, totalRevenue + 1200, totalRevenue + 1400, totalRevenue + 1700, totalRevenue + 1650, totalRevenue + 1800, totalRevenue + 2100, totalRevenue + 2400],
  ];

  const reportRows = useMemo(
    () =>
      chambers.flatMap((c) =>
        (c.bookings || []).map((b) => ({
          farmerId: b.farmerId || "-",
          customer: b.customer || "-",
          chamberId: c.id,
          chamberName: c.name,
          slots: b.slots,
          days: b.days,
          startDate: b.startDate || "",
          endDate: b.endDate || "",
          rentRate: b.rentRate || c.pricePerSlotPerDay,
          total: b.totalPrice,
          createdAt: b.createdAt || "",
        })),
      ),
    [chambers],
  );

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--accent-ice)", fontFamily: "var(--font-display)", fontSize: 18 }}>
        Loading chambers...
      </div>
    );
  }

  const downloadReport = () => {
    const csvHeader = ["Farmer ID", "Customer", "Chamber ID", "Chamber", "Slots", "Days", "Start Date", "End Date", "RentRate(₹/slot/day)", "Total(₹)", "Created At"];
    const rows = reportRows.map((row) => [row.farmerId, row.customer, row.chamberId, row.chamberName, row.slots, row.days, row.startDate, row.endDate, row.rentRate, row.total, row.createdAt]);
    const csvContent = [csvHeader, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `coldvault-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleAddChamber = async (newChamber) => {
    try {
      const res = await addChamber({ ...newChamber, adminId: admin.id });
      setChambers(prev => [...prev, res.data]);
      setShowAddModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Chamber save nahi hua");
    }
  };

  const handleDeleteChamber = async (id) => {
    try {
      await deleteChamber(id);
      const res = await getAllChambers(admin.id);
      setChambers(res.data);
    } catch (err) {
      console.error("Delete chamber error:", err);
      alert("Chamber delete nahi hua.");
    } finally {
      setDeleteChamberId(null);
    }
  };

  const handleSelectChamber = (id) => setSelectedChamberId(id);
  const handleCloseChamberDetail = () => setSelectedChamberId(null);

  // FIX 4: farmerPhone and farmerAddress now passed to createCustomer so DB stores them
  const handleCreateBooking = async (chamberId, customer, farmerId, slots, days, rentRate, totalPrice, startDate, endDate, farmerPhone = "", farmerAddress = "") => {
    try {
      const exists = customers.find(c => c.name.toLowerCase() === customer.toLowerCase());
      if (!exists) {
        const custRes = await createCustomer({
          name: customer,
          adminId: admin.id,
          phone: farmerPhone,
          address: farmerAddress
        });
        if (custRes.status === 201) {
          setCustomers(prev => [...prev, custRes.data]);
        }
      }
      const res = await createBooking({
        chamber: { id: chamberId },
        customer,
        farmerId,
        farmerPhone,
        farmerAddress,
        slots,
        days,
        rentRate,
        totalPrice,
        startDate,
        endDate,
        createdAt: new Date().toISOString()
      });
      if (!(res && (res.status === 200 || res.status === 201))) {
        throw new Error("Booking API failed");
      }
      const updated = await getAllChambers(admin.id);
      setChambers(updated.data);
    } catch (err) {
      alert("Booking save nahi hui: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteBooking = async (chamberId, bookingId) => {
    try {
      const delRes = await deleteBooking(bookingId);
      if (!(delRes && delRes.status && delRes.status.toString().startsWith("2"))) {
        throw new Error("Delete booking API failed");
      }
      const res = await getAllChambers(admin.id);
      setChambers(res.data);
    } catch (err) {
      console.error("Delete booking error:", err);
      alert("Booking delete nahi hui.");
    }
  };

  // FIX 2: Handle early/late checkout
  const handleCheckoutBooking = async (bookingId, actualPickupDate) => {
    try {
      await checkoutBooking(bookingId, actualPickupDate);
      const updated = await getAllChambers(admin.id);
      setChambers(updated.data);
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  if (activeNav === "reports") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Topbar collapsed={collapsed} onBack={onBack} />
        <main style={{ marginLeft: mainLeft, paddingTop: 68, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)", minHeight: "100vh" }}>
          <div style={{ padding: "32px 36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Reports</h1>
                <p style={{ fontSize: 18, color: "var(--text-muted)", marginTop: 6 }}>Download bookings report by customer and billing</p>
              </div>
              <button className="btn-primary" onClick={downloadReport} style={{ padding: "10px 20px", borderRadius: 10 }}>Download CSV</button>
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Farmer ID", "Customer", "Chamber", "Slots", "Days", "Rate (₹)", "Total (₹)", "Created At"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid var(--border-subtle)", fontSize: 14 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row, i) => (
                    <tr key={`${row.customer}-${i}`}>
                      <td style={{ padding: 8, color: "var(--accent-ice)", fontWeight: 600 }}>{row.farmerId}</td>
                      <td style={{ padding: 8 }}>{row.customer}</td>
                      <td style={{ padding: 8 }}>{row.chamberName}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{row.slots}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{row.days}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>₹{row.rentRate}</td>
                      <td style={{ padding: 8, textAlign: "right", fontWeight: 600, color: "#10b981" }}>₹{Number(row.total).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[...new Set(reportRows.map((r) => r.customer))].map((cust) => (
                  <button key={cust} className="btn-primary" style={{ padding: "8px 14px", borderRadius: 10 }} onClick={() => {
                    import("jspdf").then(({ default: jsPDF }) => {
                      import("jspdf-autotable").then(() => {
                        const doc = new jsPDF();
                        doc.setFontSize(16);
                        doc.text(`ColdVault - Bill for ${cust}`, 14, 18);
                        const rows = reportRows.filter((r) => r.customer === cust).map((r) => [r.farmerId, r.chamberName, r.slots, r.days, `₹${r.rentRate}`, `₹${r.total}`, r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"]);
                        doc.autoTable({ startY: 24, head: [["Farmer ID", "Chamber", "Slots", "Days", "Rate", "Total", "Date"]], body: rows });
                        const total = rows.reduce((s, r) => s + Number(String(r[5]).replace("₹", "") || 0), 0);
                        const finalY = doc.lastAutoTable.finalY || 24;
                        doc.setFontSize(12);
                        doc.text(`Grand Total: ₹${total.toLocaleString()}`, 14, finalY + 10);
                        doc.save(`ColdVault-Bill-${cust}.pdf`);
                      });
                    });
                  }}>
                    Download Bill (PDF) — {cust}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (activeNav === "alerts") {
    const now = Date.now();
    const alerts = chambers.flatMap((c) =>
      (c.bookings || []).map((b) => {
        const end = b.endDate ? new Date(b.endDate).getTime() : new Date(b.createdAt || new Date()).getTime() + (b.days || 0) * 864e5;
        const remainingDays = Math.max(0, Math.ceil((end - now) / 864e5));
        return { chamberId: c.id, chamberName: c.name, customer: b.customer, farmerId: b.farmerId, remainingDays };
      }),
    ).sort((a, b) => a.remainingDays - b.remainingDays);

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Topbar collapsed={collapsed} onBack={onBack} />
        <main style={{ marginLeft: mainLeft, paddingTop: 68, transition: "margin-left 0.3s", minHeight: "100vh" }}>
          <div style={{ padding: "32px 36px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Alerts</h1>
            <div className="glass-card" style={{ padding: 16 }}>
              {alerts.length === 0 ? (
                <p style={{ fontSize: 18, color: "var(--text-muted)" }}>No active alerts</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {alerts.map((a, i) => {
                    const color = a.remainingDays <= 1 ? "#ef4444" : a.remainingDays === 2 ? "#f59e0b" : "#2563eb";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "12px 14px", background: "var(--surface-1)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                          <div style={{ fontSize: 18, color: "var(--text-primary)" }}>
                            <span style={{ color: "var(--accent-ice)", fontWeight: 600 }}>{a.farmerId}</span> · {a.customer} in {a.chamberName} ({a.chamberId})
                          </div>
                        </div>
                        <div style={{ fontSize: 16, color }}>{a.remainingDays} day{a.remainingDays !== 1 ? "s" : ""} remaining</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (activeNav === "users") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Topbar collapsed={collapsed} onBack={onBack} />
        <main style={{ marginLeft: mainLeft, paddingTop: 68, minHeight: "100vh" }}>
          <div style={{ padding: "32px 36px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Customers</h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 24 }}>
              {customers.length} customers — auto-added when a booking is created
            </p>
            <div className="glass-card" style={{ padding: 20 }}>
              {customers.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No customers yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["#", "Customer Name", "Phone", "Address", "Bookings"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-subtle)", fontSize: 13, color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => {
                      const bookingCount = chambers.flatMap(ch => ch.bookings || []).filter(b => b.customer === c.name).length;
                      return (
                        <tr key={c.id}>
                          <td style={{ padding: 10, color: "var(--text-muted)", fontSize: 13 }}>{i + 1}</td>
                          <td style={{ padding: 10, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</td>
                          <td style={{ padding: 10, color: "var(--text-muted)" }}>{c.phone || "—"}</td>
                          <td style={{ padding: 10, color: "var(--text-muted)" }}>{c.address || "—"}</td>
                          <td style={{ padding: 10, color: "#10b981", fontWeight: 600 }}>{bookingCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (activeNav === "chambers") {
    const editChamber = (id, updates) => {
      setChambers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    };
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Topbar collapsed={collapsed} onBack={onBack} />
        <main style={{ marginLeft: mainLeft, paddingTop: 68, transition: "margin-left 0.3s", minHeight: "100vh" }}>
          <div style={{ padding: "32px 36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)" }}>Manage Chambers</h1>
                <p style={{ fontSize: 18, color: "var(--text-muted)" }}>Edit total slots, price per slot/day, and slot size</p>
              </div>
              <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: 10 }} onClick={() => setShowAddModal(true)}>
                + Add Chamber
              </button>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["ID", "Name", "Total Slots", "Slot Size", "₹/slot/day", "Booked", "Actions"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-subtle)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chambers.map((c) => {
                    const booked = (c.bookings || []).reduce((s, b) => s + b.slots, 0);
                    return (
                      <tr key={c.id}>
                        <td style={{ padding: 10 }}>{c.id}</td>
                        <td style={{ padding: 10 }}>{c.name}</td>
                        <td style={{ padding: 10 }}>
                          <input type="number" min="1" value={c.totalSlots} onChange={(e) => editChamber(c.id, { totalSlots: Math.max(1, Number(e.target.value) || 1) })} />
                        </td>
                        <td style={{ padding: 10 }}>
                          <input type="number" min="1" value={c.slotSize || 1} onChange={(e) => editChamber(c.id, { slotSize: Math.max(1, Number(e.target.value) || 1) })} />
                        </td>
                        <td style={{ padding: 10 }}>
                          <input type="number" min="1" value={c.pricePerSlotPerDay} onChange={(e) => editChamber(c.id, { pricePerSlotPerDay: Math.max(1, Number(e.target.value) || 1) })} />
                        </td>
                        <td style={{ padding: 10 }}>{booked}</td>
                        <td style={{ padding: 10, display: "flex", gap: 8 }}>
                          <button className="btn-ghost" onClick={() => setSelectedChamberId(c.id)}>Open Booking</button>
                          <button
                            onClick={() => setDeleteChamberId(c.id)}
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#ef4444", fontSize: 13 }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        {showAddModal && <AddChamberModal onClose={() => setShowAddModal(false)} onSubmit={handleAddChamber} adminPassword={admin?.password} />}
        {deleteChamberId && (
          <DeleteChamberModal
            chamberId={deleteChamberId}
            onConfirm={() => handleDeleteChamber(deleteChamberId)}
            onClose={() => setDeleteChamberId(null)}
            adminPassword={admin?.password}
          />
        )}
        {selectedChamber && (
          <BookingModal
            chamber={selectedChamber}
            onClose={handleCloseChamberDetail}
            onCreateBooking={handleCreateBooking}
            onDeleteBooking={handleDeleteBooking}
            onCheckoutBooking={handleCheckoutBooking}
            adminPassword={admin?.password}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
      <Topbar collapsed={collapsed} onBack={onBack} />
      <main style={{ marginLeft: mainLeft, paddingTop: 68, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)", minHeight: "100vh" }}>
        <div style={{ padding: "32px 36px" }}>
          {fetchError && (
            <div style={{ marginBottom: 16, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#b45309", borderRadius: 10, padding: "10px 14px", fontSize: 14 }}>
              {fetchError}
            </div>
          )}
          <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              Storage & Billing Dashboard
            </h1>
            <p style={{ fontSize: 19, color: "var(--text-muted)", marginTop: 6 }}>
              Manage bookings by slots · Pricing by days · Auto billing
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {metrics.map((m, i) => (
              <div key={m.label} style={{ animation: `fadeInUp 0.6s ease ${0.1 * i}s both` }}>
                <div className="metric-card" style={{ background: "var(--surface-1)", padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "var(--font-display)" }}>{m.label.toUpperCase()}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                        <span style={{ fontSize: 35, fontFamily: "var(--font-display)", fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</span>
                        {m.unit && <span style={{ fontSize: 19, color: m.color, opacity: 0.7 }}>{m.unit}</span>}
                      </div>
                      {m.sub && <div style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 6 }}>{m.sub}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}15`, border: `1px solid ${m.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: m.color }}>
                        <m.icon />
                      </div>
                      <Sparkline data={sparkData[i]} color={m.color} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ animation: "fadeInUp 0.7s ease 0.5s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>Chambers</h2>
                <p style={{ fontSize: 17, color: "var(--text-muted)", marginTop: 2 }}>{chambers.length} chambers · pricing by slot/day</p>
              </div>
            </div>
            <ChamberGrid chambers={chambers} onSelectChamber={handleSelectChamber} />
          </div>
        </div>
      </main>

      {showAddModal && <AddChamberModal onClose={() => setShowAddModal(false)} onSubmit={handleAddChamber} adminPassword={admin?.password} />}
      {deleteChamberId && (
        <DeleteChamberModal
          chamberId={deleteChamberId}
          onConfirm={() => handleDeleteChamber(deleteChamberId)}
          onClose={() => setDeleteChamberId(null)}
          adminPassword={admin?.password}
        />
      )}
      {selectedChamber && (
        <BookingModal
          chamber={selectedChamber}
          onClose={handleCloseChamberDetail}
          onCreateBooking={handleCreateBooking}
          onDeleteBooking={handleDeleteBooking}
          onCheckoutBooking={handleCheckoutBooking}
          adminPassword={admin?.password}
        />
      )}
    </div>
  );
}