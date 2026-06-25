import {
  getManagedMomentNominationEligibility,
  getManagedShareImageSummaries,
  getManagedSessionBrief,
  getManagedSessionMomentSummaries,
  type ManagedRankingCategory,
  type ManagedShareImageSummary,
  type ManagedSessionBrief,
  type ManagedSessionMomentSummary,
  type ManagedTimelineNode,
} from '../../services/operations'
import { getApiBase } from '../../config/api'
import { hasFirstPhotoEvidence, isEndedFirstPhotoState } from '../../utils/first-photo-state'
import { resolveNominationDisabledLabel, resolveNominationReasonText } from '../../utils/nomination-reason'
import { getUserAuthHeaders } from '../../utils/social'

type AlbumNominationState = 'active' | 'done' | 'empty' | 'unavailable'

interface AlbumItem {
  briefId: string
  coverUrl: string
  coverBroken?: boolean
  meta: string
  nominationDisabled: boolean
  nominationLabel: string
  nominationReason: string
  nominationState: AlbumNominationState
  sessionId: string
  shareImageUrl: string
  shareImageTaskId: string
  stateType: 'ended' | 'ongoing' | 'pendingFirstPhoto'
  statusText: string
  title: string
}

interface AlbumPageState {
  activeRecordFilter: string
  emptyText: string
  endedItems: AlbumItem[]
  headerActionStyle: string
  items: AlbumItem[]
  ongoingCount: number
  ongoingItems: AlbumItem[]
  endedCount: number
  isShareMode: boolean
  loading: boolean
  mode: string
  pageTitle: string
  savingShareImageId: string
  totalCount: number
}

interface AlbumPageMethods {
  handleBackTap: () => void
  handleBottomTabTap: (event: WechatMiniprogram.BaseEvent) => void
  handleCreateTap: () => void
  handleCoverError: (event: WechatMiniprogram.BaseEvent) => void
  handleCoverLoad: (event: WechatMiniprogram.BaseEvent) => void
  handleFilterTap: (event: WechatMiniprogram.BaseEvent) => void
  handleItemTap: (event: WechatMiniprogram.BaseEvent) => void
  handleNominateTap: (event: WechatMiniprogram.BaseEvent) => void
  handleRefreshTap: () => Promise<void>
  handleSaveShareImageTap: (event: WechatMiniprogram.BaseEvent) => Promise<void>
  loadAlbums: () => Promise<void>
  downloadShareImageToFile: (imageUrl: string) => Promise<string>
  openPage: (url: string) => void
  saveImageFile: (filePath: string) => Promise<void>
  updateHeaderActionStyle: () => void
}

const internalAlbumTitlePattern = /^(IT|PR|QA|DEV|TEST)[-_ ][A-Z0-9_-]+(?:\s+(opening|highlight|drinking|private|closing))?$/i
const internalSeedPattern = /(IT-MOMENTS|PR-BE-DB-LOGIN-SEED|PR[-_ ]Seed|QA[-_ ]Seed|DEV[-_ ]Seed|TEST[-_ ]Seed)/i
const legacyCoverPattern = /(jiuzhuopanguan|wine|judge|panguan|share[-_]?poster|share[-_]?preview|status-bg|title-image|result-report|judge-wheel)/i

