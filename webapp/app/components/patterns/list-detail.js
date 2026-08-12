import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Patterns::ListDetail — the L04 record-detail archetype
 * (Layout/views/layout-list-detail.html). The page a user drills into from a list
 * row: a full RecordHeader (icon · title · description · breadcrumbs · summary meta ·
 * actions) over a scrolling widget grid. It provides that frame + chart-refit wiring;
 * the widget grid is a yielded :body, and an optional :overlay hosts a slide-in
 * panel (positioned within the .ld-detail root).
 *
 *   <Patterns::ListDetail @header=… @breadcrumbs=… @summary=[{label,value,status}]
 *       @refitKey=… @onBreadcrumbClick=…>
 *     <:headerActions> <ds-button slot="actions" …/> </:headerActions>
 *     <:body>    <div class="…grid…"> … </div> </:body>
 *     <:overlay> <aside class="tl-panel" …>…</aside> </:overlay>
 *   </Patterns::ListDetail>
 */
export default class ListDetailPattern extends Component {
  get header() { return this.args.header ?? {}; }

  @action onHeaderClick(event) { this.args.onBreadcrumbClick?.(event); }
}
