const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("CUSTOM_API_URL");
    if (customUrl) {
      return customUrl;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL || "/api";

  if (typeof window !== "undefined") {
    // Detect if running inside native Capacitor mobile app (Android / iOS)
    const isNativeMobile = !!(
      (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform()) ||
      (window.Capacitor && typeof window.Capacitor.getPlatform === "function" && window.Capacitor.getPlatform() !== "web")
    );

    if (isNativeMobile && (!envUrl || envUrl === "/api" || !envUrl.startsWith("http"))) {
      // Relative '/api' will fail in mobile app since there is no local backend on the phone.
      // Use the dedicated mobile backend endpoint, falling back to lims.local HTTPS port 8082.
      return import.meta.env.VITE_MOBILE_API_URL || "https://lims.local:8082/api";
    }
  }
  return envUrl;
};

export const API_URL = getApiUrl();

export const getDownloadUrl = (path) => {
  if (!path) return "";
  const base = API_URL.startsWith("http") ? API_URL : `${window.location.origin}${API_URL}`;
  return `${base}/download?path=${encodeURIComponent(path)}`;
};

export const viewDocument = async (path, customTitle = "Dokumen") => {
  if (!path) return;

  // Open blank tab synchronously within user gesture so browser does NOT block it
  const newTab = window.open("", "_blank");
  if (newTab) {
    try {
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${customTitle} - Memuat...</title></head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 90vh; background: #0f172a; color: white;">
            <div style="text-align: center;">
              <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">Memuat Dokumen...</div>
              <div style="font-size: 0.9rem; color: #94a3b8;">Sedang mengunduh berkas dari server LIMS...</div>
            </div>
          </body>
        </html>
      `);
      newTab.document.close();
    } catch (_) {}
  }

  try {
    const downloadUrl = getDownloadUrl(path);
    const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token");
    const headers = {
      "ngrok-skip-browser-warning": "true",
    };
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
      headers["X-Access-Token"] = storedToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(downloadUrl, {
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (newTab) newTab.close();
      let errMsg = `Gagal memuat dokumen (Status: ${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.error || errJson.message) {
          errMsg = errJson.error || errJson.message;
        }
      } catch (_) {}
      alert(errMsg);
      return;
    }

    const blob = await response.blob();
    const isPdf = path.toLowerCase().includes(".pdf");
    const blobType = isPdf ? "application/pdf" : (blob.type || "application/octet-stream");
    const blobUrl = URL.createObjectURL(new Blob([blob], { type: blobType }));

    if (newTab) {
      try {
        newTab.document.title = customTitle;
        newTab.document.body.style.margin = "0";
        newTab.document.body.style.padding = "0";
        newTab.document.body.style.overflow = "hidden";
        newTab.document.body.style.backgroundColor = "#525659";
        newTab.document.body.innerHTML = `
          <object data="${blobUrl}#toolbar=1" type="${blobType}" style="width: 100vw; height: 100vh; border: none;">
            <iframe src="${blobUrl}#toolbar=1" style="width: 100vw; height: 100vh; border: none;" title="${customTitle}">
              <div style="font-family: sans-serif; text-align: center; padding: 40px; color: white;">
                <h3>Dokumen siap diunduh</h3>
                <a href="${blobUrl}" download="${path.split('/').pop() || 'dokumen.pdf'}" style="color: #60a5fa; font-size: 1.1rem;">Klik di sini untuk mengunduh</a>
              </div>
            </iframe>
          </object>
        `;
      } catch (_) {
        newTab.location.replace(blobUrl);
      }
    } else {
      window.open(blobUrl, "_blank");
    }
  } catch (err) {
    if (newTab) newTab.close();
    console.error("View document error:", err);
    if (err.name === 'AbortError') {
      alert("Waktu memuat dokumen habis (Timeout). Pastikan koneksi server atau MinIO aktif.");
    } else {
      alert("Terjadi kesalahan saat memuat dokumen: " + (err.message || err));
    }
  }
};

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
  const isPublicEndpoint = endpoint.includes("/login") || endpoint.includes("/verify-otp") || endpoint.includes("/verify-session") || endpoint.includes("/change-expired-password") || endpoint.includes("/check-password-expiry") || endpoint.includes("/check-version");

  if (!isLoggedIn && !isPublicEndpoint) {
    console.warn("API Request blocked: User is not logged in for protected endpoint", endpoint);
    // Redirect to root if not already there, to trigger the Login screen in App.jsx
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = "/";
    }
    return null;
  }

  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0";
  const appPlatform = (typeof window !== "undefined" && window.Capacitor) ? window.Capacitor.getPlatform() : "Web";

  const headers = {
    "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning page
    "X-App-Version": appVersion,
    "X-App-Platform": appPlatform,
  };

  const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token");
  if (storedToken) {
    headers["Authorization"] = `Bearer ${storedToken}`;
    headers["X-Access-Token"] = storedToken;
  }

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  console.log(`Request  ${method} ${endpoint} : `, body || "");

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include'
    });

    const data = await response.json();
    console.log(`Response ${method} ${endpoint} : `, data);

    // Developer-friendly logging (Mode: DEV)
    if (import.meta.env.DEV) {
      console.group(`API: ${method} ${endpoint}`);
      console.log("Status:", response.status);
      console.log("Payload:", data);
      console.groupEnd();
    }

    if (!response.ok) {
      // Catch 401 specifically for auth cleanup
      if (response.status === 401 && !isPublicEndpoint) {
        console.warn("Session unauthorized or revoked. Logging out...");
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("user");
        
        // Redirect to root if not already there, to trigger re-render in App.jsx
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/";
        } else if (typeof window !== "undefined") {
          // If already on root, just reload to clear React state
          window.location.reload();
        }
        return null;
      }
      const err = new Error(data.error || data.message || `Error ${response.status}: Terjadi kesalahan sistem`);
      err.response = data;
      err.status = data.status;
      err.anomaly_score = data.anomaly_score;
      err.shap_values = data.shap_values;
      err.medians = data.medians;
      err.stds = data.stds;
      throw err;
    }

    // Global Debug Callback (for developer-friendly monitoring in App.jsx)
    if (import.meta.env.DEV && typeof window !== "undefined" && window.__LIMS_DEBUG_CALLBACK__) {
      window.__LIMS_DEBUG_CALLBACK__(`${method} ${endpoint}`, data);
    }

    // Smart unwrapping for views.Response {status, message, data} vs Raw Array/Object
    if (data && typeof data === 'object' && 'status' in data && 'message' in data && 'data' in data) {
      if ('metadata' in data || 'raw_text' in data) {
        return data; // Return full object if metadata or raw_text is present
      }
      return data.data || []; // Ensure we return at least empty array if data is null
    }

    return data;
  } catch (error) {
    // If it's a network error (Server Down)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
       console.error("Server tidak terjangkau (Network Error). Silakan cek koneksi atau apakah server sedang restart.");
    } else if (!error.message.includes("401")) {
       console.error(`API Exception [${endpoint}]:`, error.message);
    }
    throw error;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};
