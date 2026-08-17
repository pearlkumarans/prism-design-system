import ExtensionDetailView from 'dex/components/views/extension-detail';

/**
 * Content detail — a DEX content-pack marketplace listing (L04). Reuses the
 * ExtensionDetail view; only the fetched record (dex.content), the header icon, and
 * the breadcrumb differ.
 */
export default class ContentDetailView extends ExtensionDetailView {
  fetchRecord() { return this.api.prism?.dex?.content({}); }
  get headerIcon() { return 'layers'; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Content library', href: '#' }, { label: this.data?.name || 'Content' }];
  }
}
