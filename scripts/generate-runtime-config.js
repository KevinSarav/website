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
  SITE_MY_NAME: process.env.SITE_MY_NAME || env.SITE_MY_NAME || 'REPLACE_ME',
  SITE_ROLE: process.env.SITE_ROLE || env.SITE_ROLE || 'REPLACE_ME',
  SITE_SUMMARY: process.env.SITE_SUMMARY || env.SITE_SUMMARY || 'REPLACE_ME',
  SITE_LOCATION: process.env.SITE_LOCATION || env.SITE_LOCATION || 'REPLACE_ME',
  SITE_AVAILABILITY: process.env.SITE_AVAILABILITY || env.SITE_AVAILABILITY || 'REPLACE_ME',
  SITE_PUBLIC_URL: process.env.SITE_PUBLIC_URL || env.SITE_PUBLIC_URL || '',
  SITE_GDOC_RESUME_ID: process.env.SITE_GDOC_RESUME_ID || env.SITE_GDOC_RESUME_ID || '',
  SITE_NOTE_1: process.env.SITE_NOTE_1 || env.SITE_NOTE_1 || 'REPLACE_ME',
  SITE_NOTE_2: process.env.SITE_NOTE_2 || env.SITE_NOTE_2 || 'REPLACE_ME',
}

// Extract and compute resume URLs
const gdocResumeId = config.SITE_GDOC_RESUME_ID
const gdocBase = gdocResumeId ? `https://docs.google.com/document/d/${gdocResumeId}` : ''
const resumeOpenUrl = gdocBase ? `${gdocBase}/edit` : ''
const resumeEmbedUrl = gdocBase ? `${gdocBase}/preview` : ''
const resumeDownloadUrl = gdocBase ? `${gdocBase}/export?format=pdf&download=1` : ''

// Generate runtime-config.js
const configJs = `window.__APP_CONFIG__ = {
  appName: '${escapeJs(config.SITE_APP_NAME)}',
  myName: '${escapeJs(config.SITE_MY_NAME)}',
  role: '${escapeJs(config.SITE_ROLE)}',
  summary: '${escapeJs(config.SITE_SUMMARY)}',
  location: '${escapeJs(config.SITE_LOCATION)}',
  availability: '${escapeJs(config.SITE_AVAILABILITY)}',
  publicUrl: '${escapeJs(config.SITE_PUBLIC_URL)}',
  resumeOpenUrl: '${escapeJs(resumeOpenUrl)}',
  resumeEmbedUrl: '${escapeJs(resumeEmbedUrl)}',
  resumeDownloadUrl: '${escapeJs(resumeDownloadUrl)}',
  note1: '${escapeJs(config.SITE_NOTE_1)}',
  note2: '${escapeJs(config.SITE_NOTE_2)}',
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
