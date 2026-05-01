// Theme toggle: "day" (default) ↔ "night".
// Choice persists across pages within the same browser session, but resets
// to "day" when the tab is closed and reopened. (Uses sessionStorage.)
(function () {
  const KEY = 'lm_theme';
  const html = document.documentElement;

  // Always default to day; honor session-level choice if user toggled this session
  apply(sessionStorage.getItem(KEY) || 'day');

  function apply(theme) {
    const night = theme === 'night';
    if (night) html.setAttribute('data-theme', 'night');
    else html.removeAttribute('data-theme');

    // Toggle button + hint texts are handled by CSS via [data-when-day]/[data-when-night]

    // Swap highlight.js stylesheets if both are loaded
    document.querySelectorAll('link[data-theme-light]').forEach(l => l.disabled = night);
    document.querySelectorAll('link[data-theme-dark]').forEach(l => l.disabled = !night);
  }

  function toggle() {
    const next = html.getAttribute('data-theme') === 'night' ? 'day' : 'night';
    sessionStorage.setItem(KEY, next);
    apply(next);
  }

  // Wipe any stale localStorage entry from older versions
  try { localStorage.removeItem(KEY); } catch (e) {}

  document.addEventListener('click', e => {
    if (e.target.closest('[data-theme-toggle]')) toggle();
  });
})();
