const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')

const { getAdminStore, writeAdminStore } = require('../data/admin')
const { readMomentsStore, writeMomentsStore } = require('../data/moments')
const { createDefaultUserCommerceState, readContentStore, writeContentStore } = require('../data/content')
const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const uploadsRoot = path.join(backendDir, 'public', 'uploads')
const port = Number(process.env.SMOKE_PORT || 3220)
const baseUrl = `http://127.0.0.1:${port}`
const tinyPngDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

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

const api = async (pathname, { method = 'GET', token = '', body, cookie = '' } = {}) => {
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

const loginAdmin = async () => {
  const response = await fetch(`${baseUrl}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin@123456' }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(`admin login failed: ${payload?.message || response.status}`)
  }
  return String(response.headers.get('set-cookie') || '').split(';')[0]
}

const expectApiError = async (pathname, options, expectedStatus, message) => {
  try {
    await api(pathname, options)
  } catch (error) {
    assert(error.statusCode === expectedStatus, `${message}: expected ${expectedStatus}, got ${error.statusCode || error.message}`)
    return
  }
  throw new Error(message)
}

const createMiniSession = ({ openId, name }) =>
  bindWechatUser({
    wechatOpenId: openId,
    profile: {
      name,
      avatarUrl: '/static/avatar-qa.png',
      signature: 'moments http smoke account',
      identityTag: 'QA',
    },
  })

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

const cleanupSmokeData = ({ profileIds = [], sessionId = '', uploadedUrls = [], targetIds = [] } = {}) => {
  const profileIdSet = new Set(profileIds.map((item) => String(item)))
  const targetIdSet = new Set(targetIds.map((item) => String(item)))

  if (profileIdSet.size) {
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

    const contentStore = readContentStore()
    if (contentStore.userCommerce && typeof contentStore.userCommerce === 'object') {
      profileIds.forEach((profileId) => {
        delete contentStore.userCommerce[profileId]
      })
      writeContentStore(contentStore)
    }
  }

  if (sessionId || profileIdSet.size) {
    const adminStore = getAdminStore()
    Object.keys(adminStore).forEach((key) => {
      if (!Array.isArray(adminStore[key])) {
        return
      }
      adminStore[key] = adminStore[key].filter(
        (item) =>
          String(item?.id || '') !== String(sessionId) &&
          String(item?.sessionId || '') !== String(sessionId) &&
          String(item?.meta?.sessionId || '') !== String(sessionId) &&
          !targetIdSet.has(String(item?.targetId || '')) &&
          !profileIdSet.has(String(item?.profileId || '')) &&
          !profileIdSet.has(String(item?.hostProfileId || '')),
      )
    })
    writeAdminStore(adminStore)

    const momentsStore = readMomentsStore()
    Object.keys(momentsStore).forEach((key) => {
      if (Array.isArray(momentsStore[key])) {
        momentsStore[key] = momentsStore[key].filter((item) => String(item?.sessionId || '') !== String(sessionId))
      }
    })
    writeMomentsStore(momentsStore)
  }

  removeUploadedFiles(uploadedUrls)
}

const main = async () => {
  const stamp = Date.now()
  const createdProfileIds = []
  const uploadedUrls = []
  const targetIds = []
  let createdSessionId = ''
  let child = null

  const hostSession = createMiniSession({ openId: `moments-http-host-${stamp}`, name: `Moments Host ${stamp}` })
  const memberASession = createMiniSession({ openId: `moments-http-member-a-${stamp}`, name: `Moments Member A ${stamp}` })
  const memberBSession = createMiniSession({ openId: `moments-http-member-b-${stamp}`, name: `Moments Member B ${stamp}` })
  const outsiderSession = createMiniSession({ openId: `moments-http-outsider-${stamp}`, name: `Moments Outsider ${stamp}` })
  createdProfileIds.push(hostSession.profile.id, memberASession.profile.id, memberBSession.profile.id, outsiderSession.profile.id)
  const initialContentStore = readContentStore()
  initialContentStore.userCommerce = initialContentStore.userCommerce || {}
  initialContentStore.userCommerce[memberBSession.profile.id] = {
    ...createDefaultUserCommerceState(),
    points: 50,
  }
  writeContentStore(initialContentStore)

  try {
    child = await startServer()

    const created = await api('/api/v1/sessions', {
      method: 'POST',
      token: hostSession.token,
      body: {
        sessionName: `QA-Moments-HTTP-${stamp}`,
        playerCount: 3,
        templateName: 'Moments HTTP Smoke',
        selectedPlayers: [
          {
            profileId: memberASession.profile.id,
            name: memberASession.profile.name,
            avatarUrl: memberASession.profile.avatarUrl,
          },
          {
            profileId: memberBSession.profile.id,
            name: memberBSession.profile.name,
            avatarUrl: memberBSession.profile.avatarUrl,
          },
        ],
      },
    })
    assert(created.id, 'create session did not return session id')
    createdSessionId = created.id

    const joinedA = await api('/api/v1/sessions/join', {
      method: 'POST',
      token: memberASession.token,
      body: { inviteCode: created.inviteCode },
    })
    const joinedB = await api('/api/v1/sessions/join', {
      method: 'POST',
      token: memberBSession.token,
      body: { inviteCode: created.inviteCode },
    })
    assert(joinedA.joinedCount >= 2, 'member A did not join session')
    assert(joinedB.joinedCount === 3, `joinedCount expected 3, got ${joinedB.joinedCount}`)

    await api(`/api/v1/sessions/${encodeURIComponent(created.id)}`, {
      method: 'PUT',
      token: hostSession.token,
      body: {
        state: '进行中',
        status: '正常',
      },
    })

    const openingAsset = await api('/api/v1/moments/uploads/image', {
      method: 'POST',
      token: hostSession.token,
      body: {
        sessionId: created.id,
        fileName: `opening-${stamp}.png`,
        dataUrl: tinyPngDataUrl,
      },
    })
    uploadedUrls.push(openingAsset.url)

    const opening = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/moments`, {
      method: 'POST',
      token: hostSession.token,
      body: {
        clientDraftId: `opening-${stamp}`,
        nodeType: 'opening',
        caption: 'opening via http',
        imageUrl: openingAsset.url,
        tags: ['opening'],
      },
    })

    const highlight = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/moments`, {
      method: 'POST',
      token: memberASession.token,
      body: {
        clientDraftId: `highlight-${stamp}`,
        nodeType: 'highlight',
        caption: 'highlight via http',
        imageUrl: openingAsset.url,
        tags: ['highlight'],
      },
    })

    const privateMoment = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/moments`, {
      method: 'POST',
      token: memberASession.token,
      body: {
        clientDraftId: `private-${stamp}`,
        nodeType: 'private',
        visibility: 'selected',
        visibleProfileIds: [memberBSession.profile.id],
        caption: 'private via http',
        imageUrl: openingAsset.url,
        tags: ['private'],
      },
    })

    await expectApiError(
      `/api/v1/sessions/${encodeURIComponent(created.id)}/moments`,
      {
        method: 'POST',
        token: memberASession.token,
        body: {
          clientDraftId: `invalid-private-${stamp}`,
          nodeType: 'private',
          visibility: 'selected',
          visibleProfileIds: [outsiderSession.profile.id],
          imageUrl: openingAsset.url,
        },
      },
      400,
      'private moment accepted outsider visibleProfileIds',
    )

    const event = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/events`, {
      method: 'POST',
      token: hostSession.token,
      body: {
        clientEventId: `event-${stamp}`,
        eventType: 'drink_debt',
        targetProfileId: memberASession.profile.id,
        scoreDelta: 1,
        caption: 'debt via http',
      },
    })

    await expectApiError(
      `/api/v1/sessions/${encodeURIComponent(created.id)}/events`,
      {
        method: 'POST',
        token: hostSession.token,
        body: {
          clientEventId: `invalid-event-${stamp}`,
          eventType: 'drink_debt',
          targetProfileId: outsiderSession.profile.id,
        },
      },
      400,
      'session event accepted outsider targetProfileId',
    )

    const hostTimeline = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/timeline`, {
      token: hostSession.token,
    })
    const memberBTimeline = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/timeline`, {
      token: memberBSession.token,
    })
    const hostPrivateNode = hostTimeline.nodes.find((item) => item.id === privateMoment.id)
    const memberBPrivateNode = memberBTimeline.nodes.find((item) => item.id === privateMoment.id)
    assert(hostPrivateNode?.isTimelinePlaceholder === true, 'non receiver host should see private placeholder')
    assert(!hostPrivateNode.caption, 'private placeholder leaked caption to non receiver')
    assert(memberBPrivateNode?.caption === 'private via http', 'private receiver cannot read private caption')

    const brief = await api(`/api/v1/sessions/${encodeURIComponent(created.id)}/brief`, {
      method: 'POST',
      token: hostSession.token,
      body: {},
    })
    await expectApiError(
      `/api/v1/session-briefs/${encodeURIComponent(brief.id)}/share-image-tasks`,
      {
        method: 'POST',
        token: hostSession.token,
        body: {
          layoutMode: 'timeline',
          selectedNodeIds: [`outside-node-${stamp}`],
        },
      },
      400,
      'share task accepted selectedNodeIds outside visible timeline',
    )
    const task = await api(`/api/v1/session-briefs/${encodeURIComponent(brief.id)}/share-image-tasks`, {
      method: 'POST',
      token: hostSession.token,
      body: { layoutMode: 'timeline' },
    })
    await expectApiError(
      `/api/v1/share-image-tasks/${encodeURIComponent(task.id)}/retry`,
      {
        method: 'POST',
        token: hostSession.token,
      },
      409,
      'share task retry accepted non failed task',
    )
    const readyTask = await api(`/api/v1/share-image-tasks/${encodeURIComponent(task.id)}/process`, {
      method: 'POST',
      token: hostSession.token,
    })
    assert(readyTask.status === 'ready', 'share task process did not return ready')
    assert(readyTask.imageUrl?.endsWith('.png'), 'ready share task did not return png imageUrl')
    uploadedUrls.push(readyTask.imageUrl)

    const adminCookie = await loginAdmin()
    await api(`/api/v1/admin/moments/${encodeURIComponent(highlight.id)}/review`, {
      method: 'POST',
      cookie: adminCookie,
      body: {
        action: 'approve',
        reason: 'http smoke approve before failed share task',
      },
    })
    const failCandidateTask = await api(`/api/v1/session-briefs/${encodeURIComponent(brief.id)}/share-image-tasks`, {
      method: 'POST',
      token: hostSession.token,
      body: {
        layoutMode: 'http-failed-smoke',
        selectedNodeIds: [highlight.id],
      },
    })
    await api(`/api/v1/admin/moments/${encodeURIComponent(highlight.id)}/review`, {
      method: 'POST',
      cookie: adminCookie,
      body: {
        action: 'hide',
        reason: 'http smoke hide before failed share task process',
      },
    })
    const failedTask = await api(`/api/v1/share-image-tasks/${encodeURIComponent(failCandidateTask.id)}/process`, {
      method: 'POST',
      token: hostSession.token,
    })
    assert(failedTask.status === 'failed', 'invalid share task process did not return failed')
    const retriedTask = await api(`/api/v1/share-image-tasks/${encodeURIComponent(failCandidateTask.id)}/retry`, {
      method: 'POST',
      token: hostSession.token,
    })
    assert(retriedTask.status === 'pending', 'failed share task retry did not return pending')

    await api(`/api/v1/admin/moments/${encodeURIComponent(opening.id)}/review`, {
      method: 'POST',
      cookie: adminCookie,
      body: {
        action: 'approve',
        reason: 'http smoke approve for nomination',
      },
    })
    targetIds.push(opening.id)
    const nomination = await api(`/api/v1/moments/${encodeURIComponent(opening.id)}/nominations`, {
      method: 'POST',
      token: memberBSession.token,
      body: {
        category: 'best_opening',
        clientNominationId: `nomination-http-${stamp}`,
      },
    })
    assert(nomination.pointsSpent === 10, 'nomination points cost mismatch')
    await expectApiError(
      `/api/v1/moments/${encodeURIComponent(opening.id)}/nominations`,
      {
        method: 'POST',
        token: memberBSession.token,
        body: {
          category: 'best_opening',
          clientNominationId: `nomination-http-duplicate-${stamp}`,
        },
      },
      409,
      'duplicate daily nomination was accepted',
    )
    const rankings = await api('/api/v1/rankings/today?category=best_opening', {
      token: memberBSession.token,
    })
    assert(rankings.items?.some((item) => item.moment?.id === opening.id), 'rankings missing nominated opening')
    const rewardGrant = await api('/api/v1/admin/ranking-rewards/grant', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        category: 'best_opening',
      },
    })
    assert(rewardGrant.grantedCount === 1, 'ranking reward grant count mismatch')
    assert(rewardGrant.totalPoints > 0, 'ranking reward did not grant points')
    const refundReview = await api(`/api/v1/admin/moments/${encodeURIComponent(opening.id)}/review`, {
      method: 'POST',
      cookie: adminCookie,
      body: {
        action: 'remove_ranking',
        reason: 'http smoke remove ranking refund',
      },
    })
    assert(refundReview.refund?.refundedCount === 1, 'remove ranking did not refund nomination')
    assert(refundReview.refund?.refundedPoints === 10, 'nomination refund points mismatch')
    const memberBAfterRefund = await api('/api/v1/user/commerce', {
      token: memberBSession.token,
    })
    assert(Number(memberBAfterRefund.points || 0) === 50, 'nomination refund did not restore member points')
    const rankingsAfterRefund = await api('/api/v1/rankings/today?category=best_opening', {
      token: memberBSession.token,
    })
    assert(!rankingsAfterRefund.items?.some((item) => item.moment?.id === opening.id), 'removed ranking moment still listed')
    await api('/api/v1/admin/auth/logout', {
      method: 'POST',
      cookie: adminCookie,
    })

    const summaries = await api('/api/v1/user/session-moment-summaries', {
      token: hostSession.token,
    })
    assert(Array.isArray(summaries), 'session moment summaries should be an array')
    assert(summaries.some((item) => item.sessionId === created.id), 'session moment summaries missing created session')

    console.log(
      JSON.stringify(
        {
          ok: true,
          sessionId: created.id,
          openingId: opening.id,
          highlightId: highlight.id,
          privateMomentId: privateMoment.id,
          eventId: event.id,
          hostPrivatePlaceholder: hostPrivateNode.isTimelinePlaceholder,
          memberBPrivateCaption: memberBPrivateNode.caption,
          briefId: brief.id,
          shareTaskId: task.id,
          shareTaskStatus: readyTask.status,
          shareImageUrl: readyTask.imageUrl,
          failedTaskStatus: failedTask.status,
          retriedTaskStatus: retriedTask.status,
          nominationId: nomination.id,
          rankingItems: rankings.items.length,
          rankingRewardGranted: rewardGrant.grantedCount,
          refundedPoints: refundReview.refund.refundedPoints,
        },
        null,
        2,
      ),
    )
  } finally {
    await stopServer(child)
    cleanupSmokeData({
      profileIds: createdProfileIds,
      sessionId: createdSessionId,
      uploadedUrls,
      targetIds,
    })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
