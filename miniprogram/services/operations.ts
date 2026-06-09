import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath, staticAsset } from '../config/assets'
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
  city?: string
  district?: string
  hostName?: string
  id?: string
  inviteCode?: string
  joinedCount?: number
  joinedPlayers?: RemoteSessionPlayer[]
  joinStatusPlayers?: RemoteSessionPlayer[]
  latitude?: number
  location?: string
  longitude?: number
  playerCount?: number
  province?: string
  sessionName?: string
  source?: string
  stateText?: string
  status?: string
  subtitle?: string
  templateName?: string
  title?: string
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
  city: string
  district: string
  hostName: string
  id: string
  inviteCode: string
  joinedCount: number
  joinedPlayers: ManagedSessionPlayer[]
  joinStatusPlayers: ManagedSessionPlayer[]
  latitude: number | null
  location: string
  longitude: number | null
  playerCount: number
  province: string
  sessionName: string
  source: string
  stateText: string
  status: string
  subtitle: string
  templateName: string
  title: string
}

export interface ManagedSessionMutationPayload {
  city?: string
  district?: string
  hostAvatarUrl?: string
  hostName?: string
  hostProfileId?: string
  inviteCode?: string
  latitude?: number | null
  location?: string
  longitude?: number | null
  playerCount?: number
  province?: string
  selectedPlayers?: ManagedSessionPlayer[]
  sessionName?: string
  source?: string
  state?: string
  status?: string
  templateName?: string
}

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

const DEFAULT_LIVE_SESSION: ManagedLiveSession = {
  city: '',
  district: '',
  hostName: '当前发起人',
  id: 'session-local',
  inviteCode: 'AB7K9Q',
  joinedCount: 4,
  joinedPlayers: [
    { name: '阿浩', avatarUrl: 'https://api.pomer.cn/static/avatar-1.png', status: '已加入' },
    { name: '小熊', avatarUrl: 'https://api.pomer.cn/static/avatar-2.png', status: '已加入' },
    { name: 'Mika', avatarUrl: 'https://api.pomer.cn/static/avatar-3.png', status: '已加入' },
    { name: '可可', avatarUrl: 'https://api.pomer.cn/static/avatar-4.png', status: '已加入' },
  ],
  joinStatusPlayers: [
    { name: '阿浩', avatarUrl: 'https://api.pomer.cn/static/avatar-1.png', status: '已加入' },
    { name: '小熊', avatarUrl: 'https://api.pomer.cn/static/avatar-2.png', status: '已加入' },
    { name: 'Mika', avatarUrl: 'https://api.pomer.cn/static/avatar-3.png', status: '待确认' },
    { name: '可可', avatarUrl: 'https://api.pomer.cn/static/avatar-4.png', status: '已加入' },
  ],
  latitude: null,
  location: '',
  longitude: null,
  playerCount: 6,
  province: '',
  sessionName: '今晚聚会不醉不归',
  source: '直接创建',
  stateText: '等待开局',
  status: '正常',
  subtitle: '人齐自动开局，无需群主操作',
  templateName: '经典欠酒版',
  title: '组局中，等人齐',
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
  avatarUrl: normalizeManagedAssetPath(player?.avatarUrl) || 'https://api.pomer.cn/static/avatar-1.png',
  name: player?.name || '玩家',
  profileId: player?.profileId || '',
  status: player?.status || '待加入',
})

