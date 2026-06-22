import {
  createManagedMoment,
  getManagedLiveSession,
  uploadManagedMomentImage,
  type ManagedMomentNodeType,
  type ManagedMomentUsageConsent,
  type ManagedMomentVisibility,
  type ManagedMomentPayload,
} from '../../services/operations'
import { normalizeManagedAssetPath } from '../../config/assets'
import { getSessionRuntime, type SessionParticipant } from '../../utils/session'
import { ensureUserAuthorized, type SocialProfile } from '../../utils/social'

type ConsentKey = keyof ManagedMomentUsageConsent

interface MomentNodeOption {
  active?: boolean
  label: string
  value: ManagedMomentNodeType
}

interface MomentVisibilityOption {
  active?: boolean
  label: string
  value: ManagedMomentVisibility
}

interface MomentConsentItem {
  checked: boolean
  desc: string
  key: ConsentKey
  label: string
}

interface CaptionPreset {
  text: string
}

interface VisibleMemberOption extends SessionParticipant {
  active: boolean
  initial: string
}

interface MomentEditorState {
  authorizationOptions: MomentConsentItem[]
  caption: string
  captionPresets: CaptionPreset[]
  clientDraftId: string
  consentItems: MomentConsentItem[]
  detailMode: boolean
  draftImageFilePath: string
  imageUrl: string
  memberOptions: VisibleMemberOption[]
  nodeOptions: MomentNodeOption[]
  nodeType: ManagedMomentNodeType
  saving: boolean
  selectedAuthorizations: ConsentKey[]
  selectedVisibleProfileIds: string[]
  sessionId: string
  showVisibleMemberPicker: boolean
  sourceMomentId: string
  submitLabel: string
  title: string
  uploadError: string
  uploading: boolean
  visibility: ManagedMomentVisibility
  visibilityOptions: MomentVisibilityOption[]
}

interface MomentEditorMethods {
  buildPayload: () => ManagedMomentPayload
  handleBackTap: () => void
  handleCaptionInput: (event: WechatMiniprogram.Input) => void
  handleCaptionPresetTap: (event: WechatMiniprogram.BaseEvent) => void
  handleChooseImage: () => void
  handleConsentTap: (event: WechatMiniprogram.BaseEvent) => void
  handleMemberTap: (event: WechatMiniprogram.BaseEvent) => void
  handleNodeTypeTap: (event: WechatMiniprogram.BaseEvent) => void
  handleReturnInviteTap: () => void
  handleRetryUploadTap: () => void
  handleSubmitTap: () => Promise<void>
  handleVisibilityTap: (event: WechatMiniprogram.BaseEvent) => void
  loadSessionMembers: (sessionId: string, currentProfile: SocialProfile) => Promise<void>
  readLocalFileAsDataUrl: (filePath: string) => Promise<string>
  showToast: (message: string) => void
  uploadImageFile: (filePath: string) => Promise<void>
}

const NODE_OPTIONS: MomentNodeOption[] = [
  { label: '拍第一张', value: 'opening' },
  { label: '聚会照片', value: 'highlight' },
  { label: '聚会事件', value: 'drinking' },
  { label: '私密记录', value: 'private' },
  { label: '收官合影', value: 'closing' },
]

const VISIBILITY_OPTIONS: MomentVisibilityOption[] = [
  { label: '本聚会可见', value: 'session' },
  { label: '允许分享', value: 'share' },
  { label: '指定成员', value: 'selected' },
]

const CONSENT_ITEMS: MomentConsentItem[] = [
  { checked: true, desc: '用于本聚会记录页', key: 'session', label: '本聚会展示' },
  { checked: true, desc: '用于聚会回顾', key: 'brief', label: '生成回顾' },
  { checked: true, desc: '进入可分享内容池', key: 'share', label: '允许加入分享页' },
  { checked: true, desc: '参与精彩照片推荐', key: 'ranking', label: '参与推荐' },
]

const CAPTION_PRESETS: CaptionPreset[] = [
  { text: '今晚第一张合影' },
  { text: '朋友到齐，先留个纪念' },
  { text: '这张照片放进聚会相册' },
  { text: '等会儿一起回看这一刻' },
]

const getNodeLabel = (nodeType: ManagedMomentNodeType) =>
  NODE_OPTIONS.find((item) => item.value === nodeType)?.label || '精彩瞬间'

const normalizeNodeType = (value?: string): ManagedMomentNodeType => {
  const matched = NODE_OPTIONS.find((item) => item.value === value)
  return matched?.value || 'highlight'
}

const normalizeVisibility = (value?: string): ManagedMomentVisibility => {
  const matched = VISIBILITY_OPTIONS.find((item) => item.value === value)
  return matched?.value || 'session'
}

