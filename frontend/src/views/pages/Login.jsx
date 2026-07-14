import React, { useState } from 'react';
import logo from "@assets/logo.png";
import { apiRequest } from '../../models/api';

const Login = ({ onLoginSuccess, onLoginComplete, appConfig }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'expired'
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [expiryWarning, setExpiryWarning] = useState('');
    const [showExpiryModal, setShowExpiryModal] = useState(false);
    const [modalWarningText, setModalWarningText] = useState('');
    const [pendingAuthData, setPendingAuthData] = useState(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [showTakeoverModal, setShowTakeoverModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");

    // Server settings states
    const [showServerSettingsModal, setShowServerSettingsModal] = useState(false);
    const [connectionType, setConnectionType] = useState('wifi'); // 'wifi' or 'internet'
    const [wifiIp, setWifiIp] = useState('192.168.1.50');
    const [wifiPort, setWifiPort] = useState('8087');
    const [internetUrl, setInternetUrl] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle', 'testing', 'success', 'failed'
    const [testVersion, setTestVersion] = useState('');

    const handleTestConnection = async () => {
        setConnectionStatus('testing');
        
        let targetUrl = '';
        if (connectionType === 'wifi') {
            if (!wifiIp) {
                setConnectionStatus('failed');
                return;
            }
            targetUrl = `http://${wifiIp.trim()}:${wifiPort.trim() || '8087'}/api`;
        } else {
            if (!internetUrl) {
                setConnectionStatus('failed');
                return;
            }
            targetUrl = `${internetUrl.trim().replace(/\/$/, '')}/api`;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(`${targetUrl}/check-version?version=1.0&platform=android`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                setConnectionStatus('success');
                setTestVersion(data.version || '1.4');
            } else {
                setConnectionStatus('failed');
            }
        } catch (err) {
            console.error("Test connection failed:", err);
            setConnectionStatus('failed');
        }
    };

    const handleSaveServerSettings = () => {
        let targetUrl = '';
        if (connectionType === 'wifi') {
            if (!wifiIp) return;
            targetUrl = `http://${wifiIp.trim()}:${wifiPort.trim() || '8087'}/api`;
        } else {
            if (!internetUrl) return;
            targetUrl = `${internetUrl.trim().replace(/\/$/, '')}/api`;
        }

        localStorage.setItem("CUSTOM_API_URL", targetUrl);
        setShowServerSettingsModal(false);
        window.location.reload();
    };

    const handleResetDefaultServer = () => {
        localStorage.removeItem("CUSTOM_API_URL");
        setShowServerSettingsModal(false);
        window.location.reload();
    };

    const validatePasswordStrength = (pwd, minLen) => {
        if (!pwd || pwd.length < minLen) return false;
        
        let hasUpper = false;
        let hasLower = false;
        let hasDigit = false;
        let hasSpecial = false;

        for (let i = 0; i < pwd.length; i++) {
            const char = pwd[i];
            if (char >= 'A' && char <= 'Z') {
                hasUpper = true;
            } else if (char >= 'a' && char <= 'z') {
                hasLower = true;
            } else if (char >= '0' && char <= '9') {
                hasDigit = true;
            } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(char)) {
                hasSpecial = true;
            }
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    };

    const checkPasswordExpiry = async (userVal) => {
        if (!userVal) {
            setExpiryWarning('');
            return;
        }
        try {
            const res = await apiRequest(`/check-password-expiry?username=${encodeURIComponent(userVal)}`);
            if (res && res.expiring_soon) {
                setExpiryWarning(`Password Anda akan expired tanggal ${res.expiry_date} jam ${res.expiry_time}, segera ganti password Anda.`);
            } else {
                setExpiryWarning('');
            }
        } catch (err) {
            setExpiryWarning('');
        }
    };

    // Modal change password states
    const [showChangePwdModal, setShowChangePwdModal] = useState(false);
    const [cpUsername, setCpUsername] = useState('');
    const [cpOldPassword, setCpOldPassword] = useState('');
    const [cpNewPassword, setCpNewPassword] = useState('');
    const [cpConfirmPassword, setCpConfirmPassword] = useState('');
    const [cpShowOldPassword, setCpShowOldPassword] = useState(false);
    const [cpShowNewPassword, setCpShowNewPassword] = useState(false);
    const [cpShowConfirmPassword, setCpShowConfirmPassword] = useState(false);

    const handleSubmit = async (e, force = false) => {
        if (e) e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const data = await onLoginSuccess(username, password, force);
            if (data) {
                if (data.code === "OTP_REQUIRED") {
                    setShowTakeoverModal(false);
                    setShowOtpModal(true);
                } else if (data.token) {
                    if (data.pwd_warning && data.pwd_warning.expiring_soon) {
                        setPendingAuthData({ token: data.token, user: data.user });
                        setModalWarningText(`Password Anda akan expired tanggal ${data.pwd_warning.expiry_date} jam ${data.pwd_warning.expiry_time}, segera ganti password Anda.`);
                        setShowExpiryModal(true);
                    } else {
                        onLoginComplete(data.token, data.user);
                    }
                } else {
                    setError('Username atau password tidak valid');
                }
            } else {
                setError('Username atau password tidak valid');
            }
        } catch (err) {
            if (err.response && err.response.code === "ACTIVE_SESSION_EXISTS") {
                setShowTakeoverModal(true);
            } else if (err.response && err.response.code === "PWD_EXPIRED") {
                setError('Password Anda harus diperbarui. Silakan ubah password Anda di bawah.');
                setMode('expired');
            } else {
                setError(err.message || 'Login gagal. Periksa koneksi ke server.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpError('');
        setOtpLoading(true);
        try {
            const data = await apiRequest("/verify-otp", "POST", {
                username,
                password,
                code: otpCode
            });
            if (data && data.token) {
                setShowOtpModal(false);
                onLoginComplete(data.token, data.user);
            } else {
                setOtpError('Verifikasi gagal. Silakan coba lagi.');
            }
        } catch (err) {
            setOtpError(err.message || 'Kode OTP salah atau telah kedaluwarsa.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleExpiryModalOk = () => {
        setShowExpiryModal(false);
        if (pendingAuthData) {
            onLoginComplete(pendingAuthData.token, pendingAuthData.user);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setValidationError('Password baru tidak sama dengan ketik ulang');
            setShowValidationModal(true);
            return;
        }

        const minLen = parseInt(appConfig.PWD_MIN_LENGTH) || 9;
        if (!validatePasswordStrength(newPassword, minLen)) {
            setValidationError(`Password harus berisi minimal 1 huruf besar, 1 huruf kecil, 1 huruf spesial misal $, @, ! dan jumlah karakter minimal ${minLen} karakter`);
            setShowValidationModal(true);
            return;
        }

        setLoading(true);
        try {
            const response = await apiRequest("/change-expired-password", "POST", {
                username,
                old_password: password,
                new_password: newPassword
            });
            setSuccessMessage((response && response.message) || 'Password berhasil diubah. Silakan login kembali.');
            setMode('login');
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Gagal mengubah password.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (cpNewPassword !== cpConfirmPassword) {
            setValidationError('Password baru tidak sama dengan ketik ulang');
            setShowValidationModal(true);
            return;
        }

        const minLen = parseInt(appConfig.PWD_MIN_LENGTH) || 9;
        if (!validatePasswordStrength(cpNewPassword, minLen)) {
            setValidationError(`Password harus berisi minimal 1 huruf besar, 1 huruf kecil, 1 huruf spesial misal $, @, ! dan jumlah karakter minimal ${minLen} karakter`);
            setShowValidationModal(true);
            return;
        }

        setLoading(true);
        try {
            const response = await apiRequest("/change-expired-password", "POST", {
                username: cpUsername,
                old_password: cpOldPassword,
                new_password: cpNewPassword
            });
            setSuccessMessage((response && response.message) || 'Password berhasil diubah. Silakan login menggunakan password baru.');
            setShowChangePwdModal(false);
            setCpUsername('');
            setCpOldPassword('');
            setCpNewPassword('');
            setCpConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Gagal mengubah password.');
        } finally {
            setLoading(false);
        }
    };

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#064e3b', /* Original Dark Green */
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="card" style={{ 
          width: '100%', 
          maxWidth: '480px', /* Widened UI */
          padding: '3rem', 
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}>
          {/* Gear icon for Server Settings */}
          <button
            type="button"
            onClick={() => {
              const currentUrl = localStorage.getItem("CUSTOM_API_URL") || "";
              const fallbackVpsUrl = "https://lims-d4551821.nip.io:8082";
              
              if (currentUrl.startsWith("http")) {
                const portMatch = currentUrl.match(/:(\d+)/);
                const currentPort = portMatch ? portMatch[1] : '8087';
                if (currentUrl.startsWith("http://") && (currentPort === '8087' || currentPort === '8081' || currentPort === '3000')) {
                  setConnectionType('wifi');
                  const ipMatch = currentUrl.match(/http:\/\/([^:/]+)/);
                  setWifiIp(ipMatch ? ipMatch[1] : '192.168.1.50');
                  setWifiPort(currentPort);
                  setInternetUrl(fallbackVpsUrl); // Selalu isi default VPS agar tidak kosong
                } else {
                  setConnectionType('internet');
                  setInternetUrl(currentUrl.replace(/\/api$/, ''));
                  setWifiIp('192.168.1.50');
                  setWifiPort('8087');
                }
              } else {
                // Fallback to defaults from environment variables
                const defaultUrl = import.meta.env.VITE_MOBILE_API_URL || import.meta.env.VITE_API_URL || "https://212.85.24.33:8082/api";
                const cleanDefault = defaultUrl.replace(/\/api$/, '');
                const portMatch = cleanDefault.match(/:(\d+)/);
                const defaultPort = portMatch ? portMatch[1] : '8082';
                if (cleanDefault.startsWith("http://") && (defaultPort === '8087' || defaultPort === '8081' || defaultPort === '3000')) {
                  setConnectionType('wifi');
                  const ipMatch = cleanDefault.match(/http:\/\/([^:/]+)/);
                  setWifiIp(ipMatch ? ipMatch[1] : '192.168.1.50');
                  setWifiPort(defaultPort);
                  setInternetUrl(fallbackVpsUrl); // Selalu isi default VPS agar tidak kosong
                } else {
                  setConnectionType('internet');
                  setInternetUrl(cleanDefault.startsWith("http://192.168") ? fallbackVpsUrl : cleanDefault);
                  setWifiIp('192.168.1.50');
                  setWifiPort('8087');
                }
              }
              setConnectionStatus('idle');
              setShowServerSettingsModal(true);
            }}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            title="Pengaturan Server API"
          >
            <i className="fas fa-cog"></i>
          </button>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: '#10b981', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '2.5rem', color: 'white' }}></i>
            </div>
            <h2 style={{ color: '#1e293b', fontFamily: "'Outfit'", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {appConfig.COMPANY_NAME || 'LIM System'}
            </h2>
            {mode !== 'login' && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                {mode === 'expired' ? 'Ubah Password Kedaluwarsa' : ''}
              </p>
            )}
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, width: '100px', textAlign: 'right', fontWeight: 700 }}>Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setExpiryWarning('');
                  }}
                  onBlur={(e) => checkPasswordExpiry(e.target.value)}
                  required
                  placeholder="nur"
                  style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1 }}
                  autoFocus
                />
              </div>
              
              <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, width: '100px', textAlign: 'right', fontWeight: 700 }}>Password</label>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      zIndex: 10
                    }}
                  >
                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              {/* Smaller Buttons side-by-side: Ganti Password & Login */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMessage('');
                    setShowChangePwdModal(true);
                  }}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    fontSize: '0.95rem',
                    justifyContent: 'center',
                    borderRadius: '12px'
                  }}
                >
                  Ganti Password
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    fontSize: '0.95rem',
                    justifyContent: 'center',
                    borderRadius: '12px'
                  }}
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Login...</>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>

              {expiryWarning && (
                <div style={{ 
                  background: '#fffbeb', 
                  color: '#b45309', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '12px', 
                  fontSize: '0.825rem', 
                  border: '1px solid #fef3c7',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginTop: '0.5rem',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 4px rgba(180, 83, 9, 0.05)'
                }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginTop: '2px', fontSize: '0.95rem' }}></i>
                  <span>{expiryWarning}</span>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '-0.5rem' }}>
                <a href="#" style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Forgot?</a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>User: <strong style={{ color: '#10b981' }}>{username}</strong></span>
              </div>

              <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, width: '120px', textAlign: 'right', fontWeight: 700 }}>Password Baru</label>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Password Baru"
                    style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      zIndex: 10
                    }}
                  >
                    <i className={`fas fa-eye${showNewPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, width: '120px', textAlign: 'right', fontWeight: 700 }}>Konfirmasi</label>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Konfirmasi Password"
                    style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      zIndex: 10
                    }}
                  >
                    <i className={`fas fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  marginTop: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#10b981',
                  borderColor: '#10b981'
                }}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Memperbarui...</>
                ) : (
                  'Perbarui Password & Login'
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '-0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              color: '#ef4444', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              marginTop: '1.5rem', 
              textAlign: 'center',
              border: '1px solid #fee2e2',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ 
              background: '#ecfdf5', 
              color: '#10b981', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              marginTop: '1.5rem', 
              textAlign: 'center',
              border: '1px solid #a7f3d0',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-check-circle"></i>
              <span>{successMessage}</span>
            </div>
          )}
        </div>
        
        {/* Takeover Sesi Modal */}
        {showTakeoverModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}>
            <div className="card" style={{
              width: '100%',
              maxWidth: '480px',
              padding: '2.5rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              textAlign: 'center'
            }}>
              <div>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '1rem' }}></i>
                <h3 style={{ color: '#1e293b', fontFamily: "'Outfit'", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Session Anda masih aktif
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Akun Anda sedang terhubung di perangkat atau browser lain. Apakah Anda ingin keluar dari sesi lain dan masuk di perangkat ini?
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowTakeoverModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#e2e8f0', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Ya, Masuk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}>
            <div className="card" style={{
              width: '100%',
              maxWidth: '480px',
              padding: '2.5rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <i className="fas fa-shield-alt" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}></i>
                <h3 style={{ color: '#1e293b', fontFamily: "'Outfit'", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Verifikasi Keamanan
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Masukkan kode OTP 6-digit yang dikirimkan ke Telegram / WhatsApp terdaftar Anda.
                </p>
              </div>
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-control"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="E.g., 123456"
                    style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700, padding: '0.5rem' }}
                    autoFocus
                  />
                </div>

                {otpError && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>
                    {otpError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#e2e8f0', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {otpLoading ? 'Memverifikasi...' : 'Verifikasi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Ganti Password Modal popup */}
        {showChangePwdModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}>
            <div className="card" style={{
              width: '100%',
              maxWidth: '480px',
              padding: '2.5rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ color: '#1e293b', fontFamily: "'Outfit'", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Ganti Password
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Perbarui kata sandi akun LIMS Anda
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '110px', textAlign: 'right', fontWeight: 700 }}>Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cpUsername}
                    onChange={(e) => setCpUsername(e.target.value)}
                    required
                    placeholder="Username"
                    style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1 }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '110px', textAlign: 'right', fontWeight: 700 }}>Password Lama</label>
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <input
                      type={cpShowOldPassword ? "text" : "password"}
                      className="form-control"
                      value={cpOldPassword}
                      onChange={(e) => setCpOldPassword(e.target.value)}
                      required
                      placeholder="Password Lama"
                      style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowOldPassword(!cpShowOldPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        zIndex: 10
                      }}
                    >
                      <i className={`fas fa-eye${cpShowOldPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '110px', textAlign: 'right', fontWeight: 700 }}>Password Baru</label>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={cpShowNewPassword ? "text" : "password"}
                        className="form-control"
                        value={cpNewPassword}
                        onChange={(e) => setCpNewPassword(e.target.value)}
                        required
                        placeholder="Password Baru"
                        style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setCpShowNewPassword(!cpShowNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          zIndex: 10
                        }}
                      >
                        <i className={`fas fa-eye${cpShowNewPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                      Minimum {appConfig.PWD_MIN_LENGTH || 9} Karakter
                    </span>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '110px', textAlign: 'right', fontWeight: 700 }}>Ketik Ulang</label>
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <input
                      type={cpShowConfirmPassword ? "text" : "password"}
                      className="form-control"
                      value={cpConfirmPassword}
                      onChange={(e) => setCpConfirmPassword(e.target.value)}
                      required
                      placeholder="Ketik Ulang Password Baru"
                      style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowConfirmPassword(!cpShowConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        zIndex: 10
                      }}
                    >
                      <i className={`fas fa-eye${cpShowConfirmPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

                <div style={{ 
                  background: '#eff6ff', 
                  color: '#1e40af', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem', 
                  border: '1px solid #bfdbfe',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginTop: '0.5rem'
                }}>
                  <i className="fas fa-info-circle" style={{ marginTop: '2px', fontSize: '0.95rem' }}></i>
                  <span>Setelah kata sandi diubah, silakan masuk kembali dengan kata sandi baru di semua perangkatmu.</span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePwdModal(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      fontSize: '0.95rem',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: '1px solid #ef4444'
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      fontSize: '0.95rem',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      backgroundColor: '#10b981',
                      borderColor: '#10b981'
                    }}
                  >
                    {loading ? 'Memproses...' : 'Lanjut'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showExpiryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1.5rem'
          }}>
            <div className="card" style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2.5rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: '#fffbeb', borderRadius: '50%', boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '2.5rem', color: '#d97706' }}></i>
              </div>
              <div>
                <h3 style={{ color: '#1e293b', fontFamily: "'Outfit'", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Pemberitahuan Kadaluwarsa
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  {modalWarningText}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExpiryModalOk}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  fontWeight: 700,
                  marginTop: '0.5rem'
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {showValidationModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1.5rem'
          }}>
            <div className="card" style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2.5rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: '#fef2f2', borderRadius: '50%', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: '2.5rem', color: '#ef4444' }}></i>
              </div>
              <div>
                <h3 style={{ color: '#1e293b', fontFamily: "'Outfit'", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Syarat Password Kurang
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  {validationError}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  fontWeight: 700,
                  marginTop: '0.5rem'
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Modal Pengaturan Server API */}
        {showServerSettingsModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11000,
            padding: '1.5rem'
          }}>
            <div className="card" style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2.5rem',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
                <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#eff6ff', borderRadius: '50%', marginBottom: '1rem', color: '#3b82f6' }}>
                  <i className="fas fa-network-wired" style={{ fontSize: '1.75rem' }}></i>
                </div>
                <h3 style={{ color: '#1e293b', fontFamily: "'Outfit'", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Pengaturan Server API
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Atur alamat koneksi untuk HP Anda
                </p>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => { setConnectionType('wifi'); setConnectionStatus('idle'); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: connectionType === 'wifi' ? 'white' : 'transparent',
                    color: connectionType === 'wifi' ? '#0f172a' : '#64748b',
                    boxShadow: connectionType === 'wifi' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fas fa-wifi" style={{ marginRight: '6px' }}></i> Wi-Fi Lokal
                </button>
                <button
                  type="button"
                  onClick={() => { setConnectionType('internet'); setConnectionStatus('idle'); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: connectionType === 'internet' ? 'white' : 'transparent',
                    color: connectionType === 'internet' ? '#0f172a' : '#64748b',
                    boxShadow: connectionType === 'internet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fas fa-globe" style={{ marginRight: '6px' }}></i> Internet (VPS / Ngrok)
                </button>
              </div>

              {/* Inputs */}
              {connectionType === 'wifi' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Alamat & Port Server Lokal</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={wifiIp}
                      onChange={(e) => { setWifiIp(e.target.value); setConnectionStatus('idle'); }}
                      placeholder="Contoh: 192.168.1.50"
                      style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', flex: 1, margin: 0 }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>:</span>
                    <input
                      type="text"
                      className="form-control"
                      value={wifiPort}
                      onChange={(e) => { setWifiPort(e.target.value); setConnectionStatus('idle'); }}
                      placeholder="8087"
                      style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', width: '75px', textAlign: 'center', margin: 0 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    * Gunakan port **8087** jika lewat Nginx HTTP, port **8081** jika menembak Go Backend langsung, atau port **3000** jika lewat Node dev server.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Domain / IP Publik VPS</label>
                  <input
                    type="text"
                    className="form-control"
                    value={internetUrl}
                    onChange={(e) => { setInternetUrl(e.target.value); setConnectionStatus('idle'); }}
                    placeholder="Contoh: https://212.85.24.33:8082 atau https://lims.com"
                    style={{ background: '#eff6ff', color: '#1e293b', border: '1px solid #dbeafe', margin: 0 }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    * Gunakan HTTPS untuk domain resmi yang tepercaya. Gunakan HTTP jika terhubung ke alamat IP publik VPS secara langsung (tanpa domain) untuk menghindari pemblokiran sertifikat SSL oleh WebView.
                  </span>
                </div>
              )}

              {/* Connection Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Status Koneksi:</span>
                <div>
                  {connectionStatus === 'idle' && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Belum Diuji</span>
                  )}
                  {connectionStatus === 'testing' && (
                    <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700 }}>
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Menguji...
                    </span>
                  )}
                  {connectionStatus === 'success' && (
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                      <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Terhubung ({testVersion})
                    </span>
                  )}
                  {connectionStatus === 'failed' && (
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700 }}>
                      <i className="fas fa-times-circle" style={{ marginRight: '4px' }}></i> Gagal / Offline
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="btn btn-secondary"
                    disabled={connectionStatus === 'testing'}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      fontSize: '0.9rem',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: '1px solid #3b82f6',
                      fontWeight: 700
                    }}
                  >
                    Tes Koneksi
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveServerSettings}
                    className="btn btn-primary"
                    disabled={connectionStatus === 'testing' || (connectionType === 'wifi' && !wifiIp) || (connectionType === 'internet' && !internetUrl)}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      fontSize: '0.9rem',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      backgroundColor: '#10b981',
                      borderColor: '#10b981',
                      fontWeight: 700
                    }}
                  >
                    Simpan & Terapkan
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleResetDefaultServer}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      backgroundColor: '#94a3b8',
                      color: 'white',
                      border: '1px solid #94a3b8'
                    }}
                  >
                    Reset Default Bawaan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowServerSettingsModal(false)}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: '1px solid #ef4444'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ position: 'absolute', bottom: '2rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
          © 2026 {appConfig.COMPANY_NAME || 'LIM System'} • All Rights Reserved
        </div>
      </div>
    );
};

export default Login;
