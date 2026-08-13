/* =============================================================================
   ds-form-footer — Sticky form action bar (UEMS Design System 3.0).
   Spec: design-system/handoff/FormFooter.md  (Figma node 20025:601543).

   The action bar pinned to the bottom of a form / page: a left status/content
   area and a right-aligned button group. Spans the container width, sits on
   white with an upward elevation shadow (no border). Self-contained surface.

   Composition (reuse, never re-implement): the action buttons are the shared
   <ds-button> component — the footer only owns the sticky bar + layout.

   API (recommended slot model — simpler than mirroring Figma's per-button
   toggle/swap props):
     <ds-form-footer show-left dir="rtl" label="Form actions">
       <span slot="left">Last saved 2 min ago</span>          <!-- or left-text="…" -->
       <ds-button slot="action" variant="tertiary">Reset</ds-button>
       <ds-button slot="action" variant="secondary">Cancel</ds-button>
       <ds-button slot="action" variant="primary">Save</ds-button>
     </ds-form-footer>

   - `show-left` (default true) is the on/off toggle for the whole left area
     (maps 1:1 to Figma's `Show Left Slot`). `show-left="false"` collapses it;
     the button group stays right-aligned.
   - Buttons: pass whatever you need via slot="action" (or the default slot);
     order left→right, Primary trailing. RTL mirrors natively via `dir`.
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
/* Action buttons reuse the shared Button component. */
import '../button/button.js';

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-form-footer-button-css', '../button/button.css');

export class DsFormFooter extends HTMLElement {
  static get observedAttributes() {
    return ['show-left', 'left-text', 'live', 'label', 'dir', 'rtl'];
  }

  connectedCallback() {
    /* Capture consumer children ONCE before the first render — after that,
       this.children are our own generated wrappers. Same pattern as ds-card /
       ds-widget. Actions come from slot="action" OR unmarked default children;
       the left area from slot="left". */
    if (!this._slotsCaptured) {
      this._slottedLeft = [...this.querySelectorAll(':scope > [slot="left"]')];
      this._slottedActions = [...this.children].filter(
        (c) => !this._slottedLeft.includes(c) && c.getAttribute('slot') !== 'left',
      );
      this._slotsCaptured = true;
    }
    this._mounted = true;
    this._render();
    /* Frameworks insert children after upgrade; merge any that leak in and re-home. */
    watchLateChildren(this, (late) => {
      late.forEach((n) => {
        if (n.getAttribute && n.getAttribute('slot') === 'left') this._slottedLeft.push(n);
        else this._slottedActions.push(n);
      });
      this._render();
    });
  }

  disconnectedCallback() {
    stopLateChildren(this);
  }

  attributeChangedCallback() {
    if (this._mounted) this._render();
  }

  _render() {
    const showLeft = this.getAttribute('show-left') !== 'false';
    const leftText = this.getAttribute('left-text') || '';
    const live = boolAttr(this, 'live');
    const rtl = boolAttr(this, 'rtl') || this.getAttribute('dir') === 'rtl';
    const label = this.getAttribute('label') || 'Form actions';

    [...this.classList].forEach((c) => { if (c.startsWith('ds-form-footer')) this.classList.remove(c); });
    this.classList.add('ds-form-footer');
    if (!showLeft) this.classList.add('ds-form-footer--no-left');
    if (rtl) this.setAttribute('dir', 'rtl');

    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', label);

    const left = showLeft
      ? `<div class="ds-form-footer__left" data-slot="left"${live ? ' aria-live="polite"' : ''}></div>`
      : '';
    const actions = '<div class="ds-form-footer__actions" data-slot="action"></div>';

    this.innerHTML = left + actions;

    /* Re-insert (move, not clone) the captured consumer nodes. */
    if (showLeft) {
      const slot = this.querySelector('[data-slot="left"]');
      if (this._slottedLeft.length) this._slottedLeft.forEach((n) => slot.appendChild(n));
      else if (leftText) {
        /* Text node, not raw innerHTML — a status string with `<`/`&` renders literally. */
        const status = document.createElement('span');
        status.className = 'ds-form-footer__status';
        status.textContent = leftText;
        slot.appendChild(status);
      }
    }
    const actionSlot = this.querySelector('[data-slot="action"]');
    this._slottedActions.forEach((n) => actionSlot.appendChild(n));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-form-footer')) {
  customElements.define('ds-form-footer', DsFormFooter);
}
