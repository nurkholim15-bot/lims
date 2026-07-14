import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import Pagination from "@components/Pagination";

const RoleMenusHistPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  
  // History Modal State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`/roles?page=${page}`);
      if (result) {
        if (result.data) {
          setRoles(result.data);
          setTotal(result.metadata?.total || result.data.length);
          setLimit(result.metadata?.limit || 10);
        } else {
          setRoles(Array.isArray(result) ? result : []);
          setTotal(Array.isArray(result) ? result.length : 0);
        }
      }
    } catch (err) {
      console.error("Fetch roles error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (roleId = null) => {
    setHistLoading(true);
    try {
      const endpoint = roleId ? `/hist-role-menus?role_id=${roleId}` : `/hist-role-menus`;
      const result = await apiRequest(endpoint);
      if (result) {
        setHistData(Array.isArray(result) ? result : (result.data || []));
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  const handleRowClick = (role) => {
    setSelectedRole(role);
    setIsHistModalOpen(true);
    fetchHistory(role.id);
  };

  const handleShowAllHistory = () => {
    setSelectedRole(null);
    setIsHistModalOpen(true);
    fetchHistory(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[date.getMonth()];
    return `${date.getDate()} ${monthName} ${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Riwayat Hak Akses Menu</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Pilih role untuk melihat riwayat perubahan menu</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handleShowAllHistory}>
              <i className="fas fa-history"></i> Riwayat Seluruh Role
            </button>
            <button
              onClick={() => navigate("/welcome")}
              style={{
                background: "#475569",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <i className="fas fa-times"></i> Tutup
            </button>
          </div>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Nama Role</th>
                <th>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "3rem" }}>
                    <i className="fas fa-spinner fa-spin"></i> Memuat data...
                  </td>
                </tr>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <tr 
                    key={role.id} 
                    onClick={() => handleRowClick(role)}
                    style={{ cursor: 'pointer' }}
                    className="hoverable-row"
                  >
                    <td>{role.id}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{role.name}</td>
                    <td style={{ color: '#64748b' }}>{role.description || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    Tidak ada data role tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          current={page} 
          total={total} 
          limit={limit} 
          onPageChange={setPage} 
        />
      </div>

      {/* History Modal */}
      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Hak Akses Menu ${selectedRole ? `(Role: ${selectedRole.name})` : "Seluruh Role"}`}
        wide
      >
        <div style={{ padding: "1.5rem", maxWidth: "100%" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Role</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Menu (Title)</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Waktu Hapus</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>User (C/D)</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat data...
                    </td>
                  </tr>
                ) : histData.length > 0 ? (
                  histData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td style={{ fontWeight: 600 }}>{item.role_name || `Role ID: ${item.role_id}`}</td>
                      <td>{item.menu_title || `Menu ID: ${item.menu_id}`}</td>
                      <td>{formatDate(item.deleted_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          <span><strong style={{ color: '#10b981' }}>C:</strong> {item.created_user || "-"}</span>
                          <span><strong style={{ color: '#ef4444' }}>D:</strong> {item.deleted_user || "-"}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                      Belum ada riwayat perubahan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button className="btn btn-secondary" onClick={() => setIsHistModalOpen(false)}>Tutup</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleMenusHistPage;
