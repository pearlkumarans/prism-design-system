#!/usr/bin/env node
/* Convention lint — encodes two bug CLASSES the component review kept finding,
   so they can't recur (they fail the pre-commit gate + CI).

   RULE 1 — no-unescaped-sink (injection; the S1 + S4 classes)
     Flags a consumer value interpolated into an innerHTML string at an HTML sink
     position — `>${expr}<` (text) or `="${expr}"` (attribute) — that is NOT run
     through an escaper. The safe default is `textContent`; when a value must sit
     in an HTML string it must be escaped.
     ALLOWED (not flagged): values wrapped in escapeHtml() / esc() / CSS.escape()
     / an inline .replace(); a base var assigned via one of those earlier in the
     file; ids/uids/state/geometry/pre-built-markup vars; arguments to a console.*
     call (a warning string is not a DOM sink); a `// lint-ok` on the line.

   RULE 2 — no-local-css-injector (the shared-helper class)
     Flags a component that hand-rolls the light-DOM stylesheet injector
     (`createElement('link')` / `function _injectCss` / `_injectStylesheet`)
     instead of importing the shared `injectCss` from utils.

   RULE 3 — no-local-escaper (the shared-helper class, escaping half)
     Flags a component that re-implements HTML escaping locally — a `.replace(/&/,
     '&amp;')` chain or a `'&': '&amp;'` entity map — in any form (a `const esc`,
     an `_esc` method, or an inline chain) instead of importing the shared
     `escapeHtml` from utils. Recurred in ~20 components (some with a weaker char
     set than escapeHtml, or a double-escape from wrapping one sink twice).
     The CSV quote-doubler in data-table (`"` → `""`) is NOT an HTML escaper, so
     it never matches these entity signatures.

   RULE 5 — no-ds-button-label-textContent (the reactive-wipe class)
     Flags setting a <ds-button>'s label by writing the `.ds-button__label` span's
     `textContent` / `innerHTML` (directly or via a var from
     `querySelector('.ds-button__label')`). ds-button re-renders its internals on
     any attribute change, which wipes that write → an EMPTY button (seen in
     confirmation-modal, fullscreen-modal, date-picker). ds-button's own docs say
     to ALWAYS use its reactive `label` ATTRIBUTE instead: `btn.setAttribute(
     'label', text)`. button.js itself is never flagged (it owns the span via a
     createElement'd `this._label`, not a querySelector).

   RULE 6 — no-reentrant-attr-write (the render-loop class)
     Flags `this.setAttribute('x', …)` inside a PAINT method (_render / _paint* /
     _apply / _sync) for an `x` the component also OBSERVES, with no same-value
     guard on the line. setAttribute fires attributeChangedCallback even when the
     value is UNCHANGED, so the write re-enters the paint forever — "Maximum call
     stack size exceeded", and the component never finishes rendering. It hit
     ds-card, was fixed there, then recurred in ds-form-footer, ds-kpi-card and
     ds-kpi-breakdown and shipped on three docs pages before anyone noticed.
     NOT flagged: writes in property setters or event-listener bodies (a date
     pick reflecting `value`) — those run on input, not during paint, and cannot
     loop. Both exclusions are load-bearing: without them this rule reported 25
     false positives across 11 components.
     Guard with `if (want && this.getAttribute('x') !== want)`, or `// lint-ok`.

   RULE 4 — no-missing-component-import (the undeclared-dependency class)
     Flags a component that RENDERS a `<ds-*>` tag (in a template string) or does
     `createElement('ds-*')` for an element whose defining module it does NOT
     import — so the element silently fails to upgrade when the component is
     loaded on its own (the calendar/button and date-picker/calendar bugs). The
     tag→module map is built from the real `customElements.define('ds-*')` sites
     (so it handles ds-icon living under icons/, and multi-tag files like
     list.js → ds-list-item); a tag defined in the file itself is never flagged,
     and `?query` suffixes on import paths are ignored when matching.

   RULE 6 — no-dead-host (light-DOM CSS dead-code)
     Flags a STANDALONE `:host { … }` rule (selector is exactly `:host`) in a
     LIGHT-DOM component's CSS — it never applies (there's no shadow root), so its
     declarations are dead. The recurring fix is to mirror display on the element
     selector (`ds-<name> { … }`) instead. Components that use `attachShadow`
     (shadow-DOM, e.g. avatar/accordion) are skipped — there `:host` is real. Only
     the bare `:host {` form is flagged; deliberate dual-selectors that pair a dead
     `:host(...)`/`:host, ds-<name>` with a live light-DOM selector are left alone.

   Usage:  node scripts/lint-conventions.mjs [dir]     (default: src/components)
   Exit 1 with a report on any violation; 0 otherwise. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';

const ROOT = process.argv[2] || 'src/components';

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith('.js')) files.push(p);
  }
})(ROOT);

/* Build the tag→defining-file map from a broader scan (the parent `src`, so
   ds-icon under icons/ is included) — used by Rule 4. */
