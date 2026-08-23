// TEAM LUVEX — Cookie Injector Content Script

console.log('🍪 TEAM LUVEX Cookie Injector content script loaded');

// Wait for DOM to be ready before injecting
function injectBadge() {
  const body = document.body;
  if (!body) {
    // If body doesn't exist yet, try again
    setTimeout(injectBadge, 100);
    return;
  }

  // Check if badge already exists
  if (document.getElementById('team-luvex-badge')) {
    return;
  }

  const badge = document.createElement('div');
  badge.id = 'team-luvex-badge';
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 999999;
    background: rgba(10, 10, 26, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 11px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid rgba(255,255,255,0.06);
    pointer-events: none;
    user-select: none;
    opacity: 0.4;
    transition: opacity 0.3s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  `;

  badge.innerHTML = '🍪 TEAM <span style="background: linear-gradient(135deg, #f7971e, #ffd200); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">LUVEX</span>';
  document.body.appendChild(badge);

  // Make it slightly visible on hover
  badge.addEventListener('mouseenter', () => {
    badge.style.opacity = '0.8';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.opacity = '0.4';
  });
}

// ─── INJECT THE BADGE ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectBadge);
} else {
  injectBadge();
}

console.log('🍪 TEAM LUVEX Cookie Injector content script ready');
