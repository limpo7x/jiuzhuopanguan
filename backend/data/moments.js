const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { getAdminStore, getManagedSessionById, listManagedReports, markManagedSessionFirstPhotoUploaded } = require('./admin')
const { createDefaultUserCommerceState, readContentStore, writeContentStore } = require('./content')
const { listProfiles } = require('./social')
const { createStoreAccessor } = require('./store-accessor')
const { deleteObject, putObject, readObjectForRender } = require('./object-storage')

const storePath = path.join(__dirname, 'moments-store.json')
const momentsUploadRoot = path.join(__dirname, '..', 'public', 'uploads', 'moments')
const shareImageOutputRoot = path.join(momentsUploadRoot, 'share-tasks')
const sharePosterLongBgPath = path.join(__dirname, '..', '..', 'miniprogram', 'assets', 'party-recorder', 'party-recorder-share-long-bg.webp')
const staticShareMiniappQrCandidates = [
  path.join(__dirname, '..', '..', 'miniprogram', 'assets', 'home', 'share-miniapp-qr.png'),
  path.join(__dirname, '..', '..', 'miniprogram', 'assets', 'share', 'share-poster-miniapp-code.png'),
  path.join(__dirname, '..', '..', 'miniprogram', 'pages', 'share-poster', 'assets', 'share', 'share-poster-miniapp-code.png'),
]
const MAX_MOMENT_IMAGE_BYTES = 5 * 1024 * 1024
const MOMENT_IMAGE_WIDTH = 1800
const MOMENT_IMAGE_HEIGHT = 1800
const MOMENT_IMAGE_QUALITY = 84
const SHARE_IMAGE_WIDTH = 900
const SHARE_IMAGE_MIN_HEIGHT = 1400
const DEFAULT_MINI_PROGRAM_QR_URL = '/static/share-miniapp-qr.png'

const IMAGE_MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const NODE_TYPES = new Set(['opening', 'highlight', 'drinking', 'private', 'closing'])
const MEDIA_TYPES = new Set(['image'])
const VISIBILITIES = new Set(['private', 'selected', 'session', 'share', 'featured'])
const EVENT_TYPES = new Set(['drink_debt', 'drink_add', 'wheel_result'])
const SHARE_TASK_STATUSES = new Set(['pending', 'processing', 'ready', 'failed', 'expired'])
const RANKING_CATEGORIES = new Set(['today_funny', 'today_debt', 'today_highlight', 'today_visual', 'best_opening', 'best_closing'])
const DEFAULT_NOMINATION_POINTS = 10

const nowIso = () => new Date().toISOString()

