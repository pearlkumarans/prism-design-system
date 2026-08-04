/* =============================================================================
   <ds-icon name="chevron-down" size="20"></ds-icon>
   Renders an inline SVG referencing the sprite. Inherits color via currentColor.
   The sprite path is configurable via window.UEMS_ICON_SPRITE (default "/icons.svg").

   ─── PHASE 0 PILOT: opt-in font-icon mode ──────────────────────────────────
   Default rendering is unchanged (SVG sprite). When font mode is ON *and* the
   icon name is in FONT_ICON_MAP, ds-icon renders a Prism-font glyph instead —
   sized by font-size (size px → 1em box), coloured by currentColor, exactly
   like the SVG. Any name NOT in the map falls back to SVG, so the whole product
   keeps working while only the piloted icons switch. Enable with either:
     • window.UEMS_ICON_MODE = 'font'        (whole page)   or
     • <ds-icon render-mode="font" …>        (single icon)
   Font CSS path is configurable via window.UEMS_ICON_FONT_CSS.
   ============================================================================= */

const DEFAULT_SPRITE = '/icons.svg';
const DEFAULT_FONT_CSS = '/prism-font/css/icons.css';

/* Size calibration for font mode. Measured: full-bleed SVG icons occupy ~0.80 of
   their 20×20 viewBox while the matching font glyphs occupy ~0.805 of the em — so
   the two are near-identical and only a light trim is needed for optical parity
   (a few glyphs, e.g. ✕, sit slightly larger). The glyph is scaled to
   size×FONT_SCALE and centered inside a size×size box, so the icon's LAYOUT
   footprint stays exactly `size` px (matching the SVG) regardless of the trim.
   Override globally via window.UEMS_ICON_FONT_SCALE. */
const FONT_SCALE = 0.92;

/* Pilot set — maps the ds-icon sprite `name` → Prism-font class name. Only these
   render as glyphs in font mode; everything else stays SVG. Most names match 1:1;
   a couple are aliased where the font uses a different label. */
const FONT_ICON_MAP = {
  delete: 'delete',
  edit: 'edit',
  filter: 'filter',
  add: 'add',
  'add-circle': 'add-circle',
  refresh: 'refresh',
  'more-vertical': 'more-vertical',
  'more-horizontal': 'more-horizontal',
  search: 'search',
  'chevron-down': 'chevron-down',
  check: 'tick',     // font labels the checkmark "tick"
  close: 'cancel',   // font labels the ✕ "cancel"
};

/* Inject the Prism-font stylesheet once, lazily (only when font mode is first
   used). Idempotent — mirrors how components self-load their transitive CSS. */
function ensureFontCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ds-icon-prism-font-css')) return;
  const href = (typeof window !== 'undefined' && window.UEMS_ICON_FONT_CSS) || DEFAULT_FONT_CSS;
  const l = document.createElement('link');
  l.id = 'ds-icon-prism-font-css';
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}

function fontModeOn(el) {
  const attr = el.getAttribute('render-mode');           // per-icon override
  if (attr) return attr === 'font';
  return typeof window !== 'undefined' && window.UEMS_ICON_MODE === 'font';  // page-wide
}

export class DsIcon extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'size', 'render-mode'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const name = this.getAttribute('name') || '';
    const size = this.getAttribute('size') || '20';

    this.style.display = 'inline-flex';
    this.style.lineHeight = '0';
    this.setAttribute('aria-hidden', 'true');

    // ── Font mode (pilot) — glyph box = 1em = size px, colour = currentColor ──
    const fontName = FONT_ICON_MAP[name];
    if (fontName && fontModeOn(this)) {
      ensureFontCss();
      const px = parseFloat(size) || 20;
      const scale = (typeof window !== 'undefined' && window.UEMS_ICON_FONT_SCALE) || FONT_SCALE;
      const glyph = px * scale;
      /* Glyph scaled + centered inside a size×size box → same footprint as the SVG,
         and vertical-centered (not baseline-hung) so it aligns in any container. */
      this.innerHTML =
        `<i class="prism ${fontName}" aria-hidden="true" style="` +
        `font-size:${glyph}px;line-height:1;width:${px}px;height:${px}px;` +
        `display:inline-flex;align-items:center;justify-content:center"></i>`;
      return;
    }

    // ── Default: SVG sprite (unchanged) ──
    const sprite = (typeof window !== 'undefined' && window.UEMS_ICON_SPRITE) || DEFAULT_SPRITE;
    this.innerHTML = `
      <svg width="${size}" height="${size}" focusable="false" aria-hidden="true">
        <use href="${sprite}#icon-${name}"></use>
      </svg>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-icon')) {
  customElements.define('ds-icon', DsIcon);
}
