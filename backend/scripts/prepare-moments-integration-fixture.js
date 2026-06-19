const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')

const { getAdminStore, writeAdminStore } = require('../data/admin')
const { createDefaultUserCommerceState, readContentStore, writeContentStore } = require('../data/content')
const { readMomentsStore, writeMomentsStore } = require('../data/moments')
const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const repoRoot = path.resolve(backendDir, '..')
const serverEntry = path.join(backendDir, 'server.js')
const uploadsRoot = path.join(backendDir, 'public', 'uploads')
const defaultManifest = path.join(repoRoot, 'docs', 'runtime', 'int-data-001-manifest.json')
const tinyPngDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

const parseArgs = (argv = process.argv.slice(2)) => {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]
    if (!item.startsWith('--')) {
      continue
    }
    const key = item.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      index += 1
    }
  }
  return args
}

const todayYmd = () => new Date().toISOString().slice(0, 10).replace(/-/g, '')
const nowIso = () => new Date().toISOString()
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const cleanText = (value = '') => String(value || '').trim()
const resolvePath = (value, fallback) => path.resolve(repoRoot, cleanText(value) || fallback)
const isLocalBaseUrl = (baseUrl) => /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/api\/v1\/?$/i.test(baseUrl)
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const normalizeBaseUrl = (value = '') => cleanText(value).replace(/\/+$/, '') || 'http://127.0.0.1:3221/api/v1'

