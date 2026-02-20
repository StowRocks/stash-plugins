(function () {
  "use strict";

  const PLUGIN_ID = "stowServerQR";
  const ROUTE_PATH = "/settings/plugins/stow-qr";

  let qrVisible = false;
  let hideTimer = null;

  function createSettingsPage() {
    const serverUrl = window.location.origin;
    const serverName = localStorage.getItem(`${PLUGIN_ID}_serverName`) || "My Stash Server";

    return `
      <div class="stow-qr-container">
        <h2>Stow Server QR Code</h2>
        <p class="stow-qr-description">
          Scan this QR code with your iPhone, iPad, or Mac to automatically add this server to the Stow app.
        </p>

        <div class="stow-qr-config">
          <label>
            Server Name:
            <input type="text" id="stow-server-name" value="${serverName}" placeholder="My Stash Server" />
          </label>
        </div>

        <div class="stow-qr-warning">
          <strong>⚠️ Security Warning</strong>
          <p>This QR code contains your API key. Only scan on devices you trust.</p>
        </div>

        <div id="stow-qr-display" class="stow-qr-display" style="display: none;">
          <div id="stow-qr-code"></div>
          <div id="stow-qr-timer" class="stow-qr-timer"></div>
          <button id="stow-qr-hide" class="btn btn-secondary">Hide QR Code</button>
        </div>

        <button id="stow-qr-show" class="btn btn-primary">Show QR Code</button>
      </div>
    `;
  }

  async function getApiKey() {
    // Try to get API key from Stash configuration
    const query = `query Configuration { configuration { general { apiKey } } }`;
    
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      return data?.data?.configuration?.general?.apiKey || '';
    } catch (e) {
      console.error('Failed to fetch API key:', e);
      return '';
    }
  }

  function generateQRCode(data) {
    const qrContainer = document.getElementById('stow-qr-code');
    qrContainer.innerHTML = '';
    
    // Use QRCode.js from CDN
    new QRCode(qrContainer, {
      text: JSON.stringify(data),
      width: 300,
      height: 300,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  function startHideTimer() {
    const timerEl = document.getElementById('stow-qr-timer');
    let seconds = 60;

    const updateTimer = () => {
      timerEl.textContent = `Auto-hiding in ${seconds}s`;
      seconds--;

      if (seconds < 0) {
        hideQRCode();
      } else {
        hideTimer = setTimeout(updateTimer, 1000);
      }
    };

    updateTimer();
  }

  function hideQRCode() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    
    document.getElementById('stow-qr-display').style.display = 'none';
    document.getElementById('stow-qr-show').style.display = 'block';
    qrVisible = false;
  }

  async function showQRCode() {
    const serverName = document.getElementById('stow-server-name').value || "My Stash Server";
    const serverUrl = window.location.origin;
    const apiKey = await getApiKey();

    localStorage.setItem(`${PLUGIN_ID}_serverName`, serverName);

    const qrData = {
      name: serverName,
      url: serverUrl,
      apiKey: apiKey
    };

    generateQRCode(qrData);
    
    document.getElementById('stow-qr-display').style.display = 'flex';
    document.getElementById('stow-qr-show').style.display = 'none';
    qrVisible = true;

    startHideTimer();
  }

  function setupEventListeners() {
    document.getElementById('stow-qr-show')?.addEventListener('click', showQRCode);
    document.getElementById('stow-qr-hide')?.addEventListener('click', hideQRCode);
  }

  function loadQRCodeLibrary() {
    if (window.QRCode) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function init() {
    // Wait for Stash to be ready
    const checkStash = setInterval(() => {
      if (window.stash) {
        clearInterval(checkStash);
        
        // Register settings page
        window.stash.addEventListener('page:settings', async () => {
          const settingsContent = document.querySelector('.settings-content');
          if (settingsContent && window.location.pathname === ROUTE_PATH) {
            await loadQRCodeLibrary();
            settingsContent.innerHTML = createSettingsPage();
            setupEventListeners();
          }
        });

        // Add menu item
        window.stash.addEventListener('stash:location', () => {
          if (window.location.pathname.startsWith('/settings')) {
            const pluginsMenu = document.querySelector('a[href="/settings/plugins"]');
            if (pluginsMenu && !document.getElementById('stow-qr-menu-item')) {
              const menuItem = document.createElement('a');
              menuItem.id = 'stow-qr-menu-item';
              menuItem.href = ROUTE_PATH;
              menuItem.className = 'nav-link';
              menuItem.textContent = 'Stow QR Code';
              pluginsMenu.parentElement.appendChild(menuItem);
            }
          }
        });
      }
    }, 100);
  }

  init();
})();
