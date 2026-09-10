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

   Validation message (left side): set `message` + `message-type="error|warning"`
   to show a general form-level error/warning in the left area (icon + colour).
   Clicking the primary/Save button fires `ds-form-footer-submit` so a consumer
   can validate and call `showMessage()` / `clearMessage()`. With `reveal-on-submit`
   a pre-set message stays hidden until that first submit attempt — the "errors
   appear after you press Save" pattern, with no JS required.
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import { escapeHtml } from '../../utils/escape.js';
/* Action buttons reuse the shared Button component; the validation message reuses ds-icon. */
import '../button/button.js';
import '../../icons/icon.js';
import { injectCss } from '../../utils/inject-css.js';

injectCss('ds-form-footer-button-css', '../button/button.css', import.meta.url);

export class DsFormFooter extends HTMLElement {
  static get observedAttributes() {
    return ['show-left', 'left-text', 'live', 'label', 'dir', 'rtl', 'message', 'message-type', 'reveal-on-submit'];
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
    /* One delegated click listener (on the host, not the buttons) detects the
       primary/Save press without re-binding on every re-render. */
    if (!this._onClick) this._onClick = (e) => this._maybeSubmit(e);
    this.addEventListener('click', this._onClick);
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
    if (this._onClick) this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    /* label / live / rtl / dir are visual-only: patch the host aria + dir and the
       left area's aria-live in place, so the slotted action buttons (and the left
       content) are NOT detached and re-appended. show-left / left-text change
       which nodes exist, so they full-render. */
    if (name === 'label' || name === 'live' || name === 'rtl' || name === 'dir') this._paintChrome();
    else if (name === 'message' || name === 'message-type') {
      /* Repaint the message in place when the left area already exists (keeps
         the action buttons — and their focus — intact); otherwise the left area
         must be created, so full-render. */
      if (this.querySelector(':scope > .ds-form-footer__left')) this._paintMessage();
      else this._render();
    } else this._render(); // show-left / left-text / reveal-on-submit
  }

  /* Host chrome (dir / role / aria-label) + the left area's aria-live, patched in
     place — never reassigns innerHTML, so the slotted actions keep node identity.
     Mirrors _render's chrome exactly (same guards, so a `label` change is a no-op
     once aria-label is set, matching the full-render path). */
  _paintChrome() {
    const live = boolAttr(this, 'live');
    const rtl = boolAttr(this, 'rtl') || this.getAttribute('dir') === 'rtl';
    const label = this.getAttribute('label') || 'Form actions';

    /* Guard the same-value set: `dir` is observed, and setAttribute fires
       attributeChangedCallback even when the value is unchanged — so an
       unguarded write here re-enters this paint forever. Same fix ds-card and
       ds-widget already carry. */
    if (rtl && this.getAttribute('dir') !== 'rtl') this.setAttribute('dir', 'rtl');
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', label);

    const left = this.querySelector(':scope > .ds-form-footer__left');
    if (left) {
      if (live) left.setAttribute('aria-live', 'polite');
      else left.removeAttribute('aria-live');
    }
  }

