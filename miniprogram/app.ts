import { installPpDialogPatch } from './utils/pp-dialog'

App<IAppOption>({
  globalData: {},
  onLaunch() {
    installPpDialogPatch()

    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
})