const createId = (prefix) => `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

const cleanText = (value = '') => String(value || '').trim()
const isEndedSessionState = (value = '') => cleanText(value).includes('结束')
const resolveFirstExistingPath = (...candidatePaths) => candidatePaths.find((candidatePath) => fs.existsSync(candidatePath)) || ''
const defaultMiniProgramQrLocalPath = resolveFirstExistingPath(...staticShareMiniappQrCandidates)
const getMiniProgramQrUrl = (task = {}) => cleanText(task.miniProgramQrUrl || task.qrCodeUrl) || DEFAULT_MINI_PROGRAM_QR_URL

const trimText = (value = '', maxLength = 20) => {
  const text = cleanText(value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

const escapeXml = (value = '') =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const normalizeStringArray = (value) =>
  (Array.isArray(value) ? value : String(value || '').split(/[,\s，、]+/))
    .map((item) => cleanText(item))
    .filter(Boolean)

const normalizeUsageConsent = (value = {}) => ({
  session: value.session !== false,
  brief: value.brief !== false,
  share: value.share !== false,
  ranking: value.ranking !== false,
})

const createDefaultStore = () => ({
  momentRecords: [],
  sessionEvents: [],
  sessionBriefs: [],
  shareImageTasks: [],
  momentReports: [],
  momentNominations: [],
  rankingRewardPayouts: [],
  rankingRewardRules: [],
  uploadedAssets: [],
})

const normalizeMomentRecord = (item = {}) => {
  const nodeType = NODE_TYPES.has(cleanText(item.nodeType)) ? cleanText(item.nodeType) : 'highlight'
  const mediaType = MEDIA_TYPES.has(cleanText(item.mediaType)) ? cleanText(item.mediaType) : 'image'
  const visibility = VISIBILITIES.has(cleanText(item.visibility)) ? cleanText(item.visibility) : 'session'
  const imageUrl = cleanText(item.imageUrl)
  const completionStatus = cleanText(item.completionStatus) || (imageUrl ? 'complete' : 'needs_media')
  const reviewStatus = cleanText(item.reviewStatus) || 'pending'
  const secondaryReviewStatus = cleanText(item.secondaryReviewStatus) || 'pending'
  const usageConsent = normalizeUsageConsent(item.usageConsent)
  const isPrivate = nodeType === 'private' || visibility === 'private' || visibility === 'selected'
  const reviewPass = reviewStatus === 'approved' && secondaryReviewStatus === 'approved'
  const rankingEligible = Boolean(
    item.rankingEligible === true ||
      (completionStatus === 'complete' && usageConsent.ranking && !isPrivate && reviewPass),
  )
  const rewardEligible = Boolean(
    item.rewardEligible === true ||
      (completionStatus === 'complete' && usageConsent.ranking && !isPrivate && reviewPass),
  )
  const createdAt = cleanText(item.createdAt) || nowIso()

  return {
    id: cleanText(item.id) || createId('moment'),
    clientDraftId: cleanText(item.clientDraftId),
    sessionId: cleanText(item.sessionId),
    uploaderProfileId: cleanText(item.uploaderProfileId),
    uploaderName: cleanText(item.uploaderName),
    nodeType,
    mediaType,
    imageUrl,
    videoUrl: cleanText(item.videoUrl),
    coverImageUrl: cleanText(item.coverImageUrl),
    duration: Math.max(0, Number(item.duration) || 0),
    caption: cleanText(item.caption),
    tags: normalizeStringArray(item.tags),
    visibility,
    visibleProfileIds: normalizeStringArray(item.visibleProfileIds),
    timelineTitle: cleanText(item.timelineTitle),
    usageConsent,
    completionStatus,
    reviewStatus,
    secondaryReviewStatus,
    rankingEligible,
    rewardEligible,
    isTimelinePlaceholder: item.isTimelinePlaceholder === true,
    removedAt: cleanText(item.removedAt),
    createdAt,
    updatedAt: cleanText(item.updatedAt) || createdAt,
  }
}

const normalizeSessionEvent = (item = {}) => {
  const eventType = EVENT_TYPES.has(cleanText(item.eventType)) ? cleanText(item.eventType) : 'drink_debt'
  const createdAt = cleanText(item.createdAt) || nowIso()
  return {
    id: cleanText(item.id) || createId('event'),
    clientEventId: cleanText(item.clientEventId),
    sessionId: cleanText(item.sessionId),
    eventType,
    operatorProfileId: cleanText(item.operatorProfileId),
    operatorName: cleanText(item.operatorName),
    targetProfileId: cleanText(item.targetProfileId),
    targetName: cleanText(item.targetName),
    scoreDelta: Number(item.scoreDelta) || 0,
    caption: cleanText(item.caption),
    createdAt,
    updatedAt: cleanText(item.updatedAt) || createdAt,
    syncStatus: cleanText(item.syncStatus) || 'synced',
  }
}

const normalizeSessionBrief = (item = {}) => {
  const createdAt = cleanText(item.createdAt) || nowIso()
  return {
    id: cleanText(item.id) || createId('brief'),
    sessionId: cleanText(item.sessionId),
    title: cleanText(item.title),
    coverMode: cleanText(item.coverMode) || 'opening_collage',
    openingMomentIds: normalizeStringArray(item.openingMomentIds),
    closingMomentIds: normalizeStringArray(item.closingMomentIds),
    timelineNodeIds: normalizeStringArray(item.timelineNodeIds),
    shareImageTaskId: cleanText(item.shareImageTaskId),
    shareImageStatus: cleanText(item.shareImageStatus) || '',
    pendingMediaCount: Math.max(0, Number(item.pendingMediaCount) || 0),
    rankingEligible: item.rankingEligible === true,
    createdAt,
    updatedAt: cleanText(item.updatedAt) || createdAt,
  }
}

const normalizeShareImageTask = (item = {}) => {
  const status = SHARE_TASK_STATUSES.has(cleanText(item.status)) ? cleanText(item.status) : 'pending'
  const layoutMode = cleanText(item.layoutMode) || 'timeline'
  const createdAt = cleanText(item.createdAt) || nowIso()
  return {
    id: cleanText(item.id) || createId('share-task'),
    sessionId: cleanText(item.sessionId),
    briefId: cleanText(item.briefId),
    status,
    layoutMode,
    ledgerIncluded: item.ledgerIncluded === true || item.includeLedger === true || layoutMode === 'dual_flow',
    selectedNodeIds: normalizeStringArray(item.selectedNodeIds),
    imageUrl: cleanText(item.imageUrl),
    objectKey: cleanText(item.objectKey),
    publicUrl: cleanText(item.publicUrl),
    localCompatUrl: cleanText(item.localCompatUrl),
    storageProvider: cleanText(item.storageProvider),
    failedReason: cleanText(item.failedReason),
    retryCount: Math.max(0, Number(item.retryCount) || 0),
    createdAt,
    startedAt: cleanText(item.startedAt),
    finishedAt: cleanText(item.finishedAt),
    updatedAt: cleanText(item.updatedAt) || createdAt,
  }
}

const decorateShareImageTask = (task = {}) => {
  const imageUrl = cleanText(task.imageUrl)
  const miniProgramQrUrl = getMiniProgramQrUrl(task)
  return {
    ...task,
    imageUrl,
    posterImageUrl: cleanText(task.posterImageUrl) || imageUrl,
    readyShareImageUrl: cleanText(task.readyShareImageUrl) || imageUrl,
    miniProgramQrUrl,
    qrCodeUrl: cleanText(task.qrCodeUrl) || miniProgramQrUrl,
  }
}

const normalizeMomentNomination = (item = {}) => {
  const createdAt = cleanText(item.createdAt) || nowIso()
  return {
    id: cleanText(item.id) || createId('nomination'),
    clientNominationId: cleanText(item.clientNominationId),
    momentId: cleanText(item.momentId),
    sessionId: cleanText(item.sessionId),
    profileId: cleanText(item.profileId),
    profileName: cleanText(item.profileName),
    category: RANKING_CATEGORIES.has(cleanText(item.category)) ? cleanText(item.category) : 'today_highlight',
    pointsSpent: Math.max(0, Number(item.pointsSpent) || 0),
    status: cleanText(item.status) || 'active',
    refundedAt: cleanText(item.refundedAt),
    refundReason: cleanText(item.refundReason),
    createdAt,
    updatedAt: cleanText(item.updatedAt) || createdAt,
  }
}

const normalizeRankingRewardPayout = (item = {}) => {
  const createdAt = cleanText(item.createdAt) || nowIso()
  return {
    id: cleanText(item.id) || createId('ranking-reward-payout'),
    sourceId: cleanText(item.sourceId),
    category: RANKING_CATEGORIES.has(cleanText(item.category)) ? cleanText(item.category) : 'today_highlight',
    date: cleanText(item.date) || getTodayYmd(createdAt),
    momentId: cleanText(item.momentId),
    sessionId: cleanText(item.sessionId),
    profileId: cleanText(item.profileId),
    profileName: cleanText(item.profileName),
    rank: Math.max(1, Number(item.rank) || 1),
    points: Math.max(0, Number(item.points) || 0),
    ruleId: cleanText(item.ruleId),
    status: cleanText(item.status) || 'granted',
    operator: cleanText(item.operator),
    createdAt,
    updatedAt: cleanText(item.updatedAt) || createdAt,
  }
}

const normalizeUploadedAsset = (item = {}) => {
  const createdAt = cleanText(item.createdAt) || nowIso()
  return {
    id: cleanText(item.id) || createId('moment-asset'),
    sessionId: cleanText(item.sessionId),
    uploaderProfileId: cleanText(item.uploaderProfileId),
    fileName: cleanText(item.fileName),
    mimeType: cleanText(item.mimeType) || 'image/webp',
    size: Math.max(0, Number(item.size) || 0),
    url: cleanText(item.url),
    objectKey: cleanText(item.objectKey),
    publicUrl: cleanText(item.publicUrl),
    localCompatUrl: cleanText(item.localCompatUrl),
    storageProvider: cleanText(item.storageProvider),
    boundMomentId: cleanText(item.boundMomentId),
    boundAt: cleanText(item.boundAt),
    removedAt: cleanText(item.removedAt),
    cleanupReason: cleanText(item.cleanupReason),
    createdAt,
    updatedAt: cleanText(item.updatedAt) || createdAt,
  }
}

const normalizeStore = (store = {}) => ({
  momentRecords: Array.isArray(store.momentRecords) ? store.momentRecords.map(normalizeMomentRecord) : [],
  sessionEvents: Array.isArray(store.sessionEvents) ? store.sessionEvents.map(normalizeSessionEvent) : [],
  sessionBriefs: Array.isArray(store.sessionBriefs) ? store.sessionBriefs.map(normalizeSessionBrief) : [],
  shareImageTasks: Array.isArray(store.shareImageTasks) ? store.shareImageTasks.map(normalizeShareImageTask) : [],
  momentReports: Array.isArray(store.momentReports) ? store.momentReports : [],
  momentNominations: Array.isArray(store.momentNominations) ? store.momentNominations.map(normalizeMomentNomination) : [],
  rankingRewardPayouts: Array.isArray(store.rankingRewardPayouts) ? store.rankingRewardPayouts.map(normalizeRankingRewardPayout) : [],
  rankingRewardRules: Array.isArray(store.rankingRewardRules) ? store.rankingRewardRules : [],
  uploadedAssets: Array.isArray(store.uploadedAssets) ? store.uploadedAssets.map(normalizeUploadedAsset) : [],
})

const storeAccessor = createStoreAccessor({
  key: 'moments_store',
  filePath: storePath,
  createDefaultStore,
  normalizeStore,
})

const readMomentsStore = () => storeAccessor.read()

const writeMomentsStore = (store) => storeAccessor.write(store)

const getProfileId = (profile = {}) => cleanText(profile.id || profile.profileId)
const buildProfileAvatarMap = () =>
  new Map((listProfiles() || []).map((item) => [cleanText(item.id), cleanText(item.avatarUrl)]).filter((item) => item[0]))
const resolveAvatarUrl = ({ sessionId = '', profileId = '', preferredAvatarUrl = '' } = {}) => {
  const direct = cleanText(preferredAvatarUrl)
  if (direct) {
    return direct
  }
  const normalizedProfileId = cleanText(profileId)
  if (!normalizedProfileId) {
    return ''
  }
  const session = sessionId ? getManagedSessionById(sessionId) : null
  const memberAvatarUrl = cleanText(
    (Array.isArray(session?.members) ? session.members : []).find((item) => cleanText(item?.profileId) === normalizedProfileId)?.avatarUrl,
  )
  if (memberAvatarUrl) {
    return memberAvatarUrl
  }
  return cleanText(buildProfileAvatarMap().get(normalizedProfileId))
}

const getSessionMember = (session = {}, profileId = '') =>
  (Array.isArray(session.members) ? session.members : []).find(
    (item) => cleanText(item?.profileId) === cleanText(profileId),
  ) || null

const assertSession = (sessionId) => {
  const session = getManagedSessionById(cleanText(sessionId))
  if (!session) {
    throw createHttpError('session not found', 404)
  }
  return session
}

const assertSessionMember = (sessionId, profile = {}) => {
  const profileId = getProfileId(profile)
  if (!profileId) {
    throw createHttpError('unauthorized', 401)
  }
  const session = assertSession(sessionId)
  const member = getSessionMember(session, profileId)
  if (!member) {
    throw createHttpError('not session member', 403)
  }
  return { session, member, profileId }
}

const assertSessionHost = (sessionId, profile = {}) => {
  const context = assertSessionMember(sessionId, profile)
  if (!context.member.isHost) {
    throw createHttpError('forbidden', 403)
  }
  return context
}

const isSessionEndedForShareImage = (session = {}) =>
  Boolean(cleanText(session?.endedAt)) ||
  cleanText(session?.state).includes('结束') ||
  cleanText(session?.status).includes('结束')

const assertEndedSessionHostForShareImage = (sessionId, profile = {}) => {
  const context = assertSessionMember(sessionId, profile)
  if (!isSessionEndedForShareImage(context.session)) {
    throw createHttpError('session not ended', 409)
  }
  if (!context.member.isHost) {
    throw createHttpError('forbidden', 403)
  }
  return context
}

const normalizeVisibleProfileIds = ({ session, nodeType, visibility, visibleProfileIds }) => {
  const nextVisibleProfileIds = normalizeStringArray(visibleProfileIds)
  if ((nodeType === 'private' || visibility === 'private' || visibility === 'selected') && !nextVisibleProfileIds.length) {
    throw createHttpError('private moment requires visibleProfileIds', 400)
  }
  const invalidProfileId = nextVisibleProfileIds.find((profileId) => !getSessionMember(session, profileId))
  if (invalidProfileId) {
    throw createHttpError('visibleProfileIds must be session members', 400)
  }
  return nextVisibleProfileIds
}

const isViewerAllowedForMoment = (moment = {}, profileId = '') => {
  if (moment.uploaderProfileId === profileId) {
    return true
  }
  if (moment.visibility === 'private' || moment.visibility === 'selected' || moment.nodeType === 'private') {
    return moment.visibleProfileIds.includes(profileId)
  }
  return true
}

const buildDefaultCaption = (nodeType) => {
  if (nodeType === 'opening') {
    return '今晚开场，先留证'
  }
  if (nodeType === 'closing') {
    return '今晚最后一张，给这局收尾'
  }
  if (nodeType === 'private') {
    return '一条私密爆料'
  }
  return '刚刚这一刻，值得留在时间线'
}

const buildTimelineTitle = (moment = {}) => {
  const name = moment.uploaderName || '有人'
  if (moment.nodeType === 'opening') {
    return `${name} 上传了开场打卡`
  }
  if (moment.nodeType === 'closing') {
    return `${name} 上传了收尾照`
  }
  if (moment.nodeType === 'private') {
    return moment.visibleProfileIds.length > 1 ? `${name} 发送了一条私密爆料` : `${name} 发送了一条私密爆料`
  }
  return `${name} 添加了精彩瞬间`
}

const computeMomentStatus = (moment = {}) => {
  const imageUrl = cleanText(moment.imageUrl)
  const nodeType = cleanText(moment.nodeType)
  const visibility = cleanText(moment.visibility)
  const usageConsent = normalizeUsageConsent(moment.usageConsent)
  const completionStatus = imageUrl ? 'complete' : 'needs_media'
  const isPrivate = nodeType === 'private' || visibility === 'private' || visibility === 'selected'
  const reviewStatus = cleanText(moment.reviewStatus) || 'pending'
  const secondaryReviewStatus = cleanText(moment.secondaryReviewStatus) || 'pending'
  const approved = reviewStatus === 'approved' && secondaryReviewStatus === 'approved'

  return {
    completionStatus,
    rankingEligible: completionStatus === 'complete' && usageConsent.ranking && !isPrivate && approved,
    rewardEligible: completionStatus === 'complete' && usageConsent.ranking && !isPrivate && approved,
  }
}

const serializeMomentForViewer = (moment = {}, profileId = '') => {
  const allowed = isViewerAllowedForMoment(moment, profileId)
  const uploaderAvatarUrl = resolveAvatarUrl({
    sessionId: moment.sessionId,
    profileId: moment.uploaderProfileId,
    preferredAvatarUrl: moment.uploaderAvatarUrl,
  })
  const base = {
    id: moment.id,
    nodeKind: 'moment',
    sessionId: moment.sessionId,
    nodeType: moment.nodeType,
    mediaType: moment.mediaType,
    uploaderProfileId: moment.uploaderProfileId,
    uploaderName: moment.uploaderName,
    uploaderAvatarUrl,
    tags: allowed ? moment.tags : [],
    visibility: allowed ? moment.visibility : 'private',
    timelineTitle: moment.timelineTitle || buildTimelineTitle(moment),
    usageConsent: allowed ? moment.usageConsent : undefined,
    completionStatus: moment.completionStatus,
    reviewStatus: allowed ? moment.reviewStatus : undefined,
    secondaryReviewStatus: allowed ? moment.secondaryReviewStatus : undefined,
    rankingEligible: allowed ? moment.rankingEligible : false,
    rewardEligible: allowed ? moment.rewardEligible : false,
    isTimelinePlaceholder: !allowed,
    createdAt: moment.createdAt,
    updatedAt: moment.updatedAt,
  }
  if (!allowed) {
    return base
  }
  return {
    ...base,
    imageUrl: moment.imageUrl,
    caption: moment.caption,
    visibleProfileIds: moment.visibleProfileIds,
  }
}

const serializeMomentForPublicRanking = (moment = {}) => {
  const viewerMoment = serializeMomentForViewer(moment, moment.uploaderProfileId)
  return {
    id: viewerMoment.id,
    nodeKind: viewerMoment.nodeKind,
    sessionId: viewerMoment.sessionId,
    nodeType: viewerMoment.nodeType,
    mediaType: viewerMoment.mediaType,
    uploaderName: viewerMoment.uploaderName,
    uploaderAvatarUrl: viewerMoment.uploaderAvatarUrl,
    tags: viewerMoment.tags,
    visibility: 'public',
    timelineTitle: viewerMoment.timelineTitle,
    completionStatus: viewerMoment.completionStatus,
    rankingEligible: viewerMoment.rankingEligible,
    createdAt: viewerMoment.createdAt,
    updatedAt: viewerMoment.updatedAt,
    imageUrl: viewerMoment.imageUrl,
    caption: viewerMoment.caption,
  }
}

const serializeEvent = (event = {}) => ({
  ...event,
  operatorAvatarUrl: resolveAvatarUrl({
    sessionId: event.sessionId,
    profileId: event.operatorProfileId,
    preferredAvatarUrl: event.operatorAvatarUrl,
  }),
  targetAvatarUrl: resolveAvatarUrl({
    sessionId: event.sessionId,
    profileId: event.targetProfileId,
    preferredAvatarUrl: event.targetAvatarUrl,
  }),
  nodeKind: 'event',
})

const getTodayYmd = (value = Date.now()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))

const findMomentById = (store, nodeId) =>
  store.momentRecords.find((item) => item.id === cleanText(nodeId) && !item.removedAt) || null

const findEventById = (store, nodeId) => store.sessionEvents.find((item) => item.id === cleanText(nodeId)) || null

const getDefaultRankingCategory = (moment = {}) => {
  if (moment.nodeType === 'opening') return 'best_opening'
  if (moment.nodeType === 'closing') return 'best_closing'
  if (moment.nodeType === 'drinking') return 'today_debt'
  return 'today_highlight'
}

const getRankingCategory = (value, moment = {}) => {
  const category = cleanText(value)
  return RANKING_CATEGORIES.has(category) ? category : getDefaultRankingCategory(moment)
}

const isMomentPublicForRanking = (moment = {}) => {
  const usageConsent = normalizeUsageConsent(moment.usageConsent)
  const visibility = cleanText(moment.visibility)
  const isPrivate = moment.nodeType === 'private' || visibility === 'private' || visibility === 'selected'
  return Boolean(
    !moment.removedAt &&
      moment.completionStatus === 'complete' &&
      usageConsent.ranking &&
      moment.reviewStatus === 'approved' &&
      moment.secondaryReviewStatus === 'approved' &&
      moment.rankingEligible &&
      !isPrivate,
  )
}

const getMomentNominationIneligibility = (moment = {}) => {
  if (moment.removedAt) {
    return { reason: 'moment removed from ranking', reasonCode: 'moment_removed', reasonText: '这张照片已被移出榜单候选' }
  }
  if (moment.completionStatus !== 'complete' || !cleanText(moment.imageUrl)) {
    return { reason: 'moment media incomplete', reasonCode: 'media_incomplete', reasonText: '照片还没有保存完成' }
  }
  const usageConsent = normalizeUsageConsent(moment.usageConsent)
  if (!usageConsent.ranking) {
    return { reason: 'ranking consent required', reasonCode: 'ranking_consent_required', reasonText: '需公开授权后可推举' }
  }
  const visibility = cleanText(moment.visibility)
  if (moment.nodeType === 'private' || visibility === 'private' || visibility === 'selected') {
    return { reason: 'moment visibility is private', reasonCode: 'visibility_not_public', reasonText: '私密照片不能参与回忆榜' }
  }
  if (moment.reviewStatus !== 'approved' || moment.secondaryReviewStatus !== 'approved') {
    return { reason: 'content safety review required', reasonCode: 'content_review_required', reasonText: '内容安全确认后可参与回忆榜' }
  }
  if (!moment.rankingEligible) {
    return { reason: 'ranking eligibility disabled', reasonCode: 'ranking_not_enabled', reasonText: '暂未满足回忆榜资格' }
  }
  return { reason: '', reasonCode: '', reasonText: '' }
}

const isTimelineNodeShareImageEligible = (node = {}) => {
  if (node.nodeKind === 'event') {
    return true
  }
  if (node.nodeKind !== 'moment' || node.isTimelinePlaceholder || node.removedAt) {
    return false
  }
  const usageConsent = normalizeUsageConsent(node.usageConsent)
  const visibility = cleanText(node.visibility)
  const isPrivate = node.nodeType === 'private' || visibility === 'private' || visibility === 'selected'
  const reviewApproved = node.reviewStatus === 'approved' && node.secondaryReviewStatus === 'approved'
  return Boolean(
    !isPrivate &&
      usageConsent.share &&
      node.completionStatus === 'complete' &&
      reviewApproved,
  )
}

const toSafeDisplayName = (index = 0) => `成员${index + 1}`

const getSessionMembersForLedger = (session = {}) =>
  (Array.isArray(session?.members) ? session.members : [])
    .filter((member) => cleanText(member?.name) || cleanText(member?.profileId))
    .map((member, index) => ({
      displayName: toSafeDisplayName(index),
      originalName: cleanText(member?.name),
      profileId: cleanText(member?.profileId),
      avatarUrl: cleanText(member?.avatarUrl),
      debtCount: Math.max(0, Number(member?.debtCount) || 0),
      drinkCount: Math.max(0, Number(member?.drinkCount) || 0),
      clearedCount: Math.max(0, Number(member?.clearedCount) || 0),
      updatedAt: cleanText(member?.updatedAt || member?.joinedAt || member?.createdAt),
    }))

const sumBy = (items = [], getter = () => 0) => items.reduce((sum, item) => sum + Math.max(0, Number(getter(item)) || 0), 0)

const buildRankingRows = (members = [], field = 'debtCount') =>
  members
    .filter((item) => Number(item[field]) > 0)
    .sort((left, right) => Number(right[field]) - Number(left[field]))
    .slice(0, 3)
    .map((item, index) => ({
      rank: index + 1,
      displayName: item.displayName,
      value: Number(item[field]) || 0,
    }))

const buildTopDebtor = ({ session = {}, members = [] } = {}) => {
  const topMember = [...members]
    .filter((item) => Number(item.debtCount) > 0)
    .sort((left, right) => Number(right.debtCount) - Number(left.debtCount))[0]
  if (!topMember) {
    return null
  }
  return {
    name: toPosterSafeText(topMember.originalName || topMember.displayName, '欠酒王', 8),
    value: Number(topMember.debtCount) || 0,
    avatarUrl: resolveAvatarUrl({
      sessionId: session.id,
      profileId: topMember.profileId,
      preferredAvatarUrl: topMember.avatarUrl,
    }),
  }
}

const buildAccountingHighlight = ({ type, label, value, unit, emptyText }) => {
  const safeValue = Math.max(0, Number(value) || 0)
  return {
    type,
    label,
    value: safeValue,
    unit,
    text: safeValue > 0 ? `${label} ${safeValue}${unit}` : emptyText,
  }
}

const hasSameStringSet = (left = [], right = []) => {
  const leftValues = normalizeStringArray(left)
  const rightValues = normalizeStringArray(right)
  if (leftValues.length !== rightValues.length) {
    return false
  }
  const rightSet = new Set(rightValues)
  return leftValues.every((item) => rightSet.has(item))
}

const buildShareContentFilter = (timeline = { nodes: [] }) => {
  const nodes = Array.isArray(timeline.nodes) ? timeline.nodes : []
  const allowedNodeIds = []
  const filteredNodes = []
  nodes.forEach((node) => {
    if (isTimelineNodeShareImageEligible(node)) {
      allowedNodeIds.push(node.id)
      return
    }
    const reason =
      node.nodeKind === 'moment' && node.isTimelinePlaceholder
        ? 'private_or_not_visible'
        : node.nodeKind === 'moment' && node.completionStatus !== 'complete'
          ? 'needs_media'
          : node.nodeKind === 'moment'
            ? 'not_shareable'
            : 'unsupported'
    filteredNodes.push({
      nodeId: cleanText(node.id),
      nodeKind: cleanText(node.nodeKind),
      reason,
    })
  })
  return {
    allowedNodeIds,
    filteredNodeIds: filteredNodes.map((item) => item.nodeId).filter(Boolean),
    filteredNodes,
    notice: '仅展示已授权公开内容；私密、不可见、待补图和未授权内容不会进入分享图。',
  }
}

const buildSessionLedgerSnapshot = ({ sessionId, timeline } = {}) => {
  const normalizedSessionId = cleanText(sessionId)
  const session = getManagedSessionById(normalizedSessionId) || {}
  const store = readMomentsStore()
  const members = getSessionMembersForLedger(session)
  const events = store.sessionEvents.filter((item) => item.sessionId === normalizedSessionId)
  const debtEventCount = events
    .filter((item) => item.eventType === 'drink_debt')
    .reduce((sum, item) => sum + (Number(item.scoreDelta) || 0), 0)
  const safeDebtEventCount = Math.max(0, debtEventCount)
  const memberDebtCups = sumBy(members, (item) => item.debtCount)
  const debtCups = memberDebtCups || safeDebtEventCount
  const drunkCups = sumBy(members, (item) => item.drinkCount)
  const clearedCups = sumBy(members, (item) => item.clearedCount)
  const addWineCount = events
    .filter((item) => item.eventType === 'drink_add')
    .reduce((sum, item) => sum + (Number(item.scoreDelta) || 0), 0)
  const safeAddWineCount = Math.max(0, addWineCount)
  const keyEvents = events.filter((item) => item.eventType === 'wheel_result')
  const ledgerCount = debtCups + drunkCups + clearedCups + safeAddWineCount + keyEvents.length
  const eventHighlights = events
    .filter((item) => ['drink_debt', 'drink_add', 'wheel_result'].includes(item.eventType))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      type: item.eventType,
      text:
        item.eventType === 'drink_add'
          ? '新增一条加酒记录'
          : item.eventType === 'wheel_result'
            ? '记录了一条关键互动'
            : '新增一条待处理记录',
      createdAt: item.createdAt,
    }))
  const settlementStatus = ledgerCount === 0 ? 'empty' : debtCups > 0 ? 'open' : 'settled'
  const settlementText =
    settlementStatus === 'empty'
      ? '聚会账本还没开始，先记一笔。'
      : settlementStatus === 'settled'
        ? `本场已记录 ${drunkCups} 条完成记录，账本已基本结清。`
        : `本场已记录 ${ledgerCount} 条账本高光，还有 ${debtCups} 条待处理记录。`
  const updatedAt =
    [session?.updatedAt, session?.createdAt, ...members.map((item) => item.updatedAt), ...events.map((item) => item.updatedAt || item.createdAt)]
      .map(cleanText)
      .filter(Boolean)
      .sort()
      .at(-1) || nowIso()

  return {
    ledgerSummary: {
      sessionId: normalizedSessionId,
      participantCount: members.length,
      ledgerCount,
      debtCups,
      drunkCups,
      addWineCount: safeAddWineCount,
      debtEventCount: safeDebtEventCount,
      clearedCups,
      keyEventCount: keyEvents.length,
      hasLedgerData: ledgerCount > 0,
      visibilityScope: 'public_summary',
      generatedFrom: ['session-members', 'timeline-events'],
      updatedAt,
      emptyText: '聚会账本还没开始，先记一笔。',
    },
    topDebtor: buildTopDebtor({ session, members }),
    accountingHighlights: [
      buildAccountingHighlight({ type: 'debt', label: '待处理记录', value: debtCups, unit: '条', emptyText: '暂无待处理记录' }),
      buildAccountingHighlight({ type: 'drunk', label: '完成记录', value: drunkCups, unit: '条', emptyText: '暂无完成记录' }),
      buildAccountingHighlight({ type: 'add_wine', label: '加酒记录', value: addWineCount, unit: '条', emptyText: '暂无加酒记录' }),
      buildAccountingHighlight({ type: 'cleared', label: '已消记录', value: clearedCups, unit: '条', emptyText: '暂无已消记录' }),
    ],
    settlementSummary: {
      status: settlementStatus,
      text: settlementText,
      generatedFrom: ledgerCount > 0 ? 'session-members+timeline-events' : 'empty',
      safeForPublic: true,
    },
    ledgerRankings: {
      debt: buildRankingRows(members, 'debtCount'),
      drink: buildRankingRows(members, 'drinkCount'),
      cleared: buildRankingRows(members, 'clearedCount'),
    },
    eventHighlights,
    shareContentFilter: buildShareContentFilter(timeline),
  }
}

const buildPublicPhotoTitle = (node = {}) => {
  if (node.nodeType === 'opening') return '聚会开场'
  if (node.nodeType === 'closing') return '收尾回忆'
  if (node.nodeType === 'drinking') return '账本高光'
  return '精彩瞬间'
}

const serializePublicVisibleNode = (node = {}) => {
  if (node.nodeKind === 'event') {
    return {
      id: cleanText(node.id),
      nodeKind: 'event',
      eventType: cleanText(node.eventType),
      title:
        node.eventType === 'drink_add'
          ? '加酒记录'
          : node.eventType === 'wheel_result'
            ? '关键互动'
            : '待处理记录',
      createdAt: cleanText(node.createdAt),
    }
  }
  return {
    id: cleanText(node.id),
    nodeKind: 'moment',
    nodeType: cleanText(node.nodeType),
    imageUrl: cleanText(node.imageUrl),
    title: cleanText(node.caption) || buildPublicPhotoTitle(node),
    caption: cleanText(node.caption),
    uploaderName: cleanText(node.uploaderName),
    createdAt: cleanText(node.createdAt),
  }
}

const getPublicSessionShareSummary = ({ sessionId, inviteCode } = {}) => {
  const normalizedSessionId = cleanText(sessionId)
  const normalizedInviteCode = cleanText(inviteCode).toUpperCase()
  const session =
    (normalizedSessionId ? getManagedSessionById(normalizedSessionId) : null) ||
    (normalizedInviteCode ? getAdminStore().liveSessions.find((item) => cleanText(item.inviteCode).toUpperCase() === normalizedInviteCode) : null)
  if (!session?.id) {
    return null
  }
  const store = readMomentsStore()
  const momentNodes = store.momentRecords
    .filter((item) => item.sessionId === cleanText(session.id) && !item.removedAt)
    .map((item) => ({ ...item, nodeKind: 'moment' }))
  const eventNodes = store.sessionEvents
    .filter((item) => item.sessionId === cleanText(session.id))
    .map((item) => ({ ...item, nodeKind: 'event' }))
  const timeline = {
    sessionId: cleanText(session.id),
    nodes: [...momentNodes, ...eventNodes].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
  }
  const ledgerSnapshot = buildSessionLedgerSnapshot({ sessionId: session.id, timeline })
  const visibleNodeIdSet = new Set(ledgerSnapshot.shareContentFilter.allowedNodeIds || [])
  const visibleNodes = timeline.nodes.filter((node) => visibleNodeIdSet.has(node.id)).map(serializePublicVisibleNode)
  const photoHighlights = visibleNodes
    .filter((node) => node.nodeKind === 'moment' && node.imageUrl)
    .slice(0, 6)
    .map((node) => ({
      id: node.id,
      imageUrl: node.imageUrl,
      nodeType: node.nodeType,
      title: node.title,
      uploaderAvatarUrl: cleanText(node.uploaderAvatarUrl),
      createdAt: node.createdAt,
    }))
  const firstPhoto = photoHighlights[0] || null
  const firstPhotoUploadedAt = cleanText(session.firstPhotoUploadedAt || firstPhoto?.createdAt)
  const hasFirstPhoto = Boolean(session.hasFirstPhoto === true || firstPhotoUploadedAt || firstPhoto?.imageUrl)

  return {
    coverPhotoUrl: photoHighlights[0]?.imageUrl || '',
    firstPhotoUploadedAt,
    hasFirstPhoto,
    isActiveForResume: hasFirstPhoto && !isEndedSessionState(session.state || session.status || session.endedAt || ''),
    photoHighlights,
    accountingHighlights: ledgerSnapshot.accountingHighlights,
    ledgerSummary: ledgerSnapshot.ledgerSummary,
    eventHighlights: ledgerSnapshot.eventHighlights,
    keyEvents: ledgerSnapshot.eventHighlights,
    shareContentFilter: ledgerSnapshot.shareContentFilter,
    filteredNodeIds: ledgerSnapshot.shareContentFilter.filteredNodeIds || [],
    visibleNodeIds: visibleNodes.map((node) => node.id),
    visibleNodes,
    permissionState: 'public',
    publicAccessState: {
      state: 'public_invite',
      canViewPublicShare: true,
      canViewMemberBrief: false,
      reason: 'invite_code_valid',
    },
  }
}

const ensureUserCommerceState = (contentStore, profileId) => {
  if (!contentStore.userCommerce || typeof contentStore.userCommerce !== 'object' || Array.isArray(contentStore.userCommerce)) {
    contentStore.userCommerce = {}
  }
  if (!contentStore.userCommerce[profileId]) {
    contentStore.userCommerce[profileId] = createDefaultUserCommerceState()
  }
  if (!Array.isArray(contentStore.userCommerce[profileId].pointsLedger)) {
    contentStore.userCommerce[profileId].pointsLedger = []
  }
  return contentStore.userCommerce[profileId]
}

const createPointsLedgerEntry = ({ delta, kind, sourceId, title }) => ({
  id: createId('ledger'),
  title: cleanText(title),
  createdAt: nowIso(),
  delta: Number(delta) || 0,
  kind: cleanText(kind),
  sourceId: cleanText(sourceId),
})

const normalizeRankingRewardRule = (item = {}, index = 0) => {
  const category = RANKING_CATEGORIES.has(cleanText(item.category)) ? cleanText(item.category) : 'today_highlight'
  const rankStart = Math.max(1, Number(item.rankStart) || 1)
  const rankEnd = Math.max(rankStart, Number(item.rankEnd) || rankStart)
  return {
    id: cleanText(item.id) || `reward-rule-${category}-${index + 1}`,
    category,
    enabled: cleanText(item.enabled || 'true') !== 'false',
    rankStart,
    rankEnd,
    points: Math.max(0, Number(item.points) || 0),
    reason: cleanText(item.reason),
  }
}

const getRankingRewardRules = (store = readMomentsStore()) => {
  const sourceRules = Array.isArray(store.rankingRewardRules) && store.rankingRewardRules.length
    ? store.rankingRewardRules
    : getAdminStore().rankingRewardRules || []
  return sourceRules.map(normalizeRankingRewardRule).filter((item) => item.enabled && item.points > 0)
}

const refundMomentNominationsForMoment = ({ momentId, reason = 'moment removed from ranking' } = {}) => {
  const normalizedMomentId = cleanText(momentId)
  if (!normalizedMomentId) {
    throw createHttpError('momentId required', 400)
  }
  const store = readMomentsStore()
  const now = nowIso()
  const targetNominations = store.momentNominations.filter(
    (item) => item.momentId === normalizedMomentId && item.status === 'active' && !item.refundedAt && Number(item.pointsSpent || 0) > 0,
  )
  if (!targetNominations.length) {
    return {
      momentId: normalizedMomentId,
      refundedCount: 0,
      refundedPoints: 0,
      nominations: [],
    }
  }

  const contentStore = readContentStore()
  let refundedPoints = 0
  const refundedIds = new Set()
  targetNominations.forEach((nomination) => {
    const userState = ensureUserCommerceState(contentStore, nomination.profileId)
    const alreadyRefunded = userState.pointsLedger.some(
      (entry) => entry.kind === 'moment-nomination-refund' && entry.sourceId === nomination.id,
    )
    const refundPoints = Math.max(0, Number(nomination.pointsSpent) || 0)
    if (!alreadyRefunded && refundPoints > 0) {
      userState.points = Number(userState.points || 0) + refundPoints
      userState.pointsLedger.unshift(
        createPointsLedgerEntry({
          delta: refundPoints,
          kind: 'moment-nomination-refund',
          sourceId: nomination.id,
          title: `推举退款：${cleanText(reason) || normalizedMomentId}`,
        }),
      )
      refundedPoints += refundPoints
    }
    nomination.status = 'refunded'
    nomination.refundedAt = now
    nomination.refundReason = cleanText(reason)
    nomination.updatedAt = now
    refundedIds.add(nomination.id)
  })
  writeContentStore(contentStore)
  writeMomentsStore(store)

  return {
    momentId: normalizedMomentId,
    refundedCount: refundedIds.size,
    refundedPoints,
    nominations: store.momentNominations.filter((item) => refundedIds.has(item.id)),
  }
}

const grantRankingRewards = ({ category = 'today_highlight', limit = 100, operator = 'admin-console' } = {}) => {
  const normalizedCategory = RANKING_CATEGORIES.has(cleanText(category)) ? cleanText(category) : 'today_highlight'
  const ranking = listTodayRankings({ category: normalizedCategory, limit })
  const store = readMomentsStore()
  const rawMomentMap = new Map((store.momentRecords || []).map((moment) => [cleanText(moment.id), moment]))
  const rules = getRankingRewardRules(store).filter((item) => item.category === normalizedCategory)
  const contentStore = readContentStore()
  const now = nowIso()
  const results = []
  let grantedCount = 0
  let skippedCount = 0
  let totalPoints = 0

  ranking.items.forEach((item) => {
    const rule = rules.find((candidate) => item.rank >= candidate.rankStart && item.rank <= candidate.rankEnd)
    const momentId = cleanText(item.moment?.id)
    const rawMoment = rawMomentMap.get(momentId) || {}
    const profileId = cleanText(rawMoment.uploaderProfileId || item.moment?.uploaderProfileId)
    if (!rule || !profileId || !momentId) {
      skippedCount += 1
      return
    }
    const sourceId = `ranking-reward:${ranking.date}:${normalizedCategory}:${momentId}:${rule.id}`
    const existedPayout = store.rankingRewardPayouts.some((payout) => payout.sourceId === sourceId)
    const userState = ensureUserCommerceState(contentStore, profileId)
    const existedLedger = userState.pointsLedger.some((entry) => entry.kind === 'ranking-reward' && entry.sourceId === sourceId)
    if (existedPayout || existedLedger) {
      skippedCount += 1
      results.push({
        momentId,
        profileId,
        rank: item.rank,
        points: Number(rule.points) || 0,
        status: 'skipped',
        sourceId,
      })
      return
    }

    const points = Math.max(0, Number(rule.points) || 0)
    userState.points = Number(userState.points || 0) + points
    userState.pointsLedger.unshift(
      createPointsLedgerEntry({
        delta: points,
        kind: 'ranking-reward',
        sourceId,
        title: `榜单奖励：${normalizedCategory} 第${item.rank}名`,
      }),
    )
    const payout = normalizeRankingRewardPayout({
      id: createId('ranking-reward-payout'),
      sourceId,
      category: normalizedCategory,
      date: ranking.date,
      momentId,
      sessionId: cleanText(rawMoment.sessionId || item.moment.sessionId),
      profileId,
      profileName: cleanText(rawMoment.uploaderName || item.moment.uploaderName),
      rank: item.rank,
      points,
      ruleId: rule.id,
      status: 'granted',
      operator,
      createdAt: now,
      updatedAt: now,
    })
    store.rankingRewardPayouts.unshift(payout)
    grantedCount += 1
    totalPoints += points
    results.push(payout)
  })

  writeContentStore(contentStore)
  writeMomentsStore(store)
  return {
    category: normalizedCategory,
    date: ranking.date,
    grantedCount,
    skippedCount,
    totalPoints,
    items: results,
  }
}

const resolveLocalUploadPath = (imageUrl = '') => {
  const text = cleanText(imageUrl)
  if (!text || /^https?:\/\//i.test(text) || !text.startsWith('/uploads/')) {
    return ''
  }
  const relativePath = text.replace(/^\/uploads\//, '')
  const resolvedPath = path.resolve(path.join(__dirname, '..', 'public', 'uploads'), relativePath)
  const uploadsRoot = path.resolve(path.join(__dirname, '..', 'public', 'uploads'))
  if (!resolvedPath.startsWith(uploadsRoot)) {
    return ''
  }
  return resolvedPath
}

const resolveImageDataUri = async (imageUrl = '') => {
  const imageBuffer = await readObjectForRender({ url: imageUrl })
  if (!imageBuffer) {
    return ''
  }
  try {
    const image = sharp(imageBuffer).resize({ width: 720, height: 420, fit: 'cover' }).png()
    const stats = await image.clone().stats()
    const deviation = stats.channels
      .slice(0, 3)
      .reduce((sum, channel) => sum + Math.max(0, Number(channel.stdev) || 0), 0)
    if (deviation < 18) {
      return ''
    }
    const buffer = await image.toBuffer()
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return ''
  }
}

const resolveMiniProgramQrDataUri = async (imageUrl = '') => {
  const text = cleanText(imageUrl)
  const imagePath =
    text === DEFAULT_MINI_PROGRAM_QR_URL || text === '/static/share-poster-miniapp-code.png'
      ? defaultMiniProgramQrLocalPath
      : ''
  if (!imagePath || !fs.existsSync(imagePath)) {
    return ''
  }
  try {
    const buffer = await sharp(imagePath).png().toBuffer()
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return ''
  }
}

const resolveSharePosterBackgroundDataUri = async () => {
  if (!fs.existsSync(sharePosterLongBgPath)) {
    return ''
  }
  try {
    const buffer = await sharp(sharePosterLongBgPath).resize({ width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_MIN_HEIGHT, fit: 'cover' }).webp({ quality: 82 }).toBuffer()
    return `data:image/webp;base64,${buffer.toString('base64')}`
  } catch {
    return ''
  }
}

const getTaskVisibleNodes = (store, task) => {
  const brief = store.sessionBriefs.find((item) => item.id === cleanText(task.briefId))
  if (!brief) {
    throw createHttpError('brief not found', 404)
  }
  return task.selectedNodeIds
    .map((nodeId) => {
      const moment = findMomentById(store, nodeId)
      if (moment) {
        return { ...moment, nodeKind: 'moment' }
      }
      const event = findEventById(store, nodeId)
      return event ? { ...event, nodeKind: 'event' } : null
    })
    .filter((item) => item && isTimelineNodeShareImageEligible(item))
}

const POSTER_UNSAFE_TEXT_PATTERN =
  /(IT-MOMENTS|PR Seed|dual_flow|share-task|session-|brief-|moment-|event-|nomination-|ranking-reward|fixture|seed|sample|test|测试种子|内部样本)/i

const toPosterSafeText = (value = '', fallback = '聚会高光', maxLength = 18) => {
  const text = cleanText(value)
    .replace(/酒桌判官/g, '聚会记录师')
    .replace(/酒局/g, '聚会')
    .replace(/判官/g, '记录人')
    .replace(/_/g, ' ')
  if (!text || POSTER_UNSAFE_TEXT_PATTERN.test(text)) {
    return trimText(fallback, maxLength)
  }
  return trimText(text, maxLength)
}

const getPosterMomentTitle = (node = {}) => {
  if (node.nodeType === 'opening') return '开场合照'
  if (node.nodeType === 'closing') return '收尾回忆'
  if (node.nodeType === 'drinking') return '账本瞬间'
  return '精彩瞬间'
}

const getPosterMomentCaptionTitle = (node = {}) =>
  toPosterSafeText(node.caption, node.timelineTitle || getPosterMomentTitle(node), 16)

const getPosterMomentCaptionMeta = (node = {}) => {
  const uploaderName = toPosterSafeText(node.uploaderName, '玩家', 10)
  return `${uploaderName} 上传了这张照片`
}

const getPosterEventTitle = (node = {}) => {
  const targetName = toPosterSafeText(node.targetName || node.operatorName, '成员', 8)
  const delta = Number(node.scoreDelta) || 0
  const score = Math.max(1, Math.abs(delta))
  if (node.eventType === 'drink_add') return delta < 0 ? `${targetName} 减少加酒 ${score} 杯` : `${targetName} 喝了 ${score} 杯酒`
  if (node.eventType === 'wheel_result') return '记录关键互动'
  return delta < 0 ? `${targetName} 消酒 ${score} 杯` : `${targetName} 又欠了 ${score} 杯酒`
}

const getPosterEventMeta = (node = {}) => {
  const operatorName = toPosterSafeText(node.operatorName, '记录人', 8)
  if (node.eventType === 'wheel_result') {
    return toPosterSafeText(node.caption || node.operatorName, '聚会互动', 18)
  }
  return `${operatorName} 记录了这次变动`
}

const buildPosterParticipants = (session = {}) => {
  const members = (Array.isArray(session.members) ? session.members : [])
    .filter((item) => cleanText(item?.name || item?.profileId))
    .sort((left, right) => {
      if (left.isHost && !right.isHost) return -1
      if (!left.isHost && right.isHost) return 1
      return 0
    })
  const joined = members.filter((item) => {
    const status = cleanText(item.status)
    return !status || status.includes('已加入') || /joined|active|ready/i.test(status)
  })
  const source = joined.length ? joined : members
  if (!source.length && cleanText(session.hostName)) {
    source.push({
      avatarUrl: cleanText(session.hostAvatarUrl),
      name: cleanText(session.hostName),
      profileId: cleanText(session.hostProfileId),
    })
  }
  return source.map((item, index) => {
    const name = toPosterSafeText(item.name || item.profileId, `成员${index + 1}`, 8)
    return {
      avatarUrl: resolveAvatarUrl({
        sessionId: session.id,
        profileId: item.profileId,
        preferredAvatarUrl: item.avatarUrl,
      }),
      initial: name.slice(0, 1) || '?',
      name,
    }
  })
}

const resolvePosterAvatarDataUri = async (avatarUrl = '') => {
  const imageBuffer = await readObjectForRender({ url: avatarUrl })
  if (!imageBuffer) {
    return ''
  }
  try {
    const buffer = await sharp(imageBuffer)
      .resize({ width: 96, height: 96, fit: 'cover' })
      .png()
      .toBuffer()
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return ''
  }
}

const renderPosterParticipants = (participants = [], avatarDataUris = []) => {
  if (!participants.length) {
    return ''
  }
  const count = participants.length
  const visibleCount = Math.min(count, 8)
  const rowWidth = 324
  const itemWidth = visibleCount <= 1 ? rowWidth : rowWidth / (visibleCount - 1)
  const avatarSize = 42
  const startX = 94
  const y = 284
  return participants
    .slice(0, visibleCount)
    .map((item, index) => {
      const cx = visibleCount <= 1 ? startX + avatarSize / 2 : startX + index * itemWidth
      const x = cx - avatarSize / 2
      const avatarDataUri = avatarDataUris[index] || ''
      const clipId = `participantAvatar${index}`
      return `
        <g>
          <circle cx="${cx}" cy="${y}" r="${avatarSize / 2 + 3}" fill="#fff4de" fill-opacity="0.16"/>
          <clipPath id="${clipId}"><circle cx="${cx}" cy="${y}" r="${avatarSize / 2}"/></clipPath>
          ${
            avatarDataUri
              ? `<image href="${avatarDataUri}" x="${x}" y="${y - avatarSize / 2}" width="${avatarSize}" height="${avatarSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`
              : `<circle cx="${cx}" cy="${y}" r="${avatarSize / 2}" fill="#fff4de"/><text x="${cx}" y="${y + 7}" text-anchor="middle" font-size="20" font-weight="900" fill="#2a1c13">${escapeXml(item.initial)}</text>`
          }
          <text x="${cx}" y="${y + avatarSize / 2 + 28}" text-anchor="middle" font-size="18" font-weight="800" fill="#fff8ec">${escapeXml(trimText(item.name, 6))}</text>
        </g>
      `
    })
    .join('')
}

const renderPosterTopDebtor = (topDebtor = null, avatarDataUri = '') => {
  const x = 538
  const y = 76
  if (!topDebtor) {
    return `
      <rect x="${x}" y="${y}" width="278" height="178" rx="32" fill="#17100c" fill-opacity="0.82" stroke="#fff4de" stroke-opacity="0.16"/>
      <text x="${x + 28}" y="${y + 48}" font-size="24" font-weight="900" fill="#fff8ec">今日欠酒王</text>
      <text x="${x + 28}" y="${y + 95}" font-size="30" font-weight="900" fill="#63dfae">本场无人欠酒</text>
      <text x="${x + 28}" y="${y + 132}" font-size="19" font-weight="800" fill="#d4bfa8">账本暂时清清爽爽</text>
    `
  }
  const avatarSize = 68
  const cx = x + 64
  const cy = y + 104
  return `
    <rect x="${x}" y="${y}" width="278" height="178" rx="32" fill="#17100c" fill-opacity="0.82" stroke="#fff4de" stroke-opacity="0.16"/>
    <text x="${x + 28}" y="${y + 46}" font-size="24" font-weight="900" fill="#fff8ec">今日欠酒王</text>
    <circle cx="${cx}" cy="${cy}" r="${avatarSize / 2 + 4}" fill="#fff4de" fill-opacity="0.18"/>
    <clipPath id="topDebtorAvatarClip"><circle cx="${cx}" cy="${cy}" r="${avatarSize / 2}"/></clipPath>
    ${
      avatarDataUri
        ? `<image href="${avatarDataUri}" x="${cx - avatarSize / 2}" y="${cy - avatarSize / 2}" width="${avatarSize}" height="${avatarSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#topDebtorAvatarClip)"/>`
        : `<circle cx="${cx}" cy="${cy}" r="${avatarSize / 2}" fill="#fff4de"/><text x="${cx}" y="${cy + 11}" text-anchor="middle" font-size="30" font-weight="900" fill="#2a1c13">${escapeXml(topDebtor.name.slice(0, 1) || '欠')}</text>`
    }
    <path d="M${cx + 22} ${cy - 34} L${cx + 22} ${cy - 5}" stroke="#fff8ec" stroke-width="4" stroke-linecap="round"/>
    <path d="M${cx + 25} ${cy - 34} C${cx + 51} ${cy - 43}, ${cx + 55} ${cy - 20}, ${cx + 28} ${cy - 25} Z" fill="#fff8ec"/>
    <text x="${x + 118}" y="${y + 98}" font-size="31" font-weight="900" fill="#fff8ec">${escapeXml(topDebtor.name)}</text>
    <text x="${x + 118}" y="${y + 134}" font-size="21" font-weight="900" fill="#ffb1a0">欠了 ${topDebtor.value} 杯酒</text>
  `
}

const formatPosterTime = (value = '') => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

const renderPosterPhotoWall = (imageDataUris = []) => {
  const images = imageDataUris.filter(Boolean).slice(0, 4)
  if (!images.length) {
    return `
      <rect x="66" y="260" width="768" height="300" rx="36" fill="#17110d" stroke="#fff4de" stroke-opacity="0.18" stroke-width="2"/>
      <circle cx="450" cy="368" r="54" fill="#ff5a3d" fill-opacity="0.20"/>
      <text x="450" y="362" text-anchor="middle" font-size="30" font-weight="900" fill="#fff8ec">还没有可展示照片</text>
      <text x="450" y="408" text-anchor="middle" font-size="23" font-weight="700" fill="#ffb1a0">拍第一张照片后再生成联合分享图</text>
      <rect x="312" y="444" width="276" height="62" rx="31" fill="#ff5a3d"/>
      <text x="450" y="484" text-anchor="middle" font-size="24" font-weight="900" fill="#fff8ec">去拍聚会高光</text>
    `
  }

  const placements = [
    { x: 94, y: 268, w: 324, h: 220, rotate: -4 },
    { x: 392, y: 276, w: 330, h: 226, rotate: 3 },
    { x: 190, y: 450, w: 246, h: 150, rotate: 4 },
    { x: 492, y: 448, w: 232, h: 148, rotate: -3 },
  ]

  return images
    .map((dataUri, index) => {
      const item = placements[index]
      const cx = item.x + item.w / 2
      const cy = item.y + item.h / 2
      const imageX = item.x + 14
      const imageY = item.y + 14
      const imageW = item.w - 28
      const imageH = item.h - 46
      return `
        <g transform="rotate(${item.rotate} ${cx} ${cy})">
          <rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="22" fill="#fff4de"/>
          <rect x="${imageX}" y="${imageY}" width="${imageW}" height="${imageH}" rx="16" fill="#201611"/>
          <clipPath id="posterPhoto${index}"><rect x="${imageX}" y="${imageY}" width="${imageW}" height="${imageH}" rx="16"/></clipPath>
          <image href="${dataUri}" x="${imageX}" y="${imageY}" width="${imageW}" height="${imageH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#posterPhoto${index})"/>
          <text x="${item.x + 22}" y="${item.y + item.h - 17}" font-size="18" font-weight="800" fill="#2a1c13">聚会照片 ${index + 1}</text>
        </g>
      `
    })
    .join('')
}

const buildShareImageSvg = async ({ brief, task, nodes, ledgerSnapshot = null }) => {
  const session = getManagedSessionById(task.sessionId) || {}
  const imageNodes = nodes.filter((item) => item.nodeKind === 'moment' && item.imageUrl)
  const imageDataUris = await Promise.all(imageNodes.map((item) => resolveImageDataUri(item.imageUrl)))
  const imageDataUriById = new Map(imageNodes.map((item, index) => [item.id, imageDataUris[index]]))
  const visibleImageDataUris = imageDataUris.filter(Boolean)
  const visiblePhotoCount = visibleImageDataUris.length
  const ledgerSummary = ledgerSnapshot?.ledgerSummary || {}
  const topDebtor = ledgerSnapshot?.topDebtor || null
  const accountingHighlights = Array.isArray(ledgerSnapshot?.accountingHighlights) ? ledgerSnapshot.accountingHighlights : []
  const settlementSummary = ledgerSnapshot?.settlementSummary || {}
  const eventHighlights = Array.isArray(ledgerSnapshot?.eventHighlights) ? ledgerSnapshot.eventHighlights : []
  const ledgerCount = Number(ledgerSummary.ledgerCount) || 0
  const inviteCode = toPosterSafeText(session.inviteCode || '', '回流查看', 10)
  const sessionTitle = toPosterSafeText(session.name || brief.title, '今晚聚会高光', 16)
  const qrDataUri = await resolveMiniProgramQrDataUri(getMiniProgramQrUrl(task))
  const backgroundDataUri = await resolveSharePosterBackgroundDataUri()
  const participants = buildPosterParticipants(session)
  const participantAvatarDataUris = await Promise.all(participants.map((item) => resolvePosterAvatarDataUri(item.avatarUrl)))
  const participantRows = renderPosterParticipants(participants, participantAvatarDataUris)
  const topDebtorAvatarDataUri = topDebtor ? await resolvePosterAvatarDataUri(topDebtor.avatarUrl) : ''
  const topDebtorCard = renderPosterTopDebtor(topDebtor, topDebtorAvatarDataUri)
  const timelineTop = 370
  const timelineItems = nodes
    .filter((item) => item.nodeKind === 'event' || item.nodeKind === 'moment')
    .sort((a, b) => {
      const left = new Date(a.createdAt || a.updatedAt || 0).getTime() || 0
      const right = new Date(b.createdAt || b.updatedAt || 0).getTime() || 0
      return left - right
    })
  const timelineRows = timelineItems
    .map((item, index) => {
      const y = timelineTop + 82 + index * 126
      const title =
        item.nodeKind === 'event'
            ? getPosterEventTitle(item)
            : getPosterMomentCaptionTitle(item)
      const desc =
        item.nodeKind === 'moment'
          ? getPosterMomentCaptionMeta(item)
          : getPosterEventMeta(item)
      const toneColor = item.nodeKind === 'moment' ? '#ff6846' : item.eventType === 'drink_add' ? '#63dfae' : '#ffc75a'
      const imageDataUri = item.nodeKind === 'moment' ? imageDataUriById.get(item.id) : ''
      const cardCopyX = imageDataUri ? 238 : 164
      return `
        <rect x="80" y="${y - 54}" width="740" height="100" rx="26" fill="#17100c" fill-opacity="0.88" stroke="#fff4de" stroke-opacity="0.16"/>
        <circle cx="122" cy="${y - 4}" r="18" fill="${toneColor}"/>
        <text x="122" y="${y + 4}" text-anchor="middle" font-size="19" font-weight="900" fill="#090705">${index + 1}</text>
        ${imageDataUri ? `<rect x="164" y="${y - 38}" width="54" height="54" rx="13" fill="#fff4de"/><clipPath id="timelinePhoto${index}"><rect x="168" y="${y - 34}" width="46" height="46" rx="10"/></clipPath><image href="${imageDataUri}" x="168" y="${y - 34}" width="46" height="46" preserveAspectRatio="xMidYMid slice" clip-path="url(#timelinePhoto${index})"/>` : ''}
        <text x="${cardCopyX}" y="${y - 13}" font-size="25" font-weight="900" fill="#fff8ec">${escapeXml(trimText(title, 16))}</text>
        <text x="${cardCopyX}" y="${y + 22}" font-size="19" font-weight="700" fill="#d4bfa8">${escapeXml(trimText(desc, 24))}</text>
        <text x="780" y="${y + 2}" text-anchor="end" font-size="20" font-weight="800" fill="#fff4de" opacity="0.72">${escapeXml(formatPosterTime(item.createdAt))}</text>
      `
    })
    .join('')
  const summaryText = toPosterSafeText(settlementSummary.text, ledgerCount > 0 ? '聚会账本高光已生成' : '聚会账本还没开始，先记一笔', 34)
  const timelineCount = Math.max(1, timelineItems.length)
  const timelineBottom = timelineTop + 56 + timelineCount * 126
  const summaryY = timelineBottom + 42
  const qrY = summaryY + 202
  const footerY = qrY + 180
  const height = Math.max(SHARE_IMAGE_MIN_HEIGHT, footerY + 84)
  const midColor = '#120c09'
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SHARE_IMAGE_WIDTH}" height="${height}" viewBox="0 0 ${SHARE_IMAGE_WIDTH} ${height}" font-family="'SimHei', 'DengXian', 'Microsoft YaHei', 'SimSun', sans-serif">
      <defs>
        <style>text { font-family: 'SimHei', 'DengXian', 'Microsoft YaHei', 'SimSun', sans-serif; }</style>
        <clipPath id="sharePosterHeaderClip"><rect x="0" y="0" width="${SHARE_IMAGE_WIDTH}" height="360"/></clipPath>
        <clipPath id="sharePosterFooterClip"><rect x="0" y="${Math.max(0, height - 260)}" width="${SHARE_IMAGE_WIDTH}" height="260"/></clipPath>
        <radialGradient id="bgGlow" cx="48%" cy="24%" r="70%">
          <stop offset="0" stop-color="#312016"/>
          <stop offset="0.48" stop-color="#1a100b"/>
          <stop offset="1" stop-color="#090705"/>
        </radialGradient>
        <linearGradient id="coralLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ff5a3d"/>
          <stop offset="0.55" stop-color="#ffc75a"/>
          <stop offset="1" stop-color="#63dfae"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="${midColor}"/>
      ${backgroundDataUri ? `<image href="${backgroundDataUri}" x="0" y="0" width="${SHARE_IMAGE_WIDTH}" height="${SHARE_IMAGE_MIN_HEIGHT}" preserveAspectRatio="xMidYMid slice" clip-path="url(#sharePosterHeaderClip)"/><image href="${backgroundDataUri}" x="0" y="${height - SHARE_IMAGE_MIN_HEIGHT}" width="${SHARE_IMAGE_WIDTH}" height="${SHARE_IMAGE_MIN_HEIGHT}" preserveAspectRatio="xMidYMid slice" clip-path="url(#sharePosterFooterClip)"/>` : '<rect width="100%" height="360" fill="url(#bgGlow)"/>'}
      <rect x="38" y="38" width="824" height="${height - 76}" rx="46" fill="#090705" fill-opacity="0.48" stroke="#fff4de" stroke-opacity="0.16"/>
      <text x="74" y="128" font-size="54" font-weight="900" fill="#fff8ec">今晚聚会高光</text>
      <rect x="74" y="154" width="290" height="12" rx="6" fill="url(#coralLine)"/>
      <text x="74" y="204" font-size="27" font-weight="800" fill="#ffb1a0">${escapeXml(sessionTitle)}</text>
      <text x="74" y="254" font-size="30" font-weight="900" fill="#fff8ec">记录时间线</text>
      <text x="812" y="326" text-anchor="end" font-size="23" font-weight="800" fill="#63dfae">${visiblePhotoCount} 张公开照片 · ${ledgerCount} 条高光</text>
      ${topDebtorCard}
      ${participantRows}
      <line x1="122" y1="${timelineTop + 28}" x2="122" y2="${timelineBottom - 38}" stroke="#ffdca8" stroke-width="4" stroke-opacity="0.42"/>
      ${timelineRows || `<rect x="80" y="${timelineTop + 20}" width="740" height="104" rx="28" fill="#140f0c" stroke="#fff4de" stroke-opacity="0.16"/><text x="450" y="${timelineTop + 83}" text-anchor="middle" font-size="26" font-weight="900" fill="#fff4de">暂无公开关键时刻</text>`}
      <rect x="74" y="${summaryY}" width="752" height="150" rx="28" fill="#fff4de"/>
      <text x="108" y="${summaryY + 48}" font-size="24" font-weight="900" fill="#2a1c13">聚会总结</text>
      <text x="108" y="${summaryY + 92}" font-size="28" font-weight="900" fill="#2a1c13">${escapeXml(summaryText)}</text>
      <text x="108" y="${summaryY + 130}" font-size="20" font-weight="800" fill="#6a4b38">房间码 ${escapeXml(inviteCode)} · 仅展示已授权公开内容</text>
      <rect x="326" y="${qrY}" width="248" height="248" rx="36" fill="#fff4de"/>
      ${qrDataUri ? `<image href="${qrDataUri}" x="366" y="${qrY + 30}" width="168" height="168" preserveAspectRatio="xMidYMid meet"/>` : ''}
      <text x="450" y="${qrY + 224}" text-anchor="middle" font-size="22" font-weight="900" fill="#2a1c13">扫码回到小程序</text>
      <text x="450" y="${footerY}" text-anchor="middle" font-size="22" font-weight="800" fill="#fff8ec" opacity="0.76">聚会记录师</text>
    </svg>
  `
}

