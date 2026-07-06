import React, { useState } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import AppDetail from "@components/AppDetail";
import { useToast } from '@context/ToastContext';

const ReportsSummaryPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });
  
  // State for detail modal
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // State for full application detail (same as search/query)
  const [viewingApp, setViewingApp] = useState(null);

  const fetchData = async () => {
    if (!filters.start_date || !filters.end_date) {
        showToast('Silakan masukkan Tanggal Mulai dan Tanggal Akhir.', 'warning');
        return;
    }

    const start = new Date(filters.start_date);
    const end = new Date(filters.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 31) {
      showToast('Maksimum periode laporan adalah 1 bulan (31 hari) untuk menjaga performa sistem.', 'warning');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    let url = "/reports/summary?";
    if (filters.start_date) url += `start_date=${filters.start_date}&`;
    if (filters.end_date) url += `end_date=${filters.end_date}&`;

    try {
      const res = await apiRequest(url);
      if (res) setData(res);
    } catch (err) {
      console.error("Error fetching summary report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowStatusDetail = async (status) => {
    setSelectedStatus(status);
    setLoadingDetail(true);
    setDetailData([]);

    let url = `/reports/detail?start_date=${filters.start_date}&end_date=${filters.end_date}&status=${status}`;
    try {
      const res = await apiRequest(url);
      if (res && Array.isArray(res)) {
        setDetailData(res);
      }
    } catch (err) {
      console.error("Error fetching status details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "Laporan Ringkasan Testing";
    window.print();
    document.title = originalTitle;
  };

  return (
    <div id="summary-report" style={{ padding: "2rem" }}>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem" }}>
            <i className="fas fa-chart-pie" style={{ color: "#0ea5e9", marginRight: "10px" }}></i> 
            Laporan Ringkasan Testing
          </h2>
          <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>Laporan Rekapitulasi Status Aplikasi</p>
        </div>
        <button className="btn btn-outline-success" onClick={handlePrint} disabled={!hasSearched || data.length === 0}>
          <i className="fas fa-print"></i> Cetak PDF
        </button>
      </div>

      {/* Header Cetak */}
      <div className="print-header" style={{ textAlign: "center", marginBottom: "2rem", display: hasSearched ? "block" : "none" }}>
        <h2 style={{ margin: "0 0 10px 0" }}>Laporan Ringkasan Testing</h2>
        <h4 style={{ margin: 0, fontWeight: "normal" }}>Periode: {filters.start_date || '-'} s/d {filters.end_date || '-'}</h4>
      </div>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }} className="no-print">
        <h4 style={{ margin: "0 0 1rem 0", color: "#334155", fontSize: "1rem" }}>
          <i className="fas fa-filter"></i> Filter Periode (Wajib diisi)
        </h4>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>Tanggal Mulai <span style={{color:"red"}}>*</span></label>
            <input 
              type="date" 
              className="form-control" 
              value={filters.start_date} 
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>Tanggal Akhir <span style={{color:"red"}}>*</span></label>
            <input 
              type="date" 
              className="form-control" 
              value={filters.end_date} 
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} 
            />
          </div>
          <div>
            <button className="btn btn-primary" onClick={fetchData}>Terapkan</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {!hasSearched ? (
          <div className="no-print" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            Silakan masukkan periode laporan terlebih dahulu.
          </div>
        ) : loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Memuat data...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Tidak ada data pada periode ini</div>
        ) : (
          <table className="table" style={{ width: "100%", margin: 0 }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={{ padding: "1rem", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>Status Aplikasi</th>
                <th style={{ padding: "1rem", borderBottom: "2px solid #e2e8f0", textAlign: "center" }}>Jumlah Aplikasi</th>
                <th style={{ padding: "1rem", borderBottom: "2px solid #e2e8f0", textAlign: "center" }} className="no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ fontWeight: 600, color: "#1e293b", background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px" }}>{item.status}</span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontWeight: "bold", fontSize: "1.1rem" }}>{item.count}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }} className="no-print">
                      <button 
                        className="btn btn-sm" 
                        onClick={() => handleShowStatusDetail(item.status)}
                        style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", fontWeight: 600 }}
                      >
                          <i className="fas fa-eye"></i> Detail Per Status
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: "#f8fafc", fontWeight: "bold" }}>
                <tr>
                    <td style={{ padding: "1rem", textAlign: "right", borderTop: "2px solid #cbd5e1" }}>Total Semua:</td>
                    <td style={{ padding: "1rem", textAlign: "center", fontSize: "1.2rem", color: "#0ea5e9", borderTop: "2px solid #cbd5e1" }}>
                        {data.reduce((sum, item) => sum + item.count, 0)}
                    </td>
                    <td className="no-print" style={{ borderTop: "2px solid #cbd5e1" }}></td>
                </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Status Detail Modal */}
      <Modal 
        isOpen={!!selectedStatus} 
        onClose={() => setSelectedStatus(null)} 
        title={`Rincian Aplikasi Status: ${selectedStatus}`}
        wide={true}
      >
        <div style={{ padding: "1.5rem" }}>
            {loadingDetail ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>Memuat rincian...</div>
            ) : detailData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>Data tidak ditemukan</div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table className="table" style={{ width: "100%" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                <th>No</th>
                                <th>Reg Number</th>
                                <th>App ID</th>
                                <th>Tgl Daftar</th>
                                <th>Pemohon</th>
                                <th>Peralatan</th>
                                <th style={{ textAlign: "center" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailData.map((app, idx) => (
                                <tr key={idx}>
                                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                                    <td style={{ fontWeight: 600 }}>{app.reg_number}</td>
                                    <td style={{ textAlign: "center" }}>{app.id}</td>
                                    <td>{new Date(app.created_at).toLocaleDateString("id-ID")}</td>
                                    <td>{app.partner?.name || '-'}</td>
                                    <td>{app.equipment?.equipment_name || app.equipment?.brand?.name || '-'}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <button 
                                          className="btn btn-sm" 
                                          onClick={() => setViewingApp(app)}
                                          style={{ background: "#22c55e", color: "white", border: "none", fontWeight: 600 }}
                                        >
                                            <i className="fas fa-search-plus"></i> Lihat Detil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </Modal>

      {/* Full App Detail Modal */}
      {viewingApp && (
          <Modal
            isOpen={!!viewingApp}
            onClose={() => setViewingApp(null)}
            title={`Informasi Detil Aplikasi - ${viewingApp.reg_number}`}
            wide={true}
          >
              <AppDetail 
                app={viewingApp} 
                stage="query" 
                onCancel={() => setViewingApp(null)}
                onSuccess={() => {}}
              />
          </Modal>
      )}

      <div className="print-footer print-only" style={{ display: "none" }}>
         <span>Laporan Ringkasan Testing - Periode: {filters.start_date} s/d {filters.end_date}</span>
         <span>Dicetak pada: {new Date().toLocaleString("id-ID")}</span>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #summary-report, #summary-report * {
            visibility: visible;
          }
          #summary-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          .print-header { display: block !important; margin-bottom: 20px; text-align: center; }
          .print-only { display: flex !important; }
          
          @page { size: portrait; margin: 0; }
          body { padding: 1.5cm !important; margin: 0 !important; }

          .print-footer {
             justify-content: space-between;
             position: fixed;
             bottom: 10px;
             left: 1.5cm;
             right: 1.5cm;
             font-size: 10px;
             color: #444;
             border-top: 1px solid #ddd;
             padding-top: 5px;
          }

          .table { border-collapse: collapse; width: 100%; }
          .table th, .table td { border: 1px solid #333 !important; padding: 10px !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportsSummaryPage;
