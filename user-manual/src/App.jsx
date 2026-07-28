import React, { useState } from "react";
import "./index.css";
import { MANUAL_CONTENT, SIDEBAR_STRUCTURE } from "./content";

const Mockup = ({ type, screenshots = [] }) => {
  return (
    <div className="mockup-container">
      <div className="mockup-header">
        <div className="mockup-dot red"></div>
        <div className="mockup-dot yellow"></div>
        <div className="mockup-dot green"></div>
        <div className="mockup-url">
          <svg style={{ marginRight: 6, width: 12, height: 12, color: "#9ca3af" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          https://lims-d4551821.nip.io:8082/
        </div>
      </div>
      <div className="mockup-body" style={{ flexDirection: "column" }}>
        {type === "image" && screenshots.length > 0 ? (
          <div style={{ width: "100%", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {screenshots.map((imgUrl, idx) => (
              <img key={idx} src={imgUrl} alt={`Screenshot ${idx + 1}`} style={{ width: "100%", height: "auto", borderRadius: "4px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }} />
            ))}
          </div>
        ) : type === "login" ? (
          <div className="auth-form">
            <div style={{ textAlign: "center", marginBottom: 20, fontWeight: "bold", fontSize: 20 }}>LIMS Login</div>
            <div className="auth-input"></div>
            <div className="auth-input"></div>
            <div className="auth-btn"></div>
          </div>
        ) : type === "table" ? (
          <div style={{ width: "90%", height: "80%", background: "white", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ height: 30, background: "#e5e7eb", width: "100%", marginBottom: 15, borderRadius: 4 }}></div>
            <div style={{ height: 20, background: "#f3f4f6", width: "100%", marginBottom: 8, borderRadius: 4 }}></div>
            <div style={{ height: 20, background: "#f3f4f6", width: "100%", marginBottom: 8, borderRadius: 4 }}></div>
            <div style={{ height: 20, background: "#f3f4f6", width: "100%", marginBottom: 8, borderRadius: 4 }}></div>
          </div>
        ) : (
          <div className="mockup-placeholder-text">(Tempatkan Screenshot LIMS asli Anda di sini)</div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activeMenu, setActiveMenu] = useState("pendahuluan-welcome");
  const content = MANUAL_CONTENT[activeMenu];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">L</div>
          <div>
            <h1>LIMS MANUAL</h1>
            <span>Buku Panduan Pengguna</span>
          </div>
        </div>

        {SIDEBAR_STRUCTURE.map((section, idx) => (
          <div className="nav-section" key={idx}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item) => (
              <div key={item.id} className={`nav-item ${activeMenu === item.id ? "active" : ""}`} onClick={() => setActiveMenu(item.id)}>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div></div>
          <input type="text" className="search-box" placeholder="Cari topik panduan..." />
        </div>

        <div className="content-wrapper">
          {/* Left: Text Content */}
          <div className="content-left">
            {content ? (
              <>
                <h1 className="page-title">{content.title}</h1>
                <p className="page-subtitle">{content.subtitle}</p>

                {content.steps.map((step, idx) => (
                  <div className="step-container" key={idx}>
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-content">
                      <p className="step-text" dangerouslySetInnerHTML={{ __html: step.text }}></p>
                    </div>
                  </div>
                ))}

                {content.callout && (
                  <div className="callout">
                    <div className="callout-icon">ⓘ</div>
                    <div className="callout-text">{content.callout}</div>
                  </div>
                )}
              </>
            ) : (
              <h1 className="page-title">Halaman Belum Tersedia</h1>
            )}
          </div>

          {/* Right: Screenshot Mockup */}
          <div className="content-right">{content && <Mockup type={content.mockupType} screenshots={content.screenshots} />}</div>
        </div>
      </div>
    </div>
  );
}
