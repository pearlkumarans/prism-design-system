/* =============================================================================
   <ds-pagination> — page navigation for lists, tables, grids and galleries.

   Modes: numbered (default) · simple · compact · dots.
     numbered → « ‹ 1 … 5 6 7 … 10 › »   (jump anywhere; ellipsis truncation)
     simple   → ‹ Prev            Next › (known total; Next disables on last page)
     compact  → ‹  Page 6 of 10   ›      (mobile / narrow surfaces)
     dots     → ‹ ●●▬○○  3 of 8   ›      (small sets: carousels, galleries,
                                          onboarding — the ds-tour dot indicator,
                                          made navigable)

   Composed from existing Prism parts (reuse-first): ds-icon-button for the
   first/prev/next/last arrows and ds-input-select for the rows-per-page picker.
   Only the numbered page "pill" is this component's own anatomy — a token-styled
   <button> carrying aria-current. Tokens only; RTL + light/dark inherited.

   Attributes
     mode="numbered|simple|compact"        (default numbered)
     total-items="240"                     (with page-size → total pages)
     page-size="20"                        (default 20)
     page="1"                              (1-based, reflected)
     sibling-count="1"  boundary-count="1" (numbered truncation)
     show-first-last  show-page-size  show-range  show-jump  (flags, off)
     page-size-options="10,20,50,100"
     size="small|medium"                   (default medium)
     disabled  loading  rtl
     prev-label next-label first-label last-label of-label per-page-label jump-label

   Properties  page · pageSize · totalItems (r/w) · totalPages (getter)
   Methods     goTo(n) · next() · prev() · first() · last()
   Events
     ds-pagination-change            detail: { page, pageSize, source }
     ds-pagination-page-size-change  detail: { pageSize, page }   (resets to page 1)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { injectCss } from '../../utils/inject-css.js';
import { escapeHtml } from '../../utils/escape.js';
import '../icon-button/icon-button.js';
import '../input-select/input-select.js';

/* Light-DOM sub-components: auto-load their CSS so the pager is styled even on a
   page that links pagination.css without the full bundle. */
injectCss('ds-pagination-iconbutton-css', '../icon-button/icon-button.css', import.meta.url);
injectCss('ds-pagination-inputselect-css', '../input-select/input-select.css', import.meta.url);

const MODES = ['numbered', 'simple', 'compact', 'dots'];
const SIZES = ['small', 'medium'];

const toInt = (v, dflt) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? dflt : n;
};

/* Which pages to show. boundaryCount pages pinned at each end, siblingCount
   pages either side of the current page, plus current; runs of >1 hidden pages
   collapse to an ellipsis, but a gap of exactly ONE renders that page (no "…"
   standing in for a single number). Matches the MUI / Ant global standard. */
function pageRange(page, count, siblingCount, boundaryCount) {
  if (count <= 0) return [];
  const range = (start, end) => {
    const out = [];
    for (let i = start; i <= end; i += 1) out.push(i);
    return out;
  };
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);
  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );
  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['ellipsis']
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['ellipsis']
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
}

export class DsPagination extends HTMLElement {
  static get observedAttributes() {
    return [
      'mode', 'total-items', 'page-size', 'page', 'sibling-count', 'boundary-count',
      'show-first-last', 'show-page-size', 'page-size-options', 'show-range', 'show-jump',
      'size', 'disabled', 'loading', 'rtl',
      'prev-label', 'next-label', 'first-label', 'last-label', 'of-label', 'per-page-label', 'jump-label',
    ];
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('nav');
      this._root.className = 'ds-pagination';
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* A page-only change repaints the active state on the LIVE elements instead
       of rebuilding the nav, so the dots' width/colour CSS transitions actually
       play — the smooth "active movement". Structural changes fall back to a
       full render. */
    if (name === 'page' && this._canPaintActive()) {
      this._paintActive();
      return;
    }
    this._render();
  }

