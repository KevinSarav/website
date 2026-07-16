#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read .env file
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')

// Parse .env
const env = {}
envContent.split('\n').forEach(line => {
  if (!line || line.startsWith('#')) return
  const [key, ...valueParts] = line.split('=')
  if (key) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

// Extract and compute resume URLs
const gdocResumeId = env.SITE_GDOC_RESUME_ID || ''
const gdocBase = gdocResumeId ? `https://docs.google.com/document/d/${gdocResumeId}` : ''
const resumeEmbedUrl = gdocBase ? `${gdocBase}/preview` : ''
const resumeDownloadUrl = gdocBase ? `${gdocBase}/export?format=pdf` : ''

// Generate runtime-config.js
const configJs = `window.__APP_CONFIG__ = {
  appName: '${escapeJs(env.SITE_APP_NAME || 'Website')}',
  myName: '${escapeJs(env.SITE_MY_NAME || 'REPLACE_ME')}',
  role: '${escapeJs(env.SITE_ROLE || 'REPLACE_ME')}',
  summary: '${escapeJs(env.SITE_SUMMARY || 'REPLACE_ME')}',
  location: '${escapeJs(env.SITE_LOCATION || 'REPLACE_ME')}',
  availability: '${escapeJs(env.SITE_AVAILABILITY || 'REPLACE_ME')}',
  publicUrl: '${escapeJs(env.SITE_PUBLIC_URL || '')}',
  resumeEmbedUrl: '${escapeJs(resumeEmbedUrl)}',
  resumeDownloadUrl: '${escapeJs(resumeDownloadUrl)}',
  note1: '${escapeJs(env.SITE_NOTE_1 || 'REPLACE_ME')}',
  note2: '${escapeJs(env.SITE_NOTE_2 || 'REPLACE_ME')}',
}
`

// Write to public/runtime-config.js
const outputPath = path.join(__dirname, '..', 'public', 'runtime-config.js')
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
