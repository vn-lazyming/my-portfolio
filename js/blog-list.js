// Renders the Writing list on index.html from blog/posts/manifest.json:
// newest first, the first LIMIT posts shown, the rest behind "Show n more".
(function () {
  const LIMIT = 3;
  const list = document.getElementById('blogList');

  function makeRow(p) {
    const tags = (p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('');
    const a = document.createElement('a');
    a.className = 'item';
    a.href = 'blog/post.html?slug=' + encodeURIComponent(p.slug);
    a.innerHTML = `
      <div class="item-head">
        <h3>${escapeHtml(p.title)}</h3>
        <time datetime="${escapeHtml(p.date)}">${escapeHtml(p.date)}</time>
      </div>
      ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ''}
      ${tags ? `<div class="tags">${tags}</div>` : ''}`;
    return a;
  }

  fetch('blog/posts/manifest.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(posts => {
      list.innerHTML = '';
      posts.sort((a, b) => b.date.localeCompare(a.date));
      posts.slice(0, LIMIT).forEach(p => list.appendChild(makeRow(p)));

      const rest = posts.slice(LIMIT);
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

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
