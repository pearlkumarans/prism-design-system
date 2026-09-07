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
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS NOT JUST rmSync + cpSync
 *
 * It used to be. `public/` is a watched Broccoli tree, and `prestart` runs this
 * script while `ember serve` is already attaching its watcher — so the old
 * sequence deleted ~400 files out of public/vendor/ds and refilled them over
 * several seconds, with the watcher reading the tree mid-flight:
 *
 *     Build Error (BroccoliMergeTrees)
 *     ENOENT: no such file or directory, scandir
 *       '.../public/vendor/ds/components/confirmation-modal'
 *
 * It self-corrected on the next rebuild, so it looked like noise — but it is a
 * real torn read, and on a slower disk or a bigger tree it can also land in
 * `ember build`, where there is no second chance.
 *
 * Two defences, in order:
 *
 *   1. SKIP when the source has not changed. A manifest of (relative path, size,
 *      mtime) per job is stored beside the copies. On a normal restart nothing
 *      has changed, so the destination is never touched and the race cannot
 *      happen at all. This is also why restarts are now fast.
 *
 *   2. When something HAS changed, STAGE then SWAP. The new tree is built under
 *      node_modules/.cache (same filesystem, and NOT a watched directory), then
 *      moved into place with rename(2). The window where the destination is
 *      absent shrinks from "the whole copy" to two rename syscalls, and it is
 *      never partially populated — the watcher sees the old tree or the new one.
 *
 * Pass --force to copy unconditionally.
 * ---------------------------------------------------------------------------
 */
import {
  cpSync, rmSync, existsSync, mkdirSync, renameSync,
  readdirSync, statSync, readFileSync, writeFileSync,
} from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const pub = resolve(here, '../public');
/* Staging lives OUTSIDE public/ on purpose: a .tmp directory inside a watched
   tree would itself trigger rebuilds and get packaged into dist. */
const stageRoot = resolve(here, '../node_modules/.cache/prism-vendor-staging');
/* The manifest is build metadata, not an app asset — keeping it in public/
   would package it into dist and serve it. Losing it (a cleared cache) just
   means the next run copies everything, which is the safe direction. */
const manifestPath = resolve(stageRoot, '..', 'prism-vendor-manifest.json');

const force = process.argv.includes('--force');

const jobs = [
  { from: resolve(repo, 'design-system-library/src'), to: resolve(pub, 'vendor/ds') },
  { from: resolve(repo, 'projects'), to: resolve(pub, 'projects') },
  { from: resolve(repo, 'Layout/views'), to: resolve(pub, 'Layout/views') },
  { from: resolve(repo, 'Layout/data'), to: resolve(pub, 'Layout/data') }, // PrismAPI data layer
  { from: resolve(repo, 'Layout/i18n'), to: resolve(pub, 'Layout/i18n') }, // central i18n runtime + locale catalogs
  { from: resolve(repo, 'Layout/layout-base.css'), to: resolve(pub, 'Layout/layout-base.css') }, // .lay scaffold for injected legacy views
];

/* Cheap change detection: size + mtime per file, not content hashing. A copy is
   driven by mtime anyway, so this matches what cpSync would act on, and it stays
   fast on the ~400-file DS tree. */
function fingerprint(src) {
  const st = statSync(src);
  if (st.isFile()) return `f:${st.size}:${Math.floor(st.mtimeMs)}`;
  const parts = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      const s = statSync(p);
      parts.push(`${relative(src, p)}:${s.size}:${Math.floor(s.mtimeMs)}`);
    }
  };
  walk(src);
  return `d:${parts.length}:${parts.join('|')}`;
}

function readManifest() {
  try { return JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { return {}; }
}

/* Build beside the target, then move it in. rename(2) within one filesystem is
   atomic, so the destination is only ever the complete old tree or the complete
   new one — never the half-populated state the watcher used to catch. */
function stageAndSwap(from, to, key) {
  const staged = resolve(stageRoot, key);
  const retired = `${to}.retired-${process.pid}`;
  rmSync(staged, { recursive: true, force: true });
  mkdirSync(dirname(staged), { recursive: true });
  cpSync(from, staged, { recursive: true });
  mkdirSync(dirname(to), { recursive: true });
  try {
    if (existsSync(to)) renameSync(to, retired);
    renameSync(staged, to);
  } finally {
    rmSync(retired, { recursive: true, force: true });
    rmSync(staged, { recursive: true, force: true });
  }
}

mkdirSync(pub, { recursive: true });
const previous = readManifest();
const next = {};
let copied = 0;
let skipped = 0;

for (const { from, to } of jobs) {
  if (!existsSync(from)) {
    console.warn(`[vendor-assets] missing source, skipped: ${from}`);
    continue;
  }
  const key = relative(pub, to).replace(/[\\/]/g, '__');
  const fp = fingerprint(from);
  next[key] = fp;

  if (!force && existsSync(to) && previous[key] === fp) {
    skipped += 1;
    continue;
  }
  stageAndSwap(from, to, key);
  copied += 1;
  console.log(`[vendor-assets] ${from}\n            → ${to}`);
}

mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
rmSync(stageRoot, { recursive: true, force: true });
console.log(`[vendor-assets] ${copied} copied, ${skipped} unchanged${force ? ' (--force)' : ''}`);
