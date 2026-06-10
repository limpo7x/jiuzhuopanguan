import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath } from '../config/assets'
import { resolveCachedManagedImagePath } from '../utils/imageCache'
import { getUserAuthHeaders } from '../utils/social'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface PointsTask {
  id: string
  iconClass: string
  title: string
  value: number
}

export interface TaskClaimState {
  canClaim: boolean
  buttonText: string
  statusText: string
  remaining: number
  max: number
  reward: number
}

export interface PointsReward {
  cost: number
  id: string
  iconClass: string
  subtitle: string
  title: string
}

export interface PointsConfig {
  balance: number
  bannerImageUrl: string
  rewards: PointsReward[]
  tasks: PointsTask[]
}

export interface TemplateFilter {
  id: string
  name: string
}

export interface TemplateItem {
  cost: number
  filterId: string
  id: string
  imageUrl: string
  meta: string
  title: string
}

export interface TemplateUnlockCard {
  progressText: string
  title: string
}

export interface TemplateConfig {
  filters: TemplateFilter[]
  templates: TemplateItem[]
  unlockCard: TemplateUnlockCard
}

export interface HomeAdminConfig {
  hero: {
    imageUpdateEndpoint?: string
    imageUploadEndpoint?: string
    imageUrl: string
    subtitle: string
    title: string
  }
  judge: {
    imageUrl: string
    subtitle: string
    title: string
  }
  quickTools: Array<{
    id: string
    name: string
  }>
}

export interface CommerceMembershipState {
  active: boolean
  activatedAt: string
  activePlanName?: string
  expiresAt: string
  planId: string
}

export interface UserCommerceState {
  claimedTaskIds: string[]
  membership: CommerceMembershipState
  ownedRewardIds: string[]
  points: number
  taskClaimStates?: Record<string, TaskClaimState>
  pointsLedger: Array<{
    createdAt: string
    delta: number
    id: string
    kind: string
    sourceId: string
    title: string
  }>
  rewardRedemptions: Array<{
    cost: number
    createdAt: string
    id: string
    rewardId: string
    title: string
  }>
  templateUnlockProgress: Record<string, number>
  templateUnlockRequiredViews: number
  unlockedTemplateIds: string[]
}

export interface MembershipBenefit {
  id: string
  name: string
  note: string
  scope: string
  status: string
}

export interface MembershipPlan {
  active?: boolean
  conversionRate: string
  duration: string
  id: string
  name: string
  price: string
  renewRate: string
  status: string
}

export interface MembershipCatalog {
  membershipEnabled: boolean
  benefits: MembershipBenefit[]
  membership: CommerceMembershipState
  plans: MembershipPlan[]
}

const request = <T>(path: string, method: 'GET' | 'PUT' | 'POST' = 'GET', data?: unknown) =>
  new Promise<T>((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}${path}`,
      method,
      data: data as WechatMiniprogram.IAnyObject | undefined,
      header: getUserAuthHeaders(),
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

const normalizePointsConfig = async (config: PointsConfig): Promise<PointsConfig> => ({
  ...config,
  bannerImageUrl: await resolveCachedManagedImagePath(normalizeManagedAssetPath(config.bannerImageUrl)),
})

const normalizeTemplateConfig = async (config: TemplateConfig): Promise<TemplateConfig> => ({
  ...config,
  templates: await Promise.all(
    config.templates.map(async (item) => ({
      ...item,
      imageUrl: await resolveCachedManagedImagePath(normalizeManagedAssetPath(item.imageUrl)),
    })),
  ),
})

const normalizeHomeConfig = async (config: HomeAdminConfig): Promise<HomeAdminConfig> => ({
  ...config,
  hero: {
    ...config.hero,
    imageUrl: await resolveCachedManagedImagePath(normalizeManagedAssetPath(config.hero.imageUrl)),
  },
  judge: {
    ...config.judge,
    imageUrl: await resolveCachedManagedImagePath(normalizeManagedAssetPath(config.judge.imageUrl)),
  },
})

export const getPublicHomeConfig = async () =>
  normalizeHomeConfig(await request<HomeAdminConfig>('/config/home'))

export const getPointsConfig = async () => normalizePointsConfig(await request<PointsConfig>('/config/points'))

export const getTemplateConfig = async () => normalizeTemplateConfig(await request<TemplateConfig>('/config/templates'))

export const getAdminHomeConfig = async () =>
  normalizeHomeConfig(await request<HomeAdminConfig>('/admin/config/home'))

export const saveAdminHomeHero = async (payload: {
  imageUrl: string
  subtitle: string
  title: string
}) =>
  request<{
    hero: HomeAdminConfig['hero']
    updatedAt: string
  }>('/admin/config/home/hero', 'PUT', payload)

export const getAdminPointsConfig = async () =>
  normalizePointsConfig(await request<PointsConfig>('/admin/config/points'))

export const saveAdminPointsConfig = async (payload: PointsConfig) =>
  request<{
    pointsConfig: PointsConfig
    updatedAt: string
  }>('/admin/config/points', 'PUT', payload)

export const getAdminTemplateConfig = async () =>
  normalizeTemplateConfig(await request<TemplateConfig>('/admin/config/templates'))

export const saveAdminTemplateConfig = async (payload: TemplateConfig) =>
  request<{
    templateConfig: TemplateConfig
    updatedAt: string
  }>('/admin/config/templates', 'PUT', payload)

export const getUserCommerceState = async () => request<UserCommerceState>('/user/commerce')

export const claimPointsTask = async (taskId: string) =>
  request<UserCommerceState>(`/points/tasks/${encodeURIComponent(taskId)}/claim`, 'POST')

export const redeemPointsReward = async (rewardId: string) =>
  request<UserCommerceState>(`/points/rewards/${encodeURIComponent(rewardId)}/redeem`, 'POST')

export const unlockTemplateByAd = async (templateId: string) =>
  request<UserCommerceState & { unlockedTemplateId?: string }>(`/templates/${encodeURIComponent(templateId)}/unlock`, 'POST')

export const getMembershipCatalog = async () => request<MembershipCatalog>('/membership/catalog')

export const activateMembershipPlan = async (planId: string) =>
  request<MembershipCatalog>('/membership/activate', 'POST', { planId })
