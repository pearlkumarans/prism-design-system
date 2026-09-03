/* =============================================================================
   <ds-otp-input length="6" size="medium" label="Verification code"
                 helper="Code sent to +91 ••••••7890" rtl></ds-otp-input>

   Behaviors:
     - numeric-only entry, auto-advance to next box
     - Backspace on empty box moves focus back
     - Paste distributes digits across boxes
     - Emits ds-otp-change with { value }
     - Emits ds-otp-complete when all boxes are filled
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Helper/note row = the shared "Form Field Helper Row" sub-component. */
import '../field-helper/field-helper.js';
import { injectCss } from '../../utils/inject-css.js';
import { escapeHtml } from '../../utils/escape.js';

/* Auto-load field-helper.css once (both are light-DOM, so the stylesheet must
   be present even on pages that load otp-input.css individually). */
injectCss('ds-otp-input-fh-css', '../field-helper/field-helper.css', import.meta.url);

const SIZES = ['small', 'medium', 'large'];
let _otpUid = 0;

export class DsOtpInput extends HTMLElement {
  static get observedAttributes() {
    return ['length', 'size', 'label', 'label-position', 'helper', 'state', 'disabled', 'rtl', 'value'];
  }

  constructor() {
    super();
    this._uid = ++_otpUid;
    // deferred-upgrade recovery — properties may be set before the element is defined
    if (Object.prototype.hasOwnProperty.call(this, 'value')) {
      const v = this.value;
      delete this.value;
      this._pendingValue = v;
    }
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('div');
      this._root.className = 'ds-otp-input';
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._render();
    if (this._pendingValue !== undefined) {
      this.value = this._pendingValue;
      this._pendingValue = undefined;
    }
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    if (name === 'value') {
      this.value = this.getAttribute('value') || '';
    } else if (name === 'size' || name === 'state' || name === 'disabled' || name === 'rtl') {
      /* Visual-only: patch the root class / dir, each box's disabled + aria-invalid,
         and the helper's state / rtl in place — the box <input>s (and the typed
         code + focus) survive. length / label / helper change the box set → render. */
      this._paintChrome();
    } else {
      this._render();
    }
  }

  /* Chrome-only update shared with _render: root class + dir, per-box disabled /
     aria-invalid, and the helper row's state / rtl — never rebuilds innerHTML, so
     the box <input>s keep their node identity (and their entered digits). */
  _paintChrome() {
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const state = this.getAttribute('state') || '';
    const disabled = boolAttr(this, 'disabled') || state === 'disabled';
    const rtl = boolAttr(this, 'rtl');

    this._root.className = `ds-otp-input ds-otp-input--${size}` + (state ? ` ds-otp-input--${state}` : '');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const boxes = this._inputs || [...this._root.querySelectorAll('.ds-otp-input__box')];
    boxes.forEach((box) => {
      if (state === 'error') box.setAttribute('aria-invalid', 'true');
      else box.removeAttribute('aria-invalid');
      box.disabled = disabled;
    });

    const helper = this._root.querySelector('ds-field-helper');
    if (helper) {
      const helperState = state === 'error' ? 'error' : (state === 'disabled' ? 'disabled' : 'default');
      if (helper.getAttribute('state') !== helperState) helper.setAttribute('state', helperState);
      if (rtl) helper.setAttribute('rtl', ''); else helper.removeAttribute('rtl');
    }
  }

  get value() {
    if (!this._inputs) return this.getAttribute('value') || '';
    return this._inputs.map((i) => i.value || '').join('');
  }
  set value(v) {
    const str = (v ?? '').toString().slice(0, this._length || this._readLength());
    if (this._inputs) {
      this._inputs.forEach((inp, i) => { inp.value = str[i] || ''; });
    } else {
      /* Boxes not built yet (property set on an upgraded-but-unconnected
         element, the common framework "set props then mount" order) — stash so
         connectedCallback applies it once the boxes exist. */
      this._pendingValue = str;
    }
  }

  _readLength() {
    const n = parseInt(this.getAttribute('length') || '6', 10);
    return (n === 4 || n === 6) ? n : 6;
  }

