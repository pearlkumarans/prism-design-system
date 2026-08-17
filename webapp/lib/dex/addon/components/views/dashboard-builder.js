import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Dashboard builder — the DEX dashboard builder (L07). The vanilla design is a
 * drag/select canvas; this represents the model structurally with a sectioned form:
 * dashboard details + widget selection.
 */
export default class DashboardBuilderView extends Component {
  @service router;
  @service shell;

  header = { icon: 'bar-vertical-chart', title: 'Dashboard builder', description: 'Compose an experience dashboard from widgets and reports.' };
  breadcrumbs = [{ label: 'DEX', href: '#' }, { label: 'Dashboards', href: '#' }, { label: 'Dashboard builder' }];
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  layoutOptions = [{ value: 'grid', label: '2-column grid', selected: true }, { value: 'wide', label: 'Wide' }, { value: 'compact', label: 'Compact' }];
  sharingOptions = [{ value: 'private', label: 'Private', selected: true }, { value: 'team', label: 'My team' }, { value: 'org', label: 'Organisation' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }
  @action save() {
    this.toast('Dashboard saved.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'dashboards');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
  @action onSaveAs(value) { this.toast(`Saved (${value}).`, 'success'); }
}