const buildNodeOptions = (nodeType: ManagedMomentNodeType): MomentNodeOption[] =>
  NODE_OPTIONS.map((item) => ({
    ...item,
    active: item.value === nodeType,
  }))

const buildVisibilityOptions = (visibility: ManagedMomentVisibility): MomentVisibilityOption[] =>
  VISIBILITY_OPTIONS.map((item) => ({
    ...item,
    active: item.value === visibility,
  }))

const buildSelectedAuthorizations = (items: MomentConsentItem[]): ConsentKey[] =>
  items.filter((item) => item.checked).map((item) => item.key)

const shouldShowVisibleMemberPicker = (nodeType: ManagedMomentNodeType, visibility: ManagedMomentVisibility) =>
  nodeType === 'private' || visibility === 'private' || visibility === 'selected'

const getMemberInitial = (name: string) => name.trim().slice(0, 1) || '?'

const getMemberStatusText = (status?: string) => {
  switch (String(status || '').toLowerCase()) {
    case 'joined':
    case 'active':
    case 'ready':
      return '已加入'
    case 'invited':
    case 'pending':
      return '待加入'
    case 'left':
      return '已离开'
    default:
      return '本聚会成员'
  }
}

const normalizeParticipants = (items: SessionParticipant[], currentProfileId: string): VisibleMemberOption[] => {
  const seen = new Set<string>()
  return items
    .map((item) => ({
      avatarUrl: item.avatarUrl || '',
      name: item.name || (item.profileId ? `成员${item.profileId.slice(-4)}` : '成员'),
      profileId: item.profileId || '',
      status: getMemberStatusText(item.status),
    }))
    .filter((item) => {
      if (!item.profileId || seen.has(item.profileId)) {
        return false
      }
      seen.add(item.profileId)
      return true
    })
    .map((item) => ({
      ...item,
      active: item.profileId === currentProfileId,
      initial: getMemberInitial(item.name),
    }))
}

const buildFileName = (filePath: string) => {
  const ext = /\.jpe?g$/i.test(filePath) ? 'jpg' : /\.webp$/i.test(filePath) ? 'webp' : 'png'
  return `moment-${Date.now()}.${ext}`
}

const buildDataUrl = (filePath: string, data: string) => {
  const mime = /\.jpe?g$/i.test(filePath) ? 'image/jpeg' : /\.webp$/i.test(filePath) ? 'image/webp' : 'image/png'
  return `data:${mime};base64,${data}`
}

