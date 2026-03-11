/**
 * content.js – Salesforce Help Doc ZEN Mode
 *
 * Applies readability improvements to help.salesforce.com,
 * developer.salesforce.com, and trailhead.salesforce.com.
 *
 * What it does when ZEN mode is ON:
 *   - Injects a <style> tag with layout / typography overrides that widen the
 *     main content column, increase font size & line-height, remove sticky
 *     banners, hide decorative side-panels and cookie notices, and improve
 *     code-block contrast.
 *   - Prevents the page from blocking right-click, text-selection, and copy
 *     events so the user can freely copy documentation snippets.
 *   - Removes position:sticky from elements that obscure content while
 *     scrolling.
 *
 * The user can toggle ZEN mode on/off via the extension popup.  The content
 * script listens for storage changes and applies / removes the overrides in
 * real time without requiring a page reload.
 */

/* ─────────────────────────── helpers ─────────────────────────── */

const STYLE_ID = 'sfdc-zen-mode-styles';

/**
 * CSS injected into the page when ZEN mode is active.
 * Selectors are written defensively so they never break non-targeted pages.
 */
const ZEN_CSS = `
/* ── ZEN Mode – Salesforce Help Doc ─────────────────────────── */

/* ── 1. Hide distracting chrome ──────────────────────────────── */

/* Cookie / GDPR banners */
#onetrust-consent-sdk,
.ot-sdk-container,
[id*="cookie"],
[class*="cookie-banner"],
[class*="cookieBanner"],
[aria-label*="cookie" i],
.cookie-notice,
.gdpr-banner {
  display: none !important;
}

/* Floating feedback / chat widgets */
.embeddedServiceHelpButton,
.embeddedServiceSidebar,
#helpButtonDiv,
.feedbackButton,
[class*="chatButton"],
[class*="liveAgentButton"],
[id*="live-agent"],
[id*="liveagent"] {
  display: none !important;
}

/* "Was this helpful?" / rating bars */
.articleFeedbackContainer,
.helpfulArticle,
[class*="feedback"],
[class*="ratingWidget"],
.doc-feedback,
.article-feedback {
  display: none !important;
}

/* Promotional / marketing banners */
.promoBanner,
.promo-banner,
[class*="promoBanner"],
.announcement-bar,
[class*="announcementBar"],
.marketing-banner {
  display: none !important;
}

/* Right-hand "Related" sidebar (help.salesforce.com) */
.rightHandSidebar,
.relatedArticles,
[class*="relatedContent"],
.related-content,
aside[class*="related"],
.secondary-content {
  display: none !important;
}

/* ── 2. Un-stick sticky headers / navbars that eat vertical space ─ */

.stickyHeader,
[class*="stickyHeader"],
.sticky-header,
header.sticky,
.fixed-header,
nav.sticky,
[class*="stickyNav"],
.globalHeader,
.sfdc-header,
.uiHeader,
.bRight,               /* help.salesforce.com top nav right buttons */
.forceCommunityNavigationMenuContainer ~ .slds-col > nav {
  position: static !important;
  top: unset !important;
}

/* ── 3. Expand main content column ───────────────────────────── */

/* help.salesforce.com uses a left nav + main content grid layout */
.navColumn,
.leftNav,
.articleNavigation,
[class*="leftColumn"],
[class*="sideNav"],
aside.navigation,
.toc-sidebar,
.doc-sidebar {
  display: none !important;
}

/* Widen the article / main content area */
.articleContent,
.articleMain,
.mainContent,
.slds-col.slds-size_8-of-12,
.slds-col.slds-large-size_8-of-12,
.slds-col.slds-medium-size_8-of-12,
[class*="contentColumn"],
.doc-content,
.content-area,
.helpDocContent,
article.slds-col,
main article,
.developer-doc-content,
.docContent {
  max-width: 860px !important;
  width: 100% !important;
  margin: 0 auto !important;
  flex: unset !important;
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

/* Remove fixed max-width constraints on wrapper grids */
.slds-grid.slds-wrap,
.articleGrid,
.contentWrapper,
.page-content,
.content-wrapper {
  max-width: 1100px !important;
  margin: 0 auto !important;
  justify-content: center !important;
}

/* ── 4. Typography improvements ──────────────────────────────── */

body,
.articleContent,
.articleMain,
.helpDocContent,
.developer-doc-content,
.doc-content {
  font-size: 16px !important;
  line-height: 1.75 !important;
  color: #1a1a1a !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif !important;
  background-color: #fafafa !important;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600 !important;
  line-height: 1.35 !important;
  margin-top: 1.6em !important;
  margin-bottom: 0.5em !important;
  color: #032d60 !important;   /* Salesforce blue */
}

h1 { font-size: 2rem !important; }
h2 { font-size: 1.5rem !important; }
h3 { font-size: 1.25rem !important; }

/* Paragraphs & list items */
p, li {
  font-size: 16px !important;
  line-height: 1.75 !important;
  color: #1a1a1a !important;
}

/* Links */
a:not([class*="button"]):not([role="button"]) {
  color: #0070d2 !important;
  text-decoration: underline !important;
}

/* ── 5. Code blocks ──────────────────────────────────────────── */

pre, code {
  background-color: #f3f2f2 !important;
  border: 1px solid #dddbda !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
               Courier, monospace !important;
}

pre {
  padding: 1rem 1.25rem !important;
  overflow-x: auto !important;
  line-height: 1.5 !important;
  white-space: pre !important;
}

code {
  padding: 0.15em 0.4em !important;
}

pre code {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* ── 6. Tables ────────────────────────────────────────────────── */

table {
  border-collapse: collapse !important;
  width: 100% !important;
  font-size: 15px !important;
  margin: 1.2em 0 !important;
}

th {
  background-color: #f3f2f2 !important;
  color: #032d60 !important;
  padding: 0.6em 0.8em !important;
  text-align: left !important;
  border: 1px solid #dddbda !important;
  font-weight: 600 !important;
}

td {
  padding: 0.55em 0.8em !important;
  border: 1px solid #dddbda !important;
  vertical-align: top !important;
}

tr:nth-child(even) td {
  background-color: #f8f7f6 !important;
}

/* ── 7. Note / tip / warning callout boxes ────────────────────── */

.noteBox, .tipBox, .warningBox, .cautionBox,
[class*="callout"], [class*="note-box"], .note, .tip, .warning, .caution {
  border-left: 4px solid #0070d2 !important;
  background: #f0f7ff !important;
  padding: 0.75rem 1rem !important;
  border-radius: 0 4px 4px 0 !important;
  margin: 1rem 0 !important;
}

.warningBox, .cautionBox, [class*="warning"], [class*="caution"] {
  border-left-color: #fe9339 !important;
  background: #fff3e0 !important;
}

/* ── 8. Images – prevent overflow ────────────────────────────── */

img {
  max-width: 100% !important;
  height: auto !important;
}

/* ── 9. Reduce top padding taken by (now static) header ─────── */

body {
  padding-top: 0 !important;
}

.pageBody,
.slds-template__container,
#main-content,
[role="main"] {
  padding-top: 1rem !important;
}
`;

