/**
 * background.js – Service worker for Salesforce Help Doc ZEN Mode.
 *
 * Sets default storage values when the extension is installed so the
 * content script always has a well-defined starting state.
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['zenModeEnabled'], (result) => {
    if (result.zenModeEnabled === undefined) {
      chrome.storage.sync.set({ zenModeEnabled: true });
    }
  });
});
