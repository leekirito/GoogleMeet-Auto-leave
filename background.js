// Background service worker — sets defaults on install & updates badge text.
const storageAPI = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
const actionAPI  = typeof browser !== 'undefined' ? browser.action  : chrome.action;

// Set sensible defaults on first install
chrome.runtime.onInstalled.addListener(() => {
  storageAPI.local.get(['minParticipants', 'requireThresholdFirst', 'cssSelector', 'enabled'], (s) => {
    const defaults = {};
    if (s.minParticipants       === undefined) defaults.minParticipants       = 2;
    if (s.requireThresholdFirst === undefined) defaults.requireThresholdFirst = true;
    if (s.cssSelector           === undefined) defaults.cssSelector           = '';
    if (s.enabled               === undefined) defaults.enabled               = true;
    if (Object.keys(defaults).length) storageAPI.local.set(defaults);
  });
});

// Listen for badge update requests from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'updateBadge') {
    actionAPI.setBadgeText({ text: msg.text || '' });
    actionAPI.setBadgeBackgroundColor({ color: msg.color || '#00897B' });
  }
});
