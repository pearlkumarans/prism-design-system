/* =============================================================================
   <ds-tour
     persist-key="ec.deploy.v1"    seen-flag namespace (localStorage + events)
     mask="dim"                    dim | light | blur | dim-blur | none  (→ ds-overlay)
     auto-start                    run once per persist-key on connect (if unseen)
     linear                        (reserved) lock skipping ahead
     rtl></ds-tour>

   Guided page-tour orchestrator. The host is an invisible CONTROLLER — it renders
   nothing itself. It walks a `steps[]` array, composing existing Prism surfaces:

     · anchored step (step.target)  → <ds-popover> + a <ds-overlay> backdrop
     · centered step  (target null) → <ds-modal> (its own scrim)

   The step card's chrome — focus trap, Esc, focus-restore, positioning, arrow — is
   inherited from ds-popover / ds-modal; this component adds sequencing, progress,
   persistence, a11y announcements, and keyboard steering.

   Steps (set via the `.steps` property; may be set before upgrade):
     {
       target:    '#id' | Element | null,   // null → centered modal
       title:     string,
       body:      string,
       placement: 'bottom-start' | …,        // popover placement (anchored only)
       primaryLabel: string,                 // override 'Next'/'Done' on this step
       showSkip:  boolean (default true),
     }

   Methods: start(fromIndex=0), next(), prev(), goTo(i), end({ completed })
   Events (bubbling — analytics + backend seen-state hooks):
     - ds-tour-start
     - ds-tour-step      detail: { index, total, step }
     - ds-tour-complete
     - ds-tour-skip
     - ds-tour-end       detail: { completed }
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../overlay/overlay.js';
import '../popover/popover.js';
import '../modal/modal.js';
import '../button/button.js';
import '../text-link/text-link.js';

const MASKS = ['dim', 'light', 'blur', 'dim-blur', 'none'];

/* Built-in control strings. Consumers override any of them via the `labels`
   property (for i18n); otherwise `rtl` picks the Arabic defaults. */
const LABELS_LTR = { skip: 'Skip tour', back: 'Back', next: 'Next', done: 'Done', of: 'of', hint: 'Try it to continue' };
const LABELS_RTL = { skip: 'تخطّي', back: 'رجوع', next: 'التالي', done: 'تم', of: 'من', hint: 'جرّبه للمتابعة' };

let _uid = 0;

export class DsTour extends HTMLElement {
  static get observedAttributes() { return ['mask', 'rtl']; }

  constructor() {
    super();
    this._uid = ++_uid;
    this._steps = [];
    this._index = -1;
    this._running = false;
    this._surface = null;
    this._backdrop = null;
    this._live = null;
    this._onSurfaceClose = null;
    /* Bound once so add/removeEventListener match. */
    this._onKey = (e) => this._handleKey(e);
    /* Support `.steps` assigned before the element upgraded. */
    if (Object.prototype.hasOwnProperty.call(this, 'steps')) {
      const v = this.steps; delete this.steps; this._steps = Array.isArray(v) ? v : [];
    }
  }

