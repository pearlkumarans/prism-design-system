import Component from '@glimmer/component';

/**
 * Patterns::Skeleton::Detail — initial-load placeholder for the L04 record-detail
 * (Patterns::ListDetail). Mirrors the shape: a RecordHeader strip (title + summary
 * meta pills) over a widget grid. Decorative (aria-hidden).
 *
 *   @meta   number of summary-meta placeholders (default 4)
 *   @cards  number of body card placeholders (default 2)
 */
export default class SkeletonDetail extends Component {
  get metaCells() { return Array.from({ length: this.args.meta || 4 }); }
  get cards() { return Array.from({ length: this.args.cards || 2 }); }
}
