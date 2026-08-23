// LUVEX INJECTOR — Content Script

console.log('🍪 LUVEX INJECTOR content script loaded');

function injectBadge() {
  const body = document.body;
  if (!body) {
    setTimeout(injectBadge, 100);
    return;
  }

  if (document.getElementById('luvex-injector-badge')) {
    return;
  }

  const badge = document.createElement('div');
  badge.id = 'luvex-injector-badge';
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 999999;
    background: rgba(13, 13, 26, 0.8);
    color: white;
    padding: 6px 16px;
    font-size: 11px;
    font-family: -apple-system, sans-serif;
    border: 1px solid rgba(255,255,255,0.04);
    pointer-events: none;
    user-select: none;
    opacity: 0.3;
    transition: opacity 0.3s ease;
  `;

  badge.innerHTML = '🍪 LUVEX <span style="background: linear-gradient(135deg, #f7971e, #ffd200); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">INJECTOR</span>';
  document.body.appendChild(badge);

  badge.addEventListener('mouseenter', () => {
    badge.style.opacity = '0.7';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.opacity = '0.3';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectBadge);
} else {
  injectBadge();
}

console.log('🍪 LUVEX INJECTOR content script ready');
