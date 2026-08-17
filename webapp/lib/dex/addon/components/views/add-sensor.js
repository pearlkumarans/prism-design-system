import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Add sensor — a DEX create form (L06), a thin Patterns::SectionedForm instance:
 * sections for name/description, script config, and execution settings.
 */
export default class AddSensorView extends Component {
  @service router;
  @service shell;

  header = { icon: 'speedometer', title: 'Add sensor', description: 'Define a custom sensor to collect an experience signal from your devices.' };
  breadcrumbs = [{ label: 'DEX', href: '#' }, { label: 'Sensors', href: '#' }, { label: 'Add sensor' }];
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  categoryOptions = ['Performance', 'Security', 'Compliance', 'Health', 'Inventory'].map((c, i) => ({ value: c.toLowerCase(), label: c, selected: i === 0 }));
  platformOptions = [{ value: 'win', label: 'Windows', selected: true }, { value: 'mac', label: 'macOS' }, { value: 'linux', label: 'Linux' }];
  typeOptions = [{ value: 'script', label: 'Script', selected: true }, { value: 'query', label: 'Query' }, { value: 'registry', label: 'Registry check' }];
  scheduleOptions = [{ value: '15m', label: 'Every 15 minutes' }, { value: '1h', label: 'Hourly', selected: true }, { value: '1d', label: 'Daily' }];
  runasOptions = [{ value: 'system', label: 'System', selected: true }, { value: 'user', label: 'Logged-in user' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }

  @action create() {
    this.toast('Sensor created.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'sensors');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
  @action onSaveAs(value) { this.toast(`Saved (${value}).`, 'success'); }
}
