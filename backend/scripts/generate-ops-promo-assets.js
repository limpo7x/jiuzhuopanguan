const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const repoRoot = path.resolve(__dirname, '..', '..')
const outputDir = path.join(repoRoot, 'docs', 'design-assets', 'party-recorder', 'ops-promo-20260622')

const posterBgSource = process.argv[2]
const leafletBgSource = process.argv[3]

if (!posterBgSource || !leafletBgSource) {
  console.error('Usage: node backend/scripts/generate-ops-promo-assets.js <posterBg> <leafletBg>')
  process.exit(1)
}

const qrPath = path.join(repoRoot, 'backend', 'public', 'static', 'share-poster-miniapp-code.png')
const posterBgPath = path.join(outputDir, 'party-recorder-ops-poster-bg.png')
const leafletBgPath = path.join(outputDir, 'party-recorder-mobile-leaflet-bg.png')
const posterOut = path.join(outputDir, 'party-recorder-ops-poster-1080x1920.png')
const leafletOut = path.join(outputDir, 'party-recorder-mobile-leaflet-750x1624.png')
const posterSvgOut = path.join(outputDir, 'party-recorder-ops-poster-1080x1920.svg')
const leafletSvgOut = path.join(outputDir, 'party-recorder-mobile-leaflet-750x1624.svg')
const readmeOut = path.join(outputDir, 'README.md')

fs.mkdirSync(outputDir, { recursive: true })
fs.copyFileSync(posterBgSource, posterBgPath)
fs.copyFileSync(leafletBgSource, leafletBgPath)

function pngDataUri(filePath) {
  return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function textLines(lines, x, y, options = {}) {
  const {
    size = 42,
    weight = 700,
    fill = '#fff',
    lineHeight = Math.round(size * 1.25),
    anchor = 'start',
    family = '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", Arial, sans-serif',
    opacity = 1,
  } = options
  return lines.map((line, index) => {
    const dy = index === 0 ? 0 : lineHeight
    return `<text x="${x}" y="${y + dy}" text-anchor="${anchor}" font-family="${escapeXml(family.replaceAll('"', ''))}" font-size="${size}" font-weight="${weight}" fill="${fill}" opacity="${opacity}">${escapeXml(line)}</text>`
  }).join('\n')
}

function panel(x, y, w, h, radius = 34, fill = 'rgba(5,8,15,0.64)', stroke = 'rgba(255,255,255,0.16)') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
}

