// TEAM LUVEX — Cookie Injector Pro Background

console.log('🍪 TEAM LUVEX Cookie Injector Pro Background loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('🍪 TEAM LUVEX Cookie Injector Pro installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({ status: 'active', version: '5.0.0' });
  }
  return true;
});
