#!/usr/bin/env node

require('../load-env')

const mysql = require('mysql2/promise')

const expectedTables = [
  'users',
  'user_sessions',
  'user_login_logs',
  'friendships',
  'poke_threads',
  'wine_sessions',
  'wine_session_members',
  'wine_reports',
  'moment_records',
  'session_events',
  'session_briefs',
  'share_image_tasks',
  'moment_reports',
  'moment_nominations',
  'ranking_reward_rules',
  'ranking_reward_payouts',
  'points_tasks',
  'points_rewards',
  'user_commerce_states',
  'points_ledger',
  'points_task_claims',
  'reward_redemptions',
  'membership_orders',
  'template_filters',
  'templates',
  'question_bank',
  'share_assets',
  'tools_catalog',
  'membership_plans',
  'membership_benefits',
  'admin_users',
  'admin_roles',
  'admin_sessions',
  'admin_operation_logs',
  'analytics_events',
  'assets',
]

const requiredNonZeroTables = [
  'users',
  'wine_sessions',
  'wine_session_members',
  'wine_reports',
  'moment_records',
  'session_briefs',
  'share_image_tasks',
  'admin_users',
  'assets',
]

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
    const result = {}
    for (const table of expectedTables) {
      const [existsRows] = await connection.query(
        'SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [database, table],
      )
      if (!existsRows[0].c) {
        result[table] = { exists: false, rows: null }
        continue
      }
      const [countRows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${table}\``)
      result[table] = { exists: true, rows: Number(countRows[0].c) || 0 }
    }
    const missing = Object.entries(result)
      .filter(([, value]) => !value.exists)
      .map(([table]) => table)
    const emptyRequired = requiredNonZeroTables.filter((table) => result[table]?.exists && result[table].rows <= 0)
    const report = {
      ok: missing.length === 0 && emptyRequired.length === 0,
      database,
      emptyRequired,
      missing,
      tables: result,
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
