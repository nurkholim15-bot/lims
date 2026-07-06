import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import Modal from "./Modal";

const TravelRequestSearchModal = ({ isOpen, onClose, onSelect, initialSearch = "" }) => {
  const [search, setSearch] = useState(initialSearch);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const fetchTravelRequests = async (query = "", pageNum = 1) => {
    setLoading(true);
    try {
      // Only show APPROVED travel requests for reimbursement
      const endpoint = `/travel-requests?search=${encodeURIComponent(query)}&page=${pageNum}&limit=${limit}&status=APPROVED`;
      const res = await apiRequest(endpoint);
      if (res) {
        setResults(res.data || []);
        setTotal(res.metadata?.total || 0);
      }
    } catch (err) {
      console.error("Search travel requests error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSearch(initialSearch);
      fetchTravelRequests(initialSearch, 1);
    }
  }, [isOpen, initialSearch]);

  useEffect(() => {
    if (isOpen && search !== initialSearch) {
      fetchTravelRequests(search, page);
    }
  }, [search, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); 
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cari SPD (Surat Perjalanan Dinas)" width="900px">
      <div style={{ padding: "1rem" }}>
        <div className="search-box mb-3" style={{ position: "relative" }}>
          <i className="fas fa-search" style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
          <input
            type="text"
            className="form-control"
            placeholder="Cari No. Reg atau Keperluan SPD..."
            value={search}
            onChange={handleSearchChange}
            style={{ 
              paddingLeft: "45px", 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0",
              height: "45px",
              fontSize: "1rem"
            }}
            autoFocus
          />
        </div>

        <div className="results-container" style={{ minHeight: "350px" }}>
          {loading ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-2x" style={{ color: "#6366f1" }}></i>
              <p className="mt-2 text-muted">Mencari data...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="list-group" style={{ gap: "8px" }}>
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    onSelect(r);
                    onClose();
                  }}
                  style={{ 
                    borderRadius: "10px", 
                    border: "1px solid #e2e8f0", 
                    textAlign: "left",
                    padding: "12px 16px",
                    display: "block",
                    width: "100%",
                    transition: "all 0.2s"
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div style={{ minWidth: "120px" }}>
                        <span style={{ 
                            backgroundColor: "#e0e7ff", 
                            color: "#4338ca", 
                            padding: "4px 10px", 
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            display: "inline-block",
                            textAlign: "center",
                            width: "100%"
                        }}>
                            {r.reg_number}
                        </span>
                    </div>
                    <div style={{ flex: 1, paddingLeft: "15px" }}>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b", marginBottom: "2px" }}>
                        {r.purpose}
                      </div>
                      <div className="d-flex flex-wrap" style={{ fontSize: "0.85rem", color: "#64748b", columnGap: "1.5rem" }}>
                        <span title="Tujuan">
                          <i className="fas fa-map-marker-alt" style={{ color: "#94a3b8", width: "16px" }}></i> {r.location?.location_name || "-"}
                        </span>
                        <span title="Tanggal">
                          <i className="fas fa-calendar-alt" style={{ color: "#94a3b8", width: "16px" }}></i> {r.start_date?.split('T')[0]} s/d {r.end_date?.split('T')[0]}
                        </span>
                        <span title="User">
                          <i className="fas fa-user" style={{ color: "#94a3b8", width: "16px" }}></i> {r.user?.username || "-"}
                        </span>
                      </div>
                    </div>
                    <div style={{ color: "#cbd5e1" }}>
                        <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-info-circle fa-2x mb-2"></i>
              <p>Tidak ada SPD ditemukan.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              Halaman {page} dari {totalPages} ({total} data)
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TravelRequestSearchModal;
