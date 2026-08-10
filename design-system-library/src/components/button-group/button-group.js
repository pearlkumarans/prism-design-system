/* =============================================================================
   <ds-button-group>
   A group of value-bearing buttons — a segmented picker (single), a multi-select
   toggle grid (months / weekdays), or an action toolbar (none). One primitive,
   three selection modes with the correct WAI-ARIA pattern for each.

     grp.items = [
       { value: 'jan', label: 'Jan' },
       { value: 'feb', label: 'Feb', selected: true },
       { value: 'mar', label: 'Mar', disabled: true },
       { value: 'save', label: 'Save', icon: 'check', ariaLabel: 'Save' },
     ];
     grp.value  = 'feb';          // single (string)  |  grp.values → string[]
     grp.values = ['jan','feb'];  // multi

   Attributes:
     selection-mode  single | multi | none      (default single)
     layout          row | grid | column         (default row)
     columns         <int>   — grid track count (6 = months, 7 = weekdays)
     variant         separated | attached        (default separated)
     size            small | medium | large       (default medium)
     value           string / comma list (reflected selection)
     equal           boolean — items share equal width
     full-width      boolean — group stretches to its container
     disabled        boolean — disables the whole group
     label           string  — accessible name for the group
     rtl             boolean

   Accessibility per mode:
     single → role=radiogroup, items role=radio + aria-checked; arrows move & select
     multi  → role=group,      items aria-pressed;             Space/Enter toggles
     none   → role=group,      plain buttons, no pressed state; Enter activates
   All modes: roving tabindex (one Tab stop), Home/End, grid arrow mapping, RTL.

   Events:
     ds-button-group-change      → { value }  (single)  |  { values }  (multi)
     ds-button-group-item-click  → { value }  (none / action mode)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../../icons/icon.js';
/* Select-all / deselect-all uses the real <ds-text-link> component. */
import '../text-link/text-link.js';

