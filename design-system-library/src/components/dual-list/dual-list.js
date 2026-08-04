/* =============================================================================
   <ds-dual-list
       available-label="Available" selected-label="Selected"
       searchable move-all reorderable grouped
       loading readonly error error-message="…"
       search-placeholder="Search…">
   </ds-dual-list>

   Dual list selection ("shuttle" / transfer / pick-list). Two panels — Available
   and Selected — with per-item checkboxes and transfer controls that move checked
   items between them. Composes existing primitives only:
     ds-checkbox · ds-search-field · ds-badge · ds-icon-button · ds-text-link ·
     ds-field-helper · ds-icon
   No hardcoded visual values — all styling comes from design tokens in dual-list.css.

   Data (JS property or `items` JSON attribute):
     el.items = {
       available: [{ id, label, group?, locked?, disabled? }],
       selected:  [{ id, label, group?, locked?, disabled? }],
     }
   `locked` items live in Selected and cannot be moved back or deselected.

   Emits `ds-dual-list-change` → detail { available:[ids], selected:[ids] }.
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
import '../checkbox/checkbox.js';
import '../search-field/search-field.js';
import '../text-link/text-link.js';
import '../icon-button/icon-button.js';
import '../tooltip/tooltip.js';           /* ds-icon-button renders a ds-tooltip for its label */
import '../field-helper/field-helper.js';
import '../../icons/icon.js';

