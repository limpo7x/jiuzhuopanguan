const fs = require('fs')
const https = require('https')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')
const uploadsRoot = path.join(publicDir, 'uploads')

const DEFAULT_OSS_BUCKET = 'pomer-party-recorder-prod'
const DEFAULT_OSS_REGION = 'oss-cn-beijing'
const DEFAULT_CDN_BASE_URL = 'https://cdn.pomer.cn'
const DEFAULT_CACHE_CONTROL = 'public, max-age=2592000, immutable'
const MAX_RENDER_IMAGE_BYTES = 8 * 1024 * 1024

let ossClient = null

const cleanSegment = (value = '') =>
  String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')

const normalizeObjectKey = (key = '') => {
  const normalized = cleanSegment(key)
    .split('/')
    .map((segment) =>
      segment
        .trim()
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .join('/')
  if (!normalized || normalized.includes('..')) {
    throw new Error('invalid object key')
  }
  return normalized
}

const getUploadProvider = () => String(process.env.UPLOAD_PROVIDER || 'local').trim().toLowerCase()

const isOssProvider = () => ['oss', 'aliyun-oss', 'aliyun'].includes(getUploadProvider())

const getPublicBaseUrl = () =>
  String(process.env.UPLOAD_PUBLIC_BASE_URL || process.env.OSS_CDN_BASE_URL || DEFAULT_CDN_BASE_URL).replace(/\/+$/, '')

const getLocalCompatUrl = (key) => `/uploads/${normalizeObjectKey(key)}`

const getPublicUrl = (key) => {
  const objectKey = normalizeObjectKey(key)
  if (isOssProvider()) {
    return `${getPublicBaseUrl()}/${objectKey}`
  }
  return getLocalCompatUrl(objectKey)
}

const resolveLocalObjectPath = (key = '') => {
  const objectKey = normalizeObjectKey(key)
  const resolvedPath = path.resolve(path.join(uploadsRoot, objectKey))
  const root = path.resolve(uploadsRoot)
  if (!resolvedPath.startsWith(root)) {
    throw new Error('invalid local object path')
  }
  return resolvedPath
}

const writeLocalObject = ({ key, buffer }) => {
  const localPath = resolveLocalObjectPath(key)
  fs.mkdirSync(path.dirname(localPath), { recursive: true })
  fs.writeFileSync(localPath, buffer)
  return localPath
}

const getOssClient = () => {
  if (ossClient) {
    return ossClient
  }
  const OSS = require('ali-oss')
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID || process.env.UPLOAD_ACCESS_KEY_ID
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET || process.env.UPLOAD_SECRET_ACCESS_KEY
  if (!accessKeyId || !accessKeySecret) {
    throw new Error('OSS credentials missing: set OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET')
  }
  ossClient = new OSS({
    accessKeyId,
    accessKeySecret,
    bucket: process.env.OSS_BUCKET || process.env.UPLOAD_BUCKET || DEFAULT_OSS_BUCKET,
    endpoint: process.env.OSS_ENDPOINT || process.env.UPLOAD_ENDPOINT || undefined,
    region: process.env.OSS_REGION || process.env.UPLOAD_REGION || DEFAULT_OSS_REGION,
    secure: true,
    timeout: Number(process.env.OSS_TIMEOUT_MS || process.env.UPLOAD_TIMEOUT_MS || 60000),
    authorizationV4: process.env.OSS_AUTHORIZATION_V4 !== '0',
  })
  return ossClient
}

const putObject = async ({ key, buffer, contentType = 'application/octet-stream', cacheControl = DEFAULT_CACHE_CONTROL } = {}) => {
  const objectKey = normalizeObjectKey(key)
  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    throw new Error('object buffer required')
  }

  if (!isOssProvider()) {
    writeLocalObject({ key: objectKey, buffer })
    return {
      provider: 'local',
      objectKey,
      key: objectKey,
      url: getLocalCompatUrl(objectKey),
      publicUrl: getLocalCompatUrl(objectKey),
      localCompatUrl: getLocalCompatUrl(objectKey),
      size: buffer.length,
    }
  }

  if (process.env.UPLOAD_LOCAL_MIRROR !== '0') {
    writeLocalObject({ key: objectKey, buffer })
  }
  await getOssClient().put(objectKey, buffer, {
    mime: contentType,
    headers: {
      'Cache-Control': cacheControl,
    },
  })

  const publicUrl = getPublicUrl(objectKey)
  return {
    provider: 'oss',
    bucket: process.env.OSS_BUCKET || process.env.UPLOAD_BUCKET || DEFAULT_OSS_BUCKET,
    objectKey,
    key: objectKey,
    url: publicUrl,
    publicUrl,
    localCompatUrl: getLocalCompatUrl(objectKey),
    size: buffer.length,
  }
}

