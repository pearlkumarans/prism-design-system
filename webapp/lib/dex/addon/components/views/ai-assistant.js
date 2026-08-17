import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * AI assistant — the DEX Zia assistant (custom, L02-framed): a prompt, suggested
 * questions, the latest answer (with a confidence badge), and proactive insights.
 * A Patterns::ModuleDashboard frame with a custom body. Data from PrismAPI.dex.ai().
 */
const CONF_STATE = { High: 'success', Medium: 'warning', Low: 'default' };
const INSIGHT_STATE = { High: 'critical', Medium: 'warning', Good: 'success' };

export default class AiAssistantView extends Component {
  @service api;

  @tracked data = null;
  @tracked isLoading = true;
  @tracked error = null;

  constructor() {
    super(...arguments);
    this.reload();
  }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const dex = this.api.prism?.dex;
      this.data = dex ? await dex.ai({}) : null;
      if (!this.data) throw new Error('No AI data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'sparkles', title: 'AI assistant', description: 'Ask about your fleet’s experience — Zia analyses the signals for you.' }; }

  get suggestions() { return this.data?.suggestions ?? []; }
  get answer() { return this.data?.answer ?? null; }
  get confidenceState() { return CONF_STATE[this.answer?.confidence] || 'default'; }
  get insights() {
    return (this.data?.insights ?? []).map((i) => ({ ...i, state: INSIGHT_STATE[i.val] || 'default' }));
  }

  @action ask(q) {
    globalThis.dsToast?.info?.({ title: 'Asked Zia', description: q, style: 'subtle' });
  }
  @action retry() { this.reload(); }
}
