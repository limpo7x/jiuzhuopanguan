const { ensureMysqlPool, isMySQLEnabled } = require('./store-accessor')

const DEFAULT_MINI_PROGRAM_QR_URL = '/static/share-miniapp-qr.png'

const cleanText = (value = '') => String(value || '').trim()

const normalizeTemplateImageUrl = (value = '') => {
  const text = cleanText(value)
  if (/^https?:\/\/(?:127\.0\.0\.1(?::\d+)?\/__store__|store\/)/i.test(text) || /\/__store__\//i.test(text) || /\/__tmp__\//i.test(text)) {
    return ''
  }
  return text.replace(/^\/static\/templates\/(.+)\.svg$/i, '/static/templates/$1.png')
}

const resolveTimestampFromId = (value = '') => {
  const match = cleanText(value).match(/-(\d{13})(?:-|$)/)
  if (!match) {
    return null
  }
  const timestamp = Number(match[1])
  return Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp) : null
}

const parseJson = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  if (typeof value === 'object') {
    return value
  }
  try {
    return JSON.parse(String(value))
  } catch {
    return fallback
  }
}

const isEndedSessionState = (value = '') => cleanText(value).includes('结束')

const resolveHistoryStatus = (session, report) => {
  const sessionState = cleanText(session?.state)
  const sessionStatus = cleanText(session?.status || report?.status)

  if (sessionStatus.includes('失效') || sessionStatus.includes('停用') || sessionState.includes('失效')) {
    return '已失效'
  }

  if (sessionState.includes('进行中') || sessionState.includes('等待')) {
    return '进行中'
  }

  if (isEndedSessionState(sessionState) || report) {
    return '已结束'
  }

  return '进行中'
}

const normalizeMode = (mode = 'all') => {
  const normalized = cleanText(mode)
  return ['host', 'joined', 'unshared', 'all'].includes(normalized) ? normalized : 'all'
}

const toDateText = (value, fallbackId = '') => {
  const fallbackDate = resolveTimestampFromId(fallbackId)
  if (!value) {
    return fallbackDate ? fallbackDate.toISOString() : ''
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    if (value.getMilliseconds() === 0 && fallbackDate) {
      return fallbackDate.toISOString()
    }
    return value.toISOString()
  }
  return cleanText(value)
}

const calculateRate = (count, total) => {
  const denominator = Number(total) || 0
  if (!denominator) {
    return ''
  }
  const value = ((Number(count) || 0) / denominator) * 100
  return `${value.toFixed(1).replace(/\.0$/, '')}%`
}

const isEndedSession = (session = {}) => String(session?.state || session?.status || '').includes('结束')

const pickLiveSession = (sessions = []) =>
  sessions.find((item) => String(item.state || item.status || '').includes('等待')) ||
  sessions.find((item) => String(item.state || item.status || '').includes('进行中')) ||
  sessions[0] ||
  null

