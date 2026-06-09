import {
  bindCurrentUserPhone,
  getCurrentProfile,
  getUserAuthSession,
  loginWithWechat,
  saveCurrentProfile,
  type SocialProfile,
} from '../../utils/social'
import { avatarAsset } from '../../config/assets'
import { getStoredRuntimeLocation, requestRuntimeLocation } from '../../utils/location'

interface ProfileEditState {
  avatarUrl: string
  city: string
  hasWechatProfile: boolean
  identityTag: string
  loggedIn: boolean
  name: string
  phoneMasked: string
  redirectUrl: string
  signature: string
  wechatOpenId: string
}

interface WechatDraftProfile {
  avatarUrl: string
  identityTag: string
  name: string
  signature: string
}

interface ProfileEditMethods {
  handleFieldInput: (event: WechatMiniprogram.Input) => void
  handlePhoneBind: (event: WechatMiniprogram.CustomEvent<{ code?: string; errMsg?: string }>) => Promise<void>
  handleSaveTap: () => Promise<void>
  handleWechatProfileTap: () => Promise<void>
  requestWechatProfile: () => Promise<WechatDraftProfile>
  syncProfile: () => Promise<void>
}

let wechatDraftProfile: WechatDraftProfile | null = null

const requestLoginCode = () =>
  new Promise<string>((resolve, reject) => {
    wx.login({
      success: (result) => {
        if (result.code) {
          resolve(result.code)
          return
        }
        reject(new Error('wx.login failed'))
      },
      fail: reject,
    })
  })

const isPlaceholderName = (value: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^酒友\d{3,}$/.test(text) || text === '未登录'
}

Page<ProfileEditState, ProfileEditMethods>({
  data: {
    avatarUrl: avatarAsset(1),
    city: '自动获取中',
    hasWechatProfile: false,
    identityTag: '',
    loggedIn: false,
    name: '未登录',
    phoneMasked: '',
    redirectUrl: '',
    signature: '',
    wechatOpenId: '',
  },

  async onLoad(query) {
    this.setData({
      redirectUrl: typeof query?.redirect === 'string' ? decodeURIComponent(query.redirect) : '',
    })
    await this.syncProfile()
  },

  async onShow() {
    await this.syncProfile()
  },

  async syncProfile() {
    const [session, profile, runtimeLocation] = await Promise.all([
      getUserAuthSession(),
      getCurrentProfile(),
      requestRuntimeLocation().catch(() => getStoredRuntimeLocation()),
    ])

    this.setData({
      avatarUrl: profile.avatarUrl || avatarAsset(1),
      city: runtimeLocation?.label || runtimeLocation?.city || profile.city || '自动获取中',
      hasWechatProfile: Boolean(profile.wechatOpenId || wechatDraftProfile),
      identityTag: profile.identityTag || '',
      loggedIn: session.loggedIn && Boolean(session.profile?.wechatOpenId),
      name: profile.name || '未登录',
      phoneMasked: profile.phoneMasked || '',
      signature: profile.signature || '',
      wechatOpenId: profile.wechatOpenId || '',
    })
  },

  handleFieldInput(event) {
    const { field } = event.currentTarget.dataset as { field: 'identityTag' | 'signature' }
    const value = event.detail.value || ''
    this.setData({
      [field]: value,
    } as Record<string, string>)
  },

  async requestWechatProfile() {
    if (wechatDraftProfile && !isPlaceholderName(wechatDraftProfile.name)) {
      return wechatDraftProfile
    }

    const result = await new Promise<WechatMiniprogram.GetUserProfileSuccessCallbackResult>((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于同步你的微信头像和昵称',
        success: resolve,
        fail: reject,
      })
    })

    const userInfo = result.userInfo
    wechatDraftProfile = {
      avatarUrl: userInfo.avatarUrl,
      identityTag: this.data.identityTag.trim(),
      name: userInfo.nickName || this.data.name.trim() || '微信用户',
      signature: this.data.signature.trim(),
    }
    return wechatDraftProfile
  },

  async handleWechatProfileTap() {
    try {
      const wechatProfile = await this.requestWechatProfile()
      const loginCode = await requestLoginCode()
      const profile = await loginWithWechat({
        loginCode,
        profile: {
          avatarUrl: wechatProfile.avatarUrl,
          identityTag: wechatProfile.identityTag,
          name: wechatProfile.name,
          signature: wechatProfile.signature,
        },
      })

      wechatDraftProfile = {
        avatarUrl: profile.avatarUrl,
        identityTag: profile.identityTag,
        name: profile.name,
        signature: profile.signature,
      }

      this.setData({
        avatarUrl: profile.avatarUrl,
        hasWechatProfile: true,
        loggedIn: Boolean(profile.wechatOpenId),
        name: profile.name,
        phoneMasked: profile.phoneMasked || '',
        signature: profile.signature,
        wechatOpenId: profile.wechatOpenId || '',
      })

      wx.showToast({
        title: '登录成功',
        icon: 'success',
      })

      if (this.data.redirectUrl) {
        setTimeout(() => {
          wx.redirectTo({
            url: this.data.redirectUrl,
            fail: () => {
              wx.reLaunch({ url: this.data.redirectUrl })
            },
          })
        }, 300)
      }
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '微信登录失败',
        icon: 'none',
      })
    }
  },

  async handlePhoneBind(event) {
    const detail = event.detail || {}

    if (detail.errMsg && !String(detail.errMsg).includes('ok')) {
      wx.showToast({
        title: '未授权手机号',
        icon: 'none',
      })
      return
    }

    if (!detail.code) {
      wx.showToast({
        title: '手机号授权失败',
        icon: 'none',
      })
      return
    }

    const wasLoggedIn = this.data.loggedIn

    try {
      let profile: SocialProfile

      if (wasLoggedIn) {
        profile = await bindCurrentUserPhone(detail.code)
      } else {
        const wechatProfile = await this.requestWechatProfile()
        const loginCode = await requestLoginCode()
        profile = await loginWithWechat({
          loginCode,
          phoneCode: detail.code,
          profile: {
            avatarUrl: wechatProfile.avatarUrl,
            identityTag: wechatProfile.identityTag,
            name: wechatProfile.name,
            signature: wechatProfile.signature,
          },
        })
      }

      wechatDraftProfile = {
        avatarUrl: profile.avatarUrl,
        identityTag: profile.identityTag,
        name: profile.name,
        signature: profile.signature,
      }

      this.setData({
        avatarUrl: profile.avatarUrl,
        hasWechatProfile: true,
        loggedIn: Boolean(profile.wechatOpenId),
        name: profile.name,
        phoneMasked: profile.phoneMasked || '',
        signature: profile.signature,
        wechatOpenId: profile.wechatOpenId || '',
      })

      wx.showToast({
        title: wasLoggedIn ? '绑定成功' : '登录成功',
        icon: 'success',
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : wasLoggedIn ? '绑定失败' : '登录失败',
        icon: 'none',
      })
    }
  },

  async handleSaveTap() {
    if (!this.data.loggedIn) {
      wx.showToast({
        title: '请先完成微信登录',
        icon: 'none',
      })
      return
    }

    await saveCurrentProfile({
      avatarUrl: this.data.avatarUrl,
      identityTag: this.data.identityTag.trim(),
      signature: this.data.signature.trim(),
    })

    wx.showToast({
      title: '资料已保存',
      icon: 'success',
    })
  },
})

export {}
