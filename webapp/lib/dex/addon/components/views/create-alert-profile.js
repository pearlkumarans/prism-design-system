import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Create alert profile — a DEX create form (L06), a thin Patterns::SectionedForm
 * instance: sections for name/description, alert rules, and notification. The
 * scaffold/footer/save-as live in the pattern; this supplies the fields + actions.
 */
export default class CreateAlertProfileView extends Component {
  @service router;
  @service shell;

  header = {
    icon: 'notification',
    title: 'Create alert profile',
    description: 'Define when DEX raises an alert and who gets notified.',
  };
  breadcrumbs = [
    { label: 'DEX', href: '#' },
    { label: 'Alerts', href: '#' },
    { label: 'Create alert profile' },
  ];
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  metricOptions = [
    { value: 'exp-score', label: 'Experience score', selected: true },
    { value: 'cpu', label: 'CPU usage' }, { value: 'mem', label: 'Memory usage' },
    { value: 'disk', label: 'Disk latency' }, { value: 'boot', label: 'Boot time' },
  ];
  operatorOptions = [{ value: 'lt', label: 'is below' }, { value: 'gt', label: 'is above', selected: true }];
  severityOptions = [
    { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High', selected: true },
    { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
  ];
  channelOptions = [{ value: 'email', label: 'Email', selected: true }, { value: 'slack', label: 'Slack' }, { value: 'webhook', label: 'Webhook' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }

  @action create() {
    this.toast('Alert profile created.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'alerts');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
  @action onSaveAs(value) { this.toast(`Saved (${value}).`, 'success'); }
}