const createMoment = ({ sessionId, profile, payload = {} }) => {
  const { member, profileId, session } = assertSessionMember(sessionId, profile)
  const nodeType = NODE_TYPES.has(cleanText(payload.nodeType)) ? cleanText(payload.nodeType) : 'highlight'
  const visibility = VISIBILITIES.has(cleanText(payload.visibility))
    ? cleanText(payload.visibility)
    : nodeType === 'private'
      ? 'private'
      : 'session'
  const visibleProfileIds = normalizeVisibleProfileIds({
    session,
    nodeType,
    visibility,
    visibleProfileIds: payload.visibleProfileIds,
  })
  const store = readMomentsStore()
  const clientDraftId = cleanText(payload.clientDraftId)
  const existing =
    clientDraftId &&
    store.momentRecords.find(
      (item) => item.sessionId === cleanText(sessionId) && item.uploaderProfileId === profileId && item.clientDraftId === clientDraftId,
    )
  if (existing) {
    return serializeMomentForViewer(existing, profileId)
  }

  const reusableOpening =
    nodeType === 'opening'
      ? store.momentRecords.find(
          (item) => item.sessionId === cleanText(sessionId) && item.uploaderProfileId === profileId && item.nodeType === 'opening' && !item.removedAt,
        )
      : null
  const base = {
    ...(reusableOpening || {}),
    id: reusableOpening?.id || createId('moment'),
    clientDraftId,
    sessionId: cleanText(sessionId),
    uploaderProfileId: profileId,
    uploaderName: cleanText(profile.name || member.name),
    nodeType,
    mediaType: 'image',
    imageUrl: cleanText(payload.imageUrl),
    caption: cleanText(payload.caption) || buildDefaultCaption(nodeType),
    tags: normalizeStringArray(payload.tags),
    visibility,
    visibleProfileIds,
    usageConsent: normalizeUsageConsent(payload.usageConsent),
    reviewStatus: reusableOpening?.reviewStatus || 'pending',
    secondaryReviewStatus: reusableOpening?.secondaryReviewStatus || 'pending',
    removedAt: '',
    createdAt: reusableOpening?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  const status = computeMomentStatus(base)
  const next = normalizeMomentRecord({
    ...base,
    ...status,
    timelineTitle: cleanText(payload.timelineTitle) || buildTimelineTitle(base),
  })
  const uploadAssetId = cleanText(payload.uploadAssetId)

  store.momentRecords = reusableOpening
    ? store.momentRecords.map((item) => (item.id === reusableOpening.id ? next : item))
    : [next, ...store.momentRecords]
  if (uploadAssetId && cleanText(next.imageUrl)) {
    const assetIndex = store.uploadedAssets.findIndex((item) => cleanText(item.id) === uploadAssetId)
    if (assetIndex === -1) {
      throw createHttpError('upload asset not found', 404)
    }
    const asset = normalizeUploadedAsset(store.uploadedAssets[assetIndex])
    if (asset.uploaderProfileId !== profileId || asset.sessionId !== cleanText(sessionId)) {
      throw createHttpError('upload asset forbidden', 403)
    }
    if (asset.removedAt) {
      throw createHttpError('upload asset removed', 410)
    }
    if (asset.boundMomentId && asset.boundMomentId !== next.id) {
      throw createHttpError('upload asset already bound', 409)
    }
    store.uploadedAssets[assetIndex] = {
      ...asset,
      boundAt: nowIso(),
      boundMomentId: next.id,
      updatedAt: nowIso(),
    }
  }
  writeMomentsStore(store)
  if (cleanText(next.imageUrl) && next.completionStatus === 'complete') {
    markManagedSessionFirstPhotoUploaded({
      sessionId: next.sessionId,
      uploadedAt: next.createdAt || next.updatedAt,
    })
  }
  return serializeMomentForViewer(next, profileId)
}

const cleanupMomentUpload = async ({ assetId, profile, reason = 'client-create-failed' } = {}) => {
  const profileId = getProfileId(profile)
  if (!profileId) {
    throw createHttpError('unauthorized', 401)
  }
  const normalizedAssetId = cleanText(assetId)
  if (!normalizedAssetId) {
    throw createHttpError('asset id required', 400)
  }
  const store = readMomentsStore()
  const index = store.uploadedAssets.findIndex((item) => cleanText(item.id) === normalizedAssetId)
  if (index === -1) {
    throw createHttpError('upload asset not found', 404)
  }
  const asset = normalizeUploadedAsset(store.uploadedAssets[index])
  if (asset.uploaderProfileId !== profileId) {
    throw createHttpError('forbidden', 403)
  }
  if (asset.boundMomentId) {
    throw createHttpError('upload asset already bound', 409)
  }
  if (!asset.removedAt && asset.objectKey) {
    await deleteObject({ key: asset.objectKey })
  }
  const removedAt = nowIso()
  store.uploadedAssets[index] = {
    ...asset,
    cleanupReason: cleanText(reason) || 'client-create-failed',
    removedAt,
    updatedAt: removedAt,
  }
  writeMomentsStore(store)
  return { assetId: asset.id, removed: true }
}

const cleanupExpiredMomentUploads = async ({ ttlMs = 24 * 60 * 60 * 1000, limit = 50 } = {}) => {
  const store = readMomentsStore()
  const cutoff = Date.now() - Math.max(0, Number(ttlMs) || 0)
  const candidates = store.uploadedAssets
    .map(normalizeUploadedAsset)
    .filter((asset) => !asset.boundMomentId && !asset.removedAt && new Date(asset.createdAt).getTime() < cutoff)
    .slice(0, Math.max(1, Math.min(200, Number(limit) || 50)))
  const cleaned = []
  for (const asset of candidates) {
    if (asset.objectKey) {
      await deleteObject({ key: asset.objectKey })
    }
    cleaned.push(asset.id)
  }
  if (cleaned.length) {
    const cleanedSet = new Set(cleaned)
    const removedAt = nowIso()
    store.uploadedAssets = store.uploadedAssets.map((item) => {
      const asset = normalizeUploadedAsset(item)
      if (!cleanedSet.has(asset.id)) {
        return item
      }
      return {
        ...asset,
        cleanupReason: 'ttl-expired',
        removedAt,
        updatedAt: removedAt,
      }
    })
    writeMomentsStore(store)
  }
  return { cleaned, cleanedCount: cleaned.length }
}

const updateMoment = ({ momentId, profile, payload = {} }) => {
  const profileId = getProfileId(profile)
  const store = readMomentsStore()
  const index = store.momentRecords.findIndex((item) => item.id === cleanText(momentId) && !item.removedAt)
  if (index === -1) {
    throw createHttpError('moment not found', 404)
  }
  const existed = store.momentRecords[index]
  const { session } = assertSessionMember(existed.sessionId, profile)
  if (existed.uploaderProfileId !== profileId) {
    throw createHttpError('forbidden', 403)
  }
  const nextVisibility =
    Object.prototype.hasOwnProperty.call(payload, 'visibility') && VISIBILITIES.has(cleanText(payload.visibility))
      ? cleanText(payload.visibility)
      : existed.visibility
  const nextVisibleProfileIds = Object.prototype.hasOwnProperty.call(payload, 'visibleProfileIds')
    ? normalizeVisibleProfileIds({
        session,
        nodeType: existed.nodeType,
        visibility: nextVisibility,
        visibleProfileIds: payload.visibleProfileIds,
      })
    : normalizeVisibleProfileIds({
        session,
        nodeType: existed.nodeType,
        visibility: nextVisibility,
        visibleProfileIds: existed.visibleProfileIds,
      })
  const nextBase = {
    ...existed,
    imageUrl: Object.prototype.hasOwnProperty.call(payload, 'imageUrl') ? cleanText(payload.imageUrl) : existed.imageUrl,
    caption: Object.prototype.hasOwnProperty.call(payload, 'caption') ? cleanText(payload.caption) || buildDefaultCaption(existed.nodeType) : existed.caption,
    tags: Object.prototype.hasOwnProperty.call(payload, 'tags') ? normalizeStringArray(payload.tags) : existed.tags,
    visibility: nextVisibility,
    visibleProfileIds: nextVisibleProfileIds,
    usageConsent: Object.prototype.hasOwnProperty.call(payload, 'usageConsent') ? normalizeUsageConsent(payload.usageConsent) : existed.usageConsent,
    updatedAt: nowIso(),
  }
  const status = computeMomentStatus(nextBase)
  const next = normalizeMomentRecord({
    ...nextBase,
    ...status,
    timelineTitle: cleanText(payload.timelineTitle) || buildTimelineTitle(nextBase),
  })
  store.momentRecords[index] = next
  writeMomentsStore(store)
  return serializeMomentForViewer(next, profileId)
}

const deleteMoment = ({ momentId, profile }) => {
  const profileId = getProfileId(profile)
  const store = readMomentsStore()
  const index = store.momentRecords.findIndex((item) => item.id === cleanText(momentId) && !item.removedAt)
  if (index === -1) {
    throw createHttpError('moment not found', 404)
  }
  const existed = store.momentRecords[index]
  assertSessionMember(existed.sessionId, profile)
  if (existed.uploaderProfileId !== profileId) {
    throw createHttpError('forbidden', 403)
  }
  if (
    existed.reviewStatus === 'approved' ||
    existed.secondaryReviewStatus === 'approved' ||
    existed.rankingEligible ||
    existed.rewardEligible
  ) {
    throw createHttpError('moment cannot be deleted after publish', 409)
  }
  store.momentRecords[index] = normalizeMomentRecord({
    ...existed,
    removedAt: nowIso(),
    updatedAt: nowIso(),
  })
  writeMomentsStore(store)
  return { id: existed.id, removed: true }
}

const createSessionEvent = ({ sessionId, profile, payload = {} }) => {
  const { member, profileId, session } = assertSessionHost(sessionId, profile)
  const eventType = EVENT_TYPES.has(cleanText(payload.eventType)) ? cleanText(payload.eventType) : ''
  if (!eventType) {
    throw createHttpError('invalid eventType', 400)
  }
  const clientEventId = cleanText(payload.clientEventId)
  if (!clientEventId) {
    throw createHttpError('clientEventId required', 400)
  }
  const store = readMomentsStore()
  const existing = store.sessionEvents.find((item) => item.sessionId === cleanText(sessionId) && item.clientEventId === clientEventId)
  if (existing) {
    return serializeEvent(existing)
  }
  const targetProfileId = cleanText(payload.targetProfileId)
  const targetMember = getSessionMember(session, targetProfileId)
  if (targetProfileId && !targetMember) {
    throw createHttpError('targetProfileId must be session member', 400)
  }
  const next = normalizeSessionEvent({
    id: createId('event'),
    clientEventId,
    sessionId,
    eventType,
    operatorProfileId: profileId,
    operatorName: cleanText(profile.name || member.name),
    targetProfileId,
    targetName: cleanText(payload.targetName || targetMember?.name),
    scoreDelta: Number(payload.scoreDelta) || 0,
    caption: cleanText(payload.caption),
    createdAt: cleanText(payload.createdAt) || nowIso(),
  })
  store.sessionEvents.unshift(next)
  writeMomentsStore(store)
  return serializeEvent(next)
}

const getSessionTimeline = ({ sessionId, profile }) => {
  const { profileId } = assertSessionMember(sessionId, profile)
  const store = readMomentsStore()
  const moments = store.momentRecords
    .filter((item) => item.sessionId === cleanText(sessionId) && !item.removedAt)
    .map((item) => serializeMomentForViewer(item, profileId))
  const events = store.sessionEvents
    .filter((item) => item.sessionId === cleanText(sessionId))
    .map(serializeEvent)
  const nodes = [...moments, ...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return {
    sessionId: cleanText(sessionId),
    nodes,
    pendingMediaCount: moments.filter((item) => item.completionStatus === 'needs_media' && !item.isTimelinePlaceholder).length,
  }
}

const createOrRefreshSessionBrief = ({ sessionId, profile }) => {
  assertSessionMember(sessionId, profile)
  const store = readMomentsStore()
  const timeline = getSessionTimeline({ sessionId, profile })
  const momentNodes = timeline.nodes.filter((item) => item.nodeKind === 'moment' && !item.isTimelinePlaceholder)
  const existing = store.sessionBriefs.find((item) => item.sessionId === cleanText(sessionId))
  const now = nowIso()
  const next = normalizeSessionBrief({
    ...(existing || {}),
    id: existing?.id || createId('brief'),
    sessionId,
    title: existing?.title || '聚会时间线简报',
    coverMode: 'opening_collage',
    openingMomentIds: momentNodes.filter((item) => item.nodeType === 'opening').map((item) => item.id),
    closingMomentIds: momentNodes.filter((item) => item.nodeType === 'closing').map((item) => item.id),
    timelineNodeIds: timeline.nodes.map((item) => item.id),
    pendingMediaCount: timeline.pendingMediaCount,
    rankingEligible: momentNodes.some((item) => item.rankingEligible === true),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  })
  store.sessionBriefs = existing
    ? store.sessionBriefs.map((item) => (item.id === existing.id ? next : item))
    : [next, ...store.sessionBriefs]
  writeMomentsStore(store)
  return {
    ...next,
    timeline,
    ...buildSessionLedgerSnapshot({ sessionId, timeline }),
  }
}

const getSessionBrief = ({ briefId, profile }) => {
  const store = readMomentsStore()
  const brief = store.sessionBriefs.find((item) => item.id === cleanText(briefId))
  if (!brief) {
    throw createHttpError('brief not found', 404)
  }
  const timeline = getSessionTimeline({ sessionId: brief.sessionId, profile })
  return {
    ...brief,
    timeline,
    ...buildSessionLedgerSnapshot({ sessionId: brief.sessionId, timeline }),
  }
}

const createShareImageTask = ({ briefId, profile, payload = {} }) => {
  const brief = getSessionBrief({ briefId, profile })
  assertEndedSessionHostForShareImage(brief.sessionId, profile)
  const layoutMode = cleanText(payload.layoutMode) || 'timeline'
  const store = readMomentsStore()
  const availableNodeIds = brief.timeline.nodes.filter(isTimelineNodeShareImageEligible).map((item) => item.id)
  const availableNodeIdSet = new Set(availableNodeIds)
  const requestedNodeIds = normalizeStringArray(payload.selectedNodeIds)
  const invalidNodeIds = requestedNodeIds.filter((nodeId) => !availableNodeIdSet.has(nodeId))
  if (invalidNodeIds.length) {
    throw createHttpError('selectedNodeIds must belong to visible brief timeline nodes', 400)
  }
  const selectedNodeIds = requestedNodeIds.length ? requestedNodeIds : availableNodeIds
  if (!selectedNodeIds.length) {
    throw createHttpError('selectedNodeIds required', 400)
  }
  const existing = store.shareImageTasks.find(
    (item) =>
      item.briefId === brief.id &&
      item.layoutMode === layoutMode &&
      ['pending', 'processing', 'ready'].includes(item.status) &&
      hasSameStringSet(item.selectedNodeIds, selectedNodeIds),
  )
  if (existing) {
    return decorateShareImageTask(existing)
  }
  const task = normalizeShareImageTask({
    id: createId('share-task'),
    sessionId: brief.sessionId,
    briefId: brief.id,
    status: 'pending',
    layoutMode,
    ledgerIncluded: payload.includeLedger === true || layoutMode === 'dual_flow',
    selectedNodeIds,
    createdAt: nowIso(),
  })
  store.shareImageTasks.unshift(task)
  store.sessionBriefs = store.sessionBriefs.map((item) =>
    item.id === brief.id ? normalizeSessionBrief({ ...item, shareImageTaskId: task.id, shareImageStatus: task.status, updatedAt: nowIso() }) : item,
  )
  writeMomentsStore(store)
  return decorateShareImageTask(task)
}

const getShareImageTask = ({ taskId, profile }) => {
  const store = readMomentsStore()
  const task = store.shareImageTasks.find((item) => item.id === cleanText(taskId))
  if (!task) {
    throw createHttpError('share task not found', 404)
  }
  assertSessionMember(task.sessionId, profile)
  return decorateShareImageTask(task)
}

const canAccessSessionShareImages = (session = {}, profileId = '') => {
  const normalizedProfileId = cleanText(profileId)
  if (!normalizedProfileId || !session) {
    return false
  }
  if (cleanText(session.hostProfileId) === normalizedProfileId) {
    return true
  }
  return Boolean(getSessionMember(session, normalizedProfileId))
}

const serializeShareImageSummary = ({ task, session }) => {
  const decoratedTask = decorateShareImageTask(task)
  const imageUrl = cleanText(task.imageUrl)
  return {
    taskId: cleanText(task.id),
    sessionId: cleanText(task.sessionId),
    sessionName: cleanText(session?.name || session?.sessionName),
    briefId: cleanText(task.briefId),
    status: cleanText(task.status),
    imageUrl,
    readyShareImageUrl: cleanText(decoratedTask.readyShareImageUrl),
    posterImageUrl: cleanText(decoratedTask.posterImageUrl),
    miniProgramQrUrl: cleanText(decoratedTask.miniProgramQrUrl),
    qrCodeUrl: cleanText(decoratedTask.qrCodeUrl),
    createdAt: cleanText(task.createdAt),
    updatedAt: cleanText(task.updatedAt),
    finishedAt: cleanText(task.finishedAt),
  }
}

const getUserShareImageSummaries = ({ profile }) => {
  const profileId = getProfileId(profile)
  if (!profileId) {
    throw createHttpError('unauthorized', 401)
  }
  const store = readMomentsStore()
  return store.shareImageTasks
    .filter((task) => cleanText(task.status) === 'ready' && cleanText(task.imageUrl))
    .map((task) => {
      const session = getManagedSessionById(task.sessionId)
      return { task, session }
    })
    .filter(({ session }) => canAccessSessionShareImages(session, profileId))
    .map(serializeShareImageSummary)
    .sort((left, right) => {
      const rightTime = cleanText(right.finishedAt || right.updatedAt || right.createdAt)
      const leftTime = cleanText(left.finishedAt || left.updatedAt || left.createdAt)
      return rightTime.localeCompare(leftTime)
    })
}

const updateBriefTaskStatus = (store, task) => {
  store.sessionBriefs = store.sessionBriefs.map((item) =>
    item.id === task.briefId
      ? normalizeSessionBrief({
          ...item,
          shareImageTaskId: task.id,
          shareImageStatus: task.status,
          updatedAt: nowIso(),
        })
      : item,
  )
}

const processShareImageTask = async ({ taskId, profile }) => {
  const store = readMomentsStore()
  const index = store.shareImageTasks.findIndex((item) => item.id === cleanText(taskId))
  if (index === -1) {
    throw createHttpError('share task not found', 404)
  }
  const existed = store.shareImageTasks[index]
  assertEndedSessionHostForShareImage(existed.sessionId, profile)
  if (!['pending', 'failed', 'expired'].includes(existed.status)) {
    throw createHttpError('share task is not processable', 409)
  }

  const processingTask = normalizeShareImageTask({
    ...existed,
    status: 'processing',
    failedReason: '',
    startedAt: nowIso(),
    updatedAt: nowIso(),
  })
  store.shareImageTasks[index] = processingTask
  updateBriefTaskStatus(store, processingTask)
  writeMomentsStore(store)

  try {
    const nextStore = readMomentsStore()
    const task = nextStore.shareImageTasks.find((item) => item.id === processingTask.id)
    const brief = nextStore.sessionBriefs.find((item) => item.id === processingTask.briefId)
    if (!task || !brief) {
      throw createHttpError('share task source not found', 404)
    }
    const nodes = getTaskVisibleNodes(nextStore, task)
    if (!nodes.length) {
      throw createHttpError('share task has no visible nodes', 400)
    }
    const timeline = getSessionTimeline({ sessionId: task.sessionId, profile })
    const ledgerSnapshot = buildSessionLedgerSnapshot({ sessionId: task.sessionId, timeline })
    const svg = await buildShareImageSvg({ brief, task, nodes, ledgerSnapshot })
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
    const fileName = `${task.id}.png`
    const storedObject = await putObject({
      key: `moments/share-tasks/${fileName}`,
      buffer,
      contentType: 'image/png',
    })

    const latestStore = readMomentsStore()
    const latestIndex = latestStore.shareImageTasks.findIndex((item) => item.id === task.id)
    if (latestIndex === -1) {
      throw createHttpError('share task not found', 404)
    }
    const readyTask = normalizeShareImageTask({
      ...latestStore.shareImageTasks[latestIndex],
      status: 'ready',
      imageUrl: storedObject.url,
      objectKey: storedObject.objectKey,
      publicUrl: storedObject.publicUrl,
      localCompatUrl: storedObject.localCompatUrl,
      storageProvider: storedObject.provider,
      failedReason: '',
      finishedAt: nowIso(),
      updatedAt: nowIso(),
    })
    latestStore.shareImageTasks[latestIndex] = readyTask
    updateBriefTaskStatus(latestStore, readyTask)
    writeMomentsStore(latestStore)
    return decorateShareImageTask(readyTask)
  } catch (error) {
    const failedStore = readMomentsStore()
    const failedIndex = failedStore.shareImageTasks.findIndex((item) => item.id === processingTask.id)
    if (failedIndex === -1) {
      throw error
    }
    const failedTask = normalizeShareImageTask({
      ...failedStore.shareImageTasks[failedIndex],
      status: 'failed',
      failedReason: error instanceof Error ? error.message : 'share image generation failed',
      finishedAt: nowIso(),
      updatedAt: nowIso(),
    })
    failedStore.shareImageTasks[failedIndex] = failedTask
    updateBriefTaskStatus(failedStore, failedTask)
    writeMomentsStore(failedStore)
    return decorateShareImageTask(failedTask)
  }
}

const retryShareImageTask = ({ taskId, profile }) => {
  const store = readMomentsStore()
  const index = store.shareImageTasks.findIndex((item) => item.id === cleanText(taskId))
  if (index === -1) {
    throw createHttpError('share task not found', 404)
  }
  const existed = store.shareImageTasks[index]
  assertEndedSessionHostForShareImage(existed.sessionId, profile)
  if (!['failed', 'expired'].includes(existed.status)) {
    throw createHttpError('only failed or expired share tasks can be retried', 409)
  }
  const task = normalizeShareImageTask({
    ...existed,
    status: 'pending',
    failedReason: '',
    retryCount: existed.retryCount + 1,
    updatedAt: nowIso(),
  })
  store.shareImageTasks[index] = task
  updateBriefTaskStatus(store, task)
  writeMomentsStore(store)
  return decorateShareImageTask(task)
}

const getReadableBriefForSummary = ({ store, sessionId, profile }) => {
  const sessionBriefs = store.sessionBriefs
    .filter((item) => item.sessionId === cleanText(sessionId))
    .sort((left, right) => cleanText(right.updatedAt || right.createdAt).localeCompare(cleanText(left.updatedAt || left.createdAt)))
  for (const brief of sessionBriefs) {
    try {
      return getSessionBrief({ briefId: brief.id, profile })
    } catch (error) {
      continue
    }
  }
  return null
}

const isSummaryEndedState = (session = {}, report = {}) =>
  Boolean(cleanText(session?.endedAt)) ||
  cleanText(session?.state).includes('结束') ||
  cleanText(session?.status).includes('结束') ||
  cleanText(report?.state).includes('结束') ||
  cleanText(report?.status).includes('结束')

const getSummaryStateFields = (session = {}, report = {}) => {
  if (isSummaryEndedState(session, report)) {
    return {
      endedAt: cleanText(session?.endedAt || report?.endedAt || report?.createdAt),
      state: '已结束',
      stateText: '已结束',
      status: '已结束',
      updatedAt: cleanText(session?.updatedAt || session?.endedAt || report?.updatedAt || report?.createdAt),
    }
  }
  const state = cleanText(session?.state || report?.state || report?.status || '进行中')
  const status = cleanText(session?.status || report?.status || state || '进行中')
  return {
    endedAt: '',
    state,
    stateText: state,
    status,
    updatedAt: cleanText(session?.updatedAt || report?.updatedAt || report?.createdAt),
  }
}

const getUserSessionMomentSummaries = ({ profile }) => {
  const profileId = getProfileId(profile)
  if (!profileId) {
    throw createHttpError('unauthorized', 401)
  }
  const reports = listManagedReports(profileId, 'all')
  const store = readMomentsStore()
  return reports.map((report) => {
    const sessionId = cleanText(report.sessionId)
    const session = sessionId ? getManagedSessionById(sessionId) : null
    const stateFields = getSummaryStateFields(session, report)
    const isEndedSession = stateFields.state.includes('结束') || stateFields.status.includes('结束') || Boolean(stateFields.endedAt)
    const moments = store.momentRecords.filter((item) => item.sessionId === sessionId && !item.removedAt)
    const brief = getReadableBriefForSummary({ store, sessionId, profile })
    const task = brief?.shareImageTaskId ? store.shareImageTasks.find((item) => item.id === brief.shareImageTaskId) : null
    const firstPhotoMoment = moments
      .filter((item) => cleanText(item.imageUrl))
      .sort((left, right) => cleanText(left.createdAt || left.id).localeCompare(cleanText(right.createdAt || right.id)))[0] || null
    const coverPhotoUrl = cleanText(
      firstPhotoMoment?.imageUrl,
    )
    const firstPhotoUploadedAt = cleanText(session?.firstPhotoUploadedAt || firstPhotoMoment?.createdAt)
    const hasFirstPhoto = Boolean(session?.hasFirstPhoto === true || firstPhotoUploadedAt || coverPhotoUrl)
    const resumableMomentIds = isEndedSession
      ? []
      : moments
          .filter((item) => item.uploaderProfileId === profileId && item.completionStatus === 'needs_media')
          .map((item) => item.id)
    const readyShareImageUrl = cleanText(task?.imageUrl || task?.posterImageUrl || task?.readyShareImageUrl)
    return {
      sessionId,
      reportId: report.reportId || report.id,
      sessionName: report.sessionName,
      title: report.title,
      state: stateFields.state,
      stateText: stateFields.stateText,
      status: stateFields.status,
      endedAt: stateFields.endedAt,
      firstPhotoUploadedAt,
      hasFirstPhoto,
      isActiveForResume: hasFirstPhoto && !isEndedSession,
      updatedAt: stateFields.updatedAt,
      canResume: resumableMomentIds.length > 0,
      canShare: Boolean(brief?.id && (task?.status === 'ready' ? readyShareImageUrl : brief.shareImageTaskId || task?.id)),
      coverPhotoUrl,
      pendingMediaCount: moments.filter((item) => item.uploaderProfileId === profileId && item.completionStatus === 'needs_media').length,
      canResumeMomentIds: resumableMomentIds,
      briefId: brief?.id || '',
      shareImageTaskId: task?.id || '',
      shareImageStatus: task?.status || '',
      shareImageUrl: task?.imageUrl || '',
      readyShareImageUrl,
      rankingEntryEnabled: Boolean(brief?.rankingEligible),
    }
  })
}

const buildRankingEntry = ({ moment, nominations, rank, category }) => {
  const pointsTotal = nominations.reduce((sum, item) => sum + (Number(item.pointsSpent) || 0), 0)
  const nominationCount = nominations.length
  const latestNominationAt = nominations
    .map((item) => item.createdAt)
    .filter(Boolean)
    .sort()
    .at(-1) || ''
  return {
    category,
    moment: serializeMomentForPublicRanking(moment),
    nominationCount,
    pointsTotal,
    rank,
    score: pointsTotal + nominationCount,
    latestNominationAt,
  }
}

const listTodayRankings = ({ category = 'today_highlight', limit = 20 } = {}) => {
  const normalizedCategory = RANKING_CATEGORIES.has(cleanText(category)) ? cleanText(category) : 'today_highlight'
  const today = getTodayYmd()
  const store = readMomentsStore()
  const momentMap = new Map(
    store.momentRecords
      .filter((item) => isMomentPublicForRanking(item))
      .map((item) => [item.id, item]),
  )
  const nominationGroups = new Map()
  store.momentNominations
    .filter((item) => item.status === 'active' && item.category === normalizedCategory && getTodayYmd(item.createdAt) === today)
    .forEach((item) => {
      if (!momentMap.has(item.momentId)) {
        return
      }
      const group = nominationGroups.get(item.momentId) || []
      group.push(item)
      nominationGroups.set(item.momentId, group)
    })
  return {
    category: normalizedCategory,
    date: today,
    items: Array.from(nominationGroups.entries())
      .map(([momentId, nominations]) => buildRankingEntry({ moment: momentMap.get(momentId), nominations, category: normalizedCategory }))
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score
        if (right.pointsTotal !== left.pointsTotal) return right.pointsTotal - left.pointsTotal
        return new Date(right.latestNominationAt).getTime() - new Date(left.latestNominationAt).getTime()
      })
      .slice(0, Math.max(1, Math.min(100, Number(limit) || 20)))
      .map((item, index) => ({ ...item, rank: index + 1 })),
  }
}

