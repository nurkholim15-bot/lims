import React, { useState, useEffect } from "react";
import { apiRequest, formatDate } from "@models/api";
import { printRegistrationProof } from "@utils/print";
import Modal from "@components/Modal";
import { useToast } from '@context/ToastContext';

const Submission = ({ currentUser, onOpenModal, applications = [], appConfig = {}, filters = {}, refreshData }) => {
  const { showToast } = useToast();
  const getPartitionName = () => {
    const mm = (filters.month || (new Date().getMonth() + 1)).toString().padStart(2, '0');
    const yy = filters.year || new Date().getFullYear();
    return `testing_applications_${yy}${mm}`;
  };

  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const apps = applications;

  const fetchAuditHistory = async (appId) => {
    setAuditLoading(true);
    try {
      const data = await apiRequest(`/applications/${appId}/audit-history`);
      setAuditHistory(data || []);
    } catch (error) {
      console.error("Error fetching audit history:", error);
      setAuditHistory([]);
    }
    setAuditLoading(false);
  };

  const handleShowAuditHistory = (app) => {
    setSelectedAppId(app.id);
    setShowAuditHistory(true);
    fetchAuditHistory(app.id);
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "REVISI" || s === "REJECTED" || s === "CANCELED") return "badge-danger";
    if (s === "REGISTERED") return "badge-blue";
    return "badge-gray";
  };

  const getStatusColor = (status) => {
    const colors = {
      REGISTERED: "#3b82f6",
      REVISI: "#ef4444",
      CANCELED: "#ef4444",
      REJECTED: "#ef4444",
    };
    return colors[(status || "").toUpperCase()] || "#6b7280";
  };

  const handleCancel = async (app) => {
    const confirmed = window.confirmAsync ? await window.confirmAsync(`Apakah Anda yakin ingin membatalkan pengajuan ${app.reg_number}?`) : window.confirm(`Apakah Anda yakin ingin membatalkan pengajuan ${app.reg_number}?`);
    if (!confirmed) return;
    
    try {
      const res = await apiRequest(`/applications/${app.id}/cancel`, "PUT");
      if (res) {
        showToast('Pengajuan berhasil dibatalkan.', 'success');
        if (refreshData) refreshData();
      }
    } catch (err) {
      showToast('Gagal membatalkan pengajuan: ' + err.message, 'error');
    }
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
    <div id="submission-section" className="section-view active">
      <div className="card">
        <div className="card-title" style={{ marginBottom: "0.25rem" }}>
          <span>Registrasi & Pengajuan Uji</span>
          <button className="btn btn-primary" onClick={() => onOpenModal()}>
            <i className="fas fa-plus"></i> Buat Pengajuan Baru
          </button>
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginBottom: "1rem" }}>
            <i className="fas fa-database"></i> {appConfig.COMPANY_NAME || "System"} - <span style={{ color: "#3b82f6" }}>Querying on: <code>{getPartitionName()}</code></span>
        </div>

        <table>
          <thead>
            <tr>
              <th>App ID</th>
              <th>No Reg</th>
              <th>Peralatan</th>
              <th>Pemohon</th>
              <th>Kategori</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {apps.length > 0 ? (
              apps.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 800, color: "#1e293b" }}>{a.id}</td>
                  <td style={{ fontWeight: 600, color: "#1e293b" }}>
                    {a.reg_number}
                    {a.equipment_total > 1 && (
                      <span style={{ marginLeft: "6px", padding: "2px 6px", backgroundColor: "#f1f5f9", borderRadius: "12px", fontSize: "0.75rem", border: "1px solid #e2e8f0" }}>
                        {a.equipment_no}/{a.equipment_total}
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{a.equipment?.equipment_name || "N/A"}</td>
                  <td>{a.partner?.name || "N/A"}</td>
                  <td>{a.partner?.type?.name || "N/A"}</td>
                  <td>{formatDate(a.created_at)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button className="btn btn-secondary" style={{ fontSize: "0.7rem", padding: "4px 8px" }} onClick={() => printRegistrationProof(a, appConfig)}>
                        <i className="fas fa-print"></i> Bukti
                      </button>
                      <button className="btn" style={{ fontSize: "0.7rem", padding: "4px 8px", backgroundColor: "#8b5cf6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={() => handleShowAuditHistory(a)}>
                        <i className="fas fa-history"></i> History
                      </button>
                      {(currentUser?.role === "OPERATOR_REG" || currentUser?.role === "OPERATOR" || currentUser?.role === "ADMIN") && 
                       (a.status?.toUpperCase() === "REVISI" || a.status?.toUpperCase() === "REGISTERED") && (
                        <>
                          <button className="btn btn-primary" style={{ fontSize: "0.7rem", padding: "4px 8px" }} onClick={() => onOpenModal(a)}>
                            Edit
                          </button>
                          <button className="btn btn-danger" style={{ fontSize: "0.7rem", padding: "4px 8px" }} onClick={() => handleCancel(a)}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  Tidak ada data pengajuan yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAuditHistory} onClose={() => setShowAuditHistory(false)} title="Riwayat Status" wide>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {auditLoading ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Loading...</p>
          ) : auditHistory.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>Tanggal</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>User</th>
                  <th style={{ padding: "8px", textAlign: "left", color: "#3b82f6" }}>SLA (Durasi)</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>IP</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {auditHistory.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px", color: "#475569" }}>{record.created_at_formatted}</td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: getStatusColor(record.status),
                          color: "white",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: "8px", color: "#475569" }}>{record.created_user || "System"}</td>
                    <td style={{ padding: "8px", fontSize: "0.85rem" }}>
                       <span style={{ color: "#0891b2", fontWeight: 700 }}>
                         {formatSLA(record.created_at, auditHistory[idx+1]?.created_at)}
                       </span>
                    </td>
                    <td style={{ padding: "8px", color: "#64748b", fontSize: '0.75rem' }}>{record.ip_address || "-"}</td>
                    <td style={{ padding: "8px", color: "#94a3b8", fontSize: '0.7rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.user_agent}>
                      {record.user_agent || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>Tidak ada riwayat audit.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Submission;
