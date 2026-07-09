// Reads ?slug= from URL, fetches the .md file, renders with marked.js,
// populates header from manifest, and lists "more posts".

(function () {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) { window.location.href = 'index.html'; return; }

  // Header from manifest
  fetch('posts/manifest.json')
    .then(r => r.json())
    .then(posts => {
      const meta = posts.find(p => p.slug === slug);
      if (!meta) return;

      document.title = `${meta.title} · lazyming`;
      setText('postDate',  fmtDate(meta.date));
      setText('postTitle', meta.title);

      // .post-dek:empty { display: none } in CSS handles missing description
      setText('postDek', meta.description || '');

      const tagsEl = document.getElementById('postTags');
      if (tagsEl) {
        tagsEl.innerHTML = (meta.tags || []).map(t => `<span>${esc(t)}</span>`).join('');
      }
    });

  // Body — fetch markdown, render with marked
  fetch(`posts/${slug}.md`)
    .then(r => { if (!r.ok) throw new Error('not found'); return r.text(); })
    .then(md => {
      const article = document.getElementById('postContent');
      if (!article) return;
      article.innerHTML = marked.parse(md);
      // Apply syntax highlighting if highlight.js is loaded
      if (window.hljs) {
        article.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
      }
    })
    .catch(() => {
      const article = document.getElementById('postContent');
      if (article) article.innerHTML = '<p class="muted">Entry not found.</p>';
    });

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function fmtDate(s) {
    return (s || '').replace(/-/g, '·');
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
