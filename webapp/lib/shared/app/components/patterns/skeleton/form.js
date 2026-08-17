import Component from '@glimmer/component';

/**
 * Patterns::Skeleton::Form — initial-load placeholder for the form patterns
 * (Sectioned / Tabbed). Mirrors the shape: section blocks, each a bordered
 * section-header + left-labelled field rows. Decorative (aria-hidden). Opt-in via
 * the form pattern's @loading arg (forms usually render from static data, but one
 * that fetches its initial values shows this until ready).
 *
 *   @sections         number of section blocks (default 3)
 *   @fieldsPerSection field rows per section (default 3)
 */
export default class SkeletonForm extends Component {
  get sections() { return Array.from({ length: this.args.sections || 3 }); }
  get fields() { return Array.from({ length: this.args.fieldsPerSection || 3 }); }
}
