const fs = require('fs')
const path = require('path')

const root = process.cwd()
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'miniprogram', 'app.json'), 'utf8'))
const pageFiles = appJson.pages.flatMap((page) => {
  const base = path.join(root, 'miniprogram', page)
  return ['.wxml', '.less', '.ts', '.json']
    .map((ext) => `${base}${ext}`)
    .filter((file) => fs.existsSync(file))
})

const componentDir = path.join(root, 'miniprogram', 'components')
const styleFile = path.join(root, 'miniprogram', 'styles', 'party-pop-clean.less')
const appLess = path.join(root, 'miniprogram', 'app.less')

const walk = (dir) => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return /\.(wxml|less|ts|json)$/.test(entry.name) ? [full] : []
  })
}

const files = [...new Set([...pageFiles, ...walk(componentDir), styleFile, appLess])]

const unicode = {
  oldBrand: '\u9152\u684c\u5224\u5b98',
  judge: '\u5224\u5b98',
  penalty: '\u60e9\u7f5a',
  report: '\u6218\u62a5',
  player: '\u73a9\u5bb6',
}

const forbidden = [
  /party-recorder-rebuild/,
  /party-recorder-v2/,
  /pr-stage-bg/,
  /bindtap="\{\{/,
  /\{\{(?:true|false)\}"/,
  /="\{\{[^}]*"[^}]*\}\}"/,
  /\|\| "/,
  /&& "/,
  new RegExp(unicode.oldBrand),
  new RegExp(unicode.judge),
  new RegExp(unicode.penalty),
  new RegExp(unicode.report),
  new RegExp(unicode.player),
]

const ignored = [
  /party-pop-clean\.less/,
  /components[\\/]pp-dialog[\\/]/,
]

const failures = []

for (const page of appJson.pages) {
  const wxmlFile = path.join(root, 'miniprogram', `${page}.wxml`)
  const jsonFile = path.join(root, 'miniprogram', `${page}.json`)
  const wxml = fs.readFileSync(wxmlFile, 'utf8')
  const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
  if (!wxml.includes('<pp-dialog')) {
    failures.push(`${path.relative(root, wxmlFile)}: missing pp-dialog host`)
  }
  if (!wxml.includes('toast="{{__ppToast}}"') || !wxml.includes('loading="{{__ppLoading}}"')) {
    failures.push(`${path.relative(root, wxmlFile)}: missing pp-dialog toast/loading bindings`)
  }
  if (!json.usingComponents || json.usingComponents['pp-dialog'] !== '/components/pp-dialog/pp-dialog') {
    failures.push(`${path.relative(root, jsonFile)}: missing pp-dialog component registration`)
  }
}

for (const file of files) {
  const rel = path.relative(root, file)
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const pattern of forbidden) {
      if (!pattern.test(line)) continue
      if (ignored.some((allow) => allow.test(rel))) continue
      failures.push(`${rel}:${index + 1}: ${line.trim()}`)
    }
  })
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`party-pop-clean scan passed: ${files.length} files`)
