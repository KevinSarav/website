export type RuntimeConfig = {
  appName: string
  myName: string
  role: string
  summary: string
  location: string
  availability: string
  publicUrl: string
  resumeEmbedUrl: string
  resumeDownloadUrl: string
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
  myName: getString(window.__APP_CONFIG__?.myName, 'REPLACE_ME'),
  role: getString(window.__APP_CONFIG__?.role, 'REPLACE_ME'),
  summary: getString(window.__APP_CONFIG__?.summary, 'REPLACE_ME'),
  location: getString(window.__APP_CONFIG__?.location, 'REPLACE_ME'),
  availability: getString(window.__APP_CONFIG__?.availability, 'REPLACE_ME'),
  publicUrl: getString(window.__APP_CONFIG__?.publicUrl),
  resumeEmbedUrl: getString(window.__APP_CONFIG__?.resumeEmbedUrl),
  resumeDownloadUrl: getString(window.__APP_CONFIG__?.resumeDownloadUrl),
  note1: getString(window.__APP_CONFIG__?.note1, 'REPLACE_ME'),
  note2: getString(window.__APP_CONFIG__?.note2, 'REPLACE_ME'),
}
