const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  endManagedSession,
  flushAdminStore,
  getAdminStore,
  reviewManagedMoment,
  writeAdminStore,
  grantRankingRewardsByAdmin,
} = require('../data/admin')
const {
  createDefaultUserCommerceState,
  flushContentStore,
  readContentStore,
  writeContentStore,
} = require('../data/content')
const {
  createOrRefreshSessionBrief,
  createMomentNomination,
  createSessionEvent,
  createShareImageTask,
  flushMomentsStore,
  getMomentNominationEligibility,
  listTodayRankings,
  processShareImageTask,
  readMomentsStore,
  writeMomentsStore,
} = require('../data/moments')
const {
  bindWechatUser,
  flushSocialStore,
  readSocialStore,
  writeSocialStore,
} = require('../data/social')

const repoRoot = path.resolve(__dirname, '..', '..')
const uploadsRoot = path.join(repoRoot, 'backend', 'public', 'uploads')
const defaultBaseUrl = 'https://api.pomer.cn/api/v1'
const defaultPrivateManifest = path.join(os.tmpdir(), 'fix-014-final-evidence.private.json')
const defaultPublicEvidence = path.join(repoRoot, 'docs', 'runtime', 'verify-fix-014-final-evidence-20260624.json')
const tinyPngDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

const cleanText = (value = '') => String(value || '').trim()
const nowIso = () => new Date().toISOString()
const ymd = () => new Date().toISOString().slice(0, 10).replace(/-/g, '')
const createId = (prefix) => `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const tail = (value = '') => {
  const text = cleanText(value)
  return text ? text.slice(-8) : ''
}
const maskToken = (value = '') => {
  const suffix = tail(value)
  return suffix ? `***${suffix}` : ''
}

const parseArgs = (argv = process.argv.slice(2)) => {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const item = String(argv[index] || '')
    if (!item.startsWith('--')) continue
    const key = item.slice(2)
    const next = argv[index + 1]
    if (!next || String(next).startsWith('--')) {
      args[key] = 'true'
      continue
    }
    args[key] = String(next)
    index += 1
  }
  return args
}

const resolvePath = (value, fallback) => {
  const text = cleanText(value)
  return text ? path.resolve(repoRoot, text) : fallback
}

const normalizeBaseUrl = (value = '') => cleanText(value).replace(/\/+$/, '') || defaultBaseUrl

const writeJsonFile = (filePath, payload) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const api = async (baseUrl, pathname, { method = 'GET', token = '', body } = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-JZP-User-Token': token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || payload.code !== 0) {
    const error = new Error(`${method} ${pathname} failed: ${payload?.message || response.status}`)
    error.statusCode = response.status
    error.payload = payload
    throw error
  }
  return payload.data
}

const expectApiError = async (baseUrl, pathname, options, expectedStatus, label) => {
  try {
    await api(baseUrl, pathname, options)
  } catch (error) {
    return {
      label,
      ok: error.statusCode === expectedStatus,
      expectedStatus,
      actualStatus: error.statusCode || 0,
      message: error.payload?.message || error.message,
    }
  }
  return {
    label,
    ok: false,
    expectedStatus,
    actualStatus: 200,
    message: 'request unexpectedly succeeded',
  }
}

const waitForReadyTask = async (baseUrl, taskId, token, timeoutMs = 20000) => {
  const start = Date.now()
  let latest = null
  while (Date.now() - start < timeoutMs) {
    latest = await api(baseUrl, `/share-image-tasks/${encodeURIComponent(taskId)}`, { token })
    if (latest.status === 'ready' && cleanText(latest.readyShareImageUrl || latest.imageUrl)) {
      return latest
    }
    if (latest.status === 'failed') {
      return latest
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return latest
}

const roleSpecs = (prefix) => [
  { role: 'host', name: 'PRCS Verify Host', openId: `${prefix}-host` },
  { role: 'memberA', name: 'PRCS Verify Member A', openId: `${prefix}-member-a` },
  { role: 'memberB', name: 'PRCS Verify Member B', openId: `${prefix}-member-b` },
  { role: 'outsider', name: 'PRCS Verify Outsider', openId: `${prefix}-outsider` },
]

const flushStores = async () => {
  await Promise.all([
    flushAdminStore ? flushAdminStore() : Promise.resolve(),
    flushContentStore ? flushContentStore() : Promise.resolve(),
    flushMomentsStore ? flushMomentsStore() : Promise.resolve(),
    flushSocialStore ? flushSocialStore() : Promise.resolve(),
  ])
}

const createProfiles = async (prefix) => {
  const profiles = {}
  roleSpecs(prefix).forEach((spec) => {
    const bound = bindWechatUser({
      wechatOpenId: spec.openId,
      profile: {
        name: spec.name,
        avatarUrl: '',
        signature: 'FIX-014 final evidence account',
        identityTag: 'QA',
      },
    })
    profiles[spec.role] = {
      role: spec.role,
      openId: spec.openId,
      token: bound.token,
      profile: {
        id: bound.profile.id,
        name: bound.profile.name,
        avatarUrl: bound.profile.avatarUrl || '',
      },
    }
  })
  const contentStore = readContentStore()
  contentStore.userCommerce = contentStore.userCommerce || {}
  ;['host', 'memberA', 'memberB', 'outsider'].forEach((role) => {
    contentStore.userCommerce[profiles[role].profile.id] = {
      ...createDefaultUserCommerceState(),
      points: role === 'memberA' ? 80 : 0,
    }
  })
  writeContentStore(contentStore)
  await flushStores()
  return profiles
}

const apiProfile = (entry) => ({
  id: entry.profile.id,
  name: entry.profile.name,
  avatarUrl: entry.profile.avatarUrl || '',
})

const findOperationLogIds = ({ targetIds = [], marker = '' } = {}) => {
  const targetSet = new Set(targetIds.map(cleanText).filter(Boolean))
  return (getAdminStore().operationLogs || [])
    .filter((item) => targetSet.has(cleanText(item.targetId)) || cleanText(item.detail).includes(marker))
    .map((item) => cleanText(item.id))
    .filter(Boolean)
}

const resolveUploadPath = (urlValue = '') => {
  const text = cleanText(urlValue)
  if (!text.startsWith('/uploads/')) return ''
  const relativePath = text.replace(/^\/uploads\//, '').replace(/\//g, path.sep)
  const resolved = path.resolve(path.join(uploadsRoot, relativePath))
  return resolved.startsWith(path.resolve(uploadsRoot)) ? resolved : ''
}

const inspectUrl = async (baseUrl, urlValue) => {
  const text = cleanText(urlValue)
  if (!text) return { exists: false, status: 0, contentType: '', byteLength: 0 }
  const url = /^https?:\/\//i.test(text) ? text : `${baseUrl.replace(/\/api\/v1$/, '')}${text}`
  const response = await fetch(url)
  const buffer = Buffer.from(await response.arrayBuffer())
  return {
    exists: response.ok,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    byteLength: buffer.length,
  }
}

const makePublicManifest = (manifest, evidence = {}) => ({
  id: manifest.id,
  baseUrl: manifest.baseUrl,
  prefix: manifest.prefix,
  createdAt: manifest.createdAt,
  profiles: Object.fromEntries(
    Object.entries(manifest.profiles || {}).map(([role, item]) => [
      role,
      {
        profileId: item.profile.id,
        name: item.profile.name,
        tokenTail: tail(item.token),
      },
    ]),
  ),
  session: manifest.session,
  moments: manifest.moments,
  events: manifest.events,
  brief: manifest.brief,
  shareTask: manifest.shareTask,
  nomination: manifest.nomination,
  reward: manifest.reward,
  operationLogIds: manifest.operationLogIds || [],
  evidence,
})

const createEvidence = async ({ args }) => {
  const baseUrl = normalizeBaseUrl(args['base-url'])
  const prefix = cleanText(args.prefix) || `FIX-014-FINAL-${ymd()}-${Date.now()}`
  const marker = `fix-014-final-evidence:${prefix}`
  const privateManifestPath = resolvePath(args.manifest, defaultPrivateManifest)
  const publicEvidencePath = resolvePath(args.evidence, defaultPublicEvidence)

  let manifest = null
  if (fs.existsSync(privateManifestPath) && args.fresh !== 'true') {
    const existed = readJsonFile(privateManifestPath)
    if (existed?.profiles?.host?.token && !cleanText(existed?.session?.sessionId)) {
      manifest = existed
      manifest.baseUrl = baseUrl
    }
  }
  if (!manifest) {
    const profiles = await createProfiles(prefix)
    manifest = {
      id: createId('fix-014-final'),
      createdAt: nowIso(),
      baseUrl,
      prefix,
      marker,
      profiles,
      session: {},
      moments: {},
      events: {},
      brief: {},
      shareTask: {},
      nomination: {},
      reward: {},
      operationLogIds: [],
      cleanup: {
        privateManifestPath,
        command: `node backend/scripts/verify-fix-014-final-evidence.js --mode cleanup --manifest ${privateManifestPath}`,
        scanCommand: `node backend/scripts/verify-fix-014-final-evidence.js --mode scan --manifest ${privateManifestPath}`,
      },
    }
    writeJsonFile(privateManifestPath, manifest)
    writeJsonFile(publicEvidencePath, makePublicManifest(manifest, { status: 'profiles-prepared' }))
  }

  const profiles = manifest.profiles
  const host = profiles.host
  const memberA = profiles.memberA
  const memberB = profiles.memberB
  const outsider = profiles.outsider
  const persistManifest = (status) => {
    writeJsonFile(privateManifestPath, manifest)
    writeJsonFile(publicEvidencePath, makePublicManifest(manifest, { status }))
  }

  const created = await api(baseUrl, '/sessions', {
    method: 'POST',
    token: host.token,
    body: {
      sessionName: `${prefix}-session`,
      playerCount: 4,
      templateName: 'Party Recorder Verify',
      selectedPlayers: [apiProfile(memberA), apiProfile(memberB)],
    },
  })
  manifest.session = {
    sessionId: created.id,
    inviteCode: created.inviteCode,
  }
  persistManifest('session-created')

  await api(baseUrl, '/sessions/join', {
    method: 'POST',
    token: memberA.token,
    body: { inviteCode: created.inviteCode },
  })
  await api(baseUrl, '/sessions/join', {
    method: 'POST',
    token: memberB.token,
    body: { inviteCode: created.inviteCode },
  })

  const asset = await api(baseUrl, '/moments/uploads/image', {
    method: 'POST',
    token: host.token,
    body: {
      sessionId: created.id,
      fileName: `${prefix}-opening.png`,
      dataUrl: tinyPngDataUrl,
    },
  })
  manifest.uploads = {
    openingAssetId: asset.id || '',
    openingImageUrl: asset.url || '',
  }
  persistManifest('asset-uploaded')

  const opening = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/moments`, {
    method: 'POST',
    token: host.token,
    body: {
      clientDraftId: `${prefix}-opening`,
      nodeType: 'opening',
      caption: `${prefix} opening photo`,
      imageUrl: asset.url,
      tags: ['FIX-014', 'VERIFY-014-02'],
      usageConsent: { session: true, brief: true, share: true, ranking: true },
    },
  })
  const highlight = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/moments`, {
    method: 'POST',
    token: memberA.token,
    body: {
      clientDraftId: `${prefix}-highlight`,
      nodeType: 'highlight',
      caption: `${prefix} highlight photo`,
      imageUrl: asset.url,
      tags: ['FIX-014', 'VERIFY-014-02'],
      usageConsent: { session: true, brief: true, share: true, ranking: true },
    },
  })
  manifest.moments = {
    openingId: opening.id,
    highlightId: highlight.id,
  }
  reviewManagedMoment({
    momentId: opening.id,
    action: 'approve',
    reason: marker,
    operator: 'fix-014-final-evidence',
  })
  reviewManagedMoment({
    momentId: highlight.id,
    action: 'approve',
    reason: marker,
    operator: 'fix-014-final-evidence',
  })
  await flushStores()
  persistManifest('moments-approved')

  const event = createSessionEvent({
    sessionId: created.id,
    profile: host.profile,
    payload: {
      clientEventId: `${prefix}-event`,
      eventType: 'drink_debt',
      targetProfileId: memberA.profile.id,
      scoreDelta: 1,
      caption: `${prefix} ledger event`,
    },
  })
  manifest.events = {
    ledgerEventId: event.id,
  }
  await flushStores()
  persistManifest('event-created')

  endManagedSession(created.id, { reason: marker })
  await flushStores()
  const brief = createOrRefreshSessionBrief({
    sessionId: created.id,
    profile: host.profile,
    payload: { title: `${prefix} brief`, coverMode: 'opening_collage' },
  })
  manifest.brief = {
    briefId: brief.id,
  }
  await flushStores()
  persistManifest('brief-created')

  const shareTaskSeed = createShareImageTask({
    briefId: brief.id,
    profile: host.profile,
    payload: {
      layoutMode: 'party_story',
      includeLedger: true,
    },
  })
  const readyTask = await processShareImageTask({ taskId: shareTaskSeed.id, profile: host.profile })
  await flushStores()
  const readyShareImageUrl = cleanText(readyTask?.readyShareImageUrl || readyTask?.imageUrl)
  assert(readyTask?.status === 'ready', `share task not ready: ${readyTask?.status || 'missing'}`)
  assert(readyShareImageUrl, 'readyShareImageUrl/imageUrl missing')
  manifest.shareTask = {
    taskId: readyTask.id,
    status: readyTask.status,
    imageUrl: cleanText(readyTask.imageUrl),
    readyShareImageUrl,
  }

  const imageProbe = await inspectUrl(baseUrl, readyShareImageUrl)
  assert(imageProbe.exists, `ready image url not fetchable: ${imageProbe.status}`)

  const eligibility = getMomentNominationEligibility({
    momentId: opening.id,
    profile: memberA.profile,
    category: 'best_opening',
  })
  assert(eligibility.eligible === true, `nomination not eligible: ${eligibility.reasonCode || eligibility.reason || ''}`)
  const nomination = createMomentNomination({
    momentId: opening.id,
    profile: memberA.profile,
    payload: {
      category: 'best_opening',
      clientNominationId: `${prefix}-nomination`,
    },
  })
  await flushStores()
  const rankings = listTodayRankings({ category: 'best_opening', limit: 100 })
  const rankingItem = (rankings.items || []).find((item) => item.moment?.id === opening.id)
  assert(rankingItem, 'ranking item missing for nominated moment')
  const reward = grantRankingRewardsByAdmin({
    category: 'best_opening',
    limit: 100,
    operator: 'fix-014-final-evidence',
  })
  await flushStores()
  const payout = (reward.items || []).find((item) => item.momentId === opening.id && item.status === 'granted')
  assert(payout, 'reward payout missing for nominated moment')

  const contentStore = readContentStore()
  const memberACommerce = contentStore.userCommerce?.[memberA.profile.id] || {}
  const hostCommerce = contentStore.userCommerce?.[host.profile.id] || {}
  const hostLedger = contentStore.userCommerce?.[host.profile.id]?.pointsLedger || []
  const memberALedger = contentStore.userCommerce?.[memberA.profile.id]?.pointsLedger || []
  const rewardLedger = hostLedger.find((item) => item.kind === 'ranking-reward' && item.sourceId === payout.sourceId)
  const nominationLedger = memberALedger.find((item) => item.kind === 'moment-nomination' && item.sourceId === nomination.id)
  assert(rewardLedger, 'ranking reward ledger missing')
  assert(nominationLedger, 'nomination ledger missing')

  manifest.nomination = {
    nominationId: nomination.id,
    category: nomination.category,
    pointsSpent: nomination.pointsSpent,
    rankingMomentId: rankingItem.moment.id,
    rankingRank: rankingItem.rank,
  }
  manifest.reward = {
    payoutId: payout.id,
    sourceId: payout.sourceId,
    points: payout.points,
    grantedCount: reward.grantedCount,
    totalPoints: reward.totalPoints,
    rewardLedgerId: rewardLedger.id,
    nominationLedgerId: nominationLedger.id,
  }
  manifest.operationLogIds = findOperationLogIds({
    marker,
    targetIds: [opening.id, payout.id, `ranking-rewards:${reward.category}:${reward.date}`],
  })

  const evidence = {
    exportedAt: nowIso(),
    r02: {
      readyTaskStatus: readyTask.status,
      readyShareImageUrl,
      imageProbe,
      memberShareTaskReadyUrl: readyShareImageUrl,
    },
    verify01401: {
      deferredToPublicCheck: true,
    },
    verify01402: {
      openingMomentId: opening.id,
      eligibility,
      nominationId: nomination.id,
      rankingRank: rankingItem.rank,
      payoutId: payout.id,
      rewardPoints: payout.points,
      nominationLedgerId: nominationLedger.id,
      rewardLedgerId: rewardLedger.id,
      memberAPointsAfter: memberACommerce.points,
      hostPointsAfter: hostCommerce.points,
      operationLogIds: manifest.operationLogIds,
    },
    tokens: {
      host: maskToken(host.token),
      memberA: maskToken(memberA.token),
      memberB: maskToken(memberB.token),
      outsider: maskToken(outsider.token),
    },
  }
  const publicManifest = makePublicManifest(manifest, evidence)
  writeJsonFile(privateManifestPath, manifest)
  writeJsonFile(publicEvidencePath, publicManifest)
  console.log(JSON.stringify({ ok: true, mode: 'create', privateManifest: privateManifestPath, publicEvidence: publicEvidencePath, summary: publicManifest }, null, 2))
}

const targetIdsFromManifest = (manifest) =>
  [
    manifest.session?.sessionId,
    manifest.moments?.openingId,
    manifest.moments?.highlightId,
    manifest.events?.ledgerEventId,
    manifest.brief?.briefId,
    manifest.shareTask?.taskId,
    manifest.nomination?.nominationId,
    manifest.reward?.payoutId,
    manifest.reward?.sourceId,
    ...(manifest.operationLogIds || []),
    manifest.uploads?.openingAssetId,
  ]
    .map(cleanText)
    .filter(Boolean)

const profileIdsFromManifest = (manifest) =>
  Object.values(manifest.profiles || {})
    .map((item) => cleanText(item.profile?.id || item.profileId))
    .filter(Boolean)

const scanManifest = (manifest) => {
  const sessionId = cleanText(manifest.session?.sessionId)
  const profileIds = new Set(profileIdsFromManifest(manifest))
  const targetIds = new Set(targetIdsFromManifest(manifest))
  const prefix = cleanText(manifest.prefix)
  const marker = cleanText(manifest.marker)

  const socialStore = readSocialStore()
  const contentStore = readContentStore()
  const adminStore = getAdminStore()
  const momentsStore = readMomentsStore()
  const sessionIds = new Set(
    (adminStore.liveSessions || [])
      .filter(
        (item) =>
          cleanText(item?.id) === sessionId ||
          cleanText(item?.sessionName).includes(prefix) ||
          cleanText(item?.name).includes(prefix) ||
          cleanText(item?.templateName).includes(prefix) ||
          cleanText(item?.source).includes(marker),
      )
      .map((item) => cleanText(item.id))
      .filter(Boolean),
  )
  if (sessionId) {
    sessionIds.add(sessionId)
  }
  const shareImagePath = resolveUploadPath(manifest.shareTask?.readyShareImageUrl || manifest.shareTask?.imageUrl)
  const openingPath = resolveUploadPath(manifest.uploads?.openingImageUrl)

  const adminCounts = {}
  Object.entries(adminStore).forEach(([key, value]) => {
    if (!Array.isArray(value)) return
    adminCounts[key] = value.filter(
      (item) =>
        sessionIds.has(cleanText(item?.id)) ||
        sessionIds.has(cleanText(item?.sessionId)) ||
        sessionIds.has(cleanText(item?.meta?.sessionId)) ||
        profileIds.has(cleanText(item?.profileId)) ||
        profileIds.has(cleanText(item?.hostProfileId)) ||
        targetIds.has(cleanText(item?.id)) ||
        targetIds.has(cleanText(item?.targetId)) ||
        cleanText(item?.detail).includes(marker) ||
        cleanText(item?.detail).includes(prefix),
    ).length
  })

  const momentCounts = {}
  Object.entries(momentsStore).forEach(([key, value]) => {
    if (!Array.isArray(value)) return
    momentCounts[key] = value.filter(
      (item) =>
        sessionIds.has(cleanText(item?.sessionId)) ||
        targetIds.has(cleanText(item?.id)) ||
        targetIds.has(cleanText(item?.momentId)) ||
        targetIds.has(cleanText(item?.briefId)) ||
        targetIds.has(cleanText(item?.taskId)) ||
        cleanText(item?.clientDraftId).includes(prefix) ||
        cleanText(item?.clientEventId).includes(prefix),
    ).length
  })

  return {
    sessionId,
    sessionIds: Array.from(sessionIds),
    profileIds: Array.from(profileIds),
    counts: {
      socialProfiles: (socialStore.profiles || []).filter((item) => profileIds.has(cleanText(item.id)) || cleanText(item.wechatOpenId).includes(prefix)).length,
      socialSessions: (socialStore.userSessions || []).filter((item) => profileIds.has(cleanText(item.profileId))).length,
      socialLoginLogs: (socialStore.loginLogs || []).filter((item) => profileIds.has(cleanText(item.profileId)) || cleanText(item.wechatOpenId).includes(prefix)).length,
      contentCommerce: Object.keys(contentStore.userCommerce || {}).filter((profileId) => profileIds.has(cleanText(profileId))).length,
      admin: adminCounts,
      moments: momentCounts,
      openingFileExists: openingPath ? fs.existsSync(openingPath) : false,
      shareImageFileExists: shareImagePath ? fs.existsSync(shareImagePath) : false,
    },
  }
}

const removeUpload = (urlValue = '') => {
  const filePath = resolveUploadPath(urlValue)
  if (filePath && fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true })
  }
}

const cleanupEvidence = async ({ args }) => {
  const manifestPath = resolvePath(args.manifest, defaultPrivateManifest)
  assert(fs.existsSync(manifestPath), `manifest not found: ${manifestPath}`)
  const manifest = readJsonFile(manifestPath)
  const before = scanManifest(manifest)
  const sessionId = cleanText(manifest.session?.sessionId)
  const sessionIds = new Set(before.sessionIds || [])
  if (sessionId) {
    sessionIds.add(sessionId)
  }
  const profileIds = new Set(profileIdsFromManifest(manifest))
  const targetIds = new Set(targetIdsFromManifest(manifest))
  const prefix = cleanText(manifest.prefix)
  const marker = cleanText(manifest.marker)

  const socialStore = readSocialStore()
  socialStore.profiles = (socialStore.profiles || []).filter((item) => !profileIds.has(cleanText(item.id)) && !cleanText(item.wechatOpenId).includes(prefix))
  socialStore.userSessions = (socialStore.userSessions || []).filter((item) => !profileIds.has(cleanText(item.profileId)))
  socialStore.loginLogs = (socialStore.loginLogs || []).filter((item) => !profileIds.has(cleanText(item.profileId)) && !cleanText(item.wechatOpenId).includes(prefix))
  socialStore.friendships = (socialStore.friendships || []).filter(
    (item) => !profileIds.has(cleanText(item.ownerId)) && !profileIds.has(cleanText(item.friendId)),
  )
  socialStore.pokes = (socialStore.pokes || []).filter(
    (item) => !profileIds.has(cleanText(item.senderId)) && !profileIds.has(cleanText(item.receiverId)),
  )
  writeSocialStore(socialStore)

  const contentStore = readContentStore()
  if (contentStore.userCommerce && typeof contentStore.userCommerce === 'object') {
    profileIds.forEach((profileId) => {
      delete contentStore.userCommerce[profileId]
    })
  }
  writeContentStore(contentStore)

  const adminStore = getAdminStore()
  Object.keys(adminStore).forEach((key) => {
    if (!Array.isArray(adminStore[key])) return
    adminStore[key] = adminStore[key].filter(
      (item) =>
        !sessionIds.has(cleanText(item?.id)) &&
        !sessionIds.has(cleanText(item?.sessionId)) &&
        !sessionIds.has(cleanText(item?.meta?.sessionId)) &&
        !profileIds.has(cleanText(item?.profileId)) &&
        !profileIds.has(cleanText(item?.hostProfileId)) &&
        !targetIds.has(cleanText(item?.id)) &&
        !targetIds.has(cleanText(item?.targetId)) &&
        !cleanText(item?.detail).includes(marker) &&
        !cleanText(item?.detail).includes(prefix),
    )
  })
  writeAdminStore(adminStore)

  const momentsStore = readMomentsStore()
  const uploadUrls = [
    ...(momentsStore.uploadedAssets || [])
      .filter((item) => sessionIds.has(cleanText(item?.sessionId)))
      .map((item) => cleanText(item?.url)),
    ...(momentsStore.shareImageTasks || [])
      .filter((item) => sessionIds.has(cleanText(item?.sessionId)))
      .map((item) => cleanText(item?.readyShareImageUrl || item?.imageUrl)),
    cleanText(manifest.uploads?.openingImageUrl),
    cleanText(manifest.shareTask?.readyShareImageUrl || manifest.shareTask?.imageUrl),
  ].filter(Boolean)
  Object.keys(momentsStore).forEach((key) => {
    if (!Array.isArray(momentsStore[key])) return
    momentsStore[key] = momentsStore[key].filter(
      (item) =>
        !sessionIds.has(cleanText(item?.sessionId)) &&
        !targetIds.has(cleanText(item?.id)) &&
        !targetIds.has(cleanText(item?.momentId)) &&
        !targetIds.has(cleanText(item?.briefId)) &&
        !targetIds.has(cleanText(item?.taskId)) &&
        !cleanText(item?.clientDraftId).includes(prefix) &&
        !cleanText(item?.clientEventId).includes(prefix),
    )
  })
  writeMomentsStore(momentsStore)

  uploadUrls.forEach(removeUpload)
  await flushStores()

  const after = scanManifest(manifest)
  console.log(JSON.stringify({ ok: true, mode: 'cleanup', manifest: manifestPath, before, after }, null, 2))
}

const scanEvidence = ({ args }) => {
  const manifestPath = resolvePath(args.manifest, defaultPrivateManifest)
  assert(fs.existsSync(manifestPath), `manifest not found: ${manifestPath}`)
  const manifest = readJsonFile(manifestPath)
  console.log(JSON.stringify({ ok: true, mode: 'scan', manifest: manifestPath, residual: scanManifest(manifest) }, null, 2))
}

const publicCheckEvidence = async ({ args }) => {
  const manifestPath = resolvePath(args.manifest, defaultPrivateManifest)
  assert(fs.existsSync(manifestPath), `manifest not found: ${manifestPath}`)
  const manifest = readJsonFile(manifestPath)
  const baseUrl = normalizeBaseUrl(args['base-url'] || manifest.baseUrl)
  const publicEvidencePath = resolvePath(args.evidence, defaultPublicEvidence)
  const host = manifest.profiles.host
  const memberA = manifest.profiles.memberA
  const memberB = manifest.profiles.memberB
  const outsider = manifest.profiles.outsider
  const sessionId = cleanText(manifest.session?.sessionId)
  const briefId = cleanText(manifest.brief?.briefId)
  const taskId = cleanText(manifest.shareTask?.taskId)
  const openingId = cleanText(manifest.moments?.openingId)
  const payoutId = cleanText(manifest.reward?.payoutId)
  const nominationId = cleanText(manifest.nomination?.nominationId)

  const [hostLive, memberLive, memberBrief, memberTask, ranking, hostCommerce, memberACommerce, outsiderBlocked] = await Promise.all([
    api(baseUrl, `/sessions/live?sessionId=${encodeURIComponent(sessionId)}`, { token: host.token }),
    api(baseUrl, `/sessions/live?sessionId=${encodeURIComponent(sessionId)}`, { token: memberB.token }),
    api(baseUrl, `/session-briefs/${encodeURIComponent(briefId)}`, { token: memberB.token }),
    api(baseUrl, `/share-image-tasks/${encodeURIComponent(taskId)}`, { token: memberB.token }),
    api(baseUrl, '/rankings/today?category=best_opening', { token: host.token }),
    api(baseUrl, '/user/commerce', { token: host.token }),
    api(baseUrl, '/user/commerce', { token: memberA.token }),
    expectApiError(
      baseUrl,
      `/sessions/live?sessionId=${encodeURIComponent(sessionId)}`,
      { token: outsider.token },
      403,
      'outsider live blocked after reload',
    ),
  ])
  await api(baseUrl, `/sessions/${encodeURIComponent(sessionId)}/members/${encodeURIComponent(memberB.profile.id)}/kick`, {
    method: 'POST',
    token: host.token,
  })
  const [kickedLiveBlocked, kickedBriefBlocked, kickedShareTaskBlocked] = await Promise.all([
    expectApiError(
      baseUrl,
      `/sessions/live?sessionId=${encodeURIComponent(sessionId)}`,
      { token: memberB.token },
      403,
      'kicked member live blocked after reload',
    ),
    expectApiError(
      baseUrl,
      `/session-briefs/${encodeURIComponent(briefId)}`,
      { token: memberB.token },
      403,
      'kicked member brief blocked after reload',
    ),
    expectApiError(
      baseUrl,
      `/share-image-tasks/${encodeURIComponent(taskId)}`,
      { token: memberB.token },
      403,
      'kicked member share task blocked after reload',
    ),
  ])
  await api(baseUrl, '/sessions/join', {
    method: 'POST',
    token: memberB.token,
    body: { inviteCode: manifest.session?.inviteCode },
  })
  const [rejoinedLive, rejoinedBrief, rejoinedShareTask] = await Promise.all([
    api(baseUrl, `/sessions/live?sessionId=${encodeURIComponent(sessionId)}`, { token: memberB.token }),
    api(baseUrl, `/session-briefs/${encodeURIComponent(briefId)}`, { token: memberB.token }),
    api(baseUrl, `/share-image-tasks/${encodeURIComponent(taskId)}`, { token: memberB.token }),
  ])

  const rankingItem = (ranking.items || []).find((item) => item.moment?.id === openingId)
  const hostRewardLedger = (hostCommerce.pointsLedger || []).find((item) => item.sourceId === manifest.reward?.sourceId)
  const memberANominationLedger = (memberACommerce.pointsLedger || []).find((item) => item.sourceId === nominationId)
  const result = {
    exportedAt: nowIso(),
    sessionLoaded: cleanText(hostLive.id) === sessionId,
    memberCanReadLive: cleanText(memberLive.id) === sessionId,
    memberBriefLoaded: cleanText(memberBrief.id) === briefId,
    memberTaskReady: cleanText(memberTask.id) === taskId && memberTask.status === 'ready',
    memberTaskReadyShareImageUrl: cleanText(memberTask.readyShareImageUrl || memberTask.imageUrl),
    outsiderBlocked,
    kickedLiveBlocked,
    kickedBriefBlocked,
    kickedShareTaskBlocked,
    rejoinedCanReadLive: cleanText(rejoinedLive.id) === sessionId,
    rejoinedCanReadBrief: cleanText(rejoinedBrief.id) === briefId,
    rejoinedCanReadShareTask: cleanText(rejoinedShareTask.id) === taskId,
    rankingContainsMoment: Boolean(rankingItem),
    rankingPublicFieldsRedacted: Boolean(rankingItem && !Object.prototype.hasOwnProperty.call(rankingItem.moment || {}, 'uploaderProfileId')),
    payoutLedgerVisibleToHost: Boolean(hostRewardLedger && payoutId),
    nominationLedgerVisibleToMemberA: Boolean(memberANominationLedger),
    hostPoints: hostCommerce.points,
    memberAPoints: memberACommerce.points,
  }
  assert(result.sessionLoaded, 'public check session missing')
  assert(result.memberCanReadLive, 'public check member live missing')
  assert(result.memberBriefLoaded, 'public check brief missing')
  assert(result.memberTaskReady, 'public check share task not ready')
  assert(result.outsiderBlocked.ok, 'public check outsider was not blocked')
  assert(result.kickedLiveBlocked.ok, 'public check kicked member live was not blocked')
  assert(result.kickedBriefBlocked.ok, 'public check kicked member brief was not blocked')
  assert(result.kickedShareTaskBlocked.ok, 'public check kicked member share task was not blocked')
  assert(result.rejoinedCanReadLive, 'public check rejoined live missing')
  assert(result.rejoinedCanReadBrief, 'public check rejoined brief missing')
  assert(result.rejoinedCanReadShareTask, 'public check rejoined share task missing')
  assert(result.memberTaskReadyShareImageUrl === cleanText(manifest.shareTask?.readyShareImageUrl), 'public check readyShareImageUrl mismatch')
  assert(result.rankingContainsMoment, 'public check ranking missing moment')
  assert(result.rankingPublicFieldsRedacted, 'public check ranking leaked uploaderProfileId')
  assert(result.payoutLedgerVisibleToHost, 'public check reward ledger missing')
  assert(result.nominationLedgerVisibleToMemberA, 'public check nomination ledger missing')

  const existingPublic = fs.existsSync(publicEvidencePath) ? readJsonFile(publicEvidencePath) : {}
  const publicManifest = makePublicManifest(manifest, {
    ...(existingPublic.evidence || {}),
    publicCheck: result,
  })
  writeJsonFile(publicEvidencePath, publicManifest)
  console.log(JSON.stringify({ ok: true, mode: 'public-check', manifest: manifestPath, publicEvidence: publicEvidencePath, result }, null, 2))
}

const main = async () => {
  const args = parseArgs()
  const mode = cleanText(args.mode) || 'create'
  if (mode === 'create') {
    await createEvidence({ args })
    return
  }
  if (mode === 'cleanup') {
    await cleanupEvidence({ args })
    return
  }
  if (mode === 'scan') {
    scanEvidence({ args })
    return
  }
  if (mode === 'public-check') {
    await publicCheckEvidence({ args })
    return
  }
  throw new Error(`unknown mode: ${mode}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.stack || error.message || error)
    process.exit(1)
  })
