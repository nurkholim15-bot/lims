import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import { useToast } from '@context/ToastContext';

const UserSessionsPage = ({ refreshTrigger }) => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/user-sessions");
      if (data) {
        setSessions(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      showToast('Gagal memuat data sesi: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    const confirmed = window.confirmAsync ? await window.confirmAsync("Apakah Anda yakin ingin menghapus sesi ini?") : confirm("Apakah Anda yakin ingin menghapus sesi ini?");
    if (!confirmed) return;
    try {
      await apiRequest(`/management/user-sessions/${id}`, "DELETE");
      setSessions(sessions.filter((s) => s.id !== id));
      showToast('Sesi berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus sesi: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  const handleCleanupExpired = async () => {
    const confirmed = window.confirmAsync ? await window.confirmAsync("Hapus semua sesi yang telah kadaluarsa? (Periode yang dikonfigurasi di Global Parameters akan digunakan)") : confirm("Hapus semua sesi yang telah kadaluarsa? (Periode yang dikonfigurasi di Global Parameters akan digunakan)");
    if (!confirmed) return;
    setLoading(true);
    try {
      const result = await apiRequest("/management/user-sessions/cleanup/expired", "POST");
      if (result) {
        showToast(`Pembersihan selesai. ${result.deleted_count} sesi dihapus. Periode pembersihan: ${result.cleanup_hours} jam.`, 'success');
        fetchSessions();
      }
    } catch (err) {
      showToast('Gagal membersihkan sesi: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID");
    } catch {
      return dateString;
    }
  };

  const truncateToken = (token) => {
    if (!token) return "-";
    return token.substring(0, 20) + "...";
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            gap: "1rem",
          }}
        >
          <h2 style={{ margin: 0, color: "#065f46", fontSize: "1.4rem" }}>Sesi Pengguna</h2>
          <button
            onClick={handleCleanupExpired}
            disabled={loading}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "0.95rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fas fa-trash-alt"></i>
            {loading ? "Memproses..." : "Bersihkan Sesi Kadaluarsa"}
          </button>
        </div>

        {loading && sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            <p>Memuat data sesi...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
            <p>Tidak ada data sesi</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: "65vh", overflowY: "auto", borderBottom: "1px solid #e5e7eb" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f3f4f6",
                    borderBottom: "2px solid #d1d5db",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", borderRight: "1px solid #e5e7eb" }}>ID</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", borderRight: "1px solid #e5e7eb" }}>User ID</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", borderRight: "1px solid #e5e7eb" }}>Token</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", borderRight: "1px solid #e5e7eb" }}>Alamat IP</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", borderRight: "1px solid #e5e7eb" }}>Dibuat</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", borderRight: "1px solid #e5e7eb" }}>Kadaluarsa</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: isExpired(session.expires_at) ? "rgba(239, 68, 68, 0.05)" : "transparent",
                      hover: { background: "#f9fafb" },
                    }}
                  >
                    <td style={{ padding: "1rem", borderRight: "1px solid #e5e7eb" }}>{session.id}</td>
                    <td style={{ padding: "1rem", borderRight: "1px solid #e5e7eb" }}>{session.user_id}</td>
                    <td
                      style={{
                        padding: "1rem",
                        borderRight: "1px solid #e5e7eb",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                      title={session.token || "N/A"}
                    >
                      {truncateToken(session.token)}
                    </td>
                    <td style={{ padding: "1rem", borderRight: "1px solid #e5e7eb", fontSize: "0.9rem" }}>{session.ip_address || "-"}</td>
                    <td style={{ padding: "1rem", borderRight: "1px solid #e5e7eb", fontSize: "0.9rem" }}>{formatDate(session.created_at)}</td>
                    <td
                      style={{
                        padding: "1rem",
                        borderRight: "1px solid #e5e7eb",
                        fontSize: "0.9rem",
                        color: isExpired(session.expires_at) ? "#dc2626" : "#000",
                      }}
                    >
                      {formatDate(session.expires_at)}
                      {isExpired(session.expires_at) && <span style={{ marginLeft: "0.5rem", fontWeight: "bold" }}>(Kadaluarsa)</span>}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button
                        onClick={() => handleDelete(session.id)}
                        disabled={loading}
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                          fontSize: "0.85rem",
                          fontWeight: "500",
                        }}
                      >
                        <i className="fas fa-trash-alt"></i> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSessionsPage;
