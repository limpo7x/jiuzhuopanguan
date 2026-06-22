#!/usr/bin/env node

require('../load-env')

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const OSS = require('ali-oss')
const { createManagedSession, flushAdminStore, getAdminStore, initAdminStore, writeAdminStore } = require('../data/admin')
const { bindWechatUser, flushSocialStore, initSocialStore, readSocialStore, writeSocialStore } = require('../data/social')
const { flushMomentsStore, initMomentsStore, readMomentsStore, writeMomentsStore } = require('../data/moments')

const stamp = process.env.OPS009_STAMP || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
const outDir =
  process.env.OPS009_OUT_DIR || path.join('/www/backup/jiuzhuopanguan', `ops-009-oss-upload-${stamp}`)

const makeOssClient = () =>
  new OSS({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || process.env.UPLOAD_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || process.env.UPLOAD_SECRET_ACCESS_KEY,
    bucket: process.env.OSS_BUCKET || process.env.UPLOAD_BUCKET || 'pomer-party-recorder-prod',
    endpoint: process.env.OSS_ENDPOINT || process.env.UPLOAD_ENDPOINT || undefined,
    region: process.env.OSS_REGION || process.env.UPLOAD_REGION || 'oss-cn-beijing',
    secure: true,
    timeout: Number(process.env.OSS_TIMEOUT_MS || process.env.UPLOAD_TIMEOUT_MS || 60000),
    authorizationV4: process.env.OSS_AUTHORIZATION_V4 !== '0',
  })

const run = (command, args, options = {}) =>
  spawnSync(command, args, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    ...options,
  })

const waitForPublicApi = async (timeoutMs = 15000) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch('https://api.pomer.cn/api/v1/config/home')
      if (response.ok) {
        return true
      }
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

const restartBackendIfRequested = async (phase) => {
  if (process.env.OPS009_RESTART_PM2 !== '1') {
    return { skipped: true }
  }
  const result = run('pm2', ['restart', 'jiuzhuopanguan-backend', '--update-env'])
  fs.writeFileSync(path.join(outDir, `pm2-${phase}.stdout.txt`), result.stdout || '', 'utf8')
  fs.writeFileSync(path.join(outDir, `pm2-${phase}.stderr.txt`), result.stderr || '', 'utf8')
  const apiReady = await waitForPublicApi()
  return {
    apiReady,
    exit: result.status,
    skipped: false,
  }
}

const cleanupStores = async ({ objectKey = '', openId = '', profileId = '', sessionId = '' }) => {
  const socialStore = readSocialStore()
  socialStore.profiles = (socialStore.profiles || []).filter((item) => item.id !== profileId && item.wechatOpenId !== openId)
  socialStore.userSessions = (socialStore.userSessions || []).filter((item) => item.profileId !== profileId)
  socialStore.loginLogs = (socialStore.loginLogs || []).filter((item) => item.profileId !== profileId && item.wechatOpenId !== openId)
  socialStore.friendships = (socialStore.friendships || []).filter((item) => item.ownerId !== profileId && item.friendId !== profileId)
  socialStore.pokes = (socialStore.pokes || []).filter((item) => item.senderId !== profileId && item.receiverId !== profileId)
  writeSocialStore(socialStore)

  const momentsStore = readMomentsStore()
  Object.keys(momentsStore).forEach((key) => {
    if (!Array.isArray(momentsStore[key])) {
      return
    }
    momentsStore[key] = momentsStore[key].filter(
      (item) => item.objectKey !== objectKey && item.sessionId !== sessionId && item.sessionId !== 'ops009-oss-smoke',
    )
  })
  writeMomentsStore(momentsStore)

  const adminStore = getAdminStore()
  Object.keys(adminStore).forEach((key) => {
    if (!Array.isArray(adminStore[key])) {
      return
    }
    adminStore[key] = adminStore[key].filter(
      (item) =>
        item.id !== sessionId &&
        item.sessionId !== sessionId &&
        item.profileId !== profileId &&
        item.hostProfileId !== profileId &&
        item.meta?.sessionId !== sessionId,
    )
  })
  writeAdminStore(adminStore)
  await Promise.all([flushAdminStore(), flushMomentsStore(), flushSocialStore()])
}

const main = async () => {
  fs.mkdirSync(outDir, { recursive: true })
  await Promise.all([initAdminStore(), initSocialStore(), initMomentsStore()])

  const openId = `ops009-oss-openid-${Date.now()}`
  const login = bindWechatUser({
    wechatOpenId: openId,
    profile: {
      name: `OPS009 OSS ${Date.now()}`,
      avatarUrl: '',
      signature: 'ops009 oss upload smoke',
      identityTag: 'QA',
    },
  })
  const token = login.token
  const tokenTail = token.slice(-8)
  const session = createManagedSession({
    hostAvatarUrl: '',
    hostName: login.profile.name,
    hostProfileId: login.profile.id,
    playerCount: 1,
    selectedPlayers: [
      {
        isHost: true,
        name: login.profile.name,
        profileId: login.profile.id,
        status: '已加入',
      },
    ],
    sessionName: `OPS009 OSS ${Date.now()}`,
    source: 'ops009-smoke',
    state: '进行中',
    status: '进行中',
    templateName: 'OSS 上传验收',
  })

  const restartBefore = await restartBackendIfRequested('before-upload')
  const smoke = run(process.execPath, ['scripts/smoke-oss-upload-http.js'], {
    env: {
      ...process.env,
      JZP_SESSION_ID: session.id,
      JZP_USER_TOKEN: token,
    },
  })
  fs.writeFileSync(path.join(outDir, 'smoke.stdout.json'), smoke.stdout || '', 'utf8')
  fs.writeFileSync(path.join(outDir, 'smoke.stderr.txt'), smoke.stderr || '', 'utf8')

  let smokeResult = null
  try {
    smokeResult = JSON.parse(smoke.stdout)
  } catch (error) {
    smokeResult = { ok: false, parseError: error.message, raw: smoke.stdout }
  }

  let deletedObject = false
  let cleanupError = ''
  try {
    await cleanupStores({
      objectKey: smokeResult?.objectKey || '',
      openId,
      profileId: login.profile.id,
      sessionId: session.id,
    })
    if (smokeResult?.objectKey) {
      await makeOssClient().delete(smokeResult.objectKey)
      deletedObject = true
    }
  } catch (error) {
    cleanupError = error && error.stack ? error.stack : String(error)
  }
  const restartAfter = await restartBackendIfRequested('after-cleanup')

  const report = {
    ok:
      smoke.status === 0 &&
      smokeResult?.ok === true &&
      deletedObject &&
      !cleanupError &&
      (restartBefore.skipped || (restartBefore.exit === 0 && restartBefore.apiReady)) &&
      (restartAfter.skipped || (restartAfter.exit === 0 && restartAfter.apiReady)),
    tokenTail,
    smokeExit: smoke.status,
    smoke: smokeResult,
    cleanup: {
      cleanupError,
      deletedObject,
      openId,
      profileId: login.profile.id,
      sessionId: session.id,
    },
    restartAfter,
    restartBefore,
  }
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8')
  console.log(JSON.stringify(report, null, 2))
  if (!report.ok) {
    process.exit(1)
  }
  process.exit(0)
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
