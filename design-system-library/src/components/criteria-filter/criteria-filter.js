/* =============================================================================
   <ds-criteria-filter> — advanced / criteria filter (Phases 1–2).
   -----------------------------------------------------------------------------
   Builds a structured filter EXPRESSION for a data surface: `field → operator →
   value` conditions joined by AND/OR combinators, optionally nested into groups
   (with NOT), and emits a JSON-serializable query tree. It owns the rule rows,
   the combinators, nesting, add / remove / duplicate, the operator-driven value
   editor, and inline validation — delegating each value editor to a Prism input.

   It is NOT responsible for querying/fetching data. The host owns that; the
   builder only reports the query tree via events (same contract as
   <ds-filter-panel>, whose field-factory pattern this mirrors).

   Sibling of <ds-filter-panel> (faceted filtering). This is the expression tier.
   The value is a tree (root RuleGroup); groups nest recursively. `structure="flat"`
   restricts it to a single-level list (no nested groups / NOT).

   USAGE
     const cf = document.createElement('ds-criteria-filter');
     cf.fields = [
       { name:'hostname', label:'Host name', type:'text' },
       { name:'os',       label:'OS',        type:'select',
         options:[{label:'Windows',value:'win'},{label:'macOS',value:'mac'}] },
       { name:'lastSeen', label:'Last seen', type:'date' },
       { name:'riskScore',label:'Risk score',type:'number' },
     ];
     cf.query = { combinator:'and', rules:[
       { field:'os', operator:'is', value:'win' } ] };
     cf.addEventListener('ds-criteria-filter-change', e => {
       if (e.detail.valid) table.rows = query(e.detail.query);
     });

   ATTRIBUTES
     structure="combinator"    Combining style: 'combinator' (default — "Match all / any
                               of the following") | 'advanced' (lead word + per-row And/Or
                               joiner + criteria pattern). Legacy: 'grouped'/'default'/unset
                               → combinator (grouping on); 'flat' → combinator (grouping off).
     grouping="on"             Allow nested groups ("Add group"). Default ON for combinator,
                               OFF for advanced (opt in with grouping="on"). When a group
                               exists the advanced criteria-pattern turns off.
     lead-word="When"          advanced variant: word before the first condition (When / Where)
     apply-mode="live"         'live' (emit on every edit) | 'apply' (footer button)
     combinator-default="and"  combinator of a new/empty group
     show-not                  allow negating a group (default on; "false" to hide)
     max-depth                 cap nesting depth (root = 0); unset = unlimited
     max-group                 cap total rules; unset = unlimited
     mode="inline"             'inline' | 'popover' | 'drawer' (overlay: open()/close()/toggle())
     show-preview              read-only query summary (sentence + removable chips)
     allow-field-source        let a comparison rule compare against another field
     loading                   skeleton rows (async fields)
     title="Filter criteria"   header label

   PROPERTIES  fields: FieldDef[] · operators: OperatorDef[] · query: RuleGroup
               presets: {id,label,query}[] | null   (host-owned saved filters)
   METHODS     addRule(groupId?) · addGroup(groupId?) · removeRule(id) · clear()
               apply() · validate() · getQuery() · setQuery(tree)
               open()/close()/toggle() · loadPreset(id) · savePreset(label)
   EVENTS      ds-criteria-filter-{change|apply|clear|invalid|open|close|preset-save|preset-select}
   ============================================================================= */

/* Sub-components this builder composes (registers their <ds-*> elements). */
import '../../icons/icon.js';
import '../button/button.js';
import '../icon-button/icon-button.js';
import '../input-select/input-select.js';
import '../text-input/text-input.js';
import '../date-picker/date-picker.js';
import '../token-field/token-field.js';
import '../tab-filter/tab-filter.js';
import '../toggle/toggle.js';
import '../field-helper/field-helper.js';
import '../tag/tag.js';
import '../text-link/text-link.js';
import '../empty-state/empty-state.js';

/* Auto-load light-DOM stylesheets once (so this works on pages that link
   criteria-filter.css individually, not just the bundled index.css). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-criteria-filter-css', './criteria-filter.css');
_injectCss('ds-cf-btn-css', '../button/button.css');
_injectCss('ds-cf-iconbtn-css', '../icon-button/icon-button.css');
_injectCss('ds-cf-is-css', '../input-select/input-select.css');
_injectCss('ds-cf-ti-css', '../text-input/text-input.css');
_injectCss('ds-cf-dp-css', '../date-picker/date-picker.css');
_injectCss('ds-cf-tf-css', '../token-field/token-field.css');
_injectCss('ds-cf-tab-css', '../tab-filter/tab-filter.css');
_injectCss('ds-cf-toggle-css', '../toggle/toggle.css');
_injectCss('ds-cf-fh-css', '../field-helper/field-helper.css');
_injectCss('ds-cf-tag-css', '../tag/tag.css');
_injectCss('ds-cf-textlink-css', '../text-link/text-link.css');
_injectCss('ds-cf-empty-css', '../empty-state/empty-state.css');

const boolAttr = (el, name, dflt) =>
  el.hasAttribute(name) ? el.getAttribute(name) !== 'false' : dflt;

/* Default operator catalog. `arity`: 0 = unary (no value editor) · 1 = single
   value · 2 = range (two values). `types` lists which field types offer it.
   Labels are sentence case per the casing rule. The dropdown for a field shows
   these in catalog order, filtered to the field's type. */
const OPERATORS = [
  /* text */
  { name: 'contains',     label: 'Contains',                 arity: 1, types: ['text'] },
  { name: 'notContains',  label: 'Does not contain',         arity: 1, types: ['text'] },
  { name: 'startsWith',   label: 'Starts with',              arity: 1, types: ['text'] },
  { name: 'endsWith',     label: 'Ends with',                arity: 1, types: ['text'] },
  { name: 'matchesRegex', label: 'Matches regex',            arity: 1, types: ['text'] },
  /* equality (text / number / select) */
  { name: 'equals',       label: 'Equals',                   arity: 1, types: ['text', 'number', 'select'] },
  { name: 'notEquals',    label: 'Does not equal',           arity: 1, types: ['text', 'number', 'select'] },
  /* number */
  { name: 'lt',           label: 'Less than',                arity: 1, types: ['number'] },
  { name: 'lte',          label: 'Less than or equal to',    arity: 1, types: ['number'] },
  { name: 'gt',           label: 'Greater than',             arity: 1, types: ['number'] },
  { name: 'gte',          label: 'Greater than or equal to', arity: 1, types: ['number'] },
  { name: 'between',      label: 'Between',                  arity: 2, types: ['number', 'date', 'datetime'] },
  { name: 'notBetween',   label: 'Not between',              arity: 2, types: ['number'] },
  /* date / datetime / select */
  { name: 'is',           label: 'Is',                       arity: 1, types: ['date', 'datetime', 'select'] },
  { name: 'isNot',        label: 'Is not',                   arity: 1, types: ['date', 'datetime', 'select'] },
  { name: 'before',       label: 'Before',                   arity: 1, types: ['date', 'datetime'] },
  { name: 'after',        label: 'After',                    arity: 1, types: ['date', 'datetime'] },
  /* boolean */
  { name: 'isTrue',       label: 'Is true',                  arity: 0, types: ['boolean'] },
  { name: 'isFalse',      label: 'Is false',                 arity: 0, types: ['boolean'] },
  /* multiselect */
  { name: 'hasAnyOf',     label: 'Has any of',               arity: 1, types: ['multiselect'] },
  { name: 'hasAllOf',     label: 'Has all of',               arity: 1, types: ['multiselect'] },
  { name: 'hasNoneOf',    label: 'Has none of',              arity: 1, types: ['multiselect'] },
  /* empties (shared) */
  { name: 'isEmpty',      label: 'Is empty',                 arity: 0, types: ['text', 'number', 'date', 'datetime', 'select', 'multiselect'] },
  { name: 'isNotEmpty',   label: 'Is not empty',             arity: 0, types: ['text', 'number', 'date', 'datetime', 'select'] },
];

let _seq = 0;
const uid = () => `cf${++_seq}`;

export class DsCriteriaFilter extends HTMLElement {
  static get observedAttributes() {
    return ['structure', 'grouping', 'apply-mode', 'combinator-default', 'title', 'rtl', 'disabled',
            'add-rule-label', 'add-group-label', 'empty-text', 'show-not', 'max-depth', 'max-group',
            'mode', 'open', 'anchor', 'loading', 'show-preview', 'allow-field-source', 'lead-word'];
  }

