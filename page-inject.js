(() => {
  if (window.__sfdcZenPageInjectInstalled) return;
  window.__sfdcZenPageInjectInstalled = true;

  const BLOCKED_EVENTS = new Set(['scroll', 'wheel', 'mousewheel', 'touchmove']);
  const INLINE_HANDLER_ATTRIBUTES = ['onscroll', 'onwheel', 'onmousewheel', 'ontouchmove'];

  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  const nativeSetAttribute = Element.prototype.setAttribute;

  function normalizeEventType(type) {
    return typeof type === 'string' ? type.toLowerCase() : '';
  }

  function shouldBlockEventType(type) {
    return BLOCKED_EVENTS.has(normalizeEventType(type));
  }

  function isInlineBlockedAttribute(name) {
    return INLINE_HANDLER_ATTRIBUTES.includes(String(name || '').toLowerCase());
  }

  function stripInlineHandlers(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    const selector = INLINE_HANDLER_ATTRIBUTES.map((name) => `[${name}]`).join(',');
    root.querySelectorAll(selector).forEach((node) => {
      INLINE_HANDLER_ATTRIBUTES.forEach((attrName) => {
        if (node.hasAttribute(attrName)) {
          node.removeAttribute(attrName);
        }
      });
    });
  }

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (shouldBlockEventType(type)) {
      return;
    }
    return nativeAddEventListener.call(this, type, listener, options);
  };

  Element.prototype.setAttribute = function (name, value) {
    if (isInlineBlockedAttribute(name)) {
      return;
    }
    return nativeSetAttribute.call(this, name, value);
  };

  // Clear inline handlers that may be present in server-rendered HTML.
  stripInlineHandlers(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && isInlineBlockedAttribute(mutation.attributeName)) {
        mutation.target.removeAttribute(mutation.attributeName);
        continue;
      }

      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          INLINE_HANDLER_ATTRIBUTES.forEach((attrName) => {
            if (node.hasAttribute(attrName)) {
              node.removeAttribute(attrName);
            }
          });
          stripInlineHandlers(node);
        });
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: INLINE_HANDLER_ATTRIBUTES,
  });
})();
