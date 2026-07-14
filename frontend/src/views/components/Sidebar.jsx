import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@assets/logo.png";

const Sidebar = ({ menus, onLogout, appConfig, collapsed, setCollapsed, onNavigate, mobileOpen, onShowAbout }) => {
  const location = useLocation();
  const activePath = location.pathname;

  // Organize menus into a tree structure
  const rootMenus = (menus || []).filter(m => !m.parent_id);
  const childMenus = (menus || []).filter(m => m.parent_id);

  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    // Auto-expand parents of active path
    const activeMenu = (menus || []).find(m => m.path === activePath);
    if (activeMenu && activeMenu.parent_id) {
        setExpandedMenus(prev => ({ ...prev, [activeMenu.parent_id]: true }));
    }
  }, [activePath, menus]);

  const toggleExpand = (id) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isExternalOrRaw = (path) => {
    if (!path) return false;
    return path.startsWith("http") || path.endsWith(".html") || path.endsWith(".pdf") || path.startsWith("/api/report");
  };

  const getExternalHref = (path) => {
    return path || "#";
  };

  const renderMenuItem = (menu) => {
    const children = childMenus.filter(c => c.parent_id === menu.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedMenus[menu.id];
    const isActive = activePath === menu.path || children.some(c => activePath.startsWith(c.path));

    return (
      <div key={menu.id} className="nav-submenu-container">
        {hasChildren ? (
          <div
            className={`nav-item ${isActive ? "active" : ""} submenu-header`}
            onClick={() => toggleExpand(menu.id)}
            style={{ cursor: "pointer" }}
          >
            <i className={menu.icon}></i>
            {!collapsed && (
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span>{menu.title}</span>
                <i className={`fas fa-chevron-${isExpanded ? "down" : "right"}`} style={{ fontSize: "0.7rem", minWidth: "auto" }}></i>
              </div>
            )}
          </div>
        ) : isExternalOrRaw(menu.path) ? (
          <a
            href={getExternalHref(menu.path)}
            className={`nav-item ${activePath === menu.path ? "active" : ""}`}
            style={{ textDecoration: "none" }}
            target={menu.path.endsWith(".html") ? "_self" : "_blank"}
            rel="noopener noreferrer"
          >
            <i className={menu.icon}></i>
            {!collapsed && <span>{menu.title}</span>}
          </a>
        ) : (
          <Link
            to={menu.path || "#"}
            className={`nav-item ${activePath === menu.path ? "active" : ""}`}
            style={{ textDecoration: "none" }}
            onClick={() => onNavigate && onNavigate(menu.path)}
          >
            <i className={menu.icon}></i>
            {!collapsed && <span>{menu.title}</span>}
          </Link>
        )}

        {hasChildren && isExpanded && !collapsed && (
          <div className="submenu-items" style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
            {children.map(child => (
              isExternalOrRaw(child.path) ? (
                <a
                  key={child.id}
                  href={getExternalHref(child.path)}
                  className={`nav-item ${activePath === child.path ? "active" : ""}`}
                  style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", textDecoration: "none" }}
                  target={child.path.endsWith(".html") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                >
                  <i className={child.icon} style={{ fontSize: "0.9rem", width: "20px" }}></i>
                  <span>{child.title}</span>
                </a>
              ) : (
                <Link
                  key={child.id}
                  to={child.path}
                  className={`nav-item ${activePath === child.path ? "active" : ""}`}
                  style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", textDecoration: "none" }}
                  onClick={() => onNavigate && onNavigate(child.path)}
                >
                  <i className={child.icon} style={{ fontSize: "0.9rem", width: "20px" }}></i>
                  <span>{child.title}</span>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""} no-print`}>
      <div className="logo-container">
        <div className="logo-icon">
          <img src={logo} alt="LIM Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        {!collapsed && <span className="logo-text">{appConfig.COMPANY_NAME || "LIM System"}</span>}
        
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
        </button>
      </div>

      <nav className="nav-menu" id="dynamic-menu">
        {(rootMenus || []).map((menu) => renderMenuItem(menu))}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%' }}>
        <div className="about-container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
          <a
            href="#"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              if (onShowAbout) onShowAbout();
            }}
            style={{ color: '#cbd5e1' }}
          >
            <i className="fas fa-info-circle"></i>
            {!collapsed && <span>About LIMS</span>}
          </a>
        </div>
        <div className="logout-container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
          <a
            href="#"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
            style={{ color: '#ff8080' }}
          >
            <i className="fas fa-sign-out-alt"></i>
            {!collapsed && <span>Logout</span>}
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
