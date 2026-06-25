const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'miniprogram', 'app.json'), 'utf8'))
const pages = [
  ...appJson.pages,
  ...(appJson.subPackages || []).flatMap((pkg) => (pkg.pages || []).map((page) => `${pkg.root}/${page}`)),
]
const results = []

for (const page of pages) {
  const url = `/${page}`
  const run = childProcess.spawnSync(
    process.execPath,
    ['scripts/wechat-devtools-automator.js', 'relaunch', '--path', url, '--wait', '400'],
    {
      cwd: root,
      encoding: 'utf8',
      timeout: 20000,
    },
  )

  let parsed = null
  try {
    parsed = JSON.parse(run.stdout || '{}')
  } catch {}

  results.push({
    page,
    ok: run.status === 0 && parsed && parsed.ok === true,
    status: run.status,
    error: parsed && parsed.error ? parsed.error : (run.stderr || '').trim().slice(0, 500),
  })
}

const failed = results.filter((item) => !item.ok)
console.log(JSON.stringify({ ok: failed.length === 0, failed, results }, null, 2))
process.exit(failed.length ? 1 : 0)
