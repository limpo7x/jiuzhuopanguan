const { fork } = require('child_process')
const path = require('path')

const { getAdminStore, writeAdminStore } = require('../data/admin')
const { readMomentsStore, writeMomentsStore } = require('../data/moments')
const { deleteObject } = require('../data/object-storage')
const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const port = Number(process.env.SMOKE_VIDEO_PORT || 3221)
const baseUrl = `http://127.0.0.1:${port}`
const tinyPngDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    delay(ms).then(() => {
      throw new Error(`${label} timed out after ${ms}ms`)
    }),
  ])

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
    await delay(300)
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
  const exited = new Promise((resolve) => child.once('exit', resolve))
  child.kill('SIGTERM')
  const timedOut = await Promise.race([
    exited.then(() => false),
    delay(3000).then(() => true),
  ])
  if (timedOut) {
    child.kill('SIGKILL')
    await Promise.race([exited, delay(1000)])
  }
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

const uploadVideo = async ({ token, sessionId, stamp }) => {
  const form = new FormData()
  const videoBytes = Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
    0x6d, 0x70, 0x34, 0x32, 0x00, 0x00, 0x00, 0x00,
    0x6d, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6f, 0x6d,
    0x00, 0x00, 0x00, 0x08, 0x6d, 0x64, 0x61, 0x74,
  ])
  form.append('file', new Blob([videoBytes], { type: 'video/mp4' }), `video-${stamp}.mp4`)
  form.append('sessionId', sessionId)
  form.append('duration', '5')
  form.append('fileName', `video-${stamp}.mp4`)
  form.append('coverDataUrl', tinyPngDataUrl)

  const response = await fetch(`${baseUrl}/api/v1/moments/uploads/video`, {
    method: 'POST',
    headers: token ? { 'X-JZP-User-Token': token } : undefined,
    body: form,
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || payload.code !== 0) {
    const error = new Error(`video upload failed: ${payload?.message || response.status}`)
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
      signature: 'video moment smoke account',
      identityTag: 'QA',
    },
  })

const cleanupSmokeData = async ({ profileIds = [], sessionId = '' } = {}) => {
  const profileIdSet = new Set(profileIds.map((item) => String(item)))
  const momentsStore = readMomentsStore()
  const assets = (momentsStore.uploadedAssets || []).filter((item) => String(item?.sessionId || '') === String(sessionId))
  for (const asset of assets) {
    if (asset.objectKey) {
      await withTimeout(deleteObject({ key: asset.objectKey }), 5000, `delete ${asset.objectKey}`).catch(() => undefined)
    }
    if (asset.coverObjectKey) {
      await withTimeout(deleteObject({ key: asset.coverObjectKey }), 5000, `delete ${asset.coverObjectKey}`).catch(() => undefined)
    }
  }
  Object.keys(momentsStore).forEach((key) => {
    if (Array.isArray(momentsStore[key])) {
      momentsStore[key] = momentsStore[key].filter((item) => String(item?.sessionId || '') !== String(sessionId))
    }
  })
  writeMomentsStore(momentsStore)

  const adminStore = getAdminStore()
  Object.keys(adminStore).forEach((key) => {
    if (!Array.isArray(adminStore[key])) {
      return
    }
    adminStore[key] = adminStore[key].filter(
      (item) =>
        String(item?.id || '') !== String(sessionId) &&
        String(item?.sessionId || '') !== String(sessionId) &&
        !profileIdSet.has(String(item?.profileId || '')) &&
        !profileIdSet.has(String(item?.hostProfileId || '')),
    )
  })
  writeAdminStore(adminStore)

  const socialStore = readSocialStore()
  socialStore.profiles = (socialStore.profiles || []).filter((item) => !profileIdSet.has(String(item.id)))
  socialStore.loginLogs = (socialStore.loginLogs || []).filter((item) => !profileIdSet.has(String(item.profileId)))
  socialStore.userSessions = (socialStore.userSessions || []).filter((item) => !profileIdSet.has(String(item.profileId)))
  writeSocialStore(socialStore)
}

const main = async () => {
  const stamp = Date.now()
  const hostSession = createMiniSession({ openId: `video-moment-host-${stamp}`, name: `Video Host ${stamp}` })
  const profileIds = [hostSession.profile.id]
  let sessionId = ''
  let child = null

  try {
    child = await startServer()

    const created = await api('/api/v1/sessions', {
      method: 'POST',
      token: hostSession.token,
      body: {
        sessionName: `QA-Video-Moment-${stamp}`,
        playerCount: 1,
        templateName: 'Video Moment Smoke',
        selectedPlayers: [],
      },
    })
    sessionId = created.id
    assert(sessionId, 'create session did not return session id')

    const openingAsset = await api('/api/v1/moments/uploads/image', {
      method: 'POST',
      token: hostSession.token,
      body: {
        sessionId,
        fileName: `opening-${stamp}.png`,
        dataUrl: tinyPngDataUrl,
      },
    })

    const opening = await api(`/api/v1/sessions/${encodeURIComponent(sessionId)}/moments`, {
      method: 'POST',
      token: hostSession.token,
      body: {
        clientDraftId: `opening-video-smoke-${stamp}`,
        imageUrl: openingAsset.url,
        nodeType: 'opening',
        uploadAssetId: openingAsset.id,
        visibility: 'session',
      },
    })
    assert(opening.imageUrl, 'opening moment missing imageUrl')

    const videoAsset = await uploadVideo({ token: hostSession.token, sessionId, stamp })
    assert(videoAsset.url, 'video upload did not return url')
    assert(videoAsset.coverImageUrl, 'video upload did not return coverImageUrl')

    const videoMoment = await api(`/api/v1/sessions/${encodeURIComponent(sessionId)}/moments`, {
      method: 'POST',
      token: hostSession.token,
      body: {
        clientDraftId: `video-moment-smoke-${stamp}`,
        coverImageUrl: videoAsset.coverImageUrl,
        duration: videoAsset.duration || 5,
        mediaType: 'video',
        nodeType: 'highlight',
        uploadAssetId: videoAsset.id,
        videoUrl: videoAsset.url,
        visibility: 'session',
      },
    })
    assert(videoMoment.mediaType === 'video', 'video moment mediaType mismatch')
    assert(videoMoment.videoUrl === videoAsset.url, 'video moment videoUrl mismatch')
    assert(videoMoment.coverImageUrl === videoAsset.coverImageUrl, 'video moment coverImageUrl mismatch')

    const timeline = await api(`/api/v1/sessions/${encodeURIComponent(sessionId)}/timeline`, {
      token: hostSession.token,
    })
    const timelineVideo = (timeline.nodes || []).find((item) => item.id === videoMoment.id)
    assert(timelineVideo?.mediaType === 'video', 'timeline missing video node')
    assert(timelineVideo.videoUrl === videoAsset.url, 'timeline videoUrl mismatch')
    assert(timelineVideo.coverImageUrl === videoAsset.coverImageUrl, 'timeline coverImageUrl mismatch')

    console.info('[smoke:video-moments] ok', {
      sessionId,
      videoMomentId: videoMoment.id,
      videoTail: String(videoAsset.url).split('/').slice(-2).join('/'),
    })
  } finally {
    await stopServer(child)
    await cleanupSmokeData({ profileIds, sessionId }).catch((error) => {
      console.warn('[smoke:video-moments] cleanup failed', error?.message || error)
    })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
