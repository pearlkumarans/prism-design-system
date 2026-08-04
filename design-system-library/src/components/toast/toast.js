/* =============================================================================
   <ds-toast status="success" style-variant="filled" title="Saved"
             description="Profile updated." cta-text="View" cta-href="/profile"
             duration="5000"></ds-toast>

   Transient notification. Defaults: status=info, style-variant=subtle,
   duration=5000ms. duration="0" (or status=error) → persistent: no countdown,
   no timeout bar (spec edge case). Hover/focus-within pauses the countdown
   (WCAG 2.2.1); Escape dismisses; close click dismisses immediately.
   Events: ds-toast-close, ds-toast-cta.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const STATUSES = ['info', 'success', 'warning', 'error'];
const STYLES = ['subtle', 'filled'];
const ICON_FOR = { info: 'info-circle', success: 'circle-tick', warning: 'exclamation-triangle', error: 'exclamation-circle' };

export class DsToast extends HTMLElement {
  static get observedAttributes() {
    return ['status', 'style-variant', 'title', 'description', 'show-description',
            'cta-text', 'cta-href', 'show-cta', 'show-close', 'show-timeout', 'duration', 'rtl'];
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._render();
  }

  disconnectedCallback() { clearTimeout(this._timer); }

  attributeChangedCallback() { if (this._root) this._render(); }

  _pauseTimer() {
    /* Spec a11y: pause auto-dismiss on hover AND focus-within (WCAG 2.2.1). */
    clearTimeout(this._timer);
    const bar = this._root?.querySelector('.ds-toast__timeout > div');
    if (bar) bar.style.animationPlayState = 'paused';
  }

  _resumeTimer() {
    const bar = this._root?.querySelector('.ds-toast__timeout > div');
    if (bar) {
      /* Countdown is driven by the bar's animation — resuming it resumes
         the dismissal (animationend) with the remaining time intact. */
      bar.style.animationPlayState = 'running';
    } else {
      this._scheduleFallbackTimer();
    }
  }

  _countdownActive() {
    const duration = parseInt(this.getAttribute('duration') || '5000', 10);
    /* Spec: errors must not auto-dismiss — they persist until dismissed. */
    return duration > 0 && enumAttr(this, 'status', STATUSES, 'info') !== 'error';
  }

  _scheduleFallbackTimer() {
    clearTimeout(this._timer);
    if (!this._countdownActive()) return;
    const duration = parseInt(this.getAttribute('duration') || '5000', 10);
    this._timer = setTimeout(() => this._dismiss(), duration);
  }

  _dismiss() {
    if (this._exiting) return;
    this._exiting = true;
    clearTimeout(this._timer);
    this.dispatchEvent(new CustomEvent('ds-toast-close', { bubbles: true }));
    /* Inside a ds-toaster, the toaster owns the exit animation + removal + the
       stack relayout — just signal close (above) and let it drive. */
    if (this.dataset.managed !== undefined) return;
    const root = this._root;
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = false;
    const finish = () => { if (!done) { done = true; this.remove(); } };
    /* Standalone smooth exit — slide up + fade, then remove. Web Animations API
       plays reliably regardless of style-recalc timing. */
    if (!root || reduced || typeof root.animate !== 'function') { finish(); return; }
    const anim = root.animate(
      [{ opacity: 1, transform: 'translateY(0) scale(1)' },
       { opacity: 0, transform: 'translateY(-8px) scale(0.98)' }],
      { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
    );
    anim.addEventListener('finish', finish);
    setTimeout(finish, 260);   /* safety net */
  }

  _render() {
    const status = enumAttr(this, 'status', STATUSES, 'info');
    const styleV = enumAttr(this, 'style-variant', STYLES, 'subtle');
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const showDescription = description && (!this.hasAttribute('show-description') || this.getAttribute('show-description') !== 'false');
    const ctaText = this.getAttribute('cta-text') || '';
    const ctaHref = this.getAttribute('cta-href') || '';
    const showCta = ctaText && (!this.hasAttribute('show-cta') || this.getAttribute('show-cta') !== 'false');
    const showClose = !this.hasAttribute('show-close') || this.getAttribute('show-close') !== 'false';
    const duration = parseInt(this.getAttribute('duration') || '5000', 10);
    const rtl = boolAttr(this, 'rtl');

    /* Spec: only Error escalates to assertive/alert (Warning shares it per
       the a11y table); Info/Success stay polite/status. */
    const isAssertive = status === 'error' || status === 'warning';
    this._root.className = `ds-toast ds-toast--${styleV} ds-toast--${status}`;
    this._root.setAttribute('role', isAssertive ? 'alert' : 'status');
    this._root.setAttribute('aria-live', isAssertive ? 'assertive' : 'polite');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Bar appears only while a real countdown runs — persistent toasts
       (duration=0 / error) hide it entirely (spec edge case). Explicit
       show-timeout="false" force-hides it regardless. */
    const animating = this._countdownActive()
      && (!this.hasAttribute('show-timeout') || this.getAttribute('show-timeout') !== 'false');

    const ctaEl = ctaHref
      ? `<a class="ds-toast__cta" href="${ctaHref}" data-cta>${ctaText}</a>`
      : `<button class="ds-toast__cta" type="button" data-cta>${ctaText}</button>`;

    this._root.innerHTML = `
      <div class="ds-toast__content">
        <span class="ds-toast__icon" aria-hidden="true"><ds-icon name="${ICON_FOR[status]}" size="20"></ds-icon></span>
        <div class="ds-toast__body">
          ${title ? `<div class="ds-toast__title">${title}</div>` : ''}
          ${showDescription ? `<div class="ds-toast__description">${description}</div>` : ''}
        </div>
        ${showCta ? ctaEl : ''}
        ${showClose ? `<button class="ds-toast__close" type="button" aria-label="Dismiss notification" data-close><ds-icon name="close" size="16"></ds-icon></button>` : ''}
      </div>
      ${animating ? `<div class="ds-toast__timeout" aria-hidden="true"><div data-animating="true" style="animation-duration: ${duration}ms;"></div></div>` : ''}
    `;

    this._root.querySelector('[data-close]')?.addEventListener('click', () => this._dismiss());
    this._root.querySelector('[data-cta]')?.addEventListener('click', () => {
      /* CTA acts; the toast persists (spec) — dismissal is the consumer's call. */
      this.dispatchEvent(new CustomEvent('ds-toast-cta', { bubbles: true }));
    });

    /* Countdown driven by the bar animation so pause/resume keeps the
       remaining time. Fallback timer covers reduced-motion / no-bar cases. */
    const bar = this._root.querySelector('.ds-toast__timeout > div');
    if (bar) {
      bar.addEventListener('animationend', () => this._dismiss());
      const anim = getComputedStyle(bar).animationName;
      if (anim === 'none') this._scheduleFallbackTimer(); /* prefers-reduced-motion */
    } else {
      this._scheduleFallbackTimer();
    }

    if (!this._handlersBound) {
      this._handlersBound = true;
      this.addEventListener('mouseenter', () => this._pauseTimer());
      this.addEventListener('mouseleave', () => this._resumeTimer());
      this.addEventListener('focusin',   () => this._pauseTimer());
      this.addEventListener('focusout',  () => this._resumeTimer());
      /* Spec: Escape (focus within) dismisses. */
      this.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._dismiss(); });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-toast')) {
  customElements.define('ds-toast', DsToast);
}