/* ─────────────────────────── ZEN mode engine ─────────────────── */

/**
 * Prevent the page from swallowing events that block the user from
 * selecting text, right-clicking, or copying content.
 * We listen in the capture phase so our handlers run before page scripts.
 */

/** Events whose page-side handlers we suppress while ZEN mode is active. */
const RESTRICTED_EVENTS = ['contextmenu', 'copy', 'cut', 'selectstart', 'dragstart'];

/** Shared capture-phase handler: lets the event propagate uninhibited. */
const allowEvent = (e) => e.stopImmediatePropagation();

/** Options object reused for every add/remove call. */
const EVENT_OPTS = { capture: true, passive: false };

/** Whether the restrictive-event listeners are currently installed. */
let restrictiveEventsOverridden = false;

function overrideRestrictiveEvents() {
  if (restrictiveEventsOverridden) return;
  RESTRICTED_EVENTS.forEach((type) =>
    document.addEventListener(type, allowEvent, EVENT_OPTS)
  );
  restrictiveEventsOverridden = true;
}

function restoreRestrictiveEvents() {
  if (!restrictiveEventsOverridden) return;
  RESTRICTED_EVENTS.forEach((type) =>
    document.removeEventListener(type, allowEvent, EVENT_OPTS)
  );
  restrictiveEventsOverridden = false;
}

/**
 * Candidate selectors for elements that are commonly sticky or fixed on
 * Salesforce documentation pages.  Keeping this list targeted avoids the
 * cost of querying every element in the DOM.
 */
