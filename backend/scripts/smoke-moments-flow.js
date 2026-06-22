const fs = require('fs')
const path = require('path')
const {
  createManagedSession,
  getAdminStore,
  initAdminStore,
  retryManagedShareImageTask: retryManagedShareImageTaskAsAdmin,
  reviewManagedMoment,
  writeAdminStore,
} = require('../data/admin')
const { createDefaultUserCommerceState, initContentStore, readContentStore, writeContentStore } = require('../data/content')
const {
  createMomentNomination,
  createMoment,
  createOrRefreshSessionBrief,
  createSessionEvent,
  createShareImageTask,
  getSessionTimeline,
  grantRankingRewards,
  initMomentsStore,
  listTodayRankings,
  processShareImageTask,
  readMomentsStore,
  retryShareImageTask,
  writeMomentsStore,
} = require('../data/moments')
const { ensureProfile, initSocialStore, readSocialStore, writeSocialStore } = require('../data/social')

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const expectHttpError = (action, statusCode, message) => {
  try {
    action()
  } catch (error) {
    assert(error.statusCode === statusCode, message)
    return
  }
  throw new Error(message)
}

const cleanupSmokeData = ({ sessionId, profileIds, generatedImageUrls = [], targetIds = [] }) => {
  generatedImageUrls.forEach((imageUrl) => {
    const localPath = path.join(__dirname, '..', 'public', imageUrl.replace(/^\/+/, ''))
    const uploadsRoot = path.join(__dirname, '..', 'public', 'uploads')
    if (localPath.startsWith(uploadsRoot) && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }
  })

  if (sessionId) {
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
  }

  if (profileIds.length) {
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
}

const main = async () => {
  await Promise.all([initContentStore(), initSocialStore(), initAdminStore(), initMomentsStore()])

  const suffix = Date.now()
  const profileIds = [`smoke-host-${suffix}`, `smoke-member-a-${suffix}`, `smoke-member-b-${suffix}`]
  let sessionId = ''
  const generatedImageUrls = []
  const targetIds = []

  try {
    const host = ensureProfile({
      id: profileIds[0],
      name: 'Smoke Host',
      wechatOpenId: `smoke-host-openid-${suffix}`,
    })
    const memberA = ensureProfile({
      id: profileIds[1],
      name: 'Smoke Member A',
      wechatOpenId: `smoke-member-a-openid-${suffix}`,
    })
    const memberB = ensureProfile({
      id: profileIds[2],
      name: 'Smoke Member B',
      wechatOpenId: `smoke-member-b-openid-${suffix}`,
    })

    const session = createManagedSession({
      hostName: host.name,
      hostProfileId: host.id,
      playerCount: 3,
      selectedPlayers: [
        { name: memberA.name, profileId: memberA.id, status: '已加入' },
        { name: memberB.name, profileId: memberB.id, status: '已加入' },
      ],
      sessionName: `Smoke Moments ${suffix}`,
      state: '进行中',
      templateName: 'Smoke Template',
    })
    sessionId = session.id

    const opening = createMoment({
      sessionId: session.id,
      profile: host,
      payload: {
        clientDraftId: `opening-${suffix}`,
        caption: 'opening check-in',
        imageUrl: '/uploads/moments/smoke-opening.webp',
        nodeType: 'opening',
        tags: ['opening'],
      },
    })
    const highlight = createMoment({
      sessionId: session.id,
      profile: memberA,
      payload: {
        clientDraftId: `highlight-${suffix}`,
        caption: 'highlight moment',
        imageUrl: '/uploads/moments/smoke-highlight.webp',
        nodeType: 'highlight',
        tags: ['funny'],
      },
    })
    const privateMoment = createMoment({
      sessionId: session.id,
      profile: memberA,
      payload: {
        clientDraftId: `private-${suffix}`,
        caption: 'private moment',
        imageUrl: '/uploads/moments/smoke-private.webp',
        nodeType: 'private',
        tags: ['private'],
        visibility: 'selected',
        visibleProfileIds: [host.id],
      },
    })
    const event = createSessionEvent({
      sessionId: session.id,
      profile: host,
      payload: {
        caption: 'debt recorded',
        clientEventId: `event-${suffix}`,
        eventType: 'drink_debt',
        scoreDelta: 1,
        targetProfileId: memberA.id,
      },
    })
    targetIds.push(opening.id, highlight.id, privateMoment.id, event.id)

    expectHttpError(
      () =>
        createMoment({
          sessionId: session.id,
          profile: memberA,
          payload: {
            clientDraftId: `invalid-private-${suffix}`,
            imageUrl: '/uploads/moments/smoke-invalid.webp',
            nodeType: 'private',
            visibility: 'selected',
            visibleProfileIds: [`smoke-outsider-${suffix}`],
          },
        }),
      400,
      'private visibleProfileIds accepted outsider profile',
    )
    expectHttpError(
      () =>
        createSessionEvent({
          sessionId: session.id,
          profile: host,
          payload: {
            clientEventId: `invalid-event-${suffix}`,
            eventType: 'drink_debt',
            targetProfileId: `smoke-outsider-${suffix}`,
          },
        }),
      400,
      'session event accepted outsider targetProfileId',
    )

    const hostTimeline = getSessionTimeline({ sessionId: session.id, profile: host })
    const memberBTimeline = getSessionTimeline({ sessionId: session.id, profile: memberB })
    const privateForHost = hostTimeline.nodes.find((item) => item.id === privateMoment.id)
    const privateForMemberB = memberBTimeline.nodes.find((item) => item.id === privateMoment.id)

    assert(opening.nodeType === 'opening', 'opening moment was not created')
    assert(highlight.nodeType === 'highlight', 'highlight moment was not created')
    assert(event.eventType === 'drink_debt', 'session event was not created')
    assert(privateForHost && privateForHost.caption === 'private moment', 'private receiver cannot read private moment')
    assert(privateForMemberB && privateForMemberB.isTimelinePlaceholder === true, 'non receiver can read private moment content')

    const brief = createOrRefreshSessionBrief({ sessionId: session.id, profile: host })
    expectHttpError(
      () =>
        createShareImageTask({
          briefId: brief.id,
          profile: host,
          payload: { layoutMode: 'invalid-node-check', selectedNodeIds: [`outsider-node-${suffix}`] },
        }),
      400,
      'share task accepted selectedNodeIds outside visible brief timeline',
    )
    const task = createShareImageTask({ briefId: brief.id, profile: host, payload: { layoutMode: 'timeline' } })
    expectHttpError(
      () => retryShareImageTask({ taskId: task.id, profile: host }),
      409,
      'share task retry accepted non failed task',
    )
    const readyTask = await processShareImageTask({ taskId: task.id, profile: host })
    generatedImageUrls.push(readyTask.imageUrl)
    const momentsStore = readMomentsStore()
    const failedTaskId = `share-task-failed-${suffix}`
    momentsStore.shareImageTasks.unshift({
      id: failedTaskId,
      sessionId: session.id,
      briefId: brief.id,
      status: 'pending',
      layoutMode: 'failed-smoke',
      selectedNodeIds: [`missing-node-${suffix}`],
      imageUrl: '',
      failedReason: '',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      startedAt: '',
      finishedAt: '',
      updatedAt: new Date().toISOString(),
    })
    writeMomentsStore(momentsStore)
    const failedTask = await processShareImageTask({ taskId: failedTaskId, profile: host })
    const retriedTask = retryShareImageTask({ taskId: failedTask.id, profile: host })
    const adminFailedTaskId = `share-task-admin-failed-${suffix}`
    const nextStore = readMomentsStore()
    nextStore.shareImageTasks.unshift({
      id: adminFailedTaskId,
      sessionId: session.id,
      briefId: brief.id,
      status: 'pending',
      layoutMode: 'admin-failed-smoke',
      selectedNodeIds: [`missing-admin-node-${suffix}`],
      imageUrl: '',
      failedReason: '',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      startedAt: '',
      finishedAt: '',
      updatedAt: new Date().toISOString(),
    })
    writeMomentsStore(nextStore)
    const adminFailedTask = await processShareImageTask({ taskId: adminFailedTaskId, profile: host })
    const approvedReview = reviewManagedMoment({
      momentId: highlight.id,
      action: 'approve',
      reason: 'smoke approve highlight',
      operator: 'smoke-admin',
    })
    const resubmitReview = reviewManagedMoment({
      momentId: opening.id,
      action: 'require_resubmit',
      reason: 'smoke require resubmit opening',
      operator: 'smoke-admin',
    })
    const contentStore = readContentStore()
    contentStore.userCommerce = contentStore.userCommerce || {}
    contentStore.userCommerce[memberB.id] = {
      ...createDefaultUserCommerceState(),
      points: 50,
    }
    writeContentStore(contentStore)
    const nomination = createMomentNomination({
      momentId: highlight.id,
      profile: memberB,
      payload: {
        category: 'today_highlight',
        clientNominationId: `nomination-${suffix}`,
      },
    })
    expectHttpError(
      () =>
        createMomentNomination({
          momentId: highlight.id,
          profile: memberB,
          payload: {
            category: 'today_highlight',
            clientNominationId: `nomination-duplicate-${suffix}`,
          },
        }),
      409,
      'duplicate daily nomination was accepted',
    )
    const rankings = listTodayRankings({ category: 'today_highlight' })
    const rewardGrant = grantRankingRewards({ category: 'today_highlight', operator: 'smoke-admin' })
    const refundReview = reviewManagedMoment({
      momentId: highlight.id,
      action: 'remove_ranking',
      reason: 'smoke remove ranking refund',
      operator: 'smoke-admin',
    })
    const rankingsAfterRefund = listTodayRankings({ category: 'today_highlight' })
    const memberBCommerceAfterRefund = readContentStore().userCommerce[memberB.id]
    const adminRetriedTask = retryManagedShareImageTaskAsAdmin({
      taskId: adminFailedTask.id,
      reason: 'smoke admin retry failed task',
      operator: 'smoke-admin',
    })
    targetIds.push(failedTask.id, adminFailedTask.id)

    assert(brief.timelineNodeIds.includes(opening.id), 'brief missing opening node')
    assert(task.status === 'pending', 'share task was not created as pending')
    assert(readyTask.status === 'ready', 'share task was not processed as ready')
    assert(readyTask.imageUrl.endsWith('.png'), 'share task ready imageUrl missing png')
    assert(failedTask.status === 'failed', 'invalid share task was not marked failed')
    assert(retriedTask.status === 'pending', 'failed share task retry did not return pending')
    assert(retriedTask.retryCount === 1, 'failed share task retryCount did not increment')
    assert(adminFailedTask.status === 'failed', 'admin invalid share task was not marked failed')
    assert(approvedReview.moment.reviewStatus === 'approved', 'admin approve did not update reviewStatus')
    assert(resubmitReview.moment.secondaryReviewStatus === 'require_resubmit', 'admin require resubmit did not update secondaryReviewStatus')
    assert(nomination.pointsSpent === 10, 'nomination points cost mismatch')
    assert(rankings.items.some((item) => item.moment.id === highlight.id), 'rankings missing nominated moment')
    assert(rewardGrant.grantedCount === 1, 'ranking reward grant count mismatch')
    assert(rewardGrant.totalPoints > 0, 'ranking reward did not grant points')
    assert(refundReview.refund.refundedCount === 1, 'remove ranking did not refund nomination')
    assert(refundReview.refund.refundedPoints === 10, 'nomination refund points mismatch')
    assert(Number(memberBCommerceAfterRefund.points || 0) === 50, 'nomination refund did not restore member points')
    assert(!rankingsAfterRefund.items.some((item) => item.moment.id === highlight.id), 'removed ranking moment still listed')
    assert(adminRetriedTask.task.status === 'pending', 'admin share task retry did not return pending')
    assert(adminRetriedTask.task.retryCount === 1, 'admin share task retryCount did not increment')
    const operationLogs = getAdminStore().operationLogs || []
    assert(
      operationLogs.some((item) => item.targetId === highlight.id && item.action.includes('审核精彩瞬间')),
      'admin approve operation log missing',
    )
    assert(
      operationLogs.some((item) => item.targetId === opening.id && item.action.includes('审核精彩瞬间')),
      'admin require resubmit operation log missing',
    )
    assert(
      operationLogs.some((item) => item.targetId === adminFailedTask.id && item.action === '重试分享图任务'),
      'admin retry operation log missing',
    )

    console.log(
      JSON.stringify(
        {
          ok: true,
          sessionId: session.id,
          openingId: opening.id,
          highlightId: highlight.id,
          privateMomentId: privateMoment.id,
          eventId: event.id,
          hostTimelineNodes: hostTimeline.nodes.length,
          memberBPrivatePlaceholder: privateForMemberB.isTimelinePlaceholder,
          briefId: brief.id,
          shareTaskId: task.id,
          shareTaskStatus: readyTask.status,
          shareImageUrl: readyTask.imageUrl,
          failedTaskStatus: failedTask.status,
          retriedTaskStatus: retriedTask.status,
          nominationId: nomination.id,
          rankingItems: rankings.items.length,
          rankingRewardGranted: rewardGrant.grantedCount,
          refundedPoints: refundReview.refund.refundedPoints,
          adminRetriedTaskStatus: adminRetriedTask.task.status,
          adminOperationLogsChecked: true,
        },
        null,
        2,
      ),
    )
  } finally {
    cleanupSmokeData({ sessionId, profileIds, generatedImageUrls, targetIds })
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