  connectedCallback() {
    /* The host is a controller, not a visible surface. */
    this.hidden = true;
    if (boolAttr(this, 'auto-start')) {
      const key = this.getAttribute('persist-key');
      if (key && this._isSeen()) return;
      /* Defer so late-mounted targets exist before the first anchored step. */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (this.isConnected && !this._running) this.start();
      }));
    }
  }

  disconnectedCallback() { if (this._running) this._teardown(); this._running = false; }

  attributeChangedCallback(name) {
    if (name === 'mask' && this._backdrop) {
      this._backdrop.setAttribute('type', enumAttr(this, 'mask', MASKS, 'dim'));
    }
  }

  // ---- steps property -----------------------------------------------------
  get steps() { return this._steps; }
  set steps(v) { this._steps = Array.isArray(v) ? v : []; }

  // ---- labels property (i18n override) ------------------------------------
  get labels() { return this._labels || {}; }
  set labels(v) { this._labels = (v && typeof v === 'object') ? v : null; }

  _label(key) {
    if (this._labels && this._labels[key] != null) return this._labels[key];
    return (this._rtl() ? LABELS_RTL : LABELS_LTR)[key];
  }

  // ---- public API ---------------------------------------------------------
  start(from = 0) {
    if (this._running || !this._steps.length) return;
    this._running = true;
    this._ensureLive();
    document.addEventListener('keydown', this._onKey, true);
    this.dispatchEvent(new CustomEvent('ds-tour-start', { bubbles: true }));
    this.goTo(from);
  }

  next() {
    if (!this._running) return;
    if (this._index >= this._steps.length - 1) this.end({ completed: true });
    else this.goTo(this._index + 1);
  }

  prev() { if (this._running && this._index > 0) this.goTo(this._index - 1); }

  goTo(i) {
    if (!this._running) return;
    i = Math.max(0, Math.min(i, this._steps.length - 1));
    this._teardownSurface();
    this._index = i;
    const step = this._steps[i] || {};
    this._showStep(step);
    this.dispatchEvent(new CustomEvent('ds-tour-step', {
      bubbles: true, detail: { index: i, total: this._steps.length, step },
    }));
    this._announce(`Step ${i + 1} of ${this._steps.length}: ${step.title || ''}`);
  }

  end(opts = {}) {
    if (!this._running) return;
    const completed = !!opts.completed;
    this._teardown();
    this._running = false;
    this._index = -1;
    /* Skipping or completing both mark the tour seen, so auto-start won't re-nag;
       consumers that want finer control can act on the distinct events. */
    if (this.getAttribute('persist-key')) this._markSeen();
    this.dispatchEvent(new CustomEvent(completed ? 'ds-tour-complete' : 'ds-tour-skip', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('ds-tour-end', { bubbles: true, detail: { completed } }));
  }

  // ---- step rendering -----------------------------------------------------
  _showStep(step) {
    const targetEl = this._resolveTarget(step.target);
    if (targetEl) this._showAnchored(step, targetEl);
    else this._showCentered(step);      // no target (or missing) → centered
  }

  _resolveTarget(target) {
    if (!target) return null;
    if (target instanceof Element) return target.isConnected ? target : null;
    try { return document.querySelector(target); } catch (_) { return null; }
  }

  /* Bring the target into view. A live backdrop locks body scroll (overflow:hidden),
     which would block scrollIntoView on an anchored→anchored transition — so lift
     the lock around an instant scroll, then restore it. Instant (not smooth) keeps
     it reliable while the lock is briefly off; reduced-motion wants instant anyway. */
  _scrollIntoView(targetEl) {
    const body = document.body;
    const locked = body.style.overflow === 'hidden';
    if (locked) body.style.overflow = '';
    try { targetEl.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' }); } catch (_) {}
    if (locked) body.style.overflow = 'hidden';
  }

  _showAnchored(step, targetEl) {
    this._scrollIntoView(targetEl);
    if (!targetEl.id) targetEl.id = `ds-tour-target-${this._uid}-${this._index}`;

    this._ensureBackdrop();
    /* Spotlight the target: dim everything except its rect (P2). ds-overlay owns
       the cutout + ring and re-pins them on scroll/resize. */
    if (this._backdrop && this._backdrop.spotlight) {
      const pad = step.spotlightPadding != null ? step.spotlightPadding : 8;
      this._backdrop.spotlight(targetEl, { padding: pad, radius: 8 });
    }

    const pop = document.createElement('ds-popover');
    pop.className = 'ds-tour__pop';
    pop.setAttribute('anchor', targetEl.id);
    pop.setAttribute('placement', step.placement || 'bottom-start');
    pop.setAttribute('arrow', '');
    pop.setAttribute('title', step.title || '');
    if (this._rtl()) pop.setAttribute('rtl', '');

    pop.appendChild(this._buildBody(step));
    const footSlot = document.createElement('div');
    footSlot.setAttribute('slot', 'footer');
    footSlot.appendChild(this._buildFooter(step));
    pop.appendChild(footSlot);

    document.body.appendChild(pop);
    this._surface = pop;
    this._bindSurfaceClose(pop, 'ds-popover-close');
    pop.open();

    /* Interactive step: advance when the user performs the real action on the
       target (the spotlight cutout already makes it click-through). Next still
       works as an escape hatch. */
    if (step.advanceOn) this._bindAdvance(targetEl, step.advanceOn);
  }

  _bindAdvance(targetEl, evt) {
    this._advanceTarget = targetEl;
    this._advanceEvent = evt;
    this._advanceHandler = () => this.next();
    targetEl.addEventListener(evt, this._advanceHandler, { once: true });
  }

  _unbindAdvance() {
    if (this._advanceTarget && this._advanceHandler) {
      this._advanceTarget.removeEventListener(this._advanceEvent, this._advanceHandler);
    }
    this._advanceTarget = this._advanceHandler = this._advanceEvent = null;
  }

  _showCentered(step) {
    this._removeBackdrop();     // modal carries its own scrim — avoid double-dim

    const modal = document.createElement('ds-modal');
    modal.className = 'ds-tour__modal';
    modal.setAttribute('size', 'sm');
    modal.setAttribute('title', step.title || '');
    if (step.body) modal.setAttribute('description', step.body);
    if (this._rtl()) modal.setAttribute('rtl', '');

    /* Progress in the body, skip on the footer-start link, Back/Next on the right. */
    const body = document.createElement('div');
    body.appendChild(this._buildProgress());
    modal.appendChild(body);

    const ctl = this._buildControlParts(step);
    if (ctl.skip) { ctl.skip.setAttribute('slot', 'footer-start'); modal.appendChild(ctl.skip); }
    const foot = document.createElement('div');
    foot.setAttribute('slot', 'footer');
    if (ctl.back) foot.appendChild(ctl.back);
    foot.appendChild(ctl.next);
    modal.appendChild(foot);

    document.body.appendChild(modal);
    this._surface = modal;
    this._bindSurfaceClose(modal, 'ds-modal-close');
    modal.open();
  }

  // ---- card content -------------------------------------------------------
  _buildBody(step) {
    const body = document.createElement('div');
    body.className = 'ds-tour__body';
    if (step.body) {
      const p = document.createElement('p');
      p.className = 'ds-tour__text';
      p.textContent = step.body;
      body.appendChild(p);
    }
    if (step.advanceOn) {
      const hint = document.createElement('p');
      hint.className = 'ds-tour__hint';
      hint.textContent = step.hint || this._label('hint');
      body.appendChild(hint);
    }
    return body;
  }

  _buildFooter(step) {
    const footer = document.createElement('div');
    footer.className = 'ds-tour__footer';
    footer.appendChild(this._buildProgress());
    const ctl = this._buildControlParts(step);
    const actions = document.createElement('div');
    actions.className = 'ds-tour__actions';
    if (ctl.skip) actions.appendChild(ctl.skip);
    const spacer = document.createElement('span');
    spacer.className = 'ds-tour__spacer';
    actions.appendChild(spacer);
    if (ctl.back) actions.appendChild(ctl.back);
    actions.appendChild(ctl.next);
    footer.appendChild(actions);
    return footer;
  }

  /* Shared Skip / Back / Next controls (composed from ds-text-link + ds-button). */
  _buildControlParts(step) {
    const isFirst = this._index === 0;
    const isLast = this._index === this._steps.length - 1;

    let skip = null;
    if (step.showSkip !== false && !isLast) {
      skip = document.createElement('ds-text-link');
      skip.className = 'ds-tour__skip';
      skip.setAttribute('variant', 'secondary');
      skip.setAttribute('size', 'small');
      skip.setAttribute('href', '#');
      skip.textContent = this._label('skip');
      skip.addEventListener('click', (e) => { e.preventDefault(); this.end({ completed: false }); });
    }

    let back = null;
    if (!isFirst) {
      back = document.createElement('ds-button');
      back.className = 'ds-tour__back';
      back.setAttribute('variant', 'secondary');
      back.setAttribute('size', 'small');
      back.setAttribute('label', this._label('back'));
      back.addEventListener('click', () => this.prev());
    }

    const next = document.createElement('ds-button');
    next.className = 'ds-tour__next';
    next.setAttribute('variant', 'primary');
    next.setAttribute('size', 'small');
    const nextLabel = step.primaryLabel || (isLast ? this._label('done') : this._label('next'));
    next.setAttribute('label', nextLabel);
    if (!isLast) next.setAttribute('suffix-icon', 'arrow-narrow-right');
    next.addEventListener('click', () => this.next());

    return { skip, back, next };
  }

  _buildProgress() {
    const total = this._steps.length;
    const wrap = document.createElement('div');
    wrap.className = 'ds-tour__progress';
    const dots = document.createElement('div');
    dots.className = 'ds-tour__dots';
    dots.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < total; i++) {
      const d = document.createElement('span');
      d.className = 'ds-tour__dot'
        + (i < this._index ? ' is-done' : '')
        + (i === this._index ? ' is-current' : '');
      dots.appendChild(d);
    }
    const label = document.createElement('span');
    label.className = 'ds-tour__count';
    label.textContent = `${this._index + 1} ${this._label('of')} ${total}`;
    wrap.appendChild(dots);
    wrap.appendChild(label);
    return wrap;
  }

  // ---- backdrop / live region ---------------------------------------------
  _ensureBackdrop() {
    const mask = enumAttr(this, 'mask', MASKS, 'dim');
    if (mask === 'none') { this._removeBackdrop(); return; }
    if (!this._backdrop) {
      const ov = document.createElement('ds-overlay');
      ov.className = 'ds-tour__backdrop';
      ov.setAttribute('type', mask);
      ov.setAttribute('static', '');   // clicking the scrim does nothing (use Skip/Esc)
      ov.setAttribute('open', '');
      document.body.appendChild(ov);
      this._backdrop = ov;
    } else {
      this._backdrop.setAttribute('type', mask);
    }
  }

  _removeBackdrop() {
    if (this._backdrop) { this._backdrop.remove(); this._backdrop = null; }
  }

  _ensureLive() {
    if (this._live) return;
    const el = document.createElement('div');
    el.className = 'ds-tour__sr';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    document.body.appendChild(el);
    this._live = el;
  }

  _announce(msg) {
    if (!this._live) return;
    this._live.textContent = '';
    requestAnimationFrame(() => { if (this._live) this._live.textContent = msg; });
  }

  // ---- teardown -----------------------------------------------------------
  _teardownSurface() {
    this._unbindAdvance();
    if (!this._surface) return;
    if (this._onSurfaceClose) {
      this._surface.removeEventListener('ds-popover-close', this._onSurfaceClose);
      this._surface.removeEventListener('ds-modal-close', this._onSurfaceClose);
    }
    /* Remove (disconnect) rather than close(): advancing shouldn't fire a
       user-dismiss, and disconnectedCallback cleans the surface's own listeners. */
    this._surface.remove();
    this._surface = null;
    this._onSurfaceClose = null;
  }

  _teardown() {
    document.removeEventListener('keydown', this._onKey, true);
    this._teardownSurface();
    this._removeBackdrop();
    if (this._live) { this._live.remove(); this._live = null; }
  }

  /* A surface dismissed BY THE USER (Esc / overlay / ✕) fires its close event with
     a `detail.reason`; our own programmatic teardown fires none. So reason-present
     == user wants out == skip. */
  _bindSurfaceClose(surface, evt) {
    this._onSurfaceClose = (e) => { if (e.detail && e.detail.reason) this.end({ completed: false }); };
    surface.addEventListener(evt, this._onSurfaceClose);
  }

  // ---- keyboard steering (Esc/Tab are owned by the surface) ---------------
  _handleKey(e) {
    if (!this._running) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    const rtl = this._rtl();
    if (e.key === 'ArrowRight') { e.preventDefault(); rtl ? this.prev() : this.next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); rtl ? this.next() : this.prev(); }
  }

  // ---- persistence + helpers ----------------------------------------------
  _seenStorageKey() { return `uems-tour-seen:${this.getAttribute('persist-key')}`; }
  _isSeen() { try { return localStorage.getItem(this._seenStorageKey()) === '1'; } catch (_) { return false; } }
  _markSeen() { try { localStorage.setItem(this._seenStorageKey(), '1'); } catch (_) {} }

  _rtl() { return boolAttr(this, 'rtl'); }
  _reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-tour')) {
  customElements.define('ds-tour', DsTour);
}
