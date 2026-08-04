import { boolAttr, enumAttr } from '../../utils/attr.js';

const SIZES = ['small', 'medium', 'large'];
let _uid = 0;

export class DsToggle extends HTMLElement {
  static get observedAttributes() { return ['size', 'checked', 'disabled', 'show-text', 'text', 'rtl', 'label', 'aria-label']; }

  connectedCallback() {
    if (!this._btn) {
      this.innerHTML = '';
      this._btn = document.createElement('button');
      this._btn.type = 'button';
      this._btn.setAttribute('role', 'switch');
      this.appendChild(this._btn);
      this._btn.addEventListener('click', () => {
        if (boolAttr(this, 'disabled')) return;
        this.checked = !this.checked;
        this.dispatchEvent(new CustomEvent('ds-toggle-change', { bubbles: true, detail: { checked: this.checked } }));
      });
      this._btn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this._btn.click(); }
      });
      /* Visible field label beside the switch (like other form fields).
         Clicking it toggles the switch, and it labels the control for AT. */
      this._label = document.createElement('span');
      this._label.className = 'ds-toggle__label';
      this._label.id = 'ds-toggle-label-' + (++_uid);
      this.appendChild(this._label);
      this._label.addEventListener('click', () => { if (!boolAttr(this, 'disabled')) this._btn.click(); });
    }
    this._render();
  }

  attributeChangedCallback() { if (this._btn) this._render(); }

  get checked() { return boolAttr(this, 'checked'); }
  set checked(v) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

  /* Field label beside the switch — reflected property (mirrors the attribute). */
  get label() { return this.getAttribute('label') || ''; }
  set label(v) { (v == null || v === '') ? this.removeAttribute('label') : this.setAttribute('label', String(v)); }

  get disabled() { return boolAttr(this, 'disabled'); }
  set disabled(v) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

  _render() {
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const checked = this.checked;
    const disabled = boolAttr(this, 'disabled');
    const showText = boolAttr(this, 'show-text');
    const customText = this.getAttribute('text');
    const rtl = boolAttr(this, 'rtl');
    const label = this.getAttribute('label') || '';

    this._btn.className = `ds-toggle ds-toggle--${size}`;
    this._btn.disabled = disabled;
    this._btn.setAttribute('aria-checked', String(checked));
    /* Render the field label beside the switch; use it as the control's
       accessible name via aria-labelledby (falls back to no name if unset). */
    this._label.textContent = label;
    this._label.hidden = !label;
    /* Accessible name: a visible `label` labels the switch via aria-labelledby.
       With no visible label, honour an `aria-label` on the host (settings-row
       pattern where the setting name lives in a separate element beside it). */
    const ariaLabel = this.getAttribute('aria-label');
    if (label) { this._btn.setAttribute('aria-labelledby', this._label.id); this._btn.removeAttribute('aria-label'); }
    else if (ariaLabel) { this._btn.setAttribute('aria-label', ariaLabel); this._btn.removeAttribute('aria-labelledby'); }
    else { this._btn.removeAttribute('aria-labelledby'); this._btn.removeAttribute('aria-label'); }
    if (rtl) this._btn.setAttribute('dir', 'rtl');
    else this._btn.removeAttribute('dir');

    /* Inline track label: per Figma matrix the label is a STATIC string that
       doesn't change between On/Off (e.g. "Enable", "يُمكِّن"). Use the
       consumer-supplied `text` attr; fall back to auto-flipping "On"/"Off"
       only when no custom text is provided. */
    /* Inline track label is a STATIC string per the Figma matrix (it does NOT
       flip between On/Off). Custom via `text`; defaults to "Enable". */
    const inlineText = showText ? (customText ?? 'Enable') : '';
    /* Dev guardrail: the in-track label is a SHORT, STATIC word (it does NOT flip
       with state). A verb phrase / instruction / sentence reads like a button and
       misleads when the switch is off — the setting name belongs in a field label
       BESIDE the switch. Warn once per offending string (skip re-render spam). See
       toggle.md → "Label guidance". */
    if (showText && customText && customText !== this._warnedText) {
      const words = customText.trim().split(/\s+/).length;
      if (words > 2 || customText.length > 16) {
        this._warnedText = customText;
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(
            `[ds-toggle] in-track text "${customText}" looks like a phrase/sentence. `
            + `Use a short static word (e.g. "Enable"); put the setting name in a field `
            + `label beside the switch and any explanation in helper text. State is shown `
            + `by the switch, not words. See toggle.md → "Label guidance".`);
        }
      }
    }
    this._btn.innerHTML = `
      ${inlineText ? `<span class="ds-toggle__text">${inlineText}</span>` : ''}
      <span class="ds-toggle__thumb" aria-hidden="true"></span>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-toggle')) {
  customElements.define('ds-toggle', DsToggle);
}
