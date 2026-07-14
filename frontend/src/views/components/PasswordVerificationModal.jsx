import React from "react";

function PasswordVerificationModal({ isOpen, onClose, passwordInput, setPasswordInput, onSubmit, errorMsg }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
      <div className="modal-card" style={{ background: "#fff", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: 700, color: "#065f46" }}>Verifikasi Password</h2>
        <p style={{ marginBottom: "1.5rem", color: "#666", fontSize: "0.95rem" }}>Silakan masukkan password Anda untuk melanjutkan.</p>
        <input 
          type="password" 
          value={passwordInput} 
          onChange={(e) => setPasswordInput(e.target.value)} 
          placeholder="Masukkan password" 
          style={{ width: "100%", padding: "0.75rem", border: errorMsg ? "2px solid #dc2626" : "1px solid #ddd", borderRadius: "4px", marginBottom: "0.5rem", boxSizing: "border-box" }} 
          onKeyPress={(e) => e.key === "Enter" && onSubmit()} 
        />
        {errorMsg && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{errorMsg}</p>}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn btn-secondary">Batal</button>
          <button onClick={onSubmit} className="btn btn-primary">Verifikasi</button>
        </div>
      </div>
    </div>
  );
}

export default PasswordVerificationModal;
