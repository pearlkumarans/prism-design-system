/* =============================================================================
   <ds-token-field size="medium|large"
                   label="Skills" placeholder="Add tags…"
                   helper="Pick up to 8" max-rows="3"
                   show-label show-helper-row required
                   show-prefix-icon prefix-icon="search"
                   show-clear show-chevron creatable
                   show-label-help-icon label-help="What goes here?"
                   disabled readonly error rtl></ds-token-field>

   Input-first multi-select: chosen values render as removable Tag tokens inside
   the field, with an inline "Add tags…" caret and an optional suggestions
   dropdown. Sibling of <ds-input-select> (Figma Token Field 21854:797291).

   Wrap behaviour (the defining rule):
     • Resting (blurred + has tokens) = "filled": tokens on a SINGLE row; any that
       don't fit collapse into a "+N" total badge. Field height fixed.
     • Active (focused) : tokens WRAP up to `max-rows` (3); the field grows to fit,
       then the token area scrolls. Suggestions dropdown opens.

   Boolean attribute conventions (match ds-input-select):
     - `required`, `show-label`, `show-helper-row` default ON (set "false" to hide).
     - `show-prefix-icon` defaults to false (or on when `prefix-icon` set).
     - `show-clear` defaults to false; `show-chevron` defaults to true.
     - `creatable` (default true) — Enter commits the typed query as a token.

   API:
     el.tokens      = ['Design', 'Figma'];                 // string[] or [{label,value}]
     el.suggestions = [{ label, value, disabled? }];        // dropdown options

   Events:
     - ds-token-add      detail: { value, label }
     - ds-token-remove   detail: { value, label }
     - ds-tokens-change  detail: { tokens: [{value,label}] }
     - ds-token-clear
     - ds-token-input    detail: { query }
     - ds-token-focus / ds-token-blur
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../field-helper/field-helper.js';

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-token-field-fh-css', '../field-helper/field-helper.css');
_injectCss('ds-token-field-tag-css', '../tag/tag.css');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SIZES = ['medium', 'large'];
let _uid = 0;

const boolAttrDefault = (el, name, defaultValue) => {
  if (!el.hasAttribute(name)) return defaultValue;
  return el.getAttribute(name) !== 'false';
};

/* Normalise a token to { value, label, invalid }. */
const normToken = (t) => (typeof t === 'object' && t !== null)
  ? { value: String(t.value ?? t.label), label: String(t.label ?? t.value), invalid: !!t.invalid }
  : { value: String(t), label: String(t), invalid: false };

export class DsTokenField extends HTMLElement {
  static get observedAttributes() {
    return [
      'size', 'label', 'label-position', 'placeholder', 'required', 'helper',
      'show-label', 'show-helper-row', 'show-prefix-icon', 'prefix-icon',
      'show-clear', 'show-chevron', 'max-rows',
      'show-label-help-icon', 'label-help',
      'menu-variant', 'show-selection-bar', 'empty-text',
      'pattern', 'require-source', 'error-text',
      'disabled', 'readonly', 'error', 'rtl', 'creatable',
    ];
  }

  constructor() {
    super();
    this._id = `ds-tf-${++_uid}`;
    this._tokens = [];          // [{value,label,invalid}]
    this._suggestions = [];     // [{value,label,disabled}]
    this._query = '';
    this._focused = false;
    this._validateFn = null;    // optional (value,label) => boolean
    this._inputError = false;   // last entry was rejected (invalid) — show field error
  }

  connectedCallback() {
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    this._render();
    this._docClick = (e) => {
      if (!this._focused) return;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      /* Multi-select: picking a suggestion re-renders + swaps the portaled
         dropdown, so the captured path holds the *old* dropdown node. Match our
         dropdown by class (not identity) so selecting never closes the menu. */
      const inOurDropdown = path.some((n) => n && n.classList && n.classList.contains('ds-token-field__dropdown'));
      if (path.includes(this) || (this._dropdownEl && path.includes(this._dropdownEl)) || inOurDropdown) return;
      this._blur();
    };
    document.addEventListener('click', this._docClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._docClick);
    this._removePortaledDropdown();
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }

  attributeChangedCallback(name) {
    if (name === 'pattern' || name === 'require-source') this._revalidate();
    if (this._root) this._render();
  }

