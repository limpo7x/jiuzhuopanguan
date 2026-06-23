const fs = require('fs')
const net = require('net')
const path = require('path')
const { fork } = require('child_process')

const { getAdminStore, writeAdminStore } = require('../data/admin')
const { getInviteLiveSessionAccess } = require('../data/live-session-access')
const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const smokeLockPath = path.join(backendDir, 'data', '.smoke-live-session-privacy.lock')
let port = 0
const getBaseUrl = () => `http://127.0.0.1:${port}`
const publicInviteKeys = new Set([
  'hostName',
  'id',
  'inviteCode',
  'firstPhotoUploadedAt',
  'hasFirstPhoto',
  'isActiveForResume',
  'joinedCount',
  'partyId',
  'playerCount',
  'sessionName',
  'stateText',
  'status',
  'subtitle',
  'templateImageUrl',
  'templateName',
  'title',
])
const privateKeys = [
  'accountingHighlights',
  'coverPhotoUrl',
  'eventHighlights',
  'filteredNodeIds',
  'hostAvatarUrl',
  'hostProfileId',
  'joinedPlayers',
  'joinStatusPlayers',
  'keyEvents',
  'ledgerSummary',
  'photoHighlights',
  'shareContentFilter',
  'visibleNodeIds',
  'visibleNodes',
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const acquireSmokeLock = async (timeoutMs = 15000) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const handle = fs.openSync(smokeLockPath, 'wx')
      fs.writeFileSync(handle, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }))
      return handle
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error
      const ageMs = Date.now() - fs.statSync(smokeLockPath).mtimeMs
      if (ageMs > 60000) {
        fs.rmSync(smokeLockPath, { force: true })
        continue
      }
      await delay(100)
    }
  }
  throw new Error('timed out waiting for live session privacy smoke lock')
}

const releaseSmokeLock = (handle) => {
  if (handle === null || handle === undefined) return
  fs.closeSync(handle)
  fs.rmSync(smokeLockPath, { force: true })
}

const getAvailablePort = () =>
  new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      const availablePort = typeof address === 'object' && address ? address.port : 0
      probe.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(availablePort)
      })
    })
  })

const waitForServer = async (child, timeoutMs = 15000) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`backend server exited before startup with code ${child.exitCode}`)
    }
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/config/home`)
      if (response.ok) {
        await delay(100)
        if (child.exitCode !== null) {
          throw new Error(`backend server exited during startup with code ${child.exitCode}`)
        }
        return
      }
    } catch (error) {
      void error
    }
    await delay(300)
  }
  throw new Error('backend server did not start in time')
}

const startServer = async () => {
  port = Number(process.env.SMOKE_PORT || 0) || await getAvailablePort()
  const child = fork(serverEntry, {
    cwd: backendDir,
    env: {
      ...process.env,
      MYSQL_DATABASE: '',
      MYSQL_HOST: '',
      MYSQL_USER: '',
      NORMALIZED_DB_READ: '',
      NORMALIZED_DB_WRITE: '',
      PORT: String(port),
    },
    silent: true,
  })
  child.stdout?.on('data', (chunk) => process.stdout.write(String(chunk)))
  child.stderr?.on('data', (chunk) => process.stderr.write(String(chunk)))
  await waitForServer(child)
  return child
}

const stopServer = async (child) => {
  if (!child || child.exitCode !== null) return
  const exited = new Promise((resolve) => child.once('exit', resolve))
  if (!child.killed) child.kill()
  await Promise.race([exited, delay(5000)])
  if (child.exitCode === null) {
    child.kill('SIGKILL')
    await Promise.race([exited, delay(1000)])
  }
}

const request = async (pathname, token = '', options = {}) => {
  const response = await fetch(`${getBaseUrl()}${pathname}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-JZP-User-Token': token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  return {
    payload: await response.json().catch(() => null),
    status: response.status,
  }
}

const createMiniSession = ({ openId, name }) =>
  bindWechatUser({
    wechatOpenId: openId,
    profile: {
      avatarUrl: '/static/avatar-qa.png',
      identityTag: 'privacy-smoke',
      name,
      signature: 'live session privacy smoke',
    },
  })

