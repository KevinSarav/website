export const siteContent = {
  name: import.meta.env.VITE_MY_NAME?.trim() ?? 'REPLACE_ME',
  role: import.meta.env.VITE_ROLE?.trim() ?? 'REPLACE_ME',
  summary: import.meta.env.VITE_SUMMARY?.trim() ?? 'REPLACE_ME',
  location: import.meta.env.VITE_LOCATION?.trim() ?? 'REPLACE_ME',
  availability: import.meta.env.VITE_AVAILABILITY?.trim() ?? 'REPLACE_ME',
  notes: [
    'REPLACE_ME',
    'REPLACE_ME',
  ],
  resume: {
    embedUrl: import.meta.env.VITE_RESUME_EMBED_URL?.trim() ?? '',
    downloadUrl: import.meta.env.VITE_RESUME_DOWNLOAD_URL?.trim() ?? '',
  },
} as const

export const hasResume =
  siteContent.resume.embedUrl.length > 0 || siteContent.resume.downloadUrl.length > 0