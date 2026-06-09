import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath, staticAsset } from '../config/assets'
import { resolveCachedManagedImagePath } from '../utils/image-cache'
import { getSessionRuntime, resolveSessionParticipants } from '../utils/session'
import { getUserAuthHeaders } from '../utils/social'
import {
  TOOL_CATEGORIES,
  TOOL_LIST,
  getToolById,
  getToolCategoryCards,
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
  name?: string
  profileId?: string
  status?: string
}

interface RemoteLiveSession {
  hostName?: string
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
  templateName?: string
  title?: string
}

interface RemoteManagedReport {
  createdAt?: string
  events?: Array<{ text?: string }>
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
    id?: string
    tag?: string
    template?: string
    text?: string
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
  name: string
  profileId?: string
  status: string
}

export interface ManagedLiveSession {
  hostName: string
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
  id: string
  imageUrl: string
  meta: string
  recordType: 'report' | 'session'
  reportId: string
  sessionId: string
  sessionName: string
  shareRate: string
  status: string
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
  id: string
  tag: string
  template: string
  text: string
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
}

const DEFAULT_AVATAR = staticAsset('avatar-1.png')
const TOOLS_CATALOG_CACHE_TTL = 60000
const REPORT_HISTORY_CACHE_TTL = 45000
const SHARE_CONFIG_CACHE_TTL = 60000
const MERCHANT_CATALOG_CACHE_TTL = 60000

let toolsCatalogCache: { expiresAt: number; value: ManagedToolCatalog } | null = null
let reportHistoryCache: { expiresAt: number; value: ManagedReportSummary[] } | null = null
let shareConfigCache: { expiresAt: number; value: ManagedShareConfig } | null = null
let merchantCatalogCache: { expiresAt: number; value: ManagedMerchantCatalog } | null = null

const DEFAULT_TOOLS_CATALOG: ManagedToolCatalog = {
  categories: TOOL_CATEGORIES,
  categoryCards: getToolCategoryCards(),
  hero: {
    imageUrl: staticAsset('toolbox-hero.png'),
    subtitle: '高效 · 实用 · 有趣',
    title: '工具在手 生活不愁',
  },
  popularTools: TOOL_LIST.slice(0, 4),
  tools: TOOL_LIST,
}

const requestJson = <T>(path: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: Record<string, unknown>): Promise<T> =>
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
  avatarUrl: normalizeManagedAssetPath(player?.avatarUrl) || DEFAULT_AVATAR,
  name: player?.name || '未命名玩家',
  profileId: player?.profileId || '',
  status: player?.status || '待加入',
})

