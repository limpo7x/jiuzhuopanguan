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
const port = Number(process.env.SMOKE_ADMIN_SESSION_REPAIR_PORT || 3231)
const baseUrl = `http://127.0.0.1:${port}`

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const cloneJson = (value) => JSON.parse(JSON.stringify(value))
const readJsonFile = (filePath) => JSON.parse(require('fs').readFileSync(filePath, 'utf8'))

const isSmokeResidue = (item) => {
  if (!item || typeof item !== 'object') {
    return false
  }
  const text = JSON.stringify(item)
  return text.includes('admin-session-repair-smoke') || item.source === 'session-repair-smoke'
}

const removeSmokeResidue = (store) => {
  const cleanStore = cloneJson(store)
  Object.keys(cleanStore).forEach((key) => {
    if (Array.isArray(cleanStore[key])) {
      cleanStore[key] = cleanStore[key].filter((item) => !isSmokeResidue(item))
    }
  })
  return cleanStore
}

const waitForServer = async (timeoutMs = 15000) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
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
      MYSQL_DATABASE: '',
      MYSQL_HOST: '',
      MYSQL_USER: '',
      NORMALIZED_DB_READ: '',
      NORMALIZED_DB_WRITE: '',
      PORT: String(port),
      STORE_FILE_MIRROR: '1',
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

const expectApiError = async (pathname, options, statusCode, message) => {
  try {
    await api(pathname, options)
  } catch (error) {
    assert(error.statusCode === statusCode, message)
    return error
  }
  throw new Error(message)
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

const main = async () => {
  const stamp = Date.now()
  const sessionId = `admin-session-repair-smoke-session-${stamp}`
  const reportId = `admin-session-repair-smoke-report-${stamp}`
  const briefId = `admin-session-repair-smoke-brief-${stamp}`
  const taskId = `admin-session-repair-smoke-task-${stamp}`
  const originalAdminStore = removeSmokeResidue(getAdminStore())
  const originalMomentsStore = removeSmokeResidue(readMomentsStore())
  let child = null

  try {
    writeAdminStore({
      ...originalAdminStore,
      liveSessions: [
        {
          id: sessionId,
          name: `Admin Session Repair Smoke ${stamp}`,
          players: 2,
          template: 'Admin Session Repair Smoke',
          hostName: 'Admin Session Repair Host',
          hostProfileId: `admin-session-repair-smoke-host-${stamp}`,
          inviteCode: `SR${String(stamp).slice(-5)}`,
          state: '进行中',
          source: 'session-repair-smoke',
          status: '正常',
          endedAt: '',
          members: [
            {
              profileId: `admin-session-repair-smoke-host-${stamp}`,
              name: 'Admin Session Repair Host',
              isHost: true,
              status: '已加入',
            },
          ],
          updatedAt: new Date().toISOString(),
        },
        ...(originalAdminStore.liveSessions || []),
      ],
      reports: [
        {
          id: reportId,
          sessionId,
          name: `Admin Session Repair Smoke ${stamp}`,
          status: '草稿',
          createdAt: new Date().toISOString(),
        },
        ...(originalAdminStore.reports || []),
      ],
    })
    writeMomentsStore({
      ...originalMomentsStore,
      sessionBriefs: [
        {
          id: briefId,
          sessionId,
          title: 'Admin Session Repair Brief',
          coverMode: 'opening_collage',
          timelineNodeIds: [],
          shareImageTaskId: '',
          shareImageStatus: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...(originalMomentsStore.sessionBriefs || []),
      ],
      shareImageTasks: [
        {
          id: taskId,
          sessionId,
          briefId,
          status: 'failed',
          layoutMode: 'timeline',
          selectedNodeIds: [],
          imageUrl: '',
          failedReason: 'session repair smoke',
          retryCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...(originalMomentsStore.shareImageTasks || []),
      ],
    })

    child = await startServer()
    const cookie = await loginAdmin()

    const sessionsPage = await api('/api/v1/admin/pages/sessions', { cookie })
    const sessionsTable = sessionsPage.data.page.tables[0]
    assert(sessionsPage.data.page.view === 'readonly', 'sessions page is not readonly')
    assert(!sessionsPage.data.page.collection, 'sessions page still exposes collection editing')
    assert(
      (sessionsTable.rowActions || []).some((action) => action.key === 'repair-end'),
      'sessions page did not expose repair-end action',
    )
    assert(
      (sessionsTable.rows || []).some((row) => row.id === sessionId),
      'sessions page did not include smoke session',
    )

    await expectApiError(
      '/api/v1/admin/pages/sessions',
      {
        method: 'PUT',
        cookie,
        body: {
          items: [],
        },
      },
      409,
      'sessions direct collection save was not blocked',
    )

    const repairResult = await api(`/api/v1/admin/sessions/${encodeURIComponent(sessionId)}/repair-state`, {
      method: 'POST',
      cookie,
      body: {
        action: 'end',
        reason: 'admin session repair smoke end',
      },
    })
    assert(repairResult.data.session.state === '已结束', 'repair end did not mark session ended')
    assert(repairResult.data.session.endedAt, 'repair end did not set endedAt')
    assert(repairResult.data.synced.reportCount === 1, 'repair end did not sync report count')
    assert(repairResult.data.synced.briefCount === 1, 'repair end did not sync brief count')
    assert(repairResult.data.synced.shareTaskCount === 1, 'repair end did not sync share task count')

    const repairedAdminStore = readJsonFile(adminStorePath)
    const repairedReport = repairedAdminStore.reports.find((item) => item.id === reportId)
    const repairedMomentsStore = readJsonFile(momentsStorePath)
    const repairedBrief = repairedMomentsStore.sessionBriefs.find((item) => item.id === briefId)
    assert(repairedReport?.status === '已结束', 'repair end did not update report status')
    assert(repairedBrief?.shareImageTaskId === taskId, 'repair end did not connect latest share task to brief')
    assert(repairedBrief?.shareImageStatus === 'failed', 'repair end did not sync brief share status')
    assert(
      (repairedAdminStore.operationLogs || []).some((item) => item.targetId === sessionId && item.action === '修复聚会状态'),
      'repair end operation log missing',
    )

    const resumeResult = await api(`/api/v1/admin/sessions/${encodeURIComponent(sessionId)}/repair-state`, {
      method: 'POST',
      cookie,
      body: {
        action: 'resume',
        reason: 'admin session repair smoke resume',
      },
    })
    assert(resumeResult.data.session.state === '进行中', 'repair resume did not mark session live')
    assert(!resumeResult.data.session.endedAt, 'repair resume did not clear endedAt')

    console.log(
      JSON.stringify(
        {
          ok: true,
          sessionId,
          repairEndState: repairResult.data.session.state,
          repairResumeState: resumeResult.data.session.state,
          synced: repairResult.data.synced,
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
