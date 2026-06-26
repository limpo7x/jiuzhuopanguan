import { clearSessionRuntime } from './session'
import { disableSessionLeaveAlert } from './session-exit'

interface SessionRemovedOptions {
  content?: string
  redirectUrl?: string
  title?: string
}

const DEFAULT_REMOVED_TITLE = '已被移出聚会'
const DEFAULT_REMOVED_CONTENT = '房主已将你移出本局，无法继续查看或记录。'
const DEFAULT_REDIRECT_URL = '/pages/index/index'

const getErrorStatusCode = (error: unknown) =>
  Number((error as Error & { statusCode?: number })?.statusCode || 0)

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || '')

export const isSessionRemovedError = (error: unknown) => {
  const statusCode = getErrorStatusCode(error)
  const message = getErrorMessage(error)
  const lower = message.toLowerCase()

  if (
    statusCode === 403 &&
    (
      lower.includes('not session member') ||
      lower.includes('not party member') ||
      lower.includes('not session player') ||
      lower.includes('forbidden') ||
      message.includes('无权限') ||
      message.includes('不在这场聚会')
    )
  ) {
    return true
  }

  return (
    lower.includes('not session member') ||
    lower.includes('not party member') ||
    lower.includes('not session player') ||
    lower.includes('removed') ||
    lower.includes('kicked') ||
    message.includes('已移出') ||
    message.includes('被移出') ||
    message.includes('移出') ||
    message.includes('踢出') ||
    message.includes('不在这场聚会')
  )
}

const showRemovedModal = (options: SessionRemovedOptions) =>
  new Promise<void>((resolve) => {
    wx.showModal({
      title: options.title || DEFAULT_REMOVED_TITLE,
      content: options.content || DEFAULT_REMOVED_CONTENT,
      confirmText: '回到首页',
      showCancel: false,
      success: () => resolve(),
      fail: () => resolve(),
    })
  })

export const handleSessionRemoved = async (options: SessionRemovedOptions = {}) => {
  wx.hideLoading()
  disableSessionLeaveAlert()
  clearSessionRuntime()
  await showRemovedModal(options)

  const redirectUrl = options.redirectUrl || DEFAULT_REDIRECT_URL
  wx.reLaunch({
    url: redirectUrl,
    fail: () => {
      wx.redirectTo({ url: redirectUrl })
    },
  })
}
