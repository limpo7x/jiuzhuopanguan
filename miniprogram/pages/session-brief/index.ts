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

interface BriefTimelineItem {
  actionLabel: string
  coverImageUrl: string
  detail: string
  durationText: string
  id: string
  imageUrl: string
  isVideo: boolean
  mediaType: 'image' | 'video' | ''
  nodeKind: string
  timeText: string
  title: string
  videoUrl: string
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
  timelineDisplayItems: BriefTimelineItem[]
  timelineNodes: ManagedTimelineNode[]
}

interface SessionBriefMethods {
  applyBrief: (brief: ManagedSessionBrief) => void
  handleBackTap: () => void
  handleNominatePhotoTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  handlePreviewFirstImageTap: () => Promise<void>
  handleRankingTap: () => void
  handleRefreshTap: () => Promise<void>
  handleSharePosterTap: () => void
  handleTimelineSelect: (event: WechatMiniprogram.CustomEvent<{ id?: string; nodeKind?: string }>) => Promise<void>
  hydrateBriefTimeline: (brief: ManagedSessionBrief) => Promise<ManagedSessionBrief>
  loadBrief: () => Promise<void>
  refreshNominationEligibility: () => Promise<void>
  showToast: (message: string) => void
}

const countPhotoNodes = (nodes: ManagedTimelineNode[]) =>
  nodes.filter((item) => item.nodeKind === 'moment' && item.mediaType !== 'video' && !!item.imageUrl && !item.isTimelinePlaceholder).length

const countVideoNodes = (nodes: ManagedTimelineNode[]) =>
  nodes.filter((item) => item.nodeKind === 'moment' && item.mediaType === 'video' && (!!item.videoUrl || !!item.coverImageUrl || !!item.imageUrl) && !item.isTimelinePlaceholder).length

const countLedgerEventNodes = (nodes: ManagedTimelineNode[]) =>
  nodes.filter(isBriefLedgerEventNode).length

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
  { label: '视频', value: `${countVideoNodes(brief.timeline.nodes)}` },
  { label: '账本', value: `${countLedgerEventNodes(brief.timeline.nodes)}` },
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
  node.nodeKind === 'moment' && node.mediaType !== 'video' && !node.isTimelinePlaceholder && !!node.imageUrl

const getMomentDisplayCoverUrl = (node: Extract<ManagedTimelineNode, { nodeKind: 'moment' }>) =>
  String(node.coverImageUrl || node.imageUrl || '').trim()

const hasFullBriefTimelineNodes = (nodes: ManagedTimelineNode[]) =>
  nodes.some((item) => item.nodeKind === 'event') || nodes.some((item) => item.nodeKind === 'moment' && item.mediaType === 'video')

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
  if (text) return text.replace(/\u9152\u5c40/g, '聚会')
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

const buildBriefEventDetail = (node: Extract<ManagedTimelineNode, { nodeKind: 'event' }>) => {
  const operator = String(node.operatorName || '').trim() || '成员'
  const target = String(node.targetName || '').trim() || '成员'
  const score = Math.abs(Number(node.scoreDelta) || 0) || 1
  if (node.eventType === 'drink_debt') {
    return Number(node.scoreDelta) < 0 ? `${target} 消酒 ${score} 杯` : `${operator} 给 ${target} 记了 ${score} 杯欠酒`
  }
  if (node.eventType === 'drink_add') {
    return Number(node.scoreDelta) < 0 ? `${operator} 为 ${target} 减少加酒 ${score} 杯` : `${operator} 为 ${target} 加了 ${score} 杯酒`
  }
  return String(node.caption || '').trim() || `${operator} 记录了 ${target}`
}

const isBriefLedgerEventNode = (node: ManagedTimelineNode): node is Extract<ManagedTimelineNode, { nodeKind: 'event' }> =>
  node.nodeKind === 'event' && (node.eventType === 'drink_debt' || node.eventType === 'drink_add')

const isBriefTimelineDisplayNode = (node: ManagedTimelineNode) => {
  if (node.nodeKind === 'moment') {
    return !node.isTimelinePlaceholder && (!!node.imageUrl || !!node.coverImageUrl || !!node.videoUrl)
  }
  return isBriefLedgerEventNode(node)
}

const getBriefTimelineActionLabel = (node: ManagedTimelineNode) => {
  if (node.nodeKind === 'event') {
    if (node.eventType === 'drink_debt') return '欠酒'
    if (node.eventType === 'drink_add') return '加酒'
    return '互动'
  }
  if (node.mediaType === 'video') return '视频'
  return '拍照'
}

const buildBriefTimelineTitle = (node: ManagedTimelineNode) => {
  if (node.nodeKind === 'event') {
    if (node.eventType === 'drink_debt') return Number(node.scoreDelta) < 0 ? '消酒变动' : '欠酒变动'
    if (node.eventType === 'drink_add') return Number(node.scoreDelta) < 0 ? '减少加酒' : '加酒变动'
    return String(node.caption || '').trim() || '互动记录'
  }
  return String(node.timelineTitle || node.caption || '').trim() || buildNominationTitle(node)
}

const buildBriefTimelineDetail = (node: ManagedTimelineNode) => {
  if (node.nodeKind === 'event') {
    return buildBriefEventDetail(node)
  }
  if (node.mediaType === 'video') {
    const duration = Math.max(0, Number(node.duration) || 0)
    return `${String(node.uploaderName || '').trim() || '成员'} 录制了${duration ? ` ${duration} 秒` : ''}视频`
  }
  return String(node.caption || '').trim() || `${String(node.uploaderName || '').trim() || '成员'} 上传了照片`
}