const mergeToolDescriptor = (remoteTool: RemoteToolItem): ToolDescriptor => {
  const toolId = resolveToolId(remoteTool.id || remoteTool.rawId || '')
  const fallback = getToolById(toolId) || TOOL_LIST[0]

  return {
    ...fallback,
    id: toolId || fallback.id,
    name: remoteTool.name || fallback.name,
    categoryId: remoteTool.categoryId || fallback.categoryId,
    iconClass: remoteTool.iconClass || fallback.iconClass,
    toneClass: remoteTool.toneClass || fallback.toneClass,
    imageUrl: normalizeManagedAssetPath(remoteTool.imageUrl) || fallback.imageUrl,
    heroImage: normalizeManagedAssetPath(remoteTool.heroImage || remoteTool.imageUrl) || fallback.heroImage,
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
  try {
    const remote = await requestJson<RemoteToolsResponse>('/tools/catalog')
    const categories =
      remote.categories?.length
        ? remote.categories.map((item) => ({ id: item.id, name: item.name }))
        : DEFAULT_TOOLS_CATALOG.categories
    const tools = remote.tools?.length ? remote.tools.map(mergeToolDescriptor) : DEFAULT_TOOLS_CATALOG.tools

    return {
      categories,
      categoryCards: buildCategoryCards(tools, categories),
      hero: {
        imageUrl: normalizeManagedAssetPath(remote.hero?.imageUrl) || DEFAULT_TOOLS_CATALOG.hero.imageUrl,
        subtitle: remote.hero?.subtitle || DEFAULT_TOOLS_CATALOG.hero.subtitle,
        title: remote.hero?.title || DEFAULT_TOOLS_CATALOG.hero.title,
      },
      popularTools: remote.popularTools?.length ? remote.popularTools.map(mergeToolDescriptor) : tools.slice(0, 4),
      tools,
    }
  } catch {
    return DEFAULT_TOOLS_CATALOG
  }
}

export const getManagedLiveSession = async (sessionId?: string, inviteCode?: string): Promise<ManagedLiveSession> => {
  try {
    const query = [
      sessionId ? `sessionId=${encodeURIComponent(sessionId)}` : '',
      inviteCode ? `inviteCode=${encodeURIComponent(inviteCode)}` : '',
    ]
      .filter(Boolean)
      .join('&')
    const remote = await requestJson<RemoteLiveSession>(`/sessions/live${query ? `?${query}` : ''}`)
    const joinedPlayers = remote.joinedPlayers?.length ? remote.joinedPlayers.map(normalizeSessionPlayer) : DEFAULT_LIVE_SESSION.joinedPlayers
    const joinStatusPlayers = remote.joinStatusPlayers?.length
      ? remote.joinStatusPlayers.map(normalizeSessionPlayer)
      : joinedPlayers

    return {
      ...DEFAULT_LIVE_SESSION,
      city: remote.city || DEFAULT_LIVE_SESSION.city,
      district: remote.district || DEFAULT_LIVE_SESSION.district,
      hostName: remote.hostName || DEFAULT_LIVE_SESSION.hostName,
      id: remote.id || DEFAULT_LIVE_SESSION.id,
      inviteCode: remote.inviteCode || DEFAULT_LIVE_SESSION.inviteCode,
      joinedCount: Number(remote.joinedCount) || joinedPlayers.length || DEFAULT_LIVE_SESSION.joinedCount,
      joinedPlayers,
      joinStatusPlayers,
      latitude: Number.isFinite(Number(remote.latitude)) ? Number(remote.latitude) : DEFAULT_LIVE_SESSION.latitude,
      location: remote.location || DEFAULT_LIVE_SESSION.location,
      longitude: Number.isFinite(Number(remote.longitude)) ? Number(remote.longitude) : DEFAULT_LIVE_SESSION.longitude,
      playerCount: Number(remote.playerCount) || DEFAULT_LIVE_SESSION.playerCount,
      province: remote.province || DEFAULT_LIVE_SESSION.province,
      sessionName: remote.sessionName || DEFAULT_LIVE_SESSION.sessionName,
      source: remote.source || DEFAULT_LIVE_SESSION.source,
      stateText: remote.stateText || DEFAULT_LIVE_SESSION.stateText,
      status: remote.status || DEFAULT_LIVE_SESSION.status,
      subtitle: remote.subtitle || DEFAULT_LIVE_SESSION.subtitle,
      templateName: remote.templateName || DEFAULT_LIVE_SESSION.templateName,
      title: remote.title || DEFAULT_LIVE_SESSION.title,
    }
  } catch {
    return DEFAULT_LIVE_SESSION
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
  try {
    const created = await requestJson<RemoteLiveSession>('/sessions', 'POST', payload as Record<string, unknown>)
    const joinedPlayers = created.joinedPlayers?.length ? created.joinedPlayers.map(normalizeSessionPlayer) : DEFAULT_LIVE_SESSION.joinedPlayers
    const joinStatusPlayers = created.joinStatusPlayers?.length
      ? created.joinStatusPlayers.map(normalizeSessionPlayer)
      : DEFAULT_LIVE_SESSION.joinStatusPlayers

    return {
      ...DEFAULT_LIVE_SESSION,
      city: created.city || payload.city || DEFAULT_LIVE_SESSION.city,
      district: created.district || payload.district || DEFAULT_LIVE_SESSION.district,
      hostName: created.hostName || payload.hostName || DEFAULT_LIVE_SESSION.hostName,
      id: created.id || DEFAULT_LIVE_SESSION.id,
      inviteCode: created.inviteCode || payload.inviteCode || DEFAULT_LIVE_SESSION.inviteCode,
      joinedCount: Number(created.joinedCount) || joinedPlayers.length || DEFAULT_LIVE_SESSION.joinedCount,
      joinedPlayers,
      joinStatusPlayers,
      latitude: Number.isFinite(Number(created.latitude)) ? Number(created.latitude) : payload.latitude ?? DEFAULT_LIVE_SESSION.latitude,
      location: created.location || payload.location || DEFAULT_LIVE_SESSION.location,
      longitude: Number.isFinite(Number(created.longitude)) ? Number(created.longitude) : payload.longitude ?? DEFAULT_LIVE_SESSION.longitude,
      playerCount: Number(created.playerCount) || payload.playerCount || DEFAULT_LIVE_SESSION.playerCount,
      province: created.province || payload.province || DEFAULT_LIVE_SESSION.province,
      sessionName: created.sessionName || payload.sessionName || DEFAULT_LIVE_SESSION.sessionName,
      source: created.source || payload.source || DEFAULT_LIVE_SESSION.source,
      stateText: created.stateText || payload.state || DEFAULT_LIVE_SESSION.stateText,
      status: created.status || payload.status || DEFAULT_LIVE_SESSION.status,
      subtitle: created.subtitle || DEFAULT_LIVE_SESSION.subtitle,
      templateName: created.templateName || payload.templateName || DEFAULT_LIVE_SESSION.templateName,
      title: created.title || DEFAULT_LIVE_SESSION.title,
    }
  } catch {
    return {
      ...DEFAULT_LIVE_SESSION,
      city: payload.city || DEFAULT_LIVE_SESSION.city,
      district: payload.district || DEFAULT_LIVE_SESSION.district,
      hostName: payload.hostName || DEFAULT_LIVE_SESSION.hostName,
      inviteCode: payload.inviteCode || DEFAULT_LIVE_SESSION.inviteCode,
      latitude: payload.latitude ?? DEFAULT_LIVE_SESSION.latitude,
      location: payload.location || DEFAULT_LIVE_SESSION.location,
      longitude: payload.longitude ?? DEFAULT_LIVE_SESSION.longitude,
      playerCount: payload.playerCount || DEFAULT_LIVE_SESSION.playerCount,
      province: payload.province || DEFAULT_LIVE_SESSION.province,
      sessionName: payload.sessionName || DEFAULT_LIVE_SESSION.sessionName,
      source: payload.source || DEFAULT_LIVE_SESSION.source,
      stateText: payload.state || DEFAULT_LIVE_SESSION.stateText,
      status: payload.status || DEFAULT_LIVE_SESSION.status,
      templateName: payload.templateName || DEFAULT_LIVE_SESSION.templateName,
    }
  }
}

export const updateManagedSession = async (sessionId: string, payload: ManagedSessionMutationPayload): Promise<void> => {
  if (!sessionId) {
    return
  }

  await requestJson(`/sessions/${encodeURIComponent(sessionId)}`, 'PUT', payload as Record<string, unknown>).catch(() => null)
}
