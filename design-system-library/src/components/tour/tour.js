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
import '../tooltip/tooltip.js';

const MASKS = ['dim', 'light', 'blur', 'dim-blur', 'none'];
const CARD_SIZES = ['small', 'medium', 'large'];
const CORNERS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

/* Built-in control strings. Consumers override any of them via the `labels`
   property (for i18n); otherwise `rtl` picks the Arabic defaults. */
const LABELS_LTR = { skip: 'Skip tour', close: 'Close', back: 'Back', next: 'Next', done: 'Done', of: 'of', hint: 'Try it to continue', learnMore: 'Learn more' };
const LABELS_RTL = { skip: 'تخطّي', close: 'إغلاق', back: 'رجوع', next: 'التالي', done: 'تم', of: 'من', hint: 'جرّبه للمتابعة', learnMore: 'اعرف المزيد' };

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
    this._maybeAutoStart();
  }

  /* Fire the one-shot `auto-start` once BOTH the attribute and steps are in
     place. connectedCallback and the `steps` setter each call this, so it works
     regardless of order — the common case being a deferred ES module that sets
     `.steps` a tick after the element connects, which would otherwise race the
     auto-start and silently no-op. `_autoStarted` guards a double fire. */
  _maybeAutoStart() {
    if (this._autoStarted || this._running) return;
    if (!this.isConnected || !boolAttr(this, 'auto-start')) return;
    const key = this.getAttribute('persist-key');
    if (key && this._isSeen()) return;
    if (!this._steps.length) return;   // steps not set yet — the setter retries
    this._autoStarted = true;
    /* Defer so late-mounted targets exist before the first anchored step. rAF
       gives the clean two-frame wait when the tab is visible; a timeout is the
       fallback for a page that loads in a BACKGROUND tab (rAF is paused while
       the tab is hidden) so the announcement still arrives. First one wins. */
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      if (this.isConnected && !this._running) this.start();
    };
    requestAnimationFrame(() => requestAnimationFrame(go));
    setTimeout(go, 200);
  }

  disconnectedCallback() { if (this._running) this._teardown(); this._running = false; }

  attributeChangedCallback(name) {
    if (name === 'mask' && this._backdrop) {
      this._backdrop.setAttribute('type', enumAttr(this, 'mask', MASKS, 'dim'));
    }
  }

  // ---- steps property -----------------------------------------------------
  get steps() { return this._steps; }
  set steps(v) { this._steps = Array.isArray(v) ? v : []; this._maybeAutoStart(); }

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
    const info = this._progressInfo();
    this._announce(info
      ? `Step ${info.pos + 1} of ${info.total}: ${step.title || ''}`
      : (step.title || ''));
  }

  end(opts = {}) {
    if (!this._running) return;
    const completed = !!opts.completed;
    /* `remindLater` = a soft "not now" (e.g. "I'll do it later") that must NOT
       persist the seen flag, so the tour surfaces again next time. Completing or a
       definitive skip (✕ / Esc) still mark it seen so auto-start won't re-nag. */
    const remindLater = !!opts.remindLater;
    this._teardown();
    this._running = false;
    this._index = -1;
    if (!remindLater && this.getAttribute('persist-key')) this._markSeen();
    this.dispatchEvent(new CustomEvent(completed ? 'ds-tour-complete' : 'ds-tour-skip', { bubbles: true, detail: { remindLater } }));
    this.dispatchEvent(new CustomEvent('ds-tour-end', { bubbles: true, detail: { completed, remindLater } }));
  }

  // ---- step rendering -----------------------------------------------------
  _showStep(step) {
    const targetEl = this._resolveTarget(step.target);
    if (targetEl) this._showAnchored(step, targetEl);
    else if (step.corner) this._showCorner(step);   // target-less corner announcement
    else this._showCentered(step);                  // no target (or missing) → centered
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

  /* Shared card popover: class + size + spotlight + plain-header title + body +
     footer. Anchor / placement / arrow / corner are set by the caller (per mode). */
  _buildCardPopover(step, defaultSize = 'medium') {
    const pop = document.createElement('ds-popover');
    pop.className = 'ds-tour__pop';
    /* Single-step = feature spotlight: full-width action + no footer divider. */
    if (this._steps.length === 1) pop.classList.add('ds-tour__pop--spotlight');
    /* Card width: small | medium | large. Anchored steps default medium; the
       corner announcement defaults large (passed in). A step's own `size` wins. */
    const size = CARD_SIZES.includes(step.size) ? step.size : defaultSize;
    if (size !== 'medium') pop.classList.add(`ds-tour__pop--${size}`);
    /* Feature spotlight WITH an image → media-top layout: the hero spans the top,
       the ✕ floats over it, and the title sits BELOW the image (announcement
       order). The title attribute stays set either way so the dialog keeps its
       accessible name (aria-labelledby → the header title, hidden by CSS here). */
    const mediaTop = (this._steps.length === 1) && !!step.image;
    if (mediaTop) pop.classList.add('ds-tour__pop--media-top');
    pop.setAttribute('title', step.title || '');
    /* Plain header: the title flows into the content, no divided header bar. */
    pop.setAttribute('header-style', 'plain');
    if (this._rtl()) pop.setAttribute('rtl', '');
    pop.appendChild(this._buildBody(step, mediaTop ? step.title : null));
    const footSlot = document.createElement('div');
    footSlot.setAttribute('slot', 'footer');
    footSlot.appendChild(this._buildFooter(step));
    pop.appendChild(footSlot);
    return pop;
  }

  /* Close ✕ = dismiss: aria-label + a hover-only ds-tooltip (icon off). Multi-step
     tours read "Skip tour"; a single corner announcement reads plain "Close". */
  _wireCardClose(pop, labelKey = 'skip') {
    const closeBtn = pop.querySelector('.ds-popover__close');
    if (closeBtn && !closeBtn.closest('ds-tooltip')) {
      closeBtn.setAttribute('aria-label', this._label(labelKey));
      const tip = document.createElement('ds-tooltip');
      tip.setAttribute('text', this._label(labelKey));
      tip.setAttribute('position', 'up-center');
      tip.setAttribute('show-icon', 'false');
      closeBtn.parentNode.insertBefore(tip, closeBtn);
      tip.appendChild(closeBtn);
    }
  }

  /* Move focus off the auto-focused ✕ onto Next so the ✕ tooltip stays hover-only. */
  _focusNext(surface) {
    requestAnimationFrame(() => {
      if (this._surface !== surface || !surface.contains(document.activeElement)) return;
      const next = surface.querySelector('.ds-tour__next');
      const el = (next && next.querySelector('button')) || next;
      if (el) el.focus();
    });
  }

  _showAnchored(step, targetEl) {
    this._scrollIntoView(targetEl);
    if (!targetEl.id) targetEl.id = `ds-tour-target-${this._uid}-${this._index}`;

    this._ensureBackdrop();
    /* Spotlight the target: dim everything except its rect (P2). */
    if (this._backdrop && this._backdrop.spotlight) {
      const pad = step.spotlightPadding != null ? step.spotlightPadding : 8;
      this._backdrop.spotlight(targetEl, { padding: pad, radius: 8 });
    }

    const pop = this._buildCardPopover(step);
    pop.setAttribute('anchor', targetEl.id);
    pop.setAttribute('placement', step.placement || 'bottom-start');
    /* Arrow (beak) on by default; a step may turn it off with `arrow: false`. */
    if (step.arrow !== false) pop.setAttribute('arrow', '');

    document.body.appendChild(pop);
    this._surface = pop;
    this._bindSurfaceClose(pop, 'ds-popover-close');
    this._wireCardClose(pop);
    pop.open();
    this._focusNext(pop);

    /* Interactive step: advance when the user performs the real action on the
       target (the spotlight cutout already makes it click-through). Next still
       works as an escape hatch. */
    if (step.advanceOn) this._bindAdvance(targetEl, step.advanceOn);
  }

  /* Target-less corner announcement (feature spotlight): a card pinned to a
     screen corner (default bottom-right) with NO backdrop — it announces a
     feature without blocking the screen (e.g. right after login), so the page
     stays fully interactive behind it. The card is the same ds-popover surface,
     but with no anchor it stays where CSS pins it (ds-popover skips inline
     positioning when it has no anchor). The close ✕ reads "Close", not "Skip". */
  _showCorner(step) {
    this._removeBackdrop();

    const pop = this._buildCardPopover(step, 'large');   // announcements default large
    const corner = CORNERS.includes(step.corner) ? step.corner : 'bottom-right';
    pop.classList.add('ds-tour__pop--corner', `ds-tour__pop--corner-${corner}`);
    /* No anchor → no beak; a corner card points at nothing. */

    document.body.appendChild(pop);
    this._surface = pop;
    this._bindSurfaceClose(pop, 'ds-popover-close');
    this._wireCardClose(pop, 'close');
    pop.open();
    /* No backdrop → the page stays interactive, so DON'T light-dismiss on outside
       click: working in the app behind the card must not close the announcement.
       It persists until the user hits the action or the ✕ (Esc still closes). */
    if (pop._onDocPointer) document.removeEventListener('mousedown', pop._onDocPointer, true);
    this._focusNext(pop);
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
    /* Welcome / summary dialog reads as a proper onboarding moment — the medium
       (640px) modal, not the tight sm (480px) confirm size. */
    modal.setAttribute('size', 'md');
    modal.setAttribute('title', step.title || '');
    if (this._rtl()) modal.setAttribute('rtl', '');
    /* With an image, put media + text in the body (image on top); otherwise use
       the modal's description attribute as before. */
    const media = this._buildMedia(step);
    if (media) {
      modal.appendChild(media);
      if (step.body) {
        const p = document.createElement('p');
        p.className = 'ds-tour__text';
        p.textContent = step.body;
        modal.appendChild(p);
      }
    } else if (step.body) {
      modal.setAttribute('description', step.body);
    }

    const spotlight = this._spotlightFooter(step);
    if (spotlight) {
      /* Single-step: one full-width primary button, no progress. */
      modal.classList.add('ds-tour__modal--single');
      const foot = document.createElement('div');
      foot.setAttribute('slot', 'footer');
      foot.appendChild(spotlight.firstChild);
      modal.appendChild(foot);
    } else {
      /* Pagination on the footer-start (where Skip used to be); Back / Next trail. */
      const prog = this._buildProgress();
      prog.setAttribute('slot', 'footer-start');
      modal.appendChild(prog);

      const ctl = this._buildControlParts(step);
      const foot = document.createElement('div');
      foot.setAttribute('slot', 'footer');
      if (ctl.back) foot.appendChild(ctl.back);
      foot.appendChild(ctl.next);
      modal.appendChild(foot);
    }

    document.body.appendChild(modal);
    this._surface = modal;
    this._bindSurfaceClose(modal, 'ds-modal-close');
    modal.open();

    /* Close ✕ = skip: relabel it + enable ds-icon-button's built-in "Skip tour"
       tooltip. Then move focus to Next so it stays hover-only, not shown on open. */
    const mclose = modal.querySelector('.ds-modal__close');
    if (mclose) { mclose.removeAttribute('no-tooltip'); mclose.setAttribute('aria-label', this._label('skip')); mclose.setAttribute('label', this._label('skip')); }
    requestAnimationFrame(() => {
      if (this._surface !== modal || !modal.contains(document.activeElement)) return;
      const next = modal.querySelector('.ds-tour__next');
      const el = (next && next.querySelector('button')) || next;
      if (el) el.focus();
    });
  }

  // ---- card content -------------------------------------------------------
  /* Optional media: step.image is a URL rendered at the top of the card. */
  _buildMedia(step) {
    if (!step.image) return null;
    const fig = document.createElement('div');
    fig.className = 'ds-tour__media';
    const img = document.createElement('img');
    img.src = step.image;
    img.alt = step.imageAlt || '';
    /* Not lazy: a tour/announcement card is shown on demand, and a lazy image with
       no explicit height starts as a 0-height box that never enters the viewport
       intersection — so it would never load. Eager is correct here. */
    fig.appendChild(img);
    return fig;
  }

  _buildBody(step, titleBelowText = null) {
    const body = document.createElement('div');
    body.className = 'ds-tour__body';
    const media = this._buildMedia(step);
    if (media) body.appendChild(media);
    /* Media-top spotlight: the title moves out of the header to BELOW the image.
       The dialog is still named by the (visually hidden) header title via
       aria-labelledby, so this visible copy is aria-hidden to avoid a re-read. */
    if (titleBelowText) {
      const h = document.createElement('h3');
      h.className = 'ds-tour__title';
      h.setAttribute('aria-hidden', 'true');
      h.textContent = titleBelowText;
      body.appendChild(h);
    }
    if (step.body || step.learnMoreHref) {
      const p = document.createElement('p');
      p.className = 'ds-tour__text';
      if (step.body) p.textContent = step.body;
      /* Optional inline "Learn more" link trailing the body copy. */
      if (step.learnMoreHref) {
        if (step.body) p.appendChild(document.createTextNode(' '));
        const link = document.createElement('ds-text-link');
        link.className = 'ds-tour__learn';
        link.setAttribute('variant', 'primary');
        link.setAttribute('size', 'medium');
        link.setAttribute('href', step.learnMoreHref);
        if (step.learnMoreTarget) link.setAttribute('target', step.learnMoreTarget);
        link.textContent = step.learnMoreLabel || this._label('learnMore');
        p.appendChild(link);
      }
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

  /* Feature-spotlight footer: a single-step tour is one card with nothing to page
     through, so the footer is a single full-width primary button (no progress /
     Back). Returns the footer, or null for the normal multi-step footer. */
  _spotlightFooter(step) {
    if (this._steps.length !== 1) return null;
    const footer = document.createElement('div');
    footer.className = 'ds-tour__footer ds-tour__footer--single';
    const btn = document.createElement('ds-button');
    btn.className = 'ds-tour__next ds-tour__next--full';
    btn.setAttribute('variant', 'primary');
    btn.setAttribute('size', 'small');
    btn.setAttribute('label', step.primaryLabel || this._label('done'));
    btn.addEventListener('click', () => this.next());
    footer.appendChild(btn);
    /* Optional soft-decline below the primary — a text link that dismisses the
       announcement (skip semantics), e.g. "I'll do it later". */
    if (step.secondaryLabel) {
      const secondary = document.createElement('ds-text-link');
      secondary.className = 'ds-tour__secondary';
      secondary.setAttribute('variant', 'secondary');
      secondary.setAttribute('size', 'medium');
      secondary.setAttribute('underline', 'always');
      secondary.setAttribute('href', '#');
      secondary.textContent = step.secondaryLabel;
      /* Soft decline: dismiss now but DON'T persist "seen" — a "remind me later"
         so the announcement returns next time. */
      secondary.addEventListener('click', (e) => { e.preventDefault(); this.end({ completed: false, remindLater: true }); });
      footer.appendChild(secondary);
    }
    return footer;
  }

  _buildFooter(step) {
    const spotlight = this._spotlightFooter(step);
    if (spotlight) return spotlight;
    const footer = document.createElement('div');
    footer.className = 'ds-tour__footer';
    const actions = document.createElement('div');
    actions.className = 'ds-tour__actions';
    /* Pagination sits on the lead (where the Skip link used to be); Back / Next
       trail on the right. */
    actions.appendChild(this._buildProgress());
    const spacer = document.createElement('span');
    spacer.className = 'ds-tour__spacer';
    actions.appendChild(spacer);
    const ctl = this._buildControlParts(step);
    if (ctl.back) actions.appendChild(ctl.back);
    actions.appendChild(ctl.next);
    footer.appendChild(actions);
    return footer;
  }

  /* Shared Back / Next controls (composed from ds-button). Skipping the tour is now
     the close ✕ (with a "Skip tour" tooltip), so there is no separate Skip link. */
  _buildControlParts(step) {
    const isFirst = this._index === 0;
    const isLast = this._index === this._steps.length - 1;
    /* The centered welcome / summary dialog uses `small` buttons; the anchored
       slide cards use the tighter `xsmall`. */
    const size = (step && step.target == null) ? 'small' : 'xsmall';

    let back = null;
    if (!isFirst) {
      back = document.createElement('ds-button');
      back.className = 'ds-tour__back';
      back.setAttribute('variant', 'secondary');
      back.setAttribute('size', size);
      back.setAttribute('label', this._label('back'));
      back.addEventListener('click', () => this.prev());
    }

    const next = document.createElement('ds-button');
    next.className = 'ds-tour__next';
    next.setAttribute('variant', 'primary');
    next.setAttribute('size', size);
    const nextLabel = step.primaryLabel || (isLast ? this._label('done') : this._label('next'));
    next.setAttribute('label', nextLabel);
    next.addEventListener('click', () => this.next());

    return { back, next };
  }

  /* Progress counts only ANCHORED steps — a centered step (target: null, e.g. the
     welcome / summary bookends) is an intro, not a numbered step. Returns
     { pos, total } (0-based pos among counted steps) or null when the current
     step is not counted. */
  _progressInfo() {
    const counted = (s) => s && s.target != null;
    const total = this._steps.filter(counted).length;
    const current = this._steps[this._index];
    if (!counted(current) || total === 0) return null;
    const pos = this._steps.slice(0, this._index + 1).filter(counted).length - 1;
    return { pos, total };
  }

  _buildProgress() {
    const wrap = document.createElement('div');
    wrap.className = 'ds-tour__progress';
    const info = this._progressInfo();
    if (!info) return wrap;                 // welcome / summary → no pagination
    const dots = document.createElement('div');
    dots.className = 'ds-tour__dots';
    dots.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < info.total; i++) {
      const d = document.createElement('span');
      d.className = 'ds-tour__dot'
        + (i < info.pos ? ' is-done' : '')
        + (i === info.pos ? ' is-current' : '');
      dots.appendChild(d);
    }
    const label = document.createElement('span');
    label.className = 'ds-tour__count';
    label.textContent = `${info.pos + 1} ${this._label('of')} ${info.total}`;
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
