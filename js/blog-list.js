// Shared post-list renderer.
//
// Usage:
//   Blog.renderPostList({
//     manifest:    'blog/posts/manifest.json',  // path to manifest
//     listEl:      '#blogList',                 // container for posts
//     countEl:     '#blogMeta',                 // count text element (optional)
//     linkPrefix:  'blog/post.html?slug=',      // href prefix
//     idPrefix:    'W',                         // entry ID prefix (e.g. "W.01")
//     limit:       3,                            // posts shown before a "show more" toggle (optional)
//     kind:        '[log]'                      // string OR (post) => string
//   });
//
// When posts.length > limit, a "show more" row is appended; clicking it
// reveals the rest in place (no page navigation).

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

    function makeRow(p, i) {
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
        ${kind ? `<span class="kind">${escapeHtml(kind)}</span>` : ''}`;
      return a;
    }

    fetch(opts.manifest, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(posts => {
        list.innerHTML = '';

        const shown = opts.limit ? posts.slice(0, opts.limit) : posts;
        const rest  = opts.limit ? posts.slice(opts.limit) : [];

        shown.forEach((p, i) => list.appendChild(makeRow(p, i)));

        if (rest.length) {
          const more = document.createElement('button');
          more.type = 'button';
          more.className = 'show-more';
          more.textContent = `show ${rest.length} more →`;
          more.addEventListener('click', () => {
            rest.forEach((p, i) => list.insertBefore(makeRow(p, shown.length + i), more));
            more.remove();
          });
          list.appendChild(more);
        }

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
