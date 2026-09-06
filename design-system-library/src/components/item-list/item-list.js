/* =============================================================================
   <ds-item-list variant="default|timeline" timeline-marker="dot|icon"
                 divider="none|line|dashed" size="small|medium" rtl>
     <ds-item lead="circle" status="critical" icon="exclamation-circle"
              text="23 devices pending enrollment"
              meta="Security · 3 mins ago">
       <ds-text-link slot="trailing" href="#">Approve</ds-text-link>
     </ds-item>
   </ds-item-list>

   A stacked list of things — activity, approvals, search hits, release notes,
   execution steps. Three regions per row: a LEADING RAIL, CONTENT, and TRAILING.
   Replaces eight hand-rolled copies of the same shape across the product
   (.hd-act-row, .act-row, .wl-row ×16, .pu-item, .as-row, .srch-row, .tl-node —
   23 files; see item-list.md for the audit and the gaps that remain).

   `variant="timeline"` keeps the identical DOM and only re-dresses the rail, plus
   a connector drawn between rows. `timeline-marker` picks the marker: `dot` (the
   default) or `icon`, a glyph in a status-tinted disc. It is a container choice,
   not a per-item one — the connector must meet every marker, so they share a
   width. Split it into its
   own component the day timeline needs opposite-rail timestamps, date-group
   headers, collapsible ranges, or a horizontal axis — those change the anatomy,
   not the skin.

   Rows are NOT clickable and NOT focusable. The row hover (and :focus-within)
   exists to say "this action belongs to this row"; the only click target is the
   trailing control, which must be a real link or button. There is deliberately
   no selection model — bulk-select is ds-data-table's job.

   Items come from slotted <ds-item> children OR the `items` property:

     list.items = [{ text, description, icon, status, lead, meta, href,
                     badge:    'Security' | { text, state, variant, icon },
                     trailing: '412' | { text } | { badge },   // a VALUE, not a control
                     link:     'Read more' | { text, href, icon },  // inline, ends the body
                     output:   'stdout…', mono: true,          // command output block
                     action:   { text, actionId, href, icon, variant, size } }];

   Control sizes follow the list's density: size="small" drops the action button to
   xsmall and the trailing badge to small. ds-text-link and ds-badge have no xsmall,
   so those hold at small. Any `size` you pass explicitly wins.

   A row's trailing control is a LINK when it navigates (action.href) and a BUTTON
   when it acts — the button path is what fires ds-item-action.

   Events:
     - ds-item-action   detail: { actionId, value, item }   (trailing control)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import { escapeHtml } from '../../utils/escape.js';
import { injectCss } from '../../utils/inject-css.js';
import '../../icons/icon.js';
/* Rendered by the `items` path (badges in meta, links in trailing) — declared so
   the elements upgrade when this component is loaded on its own. */
import '../badge/badge.js';
import '../text-link/text-link.js';
import '../button/button.js';
injectCss('ds-item-list-badge-css', '../badge/badge.css', import.meta.url);
injectCss('ds-item-list-textlink-css', '../text-link/text-link.css', import.meta.url);
injectCss('ds-item-list-button-css', '../button/button.css', import.meta.url);

const VARIANTS = ['default', 'timeline'];
const DIVIDERS = ['none', 'line', 'dashed'];
const SIZES = ['small', 'medium'];
/* Leading-rail treatments, one per shape the product already hand-rolls:
   circle = tinted status disc (.hd-act-row) · plain = bare glyph (.wl-row,
   .pu-item) · box = rounded tile (.as-row, .srch-row) · dot = timeline node
   (.tl-node) · none = no rail, for text-forward records. */
const LEADS = ['circle', 'plain', 'box', 'dot', 'none'];
/* Timeline marker: a bare dot, or an icon in a tinted disc. Container-level, not
   per-item — the connector needs ONE marker width down the whole list, or the
   line stops meeting the markers it connects. */
const MARKERS = ['dot', 'icon'];
const STATUSES = ['default', 'info', 'success', 'warning', 'critical'];
const META_POS = ['below', 'above'];
/* ds-badge owns the status chip — we never re-tint one by hand. Its state
   vocabulary differs from ours, so map it: a consumer sets status once on the row
   and the badge follows, unless they name a state explicitly. */
