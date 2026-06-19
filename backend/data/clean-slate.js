const fs = require('fs')
const path = require('path')
const { getAdminStore, getManagedSessionById, getManagedSessionByInviteCode } = require('./admin')
const { listAdminAssets } = require('./assets')
const { getLiveSessionConfig } = require('./front')
const { readSocialStore } = require('./social')

const cleanText = (value = '') => String(value || '').trim()
const FIXTURE_TEXT_PATTERN = /(IT-MOMENTS|PR\s*Seed|dual[_-]?flow|fixture|sample|test|judge|酒局)/i
const FIXTURE_TEXT_REPLACE_PATTERN = /(IT-MOMENTS|PR\s*Seed|dual[_-]?flow|fixture|sample|test|judge|酒局)/gi
const INTERNAL_ID_PATTERN = /\b(?:session|brief|share-task|task|moment|event|user|nomination|ranking-reward-payout)-[a-z0-9-]+\b/gi

const containsFixtureText = (value = '') => FIXTURE_TEXT_PATTERN.test(cleanText(value))
const sanitizeDisplayText = (value = '', fallback = '') => {
  const text = cleanText(value)
    .replace(FIXTURE_TEXT_REPLACE_PATTERN, '')
    .replace(INTERNAL_ID_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return text || fallback
}

const sanitizeLegacyLabel = (value = '', fallback = '') => {
  const text = sanitizeDisplayText(value, fallback).replace(/酒局/g, '聚会').replace(/judge/gi, 'party').trim()
  return containsFixtureText(value) ? fallback || text : text || fallback
}

const countValue = (value) => {
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') return Object.keys(value).length
  return value == null ? 0 : 1
}

const mapMemberStatus = (value = '') => {
  const text = cleanText(value)
  if (text === '已加入') return 'joined'
  if (text === '待加入') return 'invited'
  return text || 'unknown'
}

const mapSessionState = (value = '') => {
  const text = cleanText(value)
  if (text.includes('等待')) return 'draft'
  if (text.includes('进行')) return 'live'
  if (text.includes('结束')) return 'closed'
  return text || 'unknown'
}

const mapShareTaskStatus = (value = '') => {
  const text = cleanText(value)
  if (['pending', 'processing', 'ready', 'failed', 'expired'].includes(text)) return text
  return text || 'pending'
}

const mapRenderMode = (value = '') => {
  const text = cleanText(value)
  if (text === 'dual_flow' || text === 'timeline') return 'party_story'
  return ['party_story', 'photo_wall', 'brief_story'].includes(text) ? text : 'party_story'
}

const mapCoverMode = (value = '') => {
  const text = cleanText(value)
  if (text === 'opening_collage') return 'photo_wall'
  return ['photo_wall', 'brief_story'].includes(text) ? text : 'photo_wall'
}

const mapLedgerType = (value = '') => {
  const text = cleanText(value)
  if (text === 'drink_debt') return 'pending'
  if (text === 'drink_add') return 'added'
  if (text === 'wheel_result') return 'note'
  if (text === 'debt') return 'pending'
  if (text === 'drunk') return 'completed'
  if (text === 'add_wine') return 'added'
  if (text === 'cleared') return 'cleared'
  return text || 'note'
}

const buildPublicPhotoTitle = (value = '') => {
  const text = cleanText(value)
  if (text === 'opening') return '聚会开场'
  if (text === 'closing') return '收尾回忆'
  if (text === 'drinking') return '账本高光'
  return '精彩瞬间'
}

const buildLedgerEventTitle = (value = '') => {
  const text = cleanText(value)
  if (text === 'drink_debt') return '待处理记录'
  if (text === 'drink_add') return '加酒记录'
  if (text === 'wheel_result') return '关键互动'
  return '聚会记录'
}

const maskToken = (value = '') => {
  const text = cleanText(value)
  return text ? `***${text.slice(-8)}` : ''
}

const sanitizeFailureReason = (value = '') => {
  const text = cleanText(value).toLowerCase()
  if (!text) return ''
  if (text.includes('no visible nodes') || text.includes('selectednodeids')) {
    return '当前没有可分享的公开内容，请先补充照片或账本高光。'
  }
  if (text.includes('expired')) {
    return '分享图已过期，请重新生成。'
  }
  return '分享图暂时生成失败，请稍后重试。'
}

const buildPartyMembers = (liveSession = {}) =>
  Array.isArray(liveSession.joinStatusPlayers)
    ? liveSession.joinStatusPlayers.map((item, index) => ({
        memberId: cleanText(item.profileId) || `member-${index + 1}`,
        profileId: cleanText(item.profileId),
        name: sanitizeLegacyLabel(item.name, `成员${index + 1}`),
        avatarUrl: cleanText(item.avatarUrl),
        status: mapMemberStatus(item.status),
        debtCount: Math.max(0, Number(item.debtCount) || 0),
        drinkCount: Math.max(0, Number(item.drinkCount) || 0),
        clearedCount: Math.max(0, Number(item.clearedCount) || 0),
        isHost: cleanText(item.profileId) && cleanText(item.profileId) === cleanText(liveSession.hostProfileId),
      }))
    : []

const mapPhotoHighlight = (item = {}) => ({
  photoType: cleanText(item.nodeType) || 'highlight',
  title: sanitizeDisplayText(item.title, buildPublicPhotoTitle(item.nodeType)),
  imageUrl: cleanText(item.imageUrl),
  uploaderAvatarUrl: cleanText(item.uploaderAvatarUrl),
  capturedAt: cleanText(item.createdAt),
})

const mapAccountingHighlight = (item = {}) => ({
  type: mapLedgerType(item.type),
  label: sanitizeDisplayText(item.label, '账本记录'),
  value: Math.max(0, Number(item.value) || 0),
  unit: sanitizeDisplayText(item.unit, '条'),
  text: sanitizeDisplayText(item.text, '暂无账本高光'),
})

const mapLedgerSummary = (summary = {}) => ({
  participantCount: Math.max(0, Number(summary.participantCount) || 0),
  entryCount: Math.max(0, Number(summary.ledgerCount) || 0),
  pendingCount: Math.max(0, Number(summary.debtCups) || 0),
  completedCount: Math.max(0, Number(summary.drunkCups) || 0),
  addedCount: Math.max(0, Number(summary.addWineCount) || 0),
  clearedCount: Math.max(0, Number(summary.clearedCups) || 0),
  keyEventCount: Math.max(0, Number(summary.keyEventCount) || 0),
  hasLedgerData: summary.hasLedgerData === true,
  emptyText: sanitizeDisplayText(summary.emptyText, '聚会账本还没开始，先记一笔。'),
})

const mapSettlementSummary = (summary = {}) => ({
  status: cleanText(summary.status) || 'empty',
  text: sanitizeDisplayText(summary.text, '聚会账本还没开始，先记一笔。'),
})

const mapKeyEvent = (item = {}) => ({
  type: mapLedgerType(item.type || item.eventType),
  title: buildLedgerEventTitle(item.type || item.eventType),
  text: sanitizeDisplayText(item.text, buildLedgerEventTitle(item.type || item.eventType)),
  operatorAvatarUrl: cleanText(item.operatorAvatarUrl),
  targetAvatarUrl: cleanText(item.targetAvatarUrl),
  happenedAt: cleanText(item.createdAt),
})

const buildShareNotice = (notice = '') =>
  sanitizeDisplayText(notice, '仅展示已授权公开内容。')

const PARTY_LIVE_WHITELIST = [
  'partyId',
  'inviteCode',
  'title',
  'createdAt',
  'coverImageUrl',
  'coverPhotoUrl',
  'status',
  'memberCount',
  'joinedCount',
  'photoHighlights',
  'accountingHighlights',
  'ledgerSummary',
  'keyEvents',
  'shareNotice',
  'summary',
]

const BRIEF_WHITELIST = [
  'briefId',
  'partyId',
  'title',
  'coverMode',
  'generatedAt',
  'photoHighlights',
  'accountingHighlights',
  'ledgerSummary',
  'settlementSummary',
  'keyEvents',
  'shareNotice',
  'summary',
]

const SHARE_IMAGE_WHITELIST = [
  'shareImageId',
  'partyId',
  'briefId',
  'status',
  'renderMode',
  'imageUrl',
  'includeLedger',
  'createdAt',
  'finishedAt',
  'message',
]

const buildPartySummary = (payload = {}) => ({
  photoCount: Array.isArray(payload.photoHighlights) ? payload.photoHighlights.length : 0,
  accountingHighlightCount: Array.isArray(payload.accountingHighlights) ? payload.accountingHighlights.length : 0,
  keyEventCount: Array.isArray(payload.keyEvents) ? payload.keyEvents.length : 0,
})

const buildBriefSummary = (payload = {}) => ({
  photoCount: Array.isArray(payload.photoHighlights) ? payload.photoHighlights.length : 0,
  accountingHighlightCount: Array.isArray(payload.accountingHighlights) ? payload.accountingHighlights.length : 0,
  keyEventCount: Array.isArray(payload.keyEvents) ? payload.keyEvents.length : 0,
})

const serializePartyLivePayload = (liveSession = {}) => {
  const photoHighlights = Array.isArray(liveSession.photoHighlights) ? liveSession.photoHighlights.slice(0, 6).map(mapPhotoHighlight).filter((item) => item.imageUrl) : []
  const accountingHighlights = Array.isArray(liveSession.accountingHighlights) ? liveSession.accountingHighlights.slice(0, 4).map(mapAccountingHighlight) : []
  const keyEvents = Array.isArray(liveSession.keyEvents || liveSession.eventHighlights) ? (liveSession.keyEvents || liveSession.eventHighlights).slice(0, 3).map(mapKeyEvent) : []
  const payload = {
    partyId: cleanText(liveSession.id),
    inviteCode: cleanText(liveSession.inviteCode),
    title: sanitizeLegacyLabel(liveSession.sessionName || liveSession.title, '聚会记录'),
    createdAt: cleanText(liveSession.createdAt),
    coverImageUrl: cleanText(liveSession.templateImageUrl),
    coverPhotoUrl: cleanText(liveSession.coverPhotoUrl || photoHighlights[0]?.imageUrl),
    status: mapSessionState(liveSession.stateText || liveSession.status),
    memberCount: Math.max(Array.isArray(buildPartyMembers(liveSession)) ? buildPartyMembers(liveSession).length : 0, Number(liveSession.playerCount) || 0),
    joinedCount: Math.max(0, Number(liveSession.joinedCount) || 0),
    photoHighlights,
    accountingHighlights,
    ledgerSummary: mapLedgerSummary(liveSession.ledgerSummary || {}),
    keyEvents,
    shareNotice: buildShareNotice(liveSession.shareContentFilter?.notice),
  }
  payload.summary = buildPartySummary(payload)
  return payload
}

const buildBriefPhotoHighlights = (brief = {}) => {
  const fromHighlights = Array.isArray(brief.photoHighlights) ? brief.photoHighlights.map(mapPhotoHighlight).filter((item) => item.imageUrl) : []
  if (fromHighlights.length) return fromHighlights.slice(0, 6)
  const timelineNodes = Array.isArray(brief.timeline?.nodes) ? brief.timeline.nodes : []
  return timelineNodes
    .filter((item) => item && item.nodeKind === 'moment' && cleanText(item.imageUrl) && item.usageConsent?.share === true && item.visibility !== 'private' && item.visibility !== 'selected')
    .slice(0, 6)
    .map((item) => ({
      photoType: cleanText(item.nodeType) || 'highlight',
      title: buildPublicPhotoTitle(item.nodeType),
      imageUrl: cleanText(item.imageUrl),
      uploaderAvatarUrl: cleanText(item.uploaderAvatarUrl),
      capturedAt: cleanText(item.createdAt),
    }))
}

const serializeBriefPayload = (brief = {}) => {
  const payload = {
    briefId: cleanText(brief.id),
    partyId: cleanText(brief.sessionId),
    title: sanitizeLegacyLabel(brief.title, '聚会简报'),
    coverMode: mapCoverMode(brief.coverMode),
    generatedAt: cleanText(brief.updatedAt || brief.createdAt),
    photoHighlights: buildBriefPhotoHighlights(brief),
    accountingHighlights: Array.isArray(brief.accountingHighlights) ? brief.accountingHighlights.slice(0, 4).map(mapAccountingHighlight) : [],
    ledgerSummary: mapLedgerSummary(brief.ledgerSummary || {}),
    settlementSummary: mapSettlementSummary(brief.settlementSummary || {}),
    keyEvents: Array.isArray(brief.eventHighlights) ? brief.eventHighlights.slice(0, 3).map(mapKeyEvent) : [],
    shareNotice: buildShareNotice(brief.shareContentFilter?.notice),
  }
  payload.summary = buildBriefSummary(payload)
  return payload
}

const serializeShareImagePayload = (task = {}) => ({
  shareImageId: cleanText(task.id),
  partyId: cleanText(task.sessionId),
  briefId: cleanText(task.briefId),
  status: mapShareTaskStatus(task.status),
  renderMode: mapRenderMode(task.layoutMode),
  imageUrl: cleanText(task.imageUrl),
  posterImageUrl: cleanText(task.posterImageUrl || task.imageUrl),
  readyShareImageUrl: cleanText(task.readyShareImageUrl || task.imageUrl),
  miniProgramQrUrl: cleanText(task.miniProgramQrUrl || task.qrCodeUrl),
  qrCodeUrl: cleanText(task.qrCodeUrl || task.miniProgramQrUrl),
  includeLedger: task.ledgerIncluded === true,
  createdAt: cleanText(task.createdAt),
  finishedAt: cleanText(task.readyAt || task.updatedAt),
  message: sanitizeFailureReason(task.failureReason || task.failedReason),
})

const buildPartyLiveDebugSummary = (liveSession = {}) => ({
  filteredNodeCount: Array.isArray(liveSession.filteredNodeIds) ? liveSession.filteredNodeIds.length : 0,
  visibleNodeCount: Array.isArray(liveSession.visibleNodeIds) ? liveSession.visibleNodeIds.length : 0,
  permissionState: cleanText(liveSession.permissionState),
  hasPublicAccessState: Boolean(liveSession.publicAccessState),
  rawEventTypes: Array.isArray(liveSession.eventHighlights) ? [...new Set(liveSession.eventHighlights.map((item) => cleanText(item.type || item.eventType)).filter(Boolean))] : [],
})

const buildBriefDebugSummary = (brief = {}) => ({
  filteredNodeCount: Array.isArray(brief.shareContentFilter?.filteredNodeIds) ? brief.shareContentFilter.filteredNodeIds.length : 0,
  timelineNodeCount: Array.isArray(brief.timeline?.nodes) ? brief.timeline.nodes.length : 0,
  rawEventTypes: Array.isArray(brief.eventHighlights) ? [...new Set(brief.eventHighlights.map((item) => cleanText(item.type || item.eventType)).filter(Boolean))] : [],
})

const buildShareImageDebugSummary = (task = {}) => ({
  selectedNodeCount: Array.isArray(task.selectedNodeIds) ? task.selectedNodeIds.length : 0,
  rawLayoutMode: cleanText(task.layoutMode),
  rawFailureReason: cleanText(task.failureReason),
})

const mapPartyLive = (liveSession = {}) => serializePartyLivePayload(liveSession)
const mapBrief = (brief = {}) => serializeBriefPayload(brief)
const mapShareImage = (task = {}) => serializeShareImagePayload(task)
const getPartyLiveFacade = (sessionId, inviteCode) => mapPartyLive(getLiveSessionConfig(sessionId, inviteCode))

const extractKeepShape = (store = {}, keepKeys = [], defaultValues = {}) => {
  const snapshot = {}
  keepKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(store, key)) {
      snapshot[key] = store[key]
    } else if (Object.prototype.hasOwnProperty.call(defaultValues, key)) {
      snapshot[key] = defaultValues[key]
    } else {
      snapshot[key] = null
    }
  })
  return snapshot
}

