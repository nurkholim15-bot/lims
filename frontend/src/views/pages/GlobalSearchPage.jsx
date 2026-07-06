import React, { useState } from "react";
import { apiRequest } from "@models/api";
import WorkflowPage from "./WorkflowPage";
import { useToast } from '@context/ToastContext';

const GlobalSearchPage = ({ appConfig = {}, onAction, user }) => {
  const { showToast } = useToast();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceTable, setSourceTable] = useState("");
  const [regNumber, setRegNumber] = useState("");

  const handleSearch = async () => {
    if (!regNumber) {
      showToast('Silakan masukkan Nomor Registrasi', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest(`/applications/search-reg?reg_number=${regNumber}`);
      setResults(data.applications || []);
      setSourceTable(data.source_table || "");
    } catch (err) {
      console.error("Search failed:", err);
      showToast('Pencarian gagal: ' + err.message, 'error');
      setResults([]);
      setSourceTable("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b" }}>Pencarian Global (No Reg)</div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400, marginTop: "2px" }}>Cari data registrasi di seluruh database</div>
          </div>
          
          {/* Search Bar like Rekanan */}
          <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'center', 
              background: '#f8fafc',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
          }}>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
              <input 
                type="text" 
                placeholder="Masukkan No Reg (contoh: 36)..." 
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{ padding: '6px 12px 6px 32px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '300px', outline: 'none' }}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSearch}
              disabled={loading}
              style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '6px', minWidth: '80px' }}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "Cari"}
            </button>
          </div>
        </div>

        {sourceTable && (
          <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <i className="fas fa-database"></i>
            <span>Sumber Data (Resolved): </span>
            <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", color: "#0f172a", fontWeight: "bold" }}>{sourceTable}</code>
            <span style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
              {sourceTable.includes("_arc") ? "(ARCHIVE DATA)" : "(PRODUCTION DATA)"}
            </span>
          </div>
        )}

        <WorkflowPage 
          stage="global_search"
          title="" 
          apps={results}
          setApps={setResults}
          appConfig={appConfig}
          currentUser={user}
          onAction={onAction}
          actionLabel="Lihat Detail"
          fetchApplications={() => {}}
        />
      </div>
    </div>
  );
};

export default GlobalSearchPage;
