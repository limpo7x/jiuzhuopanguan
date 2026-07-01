const fs = require('fs')
const path = require('path')

const {
  createManagedSession,
  getAdminStore,
  handleManagedMomentReport,
  initAdminStore,
  reviewManagedMoment,
  writeAdminStore,
} = require('../data/admin')
const { createDefaultUserCommerceState, initContentStore, readContentStore, writeContentStore } = require('../data/content')
const {
  createMoment,
  createMomentNomination,
  createOrRefreshSessionBrief,
  createShareImageTask,
  getMomentNominationEligibility,
  getSessionTimeline,
  initMomentsStore,
  processShareImageTask,
  readMomentsStore,
  writeMomentsStore,
} = require('../data/moments')
const { ensureProfile, initSocialStore, readSocialStore, writeSocialStore } = require('../data/social')

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const expectHttpError = async (action, statusCode, message) => {
  try {
    await action()
  } catch (error) {
    assert(error.statusCode === statusCode, `${message}: expected ${statusCode}, got ${error.statusCode || error.message}`)
    return error
  }
  throw new Error(message)
}

const cleanupGeneratedImages = (imageUrls = []) => {
  const uploadsRoot = path.join(__dirname, '..', 'public', 'uploads')
  imageUrls.forEach((imageUrl) => {
    const localPath = path.join(__dirname, '..', 'public', String(imageUrl || '').replace(/^\/+/, ''))
    if (localPath.startsWith(uploadsRoot) && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }
  })
}