const cleanup = ({ profileIds = [], sessionId = '' }) => {
  const profileIdSet = new Set(profileIds.map(String))
  const socialStore = readSocialStore()
  socialStore.profiles = (socialStore.profiles || []).filter((item) => !profileIdSet.has(String(item.id)))
  socialStore.loginLogs = (socialStore.loginLogs || []).filter((item) => !profileIdSet.has(String(item.profileId)))
  socialStore.userSessions = (socialStore.userSessions || []).filter((item) => !profileIdSet.has(String(item.profileId)))
  socialStore.friendships = (socialStore.friendships || []).filter(
    (item) => !profileIdSet.has(String(item.ownerId)) && !profileIdSet.has(String(item.friendId)),
  )
  socialStore.pokes = (socialStore.pokes || []).filter(
    (item) => !profileIdSet.has(String(item.senderId)) && !profileIdSet.has(String(item.receiverId)),
  )
  writeSocialStore(socialStore)

  if (sessionId || profileIdSet.size) {
    const adminStore = getAdminStore()
    Object.keys(adminStore).forEach((key) => {
      if (!Array.isArray(adminStore[key])) return
      adminStore[key] = adminStore[key].filter(
        (item) =>
          String(item?.id || '') !== sessionId &&
          String(item?.sessionId || '') !== sessionId &&
          String(item?.meta?.sessionId || '') !== sessionId &&
          !profileIdSet.has(String(item?.profileId || '')) &&
          !profileIdSet.has(String(item?.hostProfileId || '')),
      )
    })
    writeAdminStore(adminStore)
  }
}

const cleanupStaleSmokeData = () => {
  const socialStore = readSocialStore()
  const staleProfileIds = new Set(
    (socialStore.profiles || [])
      .filter(
        (item) =>
          String(item.identityTag || '') === 'privacy-smoke' ||
          String(item.wechatOpenId || '').startsWith('live-privacy-'),
      )
      .map((item) => String(item.id || ''))
      .filter(Boolean),
  )
  if (staleProfileIds.size) cleanup({ profileIds: [...staleProfileIds] })
}

