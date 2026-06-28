const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { ensureMysqlPool, isMySQLEnabled } = require('./store-accessor')
const { getAdminStore } = require('./admin')
const { listAdminAssets } = require('./assets')
const { readContentStore } = require('./content')
const { readMomentsStore } = require('./moments')
const { readSocialStore } = require('./social')

const schemaPath = path.join(__dirname, '..', 'sql', 'mysql-normalized-schema.sql')

const hashToken = (value = '') => crypto.createHash('sha256').update(String(value || '')).digest('hex')
const text = (value = '') => {
  const normalized = String(value || '').trim()
  return normalized || null
}
const number = (value = 0) => Number(value) || 0
const bool = (value) => (value ? 1 : 0)
const json = (value) => (value === undefined || value === null ? null : JSON.stringify(value))
const memberMetaJson = (member = {}) =>
  json({
    meta: text(member.meta) || '',
    wheelHistory: Array.isArray(member.wheelHistory) ? member.wheelHistory : [],
  })
const safeId = (...parts) =>
  parts
    .map((part) =>
      String(part || '')
        .trim()
        .replace(/[^a-zA-Z0-9:_-]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .join(':')

const toDate = (value) => {
  if (!value) {
    return null
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }
  const timestamp = typeof value === 'number' ? value : Date.parse(String(value))
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null
  }
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}

const splitSqlStatements = (sql) =>
  sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) =>
      statement
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter(Boolean)

const quote = (name) => `\`${name}\``

const ensureColumn = async (pool, table, column, definition, afterColumn = '') => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column],
  )
  if (Number(rows?.[0]?.count) > 0) {
    return 0
  }
  const afterSql = afterColumn ? ` AFTER ${quote(afterColumn)}` : ''
  await pool.query(`ALTER TABLE ${quote(table)} ADD COLUMN ${quote(column)} ${definition}${afterSql}`)
  return 1
}

const modifyColumn = async (pool, table, column, definition) => {
  const [rows] = await pool.query(
    'SELECT COLUMN_TYPE AS columnType FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
    [table, column],
  )
  const columnType = String(rows?.[0]?.columnType || '').toLowerCase()
  if (columnType === definition.split(/\s+/)[0].toLowerCase()) {
    return 0
  }
  await pool.query(`ALTER TABLE ${quote(table)} MODIFY COLUMN ${quote(column)} ${definition}`)
  return 1
}

const upsertMany = async (pool, table, rows, columns, updateColumns = columns.slice(1)) => {
  if (!rows.length) {
    return 0
  }

  const columnSql = columns.map(quote).join(', ')
  const placeholderSql = columns.map(() => '?').join(', ')
  const updateSql = updateColumns.length
    ? updateColumns.map((column) => `${quote(column)} = VALUES(${quote(column)})`).join(', ')
    : `${quote(columns[0])} = ${quote(columns[0])}`
  const sql = `INSERT INTO ${quote(table)} (${columnSql}) VALUES (${placeholderSql}) ON DUPLICATE KEY UPDATE ${updateSql}`

  for (const row of rows) {
    await pool.query(
      sql,
      columns.map((column) => (row[column] === undefined ? null : row[column])),
    )
  }
  return rows.length
}

const pruneMissingRows = async (pool, table, rows, keyColumn) => {
  const values = [...new Set(rows.map((row) => row[keyColumn]).filter((value) => value !== undefined && value !== null))]
  if (!values.length) {
    const [result] = await pool.query(`DELETE FROM ${quote(table)}`)
    return Number(result.affectedRows) || 0
  }

  const placeholders = values.map(() => '?').join(', ')
  const [result] = await pool.query(`DELETE FROM ${quote(table)} WHERE ${quote(keyColumn)} NOT IN (${placeholders})`, values)
  return Number(result.affectedRows) || 0
}