  // ---- Public API ---------------------------------------------------------
  get tokens() { return this._tokens.map((t) => ({ ...t })); }
  set tokens(v) {
    this._tokens = (Array.isArray(v) ? v : []).map(normToken);
    this._revalidate();
    if (this._root) this._render();
  }
  get suggestions() { return this._suggestions.slice(); }
  set suggestions(v) {
    this._suggestions = (Array.isArray(v) ? v : []).map((o) => ({
      value: String(o.value ?? o.label), label: String(o.label ?? o.value), disabled: !!o.disabled,
    }));
    /* Source changed — a token whose option was just removed from the source
       (e.g. a decommissioned device) may now be invalid. Re-flag before render. */
    this._revalidate();
    if (this._root) this._render();
  }
  get values() { return this._tokens.map((t) => t.value); }
  /* Tokens that failed validation (shown as red error tags). */
  get invalidTokens() { return this._tokens.filter((t) => t.invalid).map((t) => ({ ...t })); }

  /* Optional validator: (value, label) => boolean. Returning false (or a regex
     `pattern` attribute not matching the label) marks the token invalid. */
  get validate() { return this._validateFn; }
  set validate(fn) {
    this._validateFn = typeof fn === 'function' ? fn : null;
    this._revalidate();
    if (this._root) this._render();
  }

  /* True when a `validate` fn, `pattern`, or `require-source` is configured. */
  _requireSource() { return this.hasAttribute('require-source') && this.getAttribute('require-source') !== 'false'; }
  _hasValidator() { return !!this._validateFn || !!this.getAttribute('pattern') || this._requireSource(); }

  _isValid(tok) {
    if (this._validateFn) { try { return this._validateFn(tok.value, tok.label) !== false; } catch (e) { return true; } }
    const pat = this.getAttribute('pattern');
    if (pat) { try { return new RegExp(pat).test(tok.label); } catch (e) { return true; } }
    /* Referential validity: the token's option must still exist in the source. */
    if (this._requireSource()) return this._suggestions.some((o) => o.value === tok.value);
    return true;
  }

  /* Recompute `invalid` on every token — only when a validator exists, so
     explicitly-flagged invalid tokens are preserved when none is set. */
  _revalidate() {
    if (!this._hasValidator()) return;
    this._tokens.forEach((t) => { t.invalid = !this._isValid(t); });
  }

  // ---- State resolution ---------------------------------------------------
  _resolveState() {
    if (boolAttr(this, 'disabled')) return 'disabled';
    if (boolAttr(this, 'readonly')) return 'read-only';
    /* A rejected entry (_inputError) or the external `error` attr → red border,
       even while focused, so the user sees why the value was refused. */
    if (boolAttr(this, 'error') || this._inputError) return 'error';
    if (this._focused) return 'active';
    if (this._tokens.length) return 'filled';
    return 'default';
  }

  /* Suggestions NOT yet added (used for Enter-to-add / create). */
  _filteredSuggestions() {
    const taken = new Set(this._tokens.map((t) => t.value));
    const q = this._query.trim().toLowerCase();
    return this._suggestions.filter((o) =>
      !taken.has(o.value) && (!q || o.label.toLowerCase().includes(q)));
  }

  /* Option rows for the dropdown — query-filtered, with `selected` reflecting
     current tokens so already-chosen options show as checked/ticked. */
  _dropdownOptions() {
    const taken = new Set(this._tokens.map((t) => t.value));
    const q = this._query.trim().toLowerCase();
    return this._suggestions
      .filter((o) => !q || o.label.toLowerCase().includes(q))
      .map((o) => ({ label: o.label, value: o.value, disabled: o.disabled, selected: taken.has(o.value) }));
  }

  /* Full item list incl. the bulk-action Selection Bar (on by default — token
     field is multi-select). The selection bar auto-counts + offers Select all /
     Deselect all. */
  _dropdownItems() {
    const opts = this._dropdownOptions();
    const showBar = boolAttrDefault(this, 'show-selection-bar', true);
    return (showBar && opts.length) ? [{ type: 'selection-bar' }, ...opts] : opts;
  }

