import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import { printReceipt } from "@utils/print";
import PartnerSearchModal from "@components/PartnerSearchModal";

const PaymentPage = ({ currentUser, appConfig }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorNotif, setErrorNotif] = useState(null);
  const [successNotif, setSuccessNotif] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [foundInvoices, setFoundInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [paymentForm, setPaymentForm] = useState({
    amount_paid: 0,
    payment_method: "Transfer",
    reference_no: "",
  });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setErrorNotif(null);
    setSelectedInvoice(null);
    setFoundInvoices([]);
    setLastPayment(null);
    setSelectedPartner(null);

    try {
      // 1. Determine if search is likely a Reg Number (LIMS- prefix or YYYY-XXXXX format)
      const isRegNumber = searchQuery.toUpperCase().startsWith("LIMS-") || /^\d{4}-\d{5}$/.test(searchQuery.trim());

      if (isRegNumber) {
        const appRes = await apiRequest(`/applications/search-reg?reg_number=${encodeURIComponent(searchQuery)}`);
        if (appRes && appRes.applications && appRes.applications.length > 0) {
          const app = appRes.applications[0];
          // Get Partner directly from the partner relation in the app
          setSelectedPartner(app.partner);
          // Fetch invoice specifically for this application_id
          await fetchInvoicesByApp(app.id);
        } else {
          setErrorNotif("Nomor Registrasi tidak ditemukan.");
        }
      } else {
        // 2. Search directly in partners table
        const partRes = await apiRequest(`/partners?search=${encodeURIComponent(searchQuery)}&limit=10`);
        if (partRes && partRes.data) {
          if (partRes.data.length === 1) {
            const p = partRes.data[0];
            setSelectedPartner(p);
            await fetchInvoicesByPartner(p.id);
          } else if (partRes.data.length > 1) {
            setIsPartnerModalOpen(true);
          } else {
            setErrorNotif("Rekanan tidak ditemukan.");
          }
        }
      }
    } catch (err) {
      setErrorNotif("Terjadi kesalahan saat mencari data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoicesByPartner = async (partnerId, page = 1, append = false) => {
    try {
      const statusFilter = showHistory ? "" : "&status=UNPAID,PARTIAL";
      const res = await apiRequest(`/invoices?partner_id=${partnerId}${statusFilter}&page=${page}&limit=10`);
      if (res && res.data) {
        if (append) {
          setFoundInvoices(prev => [...prev, ...res.data]);
        } else {
          setFoundInvoices(res.data);
          if (res.data.length > 0 && !selectedInvoice) {
            setSelectedInvoice(res.data[0]);
            setPaymentForm(prev => ({ ...prev, amount_paid: res.data[0].final_amount }));
          }
        }
        setPagination({ 
          page: res.metadata?.page || page, 
          limit: res.metadata?.limit || 10, 
          total: res.metadata?.total || 0 
        });
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
    }
  };

  const fetchInvoicesByApp = async (appId) => {
    try {
      // Invoices for a specific app usually don't need status filter (should only be 1 or 2)
      const res = await apiRequest(`/invoices?application_id=${appId}`);
      if (res && res.data) {
        setFoundInvoices(res.data);
        if (res.data.length > 0) {
          setSelectedInvoice(res.data[0]);
          setPaymentForm(prev => ({ ...prev, amount_paid: res.data[0].final_amount }));
        } else {
          setErrorNotif("Invoice belum di-generate untuk pendaftaran ini.");
        }
        setPagination({ page: 1, limit: 100, total: res.data.length });
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
    }
  };

  const handleLoadMore = () => {
    if (selectedPartner) {
      fetchInvoicesByPartner(selectedPartner.id, pagination.page + 1, true);
    }
  };

  // Update when showHistory changes
  useEffect(() => {
    if (selectedPartner) {
      fetchInvoicesByPartner(selectedPartner.id);
    }
  }, [showHistory]);

  const handlePartnerSelect = (p) => {
    setSelectedPartner(p);
    setSearchQuery(p.name);
    setIsPartnerModalOpen(false);
    fetchInvoicesByPartner(p.id);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    // Debug log in dev mode
    if (import.meta.env.DEV) console.log("Selected Invoice:", selectedInvoice);
    
    const invId = selectedInvoice?.id || selectedInvoice?.ID;
    if (!invId) {
      setErrorNotif(`ID Invoice tidak ditemukan (${selectedInvoice?.invoice_number || 'Data Kosong'}). Silakan pilih invoice kembali.`);
      return;
    }

    setSubmitting(true);
    setErrorNotif(null);

    try {
      const res = await apiRequest("/payments", "POST", {
        invoice_id: Number(invId),
        amount_paid: parseFloat(paymentForm.amount_paid),
        payment_method: paymentForm.payment_method,
        reference_no: paymentForm.reference_no
      });

      if (res && res.id) {
        setSuccessNotif("Pembayaran berhasil dicatat!");
        
        // Prepare detailed payment data for receipt
        const paymentWithDetails = {
           ...res,
           invoice: {
             ...selectedInvoice,
             // The backend already updated the status in DB, but we reflect it here
             status: (selectedInvoice.total_paid || 0) + res.amount >= selectedInvoice.final_amount ? 'PAID' : 'PARTIAL',
             application: {
               reg_number: selectedInvoice.application?.reg_number,
               partner: selectedPartner,
               package: selectedInvoice.application?.package
             }
           }
        };
        
        setLastPayment(paymentWithDetails);
        
        // Auto-print receipt
        setTimeout(() => {
          printReceipt(paymentWithDetails, appConfig);
        }, 500);
      }
    } catch (err) {
      setErrorNotif(err.message || "Gagal mencatat pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container anim-fade-in">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="icon-circle" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <i className="fas fa-cash-register" style={{ color: 'white' }}></i>
          </div>
          <div>
            <h2 className="page-title" style={{ margin: 0 }}>Pembayaran & Kasir</h2>
            <p className="page-subtitle" style={{ margin: 0, opacity: 0.7 }}>Proses pembayaran invoice rekanan</p>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4" style={{ borderLeft: "4px solid #7c3aed" }}>
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="form-group mb-0">
              <label className="form-label" style={{ fontWeight: 700, color: '#4338ca' }}>
                Cari Rekanan / No. Registrasi <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan ID, Nama Rekanan, atau Nomor Registrasi (LIMS-YYYY-...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                  style={{ height: '50px', fontSize: '1.1rem', flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !searchQuery} style={{ height: '50px', borderRadius: '10px', padding: '0 16px', fontSize: '1.1rem', flexShrink: 0, width: 'auto' }}>
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-search"></i><span className="btn-cari-text" style={{ marginLeft: '4px' }}>Cari</span></>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {errorNotif && (
        <div className="alert alert-danger anim-shake" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-exclamation-circle"></i> {errorNotif}
        </div>
      )}

      {successNotif && (
        <div className="alert alert-success anim-slide-up" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-check-circle"></i> {successNotif}
        </div>
      )}

      {selectedPartner && (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          {/* Partner Info Card - Replicating SubmissionForm layout */}
          <div className="card shadow-sm anim-slide-up" style={{ borderLeft: "4px solid #7c3aed" }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h5 style={{ margin: 0, color: '#5b21b6' }}>
                  <i className="fas fa-user-tie"></i> Informasi Pemohon
                </h5>
                <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>ID: {selectedPartner.id}</span>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Nama Rekanan</label>
                  <input type="text" value={selectedPartner.name || "-"} readOnly style={{ backgroundColor: "#f8fafc", fontWeight: "bold", color: "#1e293b", fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Kategori</label>
                  <input type="text" value={selectedPartner.type?.name || selectedPartner.type_code || "-"} readOnly style={{ backgroundColor: "#f8fafc", fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Kota</label>
                  <input type="text" value={selectedPartner.city?.city_name || selectedPartner.city_code || "-"} readOnly style={{ backgroundColor: "#f8fafc", fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Alamat</label>
                  <input type="text" value={selectedPartner.alamat || "-"} readOnly style={{ backgroundColor: "#f8fafc", fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Nama PIC</label>
                  <input type="text" value={selectedPartner.pic_name || "-"} readOnly style={{ backgroundColor: "#f8fafc", fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Telepon PIC</label>
                  <input type="text" value={selectedPartner.pic_phone || "-"} readOnly style={{ backgroundColor: "#f8fafc", fontSize: '0.9rem' }} />
                </div>
                {selectedInvoice?.application?.reg_number && (
                  <div className="form-group full-width" style={{ marginTop: '5px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6d28d9' }}>No. Registrasi</label>
                    <input type="text" value={selectedInvoice.application.reg_number} readOnly style={{ backgroundColor: "#f5f3ff", color: '#7c3aed', fontWeight: 800, fontSize: '1rem', border: '1px solid #ddd6fe' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice & Payment Card */}
          <div className="card anim-slide-up" style={{ animationDelay: '0.1s' }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-file-invoice-dollar" style={{ color: '#7c3aed' }}></i> Detail Tagihan
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={showHistory} 
                    onChange={(e) => setShowHistory(e.target.checked)} 
                    style={{ marginRight: '5px' }}
                  />
                  Tampilkan Riwayat
                </label>
              </div>
            </div>

            {foundInvoices.length > 0 ? (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                   <div className="flex justify-between items-center mb-2">
                     <label className="form-label" style={{ margin: 0 }}>Pilih Invoice</label>
                     <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                       Menampilkan {foundInvoices.length} dari {pagination.total} data
                     </span>
                   </div>
                   <select 
                     className="form-control" 
                     value={selectedInvoice?.id || ""} 
                     onChange={(e) => {
                        const inv = foundInvoices.find(i => String(i.id) === e.target.value);
                        setSelectedInvoice(inv);
                        setPaymentForm(prev => ({ ...prev, amount_paid: inv?.final_amount || 0 }));
                        setLastPayment(null);
                        setSuccessNotif(null);
                     }}
                   >
                     {foundInvoices.map(inv => (
                       <option key={inv.id} value={inv.id}>
                         {inv.invoice_number} - Rp {inv.final_amount?.toLocaleString()} ({inv.status})
                       </option>
                     ))}
                   </select>
                   {pagination.total > foundInvoices.length && (
                     <button 
                       onClick={handleLoadMore}
                       style={{ 
                         width: '100%', 
                         marginTop: '10px', 
                         padding: '5px', 
                         fontSize: '0.8rem', 
                         background: 'none', 
                         border: '1px dashed #cbd5e1', 
                         color: '#64748b',
                         borderRadius: '4px',
                         cursor: 'pointer'
                       }}
                     >
                       Muat lebih banyak...
                     </button>
                   )}
                </div>

                {selectedInvoice && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b' }}>Nomor Invoice:</span>
                      <span style={{ fontWeight: 700 }}>{selectedInvoice.invoice_number}</span>
                    </div>
                    {selectedInvoice.application?.package && (
                      <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b' }}>Paket Pengujian:</span>
                        <span style={{ fontWeight: 700, color: '#7c3aed' }}>{selectedInvoice.application.package.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b' }}>Total Tagihan:</span>
                      <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>Rp {selectedInvoice.final_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#64748b' }}>Status:</span>
                      <span className={`badge ${selectedInvoice.status === 'PAID' ? 'badge-green' : 'badge-yellow'}`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                )}

                {selectedInvoice && selectedInvoice.status !== 'PAID' ? (
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Jumlah Bayar (Rp)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={paymentForm.amount_paid}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, amount_paid: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Metode Pembayaran</label>
                        <select
                          className="form-control"
                          value={paymentForm.payment_method}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                        >
                          <option value="Transfer">Transfer Bank</option>
                          <option value="Cash">Tunai / Cash</option>
                          <option value="Credit Card">Kartu Kredit</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Referensi / Catatan</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Contoh: Ref Transfer #12345"
                        value={paymentForm.reference_no}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, reference_no: e.target.value }))}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                      {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                    </button>
                  </form>
                ) : (
                  (selectedInvoice?.status === 'PAID' || lastPayment) && (
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginTop: '1rem' }}>
                      <div style={{ fontSize: '3rem', color: '#10b981', marginBottom: '0.5rem' }}>
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>
                        {selectedInvoice?.status === 'PAID' ? 'Pembayaran Lunas' : 'Pembayaran Berhasil'}
                      </h3>
                      <p style={{ color: '#15803d', marginBottom: '1.5rem' }}>
                        {lastPayment ? `Jumlah: Rp ${lastPayment.amount?.toLocaleString()}` : 'Invoice ini sudah lunas.'}
                      </p>
                      <button 
                        className="btn btn-success" 
                        onClick={() => printReceipt(lastPayment, appConfig)}
                        disabled={!lastPayment}
                        style={{ padding: '10px 24px', fontSize: '1rem', fontWeight: 600 }}
                      >
                        <i className="fas fa-print"></i> Cetak Kuitansi
                      </button>
                      {!lastPayment && (
                         <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '15px' }}>
                           Pencarian data pembayaran sebelumnya diperlukan untuk mencetak ulang kuitansi.
                         </p>
                      )}
                    </div>
                  )
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <i className="fas fa-info-circle" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                <p>Tidak ada tagihan tertunda untuk rekanan ini.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Partner Search Modal */}
      <PartnerSearchModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSelect={handlePartnerSelect}
        initialSearch={searchQuery}
      />

      {/* Styles menggunakan className dan inline style object — aman dari XSS */}
    </div>
  );
};

export default PaymentPage;
