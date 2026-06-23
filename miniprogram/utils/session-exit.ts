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

const DEFAULT_REDIRECT_URL = '/pages/index/index'
const SESSION_LEAVE_ALERT_MESSAGE = '离开当前聚会页面？首张照片保存成功前不会计入进行中。'

const redirectAfterExit = (redirectUrl: string) => {
  disableSessionLeaveAlert()
  wx.redirectTo({
    url: redirectUrl,
    fail: () => {
      wx.reLaunch({
        url: redirectUrl,
      })
    },
  })
}

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
    clearSessionRuntime()
    redirectAfterExit(options.redirectUrl || DEFAULT_REDIRECT_URL)
    return true
  }

  const confirmed = await new Promise<boolean>((resolve) => {
    wx.showModal({
      title: '确认退出聚会',
      content: '现在退出将清空该场聚会，朋友将不可加入。',
      confirmText: '确认退出',
      cancelText: '继续记录',
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

  let deleteError: unknown = null
  try {
    await deleteManagedSession(sessionId)
  } catch (error) {
    deleteError = error
  } finally {
    wx.hideLoading()
  }

  if (deleteError) {
    const leaveLocal = await new Promise<boolean>((resolve) => {
      wx.showModal({
        title: '退出暂未同步',
        content: '服务器暂未确认删除，可先返回首页，稍后再从相册或记录入口处理。',
        confirmText: '先返回',
        cancelText: '留在本页',
        success: (result) => resolve(Boolean(result.confirm)),
        fail: () => resolve(false),
      })
    })

    if (!leaveLocal) {
      return false
    }
  }

  try {
    clearSessionRuntime()
    redirectAfterExit(options.redirectUrl || DEFAULT_REDIRECT_URL)
    return true
  } catch (error) {
    wx.showToast({
      title: error instanceof Error ? error.message : '退出失败',
      icon: 'none',
    })
    return false
  }
}

export const confirmLeaveSessionPage = async (options: ConfirmLeaveOptions = {}) => {
  const confirmed = await new Promise<boolean>((resolve) => {
    wx.showModal({
      title: options.title || '确认离开聚会',
      content: options.content || '离开后可从我的相册重新进入当前聚会。',
      confirmText: options.confirmText || '确认离开',
      cancelText: options.cancelText || '继续记录',
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
  redirectAfterExit(options.redirectUrl || DEFAULT_REDIRECT_URL)
  return true
}
