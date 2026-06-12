const fs = require('fs')
const path = require('path')
const roots = process.argv.slice(2)
const scanRoots = roots.length ? roots : ['miniprogram', 'backend/data', 'backend/public/admin/static/heatwave-ops']
const exts = new Set(['.ts', '.js', '.wxml', '.less', '.json', '.wxss', '.html'])
const mojibakeChars = [0xfffd,0x20ac].map((code) => String.fromCharCode(code))
const mojibakePattern = /(?:鍏|鍥|寮€|閰|璁|绠|鍒|寰|鏈|瀛|宸|鏂|鏉|鏃|闂|鐢|瀹|杩|浠|绋|搴|妗|娑|鐜|鏄|閭|涓|丬|闆|鐨|姝|鏍|瑙|唤)/
const files = []
const walk = (target) => {
  if (!fs.existsSync(target)) return
  const stat = fs.statSync(target)
  if (stat.isFile()) {
    if (exts.has(path.extname(target))) files.push(target)
    return
  }
  for (const name of fs.readdirSync(target)) walk(path.join(target, name))
}
scanRoots.forEach(walk)
const offenders = []
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const entityPattern = /\.(?:wxml|html)$/.test(file) ? /&#\d+;/ : null
  const bad = mojibakeChars.some((char) => text.includes(char)) || mojibakePattern.test(text) || /\?{3,}/.test(text) || Boolean(entityPattern?.test(text))
  if (bad) {
    const lineNumber = text.split(/\r?\n/).findIndex((line) => mojibakeChars.some((char) => line.includes(char)) || mojibakePattern.test(line) || /\?{3,}/.test(line) || Boolean(entityPattern?.test(line))) + 1
    const line = text.split(/\r?\n/)[lineNumber - 1] || ''
    const match = line.match(mojibakePattern) || line.match(/\?{3,}/) || line.match(/&#\d+;/) || mojibakeChars.find((char) => line.includes(char))
    offenders.push({ file, lineNumber, match: Array.isArray(match) ? match[0] : match })
  }
}
if (offenders.length) {
  console.error('Encoding suspect files:')
  offenders.forEach(({ file, lineNumber, match }) => console.error(` - ${file}:${lineNumber} ${match || ''}`))
  process.exit(1)
}
console.log('Encoding check passed')
