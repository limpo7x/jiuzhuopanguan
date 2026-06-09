const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { createStoreAccessor } = require('./store-accessor')

const manifestPath = path.join(__dirname, 'asset-manifest.json')
const uploadRoot = path.join(__dirname, '..', 'public', 'uploads', 'admin')
const MAX_IMAGE_BYTES = 6 * 1024 * 1024
const MAX_IMAGE_WIDTH = 1600
const MAX_IMAGE_HEIGHT = 1600
const WEBP_QUALITY = 82

const MIME_EXTENSION_MAP = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const BUILTIN_ASSETS = [
  { id: 'builtin-home-hero', name: '首页主图', category: 'home', url: '/static/party-hero.png', source: 'builtin' },
  { id: 'builtin-home-banner', name: '积分横幅', category: 'points', url: '/static/points-gift.png', source: 'builtin' },
  { id: 'builtin-template-party', name: '模板封面 A', category: 'templates', url: '/static/toolbox-hero.png', source: 'builtin' },
  { id: 'builtin-template-report', name: '模板封面 B', category: 'templates', url: '/static/report-poster.png', source: 'builtin' },
  { id: 'builtin-tool-hero', name: '工具封面', category: 'tools', url: '/static/image-process-hero.png', source: 'builtin' },
  { id: 'builtin-avatar-host', name: '主持人头像', category: 'avatars', url: '/static/avatar-host.png', source: 'builtin' },
]

const ensureUploadRoot = () => {
  fs.mkdirSync(uploadRoot, { recursive: true })
}

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeCategory = (value) => {
  const cleaned = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'general'
}

const normalizeManifest = (manifest = {}) => ({
  uploads: Array.isArray(manifest.uploads) ? manifest.uploads.slice(0, 300) : [],
})

const manifestAccessor = createStoreAccessor({
  key: 'asset_manifest',
  filePath: manifestPath,
  createDefaultStore: () => ({ uploads: [] }),
  normalizeStore: normalizeManifest,
})

const readManifest = () => manifestAccessor.read()

const writeManifest = (manifest) => manifestAccessor.write(manifest)

const parseDataUrl = (value) => {
  const match = String(value || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/)
  if (!match) {
    throw new Error('仅支持图片 base64 上传')
  }
  const mimeType = match[1].toLowerCase()
  const extension = MIME_EXTENSION_MAP[mimeType]
  if (!extension) {
    throw new Error('仅支持 PNG、JPG、WebP、GIF 图片')
  }
  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('图片大小需在 6MB 以内')
  }
  return { mimeType, extension, buffer }
}

const compressAdminImage = async ({ buffer, mimeType }) => {
  if (mimeType === 'image/gif') {
    return {
      buffer,
      extension: 'gif',
      mimeType,
      originalSize: buffer.length,
      storedSize: buffer.length,
    }
  }

  const compressedBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 5,
    })
    .toBuffer()

  return {
    buffer: compressedBuffer,
    extension: 'webp',
    mimeType: 'image/webp',
    originalSize: buffer.length,
    storedSize: compressedBuffer.length,
  }
}

const saveAdminImage = async ({ category, dataUrl, fileName }) => {
  const { buffer, mimeType } = parseDataUrl(dataUrl)
  const compressed = await compressAdminImage({ buffer, mimeType })
  const folder = normalizeCategory(category)
  const safeBaseName = slugify(path.parse(String(fileName || '')).name) || 'asset'
  const storedName = `${Date.now()}-${safeBaseName}-${crypto.randomBytes(3).toString('hex')}.${compressed.extension}`
  const targetDir = path.join(uploadRoot, folder)
  const targetPath = path.join(targetDir, storedName)

  ensureUploadRoot()
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(targetPath, compressed.buffer)

  const entry = {
    id: `asset-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    name: fileName || storedName,
    category: folder,
    mimeType: compressed.mimeType,
    originalSize: compressed.originalSize,
    size: compressed.storedSize,
    url: `/uploads/admin/${folder}/${storedName}`,
    createdAt: new Date().toISOString(),
    source: 'upload',
  }

  const manifest = readManifest()
  manifest.uploads.unshift(entry)
  writeManifest(manifest)
  return entry
}

const listAdminAssets = () => {
  const manifest = readManifest()
  return {
    builtin: BUILTIN_ASSETS,
    uploads: manifest.uploads,
  }
}

module.exports = {
  initAssetsManifest: async () => {
    ensureUploadRoot()
    return manifestAccessor.init()
  },
  listAdminAssets,
  saveAdminImage,
  uploadRoot,
}
