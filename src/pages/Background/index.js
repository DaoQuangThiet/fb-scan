import rules from './rules';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('isOpenBrowser', (result) => {
    if (!result['isOpenBrowser']) {
      chrome.storage.sync.set({ isOpenBrowser: true });
    } else {
      chrome.storage.sync.set({ isOpenBrowser: false }, () => {
        chrome.runtime.reload();
      });
    }
  });

  chrome.storage.local.set({ expandMode: true });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'NewTab.html',
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === 'CHANGE_EXPAND_MODE') {
    if (!message.payload) {
      chrome.action.setPopup({ popup: '' }).then(() => {});
    } else {
      chrome.action.setPopup({ popup: 'popup.html' }).then(() => {});
    }
  }

  return true;
});

chrome.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: rules.map((rule) => rule.id), // remove existing rules
  addRules: rules,
});
