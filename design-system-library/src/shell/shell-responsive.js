/* =============================================================================
   shell-responsive.js — reusable responsive orchestration for any Prism shell.

   Components already expose the states (ds-header-nav compact hamburger,
   ds-sidebar-l1/l2 `collapsed`, ds-module-rail icons-only). This wires the
   *when*: it watches breakpoints and, per range, collapses the sidebars
   (tablet) or opens an off-canvas drawer (mobile) that holds BOTH the top-level
   nav (from ds-header-nav's tabs) and the live sidebar rails.

   Usage (each shell calls once, after its components upgrade):

     import { initShellResponsive } from '../design-system-library/src/shell/shell-responsive.js';
     initShellResponsive({
       root:     document.body,          // gets is-tablet / is-mobile / is-nav-open
       header:   document.getElementById('shell-header'),  // a ds-header-nav
       rails:    [moduleRailEl, l1El, l2El],   // in visual order; nulls ok
       collapse: [l1El, l2El],           // elements to `collapsed` on tablet
     });

   The drawer's top-level list is built from `header.tabs`; picking one dispatches
   the same `ds-header-nav-tab-select` the shell already handles — so product /
   module switching works on mobile with no extra shell code. The live rails are
   relocated into the drawer, so L1/L2 stay in sync as you drill in.

   Breakpoints (viewport): desktop > 1024 · tablet 641–1024 · mobile ≤ 640.
   The mobile bound matches ds-header-nav's own compact container query (640).
   ============================================================================= */

const MOBILE = '(max-width: 640px)';
const TABLET = '(min-width: 641px) and (max-width: 1024px)';

/* Self-contained styles — injected once so any shell gets them by importing. */
const CSS = `
.shell-backdrop {
  position: fixed; inset: 0; z-index: 1400;
  background: rgba(13, 17, 29, .44);
  opacity: 0; visibility: hidden;
  transition: opacity .2s ease, visibility .2s ease;
}
.shell-backdrop.is-open { opacity: 1; visibility: visible; }
/* Bottom sheet — slides up from the bottom edge, rounded top, drag handle. */
.shell-drawer {
  position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 1401;
  display: flex; flex-direction: column;
  width: 100%; max-height: 85vh;
  background: var(--uems-bg-primary);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 40px rgba(13, 17, 29, .24);
  transform: translateY(102%);
  visibility: hidden;
  transition: transform .26s cubic-bezier(.2, 0, 0, 1), visibility .26s;
  overflow: hidden;
}
.shell-drawer.is-open { transform: none; visibility: visible; }
.shell-drawer__handle {
  flex: none; align-self: center;
  width: 36px; height: 4px; margin: 10px 0 6px;
  border-radius: 999px; background: var(--uems-border-secondary, var(--uems-border-tertiary));
}
.shell-drawer__body { flex: 1 1 auto; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; }
/* Top-level nav (products / modules) — a vertical list built from header.tabs. */
.shell-drawer__nav {
  display: flex; flex-direction: column; gap: 2px;
  padding: var(--spacing-8);
}
.shell-drawer__nav:not(:last-child) { border-block-end: 1px solid var(--uems-border-tertiary); }
.shell-drawer__navitem {
  display: flex; align-items: center; width: 100%; padding: 14px 12px;   /* touch target */
  border: 0; background: none; border-radius: var(--radius-md, 8px);
  font: inherit; font-size: var(--font-size-16); color: var(--uems-text-primary);
  text-align: start; cursor: pointer; white-space: nowrap;
}
.shell-drawer__navitem:hover { background: var(--uems-bg-secondary-hover); }
.shell-drawer__navitem.is-active { color: var(--uems-text-accent-link); font-weight: var(--font-weight-semibold); }
/* Live rails (module rail · L1 · L2), relocated here on mobile. Sized to their
   content (override the shell's inline height:100%) so hidden rails collapse and
   a visible L1/L2 shows its natural height under the top-level list. */
.shell-drawer__rails { display: flex; }
.shell-drawer__rails > * { flex: none; height: auto !important; align-self: flex-start; }
`;

