// Reads ?slug= from URL, fetches the .md file, renders with marked.js,
// populates header from manifest, and builds the table of contents.

(function () {
  const slug = new URLSearchParams(location.search).get('slug');
  // Slugs are plain file names; anything else could fetch an unrelated .md.
  if (!slug || !/^[\w-]+$/.test(slug)) { location.replace('../'); return; }
  const article = document.getElementById('postContent');

  // Header from manifest
  fetch('posts/manifest.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .catch(() => [])
    .then(posts => {
      const meta = posts.find(p => p.slug === slug);
      if (!meta) { setText('postTitle', slug); return; }

      document.title = `${meta.title} · lazyming`;
      document.querySelector('meta[name=description]').content = meta.description || meta.title;
      setText('postDate', meta.date);
      document.getElementById('postDate').setAttribute('datetime', meta.date);
      setText('postTitle', meta.title);
      // .post-dek:empty { display: none } in CSS handles missing description
      setText('postDek', meta.description || '');
      document.getElementById('postTags').innerHTML =
        (meta.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('');
    });

  // Body — fetch markdown, render with marked
  fetch(`posts/${slug}.md`)
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(md => {
      article.innerHTML = marked.parse(md);
      // Drop the leading "# Title" (the page header already shows it), then
      // demote headings if the post uses # for sections, so h1 never appears in the body.
      if (article.firstElementChild?.tagName === 'H1') article.firstElementChild.remove();
      if (article.querySelector('h1')) {
        article.querySelectorAll('h1,h2,h3,h4,h5').forEach(h => {
          const n = document.createElement('h' + (+h.tagName[1] + 1));
          n.innerHTML = h.innerHTML;
          h.replaceWith(n);
        });
      }
      // Highlighting is optional: the post still reads fine if highlight.js failed to load.
      if (window.hljs) {
        article.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
      }
      buildToc();
      jumpToHash();
    })
    .catch(() => { article.innerHTML = '<p class="muted">Couldn\'t load this post.</p>'; });

  // Heading ids only exist after render, so the browser's own jump to #hash has already
  // missed. Jump now, and again once images above the target have loaded and shifted it
  // down, unless the reader has started scrolling by then.
  function jumpToHash() {
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (!target) return;
    let moved = false;
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(type =>
      addEventListener(type, () => { moved = true; }, { once: true, passive: true }));
    const jump = () => target.scrollIntoView({ behavior: 'instant' });
    jump();
    Promise.all([...article.querySelectorAll('img')].map(img => img.decode().catch(() => {})))
      .then(() => { if (!moved) jump(); });
  }

  // "Contents" list in the sticky aside (CSS shows it ≥1024px only), built from
  // h2/h3, with the section being read marked aria-current.
  function buildToc() {
    const heads = [...article.querySelectorAll('h2, h3')];
    const used = new Set();
    heads.forEach((h, i) => {
      let id = h.textContent.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '') || `section-${i + 1}`;
      while (used.has(id)) id += '-' + i;
      used.add(id);
      h.id = id;
    });
    if (heads.length < 2) return;

    const toc = document.createElement('nav');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'Contents');
    // Not a heading: the aside precedes the post's h1, and the nav label already names it.
    toc.innerHTML = '<p class="toc-label" aria-hidden="true">Contents</p><ol>' + heads.map(h =>
      `<li class="toc-${h.tagName.toLowerCase()}"><a href="#${h.id}">${escapeHtml(h.textContent)}</a></li>`).join('') + '</ol>';
    document.querySelector('.post-aside').append(toc);

    const links = new Map([...toc.querySelectorAll('a')].map(a => [a.hash.slice(1), a]));
    let current, ticking = false;
    // Active section = last heading scrolled to the top (the last one at page end,
    // since short final sections never get there). A scroll listener (not
    // IntersectionObserver) so big jumps past several headings still update.
    const update = () => {
      ticking = false;
      const line = 48; // just past the headings' scroll-margin-top (24px)
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      const h = atEnd ? heads.at(-1) : heads.filter(h => h.getBoundingClientRect().top < line).pop() || heads[0];
      current?.removeAttribute('aria-current');
      current = links.get(h.id);
      current.setAttribute('aria-current', 'location');
      // Long lists scroll inside the aside: keep the active entry visible (no-op while hidden).
      const a = current.getBoundingClientRect(), box = toc.getBoundingClientRect();
      if (a.top < box.top || a.bottom > box.bottom) toc.scrollTop += a.top - box.top - box.height / 2;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function setText(id, val) {
    document.getElementById(id).textContent = val;
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
