import React, { useState } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";

const CitiesPage = ({ route, refreshTrigger }) => {
  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedCityCode, setSelectedCityCode] = useState(null);

  const fetchHistory = async (cityCode = null) => {
    setHistLoading(true);
    try {
      const endpoint = cityCode ? `/hist-cities?city_code=${cityCode}` : `/hist-cities`;
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
    setSelectedCityCode(item.city_code);
    setIsHistModalOpen(true);
    fetchHistory(item.city_code);
  };

  const handleShowAllHistory = () => {
    setSelectedCityCode(null);
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
    { key: "city_code", header: "Kode" },
    { key: "city_name", header: "Nama Kota" },
    { key: "province_name", header: "Provinsi", render: (item) => (item.province ? item.province.province_name : "-") },
    { key: "gmt_offset", header: "GMT Offset", render: (item) => `GMT+${item.gmt_offset || 7}` },
  ];

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <MasterDataPage 
        title={route?.title || "Daftar Kota"} 
        endpoint={route?.endpoint || "/cities"} 
        crudEndpoint={route?.crudEndpoint || "/management/cities"} 
        columns={route?.cols || columns} 
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
        title={`Riwayat Perubahan Kota ${selectedCityCode ? `(Kode: ${selectedCityCode})` : "Keseluruhan"}`}
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
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Provinsi</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>GMT</th>
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
                      <td>{item.city_code_ref}</td>
                      <td>{item.city_code}</td>
                      <td>{item.city_name}</td>
                      <td>{item.province_code}</td>
                      <td>GMT+{item.gmt_offset}</td>
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

export default CitiesPage;
