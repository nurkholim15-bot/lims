import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";
import { useToast } from '@context/ToastContext';

const ScoringAspectsPage = ({ onEdit, onAdd, refreshTrigger }) => {
  const { showToast } = useToast();
  const [methodologyFilter, setMethodologyFilter] = useState("");
  const [allMethodologies, setAllMethodologies] = useState([]);

  // Fetch methodologies once on component mount
  useEffect(() => {
    const fetchMethodologies = async () => {
      try {
        const result = await apiRequest("/methodologies");
        if (result) {
          setAllMethodologies(Array.isArray(result) ? result : (result.data || []));
        }
      } catch (err) {
        console.error("Error fetching methodologies:", err);
      }
    };
    fetchMethodologies();
  }, []);

  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedSaId, setSelectedSaId] = useState(null);

  const fetchHistory = async (saId = null) => {
    setHistLoading(true);
    try {
      const endpoint = saId ? `/hist-scoring-aspects?sa_id=${saId}` : `/hist-scoring-aspects`;
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
    setSelectedSaId(item.code);
    setIsHistModalOpen(true);
    fetchHistory(item.code);
  };

  const handleShowAllHistory = () => {
    setSelectedSaId(null);
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

  // Build endpoint with methodology filter if selected
  const filteredEndpoint = methodologyFilter ? `/scoring-aspects?methodology_code=${methodologyFilter}` : `/scoring-aspects`;

  const cols = [
    { key: "code", header: "Kode" },
    { key: "name", header: "Nama Aspek" },
    { key: "methodology_code", header: "Kode Metodologi" },
    { key: "methodology_name", header: "Metodologi", render: (item) => (item.methodology ? item.methodology.name : "-") },
    { key: "weight", header: "Bobot (%)" },
    {
      key: "is_used",
      header: "Is Used",
      render: (item) => (
        <label className="switch" style={{ display: "inline-block", position: "relative", width: "42px", height: "18px" }}>
          <input
            type="checkbox"
            checked={item.is_used}
            onChange={async (e) => {
              try {
                // Copy item and toggle is_used
                const updatedItem = { ...item, is_used: e.target.checked };
                // Send update to server
                await apiRequest(`/management/scoring-aspects/${item.code}`, "PUT", updatedItem);
                // Trigger refresh by updating the state in the parent or using the refreshTrigger mechanism
                // Since this is inside ScoringAspectsPage, we can use a local setRefresh
                setLocalRefresh((prev) => prev + 1);
              } catch (err) {
                console.error("Gagal update is_used:", err);
                showToast('Gagal mengupdate status: ' + (err.message || 'Unknown error'), 'error');
              }
            }}
          />
          <span className="slider round"></span>
        </label>
      ),
    },
  ];

  const [localRefresh, setLocalRefresh] = useState(0);

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div>
      {/* Filter Section */}
      <div style={{ marginBottom: "1.5rem", padding: "1.2rem", background: "#e0f2f1", border: "2px solid #009688", borderRadius: "8px" }}>
        <label htmlFor="method-filter" style={{ fontWeight: 700, fontSize: "1rem", color: "#00695c", display: "block", marginBottom: "0.5rem" }}>
          <i className="fas fa-filter" style={{ marginRight: "0.5rem" }}></i>Filter Berdasarkan Metodologi:
        </label>
        <select
          id="method-filter"
          value={methodologyFilter}
          onChange={(e) => setMethodologyFilter(e.target.value)}
          style={{ width: "100%", padding: "0.75rem", border: "2px solid #009688", borderRadius: "6px", fontSize: "1rem", background: "#fff", cursor: "pointer", fontWeight: 500 }}
        >
          <option value="">-- Semua Metodologi --</option>
          {allMethodologies.map((m) => (
            <option key={m.code} value={m.code}>
              {m.code} - {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Master Data Table */}
      <MasterDataPage 
        title="Aspek Scoring" 
        endpoint={filteredEndpoint} 
        crudEndpoint="/management/scoring-aspects" 
        columns={cols} 
        onAdd={onAdd} 
        onEdit={onEdit} 
        refreshTrigger={`${refreshTrigger}-${methodologyFilter}-${localRefresh}`} 
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
        searchField="search"
        searchPlaceholder="Cari Nama atau Kode Aspek..."
      />

      {/* History Modal */}
      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Perubahan ${selectedSaId ? `(Code: ${selectedSaId})` : "Keseluruhan"}`}
        wide
      >
        <div style={{ padding: "1.5rem", maxWidth: "100%" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>SA Code</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Code</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Nama Aspek</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Bobot (%)</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Waktu</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>User (C/U/D)</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat data...
                    </td>
                  </tr>
                ) : histData.length > 0 ? (
                  histData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.sa_id}</td>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.weight}</td>
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
                    <td colSpan="9" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
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

export default ScoringAspectsPage;
