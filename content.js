/**
 * content.js – plan-based style overrides only.
 */

const STYLE_ID = 'sfdc-zen-mode-styles';
const PAGE_SCRIPT_ID = 'sfdc-zen-mode-page-inject';
const ORIGINAL_STYLE_ATTR = 'data-sfdc-zen-orig-style';

const PLAN_STYLE_RULES = [
  {
    selector: 'div.ht-container',
    styles: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
    },
  },
  {
    selector:
      'div.ht-foot, div.contextnav__header, div.c360-nav-container, c-hc-article-top-bar, c-hc-alert-banner-wrapper, #embedded-messaging',
    styles: {
      display: 'none',
    },
  },
];

const STYLE_REMOVE_SELECTORS = ['div.article-viewer', 'div.toc-content-container'];

const ZEN_CSS = `
div.ht-container {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

div.ht-foot,
div.contextnav__header,
div.c360-nav-container,
div.c360-wrapper,
c-hc-article-top-bar,
c-hc-alert-banner-wrapper,
hgf-c360contextnav,
#embedded-messaging {
  display: none !important;
}

.globalnav-wrapper {
  display: none !important;
}
`;

let enforceRafId = null;
let styleObserver = null;

function collectOpenShadowRoots(startRoot = document) {
  const roots = [];
  const stack = [startRoot];

  while (stack.length > 0) {
    const root = stack.pop();
    if (!root || typeof root.querySelectorAll !== 'function') continue;

    root.querySelectorAll('*').forEach((element) => {
      if (element.shadowRoot) {
        roots.push(element.shadowRoot);
        stack.push(element.shadowRoot);
      }
    });
  }

  return roots;
}

function queryAllDeep(selector) {
  const results = [];
  if (typeof document.querySelectorAll === 'function') {
    results.push(...document.querySelectorAll(selector));
  }
  collectOpenShadowRoots(document).forEach((shadowRoot) => {
    results.push(...shadowRoot.querySelectorAll(selector));
  });
  return results;
}

function rememberOriginalStyle(element) {
  if (!element.hasAttribute(ORIGINAL_STYLE_ATTR)) {
    const originalStyle = element.getAttribute('style');
    element.setAttribute(ORIGINAL_STYLE_ATTR, originalStyle ?? '');
  }
}

function applyPlanStyles() {
  PLAN_STYLE_RULES.forEach(({ selector, styles }) => {
    queryAllDeep(selector).forEach((element) => {
      rememberOriginalStyle(element);
      Object.entries(styles).forEach(([property, value]) => {
        element.style.setProperty(property, value, 'important');
      });
    });
  });

  STYLE_REMOVE_SELECTORS.forEach((selector) => {
    queryAllDeep(selector).forEach((element) => {
      rememberOriginalStyle(element);
      element.removeAttribute('style');
    });
  });
}

function restorePlanStyles() {
  PLAN_STYLE_RULES.forEach(({ selector }) => {
    queryAllDeep(selector).forEach((element) => {
      if (!element.hasAttribute(ORIGINAL_STYLE_ATTR)) return;
      const originalStyle = element.getAttribute(ORIGINAL_STYLE_ATTR);
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }
      element.removeAttribute(ORIGINAL_STYLE_ATTR);
    });
  });

  STYLE_REMOVE_SELECTORS.forEach((selector) => {
    queryAllDeep(selector).forEach((element) => {
      if (!element.hasAttribute(ORIGINAL_STYLE_ATTR)) return;
      const originalStyle = element.getAttribute(ORIGINAL_STYLE_ATTR);
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }
      element.removeAttribute(ORIGINAL_STYLE_ATTR);
    });
  });
}

function schedulePlanStyleApply() {
  if (enforceRafId !== null) return;
  enforceRafId = requestAnimationFrame(() => {
    enforceRafId = null;
    applyPlanStyles();
  });
}

function startPlanStyleEnforcement() {
  applyPlanStyles();
  if (!styleObserver) {
    styleObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          schedulePlanStyleApply();
          break;
        }
      }
    });
    styleObserver.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  }
}

function stopPlanStyleEnforcement() {
  if (enforceRafId !== null) {
    cancelAnimationFrame(enforceRafId);
    enforceRafId = null;
  }
  if (styleObserver) {
    styleObserver.disconnect();
    styleObserver = null;
  }
  restorePlanStyles();
}

function injectPageScript() {
  if (document.getElementById(PAGE_SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.id = PAGE_SCRIPT_ID;
  script.src = chrome.runtime.getURL('page-inject.js');
  script.async = false;
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

/** Inject the ZEN mode <style> tag into <head>. */
function injectStyles() {
  console.log('Injecting ZEN mode styles');
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
  injectPageScript();
  injectStyles();
  startPlanStyleEnforcement();
}

/** Deactivate ZEN mode. */
function disableZenMode() {
  stopPlanStyleEnforcement();
  removeStyles();
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