/* =============================================================================
   <ds-toaster position="top-right" theme="light" max="3"></ds-toaster>

   Sonner-style stacked toaster — lives in the SAME file as <ds-toast> so a page
   only needs toast.js + toast.css. Spawns <ds-toast>s and OWNS their layout:
     • Collapsed — newest in front; older peek behind (scaled + offset).
     • Hover / focus — the stack EXPANDS into a vertical list (one by one).
     • Enter / exit slide from the anchored edge (top → down/up · right → from/to
       the right · …); new toasts land in front, old ones move back.

   API:  t.toast('Saved') · t.success/.error/.warning/.info({title, description, …})
         import { toast } from '…/toast/toast.js';  toast.success('Done');
   ============================================================================= */

const TOASTER_POSITIONS = ['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'];
const TOASTER_GAP = 14;          /* px between toasts when expanded */
const TOASTER_PEEK = 14;         /* px each older toast peeks when collapsed */
const TOASTER_SCALE = 0.05;      /* scale-down per depth */
const TOASTER_MAX_VISIBLE = 3;   /* collapsed: how many peek before hiding */

export class DsToaster extends HTMLElement {
  static get observedAttributes() { return ['position', 'theme', 'rtl']; }

  connectedCallback() {
    if (!this._ready) {
      this._ready = true;
      this._expanded = false;
      this.setAttribute('role', 'region');
      this.setAttribute('aria-label', this.getAttribute('aria-label') || 'Notifications');
      this.addEventListener('mouseenter', () => this._setExpanded(true));
      this.addEventListener('mouseleave', () => this._setExpanded(false));
      this.addEventListener('focusin', () => this._setExpanded(true));
      this.addEventListener('focusout', (e) => { if (!this.contains(e.relatedTarget)) this._setExpanded(false); });
      this.addEventListener('ds-toast-close', (e) => this._onClose(e));
    }
    this._syncToaster();
  }

