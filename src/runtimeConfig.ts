export type RuntimeConfig = {
  appName: string
  myName: string
  role: string
  summary: string
  location: string
  availability: string
  publicUrl: string
  resumeOpenUrl: string
  resumeEmbedUrl: string
  resumeDownloadUrl: string
  resumePdfFileName: string
  note1: string
  note2: string
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
  role: getString(window.__APP_CONFIG__?.role, 'Professional'),
  summary: getString(window.__APP_CONFIG__?.summary),
  location: getString(window.__APP_CONFIG__?.location),
  availability: getString(window.__APP_CONFIG__?.availability),
  publicUrl: getString(window.__APP_CONFIG__?.publicUrl),
  resumeOpenUrl: getString(window.__APP_CONFIG__?.resumeOpenUrl),
  resumeEmbedUrl: getString(window.__APP_CONFIG__?.resumeEmbedUrl),
  resumeDownloadUrl: getString(window.__APP_CONFIG__?.resumeDownloadUrl),
  resumePdfFileName: getString(window.__APP_CONFIG__?.resumePdfFileName, 'Kevin_Saravia_Resume.pdf'),
  note1: getString(window.__APP_CONFIG__?.note1),
  note2: getString(window.__APP_CONFIG__?.note2),
}
