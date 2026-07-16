export type RuntimeConfig = {
  appName: string
  myName: string
  location: string
  publicUrl: string
  gdocSummaryId: string
  gdocHighlightsId: string
  resumeOpenUrl: string
  resumeEmbedUrl: string
  resumeDownloadUrl: string
  resumePdfFileName: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<RuntimeConfig>
  }
}

function getString(value: unknown, fallback = '') {
  if (typeof value !== 'string') {
    return fallback
  }
  const normalized = value.trim()
  if (!normalized || normalized === 'REPLACE_ME') {
    return fallback
  }
  return normalized
}

export const runtimeConfig: RuntimeConfig = {
  appName: getString(window.__APP_CONFIG__?.appName, 'Website'),
  myName: getString(window.__APP_CONFIG__?.myName, 'Your Name'),
  location: getString(window.__APP_CONFIG__?.location),
  publicUrl: getString(window.__APP_CONFIG__?.publicUrl),
  gdocSummaryId: getString(window.__APP_CONFIG__?.gdocSummaryId),
  gdocHighlightsId: getString(window.__APP_CONFIG__?.gdocHighlightsId),
  resumeOpenUrl: getString(window.__APP_CONFIG__?.resumeOpenUrl),
  resumeEmbedUrl: getString(window.__APP_CONFIG__?.resumeEmbedUrl),
  resumeDownloadUrl: getString(window.__APP_CONFIG__?.resumeDownloadUrl),
  resumePdfFileName: getString(window.__APP_CONFIG__?.resumePdfFileName, 'Kevin_Saravia_Resume.pdf'),
}
