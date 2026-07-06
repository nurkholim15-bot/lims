import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import MasterForm from "@components/MasterForm";
import { useToast } from '@context/ToastContext';

const TestingToolsPage = ({ title, appConfig, setSelectedApp, setModalType }) => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Stock Transaction State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [stockQty, setStockQty] = useState(1);
  const [stockNotes, setStockNotes] = useState("");
  const [submittingStock, setSubmittingStock] = useState(false);

  // History State (Stock Transactions)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Audit Trail State (Master Data Changes)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedAuditCode, setSelectedAuditCode] = useState(null);

  // Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "/testing-tools";
      if (searchQuery) {
        endpoint += `?search=${encodeURIComponent(searchQuery)}`;
      }
      const result = await apiRequest(endpoint);
      if (result) setData(result);
    } catch (err) {
      console.error("Fetch tools error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item) => {
    const confirmed = window.confirmAsync ? await window.confirmAsync(`Apakah Anda yakin ingin menghapus alat "${item.name}"?`) : confirm(`Apakah Anda yakin ingin menghapus alat "${item.name}"?`);
    if (!confirmed) return;
    try {
      await apiRequest(`/management/testing-tools/${item.code}`, "DELETE");
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus data', 'error');
    }
  };

  const handleOpenStockIn = (tool) => {
    setSelectedTool(tool);
    setStockQty(1);
    setStockNotes("");
    setIsStockModalOpen(true);
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    setSubmittingStock(true);
    try {
      await apiRequest("/management/testing-tools/stock-in", "POST", {
        tool_code: selectedTool.code,
        quantity: parseInt(stockQty),
        notes: stockNotes
      });
      setIsStockModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menambah stok', 'error');
    } finally {
      setSubmittingStock(false);
    }
  };

  const handleOpenHistory = async (tool) => {
    setSelectedTool(tool);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const result = await apiRequest(`/management/testing-tools/${tool.code}/transactions`);
      setHistory(result || []);
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAuditHistory = async (ttCode = null) => {
    setAuditLoading(true);
    try {
      const endpoint = ttCode ? `/hist-testing-tools?tt_id=${ttCode}` : `/hist-testing-tools`;
      const result = await apiRequest(endpoint);
      if (result) {
        let rawData = result;
        if (!Array.isArray(rawData)) rawData = rawData.data || [rawData];
        setAuditHistory(rawData);
      }
    } catch (err) {
      console.error("Fetch audit history error:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRowClick = (item) => {
    setSelectedAuditCode(item.code);
    setIsAuditModalOpen(true);
    fetchAuditHistory(item.code);
  };

  const handleShowAllAudit = () => {
    setSelectedAuditCode(null);
    setIsAuditModalOpen(true);
    fetchAuditHistory(null);
  };

  const handleFetchReport = async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear()) {
        showToast('Pencarian lintas bulan tidak diperbolehkan. Silakan pilih rentang tanggal dalam bulan yang sama.', 'warning');
        return;
    }

    setReportLoading(true);
    try {
      const result = await apiRequest(`/reports/tool-transactions?start_date=${startDate}&end_date=${endDate}`);
      setReportData(result || []);
    } catch (err) {
      showToast('Gagal memuat laporan: ' + err.message, 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const handleViewApp = async (appId) => {
    try {
        const app = await apiRequest(`/applications/${appId}`);
        if (app && setSelectedApp && setModalType) {
            setSelectedApp(app);
            setModalType("query");
        }
    } catch (err) {
        showToast('Gagal memuat detail aplikasi: ' + err.message, 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Kelola data mastering dan stok peralatan pengujian</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={handleShowAllAudit}>
              <i className="fas fa-history"></i> Riwayat Audit
            </button>
            <button className="btn btn-secondary" onClick={() => { setIsReportModalOpen(true); handleFetchReport(); }}>
              <i className="fas fa-file-alt"></i> Laporan Transaksi
            </button>
            <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsMasterModalOpen(true); }}>
              <i className="fas fa-plus"></i> Tambah Alat Baru
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0" }}>
          <label style={{ fontWeight: 600, fontSize: "0.875rem", color: "#334155", marginRight: "0.5rem", display: "block", marginBottom: "0.25rem" }}>Pencarian:</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input 
              type="text" 
              placeholder="Cari Nama atau Kode Alat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchData()}
              style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.875rem", minWidth: "250px" }}
            />
            <button className="btn btn-primary" onClick={fetchData} style={{ padding: "0.5rem 1rem" }}>Filter</button>
          </div>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Alat</th>
                <th>Tipe</th>
                <th>Lokasi</th>
                <th style={{ textAlign: 'center' }}>Stok Awal</th>
                <th style={{ textAlign: 'center' }}>Stok Aktual</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "3rem" }}><i className="fas fa-spinner fa-spin"></i> Memuat...</td></tr>
              ) : data.map((item) => (
                <tr key={item.code} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 700 }}>{item.code}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>
                    <span className={`badge ${item.type === 'STOCK' ? 'badge-blue' : 'badge-gray'}`}>{item.type}</span>
                  </td>
                  <td>{item.location?.name || "-"}</td>
                  <td style={{ textAlign: 'center' }}>{item.type === 'STOCK' ? item.initial_stock : "-"}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.type === 'STOCK' ? (
                      <span style={{ 
                        fontWeight: 800, 
                        color: item.current_stock <= (item.initial_stock * 0.1) ? '#ef4444' : '#10b981',
                        padding: '4px 10px',
                        background: item.current_stock <= (item.initial_stock * 0.1) ? '#fef2f2' : '#f0fdf4',
                        borderRadius: '6px'
                      }}>
                        {item.current_stock}
                      </span>
                    ) : "-"}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-btns" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                      {item.type === 'STOCK' && (
                        <button className="action-btn" onClick={() => handleOpenStockIn(item)} style={{ color: '#10b981', background: '#f0fdf4' }} title="Input Stok Masuk">
                          <i className="fas fa-plus-circle"></i>
                        </button>
                      )}
                      <button className="action-btn" onClick={() => handleOpenHistory(item)} style={{ color: '#f59e0b', background: '#fffbeb' }} title="Riwayat Transaksi">
                        <i className="fas fa-history"></i>
                      </button>
                      <button className="action-btn" onClick={() => { setEditingItem(item); setIsMasterModalOpen(true); }} style={{ color: '#6366f1', background: '#eef2ff' }} title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="action-btn" onClick={() => handleDelete(item)} style={{ color: '#ef4444', background: '#fef2f2' }} title="Hapus">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Master Data */}
      <Modal isOpen={isMasterModalOpen} onClose={() => setIsMasterModalOpen(false)} title={`${editingItem ? "Edit" : "Tambah"} Alat`}>
        <div style={{ padding: '1.5rem' }}>
          <MasterForm 
            item={editingItem}
            endpoint="/testing-tools"
            crudEndpoint="/management/testing-tools"
            onSuccess={() => { setIsMasterModalOpen(false); fetchData(); }}
            onCancel={() => setIsMasterModalOpen(false)}
          />
        </div>
      </Modal>

      {/* Modal Stock In */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={`Input Stok Masuk: ${selectedTool?.name}`}>
        <form onSubmit={handleStockInSubmit} style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label>Jumlah Tambahan Stok</label>
            <input type="number" min="1" className="form-control" value={stockQty} onChange={(e) => setStockQty(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Keterangan / No. PO / Catatan</label>
            <textarea className="form-control" value={stockNotes} onChange={(e) => setStockNotes(e.target.value)} placeholder="Contoh: Pembelian PO-2026-001" rows="3"></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsStockModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submittingStock}>
                {submittingStock ? "Menyimpan..." : "Simpan Stok"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal History */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Riwayat Transaksi: ${selectedTool?.name}`} wide>
        <div style={{ padding: '1.25rem', maxHeight: '500px', overflowY: 'auto' }}>
          {historyLoading ? (
            <p style={{ textAlign: "center" }}>Loading history...</p>
          ) : history.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Tanggal</th>
                  <th style={{ padding: '10px' }}>Tipe</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Stok Awal</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Qty (+/-)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Stok Akhir</th>
                  <th style={{ padding: '10px' }}>Referensi</th>
                  <th style={{ padding: '10px' }}>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>{formatDate(h.created_at)}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: h.type === 'IN' ? '#dcfce7' : '#fee2e2',
                        color: h.type === 'IN' ? '#166534' : '#991b1b'
                      }}>
                        {h.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{h.stock_before}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>
                        {h.type === 'IN' ? '+' : '-'}{h.quantity}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#1e293b' }}>{h.stock_after}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>
                        {h.reference_type}
                        {h.reference_type === 'PLANNING' && (
                            <button 
                                onClick={() => handleViewApp(h.reference_id)}
                                style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                            >
                                <i className="fas fa-external-link-alt"></i> Detail
                            </button>
                        )}
                    </td>
                    <td style={{ padding: '10px', fontSize: '0.8rem' }}>{h.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Belum ada riwayat transaksi.</p>
          )}
        </div>
      </Modal>

      {/* Modal Laporan */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Laporan Transaksi Testing Tools" wide>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Tanggal Mulai</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '160px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Tanggal Selesai</label>
              <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '160px' }} />
            </div>
            <button className="btn btn-primary" onClick={handleFetchReport} disabled={reportLoading}>
              {reportLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>} Filter
            </button>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {reportLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}><i className="fas fa-spinner fa-spin fa-2x"></i></div>
            ) : reportData.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Waktu Transaksi</th>
                    <th style={{ padding: '12px' }}>Alat</th>
                    <th style={{ padding: '12px' }}>Tipe</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Awal</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Akhir</th>
                    <th style={{ padding: '12px' }}>Tabel Partisi</th>
                    <th style={{ padding: '12px' }}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9', hover: { background: '#f8fafc' } }}>
                      <td style={{ padding: '12px' }}>{formatDate(h.created_at)}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700 }}>{h.tool_name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{h.tool_code}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          background: h.type === 'IN' ? '#dcfce7' : '#fee2e2',
                          color: h.type === 'IN' ? '#166534' : '#991b1b'
                        }}>
                          {h.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{h.stock_before}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: h.type === 'IN' ? '#10b981' : '#ef4444' }}>
                          {h.type === 'IN' ? '+' : '-'}{h.quantity}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>{h.stock_after}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontStyle: 'italic', fontSize: '0.75rem', color: '#6366f1' }}>{h.partition_name}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.8rem', color: '#475569' }}>
                        {h.notes}
                        {h.reference_type === 'PLANNING' && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Ref: {h.reference_id}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
                <i className="fas fa-folder-open fa-3x" style={{ marginBottom: '1rem', opacity: 0.3 }}></i>
                <p>Tidak ada data transaksi ditemukan untuk periode ini.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Audit Trail Modal */}
      <Modal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        title={`Riwayat Audit Master Data ${selectedAuditCode ? `(Kode: ${selectedAuditCode})` : "Keseluruhan"}`}
        wide
      >
        <div style={{ padding: "1.5rem" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.85rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Hist ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Kode Alat</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Nama Alat</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Tipe</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Stok (I/A)</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Waktu</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>User (C/U/D)</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat data...
                    </td>
                  </tr>
                ) : auditHistory.length > 0 ? (
                  auditHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.tt_id}</td>
                      <td>{item.name}</td>
                      <td>{item.type}</td>
                      <td>{item.initial_stock}/{item.current_stock}</td>
                      <td>{formatDate(item.created_at)}</td>
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
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                      Belum ada riwayat perubahan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button className="btn btn-secondary" onClick={() => setIsAuditModalOpen(false)}>Tutup</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TestingToolsPage;
