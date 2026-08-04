/* =============================================================================
   dev-proxy.mjs — zero-dependency dev server + API proxy.

   Serves the static app AND forwards every request under /proxy/* to the backend,
   so the browser only ever talks to THIS origin: no CORS, no cross-origin cert
   prompt, no mixed-content. The front-end (Layout/data/prism-api.js) is configured
   with proxyPrefix '/proxy', so PrismAPI calls land here and get forwarded.

   Run (from the repo root):
     node server/dev-proxy.mjs
   Then open:  http://localhost:8090/Layout/Shell.html?view=list-view

   Options (env vars):
     PORT=8090                       port this server listens on
     EMS_TARGET=http://ems-ds:8020   backend the /proxy/* prefix forwards to
     PROXY_PREFIX=/proxy             path prefix that gets proxied
   e.g.  EMS_TARGET=http://ems-ds:8020 PORT=8090 node server/dev-proxy.mjs
   ============================================================================= */
import http from 'node:http';
import https from 'node:https';
import { createReadStream, promises as fsp } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // repo root
const PORT = Number(process.env.PORT || 8090);
const TARGET = new URL(process.env.EMS_TARGET || 'http://ems-ds:8020');
const PREFIX = process.env.PROXY_PREFIX || '/proxy';
const AGENT = TARGET.protocol === 'https:' ? https : http;
/* Internal EC servers usually run a self-signed cert — don't reject it (dev only). */
const TLS = TARGET.protocol === 'https:' ? { rejectUnauthorized: false } : {};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.map': 'application/json', '.webp': 'image/webp',
};

/* ── API proxy ────────────────────────────────────────────────────────────── */
function proxy(req, res) {
  const rest = req.url.slice(PREFIX.length) || '/';          // strip /proxy → real backend path
  const headers = { ...req.headers, host: TARGET.host };      // rewrite Host for the backend
  delete headers['accept-encoding'];                          // avoid re-encoding surprises
  const opts = {
    protocol: TARGET.protocol, hostname: TARGET.hostname,
    port: TARGET.port || (TARGET.protocol === 'https:' ? 443 : 80),
    method: req.method, path: rest, headers, ...TLS,
  };
  const up = AGENT.request(opts, (upRes) => {
    res.writeHead(upRes.statusCode || 502, upRes.headers);
    upRes.pipe(res);
  });
  up.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'proxy_failed', target: TARGET.origin + rest, message: err.message }));
    console.error(`  ✗ proxy ${req.method} ${req.url} → ${TARGET.origin}${rest}  (${err.message})`);
  });
  req.pipe(up);
}

/* ── Static files ─────────────────────────────────────────────────────────── */
async function serveStatic(req, res) {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel === '/') rel = '/index.html';
  const abs = path.join(ROOT, path.normalize(rel));
  if (!abs.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); } // no traversal
  try {
    const st = await fsp.stat(abs);
    if (st.isDirectory()) { res.writeHead(302, { Location: rel.replace(/\/?$/, '/') + 'index.html' }); return res.end(); }
    res.writeHead(200, { 'content-type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache' });
    createReadStream(abs).pipe(res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + rel);
  }
}

http.createServer((req, res) => {
  if (req.url === PREFIX || req.url.startsWith(PREFIX + '/')) return proxy(req, res);
  return serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`\n  Prism dev proxy`);
  console.log(`  ├─ serving   ${ROOT}`);
  console.log(`  ├─ ${PREFIX}/*  →  ${TARGET.origin}/*`);
  console.log(`  └─ open       http://localhost:${PORT}/Layout/Shell.html?view=list-view\n`);
});