  /* Page-only repaint is safe when the DOM won't restructure: dots need the same
     dot count; simple/compact only swap text + arrow states. Numbered pills
     reflow with the page, so they always re-render. */
  _canPaintActive() {
    const mode = enumAttr(this, 'mode', MODES, 'numbered');
    if (mode === 'numbered') return false;
    if (mode === 'dots') {
      return this._root.querySelectorAll('.ds-pagination__dot').length === this.totalPages;
    }
    return true;
  }

  _paintActive() {
    const page = this.page;
    const pages = this.totalPages;
    const atStart = page <= 1;
    const atEnd = page >= pages;
    const ofLabel = this.getAttribute('of-label') || 'of';

    this._root.querySelectorAll('[data-act="first"], [data-act="prev"]').forEach((a) => a.toggleAttribute('disabled', atStart));
    this._root.querySelectorAll('[data-act="next"], [data-act="last"]').forEach((a) => a.toggleAttribute('disabled', atEnd));

    /* Toggle classes on the existing dots → CSS animates the pill grow/shrink. */
    this._root.querySelectorAll('.ds-pagination__dot').forEach((d, i) => {
      const n = i + 1;
      const cur = n === page;
      d.classList.toggle('is-done', n < page);
      d.classList.toggle('is-current', cur);
      if (cur) d.setAttribute('aria-current', 'page'); else d.removeAttribute('aria-current');
      d.setAttribute('aria-label', cur ? `Page ${n}` : `Go to page ${n}`);
    });

    const count = this._root.querySelector('.ds-pagination__count');
    if (count) count.textContent = `${page} ${ofLabel} ${pages}`;
    const status = this._root.querySelector('.ds-pagination__status');
    if (status) status.textContent = `Page ${page} ${ofLabel} ${pages}`;
    const range = this._root.querySelector('.ds-pagination__range');
    if (range) {
      const total = this.totalItems;
      const size = this.pageSize;
      const start = total === 0 ? 0 : (page - 1) * size + 1;
      const end = Math.min(page * size, total);
      range.innerHTML = `${start}&ndash;${end} ${escapeHtml(ofLabel)} ${total}`;
    }
  }

  /* ── Public state ─────────────────────────────────────────────── */
  get totalItems() { return Math.max(0, toInt(this.getAttribute('total-items'), 0)); }
  set totalItems(v) { this.setAttribute('total-items', String(v)); }

  get pageSize() { return Math.max(1, toInt(this.getAttribute('page-size'), 20)); }
  set pageSize(v) { this.setAttribute('page-size', String(v)); }

  get totalPages() {
    const p = Math.ceil(this.totalItems / this.pageSize);
    return Math.max(1, p || 1);
  }

  get page() {
    return Math.min(this.totalPages, Math.max(1, toInt(this.getAttribute('page'), 1)));
  }
  set page(v) { this.setAttribute('page', String(v)); }

  /* ── Navigation (clamped; emit change) ────────────────────────── */
  goTo(n, source = 'page') {
    if (boolAttr(this, 'disabled')) return;
    const target = Math.min(this.totalPages, Math.max(1, toInt(n, this.page)));
    if (target === this.page) return;
    this.setAttribute('page', String(target));
    this.dispatchEvent(new CustomEvent('ds-pagination-change', {
      bubbles: true, composed: true, detail: { page: target, pageSize: this.pageSize, source },
    }));
  }
  next() { this.goTo(this.page + 1, 'next'); }
  prev() { this.goTo(this.page - 1, 'prev'); }
  first() { this.goTo(1, 'first'); }
  last() { this.goTo(this.totalPages, 'last'); }

