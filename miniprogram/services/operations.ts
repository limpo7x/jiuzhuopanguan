import { getApiBase } from '../config/api'
import { normalizeManagedAssetPath, normalizeManagedAvatarPath } from '../config/assets'
import { resolveCachedManagedImagePath, resolveCachedManagedImagePathQuick } from '../utils/imageCache'
import { DEFAULT_REQUEST_TIMEOUT_MS, normalizeWxRequestError } from '../utils/network'
import { getUserAuthHeaders, getUserAuthSession } from '../utils/social'
import {
  getToolCategoryCards,
  resolveToolId,
  TOOL_CATEGORIES,
  TOOL_LIST,
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
  clearedCount?: number
  debtCount?: number
  drinkCount?: number
  meta?: string
  name?: string
  profileId?: string
  status?: string
  wheelHistory?: Array<{
    createdAt?: string
    label?: string
    text?: string
    type?: string
  }>
}

interface RemoteLiveSession {
  endedAt?: string
  finishedAt?: string
  firstPhotoUploadedAt?: string
  hasFirstPhoto?: boolean
  hostAvatarUrl?: string
  hostName?: string
  hostProfileId?: string
  id?: string
  inviteCode?: string
  isActiveForResume?: boolean
  joinedCount?: number
  joinedPlayers?: RemoteSessionPlayer[]
  joinStatusPlayers?: RemoteSessionPlayer[]
  playerCount?: number
  sessionName?: string
  source?: string
  stateText?: string
  status?: string
  subtitle?: string
  templateImageUrl?: string
  templateName?: string
  title?: string
  updatedAt?: string
}

interface RemoteSessionFinishResult {
  endedAt?: string
  finishedAt?: string
  id?: string
  sessionId?: string
  state?: string
  status?: string
  updatedAt?: string
}

