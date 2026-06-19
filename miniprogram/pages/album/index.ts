import {
  getManagedSessionBrief,
  getManagedSessionMomentSummaries,
  type ManagedSessionBrief,
  type ManagedSessionMomentSummary,
  type ManagedTimelineNode,
} from '../../services/operations'

interface AlbumItem {
  briefId: string
  coverUrl: string
  coverBroken?: boolean
  meta: string
  sessionId: string
  shareImageUrl: string
  shareImageTaskId: string
  statusText: string
  title: string
}

interface AlbumPageState {
  emptyText: string
  items: AlbumItem[]
  loading: boolean
  mode: string
  pageTitle: string
}

interface AlbumPageMethods {
  handleBackTap: () => void
  handleCreateTap: () => void
  handleCoverError: (event: WechatMiniprogram.BaseEvent) => void
  handleCoverLoad: (event: WechatMiniprogram.BaseEvent) => void
  handleItemTap: (event: WechatMiniprogram.BaseEvent) => void
  handleRefreshTap: () => Promise<void>
  loadAlbums: () => Promise<void>
  openPage: (url: string) => void
}

const internalAlbumTitlePattern = /^(IT|PR|QA|DEV|TEST)[-_ ][A-Z0-9_-]+(?:\s+(opening|highlight|drinking|private|closing))?$/i
const internalSeedPattern = /(IT-MOMENTS|PR-BE-DB-LOGIN-SEED|PR[-_ ]Seed|QA[-_ ]Seed|DEV[-_ ]Seed|TEST[-_ ]Seed)/i

const modeTitleMap: Record<string, string> = {
  album: '聚会记录',
  ended: '已结束聚会',
  host: '我创建的聚会',
  joined: '我参与的聚会',
  records: '聚会记录',
  shares: '分享图',
  unshared: '待分享回忆',
}

const modeEmptyMap: Record<string, string> = {
  album: '还没有聚会记录，先创建一场聚会并拍下第一张照片。',
  ended: '还没有已结束的聚会。',
  host: '还没有你创建的聚会，先从首页发起一次记录。',
  joined: '还没有参与过的聚会，可以用口令加入好友房间。',
  records: '还没有聚会记录，先创建一场聚会并拍下第一张照片。',
  shares: '还没有生成过分享图。',
  unshared: '暂无待分享回忆。',
}

const nodeTypeTitleMap: Record<string, string> = {
  closing: '收尾照片',
  drinking: '聚会账本',
  highlight: '聚会照片',
  opening: '开场照片',
  private: '私密记录',
}

const normalizeMode = (value?: string) => {
  const text = String(value || '').trim()
  return modeTitleMap[text] ? text : 'album'
}

const normalizeTitle = (title?: string, sessionName?: string, index = 0) => {
  const rawTitle = String(title || '').trim()
  const rawSessionName = String(sessionName || '').trim()
  const match = rawTitle.match(internalAlbumTitlePattern)
  if (match) {
    const nodeType = String(match[2] || '').toLowerCase()
    return nodeTypeTitleMap[nodeType] || `聚会相册 ${index + 1}`
  }
  if (rawTitle && !internalSeedPattern.test(rawTitle)) return rawTitle
  if (rawSessionName && !internalAlbumTitlePattern.test(rawSessionName) && !internalSeedPattern.test(rawSessionName)) return rawSessionName
  return `聚会相册 ${index + 1}`
}

const normalizeAlbumMetaText = (value?: string) => {
  const text = String(value || '').trim()
  if (!text || internalAlbumTitlePattern.test(text) || internalSeedPattern.test(text)) {
    return ''
  }
  return text
}

const isMomentNodeWithImage = (node: ManagedTimelineNode): node is Extract<ManagedTimelineNode, { nodeKind: 'moment' }> =>
  node.nodeKind === 'moment' && !node.isTimelinePlaceholder && !!node.imageUrl

const getMomentNodeTime = (node: Extract<ManagedTimelineNode, { nodeKind: 'moment' }>) => {
  const timestamp = Date.parse(node.createdAt || node.updatedAt || '')
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Number.MAX_SAFE_INTEGER
}

const findFirstBriefPhoto = (brief?: ManagedSessionBrief) => {
  const node = (brief?.timeline?.nodes || [])
    .filter(isMomentNodeWithImage)
    .sort((left, right) => {
      const timeDiff = getMomentNodeTime(left) - getMomentNodeTime(right)
      if (timeDiff !== 0) return timeDiff
      const leftOpening = left.nodeType === 'opening' ? 0 : 1
      const rightOpening = right.nodeType === 'opening' ? 0 : 1
      if (leftOpening !== rightOpening) return leftOpening - rightOpening
      return String(left.id || '').localeCompare(String(right.id || ''))
    })[0]
  return node?.imageUrl || ''
}

const formatAlbumTime = (value?: string) => {
  const timestamp = value ? Date.parse(value) : 0
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return ''
  }
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

const buildStatusText = (item: ManagedSessionMomentSummary) => {
  if (hasGeneratedShareImage(item)) return '分享图已生成'
  if (isEndedSessionSummary(item)) return '已结束'
  if (item.shareImageStatus === 'failed') return '分享图待重试'
  const stateText = String(item.stateText || item.status || item.state || '').trim()
  return stateText || '进行中'
}

