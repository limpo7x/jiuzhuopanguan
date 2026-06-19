import {
  createManagedShareImageTask,
  createOrRefreshManagedSessionBrief,
  getManagedSessionBrief,
  retryManagedShareImageTask,
  type ManagedSessionBrief,
  type ManagedShareImageTask,
  type ManagedTimelineNode,
} from '../../services/operations'
import { normalizeManagedAssetPath } from '../../config/assets'
import { resolveCachedManagedImagePath } from '../../utils/imageCache'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import { ensureUserAuthorized } from '../../utils/social'

interface BriefStat {
  label: string
  value: string
}

interface SessionBriefState {
  accountingHighlights: Array<Record<string, unknown>>
  briefId: string
  briefTitle: string
  closingCountText: string
  errorText: string
  eventHighlights: Array<Record<string, unknown>>
  ledgerRankings: Record<string, unknown>
  ledgerSummary: Record<string, unknown>
  loading: boolean
  pendingMediaCount: number
  previewableImageCount: number
  previewImageCount: number
  previewImageUrl: string
  rankingStatusText: string
  settlementSummary: Record<string, unknown>
  sessionId: string
  shareContentFilter: Record<string, unknown>
  shareTask: ManagedShareImageTask | null
  stats: BriefStat[]
  subtitle: string
  timelineEmptyText: string
  timelineNodes: ManagedTimelineNode[]
}

interface SessionBriefMethods {
  applyBrief: (brief: ManagedSessionBrief) => void
  handleBackTap: () => void
  handleCreateShareTaskTap: () => Promise<void>
  handleOpenShareFlowTap: () => void
  handlePreviewShareTask: (event: WechatMiniprogram.CustomEvent<{ imageUrl?: string }>) => void
  handlePreviewFirstImageTap: () => Promise<void>
  handleRankingTap: () => void
  handleRefreshTap: () => Promise<void>
  handleRetryShareTask: () => Promise<void>
  handleTimelineSelect: (event: WechatMiniprogram.CustomEvent<{ id?: string; nodeKind?: string }>) => Promise<void>
  loadBrief: () => Promise<void>
  showToast: (message: string) => void
}

const countPhotoNodes = (nodes: ManagedTimelineNode[]) =>
  nodes.filter((item) => item.nodeKind === 'moment' && !!item.imageUrl && !item.isTimelinePlaceholder).length

const buildStats = (brief: ManagedSessionBrief): BriefStat[] => [
  { label: '开场', value: `${brief.openingMomentIds.length}` },
  { label: '照片', value: `${countPhotoNodes(brief.timeline.nodes)}` },
  { label: '账本', value: `${brief.accountingHighlights.length}` },
]

const buildShareTaskFromBrief = (brief: ManagedSessionBrief): ManagedShareImageTask | null => {
  if (!brief.shareImageTaskId && !brief.shareImageStatus) {
    return null
  }

  return {
    briefId: brief.id,
    createdAt: '',
    failedReason: '',
    finishedAt: '',
    id: brief.shareImageTaskId,
    imageUrl: '',
    includeLedger: false,
    ledgerIncluded: false,
    layoutMode: '',
    miniProgramQrUrl: '',
    qrCodeUrl: '',
    retryCount: 0,
    selectedNodeIds: [],
    sessionId: brief.sessionId,
    startedAt: '',
    status: (brief.shareImageStatus || 'pending') as ManagedShareImageTask['status'],
    updatedAt: '',
  }
}

const countRankingEligibleNodes = (nodes: ManagedTimelineNode[]) =>
  nodes.filter((item) => item.nodeKind === 'moment' && item.rankingEligible && !item.isTimelinePlaceholder).length

const buildRankingStatusText = (brief: ManagedSessionBrief) => {
  const eligibleCount = countRankingEligibleNodes(brief.timeline.nodes)
  if (eligibleCount > 0) {
    return `${eligibleCount} 条可推举`
  }
  return '继续补充后再推举'
}

const isMomentNodeWithImage = (node: ManagedTimelineNode): node is Extract<ManagedTimelineNode, { nodeKind: 'moment' }> =>
  node.nodeKind === 'moment' && !!node.imageUrl

const resolvePreviewImageUrl = async (source?: string) => {
  const normalized = normalizeManagedAssetPath(source)
  if (!normalized) {
    return ''
  }
  return (await resolveCachedManagedImagePath(normalized)) || normalized
}

