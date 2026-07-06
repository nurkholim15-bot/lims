import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";

const MethodologiesPage = ({ onEdit, onAdd, refreshTrigger }) => {
  const [testTypes, setTestTypes] = useState([]);
  const [selectedTestType, setSelectedTestType] = useState("");
  const [filteredEndpoint, setFilteredEndpoint] = useState("/methodologies");

  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedMethodCode, setSelectedMethodCode] = useState(null);

  // Fetch test types once on component mount
  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const result = await apiRequest("/test-types");
        if (result) {
          setTestTypes(Array.isArray(result) ? result : (result.data || []));
        }
      } catch (err) {
        console.error("Error fetching test types:", err);
      }
    };
    fetchTestTypes();
  }, []);

  // Update endpoint when test type filter changes
  useEffect(() => {
    if (selectedTestType) {
      setFilteredEndpoint(`/methodologies?test_type_code=${selectedTestType}`);
    } else {
      setFilteredEndpoint("/methodologies");
    }
  }, [selectedTestType]);

  const fetchHistory = async (methodCode = null) => {
    setHistLoading(true);
    try {
      const endpoint = methodCode ? `/hist-methodologies?method_code=${methodCode}` : `/hist-methodologies`;
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

  const handleRowClick = (item) => {
    setSelectedMethodCode(item.code);
    setIsHistModalOpen(true);
    fetchHistory(item.code);
  };

  const handleShowAllHistory = () => {
    setSelectedMethodCode(null);
    setIsHistModalOpen(true);
    fetchHistory(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const columns = [
    { key: "code", header: "Kode" },
    { key: "name", header: "Nama" },
    { key: "test_type_code", header: "Jenis Uji" },
    {
      key: "test_type_name",
      header: "Nama Jenis Uji",
      render: (item) => {
        const testTypeData = item.test_type || {};
        return testTypeData.name || "-";
      },
    },
    { key: "scoring_level_code", header: "Level Set" },
    {
      header: "Levels Detail",
      render: (item) => (
        <button
          className="action-btn"
          title="Manage Scoring Levels"
          style={{ background: "#f1f5f9", color: "#6366f1", border: "1px solid #e2e8f0" }}
          onClick={(e) => {
            e.stopPropagation();
            // Handle levels detail navigation logic if needed
          }}
        >
          <i className="fas fa-list"></i>
        </button>
      ),
    },
  ];

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Filter by Jenis Uji:</label>
        <select
          value={selectedTestType}
          onChange={(e) => setSelectedTestType(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "300px",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
        >
          <option value="">-- Semua Jenis Uji --</option>
          {testTypes.map((t) => (
            <option key={t.code} value={t.code}>
              {t.code} - {t.name}
            </option>
          ))}
        </select>
      </div>

      <MasterDataPage 
        title="Metodologi Uji" 
        endpoint={filteredEndpoint} 
        crudEndpoint="/management/methodologies" 
        columns={columns} 
        onAdd={onAdd} 
        onEdit={onEdit} 
        refreshTrigger={refreshTrigger}
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
        searchField="search"
        searchPlaceholder="Cari Nama atau ID..."
      />

      {/* History Modal */}
      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Perubahan Metodologi ${selectedMethodCode ? `(Kode: ${selectedMethodCode})` : "Keseluruhan"}`}
        wide
      >
        <div style={{ padding: "1.5rem", maxWidth: "100%" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Ref Code</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Kode</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Nama</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Jenis Uji</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Level Set</th>
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
                      <td>{item.method_code_ref}</td>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.test_type_code}</td>
                      <td>{item.scoring_level_code}</td>
                      <td>{formatDate(item.updated_at || item.created_at)}</td>
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
                    <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
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

export default MethodologiesPage;
