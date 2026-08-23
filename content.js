// TEAM LUVEX — Cookie Injector Content Script

console.log('🍪 TEAM LUVEX Cookie Injector content script loaded');

// Inject TEAM LUVEX badge in page
const badge = document.createElement('div');
badge.id = 'team-luvex-badge';
badge.style.cssText = `
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 999999;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-family: -apple-system, sans-serif;
  border: 1px solid rgba(255,255,255,0.08);
  pointer-events: none;
  user-select: none;
  opacity: 0.5;
  transition: opacity 0.3s ease;
`;

badge.innerHTML = '🍪 TEAM <span style="background: linear-gradient(135deg, #f7971e, #ffd200); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">LUVEX</span>';
document.body.appendChild(badge);
