import { installPpDialogPatch } from './utils/pp-dialog'
import { initPrivacyAuthorizationBridge } from './utils/privacy'

App<IAppOption>({
  globalData: {},
  onLaunch() {
    installPpDialogPatch()
    initPrivacyAuthorizationBridge()

    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
})
