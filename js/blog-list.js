// Shared post-list renderer.
//
// Usage:
//   Blog.renderPostList({
//     manifest:    'blog/posts/manifest.json',  // path to manifest
//     listEl:      '#blogList',                 // container for posts
//     linkPrefix:  'blog/post.html?slug=',      // href prefix
//     limit:       3                            // posts shown before a "show more" toggle (optional)
//   });
//
// When posts.length > limit, a "show more" row is appended; clicking it
// reveals the rest in place (no page navigation).

window.Blog = (function () {

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderPostList(opts) {
    const list = document.querySelector(opts.listEl);
    if (!list) return;

    function makeRow(p) {
      const tags = (p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('');
      const a = document.createElement('a');
      a.className = 'item';
      a.href = opts.linkPrefix + encodeURIComponent(p.slug);
      a.innerHTML = `
        <div class="item-head">
          <h3>${escapeHtml(p.title)}</h3>
          <time datetime="${escapeHtml(p.date)}">${escapeHtml(p.date)}</time>
        </div>
        <p>${escapeHtml(p.description || '')}</p>
        ${tags ? `<div class="tags">${tags}</div>` : ''}`;
      return a;
    }

    fetch(opts.manifest, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(posts => {
        list.innerHTML = '';
        posts.sort((a, b) => b.date.localeCompare(a.date));

        const shown = opts.limit ? posts.slice(0, opts.limit) : posts;
        const rest  = opts.limit ? posts.slice(opts.limit) : [];

        shown.forEach(p => list.appendChild(makeRow(p)));

        if (rest.length) {
          const more = document.createElement('button');
          more.type = 'button';
          more.className = 'show-more';
          more.textContent = `Show ${rest.length} more`;
          more.addEventListener('click', () => {
            rest.forEach(p => list.insertBefore(makeRow(p), more));
            more.remove();
          });
          list.appendChild(more);
        }
      })
      .catch(() => { list.innerHTML = '<p class="muted">Couldn\'t load posts.</p>'; });
  }

  return { renderPostList, escapeHtml };
})();
