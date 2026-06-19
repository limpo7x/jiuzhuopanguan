const { fork } = require('child_process')
const http = require('http')
const path = require('path')

const {
  getAdminStore,
  writeAdminStore,
} = require('../data/admin')
const {
  readMomentsStore,
  writeMomentsStore,
} = require('../data/moments')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const adminStorePath = path.join(backendDir, 'data', 'admin-store.json')
const momentsStorePath = path.join(backendDir, 'data', 'moments-store.json')
const port = Number(process.env.SMOKE_ADMIN_PORT || 3230)
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

const api = async (pathname, { method = 'GET', cookie = '', body } = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
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
  return {
    data: payload.data,
    headers: response.headers,
  }
}

const loginAdmin = async () => {
  const body = JSON.stringify({
    username: process.env.SMOKE_ADMIN_USERNAME || 'admin',
    password: process.env.SMOKE_ADMIN_PASSWORD || 'Admin@123456',
  })
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/v1/admin/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let text = ''
        response.on('data', (chunk) => {
          text += String(chunk)
        })
        response.on('end', () => {
          const payload = JSON.parse(text || '{}')
          if (response.statusCode < 200 || response.statusCode >= 300 || payload.code !== 0) {
            reject(new Error(`admin login failed: ${payload.message || response.statusCode}`))
            return
          }
          const setCookie = Array.isArray(response.headers['set-cookie']) ? response.headers['set-cookie'][0] : ''
          let cookie = String(setCookie || '').split(';')[0]
          if (!cookie) {
            const latestSession = (getAdminStore().sessions || [])[0]
            cookie = latestSession?.token ? `jiuzhuopanguan_admin_session=${encodeURIComponent(latestSession.token)}` : ''
          }
          if (!cookie.includes('jiuzhuopanguan_admin_session=')) {
            reject(new Error('admin login did not return session cookie'))
            return
          }
          resolve(cookie)
        })
      },
    )
    request.on('error', reject)
    request.end(body)
  })
}

const readJsonFile = (filePath) => JSON.parse(require('fs').readFileSync(filePath, 'utf8'))
const cloneJson = (value) => JSON.parse(JSON.stringify(value))
const isAdminSmokeResidue = (item) => {
  if (!item || typeof item !== 'object') {
    return false
  }
  const text = JSON.stringify(item)
  return text.includes('admin-smoke') || text.includes('admin smoke') || text.includes('ui-smoke') || item.source === 'smoke'
}

const removeAdminSmokeResidue = (store) => {
  const cleanStore = cloneJson(store)
  Object.keys(cleanStore).forEach((key) => {
    if (Array.isArray(cleanStore[key])) {
      cleanStore[key] = cleanStore[key].filter((item) => !isAdminSmokeResidue(item))
    }
  })
  return cleanStore
}

const visibilityRules = (action = {}) => {
  const rule = action.visibleWhen || {}
  return Array.isArray(rule.all) ? rule.all : [rule]
}

const hasVisibilityField = (action = {}, field = '') =>
  visibilityRules(action).some((rule) => rule?.field === field)

