#!/usr/bin/env node
/**
 * sync-catalog — copies the single source of truth (Layout/shell-catalog.js) into
 * the Ember app as app/config/catalog-data.js, with a generated banner. Run by the
 * `prestart`/`prebuild` hooks so the Ember catalog can never drift from the shell's.
 *
 * The SSOT is already a plain ES module exporting exactly the tables the app needs,
 * so this is a verbatim copy — no transform, nothing to keep in sync by hand.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../../Layout/shell-catalog.js');
const OUT = resolve(here, '../app/config/catalog-data.js');

const banner =
  '/* AUTO-GENERATED — DO NOT EDIT. Source of truth: Layout/shell-catalog.js.\n' +
  '   Regenerate with `npm run sync:catalog` (runs automatically on start/build). */\n\n';

const src = readFileSync(SRC, 'utf8')
  // Drop the SSOT's own file-header banner; keep everything from the first export.
  .replace(/^[\s\S]*?(?=export const PRODUCTS)/, '');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, banner + src, 'utf8');
console.log(`[sync-catalog] ${SRC}\n            → ${OUT}`);