const formatLiveSessionFromNormalized = ({ members = [], session = {} } = {}) => {
  const playerCount = Math.max(0, Number(session?.player_count) || 0)
  const memberPlayers = members.map((item) => {
    const profileId = cleanText(item.profile_id)
    const meta = parseJson(item.meta_json, {})
    const rawMeta = cleanText(item.meta_json)
    const metaText = typeof meta === 'string' ? cleanText(meta) : cleanText(meta?.meta || (rawMeta && !/^[\[{"]/.test(rawMeta) ? rawMeta : ''))
    return {
      avatarUrl: '',
      clearedCount: Math.max(0, Number(item.cleared_count) || 0),
      debtCount: Math.max(0, Number(item.debt_count) || 0),
      drinkCount: Math.max(0, Number(item.drink_count) || 0),
      meta: metaText,
      name: cleanText(item.name),
      profileId,
      status: cleanText(item.status),
      wheelHistory: Array.isArray(meta?.wheelHistory)
        ? meta.wheelHistory
            .map((historyItem) => ({
              createdAt: cleanText(historyItem?.createdAt),
              label: cleanText(historyItem?.label),
              text: cleanText(historyItem?.text),
              type: cleanText(historyItem?.type),
            }))
            .filter((historyItem) => historyItem.text)
        : [],
    }
  })
  const joinedPlayers = memberPlayers.filter((item) => item.status === '已加入')
  const hostProfileId = cleanText(session?.host_profile_id)
  return {
    hostAvatarUrl: '',
    hostName: cleanText((members.find((item) => Number(item.is_host) === 1) || {}).name),
    hostProfileId,
    id: cleanText(session?.id),
    inviteCode: cleanText(session?.invite_code),
    joinedCount: joinedPlayers.length,
    joinedPlayers: joinedPlayers.slice(0, playerCount || joinedPlayers.length),
    joinStatusPlayers: memberPlayers.slice(0, playerCount || memberPlayers.length),
    playerCount,
    sessionName: cleanText(session?.name),
    source: cleanText(session?.source),
    stateText: cleanText(session?.state),
    status: cleanText(session?.status),
    subtitle: '',
    templateImageUrl: normalizeTemplateImageUrl(session?.image_url),
    templateName: cleanText(session?.template_name),
    title: '',
  }
}

const hasSharedReport = (shareEvents, profileId = '', report = {}) => {
  const normalizedProfileId = cleanText(profileId)
  const reportId = cleanText(report?.id)
  const sessionId = cleanText(report?.session_id)
  return shareEvents.some((item) => {
    if (item.type !== 'report_share' || cleanText(item.profile_id) !== normalizedProfileId) {
      return false
    }
    const meta = parseJson(item.meta_json, {})
    const eventReportId = cleanText(item.report_id || meta.reportId)
    const eventSessionId = cleanText(meta.sessionId)
    return (reportId && eventReportId === reportId) || (sessionId && eventSessionId === sessionId)
  })
}

const getLiveSessionConfigFromNormalized = async (sessionId = '', inviteCode = '') => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL is not enabled')
  }
  const pool = await ensureMysqlPool()
  const [sessions] = await pool.query('SELECT * FROM `wine_sessions` ORDER BY `created_at` DESC, `id` DESC')
  const [members] = await pool.query('SELECT * FROM `wine_session_members`')
  const normalizedSessionId = cleanText(sessionId)
  const normalizedInviteCode = cleanText(inviteCode).toUpperCase()
  const session = normalizedSessionId
    ? sessions.find((item) => cleanText(item.id) === normalizedSessionId)
    : normalizedInviteCode
      ? sessions.find((item) => cleanText(item.invite_code).toUpperCase() === normalizedInviteCode)
      : pickLiveSession(sessions)
  const liveSession = formatLiveSessionFromNormalized({
    members: members.filter((item) => cleanText(item.session_id) === cleanText(session?.id)),
    session: session || {},
  })
  const shareSummary = session?.id
    ? require('./moments').getPublicSessionShareSummary({ sessionId: cleanText(session.id), inviteCode: cleanText(session.invite_code) })
    : null
  return shareSummary
    ? {
        ...liveSession,
        ...shareSummary,
      }
    : liveSession
}

const isSummaryEndedState = (session = {}, report = {}) =>
  Boolean(cleanText(session?.ended_at)) ||
  cleanText(session?.state).includes('结束') ||
  cleanText(session?.status).includes('结束') ||
  cleanText(report?.state).includes('结束') ||
  cleanText(report?.status).includes('结束')

const getSummaryStateFields = (session = {}, report = {}) => {
  if (isSummaryEndedState(session, report)) {
    return {
      endedAt: toDateText(session?.ended_at || report?.ended_at || report?.created_at, report?.id || session?.id),
      state: '已结束',
      stateText: '已结束',
      status: '已结束',
      updatedAt: toDateText(session?.updated_at || session?.ended_at || report?.updated_at || report?.created_at, report?.id || session?.id),
    }
  }
  const state = cleanText(session?.state || report?.state || report?.status || '进行中')
  const status = cleanText(session?.status || report?.status || state || '进行中')
  return {
    endedAt: '',
    state,
    stateText: state,
    status,
    updatedAt: toDateText(session?.updated_at || report?.updated_at || report?.created_at, report?.id || session?.id),
  }
}

const listManagedReportsFromNormalized = async (profileId = '', mode = 'all') => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL is not enabled')
  }
  const normalizedProfileId = cleanText(profileId)
  const normalizedMode = normalizeMode(mode)
  const pool = await ensureMysqlPool()
  const [sessions] = await pool.query('SELECT * FROM `wine_sessions`')
  const [members] = await pool.query('SELECT * FROM `wine_session_members`')
  const [reports] = await pool.query('SELECT * FROM `wine_reports`')
  const [templates] = await pool.query('SELECT * FROM `templates`')
  const [shareEvents] = await pool.query(
    "SELECT `type`, `profile_id`, `report_id`, `meta_json` FROM `analytics_events` WHERE `type` = 'report_share'",
  )

  const membersBySessionId = new Map()
  for (const member of members) {
    const sessionId = cleanText(member.session_id)
    if (!membersBySessionId.has(sessionId)) {
      membersBySessionId.set(sessionId, [])
    }
    membersBySessionId.get(sessionId).push(member)
  }
  const reportBySessionId = new Map(
    reports
      .filter((report) => cleanText(report.session_id))
      .map((report) => [cleanText(report.session_id), report]),
  )
  const templateByName = new Map(
    templates
      .flatMap((template) => [template.title, template.name, template.id].map((key) => [cleanText(key), template]))
      .filter(([key]) => key),
  )

  const relatedSessions = sessions.filter((session) => {
    if (!normalizedProfileId) {
      return true
    }
    const sessionMembers = membersBySessionId.get(cleanText(session.id)) || []
    const isHost = cleanText(session.host_profile_id) === normalizedProfileId || sessionMembers.some((item) => cleanText(item.profile_id) === normalizedProfileId && Number(item.is_host) === 1)
    const isMember = sessionMembers.some((item) => cleanText(item.profile_id) === normalizedProfileId)
    if (normalizedMode === 'host') {
      return isHost
    }
    if (normalizedMode === 'joined' || normalizedMode === 'unshared') {
      return isMember && !isHost
    }
    return isMember
  })

  const rows = relatedSessions.map((session) => {
    const sessionId = cleanText(session.id)
    const report = reportBySessionId.get(sessionId)
    const status = resolveHistoryStatus(session, report)
    const sessionMembers = membersBySessionId.get(sessionId) || []
    const host = sessionMembers.find((item) => Number(item.is_host) === 1) || {}
    const createdAt = toDateText(report?.created_at || session?.created_at, report?.id || sessionId)
    const templateName = cleanText(report?.template_name || session?.template_name)
    const template = templateByName.get(templateName) || null
    const role = cleanText(session.host_profile_id || host.profile_id) === normalizedProfileId ? 'host' : 'member'
    const reportTitle = cleanText(report?.title || '')
    const reportName = cleanText(report?.name || '')
    return {
      id: report?.id ? cleanText(report.id) : `session:${sessionId}`,
      recordType: report ? 'report' : 'session',
      reportId: report?.id ? cleanText(report.id) : '',
      role,
      sessionId,
      sessionName: report ? cleanText(reportName || reportTitle).replace(/战报$/, '') : cleanText(session.name),
      title: report ? cleanText(reportName || reportTitle).replace(/战报$/, '') : cleanText(session.name),
      templateName,
      hostName: cleanText(host.name),
      hostProfileId: cleanText(host.profile_id || session.host_profile_id),
      imageUrl: normalizeTemplateImageUrl(report?.image_url || session?.image_url || template?.image_url || ''),
      status,
      meta: `${Number(report?.player_count) || Number(session?.player_count) || 0}人 · ${templateName} · ${createdAt}`.replace(/\s+/g, ' ').trim(),
      createdAt,
      shareRate: cleanText(report?.share_rate) || calculateRate(report?.share_count, report?.view_count),
    }
  })

  const filteredRows =
    normalizedMode === 'unshared'
      ? rows.filter((row) => row.role === 'member' && row.reportId && row.status === '已结束' && !hasSharedReport(shareEvents, normalizedProfileId, { id: row.reportId, session_id: row.sessionId }))
      : rows

  return filteredRows.sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')))
}

const listUserSessionMomentSummariesFromNormalized = async ({ profile } = {}) => {
  const profileId = cleanText(profile?.id)
  if (!profileId) {
    const error = new Error('unauthorized')
    error.statusCode = 401
    throw error
  }
  const reports = await listManagedReportsFromNormalized(profileId, 'all')
  const pool = await ensureMysqlPool()
  const [sessions] = await pool.query('SELECT * FROM `wine_sessions`')
  const [moments] = await pool.query('SELECT * FROM `moment_records`')
  const [briefs] = await pool.query('SELECT * FROM `session_briefs`')
  const [tasks] = await pool.query('SELECT * FROM `share_image_tasks`')
  const [wineReports] = await pool.query('SELECT * FROM `wine_reports`')

  const sessionById = new Map(sessions.map((item) => [cleanText(item.id), item]))
  const wineReportBySessionId = new Map(wineReports.filter((item) => cleanText(item.session_id)).map((item) => [cleanText(item.session_id), item]))
  const momentsBySessionId = new Map()
  for (const moment of moments) {
    if (moment.removed_at) {
      continue
    }
    const sessionId = cleanText(moment.session_id)
    if (!momentsBySessionId.has(sessionId)) {
      momentsBySessionId.set(sessionId, [])
    }
    momentsBySessionId.get(sessionId).push(moment)
  }

  const briefsBySessionId = new Map()
  for (const brief of briefs) {
    const sessionId = cleanText(brief.session_id)
    if (!briefsBySessionId.has(sessionId)) {
      briefsBySessionId.set(sessionId, [])
    }
    briefsBySessionId.get(sessionId).push(brief)
  }
  for (const values of briefsBySessionId.values()) {
    values.sort((left, right) =>
      toDateText(right.updated_at || right.created_at, right.id).localeCompare(toDateText(left.updated_at || left.created_at, left.id)),
    )
  }

  const taskById = new Map(tasks.map((item) => [cleanText(item.id), item]))

  return reports.map((report) => {
    const sessionId = cleanText(report.sessionId)
    const session = sessionById.get(sessionId) || {}
    const stateFields = getSummaryStateFields(session, wineReportBySessionId.get(sessionId) || report)
    const isEndedSession = stateFields.state.includes('结束') || stateFields.status.includes('结束') || Boolean(stateFields.endedAt)
    const sessionMoments = momentsBySessionId.get(sessionId) || []
    const brief = (briefsBySessionId.get(sessionId) || [])[0] || null
    const task = brief?.share_image_task_id ? taskById.get(cleanText(brief.share_image_task_id)) : null
    const coverPhotoUrl = cleanText(
      sessionMoments
        .filter((item) => cleanText(item.image_url))
        .sort((left, right) =>
          toDateText(left.created_at, left.id).localeCompare(toDateText(right.created_at, right.id)),
        )[0]?.image_url,
    )
    const resumableMomentIds = isEndedSession
      ? []
      : sessionMoments
          .filter((item) => cleanText(item.uploader_profile_id) === profileId && cleanText(item.completion_status) === 'needs_media')
          .map((item) => cleanText(item.id))
    const readyShareImageUrl = cleanText(task?.image_url)
    return {
      sessionId,
      reportId: report.reportId || report.id,
      sessionName: report.sessionName,
      title: report.title,
      state: stateFields.state,
      stateText: stateFields.stateText,
      status: stateFields.status,
      endedAt: stateFields.endedAt,
      updatedAt: stateFields.updatedAt,
      canResume: resumableMomentIds.length > 0,
      canShare: Boolean(brief?.id && (task?.status === 'ready' ? readyShareImageUrl : brief.share_image_task_id || task?.id)),
      coverPhotoUrl,
      pendingMediaCount: sessionMoments.filter((item) => cleanText(item.uploader_profile_id) === profileId && cleanText(item.completion_status) === 'needs_media').length,
      canResumeMomentIds: resumableMomentIds,
      briefId: cleanText(brief?.id),
      shareImageTaskId: cleanText(task?.id),
      shareImageStatus: cleanText(task?.status),
      shareImageUrl: cleanText(task?.image_url),
      readyShareImageUrl,
      rankingEntryEnabled: Number(brief?.ranking_eligible) === 1,
    }
  })
}

const canAccessSessionFromNormalized = (session = {}, members = [], profileId = '') => {
  const normalizedProfileId = cleanText(profileId)
  if (!normalizedProfileId || !session) {
    return false
  }
  if (cleanText(session.host_profile_id) === normalizedProfileId) {
    return true
  }
  return members.some((item) => cleanText(item.profile_id) === normalizedProfileId)
}

const listUserShareImageSummariesFromNormalized = async ({ profile } = {}) => {
  const profileId = cleanText(profile?.id)
  if (!profileId) {
    const error = new Error('unauthorized')
    error.statusCode = 401
    throw error
  }
  if (!isMySQLEnabled()) {
    throw new Error('MySQL is not enabled')
  }
  const pool = await ensureMysqlPool()
  const [tasks] = await pool.query("SELECT * FROM `share_image_tasks` WHERE `status` = 'ready' AND `image_url` IS NOT NULL AND `image_url` <> ''")
  const [sessions] = await pool.query('SELECT `id`, `host_profile_id`, `name` FROM `wine_sessions`')
  const [members] = await pool.query('SELECT `session_id`, `profile_id` FROM `wine_session_members`')
  const sessionById = new Map(sessions.map((item) => [cleanText(item.id), item]))
  const membersBySessionId = new Map()
  for (const member of members) {
    const sessionId = cleanText(member.session_id)
    if (!membersBySessionId.has(sessionId)) {
      membersBySessionId.set(sessionId, [])
    }
    membersBySessionId.get(sessionId).push(member)
  }

  return tasks
    .map((task) => ({
      session: sessionById.get(cleanText(task.session_id)),
      task,
    }))
    .filter(({ session, task }) => canAccessSessionFromNormalized(session, membersBySessionId.get(cleanText(task.session_id)) || [], profileId))
    .map(({ session, task }) => {
      const imageUrl = cleanText(task.image_url)
      return {
        taskId: cleanText(task.id),
        sessionId: cleanText(task.session_id),
        sessionName: cleanText(session?.name),
        briefId: cleanText(task.brief_id),
        status: cleanText(task.status),
        imageUrl,
        readyShareImageUrl: imageUrl,
        posterImageUrl: imageUrl,
        miniProgramQrUrl: DEFAULT_MINI_PROGRAM_QR_URL,
        qrCodeUrl: DEFAULT_MINI_PROGRAM_QR_URL,
        createdAt: toDateText(task.created_at, task.id),
        updatedAt: toDateText(task.updated_at, task.id),
        finishedAt: toDateText(task.finished_at, task.id),
      }
    })
    .sort((left, right) => {
      const rightTime = cleanText(right.finishedAt || right.updatedAt || right.createdAt)
      const leftTime = cleanText(left.finishedAt || left.updatedAt || left.createdAt)
      return rightTime.localeCompare(leftTime)
    })
}

const shouldReadNormalized = (scope = '') => {
  const scopes = cleanText(process.env.NORMALIZED_DB_READ)
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
  return scopes.includes('all') || scopes.includes(scope)
}

module.exports = {
  getLiveSessionConfigFromNormalized,
  listUserShareImageSummariesFromNormalized,
  listUserSessionMomentSummariesFromNormalized,
  listManagedReportsFromNormalized,
  shouldReadNormalized,
}
