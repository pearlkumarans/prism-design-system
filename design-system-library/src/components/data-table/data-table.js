/* =============================================================================
   <ds-data-table>

   Set data via JS properties:
     el.columns = [{ id, header, accessor, align?, sortable?, render? }, ...]
     el.rows    = [{ id, ...rowData }, ...]
     el.bulkActions = [{ id, label, icon?, destructive? }, ...]

   Visibility / behavior via attributes:
     show-toolbar, show-footer, sticky-header, loading, rtl,
     selection-mode="multi|single|none",
     row-height="compact|default|comfortable",
     rows-per-page, total-rows, page, search-value

   Filter control:
     advanced-filter  → the table offers BOTH a simple and an advanced filter, so the
                        filter control is a ds-split-button (main = simple filter,
                        caret/menu = advanced filter). Omit it for a simple-filter-only
                        table, which renders a plain outline filter button.
   Property (data-only; host owns storage):
     filterPresets    → array of saved filters [{ id, label, query? }] for the caret.
                        With presets, the caret opens a built-in menu (saved filters +
                        an "Advanced filter…" entry); selecting a preset emits
                        ds-data-table-preset-select, the entry emits ds-data-table-advanced-filter.
                        Empty/unset → the caret emits ds-data-table-advanced-filter directly.
   Filter button state (consumer-driven — the table only fires the filter events):
     filter-applied   → red attention dot on the filter button (one or more filters set)
     filter-open       → holds the filter button in its hover state while the panel is open
   These are REFLECTIVE, not commands: the table stays stateless about filtering so it
   works with any filter UI (sidebar, dropdown, modal). MIRROR your real state onto them
   — derive from the committed filter value / actual panel visibility, don't blind-toggle
   — so the flags stay correctable and can't drift. e.g.
     table.toggleAttribute('filter-applied', activeFilterCount > 0);
     table.toggleAttribute('filter-open', panelIsVisible);

   Events:
     ds-data-table-selection         { ids: string[] }
     ds-data-table-page              { page: number }
     ds-data-table-rows-per-page     { rowsPerPage: number }
     ds-data-table-search            { value: string }
     ds-data-table-refresh
     ds-data-table-filter            simple filter (button click / split-button main)
     ds-data-table-advanced-filter   advanced filter (split-button caret; or the caret menu's
                                     "Advanced filter…" entry when filterPresets is set)
     ds-data-table-preset-select     { preset }  a saved filter chosen from the caret menu
     ds-data-table-column-settings   (from the overflow menu; host renders the column-toggle UI)
     ds-data-table-sort              { columnId: string, direction: 'asc'|'desc'|null }
     ds-data-table-bulk-action       { id: string, ids: string[] }
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* The toolbar search is a ds-search-field — register it so the table renders
   the search everywhere it's used, not just on pages that bundle all components.
   Built-in bulk actions also use ds-dropdown-menu (export format) + ds-toast. */
import '../search-field/search-field.js';
import '../dropdown-menu/dropdown-menu.js';
import '../toast/toast.js';
/* The toolbar filter control is a ds-split-button (outline). The split button is
   light-DOM, so its stylesheet must be present on any page that renders a table —
   inject it here (idempotent) since consumers won't know about this transitive dep. */
import '../split-button/split-button.js';
/* Toolbar refresh / overflow are ds-icon-buttons; their `label` yields a built-in
   hover/focus tooltip via ds-tooltip. Both are light-DOM and don't self-inject
   their CSS, so register the JS and inject the stylesheets here (transitive deps
   a consumer won't know to bundle). */
import '../icon-button/icon-button.js';
import '../tooltip/tooltip.js';
(function _injectToolbarCss() {
  if (typeof document === 'undefined') return;
  [
    ['ds-data-table-split-button-css', '../split-button/split-button.css'],
    ['ds-data-table-icon-button-css', '../icon-button/icon-button.css'],
    ['ds-data-table-tooltip-css', '../tooltip/tooltip.css'],
  ].forEach(([id, rel]) => {
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href = new URL(rel, import.meta.url).href;
    document.head.appendChild(l);
  });
})();

/* Focus modality: the toolbar search should show the focus RING only when
   reached by keyboard (Tab). A mouse click shows the plain active state.
   Track the last interaction once, document-wide. */
let _kbNav = false;
if (typeof document !== 'undefined' && !document.__dsDtKbNav) {
  document.__dsDtKbNav = true;
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab') _kbNav = true; }, true);
  document.addEventListener('mousedown',   () => { _kbNav = false; }, true);
  document.addEventListener('pointerdown', () => { _kbNav = false; }, true);
}

const DENSITIES = ['compact', 'default', 'comfortable'];
const SELECTION_MODES = ['multi', 'single', 'none'];

const DEFAULT_BULK_ACTIONS = [
  { id: 'edit',   label: 'Edit',   icon: 'edit' },
  { id: 'delete', label: 'Delete', icon: 'delete', destructive: true },
  { id: 'export', label: 'Export', icon: 'download' },
];

/* Built-in toolbar/footer/bulk-bar strings. The component localizes its OWN
   chrome (search, filter, pagination, aria) based on the active language; all
   consumer-supplied content (column headers, cell values, custom bulkActions
   labels) is passed through untouched. Add a locale by adding a key here. */
const DT_STRINGS = {
  en: {
    search: 'Search...', searchAria: 'Search', filter: 'Filter', refresh: 'Refresh', more: 'More options',
    selectAll: 'Select all rows', selectRow: (id) => `Select row ${id}`,
    showing: (s, e, t) => `Showing ${s} to ${e} of ${t} rows.`,
    empty: 'No rows to display.', resize: (c) => `Resize ${c} column`,
    rpp: 'Rows per page', of: 'of', prev: 'Previous', next: 'Next',
    bulkActions: 'Bulk actions', selected: 'Selected', clearSel: 'Clear selection',
    edit: 'Edit', delete: 'Delete', export: 'Export', columnSettings: 'Column settings',
    advancedFilter: 'Advanced filter…', savedFilters: 'Saved filters', clearFilter: 'Clear filter',
    createAdvancedFilter: 'Create advanced filter',
    shareFilter: 'Share', editFilter: 'Edit', deleteFilter: 'Delete',
    sharedWithMe: 'Shared with me', duplicateFilter: 'Duplicate', removeFilter: 'Remove', sharedBy: 'Shared by',
    scopeAll: 'All', scopeMine: 'Mine', scopeShared: 'Shared',
  },
  ar: {
    search: 'بحث...', searchAria: 'بحث', filter: 'تصفية', refresh: 'تحديث', more: 'خيارات أخرى',
    selectAll: 'تحديد كل الصفوف', selectRow: (id) => `تحديد الصف ${id}`,
    showing: (s, e, t) => `عرض ${s} إلى ${e} من ${t} صفًا.`,
    empty: 'لا توجد صفوف للعرض.', resize: (c) => `تغيير حجم عمود ${c}`,
    rpp: 'صفوف لكل صفحة', of: 'من', prev: 'السابق', next: 'التالي',
    bulkActions: 'إجراءات مجمّعة', selected: 'محدد', clearSel: 'مسح التحديد',
    edit: 'تعديل', delete: 'حذف', export: 'تصدير', columnSettings: 'إعدادات الأعمدة',
    advancedFilter: 'التصفية المتقدمة…', savedFilters: 'عوامل التصفية المحفوظة', clearFilter: 'مسح عامل التصفية',
    createAdvancedFilter: 'إنشاء عامل تصفية متقدم',
    shareFilter: 'مشاركة', editFilter: 'تعديل', deleteFilter: 'حذف',
    sharedWithMe: 'تمّت مشاركتها معي', duplicateFilter: 'تكرار', removeFilter: 'إزالة', sharedBy: 'شاركها',
    scopeAll: 'الكل', scopeMine: 'الخاصة بي', scopeShared: 'المشتركة',
  },
};

export class DsDataTable extends HTMLElement {
  static get observedAttributes() {
    return [
      'show-toolbar', 'show-footer', 'sticky-header', 'loading',
      'selection-mode', 'row-height', 'rtl', 'resizable', 'frozen-columns',
      'rows-per-page', 'total-rows', 'page', 'search-value',
      'selected-row-ids', 'fit-viewport', 'fit-gap', 'lang',
      'filter-applied', 'filter-open', 'advanced-filter',
    ];
  }

  /* Active language for the table's own chrome: the `lang` attribute if set,
     else the document language, normalized to a known locale (else 'en'). */
  _lang() {
    let l = this.getAttribute('lang');
    if (!l && typeof document !== 'undefined') l = document.documentElement.getAttribute('lang');
    l = (l || 'en').toLowerCase();
    return DT_STRINGS[l] ? l : (l.split('-')[0] && DT_STRINGS[l.split('-')[0]] ? l.split('-')[0] : 'en');
  }
  /* Translate a chrome string; function values take format args. */
  _t(key, ...args) {
    const dict = DT_STRINGS[this._lang()] || DT_STRINGS.en;
    const v = dict[key] != null ? dict[key] : DT_STRINGS.en[key];
    return typeof v === 'function' ? v(...args) : (v != null ? v : key);
  }

