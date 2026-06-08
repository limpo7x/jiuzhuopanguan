import {
  getCurrentProfile,
  getUserAuthSession,
  loginWithWechatPhone,
  saveCurrentProfile,
  type SocialProfile,
} from '../../utils/social'
import { avatarAsset } from '../../config/assets'

interface ProfileEditState {
  avatarUrl: string
  city: string
  hasWechatProfile: boolean
  identityTag: string
  loggedIn: boolean
  name: string
  phoneMasked: string
  signature: string
  wechatOpenId: string
}

interface ProfileEditMethods {
  handleFieldInput: (event: WechatMiniprogram.Input) => void
  handlePhoneBind: (event: WechatMiniprogram.CustomEvent<{ code?: string; errMsg?: string }>) => Promise<void>
  handleSaveTap: () => Promise<void>
  handleWechatProfileTap: () => Promise<void>
  syncProfile: () => Promise<void>
}

let wechatDraftProfile: Pick<SocialProfile, 'avatarUrl' | 'city' | 'identityTag' | 'name' | 'signature'> | null = null

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
    city: '上海',
    hasWechatProfile: false,
    identityTag: '酒局发起人 / 气氛组',
    loggedIn: false,
    name: '微信用户',
    phoneMasked: '',
    signature: '今晚这局不见不散。',
    wechatOpenId: '',
  },

  async onLoad() {
    await this.syncProfile()
  },

  async onShow() {
    await this.syncProfile()
  },

  async syncProfile() {
    const [session, profile] = await Promise.all([getUserAuthSession(), getCurrentProfile()])
    this.setData({
      avatarUrl: profile.avatarUrl || avatarAsset(1),
      city: profile.city,
      hasWechatProfile: Boolean(profile.wechatOpenId || wechatDraftProfile),
      identityTag: profile.identityTag,
      loggedIn: session.loggedIn && Boolean(session.profile?.phone),
      name: profile.name,
      phoneMasked: profile.phoneMasked || '',
      signature: profile.signature,
      wechatOpenId: profile.wechatOpenId || '',
    })
  },

  handleFieldInput(event) {
    const { field } = event.currentTarget.dataset as { field: 'city' | 'identityTag' | 'name' | 'signature' }
    const value = event.detail.value || ''
    this.setData({
      [field]: value,
    } as Record<string, string>)
  },

  async handleWechatProfileTap() {
    try {
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
        city: this.data.city,
        identityTag: this.data.identityTag,
        name: userInfo.nickName || this.data.name,
        signature: this.data.signature,
      }
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        hasWechatProfile: true,
        name: userInfo.nickName || this.data.name,
      })
      wx.showToast({
        title: '已获取微信资料',
        icon: 'success',
      })
    } catch {
      wx.showToast({
        title: '未授权微信资料',
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

    try {
      const loginCode = await requestLoginCode()
      const profile = await loginWithWechatPhone({
        loginCode,
        phoneCode: detail.code,
        profile: {
          avatarUrl: wechatDraftProfile?.avatarUrl || this.data.avatarUrl,
          city: this.data.city.trim(),
          identityTag: this.data.identityTag.trim(),
          name: wechatDraftProfile?.name || this.data.name.trim(),
          signature: this.data.signature.trim(),
        },
      })
      wechatDraftProfile = {
        avatarUrl: profile.avatarUrl,
        city: profile.city,
        identityTag: profile.identityTag,
        name: profile.name,
        signature: profile.signature,
      }
      this.setData({
        avatarUrl: profile.avatarUrl,
        hasWechatProfile: true,
        loggedIn: Boolean(profile.phone),
        name: profile.name,
        phoneMasked: profile.phoneMasked || '',
        wechatOpenId: profile.wechatOpenId || '',
      })
      wx.showToast({
        title: '登录成功',
        icon: 'success',
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '登录失败',
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
    if (!this.data.name.trim()) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none',
      })
      return
    }

    await saveCurrentProfile({
      avatarUrl: this.data.avatarUrl,
      city: this.data.city.trim(),
      identityTag: this.data.identityTag.trim(),
      name: this.data.name.trim(),
      signature: this.data.signature.trim(),
    })

    wx.showToast({
      title: '资料已保存',
      icon: 'success',
    })
  },
})

export {}