  attributeChangedCallback() { if (this._ready) this._syncToaster(); }

  _syncToaster() {
    const pos = TOASTER_POSITIONS.includes(this.getAttribute('position')) ? this.getAttribute('position') : 'top-center';
    this.dataset.position = pos;
    const theme = this.getAttribute('theme');
    if (theme === 'light' || theme === 'dark') this.setAttribute('data-theme', theme);
    else this.removeAttribute('data-theme');
    this._layout(false);
  }

  _max() { const n = parseInt(this.getAttribute('max') || '', 10); return Number.isFinite(n) && n > 0 ? n : 99; }
  _toasts() { return [...this.querySelectorAll(':scope > ds-toast')]; }

  _setExpanded(v) {
    if (this._expanded === v) return;
    this._expanded = v;
    this.toggleAttribute('data-expanded', v);
    this._toasts().forEach((t) => (v ? t._pauseTimer?.() : t._resumeTimer?.()));
    this._layout(true);
  }

  toast(arg, opts = {}) {
    const o = (arg && typeof arg === 'object') ? arg : { title: arg, ...opts };
    const t = document.createElement('ds-toast');
    t.dataset.managed = '';
    t.setAttribute('title', o.title ?? o.message ?? '');
    t.setAttribute('status', o.status || 'info');
    t.setAttribute('style-variant', o.style || 'subtle');
    if (o.description) t.setAttribute('description', o.description);
    if (o.cta) { t.setAttribute('cta-text', o.cta); if (o.ctaHref) t.setAttribute('cta-href', o.ctaHref); }
    else t.setAttribute('show-cta', 'false');
    if (o.showClose === false) t.setAttribute('show-close', 'false');
    t.setAttribute('duration', String(o.duration != null ? o.duration : 5000));
    if (boolAttr(this, 'rtl') || o.rtl) t.setAttribute('rtl', '');

    this.appendChild(t);
    this._layout(true);                  /* lands at its visible stacked spot */
    /* Enter — slide in from the anchored edge via the Web Animations API (an
       overlay on top of the resting state, so a missed animation never leaves
       the toast invisible). */
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof t.animate === 'function' && !reduced) {
      const pos = this.dataset.position || 'top-center';
      const from = pos.endsWith('right') ? 'translateX(110%)'
        : pos.endsWith('left') ? 'translateX(-110%)'
          : `translateY(${pos.startsWith('top') ? '-110%' : '110%'})`;
      t.animate(
        [{ opacity: 0, transform: from }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
        { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
    }
    this._enforceMax();
    return t;
  }

  _variant(status, arg, opts = {}) {
    const o = (arg && typeof arg === 'object') ? { ...arg } : { title: arg, ...opts };
    o.status = status;
    return this.toast(o);
  }
  success(arg, opts) { return this._variant('success', arg, opts); }
  error(arg, opts)   { return this._variant('error', arg, opts); }
  warning(arg, opts) { return this._variant('warning', arg, opts); }
  info(arg, opts)    { return this._variant('info', arg, opts); }
  clear() { this._toasts().forEach((t) => t.remove()); this._layout(false); }

  _enforceMax() {
    const ts = this._toasts();
    const excess = ts.length - this._max();
    for (let i = 0; i < excess; i++) ts[i]._dismiss?.();
  }

  _onClose(e) {
    const t = e.target;
    if (!t || t.parentElement !== this || t.dataset.managed === undefined) return;
    let removed = false;
    const done = () => { if (removed) return; removed = true; t.remove(); this._layout(true); };
    const pos = this.dataset.position || 'top-center';
    const to = pos.endsWith('right') ? 'translateX(110%)'
      : pos.endsWith('left') ? 'translateX(-110%)'
        : `translateY(${pos.startsWith('top') ? '-110%' : '110%'})`;
    const from = t.style.transform || 'translateY(0) scale(1)';
    t.dataset.tExit = '';          /* drop from the stack → the rest reflow up */
    this._layout(true);
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof t.animate !== 'function' || reduced) { done(); return; }
    /* Exit — slide out to the anchored edge via WAAPI, then remove. */
    const anim = t.animate(
      [{ opacity: 1, transform: from }, { opacity: 0, transform: to }],
      { duration: 220, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
    );
    anim.addEventListener('finish', done);
    setTimeout(done, 320);
  }

  _layout(animate) {
    /* Exiting toasts are dropped from the stack (their WAAPI exit owns them);
       the rest always rest at a VISIBLE position (never off-screen), so a
       missed transition can't hide them. */
    const ts = this._toasts().filter((t) => t.dataset.tExit === undefined);
    const n = ts.length;
    if (!n) { this.style.height = '0px'; return; }
    const pos = this.dataset.position || 'top-center';
    const top = pos.startsWith('top');
    const dir = top ? 1 : -1;

    let cum = 0;
    let frontH = 0;

    for (let i = 0; i < n; i++) {
      const t = ts[n - 1 - i];           /* i=0 → newest / front */
      t.style.zIndex = String(1000 - i);
      t.style.transition = animate ? '' : 'none';
      let ty, scale, opacity;
      if (this._expanded) {
        ty = dir * cum; scale = 1; opacity = 1;
      } else {
        ty = dir * i * TOASTER_PEEK; scale = 1 - i * TOASTER_SCALE; opacity = i < TOASTER_MAX_VISIBLE ? 1 : 0;
      }
      t.style.transform = `translateY(${ty}px) scale(${scale})`;
      t.style.opacity = String(opacity);
      if (!animate) { void t.offsetWidth; t.style.transition = ''; }
      cum += t.offsetHeight + TOASTER_GAP;
      if (i === 0) frontH = t.offsetHeight;
    }

    this.style.height = this._expanded
      ? `${Math.max(0, cum - TOASTER_GAP)}px`
      : `${frontH + Math.min(n - 1, TOASTER_MAX_VISIBLE - 1) * TOASTER_PEEK}px`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-toaster')) {
  customElements.define('ds-toaster', DsToaster);
}

/* Module-level convenience — Sonner-style global toast() on an auto-created
   bottom/top toaster. */
let _defaultToaster = null;
function _getDefaultToaster() {
  if (typeof document === 'undefined') return null;
  if (!_defaultToaster || !_defaultToaster.isConnected) {
    _defaultToaster = document.querySelector('ds-toaster[data-default]') || (() => {
      const el = document.createElement('ds-toaster');
      el.setAttribute('data-default', '');
      el.setAttribute('position', 'top-center');
      document.body.appendChild(el);
      return el;
    })();
  }
  return _defaultToaster;
}

export function toast(arg, opts) { return _getDefaultToaster()?.toast(arg, opts); }
toast.success = (a, o) => _getDefaultToaster()?.success(a, o);
toast.error   = (a, o) => _getDefaultToaster()?.error(a, o);
toast.warning = (a, o) => _getDefaultToaster()?.warning(a, o);
toast.info    = (a, o) => _getDefaultToaster()?.info(a, o);
toast.clear   = () => _getDefaultToaster()?.clear();
/* Position / theme the auto-mounted stack region without any <ds-toaster>
   markup — e.g. toast.config({ position: 'top-center' }). */
toast.config  = (opts = {}) => {
  const tr = _getDefaultToaster();
  if (!tr) return null;
  if (opts.position) tr.setAttribute('position', opts.position);
  if (opts.theme) tr.setAttribute('theme', opts.theme);
  return tr;
};

/* Expose the imperative API globally so non-module inline scripts (e.g. the
   dual-mode view files injected into the shell, where a page-local `import`
   won't run) can fire toasts and inherit the global default position. Both
   the shell and standalone harnesses import this module, so `dsToast` is
   always present. Usage: dsToast.success({ title, description }). */
if (typeof globalThis !== 'undefined') globalThis.dsToast = toast;
