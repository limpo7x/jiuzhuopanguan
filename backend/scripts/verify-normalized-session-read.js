#!/usr/bin/env node

require('../load-env')

const { getAdminStore, initAdminStore } = require('../data/admin')
const { initContentStore } = require('../data/content')
const { getLiveSessionConfig } = require('../data/front')
const { initMomentsStore } = require('../data/moments')
const { initSocialStore } = require('../data/social')
const { getLiveSessionConfigFromNormalized } = require('../data/normalized-read')

const stableValue = (value) => JSON.parse(JSON.stringify(value || {}))

const compare = (left, right) => JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))

const main = async () => {
  await Promise.all([initAdminStore(), initContentStore(), initMomentsStore(), initSocialStore()])
  const sessions = getAdminStore().liveSessions || []
  const cases = [{ label: 'default', sessionId: '', inviteCode: '' }]
  for (const session of sessions) {
    cases.push({ label: `session:${session.id}`, sessionId: session.id, inviteCode: '' })
    if (session.inviteCode) {
      cases.push({ label: `invite:${session.inviteCode}`, sessionId: '', inviteCode: session.inviteCode })
    }
  }

  const checked = []
  const mismatches = []
  for (const item of cases) {
    const appStoreValue = getLiveSessionConfig(item.sessionId, item.inviteCode)
    const normalizedValue = await getLiveSessionConfigFromNormalized(item.sessionId, item.inviteCode)
    const ok = compare(appStoreValue, normalizedValue)
    checked.push({ label: item.label, ok })
    if (!ok) {
      mismatches.push({
        appStoreValue: stableValue(appStoreValue),
        label: item.label,
        normalizedValue: stableValue(normalizedValue),
      })
    }
  }

  const report = {
    ok: mismatches.length === 0,
    caseCount: cases.length,
    checked,
    mismatchCount: mismatches.length,
    mismatches,
  }
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
