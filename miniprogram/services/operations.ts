import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath, staticAsset } from '../config/assets'
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

const DEFAULT_AVATAR = staticAsset('avatar-1.png')

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

const buildFallbackPlayers = (): ManagedSessionPlayer[] => {
  const runtime = getSessionRuntime()
  return resolveSessionParticipants(runtime).map((item) => ({
    avatarUrl: normalizeManagedAssetPath(item.avatarUrl) || DEFAULT_AVATAR,
    name: item.name,
    profileId: item.profileId || '',
    status: item.status || '已加入',
  }))
}

const buildFallbackLiveSession = (): ManagedLiveSession => {
  const runtime = getSessionRuntime()
  const joinedPlayers = buildFallbackPlayers()
  const playerCount = runtime.playerCount || Math.max(joinedPlayers.length, 2) || 6

  return {
    city: runtime.city || '',
    district: runtime.district || '',
    hostName: runtime.currentUser?.name || '当前发起人',
    id: runtime.sessionId || 'session-local',
    inviteCode: runtime.inviteCode || '',
    joinedCount: joinedPlayers.length,
    joinedPlayers,
    joinStatusPlayers: joinedPlayers.map((item) => ({
      ...item,
      status: item.status || '已加入',
    })),
    latitude: runtime.latitude ?? null,
    location: runtime.locationLabel || '',
    longitude: runtime.longitude ?? null,
    playerCount,
    province: runtime.province || '',
    sessionName: runtime.sessionName || '酒桌判官酒局',
    source: '直接创建',
    stateText: runtime.startedAt ? '进行中' : '等待开局',
    status: '正常',
    subtitle: joinedPlayers.length ? `当前已加入 ${joinedPlayers.length}/${playerCount} 人` : '等待真实玩家加入后开始',
    templateName: runtime.templateName || '',
    title: joinedPlayers.length ? '组局中，等待玩家加入' : '等待创建酒局',
  }
}

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
  const fallback = buildFallbackLiveSession()

  try {
    const query = [
      sessionId ? `sessionId=${encodeURIComponent(sessionId)}` : '',
      inviteCode ? `inviteCode=${encodeURIComponent(inviteCode)}` : '',
    ]
      .filter(Boolean)
      .join('&')
    const remote = await requestJson<RemoteLiveSession>(`/sessions/live${query ? `?${query}` : ''}`)
    const joinedPlayers = remote.joinedPlayers?.length ? remote.joinedPlayers.map(normalizeSessionPlayer) : fallback.joinedPlayers
    const joinStatusPlayers = remote.joinStatusPlayers?.length ? remote.joinStatusPlayers.map(normalizeSessionPlayer) : joinedPlayers

    return {
      ...fallback,
      city: remote.city || fallback.city,
      district: remote.district || fallback.district,
      hostName: remote.hostName || fallback.hostName,
      id: remote.id || fallback.id,
      inviteCode: remote.inviteCode || fallback.inviteCode,
      joinedCount: Number(remote.joinedCount) || joinedPlayers.length || fallback.joinedCount,
      joinedPlayers,
      joinStatusPlayers,
      latitude: Number.isFinite(Number(remote.latitude)) ? Number(remote.latitude) : fallback.latitude,
      location: remote.location || fallback.location,
      longitude: Number.isFinite(Number(remote.longitude)) ? Number(remote.longitude) : fallback.longitude,
      playerCount: Number(remote.playerCount) || fallback.playerCount,
      province: remote.province || fallback.province,
      sessionName: remote.sessionName || fallback.sessionName,
      source: remote.source || fallback.source,
      stateText: remote.stateText || fallback.stateText,
      status: remote.status || fallback.status,
      subtitle: remote.subtitle || fallback.subtitle,
      templateName: remote.templateName || fallback.templateName,
      title: remote.title || fallback.title,
    }
  } catch {
    return fallback
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
  const fallback = buildFallbackLiveSession()

  try {
    const created = await requestJson<RemoteLiveSession>('/sessions', 'POST', payload as Record<string, unknown>)
    const joinedPlayers = created.joinedPlayers?.length ? created.joinedPlayers.map(normalizeSessionPlayer) : fallback.joinedPlayers
    const joinStatusPlayers = created.joinStatusPlayers?.length ? created.joinStatusPlayers.map(normalizeSessionPlayer) : joinedPlayers

    return {
      ...fallback,
      city: created.city || payload.city || fallback.city,
      district: created.district || payload.district || fallback.district,
      hostName: created.hostName || payload.hostName || fallback.hostName,
      id: created.id || fallback.id,
      inviteCode: created.inviteCode || payload.inviteCode || fallback.inviteCode,
      joinedCount: Number(created.joinedCount) || joinedPlayers.length || fallback.joinedCount,
      joinedPlayers,
      joinStatusPlayers,
      latitude: Number.isFinite(Number(created.latitude)) ? Number(created.latitude) : payload.latitude ?? fallback.latitude,
      location: created.location || payload.location || fallback.location,
      longitude: Number.isFinite(Number(created.longitude)) ? Number(created.longitude) : payload.longitude ?? fallback.longitude,
      playerCount: Number(created.playerCount) || payload.playerCount || fallback.playerCount,
      province: created.province || payload.province || fallback.province,
      sessionName: created.sessionName || payload.sessionName || fallback.sessionName,
      source: created.source || payload.source || fallback.source,
      stateText: created.stateText || payload.state || fallback.stateText,
      status: created.status || payload.status || fallback.status,
      subtitle: created.subtitle || fallback.subtitle,
      templateName: created.templateName || payload.templateName || fallback.templateName,
      title: created.title || fallback.title,
    }
  } catch {
    return {
      ...fallback,
      city: payload.city || fallback.city,
      district: payload.district || fallback.district,
      hostName: payload.hostName || fallback.hostName,
      inviteCode: payload.inviteCode || fallback.inviteCode,
      latitude: payload.latitude ?? fallback.latitude,
      location: payload.location || fallback.location,
      longitude: payload.longitude ?? fallback.longitude,
      playerCount: payload.playerCount || fallback.playerCount,
      province: payload.province || fallback.province,
      sessionName: payload.sessionName || fallback.sessionName,
      source: payload.source || fallback.source,
      stateText: payload.state || fallback.stateText,
      status: payload.status || fallback.status,
      templateName: payload.templateName || fallback.templateName,
    }
  }
}

export const updateManagedSession = async (sessionId: string, payload: ManagedSessionMutationPayload): Promise<void> => {
  if (!sessionId) {
    return
  }

  await requestJson(`/sessions/${encodeURIComponent(sessionId)}`, 'PUT', payload as Record<string, unknown>).catch(() => null)
}
