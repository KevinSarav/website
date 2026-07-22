import { runtimeConfig } from "./runtimeConfig";

export const siteContent = {
  appName: runtimeConfig.appName,
  name: runtimeConfig.myName,
  profileDocId: runtimeConfig.gdocProfileId,
  summaryDocId: runtimeConfig.gdocSummaryId,
  location: runtimeConfig.location,
  githubLink: runtimeConfig.githubLink,
  highlightsDocId: runtimeConfig.gdocHighlightsId,
  resume: {
    openUrl:
      runtimeConfig.resumeOpenUrl ||
      runtimeConfig.resumeEmbedUrl ||
      runtimeConfig.resumeDownloadUrl,
    embedUrl: runtimeConfig.resumeEmbedUrl,
    downloadUrl: runtimeConfig.resumeDownloadUrl,
    pdfFileName: runtimeConfig.resumePdfFileName,
  },
} as const;

export const hasResume =
  siteContent.resume.openUrl.length > 0 ||
  siteContent.resume.embedUrl.length > 0 ||
  siteContent.resume.downloadUrl.length > 0;