  constructor() {
    super();
    this._fields = [];
    this._operators = null;                 // null → use built-in OPERATORS
    this._query = this._emptyGroup();       // root RuleGroup (tree)
    this._rows = {};                        // ruleId → { row, helper } (in-place validity refresh)
    this._ready = false;                    // gate: ignore sub-component init events during render
    this._dirty = false;                    // apply-mode: unapplied edits pending
    this._activePresetId = null;            // saved filter currently loaded (shown in the picker)
    this._open = false;                     // overlay modes (drawer/popover): visible?
    this._trigger = null;                   // element that opened the overlay (focus-return target)
    this._prevFocus = null;
    this._presets = null;                   // null = presets UI off; array = host-owned saved filters
    this._editingPattern = false;           // advanced: criteria-pattern inline editor open?
    /* Reclaim `fields`/`operators`/`query`/`presets` assigned BEFORE upgrade. */
    for (const p of ['fields', 'operators', 'query', 'presets']) {
      if (Object.prototype.hasOwnProperty.call(this, p)) { const v = this[p]; delete this[p]; this[p] = v; }
    }
    this._emitChangeDebounced = this._debounce(() => this._fireChange(), 120);
    this._onKeydown = (e) => { if (e.key === 'Escape' && this._open && this._isOverlay()) { e.stopPropagation(); this.close(); } };
    this._onDocPointer = (e) => {
      if (!this._open || this.mode !== 'popover') return;
      const path = e.composedPath ? e.composedPath() : [];
      if (path.includes(this._root) || (this._trigger && path.includes(this._trigger))) return;
      /* A composed input (ds-input-select / ds-date-picker / ds-token-field) portals
         its dropdown/popover to <body>, so a click on an option is technically outside
         our root. Treat clicks inside any floating DS layer as inside — otherwise
         picking a field / operator / value / date would light-dismiss the popover. */
      if (path.some((n) => n && n.classList && (
        n.classList.contains('ds-input-select__dropdown') ||
        n.classList.contains('ds-date-picker__popover') ||
        n.classList.contains('ds-token-field__dropdown')))) return;
      this.close();
    };
    this._onReposition = () => { if (this._open && this.mode === 'popover') this._positionPopover(); };
  }

