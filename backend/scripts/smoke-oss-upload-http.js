#!/usr/bin/env node

const http = require('http')
const https = require('https')

const baseUrl = process.env.OSS_UPLOAD_BASE_URL || 'https://api.pomer.cn/api/v1'
const token = process.env.JZP_USER_TOKEN || ''
const sessionId = process.env.JZP_SESSION_ID || 'ops009-oss-smoke'
const dataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

if (!token) {
  console.error('missing JZP_USER_TOKEN')
  process.exit(2)
}

const requestJson = ({ method = 'GET', path, body }) =>
  new Promise((resolve, reject) => {
    const target = new URL(path, `${baseUrl.replace(/\/+$/, '')}/`)
    const payload = body ? JSON.stringify(body) : ''
    const transport = target.protocol === 'https:' ? https : http
    const req = transport.request(
      target,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-JZP-User-Token': token,
        },
        timeout: 15000,
      },
      (res) => {
        let text = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          text += chunk
        })
        res.on('end', () => {
          let json = null
          try {
            json = text ? JSON.parse(text) : null
          } catch {
            json = { raw: text }
          }
          resolve({ body: json, headers: res.headers, status: res.statusCode || 0 })
        })
      },
    )
    req.on('error', reject)
    req.on('timeout', () => req.destroy(new Error(`request timeout: ${target.href}`)))
    if (payload) req.write(payload)
    req.end()
  })

const head = (targetUrl) =>
  new Promise((resolve, reject) => {
    const target = new URL(targetUrl)
    const transport = target.protocol === 'https:' ? https : http
    const req = transport.request(target, { method: 'HEAD', timeout: 15000 }, (res) => {
      res.resume()
      res.on('end', () => resolve({ headers: res.headers, status: res.statusCode || 0 }))
    })
    req.on('error', reject)
    req.on('timeout', () => req.destroy(new Error(`HEAD timeout: ${target.href}`)))
    req.end()
  })

const main = async () => {
  const response = await requestJson({
    method: 'POST',
    path: 'moments/uploads/image',
    body: {
      dataUrl,
      fileName: `ops009-oss-smoke-${Date.now()}.png`,
      sessionId,
    },
  })
  const data = response.body?.data || response.body
  const url = data?.url || data?.publicUrl || ''
  const cdnHead = url ? await head(url) : null
  const result = {
    ok:
      [200, 201].includes(response.status) &&
      /^https:\/\/cdn\.pomer\.cn\//.test(url) &&
      cdnHead?.status === 200 &&
      String(cdnHead.headers['content-type'] || '').includes('image/'),
    uploadHttp: response.status,
    provider: data?.storageProvider || '',
    objectKey: data?.objectKey || '',
    url,
    cdnHead: cdnHead
      ? {
          contentLength: cdnHead.headers['content-length'] || '',
          contentType: cdnHead.headers['content-type'] || '',
          ossCdnAuth: cdnHead.headers['x-oss-cdn-auth'] || '',
          status: cdnHead.status,
        }
      : null,
  }
  console.log(JSON.stringify(result, null, 2))
  if (!result.ok) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
