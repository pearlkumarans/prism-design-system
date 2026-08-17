import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Patterns::EmptyState — the L13 empty-state layout. A full-height centered wrapper
 * around the Prism <ds-empty-state> (first-time / no-data / error views). Per the
 * design language: always the Prism component, never an ad-hoc placeholder. Fills
 * its parent, so it works as a whole page OR inside a scroll/card container.
 *
 * Args
 *   @illustration  canonical illustration name (e.g. "dashboard", "common-error")
 *   @title         sentence-case headline (≤8 words)
 *   @description   1–2 line description  (or pass a <span slot="description">…</span> block)
 *   @type          centered (default) | steps | option-cards | promo
 *   @primaryLabel  single primary CTA  · @onPrimary()
 *   @secondaryLabel optional link      · @onSecondary()   (hidden when absent)
 */
export default class EmptyStatePattern extends Component {
  get type() { return this.args.type ?? 'centered'; }
  get showSecondary() { return this.args.secondaryLabel ? 'true' : 'false'; }

  @action onPrimary() { this.args.onPrimary?.(); }
  @action onSecondary() { this.args.onSecondary?.(); }
}
