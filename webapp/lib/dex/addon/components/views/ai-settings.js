import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * AI settings — a DEX settings form (L06), a thin Patterns::SectionedForm instance:
 * AI provider, AI features, and prompt templates.
 */
export default class AiSettingsView extends Component {
  @service router;
  @service shell;

  header = { icon: 'sparkles', title: 'AI settings', description: 'Configure the Zia assistant and its features.' };
  breadcrumbs = [{ label: 'DEX', href: '#' }, { label: 'AI assistant', href: '#' }, { label: 'AI settings' }];
  saveAsItems = null;

  providerOptions = [{ value: 'zia', label: 'Zia (built-in)', selected: true }, { value: 'openai', label: 'OpenAI' }, { value: 'azure', label: 'Azure OpenAI' }];
  modelOptions = [{ value: 'balanced', label: 'Balanced', selected: true }, { value: 'fast', label: 'Fast' }, { value: 'accurate', label: 'Accurate' }];

  toast(msg, variant = 'success') { globalThis.dsToast?.[variant]?.({ title: msg }); }
  @action save() {
    this.toast('AI settings saved.', 'success');
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'ai-assistant');
  }
  @action cancel() { this.toast('Changes discarded.', 'info'); }
}
