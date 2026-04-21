// Reads ?slug=xxx, fetches the .md file, renders it with marked.js,
// and populates the post header from manifest.json.

(function () {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');

  if (!slug) { window.location.href = 'index.html'; return; }

  // Populate post header from manifest
  fetch('posts/manifest.json')
    .then(r => r.json())
    .then(posts => {
      const meta = posts.find(p => p.slug === slug);
      if (!meta) return;

      document.title = `${meta.title} · lazyming`;

      const dateEl = document.getElementById('postDate');
      const tagsEl = document.getElementById('postTags');
      const titleEl = document.getElementById('postTitle');
      const dekEl  = document.getElementById('postDek');

      if (dateEl)  dateEl.textContent = meta.date.replace(/-/g, ' · ');
      if (tagsEl)  tagsEl.innerHTML = (meta.tags || []).map(t => `<span>${t}</span>`).join('');
      if (titleEl) titleEl.textContent = meta.title;
      if (dekEl && meta.description) dekEl.textContent = meta.description;

      // Populate "more posts" with up to 2 other posts
      const others = posts.filter(p => p.slug !== slug).slice(0, 2);
      const moreList = document.getElementById('moreList');
      if (moreList) {
        moreList.innerHTML = others.map(p => `
          <a href="post.html?slug=${encodeURIComponent(p.slug)}">
            <span class="d">${p.date.replace(/-/g, ' · ')} · ${(p.tags || []).join(' · ')}</span>
            <span class="t">${p.title} →</span>
          </a>`).join('');
      }
    });

  // Fetch and render the markdown file
  fetch(`posts/${slug}.md`)
    .then(r => {
      if (!r.ok) throw new Error('not found');
      return r.text();
    })
    .then(md => {
      const articleEl = document.getElementById('postContent');
      if (articleEl) articleEl.innerHTML = marked.parse(md);
    })
    .catch(() => {
      const articleEl = document.getElementById('postContent');
      if (articleEl) articleEl.innerHTML = '<p style="color:var(--fg-fade)">Post not found.</p>';
    });
})();
