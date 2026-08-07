/* =============================================================================
   <ds-dropdown-menu type="default|select|multi-select|action|select-tick"
                     show-title title="Menu" show-footer rtl open></ds-dropdown-menu>

   Items are configured via the `items` property:

     menu.items = [
       { label: 'Edit',   value: 'edit',   icon: 'edit' },
       { label: 'Delete', value: 'delete', icon: 'trash', danger: true },
       { type: 'divider' },
       { type: 'heading', label: 'Group A' },
       // for select / multi-select / select-tick
       { label: 'Option', value: 'opt', selected: true },
     ];

   Backwards-compatible legacy types: `single` → `default`, `multi` → `multi-select`,
   `sections` → `default` (sections still work via item.type === 'heading').

   The element is a panel — bring your own trigger. Use the `open` and `close`
   methods, or the `open` boolean attribute, to control visibility.

   Events:
     - ds-dropdown-select   detail: { value, item }   (default / select / action; submenu leaf adds { parent })
     - ds-dropdown-change   detail: { value, selected, values, item }  (multi-select / select-tick toggle; alias: ds-dropdown-toggle)
     - ds-dropdown-apply    detail: { values }        (multi-select, on Apply)
     - ds-dropdown-select-all                         (bulk select)
     - ds-dropdown-clear-all                          (bulk clear; alias: ds-dropdown-clear)
     - ds-dropdown-reset                              (footer "Reset to default" — restores initial selection)
     - ds-dropdown-cancel                             (multi-select, on Cancel)
     - ds-dropdown-close                              (Escape / dismiss)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Selection indicators reuse the real controls (not re-drawn CSS). They render
   as presentational visuals — the <li> carries the role + aria state. */
import '../checkbox/checkbox.js';
import '../radio/radio.js';
/* Footer + selection-bar links reuse the TextLink component (no custom buttons). */
import '../text-link/text-link.js';

/* ds-checkbox / ds-radio are light-DOM (styled via their own CSS files). Auto-
   load those stylesheets so the embedded indicators are styled even on pages
   that link dropdown-menu.css without the full token/component bundle. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-dropdown-checkbox-css', '../checkbox/checkbox.css');
_injectCss('ds-dropdown-radio-css', '../radio/radio.css');
_injectCss('ds-dropdown-textlink-css', '../text-link/text-link.css');

/* Escape consumer-provided strings before they go into the menu's innerHTML.
   Labels/descriptions/badges are frequently data-derived (customer names, saved
   filters, dynamic options), so they must never be injected as raw HTML. */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const TYPES = ['default', 'select', 'multi-select', 'action', 'select-tick'];
const LEGACY_TYPE_MAP = {
  single: 'default',
  multi: 'multi-select',
  sections: 'default',
};

