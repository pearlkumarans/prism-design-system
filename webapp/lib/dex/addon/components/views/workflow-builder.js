import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Workflow builder — the DEX automation builder (L07). The vanilla design is a
 * drag canvas; this represents the same model structurally with a sectioned form —
 * Trigger → Conditions (with AND/OR) → repeatable Actions — built from ds-* form
 * components. (A faithful build of the model, not the drag interactions.)
 */
export default class WorkflowBuilderView extends Component {
  @service router;
  @service shell;

  header = { icon: 'data-flow-01', title: 'Workflow builder', description: 'Build an automation: a trigger, conditions, and the actions to run.' };
  breadcrumbs = [{ label: 'DEX', href: '#' }, { label: 'Workflows', href: '#' }, { label: 'Workflow builder' }];
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  triggerOptions = [{ value: 'score-drop', label: 'Experience score drop', selected: true }, { value: 'alert', label: 'On alert' }, { value: 'schedule', label: 'On schedule' }, { value: 'manual', label: 'Manual' }];
  metricOptions = [{ value: 'score', label: 'Experience score', selected: true }, { value: 'cpu', label: 'CPU usage' }, { value: 'disk', label: 'Disk latency' }];
  operatorOptions = [{ value: 'lt', label: 'is below', selected: true }, { value: 'gt', label: 'is above' }];
  logicOptions = [{ value: 'and', label: 'AND', selected: true }, { value: 'or', label: 'OR' }];
  actionOptions = [{ value: 'script', label: 'Run script', selected: true }, { value: 'notify', label: 'Notify' }, { value: 'alert', label: 'Create alert' }, { value: 'restart', label: 'Restart device' }];

  @tracked _actionIds = [1];
  _seq = 1;
  get actions() { return this._actionIds.map((id, i) => ({ id, label: `Action ${i + 1}` })); }
  @action addAction() { this._actionIds = [...this._actionIds, ++this._seq]; }
  @action removeAction(id) { if (this._actionIds.length > 1) this._actionIds = this._actionIds.filter((x) => x !== id); }

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }
  @action save() {
    this.toast('Workflow saved.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'workflows');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
  @action onSaveAs(value) { this.toast(`Saved (${value}).`, 'success'); }
}