const summarizeStore = (store = {}, keepKeys = [], removedKeys = [], defaultValues = {}) => ({
  keepKeys,
  removedKeys,
  counts: keepKeys.reduce((result, key) => {
    result[key] = countValue(store[key])
    return result
  }, {}),
  snapshot: extractKeepShape(store, keepKeys, defaultValues),
})

const mapSeedLedgerType = (value = '') => mapLedgerType(value)
const pickPreferredShareTask = (tasks = []) =>
  tasks.find((item) => cleanText(item.status) === 'ready') ||
  tasks.find((item) => cleanText(item.status) === 'pending') ||
  tasks.find((item) => cleanText(item.status) === 'processing') ||
  tasks.find((item) => cleanText(item.status) === 'failed') ||
  tasks[0] ||
  null

const pickPreferredMoment = (moments = []) =>
  moments.find((item) => item && item.usageConsent?.share === true && cleanText(item.imageUrl) && item.visibility !== 'private' && item.visibility !== 'selected') ||
  moments.find((item) => item && cleanText(item.imageUrl)) ||
  moments[0] ||
  null

const pickPreferredEvent = (events = []) =>
  events.find((item) => cleanText(item.eventType) === 'drink_debt') ||
  events.find((item) => cleanText(item.eventType) === 'drink_add') ||
  events[0] ||
  null

