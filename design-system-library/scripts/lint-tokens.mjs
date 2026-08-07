#!/usr/bin/env node
/* Token lint — enforces the CLAUDE.md rule "no hardcoded values where a token
   exists" for component CSS.

   A VIOLATION is a hex color used in a color-role declaration
   (color / background / border* / outline / fill / stroke …) that is NOT routed
   through a design token. These are ALLOWED (not flagged):
     - hexes inside CSS comments        (they only document a token value)
     - var(--token, #hex) fallbacks     token-first, hex is a defensive default
     - gradients, box-shadow, rgba(), url()   (legitimate one-offs live here)

   Usage:  node scripts/lint-tokens.mjs [dir]      (default: src/components)
   Exit 1 with a report if any violation is found; 0 otherwise. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || 'src/components';

const COLOR_PROP = /^(color|background|background-color|outline|outline-color|fill|stroke|caret-color|text-decoration-color|column-rule-color|border|border-color|border-(top|right|bottom|left|inline|block)(-(start|end))?(-color)?)$/;

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

    const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
    let h;
    while ((h = hexRe.exec(value))) {
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
  console.error(`\n  Allowed: hexes in comments and var(--token, #hex) fallbacks.\n`);
  process.exit(1);
}
console.log(`✓ token-lint: no hardcoded colors in ${files.length} component stylesheets.`);
