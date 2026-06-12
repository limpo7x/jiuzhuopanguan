import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath, normalizeManagedAvatarPath } from '../config/assets'
import { resolveCachedManagedImagePath, resolveCachedManagedImagePathQuick } from '../utils/imageCache'
import { getUserAuthHeaders } from '../utils/social'
import {
  resolveToolId,
  type ToolCategory,
  type ToolCategoryCard,
  type ToolDescriptor,
} from '../utils/toolkit'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface RemoteToolHero {
  imageUrl?: string
  subtitle?: string
  title?: string
}

interface RemoteToolItem {
  categoryId?: string
  categoryName?: string
  favoriteRate?: string
  heroImage?: string
  iconClass?: string
  id?: string
  imageUrl?: string
  isHot?: string
  meta?: string
  name?: string
  placement?: string
  rawId?: string
  sortOrder?: number
  status?: string
  target?: string
  toneClass?: string
  usageCount?: number
}

interface RemoteToolsResponse {
  categories?: ToolCategory[]
  hero?: RemoteToolHero
  popularTools?: RemoteToolItem[]
  tools?: RemoteToolItem[]
}

interface RemoteSessionPlayer {
  avatarUrl?: string
  clearedCount?: number
  debtCount?: number
  drinkCount?: number
  meta?: string
  name?: string
  profileId?: string
  status?: string
  wheelHistory?: Array<{
    createdAt?: string
    label?: string
    text?: string
    type?: string
  }>
}

interface RemoteLiveSession {
  hostName?: string
  hostProfileId?: string
  id?: string
  inviteCode?: string
  joinedCount?: number
  joinedPlayers?: RemoteSessionPlayer[]
  joinStatusPlayers?: RemoteSessionPlayer[]
  playerCount?: number
  sessionName?: string
  source?: string
  stateText?: string
  status?: string
  subtitle?: string
  templateImageUrl?: string
  templateName?: string
  title?: string
}

interface RemoteManagedReport {
  createdAt?: string
  events?: Array<{ text?: string }>
  hostName?: string
  hostProfileId?: string
  id?: string
  imageUrl?: string
  inviteCode?: string
  meta?: string
  playerCount?: number
  recordType?: 'report' | 'session'
  reportId?: string
  ranks?: Array<{
    avatarUrl?: string
    name?: string
    title?: string
    value?: string
  }>
  replayRate?: string
  scene?: string
  sessionId?: string
  sessionName?: string
  shareRate?: string
  status?: string
  role?: 'host' | 'member'
  templateImageUrl?: string
  templateName?: string
  title?: string
}

interface RemoteShareConfig {
  notice?: string
  performance?: {
    bestOpenRate?: string
    bestReturnRate?: string
  }
  poster?: {
    imageUrl?: string
    title?: string
  }
  preview?: {
    imageUrl?: string
    inviteCode?: string
    title?: string
  }
  shareItems?: Array<{
    iconClass?: string
    id?: string
    name?: string
    scene?: string
  }>
}

interface RemoteQuestionCatalog {
  questions?: Array<{
    difficulty?: string
    id?: string
    riskLevel?: string
    tag?: string
    template?: string
    text?: string
    type?: string
  }>
}

interface RemoteMerchantCatalog {
  categories?: Array<{
    iconClass?: string
    name?: string
    toneClass?: string
  }>
  notice?: string
  safeBack?: Array<{
    iconClass?: string
    name?: string
    toneClass?: string
  }>
  shops?: Array<{
    id?: string
    imageUrl?: string
    meta?: string
    name?: string
    status?: string
  }>
}

interface RemoteUsageRecord {
  meta?: string
  name?: string
  route?: string
  tag?: string
}

interface RemoteJudgeStats {
  hostedCount?: number
  joinedCount?: number
  reportShareCount?: number
  unsharedReportCount?: number
}

export interface ManagedToolCatalog {
  categories: ToolCategory[]
  categoryCards: ToolCategoryCard[]
  hero: Required<RemoteToolHero>
  popularTools: ToolDescriptor[]
  tools: ToolDescriptor[]
}

export interface ManagedSessionPlayer {
  avatarUrl: string
  clearedCount?: number
  debtCount?: number
  drinkCount?: number
  meta?: string
  name: string
  profileId?: string
  status: string
  wheelHistory?: ManagedWheelHistoryItem[]
}

export interface ManagedWheelHistoryItem {
  createdAt: string
  label: string
  text: string
  type: string
}

