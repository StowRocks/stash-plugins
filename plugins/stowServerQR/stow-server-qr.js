(function () {
  "use strict";

  const PLUGIN_ID = "stowServerQR";
  const QR_LIB_URL = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

  let qrVisible = false;
  let hideTimer = null;
  let injected = false;

  function loadQRLib() {
    if (window.QRCode) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = QR_LIB_URL;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function getServerName() {
    return localStorage.getItem(`${PLUGIN_ID}_serverName`) || location.hostname;
  }

  function setServerName(name) {
    localStorage.setItem(`${PLUGIN_ID}_serverName`, name);
  }

  function hideQR() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
    const panel = document.getElementById("stow-qr-panel");
    if (panel) panel.style.display = "none";
    const btn = document.getElementById("stow-qr-btn");
    if (btn) btn.style.display = "";
    qrVisible = false;
  }

  function showQR() {
    const apiKeyEl = document.querySelector("#apikey .value.text-break");
    const apiKey = apiKeyEl?.textContent?.trim() || "";

    const nameInput = document.getElementById("stow-qr-name");
    const name = nameInput?.value || getServerName();
    setServerName(name);

    const data = JSON.stringify({
      name,
      url: location.origin,
      apiKey,
    });

    const codeEl = document.getElementById("stow-qr-code");
    codeEl.innerHTML = "";
    new QRCode(codeEl, {
      text: data,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.H,
    });

    document.getElementById("stow-qr-panel").style.display = "";
    document.getElementById("stow-qr-btn").style.display = "none";
    qrVisible = true;

    // Auto-hide countdown
    let seconds = 60;
    const timerEl = document.getElementById("stow-qr-timer");
    const tick = () => {
      timerEl.textContent = `Auto-hiding in ${seconds}s`;
      if (seconds-- <= 0) return hideQR();
      hideTimer = setTimeout(tick, 1000);
    };
    tick();
  }

  function inject() {
    const apiKeyDiv = document.getElementById("apikey");
    if (!apiKeyDiv || injected) return;
    if (document.getElementById("stow-qr-btn")) return;

    injected = true;

    // Add QR button next to existing buttons
    const btnContainer = apiKeyDiv.querySelector("div:last-child");
    const btn = document.createElement("button");
    btn.id = "stow-qr-btn";
    btn.className = "btn btn-primary stow-qr-btn";
    btn.textContent = "📱 Stow QR";
    btn.addEventListener("click", async () => {
      await loadQRLib();
      showQR();
    });
    btnContainer.appendChild(btn);

    // Add QR panel below apikey section
    const panel = document.createElement("div");
    panel.id = "stow-qr-panel";
    panel.className = "stow-qr-panel";
    panel.style.display = "none";
    panel.innerHTML = `
      <div class="stow-qr-warning">
        ⚠️ This QR code contains your API key. Only scan on devices you trust.
      </div>
      <label class="stow-qr-name-label">
        Server Name
        <input type="text" id="stow-qr-name" class="text-input form-control" value="${getServerName()}" />
      </label>
      <div id="stow-qr-code"></div>
      <div id="stow-qr-timer" class="stow-qr-timer"></div>
      <button id="stow-qr-hide" class="btn btn-secondary">Hide</button>
    `;
    apiKeyDiv.after(panel);

    panel.querySelector("#stow-qr-hide").addEventListener("click", hideQR);
    panel.querySelector("#stow-qr-name").addEventListener("change", (e) => {
      setServerName(e.target.value);
      if (qrVisible) showQR();
    });
  }

  // Watch for Security settings tab
  const observer = new MutationObserver(() => {
    if (document.getElementById("apikey")) {
      inject();
    } else {
      injected = false;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
