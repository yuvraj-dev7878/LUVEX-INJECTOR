// LUVEX INJECTOR — Background

console.log('🍪 LUVEX INJECTOR Background loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('🍪 LUVEX INJECTOR installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({ status: 'active', version: '5.0.1' });
  }
  return true;
});