const deleteObject = async ({ key = '' } = {}) => {
  const objectKey = normalizeObjectKey(key)
  const localPath = resolveLocalObjectPath(objectKey)
  let localRemoved = false
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath)
    localRemoved = true
  }

  if (isOssProvider()) {
    try {
      await getOssClient().delete(objectKey)
    } catch (error) {
      const status = Number(error?.status || error?.statusCode || 0)
      if (status !== 404 && status !== 204) {
        throw error
      }
    }
  }

  return {
    key: objectKey,
    localRemoved,
    provider: isOssProvider() ? 'oss' : 'local',
    removed: localRemoved || isOssProvider(),
  }
}

const objectKeyFromUrl = (value = '') => {
  const text = String(value || '').trim()
  if (!text) return ''
  if (text.startsWith('/uploads/')) {
    return normalizeObjectKey(text.replace(/^\/uploads\//, ''))
  }
  if (/^https?:\/\//i.test(text)) {
    try {
      const parsed = new URL(text)
      const cdnHost = new URL(getPublicBaseUrl()).host
      const sourceHost = String(process.env.OSS_SOURCE_HOST || 'pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com').trim()
      if (parsed.host === cdnHost || parsed.host === sourceHost) {
        return normalizeObjectKey(decodeURIComponent(parsed.pathname.replace(/^\/+/, '')))
      }
    } catch {
      return ''
    }
  }
  return ''
}

const fetchHttpsBuffer = (targetUrl) =>
  new Promise((resolve, reject) => {
    const request = https.get(targetUrl, { timeout: 8000 }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume()
        reject(new Error(`remote image request failed: ${response.statusCode}`))
        return
      }
      const chunks = []
      let total = 0
      response.on('data', (chunk) => {
        total += chunk.length
        if (total > MAX_RENDER_IMAGE_BYTES) {
          request.destroy(new Error('remote image exceeds render limit'))
          return
        }
        chunks.push(chunk)
      })
      response.on('end', () => resolve(Buffer.concat(chunks)))
    })
    request.on('timeout', () => request.destroy(new Error('remote image request timeout')))
    request.on('error', reject)
  })

const readObjectForRender = async ({ key = '', url = '' } = {}) => {
  const objectKey = key ? normalizeObjectKey(key) : objectKeyFromUrl(url)
  if (objectKey) {
    const localPath = resolveLocalObjectPath(objectKey)
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath)
    }
  }

  const text = String(url || '').trim()
  if (/^https:\/\//i.test(text) && objectKeyFromUrl(text)) {
    return fetchHttpsBuffer(text)
  }
  return null
}

module.exports = {
  DEFAULT_CDN_BASE_URL,
  DEFAULT_OSS_BUCKET,
  DEFAULT_OSS_REGION,
  getLocalCompatUrl,
  getPublicUrl,
  getUploadProvider,
  isOssProvider,
  objectKeyFromUrl,
  deleteObject,
  putObject,
  readObjectForRender,
  resolveLocalObjectPath,
}
