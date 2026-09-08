/* =============================================================================
   <ds-tree selection="none|single|multi" checkboxes size="small|medium"
            guides label="OU tree" rtl select-parents="cascade|independent">
     <ds-tree-item id="corp" text="corp.acme.com" icon="folder" expanded>
       <ds-tree-item id="ou-fin" text="Finance" icon="folder"></ds-tree-item>
     </ds-tree-item>
   </ds-tree>

   A hierarchy you can walk, expand and select — OU / custom-group / remote-office
   pickers, registry and file browsers, report category trees.

   Implements the WAI-ARIA Tree View pattern, which is most of the component:
   role=tree / treeitem / group, aria-expanded on parents only, aria-selected,
   aria-level / setsize / posinset, and ONE tab stop with a roving tabindex.

   Keyboard (arrows mirror under `rtl`, as ds-dropdown-menu already does):
     ArrowDown / ArrowUp   next / previous VISIBLE node
     ArrowRight            expand; already expanded → first child
     ArrowLeft             collapse; already collapsed → parent
     Home / End            first / last visible node
     Enter                 activate (ds-tree-activate)
     Space                 toggle selection
     *                     expand every sibling at this level
     printable char        type-ahead to the next matching visible node

   Items come from nested `items` data OR slotted <ds-tree-item> children:

     tree.items = [{ id, text, icon, badge, meta,
                     children: [...],      // nested
                     hasChildren: true,    // LAZY — no children yet; expanding
                                           //   fires ds-tree-expand and shows a
                                           //   per-node loading row
                     expanded, selected, disabled,
                     match: 'query',       // <mark> the first hit, as a DOM node
                     action: { text, actionId, icon } }];

   Expanded/selected state is held INTERNALLY (seeded from the data) so a click
   works without the consumer round-tripping new data back in. Read or drive it
   with the `expandedIds` / `selectedIds` properties.

   DOM is NESTED (a real `group` per branch) rather than flat rows, because it
   matches the ARIA pattern with no bookkeeping. aria-level/setsize/posinset are
   emitted anyway even though nesting makes them redundant: they are what a flat,
   virtualized rendering would need, so that swap stays an internal change rather
   than an API break.

   Events:
     - ds-tree-select    detail: { ids, id, selected, item }
     - ds-tree-expand    detail: { id, item, lazy }   (lazy → consumer sets children)
     - ds-tree-collapse  detail: { id, item }
     - ds-tree-activate  detail: { id, item }         (Enter / click on the label)
     - ds-tree-action    detail: { actionId, id, item }
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import { escapeHtml } from '../../utils/escape.js';
import { injectCss } from '../../utils/inject-css.js';
import '../../icons/icon.js';
/* Rendered on the data path — imported so they upgrade when the tree is loaded
   on its own, and their CSS injected for the same reason (see dual-list). */
import '../checkbox/checkbox.js';
import '../badge/badge.js';
import '../button/button.js';
[
  ['ds-tree-checkbox-css', '../checkbox/checkbox.css'],
  ['ds-tree-badge-css', '../badge/badge.css'],
  ['ds-tree-button-css', '../button/button.css'],
].forEach(([id, rel]) => injectCss(id, rel, import.meta.url));

const SELECTION = ['none', 'single', 'multi'];
const SIZES = ['small', 'medium'];
/* Cascade is the default because the endpoint-management case that drives this
   ("apply to these OUs") means the subtree. `independent` is for filter trees,
   where checking a parent must not silently widen the filter. */
const CASCADE = ['cascade', 'independent'];

export class DsTree extends HTMLElement {
  static get observedAttributes() {
    return ['selection', 'checkboxes', 'size', 'guides', 'label', 'rtl', 'select-parents'];
  }

