// ─── TEAM LUVEX — Cookie Injector ───

document.addEventListener('DOMContentLoaded', function() {
  console.log('🍪 TEAM LUVEX Cookie Injector loaded');

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
          const isActive = true;
          const displayValue = cookie.value.length > 25 ? cookie.value.substring(0, 25) + '...' : cookie.value;
          html += `
            <div class="cookie-item">
              <span class="cookie-name" title="${cookie.name}">${cookie.name}</span>
              <span class="cookie-value" title="${cookie.value}">${displayValue}</span>
              <span class="cookie-status ${isActive ? 'active' : 'expired'}">${isActive ? 'Active' : 'Expired'}</span>
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

      const pairs = cookieString.split(';').map(s => s.trim()).filter(s => s);
      if (pairs.length === 0) {
        showNotification('No valid cookies found', 'error');
        return;
      }

      let imported = 0;
      pairs.forEach(pair => {
        const eqIndex = pair.indexOf('=');
        if (eqIndex === -1) return;
        const name = pair.substring(0, eqIndex).trim();
        const value = pair.substring(eqIndex + 1).trim();
        if (!name || !value) return;

        chrome.cookies.set({
          url: tabInfo.url,
          name: name,
          value: value,
          domain: domain,
          path: '/',
          secure: false,
          httpOnly: false,
          sameSite: 'lax',
          expirationDate: (Date.now() / 1000) + 60 * 60 * 24 * 30
        }, () => {
          imported++;
          if (imported === pairs.length) {
            showNotification(`✅ Imported ${imported} cookies`, 'success');
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
    } else {
      importBox.classList.remove('open');
    }
  }

  function closeImportBox() {
    importBox.classList.remove('open');
    cookieInput.value = '';
  }

  // ─── PASTE FROM CLIPBOARD ───
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      cookieInput.value = text;
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

  // Reload on tab change
  chrome.tabs.onActivated.addListener(() => {
    loadCookies();
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      loadCookies();
    }
  });

  console.log('🍪 TEAM LUVEX Cookie Injector ready');
});
