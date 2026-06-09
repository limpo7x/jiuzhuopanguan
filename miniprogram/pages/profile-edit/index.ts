import {
  bindCurrentUserPhone,
  cacheAuthorizedWechatProfile,
  getCurrentDisplayProfile,
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

const DEFAULT_CITY = '自动获取中'
const EMPTY_NAME_HINT = '待授权获取'

const isPlaceholderName = (value: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户/i.test(text) || /^酒友/i.test(text) || text === '未登录' || text === EMPTY_NAME_HINT
}

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

Page<ProfileEditState, ProfileEditMethods>({
  data: {
    avatarUrl: avatarAsset(1),
    city: DEFAULT_CITY,
    hasWechatProfile: false,
    identityTag: '',
    loggedIn: false,
    name: '',
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
      getCurrentDisplayProfile(),
      requestRuntimeLocation().catch(() => getStoredRuntimeLocation()),
    ])

    const sessionProfile = session.loggedIn && session.profile ? session.profile : null
    const displayProfile =
      sessionProfile && !(isPlaceholderName(sessionProfile.name) && !isPlaceholderName(profile.name)) ? sessionProfile : profile
    const displayName = isPlaceholderName(displayProfile.name) ? '' : displayProfile.name
    const displayAvatar = displayProfile.avatarUrl || avatarAsset(1)
    const loggedIn = Boolean(sessionProfile?.wechatOpenId || displayProfile.wechatOpenId)

    this.setData({
      avatarUrl: displayAvatar,
      city: runtimeLocation?.label || runtimeLocation?.city || displayProfile.city || DEFAULT_CITY,
      hasWechatProfile: Boolean(displayProfile.wechatOpenId || wechatDraftProfile || displayName || displayAvatar),
      identityTag: displayProfile.identityTag || '',
      loggedIn,
      name: displayName,
      phoneMasked: displayProfile.phoneMasked || '',
      signature: displayProfile.signature || '',
      wechatOpenId: displayProfile.wechatOpenId || (loggedIn ? '__authorized__' : ''),
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
    const authorizedName = !isPlaceholderName(userInfo.nickName || '') ? String(userInfo.nickName || '').trim() : ''

    wechatDraftProfile = {
      avatarUrl: userInfo.avatarUrl,
      identityTag: this.data.identityTag.trim(),
      name: authorizedName,
      signature: this.data.signature.trim(),
    }
    cacheAuthorizedWechatProfile({
      name: authorizedName,
      avatarUrl: userInfo.avatarUrl,
    })
    this.setData({
      avatarUrl: userInfo.avatarUrl || avatarAsset(1),
      hasWechatProfile: true,
      name: authorizedName,
    })
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
        name: isPlaceholderName(profile.name) ? '' : profile.name,
        signature: profile.signature,
      }
      cacheAuthorizedWechatProfile({
        name: wechatDraftProfile.name,
        avatarUrl: profile.avatarUrl,
      })
      const resolvedDisplayName = wechatDraftProfile.name || (isPlaceholderName(profile.name) ? '' : profile.name)
      const resolvedAvatarUrl = profile.avatarUrl || wechatDraftProfile.avatarUrl || avatarAsset(1)

      this.setData({
        avatarUrl: resolvedAvatarUrl,
        hasWechatProfile: true,
        loggedIn: Boolean(profile.wechatOpenId),
        name: resolvedDisplayName,
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
        name: isPlaceholderName(profile.name) ? '' : profile.name,
        signature: profile.signature,
      }
      cacheAuthorizedWechatProfile({
        name: wechatDraftProfile.name,
        avatarUrl: profile.avatarUrl,
      })
      const resolvedDisplayName = wechatDraftProfile.name || (isPlaceholderName(profile.name) ? '' : profile.name)
      const resolvedAvatarUrl = profile.avatarUrl || wechatDraftProfile.avatarUrl || avatarAsset(1)

      this.setData({
        avatarUrl: resolvedAvatarUrl,
        hasWechatProfile: true,
        loggedIn: Boolean(profile.wechatOpenId),
        name: resolvedDisplayName,
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
