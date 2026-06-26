import { installPpDialogPatch } from './utils/pp-dialog'
import { getRecentDiagnostics, recordDiagnostic } from './utils/diagnostics'

App<IAppOption>({
  globalData: {},
  onLaunch() {
    installPpDialogPatch()
    recordDiagnostic('app.launch')

    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  onError(error) {
    console.error('[jzp-app-error]', error, getRecentDiagnostics())
  },

  onUnhandledRejection(event) {
    console.error('[jzp-unhandled-rejection]', event.reason, getRecentDiagnostics())
  },
})
