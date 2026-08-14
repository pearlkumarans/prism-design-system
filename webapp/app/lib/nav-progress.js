/**
 * nav-progress — ref-counted show/hide for the module-switch progress bar (the
 * `.shell-navload` element rendered by ShellChrome). A direct port of
 * Layout/Shell.html's `navLoad` controller. Kept framework-agnostic (no service,
 * no tracked state) so the mount-view modifier can drive it straight around the
 * async view fetch — start before the fetch, done when it settles. Ref-counting
 * keeps the bar visible across overlapping loads; a safety timer clears a missed
 * done().
 */
let count = 0;
let safety = 0;

function bar() {
  return typeof document !== 'undefined' && document.querySelector('.shell-navload');
}

export function navLoadStart() {
  count++;
  const el = bar();
  if (el) el.classList.add('is-on');
  clearTimeout(safety);
  safety = setTimeout(() => {
    count = 0;
    const b = bar();
    if (b) b.classList.remove('is-on');
  }, 8000);
}

export function navLoadDone() {
  count = Math.max(0, count - 1);
  if (count === 0) {
    clearTimeout(safety);
    const el = bar();
    if (el) el.classList.remove('is-on');
  }
}
