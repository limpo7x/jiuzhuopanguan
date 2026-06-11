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

  if (/^(wxfile|file):\/\//i.test(path) || /^https?:\/\/127\.0\.0\.1(?::\d+)?\/__store__\//i.test(path) || /\/__store__\//i.test(path) || /\/__tmp__\//i.test(path) || /\/tmp\//i.test(path)) {
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

export const normalizeManagedAvatarPath = (path?: string) => {
  const text = String(path || '').trim()
  if (!text) {
    return ''
  }

  if (/^\/static\/avatar-(?:host|\d+)\.png$/i.test(text) || text.startsWith('/assets/avatars/')) {
    return ''
  }

  if (/^(wxfile|file):\/\//i.test(text) || /^https?:\/\/tmp\//i.test(text)) {
    return text
  }

  if (/^https?:\/\/127\.0\.0\.1(?::\d+)?\/__store__\//i.test(text) || /\/__tmp__\//i.test(text) || /\/__store__\//i.test(text)) {
    return ''
  }

  return normalizeManagedAssetPath(text)
}
