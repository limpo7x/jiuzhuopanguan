const fs = require('fs')
const path = require('path')

const backendDir = path.resolve(__dirname, '..')
const adminDir = path.join(backendDir, 'public', 'admin', 'static', 'heatwave-ops')
const appPath = path.join(adminDir, 'app.js')
const stylesPath = path.join(adminDir, 'styles.css')
const generatePath = path.join(adminDir, 'generate.js')
const expectedVersion = '20260615-admin-action-dialogs'
const oldVersion = '20260611-admin-pagination-2'

const read = (filePath) => fs.readFileSync(filePath, 'utf8')

const failures = []
const assert = (condition, message) => {
  if (!condition) {
    failures.push(message)
  }
}

const appSource = read(appPath)
const stylesSource = read(stylesPath)
const generateSource = read(generatePath)

assert(!appSource.includes('window.prompt('), 'admin row actions must not use window.prompt')
assert(!appSource.includes('window.confirm('), 'admin actions must not use window.confirm')
assert(appSource.includes('requestActionReason'), 'admin app must expose requestActionReason')
assert(appSource.includes('requestActionConfirm'), 'admin app must expose requestActionConfirm')
assert(appSource.includes('data-role="reason-input"'), 'reason dialog textarea missing')
assert(appSource.includes('data-action="reason-confirm"'), 'reason dialog confirm action missing')
assert(appSource.includes('data-role="confirm-dialog"'), 'confirm dialog missing')
assert(appSource.includes('data-action="confirm-ok"'), 'confirm dialog ok action missing')
assert(stylesSource.includes('.reason-dialog'), 'reason dialog style missing')
assert(stylesSource.includes('.confirm-dialog'), 'confirm dialog style missing')
assert(!generateSource.includes(oldVersion), 'generate.js still references old static asset version')
assert(generateSource.includes(expectedVersion), 'generate.js missing expected static asset version')

const shellHtmlFiles = fs
  .readdirSync(adminDir)
  .filter((fileName) => fileName.endsWith('.html') && !['index.html', 'ui-kit.html'].includes(fileName))
const htmlFiles = fs.readdirSync(adminDir).filter((fileName) => fileName.endsWith('.html'))
htmlFiles.forEach((fileName) => {
  const source = read(path.join(adminDir, fileName))
  assert(!source.includes(oldVersion), `${fileName} still references old static asset version`)
})
shellHtmlFiles.forEach((fileName) => {
  const source = read(path.join(adminDir, fileName))
  assert(source.includes(expectedVersion), `${fileName} missing expected static asset version`)
})

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2))
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checkedHtmlFiles: htmlFiles.length,
      checkedShellHtmlFiles: shellHtmlFiles.length,
      expectedVersion,
    },
    null,
    2,
  ),
)
