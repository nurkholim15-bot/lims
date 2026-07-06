export const showCustomAlert = (message) => {
  const overlay = document.createElement("div");
  overlay.className = "custom-dialog-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.backgroundColor = "rgba(15, 23, 42, 0.4)";
  overlay.style.backdropFilter = "blur(4px)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "99999";
  overlay.style.padding = "1.5rem";

  const box = document.createElement("div");
  box.style.background = "white";
  box.style.padding = "2rem";
  box.style.borderRadius = "24px";
  box.style.width = "100%";
  box.style.maxWidth = "400px";
  box.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
  box.style.textAlign = "center";
  box.style.animation = "dialog-fade-in 0.25s ease-out";

  const title = document.createElement("h3");
  title.textContent = "Informasi";
  title.style.margin = "0 0 0.75rem 0";
  title.style.fontFamily = "'Outfit', sans-serif";
  title.style.fontSize = "1.25rem";
  title.style.fontWeight = "800";
  title.style.color = "#1e293b";

  const content = document.createElement("p");
  content.textContent = message;
  content.style.margin = "0 0 1.5rem 0";
  content.style.fontSize = "0.9rem";
  content.style.color = "#475569";
  content.style.lineHeight = "1.5";
  content.style.fontFamily = "'Inter', sans-serif";

  const btn = document.createElement("button");
  btn.textContent = "OK";
  btn.style.width = "100%";
  btn.style.padding = "0.75rem";
  btn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.borderRadius = "12px";
  btn.style.fontWeight = "700";
  btn.style.fontSize = "0.9rem";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 4px 6px -1px rgba(16, 185, 129, 0.2)";

  btn.onclick = () => {
    document.body.removeChild(overlay);
  };

  box.appendChild(title);
  box.appendChild(content);
  box.appendChild(btn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

export const showCustomConfirm = (message) => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.backgroundColor = "rgba(15, 23, 42, 0.4)";
    overlay.style.backdropFilter = "blur(4px)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "99999";
    overlay.style.padding = "1.5rem";

    const box = document.createElement("div");
    box.style.background = "white";
    box.style.padding = "2rem";
    box.style.borderRadius = "24px";
    box.style.width = "100%";
    box.style.maxWidth = "400px";
    box.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    box.style.textAlign = "center";
    box.style.animation = "dialog-fade-in 0.25s ease-out";

    const title = document.createElement("h3");
    title.textContent = "Konfirmasi";
    title.style.margin = "0 0 0.75rem 0";
    title.style.fontFamily = "'Outfit', sans-serif";
    title.style.fontSize = "1.25rem";
    title.style.fontWeight = "800";
    title.style.color = "#1e293b";

    const content = document.createElement("p");
    content.textContent = message;
    content.style.margin = "0 0 1.5rem 0";
    content.style.fontSize = "0.9rem";
    content.style.color = "#475569";
    content.style.lineHeight = "1.5";
    content.style.fontFamily = "'Inter', sans-serif";

    const btnWrapper = document.createElement("div");
    btnWrapper.style.display = "flex";
    btnWrapper.style.gap = "12px";

    const btnCancel = document.createElement("button");
    btnCancel.textContent = "Batal";
    btnCancel.style.flex = "1";
    btnCancel.style.padding = "0.75rem";
    btnCancel.style.background = "#f1f5f9";
    btnCancel.style.color = "#475569";
    btnCancel.style.border = "none";
    btnCancel.style.borderRadius = "12px";
    btnCancel.style.fontWeight = "700";
    btnCancel.style.fontSize = "0.9rem";
    btnCancel.style.cursor = "pointer";
    btnCancel.onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };

    const btnOk = document.createElement("button");
    btnOk.textContent = "Ya, Lanjutkan";
    btnOk.style.flex = "1";
    btnOk.style.padding = "0.75rem";
    btnOk.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    btnOk.style.color = "white";
    btnOk.style.border = "none";
    btnOk.style.borderRadius = "12px";
    btnOk.style.fontWeight = "700";
    btnOk.style.fontSize = "0.9rem";
    btnOk.style.cursor = "pointer";
    btnOk.style.boxShadow = "0 4px 6px -1px rgba(239, 68, 68, 0.2)";
    btnOk.onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };

    btnWrapper.appendChild(btnCancel);
    btnWrapper.appendChild(btnOk);
    box.appendChild(title);
    box.appendChild(content);
    box.appendChild(btnWrapper);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
};

