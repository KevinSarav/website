type SummarySectionProps = {
  isSummaryDocLoading: boolean;
  hasSummaryDocLoadError: boolean;
  summaryDocId: string;
  summary: string;
  metaItems: string[];
};

export function SummarySection({
  isSummaryDocLoading,
  hasSummaryDocLoadError,
  summaryDocId,
  summary,
  metaItems,
}: SummarySectionProps) {
  return (
    <section className="summary-panel" aria-label="Professional overview">
      <div className="info-card">
        <p className="card-label">Summary</p>
        {isSummaryDocLoading ? (
          <p className="summary-lede summary-lede-loading">
            Loading summary...
          </p>
        ) : null}
        {!isSummaryDocLoading && hasSummaryDocLoadError ? (
          <p className="summary-lede">
            Failed to load from Google Doc ID {summaryDocId}.
          </p>
        ) : null}
        {!isSummaryDocLoading && summary.length > 0 ? (
          <p className="summary-lede">{summary}</p>
        ) : null}
        {metaItems.length > 0 ? (
          <div className="meta-row">
            {metaItems.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