const modeTitleMap: Record<string, string> = {
  album: '聚会记录',
  ended: '已结束',
  host: '我的聚会',
  joined: '参与聚会',
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

const normalizeRecordFilter = (value?: string, mode = '') => {
  const text = String(value || '').trim()
  if (text === 'ongoing' || text === 'ended' || text === 'all') return text
  if (mode === 'ended') return 'ended'
  if (mode === 'unshared') return 'ongoing'
  return 'all'
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

const shouldQuarantineRecordCover = (value?: string) => legacyCoverPattern.test(String(value || ''))

const isMomentNodeWithImage = (node: ManagedTimelineNode): node is Extract<ManagedTimelineNode, { nodeKind: 'moment' }> =>
  node.nodeKind === 'moment' && !node.isTimelinePlaceholder && !!node.imageUrl

const getDefaultRankingCategoryFromNode = (node: Extract<ManagedTimelineNode, { nodeKind: 'moment' }>): ManagedRankingCategory => {
  if (node.nodeType === 'opening') return 'best_opening'
  if (node.nodeType === 'closing') return 'best_closing'
  if (node.nodeType === 'drinking') return 'today_debt'
  return 'today_highlight'
}

const getMomentNodeTime = (node: Extract<ManagedTimelineNode, { nodeKind: 'moment' }>) => {
  const timestamp = Date.parse(node.createdAt || node.updatedAt || '')
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Number.MAX_SAFE_INTEGER
}

const isPersistedMomentId = (value?: string) =>
  /^moment-\d{10,}-[a-f0-9]{8}$/i.test(String(value || '').trim())

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
  if (!isEndedSessionSummary(item) && !hasFirstPhotoSummary(item)) return '待首拍'
  if (hasEndedGeneratedShareImage(item)) return '分享图已生成'
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
  if (hasEndedGeneratedShareImage(item)) parts.push('可查看分享图')
  return parts.join(' · ') || '聚会记录'
}

const isEndedSessionSummary = (item: ManagedSessionMomentSummary) => isEndedFirstPhotoState(item)

const hasGeneratedShareImage = (item: ManagedSessionMomentSummary) => Boolean(item.readyShareImageUrl || item.shareImageUrl)

const hasEndedGeneratedShareImage = (item: ManagedSessionMomentSummary) => isEndedSessionSummary(item) && hasGeneratedShareImage(item)

const hasFirstPhotoSummary = (item: ManagedSessionMomentSummary) => hasFirstPhotoEvidence(item)

const isOngoingSessionSummary = (item: ManagedSessionMomentSummary) => !isEndedSessionSummary(item) && hasFirstPhotoSummary(item)

const isVisibleAlbumSummary = (item: ManagedSessionMomentSummary) => isEndedSessionSummary(item) || hasFirstPhotoSummary(item)

const isPendingShareMemory = (item: ManagedSessionMomentSummary) => !isEndedSessionSummary(item) && hasFirstPhotoSummary(item) && !hasGeneratedShareImage(item)

const buildAlbumNominationState = async (brief?: ManagedSessionBrief): Promise<{
  nominationDisabled: boolean
  nominationLabel: string
  nominationReason: string
  nominationState: AlbumNominationState
}> => {
  const photoNodes = (brief?.timeline?.nodes || []).filter(isMomentNodeWithImage)
  if (!photoNodes.length) {
    return {
      nominationDisabled: true,
      nominationLabel: '无照片',
      nominationReason: '这场聚会还没有可推举照片',
      nominationState: 'empty',
    }
  }

  const rankableNodes = photoNodes.filter((node) => isPersistedMomentId(node.id))
  if (!rankableNodes.length) {
    return {
      nominationDisabled: true,
      nominationLabel: '不可推举',
      nominationReason: '暂未满足回忆榜资格',
      nominationState: 'unavailable',
    }
  }

  let hasAvailableNode = false
  let unavailableReason = ''
  for (const node of rankableNodes) {
    try {
      const eligibility = await getManagedMomentNominationEligibility(node.id, getDefaultRankingCategoryFromNode(node))
      if (eligibility.alreadyNominatedToday) {
        return {
          nominationDisabled: true,
          nominationLabel: '已推举',
          nominationReason: '今天已推举过这场聚会的照片',
          nominationState: 'done',
        }
      }
      if (eligibility.eligible) {
        hasAvailableNode = true
      } else if (!unavailableReason) {
        unavailableReason = resolveNominationReasonText(eligibility)
      }
    } catch {
      // Keep checking other photos; one failed eligibility call should not break the album list.
    }
  }

  return hasAvailableNode
    ? {
        nominationDisabled: false,
        nominationLabel: '推举回忆',
        nominationReason: '',
        nominationState: 'active',
      }
    : {
        nominationDisabled: true,
        nominationLabel: resolveNominationDisabledLabel({ reason: unavailableReason }),
        nominationReason: unavailableReason || '暂未满足回忆榜资格',
        nominationState: 'unavailable',
      }
}

const filterSummariesByMode = (items: ManagedSessionMomentSummary[], mode: string) => {
  switch (mode) {
    case 'ended':
      return items.filter(isEndedSessionSummary)
    case 'shares':
      return items.filter(hasEndedGeneratedShareImage)
    case 'unshared':
      return items.filter(isPendingShareMemory)
    case 'album':
    case 'records':
    case 'host':
    case 'joined':
      return items.filter(isVisibleAlbumSummary)
    default:
      return items.filter(isVisibleAlbumSummary)
  }
}

const filterSummariesByRecordFilter = (items: ManagedSessionMomentSummary[], filter: string) => {
  switch (filter) {
    case 'ended':
      return items.filter(isEndedSessionSummary)
    case 'ongoing':
      return items.filter(isOngoingSessionSummary)
    case 'all':
    default:
      return items.filter(isVisibleAlbumSummary)
  }
}

const mapAlbumItem = async (item: ManagedSessionMomentSummary, index: number): Promise<AlbumItem> => {
  let brief: ManagedSessionBrief | undefined
  let firstPhotoUrl = ''
  let timeText = formatAlbumTime(item.createdAt)
  if (item.briefId) {
    try {
      brief = await getManagedSessionBrief(item.briefId)
      firstPhotoUrl = findFirstBriefPhoto(brief) || firstPhotoUrl
      timeText = timeText || formatAlbumTime(brief.createdAt || brief.updatedAt)
    } catch {
      firstPhotoUrl = ''
    }
  }
  const shareImageUrl = isEndedSessionSummary(item) ? item.readyShareImageUrl || item.shareImageUrl || '' : ''
  firstPhotoUrl = firstPhotoUrl || item.coverPhotoUrl || ''
  const coverUrl = shouldQuarantineRecordCover(firstPhotoUrl) ? '' : firstPhotoUrl
  const stateType = isEndedSessionSummary(item) ? 'ended' : hasFirstPhotoSummary(item) ? 'ongoing' : 'pendingFirstPhoto'
  const nomination = stateType === 'ended'
    ? await buildAlbumNominationState(brief)
    : {
        nominationDisabled: true,
        nominationLabel: '推举回忆',
        nominationReason: '聚会结束后可推举公开照片',
        nominationState: 'unavailable' as AlbumNominationState,
      }
  return {
    briefId: item.briefId || '',
    coverUrl,
    meta: buildMeta(item, timeText),
    ...nomination,
    sessionId: item.sessionId || '',
    shareImageUrl,
    shareImageTaskId: item.shareImageTaskId || '',
    stateType,
    statusText: buildStatusText(item),
    title: normalizeTitle(item.title, item.sessionName, index),
  }
}

const mapShareImageSummaryItem = (item: ManagedShareImageSummary, index: number): AlbumItem => ({
  briefId: item.briefId || '',
  coverUrl: item.readyShareImageUrl || item.imageUrl || '',
  meta: formatAlbumTime(item.finishedAt || item.updatedAt || item.createdAt) || '分享图已生成',
  nominationDisabled: true,
  nominationLabel: '已生成',
  nominationState: 'done',
  sessionId: item.sessionId || '',
  shareImageUrl: item.readyShareImageUrl || item.imageUrl || '',
  shareImageTaskId: item.id || '',
  stateType: 'ended',
  statusText: '分享图已生成',
  title: normalizeTitle(item.sessionName, item.sessionName, index),
  nominationReason: '',
})

const buildHeaderActionStyle = () => {
  try {
    const rect = wx.getMenuButtonBoundingClientRect()
    const system = wx.getSystemInfoSync()
    const windowWidth = Number(system.windowWidth || 375)
    const menuTop = Number(rect.top || Number(system.statusBarHeight || 0) + 4)
    const menuHeight = Number(rect.height || 32)
    const menuLeft = Number(rect.left || windowWidth - 96)
    const capsuleReserveWidth = Math.max(88, windowWidth - menuLeft)
    const size = Math.max(32, Math.min(40, menuHeight))
    const top = menuTop + Math.max(0, (menuHeight - size) / 2)
    const right = capsuleReserveWidth + 12
    return `position: fixed; top: ${top}px; right: ${right}px; width: ${size}px; height: ${size}px;`
  } catch {
    return ''
  }
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })

