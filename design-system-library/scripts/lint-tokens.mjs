#!/usr/bin/env node
/* Token lint — enforces the CLAUDE.md rule "no hardcoded values where a token
   exists" for component CSS.

   A VIOLATION is a hardcoded color — a hex OR a raw rgb()/rgba()/hsl()/hsla()
   with numeric channels — used in a color-role or shadow declaration
   (color / background / border* / outline / fill / stroke / box-shadow /
   text-shadow …) that is NOT routed through a design token. ALLOWED (not flagged):
     - hexes/rgba inside CSS comments    (they only document a token value)
     - var(--token, <fallback>)          token-first, the literal is a defensive default
     - rgba(var(--uems-shadow-rgb) / α)  token channel + per-component alpha
     - gradients, url()                  (legitimate one-offs live here)

   Usage:  node scripts/lint-tokens.mjs [dir]      (default: src/components)
   Exit 1 with a report if any violation is found; 0 otherwise. */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';

/* Control-size lock: within the interactive-control components, a raw px
   height / min-height / line-height at a control-scale step must go through the
   control-size tokens (spec: control-size-tokens). Allowed: var(), and a
   `lint-ok` marker on the line for a genuine non-control sub-dimension (a resize
   grip, a helper row, a divider). Non-control components (avatar, kpi-card,
   data-table …) are out of scope — their heights aren't the control scale. */
const CONTROL_FILES = new Set([
  'button', 'icon-button', 'text-input', 'text-area', 'otp-input', 'search-field',
  'input-select', 'token-field', 'toggle', 'checkbox', 'radio', 'badge', 'tag',
  'field-helper', 'date-picker', 'time-picker', 'slider',
]);
const HEIGHT_STEPS = new Set([16, 20, 24, 28, 32, 36, 40, 44, 48]);
const LH_STEPS = new Set([14, 16, 20, 24]);

const ROOT = process.argv[2] || 'src/components';

const COLOR_PROP = /^(color|background|background-color|box-shadow|text-shadow|outline|outline-color|fill|stroke|caret-color|text-decoration-color|column-rule-color|border|border-color|border-(top|right|bottom|left|inline|block)(-(start|end))?(-color)?)$/;

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    statSync(p).isDirectory() ? walk(p) : entry.endsWith('.css') && files.push(p);
  }
})(ROOT);

