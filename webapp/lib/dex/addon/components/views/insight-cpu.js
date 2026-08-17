import InsightDetailView from 'dex/components/views/insight-detail';

/**
 * Insight · CPU — the CPU-specialised experience-insight drill-down (L04). Reuses
 * the InsightDetail view wholesale; only the fetch params (type=cpu → the BFF's
 * CPU record) and the header icon differ.
 */
export default class InsightCpuView extends InsightDetailView {
  get insightParams() { return { type: 'cpu' }; }
  get headerIcon() { return 'cpu-chip'; }
}
