import React, { useState, useEffect } from "react";
import { apiRequest } from "@models/api";
import Modal from "@components/Modal";
import Pagination from "@components/Pagination";
import { useToast } from '@context/ToastContext';

const RolesPage = ({ onChangeRole }) => {
  console.log("RolesPage rendering...");
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(0);
  
  // History State
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const fetchHistory = async (roleId = null) => {
    setHistLoading(true);
    try {
      const endpoint = roleId ? `/hist-roles?role_id=${roleId}` : `/hist-roles`;
      const result = await apiRequest(endpoint);
      if (result) {
        let rawData = result;
        if (!Array.isArray(rawData)) rawData = rawData.data || [rawData];
        setHistData(rawData);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistLoading(false);
    }
  };

  const handleRowClick = (item) => {
    setSelectedRoleId(item.id);
    setIsHistModalOpen(true);
    fetchHistory(item.id);
  };

  const handleShowAllHistory = () => {
    setSelectedRoleId(null);
    setIsHistModalOpen(true);
    fetchHistory(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[date.getMonth()];
    return `${date.getDate()} ${monthName} ${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleData, menuData] = await Promise.all([
        apiRequest(`/roles?page=${page}&search=${encodeURIComponent(searchQuery)}`), 
        apiRequest("/all-menus?nopaging=1")
      ]);
      
      if (roleData) {
        let rawRoleData = roleData;
        if (roleData && !Array.isArray(roleData) && roleData.metadata) {
          rawRoleData = roleData.data || [];
          setTotal(roleData.metadata.total || 0);
          setLimit(roleData.metadata.limit || 10);
        } else if (roleData && !Array.isArray(roleData) && roleData.data) {
          rawRoleData = roleData.data;
          setTotal(rawRoleData.length);
        }
        setData(Array.isArray(rawRoleData) ? rawRoleData : []);
      }

      if (menuData) {
        let rawMenuData = menuData;
        if (menuData && !Array.isArray(menuData) && menuData.data) rawMenuData = menuData.data;
        setMenus(Array.isArray(rawMenuData) ? rawMenuData : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, triggerSearch]);

  const handleDelete = async (id) => {
    const confirmed = window.confirmAsync ? await window.confirmAsync("Apakah Anda yakin ingin menghapus role ini?") : confirm("Apakah Anda yakin ingin menghapus role ini?");
    if (!confirmed) return;
    try {
      await apiRequest(`/management/roles/${id}`, "DELETE");
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus data', 'error');
    }
  };

  const openForm = async (item) => {
    if (item && item.id) {
      try {
        const roleDetail = await apiRequest(`/roles/${item.id}`);
        setEditingRole(roleDetail);
        setSelectedMenus(roleDetail?.menus?.map((m) => m.id) || []);
      } catch (err) {
        showToast('Gagal mengambil data role detail', 'error');
        setEditingRole(item);
        setSelectedMenus([]);
      }
    } else {
      setEditingRole({ id: null, name: "", description: "" });
      setSelectedMenus([]);
    }
  };

  const closeForm = () => {
    setEditingRole(null);
    setSelectedMenus([]);
  };

  const handleRoleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editingRole };
      let savedRole;
      if (payload.id) {
        savedRole = await apiRequest(`/management/roles/${payload.id}`, "PUT", payload);
        await apiRequest(`/management/roles/${payload.id}/menus`, "POST", { menu_ids: selectedMenus });
      } else {
        savedRole = await apiRequest("/management/roles", "POST", payload);
        if (savedRole && savedRole.id) {
          await apiRequest(`/management/roles/${savedRole.id}/menus`, "POST", { menu_ids: selectedMenus });
        }
      }

      closeForm();
      onChangeRole && onChangeRole();
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan role', 'error');
    }
  };

  const toggleMenu = (menuId) => {
    setSelectedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]));
  };

  if (editingRole) {
    return (
      <div className="section-view active">
        <div className="card">
          <div className="card-title">
            <span>{editingRole.id ? "Edit Role" : "Tambah Role"}</span>
          </div>
          <form onSubmit={handleRoleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>Name</label>
              <input type="text" value={editingRole.name} onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })} style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>Description</label>
              <input type="text" value={editingRole.description} onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })} style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }} />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>Hak Akses Menu (Role Menus)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
                {(menus || []).map((menu) => (
                  <label key={menu.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedMenus.includes(menu.id)} onChange={() => toggleMenu(menu.id)} />
                    <span>
                      <i className={menu.icon || "fas fa-circle"} style={{ width: "20px", color: "#64748b" }}></i> {menu.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Role & Menus
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="section-view active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span>Manajemen Role & Hak Akses Menus</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '10px', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Cari Nama atau ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); setTriggerSearch(prev => prev + 1); } }}
                style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #e2e8f0', borderRadius: '4px 0 0 4px', background: '#f8fafc', fontSize: '0.875rem', width: '200px' }}
              />
              <button 
                className="btn btn-success" 
                onClick={() => { setPage(1); setTriggerSearch(prev => prev + 1); }}
                style={{ borderRadius: '0 4px 4px 0', padding: '0.5rem 1rem' }}
              >
                Filter
              </button>
            </div>

            <button className="btn btn-secondary" onClick={handleShowAllHistory}>
              <i className="fas fa-history"></i> Riwayat Keseluruhan
            </button>
            <button className="btn btn-primary" onClick={() => openForm(null)}>
              <i className="fas fa-plus"></i> Tambah Role
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Role</th>
              <th>Deskripsi</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                  Memuat data...
                </td>
              </tr>
            ) : (data && data.length > 0) ? (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={(e) => {
                    if (!e.target.closest('.action-btn')) {
                      handleRowClick(item);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                  className="hoverable-row"
                >
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.description || "-"}</td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn btn-edit" onClick={(e) => { e.stopPropagation(); openForm(item); }}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="action-btn btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  Data kosong.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <Pagination 
          current={page} 
          total={total} 
          limit={limit} 
          onPageChange={setPage} 
        />
      </div>

      <Modal 
        isOpen={isHistModalOpen} 
        onClose={() => setIsHistModalOpen(false)} 
        title={`Riwayat Perubahan ${selectedRoleId ? `(ID: ${selectedRoleId})` : "Keseluruhan"}`}
        wide
      >
        <div style={{ padding: "1.5rem", maxWidth: "100%" }}>
          <div className="table-container" style={{ overflowX: "auto", maxHeight: "60vh" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "0.875rem" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "white" }}>
                <tr>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Role ID</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Nama Role</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Deskripsi</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>Waktu</th>
                  <th style={{ background: "white", borderBottom: "2px solid #f1f5f9" }}>User (C/U/D)</th>
                </tr>
              </thead>
              <tbody>
                {histLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                      <i className="fas fa-spinner fa-spin"></i> Memuat data...
                    </td>
                  </tr>
                ) : histData.length > 0 ? (
                  histData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.role_id}</td>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
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
                    <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                      Belum ada riwayat perubahan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button className="btn btn-secondary" onClick={() => setIsHistModalOpen(false)}>Tutup</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesPage;
