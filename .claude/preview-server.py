#!/usr/bin/env python3
"""Static file server for previewing the Prism shell — with caching DISABLED.

Plain `python -m http.server` lets the browser cache component ES modules and CSS
per origin, so after editing a shared ds-* component the old file keeps serving and
a change appears to "not take" — which previously forced spinning up a fresh port
each time. This server sends `Cache-Control: no-store` on every response, so a single
fixed port always serves the latest files. Reload and you see the change.

Usage: python3 .claude/preview-server.py [port]   (default 8890, serves the repo root)
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8890


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


class Server(socketserver.TCPServer):
    allow_reuse_address = True


with Server(('', PORT), NoCacheHandler) as httpd:
    print(f'preview server (no-cache) on http://localhost:{PORT}/')
    httpd.serve_forever()