  // ---- Render -------------------------------------------------------------
  _render() {
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const state = this._resolveState();
    const isOpen = this._focused && state !== 'disabled' && state !== 'read-only';
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || 'Add tags…';
    /* label-position: 'top' (default), 'left' (label in a 280px column beside
       the field, auto-stacks below 640px), or 'none' to hide the label. The
       input keeps an accessible name via aria-label (label || placeholder), so
       'none' stays accessible. Legacy show-label="false" also hides it. */
    const position = enumAttr(this, 'label-position', ['none', 'left', 'top'], 'top');
    const showLabel = boolAttrDefault(this, 'show-label', !!label) && position !== 'none';
    const required = boolAttrDefault(this, 'required', true);
    const showHelperRow = boolAttrDefault(this, 'show-helper-row', true);
    const showPrefixIcon = boolAttrDefault(this, 'show-prefix-icon', !!this.getAttribute('prefix-icon'));
    const showClear = boolAttr(this, 'show-clear');
    const showChevron = boolAttrDefault(this, 'show-chevron', true);
    const helper = this.getAttribute('helper') || '';
    const prefixIcon = this.getAttribute('prefix-icon') || 'search';
    const rtl = boolAttr(this, 'rtl');
    const maxRows = parseInt(this.getAttribute('max-rows'), 10) || 3;
    const isDisabled = state === 'disabled';
    const isReadOnly = state === 'read-only';
    const hasTokens = this._tokens.length > 0;

    const cls = [
      'ds-token-field',
      `ds-token-field--${size}`,
      `ds-token-field--${position}`,
      isOpen ? 'ds-token-field--open' : '',
    ].filter(Boolean).join(' ');
    this._root.className = cls;
    this._root.dataset.state = state;
    this._root.style.setProperty('--tf-max-rows', String(maxRows));
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    /* Label help icon — toggleable, off by default (Figma `Show Label Help Icon`).
       Renders a help-circle (16) button after the label/required. When `label-help`
       text is set it's wrapped in a <ds-tooltip>; otherwise it's a plain button. */
    const showLabelHelp = boolAttr(this, 'show-label-help-icon');
    const labelHelpText = this.getAttribute('label-help') || '';
    const labelHelpBtn = `<button type="button" class="ds-token-field__label-help" aria-label="${labelHelpText ? esc(labelHelpText) : 'Help'}" data-label-help><ds-icon name="help-circle" size="16"></ds-icon></button>`;
    const labelHelpHTML = showLabelHelp
      ? (labelHelpText
          ? `<ds-tooltip class="ds-token-field__label-help-tip" text="${esc(labelHelpText)}" position="up-center" theme="dark"${rtl ? ' rtl' : ''}>${labelHelpBtn}</ds-tooltip>`
          : labelHelpBtn)
      : '';
    const labelHTML = (showLabel && label)
      ? `<div class="ds-token-field__label-row">
           <label class="ds-token-field__label" for="${this._id}-input">
             ${esc(label)}${required ? '<span class="ds-token-field__required" aria-hidden="true">*</span>' : ''}
           </label>${labelHelpHTML}
         </div>`
      : '';

    const helperId = `${this._id}-helper`;
    const helperState = state === 'error' ? 'error' : state === 'disabled' ? 'disabled' : 'default';
    /* On a rejected entry, swap the helper for the error message so the user
       knows why the value was refused. */
    const helperMsg = this._inputError ? (this.getAttribute('error-text') || 'Invalid value') : helper;
    const helperHTML = showHelperRow
      ? `<ds-field-helper class="ds-token-field__helper" id="${helperId}"
           text="${esc(helperMsg)}" state="${helperState}"
           ${helperState === 'error' ? '' : 'show-icon="false"'}
           ${rtl ? 'rtl' : ''}></ds-field-helper>`
      : '';

    const prefixHTML = showPrefixIcon
      ? `<span class="ds-token-field__prefix" aria-hidden="true"><ds-icon name="${prefixIcon}" size="16"></ds-icon></span>`
      : '';

    /* Tokens: each a removable ds-tag. In filled (single-row) mode an overflow
       "+N" badge is appended after a measure pass. */
    const tagSize = size === 'large' ? 'large' : 'medium';
    const errorText = this.getAttribute('error-text') || 'Invalid value';
    const tagsHTML = this._tokens.map((t) =>
      `<ds-tag size="${tagSize}" variant="${t.invalid ? 'error' : 'neutral'}" data-tag-value="${esc(t.value)}"`
      + `${t.invalid ? ` title="${esc(errorText)}" data-invalid` : ''}`
      + `${isDisabled || isReadOnly ? ' show-close="false"' : ''}>${esc(t.label)}</ds-tag>`
    ).join('');

    /* The caret. Hidden in disabled/read-only and in resting filled (so the
       placeholder doesn't sit beside collapsed tokens). Visible when empty or
       when focused/active. */
    const showInput = !isDisabled && !isReadOnly && (isOpen || !hasTokens);
    const inputHTML = showInput
      ? `<input id="${this._id}-input" class="ds-token-field__input" type="text"
           autocomplete="off" spellcheck="false"
           placeholder="${hasTokens ? '' : esc(placeholder)}"
           aria-label="${esc(label || placeholder)}"
           aria-describedby="${showHelperRow ? helperId : ''}"
           aria-expanded="${isOpen}" role="combobox" aria-autocomplete="list"
           ${required ? 'aria-required="true"' : ''}
           ${state === 'error' ? 'aria-invalid="true"' : ''} data-input>`
      : '';

    const badgeHTML = `<span class="ds-token-field__badge" data-badge hidden></span>`;

    const clearHTML = (showClear && hasTokens && !isDisabled && !isReadOnly)
      ? `<button type="button" class="ds-token-field__clear" aria-label="Clear all tags" data-clear>
           <ds-icon name="close" size="14"></ds-icon>
         </button>`
      : '';
    const chevronHTML = (showChevron && !isReadOnly)
      ? `<span class="ds-token-field__chevron" aria-hidden="true">
           <ds-icon name="chevron-down" size="16"></ds-icon>
         </span>`
      : '';

    const fieldHTML = `
      <div class="ds-token-field__field" data-field
        ${isDisabled ? 'aria-disabled="true"' : ''}>
        ${prefixHTML}
        <span class="ds-token-field__tokens" data-tokens role="group"
          aria-label="Selected tags" aria-live="polite">
          ${tagsHTML}${badgeHTML}${inputHTML}
        </span>
        ${clearHTML}
        ${chevronHTML}
      </div>`;

    const dropdownHTML = isOpen ? this._renderDropdown() : '';

    const fieldColHTML =
      `<div class="ds-token-field__field-col">
         <div class="ds-token-field__field-wrap">${fieldHTML}${dropdownHTML}</div>
         ${helperHTML}
       </div>`;

    /* Left layout wraps the label in a fixed-width column beside the field;
       top/none render the label (or nothing) directly above the field-col. */
    const labelColHTML = (position === 'left')
      ? `<div class="ds-token-field__label-col">${labelHTML}</div>`
      : labelHTML;
    this._root.innerHTML = labelColHTML + fieldColHTML;
    this._wire();

    this._removePortaledDropdown();
    if (isOpen) this._portalDropdown();

    /* Filled = single row + total badge: hide overflowing tokens, show "+N".
       Runs once tokens are laid out; recollapses on field resize. */
    this._observeResize();
    if (state === 'filled') {
      requestAnimationFrame(() => this._collapseSingleRow());
      /* Backstop: ds-tag + its icon can lay out a few frames late, after the
         rAF retry window — recheck once more so the "+N" total is never missed. */
      clearTimeout(this._collapseT);
      this._collapseT = setTimeout(() => {
        if (this._resolveState() === 'filled') this._collapseSingleRow();
      }, 240);
    }
  }

