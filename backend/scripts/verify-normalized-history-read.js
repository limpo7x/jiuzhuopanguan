#!/usr/bin/env node

require('../load-env')

const { initAdminStore, listManagedReports } = require('../data/admin')
const { initContentStore } = require('../data/content')
const { initSocialStore, readSocialStore } = require('../data/social')
const { listManagedReportsFromNormalized } = require('../data/normalized-read')

const modes = ['all', 'host', 'joined', 'unshared']

const stableRows = (rows = []) =>
  rows.map((row) => ({
    createdAt: row.createdAt || '',
    hostName: row.hostName || '',
    hostProfileId: row.hostProfileId || '',
    id: row.id || '',
    imageUrl: row.imageUrl || '',
    meta: row.meta || '',
    recordType: row.recordType || '',
    reportId: row.reportId || '',
    role: row.role || '',
    sessionId: row.sessionId || '',
    sessionName: row.sessionName || '',
    shareRate: row.shareRate || '',
    status: row.status || '',
    templateName: row.templateName || '',
    title: row.title || '',
  }))

const compareRows = (left, right) => JSON.stringify(stableRows(left)) === JSON.stringify(stableRows(right))

const main = async () => {
  await Promise.all([initAdminStore(), initContentStore(), initSocialStore()])
  const profileIds = [...new Set((readSocialStore().profiles || []).map((item) => String(item.id || '').trim()).filter(Boolean))]
  const mismatches = []
  const checked = []
  for (const profileId of profileIds) {
    for (const mode of modes) {
      const appStoreRows = listManagedReports(profileId, mode)
      const normalizedRows = await listManagedReportsFromNormalized(profileId, mode)
      const ok = compareRows(appStoreRows, normalizedRows)
      checked.push({ appStoreRows: appStoreRows.length, mode, normalizedRows: normalizedRows.length, ok, profileId })
      if (!ok) {
        mismatches.push({
          appStoreRows: stableRows(appStoreRows),
          mode,
          normalizedRows: stableRows(normalizedRows),
          profileId,
        })
      }
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
  if (!report.ok) {
    process.exit(1)
  }
  process.exit(0)
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