interface RemoteManagedReport {
  createdAt?: string
  events?: Array<{ text?: string }>
  hostName?: string
  hostProfileId?: string
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
  subtitle?: string
  shareRate?: string
  status?: string
  role?: 'host' | 'member'
  templateImageUrl?: string
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

interface RemoteMomentRecord {
  caption?: string
  completionStatus?: 'draft' | 'needs_media' | 'complete'
  createdAt?: string
  id?: string
  assetUrl?: string
  coverImageUrl?: string
  duration?: number
  imageUrl?: string
  mediaUrl?: string
  photoUrl?: string
  thumbnailUrl?: string
  url?: string
  isTimelinePlaceholder?: boolean
  kind?: 'moment'
  mediaType?: 'image' | 'video'
  moderationCheckedAt?: string
  moderationLabel?: string
  moderationReason?: string
  moderationScore?: number
  moderationSuggestion?: string
  nodeKind?: 'moment'
  nodeType?: 'opening' | 'highlight' | 'drinking' | 'private' | 'closing'
  rankingEligible?: boolean
  reviewStatus?: string
  rewardEligible?: boolean
  secondaryReviewStatus?: string
  sessionId?: string
  tags?: string[]
  timelineTitle?: string
  updatedAt?: string
  uploaderAvatarUrl?: string
  uploaderName?: string
  uploaderProfileId?: string
  usageConsent?: Partial<ManagedMomentUsageConsent>
  videoUrl?: string
  visibility?: string
  visibleProfileIds?: string[]
}

interface RemoteSessionEventRecord {
  caption?: string
  clientEventId?: string
  createdAt?: string
  eventType?: 'drink_debt' | 'drink_add' | 'wheel_result'
  id?: string
  kind?: 'event'
  nodeKind?: 'event'
  nodeType?: 'drinking'
  operatorAvatarUrl?: string
  operatorName?: string
  operatorProfileId?: string
  scoreDelta?: number
  sessionId?: string
  syncStatus?: string
  targetAvatarUrl?: string
  targetName?: string
  targetProfileId?: string
  timelineTitle?: string
  updatedAt?: string
}

interface RemoteSessionTimeline {
  nodes?: Array<RemoteMomentRecord | RemoteSessionEventRecord>
  pendingMediaCount?: number
  sessionId?: string
  sessionName?: string
}

interface RemoteSessionBrief {
  accountingHighlights?: Array<Record<string, unknown>>
  briefId?: string
  closingMomentIds?: string[]
  coverMode?: string
  createdAt?: string
  eventHighlights?: Array<Record<string, unknown>>
  generatedAt?: string
  id?: string
  keyEvents?: Array<Record<string, unknown>>
  ledgerRankings?: Record<string, unknown>
  ledgerSummary?: Record<string, unknown>
  openingMomentIds?: string[]
  partyId?: string
  photoHighlights?: Array<Record<string, unknown>>
  rankingEligible?: boolean
  sessionId?: string
  sessionName?: string
  settlementSummary?: Record<string, unknown>
  shareContentFilter?: Record<string, unknown>
  shareImageStatus?: string
  shareImageTaskId?: string
  timeline?: RemoteSessionTimeline
  timelineNodeIds?: string[]
  title?: string
  subtitle?: string
  updatedAt?: string
}

interface RemoteShareImageTask {
  briefId?: string
  createdAt?: string
  failedReason?: string
  failureReason?: string
  finishedAt?: string
  id?: string
  imageUrl?: string
  includeLedger?: boolean
  ledgerIncluded?: boolean
  layoutMode?: string
  message?: string
  miniProgramQrUrl?: string
  partyId?: string
  posterImageUrl?: string
  readyShareImageUrl?: string
  renderMode?: string
  rendererVersion?: string
  retryCount?: number
  qrCodeUrl?: string
  selectedNodeIds?: string[]
  sessionName?: string
  subtitle?: string
  shareImageId?: string
  taskId?: string
  sessionId?: string
  startedAt?: string
  status?: 'pending' | 'processing' | 'ready' | 'failed' | 'expired'
  updatedAt?: string
}

interface RemoteSessionMomentSummary {
  briefId?: string
  canResume?: boolean
  canResumeMomentIds?: string[]
  canShare?: boolean
  coverImageUrl?: string
  coverPhotoUrl?: string
  createdAt?: string
  endedAt?: string
  firstPhotoUploadedAt?: string
  hasFirstPhoto?: boolean
  isActiveForResume?: boolean
  pendingMediaCount?: number
  rankingEntryEnabled?: boolean
  readyShareImageUrl?: string
  reportId?: string
  sessionId?: string
  sessionName?: string
  subtitle?: string
  shareImageStatus?: string
  shareImageTaskId?: string
  shareImageUrl?: string
  state?: string
  stateText?: string
  status?: string
  title?: string
  updatedAt?: string
}

type RemoteRankingCategory = 'today_funny' | 'today_debt' | 'today_highlight' | 'today_visual' | 'best_opening' | 'best_closing'

interface RemoteRankingItem {
  category?: RemoteRankingCategory
  latestNominationAt?: string
  moment?: RemoteMomentRecord
  nominationCount?: number
  pointsTotal?: number
  rank?: number
  score?: number
}

interface RemoteTodayRanking {
  category?: RemoteRankingCategory
  date?: string
  items?: RemoteRankingItem[]
}

interface RemoteMomentNominationEligibility {
  alreadyNominatedToday?: boolean
  category?: RemoteRankingCategory
  eligible?: boolean
  momentId?: string
  pointsCost?: number
  reason?: string
  reasonCode?: string
  reasonText?: string
}

interface RemoteMomentNomination {
  category?: RemoteRankingCategory
  clientNominationId?: string
  createdAt?: string
  id?: string
  momentId?: string
  pointsSpent?: number
  profileId?: string
  profileName?: string
  refundedAt?: string
  sessionId?: string
  status?: string
  updatedAt?: string
}

interface RemoteQuestionCatalog {
  questions?: Array<{
    difficulty?: string
    id?: string
    riskLevel?: string
    tag?: string
    template?: string
    text?: string
    type?: string
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
  unsharedReportCount?: number
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
  clearedCount?: number
  debtCount?: number
  drinkCount?: number
  meta?: string
  name: string
  profileId?: string
  status: string
  wheelHistory?: ManagedWheelHistoryItem[]
}

export interface ManagedWheelHistoryItem {
  createdAt: string
  label: string
  text: string
  type: string
}

export interface ManagedLiveSession {
  endedAt: string
  firstPhotoUploadedAt: string
  hasFirstPhoto: boolean
  hostAvatarUrl: string
  hostName: string
  hostProfileId: string
  id: string
  inviteCode: string
  isActiveForResume: boolean
  joinedCount: number
  joinedPlayers: ManagedSessionPlayer[]
  joinStatusPlayers: ManagedSessionPlayer[]
  playerCount: number
  sessionName: string
  source: string
  stateText: string
  status: string
  subtitle: string
  templateImageUrl: string
  templateName: string
  title: string
}

export interface ManagedSessionFinishResult {
  endedAt: string
  sessionId: string
  state: string
  status: string
  updatedAt: string
}

export interface ManagedSessionMutationPayload {
  hostAvatarUrl?: string
  hostName?: string
  hostProfileId?: string
  inviteCode?: string
  playerCount?: number
  selectedPlayers?: ManagedSessionPlayer[]
  sessionName?: string
  subtitle?: string
  source?: string
  state?: string
  status?: string
  templateImageUrl?: string
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
  imageUrl: string
  inviteCode: string
  playerCount: number
  ranks: ManagedReportRank[]
  replayRate: string
  scene: string
  sessionId: string
  sessionName: string
  shareRate: string
  status: string
  subtitle: string
  templateName: string
  title: string
}

export interface ManagedReportSummary {
  createdAt: string
  hostName: string
  hostProfileId: string
  id: string
  imageUrl: string
  meta: string
  recordType: 'report' | 'session'
  reportId: string
  role: 'host' | 'member'
  sessionId: string
  sessionName: string
  subtitle: string
  shareRate: string
  status: string
  templateName: string
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
  difficulty: string
  id: string
  riskLevel: string
  tag: string
  template: string
  text: string
  type: string
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
  unsharedReportCount: number
}

export type ManagedMomentNodeType = 'opening' | 'highlight' | 'drinking' | 'private' | 'closing'
export type ManagedMomentVisibility = 'private' | 'selected' | 'session' | 'share' | 'featured'
export type ManagedMomentCompletionStatus = 'draft' | 'needs_media' | 'complete'
export type ManagedMomentReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden'
export type ManagedMomentSecondaryReviewStatus = 'pending' | 'approved' | 'rejected' | 'require_resubmit'
export type ManagedSessionEventType = 'drink_debt' | 'drink_add' | 'wheel_result'
export type ManagedShareImageTaskStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'expired'
export type ManagedRankingCategory = RemoteRankingCategory
export type ManagedContractRecord = Record<string, unknown>

export interface ManagedMomentUsageConsent {
  session: boolean
  brief: boolean
  share: boolean
  ranking: boolean
}

export interface ManagedMomentPayload {
  caption?: string
  clientDraftId?: string
  coverImageUrl?: string
  duration?: number
  imageUrl?: string
  mediaType?: 'image' | 'video'
  nodeType?: ManagedMomentNodeType
  tags?: string[]
  uploadAssetId?: string
  uploadVideoAssetId?: string
  usageConsent?: Partial<ManagedMomentUsageConsent>
  videoUrl?: string
  visibility?: ManagedMomentVisibility
  visibleProfileIds?: string[]
}

export interface ManagedMomentRecord {
  caption?: string
  completionStatus: ManagedMomentCompletionStatus
  createdAt: string
  id: string
  coverImageUrl?: string
  duration?: number
  imageUrl?: string
  isTimelinePlaceholder: boolean
  mediaType: 'image' | 'video'
  moderationCheckedAt?: string
  moderationLabel?: string
  moderationReason?: string
  moderationScore?: number
  moderationSuggestion?: string
  nodeKind: 'moment'
  nodeType: ManagedMomentNodeType
  rankingEligible: boolean
  rewardEligible: boolean
  reviewStatus?: ManagedMomentReviewStatus
  secondaryReviewStatus?: ManagedMomentSecondaryReviewStatus
  sessionId: string
  tags: string[]
  timelineTitle: string
  updatedAt: string
  uploaderAvatarUrl?: string
  uploaderName: string
  uploaderProfileId: string
  usageConsent?: ManagedMomentUsageConsent
  videoUrl?: string
  visibility: ManagedMomentVisibility
  visibleProfileIds?: string[]
}

export interface ManagedSessionEventPayload {
  caption?: string
  clientEventId: string
  eventType: ManagedSessionEventType
  scoreDelta?: number
  targetName?: string
  targetProfileId?: string
}

export interface ManagedSessionEventRecord {
  caption: string
  clientEventId: string
  createdAt: string
  eventType: ManagedSessionEventType
  id: string
  nodeKind: 'event'
  operatorAvatarUrl: string
  operatorName: string
  operatorProfileId: string
  scoreDelta: number
  sessionId: string
  syncStatus: string
  targetAvatarUrl: string
  targetName: string
  targetProfileId: string
  updatedAt: string
}

export type ManagedTimelineNode = ManagedMomentRecord | ManagedSessionEventRecord

export interface ManagedSessionTimeline {
  nodes: ManagedTimelineNode[]
  pendingMediaCount: number
  sessionId: string
}

export interface ManagedMomentUploadResult {
  assetType?: 'image' | 'video'
  coverAssetId?: string
  coverImageUrl?: string
  createdAt: string
  duration?: number
  fileName: string
  id: string
  moderationCheckedAt?: string
  moderationLabel?: string
  moderationReason?: string
  moderationScore?: number
  moderationSuggestion?: string
  mimeType: string
  objectKey?: string
  publicUrl?: string
  reviewStatus?: ManagedMomentReviewStatus
  secondaryReviewStatus?: ManagedMomentSecondaryReviewStatus
  sessionId: string
  size: number
  storageProvider?: string
  uploaderProfileId: string
  url: string
}

export interface ManagedSessionBrief {
  accountingHighlights: ManagedContractRecord[]
  closingMomentIds: string[]
  coverMode: string
  createdAt: string
  eventHighlights: ManagedContractRecord[]
  id: string
  ledgerRankings: ManagedContractRecord
  ledgerSummary: ManagedContractRecord
  openingMomentIds: string[]
  pendingMediaCount: number
  rankingEligible: boolean
  sessionId: string
  sessionName: string
  settlementSummary: ManagedContractRecord
  shareContentFilter: ManagedContractRecord
  shareImageStatus: string
  shareImageTaskId: string
  timeline: ManagedSessionTimeline
  timelineNodeIds: string[]
  title: string
  subtitle: string
  updatedAt: string
}

export interface ManagedShareImageTask {
  briefId: string
  createdAt: string
  failedReason: string
  finishedAt: string
  id: string
  imageUrl: string
  includeLedger: boolean
  ledgerIncluded: boolean
  layoutMode: string
  miniProgramQrUrl: string
  qrCodeUrl: string
  rendererVersion?: string
  retryCount: number
  selectedNodeIds: string[]
  sessionId: string
  startedAt: string
  status: ManagedShareImageTaskStatus
  updatedAt: string
}

export interface ManagedShareImageSummary {
  briefId: string
  createdAt: string
  finishedAt: string
  id: string
  imageUrl: string
  readyShareImageUrl: string
  sessionId: string
  sessionName: string
  subtitle: string
  status: ManagedShareImageTaskStatus
  updatedAt: string
}

export interface ManagedSessionMomentSummary {
  briefId: string
  canResume: boolean
  canResumeMomentIds: string[]
  canShare: boolean
  coverPhotoUrl: string
  createdAt: string
  endedAt: string
  firstPhotoUploadedAt: string
  hasFirstPhoto: boolean
  isActiveForResume: boolean
  pendingMediaCount: number
  rankingEntryEnabled: boolean
  readyShareImageUrl: string
  reportId: string
  sessionId: string
  sessionName: string
  subtitle: string
  shareImageStatus: string
  shareImageTaskId: string
  shareImageUrl: string
  state: string
  stateText: string
  status: string
  title: string
  updatedAt: string
}

export interface ManagedRankingItem {
  category: ManagedRankingCategory
  latestNominationAt: string
  moment: ManagedMomentRecord
  nominationCount: number
  pointsTotal: number
  rank: number
  score: number
}

export interface ManagedTodayRanking {
  category: ManagedRankingCategory
  date: string
  items: ManagedRankingItem[]
}

export interface ManagedMomentNominationEligibility {
  alreadyNominatedToday: boolean
  category: ManagedRankingCategory
  eligible: boolean
  momentId: string
  pointsCost: number
  reason: string
  reasonCode: string
  reasonText: string
}

export interface ManagedMomentNomination {
  category: ManagedRankingCategory
  clientNominationId: string
  createdAt: string
  id: string
  momentId: string
  pointsSpent: number
  profileId: string
  profileName: string
  refundedAt: string
  sessionId: string
  status: string
  updatedAt: string
}

const TOOLS_CATALOG_CACHE_TTL = 10000
const REPORT_HISTORY_CACHE_TTL = 45000
const SHARE_CONFIG_CACHE_TTL = 60000
const MERCHANT_CATALOG_CACHE_TTL = 60000

let toolsCatalogCache: { expiresAt: number; value: ManagedToolCatalog } | null = null
let reportHistoryCache: { expiresAt: number; key: string; value: ManagedReportSummary[] } | null = null
let shareConfigCache: { expiresAt: number; value: ManagedShareConfig } | null = null
let merchantCatalogCache: { expiresAt: number; value: ManagedMerchantCatalog } | null = null

const invalidateManagedReportHistoryCache = () => {
  reportHistoryCache = null
}

const buildLocalToolsCatalog = (): ManagedToolCatalog => ({
  categories: TOOL_CATEGORIES,
  categoryCards: getToolCategoryCards(),
  hero: {
    imageUrl: '',
    subtitle: '常用图片、分享、计算和文本工具都在这里。',
    title: '顺手工具',
  },
  popularTools: TOOL_LIST.filter((item) => item.placement !== 'home').slice(0, 4),
  tools: TOOL_LIST,
})

const DEFAULT_TOOLS_CATALOG: ManagedToolCatalog = buildLocalToolsCatalog()

const requestJson = <T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, unknown>,
  allowAuthRetry = true,
): Promise<T> =>
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}${path}`,
      header: getUserAuthHeaders(),
      method,
      data,
      timeout: DEFAULT_REQUEST_TIMEOUT_MS,
      success: (response) => {
        const payload = response.data as ApiResponse<T>
        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
          resolve(payload.data)
          return
        }
        const fallbackMessage = response.statusCode === 404 ? 'not found' : 'request failed'
        const error = new Error(payload?.message || fallbackMessage)
        ;(error as Error & { statusCode?: number }).statusCode = response.statusCode
        if (response.statusCode === 401 && allowAuthRetry) {
          void getUserAuthSession()
            .then((session) => {
              if (!session.loggedIn || !session.profile?.id) {
                reject(error)
                return
              }
              requestJson<T>(path, method, data, false).then(resolve, reject)
            })
            .catch(() => reject(error))
          return
        }
        reject(error)
      },
      fail: (error) => reject(normalizeWxRequestError(error, path)),
    })
  })

const parseUploadFileResponse = <T>(response: WechatMiniprogram.UploadFileSuccessCallbackResult, path: string): T => {
  let payload: ApiResponse<T> | null = null
  try {
    payload = JSON.parse(response.data || '{}') as ApiResponse<T>
  } catch (error) {
    throw normalizeWxRequestError(error, path)
  }
  if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
    return payload.data
  }
  const fallbackMessage = response.statusCode === 404 ? 'not found' : 'request failed'
  const error = new Error(payload?.message || fallbackMessage)
  ;(error as Error & { statusCode?: number }).statusCode = response.statusCode
  throw error
}

const uploadFileRequest = <T>(
  path: string,
  filePath: string,
  formData: WechatMiniprogram.IAnyObject,
  allowAuthRetry = true,
): Promise<T> =>
  new Promise((resolve, reject) => {
    wx.uploadFile({
      filePath,
      formData,
      header: getUserAuthHeaders(),
      name: 'file',
      timeout: Math.max(DEFAULT_REQUEST_TIMEOUT_MS, 20000),
      url: `${getApiBase()}${path}`,
      success: (response) => {
        try {
          resolve(parseUploadFileResponse<T>(response, path))
        } catch (error) {
          const statusCode = getRequestStatusCode(error)
          if (statusCode === 401 && allowAuthRetry) {
            void getUserAuthSession()
              .then((session) => {
                if (!session.loggedIn || !session.profile?.id) {
                  reject(error)
                  return
                }
                uploadFileRequest<T>(path, filePath, formData, false).then(resolve, reject)
              })
              .catch(() => reject(error))
            return
          }
          reject(error)
        }
      },
      fail: (error) => reject(normalizeWxRequestError(error, path)),
    })
  })

const getRequestStatusCode = (error: unknown) =>
  Number((error as Error & { statusCode?: number })?.statusCode || 0)

const isRouteFallbackError = (error: unknown) => {
  const statusCode = getRequestStatusCode(error)
  if (statusCode === 404 || statusCode === 405) {
    return true
  }
  if (statusCode === 401 || statusCode === 403 || statusCode === 409) {
    return false
  }
  const message = error instanceof Error ? error.message : ''
  return /route\s+not\s+found|not\s+found|method\s+not\s+allowed/i.test(message)
}

const normalizeSessionPlayer = (player?: RemoteSessionPlayer): ManagedSessionPlayer => ({
  avatarUrl: normalizeManagedAvatarPath(player?.avatarUrl),
  clearedCount: Math.max(0, Number(player?.clearedCount) || 0),
  debtCount: Math.max(0, Number(player?.debtCount) || 0),
  drinkCount: Math.max(0, Number(player?.drinkCount) || 0),
  meta: player?.meta || '',
  name: player?.name || '',
  profileId: player?.profileId || '',
  status: player?.status || '',
  wheelHistory: Array.isArray(player?.wheelHistory)
    ? player.wheelHistory
        .map((item) => ({
          createdAt: item?.createdAt || '',
          label: item?.label || '',
          text: item?.text || '',
          type: item?.type || '',
        }))
        .filter((item) => item.text)
    : [],
})

const mergeToolDescriptor = async (remoteTool: RemoteToolItem): Promise<ToolDescriptor> => {
  const toolId = resolveToolId(remoteTool.id || remoteTool.rawId || '')
  const imageUrlSource = normalizeManagedAssetPath(remoteTool.imageUrl)
  const heroImageSource = normalizeManagedAssetPath(remoteTool.heroImage)
  const resolvedImage = imageUrlSource ? resolveCachedManagedImagePathQuick(imageUrlSource, 1200) : Promise.resolve('')
  const resolvedHero = heroImageSource ? resolveCachedManagedImagePathQuick(heroImageSource, 1200) : Promise.resolve('')
  const [imageUrl, heroImage] = await Promise.all([resolvedImage, resolvedHero])

  return {
    id: toolId,
    name: remoteTool.name || '',
    categoryId: remoteTool.categoryId || '',
    iconClass: remoteTool.iconClass || '',
    toneClass: remoteTool.toneClass || '',
    imageUrl: imageUrl || imageUrlSource,
    heroImage: heroImage || heroImageSource,
    meta: remoteTool.meta || '',
    placement: remoteTool.placement || '',
    subtitle: remoteTool.target || '',
    summary: remoteTool.meta || '',
    tips: [],
    steps: [],
    mode: (toolId === 'loan-calc' ? 'loan' : toolId) as ToolDescriptor['mode'],
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
        meta: hits.length ? `${hits.length} 个工具 · ${hits.map((item) => item.name).filter(Boolean).slice(0, 3).join(' / ')}` : '',
        imageUrl: hits[0]?.imageUrl || '',
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
        : []
    const tools = remote.tools?.length ? await Promise.all(remote.tools.map(mergeToolDescriptor)) : []
    const useLocalFallback = !tools.length
    const localCatalog = useLocalFallback ? buildLocalToolsCatalog() : null

    const next: ManagedToolCatalog = {
      categories: useLocalFallback ? localCatalog!.categories : categories,
      categoryCards: useLocalFallback ? localCatalog!.categoryCards : buildCategoryCards(tools, categories),
      hero: {
        imageUrl:
          (await resolveCachedManagedImagePathQuick(normalizeManagedAssetPath(remote.hero?.imageUrl), 2000)) ||
          localCatalog?.hero.imageUrl ||
          '',
        subtitle: remote.hero?.subtitle || localCatalog?.hero.subtitle || '',
        title: remote.hero?.title || localCatalog?.hero.title || '',
      },
      popularTools: useLocalFallback
        ? localCatalog!.popularTools
        : remote.popularTools?.length
          ? await Promise.all(remote.popularTools.map(mergeToolDescriptor))
          : tools.slice(0, 4),
      tools: useLocalFallback ? localCatalog!.tools : tools,
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
  return normalizeRemoteLiveSession(remote)
}

const normalizeRemoteLiveSession = (remote: RemoteLiveSession): ManagedLiveSession => {
  const joinedPlayers = remote.joinedPlayers?.length ? remote.joinedPlayers.map(normalizeSessionPlayer) : []
  const joinStatusPlayers = remote.joinStatusPlayers?.length ? remote.joinStatusPlayers.map(normalizeSessionPlayer) : []

  return {
    endedAt: remote.endedAt || remote.finishedAt || '',
    firstPhotoUploadedAt: remote.firstPhotoUploadedAt || '',
    hasFirstPhoto: remote.hasFirstPhoto === true || Boolean(remote.firstPhotoUploadedAt),
    hostAvatarUrl: normalizeManagedAvatarPath(remote.hostAvatarUrl),
    hostName: remote.hostName || '',
    hostProfileId: remote.hostProfileId || '',
    id: remote.id || '',
    inviteCode: remote.inviteCode || '',
    isActiveForResume: remote.isActiveForResume === true,
    joinedCount: Number(remote.joinedCount) || 0,
    joinedPlayers,
    joinStatusPlayers,
    playerCount: Number(remote.playerCount) || 0,
    sessionName: remote.sessionName || '',
    source: remote.source || '',
    stateText: remote.stateText || '',
    status: remote.status || '',
    subtitle: remote.subtitle || '',
    templateImageUrl: normalizeManagedAssetPath(remote.templateImageUrl),
    templateName: remote.templateName || '',
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

export const kickManagedSessionMember = async (sessionId: string, profileId: string): Promise<ManagedLiveSession> =>
  normalizeRemoteLiveSession(
    await requestJson<RemoteLiveSession>(
      `/sessions/${encodeURIComponent(sessionId)}/members/${encodeURIComponent(profileId)}/kick`,
      'POST',
    ),
  )

export const createManagedSession = async (payload: ManagedSessionMutationPayload): Promise<ManagedLiveSession> => {
  return normalizeRemoteLiveSession(await requestJson<RemoteLiveSession>('/sessions', 'POST', payload as Record<string, unknown>))
}

export const updateManagedSession = async (sessionId: string, payload: ManagedSessionMutationPayload): Promise<void> => {
  if (!sessionId) {
    return
  }

  await requestJson(`/sessions/${encodeURIComponent(sessionId)}`, 'PUT', payload as Record<string, unknown>)
}

const normalizeSessionFinishResult = (result?: RemoteSessionFinishResult, sessionId = ''): ManagedSessionFinishResult => {
  const endedAt = result?.endedAt || result?.finishedAt || result?.updatedAt || ''
  return {
    endedAt,
    sessionId: result?.sessionId || result?.id || sessionId,
    state: result?.state || '已结束',
    status: result?.status || '已结束',
    updatedAt: result?.updatedAt || endedAt,
  }
}

export const finishManagedSession = async (sessionId: string): Promise<ManagedSessionFinishResult> => {
  if (!sessionId) {
    return normalizeSessionFinishResult(undefined, '')
  }

  const encodedSessionId = encodeURIComponent(sessionId)
  try {
    return normalizeSessionFinishResult(await requestJson<RemoteSessionFinishResult>(`/sessions/${encodedSessionId}/end`, 'POST'), sessionId)
  } catch (primaryError) {
    if (!isRouteFallbackError(primaryError)) {
      throw primaryError
    }
    try {
      return normalizeSessionFinishResult(await requestJson<RemoteSessionFinishResult>(`/sessions/${encodedSessionId}/finish`, 'POST'), sessionId)
    } catch (legacyError) {
      if (!isRouteFallbackError(legacyError)) {
        throw legacyError
      }
      return normalizeSessionFinishResult(
        await requestJson<RemoteSessionFinishResult>(`/sessions/${encodedSessionId}`, 'PUT', { state: '已结束', status: '已结束' }),
        sessionId,
      )
    }
  }
}

export const deleteManagedSession = async (sessionId: string): Promise<void> => {
  if (!sessionId) {
    return
  }

  await requestJson(`/sessions/${encodeURIComponent(sessionId)}`, 'DELETE')
}

const normalizeManagedReport = (report?: RemoteManagedReport): ManagedReportDetail => ({
  createdAt: report?.createdAt || '',
  events: Array.isArray(report?.events) ? report.events.map((item) => ({ text: item?.text || '' })).filter((item) => item.text) : [],
  id: report?.id || '',
  imageUrl: report?.imageUrl || '',
  inviteCode: report?.inviteCode || '',
  playerCount: Number(report?.playerCount) || 0,
  ranks: Array.isArray(report?.ranks)
    ? report.ranks.map((item) => ({
        avatarUrl: normalizeManagedAvatarPath(item?.avatarUrl),
        name: item?.name || '',
        title: item?.title || '',
        value: item?.value || '',
      }))
    : [],
  replayRate: report?.replayRate || '',
  scene: report?.scene || '',
  sessionId: report?.sessionId || '',
  sessionName: report?.sessionName || '',
  shareRate: report?.shareRate || '',
  status: report?.status || '',
  subtitle: report?.subtitle || '',
  templateName: report?.templateName || '',
  title: report?.title || '',
})

const normalizeUsageConsent = (value?: Partial<ManagedMomentUsageConsent>): ManagedMomentUsageConsent => ({
  brief: value?.brief !== false,
  ranking: value?.ranking !== false,
  session: value?.session !== false,
  share: value?.share !== false,
})

const resolveRemoteMomentImageUrl = (item?: RemoteMomentRecord) =>
  normalizeManagedAssetPath(
    item?.imageUrl ||
    item?.thumbnailUrl ||
    item?.photoUrl ||
    item?.mediaUrl ||
    item?.assetUrl ||
    item?.coverImageUrl ||
    item?.url,
  )

const resolveRemoteMomentCoverImageUrl = (item?: RemoteMomentRecord) =>
  normalizeManagedAssetPath(item?.coverImageUrl || item?.thumbnailUrl || item?.imageUrl || item?.photoUrl || item?.url)

const normalizeMomentRecord = (item?: RemoteMomentRecord): ManagedMomentRecord => {
  const mediaType = item?.mediaType === 'video' ? 'video' : 'image'
  const coverImageUrl = resolveRemoteMomentCoverImageUrl(item)
  return {
    caption: item?.caption || '',
    completionStatus: item?.completionStatus || 'draft',
    coverImageUrl,
    createdAt: item?.createdAt || '',
    duration: Number(item?.duration) || 0,
    id: item?.id || '',
    imageUrl: mediaType === 'video' ? coverImageUrl : resolveRemoteMomentImageUrl(item),
    isTimelinePlaceholder: Boolean(item?.isTimelinePlaceholder),
    mediaType,
    moderationCheckedAt: item?.moderationCheckedAt || '',
    moderationLabel: item?.moderationLabel || '',
    moderationReason: item?.moderationReason || '',
    moderationScore: Number(item?.moderationScore) || 0,
    moderationSuggestion: item?.moderationSuggestion || '',
    nodeKind: 'moment',
    nodeType: item?.nodeType || 'highlight',
    rankingEligible: Boolean(item?.rankingEligible),
    reviewStatus: (item?.reviewStatus as ManagedMomentReviewStatus) || 'pending',
    rewardEligible: Boolean(item?.rewardEligible),
    secondaryReviewStatus: (item?.secondaryReviewStatus as ManagedMomentSecondaryReviewStatus) || 'pending',
    sessionId: item?.sessionId || '',
    tags: Array.isArray(item?.tags) ? item.tags.filter(Boolean) : [],
    timelineTitle: item?.timelineTitle || '',
    updatedAt: item?.updatedAt || item?.createdAt || '',
    uploaderAvatarUrl: normalizeManagedAvatarPath(item?.uploaderAvatarUrl),
    uploaderName: item?.uploaderName || '',
    uploaderProfileId: item?.uploaderProfileId || '',
    usageConsent: normalizeUsageConsent(item?.usageConsent),
    videoUrl: normalizeManagedAssetPath(item?.videoUrl),
    visibility: (item?.visibility as ManagedMomentVisibility) || 'session',
    visibleProfileIds: Array.isArray(item?.visibleProfileIds) ? item.visibleProfileIds.filter(Boolean) : [],
  }
}

const normalizeSessionEventRecord = (item?: RemoteSessionEventRecord): ManagedSessionEventRecord => ({
  caption: item?.caption || '',
  clientEventId: item?.clientEventId || '',
  createdAt: item?.createdAt || '',
  eventType: item?.eventType || 'drink_debt',
  id: item?.id || '',
  nodeKind: 'event',
  operatorAvatarUrl: normalizeManagedAvatarPath(item?.operatorAvatarUrl),
  operatorName: item?.operatorName || '',
  operatorProfileId: item?.operatorProfileId || '',
  scoreDelta: Number(item?.scoreDelta) || 0,
  sessionId: item?.sessionId || '',
  syncStatus: item?.syncStatus || '',
  targetAvatarUrl: normalizeManagedAvatarPath(item?.targetAvatarUrl),
  targetName: item?.targetName || '',
  targetProfileId: item?.targetProfileId || '',
  updatedAt: item?.updatedAt || item?.createdAt || '',
})

const normalizeTimelineNode = (item?: RemoteMomentRecord | RemoteSessionEventRecord): ManagedTimelineNode =>
  item?.kind === 'event' || item?.nodeKind === 'event' ? normalizeSessionEventRecord(item) : normalizeMomentRecord(item as RemoteMomentRecord)

const normalizeSessionTimeline = (timeline?: RemoteSessionTimeline): ManagedSessionTimeline => ({
  nodes: Array.isArray(timeline?.nodes) ? timeline.nodes.map(normalizeTimelineNode) : [],
  pendingMediaCount: Number(timeline?.pendingMediaCount) || 0,
  sessionId: timeline?.sessionId || '',
})

const normalizeContractRecord = (value?: Record<string, unknown>): ManagedContractRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {}

const normalizeContractRecords = (value?: Array<Record<string, unknown>>): ManagedContractRecord[] =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === 'object' && !Array.isArray(item)).map((item) => ({ ...item })) : []

const buildTimelineNodesFromCleanBrief = (brief?: RemoteSessionBrief): ManagedTimelineNode[] => {
  const sessionId = brief?.sessionId || brief?.partyId || ''
  const photos = Array.isArray(brief?.photoHighlights)
    ? brief.photoHighlights.map((item, index) =>
        normalizeMomentRecord({
          caption: String(item.caption || item.meta || ''),
          completionStatus: 'complete',
          createdAt: String(item.capturedAt || item.createdAt || brief?.createdAt || brief?.generatedAt || ''),
          id: String(item.id || item.photoId || item.nodeId || `clean-photo-${index + 1}`),
          imageUrl: String(item.imageUrl || ''),
          nodeType: (String(item.photoType || item.nodeType || 'highlight') as ManagedMomentNodeType) || 'highlight',
          rankingEligible: true,
          reviewStatus: 'approved',
          secondaryReviewStatus: 'approved',
          sessionId,
          timelineTitle: String(item.title || item.label || '聚会照片'),
          updatedAt: String(item.updatedAt || item.capturedAt || brief?.updatedAt || brief?.generatedAt || ''),
          uploaderName: String(item.uploaderName || ''),
          usageConsent: { brief: true, ranking: true, session: true, share: true },
          visibility: 'share',
        }),
      ).filter((item) => item.imageUrl)
    : []

  const events = Array.isArray(brief?.keyEvents)
    ? brief.keyEvents.map((item, index) =>
        normalizeSessionEventRecord({
          caption: String(item.meta || item.text || item.summary || item.caption || ''),
          clientEventId: String(item.id || item.eventId || `clean-event-${index + 1}`),
          createdAt: String(item.time || item.createdAt || brief?.createdAt || brief?.generatedAt || ''),
          eventType: String(item.eventType || item.type || 'drink_add') as ManagedSessionEventType,
          id: String(item.id || item.eventId || `clean-event-${index + 1}`),
          operatorName: String(item.operatorName || ''),
          scoreDelta: Number(item.scoreDelta) || 0,
          sessionId,
          targetName: String(item.title || item.label || item.targetName || '聚会事件'),
          updatedAt: String(item.updatedAt || item.time || item.createdAt || brief?.updatedAt || brief?.generatedAt || ''),
        }),
      )
    : []

  return [...photos, ...events]
}

const normalizeSessionBrief = (brief?: RemoteSessionBrief): ManagedSessionBrief => ({
  accountingHighlights: normalizeContractRecords(brief?.accountingHighlights),
  closingMomentIds: Array.isArray(brief?.closingMomentIds) ? brief.closingMomentIds.filter(Boolean) : [],
  coverMode: brief?.coverMode || 'opening_collage',
  createdAt: brief?.createdAt || brief?.generatedAt || '',
  eventHighlights: normalizeContractRecords(brief?.eventHighlights || brief?.keyEvents),
  id: brief?.id || brief?.briefId || '',
  ledgerRankings: normalizeContractRecord(brief?.ledgerRankings),
  ledgerSummary: normalizeContractRecord(brief?.ledgerSummary),
  openingMomentIds: Array.isArray(brief?.openingMomentIds) ? brief.openingMomentIds.filter(Boolean) : [],
  rankingEligible: Boolean(brief?.rankingEligible),
  sessionId: brief?.sessionId || brief?.partyId || '',
  sessionName: brief?.sessionName || brief?.title || '',
  settlementSummary: normalizeContractRecord(brief?.settlementSummary),
  shareContentFilter: normalizeContractRecord(brief?.shareContentFilter),
  shareImageStatus: brief?.shareImageStatus || '',
  shareImageTaskId: brief?.shareImageTaskId || '',
  pendingMediaCount: Number(brief?.timeline?.pendingMediaCount) || 0,
  timeline: brief?.timeline
    ? normalizeSessionTimeline(brief.timeline)
    : {
        nodes: buildTimelineNodesFromCleanBrief(brief),
        pendingMediaCount: 0,
        sessionId: brief?.sessionId || brief?.partyId || '',
      },
  timelineNodeIds: Array.isArray(brief?.timelineNodeIds) ? brief.timelineNodeIds.filter(Boolean) : [],
  title: brief?.title || '',
  subtitle: brief?.subtitle || '',
  updatedAt: brief?.updatedAt || brief?.generatedAt || brief?.createdAt || '',
})

const normalizeShareImageTask = (task?: RemoteShareImageTask): ManagedShareImageTask => ({
  briefId: task?.briefId || '',
  createdAt: task?.createdAt || '',
  failedReason: task?.failedReason || task?.failureReason || task?.message || '',
  finishedAt: task?.finishedAt || '',
  id: task?.id || task?.shareImageId || '',
  imageUrl: normalizeManagedAssetPath(task?.imageUrl),
  includeLedger: task?.includeLedger === true,
  ledgerIncluded: task?.ledgerIncluded === true || task?.includeLedger === true,
  layoutMode: task?.layoutMode || task?.renderMode || 'timeline',
  miniProgramQrUrl: normalizeManagedAssetPath(task?.miniProgramQrUrl),
  qrCodeUrl: normalizeManagedAssetPath(task?.qrCodeUrl),
  rendererVersion: task?.rendererVersion || '',
  retryCount: Number(task?.retryCount) || 0,
  selectedNodeIds: Array.isArray(task?.selectedNodeIds) ? task.selectedNodeIds.filter(Boolean) : [],
  sessionId: task?.sessionId || task?.partyId || '',
  startedAt: task?.startedAt || '',
  status: task?.status || 'pending',
  updatedAt: task?.updatedAt || task?.createdAt || '',
})

const normalizeShareImageSummary = (task?: RemoteShareImageTask): ManagedShareImageSummary => {
  const imageUrl = normalizeManagedAssetPath(task?.readyShareImageUrl || task?.imageUrl || task?.posterImageUrl)
  return {
    briefId: task?.briefId || '',
    createdAt: task?.createdAt || '',
    finishedAt: task?.finishedAt || '',
    id: task?.taskId || task?.id || task?.shareImageId || '',
    imageUrl,
    readyShareImageUrl: normalizeManagedAssetPath(task?.readyShareImageUrl) || imageUrl,
    sessionId: task?.sessionId || task?.partyId || '',
    sessionName: task?.sessionName || '',
    subtitle: task?.subtitle || '',
    status: task?.status || 'ready',
    updatedAt: task?.updatedAt || task?.finishedAt || task?.createdAt || '',
  }
}

const RANKING_CATEGORIES: ManagedRankingCategory[] = [
  'today_funny',
  'today_debt',
  'today_highlight',
  'today_visual',
  'best_opening',
  'best_closing',
]

const normalizeRankingCategory = (category?: string): ManagedRankingCategory =>
  RANKING_CATEGORIES.includes(category as ManagedRankingCategory) ? (category as ManagedRankingCategory) : 'today_highlight'

const normalizeRankingItem = (item?: RemoteRankingItem): ManagedRankingItem => ({
  category: normalizeRankingCategory(item?.category),
  latestNominationAt: item?.latestNominationAt || '',
  moment: normalizeMomentRecord(item?.moment),
  nominationCount: Number(item?.nominationCount) || 0,
  pointsTotal: Number(item?.pointsTotal) || 0,
  rank: Number(item?.rank) || 0,
  score: Number(item?.score) || 0,
})

const normalizeTodayRanking = (ranking?: RemoteTodayRanking): ManagedTodayRanking => ({
  category: normalizeRankingCategory(ranking?.category),
  date: ranking?.date || '',
  items: Array.isArray(ranking?.items) ? ranking.items.map(normalizeRankingItem) : [],
})

const normalizeMomentNominationEligibility = (eligibility?: RemoteMomentNominationEligibility): ManagedMomentNominationEligibility => ({
  alreadyNominatedToday: Boolean(eligibility?.alreadyNominatedToday),
  category: normalizeRankingCategory(eligibility?.category),
  eligible: Boolean(eligibility?.eligible),
  momentId: eligibility?.momentId || '',
  pointsCost: Number(eligibility?.pointsCost) || 0,
  reason: eligibility?.reason || '',
  reasonCode: eligibility?.reasonCode || '',
  reasonText: eligibility?.reasonText || '',
})

const normalizeMomentNomination = (nomination?: RemoteMomentNomination): ManagedMomentNomination => ({
  category: normalizeRankingCategory(nomination?.category),
  clientNominationId: nomination?.clientNominationId || '',
  createdAt: nomination?.createdAt || '',
  id: nomination?.id || '',
  momentId: nomination?.momentId || '',
  pointsSpent: Number(nomination?.pointsSpent) || 0,
  profileId: nomination?.profileId || '',
  profileName: nomination?.profileName || '',
  refundedAt: nomination?.refundedAt || '',
  sessionId: nomination?.sessionId || '',
  status: nomination?.status || '',
  updatedAt: nomination?.updatedAt || '',
})

export const createManagedReport = async (payload: Record<string, unknown>): Promise<ManagedReportDetail> => {
  const report = normalizeManagedReport(await requestJson<RemoteManagedReport>('/reports', 'POST', payload))
  invalidateManagedReportHistoryCache()
  return report
}

export const getManagedReport = async (reportId: string): Promise<ManagedReportDetail> =>
  normalizeManagedReport(await requestJson<RemoteManagedReport>(`/reports/${encodeURIComponent(reportId)}`))

export const getManagedReportHistory = async (mode = 'all'): Promise<ManagedReportSummary[]> => {
  const normalizedMode = ['host', 'joined', 'unshared', 'all'].includes(mode) ? mode : 'all'
  if (reportHistoryCache && reportHistoryCache.key === normalizedMode && reportHistoryCache.expiresAt > Date.now()) {
    return reportHistoryCache.value
  }

  const reports = await requestJson<RemoteManagedReport[]>(`/reports/history?mode=${encodeURIComponent(normalizedMode)}`)
  const next: ManagedReportSummary[] = await Promise.all(
    reports.map(async (item) => ({
      createdAt: item.createdAt || '',
      hostName: item.hostName || '',
      hostProfileId: item.hostProfileId || '',
      id: item.id || '',
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(item.imageUrl))) || '',
      meta: item.meta || '',
      recordType: item.recordType === 'session' ? ('session' as const) : ('report' as const),
      reportId: item.reportId || (item.recordType === 'report' ? item.id || '' : ''),
      role: item.role === 'host' ? 'host' : 'member',
      sessionId: item.sessionId || '',
      sessionName: item.sessionName || '',
      subtitle: item.subtitle || '',
      shareRate: item.shareRate || '',
      status: item.status || '',
      templateName: item.templateName || '',
      title: item.title || item.sessionName || '',
    })),
  )

  reportHistoryCache = {
    expiresAt: Date.now() + REPORT_HISTORY_CACHE_TTL,
    key: normalizedMode,
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
      bestOpenRate: remote.performance?.bestOpenRate || '',
      bestReturnRate: remote.performance?.bestReturnRate || '',
    },
    poster: {
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remote.poster?.imageUrl))) || '',
      title: remote.poster?.title || '',
    },
    preview: {
      imageUrl:
        (await resolveCachedManagedImagePath(normalizeManagedAssetPath(remote.preview?.imageUrl))) || '',
      inviteCode: remote.preview?.inviteCode || '',
      title: remote.preview?.title || '',
    },
    shareItems: Array.isArray(remote.shareItems)
      ? remote.shareItems.map((item) => ({
          iconClass: item?.iconClass || '',
          id: item?.id || '',
          name: item?.name || '',
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

export const getManagedQuestionBank = async (type = ''): Promise<ManagedQuestionItem[]> => {
  const query = type ? `?type=${encodeURIComponent(type)}` : ''
  const remote = await requestJson<RemoteQuestionCatalog>(`/questions/catalog${query}`)
  return Array.isArray(remote.questions)
    ? remote.questions.map((item, index) => ({
        difficulty: item?.difficulty || '',
        id: item?.id || `question-${index + 1}`,
        riskLevel: item?.riskLevel || '',
        tag: item?.tag || '',
        template: item?.template || '',
        text: item?.text || '',
        type: item?.type || '',
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
          iconClass: item?.iconClass || '',
          name: item?.name || '',
          toneClass: item?.toneClass || '',
        }))
      : [],
    notice: remote.notice || '',
    safeBack: Array.isArray(remote.safeBack)
      ? remote.safeBack.map((item) => ({
          iconClass: item?.iconClass || '',
          name: item?.name || '',
          toneClass: item?.toneClass || '',
        }))
      : [],
    shops: Array.isArray(remote.shops)
      ? await Promise.all(remote.shops.map(async (item) => ({
          id: item?.id || '',
          imageUrl:
            (await resolveCachedManagedImagePath(normalizeManagedAssetPath(item?.imageUrl))) || '',
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
    unsharedReportCount: Number(remote.unsharedReportCount) || 0,
  }
}

export const isToolVisibleInPlacement = (tool: Pick<ToolDescriptor, 'placement'>, placement: 'home' | 'tools') => {
  const normalized = String(tool.placement || 'tools').trim().toLowerCase()
  return normalized === 'both' || normalized === placement
}

export const recordManagedToolUsage = async (toolId: string): Promise<void> => {
  const id = resolveToolId(toolId)
  if (!id) {
    return
  }
  await requestJson('/tools/history', 'POST', { id }).catch(() => undefined)
}

export const uploadManagedMomentImage = async (payload: {
  dataUrl: string
  fileName: string
  sessionId: string
}): Promise<ManagedMomentUploadResult> =>
  requestJson<ManagedMomentUploadResult>('/moments/uploads/image', 'POST', payload)

export const uploadManagedMomentVideo = async (payload: {
  coverDataUrl: string
  duration: number
  fileName: string
  filePath: string
  sessionId: string
}): Promise<ManagedMomentUploadResult> =>
  uploadFileRequest<ManagedMomentUploadResult>('/moments/uploads/video', payload.filePath, {
    coverDataUrl: payload.coverDataUrl,
    duration: String(payload.duration || 5),
    fileName: payload.fileName,
    sessionId: payload.sessionId,
  })

export const cleanupManagedMomentUpload = async (assetId: string): Promise<{ assetId: string; removed: boolean }> =>
  requestJson<{ assetId: string; removed: boolean }>(`/moments/uploads/${encodeURIComponent(assetId)}`, 'DELETE')

export const createManagedMoment = async (
  sessionId: string,
  payload: ManagedMomentPayload,
): Promise<ManagedMomentRecord> =>
  normalizeMomentRecord(
    await requestJson<RemoteMomentRecord>(`/sessions/${encodeURIComponent(sessionId)}/moments`, 'POST', payload as unknown as Record<string, unknown>),
  )

export const updateManagedMoment = async (
  momentId: string,
  payload: ManagedMomentPayload,
): Promise<ManagedMomentRecord> =>
  normalizeMomentRecord(
    await requestJson<RemoteMomentRecord>(`/moments/${encodeURIComponent(momentId)}`, 'PUT', payload as unknown as Record<string, unknown>),
  )

export const deleteManagedMoment = async (momentId: string): Promise<{ id: string; removed: boolean }> =>
  requestJson<{ id: string; removed: boolean }>(`/moments/${encodeURIComponent(momentId)}`, 'DELETE')

export const getManagedSessionTimeline = async (sessionId: string): Promise<ManagedSessionTimeline> =>
  normalizeSessionTimeline(await requestJson<RemoteSessionTimeline>(`/sessions/${encodeURIComponent(sessionId)}/timeline`))

export const createManagedSessionEvent = async (
  sessionId: string,
  payload: ManagedSessionEventPayload,
): Promise<ManagedSessionEventRecord> =>
  normalizeSessionEventRecord(
    await requestJson<RemoteSessionEventRecord>(`/sessions/${encodeURIComponent(sessionId)}/events`, 'POST', payload as unknown as Record<string, unknown>),
  )

export const createOrRefreshManagedSessionBrief = async (sessionId: string): Promise<ManagedSessionBrief> =>
  normalizeSessionBrief(await requestJson<RemoteSessionBrief>(`/sessions/${encodeURIComponent(sessionId)}/brief`, 'POST'))

export const getManagedSessionBrief = async (briefId: string): Promise<ManagedSessionBrief> => {
  try {
    return normalizeSessionBrief(await requestJson<RemoteSessionBrief>(`/session-briefs/${encodeURIComponent(briefId)}`))
  } catch (rawError) {
    if (!isRouteFallbackError(rawError)) {
      throw rawError
    }
    return normalizeSessionBrief(await requestJson<RemoteSessionBrief>(`/briefs/${encodeURIComponent(briefId)}`))
  }
}

export const createManagedShareImageTask = async (
  briefId: string,
  payload: { includeLedger?: boolean; layoutMode?: string; rendererVersion?: string; selectedNodeIds?: string[] } = {},
): Promise<ManagedShareImageTask> => {
  try {
    return normalizeShareImageTask(
      await requestJson<RemoteShareImageTask>(`/briefs/${encodeURIComponent(briefId)}/share-images`, 'POST', payload),
    )
  } catch (cleanError) {
    if (!isRouteFallbackError(cleanError)) {
      throw cleanError
    }
    try {
      return normalizeShareImageTask(
        await requestJson<RemoteShareImageTask>(`/session-briefs/${encodeURIComponent(briefId)}/share-image-tasks`, 'POST', payload),
      )
    } catch {
      throw cleanError
    }
  }
}

export const getManagedShareImageTask = async (taskId: string): Promise<ManagedShareImageTask> => {
  try {
    return normalizeShareImageTask(await requestJson<RemoteShareImageTask>(`/share-images/${encodeURIComponent(taskId)}`))
  } catch (cleanError) {
    if (!isRouteFallbackError(cleanError)) {
      throw cleanError
    }
    try {
      return normalizeShareImageTask(await requestJson<RemoteShareImageTask>(`/share-image-tasks/${encodeURIComponent(taskId)}`))
    } catch {
      throw cleanError
    }
  }
}

export const processManagedShareImageTask = async (taskId: string): Promise<ManagedShareImageTask> => {
  try {
    return normalizeShareImageTask(await requestJson<RemoteShareImageTask>(`/share-images/${encodeURIComponent(taskId)}/process`, 'POST'))
  } catch (cleanError) {
    if (!isRouteFallbackError(cleanError)) {
      throw cleanError
    }
    try {
      return normalizeShareImageTask(await requestJson<RemoteShareImageTask>(`/share-image-tasks/${encodeURIComponent(taskId)}/process`, 'POST'))
    } catch {
      throw cleanError
    }
  }
}

export const retryManagedShareImageTask = async (taskId: string): Promise<ManagedShareImageTask> =>
  {
    try {
      return normalizeShareImageTask(await requestJson<RemoteShareImageTask>(`/share-images/${encodeURIComponent(taskId)}/retry`, 'POST'))
    } catch (cleanError) {
      if (!isRouteFallbackError(cleanError)) {
        throw cleanError
      }
      try {
        return normalizeShareImageTask(await requestJson<RemoteShareImageTask>(`/share-image-tasks/${encodeURIComponent(taskId)}/retry`, 'POST'))
      } catch {
        throw cleanError
      }
    }
  }

export const getManagedTodayRanking = async (
  category: ManagedRankingCategory = 'today_highlight',
  limit = 20,
): Promise<ManagedTodayRanking> =>
  normalizeTodayRanking(
    await requestJson<RemoteTodayRanking>(
      `/rankings/today?category=${encodeURIComponent(category)}&limit=${encodeURIComponent(String(limit))}`,
    ),
  )

export const getManagedMomentNominationEligibility = async (
  momentId: string,
  category?: ManagedRankingCategory,
): Promise<ManagedMomentNominationEligibility> => {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return normalizeMomentNominationEligibility(
    await requestJson<RemoteMomentNominationEligibility>(`/moments/${encodeURIComponent(momentId)}/nomination-eligibility${query}`),
  )
}

export const createManagedMomentNomination = async (
  momentId: string,
  payload: {
    category?: ManagedRankingCategory
    clientNominationId?: string
  } = {},
): Promise<ManagedMomentNomination> =>
  normalizeMomentNomination(
    await requestJson<RemoteMomentNomination>(
      `/moments/${encodeURIComponent(momentId)}/nominations`,
      'POST',
      payload as Record<string, unknown>,
    ),
  )

export const getManagedSessionMomentSummaries = async (): Promise<ManagedSessionMomentSummary[]> => {
  const remote = await requestJson<RemoteSessionMomentSummary[]>('/user/session-moment-summaries')
  return Array.isArray(remote)
    ? remote.map((item) => ({
        briefId: item?.briefId || '',
        canResume: item?.canResume === true,
        canResumeMomentIds: Array.isArray(item?.canResumeMomentIds) ? item.canResumeMomentIds.filter(Boolean) : [],
        canShare: item?.canShare === true,
        coverPhotoUrl: normalizeManagedAssetPath(item?.coverPhotoUrl || item?.coverImageUrl),
        createdAt: item?.createdAt || '',
        endedAt: item?.endedAt || '',
        firstPhotoUploadedAt: item?.firstPhotoUploadedAt || '',
        hasFirstPhoto: item?.hasFirstPhoto === true || Boolean(item?.firstPhotoUploadedAt || item?.coverPhotoUrl || item?.coverImageUrl),
        isActiveForResume: item?.isActiveForResume === true,
        pendingMediaCount: Number(item?.pendingMediaCount) || 0,
        rankingEntryEnabled: Boolean(item?.rankingEntryEnabled),
        readyShareImageUrl: normalizeManagedAssetPath(item?.readyShareImageUrl),
        reportId: item?.reportId || '',
        sessionId: item?.sessionId || '',
        sessionName: item?.sessionName || '',
        subtitle: item?.subtitle || '',
        shareImageStatus: item?.shareImageStatus || '',
        shareImageTaskId: item?.shareImageTaskId || '',
        shareImageUrl: normalizeManagedAssetPath(item?.shareImageUrl),
        state: item?.state || '',
        stateText: item?.stateText || '',
        status: item?.status || '',
        title: item?.title || '',
        updatedAt: item?.updatedAt || '',
      }))
    : []
}

export const getManagedShareImageSummaries = async (): Promise<ManagedShareImageSummary[]> => {
  const remote = await requestJson<RemoteShareImageTask[]>('/user/share-image-summaries')
  return Array.isArray(remote)
    ? remote
        .map(normalizeShareImageSummary)
        .filter((item) => item.status === 'ready' && Boolean(item.imageUrl || item.readyShareImageUrl))
    : []
}
