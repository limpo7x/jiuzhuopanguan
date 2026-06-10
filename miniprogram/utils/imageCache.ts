import { getApiBase } from '../config/api'

const STORAGE_KEY = 'managed-image-cache-map-v1'
const FAILED_CACHE_KEY = 'managed-image-cache-failures-v1'
const DOWNLOAD_FAILURE_TTL_MS = 5 * 60 * 1000
const MAX_DOWNLOAD_TIMEOUT_MS = 4000

let cacheMap: Record<string, string> | null = null
let failureMap: Record<string, number> | null = null
const inflightDownloads = new Map<string, Promise<string>>()

const getApiOrigin = () => {
  const matched = getApiBase().match(/^(https?:\/\/[^/]+)/i)
  return matched ? matched[1] : ''
}

const getCacheMap = () => {
  if (cacheMap) {
    return cacheMap
  }

  const stored = wx.getStorageSync(STORAGE_KEY)
  cacheMap = stored && typeof stored === 'object' ? (stored as Record<string, string>) : {}
  return cacheMap
}

const getFailureMap = () => {
  if (failureMap) {
    return failureMap
  }

  const stored = wx.getStorageSync(FAILED_CACHE_KEY)
  failureMap = stored && typeof stored === 'object' ? (stored as Record<string, number>) : {}
  return failureMap
}

const persistFailureMap = () => {
  wx.setStorageSync(FAILED_CACHE_KEY, getFailureMap())
}

const canRetryDownload = (source: string) => {
  const failures = getFailureMap()
  const expiry = failures[source]
  if (!expiry) {
    return true
  }

  if (Date.now() > expiry) {
    delete failures[source]
    persistFailureMap()
    return true
  }

  return false
}

const markDownloadFailure = (source: string) => {
  const failures = getFailureMap()
  failures[source] = Date.now() + DOWNLOAD_FAILURE_TTL_MS
  persistFailureMap()
}

const persistCacheMap = () => {
  wx.setStorageSync(STORAGE_KEY, getCacheMap())
}

const fileExists = (filePath: string) =>
  new Promise<boolean>((resolve) => {
    if (!filePath || !filePath.startsWith('wxfile://')) {
      resolve(false)
      return
    }

    wx.getFileSystemManager().access({
      path: filePath,
      success: () => resolve(true),
      fail: () => resolve(false),
    })
  })

const isCacheableRemoteImage = (source: string) => {
  if (!/^https?:\/\//i.test(source)) {
    return false
  }

  const origin = getApiOrigin()
  if (!origin || !source.startsWith(origin)) {
    return false
  }

  return /\/(static|uploads)\//.test(source)
}

const downloadAndPersist = async (source: string) => {
  const downloaded = await new Promise<WechatMiniprogram.DownloadFileSuccessCallbackResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`download timeout: ${source}`))
    }, MAX_DOWNLOAD_TIMEOUT_MS)

    wx.downloadFile({
      url: source,
      success: (result) => {
        clearTimeout(timer)
        if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
          resolve(result)
          return
        }

        reject(new Error(`download failed: ${result.statusCode}`))
      },
      fail: (error) => {
        clearTimeout(timer)
        reject(error)
      },
    })
  })

  try {
    const saved = await new Promise<WechatMiniprogram.SaveFileSuccessCallbackResult>((resolve, reject) => {
      const fs = wx.getFileSystemManager()
      fs.saveFile({
        tempFilePath: downloaded.tempFilePath,
        success: resolve,
        fail: reject,
      })
    })
    return saved.savedFilePath || downloaded.tempFilePath
  } catch {
    return downloaded.tempFilePath
  }
}

export const resolveCachedManagedImagePath = async (source?: string) => {
  const normalized = String(source || '').trim()
  if (!normalized || !isCacheableRemoteImage(normalized)) {
    return normalized
  }

  if (!canRetryDownload(normalized)) {
    return normalized
  }

  const currentCache = getCacheMap()
  const cachedPath = currentCache[normalized]
  if (cachedPath && (await fileExists(cachedPath))) {
    return cachedPath
  }

  if (cachedPath) {
    delete currentCache[normalized]
    persistCacheMap()
  }

  const inflight = inflightDownloads.get(normalized)
  if (inflight) {
    return inflight
  }

  const task = downloadAndPersist(normalized)
    .then((localPath) => {
      if (localPath.startsWith('wxfile://')) {
        currentCache[normalized] = localPath
        persistCacheMap()
      }
      inflightDownloads.delete(normalized)
      return localPath
    })
    .catch(() => {
      inflightDownloads.delete(normalized)
      markDownloadFailure(normalized)
      return normalized
    })

  inflightDownloads.set(normalized, task)
  return task
}

export const resolveCachedManagedImagePathQuick = async (source?: string, timeoutMs = 1400) => {
  const normalized = String(source || '').trim()
  if (!normalized || !isCacheableRemoteImage(normalized)) {
    return normalized
  }

  if (!canRetryDownload(normalized)) {
    return normalized
  }

  return Promise.race([
    resolveCachedManagedImagePath(normalized),
    new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(normalized)
      }, timeoutMs)
    }),
  ])
}

export const resolveCachedManagedImagePaths = async (sources: string[]) =>
  Promise.all(sources.map((source) => resolveCachedManagedImagePath(source)))
