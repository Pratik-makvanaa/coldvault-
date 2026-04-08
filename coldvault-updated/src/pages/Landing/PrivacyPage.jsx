// PrivacyPage.jsx
export default function PrivacyPage({ onBack }) {
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
      <h1 style={{ fontSize: 40, marginBottom: 20 }}>Privacy Policy</h1>

      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        We value your privacy. ColdVault collects only necessary data such as
        user details, storage records, and billing information to provide better services.
      </p>

      <h3 style={{ marginTop: 30 }}>Data Collection</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        We collect customer name, product details, storage duration, and chamber usage data.
      </p>

      <h3 style={{ marginTop: 30 }}>Data Usage</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        Data is used to manage storage, generate reports, and improve system performance.
      </p>

      <h3 style={{ marginTop: 30 }}>Security</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        We ensure secure storage of your data and do not share it with third parties.
      </p>
    </div>
  );
}