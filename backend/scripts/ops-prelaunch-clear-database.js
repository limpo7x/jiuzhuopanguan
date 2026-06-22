#!/usr/bin/env node

require('../load-env')

const fs = require('fs')
const path = require('path')
const { ensureMysqlPool } = require('../data/store-accessor')

const stamp = process.env.PRELAUNCH_CLEAR_STAMP || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
const outDir = process.env.PRELAUNCH_CLEAR_OUT_DIR || path.join('/www/backup/jiuzhuopanguan', `prelaunch-clear-exec-${stamp}`)
const dataDir = path.join(__dirname, '..', 'data')
const storeFiles = [
  'admin-store.json',
  'asset-manifest.json',
  'content-store.json',
  'moments-store.json',
  'social-store.json',
]

const assertTargetDatabase = () => {
  const database = String(process.env.MYSQL_DATABASE || '').trim()
  if (database !== 'jiuzhuopanguan') {
    throw new Error(`refuse to clear unexpected database: ${database}`)
  }
}

const copyIfExists = (from, to) => {
  if (!fs.existsSync(from)) {
    return false
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  return true
}

const listTables = async (pool) => {
  const [rows] = await pool.query(
    'SELECT TABLE_NAME AS tableName FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME',
  )
  return rows.map((row) => String(row.tableName || '')).filter((name) => /^[A-Za-z0-9_]+$/.test(name))
}

const countTables = async (pool, tables) => {
  const counts = {}
  for (const table of tables) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM \`${table}\``)
    counts[table] = Number(rows?.[0]?.count) || 0
  }
  return counts
}

const main = async () => {
  assertTargetDatabase()
  fs.mkdirSync(outDir, { recursive: true })
  const mirrorDir = path.join(outDir, 'file-mirrors-before-clear')
  const copiedMirrors = []
  for (const fileName of storeFiles) {
    const source = path.join(dataDir, fileName)
    const copied = copyIfExists(source, path.join(mirrorDir, fileName))
    if (copied) {
      copiedMirrors.push(fileName)
    }
  }

  const pool = await ensureMysqlPool()
  const [[databaseRow]] = await pool.query('SELECT DATABASE() AS db')
  const tables = await listTables(pool)
  const before = await countTables(pool, tables)
  await pool.query('SET FOREIGN_KEY_CHECKS = 0')
  for (const table of tables) {
    await pool.query(`TRUNCATE TABLE \`${table}\``)
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1')
  const after = await countTables(pool, tables)
  await pool.end()

  const removedMirrors = []
  for (const fileName of storeFiles) {
    const source = path.join(dataDir, fileName)
    if (fs.existsSync(source)) {
      fs.unlinkSync(source)
      removedMirrors.push(fileName)
    }
  }

  const report = {
    after,
    before,
    copiedMirrors,
    database: databaseRow?.db || '',
    ok: Object.values(after).every((count) => count === 0),
    outDir,
    removedMirrors,
    tables,
  }
  fs.writeFileSync(path.join(outDir, 'clear-report.json'), JSON.stringify(report, null, 2), 'utf8')
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
