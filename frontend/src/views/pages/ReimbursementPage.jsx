import React, { useState, useEffect } from "react";
import { apiRequest, getDownloadUrl } from "@models/api";
import Modal from "@components/Modal";
import Pagination from "@components/Pagination";
import TravelRequestSearchModal from "@components/TravelRequestSearchModal";
import { useToast } from '@context/ToastContext';

const ReimbursementPage = ({ user, checkPasswordRequirement }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [activeTab, setActiveTab] = useState("REQUESTS");
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [travelResults, setTravelResults] = useState([]);
  const [travelSearch, setTravelSearch] = useState("");
  const [showTravelDropdown, setShowTravelDropdown] = useState(false);
  const [travelLoading, setTravelLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    travel_request_id: "",
    cash_advance_id: "",
    notes: "",
    receipt_path: "",
    transaction_date: ""
  });
  
  const [cashAdvances, setCashAdvances] = useState([]);

  const handleOpenForm = async () => {
    setFormData({ title: "", amount: "", travel_request_id: "", cash_advance_id: "", notes: "", receipt_path: "", transaction_date: "" });
    setSelectedTravel(null);
    setTravelSearch("");
    setShowForm(true);
    
    // Fetch user's transferred/approved cash advances
    try {
      const res = await apiRequest("/cash-advances?type=mine&limit=100");
      if (res && res.data) {
         setCashAdvances(res.data.filter(c => c.status === 'APPROVED' || c.status === 'TRANSFERRED'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const forceFilter = true; // Match Rekanan behavior

  const isSupervisor = user?.role === "ADMIN" || user?.role === "SUPERVISOR_REIMBURSE";

  const fetchItems = async () => {
    if (forceFilter && !isFiltered) {
        setItems([]);
        return;
    }
    setLoading(true);
    try {
      let url = `/reimbursements?page=${page}&limit=${limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterYear) url += `&year=${filterYear}`;
      if (filterMonth) url += `&month=${filterMonth}`;
      
      if (isSupervisor) {
        if (activeTab === "REQUESTS") url += `&type=mine`;
        else if (activeTab === "APPROVALS") url += `&status=PENDING`;
      }

      const response = await apiRequest(url);
      if (response) {
        if (response.data) {
          setItems(response.data);
          setTotal(response.metadata?.total || 0);
          setLimit(response.metadata?.limit || 10);
        } else {
          setItems(response);
          setTotal(response.length || 0);
        }
      }
    } catch (err) {
      console.error("Fetch reimbursements failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setIsFiltered(true);
    setPage(1);
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, [page, isFiltered, activeTab, filterMonth, filterYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("amount", formData.amount);
      data.append("date", formData.date);
      data.append("notes", formData.notes);
      data.append("travel_request_id", formData.travel_request_id);
      data.append("cash_advance_id", formData.cash_advance_id);
      if (formData.receipt) {
        data.append("receipt", formData.receipt);
      }

      const result = await apiRequest("/reimbursements", "POST", data);
      if (result) {
        setShowForm(false);
        showToast('Berhasil mengajukan reimbursement', 'success');
        fetchItems();
        setFormData({
          title: "",
          amount: 0,
          date: "",
          notes: "",
          travel_request_id: "",
          cash_advance_id: "",
          receipt: null
        });
        setSelectedTravel(null);
        setTravelSearch("");
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleApprove = async (item, status) => {
    const doApprove = async () => {
      try {
        await apiRequest(`/reimbursements/${item.id}/approve`, "PUT", { status, notes: approvalNotes });
        showToast(`Berhasil memproses persetujuan dengan status ${status}`, 'success');
        setShowDetail(false);
        fetchItems();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    if (checkPasswordRequirement) {
      checkPasswordRequirement(doApprove);
    } else {
      doApprove();
    }
  };

  const searchTravel = async (query) => {
    if (!query || query.length < 1) {
        setTravelResults([]);
        return;
    }
    setTravelLoading(true);
    try {
        let url = `/travel-requests?search=${encodeURIComponent(query)}&status=APPROVED&limit=10`;
        if (filterYear) url += `&year=${filterYear}`;
        if (filterMonth) url += `&month=${filterMonth}`;
        const res = await apiRequest(url);
        if (res && res.data) {
            setTravelResults(res.data);
        }
    } catch (err) {
        console.error("Search travel failed:", err);
    } finally {
        setTravelLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if (travelSearch && showTravelDropdown) {
            searchTravel(travelSearch);
        }
    }, 300);
    return () => clearTimeout(timer);
  }, [travelSearch]);

  const formatIDR = (val) => {
    if (!val) return "";
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const parseIDR = (val) => {
    if (!val) return "0";
    return val.toString().replace(/\./g, "").replace(/[^0-9]/g, "");
  };

  const handleViewReceipt = async (e, path) => {
    e.preventDefault();
    try {
      const url = getDownloadUrl(path);
      const response = await fetch(url);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        showToast(data.error || 'File tidak ditemukan di server.', 'error');
        return;
      }
      
      window.open(url, "_blank");
    } catch (err) {
      showToast('Gagal menghubungi server untuk mengunduh file.', 'error');
    }
  };

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Reimbursement / Penggantian Biaya</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Kelola riwayat pengajuan biaya operasional</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isSupervisor && (
              <div className="tab-switcher" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                <button 
                  onClick={() => { setActiveTab("REQUESTS"); setPage(1); }}
                  style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === 'REQUESTS' ? 'white' : 'transparent', boxShadow: activeTab === 'REQUESTS' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: activeTab === 'REQUESTS' ? '#0f172a' : '#64748b' }}
                >Reimbursement Saya</button>
                <button 
                  onClick={() => { setActiveTab("APPROVALS"); setPage(1); }}
                  style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === 'APPROVALS' ? 'white' : 'transparent', boxShadow: activeTab === 'APPROVALS' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: activeTab === 'APPROVALS' ? '#0f172a' : '#64748b' }}
                >Persetujuan</button>
              </div>
            )}
            {/* Partition Date Filters */}
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <select 
                    value={filterMonth} 
                    onChange={(e) => { setFilterMonth(e.target.value); setIsFiltered(true); setPage(1); }} 
                    style={{ 
                        padding: '8px 12px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1', 
                        background: 'white', 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#334155',
                        outline: 'none',
                        cursor: 'pointer',
                        height: '38px'
                    }}
                >
                    <option value="">-- Bulan --</option>
                    {Array.from({ length: 12 }, (_, i) => {
                        const m = i + 1;
                        return (
                            <option key={m} value={m}>
                                {new Date(2000, i, 1).toLocaleString('id-ID', { month: 'short' })}
                            </option>
                        );
                    })}
                </select>
                <select 
                    value={filterYear} 
                    onChange={(e) => { setFilterYear(e.target.value); setIsFiltered(true); setPage(1); }} 
                    style={{ 
                        padding: '8px 12px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1', 
                        background: 'white', 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#334155',
                        outline: 'none',
                        cursor: 'pointer',
                        height: '38px'
                    }}
                >
                    <option value="">-- Tahun --</option>
                    {Array.from({ length: 5 }, (_, i) => {
                        const y = new Date().getFullYear() - 2 + i;
                        return (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Search Bar like Rekanan */}
            <div style={{  
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center', 
                background: '#f1f5f9', 
                padding: '6px 10px', 
                borderRadius: '10px', 
                border: '1px solid #e2e8f0',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '0.9rem', marginLeft: '4px' }}></i>
                <input 
                    type="text" 
                    placeholder="Cari No. Reimbursement/SPD..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '220px', color: '#1e293b' }}
                />
                <button 
                    onClick={handleFilter}
                    style={{ 
                        background: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        padding: '6px 16px', 
                        fontSize: '0.875rem', 
                        fontWeight: 800, 
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                    }}
                >
                    Filter
                </button>
            </div>
            <button className="btn btn-primary" onClick={handleOpenForm}>
              <i className="fas fa-plus"></i> Ajukan Reimbursement
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href='/welcome'} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-times"></i> Tutup
            </button>
          </div>
        </div>

        {loading ? <p style={{ padding: "5rem", textAlign: "center" }}><i className="fas fa-spinner fa-spin"></i> Memuat daftar reimbursement...</p> : 
         forceFilter && !isFiltered ? (
            <div style={{ textAlign: "center", padding: "5rem", color: "#64748b" }}>
                <i className="fas fa-search" style={{ fontSize: '3rem', color: '#e2e8f0', marginBottom: '1rem' }}></i>
                <p style={{ margin: 0, fontWeight: 700, color: '#475569' }}>Silakan masukkan filter untuk menampilkan data</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Gunakan <strong>%</strong> untuk menampilkan semua data.</p>
            </div>
         ) : (
          <>
            <div className="table-container" style={{ overflowX: 'auto' }}>
                <table>
                <thead>
                    <tr>
                    <th>No. Reimbursement</th>
                    <th>Keperluan / Judul</th>
                    <th>Tanggal Transaksi</th>
                    <th>Jumlah (IDR)</th>
                    <th>SPD Terkait</th>
                    <th>Bukti Kwitansi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length > 0 ? items.map(i => (
                    <tr key={i.id}>
                        <td style={{ fontWeight: 800 }}>{i.reg_number || i.id}</td>
                        <td>{i.title}</td>
                        <td>{i.date?.split('T')[0]}</td>
                        <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(i.amount)}</td>
                        <td style={{ fontSize: "0.85rem" }}>
                        {i.travel_request ? (
                            <div style={{ color: "#3b82f6", fontWeight: 600 }}>
                            SPD #{i.travel_request.id} - {i.travel_request.destination}
                            <br/>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{i.travel_request.reg_number}</span>
                            </div>
                        ) : (
                            <span style={{ color: "#94a3b8" }}>Tanpa SPD</span>
                        )}
                        </td>
                        <td>
                        {i.receipt_path ? (
                            <a 
                            href="#"
                            onClick={(e) => handleViewReceipt(e, i.receipt_path)}
                            style={{ color: "#8b5cf6", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                            <i className="fas fa-paperclip"></i> Lihat Bukti
                            </a>
                        ) : (
                            <span style={{ color: "#f87171" }}>File Tidak Ada</span>
                        )}
                        </td>
                        <td>
                        <span className={`badge ${
                            i.status === 'PAID' ? 'badge-green' : 
                            (i.status === 'REJECTED' || i.status === 'CANCELED') ? 'badge-danger' : 
                            'badge-blue'
                        }`}>
                            {i.status}
                        </span>
                        </td>
                        <td>
                        {(isSupervisor || user?.role_name === 'ADMIN' || user?.role_name === 'SUPERVISOR_REIMBURSE') && i.status === 'PENDING' && activeTab === 'APPROVALS' ? (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => { setSelectedDetail(i); setApprovalNotes(""); setShowDetail(true); }}>Detail</button>
                            </div>
                        ) : (
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => { setSelectedDetail(i); setApprovalNotes(""); setShowDetail(true); }}>Detail</button>
                        )}
                        </td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Belum ada riwayat reimbursement.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <Pagination 
                    current={page} 
                    total={total} 
                    limit={limit} 
                    onPageChange={setPage} 
                />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Ajukan Reimbursement">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem' }}>
           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Judul Keperluan</label>
                <input type="text" required placeholder="Deskripsi singkat pengeluaran..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
           </div>
           
           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Nomor SPD</label>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            className="form-control"
                            placeholder="Ketik No. SPD untuk cari (misal: SPD-2026-00001)..."
                            value={selectedTravel ? `${selectedTravel.no_spd || selectedTravel.reg_number} - ${selectedTravel.purpose}` : travelSearch}
                            onChange={(e) => {
                                if (selectedTravel) {
                                    setSelectedTravel(null);
                                    setFormData({...formData, travel_request_id: "", cash_advance_id: ""});
                                }
                                setTravelSearch(e.target.value);
                                setShowTravelDropdown(true);
                            }}
                            onFocus={() => {
                                if (!selectedTravel && travelSearch) setShowTravelDropdown(true);
                            }}
                            style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: selectedTravel ? "#f0fdf4" : "#fff" }}
                        />
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={() => setIsTravelModalOpen(true)}
                            style={{ padding: "0 15px", borderRadius: "8px", width: "auto", flexShrink: 0 }}
                            title="Pencarian Lanjut"
                        >
                            <i className="fas fa-search"></i>
                        </button>
                        {(selectedTravel || travelSearch) && (
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => { 
                                    setSelectedTravel(null); 
                                    setTravelSearch("");
                                    setFormData({...formData, travel_request_id: "", cash_advance_id: ""});
                                    setTravelResults([]);
                                    setShowTravelDropdown(false);
                                }}
                                style={{ padding: "0 10px", borderRadius: "8px", width: "auto", flexShrink: 0 }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    {showTravelDropdown && (travelResults.length > 0 || travelLoading) && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0, 
                            right: 0, 
                            zIndex: 1000, 
                            background: 'white', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '8px', 
                            marginTop: '4px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {travelLoading ? (
                                <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin"></i> Mencari...
                                </div>
                            ) : travelResults.map(r => (
                                <div 
                                    key={r.id} 
                                    onClick={() => {
                                        setSelectedTravel(r);
                                        const matchedCashAdvance = cashAdvances.find(c => c.travel_request_id === r.id);
                                        setFormData({...formData, travel_request_id: r.id, cash_advance_id: matchedCashAdvance ? matchedCashAdvance.id : ""});
                                        setShowTravelDropdown(false);
                                        setTravelResults([]);
                                    }}
                                    style={{ 
                                        padding: '0.75rem', 
                                        cursor: 'pointer', 
                                        borderBottom: '1px solid #f1f5f9',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.no_spd || r.reg_number}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.purpose}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
           </div>

           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Terkait Kasbon</label>
                <input 
                    type="text" 
                    readOnly
                    value={formData.cash_advance_id ? (() => {
                        const c = cashAdvances.find(c => c.id == formData.cash_advance_id);
                        return c ? `${c.reg_number} - Rp ${new Intl.NumberFormat('id-ID').format(c.amount)} (${c.title})` : '';
                    })() : ''}
                    placeholder="-- Tidak ada Kasbon --"
                    style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b" }}
                />
           </div>
           
           {formData.cash_advance_id && (
                <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", marginTop: "-0.5rem" }}>
                    <div style={{ width: '130px', minWidth: '130px', flexShrink: 0 }}></div>
                    <div style={{ flex: 1, padding: "0.75rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Nominal Kasbon:</span>
                            <span style={{ fontWeight: 600 }}>Rp {new Intl.NumberFormat('id-ID').format(cashAdvances.find(c => c.id == formData.cash_advance_id)?.amount || 0)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Kekurangan/Kelebihan:</span>
                            {(() => {
                                const kasbonAmt = cashAdvances.find(c => c.id == formData.cash_advance_id)?.amount || 0;
                                const currentAmt = parseFloat(formData.amount) || 0;
                                const diff = currentAmt - kasbonAmt;
                                const isKelebihan = diff < 0;
                                return (
                                    <span style={{ fontWeight: 700, color: isKelebihan ? '#ef4444' : '#10b981' }}>
                                        {isKelebihan ? '-' : '+'} Rp {new Intl.NumberFormat('id-ID').format(Math.abs(diff))}
                                    </span>
                                );
                            })()}
                        </div>
                        {parseFloat(formData.amount) < (cashAdvances.find(c => c.id == formData.cash_advance_id)?.amount || 0) && (
                            <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#ef4444", fontStyle: "italic" }}>
                                * Terdapat kelebihan dana Kasbon, user harus mengembalikan selisihnya.
                            </div>
                        )}
                    </div>
                </div>
           )}
           
           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Tanggal Transaksi</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
           </div>

           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Jumlah (IDR)</label>
                <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 600 }}>Rp</span>
                    <input 
                        type="text" 
                        required 
                        placeholder="0" 
                        value={formatIDR(formData.amount)} 
                        onChange={e => {
                            const raw = parseIDR(e.target.value);
                            setFormData({...formData, amount: raw ? parseFloat(raw) : 0});
                        }} 
                        style={{ width: '100%', padding: "0.5rem 0.5rem 0.5rem 2.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                    />
                </div>
           </div>

           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Bukti Kwitansi</label>
                <input type="file" required onChange={e => setFormData({...formData, receipt: e.target.files[0]})} style={{ flex: 1, padding: "0.4rem", borderRadius: "8px", border: "1px dashed #cbd5e1" }} />
           </div>

           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0, marginTop: '8px' }}>Catatan</label>
                <textarea placeholder="Catatan tambahan..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "60px" }} />
           </div>

           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>Ajukan Reimbursement</button>
           </div>
        </form>
      </Modal>

      <TravelRequestSearchModal 
        isOpen={isTravelModalOpen}
        onClose={() => setIsTravelModalOpen(false)}
        onSelect={(r) => {
            setSelectedTravel(r);
            setFormData(prev => ({ ...prev, travel_request_id: r.id }));
        }}
      />

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Detail Reimbursement">
          {selectedDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>No. Reimbursement</span>
                          <div style={{ fontWeight: 700 }}>REIM-{selectedDetail.date ? selectedDetail.date.split('-')[0] : new Date().getFullYear()}-{selectedDetail.id.toString().padStart(5, '0')}</div>
                      </div>
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Status</span>
                          <div>
                            <span className={`badge ${
                                selectedDetail.status === 'PAID' ? 'badge-green' : 
                                (selectedDetail.status === 'REJECTED' || selectedDetail.status === 'CANCELED') ? 'badge-danger' : 
                                'badge-blue'
                            }`}>
                                {selectedDetail.status}
                            </span>
                          </div>
                      </div>
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Judul Keperluan</span>
                          <div style={{ fontWeight: 600 }}>{selectedDetail.title}</div>
                      </div>
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Tanggal Transaksi</span>
                          <div>{selectedDetail.date?.split('T')[0]}</div>
                      </div>
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Jumlah</span>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Rp {new Intl.NumberFormat('id-ID').format(selectedDetail.amount)}</div>
                      </div>
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Diajukan Oleh</span>
                          <div>{selectedDetail.user?.username || '-'}</div>
                      </div>
                  </div>
                  
                  {selectedDetail.travel_request && (
                      <div style={{ padding: '0.8rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>SPD Terkait</span>
                          <div style={{ fontWeight: 600, color: '#3b82f6' }}>{selectedDetail.travel_request.no_spd || selectedDetail.travel_request.reg_number}</div>
                          <div style={{ fontSize: '0.8rem' }}>{selectedDetail.travel_request.purpose}</div>
                      </div>
                  )}

                  {selectedDetail.cash_advance_id && (
                      <div style={{ padding: '0.8rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                          <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Terkait Kasbon</span>
                          <div style={{ fontWeight: 600, color: '#b45309', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Terdapat Kasbon Terhubung: {selectedDetail.cash_advance?.no_cash_advance || selectedDetail.cash_advance?.reg_number || `(ID: ${selectedDetail.cash_advance_id})`}</span>
                              {selectedDetail.cash_advance?.amount && (
                                  <span>Rp {new Intl.NumberFormat('id-ID').format(selectedDetail.cash_advance.amount)}</span>
                              )}
                          </div>
                      </div>
                  )}

                  {selectedDetail.notes && (
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Catatan</span>
                          <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>{selectedDetail.notes}</div>
                      </div>
                  )}

                  {selectedDetail.receipt_path && (
                      <div>
                          <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Bukti Kwitansi</span>
                          <a 
                              href="#" 
                              onClick={(e) => handleViewReceipt(e, selectedDetail.receipt_path)} 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                              <i className="fas fa-paperclip"></i> Buka File Kwitansi
                          </a>
                      </div>
                  )}

                  {(isSupervisor || user?.role_name === 'ADMIN' || user?.role_name === 'SUPERVISOR_REIMBURSE') && selectedDetail.status === 'PENDING' && (
                      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                          <div className="detail-item" style={{ marginBottom: '1rem' }}>
                              <label style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Catatan Persetujuan (Opsional)</label>
                              <textarea
                                  className="form-control"
                                  rows="3"
                                  placeholder="Masukkan catatan jika diperlukan..."
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                              ></textarea>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                              <button 
                                  className="btn" 
                                  style={{ backgroundColor: 'black', color: 'white', fontWeight: 600, padding: '8px 16px', border: 'none', borderRadius: '6px' }} 
                                  onClick={() => handleApprove(selectedDetail, 'APPROVED')}
                              >
                                  Setuju
                              </button>
                              <button 
                                  className="btn" 
                                  style={{ backgroundColor: '#ef4444', color: 'white', fontWeight: 600, padding: '8px 16px', border: 'none', borderRadius: '6px' }} 
                                  onClick={() => handleApprove(selectedDetail, 'REJECTED')}
                              >
                                  Tolak
                              </button>
                              <button 
                                  className="btn" 
                                  style={{ backgroundColor: '#eab308', color: 'white', fontWeight: 600, padding: '8px 16px', border: 'none', borderRadius: '6px' }} 
                                  onClick={() => handleApprove(selectedDetail, 'CLOSED')}
                              >
                                  Closed
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          )}
      </Modal>
    </div>
  );
};

export default ReimbursementPage;
