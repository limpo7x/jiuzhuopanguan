import {
  createManagedMomentNomination,
  createOrRefreshManagedSessionBrief,
  getManagedMomentNominationEligibility,
  getManagedSessionBrief,
  getManagedSessionTimeline,
  type ManagedMomentNominationEligibility,
  type ManagedRankingCategory,
  type ManagedSessionBrief,
  type ManagedTimelineNode,
} from '../../services/operations'
import { normalizeManagedAssetPath } from '../../config/assets'
import { resolveCachedManagedImagePath } from '../../utils/imageCache'
import { resolveNominationDisabledLabel, resolveNominationReasonText } from '../../utils/nomination-reason'
import { getSessionRuntime, setSessionRuntime } from '../../utils/session'
import { ensureUserAuthorized } from '../../utils/social'

interface BriefStat {
  label: string
  value: string
}

interface BriefNominationItem {
  alreadyNominatedToday: boolean
  buttonDisabled: boolean
  buttonLabel: string
  caption: string
  category: ManagedRankingCategory
  id: string
  imageUrl: string
  pointsCost: number
  rankingEligible: boolean
  reason: string
  reasonCode: string
  statusText: string
  timeText: string
  title: string
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
  nominationEmptyText: string
  nominationItems: BriefNominationItem[]
  nominationSubmittingMomentId: string
  rankingStatusText: string
  settlementSummary: Record<string, unknown>
  sessionId: string
  shareContentFilter: Record<string, unknown>
  stats: BriefStat[]
  subtitle: string
  timelineEmptyText: string
  timelineNodes: ManagedTimelineNode[]
}

interface SessionBriefMethods {
  applyBrief: (brief: ManagedSessionBrief) => void
  handleBackTap: () => void
  handleNominatePhotoTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handlePreviewFirstImageTap: () => Promise<void>
  handleRankingTap: () => void
  handleRefreshTap: () => Promise<void>
  handleTimelineSelect: (event: WechatMiniprogram.CustomEvent<{ id?: string; nodeKind?: string }>) => Promise<void>
  hydrateBriefTimeline: (brief: ManagedSessionBrief) => Promise<ManagedSessionBrief>
  loadBrief: () => Promise<void>
  refreshNominationEligibility: () => Promise<void>
  showToast: (message: string) => void
}

const countPhotoNodes = (nodes: ManagedTimelineNode[]) =>
  nodes.filter((item) => item.nodeKind === 'moment' && !!item.imageUrl && !item.isTimelinePlaceholder).length

const mergeBriefTimeline = (brief: ManagedSessionBrief, nodes: ManagedTimelineNode[], pendingMediaCount = brief.pendingMediaCount): ManagedSessionBrief => ({
  ...brief,
  pendingMediaCount,
  timeline: {
    ...brief.timeline,
    nodes,
    pendingMediaCount,
    sessionId: brief.timeline.sessionId || brief.sessionId,
  },
})

const buildStats = (brief: ManagedSessionBrief): BriefStat[] => [
  { label: '开场', value: `${brief.openingMomentIds.length}` },
  { label: '照片', value: `${countPhotoNodes(brief.timeline.nodes)}` },
  { label: '账本', value: `${brief.accountingHighlights.length}` },
]

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
  node.nodeKind === 'moment' && !node.isTimelinePlaceholder && !!node.imageUrl

const getDefaultRankingCategoryFromNode = (node: Extract<ManagedTimelineNode, { nodeKind: 'moment' }>): ManagedRankingCategory => {
  if (node.nodeType === 'opening') return 'best_opening'
  if (node.nodeType === 'closing') return 'best_closing'
  if (node.nodeType === 'drinking') return 'today_debt'
  return 'today_highlight'
}

