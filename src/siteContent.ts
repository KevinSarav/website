import { runtimeConfig } from './runtimeConfig'
import { profileContent } from './profileContent'

export const siteContent = {
  appName: runtimeConfig.appName,
  name: runtimeConfig.myName,
  role: runtimeConfig.role,
  summary: profileContent.summary,
  location: runtimeConfig.location,
  availability: runtimeConfig.availability,
  notes: profileContent.notes,
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