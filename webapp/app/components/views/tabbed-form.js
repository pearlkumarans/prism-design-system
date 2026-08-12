import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Configuration Settings — the living example of Patterns::TabbedForm (L07). Six
 * categories (→ vertical nav), each a panel of sectioned-form sections. This view
 * supplies the tabs, option data, and actions; the pattern owns the tab/panel swap.
 */
export default class TabbedForm extends Component {
  @service router;
  @service shell;

  header = {
    icon: 'edit',
    title: 'Configuration Settings',
    description: 'Settings that apply across every category of this configuration.',
  };
  breadcrumbs = [
    { label: 'Admin', href: '#' },
    { label: 'Settings', href: '#' },
    { label: 'Configuration Settings' },
  ];
  tabs = [
    { id: 'general', label: 'General' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'advanced', label: 'Advanced' },
  ];

  statusOptions = [{ value: 'enabled', label: 'Enabled', selected: true }, { value: 'disabled', label: 'Disabled' }];
  policyOptions = [
    { value: 'weekly', label: 'Weekly maintenance window' },
    { value: 'immediate', label: 'Immediate' },
    { value: 'afterhours', label: 'After business hours' },
  ];
  retryOptions = [1, 2, 3, 5, 10].map((n) => ({ value: String(n), label: String(n) }));
  windowOptions = [{ value: 'business', label: 'Business hours' }, { value: 'offhours', label: 'Off hours' }, { value: 'any', label: 'Any time' }];
  recipientsOptions = [{ value: 'admins', label: 'Administrators' }, { value: 'owners', label: 'Config owners' }, { value: 'none', label: 'No one' }];
  roleOptions = [{ value: 'admin', label: 'Administrator' }, { value: 'operator', label: 'Operator' }, { value: 'viewer', label: 'Viewer' }];
  webhookOptions = [{ value: 'slack', label: 'Slack' }, { value: 'teams', label: 'Microsoft Teams' }, { value: 'none', label: 'None' }];
  throttleOptions = [{ value: 'none', label: 'No limit' }, { value: '1mb', label: '1 MB/s' }, { value: '5mb', label: '5 MB/s' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }

  @action save() { this.toast('Settings saved.', 'success'); }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
}