const cleanupRiskData = ({ sessionId, profileIds, generatedImageUrls, targetIds }) => {
  cleanupGeneratedImages(generatedImageUrls)

  const adminStore = getAdminStore()
  Object.keys(adminStore).forEach((key) => {
    if (Array.isArray(adminStore[key])) {
      adminStore[key] = adminStore[key].filter(
        (item) =>
          item?.id !== sessionId &&
          item?.sessionId !== sessionId &&
          item?.meta?.sessionId !== sessionId &&
          !profileIds.includes(item?.profileId) &&
          !profileIds.includes(item?.hostProfileId) &&
          !targetIds.includes(item?.targetId),
      )
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

  const socialStore = readSocialStore()
  socialStore.profiles = socialStore.profiles.filter((item) => !profileIds.includes(item.id))
  writeSocialStore(socialStore)

  const contentStore = readContentStore()
  if (contentStore.userCommerce && typeof contentStore.userCommerce === 'object') {
    profileIds.forEach((profileId) => {
      delete contentStore.userCommerce[profileId]
    })
    writeContentStore(contentStore)
  }
}

const main = async () => {
  await Promise.all([initAdminStore(), initContentStore(), initMomentsStore(), initSocialStore()])

  const suffix = Date.now()
  const profileIds = [
    `ugc-risk-host-${suffix}`,
    `ugc-risk-member-a-${suffix}`,
    `ugc-risk-member-b-${suffix}`,
    `ugc-risk-outsider-${suffix}`,
  ]
  const generatedImageUrls = []
  const targetIds = []
  let sessionId = ''

  try {
    const host = ensureProfile({ id: profileIds[0], name: 'UGC Risk Host', wechatOpenId: `ugc-risk-host-openid-${suffix}` })
    const memberA = ensureProfile({ id: profileIds[1], name: 'UGC Risk A', wechatOpenId: `ugc-risk-a-openid-${suffix}` })
    const memberB = ensureProfile({ id: profileIds[2], name: 'UGC Risk B', wechatOpenId: `ugc-risk-b-openid-${suffix}` })
    const outsider = ensureProfile({ id: profileIds[3], name: 'UGC Risk Outsider', wechatOpenId: `ugc-risk-out-openid-${suffix}` })

    const session = createManagedSession({
      hostName: host.name,
      hostProfileId: host.id,
      playerCount: 3,
      selectedPlayers: [
        { name: memberA.name, profileId: memberA.id, status: '已加入' },
        { name: memberB.name, profileId: memberB.id, status: '已加入' },
      ],
      sessionName: `UGC Risk ${suffix}`,
      state: '进行中',
      templateName: 'UGC Risk Template',
    })
    sessionId = session.id

    const approvedPublic = createMoment({
      sessionId,
      profile: memberA,
      payload: {
        caption: 'approved public moment',
        clientDraftId: `approved-public-${suffix}`,
        imageUrl: '/uploads/moments/ugc-risk-public.webp',
        nodeType: 'highlight',
        tags: ['public'],
        usageConsent: { session: true, brief: true, share: true, ranking: true },
        visibility: 'session',
      },
    })
    const privateMoment = createMoment({
      sessionId,
      profile: memberA,
      payload: {
        caption: 'private sensitive caption',
        clientDraftId: `private-${suffix}`,
        imageUrl: '/uploads/moments/ugc-risk-private.webp',
        nodeType: 'private',
        tags: ['secret-tag'],
        usageConsent: { session: true, brief: true, share: true, ranking: true },
        visibility: 'selected',
        visibleProfileIds: [host.id],
      },
    })
    const needsMedia = createMoment({
      sessionId,
      profile: memberA,
      payload: {
        caption: 'needs media moment',
        clientDraftId: `needs-media-${suffix}`,
        nodeType: 'highlight',
        tags: ['needs-media'],
        usageConsent: { session: true, brief: true, share: true, ranking: true },
        visibility: 'session',
      },
    })
    const unreviewed = createMoment({
      sessionId,
      profile: memberA,
      payload: {
        caption: 'unreviewed public moment',
        clientDraftId: `unreviewed-${suffix}`,
        imageUrl: '/uploads/moments/ugc-risk-unreviewed.webp',
        nodeType: 'highlight',
        tags: ['unreviewed'],
        usageConsent: { session: true, brief: true, share: true, ranking: true },
        visibility: 'session',
      },
    })
    const hidden = createMoment({
      sessionId,
      profile: memberA,
      payload: {
        caption: 'hidden public moment',
        clientDraftId: `hidden-${suffix}`,
        imageUrl: '/uploads/moments/ugc-risk-hidden.webp',
        nodeType: 'highlight',
        tags: ['hidden'],
        usageConsent: { session: true, brief: true, share: true, ranking: true },
        visibility: 'session',
      },
    })
    targetIds.push(approvedPublic.id, privateMoment.id, needsMedia.id, unreviewed.id, hidden.id)

    reviewManagedMoment({
      action: 'approve',
      momentId: approvedPublic.id,
      operator: 'ugc-risk-smoke',
      reason: 'ugc risk approved public moment',
    })
    reviewManagedMoment({
      action: 'approve',
      momentId: hidden.id,
      operator: 'ugc-risk-smoke',
      reason: 'ugc risk approve before hide',
    })
    reviewManagedMoment({
      action: 'hide',
      momentId: hidden.id,
      operator: 'ugc-risk-smoke',
      reason: 'ugc risk hide unsafe moment',
    })

    await expectHttpError(
      () =>
        createMoment({
          sessionId,
          profile: memberA,
          payload: {
            clientDraftId: `private-empty-${suffix}`,
            imageUrl: '/uploads/moments/ugc-risk-invalid.webp',
            nodeType: 'private',
            visibility: 'selected',
            visibleProfileIds: [],
          },
        }),
      400,
      'private moment accepted empty visibleProfileIds',
    )
    await expectHttpError(
      () =>
        createMoment({
          sessionId,
          profile: memberA,
          payload: {
            clientDraftId: `private-outsider-${suffix}`,
            imageUrl: '/uploads/moments/ugc-risk-invalid.webp',
            nodeType: 'private',
            visibility: 'selected',
            visibleProfileIds: [outsider.id],
          },
        }),
      400,
      'private moment accepted outsider visibleProfileIds',
    )
    await expectHttpError(
      () => getSessionTimeline({ sessionId, profile: outsider }),
      403,
      'outsider could read session timeline',
    )

    const receiverTimeline = getSessionTimeline({ sessionId, profile: host })
    const nonReceiverTimeline = getSessionTimeline({ sessionId, profile: memberB })
    const privateForReceiver = receiverTimeline.nodes.find((item) => item.id === privateMoment.id)
    const privateForNonReceiver = nonReceiverTimeline.nodes.find((item) => item.id === privateMoment.id)

    assert(privateForReceiver?.caption === 'private sensitive caption', 'private receiver cannot read private caption')
    assert(privateForReceiver?.imageUrl, 'private receiver cannot read private image')
    assert(privateForNonReceiver?.isTimelinePlaceholder === true, 'non receiver private node is not placeholder')
    assert(!privateForNonReceiver.caption, 'non receiver received private caption')
    assert(!privateForNonReceiver.imageUrl, 'non receiver received private image')
    assert(!privateForNonReceiver.visibleProfileIds, 'non receiver received private visibleProfileIds')
    assert(!privateForNonReceiver.usageConsent, 'non receiver received private usageConsent')
    assert(!privateForNonReceiver.reviewStatus, 'non receiver received private reviewStatus')
    assert(!privateForNonReceiver.secondaryReviewStatus, 'non receiver received private secondaryReviewStatus')
    assert(Array.isArray(privateForNonReceiver.tags) && privateForNonReceiver.tags.length === 0, 'non receiver received private tags')
    assert(privateForNonReceiver.rankingEligible === false, 'non receiver private node rankingEligible leaked true')
    assert(privateForNonReceiver.rewardEligible === false, 'non receiver private node rewardEligible leaked true')

    const brief = createOrRefreshSessionBrief({ sessionId, profile: host })
    for (const moment of [privateMoment, needsMedia, unreviewed, hidden]) {
      await expectHttpError(
        () =>
          createShareImageTask({
            briefId: brief.id,
            profile: host,
            payload: {
              layoutMode: `ugc-risk-reject-${moment.id}`,
              selectedNodeIds: [moment.id],
            },
          }),
        400,
        `share task accepted unsafe node ${moment.id}`,
      )
    }

    const shareTask = createShareImageTask({
      briefId: brief.id,
      profile: host,
      payload: {
        layoutMode: 'ugc-risk-public-only',
        selectedNodeIds: [approvedPublic.id],
      },
    })
    assert(!shareTask.selectedNodeIds.includes(privateMoment.id), 'share task selected private node')
    const readyTask = await processShareImageTask({ taskId: shareTask.id, profile: host })
    generatedImageUrls.push(readyTask.imageUrl)
    assert(readyTask.status === 'ready', 'share task did not become ready for approved public node')
    assert(readyTask.imageUrl.endsWith('.png'), 'share task ready image missing png')

    const contentStore = readContentStore()
    contentStore.userCommerce = contentStore.userCommerce || {}
    contentStore.userCommerce[memberB.id] = {
      ...createDefaultUserCommerceState(),
      points: 50,
    }
    writeContentStore(contentStore)

    for (const moment of [privateMoment, needsMedia, unreviewed, hidden]) {
      const eligibility = await getMomentNominationEligibility({ category: 'today_highlight', momentId: moment.id, profile: memberB })
      assert(eligibility.eligible === false, `unsafe moment ${moment.id} is nomination eligible`)
      await expectHttpError(
        () =>
          createMomentNomination({
            momentId: moment.id,
            profile: memberB,
            payload: {
              category: 'today_highlight',
              clientNominationId: `nomination-reject-${moment.id}-${suffix}`,
            },
          }),
        400,
        `nomination accepted unsafe moment ${moment.id}`,
      )
    }

    const nomination = await createMomentNomination({
      momentId: approvedPublic.id,
      profile: memberB,
      payload: {
        category: 'today_highlight',
        clientNominationId: `nomination-approved-${suffix}`,
      },
    })
    const reportId = `ugc-risk-report-${suffix}`
    const storeWithReport = readMomentsStore()
    storeWithReport.momentReports.unshift({
      id: reportId,
      momentId: approvedPublic.id,
      sessionId,
      reporterProfileId: host.id,
      reporterName: host.name,
      reason: 'ugc risk valid report',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    writeMomentsStore(storeWithReport)
    targetIds.push(reportId)

    const reportResult = handleManagedMomentReport({
      action: 'valid_hide',
      operator: 'ugc-risk-smoke',
      reason: 'ugc risk report valid hide',
      reportId,
    })
    const memberBAfterRefund = readContentStore().userCommerce[memberB.id]
    assert(nomination.pointsSpent === 10, 'approved public nomination points mismatch')
    assert(reportResult.report.status === 'handled', 'valid report was not handled')
    assert(reportResult.moment.reviewStatus === 'hidden', 'valid report did not hide moment')
    assert(reportResult.refund.refundedPoints === 10, 'valid report did not refund nomination')
    assert(Number(memberBAfterRefund.points || 0) === 50, 'valid report refund did not restore member points')

    const operationLogs = getAdminStore().operationLogs || []
    assert(
      operationLogs.some((item) => item.targetId === reportId && item.action.includes('处理精彩瞬间举报')),
      'moment report operation log missing',
    )
    assert(
      operationLogs.some((item) => item.targetId === hidden.id && item.action.includes('审核精彩瞬间')),
      'hide operation log missing',
    )

    console.log(
      JSON.stringify(
        {
          ok: true,
          sessionId,
          approvedPublicId: approvedPublic.id,
          privateMomentId: privateMoment.id,
          privatePlaceholderTags: privateForNonReceiver.tags.length,
          shareTaskId: shareTask.id,
          shareTaskStatus: readyTask.status,
          rejectedShareNodeCount: 4,
          rejectedNominationCount: 4,
          reportId,
          refundedPoints: reportResult.refund.refundedPoints,
          operationLogsChecked: true,
        },
        null,
        2,
      ),
    )
  } finally {
    cleanupRiskData({ sessionId, profileIds, generatedImageUrls, targetIds })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