const getMomentNominationEligibility = ({ momentId, profile, category }) => {
  const profileId = getProfileId(profile)
  if (!profileId) {
    throw createHttpError('unauthorized', 401)
  }
  const store = readMomentsStore()
  const moment = findMomentById(store, momentId)
  if (!moment) {
    throw createHttpError('moment not found', 404)
  }
  assertSessionMember(moment.sessionId, profile)
  const normalizedCategory = getRankingCategory(category, moment)
  const ineligibility = getMomentNominationIneligibility(moment)
  const eligible = isMomentPublicForRanking(moment)
  const today = getTodayYmd()
  const alreadyNominatedToday = store.momentNominations.some(
    (item) =>
      item.status === 'active' &&
      item.momentId === moment.id &&
      item.profileId === profileId &&
      item.category === normalizedCategory &&
      getTodayYmd(item.createdAt) === today,
  )
  return {
    alreadyNominatedToday,
    category: normalizedCategory,
    eligible: eligible && !alreadyNominatedToday,
    momentId: moment.id,
    pointsCost: DEFAULT_NOMINATION_POINTS,
    reason: !eligible ? ineligibility.reason || 'moment is not eligible for ranking' : alreadyNominatedToday ? 'already nominated today' : '',
    reasonCode: !eligible ? ineligibility.reasonCode || 'not_eligible' : alreadyNominatedToday ? 'already_nominated_today' : '',
    reasonText: !eligible ? ineligibility.reasonText || '暂未满足回忆榜资格' : alreadyNominatedToday ? '今天已推举过这张照片' : '',
  }
}