export const showCustomPrompt = (message, defaultValue = "") => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.backgroundColor = "rgba(15, 23, 42, 0.4)";
    overlay.style.backdropFilter = "blur(4px)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "99999";
    overlay.style.padding = "1.5rem";

    const box = document.createElement("div");
    box.style.background = "white";
    box.style.padding = "2rem";
    box.style.borderRadius = "24px";
    box.style.width = "100%";
    box.style.maxWidth = "400px";
    box.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    box.style.textAlign = "center";
    box.style.animation = "dialog-fade-in 0.25s ease-out";

    const title = document.createElement("h3");
    title.textContent = "Input Diperlukan";
    title.style.margin = "0 0 0.75rem 0";
    title.style.fontFamily = "'Outfit', sans-serif";
    title.style.fontSize = "1.25rem";
    title.style.fontWeight = "800";
    title.style.color = "#1e293b";

    const content = document.createElement("p");
    content.textContent = message;
    content.style.margin = "0 0 1rem 0";
    content.style.fontSize = "0.9rem";
    content.style.color = "#475569";
    content.style.lineHeight = "1.5";
    content.style.fontFamily = "'Inter', sans-serif";
    content.style.textAlign = "left";

    const input = document.createElement("input");
    input.type = "text";
    input.value = defaultValue;
    input.style.width = "100%";
    input.style.padding = "0.75rem";
    input.style.border = "1px solid #cbd5e1";
    input.style.borderRadius = "12px";
    input.style.marginBottom = "1.5rem";
    input.style.fontSize = "0.9rem";
    input.style.boxSizing = "border-box";
    input.style.fontFamily = "'Inter', sans-serif";

    const btnWrapper = document.createElement("div");
    btnWrapper.style.display = "flex";
    btnWrapper.style.gap = "12px";

    const btnCancel = document.createElement("button");
    btnCancel.textContent = "Batal";
    btnCancel.style.flex = "1";
    btnCancel.style.padding = "0.75rem";
    btnCancel.style.background = "#f1f5f9";
    btnCancel.style.color = "#475569";
    btnCancel.style.border = "none";
    btnCancel.style.borderRadius = "12px";
    btnCancel.style.fontWeight = "700";
    btnCancel.style.fontSize = "0.9rem";
    btnCancel.style.cursor = "pointer";
    btnCancel.onclick = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };

    const btnOk = document.createElement("button");
    btnOk.textContent = "Kirim";
    btnOk.style.flex = "1";
    btnOk.style.padding = "0.75rem";
    btnOk.style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
    btnOk.style.color = "white";
    btnOk.style.border = "none";
    btnOk.style.borderRadius = "12px";
    btnOk.style.fontWeight = "700";
    btnOk.style.fontSize = "0.9rem";
    btnOk.style.cursor = "pointer";
    btnOk.style.boxShadow = "0 4px 6px -1px rgba(59, 130, 246, 0.2)";
    btnOk.onclick = () => {
      document.body.removeChild(overlay);
      resolve(input.value);
    };

    btnWrapper.appendChild(btnCancel);
    btnWrapper.appendChild(btnOk);
    box.appendChild(title);
    box.appendChild(content);
    box.appendChild(input);
    box.appendChild(btnWrapper);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Auto focus the input field
    setTimeout(() => input.focus(), 50);
  });
};

// Auto register global overrides on import
if (typeof window !== "undefined") {
  window.alert = showCustomAlert;
  window.confirmAsync = showCustomConfirm;
  window.promptAsync = showCustomPrompt;
}