const readJsonFileIfExists = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    return null
  }
}

const buildPRCSPrivateTokenGuide = ({ privateManifestPath = '', env = process.env } = {}) => {
  const normalizedPath = cleanText(privateManifestPath)
  const manifest = normalizedPath ? readJsonFileIfExists(normalizedPath) : null
  const manifestTokens = manifest?.profiles
    ? {
        host: cleanText(manifest.profiles.host?.token),
        memberA: cleanText(manifest.profiles.memberA?.token),
        memberB: cleanText(manifest.profiles.memberB?.token),
        outsider: cleanText(manifest.profiles.outsider?.token),
      }
    : {}
  const envTokens = {
    host: cleanText(env.PRCS_HOST_TOKEN),
    memberA: cleanText(env.PRCS_MEMBER_A_TOKEN),
    memberB: cleanText(env.PRCS_MEMBER_B_TOKEN),
    outsider: cleanText(env.PRCS_OUTSIDER_TOKEN),
  }
  const mergedTokens = {
    host: manifestTokens.host || envTokens.host,
    memberA: manifestTokens.memberA || envTokens.memberA,
    memberB: manifestTokens.memberB || envTokens.memberB,
    outsider: manifestTokens.outsider || envTokens.outsider,
  }
  return {
    mode: manifest ? 'private_manifest' : Object.values(envTokens).some(Boolean) ? 'environment' : 'pending_seed',
    privateManifestPath: manifest ? path.basename(normalizedPath) : '',
    instructions: [
      '完整 token 仅放 private manifest 或本机环境变量，不写入公开文档。',
      '优先使用 private manifest 的 profiles.*.token；如无文件，则使用 PRCS_HOST_TOKEN / PRCS_MEMBER_A_TOKEN / PRCS_MEMBER_B_TOKEN / PRCS_OUTSIDER_TOKEN。',
      '公开回报只保留 token 后 8 位。',
    ],
    tokenSuffixes: {
      host: maskToken(mergedTokens.host),
      memberA: maskToken(mergedTokens.memberA),
      memberB: maskToken(mergedTokens.memberB),
      outsider: maskToken(mergedTokens.outsider),
    },
    requiredEnvKeys: ['PRCS_HOST_TOKEN', 'PRCS_MEMBER_A_TOKEN', 'PRCS_MEMBER_B_TOKEN', 'PRCS_OUTSIDER_TOKEN'],
  }
}

