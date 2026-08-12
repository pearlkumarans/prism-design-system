import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Sectioned form — Phase E, SECOND pilot (a form archetype, no charts/i18n).
 * Native port of Layout/views/layout-sectioned-form.html. Options flow in via
 * set-prop; the repeatable "Define Target" rows — imperative innerHTML + relabel()
 * in the legacy — become a tracked array + {{#each}} (cleaner, auto-renumbered).
 */
export default class SectionedForm extends Component {
  @service router;
  @service shell;

  breadcrumbs = [
    { label: 'All Configurations', href: '#' },
    { label: 'Windows', href: '#' },
    { label: 'Install/Uninstall Windows Patch' },
  ];

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
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  // Repeatable target rows — tracked ids; labels derive from index (auto-renumber).
  @tracked _targetIds = [1];
  _seq = 1;

  get targets() {
    return this._targetIds.map((id, i) => ({ id, label: `Target ${i + 1}` }));
  }

  @action addTarget() {
    this._targetIds = [...this._targetIds, ++this._seq];
  }

  @action removeTarget(id) {
    if (this._targetIds.length > 1) this._targetIds = this._targetIds.filter((x) => x !== id);
  }

  toast(msg, variant = 'success') {
    if (globalThis.dsToast?.[variant]) { globalThis.dsToast[variant]({ title: msg }); return; }
    const el = document.createElement('ds-toast');
    el.setAttribute('variant', variant);
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  @action deploy() {
    this.toast('Patch configuration deployed.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'configs', 'tabbed-form');
  }

  @action cancel() {
    this.toast('Changes discarded.', 'info');
  }

  @action openSaveAs(event) {
    const btn = event.currentTarget;
    const menu = btn.closest('.sform')?.querySelector('ds-dropdown-menu');
    if (!menu) return;
    event.stopPropagation();
    const r = btn.getBoundingClientRect();
    Object.assign(menu.style, {
      position: 'fixed', left: `${r.left}px`, right: 'auto',
      bottom: `${window.innerHeight - r.top + 6}px`, // open upward (footer is at the viewport bottom)
      zIndex: '2000', minWidth: `${Math.max(200, Math.round(r.width))}px`,
    });
    menu.toggle?.();
  }

  @action onSaveAsChange(event) {
    const d = event.detail || {};
    this.toast(`Saved (${d.value || d.id || ''}).`, 'success');
    event.currentTarget.close?.();
  }
}
