import { getApiBase } from './api'

const getApiOrigin = () => {
  const matched = getApiBase().match(/^(https?:\/\/[^/]+)/i)
  return matched ? matched[1] : ''
}

export const staticAsset = (fileName: string) => {
  void fileName
  return ''
}

export const avatarAsset = (index: number | string) => {
  void index
  return ''
}

export const normalizeManagedAssetPath = (path?: string) => {
  if (!path) {
    return ''
  }

  if (/^\/static\/avatar-(?:host|\d+)\.png$/i.test(path) || path.startsWith('/assets/avatars/')) {
    return ''
  }

  if (/^https?:\/\//i.test(path)) {
    const origin = getApiOrigin()
    if (origin && path.startsWith(origin)) {
      const pathname = path.slice(origin.length)

      if (/^\/static\/avatar-(?:host|\d+)\.png$/i.test(pathname) || pathname.startsWith('/assets/avatars/')) {
        return ''
      }

      if (pathname.startsWith('/assets/')) {
        return ''
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
    if (/^\/static\/avatar-(?:host|\d+)\.png$/i.test(path)) {
      return ''
    }
    const origin = getApiOrigin()
    return origin ? `${origin}${path}` : path
  }

  if (path.startsWith('/assets/')) {
    return ''
  }

  return path
}
