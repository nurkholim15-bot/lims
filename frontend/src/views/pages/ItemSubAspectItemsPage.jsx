import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";

const ItemSubAspectItemsPage = ({ onEdit, onAdd, refreshTrigger }) => {
  const [aspectFilter, setAspectFilter] = useState("");
  const [subAspectFilter, setSubAspectFilter] = useState("");
  const [allAspects, setAllAspects] = useState([]);
  const [allSubAspects, setAllSubAspects] = useState([]);

  // Fetch aspects and sub-aspects once on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const aspects = await apiRequest("/scoring-aspects");
        if (aspects) setAllAspects(Array.isArray(aspects) ? aspects : (aspects.data || []));
        
        const subAspects = await apiRequest("/scoring-sub-aspects");
        if (subAspects) setAllSubAspects(Array.isArray(subAspects) ? subAspects : (subAspects.data || []));
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };
    fetchData();
  }, []);

  // Filter sub-aspects list based on selected aspect
  const filteredSubAspectsOptions = aspectFilter 
    ? allSubAspects.filter(sa => sa.aspect_code === aspectFilter)
    : allSubAspects;

  // Build endpoint with sub-aspect filter if selected
  const filteredEndpoint = subAspectFilter ? `/scoring-sub-aspect-items?sub_aspect_code=${subAspectFilter}` : `/scoring-sub-aspect-items`;

  const cols = [
    { key: "id", header: "ID" },
    { key: "sub_aspect_code", header: "Kode Sub-Aspek" },
    { key: "sub_aspect_name", header: "Sub-Aspek", render: (item) => (item.sub_aspect ? item.sub_aspect.name : "-") },
    { key: "name", header: "Nama Opsi" },
    { key: "score", header: "Skor" },
  ];

  const handleAspectChange = (e) => {
    setAspectFilter(e.target.value);
    setSubAspectFilter(""); // Reset sub-aspect when aspect changes
  };

  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedSaiId, setSelectedSaiId] = useState(null);

  const fetchHistory = async (saiId = null) => {
    setHistLoading(true);
    try {
      const endpoint = saiId ? `/hist-scoring-sub-aspect-items?sai_id=${saiId}` : `/hist-scoring-sub-aspect-items`;
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
    setSelectedSaiId(item.id);
    setIsHistModalOpen(true);
    fetchHistory(item.id);
  };

  const handleShowAllHistory = () => {
    setSelectedSaiId(null);
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

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div>
      {/* Filter Section */}
      <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label htmlFor="aspect-filter" style={{ fontWeight: 700, fontSize: "0.875rem", color: "#475569", display: "block", marginBottom: "0.5rem" }}>
              <i className="fas fa-layer-group" style={{ marginRight: "0.5rem", color: "#009688" }}></i>Filter Berdasarkan Aspek:
            </label>
            <select
              id="aspect-filter"
              value={aspectFilter}
              onChange={handleAspectChange}
              style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", background: "#fff", cursor: "pointer", outline: "none", transition: "border-color 0.2s" }}
            >
              <option value="">-- Semua Aspek --</option>
              {allAspects.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sub-aspect-filter" style={{ fontWeight: 700, fontSize: "0.875rem", color: "#475569", display: "block", marginBottom: "0.5rem" }}>
              <i className="fas fa-filter" style={{ marginRight: "0.5rem", color: "#009688" }}></i>Filter Berdasarkan Sub-Aspek:
            </label>
            <select
              id="sub-aspect-filter"
              value={subAspectFilter}
              onChange={(e) => setSubAspectFilter(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", background: "#fff", cursor: "pointer", outline: "none" }}
            >
              <option value="">-- Semua Sub-Aspek --</option>
              {filteredSubAspectsOptions.map((sa) => (
                <option key={sa.code} value={sa.code}>
                  {sa.code} - {sa.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Master Data Table */}
      <MasterDataPage 
        title="Item Sub-Aspek Scoring" 
        endpoint={filteredEndpoint} 
        crudEndpoint="/management/scoring-sub-aspect-items" 
        columns={cols} 
        onAdd={onAdd} 
        onEdit={onEdit} 
        refreshTrigger={`${refreshTrigger}-${subAspectFilter}`} 
        predefinedData={{ sub_aspect_code: subAspectFilter }}
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
        searchField="search"
        searchPlaceholder="Cari Nama Opsi atau Kode..."
      />

      {/* History Modal */}
      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Perubahan ${selectedSaiId ? `(ID: ${selectedSaiId})` : "Keseluruhan"}`}
      >
        <div style={{ padding: "1.5rem", maxWidth: "950px" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Hist ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Item ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Sub-Aspek</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Nama Opsi</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Skor</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Waktu</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Dibuat Oleh</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Diperbarui Oleh</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Dihapus Oleh</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat data...
                    </td>
                  </tr>
                ) : histData.length > 0 ? (
                  histData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.sai_id}</td>
                      <td>{item.sub_aspect_code}</td>
                      <td>{item.name}</td>
                      <td>{item.score}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{item.created_user || "-"}</td>
                      <td>{item.updated_user || "-"}</td>
                      <td>{item.deleted_user || "-"}</td>
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

export default ItemSubAspectItemsPage;
