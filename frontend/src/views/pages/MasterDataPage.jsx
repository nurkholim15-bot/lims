import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import MasterForm from "@components/MasterForm";
import Pagination from "@components/Pagination";
import { useToast } from '@context/ToastContext';

const MasterDataPage = ({ title, endpoint, crudEndpoint, columns, refreshTrigger, predefinedData, onRowClick, extraHeaderButtons, searchField, searchPlaceholder, forceFilter, checkPasswordRequirement, filterConfig, hideActions }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = (searchField && searchParams.get(searchField)) ? searchParams.get(searchField) : "";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isFiltered, setIsFiltered] = useState(!!initialSearch);
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState("ALL");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[date.getMonth()];
    return `${date.getDate()} ${monthName} ${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const getMonthName = (monthStr) => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return months[parseInt(monthStr, 10) - 1] || "";
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    let pdfName = title;
    if (endpoint.includes("invoices")) pdfName = "Laporan-invoice";
    if (endpoint.includes("payments")) pdfName = "Laporan-pembayaran";
    document.title = pdfName;
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 100);
  };

  const fetchData = async (isSearch = false) => {
    // If forceFilter is enabled and we haven't filtered yet and not explicitly searching, skip
    if (forceFilter && !isFiltered && !isSearch) {
        setData([]);
        return;
    }

    setLoading(true);
    try {
      let queryEndpoint = endpoint.includes("?") ? `${endpoint}&page=${page}` : `${endpoint}?page=${page}`;
      
      if (searchField && searchQuery) {
        const joinChar = queryEndpoint.includes("?") ? "&" : "?";
        queryEndpoint += `${joinChar}${searchField}=${encodeURIComponent(searchQuery)}`;
      }
      
      console.log("DEBUG: fetchData called with queryEndpoint:", queryEndpoint, "searchField:", searchField, "searchQuery:", searchQuery);
      
      if (filterConfig?.showMonthYear) {
        const joinChar = queryEndpoint.includes("?") ? "&" : "?";
        queryEndpoint += `${joinChar}month=${filterMonth}&year=${filterYear}`;
      }
      
      if (filterConfig?.statusOptions && filterStatus !== "ALL") {
        const joinChar = queryEndpoint.includes("?") ? "&" : "?";
        queryEndpoint += `${joinChar}status=${filterStatus}`;
      }

      const result = await apiRequest(queryEndpoint);
      if (result) {
        let rawData = result;
        if (result && !Array.isArray(result) && result.metadata) {
          rawData = result.data || [];
          setTotal(result.metadata.total || 0);
          setLimit(result.metadata.limit || 10);
        } else {
          if (!Array.isArray(rawData)) rawData = rawData.data || [rawData];
          setTotal(rawData.length);
        }

        setData(rawData);
      }
    } catch (err) {
      console.error(`Fetch master ${title} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setIsFiltered(true);
    setPage(1);
    fetchData(true);
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, refreshTrigger, page]);

  const handleDelete = async (item) => {
    const id = item.id || item.status_code || item.code || item.tester_id || item.city_code || item.province_code || item.asset_status_code;
    
    const performDelete = async () => {
      try {
        const baseEndpoint = (endpoint || "").split("?")[0];
        if (baseEndpoint === "/testing-packages") {
          let updateData = { ...item, is_active: false };
          if (item.methodologies) updateData.methodology_codes = item.methodologies.map(m => m.code);
          else updateData.methodology_codes = [];
          if (item.active_aspects) updateData.active_aspect_codes = item.active_aspects.map(a => a.code);
          else updateData.active_aspect_codes = [];
          if (item.active_sub_aspects) updateData.active_sub_aspect_codes = item.active_sub_aspects.map(s => s.code);
          else updateData.active_sub_aspect_codes = [];
          
          Object.keys(updateData).forEach((key) => {
            if (updateData[key] !== null && typeof updateData[key] === "object" && !Array.isArray(updateData[key])) {
              delete updateData[key];
            }
          });
          const writeEndpoint = crudEndpoint || endpoint;
          await apiRequest(`${writeEndpoint}/${id}`, "PUT", updateData);
        } else {
          const deletePath = crudEndpoint || endpoint;
          await apiRequest(`${deletePath}/${id}`, "DELETE");
        }
        fetchData();
      } catch (err) {
        showToast(err.message || 'Gagal menghapus data', 'error');
      }
    };

    const confirmed = window.confirmAsync ? await window.confirmAsync(`Apakah Anda yakin ingin menghapus data "${id}"?`) : confirm(`Apakah Anda yakin ingin menghapus data "${id}"?`);
    if (!confirmed) return;
    
    const baseEndpoint = (endpoint || "").split("?")[0];
    if (checkPasswordRequirement) {
      checkPasswordRequirement(performDelete, baseEndpoint);
    } else {
      await performDelete();
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className={filterConfig?.showPrint ? "print-hide" : ""}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Kelola data mastering sistem</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {filterConfig?.showMonthYear && (
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '6px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#1e293b' }}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = (i + 1).toString().padStart(2, "0");
                    const date = new Date(2000, i, 1);
                    return <option key={m} value={m}>{date.toLocaleString('id-ID', { month: 'long' })}</option>;
                  })}
                </select>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#1e293b' }}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = (new Date().getFullYear() - 2 + i).toString();
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
                {filterConfig?.statusOptions && (
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#1e293b', borderLeft: '1px solid #cbd5e1', paddingLeft: '10px', marginLeft: '4px' }}>
                    <option value="ALL">Semua Status</option>
                    {filterConfig.statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                <button 
                  onClick={handleFilter}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Tampilkan
                </button>
              </div>
            )}
            {searchField && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center', 
                background: '#f1f5f9', 
                padding: '6px 10px', 
                borderRadius: '10px', 
                border: '1px solid #e2e8f0',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '0.9rem', marginLeft: '4px' }}></i>
                <input 
                  type="text" 
                  placeholder={searchPlaceholder || `Cari...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '220px', color: '#1e293b' }}
                />
                <button 
                  onClick={handleFilter}
                  style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '6px 16px', 
                    fontSize: '0.875rem', 
                    fontWeight: 800, 
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                >
                  Filter
                </button>
              </div>
            )}
            {extraHeaderButtons}
            {filterConfig?.showPrint && (
              <button className="btn btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b' }} onClick={handlePrint}>
                <i className="fas fa-print"></i> Cetak PDF
              </button>
            )}
            {endpoint !== "/user-sessions" && !hideActions && (
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                <i className="fas fa-plus"></i> Tambah Data
              </button>
            )}
          </div>
        </div>

        <div className="table-container" style={{ overflowX: 'auto', maxHeight: '650px', overflowY: 'auto', position: 'relative' }}>
          {filterConfig?.showPrint && (
            <div className="print-header" style={{ display: 'none' }}>
              <h2>{title}</h2>
              <p>Periode {getMonthName(filterMonth)} {filterYear}</p>
            </div>
          )}
          <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} style={{ background: 'white', borderBottom: '2px solid #f1f5f9' }}>{col.header}</th>
                ))}
                {!hideActions && <th style={{ textAlign: 'center', background: 'white', borderBottom: '2px solid #f1f5f9' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "3rem" }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i> Memuat data...
                  </td>
                </tr>
              ) : forceFilter && !isFiltered ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "5rem", color: "#64748b" }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <i className="fas fa-search" style={{ fontSize: '3rem', color: '#e2e8f0' }}></i>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#475569' }}>Silakan masukkan filter untuk menampilkan data</p>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Gunakan ID atau Nama {title}. Gunakan <strong>%</strong> untuk menampilkan semua data.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, idx) => (
                  <tr 
                    key={item.id || item.code || idx}
                    onClick={(e) => {
                      if (onRowClick && !e.target.closest('.action-btn')) {
                        onRowClick(item);
                      }
                    }}
                    style={onRowClick ? { cursor: 'pointer' } : {}}
                    className={onRowClick ? "hoverable-row" : ""}
                  >
                    {columns.map((col, i) => {
                      let cellContent = col.render ? col.render(item, (page - 1) * limit + idx + 1) : item[col.key] || "-";
                      if (endpoint === "/user-sessions" && (col.key === "created_at" || col.key === "expires_at")) {
                        cellContent = formatDate(item[col.key]);
                      }
                      return <td key={i}>{cellContent}</td>;
                    })}
                    {!hideActions && (
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-btns" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {endpoint !== "/user-sessions" && (
                            <button className="action-btn" onClick={() => handleOpenEdit(item)} style={{ color: '#6366f1', background: '#eef2ff' }} title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {endpoint && endpoint.includes("/testing-packages") && (
                            <>
                              <button className="action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/hist-package-active-aspects?package_id=${item.id}`); }} style={{ color: '#059669', background: '#d1fae5' }} title="Riwayat Aspect">
                                <i className="fas fa-history"></i> A
                              </button>
                              <button className="action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/hist-package-active-sub-aspects?package_id=${item.id}`); }} style={{ color: '#0284c7', background: '#e0f2fe' }} title="Riwayat Sub Aspect">
                                <i className="fas fa-history"></i> SA
                              </button>
                            </>
                          )}
                          <button className="action-btn" onClick={() => handleDelete(item)} style={{ color: '#ef4444', background: '#fef2f2' }} title="Hapus">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    Belum ada data tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          current={page} 
          total={total} 
          limit={limit} 
          onPageChange={setPage} 
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`${editingItem ? "Edit" : "Tambah"} ${title}`}
        wide={["/partners", "/testing-tools", "/tester-masters", "/users", "/testing-packages"].some(e => endpoint.startsWith(e))}
      >
        <div style={{ padding: '1.5rem' }}>
          <MasterForm 
            item={editingItem}
            initialData={!editingItem ? predefinedData : null}
            endpoint={endpoint}
            crudEndpoint={crudEndpoint}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
            checkPasswordRequirement={checkPasswordRequirement}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MasterDataPage;
