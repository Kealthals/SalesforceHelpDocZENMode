# Salesforce Help Doc ZEN Mode

A Chrome extension that improves readability for Salesforce Help article pages.

## Features

| Feature | Description |
|---|---|
| **Layout cleanup** | Hides navigation and banner-style containers used around article pages |
| **Viewport layout sizing** | Forces main content container sizing for full-page reading |
| **Inline style neutralization** | Removes inline `style` from `div.article-viewer` and `div.toc-content-container` |
| **Scroll override prevention** | Blocks scroll-related page event handlers that re-apply layout overrides |
| **Dynamic enforcement** | Uses a `MutationObserver` to keep style overrides applied during page updates |
| **On/Off toggle** | Click the extension icon to instantly enable or disable ZEN Mode without reloading the page |

## Supported Sites

- `https://help.salesforce.com/s/articleView*`

## Installation

### Load as an unpacked extension (development)

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the repository folder.
5. Visit a page matching `https://help.salesforce.com/s/articleView*`.

### Usage

Click the **ZEN Mode** extension icon in the Chrome toolbar.  
A popup appears with a toggle switch:

- **Toggle ON** – ZEN Mode is active; layout and style overrides are applied.
- **Toggle OFF** – The page is restored to its original appearance.

The setting is persisted in `chrome.storage.sync` so it survives browser restarts.

## Project Structure

```
manifest.json   – Chrome Extension Manifest V3
content.js      – Content script: layout style overrides and deep-query enforcement
page-inject.js  – Page-context script: blocks scroll-related handlers and inline event attributes
popup.html      – Toggle switch UI
popup.js        – Popup logic (reads/writes chrome.storage.sync)
background.js   – Service worker: sets default storage value on install
icons/          – Extension icons (16×16, 48×48, 128×128 PNG)
```

## License

[Apache License 2.0](LICENSE)
