import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import AppDetail from "@components/AppDetail";
import { printAssetLabel, printAssetHandover } from "@utils/print";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from '@context/ToastContext';

const AssetManagementPage = ({ currentUser, appConfig }) => {
  const { showToast } = useToast();
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetLogs, setAssetLogs] = useState([]);
  const [scanningField, setScanningField] = useState(null);
  
  const [manualId, setManualId] = useState("");
  const [viewingApp, setViewingApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);
  
  const [moveData, setMoveData] = useState({
    activity_type: "MOVE",
    to_location: "",
    to_status: "USED",
    partner_id: null,
    receiver_name: "",
    notes: ""
  });

  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });

  const scannerRef = useRef(null);

  const handleShowAppDetail = async (appId) => {
    if (!appId) {
      alert("Asset ini tidak terhubung dengan data Testing Application.");
      return;
    }
    setLoadingApp(true);
    try {
      const data = await apiRequest(`/applications/${appId}`);
      if (data) {
        setViewingApp(data);
      } else {
        showToast("Data Testing Application tidak ditemukan.", "warning");
      }
    } catch (err) {
      console.error("Error fetching application details:", err);
      showToast("Gagal mengambil detil aplikasi: " + err.message, "error");
    } finally {
      setLoadingApp(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logFilter, setLogFilter] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0")
  });

  const [mainFilter, setMainFilter] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0")
  });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMetadata = async () => {
    try {
      const [locData, statData, partnerData] = await Promise.all([
        apiRequest("/locations"),
        apiRequest("/asset-statuses"),
        apiRequest("/partners")
      ]);
      setLocations(locData?.data || (Array.isArray(locData) ? locData : []));
      setStatuses(statData?.data || (Array.isArray(statData) ? statData : []));
      setPartners(partnerData?.data || (Array.isArray(partnerData) ? partnerData : []));
    } catch (err) {
      console.error("Error fetching metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (targetPage = 1) => {
    setLoading(true);
    try {
      const { year, month } = mainFilter;
      const response = await apiRequest(`/assets?year=${year}&month=${month}&page=${targetPage}&search=${searchQuery}`);
      
      if (response && response.metadata) {
        setAssets(response.data || []);
        setPagination({
          page: response.metadata.page,
          total: response.metadata.total,
          limit: response.metadata.limit
        });
      } else {
        setAssets(response || []);
      }
    } catch (err) {
      console.error("Error fetching asset data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (equipmentId) => {
    try {
      const { year, month } = logFilter;
      const logs = await apiRequest(`/asset-logs?equipment_id=${equipmentId}&year=${year}&month=${month}`);
      setAssetLogs(logs?.data || (Array.isArray(logs) ? logs : []));
    } catch (err) {
      console.error("Error fetching logs:", err);
      setAssetLogs([]);
    }
  };

  const handleAction = (asset, type = "MOVE") => {
    const currentStatusStr = asset.asset_status_code?.toString().toUpperCase() || "";
    const currentStatusName = statuses.find(s => s.asset_status_code?.toString().trim() == asset.asset_status_code?.toString().trim())?.asset_status_name?.toUpperCase() || asset.asset_status?.asset_status_name?.toUpperCase() || "";
    
    if (currentStatusStr === "4" || currentStatusStr === "DISP" || currentStatusStr === "DISPOSAL" || currentStatusName === "DISPOSAL") {
      if (type === "MOVE") {
        alert("Status Asset sudah disposal sehingga asset tidak bisa dipindahkan");
        return;
      } else if (type === "DISPO") {
        alert("Status sudah Disposal");
        return;
      }
    }

    setSelectedAsset(asset);
    let initialTargetStatus = asset.asset_status_code || "USED";
    if (type === "DISPO") {
      const disposalStatus = statuses.find(s => {
        const name = s.asset_status_name?.toUpperCase() || "";
        const code = s.asset_status_code?.toString().toUpperCase() || "";
        return code === "4" || code === "DISP" || code === "DISPOSAL" || name === "DISPOSAL";
      });
      if (disposalStatus) {
        initialTargetStatus = disposalStatus.asset_status_code;
      }
    }

    setMoveData({
      activity_type: type,
      to_location: asset.asset_location_code || "",
      to_status: initialTargetStatus,
      partner_id: asset.partner_id || asset.app_partner_id || "",
      receiver_name: "",
      notes: ""
    });
    setShowMoveModal(true);
  };

  const handleShowLogs = (asset) => {
    setSelectedAsset(asset);
    fetchLogs(asset.id);
    setShowLogsModal(true);
  };

  const handlePrintHandover = async (assetId) => {
    try {
      const handover = await apiRequest(`/asset-handover/${assetId}`);
      if (handover) {
        printAssetHandover(handover, appConfig);
      }
    } catch (err) {
      alert("Belum ada data Serah Terima untuk asset ini atau terjadi kesalahan.");
    }
  };

  const handleManualAction = async () => {
    if (!manualId) return;
    
    // Cari di lokal dulu
    let found = assets.find(a => a.id?.toString() === manualId || a.serial_no === manualId);
    
    if (!found) {
      setLoading(true);
      try {
        const res = await apiRequest(`/assets?id=${manualId}`);
        const assetsList = (res && Array.isArray(res)) ? res : (res && res.data ? res.data : []);
        if (assetsList && assetsList.length > 0) {
          found = assetsList[0];
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (found) {
      handleAction(found, "MOVE");
      setManualId(""); // Clear input
    } else {
      alert("Asset tidak ditemukan: " + manualId);
    }
  };

  const submitActivity = async () => {
    if (!moveData.to_location && moveData.activity_type === "MOVE") {
        alert("Silakan pilih lokasi tujuan");
        return;
    }

    if (moveData.activity_type === "MOVE") {
      const targetStatus = moveData.to_status ? moveData.to_status.toString().toUpperCase() : "";
      if (targetStatus === "4" || targetStatus === "DISP" || targetStatus === "DISPOSAL") {
        alert("Asset tidak boleh dipindah menjadi disposal");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest("/asset-activity", "POST", {
        equipment_id: selectedAsset.id,
        ...moveData,
        partner_id: moveData.partner_id && moveData.partner_id !== "" ? Number(moveData.partner_id) : null
      });
      if (res) {
        showToast("Berhasil menyimpan perubahan asset", "success");
        setShowMoveModal(false);
        fetchData();
      }
    } catch (err) {
      if (err.message && (err.message.startsWith("Disposal gagal") || err.message === "Asset tidak boleh dipindah menjadi disposal")) {
        showToast(err.message, "error");
      } else {
        showToast("Gagal memproses aktivitas asset: " + err.message, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocationName = (code) => {
    if (!code) return "-";
    const loc = locations.find(l => l.code === code.trim());
    return loc ? loc.name : code;
  };

  const startScanner = (fieldName) => {
    setScanningField(fieldName);
    setTimeout(async () => {
      const scannerFps = parseInt(appConfig?.SCANNER_FPS) || 25;
      const scannerBoxScale = parseFloat(appConfig?.SCANNER_QRBOX_SCALE) || 0.7;

      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");

      const scanner = new Html5QrcodeScanner("asset-scanner", {
        fps: scannerFps,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          return {
            width: viewfinderWidth * scannerBoxScale,
            height: viewfinderHeight * scannerBoxScale
          };
        },
        aspectRatio: 1.0,
        disableFlip: true,
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      });
      scanner.render(async (decodedText) => {
        stopScanner();
        
        // Try to find asset by asset_id or serial_no
        let found = assets.find(a => a.id?.toString() === decodedText || a.serial_no === decodedText);
        
        if (!found) {
          try {
            const res = await apiRequest(`/assets?id=${decodedText}`);
            const assetsList = (res && Array.isArray(res)) ? res : (res && res.data ? res.data : []);
            if (assetsList && assetsList.length > 0) {
              found = assetsList[0];
            }
          } catch (err) {
            console.error("Scanner search error:", err);
          }
        }

        if (found) {
          handleAction(found, "MOVE");
        } else {
          alert("Asset tidak ditemukan: " + decodedText);
        }
      }, (err) => {});
      scannerRef.current = scanner;
      } catch (err) {
        console.error("Gagal memuat modul scanner:", err);
        alert("Gagal memuat fitur scanner. Pastikan koneksi ke server stabil.");
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(e => console.error(e));
      scannerRef.current = null;
    }
    setScanningField(null);
  };

  const getStatusBadge = (status, finalStatus) => {
    const s = status?.toString().toUpperCase() || "";
    const fs = finalStatus?.toString().toUpperCase() || "";
    
    // Final Results (Highest Priority)
    if (fs.includes("CERTIFIED") || fs.includes("TERSERTIFIKASI") || fs === "LULUS" || fs === "PASS") return "badge-success";
    if (fs.includes("REJECTED") || fs.includes("CANCELED") || fs.includes("DITOLAK") || fs === "TIDAK LULUS" || fs === "FAIL") return "badge-danger";
    if (fs.includes("EXPIRED") || fs.includes("KADALUWARSA")) return "badge-gray";
    
    // Process Statuses
    switch (s) {
      case "REGISTERED": case "PENDAFTARAN": return "badge-blue";
      case "VERIFIED": case "TERVERIFIKASI": return "badge-cyan";
      case "APPROVED": case "DISETUJUI": return "badge-indigo";
      case "PLANNING": case "PERENCANAAN": return "badge-warning";
      case "EXECUTING": case "PELAKSANAAN": return "badge-orange";
      case "ANALYZING": case "ANALISA": return "badge-purple";
      case "FINALIZED": case "SELESAI": return "badge-green";
      case "CANCELLED": case "DIBATALKAN": return "badge-danger";
      case "DISPOSAL": case "DISPO": case "SERAH TERIMA": return "badge-gray";
      case "CHECK-OUT": return "badge-orange";
      case "CHECK-IN": return "badge-green";
      default: return "badge-gray";
    }
  };

  const getAssetStatusBadge = (code) => {
    const s = code?.toString().trim() || "";
    if (s === "NEW") return "badge-blue";
    if (s === "USED" || s === "CHECK-OUT" || s === "CEKOUT") return "badge-success";
    if (s === "DISP" || s === "DISPOSAL") return "badge-danger";
    if (s === "MOVE" || s === "CHECK-IN" || s === "CEKIN") return "badge-warning";
    return "badge-gray";
  };

  const getStatusName = (code) => {
    if (!code) return "-";
    const status = statuses.find(s => s.asset_status_code?.toString().trim() === code.toString().trim());
    return status ? status.asset_status_name : code;
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i.toString());
  }

  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Asset Tracking & Monitoring</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
              <select value={mainFilter.month} onChange={(e) => setMainFilter({...mainFilter, month: e.target.value})} style={{ border: "none", background: "none", outline: "none", fontSize: "0.85rem" }}>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={mainFilter.year} onChange={(e) => setMainFilter({...mainFilter, year: e.target.value})} style={{ border: "none", background: "none", outline: "none", fontSize: "0.85rem" }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <input 
                type="text" 
                placeholder="Cari Asset/Reg No..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchData(1)}
                style={{ border: "none", background: "none", outline: "none", fontSize: "0.85rem", width: "130px", borderLeft: "1px solid #cbd5e1", paddingLeft: "8px" }}
              />
              <button title="Tampilkan Data" onClick={() => fetchData(1)} style={{ border: "none", background: "none", cursor: "pointer", color: "#3b82f6" }}>
                <i className="fas fa-search"></i>
              </button>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input 
                type="text" 
                placeholder="Asset ID..." 
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualAction()}
                style={{ 
                  height: "38px", 
                  padding: "0 12px", 
                  borderRadius: "6px", 
                  border: "1px solid #e2e8f0",
                  width: "120px",
                  fontSize: "0.9rem"
                }}
              />
              <button className="btn" style={{ backgroundColor: "#1e293b", color: "white" }} onClick={() => startScanner("search")}>
                <i className="fas fa-barcode"></i> Scan
              </button>
              <button className="btn btn-secondary" onClick={() => window.location.href='/welcome'} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px' }}>
                <i className="fas fa-times"></i> Tutup
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading assets...</p>
        ) : (
        <div className="table-container" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto', position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
              <tr>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Asset ID</th>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>S/N</th>
                 <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Peralatan</th>
                 <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>App Status</th>
                 <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Status</th>
                 <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Lokasi</th>
                 <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Label</th>
                <th style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assets.length > 0 ? assets.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 800 }}>{a.id || "-"}</td>
                  <td>{a.serial_no || "-"}</td>
                  <td>
                    <div>{a.equipment_name}</div>
                    <small style={{ color: "#64748b" }}>{a.brand?.name} {a.model?.name}</small>
                  </td>
                   <td 
                     style={{ cursor: a.application_id ? "pointer" : "default" }}
                     onClick={() => a.application_id && handleShowAppDetail(a.application_id)}
                     title={a.application_id ? "Klik untuk melihat detil testing application" : ""}
                   >
                     <span className={`badge ${getStatusBadge(a.app_status, a.app_final_status)}`}>
                       <i className={`fas ${
                         (a.app_final_status?.includes("CERTIFIED") || a.app_final_status === "PASS") ? "fa-certificate" :
                         (a.app_final_status?.includes("REJECTED") || a.app_final_status === "FAIL") ? "fa-times-circle" :
                         "fa-info-circle"
                       }`} style={{ marginRight: "5px" }}></i>
                       {a.app_final_status ? `${a.app_status} (${a.app_final_status})` : (a.app_status || "REGISTERED")}
                     </span>
                   </td>
                   <td>
                     <span className={`badge ${getAssetStatusBadge(a.asset_status_code)}`}>
                       {a.asset_status?.asset_status_name || a.asset_status_code}
                     </span>
                   </td>
                  <td>{a.asset_location?.name || "Gudang PUSLIT"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px", padding: "4px" }}>
                          <div
                            title="Cetak Label"
                            onClick={() =>
                              printAssetLabel(a, {
                                headerTitle: appConfig?.HEADER_TITLE || "MEC ASSET",
                                companyName: appConfig?.COMPANY_NAME || "MEC System",
                              })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <QRCodeSVG value={a.id?.toString() || "N/A"} size={32} />
                          </div>
                        </div>
                      </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button className="btn btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => handleAction(a, "MOVE")}>
                        <i className="fas fa-exchange-alt"></i> Move
                      </button>
                      <button className="btn btn-danger" style={{ fontSize: "0.75rem" }} onClick={() => handleAction(a, "DISPO")}>
                        <i className="fas fa-trash-alt"></i> Dispo
                      </button>
                      <button className="btn" style={{ fontSize: "0.75rem", backgroundColor: "#0ea5e9", color: "white" }} onClick={() => handlePrintHandover(a.id)}>
                        <i className="fas fa-file-contract"></i> Bukti ST
                      </button>
                      <button className="btn" style={{ fontSize: "0.75rem", backgroundColor: "#8b5cf6", color: "white" }} onClick={() => handleShowLogs(a)}>
                        <i className="fas fa-history"></i> Logs
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <i className="fas fa-info-circle" style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }}></i>
                    Silakan pilih periode dan klik tombol cari untuk menampilkan data aset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination Controls */}
        {!loading && assets.length > 0 && pagination.total > pagination.limit && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0.5rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </div>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button 
                className="btn btn-secondary" 
                disabled={pagination.page === 1}
                onClick={() => fetchData(pagination.page - 1)}
                style={{ padding: "4px 10px" }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => {
                const p = i + 1;
                // Show first, last, and pages around current
                if (p === 1 || p === Math.ceil(pagination.total / pagination.limit) || (p >= pagination.page - 1 && p <= pagination.page + 1)) {
                  return (
                    <button 
                      key={p}
                      className={`btn ${pagination.page === p ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => fetchData(p)}
                      style={{ padding: "4px 12px" }}
                    >
                      {p}
                    </button>
                  );
                } else if (p === pagination.page - 2 || p === pagination.page + 2) {
                  return <span key={p} style={{ padding: "4px" }}>...</span>;
                }
                return null;
              })}

              <button 
                className="btn btn-secondary" 
                disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                onClick={() => fetchData(pagination.page + 1)}
                style={{ padding: "4px 10px" }}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Move / Activity Modal */}
      <Modal 
        isOpen={showMoveModal} 
        onClose={() => setShowMoveModal(false)} 
        title={`${moveData.activity_type === "MOVE" ? "Pemindahan" : "Disposal / Serah Terima"} Asset`}
        wide
      >
        <div style={{ padding: "1.5rem" }}>
           <div style={{ marginBottom: "1.5rem", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem", color: "#1e293b" }}>{selectedAsset?.equipment_name}</p>
                  <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "#64748b" }}>ID: {selectedAsset?.id} | S/N: {selectedAsset?.serial_no}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                   <span className={`badge ${getStatusBadge(selectedAsset?.app_status, selectedAsset?.app_final_status)}`} style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                      <i className={`fas ${
                         (selectedAsset?.app_final_status?.includes("CERTIFIED") || selectedAsset?.app_final_status === "PASS") ? "fa-certificate" :
                         "fa-info-circle"
                       }`} style={{ marginRight: "6px" }}></i>
                      {selectedAsset?.app_final_status ? 
                        `${selectedAsset?.app_status} (${selectedAsset?.app_final_status})` : 
                        (selectedAsset?.app_status || "REGISTERED")}
                   </span>
                </div>
              </div>
              <hr style={{ margin: "10px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", fontSize: "0.85rem" }}>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Nomor Registrasi</div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{selectedAsset?.registration_no || selectedAsset?.app_reg_number || "-"}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Tanggal Registrasi</div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {selectedAsset?.received_date ? new Date(selectedAsset.received_date).toLocaleDateString('id-ID') : 
                     (selectedAsset?.app_reg_date ? new Date(selectedAsset.app_reg_date).toLocaleDateString('id-ID') : "-")}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Rekanan</div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {selectedAsset?.app_partner_name || selectedAsset?.partner?.name || (partners.find(p => p.id === selectedAsset?.app_partner_id)?.name) || "-"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Senjata / Unit</div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{selectedAsset?.equipment_name || "-"}</div>
                </div>
              </div>
           </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label>Lokasi Asal</label>
                <div style={{ padding: "0.5rem", background: "#f1f5f9", borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: "0.95rem", minHeight: "38px", display: "flex", alignItems: "center" }}>
                  {locations.find(l => l.code === selectedAsset?.asset_location_code)?.name || selectedAsset?.asset_location?.name || selectedAsset?.asset_location_code || "Gudang PUSLIT"}
                </div>
              </div>
              <div className="form-group">
                <label>Lokasi Tujuan</label>
                <select 
                  value={moveData.to_location} 
                  onChange={(e) => setMoveData({...moveData, to_location: e.target.value})}
                  disabled={moveData.activity_type === "DISPO"}
                  style={{ height: "38px" }}
                >
                  <option value="">Pilih Lokasi</option>
                  {locations.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label>Status Saat Ini</label>
                <div style={{ padding: "0.5rem", background: "#f1f5f9", borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: "0.95rem", minHeight: "38px", display: "flex", alignItems: "center" }}>
                   <span className={`badge ${getStatusBadge(selectedAsset?.asset_status_code?.toString().trim())}`} style={{ margin: 0 }}>
                      {statuses.find(s => s.asset_status_code?.toString().trim() == selectedAsset?.asset_status_code?.toString().trim())?.asset_status_name || selectedAsset?.asset_status?.asset_status_name || selectedAsset?.asset_status_code}
                   </span>
                </div>
              </div>
              <div className="form-group">
                <label>Status Baru</label>
                <select 
                  value={moveData.to_status} 
                  onChange={(e) => {
                    const selectedStatus = e.target.value;
                    const statusName = statuses.find(s => s.asset_status_code?.toString() === selectedStatus?.toString())?.asset_status_name?.toUpperCase() || "";
                    if (moveData.activity_type === "MOVE" && (selectedStatus === "4" || selectedStatus === "DISP" || selectedStatus === "DISPOSAL" || statusName === "DISPOSAL")) {
                      showToast("Status baru disposal hanya boleh digunakan di dalam menu Disposal", "warning");
                      return;
                    }
                    setMoveData({...moveData, to_status: selectedStatus});
                  }}
                  style={{ height: "38px" }}
                  disabled={moveData.activity_type === "DISPO"}
                >
                  {moveData.activity_type === "DISPO" ? (
                    statuses.filter(s => {
                      const name = s.asset_status_name?.toUpperCase() || "";
                      const code = s.asset_status_code?.toString().toUpperCase() || "";
                      return code === "4" || code === "DISP" || code === "DISPOSAL" || name === "DISPOSAL";
                    }).map(s => (
                      <option key={s.asset_status_code} value={s.asset_status_code}>{s.asset_status_name}</option>
                    ))
                  ) : (
                    statuses.map(s => (
                      <option key={s.asset_status_code} value={s.asset_status_code}>{s.asset_status_name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {moveData.activity_type === "DISPO" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "1rem", padding: "15px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fef3c7" }}>
                <div className="form-group">
                  <label style={{ color: "#92400e", fontWeight: 700 }}>Nama Personel Penerima</label>
                  <input 
                    type="text"
                    value={moveData.receiver_name} 
                    onChange={(e) => setMoveData({...moveData, receiver_name: e.target.value})}
                    placeholder="Contoh: Bpk. Andi"
                    style={{ height: "38px", width: "100%", padding: "0 10px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
              </div>
            )}

           <div className="form-group" style={{ marginTop: "1rem" }}>
             <label>Catatan / Keterangan</label>
             <textarea 
               value={moveData.notes} 
               onChange={(e) => setMoveData({...moveData, notes: e.target.value})}
               style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
               rows={3}
             />
           </div>

           <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" disabled={isSubmitting} onClick={() => setShowMoveModal(false)}>Batal</button>
              <button className="btn btn-primary" disabled={isSubmitting} onClick={submitActivity}>
                {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Memproses...</> : "Simpan Perubahan"}
              </button>
           </div>
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal isOpen={showLogsModal} onClose={() => setShowLogsModal(false)} title="Riwayat Pergerakan Asset" wide>
         <div style={{ padding: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "flex-end", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Tahun</label>
                <select value={logFilter.year} onChange={(e) => setLogFilter({...logFilter, year: e.target.value})} style={{ height: "38px" }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Bulan</label>
                <select value={logFilter.month} onChange={(e) => setLogFilter({...logFilter, month: e.target.value})} style={{ height: "38px" }}>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" style={{ height: "38px" }} onClick={() => fetchLogs(selectedAsset?.id)}>
                <i className="fas fa-filter"></i> Filter
              </button>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Aktivitas</th>
                    <th>Dari</th>
                    <th>Ke</th>
                    <th>User</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {assetLogs.length > 0 ? assetLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td><span className={`badge ${getStatusBadge(log.to_status)}`}>{getStatusName(log.to_status)}</span></td>
                      <td>{getLocationName(log.from_location)}</td>
                      <td>{getLocationName(log.to_location)}</td>
                      <td>{log.created_user}</td>
                      <td>{log.notes}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Tidak ada data logs untuk periode ini</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
         </div>
      </Modal>

      {scanningField && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "white", padding: "1rem", borderRadius: "8px", width: "90%", maxWidth: "500px" }}>
            <h3 style={{ marginTop: 0 }}>Scan Barcode / QR Asset</h3>
            <div id="asset-scanner" style={{ width: "100%" }}></div>
            <button className="btn btn-danger" style={{ marginTop: "1rem", width: "100%" }} onClick={stopScanner}>Stop Scanner</button>
          </div>
        </div>
      )}

      {viewingApp && (
        <Modal
          isOpen={!!viewingApp}
          onClose={() => setViewingApp(null)}
          title={`Informasi Detil Aplikasi - ${viewingApp.reg_number}`}
          wide
        >
          <AppDetail 
            app={viewingApp} 
            stage="query" 
            onCancel={() => setViewingApp(null)}
            onSuccess={() => {}}
          />
        </Modal>
      )}

      {loadingApp && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#3b82f6" }}></i>
            <p style={{ margin: 0, fontWeight: 600 }}>Memuat detil aplikasi...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagementPage;
