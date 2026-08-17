import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Settings — DEX module settings (L06), a thin Patterns::SectionedForm instance:
 * general, score thresholds, data retention, and notifications.
 */
export default class SettingsView extends Component {
  @service router;
  @service shell;

  header = { icon: 'settings', title: 'Settings', description: 'Configure how DEX collects, scores, and reports experience data.' };
  breadcrumbs = [{ label: 'DEX', href: '#' }, { label: 'Settings' }];
  saveAsItems = null;

  intervalOptions = [{ value: '5m', label: 'Every 5 minutes' }, { value: '15m', label: 'Every 15 minutes', selected: true }, { value: '1h', label: 'Hourly' }];
  retentionOptions = [{ value: '30', label: '30 days' }, { value: '90', label: '90 days', selected: true }, { value: '365', label: '1 year' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }
  @action save() {
    this.toast('Settings saved.', 'success');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
}