const MODES   = ['single', 'multi', 'none'];
const LAYOUTS = ['row', 'grid', 'column'];
const VARIANTS = ['separated', 'attached'];
const SIZES   = ['small', 'medium', 'large'];
const LABEL_POSITIONS = ['none', 'left', 'top'];
let bgUid = 0;

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class DsButtonGroup extends HTMLElement {
  static get observedAttributes() {
    return ['selection-mode', 'layout', 'columns', 'variant', 'size', 'value', 'equal', 'full-width', 'disabled', 'rtl', 'label',
      'label-position', 'show-select-all', 'select-all-label', 'deselect-all-label'];
  }

  constructor() {
    super();
    this._uid = ++bgUid;
    /* Allow `el.items = [...]` set before the element upgrades. */
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items; delete this.items; this._pending = v;
    }
    this._items = [];
    this._btns = [];
    this._focusIdx = 0;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._mounted = true;
      this.addEventListener('click', this._onClick);
      this.addEventListener('keydown', this._onKeydown);
      /* Keep the roving index in sync with wherever focus actually lands (mouse,
         SR virtual cursor, programmatic) so arrow keys always start from there. */
      this.addEventListener('focusin', this._onFocusin);
      /* Seed the reflected `value` from items' `selected` flags when the caller
         didn't provide one, so selection has a single source of truth. */
      if (!this.hasAttribute('value')) {
        const sel = this._items.filter((o) => o.selected).map((o) => o.value);
        if (sel.length) this.setAttribute('value', sel.join(','));
      }
    }
    if (this._pending !== undefined) { this.items = this._pending; this._pending = undefined; }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    /* Selection-only changes just repaint (keeps DOM + focus); anything structural
       rebuilds the buttons. */
    if (name === 'value') this._paint();
    else this._render();
  }

  /* ---- Public API --------------------------------------------------------- */
  get items() { return this._items; }
  set items(v) { this._items = Array.isArray(v) ? v.map((o) => ({ ...o })) : []; if (this._mounted) this._render(); }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v == null ? '' : String(v)); }

  get values() { return (this.getAttribute('value') || '').split(',').map((s) => s.trim()).filter(Boolean); }
  set values(arr) { this.setAttribute('value', (Array.isArray(arr) ? arr : []).join(',')); }

  /* Bulk selection (multi mode). No-ops in single/none. Enabled items only —
     disabled items are never selectable and are excluded from `value`. */
  selectAll()   { if (this._mode() === 'multi') this._setValues(this._enabledValues()); }
  deselectAll() { if (this._mode() === 'multi') this._setValues([]); }
  toggleAll()   { if (this._mode() === 'multi') (this._allSelected() ? this.deselectAll() : this.selectAll()); }

  _enabledValues() { return this._items.filter((o, i) => !this._isDisabled(i)).map((o) => o.value); }
  _allSelected() {
    const enabled = this._enabledValues();
    if (!enabled.length) return false;
    const sel = this._selectedSet();
    return enabled.every((v) => sel.has(v));
  }
  /* Reflect a new multi-selection (item order preserved) + emit change. */
  _setValues(arr) {
    const ordered = this._items.filter((it) => arr.includes(it.value)).map((it) => it.value);
    if (ordered.join(',') === this.value) return;         // no-op if unchanged
    this.setAttribute('value', ordered.join(','));
    this.dispatchEvent(new CustomEvent('ds-button-group-change', { bubbles: true, composed: true, detail: { values: ordered } }));
  }

  /* ---- Internals ---------------------------------------------------------- */
  _mode()   { return enumAttr(this, 'selection-mode', MODES, 'single'); }
  _layout() { return enumAttr(this, 'layout', LAYOUTS, 'row'); }
  _cols()   { const n = parseInt(this.getAttribute('columns'), 10); return Number.isFinite(n) && n > 0 ? n : 0; }
  _selectedSet() { return new Set(this.values); }
  _isDisabled(i) { return boolAttr(this, 'disabled') || !!(this._items[i] && this._items[i].disabled); }
  _firstEnabled(dir) {
    const n = this._items.length;
    for (let k = 0; k < n; k++) { const i = dir < 0 ? n - 1 - k : k; if (!this._isDisabled(i)) return i; }
    return 0;
  }

  _render() {
    const mode = this._mode();
    const layout = this._layout();
    const cols = this._cols();
    const variant = enumAttr(this, 'variant', VARIANTS, 'separated');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const rtl = boolAttr(this, 'rtl');
    const groupDisabled = boolAttr(this, 'disabled');

    /* A group can render as a bare set of buttons (host IS the group — the
       default for standalone segmented controls) OR as a form field with a
       visible label and/or a Select-all action. In the latter "wrap" mode the
       buttons move into an inner __track (which carries the group role + layout)
       and the host becomes a wrapper: [label-col?] [field-col: (select-all) + track].
       Label sits in a 280px left column (label-position="left") — inline with
       every other Prism form field — or above the group (label-position="top"). */
    const labelPos = enumAttr(this, 'label-position', LABEL_POSITIONS, 'none');
    const label = this.getAttribute('label') || '';
    const hasLabel = !!label && labelPos !== 'none';
    const showSelectAll = boolAttr(this, 'show-select-all') && mode === 'multi';
    const wrap = hasLabel || showSelectAll;

    this.classList.add('ds-button-group');
    this.classList.toggle('ds-button-group--wrap', wrap);
    this.classList.toggle('ds-button-group--label-left', wrap && hasLabel && labelPos === 'left');
    this.classList.toggle('ds-button-group--label-top', wrap && hasLabel && labelPos === 'top');
    if (rtl) this.setAttribute('dir', 'rtl'); else this.removeAttribute('dir');
    /* Layout / variant / size / state classes belong on the element that holds
       the buttons — clear them off the host so they only ever live on the track. */
    [...LAYOUTS.map((l) => `ds-button-group--${l}`), ...SIZES.map((s) => `ds-button-group--size-${s}`),
      'ds-button-group--attached', 'ds-button-group--equal', 'ds-button-group--full-width', 'ds-button-group--disabled']
      .forEach((c) => this.classList.remove(c));
    if (!wrap) { this.removeAttribute('role'); this.removeAttribute('aria-label'); this.removeAttribute('aria-disabled'); this.removeAttribute('aria-labelledby'); this.style.removeProperty('--ds-bg-cols'); }

    const iconPx = size === 'small' ? 14 : size === 'large' ? 18 : 16;
    const buttonsHtml = this._items.map((o, i) => {
      const disabled = groupDisabled || !!o.disabled;
      const roleAttr = mode === 'single' ? ' role="radio"' : '';
      const icon = o.icon ? `<ds-icon class="ds-button-group__icon" name="${esc(o.icon)}" size="${iconPx}"></ds-icon>` : '';
      const text = (o.label != null && o.label !== '') ? `<span class="ds-button-group__label">${esc(o.label)}</span>` : '';
      const aria = o.ariaLabel ? ` aria-label="${esc(o.ariaLabel)}"` : '';
      return `<button type="button" class="ds-button-group__item"${roleAttr}${aria}`
        + ` data-index="${i}"${disabled ? ' disabled' : ''}>${icon}${text}</button>`;
    }).join('');

    const lblId = `ds-bg-${this._uid}-lbl`;
    if (wrap) {
      const labelHtml = hasLabel
        ? `<div class="ds-button-group__label-col"><label class="ds-button-group__grp-label" id="${lblId}">${esc(label)}</label></div>`
        : '';
      /* Select-all row. When there's no positioned label but a `label` is set
         (legacy header usage), the label rides at the start of this row and the
         link at the end (space-between); otherwise the link right-aligns. */
      const inlineLabel = (!hasLabel && label) ? esc(label) : '';
      const selectAllHtml = showSelectAll
        ? `<div class="ds-button-group__actions"><span class="ds-button-group__actions-label">${inlineLabel}</span>`
          + `<ds-text-link class="ds-button-group__select-all" href="#" size="small"></ds-text-link></div>`
        : '';
      this.innerHTML = labelHtml
        + `<div class="ds-button-group__field-col">${selectAllHtml}<div class="ds-button-group__track">${buttonsHtml}</div></div>`;
      this._track = this.querySelector('.ds-button-group__track');
      this._selectAllBtn = this.querySelector('.ds-button-group__select-all');
    } else {
      this.innerHTML = buttonsHtml;
      this._track = this;
      this._selectAllBtn = null;
    }

    /* Apply the group's layout + role to the track (host itself in the bare case). */
    const track = this._track;
    if (track !== this) track.classList.add('ds-button-group');
    LAYOUTS.forEach((l) => track.classList.toggle(`ds-button-group--${l}`, layout === l));
    SIZES.forEach((s) => track.classList.toggle(`ds-button-group--size-${s}`, size === s));
    track.classList.toggle('ds-button-group--attached', variant === 'attached');
    track.classList.toggle('ds-button-group--equal', boolAttr(this, 'equal'));
    track.classList.toggle('ds-button-group--full-width', boolAttr(this, 'full-width'));
    track.classList.toggle('ds-button-group--disabled', groupDisabled);
    if (layout === 'grid' && cols) track.style.setProperty('--ds-bg-cols', String(cols));
    else track.style.removeProperty('--ds-bg-cols');
    track.setAttribute('role', mode === 'single' ? 'radiogroup' : 'group');
    /* Accessible name: point at the visible label when there is one, else fall
       back to `aria-label`. */
    if (hasLabel) { track.setAttribute('aria-labelledby', lblId); track.removeAttribute('aria-label'); }
    else if (label) { track.setAttribute('aria-label', label); track.removeAttribute('aria-labelledby'); }
    else { track.removeAttribute('aria-label'); track.removeAttribute('aria-labelledby'); }
    if (groupDisabled) track.setAttribute('aria-disabled', 'true'); else track.removeAttribute('aria-disabled');

    this._btns = Array.from(this.querySelectorAll('.ds-button-group__item'));
    this._paint();
  }

  /* Selection + roving-tabindex state only — no DOM rebuild, so focus survives. */
  _paint() {
    if (!this._btns.length) return;
    const mode = this._mode();
    const sel = this._selectedSet();

    /* Choose the single tab stop: the selected item (single mode) else the last
       focused / first enabled item. */
    if (this._focusIdx == null || this._isDisabled(this._focusIdx)) this._focusIdx = this._firstEnabled(1);
    if (mode === 'single') {
      const s = this._items.findIndex((o) => sel.has(o.value) && !o.disabled);
      if (s >= 0) this._focusIdx = s;
    }

    this._btns.forEach((btn, i) => {
      const o = this._items[i]; if (!o) return;
      const on = sel.has(o.value);
      if (mode === 'single') btn.setAttribute('aria-checked', String(on));
      else if (mode === 'multi') btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('is-selected', mode !== 'none' && on);
      /* Roving tabindex: exactly one 0, everything else -1 (disabled → -1). */
      const stop = i === this._focusIdx && !this._isDisabled(i);
      btn.tabIndex = stop ? 0 : -1;
    });

    /* Select-all <ds-text-link> — its label reflects whether all is selected. */
    if (this._selectAllBtn) {
      const all = this._allSelected();
      this._selectAllBtn.setAttribute('label', all
        ? (this.getAttribute('deselect-all-label') || 'Deselect all')
        : (this.getAttribute('select-all-label') || 'Select all'));
      const off = boolAttr(this, 'disabled') || !this._enabledValues().length;
      if (off) this._selectAllBtn.setAttribute('disabled', ''); else this._selectAllBtn.removeAttribute('disabled');
    }
  }

  _activate(idx) {
    const o = this._items[idx];
    if (!o || this._isDisabled(idx)) return;
    const mode = this._mode();
    if (mode === 'none') {
      this.dispatchEvent(new CustomEvent('ds-button-group-item-click', { bubbles: true, composed: true, detail: { value: o.value } }));
      return;
    }
    if (mode === 'single') {
      this._focusIdx = idx;
      if (this.value === o.value) return;             // already selected → no-op
      this.setAttribute('value', o.value);            // → attributeChangedCallback → _paint
      this.dispatchEvent(new CustomEvent('ds-button-group-change', { bubbles: true, composed: true, detail: { value: o.value } }));
    } else {                                          // multi
      const sel = this._selectedSet();
      sel.has(o.value) ? sel.delete(o.value) : sel.add(o.value);
      const ordered = this._items.filter((it) => sel.has(it.value)).map((it) => it.value);   // keep item order
      this._focusIdx = idx;
      this.setAttribute('value', ordered.join(','));
      this.dispatchEvent(new CustomEvent('ds-button-group-change', { bubbles: true, composed: true, detail: { values: ordered } }));
    }
  }

  _onFocusin = (e) => {
    const btn = e.target.closest && e.target.closest('.ds-button-group__item');
    if (!btn) return;
    const i = this._btns.indexOf(btn);
    if (i >= 0 && i !== this._focusIdx) { this._focusIdx = i; this._paint(); }
  };

  _onClick = (e) => {
    if (this._selectAllBtn && e.target.closest('.ds-button-group__select-all')) { e.preventDefault(); this.toggleAll(); return; }
    const btn = e.target.closest('.ds-button-group__item');
    if (!btn || !this.contains(btn)) return;
    const idx = this._btns.indexOf(btn);
    if (idx < 0 || this._isDisabled(idx)) return;
    this._focusIdx = idx;
    this._activate(idx);
    this._paint();
  };

  _onKeydown = (e) => {
    if (boolAttr(this, 'disabled')) return;
    /* Only handle keys aimed at a group item — leave the select-all link (and any
       other header control) to its own native button behaviour. */
    if (!(e.target.closest && e.target.closest('.ds-button-group__item'))) return;
    const layout = this._layout();
    const cols = layout === 'grid' ? (this._cols() || 1) : 1;
    const rtl = boolAttr(this, 'rtl');
    const fwd = rtl ? -1 : 1;
    const from = this._focusIdx;
    let next = null;

    switch (e.key) {
      case 'ArrowRight': next = this._step(from, fwd); break;
      case 'ArrowLeft':  next = this._step(from, -fwd); break;
      case 'ArrowDown':  next = this._step(from, layout === 'grid' ? cols : 1); break;
      case 'ArrowUp':    next = this._step(from, layout === 'grid' ? -cols : -1); break;
      case 'Home':       next = this._firstEnabled(1); break;
      case 'End':        next = this._firstEnabled(-1); break;
      case ' ':
      case 'Enter':      e.preventDefault(); this._activate(from); this._paint(); this._btns[this._focusIdx]?.focus(); return;
      default: return;
    }
    if (next == null || next === from) { e.preventDefault(); return; }
    e.preventDefault();
    this._focusIdx = next;
    /* Radiogroup pattern: moving the selection also selects. Toggle/action groups
       move focus only. */
    if (this._mode() === 'single') this._activate(next);
    this._paint();
    this._btns[this._focusIdx]?.focus();
  };

  /* Step by `delta` skipping disabled items; no wrap (predictable in a grid). */
  _step(from, delta) {
    let i = from;
    for (;;) {
      i += delta;
      if (i < 0 || i >= this._items.length) return null;
      if (!this._isDisabled(i)) return i;
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-button-group')) {
  customElements.define('ds-button-group', DsButtonGroup);
}
