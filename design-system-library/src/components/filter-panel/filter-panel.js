/* =============================================================================
   <ds-filter-panel> — schema-driven filter side panel (Phase 1: docked).
   -----------------------------------------------------------------------------
   Collects filter criteria for a data surface and emits a structured value.
   Owns layout, grouping, active-filter chips, clear-all, and (optional) an
   Apply footer. Each field delegates to an existing Prism input.

   Phase 1 field types: 'checkbox' (multi) · 'radio' (single) · 'select'.
   Later phases add range/date/toggle/tags/segmented/custom, drawer & popover
   modes, counts/async facets, search-within, presets. (See handoff/filter-panel.md)

   USAGE
     const p = document.createElement('ds-filter-panel');
     p.groups = [
       { id:'platform', label:'Platform', type:'checkbox',
         options:[{label:'Windows', value:'win', count:28}, …] },
       { id:'status', label:'Status', type:'radio', options:[…] },
       { id:'owner', label:'Owner', type:'select', multi:true, options:[…] },
     ];
     p.value = { platform:['win'] };            // controlled (optional)
     p.addEventListener('ds-filter-panel-change', e => table.rows = query(e.detail.value));

   ATTRIBUTES
     mode="docked"            presentation (docked only in Phase 1)
     apply-mode="live"        'live' (emit on every change) | 'apply' (footer button)
     collapsible              groups collapse (default on; set "false" to disable)
     show-count               per-option + result counts (default on)
     title="Filters"          header label
     result-count="…"         optional number shown in the header

   PROPERTIES  groups: FilterGroup[]  ·  value: Record<id, string|string[]>
   EVENTS      ds-filter-panel-{change|apply|clear|remove}   detail: { value, … }
   ============================================================================= */

/* Sub-components this panel composes (registers their <ds-*> elements). */
import '../../icons/icon.js';
import '../checkbox/checkbox.js';
import '../radio-group/radio-group.js';
import '../input-select/input-select.js';
import '../tag/tag.js';
import '../button/button.js';
/* Phase 2 field types. */
import '../search-field/search-field.js';
import '../slider/slider.js';
import '../toggle/toggle.js';
import '../date-picker/date-picker.js';
/* Phase 4 field type. */
import '../token-field/token-field.js';