export interface ManagedLiveSession {
  hostName: string
  hostProfileId: string
  id: string
  inviteCode: string
  joinedCount: number
  joinedPlayers: ManagedSessionPlayer[]
  joinStatusPlayers: ManagedSessionPlayer[]
  playerCount: number
  sessionName: string
  source: string
  stateText: string
  status: string
  subtitle: string
  templateImageUrl: string
  templateName: string
  title: string
}

export interface ManagedSessionMutationPayload {
  hostAvatarUrl?: string
  hostName?: string
  hostProfileId?: string
  inviteCode?: string
  playerCount?: number
  selectedPlayers?: ManagedSessionPlayer[]
  sessionName?: string
  source?: string
  state?: string
  status?: string
  templateImageUrl?: string
  templateName?: string
}

export interface ManagedReportRank {
  avatarUrl: string
  name: string
  title: string
  value: string
}

export interface ManagedReportEvent {
  text: string
}

export interface ManagedReportDetail {
  createdAt: string
  events: ManagedReportEvent[]
  id: string
  imageUrl: string
  inviteCode: string
  playerCount: number
  ranks: ManagedReportRank[]
  replayRate: string
  scene: string
  sessionId: string
  sessionName: string
  shareRate: string
  status: string
  templateName: string
  title: string
}

export interface ManagedReportSummary {
  createdAt: string
  hostName: string
  hostProfileId: string
  id: string
  imageUrl: string
  meta: string
  recordType: 'report' | 'session'
  reportId: string
  role: 'host' | 'member'
  sessionId: string
  sessionName: string
  shareRate: string
  status: string
  templateName: string
  title: string
}

export interface ManagedShareConfig {
  notice: string
  performance: {
    bestOpenRate: string
    bestReturnRate: string
  }
  poster: {
    imageUrl: string
    title: string
  }
  preview: {
    imageUrl: string
    inviteCode: string
    title: string
  }
  shareItems: Array<{
    iconClass: string
    id: string
    name: string
    scene: string
  }>
}

export interface ManagedQuestionItem {
  difficulty: string
  id: string
  riskLevel: string
  tag: string
  template: string
  text: string
  type: string
}

export interface ManagedMerchantTile {
  iconClass: string
  name: string
  toneClass: string
}

export interface ManagedMerchantShop {
  id: string
  imageUrl: string
  meta: string
  name: string
  status: string
}

export interface ManagedMerchantCatalog {
  categories: ManagedMerchantTile[]
  notice: string
  safeBack: ManagedMerchantTile[]
  shops: ManagedMerchantShop[]
}

export interface ManagedUsageRecord {
  meta: string
  name: string
  route: string
  tag: string
}

export interface ManagedJudgeStats {
  hostedCount: number
  joinedCount: number
  reportShareCount: number
  unsharedReportCount: number
}

const TOOLS_CATALOG_CACHE_TTL = 10000
const REPORT_HISTORY_CACHE_TTL = 45000
const SHARE_CONFIG_CACHE_TTL = 60000
const MERCHANT_CATALOG_CACHE_TTL = 60000

let toolsCatalogCache: { expiresAt: number; value: ManagedToolCatalog } | null = null
let reportHistoryCache: { expiresAt: number; key: string; value: ManagedReportSummary[] } | null = null
let shareConfigCache: { expiresAt: number; value: ManagedShareConfig } | null = null
let merchantCatalogCache: { expiresAt: number; value: ManagedMerchantCatalog } | null = null

const invalidateManagedReportHistoryCache = () => {
  reportHistoryCache = null
}

const DEFAULT_TOOLS_CATALOG: ManagedToolCatalog = {
  categories: [],
  categoryCards: [],
  hero: {
    imageUrl: '',
    subtitle: '',
    title: '',
  },
  popularTools: [],
  tools: [],
}

