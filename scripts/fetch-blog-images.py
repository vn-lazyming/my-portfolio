#!/usr/bin/env python3
"""
Downloads every remotely-hosted image referenced in blog/posts/*.md
(currently hackmd.io uploads) into a local per-post folder, then rewrites
the markdown to point at the local copy instead of the remote URL.

Usage:
    python3 scripts/fetch-blog-images.py [--dry-run]

Safe to re-run: already-downloaded images and already-local references are
skipped, so this can run every time you paste in a new note from HackMD.
"""

import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = REPO_ROOT / "blog" / "posts"
IMAGES_DIR = POSTS_DIR / "images"

# ![alt](https://host/path.ext) or ![alt](https://host/path.ext =300x) / =300x200
IMAGE_RE = re.compile(
    r'!\[(?P<alt>[^\]]*)\]\((?P<url>https?://\S+?)(?:\s+=(?P<w>\d+)x(?P<h>\d*))?\)'
)

USER_AGENT = "Mozilla/5.0 (compatible; blog-image-fetcher/1.0)"
MAX_ATTEMPTS = 5
RETRY_BACKOFF_SECONDS = 2  # doubles each attempt: 2s, 4s, 8s, 16s


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_err = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp, open(dest, "wb") as f:
                f.write(resp.read())
            return True
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
            last_err = e
            if attempt < MAX_ATTEMPTS:
                wait = RETRY_BACKOFF_SECONDS * (2 ** (attempt - 1))
                print(f"    ! attempt {attempt}/{MAX_ATTEMPTS} failed ({e}), retrying in {wait}s")
                time.sleep(wait)
    print(f"    ! failed to fetch {url} after {MAX_ATTEMPTS} attempts: {last_err}")
    return False


def process_post(md_path: Path, dry_run: bool) -> tuple[int, int, int]:
    slug = md_path.stem
    text = md_path.read_text(encoding="utf-8")

    matches = list(IMAGE_RE.finditer(text))
    if not matches:
        return (0, 0, 0)

    post_images_dir = IMAGES_DIR / slug
    downloaded = skipped = failed = 0
    url_to_local = {}
    replacements = []  # (span, new_text)

    for m in matches:
        url = m.group("url")

        if url not in url_to_local:
            filename = url.rsplit("/", 1)[-1] or "image"
            local_path = post_images_dir / filename
            rel_href = f"posts/images/{slug}/{filename}"  # relative to blog/post.html

            if local_path.exists():
                skipped += 1
            elif dry_run:
                print(f"    would fetch {url} -> {local_path.relative_to(REPO_ROOT)}")
                downloaded += 1
            else:
                post_images_dir.mkdir(parents=True, exist_ok=True)
                print(f"    fetching {url}")
                if download(url, local_path):
                    downloaded += 1
                else:
                    failed += 1
                    continue

            url_to_local[url] = rel_href

        rel_href = url_to_local.get(url)
        if rel_href is None:
            continue  # download failed, leave the original markdown untouched

        alt = m.group("alt")
        w, h = m.group("w"), m.group("h")
        if w:
            attrs = f'src="{rel_href}" alt="{alt}" width="{w}"'
            if h:
                attrs += f' height="{h}"'
            new_text = f"<img {attrs}>"
        else:
            new_text = f"![{alt}]({rel_href})"

        replacements.append((m.span(), new_text))

    if not replacements:
        return (downloaded, skipped, failed)

    # apply back-to-front so earlier spans stay valid
    for (start, end), new_text in sorted(replacements, key=lambda r: r[0][0], reverse=True):
        text = text[:start] + new_text + text[end:]

    if not dry_run:
        md_path.write_text(text, encoding="utf-8")

    return (downloaded, skipped, failed)


def main():
    dry_run = "--dry-run" in sys.argv

    if not POSTS_DIR.is_dir():
        print(f"no posts directory at {POSTS_DIR}")
        sys.exit(1)

    total_dl = total_skip = total_fail = 0
    for md_path in sorted(POSTS_DIR.glob("*.md")):
        print(f"[{md_path.name}]")
        dl, skip, fail = process_post(md_path, dry_run)
        if dl or skip or fail:
            print(f"    {dl} fetched, {skip} already local, {fail} failed")
        total_dl += dl
        total_skip += skip
        total_fail += fail

    verb = "would fetch" if dry_run else "fetched"
    print(f"\n{total_dl} {verb}, {total_skip} already local, {total_fail} failed")
    if total_fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