const api = async (baseUrl, pathname, { method = 'GET', token = '', body, cookie = '' } = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-JZP-User-Token': token } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
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

const waitForServer = async (baseUrl, timeoutMs = 15000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/config/home`)
      if (response.ok) {
        return
      }
    } catch (error) {
      void error
    }
    await delay(300)
  }
  throw new Error('backend server did not start in time')
}

const startServer = async (baseUrl) => {
  if (!isLocalBaseUrl(baseUrl)) {
    return null
  }
  const port = new URL(baseUrl).port || '80'
  const child = fork(serverEntry, {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: port,
    },
    silent: true,
  })
  child.stdout?.on('data', (chunk) => process.stdout.write(String(chunk)))
  child.stderr?.on('data', (chunk) => process.stderr.write(String(chunk)))
  await waitForServer(baseUrl)
  return child
}

const stopServer = async (child) => {
  if (!child || child.killed) {
    return
  }
  child.kill()
  await new Promise((resolve) => child.once('exit', resolve))
}

const writeJsonFile = (filePath, payload) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`manifest not found: ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const createLocalSession = ({ openId, name }) =>
  bindWechatUser({
    wechatOpenId: openId,
    profile: {
      name,
      avatarUrl: '/static/avatar-qa.png',
      signature: 'INT-DATA-001 fixture account',
      identityTag: 'QA',
    },
  })

const loadRemoteProfile = async (baseUrl, token, role) => {
  if (!token) {
    throw new Error(`missing ${role} token for remote fixture`)
  }
  const profile = await api(baseUrl, '/user/profile', { token })
  return { token, profile }
}

const prepareProfiles = async ({ baseUrl, prefix, args }) => {
  if (isLocalBaseUrl(baseUrl)) {
    const suffix = `${prefix}-${Date.now()}`
    const host = createLocalSession({ openId: `${suffix}-host`, name: `${prefix} Host` })
    const memberA = createLocalSession({ openId: `${suffix}-member-a`, name: `${prefix} Member A` })
    const memberB = createLocalSession({ openId: `${suffix}-member-b`, name: `${prefix} Member B` })
    const outsider = createLocalSession({ openId: `${suffix}-outsider`, name: `${prefix} Outsider` })
    const contentStore = readContentStore()
    contentStore.userCommerce = contentStore.userCommerce || {}
    contentStore.userCommerce[memberB.profile.id] = {
      ...createDefaultUserCommerceState(),
      points: 80,
    }
    writeContentStore(contentStore)
    return { host, memberA, memberB, outsider, source: 'local-bindWechatUser' }
  }

  if (process.env.INT_DATA_ALLOW_REMOTE_WRITE !== '1') {
    throw new Error('remote create requires INT_DATA_ALLOW_REMOTE_WRITE=1')
  }
  return {
    host: await loadRemoteProfile(baseUrl, args['host-token'] || process.env.INT_DATA_HOST_TOKEN, 'host'),
    memberA: await loadRemoteProfile(baseUrl, args['member-a-token'] || process.env.INT_DATA_MEMBER_A_TOKEN, 'memberA'),
    memberB: await loadRemoteProfile(baseUrl, args['member-b-token'] || process.env.INT_DATA_MEMBER_B_TOKEN, 'memberB'),
    outsider: await loadRemoteProfile(baseUrl, args['outsider-token'] || process.env.INT_DATA_OUTSIDER_TOKEN, 'outsider'),
    source: 'provided-tokens',
  }
}

const loginAdmin = async (baseUrl, args) => {
  const providedCookie = cleanText(args['admin-cookie'] || process.env.INT_DATA_ADMIN_COOKIE)
  if (providedCookie) {
    return providedCookie
  }
  if (!isLocalBaseUrl(baseUrl) && process.env.INT_DATA_ALLOW_REMOTE_WRITE !== '1') {
    return ''
  }
  const username = args['admin-username'] || process.env.INT_DATA_ADMIN_USERNAME || (isLocalBaseUrl(baseUrl) ? 'admin' : '')
  const password = args['admin-password'] || process.env.INT_DATA_ADMIN_PASSWORD || (isLocalBaseUrl(baseUrl) ? 'Admin@123456' : '')
  if (!username || !password) {
    return ''
  }
  const response = await fetch(`${baseUrl}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(`admin login failed: ${payload?.message || response.status}`)
  }
  return String(response.headers.get('set-cookie') || '').split(';')[0]
}

const collectEvidence = async ({ baseUrl, manifest }) => {
  const hostToken = manifest.profiles?.host?.token || ''
  const memberBToken = manifest.profiles?.memberB?.token || ''
  const sessionId = manifest.session?.sessionId || ''
  const briefId = manifest.brief?.briefId || ''
  const readyTaskId = manifest.shareTasks?.readyTaskId || ''
  const failedTaskId = manifest.shareTasks?.failedTaskId || ''
  const category = manifest.m5?.rankingCategory || 'best_opening'
  const evidence = {
    exportedAt: nowIso(),
    manifestId: manifest.id,
    prefix: manifest.prefix,
    timeline: null,
    memberBTimeline: null,
    brief: null,
    readyTask: null,
    failedTask: null,
    ranking: null,
    memberBCommerce: null,
    errors: [],
  }
  const safeGet = async (key, fn) => {
    try {
      evidence[key] = await fn()
    } catch (error) {
      evidence.errors.push({ key, message: error.message })
    }
  }
  if (sessionId && hostToken) {
    await safeGet('timeline', () => api(baseUrl, `/sessions/${encodeURIComponent(sessionId)}/timeline`, { token: hostToken }))
  }
  if (sessionId && memberBToken) {
    await safeGet('memberBTimeline', () => api(baseUrl, `/sessions/${encodeURIComponent(sessionId)}/timeline`, { token: memberBToken }))
  }
  if (briefId && hostToken) {
    await safeGet('brief', () => api(baseUrl, `/session-briefs/${encodeURIComponent(briefId)}`, { token: hostToken }))
  }
  if (readyTaskId && hostToken) {
    await safeGet('readyTask', () => api(baseUrl, `/share-image-tasks/${encodeURIComponent(readyTaskId)}`, { token: hostToken }))
  }
  if (failedTaskId && hostToken) {
    await safeGet('failedTask', () => api(baseUrl, `/share-image-tasks/${encodeURIComponent(failedTaskId)}`, { token: hostToken }))
  }
  if (hostToken) {
    await safeGet('ranking', () => api(baseUrl, `/rankings/today?category=${encodeURIComponent(category)}`, { token: hostToken }))
  }
  if (memberBToken) {
    await safeGet('memberBCommerce', () => api(baseUrl, '/user/commerce', { token: memberBToken }))
  }
  return evidence
}

const makeManifest = ({ prefix, baseUrl, profiles }) => ({
  id: 'INT-DATA-001',
  prefix,
  environment: isLocalBaseUrl(baseUrl) ? 'local' : 'api.pomer.cn',
  baseUrl,
  createdAt: nowIso(),
  createdBy: 'backend/API fixture script',
  cleanupAuthorizedBy: '',
  profiles: {
    host: { profileId: profiles.host.profile.id, token: profiles.host.token, role: 'host', name: profiles.host.profile.name },
    memberA: { profileId: profiles.memberA.profile.id, token: profiles.memberA.token, role: 'member', name: profiles.memberA.profile.name },
    memberB: { profileId: profiles.memberB.profile.id, token: profiles.memberB.token, role: 'member', name: profiles.memberB.profile.name },
    outsider: { profileId: profiles.outsider.profile.id, token: profiles.outsider.token, role: 'outsider', name: profiles.outsider.profile.name },
  },
  session: { sessionId: '', inviteCode: '', status: 'creating' },
  moments: { openingId: '', highlightId: '', privateId: '', reviewMomentId: '', failedCandidateMomentId: '' },
  events: { drinkDebtEventId: '' },
  brief: { briefId: '' },
  shareTasks: { pendingTaskId: '', readyTaskId: '', readyImageUrl: '', failedTaskId: '', expiredTaskId: '' },
  admin: { reportId: '', operationLogIds: [] },
  m5: { rankingCategory: 'best_opening', rankingItemId: '', nominationId: '', rewardPayoutId: '', pointsLedgerIds: [] },
  cleanup: {
    mode: 'manifest-only',
    command: '',
    mustExportEvidenceBeforeCleanup: true,
  },
  warnings: [],
})

const createFixture = async ({ args }) => {
  const baseUrl = normalizeBaseUrl(args['base-url'])
  const prefix = cleanText(args.prefix) || `IT-MOMENTS-${todayYmd()}`
  if (!prefix.startsWith('IT-MOMENTS-')) {
    throw new Error('prefix must start with IT-MOMENTS-')
  }
  if (!args.keep) {
    throw new Error('create requires --keep so shared integration data is not auto-cleaned by accident')
  }

  const manifestPath = resolvePath(args.manifest, defaultManifest)
  let child = null
  try {
    const profiles = await prepareProfiles({ baseUrl, prefix, args })
    child = args['no-start-server'] ? null : await startServer(baseUrl)
    const manifest = makeManifest({ prefix, baseUrl, profiles })
    const host = manifest.profiles.host
    const memberA = manifest.profiles.memberA
    const memberB = manifest.profiles.memberB
    const outsider = manifest.profiles.outsider

    const sessionName = `${prefix}-session`
    const created = await api(baseUrl, '/sessions', {
      method: 'POST',
      token: host.token,
      body: {
        sessionName,
        playerCount: 3,
        templateName: `${prefix}-template`,
        selectedPlayers: [
          { profileId: memberA.profileId, name: memberA.name, avatarUrl: '/static/avatar-qa.png' },
          { profileId: memberB.profileId, name: memberB.name, avatarUrl: '/static/avatar-qa.png' },
        ],
      },
    })
    manifest.session.sessionId = created.id
    manifest.session.inviteCode = created.inviteCode
    manifest.session.status = 'created'

    await api(baseUrl, '/sessions/join', { method: 'POST', token: memberA.token, body: { inviteCode: created.inviteCode } })
    await api(baseUrl, '/sessions/join', { method: 'POST', token: memberB.token, body: { inviteCode: created.inviteCode } })
    await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}`, {
      method: 'PUT',
      token: host.token,
      body: { state: '进行中', status: '正常' },
    })

    const asset = await api(baseUrl, '/moments/uploads/image', {
      method: 'POST',
      token: host.token,
      body: { sessionId: created.id, fileName: `${prefix}-opening.png`, dataUrl: tinyPngDataUrl },
    })

    const opening = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/moments`, {
      method: 'POST',
      token: host.token,
      body: {
        clientDraftId: `${prefix}-opening`,
        nodeType: 'opening',
        caption: `${prefix} opening`,
        imageUrl: asset.url,
        tags: ['INT-DATA-001', prefix],
      },
    })
    manifest.moments.openingId = opening.id

    const highlight = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/moments`, {
      method: 'POST',
      token: memberA.token,
      body: {
        clientDraftId: `${prefix}-highlight`,
        nodeType: 'highlight',
        caption: `${prefix} highlight`,
        imageUrl: asset.url,
        tags: ['INT-DATA-001', 'highlight'],
      },
    })
    manifest.moments.highlightId = highlight.id

    const privateMoment = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/moments`, {
      method: 'POST',
      token: memberA.token,
      body: {
        clientDraftId: `${prefix}-private-a-to-b`,
        nodeType: 'private',
        visibility: 'selected',
        visibleProfileIds: [memberB.profileId],
        caption: `${prefix} private for member B`,
        imageUrl: asset.url,
        tags: ['INT-DATA-001', 'private'],
      },
    })
    manifest.moments.privateId = privateMoment.id

    const failedCandidate = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/moments`, {
      method: 'POST',
      token: memberA.token,
      body: {
        clientDraftId: `${prefix}-failed-candidate`,
        nodeType: 'highlight',
        caption: `${prefix} failed share candidate`,
        imageUrl: asset.url,
        tags: ['INT-DATA-001', 'failed-candidate'],
      },
    })
    manifest.moments.failedCandidateMomentId = failedCandidate.id

    const event = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/events`, {
      method: 'POST',
      token: host.token,
      body: {
        clientEventId: `${prefix}-drink-debt`,
        eventType: 'drink_debt',
        targetProfileId: memberA.profileId,
        scoreDelta: 1,
        caption: `${prefix} drink debt`,
      },
    })
    manifest.events.drinkDebtEventId = event.id

    const brief = await api(baseUrl, `/sessions/${encodeURIComponent(created.id)}/brief`, {
      method: 'POST',
      token: host.token,
      body: { title: `${prefix} brief`, coverMode: 'opening_collage' },
    })
    manifest.brief.briefId = brief.id

    const pendingTask = await api(baseUrl, `/session-briefs/${encodeURIComponent(brief.id)}/share-image-tasks`, {
      method: 'POST',
      token: host.token,
      body: { layoutMode: `${prefix}-pending` },
    })
    manifest.shareTasks.pendingTaskId = pendingTask.id

    const readyTaskSeed = await api(baseUrl, `/session-briefs/${encodeURIComponent(brief.id)}/share-image-tasks`, {
      method: 'POST',
      token: host.token,
      body: { layoutMode: `${prefix}-ready` },
    })
    const readyTask = await api(baseUrl, `/share-image-tasks/${encodeURIComponent(readyTaskSeed.id)}/process`, {
      method: 'POST',
      token: host.token,
    })
    manifest.shareTasks.readyTaskId = readyTask.id
    manifest.shareTasks.readyImageUrl = readyTask.imageUrl

    const adminCookie = await loginAdmin(baseUrl, args)
    if (adminCookie) {
      await api(baseUrl, `/admin/moments/${encodeURIComponent(opening.id)}/review`, {
        method: 'POST',
        cookie: adminCookie,
        body: { action: 'approve', reason: `${prefix} approve opening for ranking` },
      })
      await api(baseUrl, `/admin/moments/${encodeURIComponent(failedCandidate.id)}/review`, {
        method: 'POST',
        cookie: adminCookie,
        body: { action: 'approve', reason: `${prefix} approve failed candidate before task creation` },
      })
    } else {
      manifest.warnings.push('admin cookie missing; skipped approve/hide/reward actions')
    }

    const failedTaskSeed = await api(baseUrl, `/session-briefs/${encodeURIComponent(brief.id)}/share-image-tasks`, {
      method: 'POST',
      token: host.token,
      body: { layoutMode: `${prefix}-failed`, selectedNodeIds: [failedCandidate.id] },
    })
    if (adminCookie) {
      await api(baseUrl, `/admin/moments/${encodeURIComponent(failedCandidate.id)}/review`, {
        method: 'POST',
        cookie: adminCookie,
        body: { action: 'hide', reason: `${prefix} hide failed candidate before process` },
      })
    }

    const failedTask = await api(baseUrl, `/share-image-tasks/${encodeURIComponent(failedTaskSeed.id)}/process`, {
      method: 'POST',
      token: host.token,
    })
    manifest.shareTasks.failedTaskId = failedTask.id
    if (failedTask.status !== 'failed') {
      manifest.warnings.push(`failed task status is ${failedTask.status}, expected failed`)
    }

    const nomination = await api(baseUrl, `/moments/${encodeURIComponent(opening.id)}/nominations`, {
      method: 'POST',
      token: memberB.token,
      body: { category: manifest.m5.rankingCategory, clientNominationId: `${prefix}-nomination-b-opening` },
    })
    manifest.m5.nominationId = nomination.id

    const ranking = await api(baseUrl, `/rankings/today?category=${encodeURIComponent(manifest.m5.rankingCategory)}`, {
      token: host.token,
    })
    const rankingItem = (ranking.items || []).find((item) => item.moment?.id === opening.id)
    manifest.m5.rankingItemId = rankingItem?.moment?.id || opening.id

    if (adminCookie) {
      const rewardGrant = await api(baseUrl, '/admin/ranking-rewards/grant', {
        method: 'POST',
        cookie: adminCookie,
        body: { category: manifest.m5.rankingCategory },
      })
      manifest.m5.rewardPayoutId = (rewardGrant.items || []).find((item) => item.momentId === opening.id)?.id || ''
      if (!manifest.m5.rewardPayoutId) {
        manifest.warnings.push('reward grant did not return payout for opening sample')
      }
    }

    if (isLocalBaseUrl(baseUrl)) {
      const momentsStore = readMomentsStore()
      const expiredTask = {
        ...pendingTask,
        id: `share-task-${prefix.toLowerCase()}-expired`,
        status: 'expired',
        layoutMode: `${prefix}-expired`,
        selectedNodeIds: [opening.id],
        failedReason: `${prefix} local expired fixture`,
        retryCount: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      momentsStore.shareImageTasks.unshift(expiredTask)
      momentsStore.momentReports.unshift({
        id: `moment-report-${prefix.toLowerCase()}`,
        momentId: privateMoment.id,
        sessionId: created.id,
        reporterProfileId: host.profileId,
        reporterName: host.name,
        reason: `${prefix} report private sample`,
        description: `${prefix} integration report sample`,
        status: 'pending',
        createdAt: nowIso(),
      })
      writeMomentsStore(momentsStore)
      manifest.shareTasks.expiredTaskId = expiredTask.id
      manifest.admin.reportId = `moment-report-${prefix.toLowerCase()}`
    } else {
      manifest.warnings.push('remote expired task and report sample skipped; no safe public API/helper available')
    }

    manifest.cleanup.command = `node backend/scripts/prepare-moments-integration-fixture.js --mode cleanup --manifest ${path.relative(repoRoot, manifestPath).replace(/\\/g, '/')}`
    manifest.evidence = await collectEvidence({ baseUrl, manifest })
    writeJsonFile(manifestPath, manifest)
    console.log(JSON.stringify({ ok: true, mode: 'create', manifest: manifestPath, sessionId: manifest.session.sessionId }, null, 2))
    return manifest
  } finally {
    await stopServer(child)
  }
}

const removeUploadedFiles = (urls = []) => {
  urls.forEach((url) => {
    const value = cleanText(url)
    if (!value.startsWith('/uploads/moments/')) {
      return
    }
    const resolved = path.resolve(path.join(uploadsRoot, value.replace(/^\/uploads\//, '')))
    if (!resolved.startsWith(path.resolve(uploadsRoot))) {
      return
    }
    if (fs.existsSync(resolved)) {
      fs.rmSync(resolved, { force: true })
    }
  })
}

const cleanupLocalFixture = ({ manifest, evidencePath }) => {
  if (!manifest.prefix?.startsWith('IT-MOMENTS-')) {
    throw new Error('cleanup refused: manifest prefix must start with IT-MOMENTS-')
  }
  if (manifest.environment !== 'local') {
    throw new Error('cleanup refused: remote cleanup is not supported by this script')
  }
  const evidence = {
    exportedAt: nowIso(),
    manifest,
    momentsStore: readMomentsStore(),
    contentStore: readContentStore(),
    adminStore: getAdminStore(),
  }
  if (evidencePath) {
    writeJsonFile(evidencePath, evidence)
  }

  const profileIds = new Set(Object.values(manifest.profiles || {}).map((item) => cleanText(item.profileId)).filter(Boolean))
  const sessionId = cleanText(manifest.session?.sessionId)
  const targetIds = new Set([
    ...Object.values(manifest.moments || {}),
    ...Object.values(manifest.events || {}),
    ...Object.values(manifest.shareTasks || {}),
    manifest.admin?.reportId,
    manifest.m5?.nominationId,
    manifest.m5?.rewardPayoutId,
  ].map(cleanText).filter(Boolean))

  const socialStore = readSocialStore()
  socialStore.profiles = (socialStore.profiles || []).filter((item) => !profileIds.has(cleanText(item.id)))
  socialStore.loginLogs = (socialStore.loginLogs || []).filter((item) => !profileIds.has(cleanText(item.profileId)))
  socialStore.userSessions = (socialStore.userSessions || []).filter((item) => !profileIds.has(cleanText(item.profileId)))
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
    if (!Array.isArray(adminStore[key])) {
      return
    }
    adminStore[key] = adminStore[key].filter(
      (item) =>
        cleanText(item?.id) !== sessionId &&
        cleanText(item?.sessionId) !== sessionId &&
        cleanText(item?.meta?.sessionId) !== sessionId &&
        !targetIds.has(cleanText(item?.targetId)) &&
        !profileIds.has(cleanText(item?.profileId)) &&
        !profileIds.has(cleanText(item?.hostProfileId)),
    )
  })
  writeAdminStore(adminStore)

  const momentsStore = readMomentsStore()
  Object.keys(momentsStore).forEach((key) => {
    if (Array.isArray(momentsStore[key])) {
      momentsStore[key] = momentsStore[key].filter(
        (item) =>
          cleanText(item?.sessionId) !== sessionId &&
          !targetIds.has(cleanText(item?.id)) &&
          !targetIds.has(cleanText(item?.momentId)) &&
          !targetIds.has(cleanText(item?.briefId)),
      )
    }
  })
  writeMomentsStore(momentsStore)
  removeUploadedFiles([manifest.shareTasks?.readyImageUrl])
  console.log(JSON.stringify({ ok: true, mode: 'cleanup', sessionId, evidence: evidencePath || '' }, null, 2))
}

const statusFixture = async ({ args }) => {
  const manifestPath = resolvePath(args.manifest, defaultManifest)
  if (!fs.existsSync(manifestPath)) {
    console.log(JSON.stringify({ ok: true, mode: 'status', exists: false, manifest: manifestPath }, null, 2))
    return
  }
  const manifest = readJsonFile(manifestPath)
  const summary = {
    ok: true,
    mode: 'status',
    exists: true,
    manifest: manifestPath,
    id: manifest.id,
    prefix: manifest.prefix,
    environment: manifest.environment,
    sessionId: manifest.session?.sessionId || '',
    createdAt: manifest.createdAt || '',
    warnings: manifest.warnings || [],
  }
  console.log(JSON.stringify(summary, null, 2))
}

const main = async () => {
  const args = parseArgs()
  const mode = cleanText(args.mode) || 'status'
  if (mode === 'status') {
    await statusFixture({ args })
    return
  }
  if (mode === 'create') {
    await createFixture({ args })
    return
  }
  if (mode === 'cleanup') {
    const manifestPath = resolvePath(args.manifest, defaultManifest)
    const evidencePath = args['export-evidence'] ? resolvePath(args['export-evidence'], '') : ''
    cleanupLocalFixture({ manifest: readJsonFile(manifestPath), evidencePath })
    return
  }
  throw new Error(`unsupported mode: ${mode}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
