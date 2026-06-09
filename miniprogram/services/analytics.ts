import { getApiBase } from '../config/api'
import { getUserAuthHeaders } from '../utils/social'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface AnalyticsPayload {
  assetId?: string
  campaignId?: string
  merchantId?: string
  meta?: Record<string, unknown>
  planId?: string
  reportId?: string
  slotId?: string
  toolId?: string
  type: string
}

export const trackAnalyticsEvent = (payload: AnalyticsPayload) => {
  wx.request({
    url: `${getApiBase()}/analytics/events`,
    method: 'POST',
    data: payload as WechatMiniprogram.IAnyObject,
    header: getUserAuthHeaders(),
    timeout: 3000,
    success: () => undefined,
    fail: () => undefined,
  })
}

export const trackAnalyticsEventAsync = (payload: AnalyticsPayload) =>
  new Promise<void>((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}/analytics/events`,
      method: 'POST',
      data: payload as WechatMiniprogram.IAnyObject,
      header: getUserAuthHeaders(),
      timeout: 3000,
      success: (response) => {
        const data = response.data as ApiResponse<{ tracked: boolean }>
        if (response.statusCode >= 200 && response.statusCode < 300 && data.code === 0) {
          resolve()
          return
        }
        reject(new Error(data.message || 'track failed'))
      },
      fail: reject,
    })
  })
