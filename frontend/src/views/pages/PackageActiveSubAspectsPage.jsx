import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import Pagination from "@components/Pagination";
import { useToast } from "@context/ToastContext";

const PackageActiveSubAspectsPage = ({ checkPasswordRequirement }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // URL query params
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialPackageId = queryParams.get("package_id") || "";
  const initialAspectCode = queryParams.get("aspect_code") || "";

  // Filter States
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackageId);
  const [selectedAspectCode, setSelectedAspectCode] = useState(initialAspectCode);
  const [selectedSubAspectCode, setSelectedSubAspectCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Master Options
  const [packages, setPackages] = useState([]);
  const [aspects, setAspects] = useState([]);
  const [allSubAspects, setAllSubAspects] = useState([]);

  // Data List State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalPackageId, setModalPackageId] = useState("");
  const [modalAspectFilter, setModalAspectFilter] = useState("");
  const [selectedSubAspectsToAdd, setSelectedSubAspectsToAdd] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // History Modal State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histFilterPackageId, setHistFilterPackageId] = useState("");

  // Delete Confirm State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [pkgsRes, aspectsRes, subAspectsRes] = await Promise.all([
          apiRequest("/testing-packages?dropdown=1"),
          apiRequest("/scoring-aspects"),
          apiRequest("/scoring-sub-aspects")
        ]);

        if (pkgsRes) {
          const raw = Array.isArray(pkgsRes) ? pkgsRes : (pkgsRes.data || []);
          setPackages(raw);
        }
        if (aspectsRes) {
          const raw = Array.isArray(aspectsRes) ? aspectsRes : (aspectsRes.data || []);
          setAspects(raw);
        }
        if (subAspectsRes) {
          const raw = Array.isArray(subAspectsRes) ? subAspectsRes : (subAspectsRes.data || []);
          setAllSubAspects(raw);
        }
      } catch (err) {
        console.error("Gagal memuat opsi filter:", err);
      }
    };
    fetchOptions();
  }, []);

  // Filtered Sub-Aspects dropdown based on selected aspect filter
  const filteredSubAspectOptions = useMemo(() => {
    if (!selectedAspectCode) return allSubAspects;
    return allSubAspects.filter(s => s.aspect_code === selectedAspectCode);
  }, [allSubAspects, selectedAspectCode]);

  // Fetch Active Sub-Aspects
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (selectedPackageId) params.append("package_id", selectedPackageId);
      if (selectedAspectCode) params.append("aspect_code", selectedAspectCode);
      if (selectedSubAspectCode) params.append("sub_aspect_code", selectedSubAspectCode);
      if (searchTerm) params.append("search", searchTerm);

      const res = await apiRequest(`/package-active-sub-aspects?${params.toString()}`);
      if (res) {
        const dataList = Array.isArray(res) ? res : (res.data || []);
        setItems(dataList);
        setTotal(res.total || dataList.length);
      }
    } catch (err) {
      console.error("Gagal memuat sub-aspek aktif:", err);
      showToast("Gagal memuat data sub-aspek aktif: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, selectedPackageId, selectedAspectCode, selectedSubAspectCode, searchTerm]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    if (checkPasswordRequirement && !checkPasswordRequirement()) return;
    setModalPackageId(selectedPackageId || (packages.length > 0 ? String(packages[0].id) : ""));
    setModalAspectFilter(selectedAspectCode || "");
    setSelectedSubAspectsToAdd([]);
    setIsAddModalOpen(true);
  };

  // Toggle sub-aspect checkbox in modal
  const handleToggleSubAspect = (code) => {
    setSelectedSubAspectsToAdd(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Select all / Deselect all in modal
  const handleSelectAllSubAspects = (filteredList) => {
    const codes = filteredList.map(s => s.code);
    const allSelected = codes.every(c => selectedSubAspectsToAdd.includes(c));
    if (allSelected) {
      setSelectedSubAspectsToAdd(prev => prev.filter(c => !codes.includes(c)));
    } else {
      setSelectedSubAspectsToAdd(prev => Array.from(new Set([...prev, ...codes])));
    }
  };

  // Submit Add
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!modalPackageId) {
      showToast("Silakan pilih paket pengujian", "error");
      return;
    }
    if (selectedSubAspectsToAdd.length === 0) {
      showToast("Pilih minimal satu sub-aspek untuk ditambahkan", "error");
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const subAspectCode of selectedSubAspectsToAdd) {
      try {
        await apiRequest("/management/package-active-sub-aspects", "POST", {
          package_id: parseInt(modalPackageId),
          sub_aspect_code: subAspectCode
        });
        successCount++;
      } catch (err) {
        console.error(`Gagal menambahkan sub-aspek ${subAspectCode}:`, err);
        failCount++;
      }
    }

    setSubmitting(false);
    setIsAddModalOpen(false);

    if (successCount > 0) {
      showToast(`Berhasil menambahkan ${successCount} sub-aspek ke paket!`, "success");
      fetchData();
    }
    if (failCount > 0) {
      showToast(`${failCount} sub-aspek gagal ditambahkan (mungkin sudah terdaftar)`, "warning");
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    if (checkPasswordRequirement && !checkPasswordRequirement()) return;

    setDeleting(true);
    try {
      await apiRequest(
        `/management/package-active-sub-aspects/${deleteConfirmItem.package_id}/${deleteConfirmItem.sub_aspect_code}`,
        "DELETE"
      );
      showToast(
        `Sub-aspek ${deleteConfirmItem.sub_aspect?.name || deleteConfirmItem.sub_aspect_code} berhasil dihapus dari paket!`,
        "success"
      );
      setDeleteConfirmItem(null);
      fetchData();
    } catch (err) {
      console.error("Gagal menghapus sub-aspek:", err);
      showToast("Gagal menghapus: " + (err.message || "Unknown error"), "error");
    } finally {
      setDeleting(false);
    }
  };

  // History Fetch
  const fetchHistory = async (pkgId = "") => {
    setHistLoading(true);
    try {
      const endpoint = pkgId 
        ? `/hist-package-active-sub-aspects?package_id=${pkgId}` 
        : "/hist-package-active-sub-aspects";
      const res = await apiRequest(endpoint);
      if (res) {
        const raw = Array.isArray(res) ? res : (res.data || []);
        setHistData(raw);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
    } finally {
      setHistLoading(false);
    }
  };

  const handleOpenHistory = (pkgId = "") => {
    setHistFilterPackageId(pkgId || selectedPackageId || "");
    setIsHistModalOpen(true);
    fetchHistory(pkgId || selectedPackageId || "");
  };

  // Active sub-aspect codes for selected modal package
  const activeSubAspectCodesForModalPkg = useMemo(() => {
    if (!modalPackageId) return new Set();
    const active = items
      .filter(it => String(it.package_id) === String(modalPackageId))
      .map(it => it.sub_aspect_code);
    return new Set(active);
  }, [modalPackageId, items]);

  // Modal sub-aspects list filtered by modalAspectFilter
  const modalSubAspectsList = useMemo(() => {
    if (!modalAspectFilter) return allSubAspects;
    return allSubAspects.filter(s => s.aspect_code === modalAspectFilter);
  }, [allSubAspects, modalAspectFilter]);

  return (
    <div className="page-container" style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        background: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
        padding: "1.5rem 2rem",
        borderRadius: "12px",
        color: "#ffffff",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <i className="fas fa-list-check"></i> Sub-Aspek Aktif Paket Pengujian
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
            Tabel konfigurasi relasi aktif antara Paket Pengujian (Testing Packages) dan Sub-Aspek Scoring (Scoring Sub-Aspects).
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => navigate("/testing-packages")}
            className="btn"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }}
          >
            <i className="fas fa-box-open" style={{ marginRight: "0.5rem" }}></i> Kelola Paket
          </button>
          <button
            onClick={() => navigate("/package-active-aspects" + (selectedPackageId ? `?package_id=${selectedPackageId}` : ""))}
            className="btn"
            style={{ background: "#059669", color: "#fff", border: "none" }}
          >
            <i className="fas fa-layer-group" style={{ marginRight: "0.5rem" }}></i> Aspek Aktif
          </button>
          <button
            onClick={() => handleOpenHistory()}
            className="btn"
            style={{ background: "#f59e0b", color: "#fff", border: "none" }}
          >
            <i className="fas fa-history" style={{ marginRight: "0.5rem" }}></i> Riwayat
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn"
            style={{ background: "#ffffff", color: "#0369a1", fontWeight: 600, border: "none" }}
          >
            <i className="fas fa-plus-circle" style={{ marginRight: "0.5rem" }}></i> Tambah Sub-Aspek
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
        background: "#ffffff",
        padding: "1.25rem",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        {/* Filter Paket */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
            <i className="fas fa-box" style={{ marginRight: "0.4rem", color: "#0284c7" }}></i>Filter Paket:
          </label>
          <select
            value={selectedPackageId}
            onChange={(e) => { setSelectedPackageId(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
          >
            <option value="">-- Semua Paket Pengujian --</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.package_code} - {pkg.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Aspek */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
            <i className="fas fa-layer-group" style={{ marginRight: "0.4rem", color: "#0284c7" }}></i>Filter Aspek:
          </label>
          <select
            value={selectedAspectCode}
            onChange={(e) => { setSelectedAspectCode(e.target.value); setSelectedSubAspectCode(""); setPage(1); }}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
          >
            <option value="">-- Semua Aspek --</option>
            {aspects.map((asp) => (
              <option key={asp.code} value={asp.code}>
                {asp.code} - {asp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Sub-Aspek */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
            <i className="fas fa-list-check" style={{ marginRight: "0.4rem", color: "#0284c7" }}></i>Filter Sub-Aspek:
          </label>
          <select
            value={selectedSubAspectCode}
            onChange={(e) => { setSelectedSubAspectCode(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
          >
            <option value="">-- Semua Sub-Aspek --</option>
            {filteredSubAspectOptions.map((sa) => (
              <option key={sa.code} value={sa.code}>
                {sa.code} - {sa.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
            <i className="fas fa-search" style={{ marginRight: "0.4rem", color: "#0284c7" }}></i>Pencarian:
          </label>
          <input
            type="text"
            placeholder="Cari kode/nama sub-aspek/paket..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "0.85rem 1rem", width: "60px" }}>No</th>
                <th style={{ padding: "0.85rem 1rem" }}>Paket Pengujian</th>
                <th style={{ padding: "0.85rem 1rem" }}>Kode Sub-Aspek</th>
                <th style={{ padding: "0.85rem 1rem" }}>Nama Sub-Aspek</th>
                <th style={{ padding: "0.85rem 1rem" }}>Aspek Induk</th>
                <th style={{ padding: "0.85rem 1rem" }}>Metodologi Terkait</th>
                <th style={{ padding: "0.85rem 1rem", width: "120px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: "0.5rem" }}></i> Memuat sub-aspek aktif...
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item, idx) => {
                  const pkgName = item.package ? `${item.package.name} (${item.package.package_code})` : `Paket #${item.package_id}`;
                  const saName = item.sub_aspect ? item.sub_aspect.name : item.sub_aspect_code;
                  const aspName = item.sub_aspect?.aspect ? `${item.sub_aspect.aspect.name} (${item.sub_aspect.aspect_code})` : (item.sub_aspect?.aspect_code || "-");
                  const methodText = item.sub_aspect?.aspect?.methodology ? `${item.sub_aspect.aspect.methodology.name} (${item.sub_aspect.aspect.methodology_code})` : (item.sub_aspect?.aspect?.methodology_code || "-");

                  return (
                    <tr key={`${item.package_id}-${item.sub_aspect_code}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>{(page - 1) * limit + idx + 1}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.6rem",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "0.85rem"
                        }}>
                          {pkgName}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <code style={{ background: "#f1f5f9", padding: "0.2rem 0.4rem", borderRadius: "4px", color: "#0f172a", fontWeight: 600 }}>
                          {item.sub_aspect_code}
                        </code>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 500, color: "#1e293b" }}>{saName}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.2rem 0.5rem",
                          background: "#ecfdf5",
                          color: "#047857",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}>
                          {aspName}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>{methodText}</td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          {/* History */}
                          <button
                            onClick={() => handleOpenHistory(item.package_id)}
                            title="Riwayat Paket Ini"
                            style={{
                              border: "none",
                              background: "#fef3c7",
                              color: "#d97706",
                              padding: "0.4rem 0.6rem",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            <i className="fas fa-history"></i>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            title="Hapus Sub-Aspek dari Paket"
                            style={{
                              border: "none",
                              background: "#fee2e2",
                              color: "#dc2626",
                              padding: "0.4rem 0.6rem",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    Belum ada data sub-aspek aktif untuk filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > limit && (
          <div style={{ padding: "1rem" }}>
            <Pagination current={page} total={total} limit={limit} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal Tambah Sub-Aspek */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title="Tambah Sub-Aspek ke Paket Pengujian"
        wide
      >
        <form onSubmit={handleSubmitAdd} style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                Pilih Paket Pengujian:
              </label>
              <select
                value={modalPackageId}
                onChange={(e) => setModalPackageId(e.target.value)}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                required
              >
                <option value="">-- Pilih Paket --</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.package_code} - {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                Filter Berdasarkan Aspek:
              </label>
              <select
                value={modalAspectFilter}
                onChange={(e) => setModalAspectFilter(e.target.value)}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
              >
                <option value="">-- Tampilkan Semua Aspek --</option>
                {aspects.map((asp) => (
                  <option key={asp.code} value={asp.code}>
                    {asp.code} - {asp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: 600, color: "#334155" }}>
              Pilih Sub-Aspek Scoring untuk Diaktifkan ({modalSubAspectsList.length} tersedia):
            </label>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => handleSelectAllSubAspects(modalSubAspectsList)}
              style={{ fontSize: "0.8rem", background: "#f1f5f9", border: "1px solid #cbd5e1" }}
            >
              Pilih / Batal Semua
            </button>
          </div>

          <div style={{
            maxHeight: "350px",
            overflowY: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "0.75rem",
            background: "#f8fafc"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
              {modalSubAspectsList.map((sa) => {
                const isAlreadyActive = activeSubAspectCodesForModalPkg.has(sa.code);
                const isChecked = selectedSubAspectsToAdd.includes(sa.code);

                return (
                  <div
                    key={sa.code}
                    onClick={() => !isAlreadyActive && handleToggleSubAspect(sa.code)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      background: isAlreadyActive ? "#f1f5f9" : isChecked ? "#e0f2fe" : "#ffffff",
                      border: isChecked ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
                      cursor: isAlreadyActive ? "not-allowed" : "pointer",
                      opacity: isAlreadyActive ? 0.6 : 1,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={isAlreadyActive}
                      checked={isChecked || isAlreadyActive}
                      onChange={() => {}}
                      style={{ marginTop: "0.2rem", cursor: isAlreadyActive ? "not-allowed" : "pointer" }}
                    />
                    <div style={{ fontSize: "0.85rem" }}>
                      <div style={{ fontWeight: 600, color: isChecked ? "#0369a1" : "#1e293b" }}>
                        {sa.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
                        Kode: <code>{sa.code}</code> | Aspek: {sa.aspect_code}
                      </div>
                      {isAlreadyActive && (
                        <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 600 }}>
                          ✓ Sudah Aktif
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || selectedSubAspectsToAdd.length === 0}
              style={{ background: "#0284c7" }}
            >
              {submitting ? (
                <span><i className="fas fa-spinner fa-spin"></i> Menyimpan...</span>
              ) : (
                <span><i className="fas fa-check"></i> Tambahkan {selectedSubAspectsToAdd.length} Sub-Aspek</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={!!deleteConfirmItem}
        onClose={() => !deleting && setDeleteConfirmItem(null)}
        title="Konfirmasi Hapus Sub-Aspek Aktif"
      >
        <div style={{ padding: "1.5rem" }}>
          <p style={{ fontSize: "1rem", color: "#334155", margin: "0 0 1rem 0" }}>
            Apakah Anda yakin ingin menghapus sub-aspek <strong>{deleteConfirmItem?.sub_aspect?.name || deleteConfirmItem?.sub_aspect_code}</strong> dari paket <strong>{deleteConfirmItem?.package?.name || deleteConfirmItem?.package_id}</strong>?
          </p>
          <div style={{ background: "#fffbeb", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid #fef3c7", color: "#b45309", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: "0.4rem" }}></i>
            Tindakan ini akan dicatat ke dalam riwayat audit (Audit Log).
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeleteConfirmItem(null)}
              disabled={deleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
              style={{ background: "#dc2626", color: "#fff" }}
            >
              {deleting ? (
                <span><i className="fas fa-spinner fa-spin"></i> Menghapus...</span>
              ) : (
                <span><i className="fas fa-trash"></i> Hapus Sub-Aspek</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Riwayat Perubahan */}
      <Modal
        isOpen={isHistModalOpen}
        onClose={() => setIsHistModalOpen(false)}
        title={`Riwayat Audit Sub-Aspek Aktif Paket ${histFilterPackageId ? `(Paket ID: ${histFilterPackageId})` : "Keseluruhan"}`}
        wide
      >
        <div style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Filter Paket Riwayat:</label>
            <select
              value={histFilterPackageId}
              onChange={(e) => {
                setHistFilterPackageId(e.target.value);
                fetchHistory(e.target.value);
              }}
              style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            >
              <option value="">-- Semua Paket --</option>
              {packages.map(p => (
                <option key={p.id} value={p.id}>{p.package_code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "55vh" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead style={{ position: "sticky", top: 0, background: "#f8fafc" }}>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "0.6rem 0.75rem" }}>ID</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>ID Paket</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Kode Sub-Aspek</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Aksi</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Waktu Perubahan</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Petugas</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat riwayat...
                    </td>
                  </tr>
                ) : histData.length > 0 ? (
                  histData.map((h) => (
                    <tr key={h.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.6rem 0.75rem" }}>{h.id}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>{h.package_id}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><code>{h.sub_aspect_code}</code></td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <span style={{
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: h.action_type === "INSERT" ? "#ecfdf5" : "#fee2e2",
                          color: h.action_type === "INSERT" ? "#059669" : "#dc2626"
                        }}>
                          {h.action_type}
                        </span>
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        {h.created_at ? new Date(h.created_at).toLocaleString("id-ID") : "-"}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>{h.created_user || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                      Belum ada riwayat tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button className="btn btn-secondary" onClick={() => setIsHistModalOpen(false)}>
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PackageActiveSubAspectsPage;