  _observeResize() {
    if (this._ro || typeof ResizeObserver === 'undefined') return;
    /* The single-row collapse depends only on WIDTH. Reacting to height changes
       (wrapping / the active-state scrollbar) creates a ResizeObserver→layout
       feedback loop that visibly jerks the field. Gate on width only. */
    this._lastW = -1;
    this._ro = new ResizeObserver(() => {
      const w = Math.round(this._root.clientWidth);
      if (w === this._lastW) return;
      this._lastW = w;
      if (this._resolveState() === 'filled') this._collapseSingleRow();
    });
    this._ro.observe(this._root);   // _root is stable across re-renders
  }

  _renderDropdown() {
    /* No catalog at all (pure free-entry field) → no dropdown. With a catalog,
       the menu stays open even when a query matches nothing, showing a
       "No results found" empty row instead of vanishing. */
    if (!this._suggestions.length) return '';
    /* Token field is multi-select: `menu-variant="tick"` → select-tick (trailing
       check), otherwise multi-select (leading checkbox). Both toggle in place,
       stay open, and carry the Selection Bar (no Apply/Cancel footer). */
    const type = this.getAttribute('menu-variant') === 'tick' ? 'select-tick' : 'multi-select';
    const rtl = boolAttr(this, 'rtl');
    const emptyText = this.getAttribute('empty-text') || 'No results found';
    return `<div class="ds-token-field__dropdown" id="${this._id}-listbox"${rtl ? ' dir="rtl"' : ''}>
      <ds-dropdown-menu type="${type}" open show-footer="false" empty-text="${esc(emptyText)}"${rtl ? ' rtl' : ''} data-menu></ds-dropdown-menu>
    </div>`;
  }

