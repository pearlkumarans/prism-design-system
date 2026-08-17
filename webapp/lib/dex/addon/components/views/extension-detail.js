import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Extension detail — a DEX marketplace listing (L04), a Patterns::ListDetail
 * instance: record header (extension · publisher/category/platform) over an Overview
 * with the listing content (problem, solution, features) + an About panel. Data from
 * PrismAPI.dex.extension(); content-detail extends this for content packs.
 */
export default class ExtensionDetailView extends Component {
  @service api;

  @tracked data = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked facet = 'overview';

  constructor() {
    super(...arguments);
    this.reload();
  }

  // content-detail overrides this to fetch a content pack instead.
  fetchRecord() { return this.api.prism?.dex?.extension({}); }
  get headerIcon() { return 'product'; }
  get installLabel() { return this.data?.installed ? 'Installed' : 'Install'; }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      this.data = this.api.prism?.dex ? await this.fetchRecord() : null;
      if (!this.data) throw new Error('No extension data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: this.headerIcon, title: this.data?.name || 'Extension' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Extensions', href: '#' }, { label: this.data?.name || 'Extension' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Publisher', value: d.publisher || '—' },
      { label: 'Category', value: d.category || '—' },
      { label: 'Platform', value: d.platform || '—' },
    ];
  }
  get tabs() {
    return [
      { id: 'overview', label: 'Overview', active: this.facet === 'overview' },
      { id: 'reviews', label: 'Reviews', active: this.facet === 'reviews' },
    ];
  }
  get onOverview() { return this.facet === 'overview'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get problem() { return this.data?.problem || ''; }
  get solution() { return this.data?.solution || ''; }
  get features() { return this.data?.features || []; }
  get aboutItems() { return this.data?.about || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