/* Auto-load light-DOM stylesheets once (so this works on pages that link
   filter-panel.css individually, not just the bundled index.css). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-filter-panel-css', './filter-panel.css');
_injectCss('ds-filter-panel-cb-css', '../checkbox/checkbox.css');
_injectCss('ds-filter-panel-rg-css', '../radio-group/radio-group.css');
_injectCss('ds-filter-panel-is-css', '../input-select/input-select.css');
_injectCss('ds-filter-panel-tag-css', '../tag/tag.css');
_injectCss('ds-filter-panel-btn-css', '../button/button.css');
_injectCss('ds-filter-panel-sf-css', '../search-field/search-field.css');
_injectCss('ds-filter-panel-sl-css', '../slider/slider.css');
_injectCss('ds-filter-panel-tg-css', '../toggle/toggle.css');
_injectCss('ds-filter-panel-dp-css', '../date-picker/date-picker.css');
_injectCss('ds-filter-panel-tf-css', '../token-field/token-field.css');

const boolAttr = (el, name, dflt) =>
  el.hasAttribute(name) ? el.getAttribute(name) !== 'false' : dflt;

export class DsFilterPanel extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'apply-mode', 'collapsible', 'show-count', 'title', 'result-count',
            'open', 'collapse-at', 'anchor', 'loading', 'show-search', 'empty-text', 'rtl',
            'fit-viewport', 'fit-gap'];
  }

  constructor() {
    super();
    this._groups = [];
    this._value = {};        // committed / working selection, keyed by group id
    this._controls = {};     // id → the rendered field element
    this._collapsed = {};    // id → bool
    this._dirty = false;     // apply-mode: unapplied changes pending
    this._ready = false;     // gate: ignore sub-component change events fired during render/init
    this._open = false;      // overlay modes (drawer/popover): visible?
    this._trigger = null;    // element that opened the overlay (focus-return target)
    this._prevFocus = null;
    this._narrow = false;    // responsive: container below collapse-at
    this._query = '';        // search-within-filters query
    this._expanded = {};     // id → bool: "show all" for long option lists (+N more)
    /* Reclaim `groups`/`value` assigned BEFORE upgrade (e.g. a host script that
       runs before this module defines the element) — otherwise the assignment
       shadows the prototype setter and the panel renders empty. */
    for (const p of ['groups', 'value']) {
      if (Object.prototype.hasOwnProperty.call(this, p)) { const v = this[p]; delete this[p]; this[p] = v; }
    }
    this._onKeydown = (e) => { if (e.key === 'Escape' && this._open && this._isOverlay()) { e.stopPropagation(); this.close(); } };
    this._onDocPointer = (e) => {
      if (!this._open || this._effectiveMode() !== 'popover') return;
      const path = e.composedPath ? e.composedPath() : [];
      if (path.includes(this._root) || (this._trigger && path.includes(this._trigger))) return;
      /* Composed inputs (ds-input-select / ds-date-picker / ds-token-field) portal
         their dropdown/popover to <body>, so a click on an option is outside our
         root. Treat clicks inside any floating DS layer as inside — else picking a
         select value / date would light-dismiss the popover. */
      if (path.some((n) => n && n.classList && (
        n.classList.contains('ds-input-select__dropdown') ||
        n.classList.contains('ds-date-picker__popover') ||
        n.classList.contains('ds-token-field__dropdown')))) return;
      this.close();
    };
    this._onReposition = () => { if (this._open && this._effectiveMode() === 'popover') this._positionPopover(); };
    this._fitEnabled = false;              // fit-viewport: cap height to the screen (mirrors ds-data-table)
    this._onFit = () => this._fitViewport();
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    document.addEventListener('keydown', this._onKeydown, true);
    document.addEventListener('pointerdown', this._onDocPointer, true);
    window.addEventListener('resize', this._onReposition, true);
    window.addEventListener('scroll', this._onReposition, true);
    this._observeWidth();
    this._render();
    if (this.hasAttribute('fit-viewport') && this.getAttribute('fit-viewport') !== 'false') this._enableFit();
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown, true);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    window.removeEventListener('resize', this._onReposition, true);
    window.removeEventListener('scroll', this._onReposition, true);
    this._ro?.disconnect();
    this._disableFit();
  }
  attributeChangedCallback(name) {
    if (!this._root) return;
    if (name === 'fit-viewport') {
      (this.hasAttribute('fit-viewport') && this.getAttribute('fit-viewport') !== 'false') ? this._enableFit() : this._disableFit();
      return;
    }
    if (name === 'fit-gap') { this._scheduleFit(); return; }
    if (name === 'open') { this._syncOpen(); this._scheduleFit(); return; }   /* toggle visibility only — don't rebuild controls */
    if (name === 'collapse-at') this._observeWidth();
    this._render();
    this._scheduleFit();
  }

  /* fit-viewport: cap the panel to the visible screen so a long filter list
     scrolls inside the panel (body already has overflow-y:auto) instead of
     running past the fold; short lists still hug. Same geometry as ds-data-table
     so a filter sidebar and its table match height. */
  _enableFit() {
    if (this._fitEnabled) return;
    this._fitEnabled = true;
    addEventListener('resize', this._onFit, { passive: true });
    addEventListener('scroll', this._onFit, { passive: true, capture: true });
    /* Recompute when the panel's own box changes — critical for sidebars that are
       hidden then revealed (the grid track animates open), where no scroll/resize
       fires. Target depends only on the panel's top + the scroller bottom (not the
       panel's own height), so the max-height write converges in one extra pass. */
    if (typeof ResizeObserver === 'function') {
      this._fitRO = new ResizeObserver(() => this._scheduleFit());
      this._fitRO.observe(this);
    }
    this._scheduleFit();
  }
  _disableFit() {
    if (!this._fitEnabled) return;
    this._fitEnabled = false;
    removeEventListener('resize', this._onFit, { passive: true });
    removeEventListener('scroll', this._onFit, { passive: true, capture: true });
    this._fitRO?.disconnect(); this._fitRO = null;
    this.style.maxHeight = '';
    this.style.minHeight = '';
  }
  _scheduleFit() {
    if (!this._fitEnabled) return;
    clearTimeout(this._fitT);
    this._fitT = setTimeout(this._onFit, 0);   // fires even when the tab is offscreen (rAF can't)
    requestAnimationFrame(this._onFit);
  }
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
    const scroller = this._scrollAncestor();
    const top = this.getBoundingClientRect().top;
    let target;
    if (scroller) {
      const cs = getComputedStyle(scroller);
      const inset = (parseFloat(cs.paddingBottom) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
      target = scroller.getBoundingClientRect().bottom - inset - top;
    } else {
      const gap = parseInt(this.getAttribute('fit-gap') || '', 10);
      const bottomGap = Number.isFinite(gap) ? gap : 24;
      target = Math.min(window.innerHeight - top - bottomGap, window.innerHeight - bottomGap);
    }
    const next = Math.max(160, Math.round(target)) + 'px';
    if (this.style.maxHeight !== next) { this.style.maxHeight = next; this.style.minHeight = '0'; }
  }

  /* ---- Public API ------------------------------------------------------- */
  get groups() { return this._groups; }
  set groups(v) { this._groups = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  get value() { return { ...this._value }; }
  set value(v) { this._value = (v && typeof v === 'object') ? { ...v } : {}; if (this._root) this._render(); }

  clear() {
    this._value = {};
    this._dirty = this._applyMode === 'apply';
    this._render();
    this._emit('clear', {});
    if (this._applyMode === 'live') this._emit('change', { value: this.value, changed: null });
  }
  apply() { this._dirty = false; this._render(); this._emit('apply', { value: this.value }); }

  /* Overlay control (drawer / popover). `trigger` = element to return focus to. */
  open(trigger) { this._trigger = trigger || this._trigger; this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }
  toggle(trigger) { this.hasAttribute('open') ? this.close() : this.open(trigger); }

  /* ---- Presentation mode ------------------------------------------------ */
  get mode() { const m = this.getAttribute('mode'); return (m === 'drawer' || m === 'popover') ? m : 'docked'; }
  /* Docked auto-collapses to a drawer once its container is below `collapse-at`. */
  _effectiveMode() { return (this.mode === 'docked' && this._narrow) ? 'drawer' : this.mode; }
  _isOverlay() { return this._effectiveMode() !== 'docked'; }

  _observeWidth() {
    const at = parseInt(this.getAttribute('collapse-at') || '', 10);
    this._ro?.disconnect();
    if (!at || this.mode !== 'docked') { this._narrow = false; return; }
    const target = this.parentElement || this;
    const check = () => {
      const narrow = target.getBoundingClientRect().width < at;
      if (narrow !== this._narrow) { this._narrow = narrow; if (this._open && narrow === false) this.close(); this._render(); }
    };
    this._ro = new ResizeObserver(check);
    this._ro.observe(target);
    check();
  }

  _syncOpen() {
    const wasOpen = this._open;
    this._open = this.hasAttribute('open');
    if (!this._isOverlay()) return;             /* docked ignores open state */
    this._root.classList.toggle('is-open', this._open);
    if (this._open && !wasOpen) {
      this._prevFocus = document.activeElement;
      if (this._effectiveMode() === 'popover') this._positionPopover();
      requestAnimationFrame(() => this._focusFirst());
      this._emit('open', {});
    } else if (!this._open && wasOpen) {
      const back = this._trigger || this._prevFocus;
      if (back && back.focus) back.focus();
      this._emit('close', {});
    }
  }

  _focusFirst() {
    const panel = this._root.querySelector('.ds-filter-panel');
    const f = panel && panel.querySelector('button, [href], input, select, textarea, ds-checkbox, ds-radio-group, ds-input-select, [tabindex]:not([tabindex="-1"])');
    (f || panel)?.focus?.();
  }

  /* Anchor the popover card to its trigger (or `anchor` selector); flip up/left if it
     would overflow the viewport. */
  _positionPopover() {
    const card = this._root.querySelector('.ds-filter-panel');
    if (!card) return;
    const anchorSel = this.getAttribute('anchor');
    const anchor = this._trigger || (anchorSel && document.querySelector(anchorSel));
    if (!anchor) return;
    const a = anchor.getBoundingClientRect();
    const w = card.offsetWidth || 280, h = card.offsetHeight || 320, gap = 8, vw = innerWidth, vh = innerHeight;
    let left = a.left, top = a.bottom + gap;
    if (left + w > vw - 8) left = Math.max(8, a.right - w);
    if (top + h > vh - 8) top = Math.max(8, a.top - gap - h);
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  }

  /* Search-within-filters: filter option rows / groups by query without a full
     re-render (keeps the search box focused). Also enforces the "+N more" cap. */
  _applyQuery(q) { this._query = q || ''; this._syncGroupVisibility(); }
  _syncGroupVisibility() {
    const query = (this._query || '').trim().toLowerCase();
    this._root.querySelectorAll('.ds-fp-group').forEach((wrap) => {
      const g = this._group(wrap.dataset.group);
      const cap = (g && g.maxVisible) || 8;
      const expanded = !!this._expanded[wrap.dataset.group];
      const labelMatch = !query || (g?.label || '').toLowerCase().includes(query);
      const checks = [...wrap.querySelectorAll('.ds-fp-checks > ds-checkbox')];
      let matchCount = 0;
      checks.forEach((cb, i) => {
        const matches = !query || labelMatch || (cb.getAttribute('label') || '').toLowerCase().includes(query);
        if (matches) matchCount++;
        cb.style.display = (query ? matches : (expanded || i < cap)) ? '' : 'none';
      });
      const more = wrap.querySelector('.ds-fp-more');
      if (more) {
        more.style.display = (!query && checks.length > cap) ? '' : 'none';
        more.textContent = expanded ? 'Show less' : `Show all (${checks.length})`;
      }
      wrap.style.display = checks.length
        ? ((!query || labelMatch || matchCount > 0) ? '' : 'none')
        : (labelMatch ? '' : 'none');   /* non-checkbox groups filter by label */
    });
  }

  /* ---- Internals -------------------------------------------------------- */
  get _applyMode() { return this.getAttribute('apply-mode') === 'apply' ? 'apply' : 'live'; }
  _emit(type, detail) { this.dispatchEvent(new CustomEvent('ds-filter-panel-' + type, { bubbles: true, detail })); }
  _esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  _group(id) { return this._groups.find((g) => g.id === id); }
  _isMulti(g) { return g.type === 'checkbox' || g.type === 'tags' || (g.type === 'select' && g.multi); }
  _optLabel(g, val) { return (g.options || []).find((o) => o.value === val)?.label ?? val; }
  _debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* Array selection (array-typed groups) — used to init/sync the controls. */
  _selected(id) {
    const v = this._value[id];
    if (Array.isArray(v)) return v;
    return (v === undefined || v === null || v === '') ? [] : [v];
  }
  /* Whether a group currently contributes a filter (drives chips + clear state). */
  _hasValue(id) {
    const v = this._value[id];
    if (v === undefined || v === null || v === '' || v === false) return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }
  _hasAnyFilter() { return this._groups.some((g) => this._hasValue(g.id)); }

  /* Active-filter chips for a group. `key` is what removal drops: an option
     value for multi groups, or '*' (clear the whole group) for scalar/boolean/
     range/date/search. */
  _chipsFor(g) {
    const v = this._value[g.id];
    if (!this._hasValue(g.id)) return [];
    if (this._isMulti(g)) return v.map((val) => ({ key: val, label: this._optLabel(g, val) }));
    switch (g.type) {
      case 'toggle': return [{ key: '*', label: g.toggleLabel || g.label }];
      case 'range':  return [{ key: '*', label: `${g.label}: ${v[0]}–${v[1]}` }];
      case 'date':
      case 'daterange': {
        /* Compact: the range value alone (no redundant group-name prefix), normalized
           to an en-dash. The chip truncates with an ellipsis if still long. */
        const parts = Array.isArray(v) ? v : String(v).split(/\s*[/,]\s*/).filter(Boolean);
        return [{ key: '*', label: parts.join(' – ') }];
      }
      case 'search': return [{ key: '*', label: `“${v}”` }];
      case 'custom': return [{ key: '*', label: g.chipLabel ? g.chipLabel(v) : String(v) }];
      default: return [{ key: '*', label: this._optLabel(g, v) }];   /* radio / single-select */
    }
  }

  /* Commit a group's new value, refresh chips + result state, emit.
     Ignored until the panel is `_ready` — sub-components (e.g. ds-slider) can
     fire a change event during their own init, which must not pollute the
     value or mark apply-mode dirty. */
  _set(id, val) {
    if (!this._ready) return;
    const empty = val === undefined || val === null || val === '' || val === false
      || (Array.isArray(val) && !val.length);
    if (empty) delete this._value[id]; else this._value[id] = val;
    this._renderChips();
    if (this._applyMode === 'live') this._emit('change', { value: this.value, changed: id });
    else { this._dirty = true; this._syncFooter(); }
  }

  _render() {
    this._ready = false;   /* suppress sub-component init events until mounted */
    const rtl = this.hasAttribute('rtl') || this.getAttribute('dir') === 'rtl';
    const collapsible = boolAttr(this, 'collapsible', true);
    const title = this.getAttribute('title') || 'Filters';
    const count = this.getAttribute('result-count');
    this._controls = {};

    const em = this._effectiveMode();
    const overlay = em !== 'docked';
    const loading = this.hasAttribute('loading') && this.getAttribute('loading') !== 'false';
    const showSearch = boolAttr(this, 'show-search', false);
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    const panelInner = `
      <div class="ds-filter-panel__header">
        <span class="ds-filter-panel__title">${this._esc(title)}</span>
        <span class="ds-filter-panel__header-end">
          ${count != null ? `<span class="ds-filter-panel__count">${this._esc(count)}</span>` : ''}
          ${overlay ? '<button type="button" class="ds-fp-close" aria-label="Close filters"><ds-icon name="close" size="18"></ds-icon></button>' : ''}
        </span>
      </div>
      ${showSearch && !loading ? `<div class="ds-filter-panel__toolbar"><ds-search-field class="ds-fp-search" placeholder="Search filters…" value="${this._esc(this._query)}"></ds-search-field></div>` : ''}
      <div class="ds-filter-panel__summary" role="group" aria-label="Active filters" hidden></div>
      <div class="ds-filter-panel__body"></div>
      <div class="ds-filter-panel__footer" hidden></div>`;

    if (overlay) {
      this._root.className = 'ds-fp-host ds-fp-host--' + em + (this._open ? ' is-open' : '');
      this._root.innerHTML =
        '<div class="ds-fp-backdrop"></div>' +
        `<div class="ds-filter-panel" role="dialog" aria-modal="true" tabindex="-1" aria-label="${this._esc(title)}">${panelInner}</div>`;
    } else {
      this._root.className = 'ds-filter-panel';
      this._root.innerHTML = panelInner;
    }

    const body = this._root.querySelector('.ds-filter-panel__body');
    if (loading) {
      body.innerHTML = Array.from({ length: 3 }, () =>
        '<div class="ds-fp-skel-group"><div class="ds-fp-skel ds-fp-skel--title"></div>'
        + '<div class="ds-fp-skel ds-fp-skel--row"></div><div class="ds-fp-skel ds-fp-skel--row"></div><div class="ds-fp-skel ds-fp-skel--row"></div></div>').join('');
    } else if (!this._groups.length) {
      body.innerHTML = `<div class="ds-fp-empty">${this._esc(this.getAttribute('empty-text') || 'No filters available.')}</div>`;
    } else {
      this._groups.forEach((g) => body.appendChild(this._renderGroup(g, collapsible)));
    }

    this._renderChips();
    this._syncFooter();
    if (!loading && this._groups.length) this._syncGroupVisibility();

    if (showSearch && !loading) {
      const sf = this._root.querySelector('.ds-fp-search');
      sf?.addEventListener('ds-search-field-input', (e) => this._applyQuery(e.detail?.value ?? ''));
      sf?.addEventListener('ds-search-field-clear', () => this._applyQuery(''));
      if (this._query) this._applyQuery(this._query);
    }
    if (overlay) {
      this._root.querySelector('.ds-fp-backdrop')?.addEventListener('click', () => this.close());
      this._root.querySelector('.ds-fp-close')?.addEventListener('click', () => this.close());
      if (this._open && em === 'popover') requestAnimationFrame(() => this._positionPopover());
    }
    /* Controls are now mounted; enable user-driven changes once the current task
       (incl. sub-components' synchronous init events) has drained. setTimeout
       fires even when the tab is offscreen (rAF can be throttled there, which
       would otherwise leave the panel permanently inert). */
    const markReady = () => { this._ready = true; };
    setTimeout(markReady, 0);
    requestAnimationFrame(markReady);
  }

  _renderGroup(g, collapsible) {
    const wrap = document.createElement('section');
    wrap.className = 'ds-fp-group';
    wrap.dataset.group = g.id;
    const collapsed = !!this._collapsed[g.id];
    if (collapsed) wrap.classList.add('is-collapsed');

    const head = document.createElement(collapsible ? 'button' : 'div');
    head.className = 'ds-fp-group__head';
    if (collapsible) { head.type = 'button'; head.setAttribute('aria-expanded', String(!collapsed)); }
    head.innerHTML =
      `<span class="ds-fp-group__label">${this._esc(g.label || g.id)}</span>` +
      (collapsible ? `<ds-icon class="ds-fp-group__chevron" name="chevron-down" size="16"></ds-icon>` : '');
    if (collapsible) head.addEventListener('click', () => {
      this._collapsed[g.id] = !this._collapsed[g.id];
      wrap.classList.toggle('is-collapsed', this._collapsed[g.id]);
      head.setAttribute('aria-expanded', String(!this._collapsed[g.id]));
    });
    wrap.appendChild(head);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'ds-fp-group__body';
    const field = this._renderField(g);
    if (field) { bodyEl.appendChild(field); this._controls[g.id] = field; }
    wrap.appendChild(bodyEl);
    return wrap;
  }

  /* Field factory — maps a group's `type` to a Prism input and wires its event. */
  _renderField(g) {
    const showCount = boolAttr(this, 'show-count', true);
    const label = (o) => showCount && o.count != null ? `${o.label} (${o.count})` : o.label;
    const sel = this._selected(g.id);

    if (g.type === 'radio') {
      const el = document.createElement('ds-radio-group');
      el.setAttribute('label-position', 'top');   /* stack options vertically (left = horizontal row) */
      el.options = (g.options || []).map((o) => ({ label: label(o), value: o.value, selected: sel.includes(o.value), disabled: o.disabled }));
      el.addEventListener('ds-radio-group-change', (e) => this._set(g.id, e.detail?.value));
      return el;
    }

    if (g.type === 'select') {
      const el = document.createElement('ds-input-select');
      if (g.multi) el.setAttribute('multi', '');
      el.setAttribute('placeholder', g.placeholder || 'Select…');
      el.setAttribute('show-clear', '');
      el.options = (g.options || []).map((o) => ({ label: label(o), value: o.value, disabled: o.disabled }));
      if (g.multi) el.values = sel; else if (sel[0] != null) el.setAttribute('value', sel[0]);
      el.addEventListener('ds-input-select-change', (e) =>
        this._set(g.id, g.multi ? (e.detail?.values || []) : (e.detail?.value ?? '')));
      el.addEventListener('ds-input-select-clear', () => this._set(g.id, g.multi ? [] : ''));
      return el;
    }

    if (g.type === 'search') {
      const el = document.createElement('ds-search-field');
      el.setAttribute('placeholder', g.placeholder || 'Search…');
      const v0 = this._value[g.id]; if (v0) el.setAttribute('value', v0);
      const push = this._debounce((val) => this._set(g.id, val || ''), 200);
      el.addEventListener('ds-search-field-input', (e) => push(e.detail?.value ?? ''));
      el.addEventListener('ds-search-field-clear', () => this._set(g.id, ''));
      return el;
    }

    if (g.type === 'range') {
      const el = document.createElement('ds-slider');
      const min = g.min ?? 0, max = g.max ?? 100;
      el.setAttribute('type', 'range');
      el.setAttribute('min', min); el.setAttribute('max', max);
      if (g.step != null) el.setAttribute('step', g.step);
      el.setAttribute('show-min-max', '');
      const v0 = this._value[g.id];
      el.setAttribute('value', Array.isArray(v0) ? `${v0[0]},${v0[1]}` : `${min},${max}`);
      /* ds-slider-change fires on release; treat the full span as "no filter". */
      el.addEventListener('ds-slider-change', (e) => {
        const val = e.detail?.value;
        const full = Array.isArray(val) && val[0] === min && val[1] === max;
        this._set(g.id, full ? undefined : val);
      });
      return el;
    }

    if (g.type === 'toggle') {
      const el = document.createElement('ds-toggle');
      el.setAttribute('label', g.toggleLabel || g.label);
      if (this._value[g.id] === true) el.setAttribute('checked', '');
      el.addEventListener('ds-toggle-change', (e) => this._set(g.id, e.detail?.checked === true));
      return el;
    }

    if (g.type === 'date' || g.type === 'daterange') {
      const el = document.createElement('ds-date-picker');
      if (g.type === 'daterange') el.setAttribute('type', 'range');
      if (g.showPresets) el.setAttribute('show-presets', '');
      if (g.showFooter) el.setAttribute('show-footer', '');
      el.setAttribute('placeholder', g.placeholder || (g.type === 'daterange' ? 'Select range' : 'Select date'));
      const v0 = this._value[g.id];
      if (v0 != null && v0 !== '') el.setAttribute('value', Array.isArray(v0) ? v0.join(',') : v0);
      el.addEventListener('ds-date-picker-change', (e) => this._set(g.id, e.detail?.value ?? ''));
      return el;
    }

    if (g.type === 'tags') {
      const el = document.createElement('ds-token-field');
      el.setAttribute('placeholder', g.placeholder || 'Add…');
      el.setAttribute('show-label', 'false');
      el.tokens = sel.map((v) => ({ value: v, label: this._optLabel(g, v) }));
      if (g.options) el.suggestions = g.options.map((o) => ({ value: o.value, label: o.label }));
      const push = () => this._set(g.id, el.values);
      el.addEventListener('ds-token-add', push);
      el.addEventListener('ds-token-remove', push);
      return el;
    }

    /* Escape hatch: author supplies the control via `render({value,setValue,group})`. */
    if (g.type === 'custom' && typeof g.render === 'function') {
      const host = document.createElement('div');
      host.className = 'ds-fp-custom';
      const el = g.render({ value: this._value[g.id], setValue: (v) => this._set(g.id, v), group: g });
      if (el) host.appendChild(el);
      return host;
    }

    /* default → checkbox (multi). Rendered from ds-checkbox primitives so the
       group can carry per-option counts and stay in sync on chip removal.
       Long lists cap at `maxVisible` (default 8) behind a "Show all" toggle. */
    const wrap = document.createElement('div');
    wrap.className = 'ds-fp-field';
    const box = document.createElement('div');
    box.className = 'ds-fp-checks';
    (g.options || []).forEach((o) => {
      const cb = document.createElement('ds-checkbox');
      cb.setAttribute('size', 'small');
      cb.setAttribute('label', label(o));
      cb.dataset.value = o.value;
      if (sel.includes(o.value)) cb.setAttribute('checked', '');
      if (o.disabled) cb.setAttribute('disabled', '');
      cb.addEventListener('ds-checkbox-change', (e) => {
        const on = (e.detail && e.detail.checked != null) ? e.detail.checked : cb.hasAttribute('checked');
        const next = new Set(this._selected(g.id));
        if (on) next.add(o.value); else next.delete(o.value);
        this._set(g.id, [...next]);
      });
      box.appendChild(cb);
    });
    wrap.appendChild(box);
    const cap = g.maxVisible || 8;
    if ((g.options || []).length > cap) {
      const more = document.createElement('button');
      more.type = 'button'; more.className = 'ds-fp-more';
      more.addEventListener('click', () => { this._expanded[g.id] = !this._expanded[g.id]; this._syncGroupVisibility(); });
      wrap.appendChild(more);
    }
    return wrap;
  }

  /* Active-filter chips (one per selected value) + Clear all. */
  _renderChips() {
    const host = this._root.querySelector('.ds-filter-panel__summary');
    if (!host) return;
    const chips = [];
    this._groups.forEach((g) => this._chipsFor(g).forEach((c) =>
      chips.push({ id: g.id, key: c.key, label: c.label })));
    host.hidden = chips.length === 0;
    if (!chips.length) { host.innerHTML = ''; return; }
    host.innerHTML =
      chips.map((c) => `<ds-tag class="ds-fp-chip" variant="subtle" size="medium" show-close data-group="${this._esc(c.id)}" data-key="${this._esc(c.key)}">${this._esc(c.label)}</ds-tag>`).join('') +
      `<button type="button" class="ds-fp-clear">Clear all</button>`;
    host.querySelectorAll('.ds-fp-chip').forEach((t) => t.addEventListener('ds-tag-close', (e) => {
      const el = e.target.closest('[data-group]'); if (!el) return;
      this._removeChip(el.dataset.group, el.dataset.key);
    }));
    host.querySelector('.ds-fp-clear')?.addEventListener('click', () => this.clear());
  }

  /* Remove one chip and push the change back into its control. For multi groups
     the chip key is an option value (drop just that); otherwise clear the group. */
  _removeChip(id, key) {
    const g = this._group(id);
    if (g && this._isMulti(g)) this._set(id, this._selected(id).filter((v) => v !== key));
    else this._set(id, g && g.type === 'toggle' ? false : (g && g.type === 'range' ? undefined : ''));
    this._syncControl(id);
    this._emit('remove', { id, key, filters: this.value });
  }

  /* Reflect this._value back into a control (after chip removal / clear). */
  _syncControl(id) {
    const g = this._group(id);
    const el = this._controls[id];
    if (!g || !el) return;
    const v = this._value[id];
    const sel = this._selected(id);
    switch (g.type) {
      case 'radio': el.value = sel[0] ?? null; break;
      case 'select': if (g.multi) el.values = sel; else el.setAttribute('value', sel[0] || ''); break;
      case 'toggle': el.checked = v === true; break;
      case 'search': el.value = v || ''; break;
      case 'date': case 'daterange': el.value = Array.isArray(v) ? v.join(',') : (v || ''); break;
      case 'range': el.value = Array.isArray(v) ? v : [g.min ?? 0, g.max ?? 100]; break;
      case 'tags': el.tokens = sel.map((val) => ({ value: val, label: this._optLabel(g, val) })); break;
      case 'custom': g.sync && g.sync(v, el); break;
      default: el.querySelectorAll('ds-checkbox').forEach((cb) => cb.toggleAttribute('checked', sel.includes(cb.dataset.value)));
    }
  }

  _syncFooter() {
    const foot = this._root.querySelector('.ds-filter-panel__footer');
    if (!foot) return;
    if (this._applyMode !== 'apply') { foot.hidden = true; foot.innerHTML = ''; return; }
    const n = this._groups.reduce((a, g) => a + (this._hasValue(g.id) ? 1 : 0), 0);
    foot.hidden = false;
    foot.innerHTML =
      `<ds-button class="ds-fp-clear-btn" variant="outline" size="medium"${this._hasAnyFilter() ? '' : ' disabled'}>Clear</ds-button>` +
      `<ds-button class="ds-fp-apply-btn" variant="primary" size="medium"${this._dirty ? '' : ' disabled'}>Apply${n ? ` (${n})` : ''}</ds-button>`;
    foot.querySelector('.ds-fp-clear-btn')?.addEventListener('click', () => this.clear());
    foot.querySelector('.ds-fp-apply-btn')?.addEventListener('click', () => this.apply());
  }
}

if (!customElements.get('ds-filter-panel')) customElements.define('ds-filter-panel', DsFilterPanel);
