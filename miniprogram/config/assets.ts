import { getApiBase } from './api'

const STATIC_ASSET_FILE_BY_LOCAL_PATH: Record<string, string> = {
  '/assets/avatars/avatar-1.png': 'avatar-1.png',
  '/assets/avatars/avatar-2.png': 'avatar-2.png',
  '/assets/avatars/avatar-3.png': 'avatar-3.png',
  '/assets/avatars/avatar-4.png': 'avatar-4.png',
  '/assets/home/beer-toast.png': 'beer-toast.png',
  '/assets/home/image-process-hero.png': 'image-process-hero.png',
  '/assets/home/party-hero.png': 'party-hero.png',
  '/assets/home/points-gift.png': 'points-gift.png',
  '/assets/home/report-poster.png': 'report-poster.png',
  '/assets/home/share-miniapp-qr.png': 'share-miniapp-qr.png',
  '/assets/home/toolbox-hero.png': 'toolbox-hero.png',
}

const getApiOrigin = () => {
  const matched = getApiBase().match(/^(https?:\/\/[^/]+)/i)
  return matched ? matched[1] : ''
}

export const staticAsset = (fileName: string) => {
  const origin = getApiOrigin()
  const normalized = fileName.replace(/^\/+/, '')
  return origin ? `${origin}/static/${normalized}` : `/static/${normalized}`
}

export const avatarAsset = (index: number | string) => {
  const normalized = String(index).replace(/^avatar-/, '').replace(/\.png$/i, '')
  return staticAsset(`avatar-${normalized}.png`)
}

export const normalizeManagedAssetPath = (path?: string) => {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//i.test(path)) {
    const origin = getApiOrigin()
    if (origin && path.startsWith(origin)) {
      const pathname = path.slice(origin.length)

      if (pathname.startsWith('/assets/')) {
        return `${origin}/static/${pathname.replace(/^\/assets\/+/, '')}`
      }

      return pathname.startsWith('/static/') || pathname.startsWith('/uploads/') ? path : `${origin}${pathname}`
    }

    return path
  }

  if (path.startsWith('/uploads/')) {
    const origin = getApiOrigin()
    return origin ? `${origin}${path}` : path
  }

  if (path.startsWith('/static/')) {
    const origin = getApiOrigin()
    return origin ? `${origin}${path}` : path
  }

  const staticAssetFile = STATIC_ASSET_FILE_BY_LOCAL_PATH[path]
  if (staticAssetFile) {
    return staticAsset(staticAssetFile)
  }

  if (path.startsWith('/assets/')) {
    const normalized = path.replace(/^\/+assets\/+/, '')
    const fallback = normalized.split('/').pop()
    if (fallback) {
      return staticAsset(fallback)
    }
  }

  return path
}
