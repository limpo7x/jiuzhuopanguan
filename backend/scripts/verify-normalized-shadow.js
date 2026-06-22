#!/usr/bin/env node

require('../load-env')

const mysql = require('mysql2/promise')

const appStoreKeys = ['social_store', 'admin_store', 'moments_store', 'content_store', 'asset_manifest']

const asArray = (value) => (Array.isArray(value) ? value : [])
const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const hasText = (value) => String(value || '').trim().length > 0
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

const parseJson = (value, key) => {
  if (!value) {
    return {}
  }
  try {
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch (error) {
    throw new Error(`failed to parse app_store ${key}: ${error.message}`)
  }
}

const countRows = async (connection, table) => {
  const [rows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${table}\``)
  return Number(rows[0]?.c) || 0
}

const readAppStore = async (connection) => {
  const [rows] = await connection.query(
    'SELECT store_key, data_json FROM `app_store` WHERE store_key IN (?, ?, ?, ?, ?)',
    appStoreKeys,
  )
  const stores = {}
  for (const row of rows) {
    stores[row.store_key] = parseJson(row.data_json, row.store_key)
  }
  for (const key of appStoreKeys) {
    if (!stores[key]) {
      stores[key] = {}
    }
  }
  return stores
}

const countCommerceValues = (contentStore, field) =>
  Object.values(asObject(contentStore.userCommerce)).reduce((total, item) => total + asArray(item?.[field]).length, 0)

const countTaskClaims = (contentStore) =>
  Object.values(asObject(contentStore.userCommerce)).reduce((total, item) => {
    const taskStates = asObject(item?.taskStates)
    return total + Object.values(taskStates).filter((state) => state && state.claimedAt).length
  }, 0)

const expectedCounts = ({ admin_store: adminStore, asset_manifest: assetManifest, content_store: contentStore, moments_store: momentsStore, social_store: socialStore }) => ({
  users: asArray(socialStore.profiles).filter((item) => hasText(item?.id)).length,
  user_sessions: asArray(socialStore.userSessions).filter((item) => hasText(item?.token) && hasText(item?.profileId)).length,
  user_login_logs: asArray(socialStore.loginLogs).length,
  friendships: asArray(socialStore.friendships).filter((item, index) => hasText(item?.id) || hasText(safeId('friendship', item?.ownerId, item?.friendId, index))).length,
  poke_threads: asArray(socialStore.pokes).filter((item, index) => hasText(item?.id) || hasText(safeId('poke', item?.senderId, item?.receiverId, index))).length,
  wine_sessions: asArray(adminStore.liveSessions).length,
  wine_session_members: asArray(adminStore.liveSessions).reduce(
    (total, session) => total + asArray(session?.members).filter((member, index) => hasText(session?.id) && (hasText(member?.id) || hasText(safeId('session-member', session?.id, member?.profileId || member?.name || index)))).length,
    0,
  ),
  wine_reports: asArray(adminStore.reports).length,
  moment_records: asArray(momentsStore.momentRecords).filter((item) => hasText(item?.id) && hasText(item?.sessionId) && hasText(item?.uploaderProfileId)).length,
  session_events: asArray(momentsStore.sessionEvents).filter((item) => hasText(item?.id) && hasText(item?.sessionId) && hasText(item?.operatorProfileId)).length,
  session_briefs: asArray(momentsStore.sessionBriefs).filter((item) => hasText(item?.id) || hasText(item?.sessionId)).length,
  share_image_tasks: asArray(momentsStore.shareImageTasks).filter((item) => hasText(item?.id)).length,
  moment_reports: asArray(momentsStore.momentReports).filter((item) => hasText(item?.id)).length,
  moment_nominations: asArray(momentsStore.momentNominations).filter((item) => hasText(item?.id)).length,
  ranking_reward_rules: asArray(momentsStore.rankingRewardRules || adminStore.rankingRewardRules).filter((item) => hasText(item?.id)).length,
  ranking_reward_payouts: asArray(momentsStore.rankingRewardPayouts).filter((item) => hasText(item?.id)).length,
  points_tasks: asArray(contentStore.pointsConfig?.tasks).filter((item) => hasText(item?.id)).length,
  points_rewards: asArray(contentStore.pointsConfig?.rewards).filter((item) => hasText(item?.id)).length,
  user_commerce_states: Object.keys(asObject(contentStore.userCommerce)).length,
  points_ledger: countCommerceValues(contentStore, 'pointsLedger'),
  points_task_claims: countTaskClaims(contentStore),
  reward_redemptions: countCommerceValues(contentStore, 'rewardRedemptions'),
  membership_orders: countCommerceValues(contentStore, 'membershipOrders'),
  template_filters: asArray(contentStore.templateConfig?.filters).filter((item) => hasText(item?.id)).length,
  templates: asArray(contentStore.templateConfig?.templates).filter((item) => hasText(item?.id)).length,
  question_bank: asArray(adminStore.questionBank).filter((item) => hasText(item?.id)).length,
  share_assets: asArray(adminStore.shareAssets).filter((item) => hasText(item?.id)).length,
  tools_catalog: asArray(adminStore.toolsCatalog).filter((item) => hasText(item?.id)).length,
  membership_plans: asArray(adminStore.membershipPlans).filter((item) => hasText(item?.id)).length,
  membership_benefits: asArray(adminStore.membershipBenefits).filter((item) => hasText(item?.id)).length,
  admin_users: asArray(adminStore.adminUsers).filter((item) => hasText(item?.id) && hasText(item?.username) && hasText(item?.passwordHash)).length,
  admin_roles: asArray(adminStore.roles).filter((item) => hasText(item?.id)).length,
  admin_sessions: asArray(adminStore.sessions).filter((item) => hasText(item?.token) && hasText(item?.userId || item?.user?.id)).length,
  admin_operation_logs: asArray(adminStore.operationLogs).filter((item) => hasText(item?.id)).length,
  analytics_events: asArray(adminStore.analyticsEvents).filter((item) => hasText(item?.id)).length,
  assets: asArray(assetManifest.uploads).filter((item) => hasText(item?.id)).length,
})

const main = async () => {
  const database = process.env.MYSQL_DATABASE
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !database) {
    throw new Error('MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE are required')
  }
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || '',
    database,
    port: Number(process.env.MYSQL_PORT || 3306),
  })
  try {
    const stores = await readAppStore(connection)
    const expected = expectedCounts(stores)
    const tables = {}
    const mismatches = []
    for (const [table, expectedRows] of Object.entries(expected)) {
      const actualRows = await countRows(connection, table)
      tables[table] = { actualRows, expectedRows }
      if (actualRows !== expectedRows) {
        mismatches.push({ actualRows, expectedRows, table })
      }
    }
    const report = {
      ok: mismatches.length === 0,
      database,
      checkedTables: Object.keys(tables).length,
      mismatches,
      tables,
    }
    console.log(JSON.stringify(report, null, 2))
    if (!report.ok) {
      process.exit(1)
    }
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