  /* ── Render ───────────────────────────────────────────────────── */
  _render() {
    const mode = enumAttr(this, 'mode', MODES, 'numbered');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const rtl = boolAttr(this, 'rtl');
    const disabled = boolAttr(this, 'disabled');
    const loading = boolAttr(this, 'loading');
    const page = this.page;
    const pages = this.totalPages;
    const total = this.totalItems;
    const pageSize = this.pageSize;

    const showRange = boolAttr(this, 'show-range');
    const showPageSize = boolAttr(this, 'show-page-size');
    const showJump = boolAttr(this, 'show-jump');
    const showFirstLast = boolAttr(this, 'show-first-last');

    const L = {
      prev: this.getAttribute('prev-label') || 'Previous page',
      next: this.getAttribute('next-label') || 'Next page',
      first: this.getAttribute('first-label') || 'First page',
      last: this.getAttribute('last-label') || 'Last page',
      of: this.getAttribute('of-label') || 'of',
      per: this.getAttribute('per-page-label') || 'per page',
      jump: this.getAttribute('jump-label') || 'Go to page',
    };
    // ds-icon-button sizes are [xl, large, small, xsmall]; xl (28px) is its
    // largest — pair it with medium pagination, large (24px) with small.
    const ibSize = size === 'small' ? 'large' : 'xl';
    const atStart = page <= 1;
    const atEnd = page >= pages;
    const dis = (cond) => (disabled || cond) ? 'disabled' : '';

    /* chevrons flip in RTL so "previous" always points back and "next" forward */
    const iPrev = rtl ? 'chevron-right' : 'chevron-left';
    const iNext = rtl ? 'chevron-left' : 'chevron-right';
    const iFirst = rtl ? 'chevrons-right' : 'chevrons-left';
    const iLast = rtl ? 'chevrons-left' : 'chevrons-right';
    const rtlAttr = rtl ? 'rtl' : '';

    const arrow = (act, icon, label, off) =>
      `<ds-icon-button class="ds-pagination__arrow" data-act="${act}" icon="${icon}" label="${escapeHtml(label)}" type="tertiary-grey" size="${ibSize}" ${rtlAttr} ${off ? 'disabled' : ''}></ds-icon-button>`;

    let controls = '';
    if (mode === 'numbered') {
      const items = pageRange(page, pages, Math.max(0, toInt(this.getAttribute('sibling-count'), 1)), Math.max(1, toInt(this.getAttribute('boundary-count'), 1)));
      const pills = items.map((it) => {
        if (it === 'ellipsis') {
          return `<li class="ds-pagination__item"><span class="ds-pagination__ellipsis" aria-hidden="true"><ds-icon name="more-horizontal" size="16"></ds-icon></span></li>`;
        }
        const current = it === page;
        return `<li class="ds-pagination__item"><button type="button" class="ds-pagination__page${current ? ' is-current' : ''}" data-act="page" data-page="${it}" ${current ? 'aria-current="page"' : ''} ${disabled ? 'disabled' : ''} aria-label="${current ? 'Page ' + it : 'Go to page ' + it}">${it}</button></li>`;
      }).join('');
      controls =
        (showFirstLast ? arrow('first', iFirst, L.first, atStart) : '') +
        arrow('prev', iPrev, L.prev, atStart) +
        `<ul class="ds-pagination__pages" role="list">${pills}</ul>` +
        arrow('next', iNext, L.next, atEnd) +
        (showFirstLast ? arrow('last', iLast, L.last, atEnd) : '');
    } else if (mode === 'compact') {
      controls =
        arrow('prev', iPrev, L.prev, atStart) +
        `<span class="ds-pagination__status" aria-live="polite">Page ${page} ${escapeHtml(L.of)} ${pages}</span>` +
        arrow('next', iNext, L.next, atEnd);
    } else if (mode === 'dots') {
      /* ds-tour dot indicator, made navigable: one clickable dot per page,
         current elongated, preceding pages "done". A generous transparent hit
         area wraps the 6px visual so the dots stay operable. */
      let dots = '';
      for (let i = 1; i <= pages; i += 1) {
        const cur = i === page;
        const cls = i < page ? ' is-done' : cur ? ' is-current' : '';
        dots += `<button type="button" class="ds-pagination__dot${cls}" data-act="page" data-page="${i}" ${cur ? 'aria-current="page"' : ''} ${disabled ? 'disabled' : ''} aria-label="${cur ? 'Page ' + i : 'Go to page ' + i}"></button>`;
      }
      const count = showRange
        ? `<span class="ds-pagination__count" aria-live="polite">${page} ${escapeHtml(L.of)} ${pages}</span>`
        : '';
      controls =
        arrow('prev', iPrev, L.prev, atStart) +
        `<span class="ds-pagination__dots">${dots}</span>` +
        count +
        arrow('next', iNext, L.next, atEnd);
    } else { /* simple */
      const btn = (act, icon, text, off, trailing) =>
        `<button type="button" class="ds-pagination__btn" data-act="${act}" ${off ? 'disabled' : ''}>${trailing ? '' : `<ds-icon name="${icon}" size="16"></ds-icon>`}<span>${escapeHtml(text)}</span>${trailing ? `<ds-icon name="${icon}" size="16"></ds-icon>` : ''}</button>`;
      controls =
        btn('prev', iPrev, this.getAttribute('prev-label') || 'Previous', atStart, false) +
        `<span class="ds-pagination__spacer" aria-hidden="true"></span>` +
        btn('next', iNext, this.getAttribute('next-label') || 'Next', atEnd, true);
    }

    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    /* dots mode renders its own "n of N" count next to the dots, so the leading
       item-range summary is suppressed there. */
    const rangeHtml = (showRange && mode !== 'dots')
      ? `<span class="ds-pagination__range" aria-live="polite">${start}&ndash;${end} ${escapeHtml(L.of)} ${total}</span>`
      : '';

    const sizeHtml = showPageSize
      ? `<label class="ds-pagination__pagesize"><span class="ds-pagination__pagesize-label">${escapeHtml(L.per)}</span><ds-input-select class="ds-pagination__pagesize-select" size="small" ${rtlAttr} data-page-size></ds-input-select></label>`
      : '';

    const jumpHtml = showJump
      ? `<form class="ds-pagination__jump" data-jump><label class="ds-pagination__jump-label" for="ds-pgn-jump">${escapeHtml(L.jump)}</label><input id="ds-pgn-jump" class="ds-pagination__jump-input" type="number" min="1" max="${pages}" inputmode="numeric" ${disabled ? 'disabled' : ''} aria-label="${escapeHtml(L.jump)}"></form>`
      : '';

    this._root.className = `ds-pagination ds-pagination--${mode} ds-pagination--${size}`
      + (disabled ? ' is-disabled' : '') + (loading ? ' is-loading' : '');
    this._root.setAttribute('aria-label', 'Pagination');
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    /* Layout order: per-page + go-to-page sit at the extreme left, then the
       range summary, then the nav controls (pushed to the right edge in CSS). */
    this._root.innerHTML =
      sizeHtml +
      jumpHtml +
      rangeHtml +
      `<div class="ds-pagination__controls">${controls}</div>`;

    this._wire();
  }

