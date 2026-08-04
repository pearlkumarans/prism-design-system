#!/usr/bin/env python3
"""Static file server with no-cache headers — so edited HTML/JS/CSS always
reload fresh (browsers cache ES modules aggressively otherwise).

Usage:  python3 serve.py [port]   (default 4599)
"""
import sys
import http.server
import socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4599


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"no-cache static server on http://localhost:{PORT}")
    httpd.serve_forever()
