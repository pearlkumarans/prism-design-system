/* =============================================================================
   <ds-checkbox value="x" label="X" checked size="medium" disabled error rtl>

   Renders a real <input type="checkbox"> wrapped in a <label> so the box +
   label are both clickable, native form semantics work, and the (hidden)
   input still receives keyboard focus for the focus ring. Fires native
   change events plus a `ds-checkbox-change` custom event.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const SIZES = ['small', 'medium'];

let uid = 0;

const CHECK_SVG = `
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5"
       stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
    <path d="M4 10.5L8 14.5L16 6"></path>
  </svg>`;

export class DsCheckbox extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'error', 'size', 'label', 'value', 'name', 'rtl', 'indeterminate', 'indicator'];
  }

  connectedCallback() {
    if (!this._input) {
      // Capture default-slotted text (if consumer wrote `<ds-checkbox>Text</ds-checkbox>`)
      const fallbackLabel = this.textContent.trim();
      this.innerHTML = '';

      const id = `ds-cb-${++uid}`;
      const label = document.createElement('label');
      label.className = 'ds-checkbox';
      label.htmlFor = id;

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'ds-checkbox__input';
      input.id = id;

      const box = document.createElement('span');
      box.className = 'ds-checkbox__box';
      box.setAttribute('aria-hidden', 'true');
      box.innerHTML = CHECK_SVG;

      const text = document.createElement('span');
      text.className = 'ds-checkbox__label';

      label.append(input, box, text);
      this.appendChild(label);

      this._wrapper = label;
      this._input   = input;
      this._labelEl = text;
      if (fallbackLabel) text.textContent = fallbackLabel;

      input.addEventListener('change', () => {
        if (input.checked) this.setAttribute('checked', '');
        else this.removeAttribute('checked');
        this.dispatchEvent(new CustomEvent('ds-checkbox-change', {
          bubbles: true, composed: true,
          detail: { checked: input.checked, value: this.getAttribute('value') ?? '' },
        }));
      });
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._input) this._sync();
  }

  _sync() {
    const size = enumAttr(this, 'size', SIZES, 'small');
    const checked = boolAttr(this, 'checked');
    const disabled = boolAttr(this, 'disabled');
    const error = boolAttr(this, 'error');
    const rtl = boolAttr(this, 'rtl');
    const labelText = this.getAttribute('label');
    const value = this.getAttribute('value');
    const name = this.getAttribute('name');
    const indeterminate = boolAttr(this, 'indeterminate');

    /* indicator="minus" → the checked/active state shows a minus (not a tick);
       unchecked stays empty. Toggles minus ↔ empty, never a tick. */
    const minusMode = this.getAttribute('indicator') === 'minus';

    this._wrapper.className = `ds-checkbox ds-checkbox--${size}`
      + (error ? ' ds-checkbox--error' : '')
      + (minusMode ? ' ds-checkbox--minus' : '')
      + (disabled ? ' ds-checkbox--disabled' : '');

    if (rtl) this._wrapper.setAttribute('dir', 'rtl');
    else this._wrapper.removeAttribute('dir');

    if (disabled) this._wrapper.setAttribute('aria-disabled', 'true');
    else this._wrapper.removeAttribute('aria-disabled');
    if (error) this._wrapper.setAttribute('data-error', 'true');
    else this._wrapper.removeAttribute('data-error');

    this._input.checked = checked;
    this._input.disabled = disabled;
    if (error) this._input.setAttribute('aria-invalid', 'true');
    else this._input.removeAttribute('aria-invalid');
    if (value !== null) this._input.value = value;
    if (name) this._input.name = name;

    // Indeterminate: native property + ARIA
    this._input.indeterminate = indeterminate && !checked;
    if (indeterminate && !checked) this._input.setAttribute('aria-checked', 'mixed');
    else this._input.removeAttribute('aria-checked');

    if (labelText !== null) this._labelEl.textContent = labelText;
  }

  // DOM-style getters for ergonomic JS use
  get checked() { return boolAttr(this, 'checked'); }
  set checked(v) {
    if (v) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
  }
  get value()    { return this.getAttribute('value') ?? ''; }
  set value(v)   { this.setAttribute('value', v); }
  get disabled() { return boolAttr(this, 'disabled'); }
  set disabled(v){ v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

  click() { this._input?.click(); }
  focus(opts) { this._input?.focus(opts); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-checkbox')) {
  customElements.define('ds-checkbox', DsCheckbox);
}
