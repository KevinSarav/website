import { runtimeConfig } from './runtimeConfig'

export const siteContent = {
  appName: runtimeConfig.appName,
  name: runtimeConfig.myName,
  role: runtimeConfig.role,
  summary: runtimeConfig.summary,
  location: runtimeConfig.location,
  availability: runtimeConfig.availability,
  notes: [runtimeConfig.note1, runtimeConfig.note2].filter((note) => note.length > 0),
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