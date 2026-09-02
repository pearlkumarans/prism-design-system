/**
 * rafThrottle — coalesce rapid calls (scroll/resize bursts) into at most one
 * invocation per animation frame. Use for reposition / reflow handlers that read
 * layout (getBoundingClientRect, offsetWidth…), so an open floating panel doesn't
 * thrash layout on every scroll event.
 *
 *   this._reanchor = rafThrottle(() => this._position());
 *   window.addEventListener('scroll', this._reanchor, true);
 *   // teardown — cancel any pending frame, then remove the listener:
 *   this._reanchor.cancel();
 *   window.removeEventListener('scroll', this._reanchor, true);
 */
export function rafThrottle(fn) {
  let raf = 0;
  const throttled = (...args) => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; fn(...args); });
  };
  throttled.cancel = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  return throttled;
}
