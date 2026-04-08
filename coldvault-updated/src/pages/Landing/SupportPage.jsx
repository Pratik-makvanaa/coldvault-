// SupportPage.jsx
export default function SupportPage({ onBack }) {
  return (
    <div style={{ padding: "120px 60px", maxWidth: 900, margin: "0 auto" }}>
       <button
  onClick={() => onBack && onBack()}
  style={{
    marginBottom: 20,
    padding: "8px 16px",
    cursor: "pointer"
  }}
>
  ← Back
</button>
      <h1 style={{ fontSize: 40, marginBottom: 20 }}>Support</h1>

      <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
        Need help? We're here for you.
      </p>

      <h3>Email Support</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        support@coldvault.com
      </p>

      <h3 style={{ marginTop: 20 }}>Phone</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        +91 98765 43210
      </p>

      <h3 style={{ marginTop: 20 }}>Working Hours</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        Monday - Saturday (9 AM - 6 PM)
      </p>
    </div>
  );
}