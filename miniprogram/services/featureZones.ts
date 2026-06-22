import { getApiBase } from '../config/api'
import { clearUserSessionToken, getUserAuthHeaders } from '../utils/social'

interface ApiResponse<T> {
  code?: number
  data?: T
  message?: string
}

export interface FeatureZoneRecord {
  createdAt?: string
  id?: string
  meta?: string
  name?: string
  route?: string
  status?: string
  tag?: string
  title?: string
  type?: string
  updatedAt?: string
}

export interface UserFeatureZones {
  favorites?: FeatureZoneRecord[]
  inviteRewards?: FeatureZoneRecord[] | Record<string, unknown>
  membership?: Record<string, unknown>
  merchants?: Record<string, unknown>
  points?: Record<string, unknown>
  templates?: Record<string, unknown>
  usageRecords?: FeatureZoneRecord[]
}

const requestFeature = <T>(path: string) =>
  new Promise<T>((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}${path}`,
      method: 'GET',
      header: getUserAuthHeaders(),
      timeout: 5000,
      success: (response) => {
        const payload = response.data as ApiResponse<T>
        if (response.statusCode >= 200 && response.statusCode < 300 && (payload.code === 0 || payload.code === undefined)) {
          resolve(payload.data === undefined ? (payload as T) : (payload.data as T))
          return
        }

        if (response.statusCode === 401) {
          clearUserSessionToken()
          reject(new Error('请先登录后查看'))
          return
        }

        reject(new Error(payload?.message || `请求失败 ${response.statusCode}`))
      },
      fail: reject,
    })
  })

export const getUserFeatureZones = async () => requestFeature<UserFeatureZones>('/user/feature-zones')

export const getUserFavorites = async () => requestFeature<FeatureZoneRecord[] | { items?: FeatureZoneRecord[] }>('/user/favorites')

export const getUserUsageRecords = async () => requestFeature<FeatureZoneRecord[] | { items?: FeatureZoneRecord[] }>('/user/usage-records')
