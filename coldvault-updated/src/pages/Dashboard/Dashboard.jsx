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
  createCustomer,
  getAllBookingsForAdmin,
} from "../../api/api.js";

// ── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({ title, onConfirm, onClose, adminPassword }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  const verify = () => {
    if (pw === adminPassword) { setErr(""); onConfirm(); }
    else setErr("Incorrect password. Please try again.");
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

// ── PROFESSIONAL BILL PDF GENERATOR ─────────────────────────────────────────
function generateProfessionalBill(customerName, rows, adminName) {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(() => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      // ── Header background ──
      doc.setFillColor(10, 20, 50);
      doc.rect(0, 0, pageW, 40, "F");

      // ── Logo area ──
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(12, 8, 24, 24, 4, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("❄", 24, 22, { align: "center" });

      // ── Company name ──
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("COLDVAULT", 42, 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 196, 255);
      doc.text("Cold Storage Management System", 42, 25);

      // ── INVOICE title ──
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(77, 217, 240);
      doc.text("INVOICE", pageW - 14, 20, { align: "right" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 220, 255);
      const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
      doc.text(`Invoice No: ${invoiceNo}`, pageW - 14, 28, { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, pageW - 14, 34, { align: "right" });

      // ── Divider ──
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(12, 44, pageW - 12, 44);

      // ── Bill To ──
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 120, 160);
      doc.text("BILL TO", 12, 52);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(customerName, 12, 60);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 100, 140);

      // ── From ──
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 120, 160);
      doc.text("FROM", pageW - 12, 52, { align: "right" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(adminName || "ColdVault Storage", pageW - 12, 60, { align: "right" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 100, 140);

      // ── Table ──
      const tableRows = rows.map((r, idx) => [
        idx + 1,
        r.chamberName || r.chamberId,
        r.farmerId || "-",
        r.slots,
        r.days,
        `Rs.${Number(r.rentRate).toLocaleString("en-IN")}`,
        r.startDate || "-",
        r.endDate || "-",
        r.checkoutStatus === "CHECKED_OUT" ? "Completed" : "Active",
        `Rs.${Number(r.total).toLocaleString("en-IN")}`
      ]);

      doc.autoTable({
        startY: 68,
        head: [["#", "Chamber", "Farmer ID", "Slots", "Days", "Rate/Slot/Day", "Start", "End", "Status", "Amount (₹)"]],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [10, 20, 50],
          textColor: [77, 217, 240],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 40, 60],
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 28, halign: "left" },
          2: { cellWidth: 22 },
          9: { textColor: [16, 185, 129], fontStyle: "bold" },
        },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        margin: { left: 12, right: 12 },
      });

      const finalY = doc.lastAutoTable.finalY + 6;

      // ── Grand Total ──
      const grandTotal = rows.reduce((s, r) => s + Number(r.total || 0), 0);
      doc.setFillColor(10, 20, 50);
      doc.rect(pageW - 80, finalY, 68, 18, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 196, 255);
      doc.text("GRAND TOTAL", pageW - 46, finalY + 7, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(77, 217, 240);
      doc.text(`Grand Total: Rs.${grandTotal.toLocaleString("en-IN")}`, pageW - 46, finalY + 15, { align: "center" });

      // ── Footer ──
      doc.setFillColor(240, 245, 255);
      doc.rect(0, pageH - 22, pageW, 22, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 120, 160);
      doc.text("Thank you for using ColdVault. For queries contact your storage manager.", pageW / 2, pageH - 12, { align: "center" });
      doc.text(`Generated by ColdVault on ${new Date().toLocaleString("en-IN")}`, pageW / 2, pageH - 6, { align: "center" });

      doc.save(`ColdVault-Invoice-${customerName.replace(/\s+/g, "_")}-${invoiceNo}.pdf`);
    });
  });
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
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
      actualDays, extraDays, adjustedTotal, refund,
      status: extraDays > 0 ? "LATE" : extraDays < 0 ? "EARLY" : "ON_TIME"
    });
  };

  const confirmCheckout = async () => {
    setLoading(true);
    try { await onCheckout(booking.id, pickupDate); onClose(); }
    finally { setLoading(false); }
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
          <input type="date" value={pickupDate} onChange={(e) => { setPickupDate(e.target.value); setResult(null); }} style={{ flex: 1 }} />
          <button className="btn-ghost" onClick={previewBill}>Preview Bill</button>
        </div>
        {result && (
          <div style={{ background: "rgba(37,99,235,0.06)", border: `1px solid ${statusColor}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: statusColor, marginBottom: 10 }}>{statusLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
              <div><span style={{ color: "var(--text-muted)" }}>Actual Days:</span> <strong>{result.actualDays}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Slots:</span> <strong>{booking.slots}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Rate:</span> <strong>₹{booking.rentRate}/slot/day</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Original Bill:</span> <strong>₹{Number(booking.totalPrice).toLocaleString()}</strong></div>
            </div>
            <div style={{ marginTop: 12, padding: "10px 14px", background: result.refund > 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 8, border: `1px solid ${result.refund > 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}` }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>ADJUSTED TOTAL BILL</div>
              <div style={{ fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 800, color: "#10b981" }}>₹{Number(result.adjustedTotal).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: result.refund >= 0 ? "#10b981" : "#ef4444", marginTop: 4 }}>
                {result.refund > 0 ? `Refund to farmer: ₹${Number(result.refund).toLocaleString()}` : result.refund < 0 ? `Extra charge: ₹${Number(Math.abs(result.refund)).toLocaleString()}` : "No change"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{booking.slots} slots × {result.actualDays} days × ₹{booking.rentRate}</div>
            </div>
          </div>
        )}
        <div className="modal-buttons">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={confirmCheckout} disabled={!pickupDate || loading}>
            {loading ? "Processing…" : "Confirm Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ chamber, onClose, onCreateBooking, onDeleteBooking, onCheckoutBooking, adminPassword, adminName }) {
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

  // Only show ACTIVE bookings (not checked out) in this modal
  const activeBookings = (chamber.bookings || []).filter(b => !b.checkoutStatus || b.checkoutStatus !== "CHECKED_OUT");
  const usedSlots = activeBookings.reduce((sum, b) => sum + b.slots, 0);
  const availableSlots = Math.max(0, (chamber.totalSlots || 0) - usedSlots);
  const slotsNum = Math.min(availableSlots || 0, Math.max(1, Number(slots) || 1));
  const daysNum = Math.max(1, Number(days) || 1);
  const rentRateNum = Math.max(0, Number(rentRate) || 0);
  const price = slotsNum * daysNum * rentRateNum;

  const existingFarmerIds = activeBookings.map((b) => b.farmerId) || [];

  // CHANGE 2: Block booking when chamber is full
  const isChamberFull = availableSlots <= 0;

  const submitBooking = () => {
    if (!customer.trim()) { alert("Customer name is required"); return; }
    if (!farmerId.trim()) { alert("Farmer ID is required"); return; }
    if (existingFarmerIds.includes(farmerId.trim())) { alert(`Farmer ID "${farmerId.trim()}" already has a booking in this chamber.`); return; }
    if (!farmerPhone.trim()) { alert("Farmer phone number is required"); return; }
    if (!/^\d{10}$/.test(farmerPhone.trim())) { alert("Please enter a valid 10-digit phone number"); return; }
    if (!farmerAddress.trim()) { alert("Farmer address is required"); return; }
    if (isChamberFull) { alert("No slots available in this chamber"); return; }
    onCreateBooking(chamber.id, customer.trim(), farmerId.trim(), slotsNum, daysNum, rentRateNum, price, startDate, endDate, farmerPhone.trim(), farmerAddress.trim());
    setCustomer(""); setFarmerId(""); setFarmerPhone(""); setFarmerAddress(""); setSlots("1"); setDays("7");
    const resetStart = formatISODate(new Date());
    setStartDate(resetStart);
    setEndDate(addDays(resetStart, 6));
    setRentRate(String(chamber.pricePerSlotPerDay || 0));
    setStep("view");
  };

  const handleDeleteClick = (bookingId) => { setDeleteBookingId(bookingId); setStep("deletePassword"); };
  const handleDeleteConfirm = () => { onDeleteBooking(chamber.id, deleteBookingId); setDeleteBookingId(null); setStep("view"); };
  const handleCheckoutClick = (booking) => { setCheckoutBookingData(booking); setStep("checkout"); };

  if (step === "password") return <PasswordModal title="Add Booking — Verify Identity" onConfirm={() => setStep("form")} onClose={() => setStep("view")} adminPassword={adminPassword} />;
  if (step === "deletePassword") return <PasswordModal title="Delete Booking — Verify Identity" onConfirm={handleDeleteConfirm} onClose={() => { setDeleteBookingId(null); setStep("view"); }} adminPassword={adminPassword} />;
  if (step === "checkout" && checkoutBookingData) return <CheckoutModal booking={checkoutBookingData} onClose={() => { setCheckoutBookingData(null); setStep("view"); }} onCheckout={onCheckoutBooking} adminPassword={adminPassword} />;

  // CHANGE 2: If chamber is full and on view step, show error banner
  return (
    <div className="modal-overlay">
      <div className="modal-content wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Book slots: {chamber.id} — {chamber.name}</h3>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        {/* CHANGE 2: Chamber full warning banner */}
        {isChamberFull && (
          <div style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, padding: "12px 16px", marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚫</span>
            <div>
              <div style={{ fontWeight: 700, color: "#ef4444", fontSize: 15 }}>Chamber is Full</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>All {chamber.totalSlots} slots are currently booked. No new bookings can be added until a checkout occurs.</div>
            </div>
          </div>
        )}

        <div style={{ margin: "10px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><strong>Total slots:</strong> {chamber.totalSlots}</div>
          <div><strong>Available slots:</strong> <span style={{ color: isChamberFull ? "#ef4444" : "#10b981", fontWeight: 600 }}>{availableSlots}</span></div>
          <div><strong>Default rate:</strong> ₹{Number(chamber.pricePerSlotPerDay || 0).toLocaleString()} per slot per day</div>
          <div><strong>Booked slots:</strong> {usedSlots}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h4>Active Bookings</h4>
          {activeBookings.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Farmer ID", "Customer", "Phone", "Address", "Slots", "Days", "From", "To", "Rate (₹)", "Total (₹)", "Bill", "Checkout", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", borderBottom: "1px solid var(--border-subtle)", padding: "6px", fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeBookings.map((b) => (
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
                      {/* CHANGE 4: Bill button in its own column, before Checkout */}
                      <td style={{ padding: "6px" }}>
                        <button
                          onClick={() => generateProfessionalBill(b.customer, [{
                            chamberName: chamber.name, chamberId: chamber.id,
                            farmerId: b.farmerId, slots: b.slots, days: b.days,
                            rentRate: b.rentRate, startDate: b.startDate,
                            endDate: b.endDate, total: b.totalPrice,
                            checkoutStatus: b.checkoutStatus
                          }], adminName)}
                          style={{ background: "rgba(37,99,235,0.10)", border: "1px solid rgba(37,99,235,0.30)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#60a5fa", fontSize: 12, whiteSpace: "nowrap" }}
                        >
                          📄 Bill
                        </button>
                      </td>
                      <td style={{ padding: "6px" }}>
                        <button
                          onClick={() => handleCheckoutClick(b)}
                          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#10b981", fontSize: 12, whiteSpace: "nowrap" }}
                        >
                          Checkout
                        </button>
                      </td>
                      {/* CHANGE 1: Cross/delete button working */}
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
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No active bookings.</p>
          )}
        </div>

        {step === "view" && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn-ghost" onClick={onClose}>Close</button>
            {/* CHANGE 2: Disable new booking button when full */}
            {!isChamberFull && (
              <button className="btn-primary" onClick={() => setStep("password")}>+ New Booking</button>
            )}
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
                <input placeholder="e.g. F-2001" value={farmerId} onChange={(e) => setFarmerId(e.target.value)} style={{ borderColor: existingFarmerIds.includes(farmerId.trim()) && farmerId.trim() ? "#ef4444" : undefined }} />
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
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Farmer Phone <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="tel" placeholder="10-digit mobile number" value={farmerPhone} onChange={(e) => setFarmerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} style={{ borderColor: farmerPhone.length > 0 && farmerPhone.length !== 10 ? "#ef4444" : undefined }} />
                {farmerPhone.length > 0 && farmerPhone.length !== 10 && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ Enter a valid 10-digit number</div>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Farmer Address <span style={{ color: "#ef4444" }}>*</span></label>
                <input placeholder="Village / Town, District, State" value={farmerAddress} onChange={(e) => setFarmerAddress(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Number of Slots</label>
                <input type="number" value={slots} onChange={(e) => setSlots(e.target.value)} min="1" max={availableSlots || 1} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Duration (Days)</label>
                <input type="number" value={days} onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") { setDays(""); return; }
                  const parsed = parseInt(raw, 10);
                  if (Number.isNaN(parsed)) return;
                  const newDays = Math.min(365, Math.max(1, parsed));
                  setDays(String(newDays));
                  if (startDate) setEndDate(addDays(startDate, newDays - 1));
                }} min="1" max="365" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => {
                  const value = e.target.value;
                  setStartDate(value);
                  const d = Math.max(1, Number(days) || 1);
                  if (value) setEndDate(addDays(value, d - 1));
                }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => {
                  const value = e.target.value;
                  setEndDate(value);
                  if (startDate && value) setDays(String(diffDaysInclusive(startDate, value)));
                }} min={startDate} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                Rent Rate (₹ per slot per day)
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>Default: ₹{chamber.pricePerSlotPerDay}/slot/day</span>
              </label>
              <input type="number" value={rentRate} onChange={(e) => setRentRate(e.target.value)} min="1" style={{ maxWidth: 220 }} />
            </div>
            <div style={{ marginTop: 16, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Bill Computation</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto", gap: 10, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>SLOTS</div><div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700 }}>{slotsNum}</div></div>
                <div style={{ fontSize: 20, color: "var(--text-muted)" }}>×</div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>DAYS</div><div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700 }}>{daysNum}</div></div>
                <div style={{ fontSize: 20, color: "var(--text-muted)" }}>×</div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>RATE (₹/slot/day)</div><div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent-ice)" }}>₹{rentRateNum}</div></div>
                <div style={{ textAlign: "center", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>TOTAL BILL</div>
                  <div style={{ fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 800, color: "#10b981" }}>₹{price.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setStep("view")}>Cancel</button>
              <button className="btn-primary" onClick={submitBooking} disabled={existingFarmerIds.includes(farmerId.trim()) && farmerId.trim()}>Confirm Booking</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ALL BOOKINGS PAGE ─────────────────────────────────────────────────────────
// CHANGE 1: New page — shows all bookings with filters, current/previous, month/year
function AllBookingsPage({ chambers, adminName, onGenerateBill }) {
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "current" | "previous"
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [search, setSearch] = useState("");

  // Flatten all bookings from all chambers
  const allBookings = useMemo(() => {
    return chambers.flatMap(c =>
      (c.bookings || []).map(b => ({
        ...b,
        chamberId: c.id,
        chamberName: c.name,
        rentRate: b.rentRate || c.pricePerSlotPerDay,
      }))
    );
  }, [chambers]);

  const now = new Date();
  const filtered = useMemo(() => {
    return allBookings.filter(b => {
      // Status filter
      const isCheckedOut = b.checkoutStatus === "CHECKED_OUT" || b.actualPickupDate;
      if (filterStatus === "current" && isCheckedOut) return false;
      if (filterStatus === "previous" && !isCheckedOut) return false;

      // Month filter
      if (filterMonth) {
        const d = new Date(b.createdAt || b.startDate);
        if ((d.getMonth() + 1) !== parseInt(filterMonth)) return false;
      }
      // Year filter
      if (filterYear) {
        const d = new Date(b.createdAt || b.startDate);
        if (d.getFullYear() !== parseInt(filterYear)) return false;
      }
      // Search
      if (search) {
        const q = search.toLowerCase();
        if (!b.customer?.toLowerCase().includes(q) && !b.farmerId?.toLowerCase().includes(q) && !b.chamberName?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allBookings, filterStatus, filterMonth, filterYear, search]);

  const years = [...new Set(allBookings.map(b => new Date(b.createdAt || b.startDate).getFullYear()).filter(Boolean))].sort((a, b) => b - a);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const totalRevenue = filtered.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const currentCount = filtered.filter(b => !b.checkoutStatus && !b.actualPickupDate).length;
  const prevCount = filtered.filter(b => b.checkoutStatus === "CHECKED_OUT" || b.actualPickupDate).length;

  return (
    <div style={{ padding: "32px 36px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>All Bookings</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>Complete history · filter by status, month, and year</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Total Bookings", value: filtered.length, color: "#4dd9f0" },
          { label: "Currently Using", value: currentCount, color: "#10b981" },
          { label: "Checked Out", value: prevCount, color: "#a78bfa" },
          { label: "Revenue (Filtered)", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="metric-card" style={{ background: "rgb(255, 255, 255)", padding: "16px 20px" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.96)", border: "1px solid rgb(255, 255, 255)", borderRadius: 10, overflow: "hidden" }}>
          {[["all","All"],["current","Currently Using"],["previous","Checked Out"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)} style={{
              padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 12,
              background: filterStatus === val ? "rgba(255, 255, 255, 0.98)" : "transparent",
              color: filterStatus === val ? "var(--accent-ice)" : "var(--text-muted)",
              fontFamily: "var(--font-display)", fontWeight: filterStatus === val ? 600 : 400,
            }}>{label}</button>
          ))}
        </div>

        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(77,217,240,0.15)", borderRadius: 8, color: "var(--text-secondary)", fontSize: 12, padding: "8px 12px", fontFamily: "var(--font-body)", outline: "none", cursor: "pointer" }}>
          <option value="">All Months</option>
          {months.map((m, i) => <option key={m} value={i+1} style={{ background: "#ffffff" }}>{m}</option>)}
        </select>

        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(77,217,240,0.15)", borderRadius: 8, color: "var(--text-secondary)", fontSize: 12, padding: "8px 12px", fontFamily: "var(--font-body)", outline: "none", cursor: "pointer" }}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y} style={{ background: "#ffffff" }}>{y}</option>)}
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgb(255, 255, 255)04)", border: "1px solid rgba(77,217,240,0.15)", borderRadius: 10, padding: "8px 14px", flex: "1 1 200px", minWidth: 160 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search customer, farmer ID, chamber…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, width: "100%", fontFamily: "var(--font-body)" }} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgb(255, 255, 255)" }}>
              {["Farmer ID","Customer","Chamber","Slots","Days","Start","End","Rate","Total","Created At","Status","Bill"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", fontFamily: "var(--font-display)", fontWeight: 500, background: "rgb(255, 255, 255)", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => {
              const isCheckedOut = b.checkoutStatus === "CHECKED_OUT" || !!b.actualPickupDate;
              return (
                <tr key={`${b.id}-${i}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(77,217,240,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
                >
                  <td style={{ padding: "11px 14px", color: "var(--accent-ice)", fontWeight: 600 }}>{b.farmerId || "-"}</td>
                  <td style={{ padding: "11px 14px", color: "var(--text-primary)", fontWeight: 500 }}>{b.customer}</td>
                  <td style={{ padding: "11px 14px", color: "var(--text-secondary)" }}>{b.chamberName} <span style={{ fontSize: 10, color: "var(--text-muted)" }}>({b.chamberId})</span></td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>{b.slots}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>{b.days}</td>
                  <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: 12 }}>{b.startDate || "-"}</td>
                  <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: 12 }}>{b.endDate || "-"}</td>
                  <td style={{ padding: "11px 14px", color: "#10b981" }}>₹{Number(b.rentRate || 0).toLocaleString()}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: "#10b981" }}>₹{Number(b.totalPrice || 0).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-muted)" }}>{b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                  <td style={{ padding: "11px 14px" }}>
                    {isCheckedOut ? (
                      <span style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#a78bfa", whiteSpace: "nowrap" }}>✓ Checked Out</span>
                    ) : (
                      <span style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#10b981", whiteSpace: "nowrap" }}>● Active</span>
                    )}
                  </td>
                  {/* CHANGE 4: Bill column */}
                  <td style={{ padding: "11px 14px" }}>
                    <button
                      onClick={() => generateProfessionalBill(b.customer, [{
                        chamberName: b.chamberName, chamberId: b.chamberId,
                        farmerId: b.farmerId, slots: b.slots, days: b.days,
                        rentRate: b.rentRate, startDate: b.startDate,
                        endDate: b.endDate, total: b.totalPrice,
                        checkoutStatus: b.checkoutStatus
                      }], adminName)}
                      style={{ background: "rgba(37,99,235,0.10)", border: "1px solid rgba(37,99,235,0.30)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#60a5fa", fontSize: 12, whiteSpace: "nowrap" }}
                    >
                      📄 Bill
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No bookings found for the selected filters.</div>
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
  // CHANGE 3: Track dismissed alerts
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    if (!admin?.id) return;
    getAllChambers(admin.id)
      .then(res => { setChambers(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(err => { console.error("Error fetching chambers:", err); setFetchError("Backend connect nahi hua."); setLoading(false); });
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
  const bookedSlots = useMemo(() => chambers.reduce((sum, ch) => sum + ((ch.bookings || []).filter(b => !b.checkoutStatus && !b.actualPickupDate).reduce((s, b) => s + b.slots, 0)), 0), [chambers]);
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
    [84,85,83,86,87,84,88,85,83,86,87],
    [70,71,69,68,72,70,74,69,68,71,70],
    [bookedSlots,bookedSlots+2,bookedSlots+6,bookedSlots+8,bookedSlots+10,bookedSlots+11,bookedSlots+13,bookedSlots+13,bookedSlots+14,bookedSlots+15,bookedSlots+16],
    [totalRevenue,totalRevenue+500,totalRevenue+900,totalRevenue+800,totalRevenue+1200,totalRevenue+1400,totalRevenue+1700,totalRevenue+1650,totalRevenue+1800,totalRevenue+2100,totalRevenue+2400],
  ];

  const reportRows = useMemo(() => chambers.flatMap((c) =>
    (c.bookings || []).map((b) => ({
      farmerId: b.farmerId || "-", customer: b.customer || "-",
      chamberId: c.id, chamberName: c.name, slots: b.slots, days: b.days,
      startDate: b.startDate || "", endDate: b.endDate || "",
      rentRate: b.rentRate || c.pricePerSlotPerDay, total: b.totalPrice,
      createdAt: b.createdAt || "", checkoutStatus: b.checkoutStatus,
    }))
  ), [chambers]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--accent-ice)", fontFamily: "var(--font-display)", fontSize: 18 }}>
      Loading chambers...
    </div>
  );

  const downloadReport = () => {
    const csvHeader = ["Farmer ID","Customer","Chamber ID","Chamber","Slots","Days","Start Date","End Date","RentRate(₹/slot/day)","Total(₹)","Status","Created At"];
    const rows = reportRows.map((row) => [row.farmerId,row.customer,row.chamberId,row.chamberName,row.slots,row.days,row.startDate,row.endDate,row.rentRate,row.total,row.checkoutStatus||"ACTIVE",row.createdAt]);
    const csvContent = [csvHeader,...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `coldvault-report-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleAddChamber = async (newChamber) => {
    try {
      const res = await addChamber({ ...newChamber, adminId: admin.id });
      setChambers(prev => [...prev, res.data]);
      setShowAddModal(false);
    } catch (err) { alert(err.response?.data?.error || "Chamber save nahi hua"); }
  };

  const handleDeleteChamber = async (id) => {
    try {
      await deleteChamber(id);
      const res = await getAllChambers(admin.id);
      setChambers(res.data);
    } catch (err) { console.error("Delete chamber error:", err); alert("Chamber delete nahi hua."); }
    finally { setDeleteChamberId(null); }
  };

  const handleSelectChamber = (id) => setSelectedChamberId(id);
  const handleCloseChamberDetail = () => setSelectedChamberId(null);

  const handleCreateBooking = async (chamberId, customer, farmerId, slots, days, rentRate, totalPrice, startDate, endDate, farmerPhone = "", farmerAddress = "") => {
    try {
      const exists = customers.find(c => c.name.toLowerCase() === customer.toLowerCase());
      if (!exists) {
        const custRes = await createCustomer({ name: customer, adminId: admin.id, phone: farmerPhone, address: farmerAddress });
        if (custRes.status === 201) setCustomers(prev => [...prev, custRes.data]);
      }
      const res = await createBooking({ chamber: { id: chamberId }, customer, farmerId, farmerPhone, farmerAddress, slots, days, rentRate, totalPrice, startDate, endDate, createdAt: new Date().toISOString() });
      if (!(res && (res.status === 200 || res.status === 201))) throw new Error("Booking API failed");
      const updated = await getAllChambers(admin.id);
      setChambers(updated.data);
    } catch (err) { alert("Booking save nahi hui: " + (err.response?.data?.error || err.message)); }
  };

const handleDeleteBooking = async (chamberId, bookingId) => {
  try {
    const delRes = await deleteBooking(bookingId);
    if (!(delRes && delRes.status && delRes.status.toString().startsWith("2"))) {
      throw new Error("Delete booking API failed");
    }
    // This refreshes chambers state → selectedChamber useMemo re-derives → grid updates
    const res = await getAllChambers(admin.id);
    setChambers(res.data);  // ← make sure this line exists
  } catch (err) {
    console.error("Delete booking error:", err);
    alert("Booking delete nahi hui.");
  }
};

  const handleCheckoutBooking = async (bookingId, actualPickupDate) => {
    try {
      await checkoutBooking(bookingId, actualPickupDate);
      const updated = await getAllChambers(admin.id);
      setChambers(updated.data);
    } catch (err) { alert("Checkout failed: " + (err.response?.data?.error || err.message)); throw err; }
  };

  // ── REPORTS PAGE ──────────────────────────────────────────────────────────
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
                    {["Farmer ID","Customer","Chamber","Slots","Days","Rate (₹)","Total (₹)","Status","Created At","Bill"].map((h) => (
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
                      <td style={{ padding: 8 }}>
                        {row.checkoutStatus === "CHECKED_OUT" ? (
                          <span style={{ color: "#a78bfa", fontSize: 12 }}>✓ Checked Out</span>
                        ) : (
                          <span style={{ color: "#10b981", fontSize: 12 }}>● Active</span>
                        )}
                      </td>
                      <td style={{ padding: 8 }}>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                      {/* CHANGE 4: Bill button in proper column */}
                      <td style={{ padding: 8 }}>
                        <button
                          onClick={() => generateProfessionalBill(row.customer, [row], admin?.name || "ColdVault Storage")}
                          style={{ background: "rgba(37,99,235,0.10)", border: "1px solid rgba(37,99,235,0.30)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#60a5fa", fontSize: 12 }}
                        >
                          📄 Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── ALERTS PAGE ──────────────────────────────────────────────────────────
  if (activeNav === "alerts") {
    const now2 = Date.now();
    const allAlerts = chambers.flatMap((c) =>
      (c.bookings || [])
        .filter(b => !b.checkoutStatus && !b.actualPickupDate) // Only active bookings
        .map((b, idx) => {
          const end = b.endDate ? new Date(b.endDate).getTime() : new Date(b.createdAt || new Date()).getTime() + (b.days || 0) * 864e5;
          const remainingDays = Math.max(0, Math.ceil((end - now2) / 864e5));
          return { key: `${c.id}-${b.id}-${idx}`, chamberId: c.id, chamberName: c.name, customer: b.customer, farmerId: b.farmerId, remainingDays, endDate: b.endDate };
        })
    ).sort((a, b) => a.remainingDays - b.remainingDays);

    // CHANGE 3: Filter out dismissed alerts
    const visibleAlerts = allAlerts.filter(a => !dismissedAlerts.has(a.key));

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Topbar collapsed={collapsed} onBack={onBack} />
        <main style={{ marginLeft: mainLeft, paddingTop: 68, transition: "margin-left 0.3s", minHeight: "100vh" }}>
          <div style={{ padding: "32px 36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)" }}>Alerts</h1>
              {dismissedAlerts.size > 0 && (
                <button onClick={() => setDismissedAlerts(new Set())} className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px", borderRadius: 8 }}>
                  Restore {dismissedAlerts.size} dismissed
                </button>
              )}
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              {visibleAlerts.length === 0 ? (
                <p style={{ fontSize: 18, color: "var(--text-muted)", padding: "20px 0" }}>No active alerts</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {visibleAlerts.map((a) => {
                    const color = a.remainingDays <= 1 ? "#ef4444" : a.remainingDays === 2 ? "#f59e0b" : "#2563eb";
                    return (
                      <div key={a.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "12px 14px", background: "var(--surface-1)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                          <div style={{ fontSize: 15, color: "var(--text-primary)" }}>
                            <span style={{ color: "var(--accent-ice)", fontWeight: 600 }}>{a.farmerId}</span> · {a.customer} in {a.chamberName} ({a.chamberId})
                            {a.endDate && <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>· ends {a.endDate}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ fontSize: 14, color, fontWeight: 600 }}>{a.remainingDays} day{a.remainingDays !== 1 ? "s" : ""} remaining</div>
                          {/* CHANGE 3: Delete button on alerts */}
                          <button
                            onClick={() => setDismissedAlerts(prev => new Set([...prev, a.key]))}
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#ef4444", fontSize: 13 }}
                            title="Dismiss this alert"
                          >
                            🗑
                          </button>
                        </div>
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

  // ── USERS PAGE ───────────────────────────────────────────────────────────
  if (activeNav === "users") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Topbar collapsed={collapsed} onBack={onBack} />
        <main style={{ marginLeft: mainLeft, paddingTop: 68, minHeight: "100vh" }}>
          <div style={{ padding: "32px 36px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Customers</h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 24 }}>{customers.length} customers — auto-added when a booking is created</p>
            <div className="glass-card" style={{ padding: 20 }}>
              {customers.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No customers yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["#","Customer Name","Phone","Address","Bookings"].map(h => (<th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-subtle)", fontSize: 13, color: "var(--text-muted)" }}>{h}</th>))}</tr>
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

  // ── CHAMBERS PAGE ────────────────────────────────────────────────────────
  if (activeNav === "chambers") {
    const editChamber = (id, updates) => setChambers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
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
              <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: 10 }} onClick={() => setShowAddModal(true)}>+ Add Chamber</button>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["ID","Name","Total Slots","Slot Size","₹/slot/day","Booked","Available","Actions"].map((h) => (<th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-subtle)" }}>{h}</th>))}</tr>
                </thead>
                <tbody>
                  {chambers.map((c) => {
                    const activeBookings2 = (c.bookings || []).filter(b => !b.checkoutStatus && !b.actualPickupDate);
                    const booked = activeBookings2.reduce((s, b) => s + b.slots, 0);
                    const available = Math.max(0, c.totalSlots - booked);
                    const isFull = available <= 0;
                    return (
                      <tr key={c.id}>
                        <td style={{ padding: 10 }}>{c.id}</td>
                        <td style={{ padding: 10 }}>{c.name}</td>
                        <td style={{ padding: 10 }}><input type="number" min="1" value={c.totalSlots} onChange={(e) => editChamber(c.id, { totalSlots: Math.max(1, Number(e.target.value) || 1) })} /></td>
                        <td style={{ padding: 10 }}><input type="number" min="1" value={c.slotSize || 1} onChange={(e) => editChamber(c.id, { slotSize: Math.max(1, Number(e.target.value) || 1) })} /></td>
                        <td style={{ padding: 10 }}><input type="number" min="1" value={c.pricePerSlotPerDay} onChange={(e) => editChamber(c.id, { pricePerSlotPerDay: Math.max(1, Number(e.target.value) || 1) })} /></td>
                        <td style={{ padding: 10 }}>{booked}</td>
                        <td style={{ padding: 10 }}>
                          <span style={{ color: isFull ? "#ef4444" : "#10b981", fontWeight: 600 }}>{available}</span>
                          {isFull && <span style={{ fontSize: 11, color: "#ef4444", marginLeft: 6 }}>FULL</span>}
                        </td>
                        <td style={{ padding: 10, display: "flex", gap: 8 }}>
                          <button
                            className="btn-ghost"
                            onClick={() => {
                              if (isFull) { alert(`Chamber ${c.id} is full! All ${c.totalSlots} slots are booked. No new bookings can be added.`); return; }
                              setSelectedChamberId(c.id);
                            }}
                            style={{ opacity: isFull ? 0.6 : 1 }}
                          >
                            {isFull ? "🚫 Full" : "Open Booking"}
                          </button>
                          <button onClick={() => setDeleteChamberId(c.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#ef4444", fontSize: 13 }}>Delete</button>
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
        {deleteChamberId && <DeleteChamberModal chamberId={deleteChamberId} onConfirm={() => handleDeleteChamber(deleteChamberId)} onClose={() => setDeleteChamberId(null)} adminPassword={admin?.password} />}
        {selectedChamber && (
          <BookingModal chamber={selectedChamber} onClose={handleCloseChamberDetail} onCreateBooking={handleCreateBooking} onDeleteBooking={handleDeleteBooking} onCheckoutBooking={handleCheckoutBooking} adminPassword={admin?.password} adminName={admin?.name} />
        )}
      </div>
    );
  }

  // ── ALL BOOKINGS PAGE ────────────────────────────────────────────────────
  // CHANGE 1: New "all-bookings" nav section
  if (activeNav === "all-bookings") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Topbar collapsed={collapsed} onBack={onBack} />
        <main style={{ marginLeft: mainLeft, paddingTop: 68, transition: "margin-left 0.3s", minHeight: "100vh" }}>
          <AllBookingsPage chambers={chambers} adminName={admin?.name} />
        </main>
      </div>
    );
  }

  // ── MAIN DASHBOARD ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} />
      <Topbar collapsed={collapsed} onBack={onBack} />
      <main style={{ marginLeft: mainLeft, paddingTop: 68, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)", minHeight: "100vh" }}>
        <div style={{ padding: "32px 36px" }}>
          {fetchError && (
            <div style={{ marginBottom: 16, background: "rgb(255, 255, 255)", border: "1px solid rgb(255, 255, 255)", color: "#b45309", borderRadius: 10, padding: "10px 14px", fontSize: 14 }}>{fetchError}</div>
          )}
          <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Storage & Billing Dashboard</h1>
            <p style={{ fontSize: 19, color: "var(--text-muted)", marginTop: 6 }}>Manage bookings by slots · Pricing by days · Auto billing</p>
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
{/* ── Analytics Row ─────────────────────────────────────── */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24, animation: "fadeInUp 0.7s ease 0.5s both" }}>

  {/* Capacity Donut Chart */}
  <div className="glass-card" style={{ padding: "20px 24px" }}>
    <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 14 }}>CAPACITY OVERVIEW</div>
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {(() => {
          const pct = totalSlots > 0 ? bookedSlots / totalSlots : 0;
          const r = 32, cx = 40, cy = 40;
          const circ = 2 * Math.PI * r;
          const used = circ * pct;
          const free = circ * (1 - pct);
          return (
            <>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx={cx} cy={cy} r={r} fill="none"
                stroke={pct > 0.9 ? "#f43f5e" : pct > 0.7 ? "#f59e0b" : "#10b981"}
                strokeWidth="10"
                strokeDasharray={`${used} ${free}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition: "stroke-dasharray 0.8s ease" }}
              />
              <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="13" fontWeight="700">
                {Math.round(pct * 100)}%
              </text>
            </>
          );
        })()}
      </svg>
      <div style={{ flex: 1 }}>
        {chambers.map(c => {
          const booked = (c.bookings || []).filter(b => !b.checkoutStatus || b.checkoutStatus === "ACTIVE").reduce((s,b) => s + b.slots, 0);
          const pct = c.totalSlots > 0 ? Math.round(booked / c.totalSlots * 100) : 0;
          return (
            <div key={c.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "var(--text-secondary)" }}>{c.name}</span>
                <span style={{ color: pct >= 100 ? "#f43f5e" : "#10b981" }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#f43f5e" : pct > 70 ? "#f59e0b" : "#10b981", borderRadius: 2, transition: "width 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>

  {/* Revenue Bar Chart */}
  <div className="glass-card" style={{ padding: "20px 24px" }}>
    <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 14 }}>REVENUE BY CHAMBER</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {chambers.length === 0 && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No chambers yet.</div>}
      {chambers.map(c => {
        const rev = (c.bookings || []).reduce((s, b) => s + (b.totalPrice || 0), 0);
        const maxRev = Math.max(...chambers.map(ch => (ch.bookings || []).reduce((s,b) => s + (b.totalPrice||0), 0)), 1);
        const pct = Math.round((rev / maxRev) * 100);
        return (
          <div key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: "var(--text-secondary)" }}>{c.name}</span>
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>Rs.{rev.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24)", borderRadius: 3, transition: "width 0.8s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Booking Stats */}
  <div className="glass-card" style={{ padding: "20px 24px" }}>
    <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 14 }}>BOOKING STATS</div>
    {(() => {
      const allBookings = chambers.flatMap(c => c.bookings || []);
      const active = allBookings.filter(b => !b.checkoutStatus || b.checkoutStatus === "ACTIVE").length;
      const checkedOut = allBookings.filter(b => b.checkoutStatus === "CHECKED_OUT").length;
      const total = allBookings.length;
      const totalCustomers = [...new Set(allBookings.map(b => b.customer))].length;
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Active", value: active, color: "#10b981" },
            { label: "Checked Out", value: checkedOut, color: "#a78bfa" },
            { label: "Total Bookings", value: total, color: "#4dd9f0" },
            { label: "Unique Customers", value: totalCustomers, color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgb(255, 255, 255)", border: "1px solid rgb(255, 255, 255)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      );
    })()}
  </div>

</div>

{/* ── Monthly Turnover Bar Chart ────────────────────────── */}
<div className="glass-card" style={{ padding: "20px 24px", marginBottom: 24, animation: "fadeInUp 0.7s ease 0.6s both" }}>
  <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 16 }}>MONTHLY TURNOVER (Rs.)</div>
  {(() => {
    const allBookings = chambers.flatMap(c => c.bookings || []);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((m, i) => {
      const rev = allBookings
        .filter(b => {
          const d = new Date(b.createdAt || b.startDate);
          return d.getFullYear() === currentYear && d.getMonth() === i;
        })
        .reduce((s, b) => s + (b.totalPrice || 0), 0);
      return { month: m, rev };
    });
    const maxRev = Math.max(...monthlyData.map(d => d.rev), 1);
    const barH = 80;
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: barH + 30 }}>
        {monthlyData.map(({ month, rev }) => {
          const h = Math.round((rev / maxRev) * barH);
          const isCurrentMonth = months[new Date().getMonth()] === month;
          return (
            <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {rev > 0 && (
                <div style={{ fontSize: 9, color: "#f59e0b", fontWeight: 600 }}>
                  {rev >= 1000 ? `${(rev/1000).toFixed(1)}k` : rev}
                </div>
              )}
              <div style={{
                width: "100%", height: h || 3,
                background: isCurrentMonth
                  ? "linear-gradient(180deg, #4dd9f0, #2563eb)"
                  : "linear-gradient(180deg, #f59e0b88, #f59e0b44)",
                borderRadius: "3px 3px 0 0",
                transition: "height 0.8s ease",
                minHeight: 3,
              }} />
              <div style={{ fontSize: 9, color: isCurrentMonth ? "var(--accent-ice)" : "var(--text-muted)", fontWeight: isCurrentMonth ? 700 : 400 }}>{month}</div>
            </div>
          );
        })}
      </div>
    );
  })()}
</div>

{/* ── Chambers Grid ─────────────────────────────────────── */}
<div style={{ animation: "fadeInUp 0.7s ease 0.7s both" }}>
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
      {deleteChamberId && <DeleteChamberModal chamberId={deleteChamberId} onConfirm={() => handleDeleteChamber(deleteChamberId)} onClose={() => setDeleteChamberId(null)} adminPassword={admin?.password} />}
      {selectedChamber && (
  <BookingModal
    key={selectedChamber.id + (selectedChamber.bookings?.length ?? 0)}
    chamber={selectedChamber}
    onClose={handleCloseChamberDetail}
    onCreateBooking={handleCreateBooking}
    onDeleteBooking={handleDeleteBooking}
    onCheckoutBooking={handleCheckoutBooking}
    adminPassword={admin?.password}
    adminName={admin?.name}
  />
)}
    </div>
  );
}