const createMomentNomination = ({ momentId, profile, payload = {} }) => {
  const profileId = getProfileId(profile)
  if (!profileId) {
    throw createHttpError('unauthorized', 401)
  }
  const store = readMomentsStore()
  const moment = findMomentById(store, momentId)
  if (!moment) {
    throw createHttpError('moment not found', 404)
  }
  assertSessionMember(moment.sessionId, profile)
  const category = getRankingCategory(payload.category, moment)
  const clientNominationId = cleanText(payload.clientNominationId)
  const existingByClientId =
    clientNominationId &&
    store.momentNominations.find(
      (item) => item.clientNominationId === clientNominationId && item.profileId === profileId && item.momentId === moment.id,
    )
  if (existingByClientId) {
    return existingByClientId
  }
  const eligibility = getMomentNominationEligibility({ momentId: moment.id, profile, category })
  if (!eligibility.eligible) {
    throw createHttpError(eligibility.reasonText || eligibility.reason || 'moment is not eligible for ranking', eligibility.alreadyNominatedToday ? 409 : 400)
  }

  const contentStore = readContentStore()
  const userState = ensureUserCommerceState(contentStore, profileId)
  if (Number(userState.points || 0) < DEFAULT_NOMINATION_POINTS) {
    throw createHttpError('points not enough', 400)
  }

  const nomination = normalizeMomentNomination({
    id: createId('nomination'),
    clientNominationId,
    momentId: moment.id,
    sessionId: moment.sessionId,
    profileId,
    profileName: cleanText(profile.name),
    category,
    pointsSpent: DEFAULT_NOMINATION_POINTS,
    status: 'active',
    createdAt: nowIso(),
  })

  userState.points = Math.max(0, Number(userState.points || 0) - DEFAULT_NOMINATION_POINTS)
  userState.pointsLedger.unshift(
    createPointsLedgerEntry({
      delta: -DEFAULT_NOMINATION_POINTS,
      kind: 'moment-nomination',
      sourceId: nomination.id,
      title: `推举精彩瞬间：${category}`,
    }),
  )
  writeContentStore(contentStore)

  store.momentNominations.unshift(nomination)
  writeMomentsStore(store)
  return nomination
}

