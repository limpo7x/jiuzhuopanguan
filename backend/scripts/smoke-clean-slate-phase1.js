const {
  buildBriefDebugSummary,
  buildCleanPayloadExamples,
  buildPartyLiveDebugSummary,
  buildPRCSPrivateTokenGuide,
  buildShareImageDebugSummary,
  getCleanSlateBaseline,
  getPayloadWhitelists,
} = require('../data/clean-slate')
const { getAdminStore } = require('../data/admin')
const { getLiveSessionConfig } = require('../data/front')
const { getSessionBrief, getShareImageTask, readMomentsStore } = require('../data/moments')

const parseArgs = (argv = []) => {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const current = String(argv[index] || '')
    if (!current.startsWith('--')) continue
    const key = current.slice(2)
    const next = argv[index + 1]
    if (!next || String(next).startsWith('--')) {
      result[key] = 'true'
      continue
    }
    result[key] = String(next)
    index += 1
  }
  return result
}

const pickPreferredShareTask = (tasks = []) =>
  tasks.find((item) => String(item?.status || '').trim() === 'ready') ||
  tasks.find((item) => String(item?.status || '').trim() === 'pending') ||
  tasks.find((item) => String(item?.status || '').trim() === 'processing') ||
  tasks.find((item) => String(item?.status || '').trim() === 'failed') ||
  tasks[0] ||
  null

const main = () => {
  const args = parseArgs(process.argv.slice(2))
  const baseline = getCleanSlateBaseline()
  const adminStore = getAdminStore()
  const momentsStore = readMomentsStore()
  const firstSession = (adminStore.liveSessions || [])[0] || null
  const firstBrief = (momentsStore.sessionBriefs || [])[0] || null
  const firstTask = pickPreferredShareTask(momentsStore.shareImageTasks || [])
  const tokenGuide = buildPRCSPrivateTokenGuide({ privateManifestPath: args['private-manifest'] || '' })
  const liveSession = firstSession ? getLiveSessionConfig(firstSession.id, firstSession.inviteCode) : null

  const summary = {
    undeployed: baseline.undeployed,
    baselineSeeds: baseline.seeds,
    tokenHandoff: tokenGuide,
    payloadWhitelists: getPayloadWhitelists(),
    payloadExamples: buildCleanPayloadExamples({
      liveSession,
      brief: null,
      shareTask: null,
    }),
    debugSummary: {
      onlyForTest: true,
      partyLive: null,
      brief: null,
      shareImage: null,
    },
    storeCounts: {
      adminLiveSessions: baseline.stores.adminStore.counts.liveSessions,
      momentsBriefs: baseline.stores.momentsStore.counts.sessionBriefs,
      momentsShareImageTasks: baseline.stores.momentsStore.counts.shareImageTasks,
      socialProfiles: baseline.stores.socialStore.counts.profiles,
    },
  }

  if (firstBrief && firstSession) {
    const hostMember = Array.isArray(firstSession.members) ? firstSession.members.find((item) => item && item.isHost) || firstSession.members[0] : null
    if (hostMember && hostMember.profileId) {
      const profile = { id: hostMember.profileId, name: hostMember.name || '' }
      const loadedBrief = getSessionBrief({ briefId: firstBrief.id, profile })
      summary.payloadExamples = buildCleanPayloadExamples({
        liveSession,
        brief: loadedBrief,
        shareTask: firstTask,
      })
      summary.debugSummary.partyLive = buildPartyLiveDebugSummary(liveSession || {})
      summary.debugSummary.brief = buildBriefDebugSummary(loadedBrief)
      if (firstTask) {
        const loadedTask = getShareImageTask({ taskId: firstTask.id, profile })
        summary.debugSummary.shareImage = buildShareImageDebugSummary(loadedTask)
      }
    }
  }

  console.log(JSON.stringify(summary, null, 2))
}

main()
