import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "@models/api";
import { useToast } from '@context/ToastContext';

const AsistenLab = ({ user = {}, appConfig = {} }) => {
  const { showToast } = useToast();
  const chatInterval = parseInt(appConfig?.AI_INTERVAL_CHAT) || 2500;
  const [sops, setSops] = useState([]);
  const [loadingSops, setLoadingSops] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Role checks for granular authorization and governance
  const isAdmin = user?.role === "ADMIN" || user?.role?.name === "ADMIN";
  const isSupervisor = user?.role === "SUPERVISOR_LABORATORY" || user?.role?.name === "SUPERVISOR_LABORATORY";
  const isHelpdesk = user?.role === "HELPDESK" || user?.role?.name === "HELPDESK";
  
  const canManageSOP = isAdmin || isSupervisor;
  const canManageChats = isAdmin || isHelpdesk;
  const showLeftPanel = canManageSOP || canManageChats;

  // Active Tab for Left Panel (SOP Management & Live Operator Obrolan)
  const [activeTab, setActiveTab] = useState("sop"); // sop or chat

  // Real database-backed agent chat & call states
  const [isAgentChatActive, setIsAgentChatActive] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);

  // VoIP call states
  const [callingState, setCallingState] = useState("idle"); // idle, ringing, connected
  const [callDuration, setCallDuration] = useState(0);
  const [activeCallObj, setActiveCallObj] = useState(null);

  // Suggested questions in Indonesian
  const suggestions = [
    "Bagaimana prosedur keselamatan kerja di laboratorium?",
    "Bagaimana cara melakukan kalibrasi dan verifikasi alat?",
    "Bagaimana status progress registrasi saya?",
    "Apa saja produk paket pengujian yang tersedia di LIMS?",
  ];

  // Set default tab based on role on load
  useEffect(() => {
    if (isSupervisor) setActiveTab("sop");
    else if (isHelpdesk) setActiveTab("chat");
  }, [isSupervisor, isHelpdesk]);

  // Fetch SOP list
  const fetchSops = async (silent = false) => {
    if (!canManageSOP) return; 
    if (!silent) setLoadingSops(true);
    try {
      const data = await apiRequest("/sop");
      setSops(data || []);
    } catch (err) {
      console.error("Failed to fetch SOPs:", err);
    } finally {
      if (!silent) setLoadingSops(false);
    }
  };

  useEffect(() => {
    if (canManageSOP) {
      fetchSops();
    }
    // Retrieve chat history from localStorage if any
    const savedMessages = localStorage.getItem("asisten_lab_chat");
    if (savedMessages && !isAgentChatActive && !selectedOperator) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    }
  }, [canManageSOP]);

  // Auto-poll document list if there are files in 'processing' status
  useEffect(() => {
    if (!canManageSOP) return;
    const hasProcessing = sops.some((sop) => sop.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchSops(true); // silent fetch
    }, 4000);

    return () => clearInterval(interval);
  }, [sops, canManageSOP]);

  // Save AI chatbot to localStorage on change (only if AI mode is active)
  useEffect(() => {
    if (!isAgentChatActive && !selectedOperator) {
      if (messages.length > 0) {
        localStorage.setItem("asisten_lab_chat", JSON.stringify(messages));
      } else {
        localStorage.removeItem("asisten_lab_chat");
      }
    }
  }, [messages, isAgentChatActive, selectedOperator]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChat]);

  // ==========================================
  // REAL CHAT POLLING IMPLEMENTATIONS
  // ==========================================

  // 1. Polling active chat sessions (Helpdesk/Admin only, when activeTab is "chat")
  useEffect(() => {
    if (!canManageChats || activeTab !== "chat") return;

    const fetchSessions = async () => {
      try {
        const data = await apiRequest("/agent-chat/sessions");
        setChatSessions(data || []);
      } catch (err) {
        console.error("Failed to fetch chat sessions:", err);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, chatInterval);
    return () => clearInterval(interval);
  }, [canManageChats, activeTab, chatInterval]);

  // 2. Polling chat history for Operator (when isAgentChatActive is true)
  useEffect(() => {
    if (!isAgentChatActive) return;

    const fetchHistory = async () => {
      try {
        const data = await apiRequest("/agent-chat/history");
        const formatted = (data || []).map(m => ({
          sender: m.sender_name === user.username ? "user" : "agent",
          text: m.message,
          createdAt: m.created_at
        }));
        setMessages(formatted);
      } catch (err) {
        console.error("Failed to fetch operator chat history:", err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, chatInterval);
    return () => clearInterval(interval);
  }, [isAgentChatActive, user.username, chatInterval]);

  // 3. Polling chat history for Helpdesk (when selectedOperator is set)
  useEffect(() => {
    if (!selectedOperator) return;

    const fetchHistory = async () => {
      try {
        const data = await apiRequest(`/agent-chat/history?username=${selectedOperator}`);
        const formatted = (data || []).map(m => ({
          sender: m.sender_name === user.username ? "user" : "agent",
          text: m.message,
          createdAt: m.created_at
        }));
        setMessages(formatted);
      } catch (err) {
        console.error("Failed to fetch helpdesk chat history:", err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, chatInterval);
    return () => clearInterval(interval);
  }, [selectedOperator, user.username, chatInterval]);


  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // Toggle Chat mode (Operator)
  const handleToggleAgentChat = () => {
    if (!isAgentChatActive) {
      setMessages([]);
      setIsAgentChatActive(true);
    } else {
      setIsAgentChatActive(false);
      setMessages([]);
      // Reload chatbot from localStorage
      const savedMessages = localStorage.getItem("asisten_lab_chat");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  };

  // File uploads
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Hanya file PDF yang didukung untuk SOP.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      await apiRequest("/sop/upload", "POST", formData);
      showToast("File SOP berhasil diunggah! Proses ekstraksi teks & vektor berjalan di background.", "success");
      fetchSops();
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Gagal mengunggah SOP: " + err.message, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteSop = async (id, fileName) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus dokumen "${fileName}" beserta semua data vektornya?`);
    if (!confirmed) return;

    try {
      await apiRequest(`/sop/${id}`, "DELETE");
      setSops(prev => prev.filter(sop => sop.id !== id));
    } catch (err) {
      console.error("Failed to delete SOP:", err);
      showToast("Gagal menghapus SOP: " + err.message, "error");
    }
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    if (!textToSend) setInput(""); // clear input

    // 1. Helpdesk sending message to Operator
    if (selectedOperator) {
      try {
        await apiRequest("/agent-chat/send", "POST", {
          receiver_name: selectedOperator,
          message: queryText
        });
        setMessages(prev => [...prev, { sender: "user", text: queryText }]);
      } catch (err) {
        console.error("Failed to send helpdesk chat:", err);
      }
      return;
    }

    // 2. Operator sending message to Helpdesk
    if (isAgentChatActive) {
      try {
        await apiRequest("/agent-chat/send", "POST", {
          receiver_name: "HELPDESK",
          message: queryText
        });
        setMessages(prev => [...prev, { sender: "user", text: queryText }]);
      } catch (err) {
        console.error("Failed to send operator chat:", err);
      }
      return;
    }

    // 3. AI Chatbot mode
    const userMessage = { sender: "user", text: queryText };
    setMessages(prev => [...prev, userMessage]);
    setLoadingChat(true);

    try {
      const response = await apiRequest("/chat", "POST", { message: queryText });
      
      const aiMessage = {
        sender: "ai",
        text: response.answer || "Maaf, saya tidak menerima respons yang valid dari server.",
        sources: response.sources || [],
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat failure:", err);
      const errorMessage = {
        sender: "ai",
        text: "Maaf, terjadi kesalahan koneksi atau server saat menghubungi AI Asisten Lab. Pastikan API AI Anda berjalan dengan benar.",
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat percakapan?")) {
      setMessages([]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatCallDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper renderer for SOP Panel List
  const renderSopContent = () => (
    <>
      <div
        className={`upload-zone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
        {uploading ? (
          <div>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: "1.5rem", color: "#10b981", marginBottom: "0.5rem" }}></i>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Mengunggah SOP...</p>
          </div>
        ) : (
          <div>
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: "1.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}></i>
            <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "2px" }}>Pilih atau Tarik File PDF</p>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Maksimal 10MB (PDF saja)</p>
          </div>
        )}
      </div>

      {loadingSops ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: "0.5rem" }}></i>
          Memuat berkas...
        </div>
      ) : sops.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#94a3b8", fontSize: "0.85rem" }}>
          <i className="fas fa-info-circle" style={{ display: "block", fontSize: "1.5rem", marginBottom: "0.5rem" }}></i>
          Belum ada dokumen SOP terindeks di sistem. Silakan unggah file PDF di atas.
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
            Daftar SOP Aktif
          </div>
          {sops.map((sop) => (
            <div key={sop.id} className="sop-list-item">
              <i className="fas fa-file-pdf" style={{ color: "#ef4444", fontSize: "1.4rem" }}></i>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={sop.file_name}>
                  {sop.file_name}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "2px" }}>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                    {formatFileSize(sop.file_size)}
                  </span>
                  <span>•</span>
                  {sop.status === "completed" ? (
                    <span className="badge badge-green" style={{ padding: "1px 4px", fontSize: "0.6rem" }}>Aktif</span>
                  ) : sop.status === "processing" ? (
                    <span className="badge badge-blue" style={{ padding: "1px 4px", fontSize: "0.6rem", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: "0.55rem" }}></i> Ingesting
                    </span>
                  ) : (
                    <span className="badge badge-danger" style={{ padding: "1px 4px", fontSize: "0.6rem", background: "#fee2e2", color: "#b91c1c" }}>Gagal</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteSop(sop.id, sop.file_name)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                title="Hapus SOP"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Helper renderer for Helpdesk Chat sessions list
  const renderChatSessionsContent = () => (
    <>
      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
        Obrolan Operator Aktif
      </div>
      {chatSessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8", fontSize: "0.85rem" }}>
          <i className="fas fa-comments" style={{ display: "block", fontSize: "1.8rem", marginBottom: "0.5rem" }}></i>
          Belum ada obrolan masuk dari operator.
        </div>
      ) : (
        chatSessions.map((session) => (
          <div
            key={session.sender_name}
            className={`operator-chat-item ${selectedOperator === session.sender_name ? "active" : ""}`}
            onClick={() => {
              setSelectedOperator(session.sender_name);
              setMessages([]);
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              background: "#e0f2f1",
              color: "#00796b",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "0.95rem"
            }}>
              {session.sender_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" }}>{session.sender_name}</span>
                <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                  {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.message}
              </p>
            </div>
          </div>
        ))
      )}
    </>
  );

  return (
    <div className="section-view active" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Dynamic styles to keep component premium and isolated */}
      <style>{`
        .lab-chatbot-layout {
          display: grid;
          grid-template-columns: ${showLeftPanel ? "350px 1fr" : "1fr"};
          gap: 1.5rem;
          height: calc(100vh - 190px);
          min-height: 550px;
        }
        
        .panel-left {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .panel-right {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .panel-header {
          padding: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .panel-tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .panel-tab-btn {
          flex: 1;
          padding: 0.75rem;
          font-size: 0.85rem;
          font-weight: 700;
          text-align: center;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .panel-tab-btn.active {
          color: #059669;
          border-bottom-color: #059669;
          background: white;
        }

        .panel-body-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
        }

        .upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1.25rem;
          background: #f8fafc;
        }
        
        .upload-zone:hover, .upload-zone.active {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .sop-list-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
          margin-bottom: 0.75rem;
          background: white;
          transition: border-color 0.2s;
        }
        
        .sop-list-item:hover {
          border-color: #cbd5e1;
        }

        .operator-chat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          margin-bottom: 0.75rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .operator-chat-item:hover, .operator-chat-item.active {
          border-color: #059669;
          background: #f0fdf4;
        }

        .chat-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #fafafa;
        }

        .msg-row {
          display: flex;
          width: 100%;
          gap: 0.75rem;
        }
        
        .msg-row.user {
          justify-content: flex-end;
        }

        .msg-row.ai, .msg-row.agent {
          justify-content: flex-start;
        }

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        
        .avatar-circle.ai {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .avatar-circle.agent {
          background: #e0f7fa;
          color: #00838f;
          border: 1px solid #b2ebf2;
        }

        .msg-bubble {
          max-width: 75%;
          padding: 0.85rem 1.15rem;
          border-radius: 18px;
          font-size: 0.9rem;
          line-height: 1.5;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .msg-bubble.user {
          background: #064e3b;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .msg-bubble.ai {
          background: white;
          color: #1e293b;
          border-top-left-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .msg-bubble.agent {
          background: #e0f7fa;
          color: #006064;
          border-top-left-radius: 4px;
          border: 1px solid #b2ebf2;
        }

        .msg-bubble.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .citations-container {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px dashed #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .citation-tag {
          font-size: 0.75rem;
          background: #f1f5f9;
          color: #475569;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .suggestion-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem;
          font-size: 0.85rem;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        
        .suggestion-card:hover {
          border-color: #10b981;
          background: #f0fdf4;
          color: #065f46;
          transform: translateY(-2px);
        }

        .typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 18px;
        }

        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .typing-dot {
          width: 7px;
          height: 7px;
          background: #10b981;
          border-radius: 50%;
          animation: dotBounce 1.2s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 30px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .pulse-ring {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px dashed #10b981;
          opacity: 0.5;
        }

        .pulse-ring.ringing {
          animation: pulse 2s infinite;
        }

        .avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 2px solid #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.ringing {
          background: #f59e0b;
          animation: blink 1s infinite;
        }

        .status-dot.connected {
          background: #10b981;
        }

        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        /* Responsive adjustments for Mobile Header and Buttons */
        @media (max-width: 768px) {
          .panel-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          
          .panel-header-actions {
            width: 100%;
            display: flex;
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .hide-on-mobile {
            display: none !important;
          }
        }

        @media (max-width: 1024px) {
          .lab-chatbot-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .panel-left {
            height: 350px;
          }
          .panel-right {
            height: 500px;
          }
        }
      `}</style>

      {/* Main Grid Layout */}
      <div className="lab-chatbot-layout">
        
        {/* PANEL KIRI: Dokumen Referensi SOP & Chat Operator List (Governance Based) */}
        {showLeftPanel && (
          <div className="panel-left">
            {/* If Admin: show Tabs navigation */}
            {isAdmin && (
              <div className="panel-tabs">
                <button
                  className={`panel-tab-btn ${activeTab === "sop" ? "active" : ""}`}
                  onClick={() => { setActiveTab("sop"); setSelectedOperator(null); setMessages([]); }}
                >
                  <i className="fas fa-file-pdf" style={{ marginRight: "6px" }}></i>
                  File SOP
                </button>
                <button
                  className={`panel-tab-btn ${activeTab === "chat" ? "active" : ""}`}
                  onClick={() => { setActiveTab("chat"); }}
                >
                  <i className="fas fa-comments" style={{ marginRight: "6px" }}></i>
                  Pesan Masuk
                </button>
              </div>
            )}

            {/* If Supervisor only: Title header only */}
            {isSupervisor && (
              <div className="panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="fas fa-folder-open" style={{ color: "#059669" }}></i>
                  <span>Referensi Dokumen SOP</span>
                </div>
              </div>
            )}

            {/* If Helpdesk only: Title header only */}
            {isHelpdesk && (
              <div className="panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="fas fa-comments" style={{ color: "#059669" }}></i>
                  <span>Pusat Obrolan Helpdesk</span>
                </div>
              </div>
            )}

            <div className="panel-body-scroll">
              {/* Render Content dynamically based on calculated activeTab */}
              {activeTab === "sop" && canManageSOP && renderSopContent()}
              {activeTab === "chat" && canManageChats && renderChatSessionsContent()}
            </div>
          </div>
        )}

        {/* PANEL KANAN: Chat Interface */}
        <div className="panel-right">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
              <i className={(isAgentChatActive || selectedOperator) ? "fas fa-headset" : "fas fa-robot"} style={{ color: "#059669" }}></i>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedOperator 
                    ? `Chat: ${selectedOperator} (Operator LIMS)` 
                    : isAgentChatActive 
                      ? "Helpdesk Lab (Live Support)" 
                      : "Asisten Lab (AI Chatbot)"
                  }
                </div>
                <div style={{ fontSize: "0.7rem", fontWeight: "normal", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedOperator 
                    ? "Menghubungkan langsung ke operator terkait"
                    : isAgentChatActive 
                      ? "Komunikasi langsung dengan Helpdesk di database" 
                      : "Berdasarkan SOP resmi yang diunggah"
                  }
                </div>
              </div>
            </div>
            
            {/* Header Actions wrapper with responsive css class */}
            <div className="panel-header-actions">

              {/* Live Chat Toggle Button (Only shown to Operators / Non-Helpdesk/Non-Admin) */}
              {!canManageChats && (
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: isAgentChatActive ? "#064e3b" : "#e0f2f1",
                    color: isAgentChatActive ? "white" : "#00695c",
                    border: isAgentChatActive ? "1px solid #064e3b" : "1px solid #b2dfdb",
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  onClick={handleToggleAgentChat}
                >
                  <i className="fas fa-headset"></i>
                  {isAgentChatActive ? "Mode AI Chatbot" : "Chat Helpdesk"}
                </button>
              )}

              {/* Reset/Exit Chat Session Buttons */}
              {selectedOperator && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedOperator(null)}
                  style={{ padding: "6px 12px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", borderRadius: "8px" }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Keluar Obrolan
                </button>
              )}

              {messages.length > 0 && !isAgentChatActive && !selectedOperator && (
                <button
                  className="btn btn-secondary"
                  onClick={handleResetChat}
                  style={{ padding: "6px 12px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", borderRadius: "8px" }}
                >
                  <i className="fas fa-sync-alt"></i>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Chat Conversation Container */}
          <div className="chat-container">
            {(isAgentChatActive || selectedOperator) && (
              <div style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                fontSize: "0.8rem",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <i className="fas fa-exclamation-triangle"></i>
                <span>
                  {selectedOperator 
                    ? `Anda terhubung langsung ke ${selectedOperator}. Seluruh percakapan diarsipkan dalam database.`
                    : "Anda sedang terhubung ke Helpdesk Lab. Pesan terkirim secara real-time via database."
                  }
                </span>
              </div>
            )}

            {messages.length === 0 && !selectedOperator && !isAgentChatActive ? (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, padding: "2rem", textAlign: "center" }}>
                <div style={{ width: "70px", height: "70px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContext: "center", marginBottom: "1rem" }}>
                  <i className="fas fa-robot" style={{ fontSize: "2.2rem", color: "#059669", margin: "auto" }}></i>
                </div>
                
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#1e293b", marginBottom: "0.5rem", fontFamily: "Outfit" }}>
                  Selamat Datang di Asisten Lab LIMS!
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "460px", marginBottom: "2rem", lineHeight: "1.5" }}>
                  Saya siap membantu Anda menjawab pertanyaan prosedural (SOP), melacak status pengisian uji LIMS, serta memberikan info paket pengujian lab. Silakan ketik pertanyaan Anda atau pilih saran di bawah ini:
                </p>

                {/* Suggestions cards */}
                <div style={{ width: "100%", maxWidth: "550px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="suggestion-card" onClick={() => handleSendMessage(s)}>
                      <i className="far fa-comment-dots" style={{ color: "#10b981" }}></i>
                      <span>{s}</span>
                      <i className="fas fa-chevron-right" style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#cbd5e1" }}></i>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedOperator && messages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, color: "#94a3b8" }}>
                <i className="fas fa-comments" style={{ fontSize: "3rem", marginBottom: "1rem" }}></i>
                <p style={{ fontSize: "0.9rem" }}>Ketik pesan untuk memulai obrolan dengan {selectedOperator}.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.map((msg, index) => (
                  <div key={index} className={`msg-row ${msg.sender}`}>
                    {msg.sender === "ai" && (
                      <div className="avatar-circle ai">
                        <i className="fas fa-robot"></i>
                      </div>
                    )}
                    {msg.sender === "agent" && (
                      <div className="avatar-circle agent">
                        <i className="fas fa-user-tie"></i>
                      </div>
                    )}
                    
                    <div className={`msg-bubble ${msg.sender} ${msg.isError ? "error" : ""}`}>
                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                      
                      {/* Source citations rendering */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="citations-container">
                          {msg.sources.map((src, sIdx) => (
                            <span key={sIdx} className="citation-tag" title={src.file_name}>
                              <i className="fas fa-file-pdf" style={{ color: "#ef4444" }}></i>
                              <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {src.file_name}
                              </span>
                              <strong>(Hal. {src.page_number})</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking indicator bubble */}
                {loadingChat && (
                  <div className="msg-row ai">
                    <div className="avatar-circle ai">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="msg-bubble ai" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Asisten sedang membaca dokumen & database</span>
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <div style={{ padding: "1.25rem", borderTop: "1px solid #f1f5f9", background: "white" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: "flex", gap: "0.75rem", width: "100%" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedOperator
                    ? `Ketik pesan Anda untuk ${selectedOperator}...`
                    : isAgentChatActive
                      ? "Ketik pesan Anda untuk Helpdesk Lab..."
                      : sops.length === 0 && canManageSOP
                        ? "Unggah dokumen SOP terlebih dahulu di panel kiri..."
                        : "Ketik pertanyaan Anda (prosedur SOP, lacak progress, atau info produk)..."
                }
                disabled={loadingChat}
                style={{
                  flex: 1,
                  padding: "0.8rem 1.2rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  outline: "none",
                  minWidth: 0,
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingChat || !input.trim()}
                style={{ 
                  padding: "0 1rem", 
                  borderRadius: "12px", 
                  height: "45px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: "auto"
                }}
              >
                {loadingChat ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <span className="hide-on-mobile">Kirim</span>
                    <i className="fas fa-paper-plane" style={{ margin: 0 }}></i>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AsistenLab;
