import { siteContent } from "../siteContent";

type ResumeSectionProps = {
  isResumeLoading: boolean;
  setIsResumeLoading: (value: boolean) => void;
};

export function ResumeSection({
  isResumeLoading,
  setIsResumeLoading,
}: ResumeSectionProps) {
  return (
    <section className="resume-panel" aria-label="Resume">
      <div className="info-card">
        <p className="card-label">Resume</p>
        <div className="resume-header">
          <div className="resume-actions">
            {siteContent.resume.openUrl.length > 0 ? (
              <a
                className="primary-button"
                href={siteContent.resume.openUrl}
                target="_blank"
                rel="noreferrer"
              >
                Google Docs
              </a>
            ) : null}
            {siteContent.resume.downloadUrl.length > 0 ? (
              <a
                className="secondary-button"
                href={siteContent.resume.downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                PDF
              </a>
            ) : null}
          </div>
        </div>

        {siteContent.resume.embedUrl.length > 0 ? (
          <>
            <div className="resume-frame-wrap">
              {isResumeLoading ? (
                <div className="resume-loading" aria-live="polite">
                  <p>Loading resume...</p>
                </div>
              ) : null}
              <iframe
                className={`resume-frame${isResumeLoading ? " is-loading" : ""}`}
                src={siteContent.resume.embedUrl}
                title={`${siteContent.name} resume`}
                loading="lazy"
                onLoad={() => setIsResumeLoading(false)}
                onError={() => setIsResumeLoading(false)}
              />
            </div>
            {siteContent.resume.downloadUrl.length > 0 ? (
              <p className="resume-help">
                If preview is unavailable, open the Google Docs or PDF.
              </p>
            ) : null}
          </>
        ) : (
          <div className="resume-placeholder">
            <p>Resume preview is not configured.</p>
            {siteContent.resume.downloadUrl.length > 0 ? (
              <p>Use the resume link above to open it directly.</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
