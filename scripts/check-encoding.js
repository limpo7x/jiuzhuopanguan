const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOTS = ['miniprogram', 'backend']
const TEXT_EXTENSIONS = new Set(['.ts', '.js', '.wxml', '.json', '.less'])
const JS_EXTENSIONS = new Set(['.js'])

const FATAL_TEXT_PATTERNS = [
  { name: 'replacement character', pattern: /\uFFFD/ },
  { name: 'nul byte', pattern: /\u0000/ },
]

const BROKEN_STRING_PATTERNS = [
  { name: 'unterminated mojibake placeholder', pattern: /['"`][^'"`\r\n]*(?:寰俊|鏈櫥|閰掑弸|鍥剧墖|鐢熸垚|绉垎|妯℃澘|涓嬩竴)[^'"`\r\n]*$/ },
  { name: 'trailing mojibake question mark', pattern: /(?:寰俊|鏈櫥|閰掑弸|鍥剧墖|鐢熸垚|绉垎|妯℃澘|涓嬩竴)[^'"`\r\n]*\?\s*$/ },
]

const files = []

const walk = (dir) => {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist') {
      continue
    }
    const target = path.join(dir, name)
    const stat = fs.statSync(target)
    if (stat.isDirectory()) {
      walk(target)
      continue
    }
    if (TEXT_EXTENSIONS.has(path.extname(target))) {
      files.push(target)
    }
  }
}

ROOTS.forEach(walk)

const failures = []

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)

  for (const rule of FATAL_TEXT_PATTERNS) {
    if (rule.pattern.test(text)) {
      failures.push(`${file}: ${rule.name}`)
    }
  }

  lines.forEach((line, index) => {
    for (const rule of BROKEN_STRING_PATTERNS) {
      if (rule.pattern.test(line)) {
        failures.push(`${file}:${index + 1}: ${rule.name}: ${line.trim()}`)
      }
    }

    if (path.extname(file) === '.wxml') {
      if (/\?\s*\/\s*(text|view|button|block|scroll-view|navigation-bar)>/.test(line)) {
        failures.push(`${file}:${index + 1}: damaged WXML closing tag: ${line.trim()}`)
      }
      if (/(aria-label|class|wx:if|style|src)="[^"]*$/.test(line)) {
        failures.push(`${file}:${index + 1}: unterminated WXML attribute: ${line.trim()}`)
      }
      const expressions = line.match(/\{\{[^}]*\}\}/g) || []
      expressions.forEach((expression) => {
        const singleQuotes = (expression.match(/'/g) || []).length
        const doubleQuotes = (expression.match(/"/g) || []).length
        if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
          failures.push(`${file}:${index + 1}: odd quote count in WXML expression: ${line.trim()}`)
        }
      })
    }
  })
}

for (const file of files.filter((item) => JS_EXTENSIONS.has(path.extname(item)))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) {
    failures.push(`${file}: JS syntax check failed\n${result.stderr || result.stdout}`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`encoding guard passed: ${files.length} files checked`)
