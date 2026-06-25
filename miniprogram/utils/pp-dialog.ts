interface PpDialogState {
  cancelText: string
  confirmText: string
  content: string
  showCancel: boolean
  title: string
  visible: boolean
}

interface PpLoadingState {
  title: string
  visible: boolean
}

interface PpToastState {
  icon: string
  title: string
  visible: boolean
}

type PpDialogPage = WechatMiniprogram.Page.Instance<Record<string, unknown>, Record<string, unknown>> & {
  __handlePpDialogCancel?: () => void
  __handlePpDialogConfirm?: () => void
  setData: (data: Record<string, unknown>, callback?: () => void) => void
}

let installed = false
let toastTimer: number | undefined

const getTopPage = (): PpDialogPage | null => {
  const pages = getCurrentPages() as PpDialogPage[]
  return pages.length ? pages[pages.length - 1] : null
}

const complete = (
  page: PpDialogPage,
  options: WechatMiniprogram.ShowModalOption,
  result: WechatMiniprogram.ShowModalSuccessCallbackResult,
) => {
  page.setData({ __ppDialog: { visible: false } })
  if (result.confirm && typeof options.success === 'function') {
    options.success(result)
  }
  if (result.cancel && typeof options.success === 'function') {
    options.success(result)
  }
  if (typeof options.complete === 'function') {
    options.complete(result)
  }
}

export const installPpDialogPatch = () => {
  if (installed) {
    return
  }
  installed = true

  const nativeShowModal = wx.showModal.bind(wx)
  const nativeShowToast = wx.showToast.bind(wx)
  const nativeShowLoading = wx.showLoading.bind(wx)
  const nativeHideLoading = wx.hideLoading.bind(wx)

  wx.showModal = ((options: WechatMiniprogram.ShowModalOption) => {
    const page = getTopPage()
    if (!page || typeof page.setData !== 'function') {
      return nativeShowModal(options)
    }

    const state: PpDialogState = {
      cancelText: options.cancelText || '取消',
      confirmText: options.confirmText || '确定',
      content: String(options.content || ''),
      showCancel: options.showCancel !== false,
      title: String(options.title || '提示'),
      visible: true,
    }

    page.__handlePpDialogCancel = () => {
      complete(page, options, {
        cancel: true,
        confirm: false,
        content: '',
        errMsg: 'showModal:ok',
      })
    }

    page.__handlePpDialogConfirm = () => {
      complete(page, options, {
        cancel: false,
        confirm: true,
        content: '',
        errMsg: 'showModal:ok',
      })
    }

    page.setData({ __ppDialog: state })

    return undefined
  }) as typeof wx.showModal

  wx.showToast = ((options: WechatMiniprogram.ShowToastOption) => {
    const page = getTopPage()
    if (!page || typeof page.setData !== 'function') {
      return nativeShowToast(options)
    }

    if (toastTimer) {
      clearTimeout(toastTimer)
    }

    const state: PpToastState = {
      icon: options.icon || 'none',
      title: String(options.title || ''),
      visible: true,
    }

    page.setData({ __ppToast: state })

    const result = { errMsg: 'showToast:ok' }
    if (typeof options.success === 'function') {
      options.success(result)
    }
    if (typeof options.complete === 'function') {
      options.complete(result)
    }

    toastTimer = setTimeout(() => {
      page.setData({ __ppToast: { visible: false } })
      toastTimer = undefined
    }, options.duration || 1500) as unknown as number

    return undefined
  }) as typeof wx.showToast

  wx.showLoading = ((options: WechatMiniprogram.ShowLoadingOption) => {
    const page = getTopPage()
    if (!page || typeof page.setData !== 'function') {
      return nativeShowLoading(options)
    }

    const state: PpLoadingState = {
      title: String(options.title || '加载中'),
      visible: true,
    }

    page.setData({ __ppLoading: state })

    const result = { errMsg: 'showLoading:ok' }
    if (typeof options.success === 'function') {
      options.success(result)
    }
    if (typeof options.complete === 'function') {
      options.complete(result)
    }

    return undefined
  }) as typeof wx.showLoading

  wx.hideLoading = ((options?: WechatMiniprogram.HideLoadingOption) => {
    const page = getTopPage()
    if (!page || typeof page.setData !== 'function') {
      return nativeHideLoading(options)
    }

    page.setData({ __ppLoading: { visible: false } })

    const result = { errMsg: 'hideLoading:ok' }
    if (options && typeof options.success === 'function') {
      options.success(result)
    }
    if (options && typeof options.complete === 'function') {
      options.complete(result)
    }

    return undefined
  }) as typeof wx.hideLoading
}
