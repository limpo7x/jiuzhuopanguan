#!/usr/bin/env node

require('../load-env')

const crypto = require('crypto')
const http = require('http')
const { getAdminStore, initAdminStore, writeAdminStore } = require('../data/admin')

const baseUrl = process.env.ADMIN_SECURITY_BASE_URL || 'http://127.0.0.1:3010/api/v1'
const stamp = process.env.ADMIN_SECURITY_SMOKE_STAMP || String(Date.now())
const marker = `ops009-${stamp}`
const mode = process.argv.find((item) => item.startsWith('--mode='))?.split('=')[1] || process.env.ADMIN_SECURITY_SMOKE_MODE || 'all'

const users = {
  super: {
    id: `${marker}-super`,
    username: `${marker}.super`,
    name: 'OPS009 Super',
    roleId: 'role-super-admin',
    password: `Ops009Super!${stamp}`,
  },
  content: {
    id: `${marker}-content`,
    username: `${marker}.content`,
    name: 'OPS009 Content',
    roleId: 'role-content-ops',
    password: `Ops009Content!${stamp}`,
  },
  target: {
    id: `${marker}-target`,
    username: `${marker}.target`,
    name: 'OPS009 Target',
    roleId: 'role-content-ops',
    password: `Ops009Target!${stamp}`,
    nextPassword: `Ops009TargetNext!${stamp}`,
  },
}

const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex')

const waitForPersist = () => new Promise((resolve) => setTimeout(resolve, 1200))

const seedUsers = async () => {
  const store = getAdminStore()
  const seeded = Object.values(users).map((user) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    roleId: user.roleId,
    status: 'active',
    passwordHash: hashPassword(user.password),
    lastLoginAt: '',
    failedLoginCount: 0,
    lockedUntil: '',
    passwordUpdatedAt: '',
  }))
  const ids = new Set(seeded.map((user) => user.id))
  const names = new Set(seeded.map((user) => user.username))
  store.adminUsers = [
    ...store.adminUsers.filter((user) => !ids.has(user.id) && !names.has(user.username)),
    ...seeded,
  ]
  store.sessions = (store.sessions || []).filter((session) => !ids.has(session.userId))
  writeAdminStore(store)
  await waitForPersist()
  return {
    adminUsers: seeded.length,
    marker,
  }
}

const cleanupUsers = async () => {
  const store = getAdminStore()
  const ids = new Set(Object.values(users).map((user) => user.id))
  const names = new Set(Object.values(users).map((user) => user.username))
  store.adminUsers = (store.adminUsers || []).filter((user) => !ids.has(user.id) && !names.has(user.username))
  store.sessions = (store.sessions || []).filter((session) => !ids.has(session.userId))
  store.operationLogs = (store.operationLogs || []).filter((log) => {
    const text = [log.operator, log.targetId, log.targetName, log.detail].map((value) => String(value || '')).join(' ')
    return !text.includes(marker)
  })
  writeAdminStore(store)
  await waitForPersist()
  const after = getAdminStore()
  return {
    adminUsers: (after.adminUsers || []).filter((user) => ids.has(user.id) || names.has(user.username)).length,
    sessions: (after.sessions || []).filter((session) => ids.has(session.userId)).length,
    operationLogs: (after.operationLogs || []).filter((log) =>
      [log.operator, log.targetId, log.targetName, log.detail].map((value) => String(value || '')).join(' ').includes(marker),
    ).length,
  }
}

const requestJson = ({ method = 'GET', path, body, cookie = '' }) =>
  new Promise((resolve, reject) => {
    const target = new URL(path, `${baseUrl}/`)
    const payload = body ? JSON.stringify(body) : ''
    const request = http.request(
      target,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        timeout: 8000,
      },
      (response) => {
        let text = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          text += chunk
        })
        response.on('end', () => {
          let json = null
          try {
            json = text ? JSON.parse(text) : null
          } catch {
            json = { raw: text }
          }
          resolve({
            body: json,
            cookie: response.headers['set-cookie'] || [],
            status: response.statusCode || 0,
          })
        })
      },
    )
    request.on('error', reject)
    request.on('timeout', () => request.destroy(new Error(`request timeout: ${method} ${target.pathname}`)))
    if (payload) request.write(payload)
    request.end()
  })

const login = (username, password) =>
  requestJson({
    method: 'POST',
    path: 'admin/auth/login',
    body: { username, password },
  })

const getCookieHeader = (response) =>
  (response.cookie || [])
    .map((item) => String(item).split(';')[0])
    .filter(Boolean)
    .join('; ')

const main = async () => {
  await initAdminStore()
  if (mode === 'seed') {
    console.log(JSON.stringify({ ok: true, mode, seed: await seedUsers() }, null, 2))
    return
  }
  if (mode === 'cleanup') {
    console.log(JSON.stringify({ ok: true, mode, cleanup: await cleanupUsers() }, null, 2))
    return
  }
  if (mode === 'all') {
    await seedUsers()
  }
  const result = {
    baseUrl,
    marker,
    mode,
    statuses: {},
  }
  try {
    const contentLogin = await login(users.content.username, users.content.password)
    result.statuses.contentLogin = contentLogin.status
    const contentCookie = getCookieHeader(contentLogin)
    const contentReset = await requestJson({
      method: 'POST',
      path: `admin/users/${encodeURIComponent(users.target.id)}/reset-password`,
      cookie: contentCookie,
      body: { newPassword: users.target.nextPassword },
    })
    result.statuses.contentResetTarget = contentReset.status

    result.statuses.targetWrongLogins = []
    for (let index = 0; index < 5; index += 1) {
      const response = await login(users.target.username, `wrong-${index}`)
      result.statuses.targetWrongLogins.push(response.status)
    }
    const targetLockedLogin = await login(users.target.username, users.target.password)
    result.statuses.targetLockedLogin = targetLockedLogin.status

    const superLogin = await login(users.super.username, users.super.password)
    result.statuses.superLogin = superLogin.status
    const superCookie = getCookieHeader(superLogin)
    const superReset = await requestJson({
      method: 'POST',
      path: `admin/users/${encodeURIComponent(users.target.id)}/reset-password`,
      cookie: superCookie,
      body: { newPassword: users.target.nextPassword },
    })
    result.statuses.superResetTarget = superReset.status

    const targetOldLogin = await login(users.target.username, users.target.password)
    result.statuses.targetOldPasswordLogin = targetOldLogin.status
    const targetNewLogin = await login(users.target.username, users.target.nextPassword)
    result.statuses.targetNewPasswordLogin = targetNewLogin.status

    result.ok =
      result.statuses.contentLogin === 200 &&
      result.statuses.contentResetTarget === 403 &&
      result.statuses.targetWrongLogins.slice(0, 4).every((status) => status === 401) &&
      result.statuses.targetWrongLogins[4] === 423 &&
      result.statuses.targetLockedLogin === 423 &&
      result.statuses.superLogin === 200 &&
      result.statuses.superResetTarget === 200 &&
      result.statuses.targetOldPasswordLogin === 401 &&
      result.statuses.targetNewPasswordLogin === 200
  } finally {
    if (mode === 'all') {
      result.cleanup = await cleanupUsers()
    }
  }
  console.log(JSON.stringify(result, null, 2))
  if (!result.ok) {
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error && error.stack ? error.stack : error)
    process.exit(1)
  })
