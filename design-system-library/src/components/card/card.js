/* =============================================================================
   ds-card — Generic content surface (UEMS Design System 3.0).
   Spec: design-system/handoff/card.md  (Figma node 21949:806025).

   The "everything container": swap `type` for the surface treatment, drop
   anything into the default slot for the body, and you get a KPI card, a
   settings panel, a list card, or a chart card from the same component.
   Self-contained surface — owns its own background/border/shadow/radius,
   same contract as ds-kpi-card.

   API:
     <ds-card
       type="elevated|outlined|filled|plain"   <!-- default elevated -->
       size="small|medium|large"               <!-- default medium -->
       title="Card title" subtitle="Supporting subtitle"
       show-leading-icon leading-icon="info-circle"   <!-- badge, default on -->
       show-subtitle show-header-action
       show-body show-footer
       footer-label="Action" footer-href="#"
       show-media selected disabled dir="rtl">
       <ds-icon slot="leading-icon" name="folder"></ds-icon>   <!-- or leading-icon="" -->
       <ds-icon-button slot="header-action" ...></ds-icon-button>  <!-- default: auto ds-icon-button -->
       <img slot="media" src="…" alt="">
       <!-- default slot = Body content: text, ds-chart, a list, a table, anything -->
     </ds-card>

   Synced to Figma v2 (node 21949:806025): leading icon-badge, no header/footer
   dividers, show-body toggle. Header/footer are the _Card Header / _Card Footer
   base parts in Figma.

   Card is a static container — no click/keyboard behavior on the card frame
   itself. `selected` is a visual accent ring only (driven by a parent list
   marking a card chosen), not a click state. Only the footer link (and
   whatever's in the default slot) is interactive.

   Events: ds-card-action { href }         — footer action link activated.
           ds-card-header-action           — header icon-button activated.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import '../../icons/icon.js';
/* Header action + footer action reuse shared components — never custom markup:
   the header "more" control is <ds-icon-button>, the footer link <ds-text-link>. */
import '../icon-button/icon-button.js';
import '../text-link/text-link.js';

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-card-icon-button-css', '../icon-button/icon-button.css');
_injectCss('ds-card-text-link-css', '../text-link/text-link.css');

const TYPES = ['elevated', 'outlined', 'filled', 'plain'];
const SIZES = ['small', 'medium', 'large'];

export class DsCard extends HTMLElement {
  static get observedAttributes() {
    return [
      'title', 'type', 'size', 'subtitle', 'show-subtitle',
      'show-leading-icon', 'leading-icon',
      'show-header-action', 'icon',
      'show-body', 'show-footer', 'footer-label', 'footer-href',
      'show-media', 'selected', 'disabled', 'dir', 'rtl',
    ];
  }

  connectedCallback() {
    /* Capture consumer-provided children ONCE, before the very first render —
       after that, `this.children` are this component's OWN generated markup
       (header/body/footer wrappers), not the original slotted content, since
       `_render()` moves real content inside those wrappers. Re-querying
       `this.children` on every render would misidentify our own internal
       divs as "content to preserve" from the second render onward. */
    if (!this._slotsCaptured) {
      this._slottedLeadingIcon = this.querySelector(':scope > [slot="leading-icon"]') || null;
      this._slottedHeaderAction = this.querySelector(':scope > [slot="header-action"]') || null;
      this._slottedMedia = this.querySelector(':scope > [slot="media"]') || null;
      this._slottedContent = [...this.children].filter((c) => !c.hasAttribute('slot'));
      this._slotsCaptured = true;
    }
    this._mounted = true;
    this._render();
    /* Frameworks insert children after upgrade; merge any that leak in and re-home. */
    watchLateChildren(this, (late) => {
      late.forEach((n) => {
        const s = n.getAttribute && n.getAttribute('slot');
        if (s === 'leading-icon') this._slottedLeadingIcon = n;
        else if (s === 'header-action') this._slottedHeaderAction = n;
        else if (s === 'media') this._slottedMedia = n;
        else this._slottedContent.push(n);
      });
      this._render();
    });
  }

  disconnectedCallback() {
    stopLateChildren(this);
  }
  attributeChangedCallback(name, oldVal, newVal) {
    /* `title` collides with the native HTML tooltip attribute — left on the
       host, the browser shows an unwanted hover tooltip over the whole card.
       Capture the text once, then strip the DOM attribute; `_render()` reads
       the cached value instead of the (now absent) attribute. The strip
       re-enters this callback with newVal === null, which falls through to
       the normal re-render below. */
    if (name === 'title' && newVal != null) {
      this._titleText = newVal;
      this.removeAttribute('title');
      return;
    }
    if (this._mounted) this._render();
  }

