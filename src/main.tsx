import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { hasResume, siteContent } from './siteContent'
import './styles.css'

document.title = siteContent.appName

function buildGoogleDocTextUrl(docId: string) {
  return `https://docs.google.com/document/d/${docId}/export?format=txt`
}

async function fetchDocText(docId: string) {
  const response = await fetch(buildGoogleDocTextUrl(docId), { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to load Google Doc content (${response.status})`)
  }
  return response.text()
}

function parseSummaryDoc(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const [role = '', availability = '', ...summaryLines] = lines
  return {
    role,
    availability,
    summary: summaryLines.join(' '),
  }
}

function parseHighlights(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0)
}

function App() {
  const [role, setRole] = useState('')
  const [summary, setSummary] = useState('')
  const [availability, setAvailability] = useState('')
  const [isProfileDocLoading, setIsProfileDocLoading] = useState(siteContent.summaryDocId.length > 0)
  const [isResumeLoading, setIsResumeLoading] = useState(siteContent.resume.embedUrl.length > 0)
  const [highlights, setHighlights] = useState<string[]>([])
  const [isHighlightsLoading, setIsHighlightsLoading] = useState(
    siteContent.highlightsDocId.length > 0,
  )
  const roleLabel = isProfileDocLoading ? 'Loading role...' : role
  const availabilityMeta = isProfileDocLoading ? 'Loading availability...' : availability
  const metaItems = [siteContent.location, availabilityMeta].filter((value) => value.length > 0)

  useEffect(() => {
    let cancelled = false

    const loadProfileContent = async () => {
      if (siteContent.summaryDocId.length > 0) {
        try {
          const summaryText = await fetchDocText(siteContent.summaryDocId)
          const parsedSummaryDoc = parseSummaryDoc(summaryText)
          if (!cancelled && parsedSummaryDoc.role.length > 0) {
            setRole(parsedSummaryDoc.role)
          }
          if (!cancelled && parsedSummaryDoc.availability.length > 0) {
            setAvailability(parsedSummaryDoc.availability)
          }
          if (!cancelled && parsedSummaryDoc.summary.length > 0) {
            setSummary(parsedSummaryDoc.summary)
          }
        } catch {
          // Keep local fallback content when Google Doc fetch fails.
        } finally {
          if (!cancelled) {
            setIsProfileDocLoading(false)
          }
        }
      }

      if (siteContent.highlightsDocId.length > 0) {
        try {
          const highlightsText = await fetchDocText(siteContent.highlightsDocId)
          const parsedHighlights = parseHighlights(highlightsText)
          if (!cancelled && parsedHighlights.length > 0) {
            setHighlights(parsedHighlights)
          }
        } catch {
          // Keep local fallback content when Google Doc fetch fails.
        } finally {
          if (!cancelled) {
            setIsHighlightsLoading(false)
          }
        }
      }
    }

    void loadProfileContent()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          {roleLabel.length > 0 ? <p className="eyebrow">{roleLabel}</p> : null}
          <h1>{siteContent.name}</h1>
          {isProfileDocLoading ? <p className="lede">Loading summary...</p> : null}
          {!isProfileDocLoading && summary.length > 0 ? <p className="lede">{summary}</p> : null}
          {metaItems.length > 0 ? (
            <div className="meta-row">
              {metaItems.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="content-grid" aria-label="Professional overview">
        <div className="info-card">
          <p className="card-label">Highlights</p>
          {isHighlightsLoading ? (
            <div className="note-list">
              <p>Loading highlights...</p>
            </div>
          ) : highlights.length > 0 ? (
            <div className="note-list">
              {highlights.map((note, index) => (
                <p key={`${note}-${index}`}>{note}</p>
              ))}
            </div>
          ) : (
            <div className="note-list">
              <p>Add a couple of highlights to show this section.</p>
            </div>
          )}
        </div>
      </section>

      {hasResume ? (
        <section className="resume-panel" aria-label="Resume">
          <div className="resume-header">
            <div>
              <p className="eyebrow">Resume</p>
              <h2>View resume</h2>
            </div>
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
                  className={`resume-frame${isResumeLoading ? ' is-loading' : ''}`}
                  src={siteContent.resume.embedUrl}
                  title={`${siteContent.name} resume`}
                  loading="lazy"
                  onLoad={() => setIsResumeLoading(false)}
                  onError={() => setIsResumeLoading(false)}
                />
              </div>
              {siteContent.resume.downloadUrl.length > 0 ? (
                <p className="resume-help">If preview is unavailable, open the Google Docs or PDF.</p>
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
        </section>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)