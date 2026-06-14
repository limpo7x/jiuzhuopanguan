require('../load-env')

const { initAssetsManifest } = require('../data/assets')
const { initContentStore } = require('../data/content')
const { initSocialStore } = require('../data/social')
const { initAdminStore } = require('../data/admin')
const { syncNormalizedTables } = require('../data/normalized-db')

const main = async () => {
  await Promise.all([initContentStore(), initSocialStore(), initAdminStore(), initAssetsManifest()])
  const result = await syncNormalizedTables()
  console.log('[normalized-db] schema statements:', result.schema.statements)
  console.log('[normalized-db] done')
  process.exit(0)
}

main().catch((error) => {
  console.error('[normalized-db] failed:', error)
  process.exitCode = 1
})