  _render() {
    const type = enumAttr(this, 'type', TYPES, 'elevated');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const title = this._titleText || '';
    const subtitle = this.getAttribute('subtitle') || '';
    const showSubtitle = this.getAttribute('show-subtitle') !== 'false';
    const showLeadingIcon = this.getAttribute('show-leading-icon') !== 'false';
    const leadingIcon = this.getAttribute('leading-icon') || 'info-circle';
    const showHeaderAction = this.getAttribute('show-header-action') !== 'false';
    const showBody = this.getAttribute('show-body') !== 'false';
    const showFooter = this.getAttribute('show-footer') !== 'false';
    const footerLabel = this.getAttribute('footer-label') || 'Action';
    const footerHref = this.getAttribute('footer-href') || '#';
    const showMedia = boolAttr(this, 'show-media');
    const selected = boolAttr(this, 'selected');
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl') || this.getAttribute('dir') === 'rtl';
    const icon = this.getAttribute('icon') || 'more-vertical';

    [...this.classList].forEach((c) => { if (c.startsWith('ds-card')) this.classList.remove(c); });
    this.classList.add('ds-card', `ds-card--${type}`, `ds-card--${size}`);
    if (selected) this.classList.add('ds-card--selected');
    if (disabled) this.classList.add('ds-card--disabled');
    if (rtl) this.setAttribute('dir', 'rtl');

    if (disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (title && !this.hasAttribute('aria-label')) this.setAttribute('aria-label', title);

    const media = `<div class="ds-card__media" data-slot="media"></div>`;

    const header = `
      <div class="ds-card__header">
        ${showLeadingIcon ? '<span class="ds-card__leading" data-slot="leading-icon" aria-hidden="true"></span>' : ''}
        <div class="ds-card__header-text">
          ${title ? `<h3 class="ds-card__title">${title}</h3>` : ''}
          ${subtitle && showSubtitle ? `<p class="ds-card__subtitle">${subtitle}</p>` : ''}
        </div>
        ${showHeaderAction ? '<span class="ds-card__header-action" data-slot="header-action"></span>' : ''}
      </div>`;

    const body = showBody ? `<div class="ds-card__body" data-slot="content"></div>` : '';

    const footer = showFooter ? `
      <div class="ds-card__footer">
        <ds-text-link variant="primary" size="medium" href="${footerHref}" data-footer-action>${footerLabel}</ds-text-link>
      </div>` : '';

    const selectedOverlay = `<div class="ds-card__selected-ring" aria-hidden="true"></div>`;

    this.innerHTML = (showMedia ? media : '') + header + body + footer + selectedOverlay;

    // Re-insert (move, not clone) the cached consumer-provided nodes.
    if (showMedia) {
      const slot = this.querySelector('[data-slot="media"]');
      if (this._slottedMedia) slot.appendChild(this._slottedMedia);
      else slot.innerHTML = '<div class="ds-card__media-placeholder"></div>';
    }
    if (showLeadingIcon) {
      const slot = this.querySelector('[data-slot="leading-icon"]');
      if (this._slottedLeadingIcon) slot.appendChild(this._slottedLeadingIcon);
      else slot.innerHTML = `<ds-icon name="${leadingIcon}" size="20"></ds-icon>`;
    }
    if (showHeaderAction) {
      const slot = this.querySelector('[data-slot="header-action"]');
      if (this._slottedHeaderAction) slot.appendChild(this._slottedHeaderAction);
      else slot.innerHTML = `<ds-icon-button type="tertiary-grey" size="xl" icon="${icon}" label="More" no-tooltip data-header-action></ds-icon-button>`;
    }
    const contentSlot = this.querySelector('[data-slot="content"]');
    if (contentSlot) {
      if (this._slottedContent.length) {
        this._slottedContent.forEach((n) => contentSlot.appendChild(n));
      } else {
        contentSlot.innerHTML = '<p class="ds-card__default-content">Card body content. Slot anything here — text, a chart, list, or table.</p>';
      }
    }

    this.querySelector('[data-header-action]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-card-header-action', { bubbles: true }));
    });
    this.querySelector('[data-footer-action]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-card-action', { bubbles: true, detail: { href: footerHref } }));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-card')) {
  customElements.define('ds-card', DsCard);
}
