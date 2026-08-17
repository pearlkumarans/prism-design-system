#!/usr/bin/env node
/**
 * build-locale — populate a locale catalog from Endpoint Central's own resource
 * bundle, so shared product strings use the AUTHENTIC EC translation instead of a
 * machine draft.
 *
 *   node Layout/i18n/build-locale.mjs zh          # build locales/zh.json from zh_CN
 *   EC_BASE=http://ems-ds:8020/js/i18n node ...   # override the source
 *
 * How it works (value-match, since EC's keys ≠ ours):
 *   1. Read our keyset from locales/en.json  (ourKey → English).
 *   2. Fetch EC's en_US.js + <ec>.js in memory (never written to disk — they are
 *      ~1 MB proprietary product bundles; we keep only the slice we use).
 *   3. Reverse EC en: English → EC key. For each of OUR strings, find the EC key
 *      whose English matches, then take its translation from the target bundle.
 *   4. Merge over the existing locales/<code>.json: an EC-sourced string wins;
 *      otherwise keep our existing draft; anything with neither is reported missing.
 *   5. Write locales/<code>.json + locales/<code>.coverage.json (ec / draft / missing).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const EC_BASE = process.env.EC_BASE || 'http://ems-ds:8020/js/i18n';
const code = process.argv[2];
if (!code) { console.error('usage: build-locale.mjs <lang-code>   (e.g. zh)'); process.exit(1); }

const registry = JSON.parse(readFileSync(join(DIR, 'registry.json'), 'utf8'));
const lang = registry.find((l) => l.code === code);
if (!lang) { console.error(`Unknown language code: ${code}`); process.exit(1); }
if (!lang.ec) { console.error(`No EC bundle for ${code} (${lang.english}) — this locale has no product source; author it by hand.`); process.exit(1); }

const jsonPath = join(DIR, 'locales', `${code}.json`);
const our = JSON.parse(readFileSync(join(DIR, 'locales', 'en.json'), 'utf8'));
const existing = existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath, 'utf8')) : {};

/* Parse `var i18nJSON=({'k':'v',...})` → { k: v }. */
function parseBundle(text) {
  const map = Object.create(null);
  const re = /'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  const unesc = (s) => s.replace(/\\(['"\\/])/g, '$1').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  while ((m = re.exec(text))) map[unesc(m[1])] = unesc(m[2]);
  return map;
}
async function fetchBundle(ec) {
  const url = `${EC_BASE}/${ec}.js`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return parseBundle(await res.text());
}

const [ecEn, ecTgt] = await Promise.all([fetchBundle('en_US'), fetchBundle(lang.ec)]);
const norm = (s) => s.trim().toLowerCase().replace(/[.:：。\s]+$/g, '').replace(/\s+/g, ' ');
const enToKey = Object.create(null);   // exact English → EC key
const normToKey = Object.create(null); // normalized English → EC key (fallback)
for (const [k, v] of Object.entries(ecEn)) {
  if (!(v in enToKey)) enToKey[v] = k;
  const n = norm(v);
  if (!(n in normToKey)) normToKey[n] = k;
}
/* Resolve OUR English to an EC key: exact first, then normalized (trim / case /
   trailing punctuation) — the latter marked lower-confidence for review. */
function resolve(english) {
  if (enToKey[english] !== undefined) return { key: enToKey[english], exact: true };
  const k = normToKey[norm(english)];
  return k !== undefined ? { key: k, exact: false } : null;
}

const out = {};
const report = { locale: code, ec: lang.ec, fromEc: [], fromEcFuzzy: [], fromDraft: [], missing: [] };
for (const [key, english] of Object.entries(our)) {
  const hit = resolve(english);
  const ecVal = hit ? ecTgt[hit.key] : undefined;
  if (ecVal && ecVal !== english) {          // EC has a real (translated) string
    out[key] = ecVal;
    (hit.exact ? report.fromEc : report.fromEcFuzzy).push(key);
  } else if (existing[key]) {                 // keep our existing draft
    out[key] = existing[key]; report.fromDraft.push(key);
  } else {                                    // nothing available yet
    report.missing.push(key);
  }
}

writeFileSync(jsonPath, JSON.stringify(out, null, 2) + '\n');
writeFileSync(join(DIR, 'locales', `${code}.coverage.json`), JSON.stringify(report, null, 2) + '\n');
const total = Object.keys(our).length;
console.log(`[${code} ← ${lang.ec}]  ${report.fromEc.length}/${total} from EC · ${report.fromDraft.length} kept as draft · ${report.missing.length} missing (need translation)`);
if (report.missing.length) console.log('  missing:', report.missing.join(', '));
