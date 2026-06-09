import { deleteManagedSession } from '../services/operations'
import { clearSessionRuntime, getSessionRuntime } from './session'

interface ConfirmExitOptions {
  redirectUrl?: string
}

const DEFAULT_REDIRECT_URL = '/pages/judge/index'

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
