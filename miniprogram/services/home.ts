import { homePageMock, type HomePageData } from '../mock/home'
import { getApiBase } from '../config/api'

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
  city?: string
  points?: number
}

const BACKEND_RETRY_INTERVAL = 30000
let backendDownUntil = 0

const STATIC_ASSET_MAP: Record<string, string> = {
  '/static/party-hero.png': '/assets/home/party-hero.png',
  '/static/toolbox-hero.png': '/assets/home/toolbox-hero.png',
  '/static/report-poster.png': '/assets/home/report-poster.png',
  '/static/points-gift.png': '/assets/home/points-gift.png',
}

const normalizeAssetPath = (path?: string): string | undefined => {
  if (!path) {
    return path
  }

  return STATIC_ASSET_MAP[path] || path
}

const QUICK_TOOL_VISUALS: Record<string, { iconClass: string; toneClass: string }> = {
  'image-compress': { iconClass: 'icon-compress', toneClass: 'green' },
  'text-count': { iconClass: 'icon-text', toneClass: '' },
  'qr-code': { iconClass: 'icon-qr', toneClass: '' },
  'loan-calc': { iconClass: 'icon-home', toneClass: '' },
}

const mergeQuickTools = (quickTools?: HomeConfigResponse['quickTools']) => {
  if (!quickTools?.length) {
    return homePageMock.quickTools
  }

  return quickTools.map((tool, index) => {
    const fallback = homePageMock.quickTools[index]
    const visuals =
      (tool.id && QUICK_TOOL_VISUALS[tool.id]) ||
      (fallback
        ? {
            iconClass: fallback.iconClass,
            toneClass: fallback.toneClass,
          }
        : { iconClass: 'icon-grid', toneClass: '' })

    return {
      id: tool.id || fallback?.id || `tool-${index}`,
      name: tool.name || fallback?.name || '工具',
      iconClass: visuals.iconClass,
      toneClass: visuals.toneClass,
    }
  })
}

const request = <T>(path: string): Promise<T> =>
  new Promise((resolve, reject) => {
    if (backendDownUntil > Date.now()) {
      reject(new Error('backend unavailable'))
      return
    }

    wx.request({
      url: `${getApiBase()}${path}`,
      timeout: 2500,
      success: (response) => {
        const payload = response.data as ApiResponse<T>

        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
          backendDownUntil = 0
          resolve(payload.data)
          return
        }

        reject(new Error(payload.message || 'request failed'))
      },
      fail: (error) => {
        backendDownUntil = Date.now() + BACKEND_RETRY_INTERVAL
        reject(error)
      },
    })
  })

export const getHomePageData = async (): Promise<HomePageData> => {
  try {
    const homeConfig = await request<HomeConfigResponse>('/config/home')
    const [compliance, profile] = await Promise.all([
      request<ComplianceResponse>('/config/compliance').catch<ComplianceResponse>(() => ({ copy: '' })),
      request<UserProfileResponse>('/user/profile').catch<UserProfileResponse>(() => ({ city: '', points: undefined })),
    ])

    return {
      ...homePageMock,
      location: profile.city || homePageMock.location,
      points: typeof profile.points === 'number' ? profile.points : homePageMock.points,
      hero: {
        ...homePageMock.hero,
        ...homeConfig.hero,
        imageUrl: normalizeAssetPath(homeConfig.hero?.imageUrl) || homePageMock.hero.imageUrl,
      },
      quickTools: mergeQuickTools(homeConfig.quickTools),
      complianceCopy: compliance.copy || homePageMock.complianceCopy,
    }
  } catch {
    return homePageMock
  }
}