  _wire() {
    /* Arrows + page pills */
    this._root.querySelectorAll('[data-act]').forEach((el) => {
      const act = el.dataset.act;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (act === 'page') this.goTo(el.dataset.page, 'page');
        else if (act === 'first') this.first();
        else if (act === 'last') this.last();
        else if (act === 'prev') this.prev();
        else if (act === 'next') this.next();
      });
    });

    /* Rows-per-page (ds-input-select) */
    const sizeSel = this._root.querySelector('[data-page-size]');
    if (sizeSel) {
      const opts = (this.getAttribute('page-size-options') || '10,20,50,100')
        .split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => n > 0);
      sizeSel.options = opts.map((n) => ({ label: String(n), value: String(n) }));
      sizeSel.value = String(this.pageSize);
      sizeSel.addEventListener('ds-input-select-change', (e) => {
        const v = parseInt(e.detail && e.detail.value, 10);
        if (!v || v === this.pageSize) return;
        this.setAttribute('page-size', String(v));
        this.setAttribute('page', '1'); // page count changed → back to first
        this.dispatchEvent(new CustomEvent('ds-pagination-page-size-change', {
          bubbles: true, composed: true, detail: { pageSize: v, page: 1 },
        }));
      });
    }

    /* Jump-to-page */
    const jump = this._root.querySelector('[data-jump]');
    if (jump) {
      jump.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = jump.querySelector('input');
        const v = parseInt(input.value, 10);
        if (v) this.goTo(v, 'jump');
        input.value = '';
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-pagination')) {
  customElements.define('ds-pagination', DsPagination);
}
