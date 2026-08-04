#!/usr/bin/env python3
"""
Fast static server for the Prism design system.

Drop-in replacement for `python3 -m http.server` with two upgrades that make
page reloads noticeably faster:

  1. Cache-Control headers on static assets (.css / .js / .svg / fonts / images)
     so the 466 KB icons.svg + every component CSS file is served from the
     browser's disk cache after the first hit.
  2. ThreadingMixIn — parallel file fetches instead of one-at-a-time.

Run from anywhere — the script chdirs to the project root automatically so
paths like ../design-system-library/... in Layout/*.html resolve correctly:

    python3 Layout/serve.py            # default port 8000
    python3 Layout/serve.py 9000       # custom port
"""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# Always serve from the project root, regardless of where this script is
# invoked from. The script lives at <project>/Layout/serve.py — go one
# directory up so HTML refs like `../design-system-library/src/...` resolve.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(PROJECT_ROOT)

# Heavy, rarely-changing assets — cache aggressively. The icon sprite is
# 466 KB, fonts are even bigger; we don't want to re-fetch those each page.
HEAVY_CACHE_EXTS = (
    '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    '.mp4', '.webm',
)
# CSS / JS we edit constantly during design-system work. Use no-cache so the
# browser always revalidates — keeps the next page load FAST (304 if unchanged)
# but never serves stale CSS after we edit a component file. Without this,
# brand-new pages can render unstyled because the browser reuses an older
# cached components.css that doesn't yet have the new page's scoped rules.
EDITABLE_CACHE_EXTS = ('.css', '.js', '.mjs')

CACHE_MAX_AGE = 600  # seconds — applied only to HEAVY assets


class FastHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split('?', 1)[0].lower()
        if path.endswith(HEAVY_CACHE_EXTS):
            self.send_header('Cache-Control', f'public, max-age={CACHE_MAX_AGE}')
        elif path.endswith(EDITABLE_CACHE_EXTS):
            self.send_header('Cache-Control', 'no-cache')
        else:
            # HTML pages — don't cache; edits show immediately on refresh.
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    # Quiet down the default per-request log line; keep errors visible.
    def log_message(self, fmt, *args):
        if args and isinstance(args[1], str) and args[1].startswith('2'):
            return  # skip 200/206/etc.
        super().log_message(fmt, *args)


class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    with ThreadedServer(('', PORT), FastHandler) as httpd:
        print(f'Prism dev server — http://localhost:{PORT}/  '
              f'(cache {CACHE_MAX_AGE}s on assets, threaded)')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nstopped')
