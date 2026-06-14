const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { ensureMysqlPool, isMySQLEnabled } = require('./store-accessor')
const { getAdminStore } = require('./admin')
const { listAdminAssets } = require('./assets')
const { readContentStore } = require('./content')
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
  return { enabled: true, statements: statements.length }
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
    template_id: text(item.templateId),
    template_name: text(item.template),
    player_count: number(item.players || (item.members || []).length),
    state: text(item.state),
    status: text(item.status),
    source: text(item.source),
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
      meta_json: json(member.meta || {}),
      created_at: toDate(member.createdAt || session.createdAt),
      updated_at: toDate(member.updatedAt || session.updatedAt),
    })).filter((item) => item.id && item.session_id),
  )

const mapWineReports = (adminStore) =>
  (adminStore.reports || []).map((item, index) => ({
    id: text(item.id) || safeId('report', index),
    session_id: text(item.sessionId),
    profile_id: text(item.profileId || item.hostProfileId),
    template_name: text(item.template || item.templateName),
    title: text(item.title || item.name),
    scene: text(item.scene),
    highlight1: text(item.highlight1),
    highlight2: text(item.highlight2),
    highlight3: text(item.highlight3),
    view_count: number(item.viewCount),
    share_count: number(item.shareCount),
    replay_count: number(item.replayCount),
    status: text(item.status),
    created_at: toDate(item.createdAt),
  })).filter((item) => item.id)

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

  const tasks = [
    ['users', mapUsers(socialStore), ['id', 'wechat_open_id', 'wechat_union_id', 'phone', 'name', 'avatar_url', 'signature', 'identity_tag', 'login_count', 'last_login_at', 'created_at', 'updated_at']],
    ['user_sessions', mapUserSessions(socialStore), ['token_hash', 'user_id', 'expires_at', 'created_at']],
    ['user_login_logs', mapUserLoginLogs(socialStore), ['id', 'user_id', 'wechat_open_id', 'phone', 'source', 'login_at']],
    ['friendships', mapFriendships(socialStore), ['id', 'owner_id', 'friend_id', 'alias', 'meta_json', 'updated_at']],
    ['poke_threads', mapPokeThreads(socialStore), ['id', 'sender_id', 'receiver_id', 'status', 'created_at', 'updated_at']],
    ['wine_sessions', mapWineSessions(adminStore), ['id', 'invite_code', 'host_profile_id', 'name', 'template_id', 'template_name', 'player_count', 'state', 'status', 'source', 'started_at', 'ended_at', 'created_at', 'updated_at']],
    ['wine_session_members', mapWineSessionMembers(adminStore), ['id', 'session_id', 'profile_id', 'name', 'avatar_url', 'phone', 'is_host', 'status', 'debt_count', 'drink_count', 'cleared_count', 'meta_json', 'created_at', 'updated_at']],
    ['wine_reports', mapWineReports(adminStore), ['id', 'session_id', 'profile_id', 'template_name', 'title', 'scene', 'highlight1', 'highlight2', 'highlight3', 'view_count', 'share_count', 'replay_count', 'status', 'created_at']],
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
  for (const [table, rows, columns] of tasks) {
    synced[table] = await upsertMany(pool, table, rows, columns)
    logger.log(`[normalized-db] synced ${synced[table]} rows into ${table}`)
  }

  return {
    schema,
    synced,
  }
}

module.exports = {
  ensureNormalizedSchema,
  syncNormalizedTables,
}
