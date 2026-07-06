import React, { useState, useEffect } from "react";
import { apiRequest, formatDate } from "@models/api";
import Modal from "@components/Modal";

const Dashboard = ({ apps, onRefresh }) => {
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingApps, setPendingApps] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(0); // Minutes, 0 = OFF
  
  const [statsData, setStatsData] = useState({
    total_equipment_testing: 0,
    pending_reviews: 0,
    status_summary: [],
    uptime: "0h 0m",
    as_of: "-",
    boot_time: null,
    period_days: 0,
    period_start: ""
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (loadingStats) return;
    setLoadingStats(true);
    try {
      // Tambahkan timeout 10 detik agar tombol refresh tidak stuck selamanya jika server hang
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 10000)
      );
      
      const endpoint = isManual ? "/dashboard-stats?refresh=true" : "/dashboard-stats";
      const res = await Promise.race([
        apiRequest(endpoint),
        timeoutPromise
      ]);

      if (res) setStatsData(res);
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Jika error karena auth, biarkan apiRequest yang menangani (reload)
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchStats(true); // Auto-refresh juga bypass cache agar data selalu update
      onRefresh();
    }, refreshInterval * 60000);
    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  const [hoveredPoint, setHoveredPoint] = useState(null);

  const stats = [
    { label: "Total Equipment Testing", value: statsData.total_equipment_testing, icon: "fas fa-truck-loading", color: "#3b82f6", trend: statsData.period_days ? `${statsData.period_days} Hari` : "-" },
    { label: "System Uptime", value: statsData.uptime, icon: "fas fa-check-circle", color: "#10b981", trend: "Online" },
    { label: "Pending Reviews", value: statsData.pending_reviews, icon: "fas fa-clock", color: "#ef4444", trend: "Action Required" },
  ];

  const handleShowAuditHistory = (app) => {
    setShowAuditHistory(true);
    setAuditLoading(true);
    apiRequest(`/applications/${app.id}/audit-history`).then(data => {
      setAuditHistory(data || []);
      setAuditLoading(false);
    });
  };

  const handleShowPendingDetails = () => {
    if (statsData.pending_reviews === 0) return;
    setShowPendingModal(true);
    setLoadingPending(true);
    // Fetch applications with status REGISTERED from current partition
    apiRequest(`/applications?status=REGISTERED&limit=50`).then(data => {
      setPendingApps(data?.data || []);
      setLoadingPending(false);
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      REGISTERED: "#3b82f6", VERIFIED: "#10b981", APPROVED: "#3b82f6",
      PLANNED: "#3b82f6", EXECUTED: "#6b7280", ANALYZED: "#8b5cf6",
      CERTIFIED: "#10b981", FINALIZED: "#10b981", REVISI: "#ef4444", CANCELLED: "#94a3b8"
    };
    return colors[status?.toUpperCase()] || "#6b7280";
  };

  const formatSLA = (currentDate, prevDate) => {
    if (!prevDate) return "-";
    const diff = new Date(currentDate) - new Date(prevDate);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 0) return "000 00:00:00";

    const days = Math.floor(seconds / (3600 * 24));
    const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    // Format: ddd hh:mm:ss (Contoh: 001 02:30:15)
    return `${String(days).padStart(3, '0')} ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div id="dashboard-section" className="section-view active">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div>
           <h2 style={{ margin: 0, fontSize: "1.75rem", color: "#1e293b", fontWeight: 700 }}>Dashboard Overview</h2>
           <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
             Data as of: <span style={{ fontWeight: 600 }}>{statsData.as_of}</span> 
             {statsData.period_start && <span style={{ marginLeft: "1rem", color: "#94a3b8" }}> (Periode: {statsData.period_start} s/d Hari ini)</span>}
           </p>
           {loadingStats && (
             <p style={{ margin: "5px 0 0 0", color: "#3b82f6", fontSize: "0.8rem", fontWeight: 600 }}>
               <i className="fas fa-spinner fa-spin" style={{ marginRight: "5px" }}></i> Retrieving data...
             </p>
           )}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", background: "#f1f5f9", padding: "5px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
             <i className="fas fa-sync-alt" style={{ marginRight: "8px", fontSize: "0.8rem", color: "#64748b" }}></i>
             <select 
               value={refreshInterval} 
               onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
               style={{ background: "transparent", border: "none", outline: "none", fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}
             >
               <option value={0}>Auto Refresh: OFF</option>
               <option value={1}>1 Menit</option>
               <option value={5}>5 Menit</option>
               <option value={10}>10 Menit</option>
               <option value={20}>20 Menit</option>
               <option value={30}>30 Menit</option>
               <option value={40}>40 Menit</option>
               <option value={50}>50 Menit</option>
               <option value={60}>60 Menit</option>
             </select>
          </div>
          <button className="btn btn-secondary" onClick={() => { fetchStats(true); onRefresh(); }} disabled={loadingStats}>
            <i className={`fas fa-sync-alt ${loadingStats ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card" key={i} onClick={s.label === "Pending Reviews" ? handleShowPendingDetails : null} style={{ cursor: s.label === "Pending Reviews" ? "pointer" : "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                <i className={s.icon}></i>
              </div>
              {s.label === "Pending Reviews" && s.value > 0 && (
                <span style={{ color: s.color, fontSize: "0.65rem", background: "#fef2f2", padding: "2px 8px", borderRadius: "10px", border: "1px solid #fee2e2" }}>
                  <i className="fas fa-search" style={{ marginRight: "4px" }}></i> Klik Detail
                </span>
              )}
              <span style={{ color: s.color, fontSize: "0.75rem", fontWeight: 700 }}>{s.trend}</span>
            </div>
            <div className="stat-value">{loadingStats ? "..." : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div className="card">
          <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              <i className="fas fa-chart-line" style={{ marginRight: "10px", color: "#3b82f6" }}></i>
              Trend Trafik Testing Application (Harian)
            </span>
            <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", color: "#64748b" }}>
              <i className="fas fa-calendar-day" style={{ marginRight: "5px" }}></i> {statsData.period_days} Hari Terakhir
            </span>
          </div>

          {/* Custom SVG Line Chart */}
          <div style={{ height: "250px", width: "100%", padding: "20px 0", position: "relative" }}>
            {statsData.daily_traffic && statsData.daily_traffic.length > 1 ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  ))}

                  {/* The Path */}
                  <path
                    d={`M ${statsData.daily_traffic.map((t, i) => {
                      const x = (i / (statsData.daily_traffic.length - 1)) * 800;
                      const maxVal = Math.max(...statsData.daily_traffic.map(d => d.count), 5);
                      const y = 180 - (t.count / maxVal) * 160;
                      return `${x},${y}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Gradient Area */}
                  <path
                    d={`M 0,200 L ${statsData.daily_traffic.map((t, i) => {
                      const x = (i / (statsData.daily_traffic.length - 1)) * 800;
                      const maxVal = Math.max(...statsData.daily_traffic.map(d => d.count), 5);
                      const y = 180 - (t.count / maxVal) * 160;
                      return `${x},${y}`;
                    }).join(' L ')} L 800,200 Z`}
                    fill="url(#chartGradient)"
                  />

                  {/* Points & Interactive Zones */}
                  {statsData.daily_traffic.map((t, i) => {
                    const x = (i / (statsData.daily_traffic.length - 1)) * 800;
                    const maxVal = Math.max(...statsData.daily_traffic.map(d => d.count), 5);
                    const y = 180 - (t.count / maxVal) * 160;
                    const isHovered = hoveredPoint?.index === i;
                    
                    return (
                      <g key={i}>
                        {isHovered && (
                          <line x1={x} y1="0" x2={x} y2="200" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                        )}
                        <circle 
                          cx={x} 
                          cy={y} 
                          r={isHovered ? "7" : "4"} 
                          fill={isHovered ? "#3b82f6" : "white"} 
                          stroke="#3b82f6" 
                          strokeWidth="2" 
                          style={{ transition: "all 0.2s ease", cursor: "pointer" }}
                        />
                        {/* Large invisible circle for easier hovering */}
                        <circle 
                          cx={x} cy={y} r="20" fill="transparent" 
                          onMouseEnter={() => setHoveredPoint({ ...t, x, y, index: i })}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onClick={() => setHoveredPoint({ ...t, x, y, index: i })}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredPoint && (
                  <div style={{
                    position: "absolute",
                    left: `${(hoveredPoint.index / (statsData.daily_traffic.length - 1)) * 100}%`,
                    top: `${(hoveredPoint.y / 200) * 100}%`,
                    transform: "translate(-50%, -120%)",
                    background: "#1e293b",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    zIndex: 10,
                    transition: "all 0.1s ease"
                  }}>
                    <div style={{ fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px", marginBottom: "4px" }}>
                      {new Date(hoveredPoint.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                      <span>Registrasi:</span>
                      <span style={{ color: "#60a5fa", fontWeight: 800 }}>{hoveredPoint.count}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                <i className="fas fa-chart-area" style={{ fontSize: "3rem", marginBottom: "10px" }}></i>
                <p>Data tidak cukup untuk membuat grafik</p>
              </div>
            )}
            
            {/* X-Axis Labels (Date) */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600 }}>
               {statsData.daily_traffic?.length > 0 && (
                 <>
                   <span>{new Date(statsData.daily_traffic[0].date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                   <span>{new Date(statsData.daily_traffic[Math.floor(statsData.daily_traffic.length / 2)].date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                   <span>{new Date(statsData.daily_traffic[statsData.daily_traffic.length - 1].date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                 </>
               )}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                 <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Informasi Database</span>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                    <i className="fas fa-database" style={{ color: "#3b82f6", fontSize: "0.8rem" }}></i>
                    <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}>{statsData.target_partition || "Partition Table"}</span>
                 </div>
               </div>
               <div style={{ textAlign: "right" }}>
                 <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>Query teroptimasi menggunakan indexing harian.</p>
                 <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>Data dipartisi per bulan (Table Partitioning).</p>
               </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Testing Summary Per Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {loadingStats ? <p>Loading summary...</p> : (
              <>
                {statsData.status_summary && statsData.status_summary.length > 0 ? (
                  statsData.status_summary.map((ss, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                         <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusColor(ss.status) }}></div>
                         <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>{ss.status}</span>
                      </div>
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>{ss.count}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", padding: "10px" }}>Tidak ada data pada periode ini</p>
                )}
                <div style={{ marginTop: "10px", padding: "10px", borderTop: "1px dashed #e2e8f0", display: "flex", justifyContent: "space-between" }}>
                   <span style={{ fontWeight: 700, color: "#1e293b" }}>Total Semua</span>
                   <span style={{ fontWeight: 800, color: "#3b82f6" }}>{statsData.total_equipment_testing}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showPendingModal} 
        onClose={() => setShowPendingModal(false)} 
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <i className="fas fa-clock" style={{ marginRight: "10px", color: "#ef4444" }}></i>
            Aplikasi Menunggu Verifikasi
          </div>
        } 
        wide
      >
        <div style={{ padding: "1.5rem" }}>
          {loadingPending ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#3b82f6" }}></i>
              <p style={{ marginTop: "10px", color: "#64748b" }}>Memuat data...</p>
            </div>
          ) : pendingApps.length > 0 ? (
            <div className="table-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}>
                        <th style={{ padding: "12px", color: "#64748b", fontSize: "0.85rem" }}>No. Registrasi</th>
                        <th style={{ padding: "12px", color: "#64748b", fontSize: "0.85rem" }}>PIC / Instansi</th>
                        <th style={{ padding: "12px", color: "#64748b", fontSize: "0.85rem" }}>Tgl. Daftar</th>
                        <th style={{ padding: "12px", color: "#64748b", fontSize: "0.85rem" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApps.map((app, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#1e293b" }}>{app.reg_number}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ fontWeight: 600, color: "#334155" }}>{app.pic_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{app.partner_name || "Internal"}</div>
                          </td>
                          <td style={{ padding: "12px", fontSize: "0.85rem", color: "#64748b" }}>
                            {new Date(app.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span className="badge" style={{ background: "#eff6ff", color: "#1e40af", fontSize: "0.7rem", padding: "4px 8px", border: "1px solid #dbeafe" }}>
                              {app.status || "REGISTERED"}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: "6px 14px", fontSize: "0.75rem", borderRadius: "6px" }}
                              onClick={() => {
                                window.location.href = `#/applications?search=${app.reg_number}`;
                                setShowPendingModal(false);
                              }}
                            >
                              <i className="fas fa-check-circle" style={{ marginRight: "5px" }}></i> Verifikasi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              <i className="fas fa-check-double" style={{ fontSize: "3rem", marginBottom: "1rem", color: "#10b981" }}></i>
              <p style={{ fontWeight: 600, color: "#475569" }}>Luar Biasa!</p>
              <p>Semua aplikasi pendaftaran telah diverifikasi.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showAuditHistory} onClose={() => setShowAuditHistory(false)} title="Riwayat Status" wide>
        <div style={{ padding: '1rem' }}>
          {auditLoading ? <p>Loading...</p> : (
            <div className="table-container">
              <table style={{ width: "100%" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "10px", fontSize: "0.85rem" }}>Tanggal</th>
                    <th style={{ padding: "10px", fontSize: "0.85rem" }}>Status</th>
                    <th style={{ padding: "10px", fontSize: "0.85rem" }}>User</th>
                    <th style={{ padding: "10px", fontSize: "0.85rem", color: "#3b82f6" }}>SLA (Durasi)</th>
                    <th style={{ padding: "10px", fontSize: "0.85rem" }}>IP Address</th>
                    <th style={{ padding: "10px", fontSize: "0.85rem" }}>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {auditHistory.map((h, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px", fontSize: "0.85rem", color: "#475569" }}>{h.created_at_formatted}</td>
                      <td style={{ padding: "10px" }}>
                        <span className="badge" style={{ background: `${getStatusColor(h.status)}20`, color: getStatusColor(h.status), border: `1px solid ${getStatusColor(h.status)}40` }}>
                          {h.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px", fontSize: "0.85rem", fontWeight: 600 }}>{h.created_user || "System"}</td>
                      <td style={{ padding: "10px", fontSize: "0.85rem" }}>
                         <span style={{ color: "#0891b2", fontWeight: 700 }}>
                           {formatSLA(h.created_at, auditHistory[i+1]?.created_at)}
                         </span>
                      </td>
                      <td style={{ padding: "10px", fontSize: '0.75rem', color: '#64748b' }}>{h.ip_address || "-"}</td>
                      <td style={{ padding: "10px", fontSize: '0.7rem', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={h.user_agent}>
                        {h.user_agent || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
