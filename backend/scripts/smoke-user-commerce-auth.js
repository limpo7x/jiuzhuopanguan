const fs = require('fs')
const net = require('net')
const path = require('path')
const { fork } = require('child_process')

const { bindWechatUser } = require('../data/social')

const backendDir = path.resolve(__dirname, '..')
const serverEntry = path.join(backendDir, 'server.js')
const contentStorePath = path.join(backendDir, 'data', 'content-store.json')
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
  port = Number(process.env.SMOKE_USER_COMMERCE_PORT || 0) || await getAvailablePort()
  const child = fork(serverEntry, {
    cwd: backendDir,
    env: {
      ...process.env,
      MYSQL_DATABASE: '',
      MYSQL_HOST: '',
      MYSQL_USER: '',
      NORMALIZED_DB_READ: '',
      NORMALIZED_DB_WRITE: '',
      STORE_FILE_MIRROR: '1',
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

const request = async (pathname, token = '') => {
  const response = await fetch(`${getBaseUrl()}${pathname}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-JZP-User-Token': token } : {}),
    },
  })
  return {
    payload: await response.json().catch(() => null),
    status: response.status,
  }
}

const main = async () => {
  const contentBackup = readIfExists(contentStorePath)
  const socialBackup = readIfExists(socialStorePath)
  let child = null

  try {
    const stamp = Date.now()
    const user = bindWechatUser({
      wechatOpenId: `user-commerce-auth-${stamp}`,
      profile: {
        avatarUrl: '/static/avatar-qa.png',
        identityTag: 'user-commerce-auth-smoke',
        name: `Commerce Auth ${stamp}`,
        signature: 'user commerce auth smoke',
      },
    })

    child = await startServer()

    const guestResponse = await request('/api/v1/user/commerce')
    assert(guestResponse.status === 401, `guest commerce expected 401, got ${guestResponse.status}`)
    assert(guestResponse.payload?.message === 'unauthorized', 'guest commerce message mismatch')

    const authedResponse = await request('/api/v1/user/commerce', user.token)
    assert(authedResponse.status === 200, `authed commerce expected 200, got ${authedResponse.status}`)
    assert(authedResponse.payload?.code === 0, 'authed commerce response code mismatch')
    assert(typeof authedResponse.payload?.data?.points === 'number', 'authed commerce points missing')
    assert(Array.isArray(authedResponse.payload?.data?.claimedTaskIds), 'authed commerce claimedTaskIds missing')

    console.log(
      JSON.stringify(
        {
          ok: true,
          guestStatus: guestResponse.status,
          authedStatus: authedResponse.status,
          profileId: user.profile.id,
        },
        null,
        2,
      ),
    )
  } finally {
    await stopServer(child).catch((error) => console.error(error))
    writeBackup(contentStorePath, contentBackup)
    writeBackup(socialStorePath, socialBackup)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
