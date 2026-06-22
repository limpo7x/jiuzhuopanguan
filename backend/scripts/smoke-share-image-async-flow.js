#!/usr/bin/env node

require('../load-env')

const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')

const { createManagedSession, getAdminStore, writeAdminStore } = require('../data/admin')
const {
  createOrRefreshSessionBrief,
  createSessionEvent,
  createShareImageTask,
  readMomentsStore,
  writeMomentsStore,
} = require('../data/moments')
const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const uploadsRoot = path.join(backendDir, 'public', 'uploads')
const port = Number(process.env.SMOKE_SHARE_IMAGE_ASYNC_PORT || 3222)
const baseUrl = `http://127.0.0.1:${port}`

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const waitForServer = async (timeoutMs = 15000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/v1/config/home`)
      if (response.ok) {
        return
      }
    } catch (error) {
      void error
    }
    await delay(250)
  }
  throw new Error('backend server did not start in time')
}

const startServer = async () => {
  const child = fork(serverEntry, {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(port),
      UPLOAD_PROVIDER: 'local',
    },
    silent: true,
  })
  child.stdout?.on('data', (chunk) => process.stdout.write(String(chunk)))
  child.stderr?.on('data', (chunk) => process.stderr.write(String(chunk)))
  await waitForServer()
  return child
}

const stopServer = async (child) => {
  if (!child || child.killed) {
    return
  }
  child.kill()
  await new Promise((resolve) => child.once('exit', resolve))
}

const api = async (pathname, { method = 'GET', token = '', body } = {}) => {
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

const createMiniSession = ({ openId, name }) =>
  bindWechatUser({
    wechatOpenId: openId,
    profile: {
      name,
      avatarUrl: '/static/avatar-qa.png',
      signature: 'share image async smoke account',
      identityTag: 'QA',
    },
  })

const waitForTerminalTaskStatus = async ({ taskId, token, routePrefix = 'share-image-tasks', timeoutMs = 12000 }) => {
  const statuses = []
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const task = await api(`/api/v1/${routePrefix}/${encodeURIComponent(taskId)}`, { token })
    statuses.push(task.status)
    if (task.status === 'ready' || task.status === 'failed') {
      return { task, statuses }
    }
    await delay(300)
  }
  throw new Error(`share image task did not finish: ${statuses.join(' -> ')}`)
}

const getShareTaskId = (task = {}) =>
  String(task.id || task.shareImageId || task.shareImageTaskId || task.taskId || '').trim()

const removeUploadedFiles = (urls = []) => {
  urls.forEach((url) => {
    const text = String(url || '')
    if (!text.startsWith('/uploads/moments/')) {
      return
    }
    const resolved = path.resolve(path.join(uploadsRoot, text.replace(/^\/uploads\//, '')))
    if (!resolved.startsWith(path.resolve(uploadsRoot))) {
      return
    }
    if (fs.existsSync(resolved)) {
      fs.rmSync(resolved, { force: true })
    }
  })
}

const cleanupSmokeData = ({ marker, profileIds = [], sessionIds = [], uploadedUrls = [] } = {}) => {
  const profileIdSet = new Set(profileIds.map((item) => String(item)))
  const sessionIdSet = new Set(sessionIds.map((item) => String(item)).filter(Boolean))
  if (profileIdSet.size) {
    const socialStore = readSocialStore()
    socialStore.profiles = (socialStore.profiles || []).filter((item) => !profileIdSet.has(String(item.id)))
    socialStore.loginLogs = (socialStore.loginLogs || []).filter((item) => !profileIdSet.has(String(item.profileId)))
    socialStore.userSessions = (socialStore.userSessions || []).filter((item) => !profileIdSet.has(String(item.profileId)))
    writeSocialStore(socialStore)
  }

  if (sessionIdSet.size || marker) {
    const adminStore = getAdminStore()
    Object.keys(adminStore).forEach((key) => {
      if (!Array.isArray(adminStore[key])) {
        return
      }
      adminStore[key] = adminStore[key].filter(
        (item) =>
          !sessionIdSet.has(String(item?.id || '')) &&
          !sessionIdSet.has(String(item?.sessionId || '')) &&
          !sessionIdSet.has(String(item?.meta?.sessionId || '')) &&
          !String(item?.name || '').includes(marker),
      )
    })
    writeAdminStore(adminStore)

    const momentsStore = readMomentsStore()
    Object.keys(momentsStore).forEach((key) => {
      if (Array.isArray(momentsStore[key])) {
        momentsStore[key] = momentsStore[key].filter((item) => !sessionIdSet.has(String(item?.sessionId || '')))
      }
    })
    writeMomentsStore(momentsStore)
  }

  removeUploadedFiles(uploadedUrls)
}

const collectUploadedUrls = (...tasks) =>
  tasks
    .flatMap((task) => [task?.imageUrl, task?.url, task?.publicUrl, task?.localCompatUrl])
    .map((item) => String(item || ''))
    .filter(Boolean)

const markTaskFailed = (taskId, reason) => {
  const store = readMomentsStore()
  store.shareImageTasks = (store.shareImageTasks || []).map((task) =>
    task.id === taskId
      ? {
          ...task,
          status: 'failed',
          failedReason: reason,
          finishedAt: new Date().toISOString(),
        }
      : task,
  )
  store.sessionBriefs = (store.sessionBriefs || []).map((brief) =>
    brief.shareImageTaskId === taskId
      ? {
          ...brief,
          shareImageStatus: 'failed',
          updatedAt: new Date().toISOString(),
        }
      : brief,
  )
  writeMomentsStore(store)
}

const seedFailedRetryTask = ({ marker, hostSession, memberSession, layoutMode }) => {
  const session = createManagedSession({
    sessionName: `QA-${marker}-${layoutMode}`,
    playerCount: 2,
    templateName: 'Share Image Async Retry Smoke',
    hostProfileId: hostSession.profile.id,
    hostName: hostSession.profile.name,
    hostAvatarUrl: hostSession.profile.avatarUrl,
    state: '进行中',
    status: '正常',
    selectedPlayers: [
      {
        profileId: memberSession.profile.id,
        name: memberSession.profile.name,
        avatarUrl: memberSession.profile.avatarUrl,
      },
    ],
  })
  createSessionEvent({
    sessionId: session.id,
    profile: hostSession.profile,
    payload: {
      clientEventId: `${marker}-${layoutMode}-event`,
      eventType: 'drink_debt',
      targetProfileId: memberSession.profile.id,
      scoreDelta: 1,
      caption: 'async retry share image event',
    },
  })
  const brief = createOrRefreshSessionBrief({ sessionId: session.id, profile: hostSession.profile })
  const task = createShareImageTask({
    briefId: brief.id,
    profile: hostSession.profile,
    payload: { layoutMode },
  })
  markTaskFailed(task.id, 'preset smoke failure before retry')
  return {
    sessionId: session.id,
    briefId: brief.id,
    taskId: task.id,
  }
}

const main = async () => {
  const stamp = Date.now()
  const marker = `share-async-${stamp}`
  const createdProfileIds = []
  const uploadedUrls = []
  const createdSessionIds = []
  let child = null
  const hostSession = createMiniSession({ openId: `${marker}-host`, name: `Share Async Host ${stamp}` })
  const memberSession = createMiniSession({ openId: `${marker}-member`, name: `Share Async Member ${stamp}` })
  createdProfileIds.push(hostSession.profile.id, memberSession.profile.id)
  const legacyRetrySeed = seedFailedRetryTask({
    marker,
    hostSession,
    memberSession,
    layoutMode: 'async-retry-legacy',
  })
  const modernRetrySeed = seedFailedRetryTask({
    marker,
    hostSession,
    memberSession,
    layoutMode: 'async-retry-modern',
  })
  createdSessionIds.push(legacyRetrySeed.sessionId, modernRetrySeed.sessionId)

  try {
    child = await startServer()
    const legacyRetry = await api(`/api/v1/share-image-tasks/${encodeURIComponent(legacyRetrySeed.taskId)}/retry`, {
      method: 'POST',
      token: hostSession.token,
    })
    assert(legacyRetry.status === 'pending', `legacy retry returned ${legacyRetry.status}`)
    const legacyRetryResult = await waitForTerminalTaskStatus({ taskId: legacyRetry.id, token: hostSession.token })

    const modernRetry = await api(`/api/v1/share-images/${encodeURIComponent(modernRetrySeed.taskId)}/retry`, {
      method: 'POST',
      token: hostSession.token,
    })
    assert(modernRetry.status === 'pending', `modern retry returned ${modernRetry.status}`)
    assert(getShareTaskId(modernRetry), 'modern retry response did not include task id')
    const modernRetryResult = await waitForTerminalTaskStatus({
      taskId: getShareTaskId(modernRetry),
      token: hostSession.token,
      routePrefix: 'share-images',
    })

    const created = await api('/api/v1/sessions', {
      method: 'POST',
      token: hostSession.token,
      body: {
        sessionName: `QA-${marker}`,
        playerCount: 2,
        templateName: 'Share Image Async Smoke',
        selectedPlayers: [
          {
            profileId: memberSession.profile.id,
            name: memberSession.profile.name,
            avatarUrl: memberSession.profile.avatarUrl,
          },
        ],
      },
    })
    createdSessionIds.push(created.id)

    await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/events`, {
      method: 'POST',
      token: hostSession.token,
      body: {
        clientEventId: `${marker}-event`,
        eventType: 'drink_debt',
        targetProfileId: memberSession.profile.id,
        scoreDelta: 1,
        caption: 'async share image event',
      },
    })

    const brief = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/brief`, {
      method: 'POST',
      token: hostSession.token,
      body: {},
    })

    const legacyCreate = await api(`/api/v1/session-briefs/${encodeURIComponent(brief.id)}/share-image-tasks`, {
      method: 'POST',
      token: hostSession.token,
      body: { layoutMode: 'async-legacy' },
    })
    assert(['pending', 'processing'].includes(legacyCreate.status), `legacy create returned ${legacyCreate.status}`)
    const legacyResult = await waitForTerminalTaskStatus({ taskId: legacyCreate.id, token: hostSession.token })

    const modernCreate = await api(`/api/v1/briefs/${encodeURIComponent(brief.id)}/share-images`, {
      method: 'POST',
      token: hostSession.token,
      body: { layoutMode: 'async-modern' },
    })
    assert(['pending', 'processing'].includes(modernCreate.status), `modern create returned ${modernCreate.status}`)
    assert(getShareTaskId(modernCreate), 'modern create response did not include task id')
    const modernResult = await waitForTerminalTaskStatus({
      taskId: getShareTaskId(modernCreate),
      token: hostSession.token,
      routePrefix: 'share-images',
    })

    uploadedUrls.push(...collectUploadedUrls(legacyResult.task, modernResult.task))
    uploadedUrls.push(...collectUploadedUrls(legacyRetryResult.task, modernRetryResult.task))
    const result = {
      ok: true,
      baseUrl,
      marker,
      sessionId: created.id,
      briefId: brief.id,
      retryLegacy: {
        createdStatus: legacyRetry.status,
        statuses: legacyRetryResult.statuses,
        finalStatus: legacyRetryResult.task.status,
      },
      retryModern: {
        createdStatus: modernRetry.status,
        statuses: modernRetryResult.statuses,
        finalStatus: modernRetryResult.task.status,
      },
      legacy: {
        createdStatus: legacyCreate.status,
        statuses: legacyResult.statuses,
        finalStatus: legacyResult.task.status,
      },
      modern: {
        createdStatus: modernCreate.status,
        statuses: modernResult.statuses,
        finalStatus: modernResult.task.status,
      },
      processRouteCalled: false,
    }
    assert(['ready', 'failed'].includes(result.legacy.finalStatus), `legacy final status ${result.legacy.finalStatus}`)
    assert(['ready', 'failed'].includes(result.modern.finalStatus), `modern final status ${result.modern.finalStatus}`)
    assert(['ready', 'failed'].includes(result.retryLegacy.finalStatus), `legacy retry final status ${result.retryLegacy.finalStatus}`)
    assert(['ready', 'failed'].includes(result.retryModern.finalStatus), `modern retry final status ${result.retryModern.finalStatus}`)
    console.log(JSON.stringify(result, null, 2))
  } finally {
    await stopServer(child)
    cleanupSmokeData({
      marker,
      profileIds: createdProfileIds,
      sessionIds: createdSessionIds,
      uploadedUrls,
    })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
