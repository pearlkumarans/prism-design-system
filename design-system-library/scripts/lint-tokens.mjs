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
import { readdirSync, readFileSync, statSync } from 'node:fs';
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

if (violations.length || sizeViolations.length) {
  if (violations.length) {
    console.error(`\n✖ token-lint: ${violations.length} hardcoded color value(s) — replace with a design token (var(--uems-*)):\n`);
    for (const v of violations) console.error(`  ${v.file}:${v.line}\n      ${v.decl}`);
  }
  if (sizeViolations.length) {
    console.error(`\n✖ token-lint: ${sizeViolations.length} hardcoded control size(s) — use the control-size tokens (--uems-control-h-* / --uems-chip-h-* / --uems-control-lh-* / --uems-icon-*), or mark a non-control sub-dimension with a /* lint-ok */ comment:\n`);
    for (const v of sizeViolations) console.error(`  ${v.file}:${v.line}\n      ${v.decl}`);
  }
  console.error(`\n  Allowed: literals in comments, var(--token, <fallback>), rgba(var(--uems-shadow-rgb) / α), and control sizes via var() or a /* lint-ok */ marker.\n`);
  process.exit(1);
}
console.log(`✓ token-lint: no hardcoded colors, and no raw control sizes in ${CONTROL_FILES.size} control components, across ${files.length} stylesheets.`);