const main = async () => {
  const stamp = Date.now()
  const sessionId = `admin-smoke-session-${stamp}`
  const reviewMomentId = `admin-smoke-review-${stamp}`
  const reportMomentId = `admin-smoke-report-moment-${stamp}`
  const reportId = `admin-smoke-report-${stamp}`
  const taskId = `admin-smoke-task-${stamp}`
  const originalAdminStore = removeAdminSmokeResidue(getAdminStore())
  const originalMomentsStore = removeAdminSmokeResidue(readMomentsStore())
  let child = null

  try {
    writeAdminStore({
      ...originalAdminStore,
      liveSessions: [
        {
          id: sessionId,
          name: `Admin Smoke Session ${stamp}`,
          players: 2,
          template: 'Admin Smoke',
          hostName: 'Admin Smoke Host',
          hostProfileId: `admin-smoke-host-${stamp}`,
          inviteCode: `AS${String(stamp).slice(-5)}`,
          state: '进行中',
          source: 'smoke',
          status: '正常',
          members: [
            {
              profileId: `admin-smoke-host-${stamp}`,
              name: 'Admin Smoke Host',
              isHost: true,
              status: '已加入',
            },
            {
              profileId: `admin-smoke-member-${stamp}`,
              name: 'Admin Smoke Member',
              isHost: false,
              status: '已加入',
            },
          ],
        },
        ...(originalAdminStore.liveSessions || []),
      ],
    })
    writeMomentsStore({
      ...originalMomentsStore,
      momentRecords: [
        {
          id: reviewMomentId,
          sessionId,
          uploaderProfileId: `admin-smoke-member-${stamp}`,
          uploaderName: 'Admin Smoke Member',
          nodeType: 'highlight',
          mediaType: 'image',
          imageUrl: '/uploads/moments/admin-smoke.webp',
          caption: 'admin review smoke',
          tags: ['smoke'],
          visibility: 'session',
          usageConsent: { session: true, brief: true, share: true, ranking: true },
          completionStatus: 'complete',
          reviewStatus: 'pending',
          secondaryReviewStatus: 'pending',
          rankingEligible: false,
          rewardEligible: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: reportMomentId,
          sessionId,
          uploaderProfileId: `admin-smoke-member-${stamp}`,
          uploaderName: 'Admin Smoke Member',
          nodeType: 'highlight',
          mediaType: 'image',
          imageUrl: '/uploads/moments/admin-smoke-report.webp',
          caption: 'admin report smoke',
          tags: ['report'],
          visibility: 'session',
          usageConsent: { session: true, brief: true, share: true, ranking: true },
          completionStatus: 'complete',
          reviewStatus: 'approved',
          secondaryReviewStatus: 'approved',
          rankingEligible: true,
          rewardEligible: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...(originalMomentsStore.momentRecords || []),
      ],
      momentReports: [
        {
          id: reportId,
          momentId: reportMomentId,
          sessionId,
          reporterProfileId: `admin-smoke-host-${stamp}`,
          reporterName: 'Admin Smoke Host',
          reason: 'smoke report',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        ...(originalMomentsStore.momentReports || []),
      ],
      shareImageTasks: [
        {
          id: taskId,
          sessionId,
          briefId: `admin-smoke-brief-${stamp}`,
          status: 'failed',
          layoutMode: 'timeline',
          selectedNodeIds: [reviewMomentId],
          imageUrl: '',
          failedReason: 'smoke failure',
          retryCount: 0,
          createdAt: new Date().toISOString(),
          startedAt: '',
          finishedAt: '',
          updatedAt: new Date().toISOString(),
        },
        ...(originalMomentsStore.shareImageTasks || []),
      ],
    })

    child = await startServer()
    const cookie = await loginAdmin()

    const reviewPage = await api('/api/v1/admin/pages/content-moments-review', { cookie })
    const reviewActions = reviewPage.data.page.tables[0].rowActions || []
    assert(
      reviewActions.some((action) => action.key === 'approve' && action.visibleWhen?.field === 'reviewStatus'),
      'admin review page did not expose approve visibility rule',
    )
    assert(
      reviewActions.some((action) => action.key === 'remove-ranking' && hasVisibilityField(action, 'rankingEligible')),
      'admin review page did not expose remove-ranking visibility rule',
    )
    assert(
      reviewPage.data.page.tables[0].rows.some((row) => row.id === reviewMomentId),
      'admin review page did not include smoke moment',
    )

    const reviewResult = await api(`/api/v1/admin/moments/${encodeURIComponent(reviewMomentId)}/review`, {
      method: 'POST',
      cookie,
      body: {
        action: 'approve',
        reason: 'admin smoke approve',
      },
    })
    const approvedMoment = reviewResult.data.moment
    assert(approvedMoment.reviewStatus === 'approved', 'admin review did not approve moment')
    assert(approvedMoment.secondaryReviewStatus === 'approved', 'admin review did not approve secondary status')

    const reportsPage = await api('/api/v1/admin/pages/content-moment-reports', { cookie })
    const reportActions = reportsPage.data.page.tables[0].rowActions || []
    assert(
      reportActions.every((action) => action.visibleWhen?.field === 'status'),
      'admin report page did not expose status visibility rules',
    )
    assert(
      reportsPage.data.page.tables[0].rows.some((row) => row.id === reportId),
      'admin report page did not include smoke report',
    )
    const reportResult = await api(`/api/v1/admin/moment-reports/${encodeURIComponent(reportId)}/handle`, {
      method: 'POST',
      cookie,
      body: {
        action: 'valid_hide',
        reason: 'admin smoke report hide',
      },
    })
    const handledReport = reportResult.data.report
    const hiddenMoment = reportResult.data.moment
    assert(handledReport.status === 'handled', 'admin report action did not mark report handled')
    assert(hiddenMoment.reviewStatus === 'hidden', 'admin report action did not hide moment')
    assert(hiddenMoment.rankingEligible === false, 'admin report action did not clear ranking eligibility')

    const taskPage = await api('/api/v1/admin/pages/growth-share-tasks', { cookie })
    const retryAction = (taskPage.data.page.tables[0].rowActions || []).find((action) => action.key === 'retry')
    assert(
      retryAction?.visibleWhen?.field === 'status' && retryAction.visibleWhen.values.includes('failed') && retryAction.visibleWhen.values.includes('expired'),
      'admin share task page did not restrict retry visibility to failed or expired',
    )
    assert(
      taskPage.data.page.tables[0].rows.some((row) => row.id === taskId),
      'admin share task page did not include smoke task',
    )
    const retryResult = await api(`/api/v1/admin/share-image-tasks/${encodeURIComponent(taskId)}/retry`, {
      method: 'POST',
      cookie,
      body: {
        reason: 'admin smoke retry',
      },
    })
    const retriedTask = retryResult.data.task
    assert(retriedTask.status === 'pending', 'admin retry did not reset task to pending')
    assert(retriedTask.retryCount === 1, 'admin retry did not increment retryCount')

    const rewardsPage = await api('/api/v1/admin/pages/commerce-ranking-rewards', { cookie })
    const rewardItems = rewardsPage.data.page.collection.items
    assert(Array.isArray(rewardItems) && rewardItems.length > 0, 'ranking rewards page returned no rules')
    assert(
      (rewardsPage.data.page.pageActions || []).some((item) => item.endpoint === '/api/v1/admin/ranking-rewards/grant'),
      'ranking rewards page did not expose grant action',
    )
    const rewardResult = await api('/api/v1/admin/pages/commerce-ranking-rewards', {
      method: 'PUT',
      cookie,
      body: {
        items: [
          {
            ...rewardItems[0],
            points: Number(rewardItems[0].points || 0) + 1,
            reason: 'admin smoke reward update',
          },
          ...rewardItems.slice(1),
        ],
      },
    })
    const momentsStore = readJsonFile(momentsStorePath)
    assert(
      (momentsStore.rankingRewardRules || []).some((item) => item.reason === 'admin smoke reward update'),
      'ranking reward save did not sync to moments store',
    )
    assert(
      rewardResult.data.page.collection.items.some((item) => item.reason === 'admin smoke reward update'),
      'ranking reward page did not return updated rule',
    )

    const adminStore = readJsonFile(adminStorePath)
    const smokeLogs = (adminStore.operationLogs || []).filter(
      (item) => String(item.detail || '').includes('admin smoke') || String(item.action || '').includes('保存榜单奖励配置'),
    )
    assert(smokeLogs.length >= 4, `expected at least 4 admin operation logs, got ${smokeLogs.length}`)

    const operationLogsPage = await api('/api/v1/admin/pages/system-operation-logs', { cookie })
    const operationRows = operationLogsPage.data.page.tables[0].rows || []
    assert(
      operationRows.some((row) => row.targetId === reviewMomentId && row.logType === '瞬间审核'),
      'operation logs page did not expose moment review log',
    )
    assert(
      operationRows.some((row) => row.targetId === reportId && row.logType === '瞬间举报'),
      'operation logs page did not expose moment report log',
    )
    assert(
      operationRows.some((row) => row.targetId === taskId && row.logType === '分享图任务'),
      'operation logs page did not expose share task retry log',
    )
    assert(
      operationRows.some((row) => row.targetId === 'commerce-ranking-rewards' && row.logType === '榜单奖励'),
      'operation logs page did not expose ranking reward log',
    )

    console.log(
      JSON.stringify(
        {
          ok: true,
          reviewMomentId,
          reportId,
          shareTaskId: taskId,
          retriedTaskStatus: retriedTask.status,
          operationLogCount: smokeLogs.length,
          operationLogPageRows: operationRows.length,
        },
        null,
        2,
      ),
    )
  } finally {
    await stopServer(child).catch((error) => {
      console.error(error)
    })
    writeMomentsStore(originalMomentsStore)
    writeAdminStore(originalAdminStore)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
