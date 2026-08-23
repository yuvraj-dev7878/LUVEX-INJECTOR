// TEAM LUVEX — Cookie Injector Background

console.log('🍪 TEAM LUVEX Cookie Injector Background loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('🍪 TEAM LUVEX Cookie Injector installed');
});

// Handle any messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({ status: 'active', version: '3.0.0' });
  }
  return true;
});