const SRC_ROOT = (ROOT.replace(/components\/?$/, '').replace(/\/$/, '')) || ROOT;
const tagToFiles = new Map();
(function scan(dir) {
  let entries; try { entries = readdirSync(dir); } catch { return; }
  for (const entry of entries) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) scan(p);
    else if (entry.endsWith('.js')) {
      for (const m of readFileSync(p, 'utf8').matchAll(/customElements\.define\(\s*['"](ds-[a-z0-9-]+)['"]/g)) {
        if (!tagToFiles.has(m[1])) tagToFiles.set(m[1], new Set());
        tagToFiles.get(m[1]).add(resolve(p));
      }
    }
  }
})(SRC_ROOT);
const RENDER_TAG = /<(ds-[a-z][a-z0-9-]*)[\s/>]/g;
const CREATE_TAG = /createElement\(\s*['"](ds-[a-z0-9-]+)['"]/g;
const IMPORT_PATH = /import\s+(?:[^'"]*from\s*)?['"]([^'"]+)['"]/g;

/* Precision via TAINT TRACKING, not an allowlist: a value is only flagged when it
   is KNOWN to hold consumer input — a var assigned from getAttribute (or a direct
   getAttribute at the sink) — and reaches an HTML sink unescaped. Pre-built markup
   vars, numerics, and internal state are never tainted, so they don't fire. */
const ESCAPER = /(^|[.\s(])(escapeHtml|esc|_esc|_escape|escape)\s*\(|\.replace\s*\(|CSS\.escape/;

const TEXT_SINK = /(?<![\w$])>\$\{([^}]+)\}</g;
const ATTR_SINK = /="\$\{([^}]+)\}"/g;

const violations = [];
const injectors = [];
const localEscapers = [];
const missingImports = [];
const btnLabels = [];
const deadHosts = [];
const reentrantAttrs = [];

/* An HTML-entity escaper re-implementation — either the chained `.replace(/&/g,
   '&amp;')` form or the `'&': '&amp;'` map form. The shared escapeHtml is the only
   sanctioned home for this; it lives in utils/ (never scanned here). */
const ESCAPER_CHAIN = /\.replace\(\s*\/&\/[a-z]*\s*,\s*(['"])&amp;\1/;
const ESCAPER_MAP = /(['"])&\1\s*:\s*(['"])&amp;\2/;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  // Blank comments (keep newlines) so JSDoc examples don't trip the rules.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
                  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '));
  const rel = relative(process.cwd(), file);

  // TAINTED: local vars assigned (partly) from getAttribute — hold consumer input.
  // …but NOT when coerced to a number (Number/parseInt/parseFloat) — then it's safe.
  const tainted = new Set();
  for (const m of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]*\bgetAttribute\s*\([^;\n]*)/g)) {
    if (!/^\s*(Number|parseInt|parseFloat)\s*\(/.test(m[2])) tainted.add(m[1]);
  }
  // …unless the SAME var is (re)assigned through an escaper — then it's clean.
  const safeAssigned = new Set();
  for (const m of code.matchAll(/\b(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*(?:escapeHtml|esc|_esc|_escape)\s*\(/g)) safeAssigned.add(m[1]);

  // RULE 2 — hand-rolled stylesheet injector (should import the shared injectCss)
  if (/createElement\(\s*['"]link['"]\s*\)/.test(code) || /function\s+_injectCss\b|function\s+_injectStylesheet\b/.test(code)) {
    // …only when it's actually a stylesheet injector (rel=stylesheet or a .css href)
    if (/rel\s*=\s*['"]stylesheet['"]|\.css['"]/.test(code)) injectors.push(rel);
  }

  // RULE 3 — locally re-implemented HTML escaper (should import the shared escapeHtml)
  {
    const codeLines = code.split('\n');
    const hit = codeLines.findIndex((l) => ESCAPER_CHAIN.test(l) || ESCAPER_MAP.test(l));
    if (hit !== -1 && !/\/\/\s*lint-ok/.test(src.split('\n')[hit] || '')) {
      localEscapers.push({ rel, line: hit + 1 });
    }
  }

  // RULE 4 — a rendered/created <ds-*> whose defining module isn't imported
  {
    const rendered = new Set();
    for (const m of code.matchAll(RENDER_TAG)) rendered.add(m[1]);
    for (const m of code.matchAll(CREATE_TAG)) rendered.add(m[1]);
    if (rendered.size) {
      const self = resolve(file);
      const own = new Set([...tagToFiles].filter(([, fs]) => fs.has(self)).map(([t]) => t));
      const imported = new Set();
      for (const m of src.matchAll(IMPORT_PATH)) {
        try { imported.add(resolve(dirname(file), m[1].split('?')[0])); } catch { /* ignore */ }
      }
      for (const tag of rendered) {
        if (own.has(tag)) continue;
        const defs = tagToFiles.get(tag);
        if (!defs) continue;                                   // unknown/external tag — can't verify
        if ([...defs].some((df) => imported.has(df))) continue; // its module is imported
        missingImports.push({ rel, tag });
      }
    }
  }

  // RULE 5 — ds-button label set via .ds-button__label textContent/innerHTML
  {
    // vars assigned from querySelector('.ds-button__label') — the label span
    const labelVars = new Set();
    for (const m of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*querySelector\s*\([^)]*ds-button__label[^)]*\)/g)) labelVars.add(m[1]);
    const WRITE = /\.(?:textContent|innerHTML)\s*=/;
    code.split('\n').forEach((line, i) => {
      let hit = /querySelector\s*\([^)]*ds-button__label[^)]*\)\s*\.(?:textContent|innerHTML)\s*=/.test(line); // direct write
      if (!hit && WRITE.test(line)) {
        for (const v of labelVars) {
          if (new RegExp(`(?:^|[^\\w$])${v}\\s*\\.(?:textContent|innerHTML)\\s*=`).test(line)) { hit = true; break; }
        }
      }
      if (hit && !/\/\/\s*lint-ok/.test(src.split('\n')[i] || '')) btnLabels.push({ rel, line: i + 1 });
    });
  }

  // RULE 6 — a standalone `:host {` rule in a light-DOM component's CSS (dead)
  if (!/attachShadow/.test(src)) {                 // shadow-DOM → :host is legitimate
    let cssSrc; try { cssSrc = readFileSync(file.replace(/\.js$/, '.css'), 'utf8'); } catch { cssSrc = ''; }
    if (cssSrc) {
      const cssCode = cssSrc.replace(/\/\*[\s\S]*?\*\//g, ''); // blank block comments
      const mh = /(^|\n)[ \t]*:host[ \t]*\{/.exec(cssCode);    // `:host {` with nothing else in the selector
      if (mh) {
        const line = cssCode.slice(0, mh.index + mh[1].length).split('\n').length;
        deadHosts.push({ rel: rel.replace(/\.js$/, '.css'), line });
      }
    }
  }

  // RULE 1 — unescaped value at an HTML sink
  const scan = (re, kind) => {
    for (const m of code.matchAll(re)) {
      const expr = m[1].trim();
      const base = expr.replace(/^\(/, '').split(/[.\[\s(|?]/)[0];   // leading identifier
      if (ESCAPER.test(expr)) continue;                              // wrapped/inline-escaped
      if (/^(min|max|step|size|width|height|mins|maxLines|maxChars|count|level|num|pct|rows|cols|iSize|iconPx|flag)$/.test(base)) continue; // numeric/sanitized attrs
      if (/\?\s*\d/.test(expr)) continue;                            // ternary producing a number
      const isTainted = /getAttribute\s*\(/.test(expr)               // direct getAttribute at the sink
        || (tainted.has(base) && !safeAssigned.has(base));           // or a getAttribute-derived var, not re-escaped
      if (!isTainted) continue;
      const line = code.slice(0, m.index).split('\n').length;
      if (/\/\/\s*lint-ok/.test(src.split('\n')[line - 1] || '')) continue;
      /* A console argument is not an innerHTML sink. The house warning shape —
         console.warn(`[ds] Unknown size="${raw}" — expected one of […]`) — reads
         as an attr sink to ATTR_SINK but never reaches the DOM; enumAttr owns it
         for most components and radio hand-rolls it because it accepts aliases.
         Tested on the text BEFORE the match, and only while no ')' has closed the
         call, so a genuine sink later on the same line still fires. */
      const lineStart = code.lastIndexOf('\n', m.index - 1) + 1;
      if (/console\.\w+\s*\([^)]*$/.test(code.slice(lineStart, m.index))) continue;
      violations.push({ rel, line, kind, expr: expr.slice(0, 50) });
    }
  };
  scan(TEXT_SINK, 'text');
  scan(ATTR_SINK, 'attr');

  /* RULE 6 — no-reentrant-attr-write (the render-loop class)
     Flags `this.setAttribute('x', …)` inside a PAINT method for an `x` that the
     component also OBSERVES, without a same-value guard on the line.
     setAttribute fires attributeChangedCallback even when the value is
     UNCHANGED, so such a write re-enters the paint forever — "Maximum call
     stack size exceeded", and the component never finishes rendering. It hit
     ds-card, was fixed there, then recurred in ds-form-footer, ds-kpi-card and
     ds-kpi-breakdown and shipped on three docs pages.
     Scoped to paint methods on purpose: reflecting an observed attribute from
     an EVENT handler (a date pick writing `value`) is normal and never loops.
     Guard with `if (want && this.getAttribute('x') !== want)`, or // lint-ok. */
  {
    const observed = new Set();
    for (const om of code.matchAll(/observedAttributes\s*\(\)\s*\{\s*return\s*\[([^\]]*)\]/g)) {
      for (const a of om[1].matchAll(/'([^']+)'/g)) observed.add(a[1]);
    }
    const PAINT = /^\s{2}(_render|_paint[A-Za-z]*|_apply|_sync)\s*\(/;
    /* Any 2-space member STARTS a new member, and a 2-space `}` ENDS one. Both
       matter: without the get/set/static/async forms here, `inPaint` leaked past
       the end of a paint method into the property setters below it and reported
       19 false positives across 9 components (checkbox's `set checked(v)` and
       friends, which are event-path reflection and never loop). */
    const MEMBER = /^\s{2}(?:static\s+|async\s+|get\s+|set\s+|\*\s*)?[A-Za-z_$][\w$]*\s*\(/;
    /* A write REGISTERED inside a paint method but executed later — the
       `addEventListener('click', () => this.setAttribute('tab', …))` shape — runs
       on user input, not during paint, so it cannot loop. Track callback bodies
       by brace depth and skip them; without this, message-box and right-pane
       contributed 6 more false positives. */
    const CALLBACK_OPEN = /(?:addEventListener|forEach|map|then|setTimeout|requestAnimationFrame|observe)\s*\(/;
    let inPaint = false;
    let depth = 0;
    let cbDepth = null;
    code.split('\n').forEach((line, i) => {
      if (MEMBER.test(line)) { inPaint = PAINT.test(line); depth = 0; cbDepth = null; }
      else if (/^\s{2}\}/.test(line)) { inPaint = false; cbDepth = null; }
      const opensCb = inPaint && cbDepth === null && CALLBACK_OPEN.test(line) && /=>|function/.test(line);
      const before = depth;
      depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (opensCb) cbDepth = before;
      else if (cbDepth !== null && depth <= cbDepth) cbDepth = null;
      if (!inPaint || cbDepth !== null) return;
      const w = /this\.setAttribute\(\s*'([^']+)'/.exec(line);
      if (!w || !observed.has(w[1])) return;
      if (new RegExp(`getAttribute\\(\\s*'${w[1]}'\\s*\\)\\s*!==`).test(line)) return;  // guarded
      if (/\/\/\s*lint-ok/.test(src.split('\n')[i] || '')) return;
      reentrantAttrs.push({ rel, line: i + 1, attr: w[1] });
    });
  }
}

let failed = false;
if (violations.length) {
  failed = true;
  console.error(`\n✖ convention-lint (injection): ${violations.length} unescaped value(s) at an innerHTML sink — wrap in escapeHtml() (or use textContent):\n`);
  for (const v of violations) console.error(`  ${v.rel}:${v.line}   ${v.kind} sink  \${${v.expr}}`);
  console.error(`\n  Suppress a verified-safe case with a trailing  // lint-ok  comment.\n`);
}
if (injectors.length) {
  failed = true;
  console.error(`\n✖ convention-lint (shared-helper): ${injectors.length} file(s) hand-roll the stylesheet injector — import { injectCss } from utils/inject-css.js instead:\n`);
  for (const f of injectors) console.error(`  ${f}`);
  console.error('');
}
if (localEscapers.length) {
  failed = true;
  console.error(`\n✖ convention-lint (shared-helper): ${localEscapers.length} file(s) re-implement HTML escaping — import { escapeHtml } from utils/escape.js instead of a local esc()/_esc()/.replace() chain:\n`);
  for (const e of localEscapers) console.error(`  ${e.rel}:${e.line}`);
  console.error('');
}
if (missingImports.length) {
  failed = true;
  console.error(`\n✖ convention-lint (missing-import): ${missingImports.length} case(s) render a <ds-*> whose module isn't imported — add the import so it upgrades when this component is loaded on its own:\n`);
  for (const m of missingImports) console.error(`  ${m.rel}  →  renders <${m.tag}> but doesn't import its module`);
  console.error('');
}
if (btnLabels.length) {
  failed = true;
  console.error(`\n✖ convention-lint (reactive-wipe): ${btnLabels.length} site(s) set a ds-button label via .ds-button__label textContent/innerHTML — use btn.setAttribute('label', text) (a ds-button re-render wipes the textContent → empty button):\n`);
  for (const b of btnLabels) console.error(`  ${b.rel}:${b.line}`);
  console.error('');
}
if (reentrantAttrs.length) {
  failed = true;
  console.error(`\n✖ convention-lint (render-loop): ${reentrantAttrs.length} unguarded write(s) to an OBSERVED attribute inside a paint method — setAttribute fires attributeChangedCallback even when the value is unchanged, so this re-enters the paint forever:\n`);
  for (const v of reentrantAttrs) console.error(`    ${v.rel}:${v.line}   setAttribute('${v.attr}')`);
  console.error(`\n  Guard it:  if (want && this.getAttribute('x') !== want) this.setAttribute('x', want);\n  Or suppress a verified-safe case with a trailing  // lint-ok  comment.\n`);
}

if (deadHosts.length) {
  failed = true;
  console.error(`\n✖ convention-lint (dead-host): ${deadHosts.length} light-DOM component(s) have a standalone :host {} rule (never applies) — mirror display on the ds-<name> element selector instead:\n`);
  for (const d of deadHosts) console.error(`  ${d.rel}:${d.line}`);
  console.error('');
}
if (failed) process.exit(1);
console.log(`✓ convention-lint: no unescaped innerHTML sinks, hand-rolled CSS injectors, local HTML escapers, missing component imports, ds-button label textContent-writes, or dead :host rules in ${files.length} component scripts.`);
