// ─── LUVEX INJECTOR — Cookie Injector Pro (Auto-Detect) ───

document.addEventListener('DOMContentLoaded', function() {
  console.log('🍪 LUVEX INJECTOR loaded');

  // ─── ELEMENTS ───
  const siteName = document.getElementById('siteName');
  const siteStatus = document.getElementById('siteStatus');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const countNumber = document.getElementById('countNumber');
  const cookieItems = document.getElementById('cookieItems');
  const listCount = document.getElementById('listCount');
  const injectBtn = document.getElementById('injectBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const importBox = document.getElementById('importBox');
  const closeImport = document.getElementById('closeImport');
  const cookieInput = document.getElementById('cookieInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  const notification = document.getElementById('notification');
  const formatLabel = document.getElementById('formatLabel');
  const formatCount = document.getElementById('formatCount');

  let currentTabUrl = '';
  let currentCookies = [];

  // ─── SHOW NOTIFICATION ───
  function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    clearTimeout(notification._timeout);
    notification._timeout = setTimeout(() => {
      notification.className = 'notification';
    }, 2500);
  }

  // ─── UPDATE STATUS ───
  function updateStatus(online, text) {
    if (statusDot) {
      statusDot.className = 'dot ' + (online ? 'online' : 'offline');
    }
    if (statusText) {
      statusText.textContent = text || (online ? 'Connected' : 'Offline');
    }
  }

  // ─── GET CURRENT TAB ───
  function getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        resolve(tabs[0] || null);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  AUTO-DETECT COOKIE FORMAT
  // ═══════════════════════════════════════════════════════════════

  function detectFormatAndParse(text) {
    text = text.trim();
    if (!text) return { format: 'none', cookies: [] };

    // ─── Try JSON ───
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name && parsed[0].value) {
        return { format: 'JSON', cookies: parsed };
      }
    } catch (e) {}

    // ─── Try Netscape ───
    const netscapeCookies = parseNetscape(text);
    if (netscapeCookies.length > 0) {
      return { format: 'Netscape', cookies: netscapeCookies };
    }

    // ─── Try Header String ───
    const headerCookies = parseHeader(text);
    if (headerCookies.length > 0) {
      return { format: 'Header', cookies: headerCookies };
    }

    return { format: 'none', cookies: [] };
  }

  // ─── PARSE NETSCAPE FORMAT ───
  function parseNetscape(text) {
    const lines = text.split('\n');
    const cookies = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split(/\t+/);
      if (parts.length >= 7) {
        cookies.push({
          name: parts[5],
          value: parts.slice(6).join('\t'),
          domain: parts[0],
          path: parts[2],
          secure: parts[3] === 'TRUE',
          expiration: parseInt(parts[4])
        });
      }
    }
    return cookies;
  }

  // ─── PARSE HEADER STRING ───
  function parseHeader(text) {
    return text.split(';')
      .map(s => s.trim())
      .filter(s => s.includes('='))
      .map(s => {
        const eq = s.indexOf('=');
        return { name: s.substring(0, eq).trim(), value: s.substring(eq + 1).trim() };
      })
      .filter(c => c.name && c.value);
  }

  // ─── AUTO-DETECT ON INPUT ───
  cookieInput.addEventListener('input', function() {
    const text = this.value;
    const result = detectFormatAndParse(text);
    if (result.format === 'none') {
      formatLabel.textContent = '—';
      formatCount.textContent = '0 cookies found';
    } else {
      formatLabel.textContent = result.format;
      formatCount.textContent = result.cookies.length + ' cookies found';
    }
  });

  // ─── LOAD COOKIES ───
  async function loadCookies() {
    try {
      const tab = await getCurrentTab();
      if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
        siteName.textContent = 'No website detected';
        siteStatus.textContent = '—';
        siteStatus.className = 'site-status';
        countNumber.textContent = '0';
        cookieItems.innerHTML = '<div class="empty-state"><span>No cookies found</span></div>';
        listCount.textContent = '0';
        updateStatus(false, 'No tab');
        return;
      }

      const url = new URL(tab.url);
      const hostname = url.hostname || 'unknown';
      currentTabUrl = tab.url;

      siteName.textContent = hostname;
      updateStatus(true, 'Connected');

      chrome.cookies.getAll({url: tab.url}, (cookies) => {
        if (chrome.runtime.lastError) {
          console.error('Cookie error:', chrome.runtime.lastError);
          return;
        }
        currentCookies = cookies || [];
        countNumber.textContent = currentCookies.length;
        listCount.textContent = currentCookies.length;

        if (currentCookies.length === 0) {
          cookieItems.innerHTML = '<div class="empty-state"><span>No cookies found for this site</span></div>';
          siteStatus.textContent = 'No Cookies';
          siteStatus.className = 'site-status inactive';
          return;
        }

        siteStatus.textContent = currentCookies.length + ' cookies';
        siteStatus.className = 'site-status';

        let html = '';
        currentCookies.slice(0, 20).forEach(cookie => {
          const displayValue = cookie.value.length > 25 ? cookie.value.substring(0, 25) + '...' : cookie.value;
          html += `
            <div class="cookie-item">
              <span class="cookie-name" title="${cookie.name}">${cookie.name}</span>
              <span class="cookie-value" title="${cookie.value}">${displayValue}</span>
              <span class="cookie-status">Active</span>
            </div>
          `;
        });
        cookieItems.innerHTML = html;
      });
    } catch (error) {
      console.error('Load cookies error:', error);
    }
  }

  // ─── DELETE ALL COOKIES ───
  function deleteAllCookies() {
    getCurrentTab().then((tabInfo) => {
      if (!tabInfo || !tabInfo.url) {
        showNotification('No website detected', 'error');
        return;
      }

      chrome.cookies.getAll({url: tabInfo.url}, (cookies) => {
        if (chrome.runtime.lastError || !cookies || cookies.length === 0) {
          showNotification('No cookies to delete', 'info');
          return;
        }

        let deleted = 0;
        cookies.forEach((cookie) => {
          const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path || '/'}`;
          chrome.cookies.remove({
            url: url,
            name: cookie.name,
            storeId: cookie.storeId
          }, () => {
            deleted++;
            if (deleted === cookies.length) {
              showNotification(`✅ Deleted ${deleted} cookies`, 'success');
              loadCookies();
            }
          });
        });
      });
    });
  }

  // ─── IMPORT COOKIES ───
  function importCookies(cookieString) {
    getCurrentTab().then((tabInfo) => {
      if (!tabInfo || !tabInfo.url) {
        showNotification('No website detected', 'error');
        return;
      }

      const urlObj = new URL(tabInfo.url);
      const domain = urlObj.hostname;

      // Auto-detect format
      const result = detectFormatAndParse(cookieString);
      if (result.cookies.length === 0) {
        showNotification('❌ No valid cookies found. Check format.', 'error');
        return;
      }

      let imported = 0;
      result.cookies.forEach(cookieData => {
        const name = cookieData.name;
        const value = cookieData.value;
        if (!name || !value) return;

        const cookieDomain = cookieData.domain || domain;
        const cookiePath = cookieData.path || '/';
        const cookieSecure = cookieData.secure || false;
        const cookieExpiration = cookieData.expiration || (Date.now() / 1000) + 60 * 60 * 24 * 30;

        chrome.cookies.set({
          url: tabInfo.url,
          name: name,
          value: value,
          domain: cookieDomain,
          path: cookiePath,
          secure: cookieSecure,
          httpOnly: false,
          sameSite: 'lax',
          expirationDate: cookieExpiration
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Cookie set error:', chrome.runtime.lastError);
            return;
          }
          imported++;
          if (imported === result.cookies.length) {
            showNotification(`✅ Imported ${imported} cookies (${result.format})`, 'success');
            loadCookies();
            closeImportBox();
          }
        });
      });
    });
  }

  // ─── TOGGLE IMPORT BOX ───
  function toggleImportBox(show) {
    if (show) {
      importBox.classList.add('open');
      cookieInput.value = '';
      formatLabel.textContent = '—';
      formatCount.textContent = '0 cookies found';
    } else {
      importBox.classList.remove('open');
    }
  }

  function closeImportBox() {
    importBox.classList.remove('open');
    cookieInput.value = '';
    formatLabel.textContent = '—';
    formatCount.textContent = '0 cookies found';
  }

  // ─── PASTE FROM CLIPBOARD ───
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      cookieInput.value = text;
      // Trigger detection
      const result = detectFormatAndParse(text);
      if (result.format !== 'none') {
        formatLabel.textContent = result.format;
        formatCount.textContent = result.cookies.length + ' cookies found';
      }
      showNotification('📋 Pasted from clipboard', 'success');
    } catch (error) {
      showNotification('❌ Failed to read clipboard', 'error');
    }
  }

  // ─── EVENT LISTENERS ───

  if (injectBtn) {
    injectBtn.addEventListener('click', () => {
      toggleImportBox(true);
    });
  }

  if (closeImport) {
    closeImport.addEventListener('click', closeImportBox);
  }

  if (pasteBtn) {
    pasteBtn.addEventListener('click', pasteFromClipboard);
  }

  if (confirmImportBtn) {
    confirmImportBtn.addEventListener('click', () => {
      const cookieString = cookieInput.value.trim();
      if (!cookieString) {
        showNotification('❌ Please enter cookies to import', 'error');
        return;
      }
      importCookies(cookieString);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (currentCookies.length === 0) {
        showNotification('No cookies to delete', 'info');
        return;
      }
      deleteAllCookies();
    });
  }

  // ─── INIT ───
  loadCookies();

  chrome.tabs.onActivated.addListener(() => {
    loadCookies();
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      loadCookies();
    }
  });

  console.log('🍪 LUVEX INJECTOR ready');
});
