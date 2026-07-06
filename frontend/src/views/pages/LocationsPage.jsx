import React, { useState } from "react";
import { apiRequest } from "@models/api";
import MasterDataPage from "./MasterDataPage";
import Modal from "@components/Modal";

const LocationsPage = ({ route, refreshTrigger }) => {
  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedLocationCode, setSelectedLocationCode] = useState(null);

  const fetchHistory = async (locationCode = null) => {
    setHistLoading(true);
    try {
      const endpoint = locationCode ? `/hist-locations?location_code=${locationCode}` : `/hist-locations`;
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
    setSelectedLocationCode(item.code);
    setIsHistModalOpen(true);
    fetchHistory(item.code);
  };

  const handleShowAllHistory = () => {
    setSelectedLocationCode(null);
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
    { key: "code", header: "Kode" },
    { key: "name", header: "Nama Lokasi" },
    { key: "test_type_name", header: "Jenis Uji", render: (item) => (item.test_type ? item.test_type.name : "-") },
    { key: "city_name", header: "Kota", render: (item) => (item.city ? item.city.city_name : "-") },
  ];

  const extraButtons = (
    <button className="btn btn-secondary" onClick={handleShowAllHistory}>
      <i className="fas fa-history"></i> Riwayat Keseluruhan
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <MasterDataPage 
        title={route?.title || "Lokasi Uji"} 
        endpoint={route?.endpoint || "/locations"} 
        crudEndpoint={route?.crudEndpoint || "/management/locations"} 
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
        title={`Riwayat Perubahan Lokasi Uji ${selectedLocationCode ? `(Kode: ${selectedLocationCode})` : "Keseluruhan"}`}
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
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Tipe Uji</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Kota</th>
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
                      <td>{item.location_code_ref}</td>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.test_type_code}</td>
                      <td>{item.city_code}</td>
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

export default LocationsPage;