const formatBriefTime = (value?: string) => {
  const timestamp = value ? Date.parse(value) : 0
  if (!Number.isFinite(timestamp) || timestamp <= 0) return ''
  const date = new Date(timestamp)
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${hour}:${minute}`
}

const buildNominationTitle = (node: Extract<ManagedTimelineNode, { nodeKind: 'moment' }>) => {
  const text = String(node.timelineTitle || node.caption || '').trim()
  if (text) return text.replace(/酒局/g, '聚会')
  if (node.nodeType === 'opening') return '开场照片'
  if (node.nodeType === 'closing') return '收尾照片'
  return '聚会照片'
}

const buildNominationItems = (nodes: ManagedTimelineNode[]): BriefNominationItem[] =>
  nodes.filter(isMomentNodeWithImage).map((node) => {
    const reason = node.rankingEligible ? '' : resolveNominationReasonText(node)
    return {
      alreadyNominatedToday: false,
      buttonDisabled: !node.rankingEligible,
      buttonLabel: node.rankingEligible ? '推举这张' : resolveNominationDisabledLabel(node),
      caption: String(node.caption || '').trim() || '这张照片可作为聚会回忆参与推举',
      category: getDefaultRankingCategoryFromNode(node),
      id: node.id,
      imageUrl: node.imageUrl || '',
      pointsCost: 10,
      rankingEligible: node.rankingEligible,
      reason,
      reasonCode: '',
      statusText: node.rankingEligible ? '可消耗积分推举到今日回忆榜' : reason,
      timeText: formatBriefTime(node.createdAt || node.updatedAt),
      title: buildNominationTitle(node),
    }
  })

const applyEligibilityToNominationItem = (
  item: BriefNominationItem,
  eligibility: ManagedMomentNominationEligibility,
): BriefNominationItem => {
  if (eligibility.alreadyNominatedToday) {
    return {
      ...item,
      alreadyNominatedToday: true,
      buttonDisabled: true,
      buttonLabel: '已推举',
      pointsCost: eligibility.pointsCost || item.pointsCost,
      reason: resolveNominationReasonText(eligibility),
      reasonCode: eligibility.reasonCode || 'already_nominated_today',
      statusText: '今天已推举过这张照片',
    }
  }

  if (!eligibility.eligible) {
    const reason = resolveNominationReasonText(eligibility)
    return {
      ...item,
      alreadyNominatedToday: false,
      buttonDisabled: true,
      buttonLabel: resolveNominationDisabledLabel(eligibility),
      pointsCost: eligibility.pointsCost || item.pointsCost,
      reason,
      reasonCode: eligibility.reasonCode || '',
      statusText: reason,
    }
  }

  return {
    ...item,
    alreadyNominatedToday: false,
    buttonDisabled: false,
    buttonLabel: '推举这张',
    pointsCost: eligibility.pointsCost || item.pointsCost,
    reason: '',
    reasonCode: '',
    statusText: `将消耗 ${eligibility.pointsCost || item.pointsCost} 积分`,
  }
}

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
    nominationEmptyText: '这场聚会还没有可推举照片',
    nominationItems: [],
    nominationSubmittingMomentId: '',
    rankingStatusText: '暂无可推举照片',
    settlementSummary: {},
    sessionId: '',
    shareContentFilter: {},
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
      const loadedBrief = briefId ? await getManagedSessionBrief(briefId) : await createOrRefreshManagedSessionBrief(sessionId)
      const hydratedBrief = await this.hydrateBriefTimeline(loadedBrief)
      this.applyBrief(hydratedBrief)
      await this.refreshNominationEligibility()
    } catch (error) {
      toastMessage = error instanceof Error ? error.message : '简报加载失败'
      this.setData({
        errorText: toastMessage,
        loading: false,
        nominationItems: [],
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

  async hydrateBriefTimeline(brief) {
    if (countPhotoNodes(brief.timeline.nodes)) {
      return brief
    }

    const sessionId = brief.sessionId || this.data.sessionId
    if (!sessionId) {
      return brief
    }

    try {
      const refreshedBrief = await createOrRefreshManagedSessionBrief(sessionId)
      if (countPhotoNodes(refreshedBrief.timeline.nodes) || refreshedBrief.timeline.nodes.length > brief.timeline.nodes.length) {
        return refreshedBrief
      }
    } catch {
      // Continue to direct timeline fallback below.
    }

    try {
      const timeline = await getManagedSessionTimeline(sessionId)
      if (countPhotoNodes(timeline.nodes) || timeline.nodes.length > brief.timeline.nodes.length) {
        return mergeBriefTimeline(brief, timeline.nodes, timeline.pendingMediaCount)
      }
    } catch {
      // Keep the original brief when the direct timeline contract is unavailable.
    }

    return brief
  },

  applyBrief(brief) {
    setSessionRuntime({
      sessionId: brief.sessionId || this.data.sessionId,
    })

    const nominationItems = buildNominationItems(brief.timeline.nodes)
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
      nominationEmptyText: nominationItems.length ? '' : '这场聚会还没有可推举照片',
      nominationItems,
      nominationSubmittingMomentId: '',
      rankingStatusText: buildRankingStatusText(brief),
      settlementSummary: brief.settlementSummary,
      sessionId: brief.sessionId || this.data.sessionId,
      shareContentFilter: brief.shareContentFilter,
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
      url: '/pages/rankings/index',
      fail: () => {
        wx.redirectTo({ url: '/pages/rankings/index' })
      },
    })
  },

  async refreshNominationEligibility() {
    const items = this.data.nominationItems
    if (!items.length) return

    const nextItems = await Promise.all(items.map(async (item) => {
      try {
        const eligibility = await getManagedMomentNominationEligibility(item.id, item.category)
        return applyEligibilityToNominationItem(item, eligibility)
      } catch {
        return {
          ...item,
          buttonDisabled: true,
          buttonLabel: '不可推举',
          reasonCode: 'eligibility_unavailable',
          reason: '暂时无法确认推举资格',
          statusText: '暂时无法确认推举资格',
        }
      }
    }))

    this.setData({ nominationItems: nextItems })
  },

  async handleNominatePhotoTap(event) {
    const { momentId } = event.currentTarget.dataset as { momentId?: string }
    const item = this.data.nominationItems.find((entry) => entry.id === momentId)
    if (!item) {
      this.showToast('未找到可推举照片')
      return
    }
    if (this.data.nominationSubmittingMomentId) return
    if (item.buttonDisabled) {
      this.showToast(item.reason || item.statusText || '这张照片暂不可推举')
      return
    }

    this.setData({ nominationSubmittingMomentId: item.id })

    try {
      const latestEligibility = await getManagedMomentNominationEligibility(item.id, item.category)
      const refreshedItem = applyEligibilityToNominationItem(item, latestEligibility)
      if (!latestEligibility.eligible) {
        this.setData({
          nominationItems: this.data.nominationItems.map((entry) => (entry.id === item.id ? refreshedItem : entry)),
        })
        this.showToast(refreshedItem.reason || refreshedItem.statusText)
        return
      }

      const confirm = await new Promise<boolean>((resolve) => {
        wx.showModal({
          title: '推举这张照片？',
          content: `将消耗 ${latestEligibility.pointsCost || item.pointsCost} 积分，推举后会进入今日回忆榜。`,
          confirmText: '确认推举',
          cancelText: '再想想',
          success: (result) => resolve(result.confirm),
          fail: () => resolve(false),
        })
      })

      if (!confirm) return

      await createManagedMomentNomination(item.id, {
        category: item.category,
        clientNominationId: `brief-${item.id}-${Date.now()}`,
      })

      const nominatedItem: BriefNominationItem = {
        ...refreshedItem,
        alreadyNominatedToday: true,
        buttonDisabled: true,
        buttonLabel: '已推举',
        reason: '',
        reasonCode: 'already_nominated_today',
        statusText: '今天已推举过这张照片',
      }
      this.setData({
        nominationItems: this.data.nominationItems.map((entry) => (entry.id === item.id ? nominatedItem : entry)),
      })
      this.showToast('推举成功')
    } catch (error) {
      this.showToast(error instanceof Error ? error.message : '推举失败')
    } finally {
      this.setData({ nominationSubmittingMomentId: '' })
    }
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