/* Light-DOM components need their own stylesheet present even when the page
   loads dual-list.css on its own — inject each dependency's CSS once. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
[
  ['ds-dl-checkbox-css', '../checkbox/checkbox.css'],
  ['ds-dl-search-css', '../search-field/search-field.css'],
  ['ds-dl-textlink-css', '../text-link/text-link.css'],
  ['ds-dl-iconbtn-css', '../icon-button/icon-button.css'],
  ['ds-dl-tooltip-css', '../tooltip/tooltip.css'],
  ['ds-dl-fieldhelper-css', '../field-helper/field-helper.css'],
].forEach(([id, rel]) => _injectCss(id, rel));

let uid = 0;

export class DsDualList extends HTMLElement {
  static get observedAttributes() {
    return [
      'available-label', 'selected-label', 'search-placeholder',
      'searchable', 'move-all', 'reorderable', 'grouped',
      'loading', 'readonly', 'error', 'error-message', 'items',
    ];
  }

  constructor() {
    super();
    this._available = [];
    this._selected = [];
    this._q = { available: '', selected: '' };
    this._uid = ++uid;
  }

  connectedCallback() {
    if (!this._built) {
      if (this.hasAttribute('items')) this._parseItemsAttr();
      this._build();
      this._built = true;
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._built) return;
    if (name === 'items') this._parseItemsAttr();
    this._render();
  }

  /* ---- data ---------------------------------------------------------- */
  get items() {
    return {
      available: this._available.map((i) => i.id),
      selected: this._selected.map((i) => i.id),
    };
  }

  set items(v) {
    const norm = (arr) => (Array.isArray(arr) ? arr : []).map((it) => ({
      id: String(it.id),
      label: it.label ?? String(it.id),
      group: it.group ?? null,
      locked: !!it.locked,
      disabled: !!it.disabled,
      _checked: false,
    }));
    this._available = norm(v && v.available);
    this._selected = norm(v && v.selected);
    if (this._built) this._render();
  }

  _parseItemsAttr() {
    try {
      const parsed = JSON.parse(this.getAttribute('items'));
      this.items = parsed;
    } catch (_) { /* ignore malformed JSON */ }
  }

  /* ---- boolean controls (reflected props; every one defaults to false) ---
     e.g. `el.moveAll` returns false unless `move-all` is set; `el.moveAll = true`
     shows the move-all buttons. */
  _reflectBool(attr, v) { if (v) this.setAttribute(attr, ''); else this.removeAttribute(attr); }
  get moveAll()      { return boolAttr(this, 'move-all'); }
  set moveAll(v)     { this._reflectBool('move-all', v); }
  get searchable()   { return boolAttr(this, 'searchable'); }
  set searchable(v)  { this._reflectBool('searchable', v); }
  get reorderable()  { return boolAttr(this, 'reorderable'); }
  set reorderable(v) { this._reflectBool('reorderable', v); }
  get grouped()      { return boolAttr(this, 'grouped'); }
  set grouped(v)     { this._reflectBool('grouped', v); }
  get loading()      { return boolAttr(this, 'loading'); }
  set loading(v)     { this._reflectBool('loading', v); }
  get readonly()     { return boolAttr(this, 'readonly'); }
  set readonly(v)    { this._reflectBool('readonly', v); }
  get error()        { return boolAttr(this, 'error'); }
  set error(v)       { this._reflectBool('error', v); }

  /* ---- static structure --------------------------------------------- */
  _build() {
    this.classList.add('ds-dual-list');
    this.innerHTML = '';

    this._panelAvail = this._buildPanel('available');
    this._controls = this._buildControls();
    this._panelSel = this._buildPanel('selected');

    const body = document.createElement('div');
    body.className = 'ds-dual-list__body';
    body.append(this._panelAvail.root, this._controls, this._panelSel.root);

    /* Error/helper row + polite live region for move announcements. */
    this._helper = document.createElement('ds-field-helper');
    this._helper.className = 'ds-dual-list__helper';
    this._helper.setAttribute('state', 'error');
    this._helper.hidden = true;

    this._live = document.createElement('div');
    this._live.className = 'ds-dual-list__sr';
    this._live.setAttribute('aria-live', 'polite');

    this.append(body, this._helper, this._live);

    /* Delegated events. */
    this.addEventListener('ds-checkbox-change', (e) => this._onCheck(e));
    this.addEventListener('ds-search-field-input', (e) => this._onSearch(e));

    /* Drag & drop — an enhancement alongside the checkbox + transfer buttons
       (which remain the accessible path). Rows are draggable; each panel's list
       is a drop target. */
    this.addEventListener('dragstart', (e) => this._onDragStart(e));
    this.addEventListener('dragend', () => this._onDragEnd());
    [this._panelAvail, this._panelSel].forEach((p) => {
      p.list.addEventListener('dragover', (e) => this._onDragOver(e, p));
      p.list.addEventListener('dragleave', (e) => this._onDragLeave(e, p));
      p.list.addEventListener('drop', (e) => this._onDrop(e, p));
    });
  }

  _buildPanel(side) {
    const root = document.createElement('section');
    root.className = 'ds-dual-list__panel';
    root.dataset.side = side;
    root.setAttribute('role', 'group');

    const titleId = `ds-dl-${this._uid}-${side}-title`;
    root.setAttribute('aria-labelledby', titleId);

    const header = document.createElement('div');
    header.className = 'ds-dual-list__header';
    const headLeft = document.createElement('div');
    headLeft.className = 'ds-dual-list__head-left';
    const title = document.createElement('span');
    title.className = 'ds-dual-list__title';
    title.id = titleId;
    headLeft.append(title);

    const link = document.createElement('ds-text-link');
    link.className = 'ds-dual-list__toggle-all';
    link.setAttribute('variant', 'primary');
    link.setAttribute('size', 'small');
    link.setAttribute('underline', 'hover');
    link.dataset.side = side;
    /* Set the (static) label BEFORE the element upgrades — ds-text-link captures
       its text at connect and rebuilds an inner <a>; setting textContent later
       would wipe that anchor and leave raw, unstyled 16px text. */
    link.textContent = side === 'available' ? 'Select all' : 'Deselect all';
    link.addEventListener('click', (e) => { e.preventDefault(); this._toggleAll(side); });

    header.append(headLeft, link);

    const searchWrap = document.createElement('div');
    searchWrap.className = 'ds-dual-list__search';
    const search = document.createElement('ds-search-field');
    search.setAttribute('size', 'small');
    search.dataset.side = side;
    searchWrap.appendChild(search);

    const list = document.createElement('div');
    list.className = 'ds-dual-list__list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-multiselectable', 'true');
    list.setAttribute('aria-labelledby', titleId);

    root.append(header, searchWrap, list);
    return { root, title, link, searchWrap, search, list };
  }

  _buildControls() {
    const wrap = document.createElement('div');
    wrap.className = 'ds-dual-list__controls';

    /* Transfer controls use the standard ds-icon-button (outline). The sprite
       has no double-chevron, so move-all uses the distinct arrow-narrow glyph
       and single moves use the chevron. */
    const mk = (action, icon, label) => {
      const btn = document.createElement('ds-icon-button');
      btn.className = 'ds-dual-list__ctrl';
      btn.setAttribute('type', 'tertiary-grey');
      btn.setAttribute('shape', 'square');
      btn.setAttribute('size', 'xl');
      btn.setAttribute('icon', icon);
      btn.setAttribute('label', label);        /* label auto-shows a tooltip on hover/focus */
      btn.dataset.action = action;
      btn.addEventListener('click', () => { if (!btn.hasAttribute('disabled')) this._onCtrl(action); });
      return btn;
    };

    this._btnAllRight = mk('all-right', 'arrow-narrow-right', 'Move all to Selected');
    this._btnRight = mk('right', 'chevron-right', 'Move selected to Selected');
    this._btnLeft = mk('left', 'chevron-left', 'Move selected to Available');
    this._btnAllLeft = mk('all-left', 'arrow-narrow-left', 'Move all to Available');
    this._btnUp = mk('up', 'chevron-up', 'Move item up');
    this._btnDown = mk('down', 'chevron-down', 'Move item down');

    wrap.append(this._btnAllRight, this._btnRight, this._btnLeft, this._btnAllLeft);
    this._reorderGroup = document.createElement('div');
    this._reorderGroup.className = 'ds-dual-list__reorder';
    this._reorderGroup.append(this._btnUp, this._btnDown);
    wrap.append(this._reorderGroup);
    return wrap;
  }

  /* ---- render -------------------------------------------------------- */
  _render() {
    const searchable = boolAttr(this, 'searchable');
    const moveAll = boolAttr(this, 'move-all');
    const reorderable = boolAttr(this, 'reorderable');
    const loading = boolAttr(this, 'loading');
    const readonly = boolAttr(this, 'readonly');
    const error = boolAttr(this, 'error');

    this.classList.toggle('ds-dual-list--loading', loading);
    this.classList.toggle('ds-dual-list--readonly', readonly);
    this.classList.toggle('ds-dual-list--error', error);
    this.classList.toggle('ds-dual-list--move-all', moveAll);


    const placeholder = this.getAttribute('search-placeholder') || 'Search…';
    [this._panelAvail, this._panelSel].forEach((p) => {
      p.searchWrap.hidden = !searchable || readonly;
      p.search.setAttribute('placeholder', placeholder);
      if (loading) p.search.setAttribute('disabled', ''); else p.search.removeAttribute('disabled');
      p.link.hidden = readonly;
      if (loading) p.link.setAttribute('disabled', ''); else p.link.removeAttribute('disabled');
    });

    /* Move-all / reorder button visibility. */
    this._btnAllRight.hidden = !moveAll;
    this._btnAllLeft.hidden = !moveAll;
    this._reorderGroup.hidden = !reorderable;
    this._controls.hidden = readonly;

    this._renderList('available');
    this._renderList('selected');
    this._syncCounts();
    this._syncButtons();

    /* Error helper row. */
    const msg = this.getAttribute('error-message') || '';
    this._helper.hidden = !(error && msg);
    if (error && msg) {
      this._helper.setAttribute('text', msg);
      const descId = `ds-dl-${this._uid}-err`;
      this._helper.id = descId;
      this._panelAvail.root.setAttribute('aria-invalid', 'true');
      this._panelSel.root.setAttribute('aria-invalid', 'true');
      this._panelAvail.list.setAttribute('aria-describedby', descId);
    } else {
      this._panelAvail.root.removeAttribute('aria-invalid');
      this._panelSel.root.removeAttribute('aria-invalid');
    }
  }

  _visible(side) {
    const q = this._q[side].trim().toLowerCase();
    const src = side === 'available' ? this._available : this._selected;
    if (!q) return src;
    return src.filter((it) => it.label.toLowerCase().includes(q));
  }

  _renderList(side) {
    const panel = side === 'available' ? this._panelAvail : this._panelSel;
    const loading = boolAttr(this, 'loading');
    const readonly = boolAttr(this, 'readonly');
    const grouped = boolAttr(this, 'grouped');
    const list = panel.list;
    list.innerHTML = '';

    /* Loading skeleton (source panel only). */
    if (loading && side === 'available') {
      for (let i = 0; i < 6; i++) {
        const sk = document.createElement('div');
        sk.className = 'ds-dual-list__skeleton';
        list.appendChild(sk);
      }
      return;
    }

    const items = this._visible(side);
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'ds-dual-list__empty';
      const total = (side === 'available' ? this._available : this._selected).length;
      empty.textContent = total === 0
        ? (side === 'selected' ? 'Nothing selected yet' : 'No items')
        : 'No matches';
      list.appendChild(empty);
      return;
    }

    const renderRow = (it) => {
      const row = document.createElement('div');
      row.className = 'ds-dual-list__row';
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', it._checked ? 'true' : 'false');
      if (it.locked) row.classList.add('ds-dual-list__row--locked');
      /* Draggable unless locked / disabled / read-only / loading. */
      row.dataset.id = it.id;
      row.dataset.side = side;
      row.draggable = !readonly && !loading && !it.disabled && !it.locked;

      const cb = document.createElement('ds-checkbox');
      cb.setAttribute('value', it.id);
      cb.setAttribute('label', it.label);
      cb.setAttribute('size', 'small');
      if (it._checked) cb.setAttribute('checked', '');
      if (it.locked || it.disabled || readonly || loading) cb.setAttribute('disabled', '');
      row.appendChild(cb);

      if (it.locked) {
        const lock = document.createElement('ds-icon');
        lock.className = 'ds-dual-list__lock';
        lock.setAttribute('name', 'lock');
        lock.setAttribute('size', '14');
        row.appendChild(lock);
      }
      list.appendChild(row);
    };

    if (grouped) {
      const groups = [];
      const byGroup = new Map();
      items.forEach((it) => {
        const g = it.group || 'Other';
        if (!byGroup.has(g)) { byGroup.set(g, []); groups.push(g); }
        byGroup.get(g).push(it);
      });
      groups.forEach((g) => {
        const gh = document.createElement('div');
        gh.className = 'ds-dual-list__group';
        gh.textContent = g;
        gh.setAttribute('role', 'presentation');
        list.appendChild(gh);
        byGroup.get(g).forEach(renderRow);
      });
    } else {
      items.forEach(renderRow);
    }
  }

  _syncCounts() {
    /* Count shown inline in the title: "Available (12)". */
    const a = this.getAttribute('available-label') || 'Available';
    const s = this.getAttribute('selected-label') || 'Selected';
    this._panelAvail.title.textContent = `${a} (${this._available.length})`;
    this._panelSel.title.textContent = `${s} (${this._selected.length})`;
    /* Link labels are set once at build time (see _buildPanel) — don't set
       textContent here or it destroys the ds-text-link's inner anchor. */
  }

  _movable(side) {
    /* checked + (for selected) non-locked, among visible rows */
    return this._visible(side).filter((it) => it._checked && !(side === 'selected' && it.locked));
  }

  _syncButtons() {
    if (boolAttr(this, 'readonly')) return;
    const loading = boolAttr(this, 'loading');
    const setDis = (btn, dis) => { if (dis || loading) btn.setAttribute('disabled', ''); else btn.removeAttribute('disabled'); };

    setDis(this._btnRight, this._movable('available').length === 0);
    setDis(this._btnLeft, this._movable('selected').length === 0);
    setDis(this._btnAllRight, this._visible('available').length === 0);
    setDis(this._btnAllLeft, this._visible('selected').filter((it) => !it.locked).length === 0);

    if (boolAttr(this, 'reorderable')) {
      const checkedSel = this._selected.filter((it) => it._checked && !it.locked);
      const canUp = checkedSel.length > 0 && this._selected.indexOf(checkedSel[0]) > 0;
      const last = checkedSel[checkedSel.length - 1];
      const canDown = checkedSel.length > 0 && this._selected.indexOf(last) < this._selected.length - 1;
      setDis(this._btnUp, !canUp);
      setDis(this._btnDown, !canDown);
    }
  }

  /* ---- interaction --------------------------------------------------- */
  _onCheck(e) {
    const value = e.detail?.value;
    const it = [...this._available, ...this._selected].find((x) => x.id === value);
    if (it) it._checked = !!e.detail.checked;
    this._syncButtons();
    const row = e.target.closest('.ds-dual-list__row');
    if (row) row.setAttribute('aria-selected', it && it._checked ? 'true' : 'false');
  }

  _onSearch(e) {
    const side = e.target.dataset.side;
    if (side) { this._q[side] = e.detail?.value ?? e.target.value ?? ''; this._renderList(side); this._syncButtons(); }
  }

  _toggleAll(side) {
    const visible = this._visible(side).filter((it) => !(side === 'selected' && it.locked) && !it.disabled);
    const allChecked = visible.length > 0 && visible.every((it) => it._checked);
    visible.forEach((it) => { it._checked = !allChecked; });
    this._renderList(side);
    this._syncButtons();
  }

  _onCtrl(action) {
    if (action === 'up' || action === 'down') return this._reorder(action);
    let moved = [];
    if (action === 'right') moved = this._transfer('available', 'selected', this._movable('available'));
    else if (action === 'left') moved = this._transfer('selected', 'available', this._movable('selected'));
    else if (action === 'all-right') moved = this._transfer('available', 'selected', this._visible('available'));
    else if (action === 'all-left') moved = this._transfer('selected', 'available', this._visible('selected').filter((it) => !it.locked));
    if (moved.length) {
      const dest = action.includes('right') ? (this.getAttribute('selected-label') || 'Selected') : (this.getAttribute('available-label') || 'Available');
      this._announce(`Moved ${moved.length} ${moved.length === 1 ? 'item' : 'items'} to ${dest}. ${this.getAttribute('selected-label') || 'Selected'} now has ${this._selected.length}.`);
    }
  }

  _transfer(from, to, items) {
    /* Snapshot: _visible() can return the live source array (no active filter),
       so iterating while splicing from it would skip elements. */
    const moved = [...items];
    if (!moved.length) return [];
    const fromArr = from === 'available' ? this._available : this._selected;
    const toArr = to === 'available' ? this._available : this._selected;
    moved.forEach((it) => {
      const idx = fromArr.indexOf(it);
      if (idx > -1) fromArr.splice(idx, 1);
      it._checked = false;
      toArr.push(it);
    });
    this._render();
    this._emit();
    return moved;
  }

  _reorder(dir) {
    const checked = this._selected.filter((it) => it._checked && !it.locked);
    if (!checked.length) return;
    const arr = this._selected;
    if (dir === 'up') {
      checked.forEach((it) => {
        const i = arr.indexOf(it);
        if (i > 0 && !arr[i - 1]._checked) { arr.splice(i, 1); arr.splice(i - 1, 0, it); }
      });
    } else {
      for (let k = checked.length - 1; k >= 0; k--) {
        const it = checked[k];
        const i = arr.indexOf(it);
        if (i < arr.length - 1 && !arr[i + 1]._checked) { arr.splice(i, 1); arr.splice(i + 1, 0, it); }
      }
    }
    this._renderList('selected');
    this._syncButtons();
    this._emit();
  }

  /* ---- drag & drop --------------------------------------------------- */
  _onDragStart(e) {
    const row = e.target.closest && e.target.closest('.ds-dual-list__row');
    if (!row || !row.draggable) return;
    this._drag = { id: row.dataset.id, from: row.dataset.side };
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', row.dataset.id); } catch (_) { /* noop */ }
    row.classList.add('ds-dual-list__row--dragging');
  }

  _onDragOver(e, panel) {
    if (!this._drag) return;
    const side = panel.root.dataset.side;
    /* The Available (left) list order isn't user-controlled — a same-panel drag
       there is not a valid drop (no reordering). */
    if (side === 'available' && this._drag.from === 'available') {
      this._clearMarkers();
      panel.root.classList.remove('ds-dual-list__panel--drop');
      return;                                            // no preventDefault → drop disallowed
    }
    e.preventDefault();                                  // allow drop
    try { e.dataTransfer.dropEffect = 'move'; } catch (_) { /* noop */ }
    panel.root.classList.add('ds-dual-list__panel--drop');
    this._clearMarkers();
    /* Position indicator only where order is user-controlled — the Selected
       list. Items moved into Available always append, so no insertion line. */
    if (side !== 'selected') return;
    const rows = [...panel.list.querySelectorAll('.ds-dual-list__row')];
    const beforeRow = rows.find((r) => {
      const b = r.getBoundingClientRect();
      return e.clientY < b.top + b.height / 2;
    });
    if (beforeRow) beforeRow.classList.add('ds-dual-list__row--drop-before');
    else if (rows.length) rows[rows.length - 1].classList.add('ds-dual-list__row--drop-after');
    else panel.list.classList.add('ds-dual-list__list--drop-empty');
  }

  _onDragLeave(e, panel) {
    if (!panel.list.contains(e.relatedTarget)) {
      panel.root.classList.remove('ds-dual-list__panel--drop');
      this._clearMarkers();
    }
  }

  _clearMarkers() {
    this.querySelectorAll('.ds-dual-list__row--drop-before, .ds-dual-list__row--drop-after')
      .forEach((r) => r.classList.remove('ds-dual-list__row--drop-before', 'ds-dual-list__row--drop-after'));
    [this._panelAvail, this._panelSel].forEach((p) => p.list.classList.remove('ds-dual-list__list--drop-empty'));
  }

  _onDrop(e, panel) {
    if (!this._drag) return;
    e.preventDefault();
    const side = panel.root.dataset.side;
    const { id, from } = this._drag;
    const item = [...this._available, ...this._selected].find((x) => x.id === id);
    this._onDragEnd();
    if (!item) return;
    /* A locked item cannot leave Selected. */
    if (item.locked && from === 'selected' && side === 'available') return;
    /* No reordering the Available (left) list. */
    if (side === 'available' && from === 'available') return;

    const fromArr = from === 'available' ? this._available : this._selected;
    const toArr = side === 'available' ? this._available : this._selected;
    const fi = fromArr.indexOf(item);
    if (fi > -1) fromArr.splice(fi, 1);
    item._checked = false;
    /* Position-aware placement only for the Selected list (insert before the
       row under the cursor). Available always appends. */
    let idx = toArr.length;
    if (side === 'selected') {
      const rows = [...panel.list.querySelectorAll('.ds-dual-list__row')];
      const beforeRow = rows.find((r) => {
        const b = r.getBoundingClientRect();
        return e.clientY < b.top + b.height / 2;
      });
      if (beforeRow) { const bi = toArr.findIndex((x) => x.id === beforeRow.dataset.id); if (bi > -1) idx = bi; }
    }
    toArr.splice(idx, 0, item);

    this._render();
    this._emit();
    if (from !== side) {
      const label = side === 'selected'
        ? (this.getAttribute('selected-label') || 'Selected')
        : (this.getAttribute('available-label') || 'Available');
      this._announce(`Moved ${item.label} to ${label}.`);
    }
  }

  _onDragEnd() {
    this._drag = null;
    this.querySelectorAll('.ds-dual-list__row--dragging').forEach((r) => r.classList.remove('ds-dual-list__row--dragging'));
    [this._panelAvail, this._panelSel].forEach((p) => p.root.classList.remove('ds-dual-list__panel--drop'));
    this._clearMarkers();
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('ds-dual-list-change', {
      bubbles: true, composed: true, detail: this.items,
    }));
  }

  _announce(msg) { if (this._live) this._live.textContent = msg; }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-dual-list')) {
  customElements.define('ds-dual-list', DsDualList);
}
