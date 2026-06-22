#!/usr/bin/env node

require('../load-env')

const { initAdminStore } = require('../data/admin')
const { initContentStore } = require('../data/content')
const { getUserShareImageSummaries, initMomentsStore } = require('../data/moments')
const { initSocialStore, readSocialStore } = require('../data/social')
const { listUserShareImageSummariesFromNormalized } = require('../data/normalized-read')

const stableRows = (rows = []) =>
  rows.map((row) => ({
    briefId: row.briefId || '',
    createdAt: row.createdAt || '',
    finishedAt: row.finishedAt || '',
    imageUrl: row.imageUrl || '',
    miniProgramQrUrl: row.miniProgramQrUrl || '',
    posterImageUrl: row.posterImageUrl || '',
    qrCodeUrl: row.qrCodeUrl || '',
    readyShareImageUrl: row.readyShareImageUrl || '',
    sessionId: row.sessionId || '',
    sessionName: row.sessionName || '',
    status: row.status || '',
    taskId: row.taskId || '',
    updatedAt: row.updatedAt || '',
  }))

const compareRows = (left, right) => JSON.stringify(stableRows(left)) === JSON.stringify(stableRows(right))

const main = async () => {
  await Promise.all([initAdminStore(), initContentStore(), initMomentsStore(), initSocialStore()])
  const profileIds = [...new Set((readSocialStore().profiles || []).map((item) => String(item.id || '').trim()).filter(Boolean))]
  const checked = []
  const mismatches = []
  for (const profileId of profileIds) {
    const appStoreRows = getUserShareImageSummaries({ profile: { id: profileId } })
    const normalizedRows = await listUserShareImageSummariesFromNormalized({ profile: { id: profileId } })
    const ok = compareRows(appStoreRows, normalizedRows)
    checked.push({ appStoreRows: appStoreRows.length, normalizedRows: normalizedRows.length, ok, profileId })
    if (!ok) {
      mismatches.push({
        appStoreRows: stableRows(appStoreRows),
        normalizedRows: stableRows(normalizedRows),
        profileId,
      })
    }
  }
  const report = {
    ok: mismatches.length === 0,
    checked,
    checkedCount: checked.length,
    mismatches,
    profileCount: profileIds.length,
  }
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
