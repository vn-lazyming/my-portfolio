// Live ICT (UTC+7) clock — updates #clock every second
(function () {
  const el = document.getElementById('clock');
  if (!el) return;

  function tick() {
    const now = new Date();
    const h = ((now.getUTCHours() + 7) % 24 + 24) % 24;
    const m = now.getUTCMinutes();
    const s = now.getUTCSeconds();
    el.textContent =
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0') + ' ICT';
  }

  tick();
  setInterval(tick, 1000);
})();
