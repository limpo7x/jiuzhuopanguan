export const DEFAULT_REQUEST_TIMEOUT_MS = 10000
export const LONG_REQUEST_TIMEOUT_MS = 15000
export const BACKGROUND_REQUEST_TIMEOUT_MS = 8000

export const normalizeWxRequestError = (error: unknown, path: string) => {
  const errMsg = String((error as WechatMiniprogram.GeneralCallbackResult)?.errMsg || (error as Error)?.message || '')
  if (/timeout/i.test(errMsg)) {
    return new Error(`请求超时：${path}`)
  }
  if (/fail|error/i.test(errMsg)) {
    return new Error(`网络请求失败：${path}`)
  }
  return new Error(errMsg || `网络请求失败：${path}`)
}
