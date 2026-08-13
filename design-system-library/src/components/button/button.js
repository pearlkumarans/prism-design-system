/* =============================================================================
   <ds-button variant="primary" size="medium" prefix-icon="add" suffix-icon="chevron-down">
     Save
   </ds-button>

   The host element renders a real <button> as its only DOM child so all native
   form semantics (type, disabled, form association, click events) keep working.
   Default slot content is moved into the inner button as the label.

   Label text can also be set/updated declaratively via the `label` attribute
   (e.g. for i18n) — it takes precedence over slotted content and updates
   reactively. ALWAYS prefer this over `el.textContent = '...'`, which would wipe
   the rendered <button> and leave bare text. Removing the attribute restores the
   original slotted label.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';

const VARIANTS = ['primary', 'secondary', 'tertiary', 'outline', 'destructive', 'success', 'warning', 'secondary-color'];
const SIZES = ['large', 'medium', 'small', 'xsmall'];
const TYPES = ['button', 'submit', 'reset'];

export class DsButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'prefix-icon', 'suffix-icon', 'type', 'rtl', 'label'];
  }

  connectedCallback() {
    if (!this._btn) {
      // Capture original light-DOM children once (default slot = label)
      const labelNodes = [...this.childNodes];
      this.innerHTML = '';

      const btn = document.createElement('button');
      btn.className = 'ds-button';

      const prefix = document.createElement('span');
      prefix.className = 'ds-button__prefix';

      const label = document.createElement('span');
      label.className = 'ds-button__label';
      labelNodes.forEach((n) => label.appendChild(n));
      this._label = label;
      /* Remember the slotted label so removing the `label` attr can restore it. */
      this._defaultLabelHTML = label.innerHTML;

      const suffix = document.createElement('span');
      suffix.className = 'ds-button__suffix';

      btn.append(prefix, label, suffix);
      this.appendChild(btn);

      this._btn = btn;
      this._prefix = prefix;
      this._suffix = suffix;

      btn.addEventListener('click', (e) => {
        if (this.hasAttribute('disabled') || boolAttr(this, 'loading')) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      });
    }

    this._sync();
    /* Static HTML has the label present at upgrade; frameworks (Ember/Glimmer,
       React, Vue) may append it AFTER upgrade, when the capture above already ran
       on an empty element — leaving the label as a stray node beside our <button>.
       Reclaim one already present (e.g. after re-parenting), and any that arrives. */
    this._reclaimLabel();
    watchLateChildren(this, () => this._reclaimLabel());
  }

  disconnectedCallback() {
    stopLateChildren(this);
  }

  _reclaimLabel() {
    const strays = [...this.childNodes].filter((n) => n !== this._btn);
    if (!strays.length) return;
    strays.forEach((n) => this._label.appendChild(n));
    this._defaultLabelHTML = this._label.innerHTML;   // late label becomes the new default
    this._sync();
  }

  attributeChangedCallback() {
    if (this._btn) this._sync();
  }

  _sync() {
    const btn = this._btn;
    const variant = enumAttr(this, 'variant', VARIANTS, 'primary');
    const size = enumAttr(this, 'size', SIZES, 'small');
    const type = enumAttr(this, 'type', TYPES, 'button');
    const disabled = boolAttr(this, 'disabled');
    const loading = boolAttr(this, 'loading');
    const prefixIcon = this.getAttribute('prefix-icon');
    const suffixIcon = this.getAttribute('suffix-icon');
    const rtl = boolAttr(this, 'rtl');
    // Icon size per spec: 20px for large/medium, 16px for small, 12px for xsmall.
    const iconPx = size === 'xsmall' ? 12 : (size === 'small' ? 16 : 20);

    /* Label: `label` attr wins and updates reactively; otherwise keep the slotted
       content. Only ever touch the label span — never the host — so the rendered
       <button> chrome is preserved. */
    const labelAttr = this.getAttribute('label');
    if (labelAttr != null) {
      if (this._label.textContent !== labelAttr) this._label.textContent = labelAttr;
    } else if (this._label.innerHTML !== this._defaultLabelHTML) {
      this._label.innerHTML = this._defaultLabelHTML;
    }

    btn.className = `ds-button ds-button--${variant} ds-button--${size}`;
    btn.type = type;
    btn.disabled = disabled || loading;
    if (loading) btn.setAttribute('aria-busy', 'true');
    else btn.removeAttribute('aria-busy');
    if (rtl) btn.setAttribute('dir', 'rtl');
    else btn.removeAttribute('dir');

    if (loading) {
      /* Spec: spinner replaces the prefix icon, label stays visible, suffix hidden. */
      this._prefix.innerHTML = '<span class="ds-button__spinner" aria-hidden="true"></span>';
      this._prefix.style.display = '';
      this._suffix.innerHTML = '';
      this._suffix.style.display = 'none';
    } else {
      this._prefix.innerHTML = prefixIcon ? `<ds-icon name="${prefixIcon}" size="${iconPx}"></ds-icon>` : '';
      this._prefix.style.display = prefixIcon ? '' : 'none';

      this._suffix.innerHTML = suffixIcon ? `<ds-icon name="${suffixIcon}" size="${iconPx}"></ds-icon>` : '';
      this._suffix.style.display = suffixIcon ? '' : 'none';
    }
  }

  // Convenience proxies so consumers can poke these without reaching into the DOM
  click() { this._btn?.click(); }
  focus(opts) { this._btn?.focus(opts); }
  blur() { this._btn?.blur(); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-button')) {
  customElements.define('ds-button', DsButton);
}
