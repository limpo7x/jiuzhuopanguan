import { deleteManagedSession } from '../services/operations'
import { clearSessionRuntime, getSessionRuntime } from './session'

interface ConfirmExitOptions {
  redirectUrl?: string
}

interface ConfirmLeaveOptions {
  cancelText?: string
  clearRuntime?: boolean
  confirmText?: string
  content?: string
  redirectUrl?: string
  title?: string
}

const DEFAULT_REDIRECT_URL = '/pages/judge/index'
const SESSION_LEAVE_ALERT_MESSAGE = '酒局正在进行中，确定要离开吗？'

export const enableSessionLeaveAlert = () => {
  wx.enableAlertBeforeUnload({
    message: SESSION_LEAVE_ALERT_MESSAGE,
    fail: (error) => {
      console.warn('[session-exit] enableAlertBeforeUnload failed', error)
    },
    success: () => {
      console.info('[session-exit] enableAlertBeforeUnload enabled')
    },
  })
}

export const disableSessionLeaveAlert = () => {
  wx.disableAlertBeforeUnload({
    fail: (error) => {
      console.warn('[session-exit] disableAlertBeforeUnload failed', error)
    },
  })
}

export const confirmAndExitSession = async (options: ConfirmExitOptions = {}) => {
  const runtime = getSessionRuntime()
  const sessionId = runtime.sessionId || ''
  if (!sessionId) {
    return false
  }

  const confirmed = await new Promise<boolean>((resolve) => {
    wx.showModal({
      title: '确认退出本局',
      content: '现在退出将清空该场聚会，朋友将不可加入。',
      confirmText: '确认退出',
      cancelText: '继续对局',
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(false),
    })
  })

  if (!confirmed) {
    return false
  }

  wx.showLoading({
    title: '正在退出',
    mask: true,
  })

  try {
    await deleteManagedSession(sessionId)
    clearSessionRuntime()
    disableSessionLeaveAlert()
    const redirectUrl = options.redirectUrl || DEFAULT_REDIRECT_URL
    wx.redirectTo({
      url: redirectUrl,
      fail: () => {
        wx.reLaunch({
          url: redirectUrl,
        })
      },
    })
    return true
  } catch (error) {
    wx.showToast({
      title: error instanceof Error ? error.message : '退出失败',
      icon: 'none',
    })
    return false
  } finally {
    wx.hideLoading()
  }
}

export const confirmLeaveSessionPage = async (options: ConfirmLeaveOptions = {}) => {
  const confirmed = await new Promise<boolean>((resolve) => {
    wx.showModal({
      title: options.title || '确认离开本局',
      content: options.content || '离开后可从我的酒局重新进入当前场次。',
      confirmText: options.confirmText || '确认离开',
      cancelText: options.cancelText || '继续酒局',
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(false),
    })
  })

  if (!confirmed) {
    return false
  }

  if (options.clearRuntime) {
    clearSessionRuntime()
  }
  disableSessionLeaveAlert()
  const redirectUrl = options.redirectUrl || DEFAULT_REDIRECT_URL
  wx.redirectTo({
    url: redirectUrl,
    fail: () => {
      wx.reLaunch({
        url: redirectUrl,
      })
    },
  })
  return true
}
