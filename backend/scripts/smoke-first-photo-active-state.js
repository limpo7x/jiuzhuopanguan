const {
  createManagedSession,
  endManagedSession,
  getAdminStore,
  getPageData,
  writeAdminStore,
} = require('../data/admin')
const { getLiveSessionConfig } = require('../data/front')
const {
  createMoment,
  getUserSessionMomentSummaries,
  readMomentsStore,
  writeMomentsStore,
} = require('../data/moments')

const clone = (value) => JSON.parse(JSON.stringify(value))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const findSession = (sessionId) =>
  (getAdminStore().liveSessions || []).find((item) => item.id === sessionId) || null

const findSummary = (profileId, sessionId) =>
  getUserSessionMomentSummaries({ profile: { id: profileId } }).find((item) => item.sessionId === sessionId) || null

const main = () => {
  const originalAdminStore = clone(getAdminStore())
  const originalMomentsStore = clone(readMomentsStore())
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const host = {
    avatarUrl: '/static/avatar-smoke.png',
    id: `smoke-first-photo-host-${suffix}`,
    name: `Smoke Host ${suffix}`,
  }

  try {
    const created = createManagedSession({
      hostAvatarUrl: host.avatarUrl,
      hostName: host.name,
      hostProfileId: host.id,
      playerCount: 2,
      selectedPlayers: [],
      sessionName: `Smoke First Photo ${suffix}`,
      source: 'smoke-first-photo-active-state',
      state: '等待开局',
      status: '等待开局',
      templateName: 'Smoke Template',
    })

    const pendingSession = findSession(created.id)
    const pendingLive = getLiveSessionConfig(created.id, created.inviteCode)
    const pendingSummary = findSummary(host.id, created.id)

    assert(pendingSession, 'created session missing from admin store')
    assert(pendingSession.hasFirstPhoto === false, 'new session should not have first photo')
    assert(pendingSession.isActiveForResume === false, 'new session should not be active for resume')
    assert(pendingLive.hasFirstPhoto === false, 'live session should expose hasFirstPhoto=false before first photo')
    assert(pendingLive.isActiveForResume === false, 'live session should expose isActiveForResume=false before first photo')
    assert(pendingSummary, 'summary missing pending session')
    assert(pendingSummary.hasFirstPhoto === false, 'summary should expose hasFirstPhoto=false before first photo')
    assert(pendingSummary.isActiveForResume === false, 'summary should expose isActiveForResume=false before first photo')

    const moment = createMoment({
      sessionId: created.id,
      profile: host,
      payload: {
        clientDraftId: `first-photo-${suffix}`,
        imageUrl: `/uploads/moments/${created.id}/first-photo-smoke.webp`,
        nodeType: 'opening',
        timelineTitle: 'first photo smoke',
      },
    })
    assert(moment.imageUrl, 'created moment missing imageUrl')

    const activeSession = findSession(created.id)
    const activeLive = getLiveSessionConfig(created.id, created.inviteCode)
    const activeSummary = findSummary(host.id, created.id)
    const adminPage = getPageData('sessions')
    const adminRow = adminPage.collection.items.find((item) => item.id === created.id)

    assert(activeSession.hasFirstPhoto === true, 'session should persist hasFirstPhoto=true after first photo')
    assert(activeSession.firstPhotoUploadedAt, 'session should persist firstPhotoUploadedAt after first photo')
    assert(activeSession.isActiveForResume === true, 'session should become active for resume after first photo')
    assert(activeLive.hasFirstPhoto === true, 'live session should expose hasFirstPhoto=true after first photo')
    assert(activeLive.firstPhotoUploadedAt === activeSession.firstPhotoUploadedAt, 'live session firstPhotoUploadedAt mismatch')
    assert(activeLive.isActiveForResume === true, 'live session should expose isActiveForResume=true after first photo')
    assert(activeSummary.hasFirstPhoto === true, 'summary should expose hasFirstPhoto=true after first photo')
    assert(activeSummary.firstPhotoUploadedAt === activeSession.firstPhotoUploadedAt, 'summary firstPhotoUploadedAt mismatch')
    assert(activeSummary.isActiveForResume === true, 'summary should expose isActiveForResume=true after first photo')
    assert(activeSummary.coverPhotoUrl === moment.imageUrl, 'summary coverPhotoUrl should use first uploaded image')
    assert(adminRow?.hasFirstPhoto === true, 'admin sessions row should expose hasFirstPhoto=true')
    assert(adminRow?.isActiveForResume === true, 'admin sessions row should expose isActiveForResume=true')
    assert(adminRow?.resumeStateText === '可继续记录', 'admin sessions row resumeStateText mismatch')

    const ended = endManagedSession(created.id, { endedAt: new Date().toISOString() })
    const endedSummary = findSummary(host.id, created.id)
    assert(ended.hasFirstPhoto === true, 'ended session should keep hasFirstPhoto=true')
    assert(ended.firstPhotoUploadedAt === activeSession.firstPhotoUploadedAt, 'ended session should keep firstPhotoUploadedAt')
    assert(ended.isActiveForResume === false, 'ended session should not be active for resume')
    assert(endedSummary.hasFirstPhoto === true, 'ended summary should keep hasFirstPhoto=true')
    assert(endedSummary.isActiveForResume === false, 'ended summary should expose isActiveForResume=false')

    console.log(JSON.stringify({
      ok: true,
      adminResumeStateText: adminRow.resumeStateText,
      coverPhotoUrl: activeSummary.coverPhotoUrl,
      endedIsActiveForResume: endedSummary.isActiveForResume,
      firstPhotoUploadedAt: activeSession.firstPhotoUploadedAt,
      hasFirstPhoto: activeSummary.hasFirstPhoto,
      isActiveForResume: activeSummary.isActiveForResume,
      sessionId: created.id,
    }, null, 2))
  } finally {
    writeAdminStore(originalAdminStore)
    writeMomentsStore(originalMomentsStore)
  }
}

main()
