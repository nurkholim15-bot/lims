import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { apiRequest } from "@models/api";
import PartnerSearchModal from "@components/PartnerSearchModal";
import WebcamModal from "@components/WebcamModal";
import { useToast } from '@context/ToastContext';

const SubmissionForm = ({ currentUser, appConfig, onSuccess, onCancel, editingApp, checkPasswordRequirement }) => {
  const { showToast } = useToast();
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fetchedRef = useRef(false);
  const [scanningField, setScanningField] = useState(null); // { index, field }
  const scannerRef = useRef(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [testingPackages, setTestingPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Scanner cleanup on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Error clearing scanner on unmount", e));
        scannerRef.current = null;
      }
    };
  }, []);

  // Common application data
  const [commonData, setCommonData] = useState({
    partner_id: editingApp?.partner_id || editingApp?.partner_code || "",
    package_id: editingApp?.package_id || "",
  });

  // Array of equipment data
  const [equipments, setEquipments] = useState(
    editingApp ? [{
      equipment_name: editingApp.equipment?.equipment_name || "",
      category_code: editingApp.equipment?.category_code || "",
      brand_code: editingApp.equipment?.brand_code || "",
      model_code: editingApp.equipment?.model_code || "",
      variant_code: editingApp.equipment?.variant_code || "",
      batch_number: editingApp.equipment?.batch_number || "",
      technical_spec: editingApp.equipment?.technical_spec || "",
      serial_no: editingApp.equipment?.serial_no || "",
      asset_status_code: editingApp.equipment?.asset_status_code || appConfig?.DEFAULT_ASSET_STATUS || "NEW",
      asset_location_code: editingApp.equipment?.asset_location_code || appConfig?.DEFAULT_ASSET_LOCATION || "",
      factory_spec: null,
      quality_doc: null,
    }] : [{
      equipment_name: "",
      category_code: "",
      brand_code: "",
      model_code: "",
      variant_code: "",
      batch_number: "",
      technical_spec: "",
      serial_no: "",
      asset_status_code: appConfig?.DEFAULT_ASSET_STATUS || "NEW",
      asset_location_code: appConfig?.DEFAULT_ASSET_LOCATION || "",
      factory_spec: null,
      quality_doc: null,
    }]
  );

  const [requestLetter, setRequestLetter] = useState(null);
  const [ocrLoading, setOcrLoading] = useState({});
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamIndex, setWebcamIndex] = useState(null);

  const [errorNotif, setErrorNotif] = useState(null);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchMaster = async () => {
      try {
        const [data, pkgRes] = await Promise.all([
          apiRequest("/master-data"),
          apiRequest("/testing-packages?dropdown=1")
        ]);

        if (data) {
          setMasterData(data);
          if (pkgRes) {
             setTestingPackages(Array.isArray(pkgRes) ? pkgRes : (pkgRes.data || []));
          }
          if (!editingApp) {

            setEquipments([{
              ...equipments[0],
              category_code: data.material_categories?.[0]?.code || "",
              asset_status_code: appConfig?.DEFAULT_ASSET_STATUS || data.asset_statuses?.[0]?.asset_status_code || "NEW",
              asset_location_code: appConfig?.DEFAULT_ASSET_LOCATION || data.locations?.[0]?.code || "",
            }]);
          } else if (editingApp.partner_id || editingApp.partner_code) {
            // Fetch partner details for editing mode
            const pId = editingApp.partner_id || editingApp.partner_code;
            const pRes = await apiRequest(`/partners?search=${pId}`);
            if (pRes && pRes.data && pRes.data.length > 0) {
              const p = pRes.data.find(item => String(item.id) === String(pId) || item.code === String(pId)) || pRes.data[0];
              setSelectedPartner(p);
              setPartnerSearch(String(p.id));
            }
          }
        }
      } catch (err) {
        console.error("Master data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaster();
  }, [editingApp]);

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonData((prev) => ({ ...prev, [name]: value }));
  };

  const executePartnerSearch = async (query) => {
    if (!query) return;
    try {
      const res = await apiRequest(`/partners?search=${encodeURIComponent(query)}&limit=10`);
      if (res && res.data) {
        if (res.data.length === 1) {
          const p = res.data[0];
          setSelectedPartner(p);
          setPartnerSearch(String(p.id));
          setCommonData(prev => ({ ...prev, partner_id: p.id }));
        } else {
          // Open modal with existing query if multiple or none found to let user pick
          setIsPartnerModalOpen(true);
        }
      }
    } catch (err) {
      console.error("Quick search error:", err);
    }
  };

  const handleEquipmentChange = (index, e) => {
    const { name, value } = e.target;
    const newEquipments = [...equipments];
    newEquipments[index] = { ...newEquipments[index], [name]: value };
    
    if (name === "brand_code") {
      newEquipments[index].model_code = "";
      newEquipments[index].variant_code = "";
    } else if (name === "model_code") {
      newEquipments[index].variant_code = "";
    }
    
    setEquipments(newEquipments);
  };

  const handleFileChange = (index, e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      const maxSizeKB = parseInt(appConfig.MAX_UPLOAD_SIZE) || 2048;
      if (file.size / 1024 > maxSizeKB) {
        showToast(`Ukuran file "${file.name}" melebihi batas ${(maxSizeKB / 1024).toFixed(1)} MB.`, "error");
        e.target.value = "";
        return;
      }
      
      if (name === "request_letter") {
        setRequestLetter(file);
      } else {
        const newEquipments = [...equipments];
        newEquipments[index] = { ...newEquipments[index], [name]: file };
        setEquipments(newEquipments);
      }
    }
  };

  const processOCRUpload = async (index, files) => {
    if (!files || files.length === 0) return;

    setOcrLoading(prev => ({ ...prev, [index]: true }));
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("document", files[i]);
    }

    try {
      const res = await apiRequest("/ocr-extract", "POST", formData);
      if (res && Array.isArray(res) && res.length > 0) {
        const newEquipments = [...equipments];
        
        // Update first equipment at target index
        const firstExtracted = res[0];
        newEquipments[index] = {
          ...newEquipments[index],
          equipment_name: firstExtracted.equipment_name || newEquipments[index].equipment_name,
          serial_no: firstExtracted.serial_no || newEquipments[index].serial_no,
          batch_number: firstExtracted.batch_number || newEquipments[index].batch_number,
          technical_spec: firstExtracted.technical_spec || newEquipments[index].technical_spec,
        };

        // Append subsequent items as new cards
        for (let i = 1; i < res.length; i++) {
          const item = res[i];
          newEquipments.push({
            equipment_name: item.equipment_name || "",
            category_code: masterData?.material_categories?.[0]?.code || "",
            brand_code: "",
            model_code: "",
            variant_code: "",
            batch_number: item.batch_number || "",
            technical_spec: item.technical_spec || "",
            serial_no: item.serial_no || "",
            asset_status_code: appConfig?.DEFAULT_ASSET_STATUS || masterData?.asset_statuses?.[0]?.asset_status_code || "NEW",
            asset_location_code: appConfig?.DEFAULT_ASSET_LOCATION || masterData?.locations?.[0]?.code || "",
            factory_spec: null,
            quality_doc: null,
          });
        }

        setEquipments(newEquipments);
        showToast(`Berhasil mengekstrak ${res.length} item dari dokumen!`, "success");
      } else {
        showToast("Gagal membaca dokumen atau format tidak dikenali.", "error");
      }
    } catch (err) {
      console.error("OCR error:", err);
      showToast("Gagal menjalankan OCR: " + err.message, "error");
    } finally {
      setOcrLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleOCRUpload = async (index, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processOCRUpload(index, files);
    e.target.value = ""; // Clear file input
  };

  const handleOpenCameraModal = (index) => {
    setWebcamIndex(index);
    setIsWebcamOpen(true);
  };

  const handleCameraCapture = async (file) => {
    if (webcamIndex !== null) {
      await processOCRUpload(webcamIndex, [file]);
    }
  };

  const addEquipment = () => {
    setEquipments([...equipments, {
      equipment_name: "",
      category_code: masterData?.material_categories?.[0]?.code || "",
      brand_code: "",
      model_code: "",
      variant_code: "",
      batch_number: "",
      technical_spec: "",
      serial_no: "",
      asset_status_code: appConfig?.DEFAULT_ASSET_STATUS || masterData?.asset_statuses?.[0]?.asset_status_code || "NEW",
      asset_location_code: appConfig?.DEFAULT_ASSET_LOCATION || masterData?.locations?.[0]?.code || "",
      factory_spec: null,
      quality_doc: null,
    }]);
  };

  const removeEquipment = (index) => {
    if (equipments.length > 1) {
      setEquipments(equipments.filter((_, i) => i !== index));
    }
  };

  const startScanner = (index, fieldName) => {
    setScanningField({ index, field: fieldName });
    setTimeout(() => {
      const scannerFps = parseInt(appConfig?.SCANNER_FPS) || 25;
      const scannerBoxScale = parseFloat(appConfig?.SCANNER_QRBOX_SCALE) || 0.7;

      const scanner = new Html5QrcodeScanner("scanner-reader", {
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
      scanner.render((decodedText) => {
        setEquipments((prevEquipments) => {
          const newEquipments = [...prevEquipments];
          newEquipments[index] = { ...newEquipments[index], [fieldName]: decodedText };
          return newEquipments;
        });
        stopScanner();
      });
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(e => console.error("Error clearing scanner", e));
      scannerRef.current = null;
    }
    setScanningField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const performSubmission = async () => {
      setSubmitting(true);
      setErrorNotif(null);
      const data = new FormData();
      
      // Append Common Data
      Object.keys(commonData).forEach(key => data.append(key, commonData[key]));
      if (requestLetter) data.append("request_letter", requestLetter);
      
      // Append Equipment Data
      data.append("equipment_total", equipments.length);
      equipments.forEach((eq, idx) => {
        const suffix = `_${idx}`;
        Object.keys(eq).forEach(key => {
          if (eq[key] instanceof File) {
            data.append(`${key}${suffix}`, eq[key]);
          } else if (eq[key] !== null) {
            data.append(`${key}${suffix}`, eq[key]);
          }
        });
      });

      const endpoint = editingApp ? `/applications/${editingApp.id}` : "/applications";
      const method = editingApp ? "PUT" : "POST";

      try {
        const result = await apiRequest(endpoint, method, data);
        if (result) {
          onSuccess(result);
        } else {
          setErrorNotif("Gagal menyimpan pengajuan");
        }
      } catch (err) {
        console.error("Submit error:", err);
        setErrorNotif(err.message || "Terjadi kesalahan sistem saat menghubungi server.");
      } finally {
        setSubmitting(false);
      }
    };

    if (checkPasswordRequirement) {
      checkPasswordRequirement(performSubmission);
    } else {
      performSubmission();
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "2rem" }}><i className="fas fa-spinner fa-spin"></i> Memuat data master...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="card shadow-sm mb-4" style={{ borderLeft: "4px solid #7c3aed" }}>
        <div className="card-body">
          <h5 className="card-title mb-3" style={{ color: "#5b21b6" }}><i className="fas fa-user-tie"></i> Informasi Pemohon</h5>
          <div className="form-grid">
            <div className="form-group">
              <label>Cari Rekanan (ID/Nama) <span className="text-danger">*</span></label>
              <div style={{ display: "flex", gap: "8px", flex: 1, width: "100%" }}>
                <input 
                  type="text" 
                  value={partnerSearch} 
                  onChange={(e) => setPartnerSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      executePartnerSearch(partnerSearch);
                    }
                  }}
                  placeholder="Input ID/Nama lalu Enter..." 
                  required
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setIsPartnerModalOpen(true)}
                  style={{ padding: "0 15px", borderRadius: "10px", width: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Nama Rekanan</label>
              <input type="text" value={selectedPartner ? `[ID: ${selectedPartner.id}] ${selectedPartner.name}` : "-"} readOnly style={{ backgroundColor: "#f8fafc", fontWeight: "bold", color: "#1e293b" }} />
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <input type="text" value={selectedPartner?.type?.name || selectedPartner?.type_code || "-"} readOnly style={{ backgroundColor: "#f8fafc" }} />
            </div>
            <div className="form-group">
              <label>Kota</label>
              <input type="text" value={selectedPartner?.city?.city_name || selectedPartner?.city_code || "-"} readOnly style={{ backgroundColor: "#f8fafc" }} />
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <input type="text" value={selectedPartner?.alamat || "-"} readOnly style={{ backgroundColor: "#f8fafc" }} />
            </div>
            <div className="form-group">
              <label>Nama PIC</label>
              <input type="text" value={selectedPartner?.pic_name || "-"} readOnly style={{ backgroundColor: "#f8fafc" }} />
            </div>
            <div className="form-group">
              <label>Email PIC</label>
              <input type="text" value={selectedPartner?.pic_email || "-"} readOnly style={{ backgroundColor: "#f8fafc" }} />
            </div>
            <div className="form-group">
              <label>Phone PIC</label>
              <input type="text" value={selectedPartner?.pic_phone || "-"} readOnly style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div className="form-group full-width">
              <label>Surat Permohonan (PDF) {editingApp && <span style={{ fontSize: "0.7rem" }}>(Opsional)</span>} <span className="text-danger">*</span></label>
              <input type="file" name="request_letter" accept=".pdf" onChange={(e) => handleFileChange(null, e)} required={!editingApp} />
            </div>

            <div className="form-group full-width" style={{ marginTop: "1rem", padding: "1rem", background: "#f5f3ff", borderRadius: "12px", border: "1px solid #ddd6fe" }}>
              <label style={{ color: "#5b21b6", fontWeight: 700 }}><i className="fas fa-box-open"></i> Pilih Paket Pengujian (MCU Style)</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginTop: "0.5rem" }}>
                <div style={{ flex: 2 }}>
                  <select 
                    name="package_id" 
                    value={commonData.package_id || ""} 
                    onChange={(e) => {
                       handleCommonChange(e);
                       const pkg = testingPackages.find(p => String(p.id) === e.target.value);
                       setSelectedPackage(pkg);
                    }}
                  >
                    <option value="">-- Tanpa Paket (Uji Mandiri) --</option>
                    {testingPackages.map(p => (
                      <option key={p.id} value={p.id}>{p.package_code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "#6d28d9", marginBottom: "0.25rem", display: "block" }}>Harga Paket</label>
                  <input 
                    type="text" 
                    value={selectedPackage ? `Rp ${selectedPackage.base_price?.toLocaleString()}` : "-"} 
                    disabled 
                    readOnly 
                    style={{ backgroundColor: "#fff", fontWeight: "bold", border: "1px solid #ddd6fe", color: "#1e293b" }} 
                  />
                </div>
              </div>
              {selectedPackage && (
                <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#6d28d9" }}>
                   <strong>Item Paket:</strong> {selectedPackage.methodologies?.map(m => m.name).join(", ") || "Semua Tes Standar"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h5 style={{ color: "#5b21b6", margin: 0 }}><i className="fas fa-tools"></i> Daftar Perlengkapan ({equipments.length})</h5>
        {!editingApp && (
          <button type="button" className="btn btn-sm" style={{ backgroundColor: "#7c3aed", color: "white" }} onClick={addEquipment}>
            <i className="fas fa-plus"></i> Tambah Item
          </button>
        )}
      </div>

      {equipments.map((eq, idx) => {
        const filteredModels = masterData?.models?.filter(m => m.brand_code === eq.brand_code) || [];
        const filteredVariants = masterData?.variants?.filter(v => v.model_code === eq.model_code) || [];

        return (
          <div key={idx} className="card shadow-sm mb-3" style={{ borderLeft: "4px solid #10b981" }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span style={{ fontWeight: 600 }}>Item #{idx + 1}</span>
              {equipments.length > 1 && !editingApp && (
                <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeEquipment(idx)}>
                  <i className="fas fa-trash"></i> Hapus
                </button>
              )}
            </div>
            <div className="card-body">

              <div className="form-grid">
                <div className="form-group">
                  <label>Nama Peralatan</label>
                  <input type="text" name="equipment_name" value={eq.equipment_name} onChange={(e) => handleEquipmentChange(idx, e)} required />
                </div>
                <div className="form-group">
                  <label>Serial Number</label>
                  <div style={{ display: "flex", gap: "8px", flex: 1, width: "100%" }}>
                    <input type="text" name="serial_no" value={eq.serial_no} onChange={(e) => handleEquipmentChange(idx, e)} required style={{ flex: 1 }} />
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => startScanner(idx, "serial_no")}
                      style={{ 
                        backgroundColor: "#7c3aed", 
                        color: "white",
                        padding: "0 12px", 
                        borderRadius: "10px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        minWidth: "45px",
                        width: "45px",
                        height: "42px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.4)"
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                        <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                        <line x1="7" y1="12" x2="17" y2="12"></line>
                        <line x1="12" y1="7" x2="12" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Kategori Peralatan</label>
                  <select name="category_code" value={eq.category_code} onChange={(e) => handleEquipmentChange(idx, e)} required>
                    <option value="">Pilih Kategori</option>
                    {masterData?.material_categories?.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Merk</label>
                  <select name="brand_code" value={eq.brand_code} onChange={(e) => handleEquipmentChange(idx, e)} required disabled={!eq.category_code}>
                    <option value="">Pilih Merk</option>
                    {masterData?.brands?.filter(b => b.material_category_code === eq.category_code).map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Negara Asal</label>
                  <input 
                    type="text" 
                    value={masterData?.brands?.find(b => b.code === eq.brand_code)?.origin?.name || masterData?.brands?.find(b => b.code === eq.brand_code)?.origin_code || "-"} 
                    readOnly 
                    disabled
                    style={{ backgroundColor: "#f8fafc" }}
                  />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <select name="model_code" value={eq.model_code} onChange={(e) => handleEquipmentChange(idx, e)} required disabled={!eq.brand_code}>
                    <option value="">Pilih Model</option>
                    {filteredModels.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Varian</label>
                  <select name="variant_code" value={eq.variant_code} onChange={(e) => handleEquipmentChange(idx, e)} required disabled={!eq.model_code}>
                    <option value="">Pilih Varian</option>
                    {filteredVariants.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch / Tahun</label>
                  <input type="text" name="batch_number" value={eq.batch_number} onChange={(e) => handleEquipmentChange(idx, e)} required />
                </div>
                <div className="form-group full-width">
                  <label>Spek Teknis</label>
                  <input type="text" name="technical_spec" value={eq.technical_spec} onChange={(e) => handleEquipmentChange(idx, e)} required />
                </div>
                <div className="form-group">
                  <label>Lokasi Penyimpanan</label>
                  <select name="asset_location_code" value={eq.asset_location_code} onChange={(e) => handleEquipmentChange(idx, e)} required>
                    <option value="">Pilih Lokasi</option>
                    {masterData?.locations?.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status Aset</label>
                  <select name="asset_status_code" value={eq.asset_status_code} onChange={(e) => handleEquipmentChange(idx, e)} required>
                    <option value="">Pilih Status</option>
                    {masterData?.asset_statuses?.map(s => <option key={s.asset_status_code} value={s.asset_status_code}>{s.asset_status_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Dokumen Teknis (PDF)</label>
                  <input type="file" name="factory_spec" accept=".pdf" onChange={(e) => handleFileChange(idx, e)} required={!editingApp} />
                </div>
                <div className="form-group">
                  <label>Kepemilikan (PDF)</label>
                  <input type="file" name="quality_doc" accept=".pdf" onChange={(e) => handleFileChange(idx, e)} required={!editingApp} />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Mengirim..." : editingApp ? "Update" : "Kirim Batch"}</button>
      </div>

      {scanningField && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: "1rem", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <div id="scanner-reader"></div>
            <button type="button" className="btn btn-danger mt-3 w-100" onClick={stopScanner}>Tutup</button>
          </div>
        </div>
      )}

      {errorNotif && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card shadow-lg" style={{ width: "95%", maxWidth: "500px", borderTop: "5px solid #ef4444" }}>
            <div className="card-body text-center p-4">
              <div style={{ fontSize: "3rem", color: "#ef4444", marginBottom: "1rem" }}>
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <h4 style={{ color: "#1e293b", marginBottom: "0.5rem" }}>Registrasi Gagal</h4>
              <p style={{ color: "#64748b", marginBottom: "2rem" }}>{errorNotif}</p>
              <button 
                type="button" 
                className="btn btn-primary w-100" 
                style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }} 
                onClick={() => setErrorNotif(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <PartnerSearchModal 
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        initialSearch={partnerSearch}
        onSelect={(p) => {
          setSelectedPartner(p);
          setPartnerSearch(String(p.id));
          setCommonData(prev => ({ ...prev, partner_id: p.id }));
        }}
      />
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleCameraCapture}
      />
    </form>
  );
};

export default SubmissionForm;