const buildMeta = (item: ManagedSessionMomentSummary, timeText = '') => {
  const parts = []
  if (timeText) parts.push(timeText)
  const sessionName = normalizeAlbumMetaText(item.sessionName)
  if (sessionName) parts.push(sessionName)
  if (hasGeneratedShareImage(item)) parts.push('可查看分享图')
  return parts.join(' · ') || '聚会记录'
}

const isEndedSessionSummary = (item: ManagedSessionMomentSummary) => {
  const stateText = `${item.state || ''} ${item.status || ''} ${item.stateText || ''}`.trim()
  return Boolean(item.endedAt) || /已结束|结束|已完成|ended|finished|closed/i.test(stateText)
}

const hasGeneratedShareImage = (item: ManagedSessionMomentSummary) => Boolean(item.readyShareImageUrl || item.shareImageUrl)

const isPendingShareMemory = (item: ManagedSessionMomentSummary) => !isEndedSessionSummary(item) && !hasGeneratedShareImage(item)

const filterSummariesByMode = (items: ManagedSessionMomentSummary[], mode: string) => {
  switch (mode) {
    case 'ended':
      return items.filter(isEndedSessionSummary)
    case 'shares':
      return items.filter(hasGeneratedShareImage)
    case 'unshared':
      return items.filter(isPendingShareMemory)
    case 'album':
    case 'records':
    default:
      return items
  }
}

const mapAlbumItem = async (item: ManagedSessionMomentSummary, index: number): Promise<AlbumItem> => {
  let firstPhotoUrl = ''
  let timeText = formatAlbumTime(item.createdAt)
  if (item.briefId) {
    try {
      const brief = await getManagedSessionBrief(item.briefId)
      firstPhotoUrl = findFirstBriefPhoto(brief) || firstPhotoUrl
      timeText = timeText || formatAlbumTime(brief.createdAt || brief.updatedAt)
    } catch {
      firstPhotoUrl = ''
    }
  }
  const shareImageUrl = item.readyShareImageUrl || item.shareImageUrl || ''
  firstPhotoUrl = firstPhotoUrl || item.coverPhotoUrl || ''
  return {
    briefId: item.briefId || '',
    coverUrl: firstPhotoUrl || '',
    meta: buildMeta(item, timeText),
    sessionId: item.sessionId || '',
    shareImageUrl,
    shareImageTaskId: item.shareImageTaskId || '',
    statusText: buildStatusText(item),
    title: normalizeTitle(item.title, item.sessionName, index),
  }
}

Page<AlbumPageState, AlbumPageMethods>({
  data: {
    emptyText: modeEmptyMap.album,
    items: [],
    loading: true,
    mode: 'album',
    pageTitle: modeTitleMap.album,
  },

  onLoad(query) {
    const mode = normalizeMode(typeof query?.mode === 'string' ? query.mode : '')
    this.setData({
      emptyText: modeEmptyMap[mode],
      mode,
      pageTitle: modeTitleMap[mode],
    })
    void this.loadAlbums()
  },

  onPullDownRefresh() {
    void this.loadAlbums().finally(() => wx.stopPullDownRefresh())
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: '/pages/index/index',
          fail: () => wx.reLaunch({ url: '/pages/index/index' }),
        })
      },
    })
  },

  async handleRefreshTap() {
    await this.loadAlbums()
  },

  async loadAlbums() {
    this.setData({ loading: true })
    try {
      const summaries = await getManagedSessionMomentSummaries()
      const filteredSummaries = filterSummariesByMode(summaries, this.data.mode)
      const items = await Promise.all(filteredSummaries.map(mapAlbumItem))
      this.setData({
        items,
        loading: false,
      })
    } catch (error) {
      this.setData({ items: [], loading: false })
      wx.showToast({ title: error instanceof Error ? error.message : '相册加载失败', icon: 'none' })
    }
  },

  handleItemTap(event) {
    const { sessionId, shareImageUrl } = event.currentTarget.dataset as { sessionId?: string; shareImageUrl?: string }
    if (this.data.mode === 'shares') {
      if (shareImageUrl) {
        wx.previewImage({ current: shareImageUrl, urls: [shareImageUrl] })
        return
      }
      wx.showToast({ title: '分享图还未生成', icon: 'none' })
      return
    }
    if (sessionId) {
      this.openPage(`/pages/live-record/index?sessionId=${encodeURIComponent(sessionId)}`)
      return
    }
    wx.showToast({ title: '缺少回忆信息', icon: 'none' })
  },

  handleCreateTap() {
    this.openPage('/pages/create-session/index')
  },

  handleCoverLoad(event) {
    const { briefId, sessionId } = event.currentTarget.dataset as { briefId?: string; sessionId?: string }
    const detail = (event as unknown as { detail?: { height?: number; width?: number } }).detail || {}
    const width = Number(detail.width)
    const height = Number(detail.height)
    if (!Number.isFinite(width) || !Number.isFinite(height) || width >= 8 || height >= 8) {
      return
    }
    const key = briefId || sessionId || ''
    this.setData({
      items: this.data.items.map((item) => ((item.briefId || item.sessionId) === key ? { ...item, coverBroken: true } : item)),
    })
  },

  handleCoverError(event) {
    const { briefId, sessionId } = event.currentTarget.dataset as { briefId?: string; sessionId?: string }
    const key = briefId || sessionId || ''
    this.setData({
      items: this.data.items.map((item) => ((item.briefId || item.sessionId) === key ? { ...item, coverBroken: true } : item)),
    })
  },

  openPage(url) {
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },
})

export {}
