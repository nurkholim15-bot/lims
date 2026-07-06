import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import MasterDataPage from "./MasterDataPage";

const TestStandardsPage = ({ route, onEdit, refreshTrigger, setEditingItem, setEditingEndpoint, setEditingCrudEndpoint, setModalType }) => {
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTsCode, setSelectedTsCode] = useState(null);

  const fetchHistory = async (tsCode = null) => {
    setLoading(true);
    try {
      const endpoint = tsCode ? `/hist-test-standards?ts_code=${tsCode}` : `/hist-test-standards`;
      const result = await apiRequest(endpoint);
      if (result) {
        let rawData = result;
        if (!Array.isArray(rawData)) rawData = rawData.data || [rawData];
        setHistData(rawData);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item) => {
    setSelectedTsCode(item.code);
    setIsHistModalOpen(true);
    fetchHistory(item.code);
  };

  const handleShowAllHistory = () => {
    setSelectedTsCode(null);
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
    <>
      <MasterDataPage
        title={route.title}
        endpoint={route.endpoint}
        crudEndpoint={route.crudEndpoint}
        columns={route.columns}
        onAdd={() => {
          setEditingItem(null);
          setEditingCrudEndpoint(route.crudEndpoint);
          setEditingEndpoint(route.endpoint);
          setModalType("edit-master");
        }}
        onEdit={(item) => onEdit(item, route)}
        refreshTrigger={refreshTrigger}
        onRowClick={handleRowClick}
        extraHeaderButtons={extraButtons}
      />

      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Perubahan Standar Uji ${selectedTsCode ? `(Kode: ${selectedTsCode})` : "Keseluruhan"}`}
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
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Deskripsi</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Waktu</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>User (C/U/D)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat data...
                    </td>
                  </tr>
                ) : histData.length > 0 ? (
                  histData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.ts_code_ref}</td>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td>{formatDate(item.created_at || item.updated_at)}</td>
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
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
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
    </>
  );
};

export default TestStandardsPage;
