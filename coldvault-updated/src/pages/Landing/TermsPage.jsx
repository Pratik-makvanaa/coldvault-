// TermsPage.jsx
export default function TermsPage({ onBack }) {
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
      <h1 style={{ fontSize: 40, marginBottom: 20 }}>Terms & Conditions</h1>

      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        By using ColdVault, you agree to follow all rules and regulations related
        to storage management and data usage.
      </p>

      <h3 style={{ marginTop: 30 }}>Usage</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        Users must provide accurate data for chambers, inventory, and billing.
      </p>

      <h3 style={{ marginTop: 30 }}>Responsibility</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        ColdVault is not responsible for incorrect data entered by users.
      </p>

      <h3 style={{ marginTop: 30 }}>Changes</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        We may update these terms anytime to improve services.
      </p>
    </div>
  );
}