const ensureNormalizedSchema = async () => {
  if (!isMySQLEnabled()) {
    return { enabled: false, statements: 0 }
  }
  const pool = await ensureMysqlPool()
  const sql = fs.readFileSync(schemaPath, 'utf8')
  const statements = splitSqlStatements(sql)
  for (const statement of statements) {
    await pool.query(statement)
  }
  let migrations = 0
  migrations += await ensureColumn(pool, 'wine_sessions', 'subtitle', 'VARCHAR(255) NULL', 'name')
  migrations += await ensureColumn(pool, 'wine_sessions', 'image_url', 'TEXT NULL', 'source')
  migrations += await ensureColumn(pool, 'wine_reports', 'name', 'VARCHAR(255) NULL', 'profile_id')
  migrations += await ensureColumn(pool, 'wine_reports', 'image_url', 'TEXT NULL', 'title')
  migrations += await ensureColumn(pool, 'wine_reports', 'player_count', 'INT NOT NULL DEFAULT 0', 'highlight3')
  migrations += await ensureColumn(pool, 'wine_reports', 'share_rate', 'VARCHAR(32) NULL', 'share_count')
  migrations += await modifyColumn(pool, 'wine_sessions', 'started_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'wine_sessions', 'ended_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'wine_sessions', 'created_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'wine_sessions', 'updated_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'wine_reports', 'created_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'share_image_tasks', 'created_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'share_image_tasks', 'started_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'share_image_tasks', 'finished_at', 'DATETIME(3) NULL')
  migrations += await modifyColumn(pool, 'share_image_tasks', 'updated_at', 'DATETIME(3) NULL')
  return { enabled: true, migrations, statements: statements.length }
}

const mapUsers = (socialStore) =>
  (socialStore.profiles || []).map((item) => ({
    id: text(item.id),
    wechat_open_id: text(item.wechatOpenId),
    wechat_union_id: text(item.wechatUnionId),
    phone: text(item.phone),
    name: text(item.name),
    avatar_url: text(item.avatarUrl),
    signature: text(item.signature),
    identity_tag: text(item.identityTag),
    login_count: number(item.loginCount),
    last_login_at: toDate(item.lastLoginAt),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id)

const mapUserSessions = (socialStore) =>
  (socialStore.userSessions || []).map((item) => ({
    token_hash: hashToken(item.token),
    user_id: text(item.profileId),
    expires_at: toDate(item.expiresAt),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.token_hash && item.user_id)

const mapUserLoginLogs = (socialStore) =>
  (socialStore.loginLogs || []).map((item, index) => ({
    id: text(item.id) || safeId('login-log', item.profileId, item.loginAt, index),
    user_id: text(item.profileId),
    wechat_open_id: text(item.wechatOpenId),
    phone: text(item.phone),
    source: text(item.source),
    login_at: toDate(item.loginAt),
  })).filter((item) => item.id)

const mapFriendships = (socialStore) =>
  (socialStore.friendships || []).map((item, index) => ({
    id: text(item.id) || safeId('friendship', item.ownerId, item.friendId, index),
    owner_id: text(item.ownerId),
    friend_id: text(item.friendId),
    alias: text(item.alias),
    meta_json: json({ text: item.meta || '' }),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id && item.owner_id && item.friend_id)

const mapPokeThreads = (socialStore) =>
  (socialStore.pokes || []).map((item, index) => ({
    id: text(item.id) || safeId('poke', item.senderId, item.receiverId, index),
    sender_id: text(item.senderId),
    receiver_id: text(item.receiverId),
    status: text(item.status),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id)

const mapWineSessions = (adminStore) =>
  (adminStore.liveSessions || []).map((item, index) => ({
    id: text(item.id) || safeId('session', index),
    invite_code: text(item.inviteCode),
    host_profile_id: text(item.hostProfileId || (item.members || []).find((member) => member.isHost)?.profileId),
    name: text(item.name),
    subtitle: text(item.subtitle),
    template_id: text(item.templateId),
    template_name: text(item.template),
    player_count: number(item.players || (item.members || []).length),
    state: text(item.state),
    status: text(item.status),
    source: text(item.source),
    image_url: text(item.templateImageUrl || item.imageUrl),
    started_at: toDate(item.startedAt),
    ended_at: toDate(item.endedAt),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id)

const mapWineSessionMembers = (adminStore) =>
  (adminStore.liveSessions || []).flatMap((session, sessionIndex) =>
    (session.members || []).map((member, memberIndex) => ({
      id: text(member.id) || safeId('session-member', session.id || sessionIndex, member.profileId || member.name || memberIndex),
      session_id: text(session.id),
      profile_id: text(member.profileId),
      name: text(member.name),
      avatar_url: text(member.avatarUrl),
      phone: text(member.phone),
      is_host: bool(member.isHost),
      status: text(member.status),
      debt_count: number(member.debtCount),
      drink_count: number(member.drinkCount),
      cleared_count: number(member.clearedCount),
      meta_json: memberMetaJson(member),
      created_at: toDate(member.createdAt || session.createdAt),
      updated_at: toDate(member.updatedAt || session.updatedAt),
    })).filter((item) => item.id && item.session_id),
  )

const mapWineReports = (adminStore) =>
  (adminStore.reports || []).map((item, index) => ({
    id: text(item.id) || safeId('report', index),
    session_id: text(item.sessionId),
    profile_id: text(item.profileId || item.hostProfileId),
    name: text(item.name),
    template_name: text(item.template || item.templateName),
    title: text(item.title || item.name),
    image_url: text(item.imageUrl),
    scene: text(item.scene),
    highlight1: text(item.highlight1),
    highlight2: text(item.highlight2),
    highlight3: text(item.highlight3),
    player_count: number(item.playerCount),
    view_count: number(item.viewCount),
    share_count: number(item.shareCount),
    share_rate: text(item.shareRate),
    replay_count: number(item.replayCount),
    status: text(item.status),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.id)

const mapMomentRecords = (momentsStore) =>
  (momentsStore.momentRecords || []).map((item, index) => ({
    id: text(item.id) || safeId('moment', index),
    client_draft_id: text(item.clientDraftId),
    session_id: text(item.sessionId),
    uploader_profile_id: text(item.uploaderProfileId),
    uploader_name: text(item.uploaderName),
    uploader_avatar_url: text(item.uploaderAvatarUrl),
    node_type: text(item.nodeType) || 'highlight',
    media_type: text(item.mediaType) || 'image',
    image_url: text(item.imageUrl),
    video_url: text(item.videoUrl),
    cover_image_url: text(item.coverImageUrl),
    duration: number(item.duration),
    caption: text(item.caption),
    tags_json: json(item.tags || []),
    visibility: text(item.visibility) || 'session',
    visible_profile_ids_json: json(item.visibleProfileIds || []),
    timeline_title: text(item.timelineTitle),
    is_timeline_placeholder: bool(item.isTimelinePlaceholder),
    usage_consent_json: json(item.usageConsent || {}),
    completion_status: text(item.completionStatus) || 'draft',
    review_status: text(item.reviewStatus) || 'approved',
    secondary_review_status: text(item.secondaryReviewStatus) || 'approved',
    ranking_eligible: bool(item.rankingEligible),
    reward_eligible: bool(item.rewardEligible),
    removed_at: toDate(item.removedAt),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id && item.session_id && item.uploader_profile_id)

const mapSessionEvents = (momentsStore) =>
  (momentsStore.sessionEvents || []).map((item, index) => ({
    id: text(item.id) || safeId('session-event', item.sessionId, item.clientEventId, index),
    client_event_id: text(item.clientEventId),
    session_id: text(item.sessionId),
    event_type: text(item.eventType) || 'drink_debt',
    operator_profile_id: text(item.operatorProfileId),
    operator_name: text(item.operatorName),
    target_profile_id: text(item.targetProfileId),
    target_name: text(item.targetName),
    score_delta: number(item.scoreDelta),
    caption: text(item.caption),
    sync_status: text(item.syncStatus),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id && item.session_id && item.operator_profile_id)

const mapSessionBriefs = (momentsStore) =>
  (momentsStore.sessionBriefs || []).map((item, index) => ({
    id: text(item.id) || safeId('session-brief', item.sessionId, index),
    session_id: text(item.sessionId),
    title: text(item.title),
    cover_mode: text(item.coverMode),
    opening_moment_ids_json: json(item.openingMomentIds || []),
    closing_moment_ids_json: json(item.closingMomentIds || []),
    timeline_node_ids_json: json(item.timelineNodeIds || []),
    share_image_task_id: text(item.shareImageTaskId),
    share_image_status: text(item.shareImageStatus),
    incomplete_moment_count: number(item.pendingMediaCount),
    ranking_eligible: bool(item.rankingEligible),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id && item.session_id)

const mapShareImageTasks = (momentsStore) =>
  (momentsStore.shareImageTasks || []).map((item, index) => ({
    id: text(item.id) || safeId('share-image-task', item.briefId, index),
    session_id: text(item.sessionId),
    brief_id: text(item.briefId),
    status: text(item.status) || 'pending',
    layout_mode: text(item.layoutMode) || 'timeline',
    selected_node_ids_json: json(item.selectedNodeIds || []),
    image_url: text(item.imageUrl),
    failure_reason: text(item.failedReason || item.failureReason),
    retry_count: number(item.retryCount),
    created_at: toDate(item.createdAt),
    started_at: toDate(item.startedAt),
    finished_at: toDate(item.finishedAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id && item.session_id && item.brief_id)

const mapMomentReports = (momentsStore) =>
  (momentsStore.momentReports || []).map((item, index) => ({
    id: text(item.id) || safeId('moment-report', item.momentId, item.createdAt, index),
    moment_id: text(item.momentId),
    session_id: text(item.sessionId),
    reporter_profile_id: text(item.reporterProfileId || item.profileId),
    reason: text(item.reason),
    description: text(item.description || item.detail),
    status: text(item.status) || 'pending',
    handled_by: text(item.handledBy || item.operator),
    handled_at: toDate(item.handledAt),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.id && item.moment_id)

const mapMomentNominations = (momentsStore) =>
  (momentsStore.momentNominations || []).map((item, index) => ({
    id: text(item.id) || safeId('moment-nomination', item.momentId, item.profileId, item.category, index),
    client_nomination_id: text(item.clientNominationId),
    moment_id: text(item.momentId),
    session_id: text(item.sessionId),
    profile_id: text(item.profileId),
    profile_name: text(item.profileName),
    category: text(item.category) || 'today_highlight',
    points_spent: number(item.pointsSpent),
    status: text(item.status) || 'active',
    refunded_at: toDate(item.refundedAt),
    refund_reason: text(item.refundReason),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id && item.moment_id && item.session_id && item.profile_id)

const mapRankingRewardRules = (momentsStore, adminStore) =>
  ((momentsStore.rankingRewardRules || []).length ? momentsStore.rankingRewardRules : adminStore.rankingRewardRules || []).map(
    (item, index) => ({
      id: text(item.id) || safeId('ranking-reward-rule', item.category, item.rankStart, item.rankEnd, index),
      category: text(item.category) || 'today_highlight',
      enabled: bool(item.enabled === 'true' || item.enabled === true),
      rank_start: Math.max(1, number(item.rankStart) || 1),
      rank_end: Math.max(Math.max(1, number(item.rankStart) || 1), number(item.rankEnd) || Math.max(1, number(item.rankStart) || 1)),
      points: number(item.points),
      tiers_json: json(item.tiers || null),
      effective_at: toDate(item.effectiveAt),
      reason: text(item.reason),
      updated_at: toDate(item.updatedAt),
    }),
  ).filter((item) => item.id && item.category)

const mapRankingRewardPayouts = (momentsStore) =>
  (momentsStore.rankingRewardPayouts || []).map((item, index) => ({
    id: text(item.id) || safeId('ranking-reward-payout', item.sourceId, index),
    source_id: text(item.sourceId),
    category: text(item.category) || 'today_highlight',
    date: toDate(item.date),
    moment_id: text(item.momentId),
    session_id: text(item.sessionId),
    profile_id: text(item.profileId),
    profile_name: text(item.profileName),
    rank: Math.max(1, number(item.rank) || 1),
    points: number(item.points),
    rule_id: text(item.ruleId),
    status: text(item.status) || 'granted',
    operator: text(item.operator),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id && item.source_id && item.date && item.moment_id && item.profile_id)

const mapPointsTasks = (contentStore) =>
  (contentStore.pointsConfig?.tasks || []).map((item, index) => ({
    id: text(item.id) || safeId('task', index),
    title: text(item.title),
    value: number(item.value),
    icon_class: text(item.iconClass),
    status: text(item.status) || 'active',
    sort_order: number(item.sortOrder || (index + 1) * 10),
  })).filter((item) => item.id)

const mapPointsRewards = (contentStore) =>
  (contentStore.pointsConfig?.rewards || []).map((item, index) => ({
    id: text(item.id) || safeId('reward', index),
    title: text(item.title),
    subtitle: text(item.subtitle),
    cost: number(item.cost),
    icon_class: text(item.iconClass),
    status: text(item.status) || 'active',
    sort_order: number(item.sortOrder || (index + 1) * 10),
  })).filter((item) => item.id)

const mapUserCommerceStates = (contentStore) =>
  Object.entries(contentStore.userCommerce || {}).map(([profileId, state]) => ({
    profile_id: text(profileId),
    points: number(state.points),
    membership_active: bool(state.membership?.active),
    membership_plan_id: text(state.membership?.planId),
    membership_expires_at: toDate(state.membership?.expiresAt),
    updated_at: new Date(),
  })).filter((item) => item.profile_id)

const mapPointsLedger = (contentStore) =>
  Object.entries(contentStore.userCommerce || {}).flatMap(([profileId, state]) =>
    (state.pointsLedger || []).map((item, index) => ({
      id: text(item.id) || safeId('ledger', profileId, item.createdAt, index),
      profile_id: text(profileId),
      delta: number(item.delta),
      kind: text(item.kind),
      source_id: text(item.sourceId),
      title: text(item.title),
      created_at: toDate(item.createdAt),
    })).filter((item) => item.id && item.profile_id),
  )

const mapPointsTaskClaims = (contentStore) =>
  Object.entries(contentStore.userCommerce || {}).flatMap(([profileId, state]) =>
    Object.entries(state.taskStates || {}).flatMap(([taskId, taskState]) =>
      (taskState.claimHistory || []).map((claimedAt, index) => ({
        id: safeId('claim', profileId, taskId, claimedAt, index),
        profile_id: text(profileId),
        task_id: text(taskId),
        source_id: text((taskState.claimedSessionIds || [])[index]),
        claimed_at: toDate(claimedAt),
      })).filter((item) => item.id && item.profile_id && item.task_id),
    ),
  )

const mapRewardRedemptions = (contentStore) =>
  Object.entries(contentStore.userCommerce || {}).flatMap(([profileId, state]) =>
    (state.rewardRedemptions || []).map((item, index) => ({
      id: text(item.id) || safeId('redemption', profileId, item.rewardId, item.createdAt, index),
      profile_id: text(profileId),
      reward_id: text(item.rewardId),
      title: text(item.title),
      cost: number(item.cost),
      created_at: toDate(item.createdAt),
    })).filter((item) => item.id && item.profile_id),
  )

const mapMembershipOrders = (contentStore) =>
  Object.entries(contentStore.userCommerce || {}).flatMap(([profileId, state]) =>
    (state.membershipOrders || []).map((item, index) => ({
      id: text(item.id) || safeId('membership-order', profileId, item.planId, item.createdAt, index),
      profile_id: text(profileId),
      plan_id: text(item.planId),
      created_at: toDate(item.createdAt),
      expires_at: toDate(item.expiresAt),
      status: text(item.status) || 'active',
    })).filter((item) => item.id && item.profile_id),
  )

const mapTemplateFilters = (contentStore) =>
  (contentStore.templateConfig?.filters || []).map((item, index) => ({
    id: text(item.id) || safeId('filter', index),
    name: text(item.name),
    sort_order: number(item.sortOrder || (index + 1) * 10),
    status: text(item.status) || 'active',
  })).filter((item) => item.id)

const mapTemplates = (contentStore) =>
  (contentStore.templateConfig?.templates || []).map((item, index) => ({
    id: text(item.id) || safeId('template', index),
    filter_id: text(item.filterId),
    title: text(item.title),
    meta: text(item.meta),
    cost: number(item.cost),
    image_url: text(item.imageUrl),
    status: text(item.status) || 'active',
    sort_order: number(item.sortOrder || (index + 1) * 10),
  })).filter((item) => item.id)

const mapQuestionBank = (adminStore) =>
  (adminStore.questionBank || []).map((item, index) => ({
    id: text(item.id) || safeId('question', index),
    content: text(item.content),
    type: text(item.type),
    difficulty: text(item.difficulty),
    template: text(item.template),
    risk_level: text(item.riskLevel),
    status: text(item.status),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id)

const mapShareAssets = (adminStore) =>
  (adminStore.shareAssets || []).map((item, index) => ({
    id: text(item.id) || safeId('share-asset', index),
    name: text(item.name),
    asset_type: text(item.assetType),
    scene: text(item.scene),
    image_url: text(item.imageUrl),
    open_count: number(item.openCount),
    return_count: number(item.returnCount),
    status: text(item.status),
    created_at: toDate(item.createdAt),
    updated_at: toDate(item.updatedAt),
  })).filter((item) => item.id)

const mapToolsCatalog = (adminStore) =>
  (adminStore.toolsCatalog || []).map((item, index) => ({
    id: text(item.id) || safeId('tool', index),
    name: text(item.name),
    category: text(item.category),
    target: text(item.target),
    image_url: text(item.imageUrl),
    usage_count: number(item.usageCount),
    favorite_count: number(item.favoriteCount),
    status: text(item.status),
    sort_order: number(item.sortOrder || (index + 1) * 10),
    is_hot: text(item.isHot),
    placement: text(item.placement),
  })).filter((item) => item.id)

const mapMembershipPlans = (adminStore) =>
  (adminStore.membershipPlans || []).map((item, index) => ({
    id: text(item.id) || safeId('membership-plan', index),
    name: text(item.name),
    price: text(item.price),
    duration: text(item.duration),
    conversion_rate: text(item.conversionRate),
    renew_rate: text(item.renewRate),
    status: text(item.status),
    sort_order: number(item.sortOrder || (index + 1) * 10),
  })).filter((item) => item.id)

const mapMembershipBenefits = (adminStore) =>
  (adminStore.membershipBenefits || []).map((item, index) => ({
    id: text(item.id) || safeId('membership-benefit', index),
    name: text(item.name),
    scope: text(item.scope),
    status: text(item.status),
    note: text(item.note),
    sort_order: number(item.sortOrder || (index + 1) * 10),
  })).filter((item) => item.id)

const mapAdminUsers = (adminStore) =>
  (adminStore.adminUsers || []).map((item) => ({
    id: text(item.id),
    username: text(item.username),
    password_hash: text(item.passwordHash),
    name: text(item.name),
    role_id: text(item.roleId),
    status: text(item.status),
    last_login_at: toDate(item.lastLoginAt),
  })).filter((item) => item.id && item.username && item.password_hash)

const mapAdminRoles = (adminStore) =>
  (adminStore.roles || []).map((item) => ({
    id: text(item.id),
    name: text(item.name),
    scope: text(item.scope),
    permissions_json: json(item.permissions || []),
    status: text(item.status),
  })).filter((item) => item.id)

const mapAdminSessions = (adminStore) =>
  (adminStore.sessions || []).map((item) => ({
    token_hash: hashToken(item.token),
    user_id: text(item.userId || item.user?.id),
    expires_at: toDate(item.expiresAt),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.token_hash && item.user_id)

const mapAdminOperationLogs = (adminStore) =>
  (adminStore.operationLogs || []).map((item, index) => ({
    id: text(item.id) || safeId('admin-op', item.targetId, item.createdAt, index),
    operator_id: text(item.operator),
    action: text(item.action),
    target_type: text(item.targetType) || 'user',
    target_id: text(item.targetId || item.targetOpenId || item.targetName),
    detail: text(item.detail),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.id)

const mapAnalyticsEvents = (adminStore) =>
  (adminStore.analyticsEvents || []).map((item, index) => ({
    id: text(item.id) || safeId('event', item.type, item.profileId, item.createdAt, index),
    type: text(item.type),
    profile_id: text(item.profileId),
    report_id: text(item.reportId),
    asset_id: text(item.assetId),
    tool_id: text(item.toolId),
    meta_json: json(item.meta || {}),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.id)

const mapAssets = () =>
  (listAdminAssets().uploads || []).map((item) => ({
    id: text(item.id),
    category: text(item.category),
    file_name: text(item.name),
    url: text(item.url),
    mime_type: text(item.mimeType),
    size: number(item.size),
    source: text(item.source),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.id)

const syncNormalizedTables = async ({ logger = console } = {}) => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL is not enabled. Set MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE first.')
  }

  const schema = await ensureNormalizedSchema()
  const pool = await ensureMysqlPool()
  const contentStore = readContentStore()
  const socialStore = readSocialStore()
  const adminStore = getAdminStore()
  const momentsStore = readMomentsStore()

  const tasks = [
    ['users', mapUsers(socialStore), ['id', 'wechat_open_id', 'wechat_union_id', 'phone', 'name', 'avatar_url', 'signature', 'identity_tag', 'login_count', 'last_login_at', 'created_at', 'updated_at']],
    ['user_sessions', mapUserSessions(socialStore), ['token_hash', 'user_id', 'expires_at', 'created_at']],
    ['user_login_logs', mapUserLoginLogs(socialStore), ['id', 'user_id', 'wechat_open_id', 'phone', 'source', 'login_at']],
    ['friendships', mapFriendships(socialStore), ['id', 'owner_id', 'friend_id', 'alias', 'meta_json', 'updated_at']],
    ['poke_threads', mapPokeThreads(socialStore), ['id', 'sender_id', 'receiver_id', 'status', 'created_at', 'updated_at']],
    ['wine_sessions', mapWineSessions(adminStore), ['id', 'invite_code', 'host_profile_id', 'name', 'subtitle', 'template_id', 'template_name', 'player_count', 'state', 'status', 'source', 'image_url', 'started_at', 'ended_at', 'created_at', 'updated_at']],
    ['wine_session_members', mapWineSessionMembers(adminStore), ['id', 'session_id', 'profile_id', 'name', 'avatar_url', 'phone', 'is_host', 'status', 'debt_count', 'drink_count', 'cleared_count', 'meta_json', 'created_at', 'updated_at']],
    ['wine_reports', mapWineReports(adminStore), ['id', 'session_id', 'profile_id', 'name', 'template_name', 'title', 'image_url', 'scene', 'highlight1', 'highlight2', 'highlight3', 'player_count', 'view_count', 'share_count', 'share_rate', 'replay_count', 'status', 'created_at']],
    ['moment_records', mapMomentRecords(momentsStore), ['id', 'client_draft_id', 'session_id', 'uploader_profile_id', 'uploader_name', 'uploader_avatar_url', 'node_type', 'media_type', 'image_url', 'video_url', 'cover_image_url', 'duration', 'caption', 'tags_json', 'visibility', 'visible_profile_ids_json', 'timeline_title', 'is_timeline_placeholder', 'usage_consent_json', 'completion_status', 'review_status', 'secondary_review_status', 'ranking_eligible', 'reward_eligible', 'removed_at', 'created_at', 'updated_at']],
    ['session_events', mapSessionEvents(momentsStore), ['id', 'client_event_id', 'session_id', 'event_type', 'operator_profile_id', 'operator_name', 'target_profile_id', 'target_name', 'score_delta', 'caption', 'sync_status', 'created_at', 'updated_at']],
    ['session_briefs', mapSessionBriefs(momentsStore), ['id', 'session_id', 'title', 'cover_mode', 'opening_moment_ids_json', 'closing_moment_ids_json', 'timeline_node_ids_json', 'share_image_task_id', 'share_image_status', 'incomplete_moment_count', 'ranking_eligible', 'created_at', 'updated_at']],
    ['share_image_tasks', mapShareImageTasks(momentsStore), ['id', 'session_id', 'brief_id', 'status', 'layout_mode', 'selected_node_ids_json', 'image_url', 'failure_reason', 'retry_count', 'created_at', 'started_at', 'finished_at', 'updated_at']],
    ['moment_reports', mapMomentReports(momentsStore), ['id', 'moment_id', 'session_id', 'reporter_profile_id', 'reason', 'description', 'status', 'handled_by', 'handled_at', 'created_at']],
    ['moment_nominations', mapMomentNominations(momentsStore), ['id', 'client_nomination_id', 'moment_id', 'session_id', 'profile_id', 'profile_name', 'category', 'points_spent', 'status', 'refunded_at', 'refund_reason', 'created_at', 'updated_at']],
    ['ranking_reward_rules', mapRankingRewardRules(momentsStore, adminStore), ['id', 'category', 'enabled', 'rank_start', 'rank_end', 'points', 'tiers_json', 'effective_at', 'reason', 'updated_at']],
    ['ranking_reward_payouts', mapRankingRewardPayouts(momentsStore), ['id', 'source_id', 'category', 'date', 'moment_id', 'session_id', 'profile_id', 'profile_name', 'rank', 'points', 'rule_id', 'status', 'operator', 'created_at', 'updated_at']],
    ['points_tasks', mapPointsTasks(contentStore), ['id', 'title', 'value', 'icon_class', 'status', 'sort_order']],
    ['points_rewards', mapPointsRewards(contentStore), ['id', 'title', 'subtitle', 'cost', 'icon_class', 'status', 'sort_order']],
    ['user_commerce_states', mapUserCommerceStates(contentStore), ['profile_id', 'points', 'membership_active', 'membership_plan_id', 'membership_expires_at', 'updated_at']],
    ['points_ledger', mapPointsLedger(contentStore), ['id', 'profile_id', 'delta', 'kind', 'source_id', 'title', 'created_at']],
    ['points_task_claims', mapPointsTaskClaims(contentStore), ['id', 'profile_id', 'task_id', 'source_id', 'claimed_at']],
    ['reward_redemptions', mapRewardRedemptions(contentStore), ['id', 'profile_id', 'reward_id', 'title', 'cost', 'created_at']],
    ['membership_orders', mapMembershipOrders(contentStore), ['id', 'profile_id', 'plan_id', 'created_at', 'expires_at', 'status']],
    ['template_filters', mapTemplateFilters(contentStore), ['id', 'name', 'sort_order', 'status']],
    ['templates', mapTemplates(contentStore), ['id', 'filter_id', 'title', 'meta', 'cost', 'image_url', 'status', 'sort_order']],
    ['question_bank', mapQuestionBank(adminStore), ['id', 'content', 'type', 'difficulty', 'template', 'risk_level', 'status', 'created_at', 'updated_at']],
    ['share_assets', mapShareAssets(adminStore), ['id', 'name', 'asset_type', 'scene', 'image_url', 'open_count', 'return_count', 'status', 'created_at', 'updated_at']],
    ['tools_catalog', mapToolsCatalog(adminStore), ['id', 'name', 'category', 'target', 'image_url', 'usage_count', 'favorite_count', 'status', 'sort_order', 'is_hot', 'placement']],
    ['membership_plans', mapMembershipPlans(adminStore), ['id', 'name', 'price', 'duration', 'conversion_rate', 'renew_rate', 'status', 'sort_order']],
    ['membership_benefits', mapMembershipBenefits(adminStore), ['id', 'name', 'scope', 'status', 'note', 'sort_order']],
    ['admin_users', mapAdminUsers(adminStore), ['id', 'username', 'password_hash', 'name', 'role_id', 'status', 'last_login_at']],
    ['admin_roles', mapAdminRoles(adminStore), ['id', 'name', 'scope', 'permissions_json', 'status']],
    ['admin_sessions', mapAdminSessions(adminStore), ['token_hash', 'user_id', 'expires_at', 'created_at']],
    ['admin_operation_logs', mapAdminOperationLogs(adminStore), ['id', 'operator_id', 'action', 'target_type', 'target_id', 'detail', 'created_at']],
    ['analytics_events', mapAnalyticsEvents(adminStore), ['id', 'type', 'profile_id', 'report_id', 'asset_id', 'tool_id', 'meta_json', 'created_at']],
    ['assets', mapAssets(), ['id', 'category', 'file_name', 'url', 'mime_type', 'size', 'source', 'created_at']],
  ]

  const synced = {}
  const pruned = {}
  for (const [table, rows, columns] of tasks) {
    synced[table] = await upsertMany(pool, table, rows, columns)
    pruned[table] = await pruneMissingRows(pool, table, rows, columns[0])
    logger.log(`[normalized-db] synced ${synced[table]} rows into ${table}; pruned ${pruned[table]} stale rows`)
  }

  return {
    pruned,
    schema,
    synced,
  }
}

module.exports = {
  ensureNormalizedSchema,
  syncNormalizedTables,
}