  /* Single-row collapse for the resting "filled" state. Measure token widths
     against the available row width; hide those that overflow and show a
     "+N" total badge (N = hidden count). */
  _collapseSingleRow(attempt = 0) {
    const tokensEl = this._root?.querySelector('[data-tokens]');
    const badge = this._root?.querySelector('[data-badge]');
    if (!tokensEl || !badge) return;
    const tags = Array.from(tokensEl.querySelectorAll('[data-tag-value]'));
    tags.forEach((t) => { t.hidden = false; });
    badge.hidden = true;
    if (!tags.length) return;

    const avail = tokensEl.clientWidth;
    /* The ds-tag children upgrade asynchronously — if they haven't laid out yet
       their offsetWidth is 0, which would measure nothing as overflowing. Retry
       on the next frame until widths are real. */
    if ((avail === 0 || tags.some((t) => t.offsetWidth === 0)) && attempt < 12) {
      requestAnimationFrame(() => this._collapseSingleRow(attempt + 1));
      return;
    }
    const gap = 4;
    const badgeReserve = 40; // room for "+N"
    let used = 0;
    let hidden = 0;
    tags.forEach((t, i) => {
      const w = t.offsetWidth + (i ? gap : 0);
      const needBadge = i < tags.length - 1; // more after this one
      const limit = needBadge ? avail - badgeReserve : avail;
      if (used + w <= limit && hidden === 0) {
        used += w;
      } else {
        t.hidden = true;
        hidden += 1;
      }
    });
    if (hidden > 0) {
      /* Alert the user that tokens were collapsed: the badge lists the hidden
         ones in a tooltip, and the tokens row is an aria-live region so screen
         readers announce "+N more (…)" when a large set overflows the row. */
      const hiddenLabels = tags.filter((t) => t.hidden).map((t) => t.textContent.trim());
      const summary = `${hidden} more: ${hiddenLabels.join(', ')}`;
      badge.textContent = `+${hidden}`;
      badge.title = summary;
      badge.setAttribute('aria-label', summary);
      badge.hidden = false;
    } else {
      badge.removeAttribute('title');
      badge.removeAttribute('aria-label');
    }
  }

  _portalDropdown() {
    const dd = this._root.querySelector('.ds-token-field__dropdown');
    if (!dd) return;
    this._dropdownEl = dd;
    document.body.appendChild(dd);
    this._positionDropdown();
    this._bindReanchor();
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
    const field = this._root.querySelector('[data-field]');
    if (!dd || !field) return;
    const r = field.getBoundingClientRect();
    if (!r.width && !r.height) return;
    dd.style.position = 'fixed';
    dd.style.margin = '0';
    dd.style.zIndex = '9999';
    dd.style.width = `${Math.round(r.width)}px`;
    const dh = dd.offsetHeight;
    const vh = window.innerHeight;
    const M = 8, GAP = 8;
    let top = r.bottom + GAP;
    let left = r.left;
    if (top + dh > vh - M && r.top - dh - GAP >= M) top = r.top - dh - GAP;
    top = Math.max(M, Math.min(top, vh - dh - M));
    dd.style.top = `${Math.round(top)}px`;
    dd.style.left = `${Math.round(left)}px`;
    dd.style.right = 'auto';
    dd.style.bottom = 'auto';
  }
  _bindReanchor() {
    if (this._reanchor) return;
    this._reanchor = () => { if (this._focused) this._positionDropdown(); };
    window.addEventListener('scroll', this._reanchor, true);
    window.addEventListener('resize', this._reanchor);
  }
  _unbindReanchor() {
    if (!this._reanchor) return;
    window.removeEventListener('scroll', this._reanchor, true);
    window.removeEventListener('resize', this._reanchor);
    this._reanchor = null;
  }