Page<MomentEditorState, MomentEditorMethods>({
  data: {
    authorizationOptions: CONSENT_ITEMS,
    caption: '',
    captionPresets: CAPTION_PRESETS,
    clientDraftId: '',
    consentItems: CONSENT_ITEMS,
    detailMode: false,
    draftImageFilePath: '',
    imageUrl: '',
    memberOptions: [],
    nodeOptions: buildNodeOptions('highlight'),
    nodeType: 'highlight',
    saving: false,
    selectedAuthorizations: buildSelectedAuthorizations(CONSENT_ITEMS),
    selectedVisibleProfileIds: [],
    sessionId: '',
    showVisibleMemberPicker: false,
    sourceMomentId: '',
    submitLabel: '保存照片',
    title: '拍照/上传',
    uploadError: '',
    uploading: false,
    visibility: 'session',
    visibilityOptions: buildVisibilityOptions('session'),
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const nodeType = normalizeNodeType(typeof query?.nodeType === 'string' ? decodeURIComponent(query.nodeType) : '')
    const sourceMomentId = typeof query?.momentId === 'string' ? decodeURIComponent(query.momentId) : ''
    const detailMode = query?.mode === 'detail' || Boolean(sourceMomentId)
    const requestedVisibility = normalizeVisibility(typeof query?.visibility === 'string' ? decodeURIComponent(query.visibility) : '')
    const visibility = nodeType === 'private' && requestedVisibility === 'session' ? 'selected' : requestedVisibility
    const redirect = `/pages/moment-editor/index?sessionId=${encodeURIComponent(sessionId)}&nodeType=${encodeURIComponent(nodeType)}`
    const profile = await ensureUserAuthorized(redirect)

    if (!profile) {
      return
    }

    if (!sessionId) {
      this.showToast('未找到当前聚会')
      return
    }

    const storedDetail = wx.getStorageSync('live-record-selected-moment-detail') as {
      caption?: string
      imageUrl?: string
      momentId?: string
      sessionId?: string
      title?: string
    } | undefined
    const matchedDetail = detailMode && storedDetail?.momentId === sourceMomentId ? storedDetail : null

    this.setData({
      caption: matchedDetail?.caption || '',
      clientDraftId: `moment-${sessionId}-${nodeType}-${Date.now()}`,
      detailMode,
      imageUrl: matchedDetail?.imageUrl ? normalizeManagedAssetPath(matchedDetail.imageUrl) || matchedDetail.imageUrl : '',
      nodeOptions: buildNodeOptions(nodeType),
      nodeType,
      sessionId,
      selectedVisibleProfileIds: profile.id ? [profile.id] : [],
      showVisibleMemberPicker: shouldShowVisibleMemberPicker(nodeType, visibility),
      sourceMomentId,
      submitLabel: detailMode ? '返回记录' : '保存照片',
      title: detailMode ? '照片详情' : getNodeLabel(nodeType),
      visibility,
      visibilityOptions: buildVisibilityOptions(visibility),
    })

    await this.loadSessionMembers(sessionId, profile)
  },

  async loadSessionMembers(sessionId, currentProfile) {
    const runtime = getSessionRuntime()
    const currentProfileId = currentProfile.id
    let participants = runtime.selectedPlayers || []
    try {
      const liveSession = await getManagedLiveSession(sessionId, runtime.inviteCode)
      participants = liveSession.joinStatusPlayers.map((item) => ({
        avatarUrl: item.avatarUrl,
        name: item.name,
        profileId: item.profileId,
        status: item.status,
      }))
    } catch (error) {
      participants = runtime.selectedPlayers || []
    }

    const withCurrent = runtime.currentUser?.id
      ? [
          ...participants,
          {
            avatarUrl: runtime.currentUser.avatarUrl,
            name: runtime.currentUser.name,
            profileId: runtime.currentUser.id,
            status: '',
          },
        ]
      : participants
    const withAuthorizedProfile = currentProfileId
      ? [
          ...withCurrent,
          {
            avatarUrl: currentProfile.avatarUrl,
            name: currentProfile.name || '我',
            profileId: currentProfileId,
            status: '',
          },
        ]
      : withCurrent
    const memberOptions = normalizeParticipants(withAuthorizedProfile, currentProfileId)
    const selectedVisibleProfileIds = this.data.selectedVisibleProfileIds.filter((profileId) =>
      memberOptions.some((item) => item.profileId === profileId),
    )
    const nextSelectedProfileIds = selectedVisibleProfileIds.length
      ? selectedVisibleProfileIds
      : memberOptions.find((item) => item.profileId === currentProfileId)?.profileId
        ? [currentProfileId]
        : memberOptions[0]?.profileId
          ? [memberOptions[0].profileId]
          : []
    this.setData({
      memberOptions: memberOptions.map((item) => ({
        ...item,
        active: nextSelectedProfileIds.includes(item.profileId || ''),
      })),
      selectedVisibleProfileIds: nextSelectedProfileIds,
    })
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/live-record/index' })
      },
    })
  },

  handleCaptionInput(event) {
    if (this.data.detailMode) {
      return
    }
    this.setData({
      caption: String(event.detail.value || '').slice(0, 80),
    })
  },

  handleCaptionPresetTap(event) {
    if (this.data.detailMode) {
      return
    }
    const { text } = event.currentTarget.dataset as { text?: string }
    if (!text) {
      return
    }
    this.setData({ caption: String(text).slice(0, 80) })
  },

  handleNodeTypeTap(event) {
    if (this.data.detailMode) {
      return
    }
    const { value } = event.currentTarget.dataset as { value?: string }
    const nodeType = normalizeNodeType(value)
    const visibility = nodeType === 'private' && this.data.visibility === 'session' ? 'selected' : this.data.visibility
    this.setData({
      nodeOptions: buildNodeOptions(nodeType),
      nodeType,
      showVisibleMemberPicker: shouldShowVisibleMemberPicker(nodeType, visibility),
      title: getNodeLabel(nodeType),
      visibility,
      visibilityOptions: buildVisibilityOptions(visibility),
    })
  },

  handleVisibilityTap(event) {
    if (this.data.detailMode) {
      return
    }
    const { value } = event.currentTarget.dataset as { value?: string }
    const visibility = normalizeVisibility(value)
    this.setData({
      showVisibleMemberPicker: shouldShowVisibleMemberPicker(this.data.nodeType, visibility),
      visibility,
      visibilityOptions: buildVisibilityOptions(visibility),
    })
  },

  handleConsentTap(event) {
    if (this.data.detailMode) {
      return
    }
    const { key } = event.currentTarget.dataset as { key?: ConsentKey }
    if (!key) {
      return
    }

    const consentItems = this.data.consentItems.map((item) => ({
      ...item,
      checked: item.key === key ? !item.checked : item.checked,
    }))
    this.setData({
      authorizationOptions: consentItems,
      consentItems,
      selectedAuthorizations: buildSelectedAuthorizations(consentItems),
    })
  },

  handleMemberTap(event) {
    if (this.data.detailMode) {
      return
    }
    const { profileId } = event.currentTarget.dataset as { profileId?: string }
    if (!profileId) {
      return
    }
    const selected = new Set(this.data.selectedVisibleProfileIds)
    if (selected.has(profileId)) {
      selected.delete(profileId)
    } else {
      selected.add(profileId)
    }
    const selectedVisibleProfileIds = Array.from(selected)
    this.setData({
      memberOptions: this.data.memberOptions.map((item) => ({
        ...item,
        active: selectedVisibleProfileIds.includes(item.profileId || ''),
      })),
      selectedVisibleProfileIds,
    })
  },

  handleChooseImage() {
    if (this.data.detailMode) {
      return
    }
    if (this.data.uploading || this.data.saving) {
      return
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const filePath = result.tempFiles[0]?.tempFilePath || ''
        if (filePath) {
          void this.uploadImageFile(filePath)
        }
      },
      fail: () => undefined,
    })
  },

  async uploadImageFile(filePath) {
    if (!this.data.sessionId) {
      this.showToast('未找到当前聚会')
      return
    }

    this.setData({ draftImageFilePath: filePath, uploadError: '', uploading: true })
    wx.showLoading({
      title: '上传图片',
      mask: true,
    })

    try {
      const dataUrl = await this.readLocalFileAsDataUrl(filePath)
      const result = await uploadManagedMomentImage({
        dataUrl,
        fileName: buildFileName(filePath),
        sessionId: this.data.sessionId,
      })
      this.setData({ imageUrl: normalizeManagedAssetPath(result.url) || result.url, uploadError: '' })
      this.showToast('图片已上传')
    } catch (error) {
      const uploadError = error instanceof Error ? error.message : '图片上传失败'
      this.setData({ uploadError })
      this.showToast(uploadError)
    } finally {
      wx.hideLoading()
      this.setData({ uploading: false })
    }
  },

  handleRetryUploadTap() {
    if (this.data.uploading || this.data.saving) {
      return
    }

    if (!this.data.draftImageFilePath) {
      this.showToast('请重新选择图片')
      return
    }

    void this.uploadImageFile(this.data.draftImageFilePath)
  },

  handleReturnInviteTap() {
    const sessionId = this.data.sessionId
    const url = sessionId
      ? `/pages/invite-group/index?sessionId=${encodeURIComponent(sessionId)}`
      : '/pages/invite-group/index'
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({ url })
      },
    })
  },

  readLocalFileAsDataUrl(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath,
        encoding: 'base64',
        success: (result) => {
          const data = String(result.data || '')
          if (!data) {
            reject(new Error('图片读取失败'))
            return
          }
          resolve(buildDataUrl(filePath, data))
        },
        fail: reject,
      })
    })
  },

  buildPayload() {
    const usageConsent = this.data.consentItems.reduce<Partial<ManagedMomentUsageConsent>>((result, item) => {
      result[item.key] = item.checked
      return result
    }, {})

    return {
      caption: this.data.caption.trim(),
      clientDraftId: this.data.clientDraftId,
      imageUrl: this.data.imageUrl,
      nodeType: this.data.nodeType,
      usageConsent,
      visibility: this.data.visibility,
      visibleProfileIds: shouldShowVisibleMemberPicker(this.data.nodeType, this.data.visibility)
        ? this.data.selectedVisibleProfileIds
        : [],
    }
  },

  async handleSubmitTap() {
    if (this.data.detailMode) {
      wx.navigateBack({
        fail: () => {
          wx.redirectTo({ url: `/pages/live-record/index?sessionId=${encodeURIComponent(this.data.sessionId)}` })
        },
      })
      return
    }

    if (this.data.saving || this.data.uploading) {
      return
    }

    if (!this.data.sessionId) {
      this.showToast('未找到当前聚会')
      return
    }

    if (!this.data.caption.trim() && !this.data.imageUrl) {
      this.showToast('请先添加图片或一句话说明')
      return
    }

    if (this.data.showVisibleMemberPicker && !this.data.selectedVisibleProfileIds.length) {
      this.showToast('请选择可见成员')
      return
    }

    this.setData({ saving: true })
    wx.showLoading({
      title: '保存中',
      mask: true,
    })

    try {
      await createManagedMoment(this.data.sessionId, this.buildPayload())
      wx.showToast({
        title: '已记录',
        icon: 'success',
      })
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/live-record/index?sessionId=${encodeURIComponent(this.data.sessionId)}&role=judge`,
          fail: () => {
            wx.reLaunch({ url: `/pages/live-record/index?sessionId=${encodeURIComponent(this.data.sessionId)}&role=judge` })
          },
        })
      }, 260)
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : '保存失败')
    } finally {
      wx.hideLoading()
      this.setData({ saving: false })
    }
  },

  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
