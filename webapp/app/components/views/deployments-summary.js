import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Deployments dashboard (L1 landing) — Phase E. A placeholder empty state, no
 * data: the empty state IS the whole page (faithful to layout-summary). Its
 * primary action drills into the deployments list.
 */
export default class DeploymentsSummary extends Component {
  @service router;
  @service shell;

  @action onPrimary() {
    this.router.transitionTo('product.module.view', this.shell.productId, 'deployments', 'deployments-list');
  }
}
