import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import AuditHistoryModal from "@components/AuditHistoryModal";
import { useToast } from '@context/ToastContext';

const TesterMastersPage = ({ onEdit, refreshTrigger }) => {
  const { showToast } = useToast();
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [methodologies, setMethodologies] = useState([]);
  const [selectedMethodology, setSelectedMethodology] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [selectedTesterId, setSelectedTesterId] = useState(null);
  const [selectedTesterName, setSelectedTesterName] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "/tester-masters";
      if (searchQuery) {
        endpoint += `?search=${encodeURIComponent(searchQuery)}`;
      }
      const [testerData, methodData] = await Promise.all([apiRequest(endpoint), apiRequest("/methodologies")]);
      if (testerData) setAllData(Array.isArray(testerData) ? testerData : (testerData.data || []));
      if (methodData) setMethodologies(Array.isArray(methodData) ? methodData : (methodData.data || []));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item) => {
    setSelectedTesterId(item.tester_id);
    setSelectedTesterName(item.name);
    setIsHistModalOpen(true);
  };

  const handleShowAllHistory = () => {
    setSelectedTesterId(null);
    setSelectedTesterName(null);
    setIsHistModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectedMethodology) {
      setFilteredData(allData.filter((item) => item.methodology_code === selectedMethodology));
    } else {
      setFilteredData(allData);
    }
  }, [selectedMethodology, allData]);

  const handleDelete = async (testerId) => {
    const confirmed = window.confirmAsync ? await window.confirmAsync("Apakah Anda yakin ingin menghapus tim penguji ini?") : confirm("Apakah Anda yakin ingin menghapus tim penguji ini?");
    if (!confirmed) return;
    try {
      await apiRequest(`/management/tester-masters/${testerId}`, "DELETE");
      setAllData(allData.filter((item) => item.tester_id !== testerId));
    } catch (err) {
      showToast(err.message || 'Gagal menghapus data', 'error');
    }
  };

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-title">
          <span>Master Tim Penguji</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary" onClick={handleShowAllHistory}>
              <i className="fas fa-history"></i> Riwayat Keseluruhan
            </button>
            <button className="btn btn-primary" onClick={() => onEdit(null)}>
              <i className="fas fa-plus"></i> Tambah Penguji
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "1rem", alignItems: "center" }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.875rem", color: "#334155", marginRight: "0.5rem", display: "block", marginBottom: "0.25rem" }}>Pencarian:</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="text" 
                placeholder="Cari Nama atau ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.875rem", minWidth: "250px" }}
              />
              <button className="btn btn-primary" onClick={fetchData} style={{ padding: "0.5rem 1rem" }}>Filter</button>
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.875rem", color: "#334155", marginRight: "0.5rem", display: "block", marginBottom: "0.25rem" }}>Filter Methodology:</label>
            <select value={selectedMethodology} onChange={(e) => setSelectedMethodology(e.target.value)} style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.875rem", minWidth: "250px" }}>
              <option value="">-- Semua Methodology --</option>
              {methodologies.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID (Tester Code)</th>
              <th>Nama Penguji</th>
              <th>Jabatan</th>
              <th>Metodologi</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                  Memuat data...
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.tester_id} onClick={() => handleRowClick(item)} style={{ cursor: "pointer" }}>
                  <td>{item.tester_id}</td>
                  <td>{item.name}</td>
                  <td>{item.position || "-"}</td>
                  <td>{item.methodology_code || "-"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-btns">
                      <button className="action-btn btn-edit" onClick={() => onEdit(item)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(item.tester_id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  Data kosong.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AuditHistoryModal
        isOpen={isHistModalOpen}
        onClose={() => setIsHistModalOpen(false)}
        title={`Riwayat Perubahan Tim Penguji ${selectedTesterName ? `(${selectedTesterName})` : "Keseluruhan"}`}
        endpoint="/hist-master-testers"
        idField="tester_id"
        idValue={selectedTesterId}
        columns={[
          { key: "id", header: "ID" },
          { key: "tester_id", header: "Tester ID" },
          { key: "name", header: "Nama" },
          { key: "position", header: "Jabatan" },
          { key: "methodology_code", header: "Metodologi" },
        ]}
      />
    </div>
  );
};

export default TesterMastersPage;
