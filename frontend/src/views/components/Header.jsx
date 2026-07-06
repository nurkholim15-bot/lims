import React from "react";

const Header = ({ user, appConfig, applicationsTotal, onMenuToggle }) => {
  return (
    <header className="header no-print" style={{ marginLeft: 0 }}>
      <div className="welcome-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="mobile-menu-btn" 
          onClick={onMenuToggle}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            display: 'none', // Hidden by default, shown in media query
            padding: '0.5rem'
          }}
        >
          <i className="fas fa-bars"></i>
        </button>
        <div>
          <h1>{appConfig.HEADER_TITLE || "LIM System"}</h1>
          <p>
            Welcome back, <span id="display-username">{user?.username || "User"}</span>.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          id="inbox-btn"
          title="Inbox"
          style={{
            position: "relative",
            background: "rgba(255,255,255,0.15)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "default"
          }}
        >
          <i className="fas fa-inbox"></i>
          {applicationsTotal > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                background: "#10b981", // Using green for inbox count
                color: "white",
                fontSize: "0.6rem",
                padding: "2px 5px",
                borderRadius: "10px",
                fontWeight: 700,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              {applicationsTotal}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
          <div
            style={{
              background: "#fff",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
            }}
          ></div>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.role}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
