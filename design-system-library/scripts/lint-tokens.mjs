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
import { join, relative } from 'node:path';

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

if (violations.length) {
  console.error(`\n✖ token-lint: ${violations.length} hardcoded color value(s) — replace with a design token (var(--uems-*)):\n`);
  for (const v of violations) console.error(`  ${v.file}:${v.line}\n      ${v.decl}`);
  console.error(`\n  Allowed: literals in comments, var(--token, <fallback>), and rgba(var(--uems-shadow-rgb) / α).\n`);
  process.exit(1);
}
console.log(`✓ token-lint: no hardcoded colors in ${files.length} component stylesheets.`);
