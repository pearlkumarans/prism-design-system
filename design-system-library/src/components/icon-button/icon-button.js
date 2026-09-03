/* =============================================================================
   <ds-icon-button shape="square" type="primary" size="large" icon="trash" label="Delete">
   </ds-icon-button>

   - Renders a real <button> child, so form/keyboard semantics work natively.
   - `label` is required for accessibility (aria-label).
   - `icon` references a sprite symbol via <ds-icon name="...">.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* An icon-only button shows its `label` as a hover/focus tooltip by default, so
   the component depends on <ds-tooltip>. Import it (register the element) and
   auto-load its CSS so the tooltip works on any page that uses ds-icon-button,
   not just full-bundle pages. */
import '../tooltip/tooltip.js';
import { injectCss } from '../../utils/inject-css.js';
import '../../icons/icon.js';
injectCss('ds-icon-button-tooltip-css', '../tooltip/tooltip.css', import.meta.url);

const SHAPES = ['square', 'circle'];
const TYPES = ['primary', 'secondary', 'tertiary', 'outline', 'danger', 'tertiary-grey'];
const SIZES = ['xl', 'large', 'small', 'xsmall'];
const ICON_PX = { xl: 20, large: 16, small: 12, xsmall: 8 }; /* FIXED per spec — icon swaps can't resize the button */

export class DsIconButton extends HTMLElement {
  static get observedAttributes() {
    return ['shape', 'type', 'size', 'icon', 'label', 'disabled', 'selected', 'tooltip-position', 'no-tooltip'];
  }

  connectedCallback() {
    if (!this._btn) {
      this.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'ds-icon-button';
      btn.type = 'button';
      this.appendChild(btn);
      this._btn = btn;
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._btn) this._sync();
  }

  /* An icon-only button has no visible text, so show its `label` as a tooltip on
     hover/focus (the label already drives aria-label). Wrap/unwrap the button in a
     ds-tooltip reactively so a `label`/`no-tooltip`/`tooltip-position` set AFTER
     upgrade takes effect too (previously the wrapper was decided once at build).
     Skip when `no-tooltip` is set, when there's no label, or when the caller
     already wrapped this button in their own ds-tooltip. */
  _syncTooltip() {
    const label = this.getAttribute('label') || '';
    const ownTip = this._tip && this._tip.parentNode === this;
    const wantTip = !!label && !this.hasAttribute('no-tooltip')
      && (ownTip || !this.closest('ds-tooltip'));
    if (wantTip) {
      if (!this._tip) {
        const tip = document.createElement('ds-tooltip');
        tip.className = 'ds-icon-button__tip';
        tip.setAttribute('show-icon', 'false');
        this.appendChild(tip);
        tip.appendChild(this._btn);   // ds-tooltip re-wires aria-describedby onto the reparented button
        this._tip = tip;
      }
      this._tip.setAttribute('text', label);
      this._tip.setAttribute('position', this.getAttribute('tooltip-position') || 'up-center');
    } else if (this._tip) {
      this.appendChild(this._btn);    // unwrap
      this._tip.remove();
      this._tip = null;
    }
  }

  _sync() {
    const btn = this._btn;
    const shape = enumAttr(this, 'shape', SHAPES, 'square');
    const type = enumAttr(this, 'type', TYPES, 'primary');
    const size = enumAttr(this, 'size', SIZES, 'xl'); /* spec default: XL */
    const icon = this.getAttribute('icon') || '';
    const label = this.getAttribute('label') || '';
    const disabled = boolAttr(this, 'disabled');
    /* `selected` — the PERSISTENT current/checked look (e.g. a toolbar or rail
       icon whose surface is open), distinct from the momentary `:active` press
       state. Exposed as aria-pressed so it is announced as a toggle button. */
    const selected = boolAttr(this, 'selected');

    btn.className = `ds-icon-button ds-icon-button--${shape} ds-icon-button--${type} ds-icon-button--${size}`
      + (selected ? ' ds-icon-button--selected' : '');
    btn.disabled = disabled;
    if (selected) btn.setAttribute('aria-pressed', 'true');
    else btn.removeAttribute('aria-pressed');
    if (label) {
      btn.setAttribute('aria-label', label);
    } else {
      btn.removeAttribute('aria-label');
      // Spec: aria-label is required. An icon-only button with no label has
      // no accessible name. Warn once per element so the developer can fix it.
      if (icon && !this._labelWarned) {
        // eslint-disable-next-line no-console
        console.warn('<ds-icon-button> is missing required `label` attribute — the button has no accessible name. Add label="…" describing the action.', this);
        this._labelWarned = true;
      }
    }
    /* Wrap/unwrap the auto-tooltip reactively (handles a label set after upgrade). */
    this._syncTooltip();

    /* Icon: build the <ds-icon> once and update it via setAttribute — never
       innerHTML. setAttribute escapes the value (no HTML injection from `icon`),
       and reusing the element means an unrelated attribute change (selected /
       disabled / label) no longer destroys + re-upgrades the icon each _sync. */
    if (icon) {
      if (!this._icon) { this._icon = document.createElement('ds-icon'); btn.appendChild(this._icon); }
      if (this._iconName !== icon) { this._icon.setAttribute('name', icon); this._iconName = icon; }
      const px = String(ICON_PX[size]);
      if (this._iconPx !== px) { this._icon.setAttribute('size', px); this._iconPx = px; }
    } else if (this._icon) {
      this._icon.remove();
      this._icon = null; this._iconName = null; this._iconPx = null;
    }
  }

  click() { this._btn?.click(); }
  focus(opts) { this._btn?.focus(opts); }
  blur() { this._btn?.blur(); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-icon-button')) {
  customElements.define('ds-icon-button', DsIconButton);
}
