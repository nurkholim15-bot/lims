import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";

const ToolAvailabilityGrid = ({ toolCode, date, gmtOffset }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/testing-tools/availability?tool_code=${toolCode}&date=${date}`);
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
      } finally {
        setLoading(false);
      }
    };
    if (toolCode && date) fetchAvailability();
  }, [toolCode, date]);

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}><i className="fas fa-spinner fa-spin"></i> Memuat ketersediaan...</div>;
  if (!data) return <div className="alert alert-error">Gagal memuat data ketersediaan.</div>;

  const { availability, tool } = data;

  const getStatusColor = (slotStatus) => {
    switch (slotStatus) {
      case "AVAILABLE": return "#10b981"; // Green
      case "BOOKED": return "#ef4444";    // Red
      case "OUT_OF_OFFICE": return "#94a3b8"; // Gray
      case "MAINTENANCE": return "#f59e0b"; // Orange
      default: return "#f1f5f9";
    }
  };

  const getStatusLabel = (slotStatus, quantity = 0) => {
    if (tool.type === "STOCK") {
      if (slotStatus === "BOOKED" || quantity <= 0) return "Stok Habis";
      if (slotStatus === "AVAILABLE") return `Stock: ${quantity}`;
    }
    switch (slotStatus) {
      case "AVAILABLE": return "Tersedia";
      case "BOOKED": return "Terpesan";
      case "OUT_OF_OFFICE": return "Luar Jam Kerja";
      case "MAINTENANCE": return "Pemeliharaan";
      default: return slotStatus;
    }
  };

  return (
    <div className="availability-container" style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
        <h3 style={{ margin: 0, color: "#1e293b" }}>{tool.name} ({tool.code})</h3>
        <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
          <i className="fas fa-calendar-alt"></i> {date} | <i className="fas fa-globe"></i> GMT+{gmtOffset} | 
          <span style={{ marginLeft: "10px", fontWeight: 700 }}>Tipe: {tool.type}</span>
        </p>
      </div>

      {tool.type === "STOCK" ? (
        <div style={{ padding: "2rem", textAlign: "center", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "3rem", color: tool.current_stock <= (tool.initial_stock * 0.1) ? "#ef4444" : "#10b981", fontWeight: 800 }}>
            {tool.current_stock}
          </div>
          <div style={{ color: "#64748b", fontWeight: 600 }}>Stok Aktual Tersedia</div>
          <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#94a3b8" }}>
            Alat tipe STOCK tidak memerlukan penjadwalan waktu. Stok akan dikurangi secara otomatis saat perencanaan disimpan.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(100px, 1fr))" : "repeat(6, 1fr)", gap: "10px" }}>
          {availability.map((slot) => (
            <div
              key={slot.hour}
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: getStatusColor(slot.status),
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                opacity: slot.status === "OUT_OF_OFFICE" ? 0.6 : 1,
                position: "relative",
                minHeight: "80px"
              }}
              title={`${slot.hour}:00 - ${slot.hour + 1}:00: ${getStatusLabel(slot.status)}${slot.booked_by ? ` (Oleh: ${slot.booked_by})` : ""}`}
            >
              <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>{String(slot.hour).padStart(2, "0")}:00</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>{getStatusLabel(slot.status, slot.quantity)}</span>
              {slot.booked_by && (
                <div style={{ fontSize: "0.65rem", marginTop: "4px", background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "10px" }}>
                  <i className="fas fa-user"></i> {slot.booked_by}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "10px", fontSize: "0.8rem", color: "#475569" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", background: "#10b981", borderRadius: "2px" }}></div> Tersedia (08:00 - 17:00)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", background: "#ef4444", borderRadius: "2px" }}></div> Terpesan
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", background: "#94a3b8", borderRadius: "2px" }}></div> Luar Jam Kerja
        </div>
      </div>
    </div>
  );
};

export default ToolAvailabilityGrid;
