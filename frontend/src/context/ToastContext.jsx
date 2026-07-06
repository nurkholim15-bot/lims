import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

/**
 * ToastProvider — Wrap seluruh aplikasi dengan ini di main.jsx.
 * Menyediakan hook useToast() yang bisa dipanggil dari komponen mana pun.
 *
 * Penggunaan:
 *   const { showToast } = useToast();
 *   showToast('Berhasil disimpan!', 'success');
 *   showToast('Gagal: ' + err.message, 'error');
 *   showToast('Perhatian!', 'warning');
 *   showToast('Info sistem', 'info');
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /**
   * showToast(message, type, duration)
   * @param {string} message   - Pesan yang ditampilkan (dirender sebagai text, bukan HTML)
   * @param {'success'|'error'|'warning'|'info'} type - Tipe notifikasi
   * @param {number} duration  - Durasi tampil dalam ms (default: 4000)
   */
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    counterRef.current += 1;
    const id = counterRef.current;

    // Batasi maksimum 5 toast bersamaan — hapus yang paling lama jika penuh
    setToasts(prev => {
      const next = [...prev, { id, message: String(message), type }];
      return next.length > 5 ? next.slice(next.length - 5) : next;
    });

    // Auto-dismiss setelah durasi habis
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * useToast — hook untuk memanggil showToast dari komponen mana pun.
 * Komponen harus berada di dalam ToastProvider.
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus digunakan di dalam ToastProvider');
  return ctx;
};

// ─── Internal: ToastContainer ────────────────────────────────────────────────

const TOAST_STYLES = {
  success: {
    background: 'linear-gradient(135deg, #065f46, #047857)',
    borderLeft: '4px solid #34d399',
    icon: '✓',
    iconColor: '#34d399',
  },
  error: {
    background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
    borderLeft: '4px solid #f87171',
    icon: '✕',
    iconColor: '#f87171',
  },
  warning: {
    background: 'linear-gradient(135deg, #78350f, #92400e)',
    borderLeft: '4px solid #fbbf24',
    icon: '⚠',
    iconColor: '#fbbf24',
  },
  info: {
    background: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
    borderLeft: '4px solid #60a5fa',
    icon: 'ℹ',
    iconColor: '#60a5fa',
  },
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        maxWidth: '420px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderRadius: '0.5rem',
        background: style.background,
        borderLeft: style.borderLeft,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
        color: '#f1f5f9',
        fontSize: '0.875rem',
        lineHeight: '1.5',
        pointerEvents: 'all',
        animation: 'toastSlideIn 0.3s ease',
        backdropFilter: 'blur(8px)',
        wordBreak: 'break-word',
      }}
    >
      {/* Icon */}
      <span style={{
        fontSize: '1rem',
        fontWeight: 'bold',
        color: style.iconColor,
        flexShrink: 0,
        marginTop: '0.05rem',
      }}>
        {style.icon}
      </span>

      {/* Message — dirender sebagai text biasa, BUKAN innerHTML */}
      <span style={{ flex: 1 }}>{toast.message}</span>

      {/* Tombol tutup */}
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Tutup notifikasi"
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0',
          flexShrink: 0,
          lineHeight: 1,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
      >
        ×
      </button>

      {/* Keyframe animation — hanya inject sekali */}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ToastProvider;