const main = async () => {
  const policyProfileId = 'policy-member'
  const policyAppStoreSession = {
    id: 'policy-session-a',
    inviteCode: 'POLICY01',
    members: [{ profileId: policyProfileId }],
  }
  assert(
    getInviteLiveSessionAccess({
      appStoreSession: policyAppStoreSession,
      liveSession: { id: 'policy-session-a', inviteCode: 'POLICY01' },
      requestedInviteCode: 'POLICY01',
      viewerProfileId: policyProfileId,
    }) === 'private',
    'matching app_store and returned session should preserve member private view',
  )
  assert(
    getInviteLiveSessionAccess({
      appStoreSession: policyAppStoreSession,
      liveSession: { id: 'policy-session-b', inviteCode: 'POLICY01' },
      requestedInviteCode: 'POLICY01',
      viewerProfileId: policyProfileId,
    }) === 'public',
    'normalized/app_store session id mismatch must default to public',
  )
  assert(
    getInviteLiveSessionAccess({
      appStoreSession: policyAppStoreSession,
      liveSession: { id: 'policy-session-a', inviteCode: 'POLICY02' },
      requestedInviteCode: 'POLICY01',
      viewerProfileId: policyProfileId,
    }) === 'public',
    'normalized/app_store invite code mismatch must default to public',
  )
  assert(
    getInviteLiveSessionAccess({
      appStoreSession: null,
      liveSession: { id: 'policy-session-a', inviteCode: 'POLICY01' },
      requestedInviteCode: 'POLICY01',
      viewerProfileId: policyProfileId,
    }) === 'public',
    'missing app_store membership source must default to public',
  )
  let lockHandle = null
  let profileIds = []
  let child = null
  let sessionId = ''

  try {
    lockHandle = await acquireSmokeLock()
    cleanupStaleSmokeData()
    const stamp = Date.now()
    const host = createMiniSession({ openId: `live-privacy-host-${stamp}`, name: `Privacy Host ${stamp}` })
    const member = createMiniSession({ openId: `live-privacy-member-${stamp}`, name: `Privacy Member ${stamp}` })
    const outsider = createMiniSession({ openId: `live-privacy-outsider-${stamp}`, name: `Privacy Outsider ${stamp}` })
    profileIds = [host.profile.id, member.profile.id, outsider.profile.id]
    child = await startServer()
    const createdResponse = await request('/api/v1/sessions', host.token, {
      method: 'POST',
      body: {
        playerCount: 2,
        selectedPlayers: [{
          avatarUrl: member.profile.avatarUrl,
          name: member.profile.name,
          profileId: member.profile.id,
        }],
        sessionName: `Privacy Session ${stamp}`,
        templateName: 'Privacy Smoke',
      },
    })
    assert(createdResponse.status === 201, `create session expected 201, got ${createdResponse.status}`)
    const created = createdResponse.payload?.data || {}
    sessionId = String(created.id || '')
    assert(sessionId && created.inviteCode, 'created session identifiers missing')

    const joined = await request('/api/v1/sessions/join', member.token, {
      method: 'POST',
      body: { inviteCode: created.inviteCode },
    })
    assert(joined.status === 200, `join session expected 200, got ${joined.status}`)

    const anonymousDefault = await request('/api/v1/sessions/live')
    assert(anonymousDefault.status === 400, `anonymous default expected 400, got ${anonymousDefault.status}`)
    assert(anonymousDefault.payload?.message === 'sessionId or inviteCode required', 'anonymous default error message changed')

    const anonymousDirect = await request(`/api/v1/sessions/live?sessionId=${encodeURIComponent(sessionId)}`)
    assert(anonymousDirect.status === 401, `anonymous sessionId expected 401, got ${anonymousDirect.status}`)

    const outsiderDirect = await request(`/api/v1/sessions/live?sessionId=${encodeURIComponent(sessionId)}`, outsider.token)
    assert(outsiderDirect.status === 403, `outsider sessionId expected 403, got ${outsiderDirect.status}`)
    assert(!JSON.stringify(outsiderDirect.payload).includes(host.profile.id), 'outsider error leaked host profile id')

    const memberDirect = await request(`/api/v1/sessions/live?sessionId=${encodeURIComponent(sessionId)}`, member.token)
    assert(memberDirect.status === 200, `member sessionId expected 200, got ${memberDirect.status}`)
    assert(memberDirect.payload?.data?.hostProfileId === host.profile.id, 'member response lost host profile id')
    assert(Array.isArray(memberDirect.payload?.data?.joinedPlayers), 'member response lost joined players')

    const anonymousMixed = await request(
      `/api/v1/sessions/live?sessionId=${encodeURIComponent(sessionId)}&inviteCode=${encodeURIComponent(created.inviteCode)}`,
    )
    assert(anonymousMixed.status === 401, `anonymous mixed query expected 401, got ${anonymousMixed.status}`)

    const anonymousInvite = await request(`/api/v1/sessions/live?inviteCode=${encodeURIComponent(created.inviteCode)}`)
    assert(anonymousInvite.status === 200, `anonymous invite expected 200, got ${anonymousInvite.status}`)
    const preview = anonymousInvite.payload?.data || {}
    assert(Object.keys(preview).every((key) => publicInviteKeys.has(key)), `anonymous invite returned unexpected keys: ${Object.keys(preview).filter((key) => !publicInviteKeys.has(key)).join(',')}`)
    privateKeys.forEach((key) => assert(!(key in preview), `anonymous invite leaked private field ${key}`))
    assert(preview.id === sessionId, 'anonymous invite preview session id mismatch')
    assert(preview.inviteCode === created.inviteCode, 'anonymous invite preview code mismatch')

    const memberInvite = await request(`/api/v1/sessions/live?inviteCode=${encodeURIComponent(created.inviteCode)}`, member.token)
    assert(memberInvite.status === 200, `member invite expected 200, got ${memberInvite.status}`)
    assert(memberInvite.payload?.data?.hostProfileId === host.profile.id, 'member invite response should remain private member view')

    console.log(JSON.stringify({
      anonymousDefaultStatus: anonymousDefault.status,
      anonymousDirectStatus: anonymousDirect.status,
      anonymousInviteKeys: Object.keys(preview).sort(),
      anonymousMixedStatus: anonymousMixed.status,
      memberDirectStatus: memberDirect.status,
      memberInviteStatus: memberInvite.status,
      normalizedAppStoreIdentityMismatchDefaultsToPublic: true,
      ok: true,
      outsiderDirectStatus: outsiderDirect.status,
      port,
    }, null, 2))
  } finally {
    try {
      await stopServer(child)
      cleanup({ profileIds, sessionId })
    } finally {
      releaseSmokeLock(lockHandle)
    }
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exitCode = 1
})
