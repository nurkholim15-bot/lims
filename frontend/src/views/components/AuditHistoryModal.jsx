import React, { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@models/api";
import Modal from "./Modal";
import Pagination from "./Pagination";

const AuditHistoryModal = ({ 
  isOpen, 
  onClose, 
  title, 
  endpoint, 
  idField, 
  idValue, 
  columns, 
  wide = true 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const fetchData = useCallback(async () => {
    if (!isOpen || !endpoint) return;
    
    setLoading(true);
    try {
      let url = `${endpoint}?page=${page}`;
      if (idField && idValue) {
        url += `&${idField}=${idValue}`;
      }
      
      const result = await apiRequest(url);
      if (result) {
        setData(result.data || []);
        setTotal(result.metadata?.total || 0);
        setLimit(result.metadata?.limit || 10);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, endpoint, idField, idValue, page]);

  useEffect(() => {
    if (isOpen) {
      setPage(1); // Reset to first page when opening or ID changes
    }
  }, [isOpen, idValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[date.getMonth()];
    return `${date.getDate()} ${monthName} ${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      wide={wide}
    >
      <div style={{ padding: "1.5rem", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={{ background: "white", borderBottom: "2px solid #f1f5f9", textAlign: "left", padding: "12px 8px" }}>
                    {col.header}
                  </th>
                ))}
                <th style={{ background: "white", borderBottom: "2px solid #f1f5f9", textAlign: "left", padding: "12px 8px" }}>
                  Waktu
                </th>
                <th style={{ background: "white", borderBottom: "2px solid #f1f5f9", textAlign: "left", padding: "12px 8px" }}>
                  User (C/U/D)
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#64748b" }}>
                      <i className="fas fa-spinner fa-spin fa-2x"></i>
                      <span>Memuat riwayat perubahan...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, idx) => (
                  <tr key={item.id || idx}>
                    {columns.map((col) => (
                      <td key={col.key} style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {formatDate(item.updated_at || item.created_at)}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        <span><strong>C:</strong> {item.created_user || "-"}</span>
                        <span><strong>U:</strong> {item.updated_user || "-"}</span>
                        <span style={{ color: item.deleted_user ? '#ef4444' : 'inherit' }}>
                          <strong>D:</strong> {item.deleted_user || "-"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    <i className="fas fa-info-circle" style={{ marginRight: "8px" }}></i>
                    Belum ada riwayat perubahan yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > limit && (
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
            <Pagination 
              current={page} 
              total={total} 
              limit={limit} 
              onPageChange={setPage} 
            />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ minWidth: "100px" }}>
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditHistoryModal;