export class DsDropdownMenu extends HTMLElement {
  static get observedAttributes() {
    return [
      'type', 'title', 'show-title', 'show-footer', 'footer-text', 'footer-icon',
      'show-select-all', 'show-clear-all', 'show-reset', 'show-apply', 'show-cancel',
      'select-all-text', 'clear-all-text', 'reset-text', 'apply-label', 'cancel-label',
      'empty-text',
      // legacy
      'header-text', 'show-header',
      'rtl', 'open',
    ];
  }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items;
      delete this.items;
      this._pendingItems = v;
    }
    this._items = [];
  }

  connectedCallback() {
    if (!this._panel) {
      this.innerHTML = '';
      this._panel = document.createElement('div');
      this._panel.className = 'ds-dropdown-menu';
      this.appendChild(this._panel);
    }
    if (this._pendingItems !== undefined) {
      this.items = this._pendingItems;
      this._pendingItems = undefined;
    }
    this._render();
    document.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown);
    this._unbindReanchor();
    this._destroySubmenus();
  }

  attributeChangedCallback(name) {
    if (this._panel) this._render();
    if (name === 'open' && this.hasAttribute('open') && this._panel) {
      requestAnimationFrame(() => {
        const first = this._panel.querySelector(
          '.ds-dropdown-menu__item:not([aria-disabled="true"])'
        );
        first?.focus();
      });
    }
    if (name === 'open' && !this.hasAttribute('open')) {
      this._closeActiveSubmenu();
    }
  }

  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v.slice() : [];
    /* Snapshot the initial selection so "Reset to default" can restore it. */
    this._initialSelected = new Set(
      this._items.filter((it) => it && it.selected).map((it) => it.value ?? it.label));
    if (this._panel) this._render();
  }

  open() { this.setAttribute('open', ''); }
  close() {
    this.removeAttribute('open');
    this._closeActiveSubmenu();
    this._unbindReanchor();
    this.dispatchEvent(new CustomEvent('ds-dropdown-close', { bubbles: true }));
  }
  toggle() { this.hasAttribute('open') ? this.close() : this.open(); }

  /* Position the panel next to a trigger (element or a DOMRect-like {top,bottom,
     left,right}), flipping ABOVE when there isn't room below, and clamping on
     screen. Uses fixed positioning. The panel is only visibility-hidden while
     closed (never display:none), so it measures correctly before open().
     opts: { gap=6, margin=8, align='right'|'left' } — align sets which trigger
     edge the panel lines up with (default right, for action ⋯ menus). */
  positionFrom(anchor, opts = {}) {
    if (typeof window === 'undefined' || !anchor) return;
    /* Remember the trigger so the panel can re-anchor to it on scroll/resize —
       a fixed-position panel would otherwise stay pinned to the viewport while
       its trigger scrolls away. */
    this._anchor = anchor;
    this._anchorOpts = opts;
    this._bindReanchor();
    const rect = anchor instanceof Element ? anchor.getBoundingClientRect() : anchor;
    const gap = opts.gap ?? 6;
    const margin = opts.margin ?? 8;
    this.style.position = 'fixed';
    if (!this.style.zIndex) this.style.zIndex = '1200';
    /* Measure the inner panel (the sized box). The host collapses to ~0 height,
       so measuring `this` would defeat the space check. The panel is laid out
       even while the host is closed (visibility-hidden, not display:none). */
    const box = this._panel || this;
    const menuH = box.offsetHeight || box.getBoundingClientRect().height;
    const menuW = box.offsetWidth  || box.getBoundingClientRect().width;
    const vh = window.innerHeight, vw = window.innerWidth;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    /* Vertical placement:
       - vAlign 'top' : panel's TOP edge lines up with the trigger's top (used
                        for side-opening action menus). Clamped up if it would
                        overflow the bottom.
       - default      : panel drops BELOW the trigger, flipping ABOVE only when
                        below lacks room and above has more. */
    let top, flipped = false;
    if (opts.vAlign === 'top') {
      top = Math.min(rect.top, vh - menuH - margin);
    } else if (spaceBelow >= menuH + gap + margin || spaceBelow >= spaceAbove) {
      top = Math.min(rect.bottom + gap, vh - menuH - margin);
    } else {
      top = Math.max(margin, rect.top - gap - menuH);
      flipped = true;
    }
    top = Math.max(margin, top);
    /* Horizontal placement:
       - 'before' : panel sits entirely to the LEFT of the trigger, so a
                    right-edge action (⋯) column stays visible on every row.
       - 'left'   : panel's left edge aligns with the trigger's left edge.
       - default  : panel's right edge aligns with the trigger's right edge. */
    let left;
    if (opts.align === 'before')    left = rect.left - gap - menuW;
    else if (opts.align === 'left') left = rect.left;
    else                            left = rect.right - menuW;
    left = Math.max(margin, Math.min(left, vw - menuW - margin));
    this.style.top = top + 'px';
    this.style.left = left + 'px';
    /* Grow the open animation from the edge nearest the trigger. */
    this.style.transformOrigin = flipped ? 'bottom center' : 'top center';
  }

  /* Convenience — open then position against a trigger in one call. Opening
     first guarantees the panel is laid out for an accurate measurement; the
     style writes are batched in the same task, so there's no flash. */
  openFrom(anchor, opts = {}) { this.open(); this.positionFrom(anchor, opts); }

  /* Keep the panel glued to its trigger while open: reposition on any scroll
     (capture phase catches inner scroll containers, not just the window) and on
     resize. If the trigger has scrolled out of view or been removed, close. */
  _reanchor = () => {
    if (!this.hasAttribute('open') || !this._anchor) return;
    const a = this._anchor;
    if (a instanceof Element) {
      if (!a.isConnected) { this.close(); return; }
      const r = a.getBoundingClientRect();
      const off = r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth;
      if (off) { this.close(); return; }
    }
    this.positionFrom(this._anchor, this._anchorOpts);
  };
  _bindReanchor() {
    if (this._reanchorBound || typeof window === 'undefined') return;
    this._reanchorBound = true;
    window.addEventListener('scroll', this._reanchor, true);
    window.addEventListener('resize', this._reanchor);
  }
  _unbindReanchor() {
    if (!this._reanchorBound || typeof window === 'undefined') return;
    this._reanchorBound = false;
    window.removeEventListener('scroll', this._reanchor, true);
    window.removeEventListener('resize', this._reanchor);
  }

  /* Public — open the cascade sub-menu belonging to an item by value/label.
     Useful for triggers that live outside the menu (e.g. a footer "Browse"
     link) but should mirror what hovering the parent row does. */
  openSubmenuFor(valueOrLabel) {
    if (!this._panel) return;
    const lis = this._panel.querySelectorAll('.ds-dropdown-menu__item[data-has-sub]');
    for (const li of lis) {
      const idx = Number(li.dataset.index);
      const item = this._items[idx];
      if (!item) continue;
      if (item.value === valueOrLabel || item.label === valueOrLabel) {
        this._openSubmenu(li, item);
        return;
      }
    }
  }

  _onKeydown = (e) => {
    if (!this.hasAttribute('open')) return;
    if (e.key === 'Escape') { this.close(); return; }
    /* Focus trap — keep Tab/Shift+Tab cycling inside the multi-select dialog
       (spec §138). Only engages while focus is already within the panel, so it
       never hijacks the consumer's trigger or surrounding page. */
    if (e.key === 'Tab' && this._resolvedType() === 'multi-select') {
      const f = this._focusable();
      if (!f.length || !this._panel.contains(document.activeElement)) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  /* Focusable elements inside the panel, in DOM order — items (tabindex 0) then
     footer buttons. Skips hidden/disabled. */
  _focusable() {
    return [...this._panel.querySelectorAll(
      '.ds-dropdown-menu__item:not([aria-disabled="true"]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )].filter((el) => !el.hidden && el.offsetParent !== null);
  }

  _resolvedType() {
    const raw = this.getAttribute('type');
    if (raw && LEGACY_TYPE_MAP[raw]) return LEGACY_TYPE_MAP[raw];
    return enumAttr(this, 'type', TYPES, 'default');
  }

  _boolAttrDefault(name, defaultValue) {
    if (!this.hasAttribute(name)) return defaultValue;
    return this.getAttribute(name) !== 'false';
  }

  /* Toggle Select-all / Clear-all visibility based on current selection
     state. Called on each multi-select item toggle to keep no-op links
     out of view without doing a full re-render (which would steal focus). */
  _selectable() {
    return this._items.filter((it) => it && it.type !== 'heading' && it.type !== 'divider' && it.type !== 'selection-bar' && !it.disabled);
  }

  _refreshMultiFooterLinks() {
    const selectAllBtn = this._panel?.querySelector('.ds-dropdown-menu__footer [data-select-all]');
    const clearAllBtn  = this._panel?.querySelector('.ds-dropdown-menu__footer [data-clear-all]');
    if (!selectAllBtn && !clearAllBtn) return;
    const selectable = this._selectable();
    const selectedCount = selectable.filter((it) => it.selected).length;
    const allSelected  = selectable.length > 0 && selectedCount === selectable.length;
    const noneSelected = selectedCount === 0;
    if (selectAllBtn) selectAllBtn.hidden = allSelected;
    if (clearAllBtn)  clearAllBtn.hidden  = noneSelected;
  }

  /* Update the Selection Bar's "N selected" count in place (auto-count only). */
  _refreshSelectionCount() {
    const el = this._panel?.querySelector('.ds-dropdown-menu__selection-count');
    if (!el) return;
    const bar = this._items.find((it) => it && it.type === 'selection-bar');
    if (bar && bar.label) return;   // explicit label — leave it
    const count = this._items.filter((it) => it && it.selected).length;
    el.textContent = ((bar && bar.selectedText) || '{n} selected').replace('{n}', String(count));
  }

  /* Swap the Selection Bar action in place: Select all (default) → Deselect all
     once everything is selected. Avoids a full re-render so focus is kept. */
  _refreshSelectionBarActions() {
    const bar = this._panel?.querySelector('.ds-dropdown-menu__selection-bar');
    if (!bar) return;
    const selectable = this._selectable();
    const allSelected = selectable.length > 0 && selectable.every((it) => it.selected);
    const sa = bar.querySelector('[data-select-all]');
    const da = bar.querySelector('[data-deselect-all]');
    if (sa) sa.hidden = allSelected;
    if (da) da.hidden = !allSelected;
  }

  _render() {
    const type = this._resolvedType();
    const title = this.getAttribute('title') || this.getAttribute('header-text') || 'Menu';
    const showTitle = this._boolAttrDefault('show-title', false)
      || (this.hasAttribute('show-header') && this.getAttribute('show-header') !== 'false');
    const isMulti = type === 'multi-select';
    const showFooter = this._boolAttrDefault('show-footer', isMulti);

    const showSelectAll = this._boolAttrDefault('show-select-all', true);
    const showClearAll  = this._boolAttrDefault('show-clear-all', false);
    const showReset     = this._boolAttrDefault('show-reset', false);
    const showApply     = this._boolAttrDefault('show-apply', true);
    const showCancel    = this._boolAttrDefault('show-cancel', true);
    const selectAllText = this.getAttribute('select-all-text') || 'Select all';
    const clearAllText  = this.getAttribute('clear-all-text')  || 'Clear all';
    const resetText     = this.getAttribute('reset-text')      || 'Reset to default';
    const applyLabel    = this.getAttribute('apply-label')     || 'Apply';
    const cancelLabel   = this.getAttribute('cancel-label')    || 'Cancel';

    const rtl = boolAttr(this, 'rtl');
    const isOpen = boolAttr(this, 'open');

    this._panel.hidden = !isOpen;
    this._panel.dataset.type = type;
    if (rtl) this._panel.setAttribute('dir', 'rtl');
    else this._panel.removeAttribute('dir');

    this._panel.setAttribute('role',
      type === 'select' || type === 'select-tick' ? 'listbox'
      : isMulti ? 'dialog'
      : 'menu');
    /* select-tick is multi-selectable (multiple ticks) — announce it. */
    if (type === 'select-tick') this._panel.setAttribute('aria-multiselectable', 'true');
    else this._panel.removeAttribute('aria-multiselectable');

    const titleHTML = showTitle
      ? `<div class="ds-dropdown-menu__title">${esc(title)}</div>
         <hr class="ds-dropdown-menu__divider" />`
      : '';

    /* Empty state: when there are no real options (ignoring headings, dividers
       and the selection bar), show a "No options" row, not a 0-height surface. */
    const renderable = this._items.filter((it) => it && !['heading', 'divider', 'selection-bar'].includes(it.type));
    const emptyText = this.getAttribute('empty-text') || 'No options';
    const itemsHTML = renderable.length === 0
      ? `<ul class="ds-dropdown-menu__list"><li class="ds-dropdown-menu__empty" role="presentation">${esc(emptyText)}</li></ul>`
      : `<ul class="ds-dropdown-menu__list">${this._items.map((it, idx) => this._renderItem(it, idx, type)).join('')}</ul>`;

    let footerHTML = '';
    if (showFooter) {
      if (isMulti) {
        /* UX: hide Select-all when everything is already selected; hide Clear-all
           when nothing is selected. Both links are no-ops in those states, so
           surfacing them adds noise. The links live in the markup with `hidden`
           applied conditionally so we can flip visibility on toggle without a
           full re-render. */
        const selectable = this._selectable();
        const selectedCount = selectable.filter((it) => it.selected).length;
        const allSelected  = selectable.length > 0 && selectedCount === selectable.length;
        const noneSelected = selectedCount === 0;
        const selectAllHidden = allSelected ? 'hidden' : '';
        const clearAllHidden  = noneSelected ? 'hidden' : '';
        const rtlAttr = rtl ? 'rtl' : '';
        const links = [
          showSelectAll ? `<ds-text-link variant="primary" size="small" ${rtlAttr} data-select-all ${selectAllHidden}>${esc(selectAllText)}</ds-text-link>` : '',
          showClearAll  ? `<ds-text-link variant="primary" size="small" ${rtlAttr} data-clear-all ${clearAllHidden}>${esc(clearAllText)}</ds-text-link>`  : '',
          showReset     ? `<ds-text-link variant="subtle" size="small" ${rtlAttr} data-reset>${esc(resetText)}</ds-text-link>` : '',
        ].filter(Boolean).join('');
        const actions = [
          showCancel ? `<ds-button variant="tertiary" size="small" ${rtlAttr} data-cancel>${esc(cancelLabel)}</ds-button>` : '',
          showApply  ? `<ds-button variant="primary"  size="small" ${rtlAttr} data-apply>${esc(applyLabel)}</ds-button>`  : '',
        ].filter(Boolean).join('');
        footerHTML = `
          <hr class="ds-dropdown-menu__divider" />
          <div class="ds-dropdown-menu__footer ds-dropdown-menu__footer--multi">
            <div class="ds-dropdown-menu__footer-links">${links}</div>
            <div class="ds-dropdown-menu__footer-actions">${actions}</div>
          </div>`;
      } else {
        const footerText = this.getAttribute('footer-text') || '';
        const footerIcon = this.getAttribute('footer-icon') || '';
        if (footerText) {
          /* Footer button uses ds-button so it inherits all design-system
             button behaviour (variants, sizes, focus, disabled). */
          footerHTML = `
            <div class="ds-dropdown-menu__footer">
              <ds-button
                class="ds-dropdown-menu__footer-action"
                variant="tertiary"
                size="medium"
                ${rtl ? 'rtl' : ''}
                ${footerIcon ? `prefix-icon="${esc(footerIcon)}"` : ''}
                data-footer>${esc(footerText)}</ds-button>
            </div>`;
        }
      }
    }

    this._panel.innerHTML = titleHTML + itemsHTML + footerHTML;
    this._wire(type);
  }

  _renderItem(item, idx, type) {
    const rtl = boolAttr(this, 'rtl');
    const rtlAttr = rtl ? 'rtl' : '';
    if (item.type === 'heading') {
      /* Optional trailing action rendered as a text link on the heading's right
         (e.g. "Clear all" beside a "Saved filters" title). Emits ds-dropdown-action. */
      const headAction = item.action
        ? `<ds-text-link class="ds-dropdown-menu__section-heading-action" size="small" variant="primary" underline="hover" href="#" data-heading-action="${esc(item.action.id)}">${esc(item.action.label)}</ds-text-link>`
        : '';
      return `<li class="ds-dropdown-menu__section-heading${item.action ? ' ds-dropdown-menu__section-heading--with-action' : ''}" role="presentation">
                <span class="ds-dropdown-menu__section-heading-label">${esc(item.label)}</span>${headAction}
              </li>`;
    }
    if (item.type === 'divider') {
      return `<li class="ds-dropdown-menu__divider" role="separator"></li>`;
    }
    /* Selection bar — bulk-action row: selected count (left) + Select all /
       Deselect all text links (right). For multi-select / select-tick menus. */
    if (item.type === 'selection-bar') {
      const n = this._items.filter((it) => it && it.selected).length;
      /* Count text is localizable: `selectedText` template uses `{n}` (e.g.
         "{n} selected" / "{n} محدد"); an explicit `label` overrides it. */
      const countText = item.label || (item.selectedText || '{n} selected').replace('{n}', String(n));
      /* Show "Select all" by default; once everything is selected, swap to
         "Deselect all". Only one is visible at a time. */
      const selectable = this._selectable();
      const allSelected = selectable.length > 0 && selectable.every((it) => it.selected);
      return `<li class="ds-dropdown-menu__selection-bar" role="presentation">
          <span class="ds-dropdown-menu__selection-count" aria-live="polite">${esc(countText)}</span>
          <span class="ds-dropdown-menu__selection-actions">
            <ds-text-link variant="primary" size="small" ${rtlAttr} data-select-all ${allSelected ? 'hidden' : ''}>${esc(item.selectAllText || 'Select all')}</ds-text-link>
            <ds-text-link variant="primary" size="small" ${rtlAttr} data-deselect-all ${allSelected ? '' : 'hidden'}>${esc(item.deselectAllText || 'Deselect all')}</ds-text-link>
          </span>
        </li>`;
    }

    const isSelectType = type === 'select';
    const isMulti      = type === 'multi-select';
    const isTick       = type === 'select-tick';
    const isAction     = type === 'action';

    const role =
      isSelectType || isTick ? 'option'
      : isMulti              ? 'checkbox'
                             : 'menuitem';

    const ariaSelected = (isSelectType || isTick) ? `aria-selected="${item.selected ? 'true' : 'false'}"` : '';
    const ariaChecked  = isMulti ? `aria-checked="${item.selected ? 'true' : 'false'}"` : '';
    const ariaDisabled = item.disabled ? 'aria-disabled="true"' : '';
    const tabindex = item.disabled ? -1 : 0;

    const cls = 'ds-dropdown-menu__item'
      + (item.danger ? ' ds-dropdown-menu__item--danger' : '')
      + (item.linkStyle ? ' ds-dropdown-menu__item--link' : '')
      + (item.selected ? ' ds-dropdown-menu__item--selected' : '');

    const hasSubItems  = Array.isArray(item.subItems) && item.subItems.length > 0;
    /* `inert` makes the control presentational — out of tab order, no pointer
       events, hidden from AT — so the <li> alone owns interaction + semantics. */
    const radioHTML = isSelectType
      ? `<ds-radio class="ds-dropdown-menu__radio" size="small" inert aria-hidden="true"${rtl ? ' rtl' : ''}${item.selected ? ' checked' : ''}${item.disabled ? ' disabled' : ''}></ds-radio>`
      : '';
    const checkboxHTML = isMulti
      ? `<ds-checkbox class="ds-dropdown-menu__checkbox" size="small" inert aria-hidden="true"${rtl ? ' rtl' : ''}${item.selected ? ' checked' : ''}${item.disabled ? ' disabled' : ''}></ds-checkbox>`
      : '';
    const iconHTML = item.icon
      ? `<span class="ds-dropdown-menu__item-icon"><ds-icon name="${esc(item.icon)}" size="16"></ds-icon></span>`
      : '';
    const tickHTML = (isTick && item.selected)
      ? `<span class="ds-dropdown-menu__tick" aria-hidden="true"><ds-icon name="check" size="14"></ds-icon></span>`
      : (isTick ? '<span class="ds-dropdown-menu__tick" aria-hidden="true"></span>' : '');
    /* `subItems` implies chevron, regardless of caller's explicit flag. */
    const chevronHTML = (isAction && item.sub) || item.chevron || hasSubItems
      ? `<span class="ds-dropdown-menu__item-chevron" aria-hidden="true"><ds-icon name="chevron-right" size="14"></ds-icon></span>`
      : '';
    const badgeHTML = item.badge
      ? `<span class="ds-dropdown-menu__item-badge">${esc(item.badge)}</span>`
      : '';
    const newTagHTML = item.newTag
      ? `<span class="ds-dropdown-menu__item-new">New</span>`
      : '';
    const shortcutHTML = item.shortcut
      ? `<span class="ds-dropdown-menu__item-shortcut">${esc(item.shortcut)}</span>`
      : '';
    const descriptionHTML = item.description
      ? `<span class="ds-dropdown-menu__item-description">${esc(item.description)}</span>`
      : '';
    /* Per-row hover actions (e.g. share / edit / delete on a saved item). Hidden
       until the row is hovered/focused; each button emits `ds-dropdown-action`
       with { actionId, value, item } and does NOT trigger the row's own select. */
    const actionsHTML = Array.isArray(item.actions) && item.actions.length
      ? `<span class="ds-dropdown-menu__item-actions" role="presentation">${item.actions.map((a) =>
          `<button type="button" class="ds-dropdown-menu__item-action${a.danger ? ' ds-dropdown-menu__item-action--danger' : ''}"
                   data-action-id="${esc(a.id)}" aria-label="${esc(a.label || a.id)}" title="${esc(a.label || a.id)}" tabindex="-1">
             <ds-icon name="${esc(a.icon)}" size="14"></ds-icon>
           </button>`).join('')}</span>`
      : '';

    return `<li class="${cls}"
                role="${role}" ${ariaSelected} ${ariaChecked} ${ariaDisabled}
                ${hasSubItems ? 'data-has-sub' : ''}
                tabindex="${tabindex}" data-index="${idx}">
              ${radioHTML}${checkboxHTML}${iconHTML}
              <span class="ds-dropdown-menu__item-content">
                <span class="ds-dropdown-menu__item-label">${esc(item.label)}</span>
                ${descriptionHTML}
              </span>
              ${actionsHTML}${newTagHTML}${badgeHTML}${shortcutHTML}${tickHTML}${chevronHTML}
            </li>`;
  }

  _wire(type) {
    const isMulti = type === 'multi-select';

    this._panel.querySelector('[data-cancel]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-dropdown-cancel', { bubbles: true }));
      this.close();
    });
    /* Select-all / Clear-all / Deselect-all may appear in the footer AND the
       Selection Bar — wire every instance. Deselect-all is clear-all's twin. */
    const deselectAll = () => {
      this._items.forEach((it) => { if (it && it.type !== 'heading' && it.type !== 'divider' && it.type !== 'selection-bar') it.selected = false; });
      this._render();
      /* `ds-dropdown-clear-all` is the spec name; `ds-dropdown-clear` kept as an alias. */
      this.dispatchEvent(new CustomEvent('ds-dropdown-clear-all', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('ds-dropdown-clear', { bubbles: true }));
    };
    this._panel.querySelectorAll('[data-clear-all], [data-deselect-all]').forEach((b) => b.addEventListener('click', deselectAll));
    this._panel.querySelectorAll('[data-select-all]').forEach((b) => b.addEventListener('click', () => {
      this._items.forEach((it) => { if (it && it.type !== 'heading' && it.type !== 'divider' && it.type !== 'selection-bar' && !it.disabled) it.selected = true; });
      this._render();
      this.dispatchEvent(new CustomEvent('ds-dropdown-select-all', { bubbles: true }));
    }));
    /* Reset to default — restore each item to its initial selection snapshot. */
    this._panel.querySelector('[data-reset]')?.addEventListener('click', () => {
      const init = this._initialSelected || new Set();
      this._items.forEach((it) => {
        if (it && !['heading', 'divider', 'selection-bar'].includes(it.type)) {
          it.selected = init.has(it.value ?? it.label);
        }
      });
      this._render();
      this.dispatchEvent(new CustomEvent('ds-dropdown-reset', { bubbles: true }));
    });
    this._panel.querySelector('[data-apply]')?.addEventListener('click', () => {
      const values = this._items.filter((it) => it && it.selected).map((it) => it.value ?? it.label);
      this.dispatchEvent(new CustomEvent('ds-dropdown-apply', { bubbles: true, detail: { values } }));
      this.close();
    });
    this._panel.querySelector('[data-footer]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-dropdown-footer', { bubbles: true }));
    });

    this._panel.querySelectorAll('.ds-dropdown-menu__item').forEach((li) => {
      const idx = Number(li.dataset.index);
      const item = this._items[idx];
      if (!item || item.disabled) return;
      const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;

      const activate = () => {
        if (isMulti) {
          item.selected = !item.selected;
          li.setAttribute('aria-checked', String(!!item.selected));
          li.classList.toggle('ds-dropdown-menu__item--selected', !!item.selected);
          li.querySelector('ds-checkbox')?.toggleAttribute('checked', !!item.selected);
          this._refreshMultiFooterLinks();
          this._refreshSelectionCount();
          this._refreshSelectionBarActions();
          const detail = {
            value: item.value ?? item.label,
            selected: !!item.selected,
            values: this._items.filter((it) => it && it.selected).map((it) => it.value ?? it.label),
            item,
          };
          /* `ds-dropdown-change` is the spec name; `ds-dropdown-toggle` kept as an alias. */
          this.dispatchEvent(new CustomEvent('ds-dropdown-change', { bubbles: true, detail }));
          this.dispatchEvent(new CustomEvent('ds-dropdown-toggle', { bubbles: true, detail }));
        } else if (type === 'select-tick') {
          /* Multi-selectable with ticks — toggle in place, keep open. */
          item.selected = !item.selected;
          li.setAttribute('aria-selected', String(!!item.selected));
          li.classList.toggle('ds-dropdown-menu__item--selected', !!item.selected);
          const tick = li.querySelector('.ds-dropdown-menu__tick');
          if (tick) tick.innerHTML = item.selected ? '<ds-icon name="check" size="14"></ds-icon>' : '';
          this._refreshSelectionCount();
          this._refreshSelectionBarActions();
          this.dispatchEvent(new CustomEvent('ds-dropdown-change', {
            bubbles: true,
            detail: {
              value: item.value ?? item.label,
              selected: !!item.selected,
              values: this._items.filter((it) => it && it.selected).map((it) => it.value ?? it.label),
              item,
            },
          }));
        } else if (type === 'select') {
          /* Single-select (radio) — replace selection, close. */
          this._items.forEach((it) => { if (it && it.type !== 'heading' && it.type !== 'divider') it.selected = false; });
          item.selected = true;
          this._render();
          this.dispatchEvent(new CustomEvent('ds-dropdown-select', {
            bubbles: true,
            detail: { value: item.value ?? item.label, item },
          }));
        } else if (hasSubItems) {
          /* Items with a cascade sub-menu open the flyout instead of
             dispatching a select — the leaf select happens on a sub-item. */
          this._openSubmenu(li, item);
        } else {
          this.dispatchEvent(new CustomEvent('ds-dropdown-select', {
            bubbles: true,
            detail: { value: item.value ?? item.label, item },
          }));
          this.close();
        }
      };
      li.addEventListener('click', activate);
      /* Per-row hover actions are keyboard-operable via ROVING focus (arrow keys),
         not the Tab order — Tab still exits the menu (ARIA menu pattern). The
         buttons stay tabindex=-1 but are reachable: ArrowRight enters them,
         ArrowLeft steps back (mirrored in RTL), Enter/Space activate, and
         Up/Down/Home/End/Esc hand control back to row navigation. Activating emits
         ds-dropdown-action and must NOT fall through to the row's own select. */
      const actionBtns = [...li.querySelectorAll('.ds-dropdown-menu__item-action')];
      const fireAction = (btn) => {
        this.dispatchEvent(new CustomEvent('ds-dropdown-action', {
          bubbles: true,
          detail: { actionId: btn.dataset.actionId, value: item.value ?? item.label, item },
        }));
        this.close();
      };
      actionBtns.forEach((btn, bi) => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); fireAction(btn); });
        btn.addEventListener('keydown', (e) => {
          const rtl = this.hasAttribute('rtl');
          const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
          const back = rtl ? 'ArrowRight' : 'ArrowLeft';
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fireAction(btn); return; }
          if (e.key === fwd)  { e.preventDefault(); e.stopPropagation(); (actionBtns[bi + 1] || li).focus(); return; }
          if (e.key === back) { e.preventDefault(); e.stopPropagation(); (bi > 0 ? actionBtns[bi - 1] : li).focus(); return; }
          if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); li.focus(); return; }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
            /* Hand back to row-level nav — refocus the row, then replay the key. */
            e.preventDefault(); e.stopPropagation();
            li.focus();
            li.dispatchEvent(new KeyboardEvent('keydown', { key: e.key }));
          }
        });
      });
      li.addEventListener('keydown', (e) => {
        const rtl = this.hasAttribute('rtl');
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); return; }
        /* Into the row's hover-actions. */
        if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') && actionBtns.length) {
          e.preventDefault(); actionBtns[0].focus(); return;
        }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          const items = [...this._panel.querySelectorAll('.ds-dropdown-menu__item:not([aria-disabled="true"])')];
          if (!items.length) return;
          const i = items.indexOf(li);
          let next;
          if (e.key === 'Home')      next = items[0];
          else if (e.key === 'End')  next = items[items.length - 1];
          else if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
          else                            next = items[(i - 1 + items.length) % items.length];
          next?.focus();
        }
      });
    });

    /* Heading trailing action (e.g. "Clear all") — a text link; emits
       ds-dropdown-action with a null value + item and closes the menu. */
    this._panel.querySelectorAll('[data-heading-action]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        this.dispatchEvent(new CustomEvent('ds-dropdown-action', {
          bubbles: true, detail: { actionId: link.dataset.headingAction, value: null, item: null },
        }));
        this.close();
      });
    });

    this._wireSubmenus();
  }

  /* ── Cascade sub-menu support ───────────────────────────────────────
     Items with `subItems: [...]` (optionally `subTitle: '...'`) open a
     secondary <ds-dropdown-menu> flyout on hover/click. The flyout is
     appended to <body> with fixed positioning so it never gets clipped by
     the list's overflow:auto, and so it stacks above sibling content. */
  _wireSubmenus() {
    /* Reset any sub-menus carried over from a previous render. */
    this._destroySubmenus();
    this._submenus       = new Map(); // parent <li> → child ds-dropdown-menu
    this._activeSubmenuLi = null;
    this._submenuCloseTimer = null;

    const lisWithSub = this._panel.querySelectorAll('.ds-dropdown-menu__item[data-has-sub]');
    if (!lisWithSub.length) return;

    const cancelClose = () => {
      if (this._submenuCloseTimer) {
        clearTimeout(this._submenuCloseTimer);
        this._submenuCloseTimer = null;
      }
    };
    const scheduleClose = () => {
      cancelClose();
      this._submenuCloseTimer = setTimeout(() => this._closeActiveSubmenu(), 180);
    };
    this._cancelSubmenuClose   = cancelClose;
    this._scheduleSubmenuClose = scheduleClose;

    lisWithSub.forEach((li) => {
      const idx = Number(li.dataset.index);
      const item = this._items[idx];
      if (!item?.subItems?.length) return;
      li.addEventListener('mouseenter', () => {
        cancelClose();
        this._openSubmenu(li, item);
      });
    });

    /* Hovering a non-sub sibling schedules close — handles "moved cursor
       to another row that has no flyout." */
    this._panel.querySelectorAll('.ds-dropdown-menu__item:not([data-has-sub])').forEach((li) => {
      li.addEventListener('mouseenter', scheduleClose);
    });

    /* Leaving the main panel entirely schedules close; cursor transit to the
       flyout cancels it via the flyout's own mouseenter. */
    this._panel.addEventListener('mouseleave', scheduleClose);
  }

  _openSubmenu(parentLi, parentItem) {
    /* Close any sibling sub-menu before opening a new one. */
    this._closeActiveSubmenu(parentLi);

    let sub = this._submenus.get(parentLi);
    if (!sub) {
      sub = document.createElement('ds-dropdown-menu');
      sub.classList.add('ds-dropdown-menu--cascade-sub');
      sub.setAttribute('type', 'default');
      if (parentItem.subTitle) {
        sub.setAttribute('show-title', '');
        sub.setAttribute('title', parentItem.subTitle);
      }
      document.body.appendChild(sub);
      sub.items = parentItem.subItems;

      /* A leaf-select on the sub-menu re-fires on the parent menu with
         a `parent` reference, so consumers can disambiguate. The parent
         menu then closes itself (which cascades to its sub-menus). */
      sub.addEventListener('ds-dropdown-select', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('ds-dropdown-select', {
          bubbles: true,
          detail: { ...e.detail, parent: parentItem },
        }));
        this.close();
      });

      sub.addEventListener('mouseenter', () => this._cancelSubmenuClose?.());
      sub.addEventListener('mouseleave', () => this._scheduleSubmenuClose?.());

      this._submenus.set(parentLi, sub);
    } else {
      /* Re-opening: refresh items + title in case they were changed. */
      if (parentItem.subTitle) {
        sub.setAttribute('show-title', '');
        sub.setAttribute('title', parentItem.subTitle);
      } else {
        sub.removeAttribute('show-title');
      }
      sub.items = parentItem.subItems;
    }

    sub.setAttribute('open', '');
    parentLi.setAttribute('data-sub-open', '');
    this._activeSubmenuLi = parentLi;

    this._positionSubmenu(sub, parentLi);
  }

  _positionSubmenu(sub, parentLi) {
    const liRect    = parentLi.getBoundingClientRect();
    const panelRect = this._panel.getBoundingClientRect();
    /* Force the sub onto the layout before measuring; it was just made
       visible via the `open` attribute. */
    const subRect = sub.getBoundingClientRect();
    const subWidth  = subRect.width  || 240;
    const subHeight = subRect.height || 200;

    /* Open to whichever side has more room. */
    const spaceRight = window.innerWidth - panelRect.right;
    const openRight  = spaceRight >= (subWidth + 16);

    /* Vertically align to the parent row, with a small upward offset so the
       sub's first item visually meets the parent row's icon. Clamp to the
       viewport so the flyout never spills off-screen. */
    let top = liRect.top - 8;
    top = Math.max(16, Math.min(top, window.innerHeight - subHeight - 16));

    sub.style.position = 'fixed';
    sub.style.zIndex   = '601';
    sub.style.top      = top + 'px';
    if (openRight) {
      sub.style.left  = (panelRect.right + 8) + 'px';
      sub.style.right = '';
    } else {
      sub.style.right = (window.innerWidth - panelRect.left + 8) + 'px';
      sub.style.left  = '';
    }
  }

  _closeActiveSubmenu(except = null) {
    if (this._submenuCloseTimer) {
      clearTimeout(this._submenuCloseTimer);
      this._submenuCloseTimer = null;
    }
    if (!this._submenus) return;
    this._submenus.forEach((sub, li) => {
      if (li === except) return;
      sub.removeAttribute('open');
      li.removeAttribute('data-sub-open');
    });
    if (this._activeSubmenuLi !== except) this._activeSubmenuLi = null;
  }

  _destroySubmenus() {
    if (!this._submenus) return;
    this._submenus.forEach((sub) => sub.remove());
    this._submenus = null;
    this._activeSubmenuLi = null;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-dropdown-menu')) {
  customElements.define('ds-dropdown-menu', DsDropdownMenu);
}
