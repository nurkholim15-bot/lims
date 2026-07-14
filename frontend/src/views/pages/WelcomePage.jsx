import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@models/api";
import { useToast } from '@context/ToastContext';

const WelcomePage = ({ user, appConfig, onOpenApp, menus }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState("beranda");
  const scannerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scanner logic using the proven Html5QrcodeScanner
  const startScanner = () => {
    setScanning(true);
    setTimeout(async () => {
      try {
        setScanError(null);
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        
        const scannerFps = parseInt(appConfig?.SCANNER_FPS) || 25;
        const scannerBoxScale = parseFloat(appConfig?.SCANNER_QRBOX_SCALE) || 0.7;

        const scanner = new Html5QrcodeScanner("reg-scanner", {
          fps: scannerFps,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            return {
              width: viewfinderWidth * scannerBoxScale,
              height: viewfinderHeight * scannerBoxScale
            };
          },
          aspectRatio: 1.0,
          disableFlip: true,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        });
        
        scannerRef.current = scanner;
        
        scanner.render(async (decodedText) => {
          // Stop scanning immediately to prevent loops
          stopScanner();
          
          try {
            const res = await apiRequest("/applications/search-reg?reg_number=" + encodeURIComponent(decodedText));
            if (res && res.applications && res.applications.length > 0) {
              if (onOpenApp) {
                onOpenApp(res.applications[0], "query");
              }
            } else {
              showToast('Aplikasi dengan nomor registrasi tersebut tidak ditemukan.', 'warning');
            }
          } catch (err) {
            console.error("Search reg failed:", err);
            showToast('Gagal memproses kode. Aplikasi tidak ditemukan.', 'error');
          }
        }, (err) => {
          // Verbose scan error
        });
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setScanError("Gagal mengakses kamera. Coba lagi.");
      }
    }, 150);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error("Error clearing scanner:", err));
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Error clearing scanner on unmount:", err));
        scannerRef.current = null;
      }
    };
  }, []);

  if (isMobile) {
    const groups = [
      {
        id: "beranda",
        title: "Beranda",
        icon: "fas fa-home",
        items: [
          { label: "Registrasi", icon: "fas fa-file-signature", path: "/submission", grad: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
          { label: "Verifikasi", icon: "fas fa-clipboard-check", path: "/verification", grad: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)" },
          { label: "Persetujuan Pimpinan", icon: "fas fa-user-check", path: "/approval", grad: "linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)" },
          { label: "Perencanaan", icon: "fas fa-calendar-alt", path: "/planning", grad: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)" },
          { label: "Pengujian", icon: "fas fa-vial", path: "/testing", grad: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
          { label: "Analisa Data", icon: "fas fa-chart-bar", path: "/analysis", grad: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" },
          { label: "Pelaporan", icon: "fas fa-file-contract", path: "/reporting", grad: "linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)" },
          { label: "Riwayat Data", icon: "fas fa-search", path: "/global-search", grad: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" },
          { label: "Cari Semua Data", icon: "fas fa-database", path: "/query", grad: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
          { label: "Rekanan / Customer", icon: "fas fa-handshake", path: "/partners", grad: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }
        ]
      },
      {
        id: "reservasi_alat",
        title: "Reservasi & Alat",
        icon: "fas fa-tools",
        items: [
          { label: "Reservasi Alat", icon: "fas fa-calendar-check", path: "/tool-availability", grad: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }
        ]
      },
      {
        id: "keuangan",
        title: "Keuangan",
        icon: "fas fa-wallet",
        items: [
          { label: "Tagihan & Invoice", icon: "fas fa-file-invoice-dollar", path: "/invoices", grad: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
          { label: "Pembayaran", icon: "fas fa-cash-register", path: "/payments", grad: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }
        ]
      },
      {
        id: "support",
        title: "Support",
        icon: "fas fa-info-circle",
        items: [
          { label: "Dinas / SPD", icon: "fas fa-plane-departure", path: "/travel", grad: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
          { label: "Asset Monitoring & Movement", icon: "fas fa-cubes", path: "/asset-tracking", grad: "linear-gradient(135deg, #64748b 0%, #475569 100%)" },
          { label: "Reimbursement", icon: "fas fa-hand-holding-usd", path: "/reimbursement", grad: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
          { label: "Cash Advance", icon: "fas fa-money-bill-wave", path: "/cash-advance", grad: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }
        ]
      },
      {
        id: "monitoring",
        title: "Monitoring",
        icon: "fas fa-desktop",
        items: [
          { label: "Dashboard", icon: "fas fa-chart-line", path: "/dashboard", grad: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)" },
          { label: "Logs Simulator", icon: "fas fa-terminal", path: "/simulator-logs", grad: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
          { label: "Analitik-GoAccess", icon: "fas fa-chart-bar", path: "/analytics-goaccess", grad: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)" }
        ]
      },
      {
        id: "laporan",
        title: "Laporan",
        icon: "fas fa-file-alt",
        items: [
          { label: "Rekapitulasi (Summary)", icon: "fas fa-chart-pie", path: "/reports-summary", grad: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" },
          { label: "Detail Pengujian", icon: "fas fa-file-medical-alt", path: "/reports-detail", grad: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
          { label: "Laporan Daftar Aset", icon: "fas fa-clipboard-list", path: "/reports/asset-list", grad: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)" },
          { label: "Serah Terima", icon: "fas fa-file-signature", path: "/reports/asset-handover", grad: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
          { label: "Laporan Tagihan", icon: "fas fa-file-invoice", path: "/reports/invoices", grad: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
          { label: "Laporan Pembayaran", icon: "fas fa-receipt", path: "/reports/payments", grad: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
          { label: "Laporan SPD", icon: "fas fa-plane", path: "/reports-finance/spd", grad: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
          { label: "Laporan Cash-Advance", icon: "fas fa-money-check-alt", path: "/reports-finance/cash-advance", grad: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
          { label: "Laporan Reimbursement", icon: "fas fa-file-invoice-dollar", path: "/reports-finance/reimbursement", grad: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }
        ]
      },
      {
        id: "asisten_lab",
        title: "Asisten Lab (AI)",
        icon: "fas fa-robot",
        items: [
          { label: "Asisten Lab (AI)", icon: "fas fa-robot", path: "/asisten-lab", grad: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }
        ]
      },
      {
        id: "admin",
        title: "Admin",
        icon: "fas fa-user-cog",
        items: [
          { label: "Manajemen User", icon: "fas fa-users-cog", path: "/users", grad: "linear-gradient(135deg, #6b7280 0%, #374151 100%)" },
          { label: "Manajemen Role", icon: "fas fa-user-shield", path: "/roles", grad: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)" },
          { label: "Manajemen Menu", icon: "fas fa-stream", path: "/menus", grad: "linear-gradient(135deg, #374151 0%, #111827 100%)" },
          { label: "Riwayat Hak Akses Menu", icon: "fas fa-history", path: "/role-menus-hist", grad: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)" },
          { label: "Parameter Global", icon: "fas fa-sliders-h", path: "/global-params", grad: "linear-gradient(135deg, #1f2937 0%, #030712 100%)" },
          { label: "Manajemen Rekanan", icon: "fas fa-handshake", path: "/partners", grad: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
          { label: "Merk Peralatan", icon: "fas fa-tags", path: "/brands", grad: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
          { label: "Model Peralatan", icon: "fas fa-cube", path: "/models", grad: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
          { label: "Varian Peralatan", icon: "fas fa-shapes", path: "/variants", grad: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
          { label: "Lokasi Uji", icon: "fas fa-map-marker-alt", path: "/locations", grad: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
          { label: "Daftar Provinsi", icon: "fas fa-map", path: "/provinces", grad: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)" },
          { label: "Daftar Kota", icon: "fas fa-city", path: "/cities", grad: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" },
          { label: "Metodologi Uji", icon: "fas fa-flask", path: "/methodologies", grad: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" },
          { label: "Jenis Uji", icon: "fas fa-vials", path: "/test-types", grad: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
          { label: "Kategori Materiil", icon: "fas fa-boxes", path: "/mat-cats", grad: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)" },
          { label: "Negara Asal", icon: "fas fa-globe", path: "/origins", grad: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
          { label: "Tipe Rekanan", icon: "fas fa-handshake-alt", path: "/partner-types", grad: "linear-gradient(135deg, #6b7280 0%, #374151 100%)" },
          { label: "Manajemen Status Aset", icon: "fas fa-tasks", path: "/asset-status-mgmt", grad: "linear-gradient(135deg, #475569 0%, #334155 100%)" },
          { label: "Manajemen Status Pengajuan", icon: "fas fa-clipboard-list", path: "/status-app-mgmt", grad: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" },
          { label: "Master Tim Penguji", icon: "fas fa-users", path: "/tester-masters", grad: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" },
          { label: "Aspek Scoring", icon: "fas fa-star", path: "/scoring-aspects", grad: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
          { label: "Sub-Aspek Scoring", icon: "fas fa-star-half-alt", path: "/scoring-sub-aspects", grad: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
          { label: "Item Sub-Aspek Scoring", icon: "fas fa-list-ol", path: "/scoring-sub-aspect-items", grad: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
          { label: "Level Penilaian", icon: "fas fa-layer-group", path: "/scoring-levels", grad: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
          { label: "Testing Tools", icon: "fas fa-wrench", path: "/testing-tools", grad: "linear-gradient(135deg, #64748b 0%, #475569 100%)" },
          { label: "Paket Pengujian", icon: "fas fa-box-open", path: "/testing-packages", grad: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" },
          { label: "Sesi Pengguna", icon: "fas fa-user-clock", path: "/user-sessions", grad: "linear-gradient(135deg, #475569 0%, #334155 100%)" }
        ]
      }
    ];

    const allowedPaths = new Set((menus || []).map(m => m.path));
    const filteredGroups = groups.map(g => {
      const filteredItems = g.items.filter(item => {
        if (item.path === "/global-search" || item.path === "/query") {
          return allowedPaths.has("/global-search") || allowedPaths.has("/query");
        }
        return allowedPaths.has(item.path);
      });
      return { ...g, items: filteredItems };
    }).filter(g => g.items.length > 0);

    // Reset selectedGroupId if the active one isn't in filtered list
    useEffect(() => {
      if (filteredGroups.length > 0) {
        const exists = filteredGroups.some(g => g.id === selectedGroupId);
        if (!exists) {
          setSelectedGroupId(filteredGroups[0].id);
        }
      }
    }, [menus, selectedGroupId, filteredGroups]);

    const activeGroupObj = filteredGroups.find(g => g.id === selectedGroupId);
    const subMenuTitle = selectedGroupId === "beranda" ? "Alur Workflow Utama" : (activeGroupObj?.title || "");

    return (
      <div style={{ background: "#f8fafc", minHeight: "85vh", paddingBottom: "3rem" }}>
        {/* Top Header - Shopee Style Red/Green Gradient */}
        <div style={{
          background: "linear-gradient(185deg, #064e3b 0%, #065f46 100%)",
          padding: "1rem 1rem 1.75rem 1rem",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
          color: "white",
          position: "relative",
          zIndex: 1
        }}>
          {/* Header Search Bar Row */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={{
              flex: 1,
              background: "white",
              borderRadius: "12px",
              padding: "0.5rem 0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
            }} onClick={() => navigate("/global-search")}>
              <i className="fas fa-search" style={{ color: "#64748b" }}></i>
              <span style={{ color: "#94a3b8", fontSize: "0.875rem", flex: 1, userSelect: "none" }}>
                Cari berkas, rekanan, atau peralatan...
              </span>
              <i className="fas fa-qrcode" style={{ color: "#065f46", fontSize: "1.1rem", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); startScanner(); }}></i>
            </div>
          </div>
          
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "Outfit", margin: 0 }}>
            {appConfig.HEADER_TITLE || "Laboratory Information Management System"}
          </h2>
          <p style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "0.15rem" }}>
            Laboratorium Pengujian Materiil
          </p>
        </div>

        {/* Floating User Status & Wallet-style Card */}
        <div style={{ padding: "0 1.25rem", marginTop: "-1rem", position: "relative", zIndex: 10 }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "1.25rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f1f5f9"
          }}>
            {/* User Profile Info Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #10b981"
              }}>
                <i className="fas fa-user-shield" style={{ color: "#065f46", fontSize: "1.3rem" }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Selamat Datang,</div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b" }}>{user?.username || "Pengguna"}</div>
              </div>
              <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>
                {user?.role?.name || "PETUGAS"}
              </span>
            </div>

            {/* Quick Stats Grid (Wallet Style) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", textAlign: "center" }}>
              <div onClick={() => navigate("/submission")} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2563eb" }}>Draft</div>
                <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "2px" }}>Pengajuan</div>
              </div>
              <div style={{ borderLeft: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }} onClick={() => navigate("/testing")}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10b981" }}>Aktif</div>
                <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "2px" }}>Sedang Diuji</div>
              </div>
              <div onClick={() => navigate("/verification")} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#eab308" }}>Antrean</div>
                <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "2px" }}>Tugas Saya</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts Section (Shopee Grid Style) */}
        <div style={{ padding: "1.5rem 1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#334155", marginBottom: "1rem", fontFamily: "Outfit" }}>
            MENU SHORTCUT
          </h3>

          {/* Category Group Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.75rem",
            marginBottom: "1.5rem"
          }}>
            {filteredGroups.map((g) => {
              const isSelected = selectedGroupId === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "0.75rem 0.25rem",
                    borderRadius: "16px",
                    background: isSelected ? "#d1fae5" : "white",
                    border: isSelected ? "1.5px solid #10b981" : "1.5px solid #f1f5f9",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 4px 12px rgba(16,185,129,0.15)" : "none"
                  }}
                >
                  <div style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: isSelected ? "#10b981" : "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isSelected ? "white" : "#475569",
                    marginBottom: "0.35rem",
                    fontSize: "1.1rem"
                  }}>
                    <i className={g.icon}></i>
                  </div>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: isSelected ? "#065f46" : "#475569",
                    textAlign: "center",
                    lineHeight: "1.2",
                    wordBreak: "break-word",
                    maxWidth: "75px"
                  }}>
                    {g.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sub Menus Grid */}
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "1.5rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            border: "1px solid #f1f5f9"
          }}>
            <h4 style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#0f766e",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <i className="fas fa-dot-circle" style={{ color: "#10b981", fontSize: "0.8rem" }}></i>
              {subMenuTitle}
            </h4>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              rowGap: "1.5rem",
              columnGap: "0.75rem"
            }}>
              {activeGroupObj?.items.map((s, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(s.path)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s"
                  }}
                  className="mobile-shortcut-item"
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: s.grad,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
                    marginBottom: "0.5rem"
                  }}>
                    <i className={s.icon} style={{ color: "white", fontSize: "1.1rem" }}></i>
                  </div>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#334155",
                    textAlign: "center",
                    lineHeight: "1.2",
                    maxWidth: "80px",
                    wordWrap: "break-word"
                  }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Section (Like Shopee Promos) */}
        <div style={{ padding: "0 1.25rem 1.5rem 1.25rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            color: "white",
            borderRadius: "20px",
            padding: "1.25rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
          }}>
            {/* Background Accent circles */}
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(16,185,129,0.1)" }}></div>
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{
                background: "#10b981",
                fontSize: "0.6rem",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "999px",
                textTransform: "uppercase"
              }}>TIPS SISTEM</span>
              <h4 style={{ margin: "0.5rem 0 0.25rem 0", fontSize: "0.95rem", fontWeight: 700 }}>Integrasi Lab & PWA</h4>
              <p style={{ fontSize: "0.7rem", opacity: 0.8, lineHeight: "1.4" }}>
                Gunakan scanner barcode pada menu Registrasi untuk melacak berkas fisik secara cepat menggunakan kamera handphone Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Help Footer */}
        <div style={{ textAlign: "center", fontSize: "0.7rem", color: "#94a3b8", padding: "1rem 0" }}>
          &copy; {new Date().getFullYear()} {appConfig.COMPANY_NAME || "LIM System"}
        </div>

        {/* QR Scanner Viewport Modal */}
        {scanning && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 3000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "400px",
              background: "#fff",
              borderRadius: "24px",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ marginTop: 0, color: "#1e293b", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
                Pindai Kode QR / Barcode
              </h3>
              
              <div id="reg-scanner" style={{ width: "100%" }}></div>
              
              <button 
                onClick={stopScanner}
                className="btn btn-danger"
                style={{
                  marginTop: "1.5rem",
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "12px",
                  fontWeight: 700
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div style={{
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      textAlign: "center",
      color: "#1e293b"
    }}>
      <div style={{ 
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "3rem",
        borderRadius: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        maxWidth: "800px",
        width: "100%",
        color: "white"
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>
          Selamat Datang, {user?.username || "Pengguna"}!
        </h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "2rem" }}>
          Sistem Informasi {appConfig.COMPANY_NAME || "MEC System"} siap digunakan. 
          Silakan pilih menu di samping untuk memulai aktivitas Anda.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
            <i className="fas fa-file-signature" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#60a5fa" }}></i>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Registrasi</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>Daftarkan peralatan baru untuk pengujian.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
            <i className="fas fa-vial" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#34d399" }}></i>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Pengujian</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>Kelola proses dan hasil pengujian lapangan.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
            <i className="fas fa-chart-line" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#fbbf24" }}></i>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Dashboard</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>Pantau statistik dan ringkasan data terkini.</p>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: "3rem", fontSize: "0.9rem", color: "#64748b" }}>
        &copy; {new Date().getFullYear()} {appConfig.COMPANY_NAME || "MEC System"}
      </div>
    </div>
  );
};

export default WelcomePage;