function svgShell(width, height, bgHref, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#03040a" stop-opacity="0.82"/>
      <stop offset="0.42" stop-color="#03040a" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#03040a" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14f1ff"/>
      <stop offset="0.55" stop-color="#ff4d6d"/>
      <stop offset="1" stop-color="#c8ff4a"/>
    </linearGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.36"/>
    </filter>
  </defs>
  <image href="${escapeXml(bgHref)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  <rect width="${width}" height="${height}" fill="url(#fadeTop)"/>
  ${body}
</svg>`
}

function posterSvg() {
  const qrHref = pngDataUri(qrPath)
  const body = `
  <g filter="url(#softShadow)">
    ${panel(64, 72, 952, 420, 42, 'rgba(2,5,13,0.58)', 'rgba(20,241,255,0.34)')}
  </g>
  <text x="88" y="142" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="30" font-weight="800" fill="#c8ff4a" letter-spacing="3">PARTY MEMORY MINI PROGRAM</text>
  ${textLines(['聚会记录师'], 84, 270, { size: 104, weight: 900, fill: '#ffffff', lineHeight: 120 })}
  ${textLines(['三步开局，拍下第一张照片', '把今晚的笑点、照片和高光，留成可分享的回忆相册'], 90, 350, { size: 38, weight: 700, fill: '#eef8ff', lineHeight: 58 })}
  <rect x="88" y="432" width="314" height="56" rx="28" fill="url(#cta)"/>
  <text x="245" y="471" text-anchor="middle" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="27" font-weight="900" fill="#061018">扫码进入小程序</text>

  <g transform="translate(70 700)">
    ${panel(0, 0, 440, 380, 36, 'rgba(6,10,20,0.72)', 'rgba(255,255,255,0.18)')}
    <text x="36" y="72" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="35" font-weight="900" fill="#14f1ff">极速开局</text>
    ${textLines(['选择主题 / 人数 / 房间名', '三步内进入现场拍照'], 36, 134, { size: 30, weight: 700, fill: '#ffffff', lineHeight: 48 })}
    <text x="36" y="308" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="86" font-weight="900" fill="#ffffff" opacity="0.12">01</text>
  </g>
  <g transform="translate(570 808)">
    ${panel(0, 0, 440, 380, 36, 'rgba(6,10,20,0.72)', 'rgba(255,255,255,0.18)')}
    <text x="36" y="72" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="35" font-weight="900" fill="#ff6b7e">边玩边记</text>
    ${textLines(['照片、文字、账本和高光', '自动沉淀成聚会简报'], 36, 134, { size: 30, weight: 700, fill: '#ffffff', lineHeight: 48 })}
    <text x="36" y="308" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="86" font-weight="900" fill="#ffffff" opacity="0.12">02</text>
  </g>
  <g transform="translate(70 1210)">
    ${panel(0, 0, 440, 380, 36, 'rgba(6,10,20,0.72)', 'rgba(255,255,255,0.18)')}
    <text x="36" y="72" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="35" font-weight="900" fill="#c8ff4a">酷炫分享</text>
    ${textLines(['一键生成照片墙分享图', '让美好回忆继续发光'], 36, 134, { size: 30, weight: 700, fill: '#ffffff', lineHeight: 48 })}
    <text x="36" y="308" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="86" font-weight="900" fill="#ffffff" opacity="0.12">03</text>
  </g>

  <g transform="translate(640 1332)" filter="url(#softShadow)">
    <rect x="0" y="0" width="314" height="314" rx="36" fill="#fff"/>
    <image href="${qrHref}" x="26" y="26" width="262" height="262" preserveAspectRatio="xMidYMid meet"/>
    <text x="157" y="370" text-anchor="middle" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="30" font-weight="900" fill="#ffffff">扫码保存今晚的美好回忆</text>
    <text x="157" y="416" text-anchor="middle" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="24" font-weight="700" fill="#c9d4df">创建聚会 · 拍照记录 · 相册分享</text>
  </g>`
  return svgShell(1080, 1920, pngDataUri(posterBgPath), body)
}

function leafletSvg() {
  const qrHref = pngDataUri(qrPath)
  const body = `
  <g filter="url(#softShadow)">
    ${panel(38, 54, 674, 386, 34, 'rgba(2,5,13,0.62)', 'rgba(20,241,255,0.3)')}
  </g>
  <text x="62" y="116" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="22" font-weight="800" fill="#c8ff4a" letter-spacing="2">MINI PROGRAM</text>
  ${textLines(['聚会记录师'], 58, 226, { size: 72, weight: 900, fill: '#ffffff', lineHeight: 84 })}
  ${textLines(['保存美好回忆的年轻人聚会工具', '三步创建房间，马上拍下第一张照片'], 62, 292, { size: 28, weight: 700, fill: '#eef8ff', lineHeight: 44 })}

  <g transform="translate(42 526)">
    ${panel(0, 0, 666, 178, 30, 'rgba(5,9,18,0.72)', 'rgba(255,255,255,0.16)')}
    <text x="34" y="58" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="30" font-weight="900" fill="#14f1ff">01 三步开局</text>
    <text x="34" y="112" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="25" font-weight="700" fill="#ffffff">选主题、定人数、起房间名，直接进入邀请与拍照。</text>
  </g>
  <g transform="translate(42 734)">
    ${panel(0, 0, 666, 178, 30, 'rgba(5,9,18,0.72)', 'rgba(255,255,255,0.16)')}
    <text x="34" y="58" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="30" font-weight="900" fill="#ff6b7e">02 现场记录</text>
    <text x="34" y="112" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="25" font-weight="700" fill="#ffffff">照片、文字、高光瞬间和聚会账本，边玩边沉淀。</text>
  </g>
  <g transform="translate(42 942)">
    ${panel(0, 0, 666, 178, 30, 'rgba(5,9,18,0.72)', 'rgba(255,255,255,0.16)')}
    <text x="34" y="58" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="30" font-weight="900" fill="#c8ff4a">03 相册分享</text>
    <text x="34" y="112" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="25" font-weight="700" fill="#ffffff">生成酷炫分享图，把共同回忆带回群聊和朋友圈。</text>
  </g>

  <g transform="translate(54 1200)" filter="url(#softShadow)">
    <rect x="0" y="0" width="240" height="240" rx="30" fill="#fff"/>
    <image href="${qrHref}" x="20" y="20" width="200" height="200" preserveAspectRatio="xMidYMid meet"/>
  </g>
  <g transform="translate(330 1225)">
    <rect x="0" y="0" width="338" height="70" rx="35" fill="url(#cta)"/>
    <text x="169" y="46" text-anchor="middle" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="30" font-weight="900" fill="#061018">扫码立即体验</text>
    ${textLines(['让每一次聚会都有照片墙、', '简报和可分享回忆。'], 0, 112, { size: 23, weight: 700, fill: '#ffffff', lineHeight: 38 })}
    <text x="0" y="204" font-family='"Microsoft YaHei", "PingFang SC", Arial, sans-serif' font-size="20" font-weight="700" fill="#c9d4df">聚会记录 · 拍照上传 · 生成分享图</text>
  </g>`
  return svgShell(750, 1624, pngDataUri(leafletBgPath), body)
}

async function render(svgText, svgPath, pngPath, width, height) {
  fs.writeFileSync(svgPath, svgText, 'utf8')
  await sharp(Buffer.from(svgText))
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toFile(pngPath)
}

async function main() {
  await render(posterSvg(), posterSvgOut, posterOut, 1080, 1920)
  await render(leafletSvg(), leafletSvgOut, leafletOut, 750, 1624)

  fs.writeFileSync(readmeOut, `# 聚会记录师运维推广素材

生成日期：2026-06-22

## 文件

- party-recorder-ops-poster-1080x1920.png：运维推广竖版海报，适合朋友圈、社群和线下立牌二次排版。
- party-recorder-mobile-leaflet-750x1624.png：移动端宣传单页，适合 H5、公众号长图和社群私发。
- party-recorder-ops-poster-1080x1920.svg：海报可编辑源文件。
- party-recorder-mobile-leaflet-750x1624.svg：单页可编辑源文件。
- party-recorder-ops-poster-bg.png / party-recorder-mobile-leaflet-bg.png：由 imagegen SKILL 生成的无文字背景。

## 文案要点

- 聚会记录师
- 三步开局，拍下第一张照片
- 保存美好回忆
- 创建聚会、拍照记录、相册分享、生成酷炫分享图

## 二维码

二维码来源：backend/public/static/share-poster-miniapp-code.png
`, 'utf8')

  console.log(JSON.stringify({
    outputDir,
    posterOut,
    leafletOut,
    posterSvgOut,
    leafletSvgOut,
    qrPath,
  }, null, 2))
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
