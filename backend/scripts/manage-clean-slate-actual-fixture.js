const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')
const sharp = require('sharp')

const { createManagedSession, getAdminStore, joinManagedSession, writeAdminStore } = require('../data/admin')
const {
  buildBriefDebugSummary,
  buildPartyLiveDebugSummary,
  buildShareImageDebugSummary,
  getPartyLiveFacade,
  mapBrief,
  mapShareImage,
} = require('../data/clean-slate')
const { getLiveSessionConfig } = require('../data/front')
const {
  createMoment,
  createOrRefreshSessionBrief,
  createSessionEvent,
  createShareImageTask,
  getSessionBrief,
  getShareImageTask,
  processShareImageTask,
  readMomentsStore,
  uploadMomentImage,
  writeMomentsStore,
} = require('../data/moments')
const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const repoRoot = path.resolve(__dirname, '..', '..')
const tinyPngDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

const cleanText = (value = '') => String(value || '').trim()
const nowIso = () => new Date().toISOString()
const maskToken = (value = '') => {
  const text = cleanText(value)
  return text ? `***${text.slice(-8)}` : ''
}
const createId = (prefix) => `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const markerForSeed = (seed) => `prcs-clean-slate-actual-${seed}`

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

const normalizeSeed = (value = '') =>
  cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'prcs-actual-local'

const resolveOutputPath = (value) => {
  const normalized = cleanText(value)
  if (normalized) {
    return path.resolve(repoRoot, normalized)
  }
  return path.join(os.tmpdir(), 'jiuzhuopanguan-private', 'clean-slate-actual-fixture.private.json')
}

const writeJsonFile = (filePath, payload) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const getRoleSpecs = (seed) => [
  { role: 'host', name: '聚会记录师房主', openId: `prcs-clean-slate-${seed}-host` },
  { role: 'memberA', name: '聚会记录师成员A', openId: `prcs-clean-slate-${seed}-member-a` },
  { role: 'memberB', name: '聚会记录师成员B', openId: `prcs-clean-slate-${seed}-member-b` },
  { role: 'outsider', name: '聚会记录师局外人', openId: `prcs-clean-slate-${seed}-outsider` },
]

const buildSanitizedProfileSummary = (profiles = {}) =>
  Object.fromEntries(
    Object.entries(profiles).map(([role, profile]) => [
      role,
      {
        role,
        profileId: cleanText(profile.profileId),
        name: cleanText(profile.name),
        tokenSuffix: maskToken(profile.token),
      },
    ]),
  )

const ensureProfiles = ({ seed, privateManifestPath = '' }) => {
  const manifestPath = cleanText(privateManifestPath)
  if (manifestPath && fs.existsSync(manifestPath)) {
    const manifest = readJsonFile(manifestPath)
    return {
      source: 'private-manifest',
      manifestPath,
      profiles: {
        host: manifest.profiles.host,
        memberA: manifest.profiles.memberA,
        memberB: manifest.profiles.memberB,
        outsider: manifest.profiles.outsider,
      },
    }
  }

  const profiles = {}
  getRoleSpecs(seed).forEach((item) => {
    const bound = bindWechatUser({
      wechatOpenId: item.openId,
      profile: {
        name: item.name,
        avatarUrl: '',
        signature: 'PRCS clean slate actual fixture',
        identityTag: 'PRCS',
      },
    })
    profiles[item.role] = {
      role: item.role,
      name: bound.profile.name,
      profileId: bound.profile.id,
      openIdHint: item.openId,
      token: bound.token,
      tokenSuffix: maskToken(bound.token),
    }
  })
  return {
    source: 'local-bindWechatUser',
    manifestPath: '',
    profiles,
  }
}

const buildProfileView = (profile = {}) => ({
  id: cleanText(profile.profileId || profile.id),
  name: cleanText(profile.name),
  avatarUrl: '',
  phone: '',
})

const updateMomentReviewStates = ({ approvedMomentIds = [], privateMomentIds = [] }) => {
  const store = readMomentsStore()
  store.momentRecords = (store.momentRecords || []).map((item) => {
    if (approvedMomentIds.includes(item.id)) {
      return {
        ...item,
        reviewStatus: 'approved',
        secondaryReviewStatus: 'approved',
        rankingEligible: false,
        rewardEligible: false,
        updatedAt: nowIso(),
      }
    }
    if (privateMomentIds.includes(item.id)) {
      return {
        ...item,
        reviewStatus: 'approved',
        secondaryReviewStatus: 'approved',
        rankingEligible: false,
        rewardEligible: false,
        updatedAt: nowIso(),
      }
    }
    return item
  })
  writeMomentsStore(store)
}

const createFailedShareTask = ({ sessionId, briefId, selectedNodeIds }) => {
  const store = readMomentsStore()
  const task = {
    id: createId('share-task'),
    sessionId,
    briefId,
    status: 'failed',
    layoutMode: 'brief_story',
    ledgerIncluded: false,
    selectedNodeIds,
    imageUrl: '',
    failedReason: 'share image generation failed',
    failureReason: 'share image generation failed',
    retryCount: 0,
    createdAt: nowIso(),
    startedAt: nowIso(),
    finishedAt: nowIso(),
    updatedAt: nowIso(),
  }
  store.shareImageTasks.unshift(task)
  writeMomentsStore(store)
  return task
}

const getFixtureSessionIds = (seed) => {
  const marker = markerForSeed(seed)
  const adminStore = getAdminStore()
  return (adminStore.liveSessions || [])
    .filter((item) => cleanText(item.source) === marker)
    .map((item) => cleanText(item.id))
    .filter(Boolean)
}

const resolveFilePathFromUrl = (urlValue = '') => {
  const normalized = cleanText(urlValue)
  if (!normalized.startsWith('/uploads/')) return ''
  return path.join(repoRoot, 'backend', 'public', normalized.replace(/^\//, '').replace(/\//g, path.sep))
}

const inspectFixture = (seed) => {
  const marker = markerForSeed(seed)
  const adminStore = getAdminStore()
  const sessionIds = getFixtureSessionIds(seed)
  const sessionIdSet = new Set(sessionIds)
  const momentsStore = readMomentsStore()
  const liveSessions = (adminStore.liveSessions || []).filter((item) => sessionIdSet.has(cleanText(item.id)))
  const momentRecords = (momentsStore.momentRecords || []).filter((item) => sessionIdSet.has(cleanText(item.sessionId)) || cleanText(item.clientDraftId).includes(seed))
  const sessionEvents = (momentsStore.sessionEvents || []).filter((item) => sessionIdSet.has(cleanText(item.sessionId)) || cleanText(item.clientEventId).includes(seed))
  const sessionBriefs = (momentsStore.sessionBriefs || []).filter((item) => sessionIdSet.has(cleanText(item.sessionId)))
  const shareImageTasks = (momentsStore.shareImageTasks || []).filter((item) => sessionIdSet.has(cleanText(item.sessionId)) || sessionBriefs.some((brief) => brief.id === item.briefId))
  const uploadedAssets = (momentsStore.uploadedAssets || []).filter((item) => sessionIdSet.has(cleanText(item.sessionId)))
  const shareImageFiles = shareImageTasks
    .map((item) => resolveFilePathFromUrl(item.imageUrl))
    .filter(Boolean)
    .map((filePath) => ({ filePath, exists: fs.existsSync(filePath) }))
  const photoFiles = uploadedAssets
    .map((item) => resolveFilePathFromUrl(item.url))
    .filter(Boolean)
    .map((filePath) => ({ filePath, exists: fs.existsSync(filePath) }))

  return {
    seed,
    marker,
    matches: {
      liveSessions: liveSessions.map((item) => ({ sessionId: item.id, inviteCode: item.inviteCode, source: item.source })),
      counts: {
        liveSessions: liveSessions.length,
        momentRecords: momentRecords.length,
        sessionEvents: sessionEvents.length,
        sessionBriefs: sessionBriefs.length,
        shareImageTasks: shareImageTasks.length,
        uploadedAssets: uploadedAssets.length,
        photoFilesExisting: photoFiles.filter((item) => item.exists).length,
        shareImageFilesExisting: shareImageFiles.filter((item) => item.exists).length,
      },
      photoFiles,
      shareImageFiles,
    },
  }
}

const cleanupFixture = ({ seed, cleanupPrivateProfiles = false }) => {
  const inspectBefore = inspectFixture(seed)
  const sessionIdSet = new Set(inspectBefore.matches.liveSessions.map((item) => item.sessionId))
  const adminStore = getAdminStore()
  adminStore.liveSessions = (adminStore.liveSessions || []).filter((item) => !sessionIdSet.has(cleanText(item.id)))
  adminStore.analyticsEvents = (adminStore.analyticsEvents || []).filter((item) => !sessionIdSet.has(cleanText(item.meta?.sessionId || item.sessionId)))
  writeAdminStore(adminStore)

  const momentsStore = readMomentsStore()
  const briefIdSet = new Set((momentsStore.sessionBriefs || []).filter((item) => sessionIdSet.has(cleanText(item.sessionId))).map((item) => cleanText(item.id)))
  const taskItems = (momentsStore.shareImageTasks || []).filter((item) => sessionIdSet.has(cleanText(item.sessionId)) || briefIdSet.has(cleanText(item.briefId)))
  const filePaths = [
    ...(momentsStore.uploadedAssets || [])
      .filter((item) => sessionIdSet.has(cleanText(item.sessionId)))
      .map((item) => resolveFilePathFromUrl(item.url)),
    ...taskItems.map((item) => resolveFilePathFromUrl(item.imageUrl)),
  ].filter(Boolean)

  momentsStore.momentRecords = (momentsStore.momentRecords || []).filter((item) => !sessionIdSet.has(cleanText(item.sessionId)) && !cleanText(item.clientDraftId).includes(seed))
  momentsStore.sessionEvents = (momentsStore.sessionEvents || []).filter((item) => !sessionIdSet.has(cleanText(item.sessionId)) && !cleanText(item.clientEventId).includes(seed))
  momentsStore.sessionBriefs = (momentsStore.sessionBriefs || []).filter((item) => !sessionIdSet.has(cleanText(item.sessionId)))
  momentsStore.shareImageTasks = (momentsStore.shareImageTasks || []).filter((item) => !sessionIdSet.has(cleanText(item.sessionId)) && !briefIdSet.has(cleanText(item.briefId)))
  momentsStore.uploadedAssets = (momentsStore.uploadedAssets || []).filter((item) => !sessionIdSet.has(cleanText(item.sessionId)))
  momentsStore.momentReports = (momentsStore.momentReports || []).filter((item) => !sessionIdSet.has(cleanText(item.sessionId)))
  writeMomentsStore(momentsStore)

  filePaths.forEach((filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true })
    }
  })

  if (cleanupPrivateProfiles) {
    const socialStore = readSocialStore()
    const openIdSet = new Set(getRoleSpecs(seed).map((item) => item.openId))
    const profileIdSet = new Set(
      (socialStore.profiles || [])
        .filter((item) => openIdSet.has(cleanText(item.wechatOpenId)))
        .map((item) => cleanText(item.id))
        .filter(Boolean),
    )
    socialStore.profiles = (socialStore.profiles || []).filter((item) => !openIdSet.has(cleanText(item.wechatOpenId)))
    socialStore.userSessions = (socialStore.userSessions || []).filter((item) => !profileIdSet.has(cleanText(item.profileId)))
    socialStore.loginLogs = (socialStore.loginLogs || []).filter((item) => !profileIdSet.has(cleanText(item.profileId)) && !openIdSet.has(cleanText(item.wechatOpenId)))
    socialStore.friendships = (socialStore.friendships || []).filter((item) => !profileIdSet.has(cleanText(item.ownerId)) && !profileIdSet.has(cleanText(item.friendId)))
    socialStore.pokes = (socialStore.pokes || []).filter((item) => !profileIdSet.has(cleanText(item.senderId)) && !profileIdSet.has(cleanText(item.receiverId)))
    writeSocialStore(socialStore)
  }

  return {
    seed,
    removed: inspectBefore.matches.counts,
    residual: inspectFixture(seed).matches.counts,
    privateProfilesCleaned: cleanupPrivateProfiles,
  }
}

const fileSha256 = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')

const createFixture = async ({ seed, privateManifestPath, outputPath }) => {
  cleanupFixture({ seed, cleanupPrivateProfiles: false })
  const tokenSource = ensureProfiles({ seed, privateManifestPath })
  const profiles = tokenSource.profiles
  const host = buildProfileView(profiles.host)
  const memberA = buildProfileView(profiles.memberA)
  const memberB = buildProfileView(profiles.memberB)
  const marker = markerForSeed(seed)

  const createdSession = createManagedSession({
    sessionName: '周末聚会记录',
    playerCount: 3,
    templateName: '聚会照片墙',
    hostName: host.name,
    hostProfileId: host.id,
    hostAvatarUrl: '',
    state: '进行中',
    status: '进行中',
    source: marker,
  })
  joinManagedSession({ inviteCode: createdSession.inviteCode, profile: memberA })
  joinManagedSession({ inviteCode: createdSession.inviteCode, profile: memberB })

  const openingAsset = await uploadMomentImage({
    profile: host,
    payload: {
      sessionId: createdSession.id,
      dataUrl: tinyPngDataUrl,
      fileName: 'party-opening.png',
    },
  })
  const highlightAsset = await uploadMomentImage({
    profile: memberA,
    payload: {
      sessionId: createdSession.id,
      dataUrl: tinyPngDataUrl,
      fileName: 'party-highlight.png',
    },
  })
  const privateAsset = await uploadMomentImage({
    profile: memberB,
    payload: {
      sessionId: createdSession.id,
      dataUrl: tinyPngDataUrl,
      fileName: 'party-private.png',
    },
  })

  const openingMoment = createMoment({
    sessionId: createdSession.id,
    profile: host,
    payload: {
      clientDraftId: `${seed}-opening`,
      nodeType: 'opening',
      imageUrl: openingAsset.url,
      caption: '开场合照',
      usageConsent: { session: true, brief: true, share: true, ranking: false },
      timelineTitle: '房主上传了开场合照',
    },
  })
  const highlightMoment = createMoment({
    sessionId: createdSession.id,
    profile: memberA,
    payload: {
      clientDraftId: `${seed}-highlight`,
      nodeType: 'highlight',
      imageUrl: highlightAsset.url,
      caption: '聚会高光照片',
      usageConsent: { session: true, brief: true, share: true, ranking: false },
      timelineTitle: '成员添加了精彩瞬间',
    },
  })
  const privateMoment = createMoment({
    sessionId: createdSession.id,
    profile: memberB,
    payload: {
      clientDraftId: `${seed}-private`,
      nodeType: 'private',
      visibility: 'private',
      visibleProfileIds: [host.id],
      imageUrl: privateAsset.url,
      caption: '私密记录',
      usageConsent: { session: true, brief: false, share: false, ranking: false },
      timelineTitle: '成员添加了私密记录',
    },
  })

  updateMomentReviewStates({
    approvedMomentIds: [openingMoment.id, highlightMoment.id],
    privateMomentIds: [privateMoment.id],
  })

  const ledgerPending = createSessionEvent({
    sessionId: createdSession.id,
    profile: host,
    payload: {
      clientEventId: `${seed}-ledger-pending`,
      eventType: 'drink_debt',
      targetProfileId: memberA.id,
      targetName: memberA.name,
      scoreDelta: 1,
      caption: '新增一条待处理记录',
    },
  })
  const ledgerAdded = createSessionEvent({
    sessionId: createdSession.id,
    profile: host,
    payload: {
      clientEventId: `${seed}-ledger-added`,
      eventType: 'drink_add',
      targetProfileId: memberB.id,
      targetName: memberB.name,
      scoreDelta: 1,
      caption: '新增一条加酒记录',
    },
  })

  const brief = createOrRefreshSessionBrief({ sessionId: createdSession.id, profile: host })
  const readyTask = createShareImageTask({
    briefId: brief.id,
    profile: host,
    payload: {
      layoutMode: 'party_story',
      includeLedger: true,
    },
  })
  const readyProcessed = await processShareImageTask({ taskId: readyTask.id, profile: host })
  const failedTask = createFailedShareTask({
    sessionId: createdSession.id,
    briefId: brief.id,
    selectedNodeIds: [openingMoment.id],
  })

  const livePayload = getPartyLiveFacade(createdSession.id, createdSession.inviteCode)
  const liveDebug = buildPartyLiveDebugSummary(getLiveSessionConfig(createdSession.id, createdSession.inviteCode) || {})
  const briefPayload = mapBrief(getSessionBrief({ briefId: brief.id, profile: host }))
  const briefDebug = buildBriefDebugSummary(getSessionBrief({ briefId: brief.id, profile: host }))
  const readyPayload = mapShareImage(getShareImageTask({ taskId: readyProcessed.id, profile: host }))
  const readyDebug = buildShareImageDebugSummary(getShareImageTask({ taskId: readyProcessed.id, profile: host }))
  const readyImagePath = resolveFilePathFromUrl(readyProcessed.imageUrl)
  const readyImageMeta = readyImagePath && fs.existsSync(readyImagePath) ? await sharp(readyImagePath).metadata() : {}
  const failedPayload = mapShareImage(failedTask)

  const returnShareId = `share-return-${createdSession.id}`
  const privateManifest = {
    id: `prcs-clean-slate-actual-${seed}`,
    generatedAt: nowIso(),
    undeployed: true,
    source: 'local-clean-slate-actual-fixture',
    tokenSource: tokenSource.source,
    profiles,
    party: {
      partyId: createdSession.id,
      sessionId: createdSession.id,
      inviteCode: createdSession.inviteCode,
      title: '周末聚会记录',
      theme: 'night',
      visibility: 'session',
      createdBy: host.id,
      sourceMarker: marker,
      payload: livePayload,
    },
    members: {
      host: { memberId: `member-${host.id}`, profileId: host.id, joinState: 'joined', permission: 'host', joinedAt: createdSession.createdAt || nowIso() },
      memberA: { memberId: `member-${memberA.id}`, profileId: memberA.id, joinState: 'joined', permission: 'member', joinedAt: nowIso() },
      memberB: { memberId: `member-${memberB.id}`, profileId: memberB.id, joinState: 'joined', permission: 'member', joinedAt: nowIso() },
      outsider: { memberId: '', profileId: profiles.outsider.profileId, joinState: 'outside', permission: 'outsider', joinedAt: '' },
    },
    album: {
      albumId: `album-${createdSession.id}`,
      partyId: createdSession.id,
      photos: [
        { photoId: openingMoment.id, momentId: openingMoment.id, visibility: 'share', reviewStatus: 'approved', imageUrl: openingAsset.url, albumId: `album-${createdSession.id}` },
        { photoId: highlightMoment.id, momentId: highlightMoment.id, visibility: 'share', reviewStatus: 'approved', imageUrl: highlightAsset.url, albumId: `album-${createdSession.id}` },
      ],
      filteredPhotoIds: [privateMoment.id],
    },
    ledger: {
      ledgerId: `ledger-${createdSession.id}`,
      expenseItemIds: [ledgerPending.id, ledgerAdded.id],
      settlementId: `settlement-${createdSession.id}`,
      memberBalanceIds: [host.id, memberA.id, memberB.id],
      ledgerSummary: briefPayload.ledgerSummary,
      accountingHighlights: briefPayload.accountingHighlights,
    },
    brief: {
      briefId: brief.id,
      albumSummary: { albumId: `album-${createdSession.id}`, photoCount: briefPayload.summary.photoCount },
      ...briefPayload,
    },
    shareTasks: {
      ready: {
        taskId: readyProcessed.id,
        status: readyProcessed.status,
        layoutMode: 'party_story',
        imageUrl: readyProcessed.imageUrl,
        imageSha256: readyImagePath && fs.existsSync(readyImagePath) ? fileSha256(readyImagePath) : '',
        imageSize: {
          width: Number(readyImageMeta.width) || 0,
          height: Number(readyImageMeta.height) || 0,
        },
        returnShareId,
        payload: readyPayload,
      },
      failed: {
        taskId: failedTask.id,
        status: 'failed',
        layoutMode: 'brief_story',
        imageUrl: '',
        imageSha256: '',
        imageSize: { width: 0, height: 0 },
        returnShareId,
        payload: failedPayload,
      },
    },
    shareReturn: {
      shareId: returnShareId,
      inviteCode: createdSession.inviteCode,
      partyId: createdSession.id,
      briefId: brief.id,
      payload: livePayload,
    },
    debugSummary: {
      partyLive: liveDebug,
      brief: briefDebug,
      readyShareImage: readyDebug,
      filteredMomentId: privateMoment.id,
      rawEventIds: [ledgerPending.id, ledgerAdded.id],
    },
    cleanup: {
      command: `node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed ${seed}`,
      residualCheck: `node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed ${seed}`,
      privateProfileCleanup: `node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed ${seed}`,
    },
  }

  writeJsonFile(outputPath, privateManifest)

  return {
    sanitized: {
      id: privateManifest.id,
      generatedAt: privateManifest.generatedAt,
      undeployed: true,
      source: privateManifest.source,
      tokenSource: privateManifest.tokenSource,
      manifestFile: path.basename(outputPath),
      profiles: buildSanitizedProfileSummary(profiles),
      ids: {
        partyId: createdSession.id,
        sessionId: createdSession.id,
        albumId: `album-${createdSession.id}`,
        briefId: brief.id,
        readyTaskId: readyProcessed.id,
        failedTaskId: failedTask.id,
        returnShareId,
      },
      counts: {
        photoCount: 2,
        filteredPhotoCount: 1,
        ledgerEventCount: 2,
      },
      cleanup: privateManifest.cleanup,
    },
    privateManifest,
  }
}

const main = async () => {
  const args = parseArgs()
  const mode = cleanText(args.mode || 'create').toLowerCase()
  const seed = normalizeSeed(args.seed || 'prcs-actual-006')
  const outputPath = resolveOutputPath(args.output)
  const privateManifestPath = cleanText(args['private-manifest']) ? path.resolve(repoRoot, cleanText(args['private-manifest'])) : ''

  if (mode === 'inspect') {
    console.log(JSON.stringify(inspectFixture(seed), null, 2))
    return
  }

  if (mode === 'cleanup') {
    console.log(
      JSON.stringify(
        cleanupFixture({
          seed,
          cleanupPrivateProfiles: cleanText(args['cleanup-private-profiles']).toLowerCase() === 'true',
        }),
        null,
        2,
      ),
    )
    return
  }

  if (mode === 'create') {
    const result = await createFixture({ seed, privateManifestPath, outputPath })
    console.log(JSON.stringify(result.sanitized, null, 2))
    return
  }

  throw new Error(`unsupported mode: ${mode}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
