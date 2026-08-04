/* =============================================================================
   <ds-radio value="x" label="X" checked size="m" name="grp" disabled error rtl show-help-icon>
   size: s (16) | m (20) | l (24) | mobile (20, 44px touch row). Aliases: small→s, medium→m.

   Standalone single radio button — the sibling of <ds-checkbox>. Renders a real
   <input type="radio"> wrapped in a <label> so the control + label are both
   clickable, native form semantics + keyboard focus work, and same-`name`
   radios behave as one group natively. Fires native change + `ds-radio-change`.

   For a labelled set with a legend + helper row, use <ds-radio-group>.
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
import '../../icons/icon.js';   // optional trailing help icon

/* Auto-load radio.css once so the control is fully styled wherever <ds-radio>
   is used — standalone or via <ds-radio-group> — without the host page needing
   to link it (matches the self-contained pattern used across the DS). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-radio-css', './radio.css');

const SIZES = ['s', 'm', 'l', 'mobile'];
/* Legacy aliases kept so existing size="small|medium" usages still work. */
const SIZE_ALIAS = { small: 's', medium: 'm' };
/* Help-icon px per size — matches the control scale (S 16 · M 20 · L 24 · Mobile 20). */
const HELP_ICON_SIZE = { s: 16, m: 20, l: 24, mobile: 20 };

let uid = 0;

export class DsRadio extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'error', 'size', 'label', 'value', 'name', 'rtl', 'show-help-icon'];
  }

  connectedCallback() {
    if (!this._input) {
      // Capture default-slotted text (`<ds-radio>Text</ds-radio>`)
      const fallbackLabel = this.textContent.trim();
      this.innerHTML = '';

      const id = `ds-radio-${++uid}`;
      const label = document.createElement('label');
      label.className = 'ds-radio';
      label.htmlFor = id;

      const input = document.createElement('input');
      input.type = 'radio';
      input.className = 'ds-radio__input';
      input.id = id;

      const circle = document.createElement('span');
      circle.className = 'ds-radio__circle';
      circle.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'ds-radio__label';

      /* Optional trailing help icon (off by default). Plain span (not the
         ds-icon host) so [hidden] works — ds-icon forces inline-flex on itself. */
      const help = document.createElement('span');
      help.className = 'ds-radio__help';
      help.setAttribute('aria-hidden', 'true');
      help.hidden = true;
      help.innerHTML = '<ds-icon name="info-circle"></ds-icon>';

      label.append(input, circle, text, help);
      this.appendChild(label);

      this._wrapper = label;
      this._input   = input;
      this._labelEl = text;
      this._helpEl  = help;
      if (fallbackLabel) text.textContent = fallbackLabel;

      input.addEventListener('change', () => {
        if (input.checked) {
          this.setAttribute('checked', '');
          /* Native radio grouping deselects same-name siblings but fires no
             event on them — mirror that onto their `checked` attribute so the
             component state stays in sync with what's rendered. */
          const nm = this.getAttribute('name');
          if (nm) {
            const root = this.getRootNode() || document;
            root.querySelectorAll(`ds-radio[name="${CSS.escape(nm)}"]`).forEach((el) => {
              if (el !== this) el.removeAttribute('checked');
            });
          }
        } else {
          this.removeAttribute('checked');
        }
        this.dispatchEvent(new CustomEvent('ds-radio-change', {
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
    const rawSize = (this.getAttribute('size') || '').toLowerCase();
    const aliased = SIZE_ALIAS[rawSize] || rawSize;
    const size = SIZES.includes(aliased) ? aliased : 's';
    const checked = boolAttr(this, 'checked');
    const disabled = boolAttr(this, 'disabled');
    const error = boolAttr(this, 'error');
    const rtl = boolAttr(this, 'rtl');
    const labelText = this.getAttribute('label');
    const value = this.getAttribute('value');
    const name = this.getAttribute('name');

    this._wrapper.className = `ds-radio ds-radio--${size}`
      + (error ? ' ds-radio--error' : '')
      + (disabled ? ' ds-radio--disabled' : '');

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

    if (labelText !== null) this._labelEl.textContent = labelText;

    /* Trailing help icon — sized to match the control scale. */
    const showHelp = boolAttr(this, 'show-help-icon');
    this._helpEl.hidden = !showHelp;
    if (showHelp) {
      this._helpEl.querySelector('ds-icon')?.setAttribute('size', String(HELP_ICON_SIZE[size]));
    }
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

if (typeof customElements !== 'undefined' && !customElements.get('ds-radio')) {
  customElements.define('ds-radio', DsRadio);
}
