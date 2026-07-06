import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import "./index.css";
import "@utils/dialog";
import { apiRequest } from "@models/api";
import Login from "@pages/Login";
import Sidebar from "@components/Sidebar";
import Header from "@components/Header";
import Modal from "@components/Modal";
import SubmissionForm from "@pages/SubmissionForm";
import PlanningForm from "@pages/PlanningForm";
import AppDetail from "@components/AppDetail";
import { workflowRoutes } from "@constants/routes";
import MasterForm from "@components/MasterForm";
import MainContent from "@layout/MainContent";
import { printAssetLabel } from "@utils/print";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = (location.pathname === "/" || location.pathname === "/index.html") ? "/welcome" : location.pathname;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [forceUpgrade, setForceUpgrade] = useState(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const appVersion = import.meta.env.VITE_APP_VERSION || "1.0";
        const appPlatform = (typeof window !== "undefined" && window.Capacitor) ? window.Capacitor.getPlatform() : "Web";
        const res = await apiRequest(`/check-version?version=${appVersion}&platform=${appPlatform}`);
        if (res && res.status === "FORCE_UPGRADE") {
          setForceUpgrade(res);
        }
      } catch (err) {
        console.error("Gagal melakukan pengecekan versi aplikasi:", err);
      }
    };
    checkVersion();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    if (token) {
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
    }
  }, [token]);

  const [appConfig, setAppConfig] = useState({});
  const [menus, setMenus] = useState([]);
  const [applications, setApplications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsTotal, setApplicationsTotal] = useState(0);
  const [applicationsLimit, setApplicationsLimit] = useState(10);
  const [searchFilters, setSearchFilters] = useState({ 
    query: "", 
    status: "", 
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const [sourceTable, setSourceTable] = useState("");

  const [modalType, setModalType] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [editingCrudEndpoint, setEditingCrudEndpoint] = useState(null);
  const [successNotif, setSuccessNotif] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [maxPasswordAttempts, setMaxPasswordAttempts] = useState(3);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [passwordModalCallback, setPasswordModalCallback] = useState(null); // callback to execute after password verification
  const [refreshTesterMasters, setRefreshTesterMasters] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [refreshUserSessions, setRefreshUserSessions] = useState(0);
  const [refreshMaster, setRefreshMaster] = useState(0);
  const [bootstrapError, setBootstrapError] = useState(null);


  const refreshData = async (page = 1, statusOverride = "", filtersOverride = null) => {
    const filters = filtersOverride || searchFilters;
    if (filtersOverride) {
        setSearchFilters(filtersOverride);
    }
    
    let fetchStatus = workflowRoutes[activePath]?.status || "All";
    if (activePath === "/query") {
        fetchStatus = statusOverride || filters.status || "All";
    }
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return null;

    const { query: q = "", start: s_date, end: e_date, start_date, end_date, month, year } = filters;
    let start = s_date || start_date || "";
    let end = e_date || end_date || "";

    if (month && year) {
        const m = month.toString().padStart(2, '0');
        start = `${year}-${m}-01`;
        const lastDate = new Date(year, month, 0);
        const lastDay = lastDate.getDate();
        end = `${year}-${m}-${lastDay}`;
    }
    
    if (!start || !end) {
        const now = new Date();
        const y = now.getFullYear();
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        const d = new Date(y, now.getMonth() + 1, 0).getDate();
        start = `${y}-${m}-01`;
        end = `${y}-${m}-${d}`;
    }
    const baseUrl = "/applications";
    const params = new URLSearchParams();
    const fetchStatusRaw = statusOverride || filters.status || "";
    fetchStatus = fetchStatusRaw.toLowerCase() === "all" ? "" : fetchStatusRaw;
    params.append("page", page);
    params.append("status", fetchStatus);
    if (q) params.append("reg_number", q);
    if (start) params.append("start_date", start);
    if (end) params.append("end_date", end);
    
    const url = `${baseUrl}?${params.toString()}`;

    try {
      const appData = await apiRequest(url);
      if (appData) {
        setApplications(appData.data || []);
        setApplicationsTotal(appData.total || 0);
        setApplicationsPage(appData.page || 1);
        if (appData.limit) setApplicationsLimit(appData.limit);
        setSourceTable(appData.source_table || "");
        return appData;
      }
      return null;
    } catch (err) {
      console.error("Refresh data failed:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        setBootstrapError(null);
        const menuData = await apiRequest("/menus");
        if (menuData) {
          setMenus(menuData);
        }
        const configData = await apiRequest("/config");
        if (configData) {
          setAppConfig(configData);
          if (configData.MAX_PASSWORD_ATTEMPTS) {
            setMaxPasswordAttempts(parseInt(configData.MAX_PASSWORD_ATTEMPTS) || 3);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial config/menus:", err);
        setBootstrapError(err.message || "Gagal memuat konfigurasi awal sistem.");
      } finally {
        setLoading(false);
      }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchInitialData();
  }, [token]);

  const [fetchHistory, setFetchHistory] = useState({});
  const lastPathRef = useRef(null);

  useEffect(() => {
    if (!token) {
      lastPathRef.current = null;
      return;
    }

    const fetchData = async () => {
      // Don't re-fetch if path hasn't changed unless manually triggered
      if (lastPathRef.current === activePath) return;
      lastPathRef.current = activePath;

      // Pages that don't need initial applications data fetch
      if (!activePath || activePath === "/welcome" || activePath === "/login") return;

      const now = Date.now();
      const lastFetch = fetchHistory[activePath] || 0;
      const isWorkflow = !!workflowRoutes[activePath];
      const isDashboard = activePath === "/dashboard";
      const isQuery = activePath === "/query";
      
      const ttlSeconds = parseInt(appConfig.FRONTEND_DATA_TTL_SECONDS) || 30;
      const shouldFetch = (now - lastFetch) > (ttlSeconds * 1000); 

      try {
        if (isWorkflow || isDashboard) {
           if (isQuery) {
               // Special case for query: clear data to wait for manual search
               setApplications([]);
               setApplicationsTotal(0);
               setFetchHistory(prev => ({ ...prev, [activePath]: now }));
            } else if (isDashboard) {
               // Dashboard handles its own stats, don't fetch applications list
               setFetchHistory(prev => ({ ...prev, [activePath]: now }));
            } else if (shouldFetch) {
              setLoading(true);
              const defaultFilters = { 
                query: "", 
                status: isWorkflow ? (workflowRoutes[activePath].status || "All") : "All", 
                month: new Date().getMonth() + 1, 
                year: new Date().getFullYear() 
              };
              setSearchFilters(defaultFilters);
              await refreshData(1, "", defaultFilters);
              setFetchHistory(prev => ({ ...prev, [activePath]: now }));
           }
        }
        

      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath, token]);

  const handlePageChange = (page) => {
    setApplicationsPage(page);
    refreshData(page);
  };

  const handleApplyFilters = (newFilters) => {
    setSearchFilters(newFilters);
    setApplicationsPage(1);
    refreshData(1, "", newFilters);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false); // Close menu on mobile after navigation
  };

  const handleActionSuccess = async (msg, app = null, extraType = null) => {
    if (msg) setSuccessNotif({ message: msg, app });
    setModalType(null);
    setSelectedApp(null);
    refreshData();
    if (extraType === "tester-masters") setRefreshTesterMasters((prev) => prev + 1);
    if (extraType === "master-data") {
      setRefreshMaster((prev) => prev + 1);
      try {
        const configData = await apiRequest("/config");
        if (configData) {
          setAppConfig(configData);
        }
      } catch (err) {
        console.error("Failed to refetch config after master update:", err);
      }
    }
  };

  const handleLogout = async (confirm = false) => {
    if (confirm) {
      const confirmed = window.confirmAsync ? await window.confirmAsync("Apakah Anda yakin ingin keluar dari sistem?") : window.confirm("Apakah Anda yakin ingin keluar dari sistem?");
      if (!confirmed) {
        return;
      }
    }
    try {
      await apiRequest("/logout", "POST");
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    localStorage.clear();
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const getMenuByPath = (path) => {
    if (!path) return null;
    const p = path.startsWith("/") ? path : `/${path}`;
    return menus.find((m) => {
      if (!m.path) return false;
      const mp = m.path.startsWith("/") ? m.path : `/${m.path}`;
      return mp === p;
    });
  };

  const checkPasswordRequirement = async (callback, targetPath = null) => {
    const path = targetPath || activePath;
    const targetMenu = getMenuByPath(path);
    if (targetMenu && targetMenu.is_password) {
      setPasswordInput("");
      setPasswordAttempts(0);
      setPasswordErrorMsg("");
      setPasswordModalCallback(() => callback);
      setShowPasswordModal(true);
      return false;
    }
    callback();
    return true;
  };

  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) { setPasswordErrorMsg("Silakan masukkan password"); return; }
    try {
      const result = await apiRequest("/verify-password", "POST", { password: passwordInput });
      if (result && result.verified) {
        setShowPasswordModal(false);
        setPasswordInput("");
        if (passwordModalCallback) {
          passwordModalCallback();
          setPasswordModalCallback(null);
        }
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      const newAttempts = passwordAttempts + 1;
      setPasswordAttempts(newAttempts);
      if (newAttempts >= maxPasswordAttempts) {
        setPasswordErrorMsg(`Maksimal upaya telah tercapai.`);
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        setPasswordErrorMsg(`Password salah. Sisa upaya: ${maxPasswordAttempts - newAttempts}`);
      }
    }
  };


  if (forceUpgrade) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        color: "white",
        fontFamily: "'Outfit', 'Inter', sans-serif",
        padding: "2rem",
        boxSizing: "border-box"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "3rem 2rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 2rem auto",
            boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)"
          }}>
            <i className="fas fa-arrow-alt-circle-up" style={{ fontSize: "2.5rem", color: "white" }}></i>
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.025em" }}>Pembaruan Aplikasi Wajib</h2>
          <p style={{ color: "#94a3b8", lineHeight: "1.6", marginBottom: "2rem" }}>
            {forceUpgrade.message || `Versi aplikasi Anda sudah usang. Harap perbarui ke versi ${forceUpgrade.minimum_version} untuk melanjutkan.`}
          </p>
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "2rem",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            <span style={{ display: "block", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Batas Versi Minimum</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981" }}>v{forceUpgrade.minimum_version}</span>
          </div>
          <a href={forceUpgrade.download_url} style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: 700,
            textDecoration: "none",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)",
            transition: "all 0.2s"
          }}>
            <i className="fas fa-download"></i> Unduh & Perbarui Sekarang
          </a>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <Login
        appConfig={appConfig}
        onLoginSuccess={async (username, password) => {
          const data = await apiRequest("/login", "POST", { username, password });
          return data;
        }}
        onLoginComplete={(tokenVal, userVal) => {
          localStorage.setItem("token", tokenVal);
          localStorage.setItem("user", JSON.stringify(userVal));
          setToken(tokenVal);
          setUser(userVal);
        }}
      />
    );
  }

  const allowedPaths = new Set((menus || []).map(m => m.path));
  const mobileNavItems = [
    {
      label: "Beranda",
      icon: "fas fa-home",
      path: "/welcome",
      allowed: true
    },
    {
      label: "Cari",
      icon: "fas fa-search",
      path: "/global-search",
      allowed: allowedPaths.has("/global-search") || allowedPaths.has("/query")
    },
    {
      label: "Uji",
      icon: "fas fa-vial",
      path: "/testing",
      allowed: allowedPaths.has("/testing")
    },
    {
      label: "About",
      icon: "fas fa-info-circle",
      path: "/about",
      allowed: true
    },
    {
      label: "Logout",
      icon: "fas fa-sign-out-alt",
      path: "/logout",
      allowed: true
    }
  ].filter(item => item.allowed);

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
      <Sidebar
        menus={menus}
        activePath={activePath}
        onNavigate={handleNavigate}
        onLogout={() => handleLogout(true)}
        appConfig={appConfig}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileMenuOpen}
        onShowAbout={() => setModalType("about")}
      />
      <main className="main-content" style={{ marginLeft: isMobile ? "0" : (collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)"), width: "100%", paddingBottom: isMobile ? "75px" : "0" }}>
        {(!isMobile || activePath !== "/welcome") && (
          <Header 
            user={user} 
            appConfig={appConfig} 
            applicationsTotal={applicationsTotal} 
            onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        )}
        {bootstrapError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", padding: "2rem", textAlign: "center" }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: "4rem", color: "#f59e0b", marginBottom: "1.5rem" }}></i>
            <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Masalah Koneksi Sistem</h2>
            <p style={{ color: "#64748b", maxWidth: "500px", marginBottom: "2rem" }}>{bootstrapError}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ padding: "12px 30px", borderRadius: "8px", fontWeight: 700 }}>
              <i className="fas fa-sync-alt"></i> Muat Ulang & Coba Lagi
            </button>
            <button className="btn btn-link" onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: "1.5rem", color: "#64748b", textDecoration: "none" }}>
              <i className="fas fa-sign-out-alt"></i> Keluar dan Login Kembali
            </button>
          </div>
        ) : (
          <div className="content-body" style={{ background: "var(--content-bg)", minHeight: "calc(100vh - 100px)", padding: isMobile ? "0.5rem" : "2.5rem 3rem" }}>

          <MainContent
            activePath={activePath}
            setActivePath={navigate}
            user={user}
            appConfig={appConfig}
            loading={loading}
            applications={applications}
            setApplications={setApplications}
            menus={menus}
            applicationsPage={applicationsPage}
            applicationsTotal={applicationsTotal}
            applicationsLimit={applicationsLimit}
            handlePageChange={handlePageChange}
            refreshData={refreshData}
            searchFilters={searchFilters}
            handleApplyFilters={handleApplyFilters}
            handleEditMaster={(item, route) => {
              setEditingItem(item);
              setEditingEndpoint(route.endpoint);
              setEditingCrudEndpoint(route.crudEndpoint);
              setModalType("edit-master");
            }}
            setEditingItem={setEditingItem}
            setEditingEndpoint={setEditingEndpoint}
            setEditingCrudEndpoint={setEditingCrudEndpoint}
            setModalType={setModalType}
            setSelectedApp={setSelectedApp}
            refreshMaster={refreshMaster}
            refreshTesterMasters={refreshTesterMasters}
            refreshUserSessions={refreshUserSessions}
            checkPasswordRequirement={checkPasswordRequirement}
          />
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "white",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 2000,
          boxShadow: "0 -4px 12px rgba(0,0,0,0.05)"
        }}>
          {mobileNavItems.map((item, index) => (
            <div 
              key={index}
              onClick={() => {
                if (item.path === "/logout") {
                  handleLogout(true);
                } else if (item.path === "/about") {
                  setModalType("about");
                } else {
                  handleNavigate(item.path);
                }
              }} 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                cursor: "pointer", 
                color: activePath === item.path ? "#065f46" : "#94a3b8", 
                flex: 1, 
                padding: "5px 0" 
              }}
            >
              <i className={item.icon} style={{ fontSize: "1.15rem" }}></i>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, marginTop: "2px" }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!successNotif} onClose={() => setSuccessNotif(null)} title="Konfirmasi">
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ marginBottom: "1rem" }}><i className="fas fa-check-circle" style={{ fontSize: "3rem", color: "#10b981" }}></i></div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1e293b", marginBottom: "1.5rem" }}>{successNotif?.message}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => setSuccessNotif(null)} style={{ padding: "10px 40px", borderRadius: "8px", fontWeight: 700, fontSize: "1rem" }}>OK</button>
            {(successNotif?.app?.equipment || (Array.isArray(successNotif?.app) && successNotif.app.length > 0)) && (
              <button 
                className="btn" 
                style={{ backgroundColor: "#1e293b", color: "white", padding: "10px 40px", borderRadius: "8px", fontWeight: 700, fontSize: "1rem" }}
                onClick={() => {
                  const apps = Array.isArray(successNotif.app) ? successNotif.app : [successNotif.app];
                  const equipments = apps.map(a => a.equipment).filter(e => e);
                  printAssetLabel(equipments, { appConfig });
                }}
              >
                <i className="fas fa-tag"></i> Cetak Label Asset
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!modalType}
        onClose={() => { setModalType(null); setSelectedApp(null); setEditingItem(null); setEditingEndpoint(null); }}
        title={modalType === "edit-master" ? "Edit Data" : modalType?.toUpperCase()}
        wide={modalType !== "about"}
      >
        {modalType === "submission" && <SubmissionForm currentUser={user} appConfig={appConfig} editingApp={selectedApp} onSuccess={(res) => handleActionSuccess("Pendaftaran Berhasil", res)} onCancel={() => setModalType(null)} checkPasswordRequirement={checkPasswordRequirement} />}
        {modalType === "planning" && <PlanningForm app={selectedApp} appConfig={appConfig} onSuccess={() => handleActionSuccess("Rencana Uji Berhasil Disimpan")} onCancel={() => setModalType(null)} checkPasswordRequirement={checkPasswordRequirement} />}
        {["verification", "approval", "reporting", "query", "testing", "analysis"].includes(modalType) && <AppDetail app={selectedApp} stage={modalType} appConfig={appConfig} onSuccess={(msg) => handleActionSuccess(msg)} onCancel={() => setModalType(null)} checkPasswordRequirement={checkPasswordRequirement} />}
        {modalType === "edit-master" && (
          <div style={{ padding: "2rem" }}>
            <MasterForm 
              item={editingItem} 
              endpoint={editingEndpoint} 
              crudEndpoint={editingCrudEndpoint} 
              onSuccess={() => {
                let extraType = null;
                if (editingEndpoint === "/tester-masters") extraType = "tester-masters";
                else extraType = "master-data";
                handleActionSuccess("Data Berhasil Diupdate", null, extraType);
              }} 
              onCancel={() => setModalType(null)} 
              checkPasswordRequirement={checkPasswordRequirement} 
            />
          </div>
        )}
        {modalType === "about" && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2.5rem 2rem",
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            color: "white",
            borderRadius: "16px",
            textAlign: "center",
            fontFamily: "'Outfit', 'Inter', sans-serif"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.4)"
            }}>
              <i className="fas fa-info-circle" style={{ fontSize: "2.5rem", color: "white" }}></i>
            </div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.5rem 0", letterSpacing: "-0.025em" }}>LIM System</h3>
            <p style={{ fontSize: "0.95rem", color: "#94a3b8", margin: "0 0 1.5rem 0", maxWidth: "320px", lineHeight: "1.5" }}>
              Laboratory Information Management System
            </p>
            <div style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "1rem 1.5rem",
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              boxSizing: "border-box"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>TIPE APLIKASI</span>
                <span style={{ fontSize: "0.95rem", color: "#e2e8f0", fontWeight: 700 }}>Mobile App</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>VERSI SISTEM</span>
                <span style={{ fontSize: "0.95rem", color: "#10b981", fontWeight: 700 }}>v{import.meta.env.VITE_APP_VERSION || "1.0"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>PLATFORM</span>
                <span style={{ fontSize: "0.95rem", color: "#3b82f6", fontWeight: 700 }}>{(typeof window !== "undefined" && window.Capacitor) ? window.Capacitor.getPlatform().toUpperCase() : "WEB"}</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setModalType(null)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)"
              }}
            >
              Tutup
            </button>
          </div>
        )}
      </Modal>

      {showPasswordModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div className="modal-card" style={{ background: "#fff", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: 700, color: "#065f46" }}>Verifikasi Password</h2>
            <p style={{ marginBottom: "1.5rem", color: "#666", fontSize: "0.95rem" }}>Silakan masukkan password Anda untuk melanjutkan.</p>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Masukkan password" style={{ width: "100%", padding: "0.75rem", border: passwordErrorMsg ? "2px solid #dc2626" : "1px solid #ddd", borderRadius: "4px", marginBottom: "0.5rem", boxSizing: "border-box" }} onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()} />
            {passwordErrorMsg && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{passwordErrorMsg}</p>}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowPasswordModal(false)} className="btn btn-secondary">Batal</button>
              <button onClick={handlePasswordSubmit} className="btn btn-primary">Verifikasi</button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info Display (Enabled via .env VITE_SHOW_DEBUG_INFO) */}
      {import.meta.env.VITE_SHOW_DEBUG_INFO === "true" && (
        <div className="debug-info-container">
          <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #334155' }}>DEBUG INFO (React State)</h4>
          <pre>{JSON.stringify({ 
            windowWidth: window.innerWidth,
            activePath, 
            searchFilters, 
            applicationsTotal, 
            applicationsPage,
            sourceTable,
            menus: menus
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