const parseImageDataUrl = (value) => {
  const match = cleanText(value).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/)
  if (!match) {
    throw createHttpError('invalid image dataUrl', 400)
  }
  const mimeType = match[1].toLowerCase()
  if (!IMAGE_MIME_EXTENSION_MAP[mimeType]) {
    throw createHttpError('only jpeg, png and webp are supported', 400)
  }
  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length || buffer.length > MAX_MOMENT_IMAGE_BYTES) {
    throw createHttpError('image size must be within 5MB', 400)
  }
  return { buffer, mimeType }
}

const uploadMomentImage = async ({ profile, payload = {} }) => {
  const sessionId = cleanText(payload.sessionId)
  assertSessionMember(sessionId, profile)
  const { buffer } = parseImageDataUrl(payload.dataUrl)
  const safeBaseName =
    cleanText(path.parse(cleanText(payload.fileName) || 'moment').name)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'moment'
  const storedName = `${Date.now()}-${safeBaseName}-${crypto.randomBytes(3).toString('hex')}.webp`
  const output = await sharp(buffer)
    .rotate()
    .resize({
      width: MOMENT_IMAGE_WIDTH,
      height: MOMENT_IMAGE_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: MOMENT_IMAGE_QUALITY, effort: 5 })
    .toBuffer()
  const storedObject = await putObject({
    key: `moments/${sessionId || 'general'}/${storedName}`,
    buffer: output,
    contentType: 'image/webp',
  })

  const asset = {
    id: createId('moment-asset'),
    sessionId,
    uploaderProfileId: getProfileId(profile),
    fileName: cleanText(payload.fileName) || storedName,
    mimeType: 'image/webp',
    size: output.length,
    url: storedObject.url,
    objectKey: storedObject.objectKey,
    publicUrl: storedObject.publicUrl,
    localCompatUrl: storedObject.localCompatUrl,
    storageProvider: storedObject.provider,
    createdAt: nowIso(),
  }
  const store = readMomentsStore()
  store.uploadedAssets.unshift(asset)
  writeMomentsStore(store)
  return asset
}

module.exports = {
  cleanupExpiredMomentUploads,
  cleanupMomentUpload,
  createMoment,
  createOrRefreshSessionBrief,
  createSessionEvent,
  createShareImageTask,
  deleteMoment,
  flushMomentsStore: storeAccessor.flush,
  getSessionBrief,
  getSessionTimeline,
  getShareImageTask,
  getUserShareImageSummaries,
  getUserSessionMomentSummaries,
  getPublicSessionShareSummary,
  grantRankingRewards,
  initMomentsStore: storeAccessor.init,
  createMomentNomination,
  getMomentNominationEligibility,
  listTodayRankings,
  processShareImageTask,
  readMomentsStore,
  refundMomentNominationsForMoment,
  retryShareImageTask,
  updateMoment,
  uploadMomentImage,
  writeMomentsStore,
  _buildShareImageSvgForTest: buildShareImageSvg,
}
