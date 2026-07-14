import React from "react";

function ForceUpgradePage({ forceUpgrade }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      color: "white",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      padding: "2rem",
      boxSizing: "border-box"
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        padding: "3rem 2rem",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 2rem auto",
          boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)"
        }}>
          <i className="fas fa-arrow-alt-circle-up" style={{ fontSize: "2.5rem", color: "white" }}></i>
        </div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.025em" }}>Pembaruan Aplikasi Wajib</h2>
        <p style={{ color: "#94a3b8", lineHeight: "1.6", marginBottom: "2rem" }}>
          {forceUpgrade.message || `Versi aplikasi Anda sudah usang. Harap perbarui ke versi ${forceUpgrade.minimum_version} untuk melanjutkan.`}
        </p>
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "2rem",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <span style={{ display: "block", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Batas Versi Minimum</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981" }}>v{forceUpgrade.minimum_version}</span>
        </div>
        <a href={forceUpgrade.download_url} style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          fontSize: "1.1rem",
          fontWeight: 700,
          textDecoration: "none",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)",
          transition: "all 0.2s"
        }}>
          <i className="fas fa-download"></i> Unduh & Perbarui Sekarang
        </a>
      </div>
    </div>
  );
}

export default ForceUpgradePage;
