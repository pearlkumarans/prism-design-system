/* =============================================================================
   <ds-input-select size="small|medium|large"
                    state="default|hover|focus|filled|error|success|disabled|read-only|active|active-multi"
                    label="Region" placeholder="Select"
                    label-position="top|left"
                    multi
                    helper="Supporting text"
                    show-label show-helper-row required show-clear show-prefix-icon
                    prefix-icon="search"
                    show-badge badge-text="+3"
                    rtl></ds-input-select>

   Boolean attribute conventions:
     - `required` defaults to true. Set `required="false"` to hide the asterisk.
     - `show-label` defaults to true. Set to "false" to hide the label row.
     - `show-helper-row` defaults to true. Set to "false" to hide the helper row.
     - `show-prefix-icon` defaults to false. Set to enable the prefix icon slot.
     - `show-clear` defaults to false. Set to enable the clear button.
     - `show-badge` defaults to false. Set to render the +N overflow badge.
     - `multi` defaults to false. Set to enable the multi-select / tag mode.

   Single-select:
     el.value = 'us';
     el.options = [{ label, value, disabled?, icon? }];

   Multi-select:
     el.values = ['active', 'suspended'];

   Events:
     - ds-input-select-change   detail: { value }   (single)
                                 detail: { values } (multi)
     - ds-input-select-open
     - ds-input-select-close
     - ds-input-select-clear
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Helper/counter row = the shared "Form Field Helper Row" sub-component. */
import '../field-helper/field-helper.js';
/* Searchable variant reuses the shared Search Field component (not a custom input). */
import '../search-field/search-field.js';
/* Label help icon tooltip reuses the shared Tooltip component. */
import '../tooltip/tooltip.js';
/* The options list + the prefix/suffix unit menu both use the Dropdown Menu. */
import '../dropdown-menu/dropdown-menu.js';

/* Auto-load sub-component stylesheets once (all light-DOM, so their CSS must be
   present even on pages that load input-select.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-input-select-fh-css', '../field-helper/field-helper.css');
_injectCss('ds-input-select-sf-css', '../search-field/search-field.css');
_injectCss('ds-input-select-tt-css', '../tooltip/tooltip.css');
_injectCss('ds-input-select-dd-css', '../dropdown-menu/dropdown-menu.css');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SIZES = ['small', 'medium', 'large'];
const STATES = [
  'default', 'hover', 'focus', 'filled', 'error', 'success',
  'disabled', 'read-only', 'active', 'active-multi',
];
const LEGACY_STATE_MAP = { readonly: 'read-only' };
const POSITIONS = ['none', 'top', 'left'];

let _uid = 0;

/* boolAttr helper that respects the "default-on, set to 'false' to hide"
   convention used elsewhere in the system (see ds-tag's show-close). */
const boolAttrDefault = (el, name, defaultValue) => {
  if (!el.hasAttribute(name)) return defaultValue;
  return el.getAttribute(name) !== 'false';
};

export class DsInputSelect extends HTMLElement {
  static get observedAttributes() {
    return [
      'size', 'state', 'label-position', 'label', 'placeholder', 'value',
      'required', 'helper', 'show-helper-row', 'show-label',
      'prefix-icon', 'show-prefix-icon', 'prefix-text', 'prefix-dropdown',
      'suffix-text', 'suffix-icon', 'suffix-dropdown', 'show-clear',
      'rtl', 'multi', 'badge-text', 'show-badge',
      'show-counter', 'counter', 'show-helper-icon', 'show-label-help-icon', 'label-help',
      'searchable', 'search-placeholder',
    ];
  }

  constructor() {
    super();
    this._id = `ds-isel-${++_uid}`;
    this._options = [];
    this._values = [];
    this._isOpen = false;
    this._prefixOptions = [];   // [{label, value, icon?}] — unit menu for the prefix chip
    this._suffixOptions = [];   // [{label, value, icon?}] — unit menu for the suffix chip
  }

  /* Options for the prefix / suffix unit-selection chip (mirrors ds-text-input).
     When set, clicking the chip opens a Dropdown Menu; picking one updates the
     affix text and fires ds-input-select-{prefix|suffix}-change. When empty, the
     chip is a plain (event-only) trigger firing ds-input-select-{side}-click. */
  get prefixOptions() { return this._prefixOptions.slice(); }
  set prefixOptions(v) { this._prefixOptions = Array.isArray(v) ? v.slice() : []; }
  get suffixOptions() { return this._suffixOptions.slice(); }
  set suffixOptions(v) { this._suffixOptions = Array.isArray(v) ? v.slice() : []; }

