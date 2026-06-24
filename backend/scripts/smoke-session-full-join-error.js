const fs = require('fs')
const net = require('net')
const path = require('path')
const { fork } = require('child_process')

const { bindWechatUser } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const adminStorePath = path.join(backendDir, 'data', 'admin-store.json')
const socialStorePath = path.join(backendDir, 'data', 'social-store.json')
let port = 0

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const getBaseUrl = () => `http://127.0.0.1:${port}`

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const readIfExists = (filePath) => (fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '')
const writeBackup = (filePath, content) => {
  if (content) {
    fs.writeFileSync(filePath, content, 'utf8')
    return
  }
  fs.rmSync(filePath, { force: true })
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
      identityTag: 'session-full-smoke',
      name,
      signature: 'session full join smoke',
    },
  })

const main = async () => {
  const adminBackup = readIfExists(adminStorePath)
  const socialBackup = readIfExists(socialStorePath)
  let child = null
  try {
    const stamp = Date.now()
    const host = createMiniSession({ openId: `session-full-host-${stamp}`, name: `Session Full Host ${stamp}` })
    const member = createMiniSession({ openId: `session-full-member-${stamp}`, name: `Session Full Member ${stamp}` })
    const outsider = createMiniSession({ openId: `session-full-outsider-${stamp}`, name: `Session Full Outsider ${stamp}` })

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
        sessionName: `Session Full Smoke ${stamp}`,
        templateName: 'Session Full Smoke',
      },
    })
    assert(createdResponse.status === 201, `create session expected 201, got ${createdResponse.status}`)
    const created = createdResponse.payload?.data || {}
    assert(created.id && created.inviteCode, 'created session identifiers missing')

    const joined = await request('/api/v1/sessions/join', member.token, {
      method: 'POST',
      body: { inviteCode: created.inviteCode },
    })
    assert(joined.status === 200, `member join expected 200, got ${joined.status}`)

    const fullSessionJoin = await request('/api/v1/sessions/join', outsider.token, {
      method: 'POST',
      body: { inviteCode: created.inviteCode },
    })
    assert(fullSessionJoin.status === 409, `full /sessions/join expected 409, got ${fullSessionJoin.status}`)
    assert(fullSessionJoin.payload?.message === 'session full', 'full /sessions/join message changed')

    const fullPartyJoin = await request('/api/v1/parties/join', outsider.token, {
      method: 'POST',
      body: { inviteCode: created.inviteCode },
    })
    assert(fullPartyJoin.status === 409, `full /parties/join expected 409, got ${fullPartyJoin.status}`)
    assert(fullPartyJoin.payload?.message === 'party full', 'full /parties/join message changed')

    console.log(JSON.stringify({
      ok: true,
      inviteCode: created.inviteCode,
      partyJoinMessage: fullPartyJoin.payload?.message,
      partyJoinStatus: fullPartyJoin.status,
      sessionJoinMessage: fullSessionJoin.payload?.message,
      sessionJoinStatus: fullSessionJoin.status,
    }, null, 2))
  } finally {
    await stopServer(child)
    writeBackup(adminStorePath, adminBackup)
    writeBackup(socialStorePath, socialBackup)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
