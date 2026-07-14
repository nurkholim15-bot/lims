import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@models/api";
import { useToast } from '@context/ToastContext';

const ReportsDetailPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({ start_date: "", end_date: "", status: "" });

  const handleApply = () => {
    if (!filters.start_date || !filters.end_date) {
      showToast('Silakan masukkan Tanggal Mulai dan Tanggal Akhir.', 'warning');
      return;
    }

    const start = new Date(filters.start_date);
    const end = new Date(filters.end_date);
    
    if (end < start) {
      showToast('Tanggal Akhir tidak boleh lebih kecil dari Tanggal Mulai.', 'warning');
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 31) {
      showToast('Maksimum periode laporan adalah 1 bulan (31 hari) untuk menjaga performa sistem.', 'warning');
      return;
    }

    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    setHasSearched(true);
    let url = "/reports/detail?";
    if (filters.start_date) url += `start_date=${filters.start_date}&`;
    if (filters.end_date) url += `end_date=${filters.end_date}&`;
    if (filters.status) url += `status=${filters.status}&`;

    try {
      const res = await apiRequest(url);
      if (res && Array.isArray(res)) setData(res);
    } catch (err) {
      console.error("Error fetching detail report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "Laporan Detil Testing";
    window.print();
    document.title = originalTitle;
  };

  // Group data by status for detailed viewing
  const groupedData = data.reduce((acc, current) => {
      const st = current.status || "Unknown";
      if(!acc[st]) acc[st] = [];
      acc[st].push(current);
      return acc;
  }, {});

  const allStatuses = Object.keys(groupedData).sort();

  return (
    <div id="detail-report" style={{ padding: "2rem" }}>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem" }}>
            <i className="fas fa-list-alt" style={{ color: "#0ea5e9", marginRight: "10px" }}></i> 
            Laporan Rincian Testing
          </h2>
          <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>Rincian Data Parameter Uji per Aplikasi</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline-success" onClick={handlePrint} disabled={!hasSearched || data.length === 0}>
            <i className="fas fa-print"></i> Cetak PDF
          </button>
          <button
            onClick={() => navigate("/welcome")}
            style={{
              background: "#475569",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fas fa-times"></i> Tutup
          </button>
        </div>
      </div>

      {/* Header Cetak Laporan (Hanya Muncul saat diprint atau pencarian selesai) */}
      <div className="print-header" style={{ textAlign: "center", marginBottom: "2rem", display: hasSearched ? "block" : "none" }}>
        <h2 style={{ margin: "0 0 10px 0" }}>Laporan Detil Testing</h2>
        <h4 style={{ margin: 0, fontWeight: "normal" }}>Periode: {filters.start_date || '-'} s/d {filters.end_date || '-'}</h4>
      </div>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }} className="no-print">
        <h4 style={{ margin: "0 0 1rem 0", color: "#334155", fontSize: "1rem" }}>
          <i className="fas fa-filter"></i> Filter Pencarian (Wajib diisi)
        </h4>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>Tanggal Mulai <span style={{color: "red"}}>*</span></label>
            <input 
              type="date" 
              className="form-control" 
              value={filters.start_date} 
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>Tanggal Akhir <span style={{color: "red"}}>*</span></label>
            <input 
              type="date" 
              className="form-control" 
              value={filters.end_date} 
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>Status (Opsional)</label>
            <select
                className="form-control"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
                <option value="">Semua Status</option>
                <option value="REGISTERED">REGISTERED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="REVISI">REVISI</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PLANNED">PLANNED</option>
                <option value="EXECUTED">EXECUTED</option>
                <option value="ANALYZED">ANALYZED</option>
                <option value="CERTIFIED">CERTIFIED</option>
                <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleApply}>Terapkan</button>
          </div>
        </div>
      </div>

      <div style={{ borderRadius: "12px", overflow: "hidden" }}>
        {!hasSearched ? (
          <div className="no-print" style={{ padding: "3rem", textAlign: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
            Silakan masukkan periode laporan terlebih dahulu.
          </div>
        ) : loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>Memuat data...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>Tidak ada data pada periode dan filter ini</div>
        ) : (
          allStatuses.map((status, index) => (
              <div key={status} className={index > 0 ? "status-block next-page" : "status-block"} style={{ marginBottom: "2rem", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", pageBreakInside: "avoid" }}>
                  <div className="no-print" style={{ background: "#f8fafc", padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>Status: <span style={{ color: "#8b5cf6" }}>{status}</span></h3>
                      <span className="no-print" style={{ background: "#e2e8f0", padding: "2px 8px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>{groupedData[status].length} Data</span>
                  </div>
                  {/* Status header shown only in print */}
                  <div className="print-only" style={{ background: "#f8fafc", padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "none" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>Status: <span style={{ color: "#333" }}>{status}</span></h3>
                  </div>
                  
                  <div style={{ overflowX: "auto" }}>
                      <table className="table" style={{ width: "100%", margin: 0, minWidth: "800px" }}>
                          <thead>
                              <tr>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem", width: "50px" }}>No</th>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: "0.85rem" }}>Reg Number</th>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem" }}>App ID</th>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: "0.85rem" }}>Tgl Daftar</th>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: "0.85rem" }}>Pemohon</th>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: "0.85rem" }}>Peralatan</th>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem" }}>Aspek Lulus</th>
                                  <th style={{ padding: "0.75rem", borderBottom: "2px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem" }}>Nilai Akhir</th>
                              </tr>
                          </thead>
                          <tbody>
                              {groupedData[status].map((app, idx) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem", textAlign: "center" }}>{idx + 1}</td>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem", fontWeight: 600 }}>{app.reg_number}</td>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem", textAlign: "center", fontWeight: "bold" }}>{app.id}</td>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem", color: "#64748b" }}>{new Date(app.created_at).toLocaleDateString("id-ID")}</td>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>{app.partner?.name || '-'}</td>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                                          {app.equipment?.equipment_name || app.equipment?.brand?.name || '-'}
                                      </td>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem", textAlign: "center" }}>
                                         {app.aspects_passed === null ? '-' : (app.aspects_passed ? <i className="fas fa-check" style={{ color: "green" }}></i> : <i className="fas fa-times" style={{ color: "red" }}></i>)}
                                      </td>
                                      <td style={{ padding: "0.75rem", fontSize: "0.9rem", textAlign: "center", fontWeight: "bold" }}>
                                          {app.final_score ? app.final_score.toFixed(2) : '-'}
                                      </td>
                                  </tr>
                              ))}
                              {/* Summary baris terakhir untuk tiap status */}
                              <tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                  <td colSpan="7" style={{ padding: "0.75rem", fontSize: "0.95rem", textAlign: "right", borderTop: "2px solid #cbd5e1" }}>
                                      Total Status {status}:
                                  </td>
                                  <td style={{ padding: "0.75rem", fontSize: "0.95rem", textAlign: "center", borderTop: "2px solid #cbd5e1", color: "#333" }}>
                                      {groupedData[status].length} Data
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          ))
        )}

        {/* Grand Total Footer Content */}
        {hasSearched && data.length > 0 && (
           <div className="grand-total no-page-break" style={{ marginTop: "2rem", padding: "1.5rem", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>
               <h2 style={{ margin: 0, color: "#0f172a" }}>Grand Total Keseluruhan: <span style={{ color: "#16a34a" }}>{data.length} Data</span></h2>
           </div>
        )}
      </div>

      <div className="print-footer print-only" style={{ display: "none" }}>
         <span>Laporan Detil Testing - Periode: {filters.start_date} s/d {filters.end_date}</span>
         <span>Dicetak pada: {new Date().toLocaleString("id-ID")}</span>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content, #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            padding-bottom: 2cm !important;
          }
          
          /* Hilangkan Header & Footer bawaan browser */
          @page {
            size: landscape;
            margin: 0; 
          }
          body {
             padding: 1.2cm !important;
             margin: 0 !important;
          }

          .no-print, .no-print * {
            display: none !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 20px;
            margin-top: 0.5cm !important;
          }
          .print-only {
            display: flex !important;
          }
          
          /* Break rules */
          .next-page {
            page-break-before: always;
          }
          .no-page-break {
            page-break-inside: avoid;
          }
          
          /* Footer buatan sendiri */
          .print-footer {
             justify-content: space-between;
             position: fixed;
             bottom: 10px;
             left: 1.2cm;
             right: 1.2cm;
             font-size: 10px;
             color: #444;
             border-top: 1px solid #ddd;
             padding-top: 5px;
          }
          
          .table {
            border-collapse: collapse;
            width: 100%;
          }
          .table th, .table td {
            border: 1px solid #333 !important;
            padding: 6px !important;
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsDetailPage;
