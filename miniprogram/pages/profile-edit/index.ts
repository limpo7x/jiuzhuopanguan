import { getCurrentProfile, saveCurrentProfile } from '../../utils/social'

interface ProfileAvatar {
  active?: boolean
  url: string
}

interface ProfileEditState {
  avatarUrl: string
  avatars: ProfileAvatar[]
  city: string
  identityTag: string
  name: string
  signature: string
}

interface ProfileEditMethods {
  handleAvatarTap: (event: WechatMiniprogram.BaseEvent) => void
  handleFieldInput: (event: WechatMiniprogram.Input) => void
  handleSaveTap: () => Promise<void>
  syncProfile: () => Promise<void>
}

Page<ProfileEditState, ProfileEditMethods>({
  data: {
    avatarUrl: '/assets/avatars/avatar-1.png',
    avatars: [
      { url: '/assets/avatars/avatar-1.png', active: true },
      { url: '/assets/avatars/avatar-2.png' },
      { url: '/assets/avatars/avatar-3.png' },
      { url: '/assets/avatars/avatar-4.png' },
    ],
    city: '上海',
    identityTag: '酒局发起人 / 气氛组',
    name: '小太阳组会玩',
    signature: '今晚这局不见不散。',
  },

  async onLoad() {
    await this.syncProfile()
  },

  async syncProfile() {
    const profile = await getCurrentProfile()
    this.setData({
      avatarUrl: profile.avatarUrl,
      avatars: this.data.avatars.map((item) => ({
        ...item,
        active: item.url === profile.avatarUrl,
      })),
      city: profile.city,
      identityTag: profile.identityTag,
      name: profile.name,
      signature: profile.signature,
    })
  },

  handleAvatarTap(event) {
    const { url } = event.currentTarget.dataset as { url: string }
    this.setData({
      avatarUrl: url,
      avatars: this.data.avatars.map((item) => ({
        ...item,
        active: item.url === url,
      })),
    })
  },

  handleFieldInput(event) {
    const { field } = event.currentTarget.dataset as { field: 'city' | 'identityTag' | 'name' | 'signature' }
    const value = event.detail.value || ''
    this.setData({
      [field]: value,
    } as Record<string, string>)
  },

  async handleSaveTap() {
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
