#!/usr/bin/env node

require('../load-env')

const { createManagedSession, flushAdminStore, getAdminStore, initAdminStore, writeAdminStore } = require('../data/admin')
const { flushContentStore, initContentStore, readContentStore, writeContentStore } = require('../data/content')
const {
  createMoment,
  createOrRefreshSessionBrief,
  createSessionEvent,
  createShareImageTask,
  flushMomentsStore,
  initMomentsStore,
  readMomentsStore,
  writeMomentsStore,
} = require('../data/moments')
const { ensureMysqlPool } = require('../data/store-accessor')
const { ensureProfile, flushSocialStore, initSocialStore, readSocialStore, writeSocialStore } = require('../data/social')

const marker = `ops009-business-shadow-${process.env.OPS009_STAMP || Date.now()}`

const hasNormalizedWrite = () =>
  String(process.env.NORMALIZED_DB_WRITE || '')
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .some((item) => ['all', 'shadow'].includes(item))

const countRows = async (table, column, value) => {
  const pool = await ensureMysqlPool()
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM \`${table}\` WHERE \`${column}\` = ?`, [value])
  return Number(rows?.[0]?.count) || 0
}

const flushAll = async () => {
  await Promise.all([flushAdminStore(), flushContentStore(), flushMomentsStore(), flushSocialStore()])
}

const cleanup = async ({ profileIds = [], sessionId = '' } = {}) => {
  if (sessionId) {
    const adminStore = getAdminStore()
    Object.keys(adminStore).forEach((key) => {
      if (Array.isArray(adminStore[key])) {
        adminStore[key] = adminStore[key].filter((item) => item?.id !== sessionId && item?.sessionId !== sessionId && item?.meta?.sessionId !== sessionId)
      }
    })
    writeAdminStore(adminStore)

    const momentsStore = readMomentsStore()
    Object.keys(momentsStore).forEach((key) => {
      if (Array.isArray(momentsStore[key])) {
        momentsStore[key] = momentsStore[key].filter((item) => item?.sessionId !== sessionId)
      }
    })
    writeMomentsStore(momentsStore)
  }

  if (profileIds.length) {
    const profileSet = new Set(profileIds)
    const socialStore = readSocialStore()
    socialStore.profiles = (socialStore.profiles || []).filter((item) => !profileSet.has(item.id))
    socialStore.userSessions = (socialStore.userSessions || []).filter((item) => !profileSet.has(item.profileId))
    writeSocialStore(socialStore)

    const contentStore = readContentStore()
    if (contentStore.userCommerce && typeof contentStore.userCommerce === 'object') {
      profileIds.forEach((profileId) => {
        delete contentStore.userCommerce[profileId]
      })
      writeContentStore(contentStore)
    }
  }

  await flushAll()
}

const main = async () => {
  if (!hasNormalizedWrite()) {
    throw new Error('NORMALIZED_DB_WRITE must include shadow/all')
  }
  await Promise.all([initAdminStore(), initContentStore(), initMomentsStore(), initSocialStore()])

  const profileIds = [`${marker}-host`, `${marker}-member`]
  let sessionId = ''
  const created = {}

  try {
    await cleanup({ profileIds })
    const host = ensureProfile({ id: profileIds[0], name: 'OPS009 Business Host', wechatOpenId: `${marker}-host-openid` })
    const member = ensureProfile({ id: profileIds[1], name: 'OPS009 Business Member', wechatOpenId: `${marker}-member-openid` })
    await flushSocialStore()

    const session = createManagedSession({
      hostName: host.name,
      hostProfileId: host.id,
      playerCount: 2,
      selectedPlayers: [{ name: member.name, profileId: member.id, status: '已加入' }],
      sessionName: marker,
      state: '进行中',
      templateName: 'OPS009 Shadow Template',
    })
    sessionId = session.id
    created.sessionId = session.id
    await flushAdminStore()
    const sessionRows = await countRows('wine_sessions', 'id', session.id)
    const memberRows = await countRows('wine_session_members', 'session_id', session.id)

    const moment = createMoment({
      sessionId: session.id,
      profile: host,
      payload: {
        clientDraftId: `${marker}-draft`,
        caption: 'ops009 business shadow moment',
        imageUrl: '/uploads/moments/ops009-business-shadow.webp',
        nodeType: 'opening',
        tags: ['ops009'],
      },
    })
    created.momentId = moment.id
    await flushMomentsStore()
    const momentRows = await countRows('moment_records', 'id', moment.id)

    const event = createSessionEvent({
      sessionId: session.id,
      profile: host,
      payload: {
        caption: 'ops009 business shadow event',
        clientEventId: `${marker}-event`,
        eventType: 'drink_debt',
        scoreDelta: 1,
        targetProfileId: member.id,
      },
    })
    created.eventId = event.id
    await flushMomentsStore()
    const eventRows = await countRows('session_events', 'id', event.id)

    const brief = createOrRefreshSessionBrief({ sessionId: session.id, profile: host })
    created.briefId = brief.id
    await flushMomentsStore()
    const briefRows = await countRows('session_briefs', 'id', brief.id)

    const shareTask = createShareImageTask({ briefId: brief.id, profile: host, payload: { layoutMode: 'timeline' } })
    created.shareTaskId = shareTask.id
    await flushMomentsStore()
    const shareTaskRows = await countRows('share_image_tasks', 'id', shareTask.id)

    await cleanup({ profileIds, sessionId: session.id })
    const remaining = {
      momentRows: await countRows('moment_records', 'id', moment.id),
      sessionRows: await countRows('wine_sessions', 'id', session.id),
      eventRows: await countRows('session_events', 'id', event.id),
      briefRows: await countRows('session_briefs', 'id', brief.id),
      shareTaskRows: await countRows('share_image_tasks', 'id', shareTask.id),
    }

    const inserted = { briefRows, eventRows, memberRows, momentRows, sessionRows, shareTaskRows }
    const ok =
      sessionRows === 1 &&
      memberRows === 2 &&
      momentRows === 1 &&
      eventRows === 1 &&
      briefRows === 1 &&
      shareTaskRows === 1 &&
      Object.values(remaining).every((value) => value === 0)

    console.log(JSON.stringify({ created, inserted, marker, normalizedWrite: process.env.NORMALIZED_DB_WRITE || '', ok, remaining }, null, 2))
    process.exit(ok ? 0 : 1)
  } finally {
    await cleanup({ profileIds, sessionId })
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
