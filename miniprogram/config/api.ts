const LOCAL_API_BASE = 'http://127.0.0.1:3010/api/v1'

// 填入正式 HTTPS 后端地址后，前台会优先直连远端。
const REMOTE_API_BASE = ''

const STORAGE_KEY = 'runtime-api-base'

const normalizeApiBase = (value: string) => value.replace(/\/+$/, '')

export const getApiBase = () => {
  const runtimeValue = wx.getStorageSync(STORAGE_KEY)
  const storageBase = typeof runtimeValue === 'string' ? runtimeValue.trim() : ''
  const configured = storageBase || REMOTE_API_BASE || LOCAL_API_BASE
  return normalizeApiBase(configured)
}

export const setRuntimeApiBase = (value: string) => {
  const next = value.trim()
  if (!next) {
    wx.removeStorageSync(STORAGE_KEY)
    return
  }

  wx.setStorageSync(STORAGE_KEY, normalizeApiBase(next))
}

export const clearRuntimeApiBase = () => {
  wx.removeStorageSync(STORAGE_KEY)
}

export const getConfiguredRemoteApiBase = () => REMOTE_API_BASE
