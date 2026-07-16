import { runtimeConfig } from './runtimeConfig'
import { profileContent } from './profileContent'

export const siteContent = {
  appName: runtimeConfig.appName,
  name: runtimeConfig.myName,
  role: runtimeConfig.role,
  summary: profileContent.summary,
  summaryDocId: runtimeConfig.gdocSummaryId,
  location: runtimeConfig.location,
  highlights: profileContent.highlights,
  highlightsDocId: runtimeConfig.gdocHighlightsId,
  resume: {
    openUrl:
      runtimeConfig.resumeOpenUrl || runtimeConfig.resumeEmbedUrl || runtimeConfig.resumeDownloadUrl,
    embedUrl: runtimeConfig.resumeEmbedUrl,
    downloadUrl: runtimeConfig.resumeDownloadUrl,
    pdfFileName: runtimeConfig.resumePdfFileName,
  },
} as const

export const hasResume =
  siteContent.resume.openUrl.length > 0 ||
  siteContent.resume.embedUrl.length > 0 ||
  siteContent.resume.downloadUrl.length > 0