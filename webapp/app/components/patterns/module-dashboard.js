import Component from '@glimmer/component';

/**
 * Patterns::ModuleDashboard — the L02 module-dashboard archetype
 * (Layout/views/layout-module-dashboard.html). Provides the dashboard frame:
 * page header (+breadcrumbs, +actions), the scrolling body, the uniform KPI row,
 * and the chart-refit wiring (charts re-lay-out when @refitKey changes, e.g. on a
 * language flip). The bento grid of widgets/charts differs per dashboard, so it is
 * a yielded :body block.
 *
 *   <Patterns::ModuleDashboard @header=… @kpis=[{label,value,state,icon}] @refitKey=…>
 *     <:headerActions> <ds-button …/> </:headerActions>
 *     <:body>
 *       <div class="bl-grid"> <ds-widget … {{config-chart …}}></ds-widget> </div>
 *     </:body>
 *   </Patterns::ModuleDashboard>
 */
export default class ModuleDashboardPattern extends Component {
  get header() { return this.args.header ?? {}; }
  get kpis() { return this.args.kpis ?? []; }
  // @loading — opt-in: a fetching dashboard renders Skeleton::Dashboard until ready.
}
