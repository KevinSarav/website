import { createServer } from 'node:http'

const port = Number(process.env.PORT ?? '8080')
const resumeSourceUrl = (process.env.RESUME_SOURCE_URL ?? '').trim()
const resumeEmbedUrl = (process.env.RESUME_EMBED_URL ?? '').trim()
const gotenbergBaseUrl = (process.env.GOTENBERG_URL ?? 'http://gotenberg:3000').replace(/\/$/, '')
const pdfFilename = (process.env.PDF_FILENAME ?? 'resume.pdf').trim() || 'resume.pdf'
const docxFetchTimeoutMs = Number(process.env.DOCX_FETCH_TIMEOUT_MS ?? '20000')
const convertTimeoutMs = Number(process.env.CONVERT_TIMEOUT_MS ?? '25000')
const maxDocxBytes = Number(process.env.MAX_DOCX_BYTES ?? '10485760')

function appendQueryParam(url, key, value) {
  const next = new URL(url)
  next.searchParams.set(key, value)
  return next.toString()
}

function buildOneDriveCandidates(inputUrl) {
  const candidates = [inputUrl]

  try {
    const parsed = new URL(inputUrl)

    if (parsed.hostname === '1drv.ms') {
      candidates.push(appendQueryParam(inputUrl, 'download', '1'))
    }

    if (parsed.hostname === 'onedrive.live.com') {
      const resid = parsed.searchParams.get('resid')
      const authkey = parsed.searchParams.get('authkey')
      if (resid) {
        const downloadUrl = new URL('https://onedrive.live.com/download')
        downloadUrl.searchParams.set('resid', resid)
        if (authkey) {
          downloadUrl.searchParams.set('authkey', authkey)
        }
        candidates.unshift(downloadUrl.toString())
      }

      candidates.push(appendQueryParam(inputUrl, 'download', '1'))
    }
  } catch {
    return candidates
  }

  return [...new Set(candidates)]
}

function looksLikeDocx(contentType, sourceUrl, bytes) {
  const mime = (contentType ?? '').toLowerCase()
  const urlLower = sourceUrl.toLowerCase()
  const hasZipSignature =
    bytes.byteLength >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04

  if (!hasZipSignature) {
    return false
  }

  if (mime.includes('officedocument.wordprocessingml.document')) {
    return true
  }

  if (mime.includes('application/octet-stream')) {
    return true
  }

  return urlLower.includes('.docx')
}

function getViewerUrl() {
  if (resumeEmbedUrl) {
    return resumeEmbedUrl
  }

  if (!resumeSourceUrl) {
    return ''
  }

  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(resumeSourceUrl)}`
}

async function convertViewerToPdf(viewerUrl) {
  const form = new FormData()
  form.append('url', viewerUrl)
  form.append('waitDelay', '3s')
  form.append('printBackground', 'true')

  const convertTimeout = withTimeout(convertTimeoutMs)
  const convertResponse = await fetch(`${gotenbergBaseUrl}/forms/chromium/convert/url`, {
    method: 'POST',
    body: form,
    signal: convertTimeout.controller.signal,
  }).finally(() => clearTimeout(convertTimeout.timer))

  if (!convertResponse.ok) {
    const errorText = await convertResponse.text().catch(() => '')
    throw new Error(
      `Gotenberg viewer conversion failed (${convertResponse.status})${errorText ? `: ${errorText.slice(0, 200)}` : ''}`,
    )
  }

  return Buffer.from(await convertResponse.arrayBuffer())
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

function withTimeout(ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { controller, timer }
}

async function readArrayBufferWithLimit(response, limitBytes) {
  const contentLengthHeader = response.headers.get('content-length')
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader)
    if (Number.isFinite(contentLength) && contentLength > limitBytes) {
      throw new Error('Source DOCX exceeds configured size limit')
    }
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Source response has no readable body')
  }

  const chunks = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    totalBytes += value.byteLength
    if (totalBytes > limitBytes) {
      throw new Error('Source DOCX exceeds configured size limit')
    }

    chunks.push(value)
  }

  const output = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }

  return output.buffer
}

async function convertResumeToPdf() {
  if (!resumeSourceUrl) {
    throw new Error('RESUME_SOURCE_URL is not configured')
  }

  const sourceCandidates = buildOneDriveCandidates(resumeSourceUrl)
  let docxBuffer = null

  for (const candidateUrl of sourceCandidates) {
    const docxTimeout = withTimeout(docxFetchTimeoutMs)
    const sourceResponse = await fetch(candidateUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: docxTimeout.controller.signal,
      headers: {
        'User-Agent': 'docx-converter/1.0',
        Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,*/*',
      },
    }).finally(() => clearTimeout(docxTimeout.timer))

    if (!sourceResponse.ok) {
      continue
    }

    const candidateBuffer = await readArrayBufferWithLimit(sourceResponse, maxDocxBytes)
    const candidateBytes = new Uint8Array(candidateBuffer)
    if (!looksLikeDocx(sourceResponse.headers.get('content-type'), sourceResponse.url || candidateUrl, candidateBytes)) {
      continue
    }

    docxBuffer = candidateBuffer
    break
  }

  if (!docxBuffer) {
    const viewerUrl = getViewerUrl()
    if (!viewerUrl) {
      throw new Error('Could not fetch a valid DOCX payload from the configured source URL')
    }

    return convertViewerToPdf(viewerUrl)
  }

  const form = new FormData()
  form.append(
    'files',
    new Blob([docxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
    'resume.docx',
  )

  const convertTimeout = withTimeout(convertTimeoutMs)
  const convertResponse = await fetch(`${gotenbergBaseUrl}/forms/libreoffice/convert`, {
    method: 'POST',
    body: form,
    signal: convertTimeout.controller.signal,
  }).finally(() => clearTimeout(convertTimeout.timer))

  if (!convertResponse.ok) {
    const errorText = await convertResponse.text().catch(() => '')
    throw new Error(
      `Gotenberg conversion failed (${convertResponse.status})${errorText ? `: ${errorText.slice(0, 200)}` : ''}`,
    )
  }

  const pdfBuffer = Buffer.from(await convertResponse.arrayBuffer())
  return pdfBuffer
}

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: 'invalid_request' })
    return
  }

  if (req.url === '/health') {
    sendJson(res, 200, {
      ok: true,
      sourceConfigured: resumeSourceUrl.length > 0,
    })
    return
  }

  if (req.url !== '/resume.pdf' || (req.method !== 'GET' && req.method !== 'HEAD')) {
    sendJson(res, 404, { error: 'not_found' })
    return
  }

  try {
    const pdf = await convertResumeToPdf()

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename}"`,
      'Cache-Control': 'private, max-age=300',
      'Content-Length': String(pdf.byteLength),
      'X-Content-Type-Options': 'nosniff',
    })

    if (req.method === 'HEAD') {
      res.end()
      return
    }

    res.end(pdf)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'conversion_failed'

    if (resumeSourceUrl) {
      res.writeHead(302, {
        Location: resumeSourceUrl,
        'Cache-Control': 'no-store',
      })
      res.end()
      return
    }

    sendJson(res, 502, { error: message })
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`docx-converter listening on :${port}`)
})