  _render() {
    const showLeft = this.getAttribute('show-left') !== 'false';
    const leftText = this.getAttribute('left-text') || '';
    const live = boolAttr(this, 'live');
    const rtl = boolAttr(this, 'rtl') || this.getAttribute('dir') === 'rtl';
    const label = this.getAttribute('label') || 'Form actions';

    /* A visible validation message forces the left area on even when show-left
       is off — a form-level error must never be hidden. */
    const messageVisible = this._messageVisible();
    const showLeftArea = showLeft || messageVisible;

    [...this.classList].forEach((c) => { if (c.startsWith('ds-form-footer')) this.classList.remove(c); });
    this.classList.add('ds-form-footer');
    if (!showLeft) this.classList.add('ds-form-footer--no-left');
    if (messageVisible) this.classList.add('ds-form-footer--has-message');
    /* Guarded for the same reason as the chrome paint above. */
    if (rtl && this.getAttribute('dir') !== 'rtl') this.setAttribute('dir', 'rtl');

    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', label);

    const left = showLeftArea
      ? `<div class="ds-form-footer__left"${live ? ' aria-live="polite"' : ''}>`
        + '<div class="ds-form-footer__content" data-slot="left"></div>'
        + this._messageMarkup()
        + '</div>'
      : '';
    const actions = '<div class="ds-form-footer__actions" data-slot="action"></div>';

    this.innerHTML = left + actions;

    /* Re-insert (move, not clone) the captured consumer nodes into the content
       wrapper — only when the left content itself is meant to show. */
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

  /* ── Validation message (left side) ───────────────────────────────── */
  _messageType() {
    return this.getAttribute('message-type') === 'warning' ? 'warning' : 'error';
  }

  _messageVisible() {
    if (!this.getAttribute('message')) return false;
    if (boolAttr(this, 'reveal-on-submit') && !this._submitted) return false;
    return true;
  }

  _messageMarkup() {
    const type = this._messageType();
    const icon = type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle';
    const msg = this.getAttribute('message') || '';
    return `<div class="ds-form-footer__message ds-form-footer__message--${type}" role="alert" aria-live="assertive">`
      + `<ds-icon class="ds-form-footer__message-icon" name="${icon}" size="16" aria-hidden="true"></ds-icon>`
      + `<span class="ds-form-footer__message-text">${escapeHtml(msg)}</span>`
      + '</div>';
  }

  /* In-place message update — never touches the actions, so button focus and
     node identity survive (the same reason the primary-click reveal is smooth). */
  _paintMessage() {
    const left = this.querySelector(':scope > .ds-form-footer__left');
    if (!left) { this._render(); return; }
    const type = this._messageType();
    const icon = type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle';
    const msg = this.getAttribute('message') || '';
    let message = left.querySelector('.ds-form-footer__message');
    if (!message) {
      left.insertAdjacentHTML('beforeend', this._messageMarkup());
    } else {
      message.className = `ds-form-footer__message ds-form-footer__message--${type}`;
      message.querySelector('.ds-form-footer__message-text').textContent = msg;
      const ic = message.querySelector('.ds-form-footer__message-icon');
      if (ic) ic.setAttribute('name', icon);
    }
    this.classList.toggle('ds-form-footer--has-message', this._messageVisible());
  }

  /* The primary/Save button = an explicit ds-button[variant="primary"] (or
     [data-primary] / submit button), else the trailing action button. */
  _primaryButton() {
    const actions = this.querySelector(':scope > .ds-form-footer__actions');
    if (!actions) return null;
    return actions.querySelector('ds-button[variant="primary"]')
      || actions.querySelector('[data-primary]')
      || actions.querySelector('button[type="submit"]')
      || [...actions.querySelectorAll('ds-button, button')].pop()
      || null;
  }

  _maybeSubmit(e) {
    const primary = this._primaryButton();
    if (!primary) return;
    const hit = primary === e.target || primary.contains(e.target)
      || (e.composedPath && e.composedPath().includes(primary));
    if (!hit) return;
    this._submitted = true;
    this.dispatchEvent(new CustomEvent('ds-form-footer-submit', {
      bubbles: true, composed: true,
      detail: { message: this.getAttribute('message') || '', messageType: this._messageType() },
    }));
    /* Reveal a pre-set (reveal-on-submit) message now that a submit was attempted. */
    if (this._messageVisible()) {
      if (this.querySelector(':scope > .ds-form-footer__left')) this._paintMessage();
      else this._render();
    }
  }

  /* ── Public message API ───────────────────────────────────────────── */
  get message() { return this.getAttribute('message') || ''; }
  set message(v) { if (v == null || v === '') this.removeAttribute('message'); else this.setAttribute('message', String(v)); }
  get messageType() { return this._messageType(); }
  set messageType(v) { this.setAttribute('message-type', v === 'warning' ? 'warning' : 'error'); }

  /* Imperative show forces visibility even under reveal-on-submit. */
  showMessage(text, type = 'error') {
    this._submitted = true;
    this.setAttribute('message-type', type === 'warning' ? 'warning' : 'error');
    this.setAttribute('message', String(text));
  }

  clearMessage() { this.removeAttribute('message'); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-form-footer')) {
  customElements.define('ds-form-footer', DsFormFooter);
}
