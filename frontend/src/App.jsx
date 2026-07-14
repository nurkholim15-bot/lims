import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

// Extracted Components
import ForceUpgradePage from "@pages/ForceUpgradePage";
import MobileBottomNav from "@components/MobileBottomNav";
import PasswordVerificationModal from "@components/PasswordVerificationModal";
import AboutModal from "@components/AboutModal";

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

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [appConfig, setAppConfig] = useState({});

  // Bootstrap session check on app load
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const res = await apiRequest("/verify-session");
        if (res && res.user) {
          localStorage.setItem("is_logged_in", "true");
          localStorage.setItem("user", JSON.stringify(res.user));
          setUser(res.user);
          setToken("ACTIVE");
        } else {
          localStorage.removeItem("is_logged_in");
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      }
    };
    bootstrapSession();
  }, []);

  // Idle timeout monitoring
  const resetTimerRef = useRef(null);
  useEffect(() => {
    if (!token || !user) return;

    const autoLogout = async () => {
      try {
        await apiRequest("/logout", "POST");
      } catch (err) {
        console.error("Auto logout request failed:", err);
      }
      localStorage.clear();
      setToken(null);
      setUser(null);
      navigate("/login");
    };

    const idleMinutes = user.idle_timeout_minutes || parseInt(appConfig.DEFAULT_IDLE_TIMEOUT_MINUTES) || 30;
    const timeoutMs = idleMinutes * 60 * 1000;

    const resetTimer = () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        autoLogout();
      }, timeoutMs);
    };

    let lastReset = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset > 5000) { // Throttle activity checks to every 5s
        lastReset = now;
        resetTimer();
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, handleActivity));
    resetTimer();

    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [token, user, appConfig, navigate]);

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
    if (!token) return null;

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
    return <ForceUpgradePage forceUpgrade={forceUpgrade} />;
  }

  if (!token) {
    return (
      <Login
        appConfig={appConfig}
        onLoginSuccess={async (username, password, force = false) => {
          const data = await apiRequest("/login", "POST", { username, password, force_login: force });
          return data;
        }}
        onLoginComplete={(tokenVal, userVal) => {
          localStorage.setItem("is_logged_in", "true");
          localStorage.setItem("user", JSON.stringify(userVal));
          if (tokenVal) {
            localStorage.setItem("auth_token", tokenVal);
          }
          setToken("ACTIVE");
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
        <MobileBottomNav
          items={mobileNavItems}
          activePath={activePath}
          onItemClick={(item) => {
            if (item.path === "/logout") {
              handleLogout(true);
            } else if (item.path === "/about") {
              setModalType("about");
            } else {
              handleNavigate(item.path);
            }
          }}
        />
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
          <AboutModal
            isOpen={modalType === "about"}
            onClose={() => { setModalType(null); setSelectedApp(null); setEditingItem(null); setEditingEndpoint(null); }}
            appConfig={appConfig}
          />
        )}
      </Modal>

      <PasswordVerificationModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        onSubmit={handlePasswordSubmit}
        errorMsg={passwordErrorMsg}
      />

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
