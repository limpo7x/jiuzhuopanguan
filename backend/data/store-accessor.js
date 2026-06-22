const fs = require('fs')
const path = require('path')

const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306)
const MYSQL_TABLE = process.env.MYSQL_STORE_TABLE || 'app_store'
const FILE_MIRROR_ENABLED = process.env.STORE_FILE_MIRROR !== '0'

let mysqlModule = null
let pool = null
let schemaReadyPromise = null
let normalizedSyncPromise = Promise.resolve()

const NORMALIZED_WRITE_KEYS = new Set([
  'admin_store',
  'asset_manifest',
  'content_store',
  'moments_store',
  'social_store',
])

const isMySQLEnabled = () =>
  Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE)

const ensureDirForFile = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

const getNormalizedWriteScopes = () =>
  String(process.env.NORMALIZED_DB_WRITE || '')
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)

const shouldSyncNormalizedWrite = (key) => {
  if (!isMySQLEnabled() || !NORMALIZED_WRITE_KEYS.has(key)) {
    return false
  }
  const scopes = getNormalizedWriteScopes()
  return scopes.includes('all') || scopes.includes('shadow') || scopes.includes(key) || scopes.includes(key.replace(/_store$/, ''))
}

const syncNormalizedAfterWrite = async (key) => {
  if (!shouldSyncNormalizedWrite(key)) {
    return
  }
  normalizedSyncPromise = normalizedSyncPromise
    .catch(() => null)
    .then(async () => {
      const { syncNormalizedTables } = require('./normalized-db')
      await syncNormalizedTables({
        logger: {
          log: (message) => {
            if (process.env.NORMALIZED_DB_WRITE_LOG === '1') {
              console.log(`[normalized-db-write:${key}] ${message}`)
            }
          },
        },
      })
    })
  await normalizedSyncPromise
}

const ensureMysqlPool = async () => {
  if (!isMySQLEnabled()) {
    return null
  }
  if (!mysqlModule) {
    mysqlModule = require('mysql2/promise')
  }
  if (!pool) {
    pool = mysqlModule.createPool({
      charset: 'utf8mb4',
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      database: process.env.MYSQL_DATABASE,
      host: process.env.MYSQL_HOST,
      password: process.env.MYSQL_PASSWORD || '',
      port: MYSQL_PORT,
      user: process.env.MYSQL_USER,
    })
  }
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS \`${MYSQL_TABLE}\` (
        store_key VARCHAR(64) NOT NULL PRIMARY KEY,
        data_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `)
  }
  await schemaReadyPromise
  return pool
}

const createStoreAccessor = ({ createDefaultStore, filePath, key, normalizeStore }) => {
  let cache = null
  let initPromise = null
  let pendingWrite = Promise.resolve()

  const loadFromFile = () => {
    ensureDirForFile(filePath)
    if (!fs.existsSync(filePath)) {
      const initial = normalizeStore(createDefaultStore())
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8')
      return initial
    }
    try {
      return normalizeStore(JSON.parse(fs.readFileSync(filePath, 'utf8')))
    } catch {
      const fallback = normalizeStore(createDefaultStore())
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8')
      return fallback
    }
  }

  const writeFileMirror = (store) => {
    if (!FILE_MIRROR_ENABLED) {
      return
    }
    ensureDirForFile(filePath)
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf8')
  }

  const persistToMySQL = async (store) => {
    const mysqlPool = await ensureMysqlPool()
    if (!mysqlPool) {
      return store
    }
    await mysqlPool.query(
      `INSERT INTO \`${MYSQL_TABLE}\` (store_key, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(store)],
    )
    await syncNormalizedAfterWrite(key)
    return store
  }

  const queuePersist = (store) => {
    pendingWrite = pendingWrite
      .catch(() => null)
      .then(() => persistToMySQL(store))
      .catch((error) => {
        console.error(`[store-accessor] persist failed for ${key}:`, error)
      })
    return pendingWrite
  }

  const init = async () => {
    if (initPromise) {
      return initPromise
    }
    initPromise = (async () => {
      const fileStore = loadFromFile()
      if (!isMySQLEnabled()) {
        cache = fileStore
        return cache
      }

      const mysqlPool = await ensureMysqlPool()
      const [rows] = await mysqlPool.query(`SELECT data_json FROM \`${MYSQL_TABLE}\` WHERE store_key = ? LIMIT 1`, [key])
      if (Array.isArray(rows) && rows[0] && rows[0].data_json) {
        cache = normalizeStore(JSON.parse(rows[0].data_json))
        writeFileMirror(cache)
        return cache
      }

      cache = fileStore
      await persistToMySQL(cache)
      return cache
    })()
    return initPromise
  }

  const read = () => {
    if (!cache) {
      cache = loadFromFile()
    }
    return cache
  }

  const write = (store) => {
    const normalized = normalizeStore(store)
    cache = normalized
    writeFileMirror(normalized)
    if (isMySQLEnabled()) {
      queuePersist(normalized)
    }
    return normalized
  }

  const flush = async () => {
    await pendingWrite
  }

  return {
    flush,
    init,
    read,
    write,
  }
}

module.exports = {
  createStoreAccessor,
  ensureMysqlPool,
  isMySQLEnabled,
}