  // ---- Wiring -------------------------------------------------------------
  _wire() {
    const state = this._resolveState();
    const field = this._root.querySelector('[data-field]');
    const input = this._root.querySelector('[data-input]');

    /* Clicking anywhere in the field focuses the caret (unless on a token's
       close button or the clear button). */
    field?.addEventListener('mousedown', (e) => {
      if (state === 'disabled' || state === 'read-only') return;
      if (e.target.closest('[data-tag-value]') || e.target.closest('[data-clear]')) return;
      if (input && e.target !== input) { e.preventDefault(); input.focus({ preventScroll: true }); }
      else if (!input) this._focus();
    });

    if (input) {
      input.value = this._query;
      input.addEventListener('focus', () => this._focus());
      input.addEventListener('input', () => {
        const raw = input.value;
        /* Comma / newline / semicolon separates tokens: commit each completed
           segment, keep the part after the last delimiter as the live query. */
        if (/[,\n;\t]/.test(raw)) {
          const parts = raw.split(/[,\n;\t]/);
          const remainder = parts.pop();
          this._commitMultiple(parts.join(','));
          this._query = remainder;
          this._render();
          const ni = this._root.querySelector('[data-input]');
          if (ni) { ni.value = remainder; ni.focus({ preventScroll: true }); }
          this.dispatchEvent(new CustomEvent('ds-token-input', { bubbles: true, detail: { query: remainder } }));
          return;
        }
        this._query = raw;
        /* Editing clears a prior rejection so the error state lifts as the
           user corrects the value. */
        if (this._inputError) { this._inputError = false; this._render(); }
        this.dispatchEvent(new CustomEvent('ds-token-input', { bubbles: true, detail: { query: this._query } }));
        this._refreshDropdown();
      });
      /* Paste a delimited list → add them all at once (valid + invalid-as-red). */
      input.addEventListener('paste', (e) => {
        const text = (e.clipboardData || window.clipboardData) ? (e.clipboardData || window.clipboardData).getData('text') : '';
        if (/[,\n;\t]/.test(text)) {
          e.preventDefault();
          this._commitMultiple((this._query || '') + text);
          this._query = '';
          this._render();
          const ni = this._root.querySelector('[data-input]');
          if (ni) ni.focus({ preventScroll: true });
        }
      });
      input.addEventListener('keydown', (e) => this._onInputKey(e, input));
      /* Keep focus state alive across the synchronous re-render. */
      if (this._focused) requestAnimationFrame(() => {
        if (this._focused && document.activeElement !== input) input.focus({ preventScroll: true });
      });
    }

    this._root.querySelector('[data-clear]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._clearAll();
    });

