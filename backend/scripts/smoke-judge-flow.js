const path = require('path')
const { fork } = require('child_process')

const { getAdminStore, writeAdminStore } = require('../data/admin')
const { bindWechatUser, readSocialStore, writeSocialStore } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const port = Number(process.env.SMOKE_PORT || 3210)
const baseUrl = `http://127.0.0.1:${port}`

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

  child.stdout?.on('data', (chunk) => {
    process.stdout.write(String(chunk))
  })
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(String(chunk))
  })

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
    throw new Error(`${method} ${pathname} failed: ${payload?.message || response.status}`)
  }
  return payload.data
}

const createMiniSession = ({ openId, name, avatarUrl, city = '上海' }) =>
  bindWechatUser({
    wechatOpenId: openId,
    profile: {
      name,
      avatarUrl,
      city,
      signature: '验收链路账号',
      identityTag: '验收账号',
    },
  })

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const cleanupSmokeData = ({ profileIds = [], reportId = '', sessionId = '' } = {}) => {
  if (profileIds.length) {
    const socialStore = readSocialStore()
    const profileIdSet = new Set(profileIds.map((item) => String(item)))
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
  }

  if (reportId || sessionId || profileIds.length) {
    const adminStore = getAdminStore()
    const profileIdSet = new Set(profileIds.map((item) => String(item)))
    adminStore.liveSessions = (adminStore.liveSessions || []).filter((item) => String(item.id) !== String(sessionId))
    adminStore.reports = (adminStore.reports || []).filter((item) => String(item.id) !== String(reportId) && String(item.sessionId) !== String(sessionId))
    adminStore.analyticsEvents = (adminStore.analyticsEvents || []).filter((item) => {
      const eventProfileId = String(item.profileId || '')
      const eventSessionId = String(item.meta?.sessionId || '')
      const eventReportId = String(item.reportId || item.meta?.reportId || '')
      return !profileIdSet.has(eventProfileId) && eventSessionId !== String(sessionId) && eventReportId !== String(reportId)
    })
    writeAdminStore(adminStore)
  }
}

const main = async () => {
  const stamp = Date.now()
  const createdProfileIds = []
  let createdSessionId = ''
  let createdReportId = ''
  const hostSession = createMiniSession({
    openId: `smoke-host-${stamp}`,
    name: `验收主理人${String(stamp).slice(-4)}`,
    avatarUrl: '/static/avatar-1.png',
  })
  const playerSession = createMiniSession({
    openId: `smoke-player-${stamp}`,
    name: `验收成员${String(stamp).slice(-4)}`,
    avatarUrl: '/static/avatar-2.png',
  })
  createdProfileIds.push(hostSession.profile.id, playerSession.profile.id)

  let child = null
  try {
    child = await startServer()

    const created = await api('/api/v1/sessions', {
      method: 'POST',
      token: hostSession.token,
      body: {
        city: '上海',
        district: '浦东新区',
        sessionName: `验收局-${stamp}`,
        playerCount: 2,
        templateName: '经典喝酒版',
        selectedPlayers: [
          {
            profileId: playerSession.profile.id,
            name: playerSession.profile.name,
            avatarUrl: playerSession.profile.avatarUrl,
          },
        ],
      },
    })

    assert(created.id, 'create session did not return session id')
    assert(created.inviteCode, 'create session did not return invite code')
    assert(created.joinedCount >= 1, 'host should be joined after session creation')
    createdSessionId = created.id

    const joined = await api('/api/v1/sessions/join', {
      method: 'POST',
      token: playerSession.token,
      body: {
        inviteCode: created.inviteCode,
      },
    })

    assert(joined.joinedCount === 2, `joinedCount expected 2, got ${joined.joinedCount}`)

    await api(`/api/v1/sessions/${encodeURIComponent(created.id)}`, {
      method: 'PUT',
      token: hostSession.token,
      body: {
        state: '进行中',
        status: '正常',
      },
    })

    const live = await api(`/api/v1/sessions/live?sessionId=${encodeURIComponent(created.id)}`, {
      token: hostSession.token,
    })
    assert(live.joinedCount === 2, 'live session should reflect joined player count')
    assert(String(live.stateText || '').includes('进行中'), 'live session state should be 进行中')

    const report = await api('/api/v1/reports', {
      method: 'POST',
      token: hostSession.token,
      body: {
        sessionId: created.id,
        sessionName: created.sessionName || `验收局-${stamp}`,
        templateName: '经典喝酒版',
        playerCount: 2,
        sessionState: '已结束',
        sessionStatus: '正常',
        status: '正常',
        ranks: [
          { title: '欠酒大王', name: hostSession.profile.name, avatarUrl: hostSession.profile.avatarUrl, value: '欠了 1 杯' },
          { title: '干杯王', name: playerSession.profile.name, avatarUrl: playerSession.profile.avatarUrl, value: '已喝 1 杯' },
        ],
        events: [
          { text: '验收局完成创建并成功加入。' },
          { text: '验收局已生成真实后端战报。' },
        ],
      },
    })

    assert(report.id, 'report id missing')
    createdReportId = report.id

    const detail = await api(`/api/v1/reports/${encodeURIComponent(report.id)}`, {
      token: hostSession.token,
    })
    assert(detail.id === report.id, 'report detail should match created report')

    const history = await api('/api/v1/reports/history', {
      token: hostSession.token,
    })
    assert(history.some((item) => item.id === report.id || item.reportId === report.id), 'history should contain created report')

    await api('/api/v1/analytics/events', {
      method: 'POST',
      token: hostSession.token,
      body: {
        type: 'report_share',
        reportId: report.id,
        assetId: 'share-1',
        meta: {
          channel: 'smoke-test',
          sessionId: created.id,
        },
      },
    })

    const statsAfterShare = await api('/api/v1/user/judge-stats', {
      token: hostSession.token,
    })
    assert(statsAfterShare.hostedCount >= 1, 'judge stats hostedCount should be updated')
    assert(statsAfterShare.reportShareCount >= 1, 'judge stats reportShareCount should be updated')

    await stopServer(child)
    child = await startServer()

    const persistedReport = await api(`/api/v1/reports/${encodeURIComponent(report.id)}`, {
      token: hostSession.token,
    })
    const persistedHistory = await api('/api/v1/reports/history', {
      token: hostSession.token,
    })
    assert(persistedReport.id === report.id, 'report should still exist after restart')
    assert(persistedHistory.some((item) => item.id === report.id || item.reportId === report.id), 'history should persist after restart')

    cleanupSmokeData({
      profileIds: createdProfileIds,
      reportId: createdReportId,
      sessionId: createdSessionId,
    })

    console.log(
      JSON.stringify(
        {
          ok: true,
          sessionId: created.id,
          reportId: report.id,
          joinedCount: joined.joinedCount,
          hostedCount: statsAfterShare.hostedCount,
          reportShareCount: statsAfterShare.reportShareCount,
        },
        null,
        2,
      ),
    )
  } finally {
    await stopServer(child)
    cleanupSmokeData({
      profileIds: createdProfileIds,
      reportId: createdReportId,
      sessionId: createdSessionId,
    })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