const STATUS_TO_BADGE_STATE = {
  default: 'default', info: 'active', success: 'success',
  warning: 'important', critical: 'critical',
};

export class DsItemList extends HTMLElement {
  static get observedAttributes() { return ['variant', 'divider', 'size', 'rtl', 'timeline-marker']; }

  constructor() {
    super();
    /* A framework may set .items before upgrade — capture and replay it. */
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items;
      delete this.items;
      this._pendingItems = v;
    }
    this._items = null; // null → render slotted children instead
  }

  connectedCallback() {
    this._initialChildren = [...this.children].filter(
      (c) => c.tagName && c.tagName.toLowerCase() === 'ds-item'
    );
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    if (this._pendingItems !== undefined) {
      this.items = this._pendingItems;
      this._pendingItems = undefined;
    }
    this._render();
    /* Frameworks insert <ds-item> after upgrade; _render has already consumed the
       initial set, so merge late arrivals and drop the now-redundant nodes. */
    watchLateChildren(this, (late) => {
      const rows = late.filter((n) => n.tagName && n.tagName.toLowerCase() === 'ds-item');
      if (!rows.length) return;
      this._initialChildren.push(...rows);
      rows.forEach((n) => n.remove());
      this._slottedSource = null;   // new children to parse
      this._render();
    });
  }

  disconnectedCallback() { stopLateChildren(this); }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* `variant` and `timeline-marker` decide each row's LEADING RAIL, and `size`
       decides the size of the CONTROLS inside it — a class repaint alone would
       leave a stale marker, or a small-density row holding a medium button.
       `divider` and `rtl` really are chrome: repaint the class list rather than
       re-parsing every ds-icon/ds-badge and dropping a slotted trailing control. */
    if (name === 'variant' || name === 'timeline-marker' || name === 'size') this._render();
    else this._paintChrome();
  }

  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v.slice() : null;
    if (this._root) this._render();
  }

  /* Slotted regions are single-use: once moved into a row they no longer live on
     the <ds-item>. `rest` nodes are the same. Both are held by _slottedSource. */

  /* Only meaningful in the timeline variant; `dot` keeps the original look. */
  _timelineMarker() { return enumAttr(this, 'timeline-marker', MARKERS, 'dot'); }

  /* Control sizes for the current density, resolved in ONE place so the row and
     the controls in it can never disagree.

     Note the floors: ds-button goes down to `xsmall`, but ds-text-link and
     ds-badge stop at `small` — so those hold at `small` in a small list rather
     than being given a size they do not define (which would silently fall back
     to their own default and render LARGER than the medium case). */
  _controlSizes() {
    const small = enumAttr(this, 'size', SIZES, 'medium') === 'small';
    return {
      button: small ? 'xsmall' : 'small',
      link: 'small',                          // ds-text-link has no xsmall
      trailingBadge: small ? 'small' : 'medium',
      metaBadge: 'small',
    };
  }

  _paintChrome() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'default');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    /* A connector already separates timeline rows — a divider on top of it reads
       as a second, competing rule, so the variant wins over the attribute. */
    const divider = variant === 'timeline'
      ? 'none'
      : enumAttr(this, 'divider', DIVIDERS, 'none');
    this._root.className = `ds-item-list ds-item-list--${variant}`
      + ` ds-item-list--${size} ds-item-list--divider-${divider}`
      + (variant === 'timeline' ? ` ds-item-list--timeline-${this._timelineMarker()}` : '');
    this._root.setAttribute('role', 'list');
    if (boolAttr(this, 'rtl')) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');
  }

  /* Read one row's config off a <ds-item> element, so slotted children and the
     `items` property converge on a single shape before rendering. */
  _fromElement(el) {
    const attr = (n) => (el.hasAttribute(n) ? el.getAttribute(n) : undefined);
    return {
      text: attr('text'),
      description: attr('description'),
      icon: attr('icon'),
      status: attr('status'),
      lead: attr('lead'),
      meta: attr('meta'),
      metaPosition: attr('meta-position'),
      href: attr('href'),
      value: attr('value'),
      disabled: el.hasAttribute('disabled'),
      /* Slotted regions are MOVED, not serialised — they are live ds-badge /
         ds-text-link elements with their own listeners and upgrade state. */
      slots: {
        leading: el.querySelector('[slot="leading"]'),
        meta: el.querySelector('[slot="meta"]'),
        trailing: el.querySelector('[slot="trailing"]'),
      },
      /* Anything left over is free-form body content (e.g. .pu-item's inline link). */
      rest: [...el.childNodes].filter(
        (n) => !(n.nodeType === 1 && n.hasAttribute && n.hasAttribute('slot'))
      ),
    };
  }

  _render() {
    if (!this._root) return;
    this._paintChrome();
    this._root.innerHTML = '';

    /* Parse slotted <ds-item> children ONCE. _fromElement is destructive — it
       MOVES the slotted nodes out and strips their `slot` attribute — so parsing
       again on a re-render would read an emptied <ds-item> and silently drop the
       consumer's trailing control. The cached entry keeps live references, and
       appendChild simply moves them into the new row. */
    if (this._items === null && !this._slottedSource) {
      this._slottedSource = (this._initialChildren || []).map((el) => this._fromElement(el));
    }
    const source = this._items !== null ? this._items : this._slottedSource;

    source.forEach((raw, idx) => {
      const it = raw || {};
      const row = this._renderRow(it, idx);
      this._root.appendChild(row);
      /* Name AFTER appending: ds-button / ds-text-link only render their real
         <button>/<a> once connected. Naming during construction put the label on
         the custom-element host, which forwards nothing — so the row subject was
         silently lost for every action built from data. */
      this._nameTrailingControl(row, it);
    });
  }

  _renderRow(it, idx) {
    const variant = enumAttr(this, 'variant', VARIANTS, 'default');
    /* Timeline rows take their rail from the container's marker, never from the
       item: the connector needs one fixed anchor width, and mixing rail shapes
       down a timeline breaks the line's alignment. `icon` reuses the circle rail
       so the status tints apply unchanged; the timeline CSS only repositions it. */
    const lead = variant === 'timeline'
      ? (this._timelineMarker() === 'icon' ? 'circle' : 'dot')
      : (LEADS.includes(it.lead) ? it.lead : (it.icon ? 'circle' : 'none'));
    const status = STATUSES.includes(it.status) ? it.status : 'default';
    const metaPos = META_POS.includes(it.metaPosition) ? it.metaPosition : 'below';

    const li = document.createElement('div');
    li.className = `ds-item ds-item--lead-${lead} ds-item--status-${status}`;
    li.setAttribute('role', 'listitem');
    if (it.disabled) li.setAttribute('aria-disabled', 'true');
    if (it.value != null) li.dataset.value = String(it.value);
    li.dataset.index = String(idx);

    /* ---- leading rail --------------------------------------------------
       aria-hidden: the glyph restates what the text already says, and status
       is never carried by colour alone — the text or a badge carries it. */
    if (lead !== 'none' || it.slots?.leading) {
      const railEl = document.createElement('span');
      railEl.className = 'ds-item__lead';
      railEl.setAttribute('aria-hidden', 'true');
      if (it.slots?.leading) {
        railEl.appendChild(it.slots.leading);
        it.slots.leading.removeAttribute('slot');
      } else if (lead === 'dot') {
        railEl.innerHTML = '<span class="ds-item__dot"></span>';
      } else if (it.icon) {
        railEl.innerHTML = `<ds-icon name="${escapeHtml(it.icon)}" size="16"></ds-icon>`;
      }
      li.appendChild(railEl);
    }

    /* ---- content -------------------------------------------------------- */
    const body = document.createElement('div');
    body.className = 'ds-item__body';

    const metaEl = (it.meta || it.badge || it.slots?.meta) ? document.createElement('div') : null;
    if (metaEl) {
      metaEl.className = 'ds-item__meta';
      if (it.slots?.meta) {
        metaEl.appendChild(it.slots.meta);
        it.slots.meta.removeAttribute('slot');
      }
      /* A status chip belongs to ds-badge — see _renderBadge. It leads the strip,
         matching the slotted case, where the badge is moved in before the text. */
      /* small in the meta strip — it sits among 12px text and must not shout. */
      if (it.badge) metaEl.appendChild(this._renderBadge(it.badge, status, this._controlSizes().metaBadge));
      /* textContent, not an HTML sink: meta carries usernames and device names. */
      if (it.meta) {
        const span = document.createElement('span');
        span.className = 'ds-item__meta-text';
        span.textContent = it.meta;
        metaEl.appendChild(span);
      }
    }
    if (metaEl && metaPos === 'above') body.appendChild(metaEl);

    if (it.text != null) {
      const textEl = document.createElement(it.href ? 'a' : 'div');
      textEl.className = 'ds-item__text';
      if (it.href) textEl.setAttribute('href', it.href);
      textEl.textContent = it.text;   // textContent, never an HTML sink
      body.appendChild(textEl);
    }
    if (it.description != null) {
      const d = document.createElement('div');
      d.className = 'ds-item__description';
      d.textContent = it.description;
      body.appendChild(d);
    }
    /* Command / script output (.tl-out). Its own region rather than a flag on
       description, because it needs `white-space: pre-wrap` — newlines and
       alignment ARE the content — plus a surface to sit on. */
    if (it.output != null && it.output !== '') {
      const out = document.createElement('div');
      out.className = 'ds-item__output' + (it.mono ? ' ds-item__output--mono' : '');
      out.textContent = it.output;   // textContent: this is program output
      body.appendChild(out);
    }
    if (metaEl && metaPos === 'below') body.appendChild(metaEl);

    /* Inline body link (.pu-item__more) — "Read more" belongs at the END OF THE
       CONTENT it continues, not in the trailing column. Trailing is for an action
       on the row; this is the row's own text carrying on. */
    if (it.link) body.appendChild(this._renderBodyLink(it.link));

    /* Free-form body content (the inline "Read more" link in .pu-item). */
    (it.rest || []).forEach((n) => {
      if (n.nodeType === 3 && !n.textContent.trim()) return;  // drop whitespace
      body.appendChild(n);
    });

    li.appendChild(body);

    /* ---- trailing -------------------------------------------------------
       The ONLY click target in the row. From a slot it arrives as a live element
       and keeps its own semantics; from `items` we build the same thing so the
       data path is not second-class. Either way it is a real <a>/<button>. */
    const action = it.action && (it.action.text || it.action.icon) ? it.action : null;
    /* A row can END in something that is not an action: a count, a read time, a
       status chip (.wl-row, .srch-row). That is a value, not a control — it gets
       no aria-label, no focus, no pointer. */
    const value = (it.trailing !== undefined && it.trailing !== null && it.trailing !== '')
      ? it.trailing : null;
    if (it.slots?.trailing || action || value !== null) {   // `value !== null`: 0 is a real count
      const tr = document.createElement('span');
      tr.className = 'ds-item__trailing';
      if (it.slots?.trailing) {
        tr.appendChild(it.slots.trailing);
        it.slots.trailing.removeAttribute('slot');
      } else {
        /* Value first, action last — the action is the row's rightmost affordance
           in every call site that has both. */
        if (value !== null) tr.appendChild(this._renderTrailingValue(value, status));
        if (action) tr.appendChild(this._renderAction(action, it, idx));
      }
      /* Name the action with its subject: "Approve" alone is meaningless in a
         screen reader's control list, where rows give no context. */
      li.appendChild(tr);
    }

    return li;
  }

  /* Build the meta-strip status chip. Always a real <ds-badge> — the component
     already owns these tints, so hand-rolling an equivalent here would fork them.
     `badge` may be a plain string (inherits the row's status) or an object. */
  _renderBadge(badge, status, defaultSize) {
    const spec = typeof badge === 'string' ? { text: badge } : (badge || {});
    const el = document.createElement('ds-badge');
    el.setAttribute('variant', spec.variant || 'subtle');
    el.setAttribute('state', spec.state || STATUS_TO_BADGE_STATE[status] || 'default');
    /* Size is positional: a chip in the meta strip is an aside, but a chip in the
       trailing column is the row's headline value and matches .wl-row's medium.
       An explicit `size` still wins. */
    el.setAttribute('size', spec.size || defaultSize || 'small');
    if (spec.icon) el.setAttribute('icon', spec.icon);
    /* `label`, not textContent — ds-badge re-renders its own chrome. */
    if (spec.text) el.setAttribute('label', spec.text);
    return el;
  }

  /* The inline continuation link. Mirrors .pu-item__more: a small primary
     ds-text-link with a trailing chevron, so it reads as "keep going" rather than
     as a button. Pass `icon: null` to drop the chevron. */
  _renderBodyLink(link) {
    const spec = typeof link === 'string' ? { text: link } : (link || {});
    const wrap = document.createElement('div');
    wrap.className = 'ds-item__link';
    const el = document.createElement('ds-text-link');
    el.setAttribute('href', spec.href || '#');
    el.setAttribute('variant', 'primary');
    el.setAttribute('size', spec.size || this._controlSizes().link);
    if (spec.icon !== null) el.setAttribute('trailing-icon', spec.icon || 'chevron-right');
    /* `label`, not textContent — ds-text-link re-renders its own chrome. */
    el.setAttribute('label', spec.text || 'Read more');
    wrap.appendChild(el);
    return wrap;
  }

  /* Give the trailing control its subject: "Approve" alone is meaningless in a
     screen reader's list of controls, where rows give no context. Only real
     controls are named — a trailing value is data and is not announced as one. */
  _nameTrailingControl(row, it) {
    if (!it.text) return;
    const tr = row.querySelector('.ds-item__trailing');
    if (!tr) return;
    const ctl = tr.querySelector('a, button');
    if (!ctl || ctl.getAttribute('aria-label')) return;
    const own = (ctl.textContent || '').trim();
    if (own) ctl.setAttribute('aria-label', `${own} — ${it.text}`);
  }

  /* Build a non-interactive trailing value: a plain string, `{ text }`, or
     `{ badge }` for a chip. ds-badge owns chips, so we delegate rather than
     re-tint one here. */
  _renderTrailingValue(spec, status) {
    const o = typeof spec === 'string' || typeof spec === 'number' ? { text: String(spec) } : (spec || {});
    /* medium in the trailing column — it stands in for a value, not a footnote. */
    if (o.badge) return this._renderBadge(o.badge, status, this._controlSizes().trailingBadge);
    const el = document.createElement('span');
    el.className = 'ds-item__value';
    el.textContent = o.text == null ? '' : String(o.text);
    return el;
  }

  /* Build the trailing control for the `items` path. A link when it navigates, a
     button when it acts — never a div with a handler, so keyboard and the
     browser's own affordances come for free. */
  _renderAction(action, it, idx) {
    const nav = !!action.href;
    const sizes = this._controlSizes();
    const el = document.createElement(nav ? 'ds-text-link' : 'ds-button');
    if (nav) {
      el.setAttribute('href', action.href);
      el.setAttribute('size', action.size || sizes.link);
    } else {
      el.setAttribute('variant', action.variant || 'tertiary');
      el.setAttribute('size', action.size || sizes.button);
    }
    if (action.icon) el.setAttribute('icon', action.icon);
    /* `label`, not textContent: both ds-button and ds-text-link re-render their
       own chrome, and a textContent write on the host is wiped by that render. */
    if (action.text) el.setAttribute('label', action.text);
    if (!nav) {
      el.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('ds-item-action', {
          bubbles: true,
          composed: true,
          detail: { actionId: action.actionId ?? null, value: it.value ?? null, item: it, index: idx },
        }));
      });
    }
    return el;
  }
}

/* Declarative shell — the parent <ds-item-list> reads its attributes and slotted
   regions and renders the real row. Hidden so it never double-renders. */
export class DsItem extends HTMLElement {
  connectedCallback() { this.style.display = 'none'; }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-item-list')) {
  customElements.define('ds-item-list', DsItemList);
}
if (typeof customElements !== 'undefined' && !customElements.get('ds-item')) {
  customElements.define('ds-item', DsItem);
}
