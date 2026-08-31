/**
 * injectCss — append a component's stylesheet <link> to <head> exactly once.
 *
 * Deduped BY RESOLVED URL, not just by the caller's `id`. Many components inject
 * the same shared CSS (badge / field-helper / icon-button / tooltip …); each used
 * to add its own <link> under a caller-specific id, so a single page ended up with
 * dozens of duplicate links to the same file. The url check collapses those.
 *
 * `base` MUST be the CALLER's `import.meta.url` so a relative `rel`
 * (e.g. '../badge/badge.css') resolves against the component file — not this util.
 *
 *   import { injectCss } from '../../utils/inject-css.js';
 *   injectCss('ds-kpi-card-badge-css', '../badge/badge.css', import.meta.url);
 */
export function injectCss(id, rel, base) {
  if (typeof document === 'undefined') return;
  if (id && document.getElementById(id)) return;           // fast path: same caller
  const href = new URL(rel, base).href;
  if (document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) return; // same file, any caller
  const l = document.createElement('link');
  if (id) l.id = id;
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}