  connectedCallback() {
    /* Upgrade properties set BEFORE the element was defined/upgraded. When a
       consumer does `el.options = [...]` while the component's module is still
       loading (common in standalone/direct-open pages), the assignment lands as an
       instance own-property that SHADOWS the accessor, so the setter never runs and
       `_options` stays empty — the value display then falls back to the raw value
       instead of the option's label. Re-assign through the real setters here. */
    ['options', 'values', 'value', 'prefixOptions', 'suffixOptions'].forEach((prop) => {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const v = this[prop]; delete this[prop]; this[prop] = v;
      }
    });
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    this._render();
    /* Outside-click close. Use composedPath() rather than this.contains(e.target)
       because the trigger's click handler re-renders our subtree synchronously,
       which detaches e.target before our document listener fires. composedPath
       was captured at dispatch time, so `this` is still in it. */
    this._docClick = (e) => {
      if (!this._isOpen) return;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      /* The dropdown is portaled to <body>, so treat clicks inside it as inside. */
      if (path.includes(this) || (this._dropdownEl && path.includes(this._dropdownEl))) return;
      this._close();
    };
    document.addEventListener('click', this._docClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._docClick);
    this._removePortaledDropdown();
    this._closeAffixMenu();
  }

  attributeChangedCallback() {
    if (this._root) this._render();
  }

  // ---- Public API ---------------------------------------------------------
  get options() { return this._options; }
  set options(v) {
    this._options = Array.isArray(v) ? v.slice() : [];
    if (this._root) this._render();
  }

  get value() { return this.getAttribute('value') ?? ''; }
  set value(v) {
    if (v == null || v === '') this.removeAttribute('value');
    else this.setAttribute('value', String(v));
  }

  get values() { return this._values.slice(); }
  set values(v) {
    this._values = Array.isArray(v) ? v.slice() : [];
    if (this._root) this._render();
  }

  // ---- Render -------------------------------------------------------------
  _resolveState() {
    const raw = this.getAttribute('state');
    if (raw && LEGACY_STATE_MAP[raw]) return LEGACY_STATE_MAP[raw];
    return enumAttr(this, 'state', STATES, 'default');
  }

  _render() {
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const stateAttr = this._resolveState();
    const position = enumAttr(this, 'label-position', POSITIONS, 'left');
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || 'Select';
    /* label-position="none" hides the label; kept as an accessible name via
       aria-label on the trigger below. */
    const showLabel = boolAttrDefault(this, 'show-label', !!label) && position !== 'none';
    const required  = boolAttrDefault(this, 'required', true);
    const showHelperRow = boolAttrDefault(this, 'show-helper-row', true);
    const showPrefixIcon = boolAttrDefault(this, 'show-prefix-icon', !!this.getAttribute('prefix-icon'));
    const showClear = boolAttr(this, 'show-clear');
    const helper = this.getAttribute('helper') || '';
    const prefixIcon = this.getAttribute('prefix-icon') || 'search';
    const rtl = boolAttr(this, 'rtl');
    const multi = boolAttr(this, 'multi');

    /* Active states are derived: any internal `_isOpen` flips into the right
       active variant; explicit `state="active"` from outside also opens. */
    const stateImpliesOpen = stateAttr === 'active' || stateAttr === 'active-multi';
    const isOpen = this._isOpen || stateImpliesOpen;
    const effectiveState =
      isOpen ? (multi ? 'active-multi' : 'active')
      : stateAttr === 'default' && this._hasSelection() ? 'filled'
      : stateAttr;

    const cls = [
      'ds-input-select',
      `ds-input-select--${size}`,
      `ds-input-select--${position}`,
      multi ? 'ds-input-select--multi' : '',
    ].filter(Boolean).join(' ');

    this._root.className = cls;
    this._root.dataset.state = effectiveState;
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    /* Label help icon — toggleable, off by default (Figma `Show Label Help Icon`).
       Renders a help-circle (16) button after the label/required. When `label-help`
       text is supplied, the icon is wrapped in <ds-tooltip> so hovering (or
       focusing) it shows the hint; the button still emits ds-input-select-help. */
    const showLabelHelp = boolAttr(this, 'show-label-help-icon');
    const labelHelpText = this.getAttribute('label-help') || '';
    const labelHelpBtn = `<button type="button" class="ds-input-select__label-help" aria-label="${labelHelpText ? esc(labelHelpText) : 'Help'}" data-label-help><ds-icon name="help-circle" size="16"></ds-icon></button>`;
    const labelHelpHTML = showLabelHelp
      ? (labelHelpText
          ? `<ds-tooltip class="ds-input-select__label-help-tip" text="${esc(labelHelpText)}" position="up-center" theme="dark"${rtl ? ' rtl' : ''}>${labelHelpBtn}</ds-tooltip>`
          : labelHelpBtn)
      : '';
    const labelHTML = (showLabel && label)
      ? `<div class="ds-input-select__label-row">
           <label class="ds-input-select__label" id="${this._id}-label">
             ${label}${required ? '<span class="ds-input-select__required" aria-hidden="true">*</span>' : ''}
           </label>${labelHelpHTML}
         </div>`
      : '';

    const helperId = `${this._id}-helper`;
    const showHelperIcon = boolAttr(this, 'show-helper-icon');
    const showCounter = boolAttr(this, 'show-counter');
    const counter = this.getAttribute('counter') || '';
    /* Error / Success always show their status icon; Default shows the
       neutral info-circle only when show-helper-icon is set (Figma: Show
       Icon defaults OFF on Default/Disabled, always on for Error/Success). */
    /* Show Icon defaults OFF on Default/Disabled and is always ON for
       Error/Success (Figma). The shared <ds-field-helper> renders its own
       per-state glyph, so we just decide whether to show it at all. */
    const showHelperIconFlag =
      effectiveState === 'error' || effectiveState === 'success' || showHelperIcon;
    const helperState = effectiveState === 'error' ? 'error'
      : effectiveState === 'success' ? 'success'
      : effectiveState === 'disabled' ? 'disabled' : 'default';
    const helperHTML = showHelperRow
      ? `<ds-field-helper class="ds-input-select__helper" id="${helperId}"
           text="${esc(helper)}" state="${helperState}"
           ${showHelperIconFlag ? '' : 'show-icon="false"'}
           ${showCounter && counter ? `counter="${esc(counter)}"` : ''}
           ${rtl ? 'rtl' : ''}></ds-field-helper>`
      : '';

    const prefixHTML = this._buildPrefix();
    const suffixHTML = this._buildSuffix();

    const triggerInner = multi
      ? this._renderTags(placeholder)
      : this._renderValue(placeholder);

    const isDisabled = effectiveState === 'disabled';
    const isReadOnly = effectiveState === 'read-only';
    const hasValue = this._hasSelection();
    const clearHTML = (showClear && hasValue && !isDisabled && !isReadOnly)
      ? `<button type="button" class="ds-input-select__clear" aria-label="Clear selection" data-clear>
           <ds-icon name="close" size="14"></ds-icon>
         </button>`
      : '';

    /* Chevron stays `chevron-down`; the open state rotates it 180° via CSS (no
       icon swap). */
    const chevronHTML = `<span class="ds-input-select__chevron" aria-hidden="true">
        <ds-icon name="chevron-down" size="16"></ds-icon>
      </span>`;

    /* Use a <div role="combobox"> rather than a real <button> because the
       trigger contains its own focusable controls (clear button, removable
       tag chips). HTML forbids nested interactive elements; nesting them
       inside a <button> causes the browser to auto-close the outer button
       and visually break the layout. */
    const triggerHTML = `
      <div
        id="${this._id}"
        class="ds-input-select__trigger"
        role="combobox"
        aria-haspopup="${multi ? 'listbox' : 'menu'}"
        aria-expanded="${isOpen}"
        aria-controls="${this._id}-listbox"
        ${(showLabel && label && position !== 'none')
          ? `aria-labelledby="${this._id}-label"`
          : (label ? `aria-label="${esc(label)}"` : '')}
        ${required ? 'aria-required="true"' : ''}
        ${effectiveState === 'error' ? 'aria-invalid="true"' : ''}
        ${isDisabled ? 'aria-disabled="true"' : ''}
        ${isDisabled ? 'tabindex="-1"' : 'tabindex="0"'}
        ${showHelperRow ? `aria-describedby="${helperId}"` : ''}
        data-trigger
      >
        ${prefixHTML}
        ${triggerInner}
        ${clearHTML}
        ${chevronHTML}
        ${suffixHTML}
      </div>`;

    const dropdownHTML = isOpen ? this._renderDropdown(multi) : '';

    /* Trigger + dropdown share a positioning context so the floating menu
       anchors to the trigger (not field-col) and never pushes the helper
       row out of place. Helper sits OUTSIDE this wrapper, below the trigger. */
    const fieldColHTML =
      `<div class="ds-input-select__field-col">
         <div class="ds-input-select__trigger-wrap">${triggerHTML}${dropdownHTML}</div>
         ${helperHTML}
       </div>`;

    this._root.innerHTML = labelHTML + fieldColHTML;

    this._wire(multi);

    /* Portal the open dropdown to <body> + position:fixed so it can NEVER be
       clipped by an ancestor's overflow/transform (card, scroll container,
       table cell). Re-anchored to the trigger on scroll/resize. */
    this._removePortaledDropdown();
    if (isOpen) this._portalDropdown();
  }

  _portalDropdown() {
    const dd = this._root.querySelector('.ds-input-select__dropdown');
    if (!dd) return;
    this._dropdownEl = dd;
    document.body.appendChild(dd);
    this._positionDropdown();
    this._bindReanchor();
    /* Searchable: focus the search box on open. Runs on a macrotask so it lands
       after the menu's own first-item focus (scheduled via requestAnimationFrame
       when its `open` attribute is set), keeping the caret in the search field. */
    const search = dd.querySelector('[data-search]');
    if (search) setTimeout(() => search.focus({ preventScroll: true }), 0);
  }

  _removePortaledDropdown() {
    this._unbindReanchor();
    if (this._dropdownEl && this._dropdownEl.parentNode === document.body) {
      this._dropdownEl.parentNode.removeChild(this._dropdownEl);
    }
    this._dropdownEl = null;
  }

  _positionDropdown() {
    const dd = this._dropdownEl;
    const trigger = this._root.querySelector('[data-trigger]');
    if (!dd || !trigger) return;
    const r = trigger.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const M = 8;    // viewport margin
    const GAP = 8;  // gap between trigger and menu

    dd.style.position = 'fixed';
    dd.style.margin = '0';
    dd.style.zIndex = '9999';
    dd.style.width = `${Math.round(r.width)}px`;

    /* Space-aware height: open below by default, flip up only when below is too
       tight and above has more room. Cap the scrollable list to the space on the
       chosen side so a long list always fits the viewport and scrolls
       (overflow-y:auto) instead of spilling off-screen or clipping rows. */
    const list = dd.querySelector('.ds-dropdown-menu__list');
    if (list) list.style.maxHeight = '';            // measure natural height first
    const natural = dd.offsetHeight;
    const spaceBelow = vh - r.bottom - GAP - M;
    const spaceAbove = r.top - GAP - M;
    const openUp = (r.bottom + GAP + natural > vh - M) && spaceAbove > spaceBelow;
    /* Bound by the viewport too, so an off-screen / partially-scrolled trigger
       can never let the menu exceed the screen height. */
    const avail = Math.min(vh - 2 * M, Math.max(80, openUp ? spaceAbove : spaceBelow));
    if (list) {
      const chrome = dd.offsetHeight - list.offsetHeight;   // title/footer/padding outside the list
      list.style.maxHeight = `${Math.min(320, Math.max(80, avail - chrome))}px`;
    }

    const dw = dd.offsetWidth;
    const dh = dd.offsetHeight;
    let left = Math.max(M, Math.min(r.left, vw - dw - M));
    let top = openUp ? (r.top - GAP - dh) : (r.bottom + GAP);
    top = Math.max(M, Math.min(top, vh - dh - M));
    dd.style.top = `${Math.round(top)}px`;
    dd.style.left = `${Math.round(left)}px`;
    dd.style.right = 'auto';
    dd.style.bottom = 'auto';
  }

  _bindReanchor() {
    if (this._reanchor) return;
    this._reanchor = () => { if (this._isOpen) this._positionDropdown(); };
    window.addEventListener('scroll', this._reanchor, true);
    window.addEventListener('resize', this._reanchor);
  }

  _unbindReanchor() {
    if (!this._reanchor) return;
    window.removeEventListener('scroll', this._reanchor, true);
    window.removeEventListener('resize', this._reanchor);
    this._reanchor = null;
  }

  /* Prefix / Suffix groups (Figma: each a 4px-gap frame, default off — shown
     only when a text/icon is supplied). Prefix order is text-first then icon;
     suffix is text then icon. RTL mirrors automatically via dir="rtl" on the
     root (flex reverses). Suffix sits at the trailing edge after the chevron. */
  _buildPrefix() {
    const prefixText = this.getAttribute('prefix-text') || '';
    const prefixIcon = this.getAttribute('prefix-icon') || 'search';
    const showPrefixIcon = boolAttrDefault(this, 'show-prefix-icon', !!this.getAttribute('prefix-icon'));
    if (!prefixText && !showPrefixIcon) return '';
    const inner = `${
      prefixText ? `<span class="ds-input-select__affix-text">${esc(prefixText)}</span>` : ''
    }${showPrefixIcon ? `<ds-icon name="${prefixIcon}" size="16"></ds-icon>` : ''}`;
    /* When `prefix-dropdown` is set, the prefix is a unit-selection trigger
       (mirrors ds-text-input) — a real button that fires an event; the consumer
       opens the unit menu. It stops propagation so the main select stays closed. */
    if (boolAttr(this, 'prefix-dropdown')) {
      return `<button type="button" class="ds-input-select__prefix ds-input-select__prefix--dropdown" data-prefix-dropdown aria-haspopup="listbox">${inner}</button>`;
    }
    return `<span class="ds-input-select__prefix" aria-hidden="true">${inner}</span>`;
  }

  _buildSuffix() {
    const suffixText = this.getAttribute('suffix-text') || '';
    const suffixIcon = this.getAttribute('suffix-icon') || '';
    if (!suffixText && !suffixIcon) return '';
    const inner = `${
      suffixText ? `<span class="ds-input-select__affix-text">${esc(suffixText)}</span>` : ''
    }${suffixIcon ? `<ds-icon name="${suffixIcon}" size="16"></ds-icon>` : ''}`;
    /* When `suffix-dropdown` is set, the suffix is a unit-selection trigger
       (mirrors ds-text-input): a real button firing ds-input-select-suffix-click. */
    if (boolAttr(this, 'suffix-dropdown')) {
      return `<button type="button" class="ds-input-select__suffix ds-input-select__suffix--dropdown" data-suffix-dropdown aria-haspopup="listbox" aria-expanded="false">${inner}</button>`;
    }
    return `<span class="ds-input-select__suffix" aria-hidden="true">${inner}</span>`;
  }

  // ---- Prefix / suffix unit menu (mirrors ds-text-input) -------------------
  _toggleAffixMenu(side) {
    if (this._affixMenuWrap && this._affixMenuSide === side) { this._closeAffixMenu(); return; }
    this._openAffixMenu(side);
  }

  _openAffixMenu(side) {
    const options = side === 'prefix' ? this._prefixOptions : this._suffixOptions;
    if (!options || !options.length) return;   // no options → chip is event-only
    this._closeAffixMenu();
    const chip = this._root.querySelector(`[data-${side}-dropdown]`);
    if (!chip) return;
    chip.setAttribute('aria-expanded', 'true');

    const wrap = document.createElement('div');
    wrap.className = 'ds-input-select__affix-menu';
    wrap.style.cssText = 'position:fixed;z-index:9999;margin:0;';
    const menu = document.createElement('ds-dropdown-menu');
    menu.setAttribute('type', 'default');
    menu.setAttribute('open', '');
    if (boolAttr(this, 'rtl')) menu.setAttribute('rtl', '');
    wrap.appendChild(menu);
    document.body.appendChild(wrap);
    this._affixMenuWrap = wrap;
    this._affixMenuSide = side;

    const cur = this.getAttribute(`${side}-text`);
    menu.items = options.map((o) => ({
      label: o.label, value: String(o.value ?? o.label), icon: o.icon,
      selected: String(o.value ?? o.label) === String(cur),
    }));
    menu.addEventListener('ds-dropdown-select', (e) => {
      const opt = options.find((o) => String(o.value ?? o.label) === String(e.detail && e.detail.value));
      if (opt) {
        this.setAttribute(`${side}-text`, String(opt.value ?? opt.label));
        this.dispatchEvent(new CustomEvent(`ds-input-select-${side}-change`, {
          bubbles: true, detail: { value: String(opt.value ?? opt.label), label: opt.label },
        }));
      }
      this._closeAffixMenu();
    });

    this._positionAffixMenu();
    this._affixReanchor = () => this._positionAffixMenu();
    window.addEventListener('scroll', this._affixReanchor, true);
    window.addEventListener('resize', this._affixReanchor);
    this._affixDocClick = (ev) => {
      const path = typeof ev.composedPath === 'function' ? ev.composedPath() : [];
      if (path.includes(wrap) || path.includes(chip)) return;
      this._closeAffixMenu();
    };
    /* Defer so the opening click doesn't immediately close it. */
    setTimeout(() => document.addEventListener('click', this._affixDocClick), 0);
  }

  _positionAffixMenu() {
    const wrap = this._affixMenuWrap;
    if (!wrap) return;
    const chip = this._root.querySelector(`[data-${this._affixMenuSide}-dropdown]`);
    if (!chip) return;
    const r = chip.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const dw = wrap.offsetWidth, dh = wrap.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight, M = 8, GAP = 4;
    let top = r.bottom + GAP;
    let left = this._affixMenuSide === 'suffix' ? (r.right - dw) : r.left;
    if (top + dh > vh - M && r.top - dh - GAP >= M) top = r.top - dh - GAP; // flip up
    left = Math.max(M, Math.min(left, vw - dw - M));
    top = Math.max(M, Math.min(top, vh - dh - M));
    wrap.style.left = `${Math.round(left)}px`;
    wrap.style.top = `${Math.round(top)}px`;
  }

  _closeAffixMenu() {
    if (this._affixDocClick) { document.removeEventListener('click', this._affixDocClick); this._affixDocClick = null; }
    if (this._affixReanchor) {
      window.removeEventListener('scroll', this._affixReanchor, true);
      window.removeEventListener('resize', this._affixReanchor);
      this._affixReanchor = null;
    }
    const chip = this._affixMenuSide && this._root
      ? this._root.querySelector(`[data-${this._affixMenuSide}-dropdown]`) : null;
    if (chip) chip.setAttribute('aria-expanded', 'false');
    if (this._affixMenuWrap && this._affixMenuWrap.parentNode) this._affixMenuWrap.parentNode.removeChild(this._affixMenuWrap);
    this._affixMenuWrap = null;
    this._affixMenuSide = null;
  }

  _renderValue(placeholder) {
    const value = this.getAttribute('value') ?? '';
    const opt = this._options.find((o) => String(o.value) === String(value));
    const text = opt ? opt.label : value;
    return text
      ? `<span class="ds-input-select__value">${text}</span>`
      : `<span class="ds-input-select__value ds-input-select__value--placeholder">${placeholder}</span>`;
  }

  _renderTags(placeholder) {
    if (!this._values.length) {
      return `<span class="ds-input-select__value ds-input-select__value--placeholder">${placeholder}</span>`;
    }
    const showBadge = boolAttr(this, 'show-badge');
    const badgeText = this.getAttribute('badge-text') || '+3';
    /* Tokens track the field size (small→small · medium→medium · large→large)
       so they aren't dwarfed inside a medium/large field. */
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const tags = this._values.map((val) => {
      const opt = this._options.find((o) => String(o.value) === String(val));
      const text = opt ? opt.label : val;
      return `<ds-tag size="${size}" data-tag-value="${val}">${text}</ds-tag>`;
    }).join('');
    const badge = showBadge
      ? `<span class="ds-input-select__badge">${badgeText}</span>`
      : '';
    return `<span class="ds-input-select__tags">${tags}${badge}</span>`;
  }

  _renderDropdown(multi) {
    /* Single-select uses the dropdown menu's `default` variant (plain rows with
       a selected-row highlight, no radio) per the Input Select spec. Multi keeps
       the multi-select variant with its Select-all / Clear-all footer. */
    const searchable = boolAttr(this, 'searchable') && !multi;
    const searchPh = esc(this.getAttribute('search-placeholder') || 'Search');
    /* The dropdown is portaled to <body> (outside the dir="rtl" root), so RTL
       must be propagated explicitly: dir on the wrapper + `rtl` on the menu and
       search field so their own mirroring kicks in. */
    const rtl = boolAttr(this, 'rtl');
    /* Reuse the shared Search Field component (clear button, icon, states) rather
       than a bespoke input. */
    const searchHTML = searchable
      ? `<div class="ds-input-select__search">
           <ds-search-field size="small" placeholder="${searchPh}" ${rtl ? 'rtl' : ''} data-search></ds-search-field>
         </div>`
      : '';
    return `<div class="ds-input-select__dropdown${searchable ? ' ds-input-select__dropdown--search' : ''}" id="${this._id}-listbox" ${rtl ? 'dir="rtl"' : ''}>
      ${searchHTML}
      <ds-dropdown-menu type="${multi ? 'multi-select' : 'default'}" open ${rtl ? 'rtl' : ''}
        ${searchable ? 'empty-text="No results"' : ''}
        ${multi ? 'show-footer show-cancel show-apply show-select-all show-clear-all' : ''}
        data-menu></ds-dropdown-menu>
    </div>`;
  }

  _hasSelection() {
    if (boolAttr(this, 'multi')) return this._values.length > 0;
    const v = this.getAttribute('value');
    return !!(v && v.length);
  }

  // ---- Wiring -------------------------------------------------------------
  _wire(multi) {
    const trigger = this._root.querySelector('[data-trigger]');
    const state = this._resolveState();

    trigger?.addEventListener('click', (e) => {
      if (state === 'disabled' || state === 'read-only') return;
      if (e.target.closest('[data-clear]')) return;
      if (e.target.closest('[data-tag-value]')) return;
      /* Unit-selection affix triggers manage their own menu — don't open the select. */
      if (e.target.closest('[data-prefix-dropdown]') || e.target.closest('[data-suffix-dropdown]')) return;
      this._toggle();
    });

    /* Unit-selection prefix/suffix (mirrors ds-text-input): fire an event for the
       consumer to open a unit menu; stop propagation so the select stays closed. */
    this._root.querySelector('[data-prefix-dropdown]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('ds-input-select-prefix-click', { bubbles: true }));
      this._toggleAffixMenu('prefix');   // opens the unit menu when prefixOptions is set
    });
    this._root.querySelector('[data-suffix-dropdown]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('ds-input-select-suffix-click', { bubbles: true }));
      this._toggleAffixMenu('suffix');   // opens the unit menu when suffixOptions is set
    });

    trigger?.addEventListener('keydown', (e) => {
      if (state === 'disabled' || state === 'read-only') return;
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this._open();
      } else if (e.key === 'Escape') {
        this._close();
      }
    });

    this._root.querySelector('[data-clear]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (multi) {
        this._values = [];
      } else {
        this.removeAttribute('value');
      }
      this._render();
      this.dispatchEvent(new CustomEvent('ds-input-select-clear', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('ds-input-select-change', {
        bubbles: true,
        detail: multi ? { values: [] } : { value: '' },
      }));
    });

    this._root.querySelector('[data-label-help]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-input-select-help', { bubbles: true }));
    });

    const menu = (this._dropdownEl || this._root).querySelector('[data-menu]');
    if (menu) {
      menu.items = this._options.map((o) => {
        /* Structural items (section headings / dividers) pass straight through so
           the menu renders them as non-selectable group titles rather than options. */
        if (o.type === 'heading' || o.type === 'divider') return { type: o.type, label: o.label };
        return {
          label: o.label,
          value: o.value,
          selected: multi
            ? this._values.includes(o.value)
            : String(this.getAttribute('value') ?? '') === String(o.value),
          disabled: !!o.disabled,
          icon: o.icon,
        };
      });

      menu.addEventListener('ds-dropdown-select', (e) => {
        const v = e.detail?.value;
        if (v == null) return;
        this.setAttribute('value', String(v));
        this._close();
        this.dispatchEvent(new CustomEvent('ds-input-select-change', {
          bubbles: true,
          detail: { value: String(v) },
        }));
      });
      /* Multi-select: live-update chips as the user toggles items, without
         closing the menu. Apply still commits + closes; Cancel just closes. */
      menu.addEventListener('ds-dropdown-toggle', (e) => {
        this._values = (e.detail?.values || []).map(String);
        this._renderTrigger();
        this.dispatchEvent(new CustomEvent('ds-input-select-change', {
          bubbles: true,
          detail: { values: this._values.slice() },
        }));
      });
      menu.addEventListener('ds-dropdown-apply', (e) => {
        this._values = (e.detail?.values || []).map(String);
        this._close();
        this.dispatchEvent(new CustomEvent('ds-input-select-change', {
          bubbles: true,
          detail: { values: this._values.slice() },
        }));
      });
      /* Footer Select-all / Clear-all both refresh chips without closing. The
         menu has already updated its own items list; we just mirror it. */
      menu.addEventListener('ds-dropdown-select-all', () => {
        this._values = (menu.items || [])
          .filter((it) => it && it.selected && it.type !== 'heading' && it.type !== 'divider')
          .map((it) => String(it.value ?? it.label));
        this._renderTrigger();
        this.dispatchEvent(new CustomEvent('ds-input-select-change', {
          bubbles: true,
          detail: { values: this._values.slice() },
        }));
      });
      menu.addEventListener('ds-dropdown-clear', () => {
        this._values = [];
        this._renderTrigger();
        this.dispatchEvent(new CustomEvent('ds-input-select-change', {
          bubbles: true,
          detail: { values: [] },
        }));
      });
      menu.addEventListener('ds-dropdown-cancel', () => this._close());
    }

    /* Searchable: a search box atop the open menu filters the rows live by
       label (case-insensitive). Re-maps `menu.items` to the matching subset;
       the menu shows its "No results" empty state when nothing matches. The
       input sits in the portal (sibling of the menu) so re-rendering the menu
       doesn't steal its focus. */
    const searchField = (this._dropdownEl || this._root).querySelector('[data-search]');
    if (searchField && menu && !multi) {
      const applyFilter = (q) => {
        const query = String(q || '').trim().toLowerCase();
        const matches = query
          ? this._options.filter((o) => String(o.label).toLowerCase().includes(query))
          : this._options;
        menu.items = matches.map((o) => ({
          label: o.label,
          value: o.value,
          selected: String(this.getAttribute('value') ?? '') === String(o.value),
          disabled: !!o.disabled,
          icon: o.icon,
        }));
      };
      /* ds-search-field emits its own input/clear events. */
      searchField.addEventListener('ds-search-field-input', (e) => applyFilter(e.detail?.value));
      searchField.addEventListener('ds-search-field-clear', () => applyFilter(''));
      /* ↓ jumps into the list; Esc on an empty field closes the menu (when it
         has text, ds-search-field handles Esc itself by clearing). */
      searchField.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          menu.querySelector('.ds-dropdown-menu__item:not([aria-disabled="true"])')?.focus();
        } else if (e.key === 'Escape' && !searchField.value) {
          e.stopPropagation();
          this._close();
        }
      });
    }

    this._root.querySelectorAll('[data-tag-value]').forEach((tag) => {
      tag.addEventListener('ds-tag-close', (e) => {
        e.stopPropagation();
        const v = tag.getAttribute('data-tag-value');
        this._values = this._values.filter((x) => String(x) !== String(v));
        this._render();
        this.dispatchEvent(new CustomEvent('ds-input-select-change', {
          bubbles: true,
          detail: { values: this._values.slice() },
        }));
      });
      tag.addEventListener('click', (e) => e.stopPropagation());
    });
  }

  /* Update chips/value display in-place without re-rendering the dropdown
     menu. Used during live multi-select toggling so the menu stays open. */
  _renderTrigger() {
    const trigger = this._root?.querySelector('[data-trigger]');
    if (!trigger) { this._render(); return; }
    const multi = boolAttr(this, 'multi');
    const placeholder = this.getAttribute('placeholder') || 'Select';
    const showClear = boolAttr(this, 'show-clear');
    const state = this._resolveState();
    const isDisabled = state === 'disabled';
    const isReadOnly = state === 'read-only';
    const hasValue = this._hasSelection();

    const prefixHTML = this._buildPrefix();
    const suffixHTML = this._buildSuffix();
    const inner = multi ? this._renderTags(placeholder) : this._renderValue(placeholder);
    const clearHTML = (showClear && hasValue && !isDisabled && !isReadOnly)
      ? `<button type="button" class="ds-input-select__clear" aria-label="Clear selection" data-clear>
           <ds-icon name="close" size="14"></ds-icon>
         </button>`
      : '';
    const chevronHTML = `<span class="ds-input-select__chevron" aria-hidden="true">
        <ds-icon name="chevron-down" size="16"></ds-icon>
      </span>`;

    trigger.innerHTML = prefixHTML + inner + clearHTML + chevronHTML + suffixHTML;
    /* The chip Remove buttons and the Clear button were just rebuilt — rewire
       only those, leave the dropdown menu alone. */
    this._wireTriggerControls(multi);
  }

  _wireTriggerControls(multi) {
    this._root.querySelector('[data-clear]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (multi) this._values = [];
      else this.removeAttribute('value');
      this._render();
      this.dispatchEvent(new CustomEvent('ds-input-select-clear', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('ds-input-select-change', {
        bubbles: true,
        detail: multi ? { values: [] } : { value: '' },
      }));
    });
    this._root.querySelectorAll('[data-tag-value]').forEach((tag) => {
      tag.addEventListener('ds-tag-close', (e) => {
        e.stopPropagation();
        const v = tag.getAttribute('data-tag-value');
        this._values = this._values.filter((x) => String(x) !== String(v));
        /* Push selection state back to the still-open menu so its checkboxes
           stay in sync with the chips we just edited. */
        const menu = (this._dropdownEl || this._root).querySelector('[data-menu]');
        if (menu) {
          menu.items = this._options.map((o) => ({
            label: o.label, value: o.value,
            selected: this._values.includes(o.value),
            disabled: !!o.disabled, icon: o.icon,
          }));
        }
        this._renderTrigger();
        this.dispatchEvent(new CustomEvent('ds-input-select-change', {
          bubbles: true,
          detail: { values: this._values.slice() },
        }));
      });
      tag.addEventListener('click', (e) => e.stopPropagation());
    });
  }

  _toggle() { this._isOpen ? this._close() : this._open(); }
  _open() {
    if (this._isOpen) return;
    this._isOpen = true;
    this._render();
    this.dispatchEvent(new CustomEvent('ds-input-select-open', { bubbles: true }));
  }
  _close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._render();
    this.dispatchEvent(new CustomEvent('ds-input-select-close', { bubbles: true }));
    const trigger = this._root?.querySelector('[data-trigger]');
    trigger?.focus();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-input-select')) {
  customElements.define('ds-input-select', DsInputSelect);
}
