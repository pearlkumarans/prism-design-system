/* =============================================================================
   Integration test — BitLocker resourceAvailable API.

   Hits the LIVE Endpoint Central backend the SAME way the app does: through the
   dev proxy (server/dev-proxy.mjs), which injects the session cookie + CSRF from
   server/.env (EMS_COOKIE / EMS_CSRF). This is the exact call behind
   PrismAPI.bitlocker.resourceAvailable() — GET /bitlocker/api/resourceAvailable.

   Run:  npm run test:api      (or: node --test server/test/)

   Requires a live session in server/.env. With no valid EMS_COOKIE the test
   SKIPS (never fails) — secrets aren't expected in CI.
   ============================================================================= */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROXY = path.resolve(HERE, '..', 'dev-proxy.mjs');
const ENV_FILE = path.resolve(HERE, '..', '.env');
const PORT = 8791;                                   // isolated test port
const BASE = `http://localhost:${PORT}`;
const VIEW = 'BitLockerManagedSystemReportView';
const ENDPOINT = `/proxy/bitlocker/api/resourceAvailable?viewName=${VIEW}`;

/* Do we have real credentials to hit the backend with? (env or a filled-in .env,
   not the xxxx placeholders from .env.example.) */
function hasCreds() {
  if (process.env.EMS_COOKIE && !/xxxx/.test(process.env.EMS_COOKIE)) return true;
  if (!existsSync(ENV_FILE)) return false;
  const m = readFileSync(ENV_FILE, 'utf8').match(/^\s*EMS_COOKIE\s*=\s*(.+)$/m);
  return !!(m && m[1].trim() && !/xxxx/.test(m[1]));
}
const SKIP = hasCreds() ? false : 'no live session — set EMS_COOKIE in server/.env';

function waitForPort(port, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = () => {
      const s = net.connect(port, '127.0.0.1');
      s.once('connect', () => { s.destroy(); resolve(); });
      s.once('error', () => {
        s.destroy();
        if (Date.now() > deadline) reject(new Error('proxy did not start on :' + port));
        else setTimeout(tick, 120);
      });
    };
    tick();
  });
}

let child;
before(async () => {
  if (SKIP) return;                                  // don't bother spawning if skipping
  // Spawn the real proxy on the test port; it loads server/.env for the creds.
  child = spawn(process.execPath, [PROXY], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  child.unref();                                     // don't let the child keep the runner alive
  await waitForPort(PORT);
});
after(() => { if (child) child.kill(); });

test('GET /bitlocker/api/resourceAvailable → 200 with a boolean resourceAvailable', { skip: SKIP }, async () => {
  const res = await fetch(BASE + ENDPOINT, {
    headers: { 'Accept': '*/*', 'X-Requested-With': 'XMLHttpRequest', 'Connection': 'close' },
    signal: AbortSignal.timeout(15000),              // never hang the suite
  });
  assert.equal(res.status, 200, `expected HTTP 200, got ${res.status}`);
  assert.match(res.headers.get('content-type') || '', /json/i, 'expected a JSON response');

  const body = await res.json();
  assert.ok('resourceAvailable' in body, 'response must contain resourceAvailable');
  assert.equal(typeof body.resourceAvailable, 'boolean', 'resourceAvailable must be a boolean');

  console.log(`  → live resourceAvailable = ${body.resourceAvailable} ` +
    `(${body.resourceAvailable ? 'show the table' : 'show the empty state'})`);
});

test('unauthenticated call (no proxy auth) is rejected — proves auth is really required', { skip: SKIP }, async () => {
  // Same path, but straight to the backend with NO cookies/CSRF → must NOT be 200-with-data.
  const target = new URL(process.env.EMS_TARGET || 'http://ems-ds:8020');
  const res = await fetch(target.origin + `/bitlocker/api/resourceAvailable?viewName=${VIEW}`, {
    headers: { 'Accept': '*/*', 'Connection': 'close' },
    signal: AbortSignal.timeout(15000),
  }).catch((e) => ({ ok: false, status: 0, _err: e.message }));
  assert.notEqual(res.status, 200, `expected a non-200 without auth, got ${res.status}`);
  console.log(`  → unauth call correctly rejected (status ${res.status})`);
});
