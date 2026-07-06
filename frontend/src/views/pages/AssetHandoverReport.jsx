import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import './AssetHandoverReport.css';

const AssetHandoverReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0")
  });

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i.toString());
  }

  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/reports/asset-handover?year=${filter.year}&month=${filter.month}`);
      setReportData(data || []);
    } catch (err) {
      console.error("Gagal mengambil laporan:", err);
      const errorMsg = err.response?.data?.error || err.message || "Gagal memuat data laporan";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "laporan_asset-handover";
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 100);
  };

  return (
    <div className="section-view active">
      <div className="card no-print">
        <div className="card-title">Filter Laporan Serah Terima / Disposal Aset</div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Tahun</label>
            <select 
              value={filter.year} 
              onChange={(e) => setFilter({ ...filter, year: e.target.value })}
              style={{ height: "38px" }}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Bulan</label>
            <select 
              value={filter.month} 
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
              style={{ height: "38px" }}
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
            <i className="fas fa-search"></i> Tampilkan
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} disabled={reportData.length === 0}>
            <i className="fas fa-print"></i> Cetak Laporan
          </button>
        </div>
      </div>

      <div className="card print-area">
        <div className="report-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: 0 }}>LAPORAN SERAH TERIMA / DISPOSAL ASET</h2>
          <p style={{ margin: "5px 0" }}>Periode: {months.find(m => m.value === filter.month)?.label} {filter.year}</p>
          <hr />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Memuat data...</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>No</th>
                <th style={{ width: "60px" }}>Asset ID</th>
                <th style={{ width: "130px" }}>S/N</th>
                <th style={{ width: "120px" }}>Nama<br/>Peralatan</th>
                <th style={{ width: "180px" }}>No. BAP / Serah Terima</th>
                <th style={{ width: "100px" }}>Tgl Serah</th>
                <th style={{ width: "250px" }}>Rekanan</th>
                <th>Penerima</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? reportData.map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td style={{ fontWeight: 700 }}>{item.asset_id}</td>
                  <td>{item.serial_no || "-"}</td>
                  <td>{item.equipment_name}</td>
                  <td>{item.handover_no}</td>
                  <td>{item.handover_date ? new Date(item.handover_date).toLocaleDateString("id-ID") : "-"}</td>
                  <td>{item.partner_name || "-"}</td>
                  <td>{item.receiver_name || "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    Tidak ada data serah terima untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        
        <div className="only-print" style={{ marginTop: "3rem", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "center", width: "250px" }}>
            <p>Dicetak pada: {new Date().toLocaleDateString("id-ID")}</p>
            <br /><br /><br />
            <p><strong>( ________________________ )</strong></p>
            <p>Petugas Inventaris</p>
          </div>
        </div>
      </div>

      {/* Styles dipindahkan ke AssetHandoverReport.css untuk menghindari dangerouslySetInnerHTML */}
    </div>
  );
};

export default AssetHandoverReport;
