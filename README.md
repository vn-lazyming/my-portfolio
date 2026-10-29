# my-portfolio

Personal site of lazyming, a vulnerability researcher: https://vn-lazyming.github.io/my-portfolio/

Plain HTML/CSS/JS with no build step, served by GitHub Pages from `main`.

## Run locally

    python3 -m http.server 8000   # then open http://localhost:8000/

Posts are loaded with `fetch()`, so opening the files over `file://` does not work.

## Add a post

1. Put the markdown in `blog/posts/<slug>.md` (slug: letters, digits, `-`, `_`). Its leading `# Title` line is dropped on render.
2. Add `{ "slug", "title", "date": "YYYY-MM-DD", "description", "tags": [] }` to `blog/posts/manifest.json`.
3. If it was pasted from HackMD, run `python3 scripts/fetch-blog-images.py` to download its images into `blog/posts/images/<slug>/` and rewrite the links.
