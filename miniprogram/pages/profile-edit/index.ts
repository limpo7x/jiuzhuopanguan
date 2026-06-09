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

interface ProfileEditState {
  avatarUrl: string
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

interface NicknameInputDetail {
  value?: string
}

interface ChooseAvatarDetail {
  avatarUrl?: string
}

interface ProfileEditMethods {
  buildWechatDraftProfile: (nameOverride?: string) => WechatDraftProfile
  completeLogin: (profile: SocialProfile) => Promise<void>
  handleChooseAvatar: (event: WechatMiniprogram.CustomEvent<ChooseAvatarDetail>) => void
  handleFieldInput: (event: WechatMiniprogram.Input) => void
  handleNicknameBlur: (event: WechatMiniprogram.CustomEvent<NicknameInputDetail>) => void
  handleNicknameInput: (event: WechatMiniprogram.CustomEvent<NicknameInputDetail>) => void
  handlePhoneBind: (event: WechatMiniprogram.CustomEvent<{ code?: string; errMsg?: string }>) => Promise<void>
  handleSaveTap: () => Promise<void>
  handleWechatProfileTap: (event: WechatMiniprogram.CustomEvent<{ value?: Record<string, string> }>) => Promise<void>
  syncProfile: () => Promise<void>
}

let wechatDraftProfile: WechatDraftProfile | null = null

const DEFAULT_AVATAR = avatarAsset(1)
const EMPTY_NAME_HINT = '待授权获取'

const isPlaceholderName = (value: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户/i.test(text) || /^酒友/i.test(text) || text === '未登录' || text === EMPTY_NAME_HINT
}

const normalizeNickname = (value: string) => {
  const text = String(value || '').trim()
  return isPlaceholderName(text) ? '' : text
}

const isDefaultAvatar = (value: string) => {
  const text = String(value || '').trim()
  return !text || text === DEFAULT_AVATAR
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
    avatarUrl: DEFAULT_AVATAR,
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
    const [session, profile] = await Promise.all([
      getUserAuthSession(),
      getCurrentDisplayProfile(),
    ])

    const sessionProfile = session.loggedIn && session.profile ? session.profile : null
    const displayProfile =
      sessionProfile && !(isPlaceholderName(sessionProfile.name) && !isPlaceholderName(profile.name)) ? sessionProfile : profile
    const displayName = normalizeNickname(displayProfile.name)
    const displayAvatar = String(displayProfile.avatarUrl || '').trim() || DEFAULT_AVATAR
    const loggedIn = Boolean(sessionProfile?.wechatOpenId || displayProfile.wechatOpenId)

    this.setData({
      avatarUrl: displayAvatar,
      hasWechatProfile: Boolean(displayProfile.wechatOpenId || (displayName && !isDefaultAvatar(displayAvatar))),
      identityTag: displayProfile.identityTag || '',
      loggedIn,
      name: displayName,
      phoneMasked: displayProfile.phoneMasked || '',
      signature: displayProfile.signature || '',
      wechatOpenId: displayProfile.wechatOpenId || (loggedIn ? '__authorized__' : ''),
    })

    wechatDraftProfile = {
      avatarUrl: isDefaultAvatar(displayAvatar) ? '' : displayAvatar,
      identityTag: displayProfile.identityTag || '',
      name: displayName,
      signature: displayProfile.signature || '',
    }

    if (displayName || !isDefaultAvatar(displayAvatar)) {
      cacheAuthorizedWechatProfile({
        name: displayName,
        avatarUrl: isDefaultAvatar(displayAvatar) ? '' : displayAvatar,
      })
    }
  },

  handleFieldInput(event) {
    const { field } = event.currentTarget.dataset as { field: 'identityTag' | 'signature' }
    const value = event.detail.value || ''
    this.setData({
      [field]: value,
    } as Record<string, string>)
  },

