/* =============================================================================
   <ds-breadcrumb home-icon overflow rtl separator="chevron-right">
     <a href="/">Settings</a>
     <a href="/security">Security</a>
     <a href="/security/policies">Policies</a>
     <span>Password Policy</span>
   </ds-breadcrumb>

   - Wraps each child in <li>, injects separators, marks the last item as current.
   - When `overflow` is set and there are more children than `max-visible` (default 3),
     the middle items collapse into a `···` token; first + last two stay visible.
     Default of 3 means a 4-item trail with `overflow` will collapse, matching the
     spec's `Count=4 Overflow=True` variant.
   - Renders into light DOM so consumer styles + links keep working.
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
/* Register <ds-dropdown-menu> so the overflow `···` button can reuse the real
   dropdown component. */
import '../dropdown-menu/dropdown-menu.js';

/* Auto-load dropdown-menu.css since the breadcrumb now reuses the dropdown
   panel in light DOM. Idempotent — injected once per document. */
if (typeof document !== 'undefined') {
  const id = 'ds-breadcrumb-dd-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL('../dropdown-menu/dropdown-menu.css', import.meta.url).href;
    document.head.appendChild(link);
  }
}

const DEFAULT_SEPARATOR = 'chevron-right';
const RTL_SEPARATOR = 'chevron-left';

export class DsBreadcrumb extends HTMLElement {
  static get observedAttributes() {
    return ['home-icon', 'overflow', 'max-visible', 'separator', 'rtl', 'size', 'disabled'];
  }

  constructor() {
    super();
    this._items = []; // captured original children (in source order)
  }

