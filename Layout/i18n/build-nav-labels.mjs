#!/usr/bin/env node
/**
 * build-nav-labels — the nav (ec-menus.js) has hundreds of item labels; keying
 * each by hand is infeasible, and the labels ARE natural keys (short product
 * terms). So this extracts every unique English `label:` from ec-menus.js and
 * sources its translation from Endpoint Central's own bundle, producing a
 * LABEL-keyed catalog: Layout/i18n/locales/nav.<code>.json = { "<English>": "<tr>" }.
 *
 *   node Layout/i18n/build-nav-labels.mjs zh
 *
 * The runtime (i18n.js) loads this into window.UEMSNavLabels[code]; ec-menus's
 * _locLabel() resolves each item's English label through it (English fallback).
 * Only the slice ec-menus actually uses is written — the 1 MB EC bundle stays out.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, '..', '..');
const EC_BASE = process.env.EC_BASE || 'http://ems-ds:8020/js/i18n';
const code = process.argv[2];
if (!code) { console.error('usage: build-nav-labels.mjs <lang-code>'); process.exit(1); }

const registry = JSON.parse(readFileSync(join(DIR, 'registry.json'), 'utf8'));
const lang = registry.find((l) => l.code === code);
if (!lang || !lang.ec) { console.error(`No EC bundle for ${code}.`); process.exit(1); }

// Every unique English label rendered by the label-lookup surfaces: the nav
// (ec-menus `label: '…'`) and the profile drawer (`tr('…')`). One shared catalog.
const SOURCES = [
  { file: 'design-system-library/src/data/ec-menus.js', re: /\blabel:\s*'((?:[^'\\]|\\.)*)'/g },
  { file: 'Layout/views/profile.html', re: /\btr\('((?:[^'\\]|\\.)*)'\)/g },
];
const labels = new Set();
for (const s of SOURCES) {
  const txt = readFileSync(join(REPO, s.file), 'utf8');
  for (const m of txt.matchAll(s.re)) labels.add(m[1].replace(/\\'/g, "'"));
}

function parseBundle(text) {
  const map = Object.create(null);
  const re = /'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g;
  const u = (s) => s.replace(/\\(['"\\/])/g, '$1').replace(/\\n/g, '\n');
  let m;
  while ((m = re.exec(text))) map[u(m[1])] = u(m[2]);
  return map;
}
async function fetchBundle(ec) {
  const r = await fetch(`${EC_BASE}/${ec}.js`);
  if (!r.ok) throw new Error(`${ec}.js → HTTP ${r.status}`);
  return parseBundle(await r.text());
}

const [ecEn, ecTgt] = await Promise.all([fetchBundle('en_US'), fetchBundle(lang.ec)]);
const norm = (s) => s.trim().toLowerCase().replace(/[.:：。\s]+$/g, '').replace(/\s+/g, ' ');
const exact = Object.create(null);
const fuzzy = Object.create(null);
for (const [k, v] of Object.entries(ecEn)) {
  if (!(v in exact)) exact[v] = k;
  const n = norm(v);
  if (!(n in fuzzy)) fuzzy[n] = k;
}

const out = {};
const report = { locale: code, ec: lang.ec, total: labels.size, fromEc: [], fromEcFuzzy: [], missing: [] };
for (const label of [...labels].sort()) {
  let key = exact[label];
  let isFuzzy = false;
  if (key === undefined) { key = fuzzy[norm(label)]; isFuzzy = true; }
  const val = key !== undefined ? ecTgt[key] : undefined;
  if (val && val !== label) {
    out[label] = val;
    (isFuzzy ? report.fromEcFuzzy : report.fromEc).push(label);
  } else {
    report.missing.push(label);
  }
}

writeFileSync(join(DIR, 'locales', `nav.${code}.json`), JSON.stringify(out, null, 2) + '\n');
writeFileSync(join(DIR, 'locales', `nav.${code}.coverage.json`), JSON.stringify(report, null, 2) + '\n');
console.log(`[nav ${code} ← ${lang.ec}]  ${labels.size} unique labels · ${report.fromEc.length} EC exact · ${report.fromEcFuzzy.length} EC fuzzy · ${report.missing.length} missing`);
