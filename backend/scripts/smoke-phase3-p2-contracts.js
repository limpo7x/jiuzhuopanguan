const fs = require('fs')
const path = require('path')

const {
  getAdminStore,
  writeAdminStore,
} = require('../data/admin')
const {
  cleanupMomentUpload,
  createMoment,
  listTodayRankings,
  readMomentsStore,
  uploadMomentImage,
  writeMomentsStore,
} = require('../data/moments')
const { deleteObject } = require('../data/object-storage')

const backendDir = path.resolve(__dirname, '..')
const adminStorePath = path.join(backendDir, 'data', 'admin-store.json')
const momentsStorePath = path.join(backendDir, 'data', 'moments-store.json')

const PNG_1X1_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const readIfExists = (filePath) => (fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '')

const restoreFile = (filePath, content) => {
  if (content) {
    fs.writeFileSync(filePath, content, 'utf8')
    return
  }
  fs.rmSync(filePath, { force: true })
}

const expectHttpError = async (fn, statusCode, message) => {
  try {
    await fn()
  } catch (error) {
    assert(Number(error.statusCode || 0) === statusCode, `${message}: expected ${statusCode}, got ${error.statusCode || error.message}`)
    return error
  }
  throw new Error(`${message}: expected error`)
}

const main = async () => {
  const adminBackup = readIfExists(adminStorePath)
  const momentsBackup = readIfExists(momentsStorePath)
  const uploadedObjectKeys = []
  const stamp = Date.now()
  const sessionId = `phase3-p2-smoke-session-${stamp}`
  const hostProfileId = `phase3-p2-host-${stamp}`
  const profile = {
    avatarUrl: '/static/avatar-phase3.png',
    id: hostProfileId,
    name: 'Phase3 Host',
  }

  try {
    const adminStore = getAdminStore()
    writeAdminStore({
      ...adminStore,
      liveSessions: [
        {
          id: sessionId,
          name: 'Phase3 P2 Smoke',
          players: 2,
          template: 'Phase3 Smoke',
          hostName: profile.name,
          hostProfileId,
          inviteCode: `P3${String(stamp).slice(-5)}`,
          state: '进行中',
          source: 'phase3-p2-smoke',
          status: '正常',
          members: [
            {
              profileId: hostProfileId,
              name: profile.name,
              isHost: true,
              status: '已加入',
            },
          ],
          updatedAt: new Date().toISOString(),
        },
        ...(adminStore.liveSessions || []),
      ],
    })

    const momentsStore = readMomentsStore()
    const rankingMomentId = `phase3-p2-ranking-moment-${stamp}`
    const nominationId = `phase3-p2-nomination-${stamp}`
    writeMomentsStore({
      ...momentsStore,
      momentRecords: [
        {
          id: rankingMomentId,
          sessionId,
          uploaderProfileId: hostProfileId,
          uploaderName: profile.name,
          nodeType: 'highlight',
          mediaType: 'image',
          imageUrl: '/uploads/moments/phase3-ranking.webp',
          caption: '公开榜单展示照片',
          tags: ['phase3'],
          visibility: 'share',
          visibleProfileIds: [hostProfileId],
          usageConsent: { session: true, brief: true, share: true, ranking: true },
          completionStatus: 'complete',
          reviewStatus: 'approved',
          secondaryReviewStatus: 'approved',
          rankingEligible: true,
          rewardEligible: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...(momentsStore.momentRecords || []),
      ],
      momentNominations: [
        {
          id: nominationId,
          momentId: rankingMomentId,
          sessionId,
          profileId: hostProfileId,
          profileName: profile.name,
          category: 'today_highlight',
          pointsSpent: 10,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        ...(momentsStore.momentNominations || []),
      ],
    })

    const ranking = listTodayRankings({ category: 'today_highlight', limit: 5 })
    const rankingItem = ranking.items.find((item) => item.moment?.id === rankingMomentId)
    assert(rankingItem, 'ranking item missing')
    assert(!Object.prototype.hasOwnProperty.call(rankingItem.moment, 'uploaderProfileId'), 'ranking leaked uploaderProfileId')
    assert(!Object.prototype.hasOwnProperty.call(rankingItem.moment, 'visibleProfileIds'), 'ranking leaked visibleProfileIds')
    assert(rankingItem.moment.uploaderName === profile.name, 'ranking display name missing')

    const orphanAsset = await uploadMomentImage({
      profile,
      payload: {
        dataUrl: PNG_1X1_DATA_URL,
        fileName: 'phase3-orphan.png',
        sessionId,
      },
    })
    uploadedObjectKeys.push(orphanAsset.objectKey)
    const cleanupResult = await cleanupMomentUpload({ assetId: orphanAsset.id, profile })
    assert(cleanupResult.removed === true, 'orphan cleanup did not report removed')
    const removedAsset = readMomentsStore().uploadedAssets.find((item) => item.id === orphanAsset.id)
    assert(removedAsset?.removedAt, 'orphan asset not marked removed')

    const boundAsset = await uploadMomentImage({
      profile,
      payload: {
        dataUrl: PNG_1X1_DATA_URL,
        fileName: 'phase3-bound.png',
        sessionId,
      },
    })
    uploadedObjectKeys.push(boundAsset.objectKey)
    const created = createMoment({
      sessionId,
      profile,
      payload: {
        caption: '绑定上传资产',
        imageUrl: boundAsset.url,
        nodeType: 'highlight',
        uploadAssetId: boundAsset.id,
        usageConsent: { session: true, brief: true, share: true, ranking: true },
        visibility: 'session',
      },
    })
    assert(created.id, 'created moment missing id')
    const boundRecord = readMomentsStore().uploadedAssets.find((item) => item.id === boundAsset.id)
    assert(boundRecord?.boundMomentId === created.id, 'bound asset did not record moment id')
    await expectHttpError(
      () => cleanupMomentUpload({ assetId: boundAsset.id, profile }),
      409,
      'bound asset cleanup',
    )

    console.log(JSON.stringify({
      ok: true,
      rankingItems: ranking.items.length,
      orphanCleanup: cleanupResult.removed,
      boundMomentId: created.id,
    }, null, 2))
  } finally {
    restoreFile(adminStorePath, adminBackup)
    restoreFile(momentsStorePath, momentsBackup)
    for (const objectKey of uploadedObjectKeys.filter(Boolean)) {
      await deleteObject({ key: objectKey }).catch(() => undefined)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
