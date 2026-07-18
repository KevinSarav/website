type HighlightsSectionProps = {
  isHighlightsLoading: boolean;
  hasHighlightsLoadError: boolean;
  highlightsDocId: string;
  highlights: string[];
};

export function HighlightsSection({
  isHighlightsLoading,
  hasHighlightsLoadError,
  highlightsDocId,
  highlights,
}: HighlightsSectionProps) {
  return (
    <section className="highlights-panel" aria-label="Highlights">
      <div className="info-card">
        <p className="card-label">Highlights</p>
        {isHighlightsLoading ? (
          <div className="highlights-list">
            <p>Loading highlights...</p>
          </div>
        ) : hasHighlightsLoadError ? (
          <div className="highlights-list">
            <p>Failed to load from Google Doc ID {highlightsDocId}.</p>
          </div>
        ) : highlights.length > 0 ? (
          <div className="highlights-list">
            {highlights.map((note, index) => (
              <p key={`${note}-${index}`}>{note}</p>
            ))}
          </div>
        ) : (
          <div className="highlights-list">
            <p>No highlights to show in this section.</p>
          </div>
        )}
      </div>
    </section>
  );
}
