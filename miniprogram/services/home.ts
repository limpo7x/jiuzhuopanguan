import { homePageMock, type HomePageData } from '../mock/home'
import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath, staticAsset } from '../config/assets'
import { getUserAuthHeaders } from '../utils/social'
import { resolveToolId } from '../utils/toolkit'

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

interface ToolHistoryResponseItem {
  category?: string
  id?: string
  name?: string
  route?: string
  usedAt?: string
}

const BACKEND_RETRY_INTERVAL = 30000
let backendDownUntil = 0

const QUICK_TOOL_VISUALS: Record<string, { iconClass: string; toneClass: string }> = {
  'image-compress': { iconClass: 'icon-compress', toneClass: 'green' },
  'text-count': { iconClass: 'icon-text', toneClass: '' },
  'qr-code': { iconClass: 'icon-qr', toneClass: '' },
  'loan-calc': { iconClass: 'icon-home', toneClass: '' },
}

const RECENT_TOOL_ASSET_BY_CATEGORY: Record<string, { badgeClass: string; badgeText: string; imageUrl: string }> = {
  分享生成: { badgeClass: '', badgeText: '分享', imageUrl: staticAsset('report-poster.png') },
  图片工具: { badgeClass: 'green', badgeText: '图片', imageUrl: staticAsset('image-process-hero.png') },
  图片处理: { badgeClass: 'green', badgeText: '图片', imageUrl: staticAsset('image-process-hero.png') },
  开发工具: { badgeClass: '', badgeText: '工具', imageUrl: staticAsset('toolbox-hero.png') },
  计算工具: { badgeClass: '', badgeText: '计算', imageUrl: staticAsset('report-poster.png') },
}

const RECENT_TOOL_ID_BY_NAME: Record<string, string> = {
  二维码生成: 'qr-code',
  二维码: 'qr-code',
  九宫格切图: 'nine-grid',
  单位换算: 'unit',
  图片去水印: 'watermark',
  图片压缩: 'image-compress',
  房贷计算: 'loan-calc',
  JSON格式化: 'json',
  'JSON 格式化': 'json',
  汇率换算: 'currency',
  文字计数: 'text-count',
}

const normalizeRecentToolId = (item?: ToolHistoryResponseItem, fallbackId?: string) => {
  const directId = resolveToolId(item?.id || '')
  if (directId) {
    return directId
  }

  const mappedId = RECENT_TOOL_ID_BY_NAME[String(item?.name || '').trim()]
  if (mappedId) {
    return mappedId
  }

  return resolveToolId(fallbackId || '') || fallbackId || 'image-compress'
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

const mapRecentTools = (items?: ToolHistoryResponseItem[]) => {
  if (!items?.length) {
    return homePageMock.recentTools
  }

  return items.slice(0, 3).map((item, index) => {
    const fallback = homePageMock.recentTools[index] || homePageMock.recentTools[0]
    const visual = RECENT_TOOL_ASSET_BY_CATEGORY[item.category || ''] || {
      badgeClass: fallback.badgeClass,
      badgeText: fallback.badgeText,
      imageUrl: fallback.imageUrl,
    }

    return {
      id: normalizeRecentToolId(item, fallback.id),
      name: item.name || fallback.name || '工具',
      usedAt: item.usedAt || fallback.usedAt || '刚刚使用',
      imageUrl: visual.imageUrl,
      badgeText: visual.badgeText,
      badgeClass: visual.badgeClass,
      route: item.route || fallback.route || '',
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
      header: getUserAuthHeaders(),
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
    const [compliance, profile, toolHistory] = await Promise.all([
      request<ComplianceResponse>('/config/compliance').catch<ComplianceResponse>(() => ({ copy: '' })),
      request<UserProfileResponse>('/user/profile').catch<UserProfileResponse>(() => ({ city: '', points: undefined })),
      request<ToolHistoryResponseItem[]>('/tools/history').catch<ToolHistoryResponseItem[]>(() => []),
    ])

    return {
      ...homePageMock,
      location: profile.city || homePageMock.location,
      points: typeof profile.points === 'number' ? profile.points : homePageMock.points,
      hero: {
        ...homePageMock.hero,
        ...homeConfig.hero,
        imageUrl: normalizeManagedAssetPath(homeConfig.hero?.imageUrl) || homePageMock.hero.imageUrl,
      },
      quickTools: mergeQuickTools(homeConfig.quickTools),
      recentTools: mapRecentTools(toolHistory),
      complianceCopy: compliance.copy || homePageMock.complianceCopy,
    }
  } catch {
    return homePageMock
  }
}
