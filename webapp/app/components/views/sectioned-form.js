import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Install/Uninstall Windows Patch — a thin Patterns::SectionedForm instance. The
 * scaffold (header, section frames, footer, Save-as menu) lives in the pattern;
 * this view supplies the header/breadcrumbs, the section FIELDS (in the :body
 * block), and the form-specific actions + the repeatable "Define Target" rows.
 */
export default class SectionedForm extends Component {
  @service router;
  @service shell;

  header = {
    icon: 'edit',
    title: 'Install/Uninstall Windows Patch (Computer)',
    description: 'A brief description of this page and its purpose.',
  };
  breadcrumbs = [
    { label: 'All Configurations', href: '#' },
    { label: 'Windows', href: '#' },
    { label: 'Install/Uninstall Windows Patch' },
  ];
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  optypeOptions = [
    { value: 'install', label: 'Install Patches', selected: true },
    { value: 'uninstall', label: 'Uninstall Patches' },
  ];
  policyOptions = [
    { value: 'weekly', label: 'Weekly maintenance window' },
    { value: 'immediate', label: 'Immediate' },
    { value: 'afterhours', label: 'After business hours' },
  ];
  numOptions = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }));
  notifyOptions = [{ value: 'email', label: 'Email admins' }, { value: 'none', label: 'No notification' }];
  scheduleOptions = [{ value: 'now', label: 'Deploy now' }, { value: 'window', label: 'Next maintenance window' }];
  targetTypeOptions = [
    { value: 'remote-office', label: 'Remote Office', selected: true },
    { value: 'domain', label: 'Domain' },
    { value: 'custom-group', label: 'Custom Group' },
  ];
  targetOfficeOptions = [{ value: 'ny', label: 'New York' }, { value: 'ldn', label: 'London' }, { value: 'blr', label: 'Bengaluru' }];

  // Repeatable target rows — tracked ids; labels derive from index (auto-renumber).
  @tracked _targetIds = [1];
  _seq = 1;

  get targets() {
    return this._targetIds.map((id, i) => ({ id, label: `Target ${i + 1}` }));
  }

  @action addTarget() { this._targetIds = [...this._targetIds, ++this._seq]; }
  @action removeTarget(id) { if (this._targetIds.length > 1) this._targetIds = this._targetIds.filter((x) => x !== id); }

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }

  @action deploy() {
    this.toast('Patch configuration deployed.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'configs', 'tabbed-form');
  }

  @action cancel() { this.toast('Changes discarded.', 'info'); }

  @action onSaveAs(value) { this.toast(`Saved (${value}).`, 'success'); }
}
