const {
  createManagedSession,
  deleteManagedSession,
  endManagedSession,
  getAdminStore,
} = require('../data/admin')
const { getUserSessionMomentSummaries } = require('../data/moments')

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const main = () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const profileId = `smoke-ended-summary-${suffix}`
  let sessionId = ''

  try {
    const created = createManagedSession({
      hostName: 'Smoke Host',
      hostProfileId: profileId,
      playerCount: 2,
      selectedPlayers: [],
      sessionName: `Smoke Ended Summary ${suffix}`,
      source: 'smoke-user-ended-session-summaries',
      status: 'in_progress',
      state: 'in_progress',
      templateName: 'Smoke Template',
    })
    sessionId = created.id

    const endedAt = new Date().toISOString()
    const ended = endManagedSession(sessionId, { endedAt })
    assert(ended, 'endManagedSession did not return the updated session')
    assert(ended.state === '\u5df2\u7ed3\u675f', `unexpected ended state: ${ended.state}`)
    assert(ended.status === '\u5df2\u7ed3\u675f', `unexpected ended status: ${ended.status}`)
    assert(ended.endedAt, 'ended session missing endedAt')

    const store = getAdminStore()
    assert(
      !(store.reports || []).some((item) => item.sessionId === sessionId),
      'smoke setup expected no report for endManagedSession path',
    )

    const summaries = getUserSessionMomentSummaries({ profile: { id: profileId } })
    const summary = summaries.find((item) => item.sessionId === sessionId)
    assert(summary, 'ended session missing from user session moment summaries')
    assert(summary.endedAt, 'summary missing endedAt')
    assert(summary.state === '\u5df2\u7ed3\u675f', `summary state mismatch: ${summary.state}`)
    assert(summary.status === '\u5df2\u7ed3\u675f', `summary status mismatch: ${summary.status}`)
    assert(summary.stateText === '\u5df2\u7ed3\u675f', `summary stateText mismatch: ${summary.stateText}`)
    assert(summary.canResume === false, 'ended summary must not be resumable')
    assert(Array.isArray(summary.canResumeMomentIds) && summary.canResumeMomentIds.length === 0, 'ended summary has resumable moment ids')

    console.log(JSON.stringify({
      ok: true,
      sessionId,
      profileId,
      endedAt: summary.endedAt,
      state: summary.state,
      status: summary.status,
      stateText: summary.stateText,
      canResume: summary.canResume,
      reportId: summary.reportId,
    }, null, 2))
  } finally {
    if (sessionId) {
      deleteManagedSession(sessionId)
    }
  }
}

main()
