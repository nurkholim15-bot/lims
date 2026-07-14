import React from "react";

function AboutModal({ isOpen, onClose, appConfig }) {
  if (!isOpen) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "2.5rem 2rem",
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      color: "white",
      borderRadius: "16px",
      textAlign: "center",
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.5rem",
        boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.4)"
      }}>
        <i className="fas fa-info-circle" style={{ fontSize: "2.5rem", color: "white" }}></i>
      </div>
      <h3 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.5rem 0", letterSpacing: "-0.025em" }}>LIM System</h3>
      <p style={{ fontSize: "0.95rem", color: "#94a3b8", margin: "0 0 1.5rem 0", maxWidth: "320px", lineHeight: "1.5" }}>
        Laboratory Information Management System
      </p>
      <div style={{
        width: "100%",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        padding: "1rem 1.5rem",
        marginBottom: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>TIPE APLIKASI</span>
          <span style={{ fontSize: "0.95rem", color: "#e2e8f0", fontWeight: 700 }}>Mobile App</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>VERSI SISTEM</span>
          <span style={{ fontSize: "0.95rem", color: "#10b981", fontWeight: 700 }}>v{import.meta.env.VITE_APP_VERSION || "1.0"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>PLATFORM</span>
          <span style={{ fontSize: "0.95rem", color: "#3b82f6", fontWeight: 700 }}>{(typeof window !== "undefined" && window.Capacitor) ? window.Capacitor.getPlatform().toUpperCase() : "WEB"}</span>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={onClose}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "0.95rem",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)"
        }}
      >
        Tutup
      </button>
    </div>
  );
}

export default AboutModal;
