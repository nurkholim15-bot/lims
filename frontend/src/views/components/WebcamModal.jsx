import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";

const WebcamModal = ({ isOpen, onClose, onCapture }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");
  const [camerasLoading, setCamerasLoading] = useState(false);
  const videoRef = useRef(null);

  // Initialize camera and list video devices
  useEffect(() => {
    if (!isOpen) return;

    const initCamera = async () => {
      setCamerasLoading(true);
      setError("");
      setCapturedImage(null);
      
      try {
        // Request webcam permission first
        const initialStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        setStream(initialStream);
        if (videoRef.current) {
          videoRef.current.srcObject = initialStream;
        }

        // Get list of video devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === "videoinput");
        setDevices(videoDevices);

        // Find active device ID from active stream track settings
        const activeTrack = initialStream.getVideoTracks()[0];
        const activeSettings = activeTrack ? activeTrack.getSettings() : null;
        const activeDeviceId = activeSettings?.deviceId || (videoDevices.length > 0 ? videoDevices[0].deviceId : "");
        setSelectedDeviceId(activeDeviceId);

      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
        setError("Gagal mengakses kamera. Silakan pastikan izin kamera telah diberikan di browser Anda.");
      } finally {
        setCamerasLoading(false);
      }
    };

    initCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Switch to the selected camera device
  const switchCamera = async (deviceId) => {
    stopCamera();
    setSelectedDeviceId(deviceId);
    setError("");
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Gagal mengganti kamera:", err);
      setError("Gagal mengakses kamera yang dipilih. Menghubungi kamera default...");
      
      // Fallback to default
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        setError("Gagal mengakses kamera apa pun.");
      }
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Draw the current video frame on a canvas
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    
    // Stop the video stream to release the camera lock
    stopCamera();
  };

  const handleRetake = async () => {
    setCapturedImage(null);
    if (selectedDeviceId) {
      await switchCamera(selectedDeviceId);
    }
  };

  const handleUsePhoto = () => {
    if (!capturedImage) return;
    
    // Convert base64 dataUrl back to a File object
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        onCapture(file);
        onClose();
      })
      .catch(err => {
        console.error("Error converting captured image to file:", err);
        alert("Gagal memproses foto hasil tangkapan.");
      });
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="Ambil Foto / Scan dari Kamera" wide={false} width="550px">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "'Outfit', sans-serif" }}>
        {error && (
          <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fas fa-exclamation-triangle" style={{ color: "#ef4444" }}></i>
            <span>{error}</span>
          </div>
        )}

        {/* Camera device selection dropdown */}
        {devices.length > 1 && !capturedImage && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 800, letterSpacing: "0.5px" }}>PILIH SUMBER INPUT KAMERA</label>
            <div style={{ position: "relative" }}>
              <select
                value={selectedDeviceId}
                onChange={(e) => switchCamera(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#1e293b",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                }}
              >
                {devices.map((device, idx) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Kamera Eksternal ${idx + 1}`}
                  </option>
                ))}
              </select>
              <div style={{ position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748b" }}>
                <i className="fas fa-chevron-down" style={{ fontSize: "0.8rem" }}></i>
              </div>
            </div>
          </div>
        )}

        {/* Video stream container */}
        <div style={{
          position: "relative",
          width: "100%",
          paddingBottom: "75%", /* 4:3 Ratio */
          background: "#090d16",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 16px rgba(0,0,0,0.15), inset 0 2px 8px rgba(0,0,0,0.8)",
          border: "1px solid #e2e8f0"
        }}>
          {camerasLoading && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#64748b" }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#38bdf8" }}></i>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Menyiapkan kamera...</span>
            </div>
          )}

          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : (
            <img
              src={capturedImage}
              alt="Hasil Tangkapan"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          )}

          {/* Guide Overlay for Doc Scan */}
          {!capturedImage && !error && !camerasLoading && (
            <div style={{
              position: "absolute",
              top: "8%",
              left: "8%",
              right: "8%",
              bottom: "8%",
              border: "2px dashed rgba(255, 255, 255, 0.5)",
              borderRadius: "10px",
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: "1.5rem"
            }}>
              <span style={{
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(4px)",
                color: "white",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.15)"
              }}>
                Arahkan parameter hasil uji ke area tengah
              </span>
            </div>
          )}
        </div>

        {/* Capture / Actions Area */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
          {!capturedImage ? (
            <button
              type="button"
              onClick={handleCapture}
              disabled={error || !stream || camerasLoading}
              style={{
                background: "linear-gradient(135deg, #0284c7, #0369a1)",
                color: "white",
                border: "none",
                borderRadius: "30px",
                padding: "12px 32px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: (error || !stream || camerasLoading) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                boxShadow: "0 6px 12px rgba(2, 132, 199, 0.25)",
                transition: "all 0.2s",
                opacity: (error || !stream || camerasLoading) ? 0.5 : 1
              }}
            >
              <i className="fas fa-camera" style={{ fontSize: "1rem" }}></i>
              <span>Ambil Foto</span>
            </button>
          ) : (
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button
                type="button"
                onClick={handleRetake}
                style={{
                  flex: 1,
                  background: "#ffffff",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "background 0.2s"
                }}
              >
                <i className="fas fa-redo"></i>
                <span>Ambil Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleUsePhoto}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 6px 12px rgba(16, 185, 129, 0.25)"
                }}
              >
                <i className="fas fa-check"></i>
                <span>Gunakan Foto</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WebcamModal;
