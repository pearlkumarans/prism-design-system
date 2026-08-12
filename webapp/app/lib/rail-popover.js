/**
 * rail-popover — the small anchored notification cards opened by the right-pane
 * Update / Review / Road map icons. In the vanilla shell these live inline in
 * Shell.html (#upd-pop + toggleCard); ported here so those icons show the correct
 * card instead of wrongly opening the full Product Updates drawer.
 *
 * A single body-level, position:fixed popover (outside .shell-area, so no scroll
 * container → no jerk). Built from Prism components + tokens. English content
 * (the app default); the vanilla Arabic variants can be layered on later.
 */
const UPDATE = {
  badge: 'Recommended',
  title: 'Hotfix available — build 11.5.2605.22',
  desc: 'A hotfix for Endpoint Central 11 is ready. Upgrading to the latest build is recommended.',
  primary: 'Download now',
  link: 'View release notes',
};
const REVIEW = {
  title: 'Review & Earn',
  desc: 'Love Endpoint Central? Have your friends try it out — they can manage up to <strong>75 devices free.</strong>',
  primary: 'Review now',
  secondary: 'Need assistance?',
  dismiss: "Don't show again",
};
const ROADMAP = {
  title: 'Roadmap',
  links: ['Public product roadmap', "What's new — changelog", 'Planned & in-progress', 'Submit a feature request'],
};

export class RailPopover {
  constructor(rpEl) {
    this.rpEl = rpEl;
    this.el = null;
    this.card = null;
    this.anchorId = null;
  }

  _host() {
    if (!this.el) {
      this.el = document.createElement('div');
      this.el.className = 'upd-pop';
      document.body.appendChild(this.el);
      // Close on outside click (but not clicks on the rail — it owns the toggle) + Esc.
      document.addEventListener('click', (e) => {
        if (!this.isOpen() || this.el.contains(e.target)) return;
        if (e.target.closest && e.target.closest('ds-right-pane')) return;
        this.hide();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hide(); });
    }
    return this.el;
  }

  isOpen() { return !!this.el && this.el.classList.contains('open'); }
  hide() { if (this.el) this.el.classList.remove('open'); this.card = null; }

  // Re-clicking the open card closes it; otherwise (re)render + open.
  toggle(kind) {
    if (this.isOpen() && this.card === kind) { this.hide(); return; }
    const el = this._host();
    if (kind === 'review') { this.anchorId = 'review'; el.className = 'upd-pop'; el.innerHTML = this._reviewHtml(); }
    else if (kind === 'roadmap') { this.anchorId = 'roadmap'; el.className = 'upd-pop upd-pop--narrow'; el.innerHTML = this._roadmapHtml(); }
    else { this.anchorId = 'update'; el.className = 'upd-pop'; el.innerHTML = this._updateHtml(); }
    this.card = kind;
    el.querySelector('[data-upd-close]')?.addEventListener('click', () => this.hide());
    el.classList.add('open');
    this._position();
  }

  // Anchor to the clicked rail icon: rail sits far-right → card opens to its left.
  _position() {
    const btn = this.rpEl?.querySelector(`button[data-id="${this.anchorId}"]`);
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const w = this.el.offsetWidth || 456;
    const gap = 12;
    let left = Math.max(12, Math.min(r.left - w - gap, window.innerWidth - w - 12));
    const h = this.el.offsetHeight || 180;
    const top = Math.max(12, Math.min(r.top, window.innerHeight - h - 12));
    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  _updateHtml() {
    const d = UPDATE;
    return `<div class="upd-card upd-card--rec">
      <div class="upd-card__icon"><ds-icon name="refresh" size="20"></ds-icon></div>
      <ds-icon-button class="upd-card__close" data-upd-close icon="close" label="Dismiss" type="tertiary-grey" size="small"></ds-icon-button>
      <div class="upd-card__body">
        <div class="upd-card__badge"><ds-badge variant="subtle" state="important" size="medium" shape="rounded" icon="info-circle">${d.badge}</ds-badge></div>
        <div class="upd-card__title">${d.title}</div>
        <div class="upd-card__desc">${d.desc}</div>
        <div class="upd-card__actions">
          <ds-button variant="primary" size="small" prefix-icon="download">${d.primary}</ds-button>
          <ds-text-link href="#" variant="primary" size="medium" underline="hover">${d.link}</ds-text-link>
        </div>
      </div></div>`;
  }

  _reviewHtml() {
    const d = REVIEW;
    return `<div class="upd-card upd-card--review">
      <div class="upd-card__icon"><ds-icon name="review" size="20"></ds-icon></div>
      <ds-icon-button class="upd-card__close" data-upd-close icon="close" label="Dismiss" type="tertiary-grey" size="small"></ds-icon-button>
      <div class="upd-card__body">
        <div class="upd-card__title">${d.title}</div>
        <div class="upd-card__desc">${d.desc}</div>
        <div class="upd-card__actions">
          <ds-button variant="primary" size="small">${d.primary}</ds-button>
          <ds-button variant="secondary" size="small">${d.secondary}</ds-button>
        </div>
        <div class="upd-card__foot"><ds-text-link href="#" variant="subtle" size="medium" underline="always">${d.dismiss}</ds-text-link></div>
      </div></div>`;
  }

  _roadmapHtml() {
    const d = ROADMAP;
    return `<div class="upd-card upd-card--roadmap">
      <div class="rm-head">
        <span class="rm-head__icon"><ds-icon name="route" size="20"></ds-icon></span>
        <span class="rm-head__title">${d.title}</span>
        <ds-icon-button class="rm-head__close" data-upd-close icon="close" label="Close" type="tertiary-grey" size="small"></ds-icon-button>
      </div>
      <div class="rm-list">${d.links.map((l) => `<div class="rm-row"><ds-text-link href="#" variant="primary" size="medium" underline="hover">${l}</ds-text-link><ds-icon class="rm-row__ext" name="share-square" size="18"></ds-icon></div>`).join('')}</div>
    </div>`;
  }
}
