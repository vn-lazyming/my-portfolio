// Shared post-list renderer.
// Used by index.html (homepage blog section) and blog/index.html (full list).
//
// Usage:
//   Blog.renderPostList({
//     manifest:    'blog/posts/manifest.json',  // path to manifest
//     listEl:      '#blogList',                 // container for posts
//     countEl:     '#blogMeta',                 // count text element (optional)
//     linkPrefix:  'blog/post.html?slug=',      // href prefix
//     idPrefix:    'W',                         // entry ID prefix (e.g. "W.01")
//     limit:       5,                            // max posts (optional)
//     kind:        '[log]'                      // string OR (post) => string
//   });

window.Blog = (function () {

  function fmtDate(s) {
    return (s || '').replace(/-/g, '·');
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderPostList(opts) {
    const list  = document.querySelector(opts.listEl);
    const count = opts.countEl ? document.querySelector(opts.countEl) : null;
    if (!list) return;

    fetch(opts.manifest, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(posts => {
        const slice = opts.limit ? posts.slice(0, opts.limit) : posts;

        list.innerHTML = '';
        slice.forEach((p, i) => {
          const tags = (p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('');
          const kind = typeof opts.kind === 'function' ? opts.kind(p) : opts.kind;
          const a = document.createElement('a');
          a.className = 'proj';
          a.href = opts.linkPrefix + encodeURIComponent(p.slug);
          a.innerHTML = `
            <span class="id">${opts.idPrefix}.${String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>${escapeHtml(p.title)}</h3>
              <p>${escapeHtml(p.description || '')}</p>
              <div class="tags">${tags}</div>
            </div>
            <span class="arr">→</span>
            <span class="kind">${escapeHtml(kind)}</span>`;
          list.appendChild(a);
        });

        if (count) {
          count.textContent = `${posts.length} entr${posts.length === 1 ? 'y' : 'ies'}`;
        }
      })
      .catch(() => {
        if (count) count.textContent = 'no entries';
      });
  }

  return { renderPostList, fmtDate, escapeHtml };
})();
