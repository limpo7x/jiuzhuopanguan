import { type HomePageData } from '../mock/home'
import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath } from '../config/assets'
import { resolveCachedManagedImagePathQuick } from '../utils/imageCache'
import { DEFAULT_REQUEST_TIMEOUT_MS, normalizeWxRequestError } from '../utils/network'
import { getUserAuthHeaders } from '../utils/social'
import { getManagedToolsCatalog, isToolVisibleInPlacement, type ManagedToolCatalog } from './operations'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface HomeConfigResponse {
  hero?: {
    title?: string
    subtitle?: string
    imageUrl?: string
    imageUploadEndpoint?: string
    imageUpdateEndpoint?: string
  }
  quickTools?: Array<{
    id?: string
    name?: string
  }>
}

interface ComplianceResponse {
  copy?: string
}

interface UserProfileResponse {
  points?: number
}

const HOME_CACHE_TTL = 45000
let homePageCache: { expiresAt: number; value: HomePageData } | null = null

const request = <T>(path: string): Promise<T> =>
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}${path}`,
      header: getUserAuthHeaders(),
      timeout: DEFAULT_REQUEST_TIMEOUT_MS,
      success: (response) => {
        const payload = response.data as ApiResponse<T>
        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
          resolve(payload.data)
          return
        }
        reject(new Error(payload.message || 'request failed'))
      },
      fail: (error) => reject(normalizeWxRequestError(error, path)),
    })
  })

const buildToolRoute = (_id: string, _name: string) => '/pages/privacy-state/index?type=feature'

const mapCatalogToolToQuickTool = (tool: ManagedToolCatalog['tools'][number]) => ({
  id: tool.id,
  imageUrl: tool.imageUrl,
  name: tool.name,
  iconClass: tool.iconClass,
  route: buildToolRoute(tool.id, tool.name),
  toneClass: tool.toneClass,
})

const mapQuickTools = (quickTools: HomeConfigResponse['quickTools'] | undefined, catalog: ManagedToolCatalog) => {
  const tools = catalog.tools.filter((tool) => isToolVisibleInPlacement(tool, 'home'))
  const byId = new Map(tools.map((tool) => [tool.id, tool]))
  const configuredIds = (quickTools || []).map((tool) => String(tool.id || '').trim()).filter(Boolean)
  const selectedTools = configuredIds.length
    ? configuredIds.map((id) => byId.get(id)).filter((tool): tool is ManagedToolCatalog['tools'][number] => Boolean(tool))
    : tools
  return selectedTools.slice(0, 4).map(mapCatalogToolToQuickTool)
}

export const getHomePageData = async (): Promise<HomePageData> => {
  if (homePageCache && homePageCache.expiresAt > Date.now()) {
    return homePageCache.value
  }

  const [homeConfig, compliance, profile, toolsCatalog] = await Promise.all([
    request<HomeConfigResponse>('/config/home'),
    request<ComplianceResponse>('/config/compliance'),
    request<UserProfileResponse>('/user/profile'),
    getManagedToolsCatalog(),
  ])

  const next: HomePageData = {
    points: typeof profile.points === 'number' ? profile.points : 0,
    searchPlaceholder: '',
    hero: {
      title: homeConfig.hero?.title || '',
      subtitle: homeConfig.hero?.subtitle || '',
      imageUrl: (await resolveCachedManagedImagePathQuick(normalizeManagedAssetPath(homeConfig.hero?.imageUrl), 800)) || '',
      shareTitle: homeConfig.hero?.title || '',
    },
    quickTools: mapQuickTools(homeConfig.quickTools, toolsCatalog),
    recentTools: [],
    complianceCopy: compliance.copy || '',
  }

  homePageCache = {
    expiresAt: Date.now() + HOME_CACHE_TTL,
    value: next,
  }

  return next
}