  constructor() {
    super();
    this._columns = [];
    this._rows = [];
    this._filterPresets = [];
    this._filterSummary = '';
    this._filterPresetActive = null;
    this._bulkActions = DEFAULT_BULK_ACTIONS;
    this._selectedIds = new Set();
    this._sort = { columnId: null, direction: null };
    /* Manual column sizing — columnId → px, set by dragging a header resizer.
       Widths survive re-renders; double-click a resizer to reset all. */
    this._colWidths = {};
    this._selColWidth = null;
    this._colsFrozen = false;
    this._fitEnabled = false;                          // fit-viewport: cap height to the screen
    this._onFit = () => this._fitViewport();

    // Deferred-upgrade: if a consumer assigned `el.columns = ...` BEFORE this
    // class was registered (common when scripts race the module loader), the
    // assignment lands on the plain HTMLElement instead of triggering this
    // setter. Recover those plain properties now and pipe them through the
    // setters so the data renders.
    ['columns', 'rows', 'bulkActions', 'selectedIds'].forEach((prop) => {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    });
  }

  // ---- Public properties --------------------------------------------------
  get columns() { return this._columns; }
  set columns(v) { this._columns = Array.isArray(v) ? v : []; this._render(); this._scheduleFit(); }

  get rows() { return this._rows; }
  /* Rows only affect the body + footer, never the toolbar. Re-render body-only so
     a consumer that reassigns `rows` on each search keystroke (client-side filter)
     doesn't rebuild the toolbar and destroy the focused <input>. Falls back to a
     full render before the toolbar exists (initial setup). */
  set rows(v) { this._rows = Array.isArray(v) ? v : []; this._renderBodyOnly(); this._scheduleFit(); }

  /* Saved filter presets for the advanced-filter split button's caret menu.
     Data-only — the host owns storage; the table just renders what it's handed
     and read on demand (no re-render needed). Each preset: { id, label, query? }.
     With any presets the caret opens a menu (presets + "Advanced filter…"); with
     none it emits ds-data-table-advanced-filter directly. */
  get filterPresets() { return this._filterPresets; }
  set filterPresets(v) { this._filterPresets = Array.isArray(v) ? v : []; }
  /* A short label for the currently-applied advanced/saved filter (e.g. a preset
     name or "3 conditions"). When set AND filter-applied is on, the toolbar shows
     a removable chip; its × emits ds-data-table-filter-clear (same as the caret
     menu's "Clear filter"). Set '' (or clear filter-applied) to remove the chip. */
  get filterSummary() { return this._filterSummary; }
  set filterSummary(v) { this._filterSummary = v == null ? '' : String(v); this._syncFilterChip(); }
  /* Id of the saved filter currently applied (or null). When set, that row in the
     caret menu shows the selected/active background so users can see which saved
     filter is in effect. Host sets it on preset-select and clears it on
     clear/edit/ad-hoc apply. */
  get filterPresetActive() { return this._filterPresetActive; }
  set filterPresetActive(v) { this._filterPresetActive = v == null ? null : String(v); }