  constructor() {
    super();
    /* A framework may set .items before upgrade — capture and replay it. */
    for (const prop of ['items', 'expandedIds', 'selectedIds']) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const v = this[prop];
        delete this[prop];
        this[`_pending_${prop}`] = v;
      }
    }
    this._items = null;          // null → render slotted children instead
    this._expanded = new Set();
    this._selected = new Set();
    this._loading = new Set();   // ids whose lazy children are in flight
    this._seeded = false;        // seed expanded/selected from data exactly once
    this._focusId = null;        // the single tab stop
    this._typeahead = { buffer: '', at: 0 };
  }

  connectedCallback() {
    this._initialChildren = this._directItems(this);
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    for (const prop of ['items', 'expandedIds', 'selectedIds']) {
      const key = `_pending_${prop}`;
      if (this[key] !== undefined) { this[prop] = this[key]; this[key] = undefined; }
    }
    if (!this._wired) {
      this._wired = true;
      this._root.addEventListener('keydown', this._onKeydown);
      this._root.addEventListener('click', this._onClick);
      this._root.addEventListener('ds-checkbox-change', this._onCheckbox);
    }
    this._render();
    /* Frameworks insert <ds-tree-item> after upgrade; _render has already consumed
       the initial set, so merge late arrivals and drop the now-redundant nodes. */
    watchLateChildren(this, (late) => {
      const rows = late.filter((n) => this._isItemTag(n));
      if (!rows.length) return;
      this._initialChildren.push(...rows);
      rows.forEach((n) => n.remove());
      this._slottedSource = null;
      this._render();
    });
  }

  disconnectedCallback() { stopLateChildren(this); }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* `guides` and `rtl` are chrome — a class repaint is enough. Everything else
       changes what each row CONTAINS (a checkbox column, an icon, control sizes),
       so it has to re-render. */
    if (name === 'guides' || name === 'rtl') this._paintChrome();
    else this._render();
  }

  /* ---- public data + state ------------------------------------------------ */

  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v.slice() : null;
    this._seeded = false;
    /* Drop state for nodes the new hierarchy does not contain. Without this,
       `selectedIds` kept reporting ids from the PREVIOUS data — a selection the
       consumer cannot see and cannot clear. */
    this._prune();
    if (this._root) this._render();
  }

  _prune() {
    const live = new Set();
    this._walk((n, p) => live.add(this._idOf(n, p)));
    for (const set of [this._selected, this._expanded, this._loading]) {
      [...set].forEach((id) => { if (!live.has(id)) set.delete(id); });
    }
  }

  get expandedIds() { return [...this._expanded]; }
  set expandedIds(v) {
    this._expanded = new Set(Array.isArray(v) ? v : []);
    if (this._root) this._render();
  }

  get selectedIds() { return [...this._selected]; }
  set selectedIds(v) {
    this._selected = new Set(Array.isArray(v) ? v : []);
    /* Visual-only: driving the selection from outside must not blink the tree
       either. Expansion is untouched, so no row appears or disappears. */
    if (this._root) this._paintSelection();
  }

  /* Mark a lazy branch as resolved. The consumer normally just assigns new
     `items`, but a tree built from slotted markup has no data to reassign — this
     clears the spinner either way. */
  setChildren(id, children) {
    const node = this._find(id);
    if (node) node.children = Array.isArray(children) ? children : [];
    this._loading.delete(id);
    this._expanded.add(id);
    this._paintExpansion(id);
  }

  expandAll() {
    this._walk((n) => { if (this._hasKids(n)) this._expanded.add(this._idOf(n)); });
    this._render();
  }

  collapseAll() { this._expanded.clear(); this._render(); }

  /* ---- rendering ---------------------------------------------------------- */

  _paintChrome() {
    const selection = enumAttr(this, 'selection', SELECTION, 'none');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const rtl = boolAttr(this, 'rtl');
    this._root.className = `ds-tree ds-tree--${size} ds-tree--select-${selection}`
      + (boolAttr(this, 'guides') ? ' ds-tree--guides' : '')
      + (boolAttr(this, 'checkboxes') ? ' ds-tree--checkboxes' : '');
    /* Guard the same-value set: `rtl` is observed and setAttribute fires
       attributeChangedCallback even when the value is unchanged, so an unguarded
       write re-enters this paint forever. convention-lint RULE 6 enforces this —
       it is the loop that shipped in ds-kpi-card and ds-form-footer. */
    if (rtl && this.getAttribute('dir') !== 'rtl') this.setAttribute('dir', 'rtl');
    else if (!rtl && this.getAttribute('dir') === 'rtl') this.removeAttribute('dir');
  }

  _render() {
    if (!this._root) return;
    this._paintChrome();
    const source = this._source();
    if (!this._seeded) { this._seed(source); this._seeded = true; }

    this._root.setAttribute('role', 'tree');
    const selection = enumAttr(this, 'selection', SELECTION, 'none');
    if (selection === 'multi') this._root.setAttribute('aria-multiselectable', 'true');
    else this._root.removeAttribute('aria-multiselectable');
    if (this.hasAttribute('label')) this._root.setAttribute('aria-label', this.getAttribute('label'));

    this._root.textContent = '';
    this._root.appendChild(this._renderLevel(source, 1, []));

    /* Exactly one node is tabbable. Keep the remembered one if it still exists,
       else fall back to the first visible node — a tree with no tab stop is
       unreachable by keyboard. */
    const visible = this._visible();
    if (!visible.some((el) => el.dataset.id === this._focusId)) {
      this._focusId = visible.length ? visible[0].dataset.id : null;
    }
    visible.forEach((el) => {
      el.setAttribute('tabindex', el.dataset.id === this._focusId ? '0' : '-1');
    });
  }

  _renderLevel(nodes, level, path) {
    const group = document.createElement('div');
    group.className = 'ds-tree__group';
    if (level > 1) group.setAttribute('role', 'group');
    nodes.forEach((node, i) => {
      const nodePath = [...path, i];
      group.appendChild(this._renderNode(node, level, i + 1, nodes.length, nodePath));
    });
    return group;
  }

  _renderNode(node, level, posinset, setsize, path) {
    const id = this._idOf(node, path);
    const hasKids = this._hasKids(node);
    const expanded = hasKids && this._expanded.has(id);
    const selected = this._selected.has(id);
    const loading = this._loading.has(id);
    const selection = enumAttr(this, 'selection', SELECTION, 'none');

    const wrap = document.createElement('div');
    wrap.className = 'ds-tree__node';

    const row = document.createElement('div');
    row.className = 'ds-tree__item';
    row.dataset.id = id;
    row.dataset.level = String(level);
    row.setAttribute('role', 'treeitem');
    row.setAttribute('aria-level', String(level));
    row.setAttribute('aria-setsize', String(setsize));
    row.setAttribute('aria-posinset', String(posinset));
    /* aria-expanded belongs ONLY on nodes that can have children — on a leaf it
       tells a screen reader there is something to open when there is not. */
    if (hasKids) row.setAttribute('aria-expanded', String(expanded));
    if (selection !== 'none') row.setAttribute('aria-selected', String(selected));
    if (node.disabled) row.setAttribute('aria-disabled', 'true');
    row.style.setProperty('--_tree-depth', String(level - 1));

    /* ---- twisty ---------------------------------------------------------
       A leaf still gets the box, so labels line up down a level whether or not
       a given node happens to have children. */
    const twisty = document.createElement('span');
    twisty.className = 'ds-tree__twisty';
    if (hasKids) {
      twisty.dataset.twisty = '';
      twisty.setAttribute('aria-hidden', 'true');
      twisty.innerHTML = `<ds-icon name="${expanded ? 'chevron-down' : 'chevron-right'}" size="14"></ds-icon>`;
    }
    row.appendChild(twisty);

    if (boolAttr(this, 'checkboxes') && selection !== 'none') {
      const cb = document.createElement('ds-checkbox');
      cb.setAttribute('size', enumAttr(this, 'size', SIZES, 'medium') === 'small' ? 'small' : 'medium');
      /* The row owns the accessible name; the checkbox must not repeat it as a
         second label, so it is named by the row and hidden from the tree walk. */
      cb.setAttribute('aria-label', `Select ${node.text ?? ''}`);
      const box = this._boxState(node, path, id);
      if (box === 'all') cb.setAttribute('checked', '');
      else if (box === 'some') cb.setAttribute('indeterminate', '');
      if (node.disabled) cb.setAttribute('disabled', '');
      cb.classList.add('ds-tree__check');
      row.appendChild(cb);
    }

    /* No `show-icons` flag: a node either supplies an icon or it does not, and a
       container attribute that could veto it only creates a way to set an icon
       and see nothing. */
    if (node.icon) {
      const ic = document.createElement('span');
      ic.className = 'ds-tree__icon';
      ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = `<ds-icon name="${escapeHtml(node.icon)}" size="16"></ds-icon>`;
      row.appendChild(ic);
    }

    const label = document.createElement('span');
    label.className = 'ds-tree__label';
    label.dataset.label = '';
    this._fillMarked(label, node.text == null ? '' : node.text, node.match);
    row.appendChild(label);

    if (node.badge != null) {
      const b = document.createElement('ds-badge');
      b.setAttribute('variant', 'subtle');
      b.setAttribute('size', 'small');
      b.setAttribute('state', 'default');
      b.setAttribute('label', String(typeof node.badge === 'object' ? node.badge.text : node.badge));
      if (typeof node.badge === 'object' && node.badge.state) b.setAttribute('state', node.badge.state);
      b.classList.add('ds-tree__badge');
      row.appendChild(b);
    }

    if (node.meta != null) {
      const m = document.createElement('span');
      m.className = 'ds-tree__meta';
      m.textContent = String(node.meta);   // textContent: device and OU names
      row.appendChild(m);
    }

    if (node.action && (node.action.text || node.action.icon)) {
      const btn = document.createElement('ds-button');
      btn.setAttribute('variant', node.action.variant || 'tertiary-grey');
      btn.setAttribute('size', enumAttr(this, 'size', SIZES, 'medium') === 'small' ? 'xsmall' : 'small');
      if (node.action.icon) btn.setAttribute('prefix-icon', node.action.icon);
      if (node.action.text) btn.setAttribute('label', node.action.text);
      btn.dataset.action = node.action.actionId ?? '';
      btn.classList.add('ds-tree__action');
      row.appendChild(btn);
    }

    wrap.appendChild(row);

    /* ---- children -------------------------------------------------------- */
    if (expanded) wrap.appendChild(this._childrenFor(node, level, path, loading));
    return wrap;
  }

  /* What hangs below an expanded row: the children, a loading stand-in, or a
     note that the branch is empty. Shared by the full render and the in-place
     expansion patch so the two cannot drift — the same reason _boxState is
     shared by the render and _paintSelection. */
  _childrenFor(node, level, path, loading) {
    if (loading) {
      const busy = document.createElement('div');
      busy.className = 'ds-tree__loading';
      busy.style.setProperty('--_tree-depth', String(level));
      busy.setAttribute('role', 'status');
      busy.textContent = 'Loading…';
      return busy;
    }
    if (Array.isArray(node.children) && node.children.length) {
      return this._renderLevel(node.children, level + 1, path);
    }
    const empty = document.createElement('div');
    empty.className = 'ds-tree__empty';
    empty.style.setProperty('--_tree-depth', String(level));
    empty.textContent = 'No items';
    return empty;
  }

  /* Expand/collapse DOES change which rows exist, so unlike selection it has to
     build DOM — but only for the branch that changed. Re-rendering the whole
     tree here churned 45 nodes on an 8-row tree and re-upgraded every ds-icon,
     which is the same blink the checkbox path had, just on a different key. */
  _paintExpansion(id) {
    const row = this._visible().find((r) => r.dataset.id === id);
    if (!row) { this._render(); return; }          // off-screen: nothing to patch
    const node = this._find(id);
    if (!node) { this._render(); return; }
    const wrap = row.parentElement;
    const level = Number(row.dataset.level);
    const path = this._pathOf(id) || [];
    const expanded = this._expanded.has(id);

    if (this._hasKids(node)) row.setAttribute('aria-expanded', String(expanded));
    const twisty = row.querySelector('[data-twisty]');
    if (twisty) {
      /* Retarget the existing glyph rather than replacing it. ds-icon observes
         `name`, so setting it re-renders in place instead of tearing the element
         down and re-resolving from the sprite — one fewer thing to flicker on
         every single toggle. */
      const want = expanded ? 'chevron-down' : 'chevron-right';
      const glyph = twisty.querySelector('ds-icon');
      if (glyph) glyph.setAttribute('name', want);
      else twisty.innerHTML = `<ds-icon name="${want}" size="14"></ds-icon>`;
    }
    /* Drop whatever currently hangs below this row, then rebuild just that. */
    while (wrap.lastElementChild && wrap.lastElementChild !== row) wrap.lastElementChild.remove();
    if (expanded) wrap.appendChild(this._childrenFor(node, level, path, this._loading.has(id)));

    /* Rows came or went, so the single tab stop may have vanished with them. */
    const visible = this._visible();
    if (!visible.some((el) => el.dataset.id === this._focusId)) {
      this._focusId = visible.length ? visible[0].dataset.id : null;
    }
    this._applyTabStops();
  }

  /* Search-match highlighting, identical in approach to ds-item-list: the <mark>
     is a DOM node around a slice of textContent, never an HTML sink, because
     these strings are OU and device names straight off an API. */
  _fillMarked(el, value, match) {
    const text = String(value);
    const q = typeof match === 'string' ? match.trim() : '';
    const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
    if (at < 0) { el.textContent = text; return; }
    el.textContent = '';
    if (at > 0) el.appendChild(document.createTextNode(text.slice(0, at)));
    const m = document.createElement('mark');
    m.textContent = text.slice(at, at + q.length);
    el.appendChild(m);
    const tail = text.slice(at + q.length);
    if (tail) el.appendChild(document.createTextNode(tail));
  }

  /* ---- interaction ------------------------------------------------------- */

  _onClick = (e) => {
    const row = e.target.closest?.('.ds-tree__item');
    if (!row || !this._root.contains(row)) return;
    const id = row.dataset.id;
    const node = this._find(id);
    if (!node || node.disabled) return;

    const action = e.target.closest?.('.ds-tree__action');
    if (action) {
      this._emit('ds-tree-action', { actionId: action.dataset.action || null, id, item: node });
      return;
    }
    if (e.target.closest?.('.ds-tree__check')) return;   // the checkbox owns its own event

    this._focusId = id;
    /* The twisty toggles and NOTHING else — no select, no activate. It must
       re-render: _toggle only mutates the expanded set, and returning here
       without a render left the state changed and the DOM stale, so clicking a
       chevron visibly did nothing (the lazy case only appeared to work because
       setChildren() happened to re-render later). */
    if (e.target.closest?.('[data-twisty]')) {
      this._toggle(id);
      this._paintExpansion(id);
      return;
    }

    if (this._hasKids(node) && enumAttr(this, 'selection', SELECTION, 'none') === 'none') {
      this._toggle(id);   // a read-only tree: clicking a branch opens it
      this._paintExpansion(id);
      return;
    }
    /* Selecting is visual-only — patch in place so the tree does not blink and
       the focused row survives. */
    this._select(id, node);
    this._emit('ds-tree-activate', { id, item: node });
    this._paintSelection();
    this._applyTabStops();
  };

  _onCheckbox = (e) => {
    const row = e.target.closest?.('.ds-tree__item');
    if (!row) return;
    e.stopPropagation();
    const id = row.dataset.id;
    const node = this._find(id);
    if (!node || node.disabled) return;
    this._focusId = id;
    this._setSelected(id, node, !this._selected.has(id));
    this._paintSelection();
  };

  _onKeydown = (e) => {
    const visible = this._visible();
    if (!visible.length) return;
    /* Derive the current node from the EVENT, not from the remembered _focusId.
       Those agree when the user tabs in (the tab stop IS _focusId), but diverge
       the moment focus arrives any other way — a programmatic .focus(), or a
       consumer moving focus itself — and then every key silently acted on the
       wrong row. Sync _focusId back from the DOM so the tab stop follows too. */
    const fromEvent = e.target.closest?.('.ds-tree__item');
    const cur = (fromEvent && this._root.contains(fromEvent))
      ? fromEvent
      : visible[Math.max(0, visible.findIndex((n) => n.dataset.id === this._focusId))];
    const id = cur.dataset.id;
    this._focusId = id;
    const i = visible.indexOf(cur);
    const node = this._find(id);
    const rtl = boolAttr(this, 'rtl');
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const move = (to) => { if (to) { this._focusId = to.dataset.id; this._applyTabStops(); to.focus(); } };

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        const to = e.key === 'ArrowDown'
          ? visible[Math.min(i + 1, visible.length - 1)]
          : visible[Math.max(i - 1, 0)];
        move(to);
        /* Shift extends the selection as focus travels — APG's multi-select
           addition. Plain arrows deliberately do NOT change the selection: with
           `multi` the selection does not follow focus, or walking the tree would
           silently rewrite what the user had picked. */
        if (e.shiftKey) this._extendTo(to);
        return;
      }
      case 'Home':
      case 'End': {
        e.preventDefault();
        const to = e.key === 'Home' ? visible[0] : visible[visible.length - 1];
        if (e.shiftKey) this._extendRange(cur, to);
        move(to);
        return;
      }
      case forward: {
        e.preventDefault();
        if (!this._hasKids(node)) return;
        if (!this._expanded.has(id)) { this._toggle(id); this._paintExpansion(id); cur.focus(); return; }
        /* Already open → step INTO it. The first child is simply the next visible
           row, and only if it really is one level deeper (an expanded-but-empty
           or still-loading branch has none). */
        const next = visible[i + 1];
        if (next && Number(next.dataset.level) === Number(cur.dataset.level) + 1) move(next);
        return;
      }
      case back: {
        e.preventDefault();
        if (this._hasKids(node) && this._expanded.has(id)) { this._toggle(id); this._paintExpansion(id); cur.focus(); return; }
        /* Collapsed or a leaf → step out to the parent, which is the nearest
           preceding node one level up. */
        for (let j = i - 1; j >= 0; j--) {
          if (Number(visible[j].dataset.level) === Number(cur.dataset.level) - 1) { move(visible[j]); return; }
        }
        return;
      }
      case 'Enter':
        e.preventDefault();
        if (node && !node.disabled) {
          this._select(id, node);
          this._emit('ds-tree-activate', { id, item: node });
          this._paintSelection();
        }
        return;
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        if (node && !node.disabled) {
          this._setSelected(id, node, !this._selected.has(id));
          this._paintSelection();
        }
        return;
      case '*': {
        e.preventDefault();
        const level = Number(cur.dataset.level);
        const siblings = this._visible()
          .filter((el) => Number(el.dataset.level) === level)
          .map((el) => el.dataset.id)
          .filter((sid) => this._hasKids(this._find(sid)) && !this._expanded.has(sid));
        siblings.forEach((sid) => { this._expanded.add(sid); });
        /* Deepest first: patching a shallower branch would replace the DOM the
           later patches are looking for. */
        siblings.reverse().forEach((sid) => this._paintExpansion(sid));
        cur.focus();
        return;
      }
      default: break;
    }
    /* Ctrl/Cmd+A selects every selectable node, and again clears it — APG allows
       the toggle and it is the only way out of a large selection by keyboard. */
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      if (enumAttr(this, 'selection', SELECTION, 'none') !== 'multi') return;
      e.preventDefault();
      const all = [];
      this._walk((n, p) => { if (!n.disabled) all.push(this._idOf(n, p)); });
      const already = all.every((nid) => this._selected.has(nid));
      this._selected = already ? new Set() : new Set(all);
      this._emit('ds-tree-select', { ids: [...this._selected], id: null, selected: !already, item: null });
      this._paintSelection();
      return;
    }
    /* Type-ahead — a printable character jumps to the next visible node whose
       label starts with the accumulated buffer. */
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now();
      this._typeahead.buffer = (now - this._typeahead.at < 700 ? this._typeahead.buffer : '') + e.key.toLowerCase();
      this._typeahead.at = now;
      const q = this._typeahead.buffer;
      const order = [...visible.slice(i + 1), ...visible.slice(0, i + 1)];
      const hit = order.find((el) => (el.querySelector('[data-label]')?.textContent || '').toLowerCase().startsWith(q));
      if (hit) move(hit);
    }
  };

  /* Add one row to the selection as shift-focus passes over it. */
  _extendTo(rowEl) {
    if (!rowEl || enumAttr(this, 'selection', SELECTION, 'none') !== 'multi') return;
    const id = rowEl.dataset.id;
    const node = this._find(id);
    if (!node || node.disabled) return;
    this._setSelected(id, node, true);
    this._paintSelection();
  }

  /* Select every selectable row between two, inclusive — Shift+Home/End. */
  _extendRange(fromEl, toEl) {
    if (!fromEl || !toEl || enumAttr(this, 'selection', SELECTION, 'none') !== 'multi') return;
    const visible = this._visible();
    const a = visible.indexOf(fromEl);
    const b = visible.indexOf(toEl);
    if (a < 0 || b < 0) return;
    visible.slice(Math.min(a, b), Math.max(a, b) + 1).forEach((r) => {
      const node = this._find(r.dataset.id);
      if (node && !node.disabled) this._setSelected(r.dataset.id, node, true);
    });
    this._paintSelection();
  }

  _toggle(id) {
    const node = this._find(id);
    if (!node) return;
    if (this._expanded.has(id)) {
      this._expanded.delete(id);
      this._emit('ds-tree-collapse', { id, item: node });
      return;
    }
    this._expanded.add(id);
    /* Lazy branch: `hasChildren` with nothing loaded yet. Show the loading row and
       let the consumer fill it — via new `items` or setChildren(). */
    const lazy = !!node.hasChildren && !(Array.isArray(node.children) && node.children.length);
    if (lazy) this._loading.add(id);
    this._emit('ds-tree-expand', { id, item: node, lazy });
  }

  _select(id, node) {
    const selection = enumAttr(this, 'selection', SELECTION, 'none');
    if (selection === 'none') return;
    if (selection === 'single') {
      this._selected.clear();
      this._selected.add(id);
      this._emit('ds-tree-select', { ids: [...this._selected], id, selected: true, item: node });
      return;
    }
    this._setSelected(id, node, !this._selected.has(id));
  }

  _setSelected(id, node, on) {
    const selection = enumAttr(this, 'selection', SELECTION, 'none');
    if (selection === 'none') return;
    if (selection === 'single') {
      this._selected.clear();
      if (on) this._selected.add(id);
    } else {
      if (on) this._selected.add(id); else this._selected.delete(id);
      if (enumAttr(this, 'select-parents', CASCADE, 'cascade') === 'cascade') {
        this._cascade(node, on, this._pathOf(id) || []);
        /* …then settle the ancestors. `independent` deliberately skips this: not
           touching the rest of the tree is the whole point of that mode. */
        this._syncParents();
      }
    }
    this._emit('ds-tree-select', { ids: [...this._selected], id, selected: on, item: node });
  }

  /* Cascade DOWN only. Parents are never auto-checked — they show `indeterminate`
     instead (see _isPartiallySelected), because a half-selected parent that
     reported itself as checked would over-report the selection to the consumer. */
  _cascade(node, on, path) {
    (node.children || []).forEach((child, i) => {
      const cid = this._idOf(child, [...path, i]);
      if (child.disabled) return;
      if (on) this._selected.add(cid); else this._selected.delete(cid);
      this._cascade(child, on, [...path, i]);
    });
  }

  /* The ONE rule for what a checkbox shows, so the initial render and the
     in-place repaint can never disagree.

     Under `cascade` a parent reflects its SUBTREE: deriving it from its own
     membership drew a fully-checked branch as EMPTY and kept a parent checked
     after a child was unchecked. Under `independent` a parent reflects ITSELF —
     standing alone is the point of that mode, and reading the subtree there left
     a parent the user had just checked showing empty. */
  _boxState(node, path, id) {
    const cascade = enumAttr(this, 'select-parents', CASCADE, 'cascade') === 'cascade';
    const kids = this._hasKids(node) && Array.isArray(node.children) && node.children.length;
    if (!kids || !cascade) return this._selected.has(id) ? 'all' : 'none';
    return this._subtreeState(node, path);
  }

  /* A selection change is VISUAL-ONLY, so patch the existing rows.
     _render() rebuilds every row from scratch, which tore down and re-upgraded
     every ds-icon and ds-checkbox in the tree on each click — the whole tree
     visibly blinked, and the focused row was destroyed with it. Only
     expand/collapse changes which rows EXIST, so only that path re-renders.
     Rows are matched on dataset.id rather than a selector, so an id containing
     quotes needs no escaping. */
  _paintSelection() {
    const selection = enumAttr(this, 'selection', SELECTION, 'none');
    const byId = new Map();
    this._visible().forEach((r) => byId.set(r.dataset.id, r));
    this._walk((node, path) => {
      const id = this._idOf(node, path);
      const row = byId.get(id);
      if (!row) return;                       // inside a collapsed branch
      const box = this._boxState(node, path, id);
      if (selection !== 'none') row.setAttribute('aria-selected', String(this._selected.has(id)));
      const cb = row.querySelector('.ds-tree__check');
      if (!cb) return;
      if (box === 'all') { cb.setAttribute('checked', ''); cb.removeAttribute('indeterminate'); }
      else if (box === 'some') { cb.removeAttribute('checked'); cb.setAttribute('indeterminate', ''); }
      else { cb.removeAttribute('checked'); cb.removeAttribute('indeterminate'); }
    });
  }

  /* 'all' | 'some' | 'none' for a node's descendants. DISABLED descendants are
     ignored: they can never be selected, so counting them would mean a branch
     holding one permanently-unselectable child could never read as fully picked
     however much the user chose. */
  _subtreeState(node, path) {
    let selectable = 0;
    let picked = 0;
    const walk = (n, p) => {
      (n.children || []).forEach((c, i) => {
        const cp = [...p, i];
        if (!c.disabled) {
          selectable += 1;
          if (this._selected.has(this._idOf(c, cp))) picked += 1;
        }
        walk(c, cp);
      });
    };
    walk(node, path);
    if (!selectable || !picked) return 'none';
    return picked === selectable ? 'all' : 'some';
  }

  /* Keep `selectedIds` agreeing with what the checkboxes show: a parent belongs
     to the selection exactly when its whole selectable subtree does. Without
     this the two could disagree — a parent still listed as selected after a child
     was unchecked, over-reporting the selection to whatever consumes it.
     Bottom-up, so a grandparent sees its children's settled state. */
  _syncParents() {
    const visit = (nodes, path) => (nodes || []).forEach((n, i) => {
      const p = [...path, i];
      visit(n.children, p);
      if (!(this._hasKids(n) && Array.isArray(n.children) && n.children.length)) return;
      const id = this._idOf(n, p);
      if (this._subtreeState(n, p) === 'all') this._selected.add(id);
      else this._selected.delete(id);
    });
    visit(this._source(), []);
  }

  /* ---- helpers ----------------------------------------------------------- */

  _isItemTag(n) { return n.tagName && n.tagName.toLowerCase() === 'ds-tree-item'; }
  _directItems(el) { return [...el.children].filter((c) => this._isItemTag(c)); }

  /* Slotted markup is read ONCE and cached. _fromElement is destructive on the
     element tree, so re-reading it on a later render would find nothing — the
     bug that made ds-item-list's suite hang until it cached the same way. */
  _source() {
    if (this._items !== null) return this._items;
    if (!this._slottedSource) {
      this._slottedSource = (this._initialChildren || []).map((el) => this._fromElement(el));
    }
    return this._slottedSource;
  }

  _fromElement(el) {
    const attr = (n) => (el.hasAttribute(n) ? el.getAttribute(n) : undefined);
    return {
      id: attr('id'),
      text: attr('text'),
      icon: attr('icon'),
      badge: attr('badge'),
      meta: attr('meta'),
      match: attr('match'),
      expanded: el.hasAttribute('expanded'),
      selected: el.hasAttribute('selected'),
      disabled: el.hasAttribute('disabled'),
      hasChildren: el.hasAttribute('has-children'),
      children: this._directItems(el).map((c) => this._fromElement(c)),
    };
  }

  /* An `id` is what expanded/selected state is keyed on. Fall back to the index
     path so a tree built without ids still works — but the ids are then
     positional, so reordering the data reshuffles the state. */
  _idOf(node, path) {
    if (node && node.id != null && node.id !== '') return String(node.id);
    return `@${(path || []).join('.')}`;
  }

  _hasKids(node) {
    return !!node && (!!node.hasChildren || (Array.isArray(node.children) && node.children.length > 0));
  }

  _seed(source) {
    const walk = (nodes, path) => nodes.forEach((n, i) => {
      const id = this._idOf(n, [...path, i]);
      if (n.expanded) this._expanded.add(id);
      if (n.selected) this._selected.add(id);
      walk(n.children || [], [...path, i]);
    });
    walk(source || [], []);
  }

  _walk(fn) {
    const walk = (nodes, path) => (nodes || []).forEach((n, i) => {
      fn(n, [...path, i]);
      walk(n.children, [...path, i]);
    });
    walk(this._source(), []);
  }

  _find(id) {
    let hit = null;
    this._walk((n, p) => { if (!hit && this._idOf(n, p) === id) hit = n; });
    return hit;
  }

  _pathOf(id) {
    let hit = null;
    this._walk((n, p) => { if (!hit && this._idOf(n, p) === id) hit = p; });
    return hit;
  }

  _visible() {
    return [...this._root.querySelectorAll('.ds-tree__item')];
  }

  _applyTabStops() {
    this._visible().forEach((el) => {
      el.setAttribute('tabindex', el.dataset.id === this._focusId ? '0' : '-1');
    });
  }

  /* Re-render destroys the focused element, so focus has to be re-placed by id
     rather than kept on a node reference. */
  _focusCurrent() {
    const el = this._visible().find((n) => n.dataset.id === this._focusId);
    if (el) el.focus();
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
  }
}

/* Declarative row. Holds no logic — ds-tree reads its attributes and nested
   <ds-tree-item> children, then renders the whole hierarchy itself. */
export class DsTreeItem extends HTMLElement {}

if (typeof customElements !== 'undefined' && !customElements.get('ds-tree')) {
  customElements.define('ds-tree', DsTree);
}
if (typeof customElements !== 'undefined' && !customElements.get('ds-tree-item')) {
  customElements.define('ds-tree-item', DsTreeItem);
}
