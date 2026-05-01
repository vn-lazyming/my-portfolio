// Typewriter "intake form" intro overlay.
// Shows once per browser session. Press Esc/Enter or click outside to dismiss.
(function () {
  const overlay = document.getElementById('intro');
  const body    = document.getElementById('introBody');
  const closeBtn = document.getElementById('introClose');
  if (!overlay || !body) return;

  const FORM = `<div class="head">▸ DOSSIER · INTAKE FORM</div>
<div class="field"><span class="k">name</span>     <span class="v"><b>lazyming</b></span></div>
<div class="field"><span class="k">title</span>    <span class="v">Security Researcher</span></div>
<div class="field"><span class="k">org</span>      <span class="v">Viettel Cyber Security</span></div>
<div class="field"><span class="k">specialty</span><span class="v">linux kernel · pwn · rev</span></div>
<div class="field"><span class="k">hobbies</span>  <span class="v">badminton · ctf · get lazy · eating ice cream</span></div>
<div class="field"><span class="k">motto</span>    <span class="v"><b>"At least I tried. :D"</b></span></div>`;

  function typeInto(el, html, speed) {
    el.innerHTML = '';
    let i = 0, tagOpen = false, buf = '';
    function step() {
      if (i >= html.length) return;
      const ch = html[i++];
      buf += ch;
      if (ch === '<') tagOpen = true;
      else if (ch === '>') tagOpen = false;
      el.innerHTML = buf + (tagOpen ? '' : '<span class="cur"></span>');
      const delay = tagOpen ? 0 : (ch === ' ' ? speed * 0.4 : speed + Math.random() * speed);
      setTimeout(step, delay);
    }
    step();
  }

  function open() {
    overlay.classList.remove('hidden');
    typeInto(body, FORM, 6);
  }

  function close() {
    overlay.classList.add('hidden');
    try { sessionStorage.setItem('lm_intro_seen', '1'); } catch (e) {}
  }

  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (overlay.classList.contains('hidden')) return;
    if (e.key === 'Escape' || e.key === 'Enter') close();
  });

  // Show on first visit per session
  try {
    if (!sessionStorage.getItem('lm_intro_seen')) setTimeout(open, 250);
  } catch (e) {}
})();
