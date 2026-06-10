import { getApiBase } from '../config/api'

const STORAGE_KEY = 'managed-image-cache-map-v1'

let cacheMap: Record<string, string> | null = null
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
    wx.downloadFile({
      url: source,
      success: (result) => {
        if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
          resolve(result)
          return
        }

        reject(new Error(`download failed: ${result.statusCode}`))
      },
      fail: reject,
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
      return normalized
    })

  inflightDownloads.set(normalized, task)
  return task
}

export const resolveCachedManagedImagePaths = async (sources: string[]) =>
  Promise.all(sources.map((source) => resolveCachedManagedImagePath(source)))
