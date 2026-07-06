import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import ToolAvailabilityGrid from "@components/ToolAvailabilityGrid";

const ToolAvailabilityPage = ({ setSelectedApp, setModalType }) => {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await apiRequest("/testing-tools");
    if (data) {
      setTools(data);
      if (data.length > 0 && !selectedTool) setSelectedTool(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTool && viewMode === "list") {
        const fetchReservations = async () => {
            const res = await apiRequest(`/management/testing-tools/${selectedTool.code}/transactions`);
            if (res) {
                const filtered = selectedTool.type === 'STOCK' ? res : res.filter(h => h.reference_type === 'PLANNING');
                setReservations(filtered);
            }
        };
        fetchReservations();
    }
  }, [selectedTool, viewMode]);

  const handleOpenApp = async (appId) => {
    if (!appId) return;
    const appData = await apiRequest(`/applications/${appId}`);
    if (appData) {
        setSelectedApp(appData);
        setModalType("query");
    }
  };

  if (loading && tools.length === 0) return <div className="p-8 text-center"><i className="fas fa-spinner fa-spin"></i> Memuat data peralatan...</div>;

  return (
    <div className="card" style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: isMobile ? "auto" : "100%", 
      padding: isMobile ? "1rem" : "1.5rem", 
      background: "white", 
      borderRadius: "16px", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)", 
      overflow: "hidden" 
    }}>
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: isMobile ? "flex-start" : "center", 
        marginBottom: "2rem", 
        borderBottom: "1px solid #f1f5f9", 
        paddingBottom: "1.5rem",
        gap: isMobile ? "1rem" : "0"
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", fontWeight: 800, color: "#1e293b", margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-calendar-check" style={{ color: "#3b82f6" }}></i> Reservasi & Ketersediaan Alat
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "6px 0 0 0" }}>Pantau jadwal penggunaan dan sisa stok peralatan pengujian secara real-time</p>
        </div>
        <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "8px", width: isMobile ? "100%" : "auto" }}>
            <button 
                onClick={() => setViewMode("grid")}
                style={{ 
                    flex: isMobile ? 1 : "initial",
                    padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
                    background: viewMode === "grid" ? "white" : "transparent",
                    color: viewMode === "grid" ? "#3b82f6" : "#64748b",
                    boxShadow: viewMode === "grid" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                }}
            >
                <i className="fas fa-th"></i> Visual Grid
            </button>
            <button 
                onClick={() => setViewMode("list")}
                style={{ 
                    flex: isMobile ? 1 : "initial",
                    padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
                    background: viewMode === "list" ? "white" : "transparent",
                    color: viewMode === "list" ? "#3b82f6" : "#64748b",
                    boxShadow: viewMode === "list" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                }}
            >
                <i className="fas fa-list"></i> Daftar Transaksi
            </button>
        </div>
      </div>

      <div style={{ 
        display: isMobile ? "flex" : "grid", 
        flexDirection: isMobile ? "column" : "row",
        gridTemplateColumns: isMobile ? "none" : "320px 1fr", 
        gap: "2rem", 
        flex: 1, 
        minHeight: 0 
      }}>
        {/* Left Sidebar / Selection */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.5rem", 
          borderRight: isMobile ? "none" : "1px solid #f1f5f9", 
          paddingRight: isMobile ? 0 : "1.5rem",
          borderBottom: isMobile ? "1px solid #f1f5f9" : "none",
          paddingBottom: isMobile ? "1.5rem" : 0
        }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", display: "block", marginBottom: "0.75rem", letterSpacing: '0.05em' }}>TANGGAL PENGECEKAN</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "1rem", outline: 'none', color: '#1e293b', fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", display: "block", marginBottom: "0.75rem", letterSpacing: '0.05em' }}>PILIH ALAT</label>
            {isMobile ? (
              <select
                value={selectedTool?.code || ""}
                onChange={(e) => {
                  const tool = tools.find(t => t.code === e.target.value);
                  if (tool) setSelectedTool(tool);
                }}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  outline: 'none',
                  color: '#1e293b',
                  fontWeight: 600,
                  background: '#f8fafc'
                }}
              >
                {tools.map(t => (
                  <option key={t.code} value={t.code}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
            ) : (
              <div className="table-container" style={{ maxHeight: '500px', overflowY: "auto", display: 'flex', flexDirection: 'column', paddingRight: '5px' }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingBottom: '1rem' }}>
                  {tools.map((t) => (
                    <div
                      key={t.code}
                      onClick={() => setSelectedTool(t)}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: `2px solid ${selectedTool?.code === t.code ? "#3b82f6" : "#f8fafc"}`,
                        background: selectedTool?.code === t.code ? "#eff6ff" : "#f8fafc",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: selectedTool?.code === t.code ? 'translateX(5px)' : 'none'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: selectedTool?.code === t.code ? "#1e40af" : "#334155" }}>{t.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: t.type === 'STOCK' ? '#dcfce7' : '#e0f2fe', color: t.type === 'STOCK' ? '#166534' : '#0369a1' }}>
                            {t.type}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            <i className="fas fa-map-marker-alt"></i> {t.location?.name || "Global"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Main */}
        <div className="table-container" style={{ 
          overflowY: "auto", 
          paddingRight: '0.5rem', 
          height: isMobile ? "auto" : "calc(100vh - 280px)" 
        }}>
          {selectedTool ? (
            <div>
              <div style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between", 
                alignItems: isMobile ? "flex-start" : "center", 
                marginBottom: "2rem", 
                background: '#f8fafc', 
                padding: '1.25rem', 
                borderRadius: '12px',
                gap: isMobile ? "1rem" : "0"
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                        <i className={selectedTool.type === 'STOCK' ? "fas fa-boxes" : "fas fa-stopwatch"}></i>
                    </div>
                    <div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>{selectedTool.name}</h3>
                        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
                            ID: {selectedTool.code} • {selectedTool.location?.name} (GMT+{selectedTool.location?.city?.gmt_offset || 7})
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: isMobile ? "left" : "right" }}>
                   <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>STATUS SAAT INI</div>
                   {selectedTool.type === 'STOCK' ? (
                       <div style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedTool.current_stock > 0 ? '#10b981' : '#ef4444' }}>
                           Stok: {selectedTool.current_stock}
                       </div>
                   ) : (
                       <span className="badge badge-blue">Ready for Booking</span>
                   )}
                </div>
              </div>

              {viewMode === "grid" ? (
                <ToolAvailabilityGrid
                    toolCode={selectedTool.code}
                    date={selectedDate}
                    gmtOffset={selectedTool.location?.city?.gmt_offset ?? 7}
                />
              ) : (
                <div className="table-container" style={{ maxHeight: '450px', overflowX: 'auto', overflowY: 'auto', position: 'relative', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: isMobile ? "600px" : "auto" }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '12px', fontSize: '0.85rem', background: 'white', borderBottom: '2px solid #f1f5f9' }}>Tanggal & Waktu</th>
                                <th style={{ padding: '12px', fontSize: '0.85rem', background: 'white', borderBottom: '2px solid #f1f5f9' }}>Saldo Awal</th>
                                <th style={{ padding: '12px', fontSize: '0.85rem', background: 'white', borderBottom: '2px solid #f1f5f9' }}>Qty</th>
                                <th style={{ padding: '12px', fontSize: '0.85rem', background: 'white', borderBottom: '2px solid #f1f5f9' }}>Saldo Akhir</th>
                                <th style={{ padding: '12px', fontSize: '0.85rem', background: 'white', borderBottom: '2px solid #f1f5f9' }}>Referensi Planning</th>
                                <th style={{ padding: '12px', fontSize: '0.85rem', background: 'white', borderBottom: '2px solid #f1f5f9' }}>Keterangan</th>
                                <th style={{ padding: '12px', fontSize: '0.85rem', background: 'white', borderBottom: '2px solid #f1f5f9', textAlign: 'center' }}>Aplikasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.length > 0 ? reservations.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{r.stock_before ?? '-'}</td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: r.type === 'OUT' ? '#ef4444' : '#10b981' }}>
                                        {r.type === 'OUT' ? '-' : '+'}{r.quantity}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 700 }}>{r.stock_after ?? '-'}</td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>#{r.reference_id}</td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>{r.notes}</td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', textAlign: 'center' }}>
                                        {r.reference_type === 'PLANNING' && (
                                            <button 
                                                onClick={() => handleOpenApp(r.reference_id)}
                                                style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                                <i className="fas fa-external-link-alt"></i> Buka
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada riwayat transaksi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", padding: '4rem' }}>
              <div style={{ width: '100px', height: '100px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <i className="fas fa-search fa-3x"></i>
              </div>
              <h4 style={{ color: '#475569', marginBottom: '8px' }}>Mulai Pengecekan</h4>
              <p style={{ textAlign: 'center' }}>Pilih peralatan uji untuk memantau jadwal reservasi dan ketersediaan stok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolAvailabilityPage;