function injectCss() {
  const id = 'shell-responsive-css';
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function initShellResponsive(opts) {
  injectCss();

  const {
    root = document.body,
    header = null,
    rails = [],
    collapse = [],
  } = opts || {};

  const railEls = rails.filter(Boolean);
  const collapseEls = collapse.filter(Boolean);

  /* Remember each rail's home so we can restore it when leaving mobile. */
  const homes = new Map();
  railEls.forEach((el) => homes.set(el, { parent: el.parentNode, next: el.nextSibling }));

  /* ── Drawer + backdrop (created once) ── */
  const backdrop = document.createElement('div');
  backdrop.className = 'shell-backdrop';
  const drawer = document.createElement('div');
  drawer.className = 'shell-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Navigation');
  const handle = document.createElement('div');
  handle.className = 'shell-drawer__handle';
  const bodyEl = document.createElement('div');
  bodyEl.className = 'shell-drawer__body';
  const navEl = document.createElement('div');
  navEl.className = 'shell-drawer__nav';
  const railsEl = document.createElement('div');
  railsEl.className = 'shell-drawer__rails';
  bodyEl.append(navEl, railsEl);
  drawer.append(handle, bodyEl);
  document.body.append(backdrop, drawer);

  let _mobile = false;
  let _open = false;

  const setCollapsed = (on) =>
    collapseEls.forEach((el) => (on ? el.setAttribute('collapsed', '') : el.removeAttribute('collapsed')));

  /* Build the drawer's top-level list from the header's tabs. Selecting one
     re-fires the header's own event so the shell's normal handler runs. */
  function renderDrawerNav() {
    const tabs = (header && header.tabs) || [];
    navEl.innerHTML = tabs.map((t) =>
      `<button type="button" class="shell-drawer__navitem${t.active ? ' is-active' : ''}" data-id="${t.id}">${t.label}</button>`
    ).join('');
    navEl.querySelectorAll('[data-id]').forEach((b) => {
      b.addEventListener('click', () => {
        header.dispatchEvent(new CustomEvent('ds-header-nav-tab-select', {
          bubbles: true, composed: true, detail: { id: b.dataset.id },
        }));
        renderDrawerNav();   /* refresh active state (rails update in place) */
      });
    });
  }

  function openNav(open) {
    _open = open && _mobile;
    if (_open) renderDrawerNav();
    root.classList.toggle('is-nav-open', _open);
    backdrop.classList.toggle('is-open', _open);
    drawer.classList.toggle('is-open', _open);
    header?.setMenuOpen?.(_open);
    if (_open) drawer.querySelector('button')?.focus?.();
  }

  function enterMobile() {
    if (_mobile) return;
    _mobile = true;
    root.classList.add('is-mobile');
    setCollapsed(false);                       /* rails show full inside the drawer */
    railEls.forEach((el) => railsEl.appendChild(el));   /* relocate live rails */
    renderDrawerNav();
  }
  function leaveMobile() {
    if (!_mobile) return;
    _mobile = false;
    openNav(false);
    root.classList.remove('is-mobile');
    [...railEls].reverse().forEach((el) => {   /* restore rails to their slots */
      const home = homes.get(el);
      if (home && home.parent) home.parent.insertBefore(el, home.next);
    });
  }

  function applyRange() {
    const isMobile = window.matchMedia(MOBILE).matches;
    const isTablet = window.matchMedia(TABLET).matches;
    root.classList.toggle('is-tablet', isTablet);
    if (isMobile) enterMobile();
    else {
      leaveMobile();
      setCollapsed(isTablet);                  /* tablet → collapse L1/L2; desktop → expand */
    }
  }

  header?.addEventListener('ds-header-nav-menu-toggle', (e) => openNav(!!e.detail?.open));
  backdrop.addEventListener('click', () => openNav(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && _open) openNav(false); });

  window.matchMedia(MOBILE).addEventListener('change', applyRange);
  window.matchMedia(TABLET).addEventListener('change', applyRange);
  applyRange();

  return { isMobile: () => _mobile, openNav, refresh: applyRange, renderDrawerNav };
}