const mergeToolDescriptor = async (remoteTool: RemoteToolItem): Promise<ToolDescriptor> => {
  const toolId = resolveToolId(remoteTool.id || remoteTool.rawId || '')
  const fallback = getToolById(toolId) || TOOL_LIST[0]
  const imageUrl =
    (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remoteTool.imageUrl))) || fallback.imageUrl
  const heroImage =
    (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remoteTool.heroImage || remoteTool.imageUrl))) ||
    fallback.heroImage

  return {
    ...fallback,
    id: toolId || fallback.id,
    name: remoteTool.name || fallback.name,
    categoryId: remoteTool.categoryId || fallback.categoryId,
    iconClass: remoteTool.iconClass || fallback.iconClass,
    toneClass: remoteTool.toneClass || fallback.toneClass,
    imageUrl,
    heroImage,
    meta: remoteTool.meta || fallback.meta,
    subtitle: remoteTool.target ? `${remoteTool.target} · ${remoteTool.favoriteRate || '收藏率 0%'}` : fallback.subtitle,
    summary: remoteTool.meta || fallback.summary,
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
        meta: hits.length ? `${hits.length} 个工具 · ${hits.map((item) => item.name).slice(0, 3).join(' / ')}` : '暂无工具',
        imageUrl: hits[0]?.imageUrl || staticAsset('toolbox-hero.png'),
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
        : DEFAULT_TOOLS_CATALOG.categories
    const tools = remote.tools?.length ? await Promise.all(remote.tools.map(mergeToolDescriptor)) : DEFAULT_TOOLS_CATALOG.tools

    const next: ManagedToolCatalog = {
      categories,
      categoryCards: buildCategoryCards(tools, categories),
      hero: {
        imageUrl:
          (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remote.hero?.imageUrl))) ||
          DEFAULT_TOOLS_CATALOG.hero.imageUrl,
        subtitle: remote.hero?.subtitle || DEFAULT_TOOLS_CATALOG.hero.subtitle,
        title: remote.hero?.title || DEFAULT_TOOLS_CATALOG.hero.title,
      },
      popularTools: remote.popularTools?.length ? await Promise.all(remote.popularTools.map(mergeToolDescriptor)) : tools.slice(0, 4),
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
  const runtime = getSessionRuntime()
  const runtimePlayers = resolveSessionParticipants(runtime).map((item) => ({
    avatarUrl: normalizeManagedAssetPath(item.avatarUrl) || DEFAULT_AVATAR,
    name: item.name,
    profileId: item.profileId || '',
    status: item.status || '待加入',
  }))
  const joinedPlayers = remote.joinedPlayers?.length ? remote.joinedPlayers.map(normalizeSessionPlayer) : runtimePlayers
  const joinStatusPlayers = remote.joinStatusPlayers?.length ? remote.joinStatusPlayers.map(normalizeSessionPlayer) : joinedPlayers

  return {
    hostName: remote.hostName || runtime.currentUser?.name || '',
    id: remote.id || runtime.sessionId || '',
    inviteCode: remote.inviteCode || runtime.inviteCode || '',
    joinedCount: Number(remote.joinedCount) || joinedPlayers.length,
    joinedPlayers,
    joinStatusPlayers,
    playerCount: Number(remote.playerCount) || runtime.playerCount || Math.max(joinStatusPlayers.length, 2),
    sessionName: remote.sessionName || runtime.sessionName || '',
    source: remote.source || '',
    stateText: remote.stateText || '',
    status: remote.status || '',
    subtitle: remote.subtitle || '',
    templateName: remote.templateName || runtime.templateName || '',
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

const normalizeManagedReport = (report?: RemoteManagedReport): ManagedReportDetail => ({
  createdAt: report?.createdAt || '',
  events: Array.isArray(report?.events) ? report.events.map((item) => ({ text: item?.text || '' })).filter((item) => item.text) : [],
  id: report?.id || '',
  inviteCode: report?.inviteCode || '',
  playerCount: Number(report?.playerCount) || 0,
  ranks: Array.isArray(report?.ranks)
    ? report.ranks.map((item) => ({
        avatarUrl: normalizeManagedAssetPath(item?.avatarUrl) || DEFAULT_AVATAR,
        name: item?.name || '',
        title: item?.title || '',
        value: item?.value || '',
      }))
    : [],
  replayRate: report?.replayRate || '0%',
  scene: report?.scene || '',
  sessionId: report?.sessionId || '',
  sessionName: report?.sessionName || '',
  shareRate: report?.shareRate || '0%',
  status: report?.status || '',
  templateName: report?.templateName || '',
  title: report?.title || '',
})

export const createManagedReport = async (payload: Record<string, unknown>): Promise<ManagedReportDetail> =>
  normalizeManagedReport(await requestJson<RemoteManagedReport>('/reports', 'POST', payload))

export const getManagedReport = async (reportId: string): Promise<ManagedReportDetail> =>
  normalizeManagedReport(await requestJson<RemoteManagedReport>(`/reports/${encodeURIComponent(reportId)}`))

export const getManagedReportHistory = async (): Promise<ManagedReportSummary[]> => {
  if (reportHistoryCache && reportHistoryCache.expiresAt > Date.now()) {
    return reportHistoryCache.value
  }

  const reports = await requestJson<RemoteManagedReport[]>('/reports/history')
  const next: ManagedReportSummary[] = await Promise.all(
    reports.map(async (item) => ({
      createdAt: item.createdAt || '',
      id: item.id || '',
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(item.imageUrl))) ||
        staticAsset('report-poster.png'),
      meta: item.meta || '',
      recordType: item.recordType === 'session' ? ('session' as const) : ('report' as const),
      reportId: item.reportId || (item.recordType === 'report' ? item.id || '' : ''),
      sessionId: item.sessionId || '',
      sessionName: item.sessionName || '',
      shareRate: item.shareRate || '0%',
      status: item.status || '',
      title: item.title || item.sessionName || '',
    })),
  )

  reportHistoryCache = {
    expiresAt: Date.now() + REPORT_HISTORY_CACHE_TTL,
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
      bestOpenRate: remote.performance?.bestOpenRate || '0%',
      bestReturnRate: remote.performance?.bestReturnRate || '0%',
    },
    poster: {
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remote.poster?.imageUrl))) ||
        staticAsset('report-poster.png'),
      title: remote.poster?.title || '这局快乐就完事了！',
    },
    preview: {
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remote.preview?.imageUrl))) ||
        staticAsset('party-hero.png'),
      inviteCode: remote.preview?.inviteCode || '',
      title: remote.preview?.title || '快来加入这一局',
    },
    shareItems: Array.isArray(remote.shareItems)
      ? remote.shareItems.map((item) => ({
          iconClass: item?.iconClass || 'share-icon-more',
          id: item?.id || '',
          name: item?.name || '更多',
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

export const getManagedQuestionBank = async (): Promise<ManagedQuestionItem[]> => {
  const remote = await requestJson<RemoteQuestionCatalog>('/questions/catalog')
  return Array.isArray(remote.questions)
    ? remote.questions.map((item, index) => ({
        id: item?.id || `question-${index + 1}`,
        tag: item?.tag || '',
        template: item?.template || '',
        text: item?.text || '',
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
          iconClass: item?.iconClass || 'merchant-icon-briefcase',
          name: item?.name || '',
          toneClass: item?.toneClass || '',
        }))
      : [],
    notice: remote.notice || '',
    safeBack: Array.isArray(remote.safeBack)
      ? remote.safeBack.map((item) => ({
          iconClass: item?.iconClass || 'merchant-icon-coupon',
          name: item?.name || '',
          toneClass: item?.toneClass || '',
        }))
      : [],
    shops: Array.isArray(remote.shops)
      ? await Promise.all(remote.shops.map(async (item) => ({
          id: item?.id || '',
          imageUrl:
            (await resolveCachedManagedImagePath(normalizeManagedAssetPath(item?.imageUrl))) ||
            staticAsset('party-hero.png'),
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
  }
}
