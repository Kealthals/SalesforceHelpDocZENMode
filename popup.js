/**
 * popup.js – Salesforce Help Doc ZEN Mode
 *
 * Reads and writes the `zenModeEnabled` key in chrome.storage.sync.
 * Updates the toggle checkbox and status badge to reflect the current state.
 */

const toggle = document.getElementById('zenToggle');
const badge  = document.getElementById('statusBadge');

/** Sync UI to a given boolean state. */
function applyState(enabled) {
  toggle.checked = enabled;

  if (enabled) {
    badge.textContent = 'On';
    badge.className   = 'status__badge status__badge--on';
  } else {
    badge.textContent = 'Off';
    badge.className   = 'status__badge status__badge--off';
  }
}

/* ── Initialise from storage ─────────────────────────────────── */
chrome.storage.sync.get(['zenModeEnabled'], (result) => {
  const enabled = result.zenModeEnabled !== false; // default ON
  applyState(enabled);
});

/* ── Persist change when user flips the toggle ───────────────── */
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ zenModeEnabled: enabled });
  applyState(enabled);
});
