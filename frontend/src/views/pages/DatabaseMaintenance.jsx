import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import { useToast } from '@context/ToastContext';

const DatabaseMaintenance = ({ user }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("archive");
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // New specific state
  const [eligiblePartitions, setEligiblePartitions] = useState([]);
  const [selectedPartition, setSelectedPartition] = useState("");
  const [thresholdMonths, setThresholdMonths] = useState(3);
  const [restoreFile, setRestoreFile] = useState(null);
  const [findings, setFindings] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [syncYear, setSyncYear] = useState(new Date().getFullYear());
  const [showConfirm, setShowConfirm] = useState(null); // 'archive', 'unarchive', 'restore', 'sync', 'cleanup', 'vacuum'
  const [selectedTypes, setSelectedTypes] = useState(["Schema", "Partition", "Index", "Partitioning"]);
  const [bloatData, setBloatData] = useState([]);
  const [targetVacuumTable, setTargetVacuumTable] = useState("");
  const [backupFolder, setBackupFolder] = useState("");
  const [restoreFilePath, setRestoreFilePath] = useState("");

  useEffect(() => {
    fetchEligible();
  }, []);

  const fetchEligible = async () => {
    try {
      const data = await apiRequest("/management/db/eligible");
      if (data) {
        setEligiblePartitions(data.eligible || []);
        setThresholdMonths(data.threshold_months || 3);
      }
    } catch (err) {
      console.error("Gagal memuat partisi:", err);
    }
  };

  const handleArchive = async () => {
    if (!selectedPartition) return;
    const [year, month] = selectedPartition.split("-");
    
    setLoading(true);
    try {
      const result = await apiRequest("/management/db/archive", "POST", { 
        year: parseInt(year), 
        month: month 
      });
      if (result) {
        showToast('Berhasil mengarsipkan data.', 'success');
        fetchEligible();
        setSelectedPartition("");
      }
    } catch (err) {
      showToast('Archive Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  };

  const handleUnarchive = async () => {
    if (!selectedPartition) return;
    const [year, month] = selectedPartition.split("-");

    setLoading(true);
    try {
      const result = await apiRequest("/management/db/unarchive", "POST", { 
        year: parseInt(year), 
        month: month 
      });
      if (result) {
        showToast('Berhasil mengembalikan data ke tabel utama.', 'success');
        fetchEligible();
        setSelectedPartition("");
      }
    } catch (err) {
      showToast('Restore Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      window.open(`${import.meta.env.VITE_API_BASE_URL || ""}/api/management/db/backup?token=${token}`, "_blank");
    } catch (err) {
      showToast('Download Backup Gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("backup_file", restoreFile);
    try {
      const result = await apiRequest("/management/db/restore", "POST", formData, true); 
      if (result) {
        showToast('Restore Database Berhasil!', 'success');
        setRestoreFile(null);
      }
    } catch (err) {
      showToast('Restore Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await apiRequest("/management/db/sync", "POST", { 
        year: parseInt(syncYear),
        target_types: selectedTypes
      });
      if (result) {
        showToast(`Sinkronisasi Database tahun ${syncYear} Berhasil!`, 'success');
        setFindings([]);
        setAnalyzed(true);
        fetchEligible();
      }
    } catch (err) {
      showToast('Sinkronisasi Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  };

  const handleAnalyze = async () => {
    if (isAnalyzing || loading) return;
    
    setIsAnalyzing(true);
    setLoading(true);
    try {
      const data = await apiRequest(`/management/db/analyze?year=${syncYear}&t=${new Date().getTime()}`);
      if (data && data.findings) {
        const foundFindings = data.findings || [];
        setFindings(foundFindings);
        setAnalyzed(true);
        const types = [...new Set(foundFindings.map(f => f.type))];
        if (types.length > 0) setSelectedTypes(types);
      } else if (data && data.status === "success") {
        setFindings([]);
        setAnalyzed(true);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      alert("Analisa Gagal: " + err.message);
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };


  const fetchBloat = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/management/db/bloat");
      if (data) setBloatData(data);
    } catch (err) {
      showToast('Gagal memuat analisa bloat: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVacuum = async (isFull = false) => {
    if (!targetVacuumTable) return;
    setLoading(true);
    try {
      const result = await apiRequest(`/management/db/vacuum?table=${targetVacuumTable}&full=${isFull}`, "POST");
      if (result) {
        showToast(`Berhasil menjalankan ${isFull ? 'VACUUM FULL' : 'VACUUM'} pada tabel ${targetVacuumTable}`, 'success');
        fetchBloat();
      }
    } catch (err) {
      showToast('Vacuum Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setShowConfirm(null);
      setTargetVacuumTable("");
    }
  };

  const renderArchiveTab = () => (
    <div className="tab-content fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        <div>
          <h3 style={{ marginTop: 0, color: "#1e293b" }}>Arsip & Pengembalian Partisi</h3>
          <p style={{ color: "#64748b", lineHeight: "1.5" }}>
            Fitur ini memindahkan data pengujian yang sudah lama ke dalam tabel **Archive (ARC)** untuk menjaga performa database utama tetap cepat. 
          </p>
          <div className="alert-info" style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "1rem", borderRadius: "8px", marginTop: "1rem", color: "#0369a1", fontSize: "0.9rem" }}>
            Berdasarkan parameter global, sistem hanya mengizinkan pengarsipan data yang berusia lebih dari **{thresholdMonths} bulan**.
          </div>
          <div className="alert-warning" style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "1rem", borderRadius: "8px", marginTop: "1rem", color: "#b45309", fontSize: "0.85rem" }}>
            <strong><i className="fas fa-exclamation-triangle"></i> Persyaratan Akses Database:</strong> 
            <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
              Fitur arsip tidak memerlukan <code>DB_AUTO_MIGRATE=true</code>. 
              Namun, pastikan *user* database memiliki *privilege* <strong>CREATE, SELECT, INSERT, dan DROP</strong> untuk memindahkan data dan membuang tabel partisi lama.
            </p>
          </div>
          <div style={{ marginTop: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Pilih Bulan & Tahun Partisi:</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <select className="form-control" style={{ flex: 1, padding: "10px" }} value={selectedPartition} onChange={(e) => setSelectedPartition(e.target.value)}>
                <option value="">-- Pilih Partisi --</option>
                {eligiblePartitions.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              </select>
              <button className="btn btn-secondary" onClick={fetchEligible}><i className="fas fa-sync-alt"></i></button>
            </div>
          </div>
          <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem" }}>
            <button className="btn btn-primary" style={{ padding: "12px 24px", background: "#065f46" }} disabled={!selectedPartition || loading} onClick={() => setShowConfirm("archive")}>Archive</button>
            <button className="btn btn-secondary" style={{ padding: "12px 24px" }} disabled={!selectedPartition || loading} onClick={() => setShowConfirm("unarchive")}>Restore to Main</button>
          </div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1.5rem", border: "1px dashed #cbd5e1" }}>
          <h4 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Tabel yang Diproses ({20}):</h4>
          <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: "1.6", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.2rem" }}>
            <li>asset_activity_logs</li>
            <li>asset_handovers</li>
            <li>cash_advances</li>
            <li>invoices</li>
            <li>payments</li>
            <li>reimbursements</li>
            <li>simulator_data_logs</li>
            <li>tester_applications</li>
            <li>testing_applications</li>
            <li>testing_applications_audit</li>
            <li>testing_aspect_scores</li>
            <li>testing_equipments</li>
            <li>testing_plans</li>
            <li>testing_pqc_ai_anomalies</li>
            <li>testing_report_ais</li>
            <li>testing_results</li>
            <li>testing_tool_availabilities</li>
            <li>testing_tool_reservations</li>
            <li>testing_tool_transactions</li>
            <li>travel_requests</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderBackupTab = () => (
    <div className="tab-content fade-in" style={{ padding: "2rem 0" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <i className="fas fa-database" style={{ fontSize: "5rem", color: "#065f46", marginBottom: "1.5rem", opacity: 0.2 }}></i>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Full Database Backup</h3>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>Unduh cadangan melalui browser, atau gunakan perintah CLI untuk direktori lokal.</p>
        </div>
        
        <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Direktori Backup Manual (Opsional):</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Contoh: D:\Backup\LIMS" 
            value={backupFolder} 
            onChange={(e) => setBackupFolder(e.target.value)} 
            style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
          />
          {backupFolder && (
            <div style={{ background: "#1e293b", color: "#38bdf8", padding: "1rem", borderRadius: "8px", position: "relative", overflowX: "auto" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Jalankan perintah ini di Terminal/Command Prompt:</div>
              <code style={{ fontFamily: "monospace", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                pg_dump -U lims_app -d lims_prod_db -h 127.0.0.1 -p 5433 -F d -v -f "{backupFolder.replace(/\\/g, '\\\\')}"
              </code>
            </div>
          )}
        </div>
        
        <div style={{ textAlign: "center" }}>
          <button className="btn btn-primary" style={{ padding: "15px 40px", background: "#065f46" }} onClick={handleBackup} disabled={loading}>Download via Browser</button>
        </div>
      </div>
    </div>
  );

  const renderRestoreTab = () => (
    <div className="tab-content fade-in" style={{ padding: "1rem 0" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div className="alert-warning" style={{ background: "#fff7ed", border: "2px solid #fdba74", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", textAlign: "center" }}>
          <h4 style={{ marginTop: 0 }}>PERHATIAN: RESTORE SISTEM</h4>
          <p style={{ margin: 0 }}>Tindakan ini akan menimpa seluruh database!</p>
        </div>
        
        <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "#475569" }}>Lokasi Folder Restore Manual (Directory Format):</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Contoh: D:\Backup\LIMS\20260701" 
            value={restoreFilePath} 
            onChange={(e) => setRestoreFilePath(e.target.value)} 
            style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
          />
          {restoreFilePath && (
            <div style={{ background: "#1e293b", color: "#38bdf8", padding: "1rem", borderRadius: "8px", position: "relative", overflowX: "auto" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Jalankan perintah ini di Terminal/Command Prompt:</div>
              <code style={{ fontFamily: "monospace", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                pg_restore -U lims_app -d lims_prod_db -h 127.0.0.1 -p 5433 -F d -j 4 --clean --if-exists --verbose "{restoreFilePath.replace(/\\/g, '\\\\')}"
              </code>
            </div>
          )}
        </div>

        <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "3rem 2rem", textAlign: "center", position: "relative" }}>
          {!restoreFile ? (
            <>
              <input type="file" style={{ opacity: 0, position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer" }} onChange={(e) => setRestoreFile(e.target.files[0])} accept=".sql,.dump" />
              <button className="btn btn-secondary">Pilih File Backup</button>
            </>
          ) : (
            <div style={{ color: "#065f46" }}>
              <p style={{ fontWeight: 700 }}>{restoreFile.name}</p>
              <button className="btn btn-primary" style={{ background: "#dc2626" }} onClick={() => setShowConfirm("restore")}>Mulai Restore</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSyncTab = () => (
    <div className="tab-content fade-in" style={{ textAlign: "center", padding: "1rem 0" }}>
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        {!analyzed ? (
          <>
            <i className="fas fa-search-nodes" style={{ fontSize: "4rem", color: "#64748b", marginBottom: "1.5rem", opacity: 0.2 }}></i>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Analisa Struktur & Partisi</h3>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>Mengecek ketersediaan partisi bulanan dan index performa untuk tahun tertentu.</p>
            <div style={{ marginBottom: "2rem" }}>
              <input type="number" className="form-control" style={{ width: "150px", margin: "0 auto", textAlign: "center", fontSize: "1.2rem", fontWeight: 700 }} value={syncYear} onChange={(e) => setSyncYear(e.target.value)} />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ 
                padding: "12px 30px", 
                background: (loading || isAnalyzing) ? "#94a3b8" : "#065f46",
                cursor: (loading || isAnalyzing) ? "not-allowed" : "pointer",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "0 auto"
              }} 
              onClick={handleAnalyze} 
              disabled={loading || isAnalyzing}
            >
              {isAnalyzing && <i className="fas fa-spinner fa-spin"></i>}
              {isAnalyzing ? "Menganalisa..." : "Jalankan Analisa"}
            </button>
          </>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0 }}>Temuan Sinkronisasi {syncYear}</h3>
              <button className="btn btn-secondary" onClick={() => setAnalyzed(false)}>Ulangi Analisa</button>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
              <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px", textAlign: "left", width: "100px" }}>Type</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Deskripsi</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Script SQL</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: "2rem", color: "#065f46", fontWeight: 600 }}>Struktur Database Sudah Sesuai (OK).</td></tr>
                  ) : (
                    findings.map((f, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px", fontWeight: 700, color: f.priority === 'HIGH' ? '#dc2626' : '#64748b' }}>{f.type}</td>
                        <td style={{ padding: "12px", textAlign: "left" }}>{f.description}</td>
                        <td style={{ padding: "12px", textAlign: "left" }}>
                          <code style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", display: "block", whiteSpace: "pre-wrap", color: "#0369a1" }}>
                            {f.sql}
                          </code>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {findings.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <button className="btn btn-success" style={{ padding: "12px 40px", background: "#065f46", color: "white" }} onClick={() => setShowConfirm('sync')}>Eksekusi Sinkronisasi Otomatis</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderBloatTab = () => (
    <div className="tab-content fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ margin: 0 }}>Analisa Database Bloat</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Estimasi ruang terbuang (Fragmentasi) vs Dead Tuples asli.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchBloat} disabled={loading}>Refresh</button>
      </div>
      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
        <table style={{ width: "100%", fontSize: "0.9rem" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={{ padding: "12px" }}>Tabel</th>
              <th style={{ textAlign: "right" }}>Ukuran</th>
              <th style={{ textAlign: "right" }}>Live / Dead</th>
              <th style={{ textAlign: "right" }}>Est. Bloat</th>
              <th style={{ textAlign: "center" }}>Rasio</th>
              <th style={{ textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bloatData.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Tidak ditemukan bloat signifikan (Threshold &gt; 80kB).</td></tr>
            ) : (
              bloatData.map((b, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{b.table_name}</td>
                  <td style={{ textAlign: "right" }}>{b.table_size}</td>
                  <td style={{ textAlign: "right" }}>{b.live_tuples} / <span style={{ color: b.dead_tuples > 0 ? "#dc2626" : "inherit" }}>{b.dead_tuples}</span></td>
                  <td style={{ textAlign: "right" }}>{b.bloat_size}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "12px", background: b.bloat_ratio > 20 ? "#fee2e2" : "#f1f5f9", color: b.bloat_ratio > 20 ? "#dc2626" : "#64748b", fontWeight: 700 }}>
                      {b.bloat_ratio}%
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                      <button className="btn" style={{ padding: "4px 8px", fontSize: "0.75rem", background: "#f1f5f9" }} onClick={() => { setTargetVacuumTable(b.table_name); setShowConfirm("vacuum"); }}>Vacuum</button>
                      <button className="btn" style={{ padding: "4px 8px", fontSize: "0.75rem", background: "#fee2e2", color: "#dc2626" }} onClick={() => { setTargetVacuumTable(b.table_name); setShowConfirm("vacuum-full"); }}>Full</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>
        * <strong>Vacuum</strong>: Menandai dead tuples agar bisa digunakan kembali (tidak mengurangi ukuran file).<br/>
        * <strong>Vacuum Full</strong>: Menyusun ulang tabel secara fisik untuk mengembalikan ruang ke Disk (mengunci tabel).<br/>
        * <strong>Threshold</strong>: Tabel di bawah 80KB (10 halaman) diabaikan karena merupakan overhead minimal PostgreSQL.
      </div>
    </div>
  );


  const getConfirmMessage = () => {
    switch (showConfirm) {
      case 'archive': return `Arsipkan data partisi ${selectedPartition}?`;
      case 'unarchive': 
        return (
          <>
            Kembalikan data partisi {selectedPartition}?
            <div style={{ color: "#dc2626", fontWeight: "bold", marginTop: "1rem" }}>
              PERHATIAN: RESTORE SISTEM<br/>
              Tindakan ini akan menimpa seluruh database!
            </div>
          </>
        );
      case 'restore': return "APAKAH ANDA YAKIN? Restore akan menimpa seluruh database!";
      case 'sync': return `Sinkronisasi struktur database tahun ${syncYear}?`;
      case 'vacuum': return `Jalankan VACUUM ANALYZE pada tabel ${targetVacuumTable}?`;
      case 'vacuum-full': return `Jalankan VACUUM FULL ANALYZE pada tabel ${targetVacuumTable}? (Tabel akan TERKUNCI selama proses)`;
      default: return "";
    }
  };

  return (
    <div className="maintenance-container" style={{ padding: "2rem" }}>
      <div className="card" style={{ maxWidth: "1000px", margin: "0 auto", overflow: "hidden" }}>
        <div style={{ background: "#065f46", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
          <h2 style={{ margin: 0 }}>Database Management</h2>
          <div style={{ display: "flex", gap: "4px" }}>
            {["archive", "backup", "restore", "sync", "bloat"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "bloat") fetchBloat(); }} style={{ padding: "8px 16px", background: activeTab === tab ? "#fff" : "transparent", color: activeTab === tab ? "#065f46" : "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>{tab.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "2rem" }}>
          {activeTab === "archive" && renderArchiveTab()}
          {activeTab === "backup" && renderBackupTab()}
          {activeTab === "restore" && renderRestoreTab()}
          {activeTab === "sync" && renderSyncTab()}
          {activeTab === "bloat" && renderBloatTab()}
        </div>
      </div>

      {showConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: "400px", padding: "2rem", textAlign: "center" }}>
            <h3>Konfirmasi</h3>
            <p>{getConfirmMessage()}</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(null)}>Batal</button>
              <button className="btn btn-primary" style={{ background: showConfirm === 'vacuum-full' ? "#dc2626" : "#065f46" }} onClick={
                showConfirm === 'archive' ? handleArchive : 
                showConfirm === 'unarchive' ? handleUnarchive : 
                showConfirm === 'sync' ? handleSync : 
                showConfirm === 'vacuum' ? () => handleVacuum(false) : 
                showConfirm === 'vacuum-full' ? () => handleVacuum(true) :
                handleRestore
              }>Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", background: "#1e293b", color: "#fff", padding: "1rem 2rem", borderRadius: "12px", zIndex: 2000 }}>
          Sedang memproses...
        </div>
      )}
    </div>
  );
};

export default DatabaseMaintenance;