const STICKY_CANDIDATES =
  'header, nav, aside, footer, [class*="header"], [class*="nav"], ' +
  '[class*="sticky"], [class*="fixed"], [class*="banner"], ' +
  '[class*="toolbar"], [class*="topbar"], [class*="floatBar"], ' +
  '[class*="floatingBar"], [id*="header"], [id*="nav"]';

/**
 * Convert any sticky or fixed elements matching STICKY_CANDIDATES to
 * `position:static`.  This is done with JS because CSS cannot select
 * elements by their *computed* position value.
 * Original inline `position` and `top` values are saved in `dataset` so
 * `restoreStuckElements()` can fully reverse the change when ZEN mode is
 * toggled off.
 */
function unstickElements() {
  document.querySelectorAll(STICKY_CANDIDATES).forEach((el) => {
    const pos = window.getComputedStyle(el).position;
    if (pos === 'sticky' || pos === '-webkit-sticky' || pos === 'fixed') {
      // Persist original inline values (empty string if not set) so we can
      // restore them precisely when ZEN mode is disabled.
      if (!el.dataset.zenOrigPosition) {
        el.dataset.zenOrigPosition = el.style.getPropertyValue('position') ?? '';
        el.dataset.zenOrigTop = el.style.getPropertyValue('top') ?? '';
      }
      el.style.setProperty('position', 'static', 'important');
      el.style.setProperty('top', 'unset', 'important');
    }
  });
}

/**
 * Reverse the inline style overrides applied by `unstickElements()`.
 * Restores the element's original inline `position` and `top` and removes
 * the tracking dataset attributes.
 */
function restoreStuckElements() {
  document.querySelectorAll(STICKY_CANDIDATES).forEach((el) => {
    if (!('zenOrigPosition' in el.dataset)) return;
    const origPosition = el.dataset.zenOrigPosition;
    const origTop = el.dataset.zenOrigTop;
    if (origPosition) {
      el.style.setProperty('position', origPosition);
    } else {
      el.style.removeProperty('position');
    }
    if (origTop) {
      el.style.setProperty('top', origTop);
    } else {
      el.style.removeProperty('top');
    }
    delete el.dataset.zenOrigPosition;
    delete el.dataset.zenOrigTop;
  });
}

/** Inject the ZEN mode <style> tag into <head>. */
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = ZEN_CSS;
  document.head.appendChild(style);
}

/** Remove the ZEN mode <style> tag from <head>. */
function removeStyles() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) existing.remove();
}

/** Activate ZEN mode. */
function enableZenMode() {
  injectStyles();
  overrideRestrictiveEvents();
  // Run on current DOM, then watch for dynamic content additions.
  unstickElements();
  observeDynamicContent();
}

/** Deactivate ZEN mode – fully reverts all behavioural changes. */
function disableZenMode() {
  removeStyles();
  restoreRestrictiveEvents();
  restoreStuckElements();
  stopObserver();
}

/* ─────────────────────── MutationObserver ────────────────────── */

let observer = null;

/**
 * rAF handle used to coalesce multiple rapid mutations into a single
 * `unstickElements()` call per animation frame.
 */
let unstickRafId = null;

/**
 * Watch for dynamically injected nodes (e.g. chat widgets, cookie banners
 * loaded asynchronously) and un-stick them as they arrive.
 * `unstickElements()` is throttled to at most once per animation frame so
 * that bursts of DOM mutations on SPA-like pages don't trigger repeated
 * expensive `querySelectorAll` + `getComputedStyle` passes.
 */
function observeDynamicContent() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    if (unstickRafId !== null) return; // already scheduled for this frame
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        unstickRafId = requestAnimationFrame(() => {
          unstickRafId = null;
          unstickElements();
        });
        break;
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function stopObserver() {
  if (unstickRafId !== null) {
    cancelAnimationFrame(unstickRafId);
    unstickRafId = null;
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

/* ────────────────────── storage & init ─────────────────────── */

/** Bootstrap: read stored preference and apply it. */
chrome.storage.sync.get(['zenModeEnabled'], (result) => {
  const enabled = result.zenModeEnabled !== false; // default ON
  if (enabled) {
    enableZenMode();
  }
});

/** React to toggle changes from the popup in real time. */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.zenModeEnabled) {
    if (changes.zenModeEnabled.newValue) {
      enableZenMode();
    } else {
      disableZenMode();
    }
  }
});
