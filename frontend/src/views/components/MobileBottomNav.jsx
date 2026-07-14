import React from "react";

function MobileBottomNav({ items, activePath, onItemClick }) {
  return (
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
      {items.map((item, index) => (
        <div 
          key={index}
          onClick={() => onItemClick(item)} 
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
  );
}

export default MobileBottomNav;
