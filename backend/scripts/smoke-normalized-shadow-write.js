#!/usr/bin/env node

require('../load-env')

const crypto = require('crypto')
const { flushAdminStore, getAdminStore, initAdminStore, writeAdminStore } = require('../data/admin')
const { ensureMysqlPool } = require('../data/store-accessor')

const marker = `ops009-shadow-write-${process.env.OPS009_STAMP || Date.now()}`
const passwordHash = crypto.createHash('sha256').update(`Ops009Shadow!${marker}`).digest('hex')

const hasNormalizedWrite = () =>
  String(process.env.NORMALIZED_DB_WRITE || '')
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .some((item) => ['all', 'shadow', 'admin', 'admin_store'].includes(item))

const countAdminUser = async (id) => {
  const pool = await ensureMysqlPool()
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM `admin_users` WHERE `id` = ?', [id])
  return Number(rows?.[0]?.count) || 0
}

const removeMarkerUsers = () => {
  const store = getAdminStore()
  store.adminUsers = (store.adminUsers || []).filter((item) => item.id !== marker && item.username !== `${marker}.user`)
  store.sessions = (store.sessions || []).filter((item) => item.userId !== marker)
  writeAdminStore(store)
}

const main = async () => {
  if (!hasNormalizedWrite()) {
    throw new Error('NORMALIZED_DB_WRITE must include shadow/all/admin/admin_store')
  }
  await initAdminStore()

  removeMarkerUsers()
  await flushAdminStore()

  const store = getAdminStore()
  store.adminUsers = [
    ...(store.adminUsers || []).filter((item) => item.id !== marker && item.username !== `${marker}.user`),
    {
      failedLoginCount: 0,
      id: marker,
      lastFailedLoginAt: '',
      lastLoginAt: '',
      lockedUntil: '',
      name: 'OPS009 Shadow Write',
      passwordHash,
      passwordUpdatedAt: '',
      roleId: 'role-content-ops',
      status: 'active',
      username: `${marker}.user`,
    },
  ]
  writeAdminStore(store)
  await flushAdminStore()
  const insertedRows = await countAdminUser(marker)

  removeMarkerUsers()
  await flushAdminStore()
  const remainingRows = await countAdminUser(marker)

  const report = {
    insertedRows,
    marker,
    normalizedWrite: process.env.NORMALIZED_DB_WRITE || '',
    ok: insertedRows === 1 && remainingRows === 0,
    remainingRows,
  }
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
