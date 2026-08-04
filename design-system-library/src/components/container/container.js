/* =============================================================================
   <ds-container variant="outline" tone="warning" padding="lg" radius="xl"
            elevation="md" interactive selected stack="md" gap="md" align="start">
     …any content…
   </ds-container>

   - Light-DOM: the host carries `.ds-container` and reflects attributes to data-*;
     children are NEVER touched (no innerHTML rewrite) — safe to wrap anything.
   - 100% token-driven (spacing / radius / colour / shadow tokens). No fixed size.
   - Every knob is ALSO a public CSS var (--ds-container-pad / -radius / -bg / -border /
     -border-width / -shadow / -gap) so any value can be fine-tuned inline without
     writing custom card CSS.
   - Attributes:
       padding     none | xs | sm | md (default) | lg | xl
       radius      none | sm | md | lg (default) | xl | 2xl | full
       variant     outline (default) | filled | subtle | ghost | elevated
       tone        accent | success | warning | error | info | alert   (status tint)
       elevation   none | xs | sm | md | lg | xl                       (token shadow)
       interactive boolean — clickable hover lift (+ focus ring)
       selected    boolean — accent ring (selected/active state)
       stack       boolean/− turn into a flex COLUMN with a token gap
       row         boolean — turn into a flex ROW with a token gap
       gap         none | xs | sm | md | lg     (gap for stack/row)
       align       start | center | stretch     (cross-axis for stack/row)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

/* Self-inject the component stylesheet so the card is styled even on pages that
   don't pull the full bundle — resolved relative to this module. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-container-css', './container.css');

const PADS     = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];
const RADII    = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
const VARIANTS = ['outline', 'filled', 'subtle', 'ghost', 'elevated'];
const TONES    = ['accent', 'success', 'warning', 'error', 'info', 'alert'];
const ELEVS    = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];
const GAPS     = ['none', 'xs', 'sm', 'md', 'lg'];
const ALIGNS   = ['start', 'center', 'stretch'];

export class DsContainer extends HTMLElement {
  static get observedAttributes() {
    return ['padding', 'radius', 'variant', 'tone', 'elevation', 'interactive', 'selected', 'stack', 'row', 'gap', 'align'];
  }

  connectedCallback() { this._apply(); this._mounted = true; }
  attributeChangedCallback() { if (this._mounted) this._apply(); }

  _setData(key, attr, allowed, fallback) {
    if (this.hasAttribute(attr)) this.dataset[key] = enumAttr(this, attr, allowed, fallback);
    else delete this.dataset[key];
  }

  _apply() {
    this.classList.add('ds-container');
    this.dataset.pad = enumAttr(this, 'padding', PADS, 'md');
    this.dataset.radius = enumAttr(this, 'radius', RADII, 'lg');
    this.dataset.variant = enumAttr(this, 'variant', VARIANTS, 'outline');
    this._setData('tone', 'tone', TONES, 'accent');
    this._setData('elev', 'elevation', ELEVS, 'none');
    this._setData('gap', 'gap', GAPS, 'md');
    this._setData('align', 'align', ALIGNS, 'start');
    this.classList.toggle('ds-container--interactive', boolAttr(this, 'interactive'));
    this.classList.toggle('ds-container--selected', boolAttr(this, 'selected'));
    /* stack / row are layout booleans (presence = on) */
    if (this.hasAttribute('stack')) this.dataset.stack = ''; else delete this.dataset.stack;
    if (this.hasAttribute('row')) this.dataset.row = ''; else delete this.dataset.row;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-container')) {
  customElements.define('ds-container', DsContainer);
}
