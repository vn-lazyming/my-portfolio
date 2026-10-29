// Theme toggle: "day" (default) ↔ "night". Loaded in <head> so the theme is
// set before first paint. The choice persists across pages within the same
// browser session, but resets to "day" when the tab is closed (sessionStorage).
(function () {
  const KEY = 'lm_theme';
  const html = document.documentElement;

  let saved = null;
  try { saved = sessionStorage.getItem(KEY); } catch (e) {}
  apply(saved || 'day');

  function apply(theme) {
    const night = theme === 'night';
    if (night) html.setAttribute('data-theme', 'night');
    else html.removeAttribute('data-theme');

    // Swap highlight.js stylesheets (post page only; they precede this script)
    document.querySelectorAll('link[data-theme-light]').forEach(l => l.disabled = night);
    document.querySelectorAll('link[data-theme-dark]').forEach(l => l.disabled = !night);
  }

  function toggle() {
    const next = html.getAttribute('data-theme') === 'night' ? 'day' : 'night';
    try { sessionStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-theme-toggle]')) toggle();
  });
})();
