import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Add script — a DEX create form (L06), a thin Patterns::SectionedForm instance:
 * sections for name/description, the script itself, and execution settings.
 */
export default class AddScriptView extends Component {
  @service router;
  @service shell;

  header = { icon: 'terminal-square', title: 'Add script', description: 'Add a remediation script to run on your devices.' };
  breadcrumbs = [{ label: 'DEX', href: '#' }, { label: 'Scripts', href: '#' }, { label: 'Add script' }];
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  languageOptions = [{ value: 'ps', label: 'PowerShell', selected: true }, { value: 'bash', label: 'Bash' }, { value: 'python', label: 'Python' }, { value: 'zsh', label: 'Zsh' }];
  platformOptions = [{ value: 'win', label: 'Windows', selected: true }, { value: 'mac', label: 'macOS' }, { value: 'linux', label: 'Linux' }];
  runasOptions = [{ value: 'system', label: 'System', selected: true }, { value: 'user', label: 'Logged-in user' }];
  timeoutOptions = [{ value: '30', label: '30 seconds', selected: true }, { value: '60', label: '60 seconds' }, { value: '300', label: '5 minutes' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }

  @action create() {
    this.toast('Script added.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'sensors');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
  @action onSaveAs(value) { this.toast(`Saved (${value}).`, 'success'); }
}
