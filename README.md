# Salesforce Help Doc ZEN Mode

A Chrome extension that turns Salesforce documentation sites into a
distraction-free reading experience.

## Features

| Feature | Description |
|---|---|
| **Wider content column** | Hides the left navigation sidebar and expands the article to a comfortable reading width |
| **Better typography** | Increases font size to 16px, sets line-height to 1.75, and uses a clean system font stack |
| **Improved code blocks** | Adds a background, border, and monospace font to `<pre>` / `<code>` elements |
| **Removes distractions** | Hides cookie banners, chat/feedback widgets, marketing banners, and right-hand related-links panels |
| **Un-sticks elements** | Converts `position:sticky` / `position:fixed` headers and navbars to `static` so they don't obscure content while scrolling |
| **Free copy & selection** | Removes any page-level restrictions on right-click, text-selection, and clipboard copy |
| **On/Off toggle** | Click the extension icon to instantly enable or disable ZEN Mode without reloading the page |

## Supported Sites

- `help.salesforce.com`
- `developer.salesforce.com`
- `trailhead.salesforce.com`

## Installation

### Load as an unpacked extension (development)

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the repository folder.
5. Visit any page on `help.salesforce.com`, `developer.salesforce.com`, or `trailhead.salesforce.com`.

### Usage

Click the **ZEN Mode** extension icon in the Chrome toolbar.  
A popup appears with a toggle switch:

- **Toggle ON** – ZEN Mode is active; layout and style overrides are applied.
- **Toggle OFF** – The page is restored to its original appearance.

The setting is persisted in `chrome.storage.sync` so it survives browser restarts.

## Project Structure

```
manifest.json   – Chrome Extension Manifest V3
content.js      – Content script: CSS injection, event overrides, MutationObserver
popup.html      – Toggle switch UI
popup.js        – Popup logic (reads/writes chrome.storage.sync)
background.js   – Service worker: sets default storage value on install
icons/          – Extension icons (16×16, 48×48, 128×128 PNG)
```

## License

[MIT](LICENSE)