Page<AlbumPageState, AlbumPageMethods>({
  data: {
    activeRecordFilter: 'all',
    emptyText: modeEmptyMap.album,
    endedCount: 0,
    endedItems: [],
    headerActionStyle: '',
    items: [],
    isShareMode: false,
    loading: true,
    mode: 'album',
    ongoingCount: 0,
    ongoingItems: [],
    pageTitle: modeTitleMap.album,
    savingShareImageId: '',
    totalCount: 0,
  },

  onLoad(query) {
    this.updateHeaderActionStyle()
    const mode = normalizeMode(typeof query?.mode === 'string' ? query.mode : '')
    const activeRecordFilter = normalizeRecordFilter(typeof query?.filter === 'string' ? query.filter : '', mode)
    this.setData({
      activeRecordFilter,
      emptyText: modeEmptyMap[mode],
      isShareMode: mode === 'shares',
      mode,
      pageTitle: modeTitleMap[mode],
    })
    void this.loadAlbums()
  },

  onShow() {
    this.updateHeaderActionStyle()
    if (!this.data.loading) {
      void this.loadAlbums()
    }
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

  handleBottomTabTap(event) {
    const { tab } = event.currentTarget.dataset as { tab?: string }
    const routeMap: Record<string, string> = {
      home: '/pages/index/index',
      me: '/pages/me/index',
      rankings: '/pages/rankings/index',
      tools: '/pages/tools/index',
    }
    const url = routeMap[String(tab || '')]
    if (!url) return
    wx.redirectTo({
      url,
      fail: () => wx.reLaunch({ url }),
    })
  },

  async handleRefreshTap() {
    await this.loadAlbums()
  },

  async loadAlbums() {
    this.setData({ loading: true })
    try {
      if (this.data.mode === 'shares') {
        let items: AlbumItem[] = []
        try {
          const shareImages = await getManagedShareImageSummaries()
          items = shareImages.map(mapShareImageSummaryItem)
        } catch (error) {
          console.warn('[album] failed to load share image summaries, fallback to session summaries', error)
          const summaries = await getManagedSessionMomentSummaries()
          items = await Promise.all(filterSummariesByMode(summaries, 'shares').map(mapAlbumItem))
        }
        this.setData({
          endedCount: items.length,
          endedItems: items,
          items,
          ongoingItems: [],
          ongoingCount: 0,
          totalCount: items.length,
          loading: false,
        })
        return
      }
      const summaries = await getManagedSessionMomentSummaries()
      const baseSummaries = filterSummariesByMode(summaries, this.data.mode)
      const filteredSummaries = this.data.mode === 'records' || this.data.mode === 'album'
        ? filterSummariesByRecordFilter(baseSummaries, this.data.activeRecordFilter)
        : baseSummaries
      const items = await Promise.all(filteredSummaries.map(mapAlbumItem))
      const allRecordItems = await Promise.all(filterSummariesByMode(summaries, 'records').map(mapAlbumItem))
      const groupedItems = this.data.mode === 'records' || this.data.mode === 'album' ? allRecordItems : items
      this.setData({
        endedCount: summaries.filter(isEndedSessionSummary).length,
        endedItems: groupedItems.filter((item) => item.stateType === 'ended'),
        items,
        ongoingItems: groupedItems.filter((item) => item.stateType === 'ongoing'),
        ongoingCount: summaries.filter(isOngoingSessionSummary).length,
        totalCount: items.length,
        loading: false,
      })
    } catch (error) {
      this.setData({ items: [], loading: false })
      wx.showToast({ title: error instanceof Error ? error.message : '相册加载失败', icon: 'none' })
    }
  },

  handleFilterTap(event) {
    const { filter } = event.currentTarget.dataset as { filter?: string }
    if (!filter || filter === this.data.activeRecordFilter) return
    this.setData({ activeRecordFilter: filter })
    void this.loadAlbums()
  },

  handleItemTap(event) {
    const { briefId, sessionId, shareImageUrl, stateType } = event.currentTarget.dataset as {
      briefId?: string
      sessionId?: string
      shareImageUrl?: string
      stateType?: 'ended' | 'ongoing' | 'pendingFirstPhoto'
    }
    if (this.data.mode === 'shares') {
      if (shareImageUrl) {
        wx.previewImage({ current: shareImageUrl, urls: [shareImageUrl] })
        return
      }
      wx.showToast({ title: '分享图还未生成', icon: 'none' })
      return
    }
    if (stateType === 'ended') {
      const query = briefId
        ? `briefId=${encodeURIComponent(briefId)}`
        : sessionId
          ? `sessionId=${encodeURIComponent(sessionId)}`
          : ''
      if (query) {
        this.openPage(`/pages/session-brief/index?${query}`)
        return
      }
      wx.showToast({ title: '缺少已结束聚会信息', icon: 'none' })
      return
    }
    if (stateType === 'pendingFirstPhoto') {
      wx.showToast({ title: '先拍第一张照片后再进入相册', icon: 'none' })
      return
    }
    if (sessionId) {
      this.openPage(`/pages/live-record/index?sessionId=${encodeURIComponent(sessionId)}`)
      return
    }
    wx.showToast({ title: '缺少回忆信息', icon: 'none' })
  },

  async handleSaveShareImageTap(event) {
    const { id, imageUrl } = event.currentTarget.dataset as {
      id?: string
      imageUrl?: string
    }
    const shareImageUrl = String(imageUrl || '').trim()
    const shareImageId = String(id || shareImageUrl || '').trim()
    if (!shareImageUrl) {
      wx.showToast({ title: '分享图还未生成', icon: 'none' })
      return
    }
    if (this.data.savingShareImageId) {
      return
    }

    this.setData({ savingShareImageId: shareImageId })
    wx.showLoading({ title: '正在保存', mask: false })
    try {
      const filePath = await withTimeout(this.downloadShareImageToFile(shareImageUrl), 15000, '下载超时，请稍后重试')
      await withTimeout(this.saveImageFile(filePath), 12000, '保存超时，请检查相册权限')
      wx.showToast({ title: '已保存到手机相册', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : '保存失败，请稍后重试', icon: 'none' })
    } finally {
      wx.hideLoading()
      this.setData({ savingShareImageId: '' })
    }
  },

  downloadShareImageToFile(imageUrl) {
    const source = String(imageUrl || '').trim()
    const url = source.startsWith('http') ? source : `${getApiBase()}${source.startsWith('/') ? source : `/${source}`}`
    return new Promise<string>((resolve, reject) => {
      wx.downloadFile({
        url,
        header: getUserAuthHeaders(),
        success: (result) => {
          if (result.statusCode >= 200 && result.statusCode < 300 && result.tempFilePath) {
            resolve(result.tempFilePath)
            return
          }
          reject(new Error(`下载失败 ${result.statusCode}`))
        },
        fail: reject,
      })
    })
  },

  saveImageFile(filePath) {
    return new Promise<void>((resolve, reject) => {
      const save = () => {
        wx.saveImageToPhotosAlbum({
          filePath,
          success: () => resolve(),
          fail: reject,
        })
      }
      const openAlbumSetting = (sourceError: WechatMiniprogram.GeneralCallbackResult) => {
        wx.openSetting({
          success: (setting) => {
            const authSetting = (setting.authSetting || {}) as Record<string, boolean>
            if (authSetting['scope.writePhotosAlbum']) {
              save()
              return
            }
            reject(sourceError)
          },
          fail: () => reject(sourceError),
        })
      }
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success: save,
        fail: openAlbumSetting,
      })
    })
  },

  handleNominateTap(event) {
    const { briefId, nominationReason, nominationState, sessionId } = event.currentTarget.dataset as {
      briefId?: string
      nominationReason?: string
      nominationState?: AlbumNominationState
      sessionId?: string
    }

    if (nominationState === 'active') {
      const query = [
        briefId ? `briefId=${encodeURIComponent(briefId)}` : '',
        sessionId ? `sessionId=${encodeURIComponent(sessionId)}` : '',
        'action=nominate',
      ].filter(Boolean).join('&')
      if (query) {
        this.openPage(`/pages/session-brief/index?${query}`)
        return
      }
      wx.showToast({ title: '缺少可推举聚会信息', icon: 'none' })
      return
    }

    const titleMap: Record<AlbumNominationState, string> = {
      active: '请选择要推举的照片',
      done: '今天已推举过这场聚会',
      empty: '这场聚会还没有可推举照片',
      unavailable: nominationReason || '暂未满足回忆榜资格',
    }
    wx.showToast({ title: titleMap[nominationState || 'unavailable'], icon: 'none' })
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

  updateHeaderActionStyle() {
    this.setData({ headerActionStyle: buildHeaderActionStyle() })
  },
})

export {}
