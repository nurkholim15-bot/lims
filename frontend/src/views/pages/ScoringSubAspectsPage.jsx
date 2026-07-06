import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";

const ScoringSubAspectsPage = ({ onEdit, onAdd, refreshTrigger }) => {
  const [aspectFilter, setAspectFilter] = useState("");
  const [allAspects, setAllAspects] = useState([]);

  // Fetch aspects once on component mount
  useEffect(() => {
    const fetchAspects = async () => {
      try {
        const result = await apiRequest("/scoring-aspects");
        if (result) {
          setAllAspects(Array.isArray(result) ? result : (result.data || []));
        }
      } catch (err) {
        console.error("Error fetching aspects:", err);
      }
    };
    fetchAspects();
  }, []);

  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedSsaId, setSelectedSsaId] = useState(null);

  const fetchHistory = async (ssaId = null) => {
    setHistLoading(true);
    try {
      const endpoint = ssaId ? `/hist-scoring-sub-aspects?ssa_id=${ssaId}` : `/hist-scoring-sub-aspects`;
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
    setSelectedSsaId(item.code);
    setIsHistModalOpen(true);
    fetchHistory(item.code);
  };

  const handleShowAllHistory = () => {
    setSelectedSsaId(null);
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

  // Build endpoint with aspect filter if selected
  const filteredEndpoint = aspectFilter ? `/scoring-sub-aspects?aspect_code=${aspectFilter}` : `/scoring-sub-aspects`;

  const cols = [
    { key: "code", header: "Kode" },
    { key: "name", header: "Nama Sub-Aspek" },
    { key: "aspect_code", header: "Aspek" },
    { key: "weight", header: "Bobot (%)" },
    { key: "is_simulator", header: "Simulator", render: (item) => (item.is_simulator ? "YA" : "TIDAK") },
  ];

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div>
      {/* Filter Section */}
      <div style={{ marginBottom: "1.5rem", padding: "1.2rem", background: "#e0f2f1", border: "2px solid #009688", borderRadius: "8px" }}>
        <label htmlFor="aspect-filter" style={{ fontWeight: 700, fontSize: "1rem", color: "#00695c", display: "block", marginBottom: "0.5rem" }}>
          <i className="fas fa-filter" style={{ marginRight: "0.5rem" }}></i>Filter Berdasarkan Aspek Scoring:
        </label>
        <select
          id="aspect-filter"
          value={aspectFilter}
          onChange={(e) => setAspectFilter(e.target.value)}
          style={{ width: "100%", padding: "0.75rem", border: "2px solid #009688", borderRadius: "6px", fontSize: "1rem", background: "#fff", cursor: "pointer", fontWeight: 500 }}
        >
          <option value="">-- Semua Aspek --</option>
          {allAspects.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} - {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Master Data Table */}
      <MasterDataPage 
        title="Sub-Aspek Scoring" 
        endpoint={filteredEndpoint} 
        crudEndpoint="/management/scoring-sub-aspects" 
        columns={cols} 
        onAdd={onAdd} 
        onEdit={onEdit} 
        refreshTrigger={`${refreshTrigger}-${aspectFilter}`} 
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
        searchField="search"
        searchPlaceholder="Cari Nama atau Kode Sub-Aspek..."
      />

      {/* History Modal */}
      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Perubahan ${selectedSsaId ? `(Code: ${selectedSsaId})` : "Keseluruhan"}`}
        wide
      >
        <div style={{ padding: "1.5rem", maxWidth: "100%" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>SSA Code</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Code</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Nama Sub-Aspek</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Aspek</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Bobot (%)</th>
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
                      <td>{item.ssa_id}</td>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.aspect_code}</td>
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

export default ScoringSubAspectsPage;
