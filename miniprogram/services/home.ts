import { type HomePageData } from '../mock/home'
import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath } from '../config/assets'
import { resolveCachedManagedImagePathQuick } from '../utils/imageCache'
import { getUserAuthHeaders } from '../utils/social'

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

interface ToolHistoryResponseItem {
  category?: string
  id?: string
  name?: string
  route?: string
  usedAt?: string
}

const HOME_CACHE_TTL = 45000
let homePageCache: { expiresAt: number; value: HomePageData } | null = null

const request = <T>(path: string): Promise<T> =>
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}${path}`,
      header: getUserAuthHeaders(),
      timeout: 5000,
      success: (response) => {
        const payload = response.data as ApiResponse<T>
        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
          resolve(payload.data)
          return
        }
        reject(new Error(payload.message || 'request failed'))
      },
      fail: reject,
    })
  })

const mapQuickTools = (quickTools?: HomeConfigResponse['quickTools']) =>
  (quickTools || []).map((tool) => ({
    id: tool.id || '',
    name: tool.name || '',
    iconClass: '',
    toneClass: '',
  })).filter((item) => item.id || item.name)

const mapRecentTools = async (items?: ToolHistoryResponseItem[]) =>
  Promise.all(
    (items || []).slice(0, 3).map(async (item) => ({
      id: item.id || '',
      name: item.name || '',
      usedAt: item.usedAt || '',
      imageUrl: '',
      badgeText: item.category || '',
      badgeClass: '',
      route: item.route || '',
    })),
  )

export const getHomePageData = async (): Promise<HomePageData> => {
  if (homePageCache && homePageCache.expiresAt > Date.now()) {
    return homePageCache.value
  }

  const [homeConfig, compliance, profile, toolHistory] = await Promise.all([
    request<HomeConfigResponse>('/config/home'),
    request<ComplianceResponse>('/config/compliance'),
    request<UserProfileResponse>('/user/profile'),
    request<ToolHistoryResponseItem[]>('/tools/history'),
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
    quickTools: mapQuickTools(homeConfig.quickTools),
    recentTools: await mapRecentTools(toolHistory),
    complianceCopy: compliance.copy || '',
  }

  homePageCache = {
    expiresAt: Date.now() + HOME_CACHE_TTL,
    value: next,
  }

  return next
}