const getPayloadWhitelists = () => ({
  partiesLive: PARTY_LIVE_WHITELIST,
  briefs: BRIEF_WHITELIST,
  shareImages: SHARE_IMAGE_WHITELIST,
})

const buildCleanPayloadExamples = ({ liveSession = null, brief = null, shareTask = null } = {}) => ({
  partiesLive: liveSession ? serializePartyLivePayload(liveSession) : null,
  briefs: brief ? serializeBriefPayload(brief) : null,
  shareImages: shareTask ? serializeShareImagePayload(shareTask) : null,
})

const getCleanSlateBaseline = () => {
  const adminStore = getAdminStore()
  const socialStore = readSocialStore()
  const assets = listAdminAssets()
  const contentStore = readJsonFileIfExists(path.join(__dirname, 'content-store.json')) || {}
  const momentsStore = readJsonFileIfExists(path.join(__dirname, 'moments-store.json')) || {}

  const liveSession = (adminStore.liveSessions || [])[0] || null
  const brief = (momentsStore.sessionBriefs || [])[0] || null
  const shareTask = pickPreferredShareTask(momentsStore.shareImageTasks || [])
  const firstMoment = pickPreferredMoment(momentsStore.momentRecords || [])
  const firstEvent = pickPreferredEvent(momentsStore.sessionEvents || [])
  const firstReport = (momentsStore.momentReports || [])[0] || null

  return {
    generatedAt: new Date().toISOString(),
    undeployed: true,
    stores: {
      adminStore: summarizeStore(
        adminStore,
        ['adminUsers', 'roles', 'sessions', 'operationLogs', 'analyticsEvents', 'momentReviewItems', 'momentReportItems', 'shareImageTasks', 'liveSessions'],
        ['questionBank', 'reports', 'rankingRewardRules', 'shareAssets', 'membershipPlans', 'membershipBenefits', 'membershipEnabled', 'adSlots', 'merchants', 'campaigns', 'baseConfigs', 'toolsCatalog'],
        {
          adminUsers: [],
          roles: [],
          sessions: [],
          operationLogs: [],
          analyticsEvents: [],
          momentReviewItems: [],
          momentReportItems: [],
          shareImageTasks: [],
          liveSessions: [],
        },
      ),
      contentStore: summarizeStore(
        contentStore,
        ['profile', 'compliance', 'homeConfig'],
        ['pointsConfig', 'templateConfig', 'commerce', 'userCommerce', 'toolHistory'],
        {
          profile: { nickname: '', avatarUrl: '', points: 0 },
          compliance: { copy: '' },
          homeConfig: { hero: { title: '', subtitle: '', imageUrl: '' }, quickTools: [], banner: { title: '', imageUrl: '' }, judge: { title: '', subtitle: '', imageUrl: '' } },
        },
      ),
      momentsStore: summarizeStore(
        momentsStore,
        ['momentRecords', 'sessionEvents', 'sessionBriefs', 'shareImageTasks', 'momentReports', 'uploadedAssets'],
        ['momentNominations', 'rankingRewardPayouts', 'rankingRewardRules'],
        {
          momentRecords: [],
          sessionEvents: [],
          sessionBriefs: [],
          shareImageTasks: [],
          momentReports: [],
          uploadedAssets: [],
        },
      ),
      socialStore: summarizeStore(
        socialStore,
        ['profiles', 'friendships', 'loginLogs', 'userSessions'],
        ['pokes'],
        {
          profiles: [],
          friendships: [],
          loginLogs: [],
          userSessions: [],
        },
      ),
      assetManifest: {
        keepKeys: ['brand', 'share', 'album', 'ledger', 'admin'],
        removedKeys: ['templates', 'points', 'tools'],
        counts: {
          builtin: countValue(assets.builtin),
          uploads: countValue(assets.uploads),
        },
        snapshot: {
          brand: [],
          share: (assets.uploads || []).filter((item) => cleanText(item.category) === 'share'),
          album: (assets.uploads || []).filter((item) => cleanText(item.category) === 'album'),
          ledger: (assets.uploads || []).filter((item) => cleanText(item.category) === 'ledger'),
          admin: assets.uploads || [],
        },
      },
    },
    seeds: {
      party: liveSession
        ? {
            partyId: cleanText(liveSession.id),
            inviteCode: cleanText(liveSession.inviteCode),
            title: sanitizeLegacyLabel(liveSession.name || liveSession.sessionName, '聚会记录样本'),
          }
        : { partyId: 'party-001', inviteCode: 'PARTY1', title: '聚会记录样本' },
      photo: firstMoment
        ? {
            photoId: cleanText(firstMoment.id),
            partyId: cleanText(firstMoment.sessionId),
            imageUrl: cleanText(firstMoment.imageUrl),
            visibility: cleanText(firstMoment.visibility || firstMoment.shareScope || 'party'),
          }
        : { photoId: 'photo-001', partyId: 'party-001', imageUrl: '', visibility: 'party' },
      ledger: firstEvent
        ? {
            ledgerId: cleanText(firstEvent.id),
            partyId: cleanText(firstEvent.sessionId),
            type: mapSeedLedgerType(firstEvent.eventType),
            text: sanitizeDisplayText(firstEvent.text || firstEvent.title, buildLedgerEventTitle(firstEvent.eventType)),
          }
        : { ledgerId: 'ledger-001', partyId: 'party-001', type: 'pending', text: '待处理记录样本' },
      brief: brief
        ? { briefId: cleanText(brief.id), partyId: cleanText(brief.sessionId), title: sanitizeLegacyLabel(brief.title, '聚会简报样本') }
        : { briefId: 'brief-001', partyId: 'party-001', title: '聚会简报样本' },
      shareImage: shareTask
        ? { shareImageId: cleanText(shareTask.id), partyId: cleanText(shareTask.sessionId), briefId: cleanText(shareTask.briefId), status: mapShareTaskStatus(shareTask.status) }
        : { shareImageId: 'share-image-001', partyId: 'party-001', briefId: 'brief-001', status: 'pending' },
      privacyReport: firstReport
        ? { reportId: cleanText(firstReport.id), partyId: cleanText(firstReport.sessionId), status: cleanText(firstReport.status) }
        : { reportId: 'privacy-report-001', partyId: 'party-001', status: 'pending' },
    },
  }
}

module.exports = {
  BRIEF_WHITELIST,
  PARTY_LIVE_WHITELIST,
  SHARE_IMAGE_WHITELIST,
  buildBriefDebugSummary,
  buildCleanPayloadExamples,
  buildPartyLiveDebugSummary,
  buildPRCSPrivateTokenGuide,
  buildShareImageDebugSummary,
  getCleanSlateBaseline,
  getManagedSessionById,
  getManagedSessionByInviteCode,
  getPartyLiveFacade,
  getPayloadWhitelists,
  mapBrief,
  mapPartyLive,
  mapShareImage,
  serializeBriefPayload,
  serializePartyLivePayload,
  serializeShareImagePayload,
}
