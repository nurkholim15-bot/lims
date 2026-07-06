import React, { useState, useEffect } from "react";
import { apiRequest, formatDate } from "@models/api";
import Modal from "@components/Modal";

const Planning = ({ applications = [], onRefresh, onOpenPlan, currentUser, appConfig = {} }) => {
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Month/Year Filter (Standard for all workflow pages)
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "APPROVED"
  });

  useEffect(() => {
    onRefresh(filters);
  }, [filters.month, filters.year]);

  const getPartitionName = () => {
    const mm = filters.month.toString().padStart(2, '0');
    return `testing_applications_${filters.year}${mm}`;
  };

  const handleOpenPlan = (app) => {
    onOpenPlan(app);
  };

  const showHistory = async (appId) => {
    setShowAuditHistory(true);
    setAuditLoading(true);
    try {
      const data = await apiRequest(`/applications/${appId}/audit-history`);
      setAuditHistory(data || []);
    } catch (error) {
      setAuditHistory([]);
    }
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

  return (
    <div id="planning-section" className="section-view active">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <div className="card-title" style={{ marginBottom: "0.25rem" }}>Perencanaan Pengujian (Planning)</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                <i className="fas fa-database"></i> {appConfig.COMPANY_NAME || "System"} - <span style={{ color: "#3b82f6" }}>Querying on: <code>{getPartitionName()}</code></span>
            </div>
          </div>
        </div>
        
        <div className="filter-bar" style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            <div style={{ width: "200px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>Bulan</label>
              <select className="form-control" value={filters.month} onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}>
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div style={{ width: "150px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>Tahun</label>
              <select className="form-control" value={filters.year} onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}>
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => onRefresh(filters)}>
              <i className="fas fa-search"></i> Tampilkan
            </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>App ID</th>
              <th>No Reg</th>
              <th>Peralatan</th>
              <th>Pemohon</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 800 }}>{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.reg_number}</td>
                  <td>{a.equipment?.equipment_name || "N/A"}</td>
                  <td>{a.partner?.name || "N/A"}</td>
                  <td>{formatDate(a.created_at)}</td>
                  <td><span className="badge badge-blue">{a.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-primary" onClick={() => handleOpenPlan(a)}>
                        <i className="fas fa-calendar-alt"></i> Buat Perencanaan
                      </button>
                      <button className="btn" style={{ background: "#8b5cf6", color: "white" }} onClick={() => showHistory(a.id)}>
                        <i className="fas fa-history"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Tidak ada data pada <code>{getPartitionName()}</code></td></tr>
            )}
          </tbody>
        </table>
      </div>


      <Modal isOpen={showAuditHistory} onClose={() => setShowAuditHistory(false)} title="Riwayat Status" wide>
         <div style={{ maxHeight: "400px", overflowY: "auto", padding: '1rem' }}>
          {auditLoading ? <p style={{textAlign:"center"}}>Loading...</p> : (
            <table style={{width: "100%", borderCollapse: "collapse", fontSize: "0.85rem"}}>
              <thead>
                <tr style={{backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1", textAlign: "left"}}>
                  <th style={{padding:"8px"}}>Tanggal</th>
                  <th style={{padding:"8px"}}>Status</th>
                  <th style={{padding:"8px"}}>User</th>
                  <th style={{padding:"8px", color: "#3b82f6"}}>SLA (Durasi)</th>
                  <th style={{padding:"8px"}}>IP Address</th>
                  <th style={{padding:"8px"}}>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {auditHistory.map((record, idx) => (
                  <tr key={idx} style={{borderBottom: "1px solid #f1f5f9"}}>
                    <td style={{padding:"8px"}}>{record.created_at_formatted}</td>
                    <td style={{padding:"8px"}}><span className="badge badge-blue">{record.status}</span></td>
                    <td style={{padding:"8px", fontWeight: 600}}>{record.created_user || "System"}</td>
                    <td style={{padding:"8px", fontWeight: 700, color: "#0891b2"}}>
                      {formatSLA(record.created_at, auditHistory[idx+1]?.created_at)}
                    </td>
                    <td style={{padding:"8px", fontSize:'0.75rem', color: '#64748b'}}>{record.ip_address || "-"}</td>
                    <td style={{padding:"8px", fontSize:'0.7rem', color: '#94a3b8', maxWidth: '150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={record.user_agent}>
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

export default Planning;
