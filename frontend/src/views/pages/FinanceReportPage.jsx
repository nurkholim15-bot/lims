import React, { useState, useEffect } from 'react';
import { apiRequest } from '@models/api';
import html2pdf from 'html2pdf.js';
import { useToast } from '@context/ToastContext';

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const FinanceReportPage = ({ user, reportType = 'all' }) => {
  const { showToast } = useToast();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth.toString().padStart(2, '0'));
  const [year, setYear] = useState(currentYear.toString());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/reports/finance?month=${month}&year=${year}&type=${reportType}`);
      setReportData(data);
    } catch (err) {
      showToast("Failed to load report: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const getTitle = () => {
    switch (reportType) {
      case 'spd': return 'Laporan SPD';
      case 'cash_advance': return 'Laporan Kasbon';
      case 'reimbursement': return 'Laporan Reimbursement';
      default: return 'Laporan Keuangan Bulanan';
    }
  };

  const getSubtitle = () => {
    switch (reportType) {
      case 'spd': return 'Ringkasan data Surat Perjalanan Dinas.';
      case 'cash_advance': return 'Ringkasan data transaksi Cash Advance.';
      case 'reimbursement': return 'Ringkasan data transaksi Reimbursement.';
      default: return 'Ringkasan data SPD, Cash Advance, dan Reimbursement.';
    }
  };

  const formattedPeriod = new Date(year, month - 1, 1).toLocaleString('id-ID', { month: 'short', year: 'numeric' });

  const handlePrint = () => {
    const element = document.getElementById('print-area');
    const pdfFilename = reportType === 'spd' ? 'LIMS_Laporan_SPD.pdf' : 
                        reportType === 'cash_advance' ? 'LIMS_Laporan_Cash_Advance.pdf' : 
                        reportType === 'reimbursement' ? 'LIMS_Laporan_Reimbursement.pdf' : 'LIMS_Laporan_Keuangan.pdf';
    
    // Tampilkan elemen khusus PDF (seperti header print)
    element.classList.add('pdf-generating');
    
    const opt = {
      margin:       [10, 10, 20, 10], // top, left, bottom, right
      filename:     pdfFilename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();
      const dateStr = new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true });
      const nameWithoutExt = pdfFilename.replace('.pdf', '');

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        // Left: Filename
        pdf.text(nameWithoutExt, 10, 200); 
        // Center: Page Number
        pdf.text('Page ' + i + ' / ' + totalPages, 148, 200, { align: 'center' });
        // Right: Date
        pdf.text(dateStr, 287, 200, { align: 'right' });
      }
    }).output('bloburl').then((blobUrl) => {
       const win = window.open('', '_blank');
       const escapedTitle = escapeHtml(pdfFilename.replace('.pdf', ''));
       const escapedFilename = escapeHtml(pdfFilename);
       const escapedBlobUrl = escapeHtml(blobUrl);

       win.document.write(`
         <html>
           <head>
             <title>${escapedTitle}</title>
             <style>
               body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; background: #525659; }
               .header { background: #323639; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
               .btn { background: #475569; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; text-decoration: none; font-size: 14px; display: inline-block; font-weight: 500; }
               .btn:hover { background: #334155; }
               .btn-primary { background: #2563eb; }
               .btn-primary:hover { background: #1d4ed8; }
             </style>
           </head>
           <body>
             <div class="header">
                <div style="font-size: 15px;">Preview Laporan: <strong style="letter-spacing: 0.5px;">${escapedFilename}</strong></div>
                <div>
                  <button class="btn" onclick="document.getElementById('pdf-frame').contentWindow.print()">🖨️ Cetak ke Printer</button>
                  <a class="btn btn-primary" href="${escapedBlobUrl}" download="${escapedFilename}" style="margin-left: 10px;">💾 Download PDF</a>
                </div>
             </div>
             <iframe id="pdf-frame" src="${escapedBlobUrl}#toolbar=0" width="100%" style="border:none; height: calc(100vh - 44px); display: block;"></iframe>
           </body>
         </html>
       `);
       win.document.close();
       element.classList.remove('pdf-generating');
    });
  };

  return (
    <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
      <style>{`
        @media print {
          @page { margin: 0; }
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm; /* Add padding to replace page margin */
            box-sizing: border-box;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
          }
          .print-header h1 {
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          .print-header h3 {
            font-size: 16px;
            margin: 0;
            font-weight: normal;
          }
          .print-footer {
            display: flex !important;
            position: fixed;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }
          .print-footer-left { flex: 1; text-align: left; }
          .print-footer-right { flex: 1; text-align: right; }
        }
        .print-footer { display: none !important; }
        .print-header {
          display: none;
        }
        .pdf-generating .print-header {
          display: block !important;
          text-align: center;
          margin-bottom: 20px;
        }
        .pdf-generating .print-header h1 {
          font-size: 24px; margin: 0 0 10px 0; color: #0f172a;
        }
        .pdf-generating .print-header h3 {
          font-size: 16px; margin: 0; font-weight: normal; color: #64748b;
        }
        .pdf-generating .no-pdf {
          display: none !important;
        }
      `}</style>
      <div className="no-print no-pdf" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
            <h1 style={{ fontSize: "1.8rem", color: "#0f172a", fontWeight: 800 }}>{getTitle()}</h1>
            <p style={{ color: "#64748b" }}>{getSubtitle()}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <select 
                className="form-control"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
                {Array.from({length: 12}).map((_, i) => {
                    const m = (i + 1).toString().padStart(2, '0');
                    const monthName = new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' });
                    return <option key={m} value={m}>{monthName}</option>
                })}
            </select>
            <select 
                className="form-control"
                value={year}
                onChange={e => setYear(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
                {[currentYear, currentYear-1, currentYear-2].map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
            <button className="btn btn-secondary" onClick={handlePrint} style={{ background: '#475569', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                <i className="fas fa-print"></i> Print
            </button>
            <button className="btn btn-primary" onClick={fetchReport}>
                <i className="fas fa-sync-alt"></i> Refresh
            </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading data...</div>
      ) : reportData && (
        <div id="print-area" className="print-section" style={{ background: 'white' }}>
          <div className="print-header">
             <h1>{reportType === 'cash_advance' ? 'Laporan Cash Advance' : getTitle()}</h1>
             <h3>Periode {formattedPeriod}</h3>
          </div>

          {/* Summary Cards */}
          <div className="no-print no-pdf" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {(reportType === 'all' || reportType === 'spd') && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total SPD</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{reportData.summary.total_travel_requests} <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 500}}>pengajuan</span></div>
              </div>
              )}
              {(reportType === 'all' || reportType === 'cash_advance') && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Nominal Cash Advance</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>Rp {new Intl.NumberFormat('id-ID').format(reportData.summary.total_cash_amount)}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Dari {reportData.summary.total_cash_advances} transaksi terdaftar</div>
              </div>
              )}
              {(reportType === 'all' || reportType === 'reimbursement') && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Nominal Reimburse</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>Rp {new Intl.NumberFormat('id-ID').format(reportData.summary.total_reimburse_amount)}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Dari {reportData.summary.total_reimbursements} transaksi terdaftar</div>
              </div>
              )}
          </div>

          {/* Details */}
          {(reportType === 'all' || reportType === 'spd') && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <h2 className="no-print" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>{reportType === 'spd' ? 'Rincian Surat Perjalanan Dinas' : '1. Rincian Surat Perjalanan Dinas (SPD)'}</h2>
              <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                          <tr>
                              <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '50px' }}>No.</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>No. SPD</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Tanggal</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Tujuan</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Pemohon</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {reportData.travel_requests?.length > 0 ? reportData.travel_requests.map((t, idx) => (
                              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>{idx + 1}</td>
                                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t.no_spd || t.reg_number}</td>
                                  <td style={{ padding: '0.75rem' }}>{t.start_date?.split('T')[0]} s/d {t.end_date?.split('T')[0]}</td>
                                  <td style={{ padding: '0.75rem' }}>{t.purpose}</td>
                                  <td style={{ padding: '0.75rem' }}>{t.user?.username}</td>
                                  <td style={{ padding: '0.75rem' }}><span className="badge badge-blue">{t.status}</span></td>
                              </tr>
                          )) : <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Tidak ada data SPD di bulan ini</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
          )}

          {(reportType === 'all' || reportType === 'cash_advance') && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <h2 className="no-print" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>{reportType === 'cash_advance' ? 'Rincian Cash Advance' : '2. Rincian Cash Advance'}</h2>
              <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                          <tr>
                              <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '50px' }}>No.</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>No. Cash Advance</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Keperluan</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Tanggal</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Pemohon</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>SPD Terkait</th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>Nominal</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {reportData.cash_advances?.length > 0 ? reportData.cash_advances.map((c, idx) => (
                              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>{idx + 1}</td>
                                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.no_cash_advance || c.reg_number}</td>
                                  <td style={{ padding: '0.75rem' }}>{c.title}</td>
                                  <td style={{ padding: '0.75rem' }}>{c.date?.split('T')[0]}</td>
                                  <td style={{ padding: '0.75rem' }}>{c.user?.username}</td>
                                  <td style={{ padding: '0.75rem' }}>{c.travel_request?.no_spd || c.travel_request?.reg_number || '-'}</td>
                                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Rp {new Intl.NumberFormat('id-ID').format(c.amount)}</td>
                                  <td style={{ padding: '0.75rem' }}><span className={`badge ${c.status === 'SETTLED' || c.status === 'APPROVED' ? 'badge-green' : c.status === 'REJECTED' || c.status === 'CANCELED' ? 'badge-danger' : 'badge-blue'}`}>{c.status}</span></td>
                              </tr>
                          )) : <tr><td colSpan="8" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Tidak ada data Cash Advance di bulan ini</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
          )}

          {(reportType === 'all' || reportType === 'reimbursement') && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <h2 className="no-print" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>{reportType === 'reimbursement' ? 'Rincian Reimbursement' : '3. Rincian Reimbursement'}</h2>
              <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                          <tr>
                              <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '50px' }}>No.</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>No. Reimburse</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', width: '15%' }}>Keperluan</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>Tanggal</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Pemohon</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', width: '20%' }}>Keterkaitan</th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>Nominal</th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {reportData.reimbursements?.length > 0 ? reportData.reimbursements.map((r, idx) => (
                              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>{idx + 1}</td>
                                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>REIM-{r.date?.split('-')[0] || year}-{r.id.toString().padStart(5, '0')}</td>
                                  <td style={{ padding: '0.75rem' }}>{r.title}</td>
                                  <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(r.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-')}</td>
                                  <td style={{ padding: '0.75rem' }}>{r.user?.username}</td>
                                  <td style={{ padding: '0.75rem' }}>
                                      {r.travel_request ? <div style={{color:'#3b82f6'}}>SPD: {r.travel_request?.no_spd || r.travel_request?.reg_number}</div> : null}
                                      {r.cash_advance_id ? <div style={{color:'#d97706'}}>Cash Advance: {r.cash_advance?.no_cash_advance || r.cash_advance?.reg_number || r.cash_advance_id}</div> : null}
                                  </td>
                                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{new Intl.NumberFormat('id-ID').format(r.amount)}</td>
                                  <td style={{ padding: '0.75rem' }}><span className={`badge ${r.status === 'PAID' || r.status === 'APPROVED' ? 'badge-green' : r.status === 'REJECTED' || r.status === 'CANCELED' ? 'badge-danger' : 'badge-blue'}`}>{r.status}</span></td>
                              </tr>
                          )) : <tr><td colSpan="8" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Tidak ada data Reimbursement di bulan ini</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceReportPage;
