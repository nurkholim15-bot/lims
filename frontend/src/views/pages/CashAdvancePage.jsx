import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import Pagination from "@components/Pagination";
import { useToast } from '@context/ToastContext';

const CashAdvancePage = ({ user }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    travel_request_id: "",
    notes: ""
  });
  
  const isSupervisor = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR_REIMBURSE';
  const [activeTab, setActiveTab] = useState("REQUESTS");

  // For Travel Request Lookup
  const [travelSearch, setTravelSearch] = useState("");
  const [travelResults, setTravelResults] = useState([]);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [showTravelDropdown, setShowTravelDropdown] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/cash-advances?page=${page}&limit=${limit}&search=${encodeURIComponent(search || "%")}&type=${activeTab === 'REQUESTS' ? 'mine' : 'all'}&year=${filterYear}&month=${filterMonth}`);
      if (res && res.data) {
        setItems(res.data || []);
        if (res.metadata) setTotal(res.metadata.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, search, activeTab, filterYear, filterMonth]);

  const searchTravel = async (q) => {
    if (!q) {
      setTravelResults([]);
      return;
    }
    try {
      const res = await apiRequest("/travel-requests?search=" + encodeURIComponent(q) + "&limit=10");
      if (res && res.data) setTravelResults(res.data || []);
    } catch (err) {
      console.error(err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount.replace(/[^0-9]/g, "")),
        notes: formData.notes
      };
      if (formData.travel_request_id) {
        payload.travel_request_id = parseInt(formData.travel_request_id);
      }
      
      await apiRequest("/cash-advances", "POST", payload);
      showToast('Pengajuan Kasbon berhasil dibuat!', 'success');
      setShowForm(false);
      setFormData({ title: "", amount: "", travel_request_id: "", notes: "" });
      setSelectedTravel(null);
      setTravelSearch("");
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.error || 'Gagal membuat pengajuan.', 'error');
    }
  };

  const handleApprove = async (item, status) => {
    if (!window.confirm(`Anda yakin ingin merubah status menjadi ${status}?`)) return;
    try {
      await apiRequest(`/cash-advances/${item.id}/approve`, "PUT", { status });
      fetchItems();
    } catch (err) {
      showToast('Gagal mengupdate status.', 'error');
    }
  };

  const formatIDR = (val) => {
    if (!val) return "";
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Kasbon / Cash Advance</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Kelola pengajuan uang muka</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isSupervisor && (
              <div className="tab-switcher" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                <button 
                  onClick={() => { setActiveTab("REQUESTS"); setPage(1); }}
                  style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === 'REQUESTS' ? 'white' : 'transparent', boxShadow: activeTab === 'REQUESTS' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                >Kasbon Saya</button>
                <button 
                  onClick={() => { setActiveTab("APPROVALS"); setPage(1); }}
                  style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === 'APPROVALS' ? 'white' : 'transparent', boxShadow: activeTab === 'APPROVALS' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                >Persetujuan</button>
              </div>
            )}
            <div className="travel-controls" style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Cari Judul / No. Registrasi..." 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
                
                <select 
                    className="form-control"
                    value={filterMonth}
                    onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }}
                    style={{ width: '120px', padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                    <option value="">Semua Bulan</option>
                    {Array.from({ length: 12 }, (_, i) => {
                        const m = (i + 1).toString().padStart(2, '0');
                        return <option key={m} value={m}>{new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}</option>;
                    })}
                </select>

                <select 
                    className="form-control"
                    value={filterYear}
                    onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
                    style={{ width: '100px', padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                    <option value="">Semua Tahun</option>
                    {Array.from({ length: 5 }, (_, i) => {
                        const y = new Date().getFullYear() - 2 + i;
                        return <option key={y} value={y}>{y}</option>;
                    })}
                </select>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus"></i> Ajukan Kasbon
            </button>
          </div>
        </div>

        {loading ? <p style={{ padding: "2rem", textAlign: "center" }}>Memuat data...</p> : (
          <>
            <div className="table-container" style={{ overflowX: 'auto' }}>
                <table>
                <thead>
                    <tr>
                    <th>No. Registrasi</th>
                    <th>Keperluan / Judul</th>
                    <th>Nominal (IDR)</th>
                    <th>SPD Terkait</th>
                    <th>Status</th>
                    <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length > 0 ? items.map(i => (
                    <tr key={i.id}>
                        <td style={{ fontWeight: 800 }}>{i.no_cash_advance || i.reg_number}</td>
                        <td>{i.title}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(i.amount)}</td>
                        <td>
                        {i.travel_request ? (
                            <div style={{ color: "#3b82f6", fontWeight: 600 }}>
                            {i.travel_request.reg_number}
                            </div>
                        ) : (
                            <span style={{ color: "#94a3b8" }}>Tanpa SPD</span>
                        )}
                        </td>
                        <td>
                        <span className={`badge ${
                            i.status === 'TRANSFERRED' || i.status === 'SETTLED' ? 'badge-green' : 
                            (i.status === 'REJECTED') ? 'badge-danger' : 
                            'badge-blue'
                        }`}>
                            {i.status}
                        </span>
                        </td>
                        <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => { setSelectedDetail(i); setShowDetail(true); }}>Detail</button>
                            {isSupervisor && i.status === 'PENDING' && activeTab === 'APPROVALS' && (
                                <>
                                    <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleApprove(i, 'APPROVED')}>Setujui</button>
                                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleApprove(i, 'REJECTED')}>Tolak</button>
                                </>
                            )}
                            {isSupervisor && i.status === 'APPROVED' && activeTab === 'APPROVALS' && (
                                <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleApprove(i, 'TRANSFERRED')}>Tandai Ditransfer</button>
                            )}
                        </div>
                        </td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Belum ada riwayat kasbon.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <Pagination current={page} total={total} limit={limit} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Ajukan Kasbon">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem' }}>
           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Judul Keperluan</label>
                <input type="text" required placeholder="Deskripsi singkat..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
           </div>
           
           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Nomor SPD</label>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            className="form-control"
                            placeholder="Ketik No. SPD untuk cari (Opsional)..."
                            value={selectedTravel ? `${selectedTravel.reg_number} - ${selectedTravel.purpose}` : travelSearch}
                            onChange={(e) => {
                                if (selectedTravel) {
                                    setSelectedTravel(null);
                                    setFormData({...formData, travel_request_id: ""});
                                }
                                setTravelSearch(e.target.value);
                                setShowTravelDropdown(true);
                            }}
                            onFocus={() => {
                                if (!selectedTravel && travelSearch) setShowTravelDropdown(true);
                            }}
                            style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: selectedTravel ? "#f0fdf4" : "#fff" }}
                        />
                        {(selectedTravel || travelSearch) && (
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => { 
                                    setSelectedTravel(null); 
                                    setTravelSearch("");
                                    setFormData({...formData, travel_request_id: ""});
                                    setTravelResults([]);
                                    setShowTravelDropdown(false);
                                }}
                                style={{ padding: "0 10px", borderRadius: "8px", width: "auto", flexShrink: 0 }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    {showTravelDropdown && travelResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                            {travelResults.map(r => (
                                <div 
                                    key={r.id} 
                                    onClick={() => {
                                        setSelectedTravel(r);
                                        setFormData({...formData, travel_request_id: r.id.toString()});
                                        setShowTravelDropdown(false);
                                    }}
                                    style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                                >
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.reg_number}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{r.purpose}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
           </div>
           
           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0 }}>Nominal Kasbon</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
                    <span style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRight: '1px solid #cbd5e1', fontWeight: 600, color: '#64748b' }}>Rp</span>
                    <input 
                        type="text" 
                        required 
                        value={formatIDR(formData.amount)} 
                        onChange={e => setFormData({...formData, amount: e.target.value.replace(/[^0-9]/g, "")})} 
                        style={{ border: 'none', padding: '0.5rem', width: '100%', outline: 'none', fontWeight: 600 }} 
                    />
                </div>
           </div>
           
           <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "1rem" }}>
                <label style={{ fontWeight: 600, width: '130px', minWidth: '130px', flexShrink: 0, marginTop: '8px' }}>Catatan</label>
                <textarea placeholder="Catatan tambahan..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px", resize: "vertical" }}></textarea>
           </div>
           
           <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
             <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", fontWeight: 600 }}>Batal</button>
             <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", fontWeight: 600 }}>Ajukan Kasbon</button>
           </div>
        </form>
      </Modal>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Detail Kasbon / Cash Advance">
        {selectedDetail && (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Nomor Registrasi</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedDetail.no_cash_advance || selectedDetail.reg_number}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Status</div>
                <div style={{ fontWeight: 600 }}>
                  <span className={`badge ${
                      selectedDetail.status === 'TRANSFERRED' || selectedDetail.status === 'SETTLED' ? 'badge-green' : 
                      (selectedDetail.status === 'REJECTED') ? 'badge-danger' : 
                      'badge-blue'
                  }`}>
                      {selectedDetail.status}
                  </span>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pemohon (User)</div>
                <div style={{ fontWeight: 600 }}>{selectedDetail.user?.username || selectedDetail.created_user}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tanggal Pengajuan</div>
                <div style={{ fontWeight: 600 }}>{new Date(selectedDetail.created_at).toLocaleDateString('id-ID')}</div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Nominal Kasbon</div>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f172a' }}>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedDetail.amount)}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Keperluan / Judul</div>
                <div style={{ fontWeight: 500 }}>{selectedDetail.title}</div>
              </div>
              
              {selectedDetail.travel_request && (
                <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Terhubung dengan SPD:</div>
                  <div style={{ fontWeight: 600, color: '#3b82f6' }}>{selectedDetail.travel_request.reg_number}</div>
                  <div style={{ fontSize: '0.9rem' }}>{selectedDetail.travel_request.purpose}</div>
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Catatan</div>
                <div style={{ padding: '0.75rem', background: '#f1f5f9', borderRadius: '8px', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
                  {selectedDetail.notes || '-'}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              {isSupervisor && selectedDetail.status === 'PENDING' && activeTab === 'APPROVALS' && (
                <>
                  <button className="btn" onClick={() => { handleApprove(selectedDetail, 'APPROVED'); setShowDetail(false); }} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    <i className="fas fa-check" style={{ marginRight: '5px' }}></i> Setujui
                  </button>
                  <button className="btn" onClick={() => { handleApprove(selectedDetail, 'REJECTED'); setShowDetail(false); }} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    <i className="fas fa-times" style={{ marginRight: '5px' }}></i> Tolak
                  </button>
                </>
              )}
              {isSupervisor && selectedDetail.status === 'APPROVED' && activeTab === 'APPROVALS' && (
                <button className="btn" onClick={() => { handleApprove(selectedDetail, 'TRANSFERRED'); setShowDetail(false); }} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  Tandai Ditransfer
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px' }}>Tutup</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashAdvancePage;