  /* Client-side search. When `search-value` is set, keep rows whose visible
     cell text matches — accessor values, render() output (tags stripped), or
     any string field on the row. Empty query → all rows. */
  _visibleRows() {
    const q = (this.getAttribute('search-value') || '').trim().toLowerCase();
    let rows = this._rows;
    if (q) {
      rows = rows.filter((row) => {
        const inCols = this._columns.some((col) => {
          let text = col.accessor != null ? row[col.accessor] : '';
          if ((text == null || text === '') && typeof col.render === 'function') {
            try {
              const out = col.render(row);
              text = typeof out === 'string' ? out.replace(/<[^>]*>/g, ' ') : (out && out.textContent) || '';
            } catch (_) { text = ''; }
          }
          return String(text ?? '').toLowerCase().includes(q);
        });
        return inCols || Object.values(row).some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
      });
    }
    /* Client-side sort (default). The ds-data-table-sort event still fires, so
       server-side consumers can re-set `.rows` themselves; for everyone else
       the active column sorts here — numeric-aware, case-insensitive. */
    const { columnId, direction } = this._sort;
    if (columnId && direction) {
      const col = this._columns.find((c) => c.id === columnId);
      const key = col && col.accessor != null ? col.accessor : columnId;
      const dir = direction === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) =>
        dir * String(a?.[key] ?? '').localeCompare(String(b?.[key] ?? ''), undefined, { numeric: true, sensitivity: 'base' }));
    }
    return rows;
  }

  /* Pagination. Client-side by default: slice the visible rows by page size.
     Server-side fallback: if `total-rows` is set HIGHER than the rows the
     consumer provided, assume they page server-side — show all provided rows
     and trust their total (no local slicing). */
  _pageInfo() {
    const vis = this._visibleRows();
    const attrTotal = this.getAttribute('total-rows');
    const serverSide = attrTotal && attrTotal !== '#' && Number(attrTotal) > vis.length;
    const total = serverSide ? Number(attrTotal) : vis.length;
    const rpp = Math.max(1, parseInt(this.getAttribute('rows-per-page') || '20', 10) || total || 1);
    const pages = Math.max(1, Math.ceil(total / rpp));
    const page = Math.min(Math.max(1, parseInt(this.getAttribute('page') || '1', 10)), pages);
    const rows = serverSide ? vis : vis.slice((page - 1) * rpp, (page - 1) * rpp + rpp);
    return { rows, total, rpp, page, pages, serverSide };
  }

  get bulkActions() { return this._bulkActions; }
  set bulkActions(v) { this._bulkActions = Array.isArray(v) ? v : DEFAULT_BULK_ACTIONS; this._render(); }

  get selectedIds() { return [...this._selectedIds]; }
  set selectedIds(arr) {
    this._selectedIds = new Set(Array.isArray(arr) ? arr : []);
    this._render();
  }

  // ---- Lifecycle ----------------------------------------------------------
  connectedCallback() {
    if (!this._mounted) {
      this.classList.add('ds-data-table');
      /* Capture slotted toolbar/empty content BEFORE the first render clears
         innerHTML, so consumers can drop a button (e.g. an action) into the
         toolbar's left region or actions cluster, or a custom empty state. */
      this._slottedToolbarLeft    = this.querySelector(':scope > [slot="toolbar-left"]');
      this._slottedToolbarActions = this.querySelector(':scope > [slot="toolbar-actions"]');
      this._slottedEmpty          = this.querySelector(':scope > [slot="empty"]');
      [this._slottedToolbarLeft, this._slottedToolbarActions, this._slottedEmpty].forEach((n) => n && n.remove());
      // Allow consumer to set selected-row-ids attr too (comma-separated)
      const attrSel = (this.getAttribute('selected-row-ids') || '')
        .split(',').map((s) => s.trim()).filter(Boolean);
      if (attrSel.length) this._selectedIds = new Set(attrSel);
      this._mounted = true;
    }
    this._render();
    if (this.hasAttribute('fit-viewport') && this.getAttribute('fit-viewport') !== 'false') this._enableFit();
    /* Follow the document language: when the shell flips <html lang>, re-render
       so the toolbar/footer chrome localizes. No-op if the table sets its own
       `lang`. Cheap: fires only on lang/dir attribute changes. */
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && !this.hasAttribute('lang')) {
      this._lastLang = this._lang();
      this._langObs = new MutationObserver(() => { if (this._lang() !== this._lastLang) { this._lastLang = this._lang(); this._render(); } });
      this._langObs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
    }
  }

  disconnectedCallback() { this._disableFit(); if (this._langObs) { this._langObs.disconnect(); this._langObs = null; } }

  /* fit-viewport: keep the whole table within the screen so the footer stays
     visible; short data still hugs (max-height, not height). */
  _enableFit() {
    if (this._fitEnabled) return;
    this._fitEnabled = true;
    addEventListener('resize', this._onFit, { passive: true });
    addEventListener('scroll', this._onFit, { passive: true, capture: true });
    /* Recompute when the table's own box resizes — most importantly when it goes
       from hidden (0×0, e.g. an injected view toggled back on) to visible, since
       the global scroll/resize listeners don't fire on a visibility change. The
       write-guard in _fitViewport keeps this from looping. */
    if (typeof ResizeObserver !== 'undefined') {
      this._lastFitW = null; this._lastFitH = null; this._fitVisible = false;
      /* The fit cap is VERTICAL-only, so a WIDTH-only resize of the table — e.g. a
         sidebar collapsing/expanding animates the content (and this table) wider
         every frame — must NOT recompute the height each frame (that read+write
         per frame is the jerk). Skip ONLY a pure width change while the table
         stays visible; any height change or a visibility flip (0×0 → laid out)
         still recomputes. */
      this._fitRO = new ResizeObserver((entries) => {
        const cr = entries && entries[0] && entries[0].contentRect;
        const w = cr ? Math.round(cr.width) : null;
        const h = cr ? Math.round(cr.height) : null;
        const visible = this.offsetParent !== null;
        const widthOnly = visible && this._fitVisible && h === this._lastFitH && w !== this._lastFitW;
        this._lastFitW = w; this._lastFitH = h; this._fitVisible = visible;
        if (widthOnly) return;
        this._onFit();
      });
      this._fitRO.observe(this);
    }
    this._scheduleFit();
  }
  _disableFit() {
    if (!this._fitEnabled) return;
    this._fitEnabled = false;
    removeEventListener('resize', this._onFit, { passive: true });
    removeEventListener('scroll', this._onFit, { passive: true, capture: true });
    if (this._fitRO) { this._fitRO.disconnect(); this._fitRO = null; }
    this.style.maxHeight = '';
    this.style.minHeight = '';
  }
  _scheduleFit() {
    if (!this._fitEnabled) return;
    clearTimeout(this._fitT);
    this._fitT = setTimeout(this._onFit, 0);   // fires even when the tab is offscreen (rAF can't)
    requestAnimationFrame(this._onFit);
  }
  /* Nearest scrollable ancestor (a padded page scroller like `.lay__scroll`), else null. */
  _scrollAncestor() {
    let el = this.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') return el;
      el = el.parentElement;
    }
    return null;
  }
  _fitViewport() {
    if (!this._fitEnabled || !this.isConnected) return;
    /* Skip while hidden (display:none up the tree → offsetParent is null): every
       getBoundingClientRect reads 0, so the computed target would floor to the
       160px minimum and get cached, leaving the table stuck at ~1 row when the
       view is shown again. Bailing keeps the last good height until it's visible;
       the ResizeObserver recomputes once it renders. */
    if (this.offsetParent === null) return;
    const scroller = this._scrollAncestor();
    const top = this.getBoundingClientRect().top;
    let target;
    if (scroller) {
      /* Size to fill from the table's top down to the scroll container's
         content-box bottom (its rect bottom minus bottom padding/border). This
         is a fixed geometric boundary — independent of the container's current
         content (KPI row, a stretched filter-panel sibling column, etc.) — so
         there's no shrink feedback loop. The table's bottom lands at the
         container's content edge → no empty outer scroll; short data still hugs. */
      const cs = getComputedStyle(scroller);
      const inset = (parseFloat(cs.paddingBottom) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
      target = scroller.getBoundingClientRect().bottom - inset - top;
    } else {
      /* No scroll container (table drives the page scroll): cap to the viewport
         from the table's top, minus a breathing gap. */
      const gap = parseInt(this.getAttribute('fit-gap') || '', 10);
      const bottomGap = Number.isFinite(gap) ? gap : 24;
      target = Math.min(window.innerHeight - top - bottomGap, window.innerHeight - bottomGap);
    }
    /* A correctly-rendered, visible table always yields a positive target (its
       top sits above the scroller's content bottom / the viewport). target <= 0
       means a degenerate measure — the view is hidden, offscreen, or mid-
       navigation and every getBoundingClientRect reads ~0. Caching the 160px
       floor here is exactly what left the table stuck at ~1 row after switching
       views; instead keep the last good height and let the ResizeObserver
       recompute once the table is actually laid out again. */
    if (!(target > 0)) return;
    const next = Math.max(160, Math.round(target)) + 'px';
    if (this.style.maxHeight !== next) { this.style.maxHeight = next; this.style.minHeight = '0'; }
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'fit-viewport') {
      (this.hasAttribute('fit-viewport') && this.getAttribute('fit-viewport') !== 'false') ? this._enableFit() : this._disableFit();
      return;
    }
    if (name === 'fit-gap') { this._scheduleFit(); return; }
    /* Filter button state is a light touch on the existing control — toggle its
       classes in place; never rebuild the toolbar (would drop search focus). */
    if (name === 'filter-applied' || name === 'filter-open') { this._syncFilterState(); return; }
    if (name === 'selected-row-ids') {
      const ids = (this.getAttribute('selected-row-ids') || '')
        .split(',').map((s) => s.trim()).filter(Boolean);
      this._selectedIds = new Set(ids);
    }
    /* Typing in the search must NOT rebuild the toolbar — that would destroy
       the focused <input> (focus lost → can't type continuously). Re-render
       only the table body + footer, leaving the toolbar (and its focus) intact. */
    /* Body/footer-only concerns — never rebuild the toolbar (would drop focus
       from the search box mid-type or on a page/size change while focused). */
    if (name === 'search-value' || name === 'page' || name === 'rows-per-page' || name === 'total-rows') { this._renderBodyOnly(); return; }
    this._render();
  }

  /* Reflect the consumer-set filter-applied / filter-open attributes onto the
     filter split-button as classes the stylesheet keys off. Called on those
     attribute changes and after each toolbar (re)render. `el` is passed in
     during render (before the toolbar is in the DOM); otherwise we look it up. */
  _syncFilterState(el) {
    const filter = el || this.querySelector('.ds-data-table__filter');
    if (!filter) return;
    const on = (n) => this.hasAttribute(n) && this.getAttribute(n) !== 'false';
    filter.classList.toggle('is-filter-applied', on('filter-applied'));
    filter.classList.toggle('is-filter-open', on('filter-open'));
    this._syncFilterChip();
  }

  /* Removable chip shown in the toolbar (right after the filter control) while a
     filter is applied AND a summary label is set. Its × clears the filter. The
     chip sits in the toolbar-left cluster (8px flex gap), so no extra spacing CSS
     is needed. It self-removes on close (ds-tag), and we also emit clear. */
  _syncFilterChip() {
    const filter = this.querySelector('.ds-data-table__filter');
    const host = filter && filter.parentElement;
    if (!host) return;                                   // toolbar not rendered yet
    const applied = this.hasAttribute('filter-applied') && this.getAttribute('filter-applied') !== 'false';
    const summary = this._filterSummary;
    let chip = this._filterChip && this._filterChip.isConnected ? this._filterChip : null;
    if (applied && summary) {
      if (!chip) {
        chip = document.createElement('ds-tag');
        chip.className = 'ds-data-table__filter-chip';
        chip.setAttribute('variant', 'neutral');
        chip.setAttribute('size', 'medium');
        chip.setAttribute('leading', 'icon');
        chip.setAttribute('icon', 'filter');
        chip.addEventListener('ds-tag-close', (e) => { e.stopPropagation(); this._clearFilter(); });
        this._filterChip = chip;
      }
      chip.setAttribute('label', summary);
      if (chip.parentElement !== host || chip.previousElementSibling !== filter) {
        filter.insertAdjacentElement('afterend', chip);
      }
    } else if (chip) {
      chip.remove();
      this._filterChip = null;
    }
  }

  /* Emitted by both the caret menu's "Clear filter" item and the toolbar chip's ×.
     The host restores its unfiltered rows and clears filter-applied / filterSummary. */
  _clearFilter() {
    this.dispatchEvent(new CustomEvent('ds-data-table-filter-clear', { bubbles: true, composed: true }));
  }

  /* Partial render used while the search box has focus — replaces everything
     after the toolbar, preserving the toolbar DOM (and the live <input>). */
  _renderBodyOnly() {
    const toolbar = this.querySelector('.ds-data-table__toolbar');
    if (!toolbar) { this._render(); return; }
    while (toolbar.nextSibling) toolbar.nextSibling.remove();
    const optOutBool = (n) => {
      if (!this.hasAttribute(n)) return true;
      const v = (this.getAttribute(n) || '').toLowerCase();
      return !(v === 'false' || v === '0' || v === 'no');
    };
    const showFooter    = optOutBool('show-footer');
    const loading       = boolAttr(this, 'loading');
    const selectionMode = enumAttr(this, 'selection-mode', SELECTION_MODES, 'multi');
    const rowsPerPage   = parseInt(this.getAttribute('rows-per-page') || '20', 10);
    const totalRows     = this.getAttribute('total-rows') ?? '#';
    const page          = parseInt(this.getAttribute('page') || '1', 10);
    this.appendChild(this._renderTable(selectionMode, loading));
    if (showFooter) this.appendChild(this._renderFooter(rowsPerPage, totalRows, page));
    if (this._selectedIds.size > 0 && selectionMode !== 'none') this.appendChild(this._renderBulkBar());
    this.appendChild(this._renderLiveRegion(rowsPerPage, totalRows, page));
  }

  // ---- Render -------------------------------------------------------------
  _render() {
    if (!this._mounted) return;

    // Opt-out booleans: default true, but respect explicit `="false"` /
    // `="0"` / `="no"` from the playground attribute writer. The shared
    // `boolAttr` helper only checks presence, which makes
    // `show-footer="false"` falsely truthy.
    const optOutBool = (name) => {
      if (!this.hasAttribute(name)) return true;
      const v = (this.getAttribute(name) || '').toLowerCase();
      return !(v === 'false' || v === '0' || v === 'no');
    };
    const showToolbar    = optOutBool('show-toolbar');
    const showFooter     = optOutBool('show-footer');
    const stickyHeader   = optOutBool('sticky-header');
    const loading        = boolAttr(this, 'loading');
    const rtl            = boolAttr(this, 'rtl');
    const density        = enumAttr(this, 'row-height', DENSITIES, 'comfortable');
    const selectionMode  = enumAttr(this, 'selection-mode', SELECTION_MODES, 'multi');
    const rowsPerPage    = parseInt(this.getAttribute('rows-per-page') || '20', 10);
    const totalRows      = this.getAttribute('total-rows') ?? '#';
    const page           = parseInt(this.getAttribute('page') || '1', 10);
    const searchValue    = this.getAttribute('search-value') || '';

    this.dataset.rowHeight   = density;
    this.dataset.stickyHeader = String(stickyHeader);
    this.dataset.selectionMode = selectionMode;
    if (rtl) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');

    /* Safety net: if a full render happens while the search box is focused
       (e.g. a consumer reassigns `columns`), remember the caret so we can put
       focus back on the rebuilt input. (Row/page updates already avoid this via
       _renderBodyOnly, which never touches the toolbar.) */
    let _refocus = null;
    const _sf = this.querySelector('.ds-data-table__search');
    const _si = _sf && (_sf.querySelector('input') || (_sf.shadowRoot && _sf.shadowRoot.querySelector('input')));
    if (_si && (document.activeElement === _si || (_sf.shadowRoot && _sf.shadowRoot.activeElement === _si) || _sf.contains(document.activeElement))) {
      _refocus = { start: _si.selectionStart, end: _si.selectionEnd };
    }

    this.innerHTML = '';

    if (showToolbar) this.appendChild(this._renderToolbar(searchValue));
    if (_refocus) {
      const ns = this.querySelector('.ds-data-table__search');
      const ni = ns && (ns.querySelector('input') || (ns.shadowRoot && ns.shadowRoot.querySelector('input')));
      if (ni) { ni.focus(); try { ni.setSelectionRange(_refocus.start, _refocus.end); } catch (_) {} }
    }
    this.appendChild(this._renderTable(selectionMode, loading));
    if (showFooter) this.appendChild(this._renderFooter(rowsPerPage, totalRows, page));
    if (this._selectedIds.size > 0 && selectionMode !== 'none') {
      this.appendChild(this._renderBulkBar());
    }

    // Live region per spec — aria-live="polite" status node so screen readers
    // hear "Showing 1 to 20 of 243" when sort / filter / page change.
    this.appendChild(this._renderLiveRegion(rowsPerPage, totalRows, page));

    /* Post-attach layout passes (synchronous — the table is in the DOM now, so
       widths are measurable; rAF would never fire in a background tab). */
    const tbl = this.querySelector('.ds-data-table__table');
    if (tbl) {
      if (this._colWidthsFrozen()) this._applyTableWidth(tbl);        // also re-applies frozen offsets
      else if (this._frozenCount) this._applyFrozenOffsets(tbl);
    }
  }

  _renderLiveRegion(rowsPerPage, totalRows, page) {
    const live = document.createElement('div');
    live.className = 'ds-data-table__sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    if (totalRows !== '#' && this._rows.length > 0) {
      const start = (page - 1) * rowsPerPage + 1;
      const end = Math.min(page * rowsPerPage, Number(totalRows));
      live.textContent = this._t('showing', start, end, totalRows);
    }
    return live;
  }

  _renderToolbar(searchValue) {
    const bar = document.createElement('div');
    bar.className = 'ds-data-table__toolbar';

    // Left edge — slotted content (e.g. title / segmented control) when provided,
    // followed by the default search + filter cluster.
    const left = document.createElement('div');
    left.className = 'ds-data-table__toolbar-left';
    if (this._slottedToolbarLeft) left.appendChild(this._slottedToolbarLeft);

    // Right edge — slotted content REPLACES the default refresh / search /
    // filter / overflow cluster, per spec's `toolbarActions` slot.
    const right = document.createElement('div');
    right.className = 'ds-data-table__toolbar-actions';
    if (this._slottedToolbarActions) {
      right.appendChild(this._slottedToolbarActions);
      bar.appendChild(left);
      bar.appendChild(right);
    } else {
      // Search + filter live on the LEFT; refresh + overflow stay on the right.
      // Filter control: a split button when the table offers BOTH a simple and an
      // advanced filter (advanced-filter set — main = simple, caret = advanced);
      // a plain outline button when there is only the simple filter.
      const advancedFilter = boolAttr(this, 'advanced-filter');
      const filterCtrl = advancedFilter
        ? `<ds-split-button class="ds-data-table__filter" variant="outline" size="small" icon="filter" label="${this._t('filter')}"></ds-split-button>`
        : `<ds-button class="ds-data-table__filter" variant="outline" size="small" prefix-icon="filter">${this._t('filter')}</ds-button>`;
      left.insertAdjacentHTML('beforeend', `
        <ds-search-field class="ds-data-table__search" size="small" placeholder="${this._t('search')}" aria-label="${this._t('searchAria')}"></ds-search-field>
        ${filterCtrl}`);
      /* Icon-only toolbar actions use ds-icon-button: its `label` drives both the
         aria-label and a built-in hover/focus tooltip (no separate ds-tooltip
         needed). data-act stays on the host so the click wiring below still fires. */
      right.innerHTML = `
        <ds-icon-button class="ds-data-table__action" data-act="refresh"
                        shape="square" type="tertiary-grey" size="large"
                        icon="refresh" label="${this._t('refresh')}"></ds-icon-button>
        <ds-icon-button class="ds-data-table__action" data-act="overflow"
                        shape="square" type="tertiary-grey" size="large"
                        icon="more-vertical" label="${this._t('more')}"></ds-icon-button>`;
      bar.appendChild(left);
      bar.appendChild(right);
      // Search uses the ds-search-field component (own icon, border, focus).
      const search = left.querySelector('ds-search-field');
      if (searchValue) search.setAttribute('value', searchValue);
      /* Ring only on keyboard focus; click = active state (see CSS .is-kb-focus). */
      search.addEventListener('focusin', () => search.classList.toggle('is-kb-focus', _kbNav));
      search.addEventListener('focusout', () => search.classList.remove('is-kb-focus'));
      search.addEventListener('ds-search-field-input', (e) => {
        const v = e.detail?.value ?? '';
        this.setAttribute('search-value', v);
        this.dispatchEvent(new CustomEvent('ds-data-table-search', {
          bubbles: true, composed: true, detail: { value: v },
        }));
      });
      bar.querySelectorAll('[data-act]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const act = btn.dataset.act;
          /* Overflow opens a built-in menu (Column settings · Export) rather than
             just signalling — the other actions still emit for the host. */
          if (act === 'overflow') { this._openOverflowMenu(btn); return; }
          this.dispatchEvent(new CustomEvent(`ds-data-table-${act}`, {
            bubbles: true, composed: true,
          }));
        });
      });
      /* Filter events: the plain outline button (simple only) emits
         ds-data-table-filter on click. The split button's main action emits the
         same (simple filter); its caret/menu emits ds-data-table-advanced-filter. */
      const filter = left.querySelector('.ds-data-table__filter');
      const emitFilter = () => this.dispatchEvent(new CustomEvent('ds-data-table-filter', { bubbles: true, composed: true }));
      if (advancedFilter) {
        filter?.addEventListener('ds-split-button-main', emitFilter);
        /* Caret: with saved presets, open a built-in menu (presets + "Advanced
           filter…"); with none, signal the advanced filter directly. */
        filter?.addEventListener('ds-split-button-menu', () => this._openAdvancedFilterMenu(filter));
      } else {
        filter?.addEventListener('click', emitFilter);
      }
      /* Apply the current filter-applied / filter-open state to the fresh control. */
      this._syncFilterState(filter);
    }
    return bar;
  }

  _renderTable(selectionMode, loading) {
    const rows = this._pageInfo().rows;
    const scroll = document.createElement('div');
    scroll.className = 'ds-data-table__scroll';
    /* Frozen-column shadow only while actually scrolled horizontally. */
    scroll.addEventListener('scroll', () => {
      scroll.dataset.scrolledX = scroll.scrollLeft > 0 ? 'true' : 'false';
    }, { passive: true });

    const table = document.createElement('table');
    table.className = 'ds-data-table__table';
    // Spec: aria-busy belongs on the <table>, not the host wrapper
    if (loading) table.setAttribute('aria-busy', 'true');

    // ---- thead ----
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    /* Manual column resize is on unless the host opts out (resizable="false")
       or a column sets `resizable: false`. */
    const resizable = this.getAttribute('resizable') !== 'false';

    /* Frozen columns: the first N data columns (plus the selection column when
       present) stay pinned during horizontal scroll. */
    const frozenCount = Math.min(
      Math.max(0, parseInt(this.getAttribute('frozen-columns') || '0', 10) || 0),
      Math.max(0, this._columns.length - 1),   /* at least one column must scroll */
    );
    this._frozenCount = frozenCount;
    const markFrozen = (cell, dataIdx) => {
      /* dataIdx: -1 = selection column, 0..N-1 = data columns. */
      if (!frozenCount) return;
      if (dataIdx >= frozenCount) return;
      cell.classList.add('ds-data-table__cell--frozen');
      if (dataIdx === frozenCount - 1) cell.classList.add('ds-data-table__cell--frozen-last');
    };

    if (selectionMode !== 'none') {
      const th = document.createElement('th');
      th.scope = 'col';
      markFrozen(th, -1);
      if (this._selColWidth) th.style.width = `${this._selColWidth}px`;
      // Single-select: no "select all" affordance — there is only one selection.
      if (selectionMode === 'multi') {
        const allSelected = rows.length > 0
          && rows.every((r) => this._selectedIds.has(r.id));
        const someSelected = rows.some((r) => this._selectedIds.has(r.id));
        const cb = document.createElement('ds-checkbox');
        cb.setAttribute('size', 'small');
        cb.setAttribute('aria-label', this._t('selectAll'));
        if (allSelected) cb.setAttribute('checked', '');
        else if (someSelected) cb.setAttribute('indeterminate', '');
        cb.addEventListener('ds-checkbox-change', (e) => {
          if (e.detail.checked) rows.forEach((r) => this._selectedIds.add(r.id));
          else rows.forEach((r) => this._selectedIds.delete(r.id));
          this._emitSelection();
          this._render();
        });
        th.appendChild(cb);
      }
      headerRow.appendChild(th);
    }

    this._columns.forEach((col, colIdx) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.dataset.colId = col.id;
      markFrozen(th, colIdx);
      if (col.align) th.dataset.align = col.align;
      if (col.width) th.style.width = typeof col.width === 'number' ? `${col.width}px` : col.width;
      /* A manually-dragged width wins over the column's declared width. */
      if (this._colWidths[col.id] != null) th.style.width = `${this._colWidths[col.id]}px`;

      const inner = document.createElement('span');
      inner.className = 'ds-data-table__th-inner';

      if (col.sortable) {
        const btn = document.createElement('button');
        btn.className = 'ds-data-table__sort';
        const isActive = this._sort.columnId === col.id;
        if (isActive && this._sort.direction) btn.dataset.sort = this._sort.direction;
        /* Direction is baked into the glyph itself (↑ asc / ↓ desc) — no CSS
           rotation, so the arrow can never invert from a stale stylesheet. The
           unsorted hover-preview shows ↑ (ascending is the first click). */
        const sortGlyph = (isActive && this._sort.direction === 'desc') ? 'arrow-narrow-down' : 'arrow-narrow-up';
        /* Header as text node + icon node (never raw innerHTML) so a header
           carrying `<`/`&`/markup renders literally — matches the non-sortable
           path below (inner.append(col.header)). Rich HTML cells still go through
           the intentional custom-render escape hatch in the body, unaffected. */
        btn.append(`${col.header ?? ''} `);
        const sortIcon = document.createElement('ds-icon');
        sortIcon.setAttribute('name', sortGlyph);
        sortIcon.setAttribute('size', '14');
        btn.appendChild(sortIcon);
        btn.addEventListener('click', () => this._toggleSort(col.id));
        if (isActive) th.setAttribute('aria-sort',
          this._sort.direction === 'asc' ? 'ascending'
          : this._sort.direction === 'desc' ? 'descending' : 'none');
        inner.appendChild(btn);
      } else {
        inner.append(col.header ?? '');
      }
      th.appendChild(inner);
      if (resizable && col.resizable !== false) {
        th.appendChild(this._buildColResizer(col, th, table));
      }
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    /* Re-apply the frozen layout after a re-render (widths were set per-th above).
       The container width is only measurable once the table is attached, so the
       absorber/table width math runs on the next frame. */
    /* The col-fixed class must be on before first paint; the width/offset math
       needs the table attached and is applied synchronously at the end of
       _render() (rAF is unreliable — background tabs never fire it). */
    if (this._colWidthsFrozen()) table.classList.add('ds-data-table__table--col-fixed');

    // ---- tbody ----
    const tbody = document.createElement('tbody');

    if (loading) {
      /* Render skeleton rows that mirror the table's column structure.
         Each cell gets an inner skeleton bar with a deterministic width
         so the placeholder looks like real data instead of a single
         flat gradient strip. Animation is staggered per row for a softer,
         more polished feel than the lockstep band we had before. */
      const ROW_COUNT = 5;
      /* Column widths cycle through these percentages so adjacent cells
         don't all read as the same shape. Selection-checkbox column uses
         a fixed-size square skeleton. */
      const BAR_WIDTHS = ['72%', '48%', '90%', '60%', '36%', '80%', '54%'];

      for (let i = 0; i < ROW_COUNT; i++) {
        const tr = document.createElement('tr');
        tr.className = 'ds-data-table__loading-row';
        tr.style.setProperty('--ds-skel-delay', `${i * 120}ms`);

        if (selectionMode !== 'none') {
          const td = document.createElement('td');
          markFrozen(td, -1);
          const sq = document.createElement('span');
          sq.className = 'ds-data-table__skeleton ds-data-table__skeleton--square';
          td.appendChild(sq);
          tr.appendChild(td);
        }

        this._columns.forEach((col, j) => {
          const td = document.createElement('td');
          markFrozen(td, j);
          if (col.align) td.dataset.align = col.align;
          const bar = document.createElement('span');
          bar.className = 'ds-data-table__skeleton ds-data-table__skeleton--bar';
          bar.style.width = BAR_WIDTHS[(i + j) % BAR_WIDTHS.length];
          td.appendChild(bar);
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      }
    } else if (rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = this._columns.length + (selectionMode !== 'none' ? 1 : 0);
      td.className = 'ds-data-table__empty';
      td.setAttribute('role', 'status');
      // Slotted [slot="empty"] takes precedence over the plain text fallback
      if (this._slottedEmpty) {
        td.appendChild(this._slottedEmpty.cloneNode(true));
      } else {
        td.textContent = this.getAttribute('empty-text') || this._t('empty');
      }
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        const isSelected = this._selectedIds.has(row.id);
        if (isSelected) tr.dataset.selected = 'true';

        if (selectionMode !== 'none') {
          const td = document.createElement('td');
          markFrozen(td, -1);
          if (selectionMode === 'single') {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.className = 'ds-data-table__radio';
            radio.name = `dt-select-${this.id || (this._uidFallback ||= Math.random().toString(36).slice(2, 8))}`;
            radio.setAttribute('aria-label', this._t('selectRow', row.id));
            if (isSelected) radio.checked = true;
            radio.addEventListener('change', () => {
              this._selectedIds.clear();
              if (radio.checked) this._selectedIds.add(row.id);
              this._emitSelection();
              this._render();
            });
            td.appendChild(radio);
          } else {
            const cb = document.createElement('ds-checkbox');
            cb.setAttribute('size', 'small');
            cb.setAttribute('aria-label', this._t('selectRow', row.id));
            if (isSelected) cb.setAttribute('checked', '');
            cb.addEventListener('ds-checkbox-change', (e) => {
              if (e.detail.checked) this._selectedIds.add(row.id);
              else this._selectedIds.delete(row.id);
              this._emitSelection();
              this._render();
            });
            td.appendChild(cb);
          }
          tr.appendChild(td);
        }

        this._columns.forEach((col, colIdx) => {
          // Spec: a column flagged as the row's primary identifier should
          // render as <th scope="row"> so screen readers announce row context.
          const cell = col.rowHeader
            ? document.createElement('th')
            : document.createElement('td');
          if (col.rowHeader) cell.setAttribute('scope', 'row');
          markFrozen(cell, colIdx);
          if (col.align) cell.dataset.align = col.align;
          if (typeof col.render === 'function') {
            const out = col.render(row);
            if (out instanceof Node) cell.appendChild(out);
            else cell.innerHTML = String(out ?? '');
          } else {
            cell.textContent = String(row[col.accessor] ?? '');
          }
          tr.appendChild(cell);
        });

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    scroll.appendChild(table);
    return scroll;
  }

  // ---- Manual column resize ------------------------------------------------
  _colWidthsFrozen() {
    return !!this._colsFrozen;
  }

  /* Full-bleed rule: the header must always span the whole container — no blank
     gutter when columns shrink. Chrome's fixed-layout redistributes any surplus
     across ALL columns (breaking exact drag sizes), so instead every column gets
     an explicit width and the LAST column acts as the absorber: its effective
     width = max(its own size, remaining container space). The widths then sum
     exactly to ≥ the container, so nothing is redistributed. */
  _applyTableWidth(table) {
    const cols = this._columns;
    if (!cols.length) return;
    /* Container width: the scroll viewport, with the host as fallback (some
       layouts give the scroll box no intrinsic width of its own). */
    const scroll = table.closest('.ds-data-table__scroll') || table.parentElement;
    const containerW = Math.floor(Math.max(
      scroll ? scroll.clientWidth : 0,
      this.getBoundingClientRect ? this.getBoundingClientRect().width - 2 : 0,
    ));
    const lastId = String(cols[cols.length - 1].id);
    let sumOthers = this._selColWidth || 0;
    cols.forEach((c) => { if (String(c.id) !== lastId) sumOthers += this._colWidths[c.id] || 0; });
    const wanted = this._colWidths[lastId] != null ? this._colWidths[lastId] : 80;
    const lastW = Math.max(wanted, containerW - sumOthers);
    const lastTh = table.querySelector(`thead th[data-col-id="${(window.CSS && CSS.escape) ? CSS.escape(lastId) : lastId}"]`);
    if (lastTh) lastTh.style.width = `${Math.round(lastW)}px`;
    table.style.width = `${Math.round(sumOthers + lastW)}px`;
    /* Column widths changed → frozen sticky offsets must follow. */
    this._applyFrozenOffsets(table);
  }

  /* Frozen columns stick at the cumulative width of the frozen cells before
     them. Measured from the header row (all rows share the column grid). */
  _applyFrozenOffsets(table) {
    if (!this._frozenCount) return;
    const headRow = table.querySelector('thead tr');
    if (!headRow) return;
    const frozenThs = [...headRow.children].filter((th) => th.classList.contains('ds-data-table__cell--frozen'));
    if (!frozenThs.length) return;
    let acc = 0;
    const offsets = frozenThs.map((th) => { const o = acc; acc += th.offsetWidth; return o; });
    table.querySelectorAll('tr').forEach((tr) => {
      [...tr.children].filter((c) => c.classList.contains('ds-data-table__cell--frozen'))
        .forEach((cell, i) => { cell.style.insetInlineStart = `${offsets[i]}px`; });
    });
  }

  /* First interaction freezes every column at its current rendered width EXCEPT
     the last one, which stays auto and soaks up leftover space. Dragging one
     column therefore never reflows the others — only the absorber flexes. */
  _freezeColWidths(table) {
    if (this._colsFrozen) return;
    const ths = [...table.querySelectorAll('thead th[data-col-id]')];
    ths.forEach((th, i) => {
      if (i === ths.length - 1) return; /* absorber column stays auto */
      this._colWidths[th.dataset.colId] = th.offsetWidth;
      th.style.width = `${th.offsetWidth}px`;
    });
    const selTh = table.querySelector('thead th:not([data-col-id])');
    if (selTh) { this._selColWidth = selTh.offsetWidth; selTh.style.width = `${selTh.offsetWidth}px`; }
    this._colsFrozen = true;
    table.classList.add('ds-data-table__table--col-fixed');
    this._applyTableWidth(table);
  }

  _setColWidth(table, th, col, width) {
    const w = Math.max(56, Math.min(2000, Math.round(width)));
    this._colWidths[col.id] = w;
    th.style.width = `${w}px`;
    this._applyTableWidth(table);
    return w;
  }

  _buildColResizer(col, th, table) {
    const rtl = boolAttr(this, 'rtl');
    const handle = document.createElement('div');
    handle.className = 'ds-data-table__col-resizer';
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('aria-label', this._t('resize', typeof col.header === 'string' ? col.header : col.id));
    handle.tabIndex = 0;

    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      this._freezeColWidths(table);
      const startX = e.clientX;
      /* The absorber (last) column has no stored width — start from its DOM size. */
      const startW = this._colWidths[col.id] != null ? this._colWidths[col.id] : th.offsetWidth;
      this.classList.add('is-col-resizing');
      /* Capture keeps the drag alive over iframes/text; not all pointers support
         it (and synthetic events throw) — window listeners are the real backbone. */
      try { handle.setPointerCapture(e.pointerId); } catch (_) { /* no-op */ }
      const onMove = (ev) => {
        const dx = (ev.clientX - startX) * (rtl ? -1 : 1);
        this._setColWidth(table, th, col, startW + dx);
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        this.classList.remove('is-col-resizing');
        this.dispatchEvent(new CustomEvent('ds-table-column-resize', {
          bubbles: true, detail: { columnId: col.id, width: this._colWidths[col.id], widths: { ...this._colWidths } },
        }));
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });

    /* Keyboard: arrows nudge ±8px (mirrored in RTL); Home resets all. */
    handle.addEventListener('keydown', (e) => {
      const grow = e.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      const shrink = e.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      if (!grow && !shrink && e.key !== 'Home') return;
      e.preventDefault();
      if (e.key === 'Home') { this._resetColWidths(); return; }
      this._freezeColWidths(table);
      const base = this._colWidths[col.id] != null ? this._colWidths[col.id] : th.offsetWidth;
      const w = this._setColWidth(table, th, col, base + (grow ? 8 : -8));
      this.dispatchEvent(new CustomEvent('ds-table-column-resize', {
        bubbles: true, detail: { columnId: col.id, width: w, widths: { ...this._colWidths } },
      }));
    });

    /* Double-click a handle → back to automatic layout for every column. */
    handle.addEventListener('dblclick', (e) => { e.preventDefault(); this._resetColWidths(); });
    return handle;
  }

  _resetColWidths() {
    this._colWidths = {};
    this._selColWidth = null;
    this._colsFrozen = false;
    this._render();
    this.dispatchEvent(new CustomEvent('ds-table-column-resize', {
      bubbles: true, detail: { columnId: null, width: null, widths: {}, reset: true },
    }));
  }

  _renderFooter() {
    const footer = document.createElement('div');
    footer.className = 'ds-data-table__footer';

    const opts = (this.getAttribute('rows-per-page-options') || '10,20,50,100')
      .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

    /* Range + page state come from the shared pagination calc so the footer
       and the rendered rows always agree. */
    const { total, rpp, page, pages } = this._pageInfo();
    const start = total === 0 ? 0 : (page - 1) * rpp + 1;
    const end = Math.min(page * rpp, total);
    const isLast = page >= pages;
    const totalNode = String(total);

    footer.innerHTML = `
      <div class="ds-data-table__footer-left">
        <label class="ds-data-table__rpp">
          ${this._t('rpp')}
          <select name="rows-per-page" aria-label="${this._t('rpp')}">
            ${opts.map((o) => `<option value="${o}" ${o === rpp ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
        </label>
        <span class="ds-data-table__range">${start} - ${end} ${this._t('of')} ${totalNode}</span>
      </div>
      <div class="ds-data-table__pagination">
        <ds-button data-page-act="prev" variant="tertiary" size="xsmall"
                   prefix-icon="chevron-left" ${page <= 1 ? 'disabled' : ''}>${this._t('prev')}</ds-button>
        <ds-button data-page-act="next" variant="tertiary" size="xsmall"
                   suffix-icon="chevron-right" ${isLast ? 'disabled' : ''}>${this._t('next')}</ds-button>
      </div>`;

    footer.querySelector('select').addEventListener('change', (e) => {
      const v = parseInt(e.target.value, 10);
      this.setAttribute('page', '1');          // reset to first page on size change
      this.setAttribute('rows-per-page', String(v));
      this.dispatchEvent(new CustomEvent('ds-data-table-rows-per-page', {
        bubbles: true, composed: true, detail: { rowsPerPage: v },
      }));
    });
    footer.querySelectorAll('[data-page-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.hasAttribute('disabled')) return;
        const next = btn.dataset.pageAct === 'next' ? Math.min(pages, page + 1) : Math.max(1, page - 1);
        this.setAttribute('page', String(next));
        this.dispatchEvent(new CustomEvent('ds-data-table-page', {
          bubbles: true, composed: true, detail: { page: next },
        }));
      });
    });
    return footer;
  }

  _renderBulkBar() {
    const bar = document.createElement('div');
    bar.className = 'ds-data-table__bulk-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', this._t('bulkActions'));

    const ids = [...this._selectedIds];
    /* Figma 18191:2197641 — [grip] [actions…] | [count Selected] [×] */
    bar.innerHTML = `
      <span class="ds-data-table__bulk-bar-grip" aria-hidden="true"><ds-icon name="move-vertical" size="16"></ds-icon></span>
      <span class="ds-data-table__bulk-bar-actions">` + this._bulkActions.map((a) => `
        <button class="ds-data-table__bulk-bar-action" data-bulk-id="${a.id}"
                ${a.destructive ? 'data-destructive="true"' : ''}>
          ${a.icon ? `<ds-icon name="${a.icon}" size="16"></ds-icon>` : ''} ${(DT_STRINGS.en[a.id] && a.label === DT_STRINGS.en[a.id]) ? this._t(a.id) : a.label}
        </button>
      `).join('') + `</span>
      <span class="ds-data-table__bulk-bar-divider"></span>
      <span class="ds-data-table__bulk-bar-count"><strong>${ids.length}</strong> ${this._t('selected')}</span>
      <button class="ds-data-table__bulk-bar-close" data-bulk-clear="true" aria-label="${this._t('clearSel')}">
        <ds-icon name="close" size="16"></ds-icon>
      </button>`;

    bar.querySelectorAll('[data-bulk-id]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.bulkId;
        const ids = [...this._selectedIds];
        /* Cancelable: a consumer can preventDefault to take over. Otherwise the
           table runs the built-in behavior for delete / export. */
        const proceed = this.dispatchEvent(new CustomEvent('ds-data-table-bulk-action', {
          bubbles: true, composed: true, cancelable: true, detail: { id, ids },
        }));
        if (!proceed) return;
        if (id === 'delete') this._deleteSelected(ids);
        else if (id === 'export') this._openExportMenu(b, ids);
      });
    });
    bar.querySelector('[data-bulk-clear]').addEventListener('click', () => {
      this._selectedIds.clear();
      this._emitSelection();
      this._render();
    });

    /* Movable: drag the toolbar by its grip. The offset is kept on the instance
       so the bar stays where the user put it across re-renders (selection
       changes rebuild the DOM), and is clamped inside the table card. */
    const applyPos = () => {
      const { x, y } = this._bulkBarPos || { x: 0, y: 0 };
      bar.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
    };
    applyPos();
    const grip = bar.querySelector('.ds-data-table__bulk-bar-grip');
    grip.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const start = this._bulkBarPos || { x: 0, y: 0 };
      const sx = e.clientX, sy = e.clientY;
      bar.classList.add('is-dragging');
      try { grip.setPointerCapture(e.pointerId); } catch (_) { /* no-op */ }
      const onMove = (ev) => {
        let x = start.x + (ev.clientX - sx);
        let y = start.y + (ev.clientY - sy);
        this._bulkBarPos = { x, y };
        applyPos();
        /* Clamp inside the host with a 4px margin (post-apply, so we can
           measure the real rect regardless of the centering transform). */
        const host = this.getBoundingClientRect();
        const r = bar.getBoundingClientRect();
        if (r.left < host.left + 4) x += (host.left + 4) - r.left;
        else if (r.right > host.right - 4) x -= r.right - (host.right - 4);
        if (r.top < host.top + 4) y += (host.top + 4) - r.top;
        else if (r.bottom > host.bottom - 4) y -= r.bottom - (host.bottom - 4);
        this._bulkBarPos = { x, y };
        applyPos();
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        bar.classList.remove('is-dragging');
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });

    return bar;
  }

  /* ===== Built-in bulk actions: Delete · Export · Toast ================= */

  /* Remove the selected rows from the table's own data, clear the selection,
     re-render, sync total-rows, emit ds-data-table-rows-change, and toast. */
  _deleteSelected(ids) {
    const idset = new Set((ids || []).map(String));
    const n = this._rows.filter((r) => idset.has(String(r.id))).length;
    if (!n) return;
    this._rows = this._rows.filter((r) => !idset.has(String(r.id)));
    this._selectedIds.clear();
    if (this.hasAttribute('total-rows') && this.getAttribute('total-rows') !== '#') {
      this.setAttribute('total-rows', String(this._rows.length));
    }
    this._emitSelection();
    this._render();
    this.dispatchEvent(new CustomEvent('ds-data-table-rows-change', {
      bubbles: true, composed: true, detail: { rows: this._rows, removed: ids },
    }));
    this._toast({ status: 'success', title: `${n} ${n === 1 ? 'item' : 'items'} deleted`, description: `${this._rows.length} remaining.` });
  }

  /* Toolbar overflow ("More options") menu — a built-in ds-dropdown-menu with
     Column settings + Export. Column settings has no built-in UI, so it emits
     ds-data-table-column-settings for the host; Export opens the format menu
     over the current (filtered) rows, reusing the bulk-export machinery. */
  _openOverflowMenu(anchorBtn) {
    if (!this._overflowMenu) {
      const menu = document.createElement('ds-dropdown-menu');
      menu.setAttribute('type', 'action');
      menu.style.position = 'fixed';
      menu.style.zIndex = '1300';
      menu.items = [
        { label: this._t('columnSettings'), value: 'column-settings', icon: 'column-settings' },
        { label: this._t('export'),         value: 'export',          icon: 'download' },
      ];
      menu.addEventListener('ds-dropdown-select', (e) => {
        const v = e.detail?.value;
        menu.close();
        if (v === 'export') {
          /* Defer so THIS click finishes bubbling to document before the export
             menu's own outside-click listener is live — otherwise the same click
             would immediately close the menu we just opened. (setTimeout, not rAF:
             it fires even when the tab isn't painting.) */
          setTimeout(() => this._openExportMenu(anchorBtn, this._rows.map((r) => r.id)), 0);
        } else if (v === 'column-settings') {
          this.dispatchEvent(new CustomEvent('ds-data-table-column-settings', {
            bubbles: true, composed: true,
          }));
        }
      });
      document.addEventListener('click', (e) => {
        if (menu.hasAttribute('open') && !menu.contains(e.target) &&
            !(e.target.closest && e.target.closest('[data-act="overflow"]'))) menu.close();
      });
      document.body.appendChild(menu);
      this._overflowMenu = menu;
    }
    if (this._overflowMenu.hasAttribute('open')) { this._overflowMenu.close(); return; }
    this._overflowMenu.openFrom(anchorBtn, { align: 'right', gap: 8 });
  }

  _emitAdvancedFilter() {
    this.dispatchEvent(new CustomEvent('ds-data-table-advanced-filter', { bubbles: true, composed: true }));
  }
  /* Advanced-filter caret menu. No presets → emit ds-data-table-advanced-filter
     (host opens its builder). With presets → a built-in dropdown of saved filters
     + an "Advanced filter…" entry. Items are rebuilt on every open because
     presets are dynamic host data. Selecting a preset emits
     ds-data-table-preset-select { preset }; the last entry emits advanced-filter. */
  _openAdvancedFilterMenu(anchorBtn) {
    const presets = Array.isArray(this._filterPresets) ? this._filterPresets : [];
    const applied = this.hasAttribute('filter-applied') && this.getAttribute('filter-applied') !== 'false';
    /* Nothing to list (no presets) and nothing to clear (not applied) → skip the
       menu and open the builder straight away. Otherwise the menu carries the
       presets and/or the "Clear filter" action. */
    if (!presets.length && !applied) { this._emitAdvancedFilter(); return; }
    if (!this._advFilterMenu) {
      const menu = document.createElement('ds-dropdown-menu');
      menu.setAttribute('type', 'action');
      menu.setAttribute('data-no-truncate', '');   /* saved-filter names show in full */
      menu.style.position = 'fixed';
      menu.style.zIndex = '1300';
      menu.addEventListener('ds-dropdown-select', (e) => {
        const v = e.detail?.value;
        /* Scope selector (All / Mine / Shared) — used when there are many presets.
           Switch scope and rebuild the list in place; keep the menu open. */
        if (typeof v === 'string' && v.indexOf('__scope:') === 0) {
          this._presetScope = v.slice('__scope:'.length);
          menu.items = this._filterMenuItems();
          return;
        }
        menu.close();
        if (v === '__advanced__') { this._emitAdvancedFilter(); return; }
        if (v === '__clear__') { this._clearFilter(); return; }
        const list = Array.isArray(this._filterPresets) ? this._filterPresets : [];
        const preset = list.find((p, i) => String(p.id != null ? p.id : i) === String(v));
        if (preset) this.dispatchEvent(new CustomEvent('ds-data-table-preset-select', {
          bubbles: true, composed: true, detail: { preset },
        }));
      });
      /* A saved-filter row's hover action (share / edit / delete) → re-emit as a
         table event carrying the resolved preset for the host to handle. */
      menu.addEventListener('ds-dropdown-action', (e) => {
        const actionId = e.detail && e.detail.actionId;
        if (actionId === '__clear__') { this._clearFilter(); return; }   /* heading "Clear all" */
        const v = e.detail && e.detail.value;
        const list = Array.isArray(this._filterPresets) ? this._filterPresets : [];
        const preset = list.find((p, i) => String(p.id != null ? p.id : i) === String(v));
        if (preset && actionId) this.dispatchEvent(new CustomEvent('ds-data-table-preset-action', {
          bubbles: true, composed: true, detail: { action: actionId, preset },
        }));
      });
      document.addEventListener('click', (e) => {
        if (menu.hasAttribute('open') && !menu.contains(e.target) &&
            !(e.target.closest && e.target.closest('.ds-data-table__filter'))) menu.close();
      });
      document.body.appendChild(menu);
      this._advFilterMenu = menu;
    }
    const menu = this._advFilterMenu;
    if (menu.hasAttribute('open')) { menu.close(); return; }
    menu.items = this._filterMenuItems();
    menu.openFrom(anchorBtn, { align: 'right', gap: 8 });
  }

  /* Build the advanced-filter caret menu items. Presets are split into "Saved
     filters" (mine) and "Shared with me" (preset.shared) sections; shared rows
     show provenance (preset.owner) and OWNERSHIP-GATED actions — duplicate +
     remove, plus edit only when preset.canEdit — while my rows keep share / edit /
     delete. Past SCOPE_THRESHOLD presets (with both groups present) the two
     sections collapse into a single scoped list with an All / Mine / Shared
     selector. Presets WITHOUT a `shared` flag render exactly as before. */
  _filterMenuItems() {
    const presets = Array.isArray(this._filterPresets) ? this._filterPresets : [];
    const applied = this.hasAttribute('filter-applied') && this.getAttribute('filter-applied') !== 'false';
    const mine = presets.filter((p) => !p.shared);
    const shared = presets.filter((p) => p.shared);
    const SCOPE_THRESHOLD = 10;
    const useScope = presets.length >= SCOPE_THRESHOLD && mine.length > 0 && shared.length > 0;
    const items = [];

    const rowFor = (p) => {
      const pid = String(p.id != null ? p.id : presets.indexOf(p));
      const actions = p.shared
        ? [
            { id: 'duplicate', icon: 'copy', label: this._t('duplicateFilter') },
            ...(p.canEdit ? [{ id: 'edit', icon: 'edit', label: this._t('editFilter') }] : []),
            { id: 'remove', icon: 'remove', label: this._t('removeFilter') },
          ]
        : [
            { id: 'share',  icon: 'share-01', label: this._t('shareFilter') },
            { id: 'edit',   icon: 'edit',     label: this._t('editFilter') },
            { id: 'delete', icon: 'delete',   label: this._t('deleteFilter'), danger: true },
          ];
      return {
        label: p.label != null ? p.label : pid,
        value: pid,
        description: (p.shared && p.owner) ? `${this._t('sharedBy')} ${p.owner}` : undefined,
        selected: this._filterPresetActive != null && String(this._filterPresetActive) === pid,
        actions,
      };
    };

    const clearAction = applied ? { id: '__clear__', label: this._t('clearFilter') } : undefined;

    if (presets.length) {
      if (useScope) {
        const scope = this._presetScope || 'all';
        const scopeRow = (id, key) => ({ label: this._t(key), value: '__scope:' + id, selected: scope === id });
        items.push({ type: 'heading', label: this._t('savedFilters'), action: clearAction });
        items.push(scopeRow('all', 'scopeAll'), scopeRow('mine', 'scopeMine'), scopeRow('shared', 'scopeShared'));
        items.push({ type: 'divider' });
        const scoped = scope === 'mine' ? mine : scope === 'shared' ? shared : presets;
        scoped.forEach((p) => items.push(rowFor(p)));
        items.push({ type: 'divider' });
      } else {
        items.push({ type: 'heading', label: this._t('savedFilters'), action: clearAction });
        mine.forEach((p) => items.push(rowFor(p)));
        if (shared.length) {
          items.push({ type: 'heading', label: this._t('sharedWithMe') });
          shared.forEach((p) => items.push(rowFor(p)));
        }
        items.push({ type: 'divider' });
      }
    }
    /* The create entry reads as a text link (accent) rather than a plain row. */
    items.push({ label: this._t('createAdvancedFilter'), value: '__advanced__', icon: 'add', linkStyle: true });
    /* No saved-filters heading to host the "Clear all" link (no presets) but a
       filter IS applied → keep a bottom "Clear filter" item so clearing stays reachable. */
    if (applied && !presets.length) {
      items.push({ type: 'divider' });
      items.push({ label: this._t('clearFilter'), value: '__clear__', icon: 'close' });
    }
    return items;
  }

  /* Open a format dropdown (CSV / JSON / Excel) anchored to the Export button. */
  _openExportMenu(anchorBtn, ids) {
    this._exportIds = ids;
    if (!this._exportMenu) {
      const menu = document.createElement('ds-dropdown-menu');
      menu.setAttribute('type', 'action');
      menu.style.position = 'fixed';
      menu.style.zIndex = '1300';
      menu.items = [
        { label: 'CSV (.csv)',   value: 'csv',  icon: 'file' },
        { label: 'JSON (.json)', value: 'json', icon: 'file' },
        { label: 'Excel (.xls)', value: 'xls',  icon: 'file' },
      ];
      menu.addEventListener('ds-dropdown-select', (e) => { this._export(e.detail?.value, this._exportIds); menu.close(); });
      document.addEventListener('click', (e) => {
        if (menu.hasAttribute('open') && !menu.contains(e.target) &&
            !(e.target.closest && e.target.closest('[data-bulk-id="export"]'))) menu.close();
      });
      document.body.appendChild(menu);
      this._exportMenu = menu;
    }
    /* positionFrom flips above when there's no room below (bulk bar sits at the
       bottom) and drops below for the top toolbar overflow — and it re-anchors
       to the trigger on scroll, so the menu never detaches from the button. */
    if (this._exportMenu.hasAttribute('open')) { this._exportMenu.close(); return; }
    this._exportMenu.openFrom(anchorBtn, { align: 'left', gap: 8 });
  }

  /* Build CSV / JSON / Excel from the selected rows (column headers + cell
     text, render() HTML stripped) and trigger a download. */
  _export(fmt, ids) {
    const idset = new Set((ids || []).map(String));
    const sel = this._rows.filter((r) => idset.has(String(r.id)));
    const cols = this._columns.filter((c) => c.id !== 'actions');
    const cellText = (col, row) => {
      let v = col.accessor != null ? row[col.accessor] : '';
      if ((v == null || v === '') && typeof col.render === 'function') {
        try {
          const out = col.render(row);
          v = typeof out === 'string' ? out.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : (out && out.textContent) || '';
        } catch (_) { v = ''; }
      }
      return v == null ? '' : String(v);
    };
    let content, name, type;
    if (fmt === 'json') {
      const data = sel.map((row) => { const o = {}; cols.forEach((c) => { o[c.id] = cellText(c, row); }); return o; });
      content = JSON.stringify(data, null, 2); name = 'export.json'; type = 'application/json';
    } else {
      const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
      content = [cols.map((c) => esc(c.header || c.id)).join(',')]
        .concat(sel.map((row) => cols.map((c) => esc(cellText(c, row))).join(','))).join('\n');
      name = fmt === 'xls' ? 'export.xls' : 'export.csv'; type = 'text/csv';
    }
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    const FMT = { csv: 'CSV', json: 'JSON', xls: 'Excel' };
    this._toast({ status: 'success', title: `${sel.length} ${sel.length === 1 ? 'item' : 'items'} exported`, description: `Downloaded as ${FMT[fmt] || 'CSV'}.` });
  }

  /* Lazily-created top-center toast host, shared across all tables. */
  _toast({ status = 'success', title, description } = {}) {
    let host = document.querySelector('.ds-data-table__toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'ds-data-table__toast-host';
      document.body.appendChild(host);
    }
    const t = document.createElement('ds-toast');
    t.setAttribute('status', status);
    t.setAttribute('style-variant', 'subtle');
    t.setAttribute('title', title || '');
    if (description) { t.setAttribute('description', description); t.setAttribute('show-description', ''); }
    t.setAttribute('duration', '4000');
    t.addEventListener('ds-toast-close', () => t.remove());
    host.appendChild(t);
  }

  _toggleSort(columnId) {
    if (this._sort.columnId !== columnId) {
      this._sort = { columnId, direction: 'asc' };
    } else if (this._sort.direction === 'asc') {
      this._sort = { columnId, direction: 'desc' };
    } else {
      this._sort = { columnId: null, direction: null };
    }
    this.dispatchEvent(new CustomEvent('ds-data-table-sort', {
      bubbles: true, composed: true, detail: { ...this._sort },
    }));
    this._render();
  }

  _emitSelection() {
    this.dispatchEvent(new CustomEvent('ds-data-table-selection', {
      bubbles: true, composed: true,
      detail: { ids: [...this._selectedIds] },
    }));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-data-table')) {
  customElements.define('ds-data-table', DsDataTable);
}
