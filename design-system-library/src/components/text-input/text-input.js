import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Helper/counter row = the shared "Form Field Helper Row" sub-component. */
import '../field-helper/field-helper.js';
/* Prefix / suffix dropdown chips open a shared Dropdown Menu. */
import '../dropdown-menu/dropdown-menu.js';

/* Auto-load field-helper.css once (both are light-DOM, so the stylesheet must
   be present even on pages that load text-input.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-text-input-fh-css', '../field-helper/field-helper.css');
_injectCss('ds-text-input-dropdown-css', '../dropdown-menu/dropdown-menu.css');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ISO 3166-1 alpha-2 country code → flag emoji (regional-indicator letters).
   e.g. "us" → 🇺🇸, "in" → 🇮🇳. Returns '' for anything that isn't 2 letters. */
const flagEmoji = (cc) => {
  const c = String(cc || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return '';
  return String.fromCodePoint(...[...c].map((ch) => 0x1F1E6 + ch.charCodeAt(0) - 65));
};

const SIZES = ['small', 'medium', 'large'];
const STATES = ['default', 'error', 'success', 'readonly', 'disabled'];
const POSITIONS = ['none', 'top', 'left'];

let _uid = 0;

export class DsTextInput extends HTMLElement {
  static get observedAttributes() {
    return [
      'size', 'state', 'label-position', 'label', 'placeholder', 'value',
      'required', 'helper', 'counter', 'show-counter', 'show-helper-row',
      'prefix-text', 'suffix-text', 'prefix-icon', 'suffix-icon',
      'suffix-icon-right', 'show-clear', 'rtl', 'type', 'autocomplete',
      'show-label-help-icon', 'prefix-dropdown', 'suffix-dropdown', 'flag',
    ];
  }

  constructor() {
    super();
    this._id = `ds-ti-${++_uid}`;
    this._prefixOptions = [];   // [{label, value, flag?, icon?}]
    this._suffixOptions = [];
  }

  /* Options for the prefix / suffix dropdown chip. Each: {label, value, flag?, icon?}.
     Selecting one updates the affix text (+ flag for prefix) and fires
     ds-text-input-prefix-change / -suffix-change. */
  get prefixOptions() { return this._prefixOptions.slice(); }
  set prefixOptions(v) { this._prefixOptions = Array.isArray(v) ? v.slice() : []; }
  get suffixOptions() { return this._suffixOptions.slice(); }
  set suffixOptions(v) { this._suffixOptions = Array.isArray(v) ? v.slice() : []; }

  connectedCallback() {
    if (!this._root) { this._root = document.createElement('div'); this.innerHTML = ''; this.appendChild(this._root); }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    if (name === 'value' && this._input) this._input.value = this.getAttribute('value') ?? '';
    else this._render();
  }

  get value() { return this._input?.value ?? ''; }
  set value(v) { if (this._input) this._input.value = v ?? ''; }

  _render() {
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const state = enumAttr(this, 'state', STATES, 'default');
    const position = enumAttr(this, 'label-position', POSITIONS, 'left');
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const value = this.getAttribute('value') ?? '';
    const required = boolAttr(this, 'required');
    const helper = this.getAttribute('helper') || '';
    const counter = this.getAttribute('counter') || '';
    const showCounter = boolAttr(this, 'show-counter');
    const showHelperRow = (helper || showCounter) && (!this.hasAttribute('show-helper-row') || this.getAttribute('show-helper-row') !== 'false');
    const prefixText = this.getAttribute('prefix-text');
    const suffixText = this.getAttribute('suffix-text');
    const prefixIcon = this.getAttribute('prefix-icon');
    const suffixIcon = this.getAttribute('suffix-icon');
    const suffixIconRight = this.getAttribute('suffix-icon-right');
    const showClear = boolAttr(this, 'show-clear');
    const showLabelHelp = boolAttr(this, 'show-label-help-icon');
    const prefixDropdown = boolAttr(this, 'prefix-dropdown');
    const suffixDropdown = boolAttr(this, 'suffix-dropdown');
    const rtl = boolAttr(this, 'rtl');
    const type = this.getAttribute('type') || 'text';
    /* `autocomplete` defaults to the browser's heuristic. Consumers that
       wrap text-input as a trigger (e.g. date picker) should set
       autocomplete="off" to prevent autofill suggestions appearing over the
       popover. */
    const autocomplete = this.getAttribute('autocomplete') || 'on';

    const cls = `ds-text-input ds-text-input--${size} ds-text-input--${state} ds-text-input--${position}`;
    this._root.className = cls;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Label Row = label + required(*) + optional help icon (toggleable, off by
       default — see Figma `Show Label Help Icon`). RTL mirror is handled by the
       root `dir="rtl"` (flex reverses the row). */
    const labelHelpHTML = showLabelHelp
      ? `<button type="button" class="ds-text-input__label-help" aria-label="Help" data-label-help><ds-icon name="help-circle" size="16"></ds-icon></button>`
      : '';
    /* label-position="none" hides the label visually; the text is kept as an
       accessible name via aria-label on the input (set after render). */
    const labelHTML = (label && position !== 'none')
      ? `<span class="ds-text-input__label-row"><label class="ds-text-input__label" for="${this._id}">${esc(label)}${required ? '<span class="ds-text-input__required">*</span>' : ''}</label>${labelHelpHTML}</span>`
      : '';

    /* The whole helper row is one <ds-field-helper id="…-helper"> (icon + text
       + counter), so aria-describedby points at it — SR users hear the helper
       text and counter alongside the field name (spec a11y requirement). */
    const helperId  = `${this._id}-helper`;
    const describedBy = (showHelperRow && (helper || (showCounter && counter))) ? helperId : '';

    /* Prefix / Suffix are each their own 4px-gap group (Figma anatomy). When a
       group is a dropdown it renders as a <button> with a hover background.
       Field order: Prefix · input · Clear · Suffix  (clear sits BEFORE suffix). */
    /* `flag` = ISO country code → flag emoji shown before the prefix text
       (phone-number variant: 🇺🇸 +1). */
    const flag = flagEmoji(this.getAttribute('flag'));
    const hasPrefix = prefixIcon || prefixText || flag;
    const hasSuffix = suffixText || suffixIcon || suffixIconRight;
    /* Prefix order: flag, then text, then icon (matches Figma). RTL mirrors
       automatically via dir="rtl" on the root (flex reverses visual order). */
    const prefixInner =
      `${flag ? `<span class="ds-text-input__affix-flag" aria-hidden="true">${flag}</span>` : ''}` +
      `${prefixText ? `<span class="ds-text-input__affix-text ds-text-input__affix-text--prefix">${esc(prefixText)}</span>` : ''}` +
      `${prefixIcon ? `<span class="ds-text-input__affix-icon"><ds-icon name="${prefixIcon}" size="16"></ds-icon></span>` : ''}`;
    const suffixInner =
      `${suffixText ? `<span class="ds-text-input__affix-text ds-text-input__affix-text--suffix">${esc(suffixText)}</span>` : ''}` +
      `${suffixIcon ? `<span class="ds-text-input__affix-icon"><ds-icon name="${suffixIcon}" size="16"></ds-icon></span>` : ''}` +
      `${suffixIconRight ? `<span class="ds-text-input__affix-icon ds-text-input__affix-icon--far-right"><ds-icon name="${suffixIconRight}" size="16"></ds-icon></span>` : ''}`;
    const prefixGroup = hasPrefix
      ? (prefixDropdown
          ? `<button type="button" class="ds-text-input__prefix ds-text-input__prefix--dropdown" data-prefix-dropdown aria-haspopup="listbox">${prefixInner}</button>`
          : `<span class="ds-text-input__prefix">${prefixInner}</span>`)
      : '';
    const suffixGroup = hasSuffix
      ? (suffixDropdown
          ? `<button type="button" class="ds-text-input__suffix ds-text-input__suffix--dropdown" data-suffix-dropdown aria-haspopup="listbox">${suffixInner}</button>`
          : `<span class="ds-text-input__suffix">${suffixInner}</span>`)
      : '';
    const clearHTML = showClear
      ? `<button type="button" class="ds-text-input__clear" aria-label="Clear" data-clear><ds-icon name="cancel" size="14"></ds-icon></button>`
      : '';
    const fieldHTML = `
      <div class="ds-text-input__field">
        ${prefixGroup}
        <input id="${this._id}" type="${type}" placeholder="${placeholder}" value="${value.replace(/"/g, '&quot;')}"
               autocomplete="${autocomplete}"
               ${state === 'readonly' ? 'readonly aria-readonly="true"' : ''}
               ${state === 'disabled' ? 'disabled' : ''}
               ${required ? 'required aria-required="true"' : ''}
               ${state === 'error' ? 'aria-invalid="true"' : ''}
               ${describedBy ? `aria-describedby="${describedBy}"` : ''} />
        ${clearHTML}
        ${suffixGroup}
      </div>`;

    /* Helper/counter row = shared <ds-field-helper>. State drives its colour +
       leading icon; counter (when shown) is pinned to the trailing edge. When
       there's no helper text, hide the icon so a counter-only row stays clean. */
    const helperState = state === 'error' ? 'error'
      : state === 'success' ? 'success'
      : state === 'disabled' ? 'disabled' : 'default';
    const helperHTML = showHelperRow
      ? `<ds-field-helper class="ds-text-input__helper-row" id="${helperId}"
           text="${esc(helper)}" state="${helperState}"
           ${helper ? '' : 'show-icon="false"'}
           ${showCounter && counter ? `counter="${esc(counter)}"` : ''}
           ${rtl ? 'rtl' : ''}></ds-field-helper>`
      : '';

    if (position === 'left') {
      this._root.innerHTML = `
        <div class="ds-text-input__label-col">${labelHTML}</div>
        <div class="ds-text-input__body">${fieldHTML}${helperHTML}</div>
      `;
    } else {
      this._root.innerHTML = `
        ${labelHTML}
        <div class="ds-text-input__body">${fieldHTML}${helperHTML}</div>
      `;
    }

    this._input = this._root.querySelector('input');
    if (position === 'none' && label) this._input.setAttribute('aria-label', label);
    const helperEl = this._root.querySelector('ds-field-helper');

    /* Live counter — derive the max from the counter attr ("0/100" → 100),
       cap input length, and recompute "<len>/<max>" on every change. */
    let maxChars = null;
    if (counter) { const m = /\/\s*(\d+)/.exec(counter); if (m) maxChars = parseInt(m[1], 10); }
    if (maxChars != null && type !== 'number') this._input.maxLength = maxChars;
    const updateCounter = () => {
      if (showCounter && helperEl && maxChars != null) {
        helperEl.setAttribute('counter', `${this._input.value.length}/${maxChars}`);
      }
    };
    /* Toggle has-value so the clear button shows only when focused + non-empty. */
    const syncHasValue = () => {
      this._root.classList.toggle('ds-text-input--has-value', !!this._input.value);
    };
    updateCounter(); // sync to the initial value on render
    syncHasValue();

    this._input.addEventListener('input', () => {
      updateCounter();
      syncHasValue();
      this.dispatchEvent(new CustomEvent('ds-input', { bubbles: true, detail: { value: this._input.value } }));
    });

    /* Number fields: block alphabetic (and exponent) characters — keep digits,
       navigation/control keys, and shortcuts working. */
    if (type === 'number') {
      this._input.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) e.preventDefault();
      });
      this._input.addEventListener('paste', (e) => {
        const t = (e.clipboardData || window.clipboardData).getData('text');
        if (/[a-zA-Z]/.test(t)) e.preventDefault();
      });
    }

    this._root.querySelector('[data-clear]')?.addEventListener('click', () => {
      this._input.value = '';
      this._input.focus();
      updateCounter();
      syncHasValue();
      this.dispatchEvent(new CustomEvent('ds-input', { bubbles: true, detail: { value: '' } }));
      this.dispatchEvent(new CustomEvent('ds-text-input-clear', { bubbles: true }));
    });
    this._root.querySelector('[data-label-help]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-text-input-help', { bubbles: true }));
    });
    this._root.querySelector('[data-prefix-dropdown]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('ds-text-input-prefix-click', { bubbles: true }));
      this._toggleAffixMenu('prefix');
    });
    this._root.querySelector('[data-suffix-dropdown]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('ds-text-input-suffix-click', { bubbles: true }));
      this._toggleAffixMenu('suffix');
    });

    /* Affix tooltip — a lightweight, styled, HOVER-ONLY tip shown only when the
       prefix/suffix text is truncated. It does NOT re-parent the affix (so the
       prefix/suffix always renders) — it shows a shared floating element that is
       positioned next to the hovered affix and removed on mouseleave. */
    const TIP_ID = 'ds-text-input-affix-tooltip';
    const getTip = () => {
      let t = document.getElementById(TIP_ID);
      if (!t) { t = document.createElement('div'); t.id = TIP_ID; t.className = 'ds-text-input__affix-tooltip'; document.body.appendChild(t); }
      return t;
    };
    const hideTip = () => { const t = document.getElementById(TIP_ID); if (t) t.style.display = 'none'; };
    const showTip = (el) => {
      if (el.scrollWidth <= el.clientWidth + 1) return; // only when truncated
      const t = getTip();
      t.textContent = el.textContent;
      t.style.display = 'block';
      const r = el.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      let left = r.left + r.width / 2 - tr.width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
      t.style.left = `${Math.round(left)}px`;
      t.style.top = `${Math.round(r.top - tr.height - 8)}px`;
    };
    this._root.querySelectorAll('.ds-text-input__affix-text').forEach((el) => {
      el.addEventListener('mouseenter', () => showTip(el));
      el.addEventListener('mouseleave', hideTip);
    });
  }

  disconnectedCallback() { this._closeAffixMenu(); }

  // ---- Prefix / suffix dropdown menu --------------------------------------
  _toggleAffixMenu(side) {
    if (this._affixMenuWrap && this._affixMenuSide === side) { this._closeAffixMenu(); return; }
    this._openAffixMenu(side);
  }

  _openAffixMenu(side) {
    const options = side === 'prefix' ? this._prefixOptions : this._suffixOptions;
    if (!options || !options.length) return;   // no options → chip is a plain (event-only) trigger
    this._closeAffixMenu();
    const chip = this._root.querySelector(`[data-${side}-dropdown]`);
    if (!chip) return;
    chip.setAttribute('aria-expanded', 'true');

    const wrap = document.createElement('div');
    wrap.className = 'ds-text-input__affix-menu';
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
        if (side === 'prefix') { if (opt.flag) this.setAttribute('flag', opt.flag); else this.removeAttribute('flag'); }
        this.dispatchEvent(new CustomEvent(`ds-text-input-${side}-change`, {
          bubbles: true, detail: { value: String(opt.value ?? opt.label), label: opt.label, flag: opt.flag || null },
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
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-text-input')) {
  customElements.define('ds-text-input', DsTextInput);
}
