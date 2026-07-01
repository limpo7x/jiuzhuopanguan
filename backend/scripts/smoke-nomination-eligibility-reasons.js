const {
  createManagedSession,
  getAdminStore,
  reviewManagedMoment,
  writeAdminStore,
} = require('../data/admin')
const {
  createMoment,
  getMomentNominationEligibility,
  readMomentsStore,
  writeMomentsStore,
} = require('../data/moments')

const clone = (value) => JSON.parse(JSON.stringify(value))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const main = async () => {
  const originalAdminStore = clone(getAdminStore())
  const originalMomentsStore = clone(readMomentsStore())
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const host = {
    avatarUrl: '/static/avatar-smoke.png',
    id: `smoke-nomination-host-${suffix}`,
    name: `Smoke Nomination Host ${suffix}`,
  }

  try {
    const session = createManagedSession({
      hostAvatarUrl: host.avatarUrl,
      hostName: host.name,
      hostProfileId: host.id,
      playerCount: 2,
      sessionName: `Smoke Nomination ${suffix}`,
      source: 'smoke-nomination-eligibility-reasons',
      state: '进行中',
      status: '进行中',
      templateName: 'Smoke Template',
    })

    const noConsentMoment = createMoment({
      sessionId: session.id,
      profile: host,
      payload: {
        clientDraftId: `nomination-no-consent-${suffix}`,
        imageUrl: `/uploads/moments/${session.id}/nomination-no-consent.webp`,
        nodeType: 'highlight',
        timelineTitle: 'nomination no consent smoke',
        usageConsent: { brief: true, ranking: false, session: true, share: true },
        visibility: 'share',
      },
    })
    const noConsentEligibility = await getMomentNominationEligibility({
      category: 'today_highlight',
      momentId: noConsentMoment.id,
      profile: host,
    })
    assert(noConsentEligibility.eligible === false, 'no consent moment should not be eligible')
    assert(noConsentEligibility.reasonCode === 'ranking_consent_required', 'no consent reasonCode mismatch')
    assert(noConsentEligibility.reasonText === '需公开授权后可推举', 'no consent reasonText mismatch')

    const pendingMoment = createMoment({
      sessionId: session.id,
      profile: host,
      payload: {
        clientDraftId: `nomination-pending-${suffix}`,
        imageUrl: `/uploads/moments/${session.id}/nomination-pending.webp`,
        nodeType: 'opening',
        timelineTitle: 'nomination pending smoke',
        usageConsent: { brief: true, ranking: true, session: true, share: true },
        visibility: 'share',
      },
    })
    const pendingEligibility = await getMomentNominationEligibility({
      category: 'best_opening',
      momentId: pendingMoment.id,
      profile: host,
    })
    assert(pendingEligibility.eligible === false, 'pending moment should not be eligible before approval')
    assert(pendingEligibility.reasonCode === 'content_review_required', 'pending reasonCode mismatch')
    assert(pendingEligibility.reasonText === '图片无法读取，不能进行内容安全审核，请重新上传', 'pending reasonText mismatch')

    reviewManagedMoment({
      action: 'approve',
      momentId: pendingMoment.id,
      operator: 'smoke-nomination-eligibility-reasons',
      reason: 'smoke approve nomination eligibility',
    })
    const approvedEligibility = await getMomentNominationEligibility({
      category: 'best_opening',
      momentId: pendingMoment.id,
      profile: host,
    })
    assert(approvedEligibility.eligible === true, 'approved moment should be eligible')
    assert(approvedEligibility.reasonCode === '', 'approved reasonCode should be empty')
    assert(approvedEligibility.reasonText === '', 'approved reasonText should be empty')

    console.log(JSON.stringify({
      ok: true,
      approvedEligible: approvedEligibility.eligible,
      noConsentReasonCode: noConsentEligibility.reasonCode,
      noConsentReasonText: noConsentEligibility.reasonText,
      pendingReasonCode: pendingEligibility.reasonCode,
      pendingReasonText: pendingEligibility.reasonText,
      sessionId: session.id,
    }, null, 2))
  } finally {
    writeAdminStore(originalAdminStore)
    writeMomentsStore(originalMomentsStore)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