const violations = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  // Blank out comments but preserve newlines so line numbers stay accurate.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

  const declRe = /([a-zA-Z-]+)\s*:\s*([^;{}]*)/g;
  let m;
  while ((m = declRe.exec(code))) {
    const prop = m[1].toLowerCase();
    const value = m[2];
    if (!COLOR_PROP.test(prop)) continue;
    if (/var\(|gradient\(|url\(/i.test(value)) continue; // token-first / images / gradients

    // Hardcoded color literals: a hex, OR a raw rgb()/rgba()/hsl()/hsla() whose
    // first channel is numeric (so `rgba(var(--…) / α)` — caught by the var() skip
    // above — never reaches here).
    const litRe = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(\s*[\d.]/gi;
    let h;
    while ((h = litRe.exec(value))) {
      const at = m.index + m[0].indexOf(h[0]);
      const line = code.slice(0, at).split('\n').length;
      violations.push({
        file: relative(process.cwd(), file),
        line,
        decl: `${prop}: ${value.trim()}`.replace(/\s+/g, ' ').slice(0, 90),
      });
    }
  }
}

// ---- Control-size lock (control components only) ----------------------------
const sizeViolations = [];
for (const file of files) {
  if (!CONTROL_FILES.has(basename(dirname(file)))) continue;
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const sizeRe = /(min-height|line-height|height)\s*:\s*(\d+)px/gi;
  let m;
  while ((m = sizeRe.exec(code))) {
    const prop = m[1].toLowerCase();
    const val = Number(m[2]);
    const steps = prop === 'line-height' ? LH_STEPS : HEIGHT_STEPS;
    if (!steps.has(val)) continue;
    const line = code.slice(0, m.index).split('\n').length;
    if (/lint-ok/.test(lines[line - 1] || '')) continue;   // explicit per-line allow for a sub-part
    sizeViolations.push({ file: relative(process.cwd(), file), line, decl: `${prop}: ${val}px` });
  }
}

// ---- Value token lock: raw values that already have a token must use it --------
// Covers spacing (padding/margin/gap → --spacing-N), radius (border-radius → a radius
// token), and type (font-size → --font-size-N, font-weight → --font-weight-name),
// across ALL component CSS. Only TOP-LEVEL values count — a value inside a var()/
// calc() fallback is a deliberate safety net and is allowed, as are off-scale values
// with no token, negatives (need calc(), not a positive token), and any line carrying
// a /* lint-ok */ marker.
const SPACING_STEPS = new Set([2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96]);
const FONT_SIZE_STEPS = new Set([8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80]);
// radius px → token (single-valued tokens only; --radius-full for 9999 to avoid the
// ambiguous --uems-radius-pill, defined 9999px in one file and 20px in another).
const RADIUS_MAP = { 2: '--radius-xs', 4: '--uems-radius-xs', 6: '--uems-radius-default', 8: '--uems-radius-s', 12: '--uems-radius-m', 16: '--uems-radius-l', 9999: '--radius-full' };
const WEIGHT_MAP = { 100: '--font-weight-thin', 200: '--font-weight-extralight', 300: '--font-weight-light', 400: '--font-weight-regular', 500: '--font-weight-medium', 600: '--font-weight-semibold', 700: '--font-weight-bold', 800: '--font-weight-extrabold', 900: '--font-weight-black' };
const SIDES = '(?:top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end)';
const LOCKS = [
  { kind: 'px',  props: `padding(?:-${SIDES})?|margin(?:-${SIDES})?|(?:row-|column-)?gap`, suggest: (n) => SPACING_STEPS.has(n) ? `var(--spacing-${n})` : null },
  { kind: 'px',  props: `border-radius|border-(?:top|bottom)-(?:left|right)-radius|border-(?:start|end)-(?:start|end)-radius`, suggest: (n) => RADIUS_MAP[n] ? `var(${RADIUS_MAP[n]})` : null },
  { kind: 'px',  props: `font-size`, suggest: (n) => FONT_SIZE_STEPS.has(n) ? `var(--font-size-${n})` : null },
  { kind: 'num', props: `font-weight`, suggest: (n) => WEIGHT_MAP[n] ? `var(${WEIGHT_MAP[n]})` : null },
];
const padViolations = [];   // (name kept for the reporting block below)
const undefViolations = [];  // var() naming a token that does not exist
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  for (const lock of LOCKS) {
    const declRe = new RegExp(String.raw`\b(?:${lock.props})\s*:\s*([^;{}]*)`, 'gi');
    const numRe = lock.kind === 'px' ? /^(\d+)px\b/ : /^(\d+)\b/;
    let m;
    while ((m = declRe.exec(code))) {
      const value = m[1];
      const valueAt = m.index + m[0].length - value.length;
      let depth = 0;
      for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (ch === '(') { depth++; continue; }
        if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
        if (depth !== 0) continue;
        if (!/\d/.test(ch) || /[\w.#-]/.test(value[i - 1] || ' ')) continue;
        const mm = numRe.exec(value.slice(i));
        if (!mm) continue;
        const sugg = lock.suggest(Number(mm[1]));
        if (!sugg) continue;
        const line = code.slice(0, valueAt + i).split('\n').length;
        if (/lint-ok/.test(lines[line - 1] || '')) continue;
        padViolations.push({ file: relative(process.cwd(), file), line, decl: `${mm[0]} (use ${sugg})` });
      }
    }
  }
}

// ---- Line-height pairing: font-size-keyed line-height tokens --------------------
// --uems-line-height-N is the line-height for font-size-N (e.g. -16 = 24px). So a
// rule that sets font-size: var(--font-size-N) and a raw line-height whose px equals
// that token's value must use var(--uems-line-height-N). Only the byte-identical
// co-located case is flagged; inherited / deliberately-deviating line-heights and any
// /* lint-ok */ line are left alone.
const LH_FOR_FS = { 9: 14, 10: 14, 11: 14, 12: 16, 13: 20, 14: 20, 16: 24, 18: 28, 20: 30, 24: 32, 28: 36, 32: 44, 36: 46 };
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  let r;
  const ruleRe = /\{([^{}]*)\}/g;
  while ((r = ruleRe.exec(code))) {
    const body = r[1];
    const fsNs = new Set();
    let g;
    const tokRe = /var\(--(?:uems-)?font-size-(\d+)/g;
    while ((g = tokRe.exec(body))) fsNs.add(Number(g[1]));
    if (!fsNs.size) continue;
    const lhRe = /line-height:\s*(\d+)px/g;
    while ((g = lhRe.exec(body))) {
      const M = Number(g[1]);
      const cands = [...fsNs].filter((n) => LH_FOR_FS[n] === M);
      if (cands.length !== 1) continue;                 // no match, or ambiguous → leave
      const line = code.slice(0, r.index + 1 + g.index).split('\n').length;
      if (/lint-ok/.test(lines[line - 1] || '')) continue;
      padViolations.push({ file: relative(process.cwd(), file), line, decl: `line-height: ${M}px (use var(--uems-line-height-${cands[0]}) — paired with font-size-${cands[0]})` });
    }
  }
}

// ---- Undefined shadow-token references (elevation) -----------------------------
// A var(--…shadow…) pointing at a token that doesn't exist silently uses its literal
// fallback (e.g. --uems-shadow-lg was never defined; only --shadow-lg is), so the
// elevation "token" is dead. Collect every custom property defined under src/tokens,
// then flag a component reference to an undefined shadow/elevation token.
const definedTokens = new Set();
const collectDefs = (css) => { let d; const dr = /(--[a-z0-9-]+)\s*:/gi; while ((d = dr.exec(css))) definedTokens.add(d[1].toLowerCase()); };
const TOKENS_DIR = 'src/tokens';
/* Both undefined-token rules below are only sound when we can see the real token
   definitions. Without them every design token would look undefined, so the rules
   stand down rather than emit a wall of false positives (e.g. when this script is
   pointed at a directory outside the library). */
const haveTokenDefs = existsSync(TOKENS_DIR);
if (haveTokenDefs) {
  for (const f of readdirSync(TOKENS_DIR)) {
    if (f.endsWith('.css')) collectDefs(readFileSync(join(TOKENS_DIR, f), 'utf8'));
  }
}
// Also count component-local custom props (e.g. --ds-container-shadow, --_s-thumb-shadow)
// as defined, so only genuinely-undefined names (a mistyped design token) are flagged.
for (const file of files) collectDefs(readFileSync(file, 'utf8'));
if (haveTokenDefs) {
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const lines = src.split('\n');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    let m;
    const refRe = /var\(\s*(--[a-z0-9-]*(?:shadow|elevation)[a-z0-9-]*)/gi;
    while ((m = refRe.exec(code))) {
      const name = m[1].toLowerCase();
      if (definedTokens.has(name)) continue;
      const line = code.slice(0, m.index).split('\n').length;
      if (/lint-ok/.test(lines[line - 1] || '')) continue;
      undefViolations.push({ file: relative(process.cwd(), file), line, decl: `var(${m[1]}) — undefined shadow/elevation token (silently uses its fallback; use a defined --shadow-* token)` });
    }
  }
}

// ---- Undefined token references, generally --------------------------------------
// The shadow rule above is a special case of a broader failure: a var() naming a
// token that does not exist. WITH a fallback that is a deliberate safety net and is
// allowed. WITHOUT one the declaration is thrown away at parse time — and for a
// SHORTHAND the WHOLE declaration goes, not just the bad part:
// `padding: var(--spacing-10) var(--spacing-8)` lost BOTH axes because there is no
// --spacing-10 (the scale steps 8 -> 12), so rows rendered with no padding at all
// and nothing reported it.
//
// Only names with no fallback are flagged, so this can never fire on the defensive
// var(--token, <literal>) pattern the rest of this file explicitly allows.
if (haveTokenDefs) {
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const lines = src.split('\n');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    let m;
    // Capture the delimiter: ',' means a fallback follows, ')' means there is none.
    const refRe = /var\(\s*(--[a-z0-9-]+)\s*([,)])/gi;
    while ((m = refRe.exec(code))) {
      const name = m[1].toLowerCase();
      if (m[2] === ',') continue;                       // has a fallback — allowed
      if (definedTokens.has(name)) continue;
      if (/shadow|elevation/.test(name)) continue;      // already covered above
      const line = code.slice(0, m.index).split('\n').length;
      if (/lint-ok/.test(lines[line - 1] || '')) continue;
      undefViolations.push({
        file: relative(process.cwd(), file),
        line,
        decl: `var(${m[1]}) — undefined token, no fallback (declaration dropped; a shorthand loses ALL its values)`,
      });
    }
  }
}

if (violations.length || sizeViolations.length || padViolations.length || undefViolations.length) {
  if (violations.length) {
    console.error(`\n✖ token-lint: ${violations.length} hardcoded color value(s) — replace with a design token (var(--uems-*)):\n`);
    for (const v of violations) console.error(`  ${v.file}:${v.line}\n      ${v.decl}`);
  }
  if (sizeViolations.length) {
    console.error(`\n✖ token-lint: ${sizeViolations.length} hardcoded control size(s) — use the control-size tokens (--uems-control-h-* / --uems-chip-h-* / --uems-control-lh-* / --uems-icon-*), or mark a non-control sub-dimension with a /* lint-ok */ comment:\n`);
    for (const v of sizeViolations) console.error(`  ${v.file}:${v.line}\n      ${v.decl}`);
  }
  if (padViolations.length) {
    console.error(`\n✖ token-lint: ${padViolations.length} raw value(s) that already have a token — spacing (padding/margin/gap → var(--spacing-N)), radius (border-radius → a radius token), or type (font-size → var(--font-size-N), font-weight → var(--font-weight-*)). Use the token, or mark a deliberate off-token value with a /* lint-ok */ comment:\n`);
    for (const v of padViolations) console.error(`  ${v.file}:${v.line}\n      ${v.decl}`);
  }
  if (undefViolations.length) {
    console.error(`\n\u2716 token-lint: ${undefViolations.length} reference(s) to a token that is not defined. Without a fallback the browser DROPS the declaration \u2014 and for a shorthand it drops every value in it (this is how a padding shorthand silently becomes no padding at all). Fix the name, or give it a var(--token, <fallback>):\n`);
    for (const v of undefViolations) console.error(`  ${v.file}:${v.line}\n      ${v.decl}`);
  }
  console.error(`\n  Allowed: literals in comments, var(--token, <fallback>) — including when that token is undefined, rgba(var(--uems-shadow-rgb) / α), control sizes via var()/lint-ok, off-scale/no-token values, negatives (calc()), and any value inside a var()/calc() fallback.\n`);
  process.exit(1);
}
console.log(`✓ token-lint: no hardcoded colors, no raw control sizes in ${CONTROL_FILES.size} control components, no raw spacing/radius/type where a token exists, and no undefined token references, across ${files.length} stylesheets.`);
