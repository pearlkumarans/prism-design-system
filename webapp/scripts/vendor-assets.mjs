#!/usr/bin/env node
/**
 * vendor-assets — Phase C. Copies everything the app fetches at runtime into
 * public/, so the built app is SELF-CONTAINED and served by any static host with
 * NO dev proxy. Unifies dev and prod: both load from same-origin /vendor + /projects
 * + /Layout paths (see index.html, shell-chrome.js, lib/inject-view.js).
 *
 *   design-system-library/src → public/vendor/ds   (components, CSS, tokens, icons,
 *                                                    ec-menus, shell-responsive)
 *   projects                   → public/projects   (slashed-path view files)
 *   Layout/views               → public/Layout/views (bare-name views + drawers)
 *
 * Run by the prestart/prebuild hooks. The copied trees are git-ignored.
 */
import { cpSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const pub = resolve(here, '../public');

const jobs = [
  { from: resolve(repo, 'design-system-library/src'), to: resolve(pub, 'vendor/ds') },
  { from: resolve(repo, 'projects'), to: resolve(pub, 'projects') },
  { from: resolve(repo, 'Layout/views'), to: resolve(pub, 'Layout/views') },
  { from: resolve(repo, 'Layout/data'), to: resolve(pub, 'Layout/data') }, // PrismAPI data layer
];

mkdirSync(pub, { recursive: true });
for (const { from, to } of jobs) {
  if (!existsSync(from)) {
    console.warn(`[vendor-assets] missing source, skipped: ${from}`);
    continue;
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`[vendor-assets] ${from}\n            → ${to}`);
}
