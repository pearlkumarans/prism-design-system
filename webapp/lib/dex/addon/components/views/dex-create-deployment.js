import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Create deployment — a DEX create form (L06), a thin Patterns::SectionedForm
 * instance: sections for basic details, the resource to deploy, and the targets.
 */
export default class DexCreateDeploymentView extends Component {
  @service router;
  @service shell;

  header = { icon: 'settings-deploy', title: 'Create deployment', description: 'Deploy a sensor, script, or content pack to a set of devices.' };
  breadcrumbs = [{ label: 'DEX', href: '#' }, { label: 'Deployments', href: '#' }, { label: 'Create deployment' }];
  saveAsItems = [{ value: 'template', label: 'Save as template' }, { value: 'draft', label: 'Save as draft' }];

  resourceTypeOptions = [{ value: 'sensor', label: 'Sensor', selected: true }, { value: 'script', label: 'Script' }, { value: 'content', label: 'Content pack' }];
  resourceOptions = [{ value: 'disk-latency', label: 'Disk latency probe', selected: true }, { value: 'spooler', label: 'Reset print spooler' }, { value: 'winperf', label: 'Windows performance pack' }];
  targetTypeOptions = [{ value: 'office', label: 'Remote office', selected: true }, { value: 'group', label: 'Custom group' }, { value: 'platform', label: 'Platform' }];
  targetOptions = [{ value: 'all', label: 'All offices', selected: true }, { value: 'hq', label: 'HQ' }, { value: 'remote', label: 'Remote' }];
  scheduleOptions = [{ value: 'now', label: 'Deploy now', selected: true }, { value: 'window', label: 'Next maintenance window' }, { value: 'schedule', label: 'Schedule…' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }

  @action create() {
    this.toast('Deployment created.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'dex-deployments');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
  @action onSaveAs(value) { this.toast(`Saved (${value}).`, 'success'); }
}