  connectedCallback() {
    if (!this._root) { this._root = document.createElement('div'); this.appendChild(this._root); }
    document.addEventListener('keydown', this._onKeydown, true);
    document.addEventListener('pointerdown', this._onDocPointer, true);
    window.addEventListener('resize', this._onReposition, true);
    window.addEventListener('scroll', this._onReposition, true);
    if (!this._applied) this._applied = this._clone(this._query);   // initial cancel baseline
    this._render();
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown, true);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    window.removeEventListener('resize', this._onReposition, true);
    window.removeEventListener('scroll', this._onReposition, true);
  }
  attributeChangedCallback(name) {
    if (!this._root) return;
    if (name === 'open') { this._syncOpen(); return; }   /* toggle visibility only — don't rebuild controls */
    this._render();
  }

  /* ---- Presentation mode (Phase 3) -------------------------------------- */
  get mode() { const m = this.getAttribute('mode'); return (m === 'drawer' || m === 'popover') ? m : 'inline'; }
  _isOverlay() { return this.mode !== 'inline'; }

  open(trigger) { this._trigger = trigger || this._trigger; this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }
  toggle(trigger) { this.hasAttribute('open') ? this.close() : this.open(trigger); }

  _syncOpen() {
    const wasOpen = this._open;
    this._open = this.hasAttribute('open');
    if (!this._isOverlay()) return;
    this._root.classList.toggle('is-open', this._open);
    if (this._open && !wasOpen) {
      this._prevFocus = document.activeElement;
      if (this.mode === 'popover') this._positionPopover();
      requestAnimationFrame(() => this._focusFirst());
      this._emit('open', {});
    } else if (!this._open && wasOpen) {
      const back = this._trigger || this._prevFocus;
      if (back && back.focus) back.focus();
      this._emit('close', {});
    }
  }
  _focusFirst() {
    const card = this._root.querySelector('.ds-criteria-filter');
    const f = card && card.querySelector('button, [href], input, ds-input-select, ds-button, [tabindex]:not([tabindex="-1"])');
    (f || card)?.focus?.();
  }
  /* Anchor the popover card to its trigger (or `anchor` selector); flip if it
     would overflow the viewport. */
  _positionPopover() {
    const card = this._root.querySelector('.ds-criteria-filter');
    if (!card) return;
    const anchorSel = this.getAttribute('anchor');
    const anchor = this._trigger || (anchorSel && document.querySelector(anchorSel));
    if (!anchor) return;
    const a = anchor.getBoundingClientRect();
    const gap = 8, margin = 8, vw = innerWidth, vh = innerHeight;
    const w = card.offsetWidth || 520;

    /* Horizontal: align to the anchor's start, clamp within the viewport. */
    let left = a.left;
    if (left + w > vw - margin) left = Math.max(margin, a.right - w);
    left = Math.max(margin, left);

    /* Vertical: PREFER dropping DOWN from the anchor and cap the height to the
       space available there so the card's body scrolls internally — never grow
       tall enough to flip up into the header. Flip above only when there's too
       little room below AND meaningfully more room above (anchor near the bottom).
       In every case the card height is capped to the chosen gap so it stays on
       screen (and clear of a top-docked header when dropping down). */
    const spaceBelow = vh - a.bottom - gap - margin;
    const spaceAbove = a.top - gap - margin;
    const CAP = Math.min(620, Math.round(vh * 0.76));   /* design max (mirrors CSS) */
    const flipUp = spaceBelow < 240 && spaceAbove > spaceBelow;
    let top, maxH;
    if (flipUp) {
      maxH = Math.min(CAP, Math.max(160, spaceAbove));
      top = Math.max(margin, a.top - gap - Math.min(card.offsetHeight, maxH));
    } else {
      top = a.bottom + gap;
      maxH = Math.min(CAP, Math.max(160, spaceBelow));
    }
    card.style.left = left + 'px';
    card.style.top = top + 'px';
    card.style.maxHeight = maxH + 'px';   /* inline cap → body (overflow-y:auto) scrolls */
  }

  /* ---- Public API ------------------------------------------------------- */
  get fields() { return this._fields; }
  set fields(v) { this._fields = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  get operators() { return this._operators; }
  set operators(v) { this._operators = Array.isArray(v) && v.length ? v.slice() : null; if (this._root) this._render(); }

  get query() { return this.getQuery(); }
  set query(v) { this.setQuery(v); }

  /* Saved presets are host-owned: setting this (even to []) turns the preset UI
     on; the host persists on `preset-save` and feeds the updated list back. */
  get presets() { return this._presets ? this._presets.slice() : this._presets; }
  set presets(v) { this._presets = Array.isArray(v) ? v.slice() : null; if (this._root) this._render(); }

  getQuery() { return this._clone(this._query); }
  setQuery(tree) {
    this._activePresetId = null;                           // a new query isn't a loaded preset (re-set by _selectPreset)
    this._query = this._normalizeGroup(tree) || this._emptyGroup();
    this._applied = this._clone(this._query);              // a controlled query is the cancel baseline
    if (this._root) this._render();
  }

  /* Load a saved preset by id (emits `preset-select`). */
  loadPreset(id) { this._selectPreset(id); }
  /* Emit the current tree as a named preset (emits `preset-save`); the host stores it. */
  savePreset(label) { this._savePreset(label); }
  _selectPreset(id) {
    if (!id) return;
    const p = (this._presets || []).find((x) => x.id === id);
    if (!p) return;
    this.setQuery(p.query);                 // loads the conditions (clears _activePresetId + renders)
    this._activePresetId = id;              // ...then mark this preset active so the picker shows it
    const pick = this._root && this._root.querySelector('.ds-cf-preset-pick');
    if (pick) pick.setAttribute('value', id);
    this._emit('preset-select', { id, query: this.getQuery() });
    if (this._applyMode === 'live') this._fireChange(); else { this._dirty = true; this._syncFooter(); }
  }
  _savePreset(label) {
    const name = (label || '').trim();
    if (!name) return;
    this._emit('preset-save', { label: name, query: this.getQuery() });
  }

  /* Add a leaf rule to a group (root by default). */
  addRule(groupId) {
    const g = this._findGroup(groupId);
    const rule = this._newRule(this._fields[0]);
    if (this._advanced && g.rules.length) rule.joiner = 'and';   /* non-first row joins with AND by default */
    g.rules.push(rule);
    /* Advanced variant with a *custom* criteria pattern: the pattern is a manual
       expression over condition numbers, so a newly added condition (number N)
       would be orphaned — extend the pattern to reference it, joined by its
       joiner. (A derived pattern already covers every row, so skip it there.) */
    if (this._advanced && this._hasCustomPattern()) {
      const n = g.rules.length;                                  /* 1-indexed position of the new row */
      const joiner = rule.joiner === 'or' ? 'OR' : 'AND';
      this._query.pattern = `${this._query.pattern.trim()} ${joiner} ${n}`;
    }
    this._structuralChange();
    requestAnimationFrame(() => this._rows[rule.id]?.row.querySelector('ds-input-select')?.focus?.());
  }
  /* Add a nested group (seeded with one rule so it is immediately usable). */
  addGroup(groupId) {
    if (!this._canGroup) return;
    const g = this._findGroup(groupId);
    const rule = this._newRule(this._fields[0]);
    const grp = { id: uid(), combinator: this._combinatorDefault, not: false, rules: [rule] };
    /* Advanced: a group is a sibling in the per-row-joiner list, so a non-first
       group joins the previous sibling with AND (the joiner shows in its head). */
    if (this._advanced && g.rules.length) grp.joiner = 'and';
    g.rules.push(grp);
    this._structuralChange();
    requestAnimationFrame(() => this._rows[rule.id]?.row.querySelector('ds-input-select')?.focus?.());
  }
  removeRule(id) { this._removeNode(id); }
  /* Remove any node (rule or group). Removing the last child of a nested group
     removes that now-empty group too; the root group is never removed. */
  _removeNode(id) {
    const f = this._findNode(id);
    if (!f) return;
    /* Advanced + custom pattern: capture the row's 1-indexed position before the
       splice so the pattern can renumber around the gap. (Advanced is flat, so
       the parent is always the root group.) */
    const removedPos = (this._advanced && this._hasCustomPattern() && f.parent === this._query)
      ? f.index + 1 : null;
    f.parent.rules.splice(f.index, 1);
    if (f.parent !== this._query && f.parent.rules.length === 0) { this._removeNode(f.parent.id); return; }
    if (removedPos != null) this._applyRenumberedPattern(this._patternAfterRemove(this._query.pattern, removedPos));
    this._structuralChange();
  }
  /* "Clear all": drop every condition but start fresh with one empty row (not the
     empty state), so the user can keep building without an extra click. */
  clear() {
    this._activePresetId = null;
    this._query = this._emptyGroup();
    if (this._fields.length) this._query.rules.push(this._newRule(this._fields[0]));
    this._editingPattern = false;
    this._render();
    this._emit('clear', {});
    if (this._applyMode === 'live') this._fireChange(); else { this._dirty = true; this._syncFooter(); }
    requestAnimationFrame(() => this._root.querySelector('.ds-cf-rule ds-input-select')?.focus?.());
  }
  /* "Cancel": discard unsaved edits — revert to the last applied (or initial)
     query. In overlay modes it also closes. Backs the apply-mode footer button. */
  cancel() {
    const base = this._applied ? this._clone(this._applied) : this._emptyGroup();
    this._query = this._normalizeGroup(base) || this._emptyGroup();
    this._editingPattern = false;
    this._dirty = false;
    this._render();
    this._emit('cancel', {});
    if (this._isOverlay() && this._open) this.close();
  }
  apply() {
    this._refreshValidity();                 // surface any inline errors on the rows
    this._dirty = false; this._syncFooter();
    this._applied = this._clone(this._query);              // commit → the new cancel baseline
    this._emit('apply', { query: this.getQuery(), valid: this.isValid() });
  }
  validate() { return this.isValid(); }
  isValid() { return this._allRules().every((r) => !this._ruleError(r)); }
  /* "Save & apply": validate FIRST — surface the inline errors and bail if any
     field is invalid; only when everything's valid do we prompt to name the
     filter (then _openSaveBar's confirm saves + applies). */
  _saveApply() {
    this._refreshValidity();
    if (!this.isValid()) {
      this._root.querySelector('.ds-cf-rule.is-invalid')?.scrollIntoView?.({ block: 'nearest' });
      return;
    }
    this._openSaveBar(true);
  }

  /* ---- Internals -------------------------------------------------------- */
  get _applyMode() { return this.getAttribute('apply-mode') === 'apply' ? 'apply' : 'live'; }
  get _combinatorDefault() { return this.getAttribute('combinator-default') === 'or' ? 'or' : 'and'; }
  /* Nesting is allowed unless structure="flat". Guards: max-depth caps nesting
     (root = depth 0); max-group caps total rules. Both null (off) when unset. */
  /* Combining style — two variants:
       'combinator' (default) → "Match all / any of the following" combinator.
       'advanced'             → lead word + per-row And/Or joiners (+ criteria pattern).
     Legacy structure values map to the combinator variant: 'grouped'/'default'/
     unset → combinator (grouping on), 'flat' → combinator (grouping off). */
  get _combinator() { return !this._advanced; }
  /* Advanced-conditions variant: flat list · first row led by a word (When/Where) ·
     each later row a small AND/OR joiner select · a "criteria pattern" line at the bottom. */
  get _advanced() { return this.getAttribute('structure') === 'advanced'; }
  /* Whether nested groups ("Add group") are available. Explicit grouping="on|off"
     always wins; otherwise the default is ON for the combinator variant and OFF
     for advanced (legacy structure="flat" forces OFF). Advanced groups use per-row
     And/Or joiners — no combinator header — matching the flat rows. */
  get _groupingOn() {
    const g = (this.getAttribute('grouping') || '').toLowerCase();
    if (g === 'on' || g === 'true') return true;
    if (g === 'off' || g === 'false') return false;
    if (this.getAttribute('structure') === 'flat') return false;   /* legacy alias */
    return this._combinator;   /* combinator → on by default; advanced → off */
  }
  get _canGroup() { return this._groupingOn; }
  /* Any group among the root's children → grouping is in use (root-level check
     is enough: a group can only be added to the root or an existing group, so
     the first group always lands as a root child). */
  _hasGroups(g = this._query) { return g.rules.some((n) => this._isGroup(n)); }
  get _leadWord() { return this.getAttribute('lead-word') || 'When'; }
  get _maxDepth() { const n = parseInt(this.getAttribute('max-depth') || '', 10); return Number.isFinite(n) ? n : null; }
  get _maxRules() { const n = parseInt(this.getAttribute('max-group') || '', 10); return Number.isFinite(n) ? n : null; }
  get _showPreview() { return this.hasAttribute('show-preview') && this.getAttribute('show-preview') !== 'false'; }
  get _allowFieldSource() { return this.hasAttribute('allow-field-source') && this.getAttribute('allow-field-source') !== 'false'; }
  /* Field-to-field compare only makes sense for a single-value comparison on a
     scalar field (not unary, not range, not multiselect). */
  _fieldSourceEligible(field, op) { return !!(field && op && op.arity === 1 && field.type !== 'multiselect'); }
  _optionLabel(field, val) { return (field && field.options || []).find((o) => o.value === val)?.label ?? val; }

  _emit(type, detail) { this.dispatchEvent(new CustomEvent('ds-criteria-filter-' + type, { bubbles: true, detail })); }
  _esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  _debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  _clone(o) { return JSON.parse(JSON.stringify(o)); }

  _emptyGroup() { return { id: uid(), combinator: this._combinatorDefault, not: false, rules: [] }; }
  _field(name) { return this._fields.find((f) => f.name === name); }

  /* ---- Tree helpers ----------------------------------------------------- */
  _isGroup(n) { return !!n && Array.isArray(n.rules); }
  /* Flatten every leaf Rule in the tree (skips group nodes). */
  _allRules(group = this._query, acc = []) {
    for (const n of group.rules) { if (this._isGroup(n)) this._allRules(n, acc); else acc.push(n); }
    return acc;
  }
  /* Locate a node by id → { node, parent, index } (searches the whole tree). */
  _findNode(id, group = this._query) {
    for (let i = 0; i < group.rules.length; i++) {
      const n = group.rules[i];
      if (n.id === id) return { node: n, parent: group, index: i };
      if (this._isGroup(n)) { const f = this._findNode(id, n); if (f) return f; }
    }
    return null;
  }
  _findGroup(id) {
    if (!id || id === this._query.id) return this._query;
    const f = this._findNode(id);
    return (f && this._isGroup(f.node)) ? f.node : this._query;
  }
  /* Deep clone a node and re-key every id (for duplicate). */
  _cloneWithNewIds(n) {
    const c = this._clone(n);
    const reid = (node) => { node.id = uid(); if (this._isGroup(node)) node.rules.forEach(reid); };
    reid(c);
    return c;
  }
  _opDef(name) { return (this._operators || OPERATORS).find((o) => o.name === name); }

  /* Operator defs available for a field: its type's operators, optionally
     restricted + ordered by `field.operators` (an array of operator names). */
  _operatorDefs(field) {
    if (!field) return [];
    const catalog = this._operators || OPERATORS;
    if (Array.isArray(field.operators) && field.operators.length) {
      return field.operators.map((n) => catalog.find((o) => o.name === n)).filter(Boolean);
    }
    return catalog.filter((o) => o.types.includes(field.type));
  }

  _newRule(field) {
    const ops = this._operatorDefs(field);
    const opName = (field && field.defaultOperator && ops.some((o) => o.name === field.defaultOperator))
      ? field.defaultOperator : (ops[0] && ops[0].name) || '';
    const r = { id: uid(), field: field ? field.name : '', operator: opName, value: undefined };
    r.value = (field && field.defaultValue !== undefined) ? field.defaultValue : this._blankValue(field, opName);
    return r;
  }
  /* A sensible empty value for a field+operator (drives editor reset on change). */
  _blankValue(field, opName) {
    const op = this._opDef(opName);
    if (!op || op.arity === 0) return undefined;
    if (field && field.type === 'multiselect') return [];
    if (op.arity === 2 && field && field.type === 'number') return ['', ''];
    return '';
  }

  _normalizeGroup(g) {
    if (!g || typeof g !== 'object') return null;
    const out = {
      id: g.id || uid(),
      combinator: g.combinator === 'or' ? 'or' : 'and',
      not: g.not === true,
      rules: Array.isArray(g.rules) ? g.rules.map((n) => this._normalizeNode(n)).filter(Boolean) : [],
    };
    if (typeof g.pattern === 'string' && g.pattern.trim()) out.pattern = g.pattern.trim();   /* advanced: custom criteria pattern */
    if (g.joiner === 'or' || g.joiner === 'and') out.joiner = g.joiner;   /* advanced: how a nested group joins its previous sibling */
    return out;
  }
  /* A child is a nested group (has `rules`/`combinator`) or a leaf rule. */
  _normalizeNode(n) {
    if (!n || typeof n !== 'object') return null;
    if (Array.isArray(n.rules) || 'combinator' in n) return this._normalizeGroup(n);
    const r = { id: n.id || uid(), field: n.field || '', operator: n.operator || '', value: n.value };
    if (n.valueSource === 'field') r.valueSource = 'field';   /* compare against another field */
    if (n.joiner === 'or' || n.joiner === 'and') r.joiner = n.joiner;   /* advanced: per-row AND/OR */
    return r;
  }

  /* ---- Validation ------------------------------------------------------- */
  /* Returns an error string for a rule, or null when valid. */
  _ruleError(rule) {
    const field = this._field(rule.field);
    if (!field) return 'Choose a field';
    const op = this._opDef(rule.operator);
    if (!op) return 'Choose an operator';
    if (op.arity === 0) return null;
    const v = rule.value;

    if (rule.valueSource === 'field') {   /* comparing to another field → value is a field name */
      return (v == null || v === '') ? 'Choose a field to compare' : null;
    }
    if (op.arity === 2 && field.type === 'number') {
      const a = Array.isArray(v) ? v[0] : undefined, b = Array.isArray(v) ? v[1] : undefined;
      if (a == null || a === '' || b == null || b === '') return 'Enter both values';
      if (isNaN(Number(a)) || isNaN(Number(b))) return 'Enter numbers';
      if (Number(a) > Number(b)) return 'Start must be less than or equal to end';
      return null;
    }
    const empty = v == null || v === '' || (Array.isArray(v) && v.filter((x) => x != null && x !== '').length === 0);
    if (empty) return field.type === 'multiselect' ? 'Choose at least one' : (op.arity === 2 ? 'Select a range' : 'Enter a value');
    if (op.name === 'matchesRegex') { try { new RegExp(String(v)); } catch (_) { return 'Invalid regular expression'; } }
    if (field.type === 'number' && op.arity === 1 && isNaN(Number(v))) return 'Enter a number';
    return null;
  }
  _errors() {
    return this._allRules()
      .map((r) => ({ ruleId: r.id, message: this._ruleError(r) }))
      .filter((e) => e.message);
  }

  /* ---- Edit plumbing ---------------------------------------------------- */
  /* Structural edit (add / remove / duplicate / field / operator / combinator):
     rebuild + emit immediately (structure changed). */
  _structuralChange() {
    this._activePresetId = null;   // a manual edit means the query no longer equals the loaded preset
    this._render();
    if (this._applyMode === 'live') this._fireChange(); else { this._dirty = true; this._syncFooter(); }
  }
  /* Value edit: no rebuild (would drop input focus). Refresh validity in place,
     update the footer, and emit (debounced in live mode). */
  _valueEdit() {
    if (!this._ready) return;
    this._refreshValidity();
    this._refreshPreview();
    if (this._applyMode === 'live') this._emitChangeDebounced();
    else { this._dirty = true; this._syncFooter(); }
  }
  _fireChange() {
    const valid = this.isValid();
    this._emit('change', { query: this.getQuery(), valid });
    if (!valid) this._emit('invalid', { errors: this._errors() });
  }

  _setField(rule, name) {
    if (!this._ready) return;
    const field = this._field(name);
    rule.field = name;
    delete rule.valueSource;   /* a new field type → back to a literal value */
    const ops = this._operatorDefs(field);
    rule.operator = (field && field.defaultOperator && ops.some((o) => o.name === field.defaultOperator))
      ? field.defaultOperator : (ops[0] && ops[0].name) || '';
    rule.value = (field && field.defaultValue !== undefined) ? field.defaultValue : this._blankValue(field, rule.operator);
    this._structuralChange();
  }
  _setOperator(rule, opName) {
    if (!this._ready) return;
    const prev = this._opDef(rule.operator), next = this._opDef(opName);
    rule.operator = opName;
    /* field-source no longer applies (unary / range) → drop it and reset value */
    if (rule.valueSource === 'field' && !this._fieldSourceEligible(this._field(rule.field), next)) {
      delete rule.valueSource; rule.value = this._blankValue(this._field(rule.field), opName);
    } else if (!prev || !next || prev.arity !== next.arity) {
      /* reset value only when the editor shape changes (arity differs) */
      rule.value = rule.valueSource === 'field' ? '' : this._blankValue(this._field(rule.field), opName);
    }
    this._structuralChange();
  }
  /* Flip a rule between a literal value and a comparison to another field. */
  _setValueSource(rule, src) {
    if (!this._ready) return;
    if (src === 'field') { rule.valueSource = 'field'; rule.value = ''; }
    else { delete rule.valueSource; rule.value = this._blankValue(this._field(rule.field), rule.operator); }
    this._structuralChange();
  }
  /* Advanced variant: set how a row joins to the previous one (AND / OR). */
  _setJoiner(rule, val) {
    if (!this._ready) return;
    rule.joiner = val === 'or' ? 'or' : 'and';
    this._structuralChange();
  }
  /* The "criteria pattern" for the advanced variant: the host-edited custom
     expression if set, else the numbered default derived from the row joiners
     (e.g. "1 AND 2 OR 3"). */
  getPattern() { return this._patternString(this._query); }
  _patternString(group) {
    if (typeof group.pattern === 'string' && group.pattern.trim()) return group.pattern.trim();
    const rules = group.rules.filter((n) => !this._isGroup(n));
    if (!rules.length) return '—';
    return rules.map((r, i) => i === 0 ? '1' : `${r.joiner === 'or' ? 'OR' : 'AND'} ${i + 1}`).join(' ');
  }
  /* A custom criteria pattern only applies to a flat, group-free advanced filter —
     once a group exists the nesting expresses precedence, so the pattern is off. */
  _hasCustomPattern() { return !this._hasGroups() && typeof this._query.pattern === 'string' && this._query.pattern.trim() !== ''; }
  /* Set (or, with an empty string, clear) the custom criteria pattern. */
  setPattern(str) { this._setPattern(str); }
  _setPattern(str) {
    const s = (str || '').trim();
    if (s) this._query.pattern = s; else delete this._query.pattern;
    this._editingPattern = false;
    this._structuralChange();
  }
  _resetPattern() { delete this._query.pattern; this._editingPattern = false; this._structuralChange(); }

  /* ---- Custom-pattern maintenance on structural edits ------------------- */
  /* A *custom* criteria pattern references conditions by their 1-indexed
     position, so add / remove / duplicate must renumber it (a derived pattern
     is recomputed from the rows, so it needs none of this). Tokenise → shift
     numbers → tidy dangling operators/parens, keeping the host's logic intact. */
  _tokenizePattern(str) {
    const tokens = [];
    const re = /\d+|AND|OR|NOT|\(|\)/gi;
    let m;
    while ((m = re.exec(String(str || '')))) {
      const s = m[0];
      if (/^\d+$/.test(s)) tokens.push({ t: 'num', v: parseInt(s, 10) });
      else if (s === '(') tokens.push({ t: 'lp' });
      else if (s === ')') tokens.push({ t: 'rp' });
      else tokens.push({ t: 'op', v: s.toUpperCase() });
    }
    return tokens;
  }
  _stringifyPattern(tokens) {
    let out = '';
    for (const tk of tokens) {
      const piece = tk.t === 'num' ? String(tk.v) : tk.t === 'lp' ? '(' : tk.t === 'rp' ? ')' : tk.v;
      if (!out) { out = piece; continue; }
      const noSpace = out.endsWith('(') || piece === ')';   /* hug parens */
      out += (noSpace ? '' : ' ') + piece;
    }
    return out;
  }
  /* Drop operators/NOT/parens left dangling after a number is removed (looped
     until stable, so cascades like "() → OR 3 → 3" fully resolve). */
  _cleanupTokens(tokens) {
    const isBin = (x) => x && x.t === 'op' && (x.v === 'AND' || x.v === 'OR');
    const isNot = (x) => x && x.t === 'op' && x.v === 'NOT';
    let t = tokens.slice();
    for (let changed = true; changed; ) {
      changed = false;
      const out = [];
      for (let i = 0; i < t.length; i++) {
        const cur = t[i], prev = out[out.length - 1], next = t[i + 1];
        if (cur.t === 'lp' && next && next.t === 'rp') { i++; changed = true; continue; }   /* empty () */
        if (cur.t === 'lp' && next && next.t === 'num' && t[i + 2] && t[i + 2].t === 'rp') {  /* redundant ( n ) → n */
          out.push(next); i += 2; changed = true; continue;
        }
        if (isBin(cur) && (!prev || prev.t === 'lp' || prev.t === 'op')) { changed = true; continue; }   /* binary op with no left operand */
        if (isBin(cur) && (!next || next.t === 'rp' || next.t === 'op')) { changed = true; continue; }   /* …or no right operand */
        if (isNot(cur) && (!next || next.t === 'rp' || isBin(next))) { changed = true; continue; }        /* NOT with nothing to negate */
        out.push(cur);
      }
      t = out;
    }
    return t;
  }
  /* Remove condition at 1-indexed position k: drop its reference, shift higher
     numbers down one, tidy up. Returns the new pattern ('' → revert to derived). */
  _patternAfterRemove(pattern, k) {
    const mapped = [];
    for (const tk of this._tokenizePattern(pattern)) {
      if (tk.t !== 'num') { mapped.push(tk); continue; }
      if (tk.v === k) continue;                          /* the removed condition */
      mapped.push(tk.v > k ? { t: 'num', v: tk.v - 1 } : tk);
    }
    return this._stringifyPattern(this._cleanupTokens(mapped));
  }
  /* Duplicate of condition at 1-indexed position k inserts a copy at k+1: shift
     numbers above k up one, then reference the new row (AND) beside the original
     (or append if the original wasn't referenced, so the copy isn't orphaned). */
  _patternAfterDuplicate(pattern, k) {
    const shifted = this._tokenizePattern(pattern)
      .map((tk) => (tk.t === 'num' && tk.v > k ? { t: 'num', v: tk.v + 1 } : tk));
    const insert = [{ t: 'op', v: 'AND' }, { t: 'num', v: k + 1 }];
    const at = shifted.findIndex((tk) => tk.t === 'num' && tk.v === k);
    if (at >= 0) shifted.splice(at + 1, 0, ...insert);
    else shifted.push(...insert);
    return this._stringifyPattern(shifted);
  }
  /* Apply a renumbered pattern string: keep it if non-empty, else revert to the
     derived pattern (the expression collapsed to nothing). */
  _applyRenumberedPattern(str) {
    const s = (str || '').trim();
    if (s) this._query.pattern = s; else delete this._query.pattern;
  }
  /* Validate a custom pattern: only numbers (1…N), AND/OR/NOT and parentheses,
     balanced, referencing existing conditions. Returns an error string or null. */
  _validatePattern(str) {
    const s = (str || '').trim();
    if (!s) return 'Enter a pattern';
    const n = this._allRules().length;
    if (/[^0-9()\sandorANDORnotNOT]/.test(s.replace(/\bAND\b|\bOR\b|\bNOT\b/gi, ''))) return 'Use only numbers, AND, OR, NOT and ( )';
    const nums = s.match(/\d+/g) || [];
    if (!nums.length) return 'Reference at least one condition by number';
    for (const t of nums) { const v = Number(t); if (v < 1 || v > n) return `Condition ${t} doesn't exist (1–${n})`; }
    let depth = 0;
    for (const c of s) { if (c === '(') depth++; else if (c === ')') { depth--; if (depth < 0) return 'Unbalanced parentheses'; } }
    if (depth !== 0) return 'Unbalanced parentheses';
    return null;
  }
  _renderPattern(group) {
    const wrap = document.createElement('div');
    wrap.className = 'ds-cf-pattern';

    if (this._editingPattern) {
      /* Edit view mirrors the "save filter" bar: a full-width field + buttons on
         one row (no leading label; the placeholder carries the hint). */
      wrap.classList.add('is-editing');
      const editrow = document.createElement('div');
      editrow.className = 'ds-cf-pattern__editrow';
      const input = document.createElement('ds-text-input');
      input.className = 'ds-cf-pattern__input';
      input.setAttribute('size', 'small');
      input.setAttribute('full-width', '');   /* fills the row; nowrap keeps buttons beside it */
      input.setAttribute('label-position', 'top');
      input.setAttribute('show-helper-row', 'false');
      input.setAttribute('aria-label', 'Criteria pattern');
      input.setAttribute('placeholder', 'e.g. 1 AND (2 OR 3)');
      input.setAttribute('value', this._patternString(group));
      const ok = document.createElement('ds-button');
      ok.setAttribute('variant', 'primary'); ok.setAttribute('size', 'xsmall'); ok.textContent = 'Apply';
      const cancel = document.createElement('ds-button');
      cancel.setAttribute('variant', 'outline'); cancel.setAttribute('size', 'xsmall'); cancel.textContent = 'Cancel';
      const err = document.createElement('ds-field-helper');
      err.className = 'ds-cf-pattern__err'; err.setAttribute('state', 'error'); err.hidden = true;
      const commit = () => {
        const v = (input.value || '').trim();
        const msg = this._validatePattern(v);
        if (msg) { err.setAttribute('text', msg); err.hidden = false; input.querySelector('input')?.focus(); return; }
        this._setPattern(v);
      };
      ok.addEventListener('click', commit);
      cancel.addEventListener('click', () => { this._editingPattern = false; this._render(); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.stopPropagation(); this._editingPattern = false; this._render(); }
      });
      editrow.append(input, ok, cancel);
      wrap.append(editrow, err);
      requestAnimationFrame(() => input.querySelector('input')?.focus());
    } else {
      const label = document.createElement('span');
      label.className = 'ds-cf-pattern__label'; label.textContent = 'Criteria pattern';
      wrap.appendChild(label);
      const invalid = this._hasCustomPattern() && this._validatePattern(this._query.pattern);
      const val = document.createElement('span');
      val.className = 'ds-cf-pattern__value' + (invalid ? ' is-invalid' : '');
      val.textContent = this._patternString(group);
      if (invalid) val.title = invalid;
      wrap.appendChild(val);
      const edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'ds-cf-pattern__edit'; edit.textContent = 'Edit';
      edit.setAttribute('aria-label', 'Edit criteria pattern');
      edit.addEventListener('click', () => { this._editingPattern = true; this._render(); });
      wrap.appendChild(edit);
      if (this._hasCustomPattern()) {
        const reset = document.createElement('button');
        reset.type = 'button'; reset.className = 'ds-cf-pattern__reset'; reset.textContent = 'Reset';
        reset.addEventListener('click', () => this._resetPattern());
        wrap.appendChild(reset);
      }
    }
    return wrap;
  }

  /* ---- Render ----------------------------------------------------------- */
  _render() {
    this._ready = false;
    this._rows = {};
    const rtl = this.hasAttribute('rtl') || this.getAttribute('dir') === 'rtl';
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');
    const title = this.getAttribute('title') || 'Filter criteria';
    const loading = this.hasAttribute('loading') && this.getAttribute('loading') !== 'false';
    /* Never show the "No conditions yet" empty state: when fields are configured,
       always seed one blank condition row so the builder opens ready to fill
       (matches the Clear-all behaviour — a builder is more useful than a prompt). */
    if (!loading && this._fields.length && this._query.rules.length === 0) {
      this._query.rules.push(this._newRule(this._fields[0]));
    }
    const hasRules = this._query.rules.length > 0;
    const overlay = this._isOverlay();

    const cardInner = `
      <div class="ds-criteria-filter__header">
        <span class="ds-cf-header-start">
          <span class="ds-criteria-filter__title">${this._esc(title)}</span>
          <span class="ds-cf-presets"></span>
        </span>
        <span class="ds-cf-header-end">
          <ds-text-link class="ds-cf-clear" variant="primary" size="medium" underline="hover" href="#"${hasRules && !loading ? '' : ' hidden'}>Clear all</ds-text-link>
          ${overlay ? '<button type="button" class="ds-cf-close" aria-label="Close"><ds-icon name="close" size="18"></ds-icon></button>' : ''}
        </span>
      </div>
      <div class="ds-criteria-filter__body"></div>
      <div class="ds-criteria-filter__preview" role="group" aria-label="Query summary" hidden></div>
      <div class="ds-criteria-filter__presetbar" hidden></div>
      <div class="ds-criteria-filter__footer" hidden></div>`;

    if (overlay) {
      this._root.className = 'ds-cf-host ds-cf-host--' + this.mode + (this._open ? ' is-open' : '');
      this._root.innerHTML =
        '<div class="ds-cf-backdrop"></div>' +
        `<div class="ds-criteria-filter" role="dialog" aria-modal="true" tabindex="-1" aria-label="${this._esc(title)}">${cardInner}</div>`;
    } else {
      this._root.className = 'ds-criteria-filter';
      this._root.innerHTML = cardInner;
    }

    const body = this._root.querySelector('.ds-criteria-filter__body');
    this._n = 0;   /* running condition counter for aria labels */

    if (loading) {
      body.innerHTML = Array.from({ length: 3 }, () =>
        '<div class="ds-cf-skel-row"><div class="ds-cf-skel ds-cf-skel--field"></div>'
        + '<div class="ds-cf-skel ds-cf-skel--op"></div><div class="ds-cf-skel ds-cf-skel--val"></div></div>').join('');
    } else if (!this._fields.length) {
      body.innerHTML = `<div class="ds-cf-empty-text">${this._esc(this.getAttribute('empty-text') || 'No fields configured.')}</div>`;
    } else if (!hasRules) {
      body.appendChild(this._renderEmpty());
    } else {
      body.appendChild(this._renderGroup(this._query, 0));
    }

    this._root.querySelector('.ds-cf-clear')?.addEventListener('click', (e) => { e.preventDefault(); this.clear(); });
    this._renderPresetUI();
    if (overlay) {
      this._root.querySelector('.ds-cf-backdrop')?.addEventListener('click', () => this.close());
      this._root.querySelector('.ds-cf-close')?.addEventListener('click', () => this.close());
      if (this._open && this.mode === 'popover') requestAnimationFrame(() => this._positionPopover());
    }
    if (!loading) { this._syncFooter(); this._refreshPreview(); }

    /* Controls mounted; enable user-driven edits once init events have drained.
       setTimeout fires even when offscreen (rAF can be throttled there). */
    const markReady = () => { this._ready = true; };
    setTimeout(markReady, 0);
    requestAnimationFrame(markReady);
  }

  _renderEmpty() {
    const el = document.createElement('ds-empty-state');
    el.setAttribute('illustration', 'common-search');
    el.setAttribute('title', 'No conditions yet');
    el.setAttribute('description', 'Add a condition to start building your filter.');
    el.setAttribute('primary-label', this.getAttribute('add-rule-label') || 'Add condition');
    el.setAttribute('show-secondary', 'false');
    el.setAttribute('size', 'sm');
    el.addEventListener('ds-empty-state-primary', () => this.addRule());
    return el;
  }

  /* Recursively render a group (root = depth 0). A group has an optional header
     (combinator + NOT + delete), its children (rules and nested groups), and an
     add-row. Nesting depth drives the left-connector tint via `data-depth`. */
  _renderGroup(group, depth, pos = 0) {
    const advanced = this._advanced && depth === 0;
    const el = document.createElement('section');
    el.className = 'ds-cf-group' + (depth === 0 ? ' ds-cf-group--root' : '') + (advanced ? ' ds-cf-group--advanced' : '');
    el.dataset.depth = String(Math.min(depth, 5));
    el.dataset.group = group.id;
    if (group.not) el.classList.add('is-negated');
    if (depth > 0) el.setAttribute('role', 'group');
    if (depth > 0) el.setAttribute('aria-label',
      `${group.not ? 'Not, ' : ''}condition group, match ${group.combinator === 'or' ? 'any' : 'all'}`);

    const head = this._renderGroupHead(group, depth);
    if (head) el.appendChild(head);

    /* Advanced: a nested, non-first-sibling group joins the previous sibling via
       an And/Or joiner shown on ITS FIRST condition row (in the same lead column
       as every other joiner), so it aligns with the rows instead of floating on
       the head. First-sibling groups (pos 0) just start the expression. */
    const firstRowLeadJoiner = (this._advanced && depth > 0 && pos > 0) ? group : null;

    const list = document.createElement('div');
    list.className = 'ds-cf-rules';
    group.rules.forEach((n, i) => list.appendChild(
      this._isGroup(n)
        ? this._renderGroup(n, depth + 1, i)
        : this._renderRule(n, i, depth, i === 0 ? firstRowLeadJoiner : null)
    ));
    el.appendChild(list);

    el.appendChild(this._renderAddRow(group, depth));
    /* Criteria pattern is a flat-only affordance — hide it once a group exists
       (the nesting already expresses grouping/precedence). */
    if (advanced && !this._hasGroups()) el.appendChild(this._renderPattern(group));
    return el;
  }

  /* Group header: combinator (only with ≥2 children) + NOT toggle + delete
     (nested groups only). Returns null when it would be empty (root, 1 child). */
  _renderGroupHead(group, depth) {
    const head = document.createElement('div');
    head.className = 'ds-cf-grouphead' + (depth === 0 ? ' ds-cf-grouphead--root' : '');
    /* Advanced: the group's leading And/Or (how it joins its previous sibling)
       is rendered INLINE on the group's first condition row — see _renderRule —
       so it aligns with the rows instead of floating on a separate head row.
       The head therefore carries only the group controls (Not + delete). */

    if (this._combinator && group.rules.length >= 2) {   /* advanced uses per-row joiners, not a group combinator */
      const combi = document.createElement('div');
      combi.className = 'ds-cf-combi';
      const lead = document.createElement('span'); lead.className = 'ds-cf-bar__label'; lead.textContent = 'Match';
      combi.appendChild(lead);
      const tf = document.createElement('ds-tab-filter');
      tf.setAttribute('aria-label', 'Combine conditions');
      tf.setAttribute('value', group.combinator === 'or' ? 'or' : 'and');
      tf.options = [{ value: 'and', label: 'All' }, { value: 'or', label: 'Any' }];
      tf.addEventListener('ds-tab-filter-change', (e) => {
        if (!this._ready) return;
        group.combinator = e.detail?.value === 'or' ? 'or' : 'and';
        this._structuralChange();
      });
      combi.appendChild(tf);
      const tail = document.createElement('span'); tail.className = 'ds-cf-bar__label';
      tail.textContent = depth === 0 ? 'of the following conditions' : 'of these';
      combi.appendChild(tail);
      head.appendChild(combi);
    }

    if (depth > 0) {
      const ctl = document.createElement('div');
      ctl.className = 'ds-cf-groupctl';
      if (this._canGroup && boolAttr(this, 'show-not', true)) {
        const not = document.createElement('ds-toggle');
        not.setAttribute('label', 'Not');
        not.setAttribute('size', 'small');
        if (group.not) not.setAttribute('checked', '');
        not.addEventListener('ds-toggle-change', (e) => {
          if (!this._ready) return;
          group.not = e.detail?.checked === true;
          this._structuralChange();
        });
        ctl.appendChild(not);
      }
      const del = document.createElement('ds-icon-button');
      del.setAttribute('icon', 'delete'); del.setAttribute('type', 'tertiary-grey'); del.setAttribute('size', 'large');
      del.setAttribute('label', 'Remove group');
      del.addEventListener('click', () => this._removeNode(group.id));
      ctl.appendChild(del);
      head.appendChild(ctl);
    }

    return head.children.length ? head : null;
  }

  /* Add-condition (+ add-group when nesting is allowed and under max-depth). */
  _renderAddRow(group, depth) {
    const row = document.createElement('div');
    row.className = 'ds-cf-addrow';
    const atRuleCap = this._maxRules != null && this._allRules().length >= this._maxRules;

    if (!atRuleCap) {
      const addC = document.createElement('ds-button');
      addC.setAttribute('variant', 'tertiary'); addC.setAttribute('size', 'small'); addC.setAttribute('prefix-icon', 'add');
      addC.textContent = this.getAttribute('add-rule-label') || 'Add condition';
      addC.addEventListener('click', () => this.addRule(group.id));
      row.appendChild(addC);
    }
    const underDepth = this._maxDepth == null || depth < this._maxDepth;
    if (this._canGroup && underDepth && !atRuleCap) {
      const addG = document.createElement('ds-button');
      addG.setAttribute('variant', 'tertiary'); addG.setAttribute('size', 'small'); addG.setAttribute('prefix-icon', 'add');
      addG.textContent = this.getAttribute('add-group-label') || 'Add group';
      addG.addEventListener('click', () => this.addGroup(group.id));
      row.appendChild(addG);
    }
    return row;
  }

  _renderRule(rule, pos, depth = 0, leadJoinerGroup = null) {
    const num = ++this._n;
    const row = document.createElement('div');
    row.className = 'ds-cf-rule';
    row.dataset.rule = rule.id;
    /* The control line never wraps (fields stay on one line); the validation
       helper sits on its own line below it. */
    const main = document.createElement('div');
    main.className = 'ds-cf-rule__main';

    /* Advanced variant: a leading cell. With a custom criteria pattern the logic
       lives in the pattern, so the lead shows the condition NUMBER (to reference
       it); otherwise it's the lead word on row 1 and an AND/OR joiner after. */
    if (this._advanced) {
      if (this._hasCustomPattern()) {
        const nlead = document.createElement('span');
        nlead.className = 'ds-cf-rule__lead ds-cf-lead-num';
        nlead.textContent = String(num);
        main.appendChild(nlead);
      } else if (pos === 0 && depth === 0) {
        const lead = document.createElement('span');
        lead.className = 'ds-cf-rule__lead ds-cf-lead-word';
        lead.textContent = this._leadWord;
        main.appendChild(lead);
      } else if (pos === 0 && leadJoinerGroup) {
        /* First row of a NESTED, non-first-sibling group: show the GROUP's
           And/Or here (inline with the row, aligned in the joiner column) —
           this is how the group joins its previous sibling. */
        const gj = document.createElement('ds-input-select');
        gj.className = 'ds-cf-rule__lead ds-cf-joiner';
        gj.setAttribute('size', 'small');
        gj.setAttribute('show-helper-row', 'false');
        gj.setAttribute('aria-label', 'Join group with');
        gj.options = [{ label: 'And', value: 'and' }, { label: 'Or', value: 'or' }];
        gj.setAttribute('value', leadJoinerGroup.joiner === 'or' ? 'or' : 'and');
        gj.addEventListener('ds-input-select-change', (e) => this._setJoiner(leadJoinerGroup, e.detail?.value ?? 'and'));
        main.appendChild(gj);
      } else if (pos === 0) {
        /* First row of a FIRST-sibling nested group — no joiner (it starts the
           expression). Keep the empty lead cell so field columns still align. */
        const sp = document.createElement('span');
        sp.className = 'ds-cf-rule__lead';
        sp.setAttribute('aria-hidden', 'true');
        main.appendChild(sp);
      } else {
        const joiner = document.createElement('ds-input-select');
        joiner.className = 'ds-cf-rule__lead ds-cf-joiner';
        joiner.setAttribute('size', 'small');
        joiner.setAttribute('show-helper-row', 'false');
        joiner.setAttribute('aria-label', `Join condition ${num} with`);
        joiner.options = [{ label: 'And', value: 'and' }, { label: 'Or', value: 'or' }];
        joiner.setAttribute('value', rule.joiner === 'or' ? 'or' : 'and');
        joiner.addEventListener('ds-input-select-change', (e) => this._setJoiner(rule, e.detail?.value ?? 'and'));
        main.appendChild(joiner);
      }
    }

    const field = this._field(rule.field);
    const op = this._opDef(rule.operator);

    /* Field select */
    const fieldSel = document.createElement('ds-input-select');
    fieldSel.className = 'ds-cf-rule__field';
    fieldSel.setAttribute('size', 'small');
    fieldSel.setAttribute('show-helper-row', 'false');
    fieldSel.setAttribute('placeholder', 'Choose field');
    fieldSel.setAttribute('aria-label', `Field for condition ${num}`);
    fieldSel.options = this._fields.map((f) => ({ label: f.label, value: f.name, disabled: f.disabled }));
    if (rule.field) fieldSel.setAttribute('value', rule.field);
    fieldSel.addEventListener('ds-input-select-change', (e) => this._setField(rule, e.detail?.value ?? ''));
    main.appendChild(fieldSel);

    /* Operator select */
    const opSel = document.createElement('ds-input-select');
    opSel.className = 'ds-cf-rule__operator';
    opSel.setAttribute('size', 'small');
    opSel.setAttribute('show-helper-row', 'false');
    opSel.setAttribute('placeholder', 'Operator');
    opSel.setAttribute('aria-label', `Operator for condition ${num}`);
    opSel.options = this._operatorDefs(field).map((o) => ({ label: o.label, value: o.name }));
    if (rule.operator) opSel.setAttribute('value', rule.operator);
    opSel.addEventListener('ds-input-select-change', (e) => this._setOperator(rule, e.detail?.value ?? ''));
    if (!field) opSel.setAttribute('disabled', '');
    main.appendChild(opSel);

    /* Value source (literal vs another field) — only when enabled + eligible. */
    const eligible = this._allowFieldSource && this._fieldSourceEligible(field, op);
    if (eligible) {
      const src = document.createElement('ds-input-select');
      src.className = 'ds-cf-rule__source';
      src.setAttribute('size', 'small');
      src.setAttribute('show-helper-row', 'false');
      src.setAttribute('aria-label', `Compare condition ${num} against`);
      src.options = [{ label: 'Value', value: 'value' }, { label: 'Field', value: 'field' }];
      src.setAttribute('value', rule.valueSource === 'field' ? 'field' : 'value');
      src.addEventListener('ds-input-select-change', (e) => this._setValueSource(rule, e.detail?.value ?? 'value'));
      main.appendChild(src);
    }

    /* Value editor (arity-driven, or a field picker when comparing to a field) */
    const valueWrap = document.createElement('div');
    valueWrap.className = 'ds-cf-rule__value';
    const editor = (eligible && rule.valueSource === 'field')
      ? this._renderFieldRef(rule, field, num)
      : this._renderValue(rule, field, op, num);
    if (editor) valueWrap.appendChild(editor);
    else { valueWrap.classList.add('is-empty'); valueWrap.setAttribute('aria-hidden', 'true'); }
    main.appendChild(valueWrap);

    /* Row actions (right-aligned) */
    const actions = document.createElement('div');
    actions.className = 'ds-cf-rule__actions';
    const dup = document.createElement('ds-icon-button');
    dup.setAttribute('icon', 'copy'); dup.setAttribute('type', 'tertiary-grey'); dup.setAttribute('size', 'large');
    dup.setAttribute('label', `Duplicate condition ${num}`);
    dup.addEventListener('click', () => this._duplicate(rule));
    const del = document.createElement('ds-icon-button');
    del.setAttribute('icon', 'delete'); del.setAttribute('type', 'tertiary-grey'); del.setAttribute('size', 'large');
    del.setAttribute('label', `Remove condition ${num}`);
    del.addEventListener('click', () => this._removeAndFocus(rule.id));
    actions.appendChild(dup); actions.appendChild(del);
    main.appendChild(actions);
    row.appendChild(main);

    /* Inline validation helper (its own line, below the control row) */
    const helper = document.createElement('ds-field-helper');
    helper.className = 'ds-cf-rule__error';
    helper.setAttribute('state', 'error');
    helper.hidden = true;
    row.appendChild(helper);

    this._rows[rule.id] = { row, helper };
    return row;
  }

  /* Maps field type + operator arity to a Prism value editor. */
  _renderValue(rule, field, op, num) {
    if (!field || !op || op.arity === 0) return null;

    /* range (arity 2) */
    if (op.arity === 2) {
      if (field.type === 'date' || field.type === 'datetime') {
        const dp = document.createElement('ds-date-picker');
        dp.setAttribute('type', 'range');
        dp.setAttribute('full-width', '');   /* fill the value cell (release the fixed input width) */
        dp.setAttribute('show-presets', '');
        dp.setAttribute('placeholder', field.placeholder || 'Select range');
        if (rule.value) dp.setAttribute('value', Array.isArray(rule.value) ? rule.value.join(',') : rule.value);
        dp.addEventListener('ds-date-picker-change', (e) => { rule.value = e.detail?.value ?? ''; this._valueEdit(); });
        return dp;
      }
      /* number range → two inputs with an "and" separator */
      const wrap = document.createElement('div');
      wrap.className = 'ds-cf-range';
      const v = Array.isArray(rule.value) ? rule.value : ['', ''];
      const mk = (idx, aria) => {
        const inp = document.createElement('ds-text-input');
        inp.setAttribute('type', 'number');
        inp.setAttribute('full-width', '');   /* release the per-size body cap → fills its half of the range */
        inp.setAttribute('label-position', 'top');   /* no left-label column → field fills the cell */
        inp.setAttribute('show-helper-row', 'false');
        inp.setAttribute('aria-label', `${aria} for condition ${num}`);
        if (v[idx] != null && v[idx] !== '') inp.setAttribute('value', String(v[idx]));
        inp.addEventListener('ds-input', (e) => {
          const cur = Array.isArray(rule.value) ? rule.value.slice() : ['', ''];
          cur[idx] = e.detail?.value ?? ''; rule.value = cur; this._valueEdit();
        });
        return inp;
      };
      wrap.appendChild(mk(0, 'Range start'));
      const sep = document.createElement('span'); sep.className = 'ds-cf-range__sep'; sep.textContent = 'and';
      wrap.appendChild(sep);
      wrap.appendChild(mk(1, 'Range end'));
      return wrap;
    }

    /* select (single) */
    if (field.type === 'select') {
      const sel = document.createElement('ds-input-select');
      sel.setAttribute('size', 'small');
      sel.setAttribute('full-width', '');   /* release the small field-col cap → fills the value cell */
      sel.setAttribute('show-helper-row', 'false');
      sel.setAttribute('placeholder', field.placeholder || 'Select value');
      sel.setAttribute('aria-label', `Value for condition ${num}`);
      sel.options = (field.options || []).map((o) => ({ label: o.label, value: o.value, disabled: o.disabled }));
      if (rule.value != null && rule.value !== '') sel.setAttribute('value', String(rule.value));
      sel.addEventListener('ds-input-select-change', (e) => { rule.value = e.detail?.value ?? ''; this._valueEdit(); });
      return sel;
    }

    /* multiselect → token field */
    if (field.type === 'multiselect') {
      const tf = document.createElement('ds-token-field');
      tf.setAttribute('full-width', '');   /* fills the value cell */
      tf.setAttribute('show-label', 'false');
      tf.setAttribute('show-helper-row', 'false');
      tf.setAttribute('placeholder', field.placeholder || 'Add values');
      const opts = field.options || [];
      const labelOf = (val) => opts.find((o) => o.value === val)?.label ?? val;
      tf.tokens = (Array.isArray(rule.value) ? rule.value : []).map((val) => ({ value: val, label: labelOf(val) }));
      if (opts.length) tf.suggestions = opts.map((o) => ({ value: o.value, label: o.label }));
      const push = () => { rule.value = tf.values || []; this._valueEdit(); };
      tf.addEventListener('ds-token-add', push);
      tf.addEventListener('ds-token-remove', push);
      tf.addEventListener('ds-tokens-change', push);
      return tf;
    }

    /* date / datetime (single) */
    if (field.type === 'date' || field.type === 'datetime') {
      const dp = document.createElement('ds-date-picker');
      dp.setAttribute('full-width', '');   /* fill the value cell (release the fixed input width) */
      dp.setAttribute('show-presets', '');
      dp.setAttribute('placeholder', field.placeholder || 'Select date');
      if (rule.value) dp.setAttribute('value', String(rule.value));
      dp.addEventListener('ds-date-picker-change', (e) => { rule.value = e.detail?.value ?? ''; this._valueEdit(); });
      return dp;
    }

    /* text / number (single) */
    const inp = document.createElement('ds-text-input');
    if (field.type === 'number') inp.setAttribute('type', 'number');
    inp.setAttribute('full-width', '');   /* release the per-size body cap → fills the value cell */
    inp.setAttribute('label-position', 'top');   /* no left-label column → field fills the cell */
    inp.setAttribute('show-helper-row', 'false');
    inp.setAttribute('placeholder', field.placeholder || 'Enter value');
    inp.setAttribute('aria-label', `Value for condition ${num}`);
    if (rule.value != null && rule.value !== '') inp.setAttribute('value', String(rule.value));
    inp.addEventListener('ds-input', (e) => { rule.value = e.detail?.value ?? ''; this._valueEdit(); });
    return inp;
  }

  /* Duplicate a rule in place (works at any nesting depth). */
  _duplicate(rule) {
    const f = this._findNode(rule.id);
    if (!f) return;
    const copy = this._cloneWithNewIds(rule);
    f.parent.rules.splice(f.index + 1, 0, copy);
    /* Advanced + custom pattern: the copy lands at position (index+1)+1, so shift
       higher numbers up and reference the new row beside the original. */
    if (this._advanced && this._hasCustomPattern() && f.parent === this._query) {
      this._applyRenumberedPattern(this._patternAfterDuplicate(this._query.pattern, f.index + 1));
    }
    this._structuralChange();
  }
  _removeAndFocus(id) {
    this.removeRule(id);
    requestAnimationFrame(() => {
      const next = this._root.querySelector('.ds-cf-rule ds-icon-button') || this._root.querySelector('ds-empty-state');
      next?.focus?.();
    });
  }

  /* Refresh per-row validity styling + helper text without rebuilding controls.
     Walks every leaf rule in the tree (nested rules included). */
  _refreshValidity() {
    this._allRules().forEach((rule) => {
      const ref = this._rows[rule.id]; if (!ref) return;
      const err = this._ruleError(rule);
      ref.row.classList.toggle('is-invalid', !!err);
      if (err) { ref.helper.setAttribute('text', err); ref.helper.hidden = false; }
      else { ref.helper.hidden = true; ref.helper.removeAttribute('text'); }
    });
  }

  /* ---- Field-to-field compare (Phase 4) --------------------------------- */
  /* When comparing to another field, the value editor is a picker of the other
     fields of the same type (so the comparison is meaningful). */
  _renderFieldRef(rule, field, num) {
    const sel = document.createElement('ds-input-select');
    sel.setAttribute('size', 'small');
    sel.setAttribute('full-width', '');   /* release the small field-col cap → fills the value cell */
    sel.setAttribute('show-helper-row', 'false');
    sel.setAttribute('placeholder', 'Select field');
    sel.setAttribute('aria-label', `Compare field for condition ${num}`);
    sel.options = this._fields
      .filter((f) => f.name !== field.name && f.type === field.type)
      .map((f) => ({ label: f.label, value: f.name }));
    if (rule.value != null && rule.value !== '') sel.setAttribute('value', String(rule.value));
    sel.addEventListener('ds-input-select-change', (e) => { rule.value = e.detail?.value ?? ''; this._valueEdit(); });
    return sel;
  }

  /* ---- Query preview (Phase 4) ------------------------------------------ */
  /* Natural-language summary + one removable chip per leaf rule. Read-only, so
     it can be rebuilt in place on every edit without disturbing focus. */
  _refreshPreview() {
    const host = this._root && this._root.querySelector('.ds-criteria-filter__preview');
    if (!host) return;
    const rules = this._allRules();
    if (!this._showPreview || !rules.length) { host.hidden = true; host.innerHTML = ''; return; }
    host.hidden = false;
    host.innerHTML =
      `<div class="ds-cf-preview__summary">${this._esc(this._describe(this._query, true))}</div>` +
      '<div class="ds-cf-preview__chips">' +
      rules.map((r) => `<ds-tag class="ds-cf-preview__chip" variant="subtle" size="medium" show-close data-rule="${this._esc(r.id)}">${this._esc(this._describeRule(r))}</ds-tag>`).join('') +
      '</div>';
    host.querySelectorAll('.ds-cf-preview__chip').forEach((t) => t.addEventListener('ds-tag-close', (e) => {
      const el = e.target.closest('[data-rule]'); if (el) this._removeNode(el.dataset.rule);
    }));
  }
  /* Recursive human-readable description of the tree. */
  _describe(group, top) {
    /* Advanced variant: flat rules joined by their per-row joiner. */
    if (this._advanced && top) {
      const rules = group.rules.filter((n) => !this._isGroup(n));
      return rules.map((r, i) => i === 0 ? this._describeRule(r) : `${r.joiner === 'or' ? 'or' : 'and'} ${this._describeRule(r)}`).join(' ');
    }
    const parts = group.rules.map((n) => this._isGroup(n) ? `(${this._describe(n)})` : this._describeRule(n)).filter(Boolean);
    if (!parts.length) return '';
    let s = parts.join(group.combinator === 'or' ? ' or ' : ' and ');
    if (group.not) s = `not (${s})`;
    return s;
  }
  _describeRule(rule) {
    const field = this._field(rule.field), op = this._opDef(rule.operator);
    const fl = field ? field.label : (rule.field || '(field)');
    if (!op) return fl;
    if (op.arity === 0) return `${fl} ${op.label.toLowerCase()}`;
    return `${fl} ${op.label.toLowerCase()} ${this._valueText(rule, field, op)}`;
  }
  _valueText(rule, field, op) {
    if (rule.valueSource === 'field') { const f2 = this._field(rule.value); return f2 ? `[${f2.label}]` : '[field]'; }
    const v = rule.value;
    if (v == null || v === '' || (Array.isArray(v) && !v.filter((x) => x != null && x !== '').length)) return '…';
    if (op.arity === 2) {
      if (field.type === 'number' && Array.isArray(v)) return `${v[0] ?? '…'} and ${v[1] ?? '…'}`;
      return String(v).replace(/[/,]/, ' – ');
    }
    if (field.type === 'multiselect') return (Array.isArray(v) ? v : [v]).map((x) => this._optionLabel(field, x)).join(', ');
    if (field.type === 'select') return this._optionLabel(field, v);
    if (field.type === 'text') return `"${v}"`;
    return String(v);
  }

  /* ---- Saved presets (Phase 5) ------------------------------------------ */
  /* Header controls: a picker of saved filters (load) + a "Save filter" button
     that opens an inline name bar. The component is controlled — it emits and
     the host persists into `presets`. */
  _renderPresetUI() {
    const host = this._root.querySelector('.ds-cf-presets');
    if (!host) return;
    host.innerHTML = '';
    if (this._presets === null) return;   /* opt-in: host hasn't enabled presets */

    if (this._presets.length) {
      const pick = document.createElement('ds-input-select');
      pick.className = 'ds-cf-preset-pick';
      pick.setAttribute('size', 'small');
      pick.setAttribute('full-width', '');   /* fill the 180px picker host (release the 160 field-col cap) */
      pick.setAttribute('show-helper-row', 'false');
      pick.setAttribute('placeholder', 'Saved filters');
      pick.setAttribute('aria-label', 'Load a saved filter');
      pick.options = this._presets.map((p) => ({ label: p.label, value: p.id }));
      /* Keep the currently-loaded saved filter shown in the picker across renders. */
      if (this._activePresetId && this._presets.some((p) => p.id === this._activePresetId)) {
        pick.setAttribute('value', this._activePresetId);
      }
      pick.addEventListener('ds-input-select-change', (e) => this._selectPreset(e.detail?.value));
      host.appendChild(pick);
    }
    /* Saving lives in the footer as "Save & apply" in apply-mode. Live/inline mode
       has no footer, so keep a header "Save filter" button there. */
    if (this._applyMode !== 'apply') {
      const save = document.createElement('ds-button');
      save.className = 'ds-cf-preset-save';
      save.setAttribute('variant', 'tertiary');
      save.setAttribute('size', 'small');
      save.setAttribute('prefix-icon', 'bookmark');
      save.textContent = 'Save filter';
      if (!this._query.rules.length) save.setAttribute('disabled', '');   /* nothing to save yet */
      save.addEventListener('click', () => this._openSaveBar());
      host.appendChild(save);
    }
  }
  _openSaveBar(applyAfter) {
    const bar = this._root.querySelector('.ds-criteria-filter__presetbar');
    if (!bar) return;
    bar.hidden = false;
    bar.innerHTML = '';
    const input = document.createElement('ds-text-input');
    input.className = 'ds-cf-preset-name';
    input.setAttribute('size', 'small');
    input.setAttribute('full-width', '');   /* release the small-size body width cap → fills the bar */
    input.setAttribute('label-position', 'top');   /* no left-label column → field fills */
    input.setAttribute('show-helper-row', 'false');
    input.setAttribute('placeholder', 'Name this filter');
    input.setAttribute('aria-label', 'Preset name');
    const ok = document.createElement('ds-button');
    ok.setAttribute('variant', 'primary'); ok.setAttribute('size', 'xsmall'); ok.textContent = applyAfter ? 'Save & apply' : 'Save';
    const cancel = document.createElement('ds-button');
    cancel.setAttribute('variant', 'outline'); cancel.setAttribute('size', 'xsmall'); cancel.textContent = 'Cancel';
    bar.append(input, ok, cancel);
    /* Save the named preset, then (Save & apply) also commit the query. */
    const commit = () => { const label = (input.value || '').trim(); if (!label) { input.querySelector('input')?.focus(); return; } this._savePreset(label); this._closeSaveBar(); if (applyAfter) this.apply(); };
    ok.addEventListener('click', commit);
    cancel.addEventListener('click', () => this._closeSaveBar());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { e.stopPropagation(); this._closeSaveBar(); } });
    requestAnimationFrame(() => input.querySelector('input')?.focus());
  }
  _closeSaveBar() {
    const bar = this._root.querySelector('.ds-criteria-filter__presetbar');
    if (!bar) return;
    bar.hidden = true; bar.innerHTML = '';
    this._root.querySelector('.ds-cf-preset-save')?.focus?.();
  }

  _syncFooter() {
    const footer = this._root?.querySelector('.ds-criteria-filter__footer');
    if (!footer) return;
    if (this._applyMode !== 'apply') { footer.hidden = true; footer.innerHTML = ''; return; }
    const n = this._query.rules.length;
    footer.hidden = false;
    /* Save & apply lives here (secondary) only when the host has enabled presets;
       Apply stays the single primary, Cancel the outline. Order: Cancel · Save &
       apply · Apply (primary rightmost). */
    const presetsOn = this._presets !== null;
    footer.innerHTML =
      '<ds-button class="ds-cf-foot-cancel" variant="outline" size="small">Cancel</ds-button>' +
      (presetsOn ? '<ds-button class="ds-cf-foot-saveapply" variant="secondary-color" size="small">Save &amp; apply</ds-button>' : '') +
      `<ds-button class="ds-cf-foot-apply" variant="primary" size="small">Apply${n ? ` (${n})` : ''}</ds-button>`;
    footer.querySelector('.ds-cf-foot-cancel')?.addEventListener('click', () => this.cancel());
    footer.querySelector('.ds-cf-foot-saveapply')?.addEventListener('click', () => this._saveApply());
    footer.querySelector('.ds-cf-foot-apply')?.addEventListener('click', () => this.apply());
  }
}

if (!customElements.get('ds-criteria-filter')) customElements.define('ds-criteria-filter', DsCriteriaFilter);
