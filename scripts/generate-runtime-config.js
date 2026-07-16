#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read .env file if it exists, otherwise use empty string
const envPath = path.join(__dirname, '..', '.env')
let envContent = ''
try {
  envContent = fs.readFileSync(envPath, 'utf-8')
} catch (err) {
  if (err.code !== 'ENOENT') {
    throw err
  }
  // File doesn't exist, that's ok
}

// Parse .env
const env = {}
envContent.split('\n').forEach(line => {
  if (!line || line.startsWith('#')) return
  const [key, ...valueParts] = line.split('=')
  if (key) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

// Merge with process.env (environment variables take precedence)
const config = {
  SITE_APP_NAME: process.env.SITE_APP_NAME || env.SITE_APP_NAME || 'Website',
  PROFILE_MY_NAME: process.env.PROFILE_MY_NAME || env.PROFILE_MY_NAME || 'REPLACE_ME',
  PROFILE_CITY: process.env.PROFILE_CITY || env.PROFILE_CITY || '',
  PROFILE_REGION: process.env.PROFILE_REGION || env.PROFILE_REGION || '',
  PROFILE_COUNTRY: process.env.PROFILE_COUNTRY || env.PROFILE_COUNTRY || '',
  SITE_PUBLIC_URL: process.env.SITE_PUBLIC_URL || env.SITE_PUBLIC_URL || '',
  SITE_GDOC_RESUME_ID: process.env.SITE_GDOC_RESUME_ID || env.SITE_GDOC_RESUME_ID || '',
  SITE_GDOC_SUMMARY_ID: process.env.SITE_GDOC_SUMMARY_ID || env.SITE_GDOC_SUMMARY_ID || '',
  SITE_GDOC_HIGHLIGHTS_ID: process.env.SITE_GDOC_HIGHLIGHTS_ID || env.SITE_GDOC_HIGHLIGHTS_ID || '',
  RESUME_PDF_FILE_NAME:
    process.env.RESUME_PDF_FILE_NAME || env.RESUME_PDF_FILE_NAME || 'Kevin_Saravia_Resume.pdf',
}

const locationParts = [config.PROFILE_CITY, config.PROFILE_REGION, config.PROFILE_COUNTRY]
  .map((value) => value.trim())
  .filter((value) => value.length > 0)
const resolvedLocation = locationParts.join(', ')

// Extract and compute resume URLs
const gdocResumeId = config.SITE_GDOC_RESUME_ID
const gdocBase = gdocResumeId ? `https://docs.google.com/document/d/${gdocResumeId}` : ''
const resumeOpenUrl = gdocBase ? `${gdocBase}/edit` : ''
const resumeEmbedUrl = gdocBase ? `${gdocBase}/preview` : ''
const resumeDownloadUrl = gdocBase ? `${gdocBase}/export?format=pdf&download=1` : ''

// Generate runtime-config.js
const configJs = `window.__APP_CONFIG__ = {
  appName: '${escapeJs(config.SITE_APP_NAME)}',
  myName: '${escapeJs(config.PROFILE_MY_NAME)}',
  location: '${escapeJs(resolvedLocation)}',
  publicUrl: '${escapeJs(config.SITE_PUBLIC_URL)}',
  gdocSummaryId: '${escapeJs(config.SITE_GDOC_SUMMARY_ID)}',
  gdocHighlightsId: '${escapeJs(config.SITE_GDOC_HIGHLIGHTS_ID)}',
  resumeOpenUrl: '${escapeJs(resumeOpenUrl)}',
  resumeEmbedUrl: '${escapeJs(resumeEmbedUrl)}',
  resumeDownloadUrl: '${escapeJs(resumeDownloadUrl)}',
  resumePdfFileName: '${escapeJs(config.RESUME_PDF_FILE_NAME)}',
}
`

// Write to public/runtime-config.js
const outputPath = path.join(__dirname, '..', 'public', 'runtime-config.js')
const outputDir = path.dirname(outputPath)

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputPath, configJs)
console.log(`✓ Generated ${outputPath}`)

function escapeJs(str) {
  if (!str) return ''
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}
