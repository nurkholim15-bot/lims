import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import AppSearchModal from "@components/AppSearchModal";
import { useToast } from '@context/ToastContext';

const TravelPage = ({ user }) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [activeTab, setActiveTab] = useState("REQUESTS"); // REQUESTS | APPROVALS
  const [locations, setLocations] = useState([]);
  const [isAppSearchModalOpen, setIsAppSearchModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [sourceTable, setSourceTable] = useState("travel_requests");
  const [formData, setFormData] = useState({
    reg_number: "",
    location_code: "",
    purpose: "",
    start_date: "",
    end_date: "",
    estimated_budget: 0,
    status: "DRAFT",
    notes: ""
  });

  const isSupervisor = user?.role === "ADMIN" || user?.role === "SUPERVISOR_SPD" || user?.role_name === 'ADMIN' || user?.role_name === 'SUPERVISOR_SPD';

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let endpoint = "/travel-requests?page=1&limit=100";
      if (filterYear) endpoint += `&year=${filterYear}`;
      if (filterMonth) endpoint += `&month=${filterMonth}`;
      
      if (isSupervisor) {
        if (activeTab === "REQUESTS") {
          endpoint += "&type=mine";
        } else if (activeTab === "APPROVALS") {
          endpoint += "&status=PENDING";
        }
      }

      const data = await apiRequest(endpoint);
      if (data) {
        setRequests(data.data || (Array.isArray(data) ? data : []));
        setSourceTable(data.source_table || "travel_requests");
      }
    } catch (err) {
      console.error("Fetch requests failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await apiRequest("/locations");
      if (data) setLocations(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Fetch locations failed:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, filterMonth, filterYear]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = () => {
    setFormData({
      reg_number: "",
      location_code: "",
      purpose: "",
      start_date: "",
      end_date: "",
      estimated_budget: 0,
      status: "DRAFT",
      notes: ""
    });
    setSelectedApp(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date + "T00:00:00Z",
        end_date: formData.end_date + "T00:00:00Z"
      };
      const result = await apiRequest("/travel-requests", "POST", payload);
      if (result) {
        setShowForm(false);
        showToast('Berhasil menyimpan pengajuan Perjalanan Dinas (SPD)', 'success');
        fetchRequests();
      }
    } catch (err) {
      showToast('Gagal menyimpan pengajuan Perjalanan Dinas (SPD): ' + err.message, 'error');
    }
  };

  const handleInquiry = (req) => {
    setSelectedReq(req);
    setShowDetail(true);
  };

  const handleApprove = async (req, status) => {
    const notes = window.promptAsync ? await window.promptAsync(`Konfirmasi ${status}. Masukkan catatan (opsional):`) : prompt(`Konfirmasi ${status}. Masukkan catatan (opsional):`);
    if (notes === null) return;
    try {
      const result = await apiRequest(`/travel-requests/${req.id}/approve`, "PUT", { status, notes });
      if (result) {
        setShowDetail(false);
        showToast(`Berhasil memproses persetujuan dengan status ${status}`, 'success');
        fetchRequests();
      }
    } catch (err) {
      showToast('Gagal memproses persetujuan: ' + err.message, 'error');
    }
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // We no longer filter in frontend to improve performance
  const displayRequests = Array.isArray(requests) ? requests : [];

  return (
      <div className="section-view active">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Pengajuan Perjalanan Dinas (SPD)</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <i className="fas fa-database"></i> Querying on: <code style={{ color: '#3b82f6', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>{sourceTable}</code>
              </p>
            </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isSupervisor && (
              <div className="tab-switcher" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                <button 
                  onClick={() => setActiveTab("REQUESTS")}
                  style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === 'REQUESTS' ? 'white' : 'transparent', boxShadow: activeTab === 'REQUESTS' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: activeTab === 'REQUESTS' ? '#0f172a' : '#64748b' }}
                >Request Saya</button>
                <button 
                  onClick={() => setActiveTab("APPROVALS")}
                  style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === 'APPROVALS' ? 'white' : 'transparent', boxShadow: activeTab === 'APPROVALS' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: activeTab === 'APPROVALS' ? '#0f172a' : '#64748b' }}
                >Persetujuan</button>
              </div>
            )}

            {/* Partition Date Filters */}
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <select 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(parseInt(e.target.value) || "")} 
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
                    onChange={(e) => setFilterYear(parseInt(e.target.value) || "")} 
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
                    {Array.from({ length: 7 }, (_, i) => {
                        const y = new Date().getFullYear() - 2 + i;
                        return (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        );
                    })}
                </select>
            </div>

            <button className="btn btn-primary" onClick={handleCreate}>
              <i className="fas fa-plus"></i> Buat SPD Baru
            </button>
          </div>
        </div>

              {loading ? <p style={{ padding: "2rem", textAlign: "center" }}>Memuat data...</p> : (
                  <table>
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>No SPD</th>
                              <th>No Reg Pengujian</th>
                              <th>Tujuan</th>
                              <th>Tujuan / Maksud</th>
                              <th>Tgl Mulai</th>
                              <th>Estimasi Biaya</th>
                              <th>Status</th>
                              <th>Aksi</th>
                          </tr>
                      </thead>
                      <tbody>
                          {displayRequests.length > 0 ? displayRequests.map(r => (
                              <tr key={r.id}>
                                  <td style={{ fontWeight: 800 }}>{r.id}</td>
                                  <td>{r.no_spd || '-'}</td>
                                  <td>{r.reg_number}</td>
                                  <td>{r.location?.name || r.location_code}</td>
                                  <td>{r.purpose}</td>
                                  <td>{r.start_date ? r.start_date.split('T')[0] : "-"}</td>
                                  <td>{formatIDR(r.estimated_budget)}</td>
                                  <td>
                                    <span className={`badge ${
                                      r.status === 'APPROVED' ? 'badge-green' : 
                                      (r.status === 'REJECTED' || r.status === 'CANCELED') ? 'badge-danger' : 
                                      r.status === 'PENDING' ? 'badge-blue' : 'badge-gray'
                                    }`}>
                                      {r.status}
                                    </span>
                                  </td>
                                  <td>
                                      {activeTab === "APPROVALS" ? (
                                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', background: '#3b82f6', color: 'white' }} onClick={() => handleInquiry(r)}>
                                          <i className="fas fa-search"></i> Inquiry
                                        </button>
                                      ) : r.status === 'DRAFT' ? (
                                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={async () => {
                                              try {
                                                await apiRequest(`/travel-requests/${r.id}`, "PUT", { ...r, status: 'PENDING' });
                                                showToast('Berhasil mengajukan Perjalanan Dinas (SPD)', 'success');
                                                fetchRequests();
                                              } catch(e) { showToast('Gagal mengajukan SPD: ' + e.message, 'error'); }
                                          }}>Submit</button>
                                      ) : (
                                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleInquiry(r)}>
                                          Detail
                                        </button>
                                      )}
                                  </td>
                              </tr>
                          )) : (
                            <tr>
                              <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Belum ada data {activeTab === "REQUESTS" ? "pengajuan" : "persetujuan"}.</td>
                            </tr>
                          )}
                      </tbody>
                  </table>
              )}
          </div>

          <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Buat Pengajuan SPD Baru" width="1200px">
              <form onSubmit={handleSubmit} className="travel-form-grid">
                  {/* Row 1 */}
                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>No. Reg Pengujian</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          value={formData.reg_number} 
                          onChange={(e) => {
                            setFormData({...formData, reg_number: e.target.value});
                            // If they change it manually, we might want to clear selectedApp if it doesn't match
                            if (selectedApp && selectedApp.reg_number !== e.target.value) {
                              setSelectedApp(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              setIsAppSearchModalOpen(true);
                            }
                          }}
                          placeholder="Input Reg. No lalu Enter..." 
                          required
                          style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: '0.85rem' }}
                        />
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          onClick={() => setIsAppSearchModalOpen(true)}
                          style={{ padding: "0 15px", borderRadius: "6px", width: "auto", flexShrink: 0 }}
                          title="Cari Data Pengajuan"
                        >
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                  </div>

                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Nama Alat</label>
                      <input type="text" readOnly 
                        value={selectedApp?.equipment?.equipment_name || "-"} 
                        style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: '0.85rem', color: '#64748b' }} 
                      />
                  </div>

                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Est. Biaya</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Rp 0"
                        value={formData.estimated_budget ? formatIDR(formData.estimated_budget) : ""} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({...formData, estimated_budget: parseFloat(val) || 0});
                        }} 
                        style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }} 
                      />
                  </div>

                  {/* Row 2 */}
                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Tujuan</label>
                      <select required value={formData.location_code} onChange={e => setFormData({...formData, location_code: e.target.value})} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: '0.85rem' }}>
                          <option value="">-- Lokasi --</option>
                          {Array.isArray(locations) && locations.map(loc => (
                              <option key={loc.code} value={loc.code}>{loc.name}</option>
                          ))}
                      </select>
                  </div>

                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Kota</label>
                      <input type="text" readOnly 
                        value={locations.find(l => l.code === formData.location_code)?.city?.city_name || "-"} 
                        style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: '0.85rem', color: '#64748b' }} 
                      />
                  </div>

                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Provinsi</label>
                      <input type="text" readOnly 
                        value={locations.find(l => l.code === formData.location_code)?.city?.province?.province_name || "-"} 
                        style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: '0.85rem', color: '#64748b' }} 
                      />
                  </div>
                  
                  {/* Row 3 */}
                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Tgl Mulai</label>
                      <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: '0.85rem' }} />
                  </div>
                  <div className="form-group travel-form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Tgl Selesai</label>
                      <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: '0.85rem' }} />
                  </div>

                  <div className="form-group travel-form-span-3 travel-form-group" style={{ alignItems: "flex-start", gap: "15px" }}>
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right', marginTop: '8px', whiteSpace: 'nowrap' }}>Maksud</label>
                      <textarea required placeholder="Jelaskan detail maksud perjalanan..." value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: '0.85rem', minHeight: "60px" }} />
                  </div>

                  <div className="travel-form-span-3 travel-form-buttons">
                      <button type="button" className="btn btn-secondary" style={{ padding: '8px 20px' }} onClick={() => setShowForm(false)}>Batal</button>
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 25px' }}>Simpan Pengajuan</button>
                  </div>
              </form>
          </Modal>

          <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Inquiry Pengajuan SPD">
              {selectedReq && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>ID SPD</label>
                      <div style={{ fontWeight: 700 }}>#{selectedReq.id}</div>
                    </div>
                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Status</label>
                      <div>
                        <span className={`badge ${
                          selectedReq.status === 'APPROVED' ? 'badge-green' : 
                          (selectedReq.status === 'REJECTED' || selectedReq.status === 'CANCELED') ? 'badge-danger' : 
                          selectedReq.status === 'PENDING' ? 'badge-blue' : 'badge-gray'
                        }`}>
                          {selectedReq.status}
                        </span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>No SPD</label>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.no_spd || '-'}</div>
                    </div>
                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>No Reg Pengujian</label>
                      <div style={{ fontWeight: 600, color: '#3b82f6' }}>{selectedReq.reg_number}</div>
                    </div>

                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Tujuan</label>
                      <div style={{ fontWeight: 600 }}>{selectedReq.location?.name || selectedReq.location_code}</div>
                    </div>
                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Mulai</label>
                      <div>{selectedReq.start_date ? selectedReq.start_date.split('T')[0] : "-"}</div>
                    </div>
                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Selesai</label>
                      <div>{selectedReq.end_date ? selectedReq.end_date.split('T')[0] : "-"}</div>
                    </div>

                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Estimasi Biaya</label>
                      <div style={{ fontWeight: 700, color: '#059669' }}>{formatIDR(selectedReq.estimated_budget)}</div>
                    </div>
                    <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Diajukan Oleh</label>
                      <div>{selectedReq.user?.username || 'N/A'}</div>
                    </div>

                    <div className="detail-item" style={{ gridColumn: 'span 3' }}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Maksud & Tujuan</label>
                      <div style={{ padding: '0.4rem', background: '#f8fafc', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #f1f5f9' }}>{selectedReq.purpose}</div>
                    </div>
                  </div>

                  {selectedReq.notes && (
                    <div className="detail-item">
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Catatan Supervisor</label>
                      <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.85rem' }}>{selectedReq.notes}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '5px', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 15px' }} onClick={() => setShowDetail(false)}>Tutup</button>
                    {isSupervisor && selectedReq.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-danger" style={{ padding: '6px 15px' }} onClick={() => handleApprove(selectedReq, 'CANCELED')}>Reject</button>
                        <button className="btn btn-success" style={{ padding: '6px 15px' }} onClick={() => handleApprove(selectedReq, 'APPROVED')}>Approve</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </Modal>

          <AppSearchModal
            isOpen={isAppSearchModalOpen}
            onClose={() => setIsAppSearchModalOpen(false)}
            initialSearch={formData.reg_number}
            onSelect={(app) => {
              setSelectedApp(app);
              setFormData({ ...formData, reg_number: app.reg_number });
            }}
          />
      </div>
  );
};


export default TravelPage;