const formatDurationText = (seconds?: number) => {
  const duration = Math.max(0, Math.round(Number(seconds) || 0))
  return duration ? `${duration}s` : ''
}

const buildBriefTimelineItems = (nodes: ManagedTimelineNode[]): BriefTimelineItem[] =>
  nodes.filter(isBriefTimelineDisplayNode).map((node) => ({
    actionLabel: getBriefTimelineActionLabel(node),
    coverImageUrl: node.nodeKind === 'moment' ? getMomentDisplayCoverUrl(node) : '',
    detail: buildBriefTimelineDetail(node),
    durationText: node.nodeKind === 'moment' ? formatDurationText(node.duration) : '',
    id: node.id,
    imageUrl: node.nodeKind === 'moment' ? getMomentDisplayCoverUrl(node) : '',
    isVideo: node.nodeKind === 'moment' && node.mediaType === 'video',
    mediaType: node.nodeKind === 'moment' ? node.mediaType : '',
    nodeKind: node.nodeKind,
    timeText: formatBriefTime(node.createdAt || node.updatedAt) || '时间未记录',
    title: buildBriefTimelineTitle(node),
    videoUrl: node.nodeKind === 'moment' ? String(node.videoUrl || '').trim() : '',
  }))

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
  if (!text || /\u9152\u5c40|\u65f6\u95f4\u7ebf\u7b80\u62a5|\u9152\u684c|\u5224\u5b98/.test(text)) {
    return '聚会简报'
  }
  return text.replace(/时间线/g, '照片').replace(/\u9152\u5c40/g, '聚会')
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
    subtitle: '',
    timelineEmptyText: '这场聚会还没有可展示的照片记录',
    timelineDisplayItems: [],
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
        timelineDisplayItems: [],
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
    const sessionId = brief.sessionId || this.data.sessionId
    if (!sessionId) {
      return brief
    }

    const shouldHydrateTimeline =
      !brief.timeline.nodes.length ||
      !hasFullBriefTimelineNodes(brief.timeline.nodes) ||
      countVideoNodes(brief.timeline.nodes) === 0

    try {
      const refreshedBrief = await createOrRefreshManagedSessionBrief(sessionId)
      if (
        refreshedBrief.timeline.nodes.length > brief.timeline.nodes.length ||
        countVideoNodes(refreshedBrief.timeline.nodes) > countVideoNodes(brief.timeline.nodes) ||
        countLedgerEventNodes(refreshedBrief.timeline.nodes) > countLedgerEventNodes(brief.timeline.nodes)
      ) {
        return refreshedBrief
      }
    } catch {
      // Continue to direct timeline fallback below.
    }

    if (!shouldHydrateTimeline) {
      return brief
    }

    try {
      const timeline = await getManagedSessionTimeline(sessionId)
      if (
        timeline.nodes.length > brief.timeline.nodes.length ||
        countVideoNodes(timeline.nodes) > countVideoNodes(brief.timeline.nodes) ||
        countLedgerEventNodes(timeline.nodes) > countLedgerEventNodes(brief.timeline.nodes)
      ) {
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
      sessionName: brief.sessionName || brief.title,
      sessionSubtitle: brief.subtitle,
    })

    const nominationItems = buildNominationItems(brief.timeline.nodes)
    const timelineDisplayItems = buildBriefTimelineItems(brief.timeline.nodes)
    this.setData({
      briefId: brief.id,
      briefTitle: normalizeBriefTitle(brief.sessionName || brief.title),
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
      subtitle: brief.subtitle,
      timelineEmptyText: '这场聚会还没有可展示的照片记录',
      timelineDisplayItems,
      timelineNodes: brief.timeline.nodes,
    })
  },

  async handleRefreshTap() {
    await this.loadBrief()
  },

  handleSharePosterTap() {
    const { briefId, sessionId } = this.data
    const query = [
      sessionId ? `sessionId=${encodeURIComponent(sessionId)}` : '',
      briefId ? `briefId=${encodeURIComponent(briefId)}` : '',
      'from=session-brief',
    ].filter(Boolean).join('&')
    if (!query) {
      this.showToast('未找到可生成分享图的聚会')
      return
    }
    wx.navigateTo({
      url: `/pages/share-poster/index?${query}`,
      fail: () => {
        wx.redirectTo({ url: `/pages/share-poster/index?${query}` })
      },
    })
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
    const detail = (event as WechatMiniprogram.CustomEvent<{ id?: string }>).detail || {}
    const dataset = (event as WechatMiniprogram.BaseEvent).currentTarget?.dataset as { id?: string } | undefined
    const nodeId = detail.id || dataset?.id || ''
    const selectedNode = this.data.timelineNodes.find((item) => item.id === nodeId)
    if (selectedNode?.nodeKind === 'moment' && selectedNode.mediaType === 'video') {
      const videoUrl = String(selectedNode.videoUrl || '').trim()
      if (!videoUrl) {
        this.showToast('视频暂时无法播放')
        return
      }
      const previewMedia = (wx as unknown as {
        previewMedia?: (options: {
          current?: number
          sources: Array<{ poster?: string; type: 'video'; url: string }>
          fail?: () => void
        }) => void
      }).previewMedia
      if (previewMedia) {
        previewMedia({
          current: 0,
          sources: [{
            poster: getMomentDisplayCoverUrl(selectedNode),
            type: 'video',
            url: videoUrl,
          }],
          fail: () => this.showToast('视频暂时无法播放'),
        })
        return
      }
      this.showToast('当前微信版本暂不支持视频预览')
      return
    }

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
