import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onScan,
  title = "Scan Barcode / QR Code"
}) => {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const scannerRef = useRef(null);
  const isStoppingRef = useRef(false);
  const scannedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Play a brief, pleasant beep on successful scan
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  };

  // Helper to nicely format camera label
  const formatCameraName = (device) => {
    const label = device.label || device.id;
    const lower = label.toLowerCase();
    if (lower.includes("integrated") || lower.includes("internal") || lower.includes("built-in")) {
      return `💻 ${label} (Kamera Laptop)`;
    }
    if (lower.includes("hd camera") || lower.includes("usb") || lower.includes("external")) {
      return `📷 ${label} (Kamera Eksternal)`;
    }
    return `📷 ${label}`;
  };

  // Start scanning with a specific camera ID
  const startScanner = async (cameraId) => {
    if (!cameraId || !isMountedRef.current) return;

    try {
      setIsScanning(false);
      setErrorMsg(null);

      // Clean up previous instance if running
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          isStoppingRef.current = true;
          try {
            await scannerRef.current.stop();
          } catch (e) {}
          isStoppingRef.current = false;
        }
        try {
          scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }

      const viewportEl = document.getElementById("barcode-scanner-viewport");
      if (!viewportEl) {
        throw new Error("Scanner viewport container not found.");
      }

      const html5Qrcode = new Html5Qrcode("barcode-scanner-viewport", {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        verbose: false
      });

      scannerRef.current = html5Qrcode;

      const config = {
        fps: 25,
        disableFlip: true,
        videoConstraints: {
          deviceId: { exact: cameraId },
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      };

      await html5Qrcode.start(
        cameraId,
        config,
        async (decodedText) => {
          if (scannedRef.current) return;
          scannedRef.current = true;
          playScanBeep();

          // Safely stop scanning before notifying parent
          try {
            if (scannerRef.current && scannerRef.current.isScanning) {
              await scannerRef.current.stop();
              scannerRef.current.clear();
            }
          } catch (e) {}

          if (onScan) {
            onScan(decodedText);
          }
        },
        (errorMessage) => {
          // Normal background frame scan misses - no action needed
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Gagal memulai scanner:", err);
      if (isMountedRef.current) {
        setErrorMsg(
          err?.message || "Gagal memulai kamera untuk pemindaian. Pastikan izin kamera telah diberikan."
        );
      }
    }
  };

  // Switch camera when user selects from dropdown
  const handleCameraChange = async (newCameraId) => {
    if (newCameraId === selectedCameraId) return;
    setSelectedCameraId(newCameraId);
    try {
      localStorage.setItem("preferred_scanner_camera", newCameraId);
    } catch (e) {}
    await startScanner(newCameraId);
  };

  // Initialize camera list and initial camera selection when modal opens
  useEffect(() => {
    isMountedRef.current = true;
    scannedRef.current = false;

    if (!isOpen) {
      // Cleanup when modal closed
      if (scannerRef.current) {
        if (scannerRef.current.isScanning && !isStoppingRef.current) {
          isStoppingRef.current = true;
          scannerRef.current.stop().catch(() => {}).then(() => {
            try { scannerRef.current?.clear(); } catch (e) {}
            scannerRef.current = null;
            isStoppingRef.current = false;
          });
        } else {
          try { scannerRef.current.clear(); } catch (e) {}
          scannerRef.current = null;
        }
      }
      setIsScanning(false);
      return;
    }

    const initCameras = async () => {
      setIsInitializing(true);
      setErrorMsg(null);

      try {
        // Enumerate video devices via Html5Qrcode
        const allCameras = await Html5Qrcode.getCameras();

        // Filter out virtual cameras that cause black screens
        const validCameras = (allCameras || []).filter(
          (c) => !c.label?.toLowerCase().includes("virtual")
        );

        if (validCameras.length === 0) {
          throw new Error("Tidak ada kamera yang ditemukan. Pastikan kamera terpasang dan izin browser diberikan.");
        }

        setCameras(validCameras);

        // Determine best initial camera:
        // 1. Saved preference
        // 2. External USB camera (e.g. HD camera)
        // 3. First available camera
        const savedCam = localStorage.getItem("preferred_scanner_camera");
        const foundSaved = validCameras.find((c) => c.id === savedCam);

        const externalCam = validCameras.find(
          (c) =>
            c.label?.toLowerCase().includes("hd camera") ||
            c.label?.toLowerCase().includes("usb") ||
            (!c.label?.toLowerCase().includes("integrated") && !c.label?.toLowerCase().includes("internal"))
        );

        const initialCamId = foundSaved?.id || externalCam?.id || validCameras[0].id;
        setSelectedCameraId(initialCamId);

        // Small delay to ensure container element is mounted in DOM
        setTimeout(() => {
          if (isMountedRef.current) {
            startScanner(initialCamId);
          }
        }, 150);
      } catch (err) {
        console.error("Inisialisasi kamera gagal:", err);
        setErrorMsg(
          err?.message || "Tidak dapat mengakses kamera. Periksa izin kamera browser."
        );
      } finally {
        if (isMountedRef.current) {
          setIsInitializing(false);
        }
      }
    };

    initCameras();

    return () => {
      isMountedRef.current = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {}).then(() => {
            try { scannerRef.current?.clear(); } catch (e) {}
          });
        } else {
          try { scannerRef.current.clear(); } catch (e) {}
        }
      }
    };
  }, [isOpen]);

  const handleClose = async () => {
    if (scannerRef.current && scannerRef.current.isScanning && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
      isStoppingRef.current = false;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#e0f2fe",
                color: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem"
              }}
            >
              <i className="fas fa-barcode"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>
                {title}
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                Barcode (EAN-13, Code 128) & QR Code
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "1.2rem",
              padding: "4px 8px",
              borderRadius: "6px"
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Camera Selection Dropdown */}
          {cameras.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                  <i className="fas fa-video me-1" style={{ color: "#0284c7" }}></i> PILIH KAMERA
                </label>
                {isScanning && (
                  <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 600 }}>
                    <i className="fas fa-circle fa-beat me-1" style={{ fontSize: "0.5rem" }}></i> Aktif
                  </span>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedCameraId}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#1e293b",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  {cameras.map((device) => (
                    <option key={device.id} value={device.id}>
                      {formatCameraName(device)}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "12px",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#64748b"
                  }}
                >
                  <i className="fas fa-chevron-down" style={{ fontSize: "0.75rem" }}></i>
                </div>
              </div>
            </div>
          )}

          {/* Scanner Viewport */}
          <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: "280px",
              background: "#0f172a",
              borderRadius: "12px",
              overflow: "hidden",
              border: "2px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isInitializing && (
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#94a3b8"
                }}
              >
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#38bdf8" }}></i>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Mendeteksi kamera...</span>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  position: "absolute",
                  padding: "1rem",
                  textAlign: "center",
                  color: "#ef4444",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <i className="fas fa-exclamation-triangle" style={{ fontSize: "2rem" }}></i>
                <span style={{ fontSize: "0.85rem" }}>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => selectedCameraId && startScanner(selectedCameraId)}
                  className="btn btn-sm btn-outline-primary mt-2"
                >
                  <i className="fas fa-redo me-1"></i> Coba Lagi
                </button>
              </div>
            )}

            <div
              id="barcode-scanner-viewport"
              style={{
                width: "100%",
                height: "100%",
                display: errorMsg ? "none" : "block"
              }}
            ></div>

            {/* Non-cropping visual guide overlay */}
            {isScanning && !errorMsg && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div
                  style={{
                    width: "82%",
                    height: "150px",
                    border: "2px solid rgba(56, 189, 248, 0.75)",
                    borderRadius: "10px",
                    position: "relative",
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "92%",
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, #38bdf8, transparent)",
                      boxShadow: "0 0 6px #38bdf8"
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scanning Guidance Tip */}
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              fontSize: "0.8rem",
              color: "#1e40af",
              lineHeight: 1.45
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <i className="fas fa-lightbulb" style={{ color: "#3b82f6" }}></i>
              <span>Tips agar Barcode Terbaca Cepat:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
              <li>
                <strong>Atur Jarak:</strong> Tarik mundur kemasan ke jarak <strong>15 - 25 cm</strong> agar garis-garis barcode fokus dan tidak kabur/menyatu.
              </li>
              <li>
                <strong>Fokus Kamera Eksternal:</strong> Jika menggunakan kamera USB/endoscope, periksa apakah ada cincin putar fokus di depan lensa untuk menyesuaikan ketajaman.
              </li>
              <li>
                <strong>Coba Kamera Laptop:</strong> Anda juga dapat mengganti ke <em>💻 Kamera Laptop</em> pada menu di atas jika kamera laptop lebih tajam.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary w-100"
            style={{ fontWeight: 600, padding: "8px 16px" }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
