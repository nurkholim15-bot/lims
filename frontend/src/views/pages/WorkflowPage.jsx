import React, { useState, useEffect } from "react";
import { apiRequest, formatDate } from "@models/api";
import { printTechnicalReport, printRegistrationProof } from "@utils/print";
import Modal from "@components/Modal";
import { useToast } from '@context/ToastContext';

const WorkflowPage = ({ appConfig, apps = [], setApps, fetchApplications, stage, title, targetStatus, actionLabel, onAction }) => {
  const { showToast } = useToast();
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  console.log(`WorkflowPage [${stage}] apps:`, apps);
  
  const isGlobalSearch = stage === "global-search" || stage === "global_search" || stage === "query";
  const isFixedStage = stage !== "query" && stage !== "global-search" && stage !== "global_search";

  const [hasSearched, setHasSearched] = useState(false);
  const [actualSourceTable, setActualSourceTable] = useState("");

  const [filters, setFilters] = useState({ 
    query: "", 
    status: targetStatus || "All", 
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    isGlobal: isGlobalSearch
  });

  // Sync internal filters with targetStatus when stage changes
  useEffect(() => {
    if (isFixedStage && targetStatus) {
      setFilters(prev => ({ ...prev, status: targetStatus }));
    }
  }, [stage, targetStatus, isFixedStage]);

  const getPartitionName = () => {
    if (actualSourceTable) return actualSourceTable;
    if (isGlobalSearch && stage !== "query") return "testing_applications (Unified)";
    const mm = filters.month.toString().padStart(2, '0');
    return `testing_applications_${filters.year}${mm}`;
  };

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    let result;
    const { month, year, status, query } = currentFilters;
    const fetchStatus = isFixedStage ? (targetStatus || status) : status;
    let start = "";
    let end = "";
    
    if (month && year) {
        const m = month.toString().padStart(2, '0');
        start = `${year}-${m}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        end = `${year}-${m}-${lastDay}`;
    }

    if (isGlobalSearch && stage !== "query") {
        result = await fetchApplications(1, "", { query: currentFilters.query, isGlobal: true });
    } else {
        result = await fetchApplications(1, "", { ...currentFilters, status: fetchStatus, start_date: start, end_date: end });
    }
    
    if (result && result.source_table) {
        setActualSourceTable(result.source_table);
    } else if (isGlobalSearch && stage !== "query") {
        setActualSourceTable("testing_applications (Unified)");
    }
    
    setLoading(false);
    setHasSearched(true);
  };

  useEffect(() => {
    if (isGlobalSearch && (stage === "global-search" || stage === "global_search")) {
        setApps([]);
    }
  }, [stage]);

  useEffect(() => {
    if (!isFixedStage) {
        // Reset search state when switching stages
        setHasSearched(false);
        setApps([]);
        setActualSourceTable("");
    }
    // CATATAN: fetchData() dihapus dari sini agar tidak tumpang tindih dengan App.jsx
    // WorkflowPage sekarang hanya akan melakukan fetch ketika tombol "Cari Data" ditekan.
  }, [filters.month, filters.year, filters.status, stage]);

  const handleSearch = () => {
    fetchData();
  };

  const showHistory = async (appId) => {
    setShowAuditHistory(true);
    setAuditLoading(true);
    try {
      const data = await apiRequest(`/applications/${appId}/audit-history`);
      setAuditHistory(data || []);
    } catch (error) { setAuditHistory([]); }
    setAuditLoading(false);
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
    return `${String(days).padStart(3, '0')} ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      REGISTERED: "badge-blue", VERIFIED: "badge-green", APPROVED: "badge-blue",
      PLANNED: "badge-blue", EXECUTED: "badge-gray", ANALYZED: "badge-blue",
      CERTIFIED: "badge-green", REVISI: "badge-danger", FINALIZED: "badge-green",
      CANCELED: "badge-danger", REJECTED: "badge-danger",
    };
    return badges[(status || "").toUpperCase()] || "badge-gray";
  };

  const statusOptions = [
    "All", "REGISTERED", "VERIFIED", "APPROVED", "PLANNED", 
    "EXECUTED", "ANALYZED", "REPORTING", "CERTIFIED", "FINALIZED", "REVISI", "CANCELED"
  ];

  // We hide the filter bar for global_search because it's already handled by GlobalSearchPage.jsx
  const hideFilterBar = stage === "global_search";

  return (
    <div id={`${stage}-section`} className="section-view active">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <div className="card-title" style={{ marginBottom: "0.25rem" }}>{title}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                <i className="fas fa-database"></i> {appConfig.COMPANY_NAME || "System"} - <span style={{ color: "#3b82f6" }}>Querying on: <code>{getPartitionName()}</code></span>
            </div>
          </div>
        </div>

        {!hideFilterBar && (
          <div className="filter-bar" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", padding: "1.25rem", background: "#f8fafc", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #e2e8f0", alignItems: "flex-end" }}>
            
            {isGlobalSearch && stage !== "query" ? (
              <>
                <div style={{ flex: isMobile ? "none" : 1, width: isMobile ? "100%" : "auto" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "0.5rem" }}>NOMOR REGISTRASI</label>
                  <input 
                      type="text"
                      className="form-control"
                      placeholder="MEC-YYYY-XXXXX"
                      style={{ height: "42px", fontSize: "1rem", fontWeight: 600 }}
                      value={filters.query}
                      onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSearch} style={{ height: "42px", width: isMobile ? "100%" : "auto", marginTop: isMobile ? "0.5rem" : "0", padding: "0 1.5rem" }}>
                  <i className="fas fa-search"></i> Cari
                </button>
              </>
            ) : (
              <>
                <div style={{ width: isMobile ? "100%" : "160px" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>BULAN</label>
                  <select className="form-control" value={filters.month} onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}>
                    {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((n, i) => (
                      <option key={i+1} value={i+1}>{n}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: isMobile ? "100%" : "100px" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>TAHUN</label>
                  <select className="form-control" value={filters.year} onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}>
                    {Array.from({ length: 7 }, (_, i) => {
                      const y = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={y} value={y}>{y}</option>
                      );
                    })}
                  </select>
                </div>
                {!isFixedStage && (
                  <div style={{ width: isMobile ? "100%" : "200px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>STATUS</label>
                      <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                      {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                  </div>
                )}
                {isFixedStage && (
                    <div style={{ width: isMobile ? "100%" : "150px" }}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>STATUS AKTIF</label>
                        <div style={{ height: "38px", display: "flex", alignItems: "center", fontWeight: 800, color: "#3b82f6", background: "#eff6ff", padding: "0 10px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                            {targetStatus}
                        </div>
                    </div>
                )}
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={(e) => {
                      e.preventDefault();
                      handleSearch();
                  }} 
                  style={{ height: "38px", width: isMobile ? "100%" : "auto", marginLeft: isMobile ? "0" : "auto", marginTop: isMobile ? "0.5rem" : "0" }}
                  disabled={loading}
                >
                  <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-search"}></i> {stage === "query" ? "Cari Data" : "Filter"}
                </button>
              </>
            )}
          </div>
        )}

        {!hasSearched && stage === "query" ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                <div style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    <i className="fas fa-search-plus"></i>
                </div>
                <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Siap Melakukan Pencarian</h3>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                    Silakan tentukan periode (Bulan & Tahun) serta filter lainnya, kemudian klik tombol <strong>Cari Data</strong> untuk menampilkan riwayat pengajuan.
                </p>
            </div>
        ) : (
        <div className="table-container" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto', position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
              <tr>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>App ID</th>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>No Reg</th>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Peralatan</th>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Pemohon</th>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Tanggal</th>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Status</th>
                {onAction && <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>{actionLabel}</th>}
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
            {(loading ? (
              <tr><td colSpan={onAction ? 8 : 7} style={{ textAlign: "center", padding: "2rem" }}><i className="fas fa-spinner fa-spin"></i> Memuat...</td></tr>
            ) : apps.length > 0 ? (
              apps.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 800 }}>{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.reg_number}</td>
                  <td>{a.equipment?.equipment_name || "N/A"}</td>
                  <td>{a.partner?.name || "N/A"}</td>
                  <td>{formatDate(a.created_at)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
                  </td>
                  {onAction && (
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => onAction(a)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                        <i className="fas fa-check-square"></i> {actionLabel}
                      </button>
                    </td>
                  )}
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn" style={{ fontSize: "0.75rem", padding: "4px 10px", background: '#8b5cf6', color: 'white' }} onClick={() => showHistory(a.id)}>
                        <i className="fas fa-history"></i>
                      </button>
                      {(stage === "query" || stage === "global-search") && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ fontSize: "0.75rem", padding: "4px 10px" }} 
                          onClick={async () => {
                            const statusUpper = (a.status || "").toUpperCase();
                            if (["CERTIFIED", "FINALIZED"].includes(statusUpper)) {
                              // For finalized/certified, we need full data (scores & results)
                              try {
                                const [detail, execData] = await Promise.all([
                                  apiRequest(`/applications/${a.id}`),
                                  apiRequest(`/applications/${a.id}/execution`)
                                ]);
                                
                                if (detail && execData) {
                                  printTechnicalReport(detail, execData, [], { 
                                    appConfig, 
                                    headerTitle: appConfig.CERT_HEADER_TITLE || "SERTIFIKAT HASIL PENGUJIAN (SHP)" 
                                  });
                                }
                              } catch (err) {
                                console.error("Failed to fetch data for printing:", err);
                                showToast("Gagal memuat data lengkap untuk pencetakan.", "error");
                              }
                            } else {
                              printRegistrationProof(a, appConfig);
                            }
                          }}
                        >
                          <i className="fas fa-print"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={onAction ? 8 : 7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Data tidak ditemukan pada {getPartitionName()}.</td></tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>

      <Modal isOpen={showAuditHistory} onClose={() => setShowAuditHistory(false)} title="Riwayat Status" wide>
        <div style={{ maxHeight: "400px", overflowY: "auto", padding: '1rem' }}>
          {auditLoading ? (
            <p style={{ textAlign: "center" }}>Loading...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Tanggal</th>
                  <th style={{ padding: "8px" }}>Status</th>
                  <th style={{ padding: "8px" }}>User</th>
                  <th style={{ padding: "8px", color: "#3b82f6" }}>SLA (Durasi)</th>
                  <th style={{ padding: "8px" }}>IP Address</th>
                  <th style={{ padding: "8px" }}>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {auditHistory.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px" }}>{record.created_at_formatted}</td>
                    <td style={{ padding: "8px" }}><span className="badge badge-blue">{record.status}</span></td>
                    <td style={{ padding: "8px", fontWeight: 600 }}>{record.created_user || "System"}</td>
                    <td style={{ padding: "8px", fontWeight: 700, color: "#0891b2" }}>
                       {formatSLA(record.created_at, auditHistory[idx+1]?.created_at)}
                    </td>
                    <td style={{ padding: "8px", fontSize: '0.75rem' }}>{record.ip_address || "-"}</td>
                    <td style={{ padding: "8px", fontSize: '0.7rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.user_agent}>
                      {record.user_agent || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WorkflowPage;