const resolvePreviewImageSet = async (
  nodes: Array<Extract<ManagedTimelineNode, { nodeKind: 'moment' }>>,
  currentImageUrl: string,
) => {
  const sources = nodes.map((item) => item.imageUrl || '').filter(Boolean)
  const resolvedUrls = (await Promise.all(sources.map((source) => resolvePreviewImageUrl(source)))).filter(Boolean)
  const sourceIndex = sources.findIndex((source) => source === currentImageUrl)
  const current = sourceIndex >= 0 ? resolvedUrls[sourceIndex] || resolvedUrls[0] || '' : await resolvePreviewImageUrl(currentImageUrl)
  return {
    current,
    urls: resolvedUrls,
  }
}

const normalizeBriefTitle = (value?: string) => {
  const text = String(value || '').trim()
  if (!text || /酒局|时间线简报|酒桌|判官/.test(text)) {
    return '聚会简报'
  }
  return text.replace(/时间线/g, '照片').replace(/酒局/g, '聚会')
}

Page<SessionBriefState, SessionBriefMethods>({
  data: {
    accountingHighlights: [],
    briefId: '',
    briefTitle: '聚会简报',
    closingCountText: '未上传收尾照',
    errorText: '',
    eventHighlights: [],
    ledgerRankings: {},
    ledgerSummary: {},
    loading: true,
    pendingMediaCount: 0,
    previewableImageCount: 0,
    previewImageCount: 0,
    previewImageUrl: '',
    rankingStatusText: '暂不可推举',
    settlementSummary: {},
    sessionId: '',
    shareContentFilter: {},
    shareTask: null,
    stats: [],
    subtitle: '按聚会时间整理开场、过程和收尾。',
    timelineEmptyText: '这场聚会还没有可展示的照片记录',
    timelineNodes: [],
  },

  async onLoad(query) {
    const runtime = getSessionRuntime()
    const briefId = typeof query?.briefId === 'string' ? decodeURIComponent(query.briefId) : ''
    const sessionId = typeof query?.sessionId === 'string' ? decodeURIComponent(query.sessionId) : runtime.sessionId || ''
    const redirectQuery = [
      sessionId ? `sessionId=${encodeURIComponent(sessionId)}` : '',
      briefId ? `briefId=${encodeURIComponent(briefId)}` : '',
    ].filter(Boolean).join('&')
    const redirect = `/pages/session-brief/index${redirectQuery ? `?${redirectQuery}` : ''}`

    this.setData({
      briefId,
      sessionId,
    })

    const profile = await ensureUserAuthorized(redirect)

    if (!profile && !briefId && !sessionId) {
      this.setData({
        errorText: '请先完成微信登录后查看聚会简报',
        loading: false,
      })
      return
    }

    await this.loadBrief()
  },

  async loadBrief() {
    const { briefId, sessionId } = this.data
    if (!briefId && !sessionId) {
      this.setData({ loading: false })
      this.showToast('未找到可生成简报的聚会')
      return
    }

    this.setData({ loading: true })
    wx.showLoading({
      title: '加载简报',
      mask: true,
    })

    let toastMessage = ''
    try {
      const brief = briefId ? await getManagedSessionBrief(briefId) : await createOrRefreshManagedSessionBrief(sessionId)
      this.applyBrief(brief)
    } catch (error) {
      toastMessage = error instanceof Error ? error.message : '简报加载失败'
      this.setData({
        errorText: toastMessage,
        loading: false,
        timelineEmptyText: toastMessage,
        timelineNodes: [],
      })
    } finally {
      wx.hideLoading()
    }

    if (toastMessage) {
      this.showToast(toastMessage)
    }
  },

  applyBrief(brief) {
    setSessionRuntime({
      sessionId: brief.sessionId || this.data.sessionId,
    })

    this.setData({
      briefId: brief.id,
      briefTitle: normalizeBriefTitle(brief.title),
      accountingHighlights: brief.accountingHighlights,
      closingCountText: brief.closingMomentIds.length ? `${brief.closingMomentIds.length} 张收尾照` : '未上传收尾照',
      errorText: '',
      eventHighlights: brief.eventHighlights,
      ledgerRankings: brief.ledgerRankings,
      ledgerSummary: brief.ledgerSummary,
      loading: false,
      pendingMediaCount: brief.pendingMediaCount,
      previewableImageCount: brief.timeline.nodes.filter(isMomentNodeWithImage).length,
      rankingStatusText: buildRankingStatusText(brief),
      settlementSummary: brief.settlementSummary,
      sessionId: brief.sessionId || this.data.sessionId,
      shareContentFilter: brief.shareContentFilter,
      shareTask: buildShareTaskFromBrief(brief),
      stats: buildStats(brief),
      subtitle: '已按当前聚会记录生成简报',
      timelineEmptyText: '这场聚会还没有可展示的照片记录',
      timelineNodes: brief.timeline.nodes,
    })
  },

  async handleRefreshTap() {
    await this.loadBrief()
  },

  handleRankingTap() {
    wx.navigateTo({
      url: '/pages/album/index?mode=host',
      fail: () => {
        wx.redirectTo({ url: '/pages/album/index?mode=host' })
      },
    })
  },

  async handleCreateShareTaskTap() {
    if (!this.data.briefId) {
      this.showToast('简报未加载完成')
      return
    }

    wx.showLoading({
      title: '创建分享图',
      mask: true,
    })

    let toastMessage = ''
    try {
      const task = await createManagedShareImageTask(this.data.briefId, { includeLedger: true, layoutMode: 'dual_flow' })
      this.setData({ shareTask: task })
      toastMessage = '分享图任务已创建'
    } catch (error) {
      toastMessage = error instanceof Error ? error.message : '创建失败'
    } finally {
      wx.hideLoading()
    }

    if (toastMessage) {
      this.showToast(toastMessage)
    }
  },

  handleOpenShareFlowTap() {
    const query = [
      this.data.briefId ? `briefId=${encodeURIComponent(this.data.briefId)}` : '',
      this.data.sessionId ? `sessionId=${encodeURIComponent(this.data.sessionId)}` : '',
      this.data.shareTask?.id ? `taskId=${encodeURIComponent(this.data.shareTask.id)}` : '',
    ].filter(Boolean).join('&')

    if (!query) {
      this.showToast('简报未加载完成')
      return
    }

    wx.navigateTo({
      url: `/pages/share-poster/index?${query}`,
      fail: () => {
        wx.redirectTo({ url: `/pages/share-poster/index?${query}` })
      },
    })
  },

  handlePreviewShareTask(event) {
    const imageUrl = event.detail.imageUrl || this.data.shareTask?.imageUrl || ''
    if (!imageUrl) {
      this.showToast('分享图还未生成')
      return
    }

    wx.previewImage({
      urls: [imageUrl],
      current: imageUrl,
    })
  },

  async handlePreviewFirstImageTap() {
    const imageNodes = this.data.timelineNodes.filter(isMomentNodeWithImage)
    const current = imageNodes[0]
    if (!current?.imageUrl || !imageNodes.length) {
      this.showToast('这场聚会还没有可预览照片')
      return
    }
    const { current: previewCurrent, urls } = await resolvePreviewImageSet(imageNodes, current.imageUrl)
    if (!previewCurrent || !urls.length) {
      this.showToast('照片暂时无法预览')
      return
    }
    this.setData({
      previewImageCount: urls.length,
      previewImageUrl: previewCurrent,
    })
    wx.previewImage({
      current: previewCurrent,
      urls,
    })
  },

  async handleTimelineSelect(event) {
    const nodeId = event.detail?.id || ''
    const imageNodes = this.data.timelineNodes.filter(isMomentNodeWithImage)
    const current = imageNodes.find((item) => item.id === nodeId)
    if (!current?.imageUrl || !imageNodes.length) {
      this.showToast('这条记录还没有图片')
      return
    }
    const { current: previewCurrent, urls } = await resolvePreviewImageSet(imageNodes, current.imageUrl)
    if (!previewCurrent || !urls.length) {
      this.showToast('照片暂时无法预览')
      return
    }
    this.setData({
      previewImageCount: urls.length,
      previewImageUrl: previewCurrent,
    })
    wx.previewImage({
      current: previewCurrent,
      urls,
    })
  },

  async handleRetryShareTask() {
    const taskId = this.data.shareTask?.id || ''
    if (!taskId) {
      this.showToast('未找到分享图任务')
      return
    }

    wx.showLoading({
      title: '重试中',
      mask: true,
    })

    let toastMessage = ''
    try {
      const task = await retryManagedShareImageTask(taskId)
      this.setData({ shareTask: task })
      toastMessage = '已重新排队'
    } catch (error) {
      toastMessage = error instanceof Error ? error.message : '重试失败'
    } finally {
      wx.hideLoading()
    }

    if (toastMessage) {
      this.showToast(toastMessage)
    }
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/album/index' })
      },
    })
  },

  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    })
  },
})

export {}