  connectedCallback() {
    if (!this._mounted) {
      // Capture original children once, then take ownership of rendering.
      this._items = [...this.children].filter((c) => !c.dataset?.dsInternal);
      this._render();
      this._mounted = true;
      /* Responsive: collapse the trail into the "…" overflow when it can't fit
         its container width; re-evaluate whenever the width changes. */
      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(() => this._fit());
        this._ro.observe(this);
      }
      this._fit();
    }
  }

  disconnectedCallback() {
    /* Drop the overflow-menu outside-click listener if we're removed while open. */
    if (this._closeOverflow) this._closeOverflow();
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }

  attributeChangedCallback() {
    if (this._mounted) { this._autoOverflow = false; this._render(); this._fit(); }
  }

  _render() {
    const homeIcon = boolAttr(this, 'home-icon');
    const overflow = boolAttr(this, 'overflow');
    const rtl = boolAttr(this, 'rtl');
    const size = this.getAttribute('size') === 'medium' ? 'medium' : 'small'; /* spec default: small */
    const disabled = boolAttr(this, 'disabled');
    // Spec: collapse when items > 4 — keep the first item, the … trigger,
    // the last 2 ancestors, and the current page.
    const maxVisible = parseInt(this.getAttribute('max-visible') || '4', 10);
    const separator =
      this.getAttribute('separator') ||
      (rtl ? RTL_SEPARATOR : DEFAULT_SEPARATOR);

    this.classList.remove('ds-breadcrumb--small', 'ds-breadcrumb--medium');
    this.classList.add('ds-breadcrumb', `ds-breadcrumb--${size}`);
    if (disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
    this.setAttribute('role', 'navigation');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Breadcrumb');
    }
    if (rtl) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');

    // Decide which items get rendered
    const total = this._items.length;
    /* Collapse when the author sets `overflow` past `max-visible`, OR when the
       responsive fitter decides the trail is too wide (`_autoOverflow`). Either
       way needs ≥4 items to keep first + … + last two. */
    const collapse = ((overflow && total > maxVisible) || this._autoOverflow) && total >= 4;
    let visibleIndices;
    if (collapse) {
      // Spec: first + '…' + last 2 ancestors + current page
      visibleIndices = [0, '...', total - 3, total - 2, total - 1];
    } else {
      visibleIndices = this._items.map((_, i) => i);
    }

    // Detach EVERY captured item from the host first. Otherwise items that
    // aren't selected for this render (e.g. middle items during overflow)
    // stay as leftover light-DOM children and render outside the <ol>.
    this._items.forEach((el) => el.remove());

    // Build a fresh <ol>
    const ol = document.createElement('ol');
    ol.className = 'ds-breadcrumb__list';
    ol.dataset.dsInternal = 'true';

    visibleIndices.forEach((idx, position) => {
      const isLast = position === visibleIndices.length - 1;
      const li = document.createElement('li');

      if (idx === '...') {
        /* Collapsed item: a button that opens the real <ds-dropdown-menu>
           component listing the hidden middle items. */
        li.className = 'ds-breadcrumb__item ds-breadcrumb__item--collapsed';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ds-breadcrumb__overflow-btn';
        btn.setAttribute('aria-label', 'Show hidden breadcrumbs');
        btn.setAttribute('aria-haspopup', 'menu');
        btn.setAttribute('aria-expanded', 'false');
        /* more-horizontal icon: 12px Small, 20px Medium (drawn values — flag 4) */
        btn.innerHTML = `<ds-icon name="more-horizontal" size="${size === 'medium' ? 20 : 12}"></ds-icon>`;

        const dd = document.createElement('ds-dropdown-menu');
        dd.setAttribute('type', 'default');
        dd.classList.add('ds-breadcrumb__overflow-dd');

        /* Hidden indices = everything between first (0) and last two
           (total-2, total-1). For total=5: hidden = [1, 2]. */
        const hiddenIndices = [];
        for (let i = 1; i < total - 3; i++) hiddenIndices.push(i);
        dd.items = hiddenIndices.map((hIdx) => {
          const src = this._items[hIdx];
          /* Prefer the cached full label — a middle-truncated ancestor holds
             lead/tail spans, and textContent would work but bcLabel is exact. */
          const raw = (src.dataset.bcLabel != null ? src.dataset.bcLabel : (src.textContent || '')).trim();
          return {
            label: raw || 'Item',
            value: String(hIdx),
          };
        });

        const closeDd = () => {
          dd.removeAttribute('open');
          btn.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', onDocClick, true);
          this._closeOverflow = null;
        };
        const openDd = () => {
          dd.setAttribute('open', '');
          btn.setAttribute('aria-expanded', 'true');
          document.addEventListener('click', onDocClick, true);
          /* Tracked so disconnectedCallback can drop this document listener if the
             breadcrumb is removed while the overflow menu is still open. */
          this._closeOverflow = closeDd;
        };
        const onDocClick = (e) => {
          if (!li.contains(e.target)) closeDd();
        };
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (dd.hasAttribute('open')) closeDd(); else openDd();
        });
        /* Forward selection to the original hidden item: navigate if it's a
           link, otherwise dispatch a click so consumer handlers fire. */
        dd.addEventListener('ds-dropdown-select', (e) => {
          const hIdx = parseInt(e.detail?.value, 10);
          const src = this._items[hIdx];
          if (src && src.tagName === 'A' && src.getAttribute('href')) {
            window.location.assign(src.getAttribute('href'));
          } else if (src) {
            src.click();
          }
          closeDd();
        });
        dd.addEventListener('ds-dropdown-close', closeDd);

        li.appendChild(btn);
        li.appendChild(dd);
      } else {
        const original = this._items[idx];
        li.className = 'ds-breadcrumb__item' + (isLast ? ' ds-breadcrumb__item--current' : '');

        // Optional home icon on the very first rendered item
        if (idx === 0 && homeIcon) {
          const home = document.createElement('span');
          home.className = 'ds-breadcrumb__home';
          home.innerHTML = `<ds-icon name="home" size="${size === 'medium' ? 16 : 14}"></ds-icon>`;
          li.appendChild(home);
        }

        // Move the original element into the <li>. Using move (not clone) keeps
        // any consumer event listeners attached.
        li.appendChild(original);

        if (isLast) {
          original.setAttribute('aria-current', 'page');
          this._unsplitLabel(original);        // current page uses plain end-ellipsis
        } else {
          original.removeAttribute('aria-current');
          this._splitLabel(original);          // ancestors middle-truncate
        }
      }

      ol.appendChild(li);

      // Separator after every non-last item
      if (!isLast) {
        const sep = document.createElement('span');
        sep.className = 'ds-breadcrumb__separator';
        sep.setAttribute('aria-hidden', 'true');
        sep.innerHTML = `<ds-icon name="${separator}" size="12"></ds-icon>`;
        ol.appendChild(sep);
      }
    });

    // Replace any previous internal render; preserve nothing from before.
    this.querySelectorAll('[data-ds-internal]').forEach((n) => n.remove());
    this.appendChild(ol);
  }

  /* Middle-truncation: split an ancestor label into a lead + tail span so CSS can
     ellipsize the lead while pinning the tail — "Threats & Patches" → "Threa…tches".
     The full text stays in the DOM (both spans), so the accessible name and the
     overflow-menu label are unaffected; only the CSS-clipped lead hides mid-word.
     Idempotent: the original text is cached on the element so repeated renders
     (overflow toggles, attribute changes) rebuild from the source, never double-wrap. */
  _splitLabel(el) {
    if (!el) return;
    const full = (el.dataset.bcLabel != null) ? el.dataset.bcLabel : (el.textContent || '').trim();
    el.dataset.bcLabel = full;
    /* Short labels never split — no ellipsis is ever needed. Tail keeps up to the
       last 5 chars (half the label for shorter ones) so the ending stays legible. */
    const tail = full.length > 8 ? Math.min(5, Math.floor(full.length / 2)) : 0;
    if (!tail) { el.textContent = full; if (el.title === full) el.removeAttribute('title'); return; }
    const lead = document.createElement('span');
    lead.className = 'ds-breadcrumb__label-lead';
    lead.textContent = full.slice(0, full.length - tail);
    const tl = document.createElement('span');
    tl.className = 'ds-breadcrumb__label-tail';
    tl.textContent = full.slice(full.length - tail);
    el.textContent = '';
    el.append(lead, tl);
    el.title = full;   /* full label on hover, since it may be clipped */
  }

  /* Restore a plain text label (used when an item becomes the current page). */
  _unsplitLabel(el) {
    if (!el || el.dataset.bcLabel == null) return;
    el.textContent = el.dataset.bcLabel;
    el.removeAttribute('title');
  }

  /* Responsive fitter: if the rendered trail overflows the host width, collapse
     into the "…" form; if it fits again with room, expand back. Hysteresis (a
     re-measure before expanding) prevents flip-flopping at the threshold. The
     author's explicit `overflow` attribute is left untouched. */
  _fit() {
    if (this._fitting || !this._mounted) return;
    if (boolAttr(this, 'overflow') || this._items.length < 4) return;
    this._fitting = true;
    requestAnimationFrame(() => {
      this._fitting = false;
      const overflowing = this.scrollWidth > this.clientWidth + 1;
      if (overflowing && !this._autoOverflow) {
        this._autoOverflow = true;
        this._render();
      } else if (!overflowing && this._autoOverflow) {
        this._autoOverflow = false;
        this._render();
        requestAnimationFrame(() => {
          if (this.scrollWidth > this.clientWidth + 1) { this._autoOverflow = true; this._render(); }
        });
      }
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-breadcrumb')) {
  customElements.define('ds-breadcrumb', DsBreadcrumb);
}