const requestJson = <T>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: Record<string, unknown>): Promise<T> =>
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}${path}`,
      header: getUserAuthHeaders(),
      method,
      data,
      timeout: 5000,
      success: (response) => {
        const payload = response.data as ApiResponse<T>
        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
          resolve(payload.data)
          return
        }
        reject(new Error(payload?.message || 'request failed'))
      },
      fail: reject,
    })
  })

const normalizeSessionPlayer = (player?: RemoteSessionPlayer): ManagedSessionPlayer => ({
  avatarUrl: normalizeManagedAvatarPath(player?.avatarUrl),
  clearedCount: Math.max(0, Number(player?.clearedCount) || 0),
  debtCount: Math.max(0, Number(player?.debtCount) || 0),
  drinkCount: Math.max(0, Number(player?.drinkCount) || 0),
  meta: player?.meta || '',
  name: player?.name || '',
  profileId: player?.profileId || '',
  status: player?.status || '',
  wheelHistory: Array.isArray(player?.wheelHistory)
    ? player.wheelHistory
        .map((item) => ({
          createdAt: item?.createdAt || '',
          label: item?.label || '',
          text: item?.text || '',
          type: item?.type || '',
        }))
        .filter((item) => item.text)
    : [],
})

const mergeToolDescriptor = async (remoteTool: RemoteToolItem): Promise<ToolDescriptor> => {
  const toolId = resolveToolId(remoteTool.id || remoteTool.rawId || '')
  const imageUrlSource = normalizeManagedAssetPath(remoteTool.imageUrl)
  const heroImageSource = normalizeManagedAssetPath(remoteTool.heroImage)
  const resolvedImage = imageUrlSource ? resolveCachedManagedImagePathQuick(imageUrlSource, 1200) : Promise.resolve('')
  const resolvedHero = heroImageSource ? resolveCachedManagedImagePathQuick(heroImageSource, 1200) : Promise.resolve('')
  const [imageUrl, heroImage] = await Promise.all([resolvedImage, resolvedHero])

  return {
    id: toolId,
    name: remoteTool.name || '',
    categoryId: remoteTool.categoryId || '',
    iconClass: remoteTool.iconClass || '',
    toneClass: remoteTool.toneClass || '',
    imageUrl: imageUrl || imageUrlSource,
    heroImage: heroImage || heroImageSource,
    meta: remoteTool.meta || '',
    placement: remoteTool.placement || '',
    subtitle: remoteTool.target || '',
    summary: remoteTool.meta || '',
    tips: [],
    steps: [],
    mode: (toolId === 'loan-calc' ? 'loan' : toolId) as ToolDescriptor['mode'],
  }
}

const buildCategoryCards = (tools: ToolDescriptor[], categories: ToolCategory[]): ToolCategoryCard[] =>
  categories
    .filter((item) => item.id !== 'all')
    .map((category) => {
      const hits = tools.filter((tool) => tool.categoryId === category.id)
      return {
        id: category.id,
        name: category.name,
        meta: hits.length ? `${hits.length} 个工具 · ${hits.map((item) => item.name).filter(Boolean).slice(0, 3).join(' / ')}` : '',
        imageUrl: hits[0]?.imageUrl || '',
      }
    })

export const getManagedToolsCatalog = async (): Promise<ManagedToolCatalog> => {
  if (toolsCatalogCache && toolsCatalogCache.expiresAt > Date.now()) {
    return toolsCatalogCache.value
  }

  try {
    const remote = await requestJson<RemoteToolsResponse>('/tools/catalog')
    const categories =
      remote.categories?.length
        ? remote.categories.map((item) => ({ id: item.id, name: item.name }))
        : []
    const tools = remote.tools?.length ? await Promise.all(remote.tools.map(mergeToolDescriptor)) : []

    const next: ManagedToolCatalog = {
      categories,
      categoryCards: buildCategoryCards(tools, categories),
      hero: {
        imageUrl:
          (await resolveCachedManagedImagePathQuick(normalizeManagedAssetPath(remote.hero?.imageUrl), 2000)) ||
          '',
        subtitle: remote.hero?.subtitle || '',
        title: remote.hero?.title || '',
      },
      popularTools: remote.popularTools?.length ? await Promise.all(remote.popularTools.map(mergeToolDescriptor)) : [],
      tools,
    }

    toolsCatalogCache = {
      expiresAt: Date.now() + TOOLS_CATALOG_CACHE_TTL,
      value: next,
    }

    return next
  } catch {
    return DEFAULT_TOOLS_CATALOG
  }
}

export const getManagedLiveSession = async (sessionId?: string, inviteCode?: string): Promise<ManagedLiveSession> => {
  const query = [
    sessionId ? `sessionId=${encodeURIComponent(sessionId)}` : '',
    inviteCode ? `inviteCode=${encodeURIComponent(inviteCode)}` : '',
  ]
    .filter(Boolean)
    .join('&')
  const remote = await requestJson<RemoteLiveSession>(`/sessions/live${query ? `?${query}` : ''}`)
  const joinedPlayers = remote.joinedPlayers?.length ? remote.joinedPlayers.map(normalizeSessionPlayer) : []
  const joinStatusPlayers = remote.joinStatusPlayers?.length ? remote.joinStatusPlayers.map(normalizeSessionPlayer) : []

  return {
    hostName: remote.hostName || '',
    hostProfileId: remote.hostProfileId || '',
    id: remote.id || '',
    inviteCode: remote.inviteCode || '',
    joinedCount: Number(remote.joinedCount) || 0,
    joinedPlayers,
    joinStatusPlayers,
    playerCount: Number(remote.playerCount) || 0,
    sessionName: remote.sessionName || '',
    source: remote.source || '',
    stateText: remote.stateText || '',
    status: remote.status || '',
    subtitle: remote.subtitle || '',
    templateImageUrl: normalizeManagedAssetPath(remote.templateImageUrl),
    templateName: remote.templateName || '',
    title: remote.title || '',
  }
}

export const joinManagedSession = async (inviteCode: string): Promise<ManagedLiveSession> => {
  const remote = await requestJson<RemoteLiveSession>('/sessions/join', 'POST', { inviteCode })
  return {
    ...(await getManagedLiveSession(remote.id, inviteCode)),
    id: remote.id || '',
    inviteCode: remote.inviteCode || inviteCode,
  }
}

export const createManagedSession = async (payload: ManagedSessionMutationPayload): Promise<ManagedLiveSession> => {
  return getManagedLiveSession(
    (await requestJson<RemoteLiveSession>('/sessions', 'POST', payload as Record<string, unknown>)).id,
  )
}

export const updateManagedSession = async (sessionId: string, payload: ManagedSessionMutationPayload): Promise<void> => {
  if (!sessionId) {
    return
  }

  await requestJson(`/sessions/${encodeURIComponent(sessionId)}`, 'PUT', payload as Record<string, unknown>)
}

export const deleteManagedSession = async (sessionId: string): Promise<void> => {
  if (!sessionId) {
    return
  }

  await requestJson(`/sessions/${encodeURIComponent(sessionId)}`, 'DELETE')
}

const normalizeManagedReport = (report?: RemoteManagedReport): ManagedReportDetail => ({
  createdAt: report?.createdAt || '',
  events: Array.isArray(report?.events) ? report.events.map((item) => ({ text: item?.text || '' })).filter((item) => item.text) : [],
  id: report?.id || '',
  imageUrl: report?.imageUrl || '',
  inviteCode: report?.inviteCode || '',
  playerCount: Number(report?.playerCount) || 0,
  ranks: Array.isArray(report?.ranks)
    ? report.ranks.map((item) => ({
        avatarUrl: normalizeManagedAvatarPath(item?.avatarUrl),
        name: item?.name || '',
        title: item?.title || '',
        value: item?.value || '',
      }))
    : [],
  replayRate: report?.replayRate || '',
  scene: report?.scene || '',
  sessionId: report?.sessionId || '',
  sessionName: report?.sessionName || '',
  shareRate: report?.shareRate || '',
  status: report?.status || '',
  templateName: report?.templateName || '',
  title: report?.title || '',
})

export const createManagedReport = async (payload: Record<string, unknown>): Promise<ManagedReportDetail> => {
  const report = normalizeManagedReport(await requestJson<RemoteManagedReport>('/reports', 'POST', payload))
  invalidateManagedReportHistoryCache()
  return report
}

export const getManagedReport = async (reportId: string): Promise<ManagedReportDetail> =>
  normalizeManagedReport(await requestJson<RemoteManagedReport>(`/reports/${encodeURIComponent(reportId)}`))

export const getManagedReportHistory = async (mode = 'all'): Promise<ManagedReportSummary[]> => {
  const normalizedMode = ['host', 'joined', 'unshared', 'all'].includes(mode) ? mode : 'all'
  if (reportHistoryCache && reportHistoryCache.key === normalizedMode && reportHistoryCache.expiresAt > Date.now()) {
    return reportHistoryCache.value
  }

  const reports = await requestJson<RemoteManagedReport[]>(`/reports/history?mode=${encodeURIComponent(normalizedMode)}`)
  const next: ManagedReportSummary[] = await Promise.all(
    reports.map(async (item) => ({
      createdAt: item.createdAt || '',
      hostName: item.hostName || '',
      hostProfileId: item.hostProfileId || '',
      id: item.id || '',
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(item.imageUrl))) || '',
      meta: item.meta || '',
      recordType: item.recordType === 'session' ? ('session' as const) : ('report' as const),
      reportId: item.reportId || (item.recordType === 'report' ? item.id || '' : ''),
      role: item.role === 'host' ? 'host' : 'member',
      sessionId: item.sessionId || '',
      sessionName: item.sessionName || '',
      shareRate: item.shareRate || '',
      status: item.status || '',
      templateName: item.templateName || '',
      title: item.title || item.sessionName || '',
    })),
  )

  reportHistoryCache = {
    expiresAt: Date.now() + REPORT_HISTORY_CACHE_TTL,
    key: normalizedMode,
    value: next,
  }

  return next
}

export const getManagedShareConfig = async (): Promise<ManagedShareConfig> => {
  if (shareConfigCache && shareConfigCache.expiresAt > Date.now()) {
    return shareConfigCache.value
  }

  const remote = await requestJson<RemoteShareConfig>('/share/config')
  const next: ManagedShareConfig = {
    notice: remote.notice || '',
    performance: {
      bestOpenRate: remote.performance?.bestOpenRate || '',
      bestReturnRate: remote.performance?.bestReturnRate || '',
    },
    poster: {
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remote.poster?.imageUrl))) || '',
      title: remote.poster?.title || '',
    },
    preview: {
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remote.preview?.imageUrl))) || '',
      inviteCode: remote.preview?.inviteCode || '',
      title: remote.preview?.title || '',
    },
    shareItems: Array.isArray(remote.shareItems)
      ? remote.shareItems.map((item) => ({
          iconClass: item?.iconClass || '',
          id: item?.id || '',
          name: item?.name || '',
          scene: item?.scene || '',
        }))
      : [],
  }

  shareConfigCache = {
    expiresAt: Date.now() + SHARE_CONFIG_CACHE_TTL,
    value: next,
  }

  return next
}

export const getManagedQuestionBank = async (type = ''): Promise<ManagedQuestionItem[]> => {
  const query = type ? `?type=${encodeURIComponent(type)}` : ''
  const remote = await requestJson<RemoteQuestionCatalog>(`/questions/catalog${query}`)
  return Array.isArray(remote.questions)
    ? remote.questions.map((item, index) => ({
        difficulty: item?.difficulty || '',
        id: item?.id || `question-${index + 1}`,
        riskLevel: item?.riskLevel || '',
        tag: item?.tag || '',
        template: item?.template || '',
        text: item?.text || '',
        type: item?.type || '',
      }))
    : []
}

export const getManagedMerchantCatalog = async (): Promise<ManagedMerchantCatalog> => {
  if (merchantCatalogCache && merchantCatalogCache.expiresAt > Date.now()) {
    return merchantCatalogCache.value
  }

  const remote = await requestJson<RemoteMerchantCatalog>('/merchants/catalog')
  const next: ManagedMerchantCatalog = {
    categories: Array.isArray(remote.categories)
      ? remote.categories.map((item) => ({
          iconClass: item?.iconClass || '',
          name: item?.name || '',
          toneClass: item?.toneClass || '',
        }))
      : [],
    notice: remote.notice || '',
    safeBack: Array.isArray(remote.safeBack)
      ? remote.safeBack.map((item) => ({
          iconClass: item?.iconClass || '',
          name: item?.name || '',
          toneClass: item?.toneClass || '',
        }))
      : [],
    shops: Array.isArray(remote.shops)
      ? await Promise.all(remote.shops.map(async (item) => ({
          id: item?.id || '',
          imageUrl:
            (await resolveCachedManagedImagePath(normalizeManagedAssetPath(item?.imageUrl))) || '',
          meta: item?.meta || '',
          name: item?.name || '',
          status: item?.status || '',
        })))
      : [],
  }

  merchantCatalogCache = {
    expiresAt: Date.now() + MERCHANT_CATALOG_CACHE_TTL,
    value: next,
  }

  return next
}

export const getManagedUsageRecords = async (): Promise<ManagedUsageRecord[]> => {
  const remote = await requestJson<RemoteUsageRecord[]>('/tools/usage-records')
  return remote.map((item) => ({
    meta: item?.meta || '',
    name: item?.name || '',
    route: item?.route || '',
    tag: item?.tag || '',
  }))
}

export const getManagedJudgeStats = async (): Promise<ManagedJudgeStats> => {
  const remote = await requestJson<RemoteJudgeStats>('/user/judge-stats')
  return {
    hostedCount: Number(remote.hostedCount) || 0,
    joinedCount: Number(remote.joinedCount) || 0,
    reportShareCount: Number(remote.reportShareCount) || 0,
    unsharedReportCount: Number(remote.unsharedReportCount) || 0,
  }
}

export const isToolVisibleInPlacement = (tool: Pick<ToolDescriptor, 'placement'>, placement: 'home' | 'tools') => {
  const normalized = String(tool.placement || 'tools').trim().toLowerCase()
  return normalized === 'both' || normalized === placement
}

export const recordManagedToolUsage = async (toolId: string): Promise<void> => {
  const id = resolveToolId(toolId)
  if (!id) {
    return
  }
  await requestJson('/tools/history', 'POST', { id }).catch(() => undefined)
}
