import { boolAttr, enumAttr } from '../../utils/attr.js';

const ORIENTATIONS = ['vertical', 'horizontal'];
const SIZES = ['thin', 'regular'];

/**
 * <ds-scrollbar> — custom overlay scrollbar (wrapper).
 * Spec: design-system/handoff/Scrollbar.md (Figma 21449:586344 / 21449:586382)
 *
 * Wrap any scrollable content; the element provides a viewport (native bar
 * hidden) and an overlay pill thumb synced to scroll. Thumb-only, theme-aware.
 *
 *   <ds-scrollbar orientation="vertical" size="regular" style="height:240px">
 *     …long content…
 *   </ds-scrollbar>
 *
 * Attributes: orientation (vertical|horizontal, default vertical),
 * size (thin|regular, default regular), autohide (default on; "false" = always
 * visible), disabled, rtl. Auto-hide is cursor-presence driven (show while the
 * pointer is over the region / dragging / focused; hide on leave).
 */
export class DsScrollbar extends HTMLElement {
  static get observedAttributes() { return ['orientation', 'size', 'autohide', 'disabled', 'rtl']; }

  connectedCallback() {
    if (!this._built) {
      const vp = document.createElement('div');
      vp.className = 'ds-scrollbar__viewport';
      vp.setAttribute('part', 'viewport');
      while (this.firstChild) vp.appendChild(this.firstChild);   // adopt the slotted content

      const thumb = document.createElement('div');
      thumb.className = 'ds-scrollbar__thumb';
      thumb.setAttribute('part', 'thumb');
      thumb.setAttribute('aria-hidden', 'true');

      this.appendChild(vp);
      this.appendChild(thumb);
      this._vp = vp;
      this._thumb = thumb;
      this._over = false;
      this._dragging = false;
      this._built = true;
      this._wire();
    }
    this._apply();
    this._scheduleSync();
  }

  attributeChangedCallback() { if (this._built) { this._apply(); this._sync(); } }

  disconnectedCallback() {
    this._ro && this._ro.disconnect();
    this._mo && this._mo.disconnect();
    if (this._onWinResize) removeEventListener('resize', this._onWinResize);
    clearTimeout(this._initT);
  }

  /* Layout may not be settled at connect (the component stylesheet is injected
     async), so sync across two frames + a fallback timeout. */
  _scheduleSync() {
    requestAnimationFrame(() => requestAnimationFrame(() => this._sync()));
    clearTimeout(this._initT);
    this._initT = setTimeout(() => this._sync(), 120);
  }

  /* ---- internals -------------------------------------------------------- */

  get _horizontal() { return enumAttr(this, 'orientation', ORIENTATIONS, 'vertical') === 'horizontal'; }
  _autohide() { return this.getAttribute('autohide') !== 'false'; }

  _apply() {
    // reflect rtl as dir so the CSS edge-swap applies
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else if (this.getAttribute('dir') === 'rtl') this.removeAttribute('dir');
    // autohide off → keep the thumb permanently visible
    if (!this._autohide()) this.toggleAttribute('data-sb-visible', true);
  }

  _wire() {
    const vp = this._vp, thumb = this._thumb;

    const onScroll = () => {
      this._sync();
      // touch (no hover): reveal on scroll, fade shortly after it stops
      this._show();
      clearTimeout(this._idle);
      this._idle = setTimeout(() => this._hide(), 800);
    };
    vp.addEventListener('scroll', onScroll, { passive: true });

    this._ro = new ResizeObserver(() => this._sync());
    this._ro.observe(vp);
    this._ro.observe(this);   // host size is stable from inline style — catches CSS-driven layout
    this._mo = new MutationObserver(() => this._sync());
    this._mo.observe(vp, { childList: true, subtree: true, characterData: true });
    this._onWinResize = () => this._sync();
    addEventListener('resize', this._onWinResize);

    // auto-hide = cursor presence over the host
    this.addEventListener('pointerenter', () => { this._over = true; this._show(); });
    this.addEventListener('pointerleave', () => { this._over = false; this._hide(); });
    // keyboard focus keeps it visible
    vp.addEventListener('focusin', () => this._show());
    vp.addEventListener('focusout', () => this._hide());

    // drag the thumb → scroll 1:1
    thumb.addEventListener('pointerdown', (e) => this._onDown(e));
  }

  _metrics() {
    const vp = this._vp, h = this._horizontal;
    const clientLen = h ? vp.clientWidth : vp.clientHeight;
    const scrollLen = h ? vp.scrollWidth : vp.scrollHeight;
    const scrollPos = h ? vp.scrollLeft : vp.scrollTop;
    return { clientLen, scrollLen, scrollPos, maxScroll: scrollLen - clientLen };
  }

  _sync() {
    if (!this._built) return;
    const h = this._horizontal;
    const { clientLen, scrollLen, scrollPos, maxScroll } = this._metrics();
    const overflow = maxScroll > 1 && !boolAttr(this, 'disabled');
    this.toggleAttribute('data-sb-disabled', !overflow);
    this._vp.tabIndex = overflow ? 0 : -1;            // focusable only when scrollable
    if (!overflow) return;

    const thumbLen = Math.max(24, Math.round((clientLen / scrollLen) * clientLen));
    const travel = clientLen - thumbLen;
    const pos = maxScroll > 0 ? (scrollPos / maxScroll) * travel : 0;
    const t = this._thumb;
    if (h) { t.style.width = thumbLen + 'px'; t.style.height = ''; t.style.transform = `translateX(${pos}px)`; }
    else   { t.style.height = thumbLen + 'px'; t.style.width = '';  t.style.transform = `translateY(${pos}px)`; }
  }

  _onDown(e) {
    e.preventDefault();
    const h = this._horizontal, vp = this._vp;
    const { clientLen, maxScroll } = this._metrics();
    const startPtr = h ? e.clientX : e.clientY;
    const startScroll = h ? vp.scrollLeft : vp.scrollTop;
    const thumbLen = parseFloat(h ? this._thumb.style.width : this._thumb.style.height) || 0;
    const travel = clientLen - thumbLen;

    this._dragging = true;
    this.toggleAttribute('data-sb-dragging', true);
    this._show();
    try { this._thumb.setPointerCapture(e.pointerId); } catch (_) {}

    const move = (ev) => {
      const delta = (h ? ev.clientX : ev.clientY) - startPtr;
      const next = startScroll + (travel > 0 ? (delta / travel) * maxScroll : 0);
      if (h) vp.scrollLeft = next; else vp.scrollTop = next;
    };
    const up = () => {
      this._dragging = false;
      this.toggleAttribute('data-sb-dragging', false);
      this._thumb.removeEventListener('pointermove', move);
      this._thumb.removeEventListener('pointerup', up);
      this._thumb.removeEventListener('pointercancel', up);
      this._hide();
    };
    this._thumb.addEventListener('pointermove', move);
    this._thumb.addEventListener('pointerup', up);
    this._thumb.addEventListener('pointercancel', up);
  }

  _show() { this.toggleAttribute('data-sb-visible', true); }

  _hide() {
    if (!this._autohide()) return;                    // always-visible mode
    if (this._dragging || this._over) return;         // keep through drag / hover
    if (this._vp && this._vp.matches(':focus-within')) return;  // keep while focused
    this.toggleAttribute('data-sb-visible', false);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-scrollbar')) {
  customElements.define('ds-scrollbar', DsScrollbar);
}