  handleChooseAvatar(event) {
    const avatarUrl = String(event.detail?.avatarUrl || '').trim()
    if (!avatarUrl) {
      return
    }

    wechatDraftProfile = {
      avatarUrl,
      identityTag: this.data.identityTag.trim(),
      name: normalizeNickname(this.data.name),
      signature: this.data.signature.trim(),
    }

    cacheAuthorizedWechatProfile({
      name: wechatDraftProfile.name,
      avatarUrl,
    })

    this.setData({
      avatarUrl,
      hasWechatProfile: Boolean(wechatDraftProfile.name || avatarUrl),
    })
  },

  handleNicknameInput(event) {
    const name = normalizeNickname(event.detail?.value || '')
    const avatarUrl = String(this.data.avatarUrl || '').trim()

    if (wechatDraftProfile) {
      wechatDraftProfile = {
        ...wechatDraftProfile,
        avatarUrl,
        name,
      }
    }

    cacheAuthorizedWechatProfile({
      name,
      avatarUrl: isDefaultAvatar(avatarUrl) ? '' : avatarUrl,
    })

    this.setData({
      hasWechatProfile: Boolean(name || !isDefaultAvatar(avatarUrl)),
      name,
    })
  },

  handleNicknameBlur(event) {
    this.handleNicknameInput(event)
  },

  buildWechatDraftProfile(nameOverride?: string) {
    const name = normalizeNickname(nameOverride || this.data.name)
    const avatarUrl = String(this.data.avatarUrl || '').trim()

    if (isDefaultAvatar(avatarUrl)) {
      throw new Error('请先选择微信头像')
    }

    if (!name) {
      throw new Error('请填写微信昵称')
    }

    const profile: WechatDraftProfile = {
      avatarUrl,
      identityTag: this.data.identityTag.trim(),
      name,
      signature: this.data.signature.trim(),
    }

    wechatDraftProfile = profile
    cacheAuthorizedWechatProfile({
      name,
      avatarUrl,
    })

    return profile
  },

  async completeLogin(profile: SocialProfile) {
    const resolvedDisplayName = normalizeNickname(wechatDraftProfile?.name || profile.name || '')
    const resolvedAvatarUrl = String(wechatDraftProfile?.avatarUrl || profile.avatarUrl || '').trim() || DEFAULT_AVATAR

    wechatDraftProfile = {
      avatarUrl: resolvedAvatarUrl,
      identityTag: profile.identityTag,
      name: resolvedDisplayName,
      signature: profile.signature,
    }

    cacheAuthorizedWechatProfile({
      name: resolvedDisplayName,
      avatarUrl: isDefaultAvatar(resolvedAvatarUrl) ? '' : resolvedAvatarUrl,
    })

    this.setData({
      avatarUrl: resolvedAvatarUrl,
      hasWechatProfile: Boolean(resolvedDisplayName || !isDefaultAvatar(resolvedAvatarUrl)),
      loggedIn: Boolean(profile.wechatOpenId),
      name: resolvedDisplayName,
      phoneMasked: profile.phoneMasked || '',
      signature: profile.signature,
      wechatOpenId: profile.wechatOpenId || '',
    })

    if (resolvedDisplayName !== normalizeNickname(profile.name || '') || resolvedAvatarUrl !== String(profile.avatarUrl || '').trim()) {
      await saveCurrentProfile({
        avatarUrl: resolvedAvatarUrl,
        identityTag: profile.identityTag,
        name: resolvedDisplayName,
        signature: profile.signature,
      })
    }
  },

  async handleWechatProfileTap(event) {
    try {
      const formName = normalizeNickname(event.detail?.value?.nickname || '')
      const wechatProfile = this.buildWechatDraftProfile(formName)
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

      await this.completeLogin(profile)

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
        const wechatProfile = this.buildWechatDraftProfile()
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

      await this.completeLogin(profile)

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

    cacheAuthorizedWechatProfile({
      name: normalizeNickname(this.data.name),
      avatarUrl: isDefaultAvatar(this.data.avatarUrl) ? '' : this.data.avatarUrl,
    })

    await saveCurrentProfile({
      avatarUrl: this.data.avatarUrl,
      identityTag: this.data.identityTag.trim(),
      name: normalizeNickname(this.data.name),
      signature: this.data.signature.trim(),
    })

    wx.showToast({
      title: '资料已保存',
      icon: 'success',
    })
  },
})

export {}
