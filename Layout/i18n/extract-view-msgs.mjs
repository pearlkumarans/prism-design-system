#!/usr/bin/env node
/**
 * extract-view-msgs — pull the inline `MSGS.en` dictionaries out of the drawer
 * views and merge them into locales/en.json (the central keyset). Non-destructive:
 * existing keys are kept. Run before build-locale.mjs so the EC extractor + drafts
 * cover the drawers too.
 *
 *   node Layout/i18n/extract-view-msgs.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, '..', '..');
const VIEWS = ['accessibility', 'help', 'settings', 'updates', 'zia', 'support', 'command-palette']
  .map((n) => join(REPO, 'Layout/views', `${n}.html`));

// Grab the `en: { … }` object literal out of a file's MSGS block by brace-matching,
// then eval it (trusted, first-party data — single-quoted JS, not JSON).
function extractEn(text) {
  const start = text.search(/\ben\s*:\s*\{/);
  if (start < 0) return null;
  let i = text.indexOf('{', start);
  let depth = 0, inStr = null, esc = false;
  for (let j = i; j < text.length; j++) {
    const c = text[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
    } else if (c === "'" || c === '"' || c === '`') inStr = c;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { const body = text.slice(i, j + 1); try { return Function(`"use strict";return (${body});`)(); } catch (_) { return null; } } }
  }
  return null;
}

const enPath = join(DIR, 'locales', 'en.json');
const en = JSON.parse(readFileSync(enPath, 'utf8'));
let added = 0;
const perView = {};
for (const file of VIEWS) {
  let txt;
  try { txt = readFileSync(file, 'utf8'); } catch (_) { continue; }
  const dict = extractEn(txt);
  if (!dict) { perView[file] = 'no MSGS.en found'; continue; }
  let n = 0;
  for (const [k, v] of Object.entries(dict)) {
    if (typeof v !== 'string') continue;
    if (en[k] == null) { en[k] = v; added++; n++; }
  }
  perView[file.split('/').pop()] = `${Object.keys(dict).length} keys (${n} new)`;
}

const sorted = Object.fromEntries(Object.keys(en).sort().map((k) => [k, en[k]]));
writeFileSync(enPath, JSON.stringify(sorted, null, 2) + '\n');
console.log(`en.json: +${added} keys → ${Object.keys(sorted).length} total`);
for (const [v, s] of Object.entries(perView)) console.log(`  ${v}: ${s}`);