  _render() {
    /* Preserve the entered code across a rebuild. The typed digits live only in
       the box <input>s (they aren't reflected to the `value` attribute), so a
       plain innerHTML rebuild would wipe them — e.g. setting `state="error"`
       after validation. The getter returns the current boxes' value on a
       re-render, or the `value` attribute on the first render (so an initial
       `value="123456"` is honoured too). Restored after the boxes are rebuilt. */
    const prevValue = this.value;
    const length = this._readLength();
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const label = this.getAttribute('label') || '';
    /* label-position: 'top' (default) shows the label above the boxes; 'none'
       hides it — the field group keeps the text as its aria-label below. */
    const position = enumAttr(this, 'label-position', ['none', 'top'], 'top');
    const helper = this.getAttribute('helper') || '';
    const state = this.getAttribute('state') || ''; // '' | 'filled' | 'error' | 'disabled'
    const disabled = boolAttr(this, 'disabled') || state === 'disabled';
    const rtl = boolAttr(this, 'rtl');

    this._length = length;
    this._root.className = `ds-otp-input ds-otp-input--${size}` + (state ? ` ds-otp-input--${state}` : '');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const helperId = `ds-otp-${this._uid}-helper`;
    const labelHTML = (label && position !== 'none')
      ? `<label class="ds-otp-input__label">${escapeHtml(label)}</label>`
      : '';
    /* Per a11y spec: the input group is described by the helper row (when
       present) so screen readers read the helper after the field name. The
       helper row also flips to assertive live in the error state so the
       message is announced immediately when validation fails. */
    const fieldsHTML = `<div class="ds-otp-input__fields" role="group"
        aria-label="${escapeHtml(label || 'One-time code')}"
        ${helper ? `aria-describedby="${helperId}"` : ''}>` +
      Array.from({ length }, (_, i) => `
        <input class="ds-otp-input__box"
          type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1"
          autocomplete="one-time-code"
          aria-label="Digit ${i + 1} of ${length}"
          ${state === 'error' ? 'aria-invalid="true"' : ''}
          ${disabled ? 'disabled' : ''}
        />`).join('') +
      `</div>`;
    /* Helper row is the shared <ds-field-helper> sub-component — it owns the
       icon, the default/error/disabled colour, and its own ARIA live-region. */
    const helperState = state === 'error' ? 'error' : (state === 'disabled' ? 'disabled' : 'default');
    const helperAttr = escapeHtml(helper);
    const helperHTML = helper
      ? `<ds-field-helper id="${helperId}" text="${helperAttr}" state="${helperState}" ${rtl ? 'rtl' : ''}></ds-field-helper>`
      : '';

    this._root.innerHTML = labelHTML + fieldsHTML + helperHTML;
    this._inputs = [...this._root.querySelectorAll('.ds-otp-input__box')];
    /* Re-apply the chrome (class / dir / per-box + helper state) through the same
       path the visual-only route uses, so both emit identical output. */
    this._paintChrome();
    this._wire();
    /* Restore the captured code into the freshly-built boxes. */
    if (prevValue) this.value = prevValue;
  }

  _wire() {
    const inputs = this._inputs;
    const fire = () => {
      const value = this.value;
      this.dispatchEvent(new CustomEvent('ds-otp-change', { bubbles: true, detail: { value } }));
      if (value.length === inputs.length) {
        this.dispatchEvent(new CustomEvent('ds-otp-complete', { bubbles: true, detail: { value } }));
      }
    };

    inputs.forEach((input, i) => {
      input.addEventListener('input', (e) => {
        const v = input.value.replace(/\D/g, '').slice(-1);
        input.value = v;
        if (v && i < inputs.length - 1) inputs[i + 1].focus();
        fire();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) {
          inputs[i - 1].focus();
          inputs[i - 1].value = '';
          e.preventDefault();
          fire();
        } else if (e.key === 'ArrowLeft' && i > 0) {
          inputs[i - 1].focus(); e.preventDefault();
        } else if (e.key === 'ArrowRight' && i < inputs.length - 1) {
          inputs[i + 1].focus(); e.preventDefault();
        }
      });
      input.addEventListener('paste', (e) => {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const digits = text.replace(/\D/g, '').slice(0, inputs.length - i);
        if (digits) {
          e.preventDefault();
          for (let k = 0; k < digits.length; k++) inputs[i + k].value = digits[k];
          const next = Math.min(i + digits.length, inputs.length - 1);
          inputs[next].focus();
          fire();
        }
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-otp-input')) {
  customElements.define('ds-otp-input', DsOtpInput);
}