    this._root.querySelector('[data-label-help]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('ds-token-help', { bubbles: true }));
    });

    const editable = state !== 'disabled' && state !== 'read-only';
    this._root.querySelectorAll('[data-tag-value]').forEach((tag) => {
      tag.addEventListener('ds-tag-close', (e) => {
        e.stopPropagation();
        this._removeToken(tag.getAttribute('data-tag-value'));
      });
      tag.addEventListener('click', (e) => e.stopPropagation());
      /* Double-click a token → edit it: pull its text back into the caret so the
         user can fix/retype it (handy for correcting a red invalid token). */
      if (editable) tag.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._editToken(tag.getAttribute('data-tag-value'));
      });
    });

    /* Query the FRESH menu from _root — at wire time the portal hasn't run yet,
       and this._dropdownEl still points at the previous (stale) portaled menu. */
    const menu = this._root.querySelector('[data-menu]');
    if (menu) {
      menu.items = this._dropdownItems();
      /* Checkbox / tick toggle → sync tokens from the full selected set; menu stays open. */
      menu.addEventListener('ds-dropdown-change', (e) => {
        if (e.detail && Array.isArray(e.detail.values)) this._syncFromValues(e.detail.values);
      });
      /* Selection Bar: Select all (union with existing) / Deselect all (clear). */
      menu.addEventListener('ds-dropdown-select-all', () => {
        const visibleSel = (menu.items || [])
          .filter((it) => it && it.selected && !['heading', 'divider', 'selection-bar'].includes(it.type))
          .map((it) => String(it.value ?? it.label));
        this._syncFromValues(Array.from(new Set([...this.values, ...visibleSel])));
      });
      const clearAll = () => this._syncFromValues([]);
      menu.addEventListener('ds-dropdown-clear-all', clearAll);
      menu.addEventListener('ds-dropdown-clear', clearAll);
    }
  }

  _onInputKey(e, input) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = this._query.trim();
      if (!q) return;
      const match = this._filteredSuggestions().find((o) => o.label.toLowerCase() === q.toLowerCase());
      /* Add-as-red on Enter too (consistent with comma / paste / blur): invalid
         values become error tags rather than being blocked. */
      if (match) { this._addToken(match, { allowInvalid: true }); return; }
      if (boolAttrDefault(this, 'creatable', true)) this._addToken({ value: q, label: q }, { allowInvalid: true });
    } else if (e.key === 'Backspace' && input.value === '' && this._tokens.length) {
      e.preventDefault();
      this._removeToken(this._tokens[this._tokens.length - 1].value);
    } else if (e.key === 'Escape') {
      this._blur();
    }
  }

  /* Re-render only the dropdown menu items as the query changes, without
     tearing down the focused input. When the query matches nothing the menu
     stays open with an empty ("No results found") list. */
  _refreshDropdown() {
    const menu = (this._dropdownEl || this._root).querySelector('[data-menu]');
    if (!menu) {
      /* Dropdown wasn't shown (no catalog); create it if a source exists. */
      if (this._suggestions.length) this._render();
      return;
    }
    /* `_dropdownItems()` returns [] when nothing matches (no options, no bar) →
       the menu renders its "No results found" empty row. */
    menu.items = this._dropdownItems();
    if (this._dropdownEl) this._positionDropdown();
  }

  /* Reconcile tokens to the menu's full selected-value set (multi-select
     checkbox toggle). Preserves labels, emits add/remove diffs, keeps open. */
  _syncFromValues(values) {
    const set = (values || []).map(String);
    const prev = this._tokens.slice();
    const prevByVal = new Map(prev.map((t) => [t.value, t]));
    this._tokens = set.map((v) => {
      if (prevByVal.has(v)) return prevByVal.get(v);
      const opt = this._suggestions.find((o) => o.value === v);
      const tok = opt ? { value: opt.value, label: opt.label, invalid: false } : { value: v, label: v, invalid: false };
      tok.invalid = !this._isValid(tok);
      return tok;
    });
    const newSet = new Set(set);
    const prevSet = new Set(prev.map((t) => t.value));
    prev.forEach((t) => { if (!newSet.has(t.value)) this.dispatchEvent(new CustomEvent('ds-token-remove', { bubbles: true, detail: t })); });
    this._tokens.forEach((t) => { if (!prevSet.has(t.value)) this.dispatchEvent(new CustomEvent('ds-token-add', { bubbles: true, detail: t })); });
    this._emitChange();
    this._render();
  }

  // ---- Mutations ----------------------------------------------------------
  /* allowInvalid=false (Enter): block invalid — keep the text in the caret for
     editing + flag the field error. allowInvalid=true (blur / commit-on-leave):
     add it anyway, marked invalid (red tag), so the typed text is never lost. */
  _addToken(t, { allowInvalid = false } = {}) {
    const tok = normToken(t);
    if (this._tokens.some((x) => x.value === tok.value)) return true;
    const valid = this._isValid(tok);
    if (!valid && !allowInvalid) {
      this._inputError = true;
      this._render();
      this.dispatchEvent(new CustomEvent('ds-token-invalid', { bubbles: true, detail: tok }));
      return false;
    }
    tok.invalid = !valid;
    this._inputError = false;
    this._tokens.push(tok);
    this._query = '';
    this._render();
    this.dispatchEvent(new CustomEvent('ds-token-add', { bubbles: true, detail: tok }));
    if (tok.invalid) this.dispatchEvent(new CustomEvent('ds-token-invalid', { bubbles: true, detail: tok }));
    this._emitChange();
    return true;
  }
  /* Bulk add: split `text` on commas / newlines / semicolons / tabs and add each
     as a token (comma entry + paste). Each is validated — invalid segments become
     red error tags (never dropped), so a pasted list surfaces its bad entries.
     Catalog-only (creatable=false) skips non-matching segments. Renders once via
     the caller. Returns true if any token was added. */
  _commitMultiple(text) {
    const segs = String(text).split(/[,\n;\t]+/).map((s) => s.trim()).filter(Boolean);
    if (!segs.length) return false;
    const creatable = boolAttrDefault(this, 'creatable', true);
    let any = false;
    segs.forEach((q) => {
      const match = this._filteredSuggestions().find((o) => o.label.toLowerCase() === q.toLowerCase());
      const cand = match || (creatable ? { value: q, label: q } : null);
      if (!cand) return;                                     // catalog-only + no match
      const val = String(cand.value ?? cand.label);
      if (this._tokens.some((x) => x.value === val)) return; // dedupe
      const tok = normToken(cand);
      tok.invalid = !this._isValid(tok);
      this._tokens.push(tok);
      this.dispatchEvent(new CustomEvent('ds-token-add', { bubbles: true, detail: tok }));
      if (tok.invalid) this.dispatchEvent(new CustomEvent('ds-token-invalid', { bubbles: true, detail: tok }));
      any = true;
    });
    if (any) { this._inputError = false; this._emitChange(); }
    return any;
  }

  _removeToken(value) {
    const idx = this._tokens.findIndex((t) => String(t.value) === String(value));
    if (idx === -1) return;
    const [removed] = this._tokens.splice(idx, 1);
    this._render();
    this.dispatchEvent(new CustomEvent('ds-token-remove', { bubbles: true, detail: removed }));
    this._emitChange();
  }

  /* Edit a token: lift it out of the list and back into the caret (its label
     becomes the live query, text selected) so it can be corrected + re-committed.
     Fires `ds-token-edit`; the removal is reflected in `ds-tokens-change`. */
  _editToken(value) {
    const idx = this._tokens.findIndex((t) => String(t.value) === String(value));
    if (idx === -1) return;
    const [tok] = this._tokens.splice(idx, 1);
    this._query = tok.label;
    this._focused = true;
    this._render();
    const ni = this._root.querySelector('[data-input]');
    if (ni) { ni.value = tok.label; ni.focus({ preventScroll: true }); try { ni.select(); } catch (e) {} }
    this.dispatchEvent(new CustomEvent('ds-token-edit', { bubbles: true, detail: tok }));
    this._emitChange();
  }
  _clearAll() {
    if (!this._tokens.length) return;
    this._tokens = [];
    this._query = '';
    this._render();
    this.dispatchEvent(new CustomEvent('ds-token-clear', { bubbles: true }));
    this._emitChange();
  }
  _emitChange() {
    this.dispatchEvent(new CustomEvent('ds-tokens-change', { bubbles: true, detail: { tokens: this.tokens } }));
  }

  _focus() {
    if (this._focused) return;
    this._focused = true;
    this._render();
    this.dispatchEvent(new CustomEvent('ds-token-focus', { bubbles: true }));
  }
  _blur() {
    if (!this._focused) return;
    /* Commit pending text on blur instead of discarding it: a catalog match is
       added; otherwise (if creatable) the typed value is added — validated, and
       kept as a red error token if invalid so the input is never lost. In
       catalog-only mode (creatable=false) a non-matching entry is dropped. */
    const q = this._query.trim();
    if (q) {
      const match = this._filteredSuggestions().find((o) => o.label.toLowerCase() === q.toLowerCase());
      if (match) this._addToken(match, { allowInvalid: true });
      else if (boolAttrDefault(this, 'creatable', true)) this._addToken({ value: q, label: q }, { allowInvalid: true });
    }
    this._focused = false;
    this._query = '';
    this._inputError = false;
    this._render();
    this.dispatchEvent(new CustomEvent('ds-token-blur', { bubbles: true }));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-token-field')) {
  customElements.define('ds-token-field', DsTokenField);
}
