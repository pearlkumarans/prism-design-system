/* =============================================================================
   <ds-field-helper text="Code sent to your phone" state="default"
                    icon="info-circle" show-icon counter="12/232" rtl></ds-field-helper>

   The shared "Form Field Helper Row": a leading status icon + helper text on the
   leading side, and an optional character counter ("12/232") pinned to the
   trailing side. States: default | error | success | disabled (icon + text +
   counter share the state colour). Drives its own ARIA live-region so consumers
   can point `aria-describedby` at this element's id.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

/* Spec state name is `negative`; `error` is kept as a working alias since
   existing fields (date-picker, slider, input-select, otp-input) pass it. */
const STATES = ['default', 'negative', 'error', 'success', 'disabled'];
const ICON_FOR = {
  default: 'info-circle',
  negative: 'exclamation-circle',
  error: 'exclamation-circle',
  success: 'tick',                 // spec §Color: Success glyph = tick
  disabled: 'info-circle',
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class DsFieldHelper extends HTMLElement {
  static get observedAttributes() { return ['text', 'state', 'icon', 'show-icon', 'counter', 'rtl']; }

  connectedCallback() {
    if (!this._root) {
      /* Capture default-slot text once (so <ds-field-helper>Text</ds-field-helper>
         works as well as the `text` attribute). */
      this._slotText = this.textContent.trim();
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._sync();
  }

  attributeChangedCallback() { if (this._root) this._sync(); }

  _sync() {
    /* Normalise the spec's `negative` onto the codebase's canonical `error`
       (same hue/icon) so both attribute spellings render identically. */
    let state = enumAttr(this, 'state', STATES, 'default');
    if (state === 'negative') state = 'error';
    const text = this.getAttribute('text') ?? this._slotText ?? '';
    const showIcon = !this.hasAttribute('show-icon') || this.getAttribute('show-icon') !== 'false';
    const icon = this.getAttribute('icon') || ICON_FOR[state];
    const rtl = boolAttr(this, 'rtl');
    const counter = this.getAttribute('counter') || '';

    /* Both clusters empty → render nothing AND collapse the host so it reserves
       no space (the host is display:block, so an empty inner row would otherwise
       still occupy the component's margin — the "empty helper reserves ~16px"
       inconsistency). Restored to block below when there's content. */
    if (!text && !counter) {
      this._root.className = 'ds-field-helper';
      this._root.removeAttribute('dir');
      this._root.innerHTML = '';
      this.style.display = 'none';
      return;
    }
    this.style.display = '';

    this._root.className = `ds-field-helper ds-field-helper--${state}`;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Error/Negative speaks immediately (assertive); everything else is polite. */
    if (state === 'error') {
      this.setAttribute('role', 'alert');
      this.setAttribute('aria-live', 'assertive');
    } else {
      this.removeAttribute('role');
      this.setAttribute('aria-live', 'polite');
    }

    /* Leading help-group (icon + text, grows) + optional trailing counter (hugs).
       The help-group always renders (even empty) so a counter-only row keeps the
       counter pinned to the trailing edge via the group's flex:1. The icon is
       decorative (aria-hidden) and only shown alongside text. */
    this._root.innerHTML = `
      <span class="ds-field-helper__group">
        ${showIcon && text ? `<span class="ds-field-helper__icon" aria-hidden="true"><ds-icon name="${icon}" size="12"></ds-icon></span>` : ''}
        ${text ? `<span class="ds-field-helper__text">${esc(text)}</span>` : ''}
      </span>
      ${counter ? `<span class="ds-field-helper__counter">${esc(counter)}</span>` : ''}
    `;

    /* Truncation tooltip: the help text is single-line + ellipsis, so when it's
       clipped, reveal the full string on hover via a lightweight, styled,
       body-level tooltip (same pattern as the Text Field affix tooltip — not the
       native `title`). Shown only when actually truncated (checked at hover time,
       so it stays accurate as the row width / RTL changes). */
    const textEl = this._root.querySelector('.ds-field-helper__text');
    if (textEl) {
      textEl.addEventListener('mouseenter', () => DsFieldHelper._showTip(textEl, text));
      textEl.addEventListener('mouseleave', DsFieldHelper._hideTip);
    }
  }

  static _hideTip() {
    const t = document.getElementById(DsFieldHelper.TIP_ID);
    if (t) t.style.display = 'none';
  }

  static _showTip(el, fullText) {
    /* Only when the text is actually clipped. */
    if (el.scrollWidth <= el.clientWidth + 1) return;
    let t = document.getElementById(DsFieldHelper.TIP_ID);
    if (!t) {
      t = document.createElement('div');
      t.id = DsFieldHelper.TIP_ID;
      t.className = 'ds-field-helper__tooltip';
      t.setAttribute('role', 'tooltip');
      document.body.appendChild(t);
    }
    t.textContent = fullText;
    t.style.display = 'block';
    const r = el.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    const M = 8;
    let left = Math.max(M, Math.min(el.closest('[dir="rtl"]') ? r.right - tr.width : r.left, window.innerWidth - tr.width - M));
    let top = r.top - tr.height - 6;
    if (top < M) top = r.bottom + 6;   // flip below when no room above
    t.style.left = `${Math.round(left)}px`;
    t.style.top = `${Math.round(top)}px`;
  }
}

DsFieldHelper.TIP_ID = 'ds-field-helper-tooltip';

if (typeof customElements !== 'undefined' && !customElements.get('ds-field-helper')) {
  customElements.define('ds-field-helper', DsFieldHelper);
}
