import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";

const ScoringLevelsPage = ({ onEdit, onAdd, refreshTrigger }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [filteredEndpoint, setFilteredEndpoint] = useState("/scoring-levels");

  // Fetch unique groups once on component mount or refresh
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const result = await apiRequest("/scoring-levels");
        const dataArray = Array.isArray(result) ? result : (result && result.data ? result.data : []);
        if (dataArray.length > 0) {
          // Extract unique group codes
          const uniqueGroups = [...new Set(dataArray.map(item => item.level_group_code))].filter(Boolean);
          setGroups(uniqueGroups.sort());
        }
      } catch (err) {
        console.error("Error fetching unique groups:", err);
      }
    };
    fetchGroups();
  }, [refreshTrigger]);

  // Update endpoint when group filter changes
  useEffect(() => {
    if (selectedGroup) {
      setFilteredEndpoint(`/scoring-levels?level_group_code=${selectedGroup}`);
    } else {
      setFilteredEndpoint("/scoring-levels");
    }
  }, [selectedGroup]);

  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedSlId, setSelectedSlId] = useState(null);

  const fetchHistory = async (slId = null) => {
    setHistLoading(true);
    try {
      const endpoint = slId ? `/hist-scoring-levels?sl_id=${slId}` : `/hist-scoring-levels`;
      const result = await apiRequest(endpoint);
      if (result) {
        let rawData = result;
        if (!Array.isArray(rawData)) rawData = rawData.data || [rawData];
        setHistData(rawData);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistLoading(false);
    }
  };

  const handleRowClick = (item) => {
    setSelectedSlId(item.id);
    setIsHistModalOpen(true);
    fetchHistory(item.id);
  };

  const handleShowAllHistory = () => {
    setSelectedSlId(null);
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

  const columns = [
    { key: "level_group_code", header: "Grup Level" },
    { key: "min_score", header: "Skor Min" },
    { key: "max_score", header: "Skor Max" },
    { key: "label", header: "Label" },
    { key: "description", header: "Deskripsi" },
  ];

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div 
        style={{ 
          background: "#fff", 
          padding: "1.25rem", 
          borderRadius: "12px", 
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#f1f5f9", padding: "0.5rem", borderRadius: "8px" }}>
            <i className="fas fa-filter" style={{ color: "#64748b" }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>
              Filter berdasarkan Grup Level
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "300px",
                padding: "0.5rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#1e293b",
                outline: "none"
              }}
            >
              <option value="">-- Semua Grup Level --</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <MasterDataPage 
        title="Level Penilaian" 
        endpoint={filteredEndpoint} 
        crudEndpoint="/management/scoring-levels" 
        columns={columns} 
        onAdd={onAdd} 
        onEdit={onEdit} 
        refreshTrigger={`${refreshTrigger}-${selectedGroup}`} 
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
        searchField="search"
        searchPlaceholder="Cari Grup Level atau Label..."
      />

      {/* History Modal */}
      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Perubahan ${selectedSlId ? `(ID: ${selectedSlId})` : "Keseluruhan"}`}
        wide
      >
        <div style={{ padding: "1.5rem", maxWidth: "100%" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Hist ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Level ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Grup</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Min</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Max</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Label</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Waktu</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>User (C/U/D)</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat data...
                    </td>
                  </tr>
                ) : histData.length > 0 ? (
                  histData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.sl_id}</td>
                      <td>{item.level_group_code}</td>
                      <td>{item.min_score}</td>
                      <td>{item.max_score}</td>
                      <td>{item.label}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          <span><strong>C:</strong> {item.created_user || "-"}</span>
                          <span><strong>U:</strong> {item.updated_user || "-"}</span>
                          <span style={{ color: item.deleted_user ? '#ef4444' : 'inherit' }}><strong>D:</strong> {item.deleted_user || "-"}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
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

export default ScoringLevelsPage;
