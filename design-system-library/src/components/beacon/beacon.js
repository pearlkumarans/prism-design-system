/* =============================================================================
   <ds-beacon
     anchor="target-id"           id of the element the beacon attaches to
     placement="top-end"          which CORNER of the anchor the dot sits on:
                                    top-start | top-end | bottom-start | bottom-end
                                    | center-end | center-start
     tip-placement="bottom"       ds-popover placement for the tip
     status="info"                dot colour: info | success | warning | critical |
                                    alert | neutral  (→ ds-status-indicator)
     title="New: bulk actions"    tip heading
     body="Select rows to…"       tip text
     trigger="hover"              hover (default) | click — how the tip opens
     dismissible                  show a "Got it" action that permanently hides it
     persist-key="ec.bulk.v1"     dismiss-once namespace (localStorage)
     rtl></ds-beacon>

   A passive COACH-MARK: an always-visible pulsing dot pinned to a target that
   reveals a tip on hover/click. Self-paced feature discovery — the counterpart to
   the guided ds-tour.

   Reuse-first: the dot is a <ds-status-indicator pulse show-label="false"> and the
   tip is a <ds-popover>. ds-beacon only positions the dot at the anchor corner,
   wires the open/close trigger, and handles dismiss/persistence.

   Methods: show(), hide(), dismiss()   (dismiss = permanent, writes persist-key)
   Events (bubbling):
     - ds-beacon-open
     - ds-beacon-close
     - ds-beacon-dismiss
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { rafThrottle } from '../../utils/raf-throttle.js';
import '../status-indicator/status-indicator.js';
import '../popover/popover.js';

const PLACEMENTS = ['top-start', 'top-end', 'bottom-start', 'bottom-end', 'center-start', 'center-end'];
const STATUSES = ['info', 'success', 'warning', 'critical', 'alert', 'neutral'];
const TRIGGERS = ['hover', 'click'];
const HOVER_CLOSE_DELAY = 160;   // ms grace when moving cursor dot → tip

let _uid = 0;

export class DsBeacon extends HTMLElement {
  static get observedAttributes() { return ['anchor', 'placement', 'status', 'rtl']; }

  constructor() {
    super();
    this._uid = ++_uid;
    this._anchorEl = null;
    this._open = false;
    this._reflow = rafThrottle(() => this._position());
  }

  connectedCallback() {
    if (this.getAttribute('persist-key') && this._isSeen()) { this.hidden = true; return; }
    if (!this._built) { this._build(); this._built = true; }
    this._bindAnchor();
    this._position();
    window.addEventListener('resize', this._reflow, true);
    window.addEventListener('scroll', this._reflow, true);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._reflow, true);
    window.removeEventListener('scroll', this._reflow, true);
    clearTimeout(this._closeTimer);
  }

  attributeChangedCallback(name) {
    if (!this._built) return;
    if (name === 'anchor') this._bindAnchor();
    if (name === 'status') this._dot && this._dot.setAttribute('status', enumAttr(this, 'status', STATUSES, 'info'));
    this._position();
  }

  // ---- public API ---------------------------------------------------------
  show() { this.hidden = false; this._position(); }
  hide() { this._closeTip(); this.hidden = true; }
  dismiss() {
    this._closeTip();
    if (this.getAttribute('persist-key')) this._markSeen();
    this.hidden = true;
    this.dispatchEvent(new CustomEvent('ds-beacon-dismiss', { bubbles: true }));
  }

  // ---- build --------------------------------------------------------------
  _build() {
    const status = enumAttr(this, 'status', STATUSES, 'info');
    const rtl = boolAttr(this, 'rtl');
    this._trigId = `ds-beacon-${this._uid}-trigger`;

    this.innerHTML = `
      <button type="button" class="ds-beacon__trigger" id="${this._trigId}"
              aria-haspopup="dialog" aria-expanded="false">
        <span class="ds-beacon__sr" data-sr></span>
        <ds-status-indicator class="ds-beacon__dot" status="${status}" size="medium"
                             show-label="false" pulse data-dot></ds-status-indicator>
      </button>`;

    this._trigger = this.querySelector('.ds-beacon__trigger');
    this._srEl = this.querySelector('[data-sr]');
    this._dot = this.querySelector('[data-dot]');

    /* Tip popover — anchored to the trigger, built lazily on first open. */
    this._trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (enumAttr(this, 'trigger', TRIGGERS, 'hover') === 'click') this._toggleTip();
      else this._openTip();     // hover mode: click still opens (touch / keyboard)
    });
    this._trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleTip(); }
    });

    if (enumAttr(this, 'trigger', TRIGGERS, 'hover') === 'hover') {
      this._trigger.addEventListener('mouseenter', () => this._openTip());
      this._trigger.addEventListener('mouseleave', () => this._scheduleClose());
    }

    this._syncSr();
  }

  _ensureTip() {
    if (this._tip) return this._tip;
    const rtl = boolAttr(this, 'rtl');
    const pop = document.createElement('ds-popover');
    pop.className = 'ds-beacon__tip';
    pop.setAttribute('anchor', this._trigId);
    pop.setAttribute('placement', this.getAttribute('tip-placement') || 'bottom');
    pop.setAttribute('arrow', '');
    if (this.getAttribute('title')) pop.setAttribute('title', this.getAttribute('title'));
    if (rtl) pop.setAttribute('rtl', '');

    const body = document.createElement('div');
    body.className = 'ds-beacon__tip-body';
    body.textContent = this.getAttribute('body') || '';
    pop.appendChild(body);

    if (boolAttr(this, 'dismissible')) {
      const footSlot = document.createElement('div');
      footSlot.setAttribute('slot', 'footer');
      const got = document.createElement('ds-button');
      got.setAttribute('variant', 'primary');
      got.setAttribute('size', 'small');
      got.setAttribute('label', rtl ? 'حسنًا' : 'Got it');
      got.addEventListener('click', () => this.dismiss());
      footSlot.appendChild(got);
      pop.appendChild(footSlot);
      import('../button/button.js');
    }

    /* Keep the tip open while the cursor is over it (hover mode). */
    pop.addEventListener('mouseenter', () => clearTimeout(this._closeTimer));
    pop.addEventListener('mouseleave', () => this._scheduleClose());
    /* User-dismissed the popover (Esc / outside) → reflect closed state. */
    pop.addEventListener('ds-popover-close', () => this._onTipClosed());

    document.body.appendChild(pop);
    this._tip = pop;
    return pop;
  }

  // ---- tip open/close -----------------------------------------------------
  _openTip() {
    clearTimeout(this._closeTimer);
    if (this._open) return;
    this._open = true;
    this._ensureTip().open();
    this._trigger.setAttribute('aria-expanded', 'true');
    this.dispatchEvent(new CustomEvent('ds-beacon-open', { bubbles: true }));
  }

  _closeTip() {
    if (!this._open) return;
    this._open = false;
    if (this._tip) this._tip.close();
    this._trigger.setAttribute('aria-expanded', 'false');
    this.dispatchEvent(new CustomEvent('ds-beacon-close', { bubbles: true }));
  }

  _toggleTip() { this._open ? this._closeTip() : this._openTip(); }
  _scheduleClose() { clearTimeout(this._closeTimer); this._closeTimer = setTimeout(() => this._closeTip(), HOVER_CLOSE_DELAY); }
  _onTipClosed() {
    /* The popover closed itself (Esc/outside); sync our flag without re-closing. */
    this._open = false;
    this._trigger.setAttribute('aria-expanded', 'false');
  }

  // ---- anchor + positioning ----------------------------------------------
  _bindAnchor() {
    const id = this.getAttribute('anchor');
    this._anchorEl = id ? document.getElementById(id) : null;
  }

  _position() {
    if (this.hidden || !this._trigger) return;
    if (!this._anchorEl) this._bindAnchor();
    const a = this._anchorEl;
    if (!a) return;
    const r = a.getBoundingClientRect();
    const placement = enumAttr(this, 'placement', PLACEMENTS, 'top-end');
    const [vy, hx] = placement.split('-');   // vertical, horizontal

    let x = (hx === 'start') ? r.left : r.right;
    let y = (vy === 'top') ? r.top : (vy === 'center') ? r.top + r.height / 2 : r.bottom;

    const s = this._trigger.getBoundingClientRect();
    /* Centre the dot on the chosen corner. */
    this._trigger.style.left = `${Math.round(x - s.width / 2)}px`;
    this._trigger.style.top = `${Math.round(y - s.height / 2)}px`;
  }

  // ---- helpers ------------------------------------------------------------
  _syncSr() {
    const label = this.getAttribute('title') || this.getAttribute('body') || 'More info';
    if (this._srEl) this._srEl.textContent = boolAttr(this, 'rtl') ? label : label;
    if (this._trigger) this._trigger.setAttribute('aria-label', label);
  }

  _seenStorageKey() { return `uems-beacon-seen:${this.getAttribute('persist-key')}`; }
  _isSeen() { try { return localStorage.getItem(this._seenStorageKey()) === '1'; } catch (_) { return false; } }
  _markSeen() { try { localStorage.setItem(this._seenStorageKey(), '1'); } catch (_) {} }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-beacon')) {
  customElements.define('ds-beacon', DsBeacon);
}
