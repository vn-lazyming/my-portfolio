/* ==========================================================================
   Tweaks Panel
   ========================================================================== */
const DEFAULTS = { accentHue: 0, density: 'spacious', texture: 'grid', fontPair: 'mono-serif' };

const root = document.documentElement;
const body = document.body;

function applyTweaks(t) {
  root.style.setProperty('--hue', String(t.accentHue));
  body.dataset.density  = t.density;
  body.dataset.texture  = t.texture;
  body.dataset.fontpair = t.fontPair;

  const hue  = document.getElementById('tpHue');
  const huev = document.getElementById('tpHueV');
  if (hue)  hue.value = t.accentHue;
  if (huev) huev.textContent = t.accentHue;

  document.querySelectorAll('#tweaks-panel .seg').forEach(seg => {
    const key = seg.dataset.key;
    seg.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', b.dataset.val === t[key]);
    });
  });
}

function setTweak(key, val) {
  DEFAULTS[key] = val;
  applyTweaks(DEFAULTS);
}

applyTweaks(DEFAULTS);

// Segmented controls
document.querySelectorAll('#tweaks-panel .seg').forEach(seg => {
  seg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) setTweak(seg.dataset.key, b.dataset.val);
  });
});

// Hue slider
const hueEl = document.getElementById('tpHue');
if (hueEl) {
  hueEl.addEventListener('input', () => {
    const v = parseInt(hueEl.value, 10);
    document.getElementById('tpHueV').textContent = v;
    root.style.setProperty('--hue', String(v));
  });
  hueEl.addEventListener('change', () => {
    setTweak('accentHue', parseInt(hueEl.value, 10));
  });
}

/* ==========================================================================
   Side Nav Scroll Spy
   ========================================================================== */
const navLinks = document.querySelectorAll('#sideNav a');
const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href')));
const curSec   = document.getElementById('curSection');

function onScroll() {
  const y = window.scrollY + window.innerHeight * 0.3;
  let active = sections[0];
  for (const s of sections) {
    if (s && s.offsetTop <= y) active = s;
  }
  if (!active) return;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active.id));
  if (curSec) curSec.textContent = '~/' + active.id;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ==========================================================================
   Intro Typewriter Overlay
   ========================================================================== */
const introEl    = document.getElementById('intro');
const introBody  = document.getElementById('introBody');
const introClose = document.getElementById('introClose');

const INTRO_HTML = `<span class="p">$</span> <span class="k">./whoami</span>
<span class="c">// booting identity...</span>

<span class="kw">const</span> <span class="k">baseInfo</span> = {
  <span class="k">name</span>:    <span class="s">'lazyming'</span>,
  <span class="k">title</span>:   <span class="s">'Security Researcher'</span>,
  <span class="k">hobbies</span>: <span class="s">'linux kernel researcher - hardware hacking - windows os researcher'</span>,
  <span class="k">motto</span>:   <span class="s">'At least I tried. :D'</span>
};

<span class="p">$</span> <span class="k">_</span><span class="cur"></span>`;

function typeInto(el, html, speed, done) {
  el.innerHTML = '';
  let i = 0, tagOpen = false, buf = '';

  function step() {
    if (i >= html.length) { if (done) done(); return; }
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

function openIntro() {
  introEl.classList.remove('hidden');
  typeInto(introBody, INTRO_HTML, 7);
}

function closeIntro() {
  introEl.classList.add('hidden');
  try { sessionStorage.setItem('lm_intro_seen', '1'); } catch (e) {}
}

if (introClose) introClose.addEventListener('click', closeIntro);
if (introEl) {
  introEl.addEventListener('click', e => { if (e.target === introEl) closeIntro(); });
}

try {
  if (!sessionStorage.getItem('lm_intro_seen')) setTimeout(openIntro, 250);
} catch (e) {}

/* ==========================================================================
   Keyboard Shortcuts
   ========================================================================== */
document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea')) return;

  const introVisible = introEl && !introEl.classList.contains('hidden');

  if (introVisible) {
    if (e.key === 'Escape' || e.key === 'Enter') closeIntro();
    return;
  }

  if (e.key === 'j')   window.scrollBy({ top:  120, behavior: 'smooth' });
  else if (e.key === 'k')   window.scrollBy({ top: -120, behavior: 'smooth' });
  else if (e.key === 'g')   window.scrollTo({ top: 0, behavior: 'smooth' });
  else if (e.key === 'G')   window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  else if (e.key === '?')   openIntro();
  else if (e.key === ';' || e.key === ':') document.getElementById('tweaks-panel')?.classList.add('on');
  else if (e.key === 'Escape') document.getElementById('tweaks-panel')?.classList.remove('on');
});

/* ==========================================================================
   Blog Posts Loader
   ========================================================================== */
function fmtDate(s) {
  try {
    const d = new Date(s);
    return isNaN(d) ? s : d.toISOString().slice(0, 10);
  } catch (e) { return s; }
}

function renderBlogPosts(posts) {
  const list    = document.getElementById('blogList');
  const countEl = document.getElementById('blogCount');
  if (!list) return;

  list.innerHTML = '';

  posts.slice(0, 5).forEach((p, i) => {
    const tags = (p.tags || []).map(t => `<span>${t}</span>`).join('');
    const row  = document.createElement('a');
    row.className = 'proj';
    row.href = `blog/post.html?slug=${encodeURIComponent(p.slug)}`;
    row.innerHTML = `
      <div class="idx">P.${String(i + 1).padStart(2, '0')}</div>
      <div class="body">
        <h3>${p.title}</h3>
        <p>${p.description || ''}</p>
        <div class="tags">${tags}</div>
      </div>
      <div class="meta">
        <span class="lang">${fmtDate(p.date)}</span>
        <span class="arr">→</span>
      </div>`;
    list.appendChild(row);
  });

  if (countEl) countEl.textContent = `${posts.length} post${posts.length === 1 ? '' : 's'}`;
}

fetch('blog/posts/manifest.json', { cache: 'no-store' })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(posts => {
    if (Array.isArray(posts) && posts.length) renderBlogPosts(posts);
  })
  .catch(() => {
    const countEl = document.getElementById('blogCount');
    if (countEl) countEl.textContent = '0 posts';
  });
