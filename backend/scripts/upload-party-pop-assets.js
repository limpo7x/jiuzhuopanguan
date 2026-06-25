#!/usr/bin/env node

require('../load-env')

const fs = require('fs')
const path = require('path')

const {
  DEFAULT_CDN_BASE_URL,
  getUploadProvider,
  isOssProvider,
  putObject,
} = require('../data/object-storage')

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const requireOss = args.has('--require-oss')
const repoRoot = path.resolve(__dirname, '..', '..')
const sourceRoot = path.resolve(
  process.env.PARTY_POP_ASSET_ROOT || path.join(repoRoot, 'miniprogram', 'assets', 'party-pop-clean'),
)
const keyPrefix = cleanPrefix(process.env.PARTY_POP_CDN_PREFIX || 'static/party-pop-clean')
const cdnBase = String(process.env.UPLOAD_PUBLIC_BASE_URL || process.env.OSS_CDN_BASE_URL || DEFAULT_CDN_BASE_URL).replace(/\/+$/, '')
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])

function cleanPrefix(value) {
  return String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
}

function toPosixPath(value) {
  return String(value || '').replace(/\\/g, '/')
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.avif') return 'image/avif'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.jpeg' || ext === '.jpg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

function walkImages(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory()) {
      return walkImages(fullPath)
    }
    if (!entry.isFile() || !imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      return []
    }
    return [fullPath]
  })
}

async function main() {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`asset source not found: ${sourceRoot}`)
  }

  if (requireOss && !dryRun && !isOssProvider()) {
    throw new Error(`UPLOAD_PROVIDER must be oss before uploading CDN assets; current provider is ${getUploadProvider()}`)
  }

  const files = walkImages(sourceRoot).sort((left, right) => left.localeCompare(right))
  const assets = []
  let totalBytes = 0

  for (const filePath of files) {
    const relativePath = toPosixPath(path.relative(sourceRoot, filePath))
    const objectKey = `${keyPrefix}/${relativePath}`
    const buffer = fs.readFileSync(filePath)
    totalBytes += buffer.length

    if (dryRun) {
      assets.push({
        key: objectKey,
        source: toPosixPath(path.relative(repoRoot, filePath)),
        url: `${cdnBase}/${objectKey}`,
        bytes: buffer.length,
        contentType: getContentType(filePath),
      })
      continue
    }

    const result = await putObject({
      key: objectKey,
      buffer,
      contentType: getContentType(filePath),
    })

    assets.push({
      key: result.key || result.objectKey || objectKey,
      source: toPosixPath(path.relative(repoRoot, filePath)),
      url: result.publicUrl || result.url || `${cdnBase}/${objectKey}`,
      bytes: buffer.length,
      provider: result.provider,
      contentType: getContentType(filePath),
    })
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun,
        provider: getUploadProvider(),
        sourceRoot: toPosixPath(sourceRoot),
        keyPrefix,
        cdnBase,
        assetCount: assets.length,
        totalBytes,
        assets,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error)
  process.exitCode = 1
})
