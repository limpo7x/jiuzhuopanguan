const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')
const miniprogramRoot = path.join(repoRoot, 'miniprogram')
const pagesRoot = path.join(miniprogramRoot, 'pages')
const appJsonPath = path.join(miniprogramRoot, 'app.json')
const outputRoot = path.join(repoRoot, 'docs', 'prototypes', 'party-recorder-static-pages')
const outputPagesRoot = path.join(outputRoot, 'pages')
const outputAssetsRoot = path.join(outputRoot, 'assets')

const PRODUCT_NAME = '聚会记录师'

const readText = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

const readJson = (filePath) => {
  const text = readText(filePath).trim()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Cannot parse JSON: ${path.relative(repoRoot, filePath)}\n${error.message}`)
  }
}

const normalizeBrandText = (value) =>
  String(value || '')
    .replace(/酒桌判官/g, PRODUCT_NAME)
    .replace(/\r\n/g, '\n')
    .trim()

const escapeHtml = (value) =>
  normalizeBrandText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const routeToSlug = (route) => route.replace(/^\/+/, '').replace(/[^\w-]+/g, '-')

const labelFromRoute = (route) => {
  const name = route.split('/').slice(-2, -1)[0] || route
  return name
    .split('-')
    .map((item) => item ? item[0].toUpperCase() + item.slice(1) : item)
    .join(' ')
}

const appJson = readJson(appJsonPath)
const registeredRoutes = new Set()

for (const route of appJson.pages || []) {
  registeredRoutes.add(route)
}

for (const item of appJson.subPackages || []) {
  const root = String(item.root || '').replace(/\/$/, '')
  for (const page of item.pages || []) {
    registeredRoutes.add(`${root}/${page}`.replace(/\/+/g, '/'))
  }
}

const pageDirs = fs
  .readdirSync(pagesRoot, { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name)
  .sort((a, b) => a.localeCompare(b))

const routeMap = new Map()

for (const route of registeredRoutes) {
  const parts = route.split('/')
  const dirName = parts.length >= 3 ? parts[1] : parts[0]
  routeMap.set(route, {
    dirName,
    route,
    source: 'registered',
  })
}

for (const dirName of pageDirs) {
  const route = `pages/${dirName}/index`
  if (!routeMap.has(route)) {
    routeMap.set(route, {
      dirName,
      route,
      source: 'discovered',
    })
  }
}

const stripWxmlForText = (wxml) =>
  normalizeBrandText(wxml)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<wxs[\s\S]*?<\/wxs>/g, ' ')
    .replace(/<template[\s\S]*?<\/template>/g, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\{\{[^}]+\}\}/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line && !/^[{}[\],:;]+$/.test(line))

const unique = (items) => {
  const seen = new Set()
  const result = []
  for (const item of items) {
    const value = normalizeBrandText(item)
    if (!value || seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}

const extractTitle = (route, pageJson, wxml) => {
  if (pageJson.navigationBarTitleText) {
    return normalizeBrandText(pageJson.navigationBarTitleText)
  }

  const navTitleMatch = wxml.match(/<navigation-bar\b[^>]*\btitle="([^"]+)"/)
  if (navTitleMatch) {
    return normalizeBrandText(navTitleMatch[1])
  }

  const classTitleMatch = wxml.match(/class="[^"]*(?:title|header|brand)[^"]*"[^>]*>([^<]{2,40})</)
  if (classTitleMatch) {
    return normalizeBrandText(classTitleMatch[1])
  }

  return labelFromRoute(route)
}

const extractActions = (wxml) => {
  const actions = []
  const actionPattern = /\b(?:bindtap|catchtap|bind:open|bind:back|bindsubmit|bindinput|bindchange|bindchooseavatar)="([^"]+)"/g
  let match
  while ((match = actionPattern.exec(wxml))) {
    actions.push(match[1])
  }
  return unique(actions).slice(0, 18)
}

const extractRoutes = (wxml, ts) => {
  const routes = []
  const wxmlRoutePattern = /\b(?:data-route|url)="(\/?pages\/[^"]+)"/g
  const tsRoutePattern = /\burl:\s*(?:'|`|")(\/pages\/[^'"`?$]+(?:\?[^'"`]*)?)/g
  let match

  while ((match = wxmlRoutePattern.exec(wxml))) {
    routes.push(match[1])
  }
  while ((match = tsRoutePattern.exec(ts))) {
    routes.push(match[1])
  }

  return unique(routes.map((route) => route.split('?')[0].replace(/^\/+/, ''))).slice(0, 18)
}

const extractStyleStats = (less) => ({
  classCount: (less.match(/\.[a-zA-Z0-9_-]+\s*[,{]/g) || []).length,
  colorCount: (less.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length,
})

const pages = Array.from(routeMap.values())
  .sort((a, b) => {
    const weightA = a.source === 'registered' ? 0 : 1
    const weightB = b.source === 'registered' ? 0 : 1
    return weightA - weightB || a.route.localeCompare(b.route)
  })
  .map((item) => {
    const pageDir = path.join(pagesRoot, item.dirName)
    const jsonPath = path.join(pageDir, 'index.json')
    const wxmlPath = path.join(pageDir, 'index.wxml')
    const tsPath = path.join(pageDir, 'index.ts')
    const lessPath = path.join(pageDir, 'index.less')
    const pageJson = readJson(jsonPath)
    const wxml = readText(wxmlPath)
    const ts = readText(tsPath)
    const less = readText(lessPath)
    const slug = routeToSlug(item.route)
    const texts = unique(stripWxmlForText(wxml)).slice(0, 24)
    const actions = extractActions(wxml)
    const routes = extractRoutes(wxml, ts)
    const styleStats = extractStyleStats(less)

    return {
      actions,
      file: `pages/${slug}.html`,
      hasLess: Boolean(less),
      hasTs: Boolean(ts),
      hasWxml: Boolean(wxml),
      route: item.route,
      routes,
      slug,
      source: item.source,
      statusLabel: item.source === 'registered' ? 'app.json 正式页' : '历史/未注册页',
      styleStats,
      texts,
      title: extractTitle(item.route, pageJson, wxml),
    }
  })

const routeFileMap = Object.fromEntries(pages.map((page) => [page.route, page.file]))

const renderTagList = (items, className) => {
  if (!items.length) return '<span class="empty-line">暂无可抽取项</span>'
  return items.map((item) => `<span class="${className}">${escapeHtml(item)}</span>`).join('')
}

const renderRouteLinks = (page, depth = 0) => {
  if (!page.routes.length) return '<span class="empty-line">暂无显式页面跳转</span>'
  const prefix = depth ? '../' : ''
  return page.routes.map((route) => {
    const targetFile = routeFileMap[route]
    const href = targetFile ? `${prefix}${targetFile}` : '#'
    const missingClass = targetFile ? '' : ' route-link-missing'
    const title = pages.find((item) => item.route === route)?.title || route
    return `<a class="route-link${missingClass}" href="${href}" data-route="${escapeHtml(route)}">${escapeHtml(title)}</a>`
  }).join('')
}

const renderTextList = (texts) => {
  if (!texts.length) {
    return '<li>源页面没有可直接展示的静态文案，需在小程序运行时由数据填充。</li>'
  }
  return texts.map((text) => `<li>${escapeHtml(text)}</li>`).join('')
}

const renderMiniPreview = (page) => {
  const primaryTexts = page.texts.slice(0, 8)
  const secondaryTexts = page.texts.slice(8, 16)
  const first = primaryTexts[0] || page.title
  const second = primaryTexts[1] || '浏览器静态预览'
  const remaining = primaryTexts.slice(2)

  return `
    <section class="phone" aria-label="${escapeHtml(page.title)} 页面预览">
      <header class="phone-nav">
        <span class="phone-back">${page.route === 'pages/index/index' ? '' : '‹'}</span>
        <span>${escapeHtml(page.title)}</span>
        <span class="phone-dot"></span>
      </header>
      <main class="phone-screen">
        <section class="hero-panel">
          <p class="eyebrow">${escapeHtml(page.statusLabel)}</p>
          <h1>${escapeHtml(first)}</h1>
          <p>${escapeHtml(second)}</p>
        </section>
        <section class="content-panel">
          ${remaining.map((text) => `<div class="preview-row">${escapeHtml(text)}</div>`).join('')}
          ${!remaining.length ? '<div class="preview-row">该页主要依赖运行态数据渲染。</div>' : ''}
        </section>
        <section class="content-panel muted">
          ${secondaryTexts.slice(0, 5).map((text) => `<div class="preview-line">${escapeHtml(text)}</div>`).join('')}
          ${!secondaryTexts.length ? '<div class="preview-line">源码结构已打包，浏览器页仅做静态浏览。</div>' : ''}
        </section>
      </main>
    </section>
  `
}

const baseHead = (title, depth = 0) => {
  const prefix = depth ? '../' : ''
  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="${prefix}assets/static-pages.css">
    <script defer src="${prefix}assets/static-pages.js"></script>
  `
}

const renderIndex = () => `
<!doctype html>
<html lang="zh-CN">
<head>
${baseHead(`${PRODUCT_NAME} - 浏览器静态页面组`)}
</head>
<body data-page="index">
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">PR</span>
        <div>
          <strong>${PRODUCT_NAME}</strong>
          <small>全量静态页面组</small>
        </div>
      </div>
      <label class="search">
        <span>搜索</span>
        <input id="pageSearch" type="search" placeholder="页面、路由、文案">
      </label>
      <nav class="page-list" id="pageList">
        ${pages.map((page) => `
          <a class="page-list-item" href="${page.file}" data-title="${escapeHtml(page.title)}" data-route="${escapeHtml(page.route)}" data-status="${escapeHtml(page.statusLabel)}">
            <span>${escapeHtml(page.title)}</span>
            <small>${escapeHtml(page.route)}</small>
          </a>
        `).join('')}
      </nav>
    </aside>
    <main class="main">
      <section class="overview">
        <p class="eyebrow">浏览器可运行交付包</p>
        <h1>${PRODUCT_NAME} 页面全量打包</h1>
        <p>本目录由脚本从小程序页面源码生成，覆盖 ${pages.length} 个页面：${pages.filter((item) => item.source === 'registered').length} 个 app.json 正式页，${pages.filter((item) => item.source !== 'registered').length} 个历史/未注册页。</p>
        <div class="stat-grid">
          <div><strong>${pages.length}</strong><span>页面文件</span></div>
          <div><strong>${pages.filter((item) => item.hasWxml).length}</strong><span>WXML 快照</span></div>
          <div><strong>${pages.reduce((sum, page) => sum + page.actions.length, 0)}</strong><span>交互方法</span></div>
          <div><strong>${pages.reduce((sum, page) => sum + page.routes.length, 0)}</strong><span>跳转线索</span></div>
        </div>
      </section>
      <section class="card">
        <div class="section-head">
          <h2>正式页面</h2>
          <span>${pages.filter((item) => item.source === 'registered').length}</span>
        </div>
        <div class="cards">
          ${pages.filter((item) => item.source === 'registered').map((page) => renderPageCard(page, 0)).join('')}
        </div>
      </section>
      <section class="card">
        <div class="section-head">
          <h2>历史/未注册页面</h2>
          <span>${pages.filter((item) => item.source !== 'registered').length}</span>
        </div>
        <div class="cards">
          ${pages.filter((item) => item.source !== 'registered').map((page) => renderPageCard(page, 0)).join('')}
        </div>
      </section>
    </main>
  </div>
</body>
</html>
`

const renderPageCard = (page, depth) => {
  const prefix = depth ? '../' : ''
  return `
    <article class="page-card" data-title="${escapeHtml(page.title)}" data-route="${escapeHtml(page.route)}">
      <div>
        <span class="status ${page.source === 'registered' ? 'status-live' : 'status-legacy'}">${escapeHtml(page.statusLabel)}</span>
        <h3>${escapeHtml(page.title)}</h3>
        <p>${escapeHtml(page.route)}</p>
      </div>
      <a class="open-link" href="${prefix}${page.file}">打开</a>
    </article>
  `
}

const renderPage = (page) => `
<!doctype html>
<html lang="zh-CN">
<head>
${baseHead(`${PRODUCT_NAME} - ${page.title}`, 1)}
</head>
<body data-page="${escapeHtml(page.route)}">
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand brand-link" href="../index.html">
        <span class="brand-mark">PR</span>
        <div>
          <strong>${PRODUCT_NAME}</strong>
          <small>返回页面总览</small>
        </div>
      </a>
      <nav class="page-list compact">
        ${pages.map((item) => `
          <a class="page-list-item ${item.route === page.route ? 'active' : ''}" href="../${item.file}">
            <span>${escapeHtml(item.title)}</span>
            <small>${escapeHtml(item.route)}</small>
          </a>
        `).join('')}
      </nav>
    </aside>
    <main class="main page-detail">
      <section class="detail-head">
        <div>
          <p class="eyebrow">${escapeHtml(page.statusLabel)}</p>
          <h1>${escapeHtml(page.title)}</h1>
          <p>${escapeHtml(page.route)}</p>
        </div>
        <a class="open-link" href="../index.html">总览</a>
      </section>
      <div class="detail-grid">
        ${renderMiniPreview(page)}
        <section class="card detail-card">
          <div class="section-head">
            <h2>页面文案快照</h2>
            <span>${page.texts.length}</span>
          </div>
          <ul class="text-list">
            ${renderTextList(page.texts)}
          </ul>
        </section>
        <section class="card detail-card">
          <div class="section-head">
            <h2>交互方法</h2>
            <span>${page.actions.length}</span>
          </div>
          <div class="tag-cloud">
            ${renderTagList(page.actions, 'action-tag')}
          </div>
        </section>
        <section class="card detail-card">
          <div class="section-head">
            <h2>跳转线索</h2>
            <span>${page.routes.length}</span>
          </div>
          <div class="route-cloud">
            ${renderRouteLinks(page, 1)}
          </div>
        </section>
        <section class="card detail-card">
          <div class="section-head">
            <h2>源码摘要</h2>
            <span>static</span>
          </div>
          <dl class="meta-list">
            <div><dt>WXML</dt><dd>${page.hasWxml ? '已打包文案快照' : '缺失'}</dd></div>
            <div><dt>TypeScript</dt><dd>${page.hasTs ? '已扫描交互/路由' : '缺失'}</dd></div>
            <div><dt>LESS</dt><dd>${page.hasLess ? `${page.styleStats.classCount} 个样式选择器线索` : '缺失'}</dd></div>
            <div><dt>状态</dt><dd>${escapeHtml(page.statusLabel)}</dd></div>
          </dl>
        </section>
      </div>
    </main>
  </div>
</body>
</html>
`

const css = `
:root {
  color-scheme: light;
  --bg: #f7f2ea;
  --panel: #fffaf1;
  --panel-strong: #fff4df;
  --ink: #211b16;
  --muted: #766858;
  --line: rgba(76, 55, 34, 0.16);
  --accent: #dd5834;
  --mint: #2f9f78;
  --blue: #4169a8;
  --shadow: 0 18px 50px rgba(64, 42, 24, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
}

a {
  color: inherit;
  text-decoration: none;
}

.app-shell {
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  border-right: 1px solid var(--line);
  background: #181411;
  color: #fff5e8;
  padding: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.brand-link {
  margin-bottom: 18px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: #f5c469;
  color: #1d1711;
  font-weight: 800;
}

.brand strong,
.brand small {
  display: block;
}

.brand small {
  margin-top: 3px;
  color: #d5c2a9;
}

.search {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
  color: #d5c2a9;
  font-size: 13px;
}

.search input {
  width: 100%;
  border: 1px solid rgba(255, 245, 232, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff5e8;
  padding: 11px 12px;
  outline: none;
}

.page-list {
  display: grid;
  gap: 7px;
}

.page-list.compact {
  gap: 4px;
}

.page-list-item {
  display: grid;
  gap: 3px;
  border-radius: 8px;
  padding: 10px 11px;
  color: #fff5e8;
}

.page-list-item:hover,
.page-list-item.active {
  background: rgba(255, 255, 255, 0.1);
}

.page-list-item small {
  color: #c8b296;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.main {
  min-width: 0;
  padding: 34px;
}

.overview,
.detail-head,
.card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  box-shadow: var(--shadow);
}

.overview {
  padding: 34px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 12px;
  font-size: 34px;
  line-height: 1.16;
}

h2 {
  margin: 0;
  font-size: 20px;
}

h3 {
  margin: 10px 0 8px;
  font-size: 18px;
}

p {
  color: var(--muted);
  line-height: 1.65;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.stat-grid div {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel-strong);
  padding: 16px;
}

.stat-grid strong {
  display: block;
  margin-bottom: 4px;
  font-size: 28px;
}

.stat-grid span {
  color: var(--muted);
  font-size: 13px;
}

.card {
  margin-bottom: 22px;
  padding: 22px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.section-head span {
  color: var(--muted);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.page-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  min-height: 142px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fffdf7;
  padding: 16px;
}

.page-card p {
  margin-bottom: 0;
  font-size: 13px;
  word-break: break-all;
}

.status {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
}

.status-live {
  background: rgba(47, 159, 120, 0.14);
  color: #187154;
}

.status-legacy {
  background: rgba(65, 105, 168, 0.14);
  color: #315585;
}

.open-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-height: 34px;
  border-radius: 8px;
  background: var(--ink);
  color: #fff5e8;
  padding: 8px 12px;
  font-weight: 700;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 26px;
  margin-bottom: 22px;
}

.detail-head p {
  margin-bottom: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(330px, 410px) minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.phone {
  position: sticky;
  top: 24px;
  border: 10px solid #17120f;
  border-radius: 32px;
  background: #17120f;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.phone-nav {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  height: 56px;
  background: rgba(24, 20, 17, 0.95);
  color: #fff1dc;
  text-align: center;
  font-weight: 800;
}

.phone-back {
  font-size: 30px;
}

.phone-dot {
  justify-self: center;
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: #f5c469;
}

.phone-screen {
  min-height: 660px;
  background: linear-gradient(180deg, #2b1810 0%, #f7efe3 46%, #fffaf1 100%);
  padding: 18px;
}

.hero-panel {
  min-height: 210px;
  border-radius: 8px;
  background: rgba(255, 250, 241, 0.94);
  padding: 22px;
}

.hero-panel h1 {
  font-size: 30px;
}

.content-panel {
  display: grid;
  gap: 9px;
  margin-top: 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  padding: 14px;
}

.content-panel.muted {
  background: rgba(255, 245, 223, 0.86);
}

.preview-row,
.preview-line {
  border: 1px solid rgba(76, 55, 34, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  padding: 11px 12px;
  line-height: 1.45;
}

.preview-line {
  color: var(--muted);
  font-size: 14px;
}

.detail-card {
  margin-bottom: 0;
}

.text-list {
  display: grid;
  gap: 9px;
  margin: 0;
  padding-left: 20px;
}

.text-list li {
  line-height: 1.55;
}

.tag-cloud,
.route-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-tag,
.route-link,
.empty-line {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  border-radius: 8px;
  padding: 7px 10px;
  background: #fff1dc;
  color: #3a2b20;
  font-size: 13px;
}

.route-link {
  background: rgba(47, 159, 120, 0.12);
  color: #176f53;
  font-weight: 700;
}

.route-link-missing {
  background: rgba(118, 104, 88, 0.12);
  color: var(--muted);
  cursor: default;
}

.empty-line {
  color: var(--muted);
}

.meta-list {
  display: grid;
  gap: 10px;
  margin: 0;
}

.meta-list div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 10px;
}

.meta-list dt {
  color: var(--muted);
}

.meta-list dd {
  margin: 0;
}

.is-hidden {
  display: none !important;
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    height: auto;
  }

  .main {
    padding: 18px;
  }

  .stat-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .phone {
    position: relative;
    top: auto;
  }
}
`

const js = `
(function () {
  var search = document.getElementById('pageSearch')
  if (search) {
    search.addEventListener('input', function () {
      var keyword = search.value.trim().toLowerCase()
      document.querySelectorAll('[data-title][data-route]').forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-route') || '',
          item.getAttribute('data-status') || '',
          item.textContent || ''
        ].join(' ').toLowerCase()
        item.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1)
      })
    })
  }

  document.querySelectorAll('.route-link-missing').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault()
    })
  })
})()
`

fs.rmSync(outputRoot, { recursive: true, force: true })
fs.mkdirSync(outputPagesRoot, { recursive: true })
fs.mkdirSync(outputAssetsRoot, { recursive: true })

fs.writeFileSync(path.join(outputRoot, 'index.html'), renderIndex(), 'utf8')
fs.writeFileSync(path.join(outputAssetsRoot, 'static-pages.css'), css.trim() + '\n', 'utf8')
fs.writeFileSync(path.join(outputAssetsRoot, 'static-pages.js'), js.trim() + '\n', 'utf8')
fs.writeFileSync(
  path.join(outputAssetsRoot, 'pages-data.json'),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    productName: PRODUCT_NAME,
    routeFileMap,
    pages,
  }, null, 2) + '\n',
  'utf8',
)

for (const page of pages) {
  fs.writeFileSync(path.join(outputRoot, page.file), renderPage(page), 'utf8')
}

const readme = `# ${PRODUCT_NAME}浏览器静态页面组

生成命令：

\`\`\`powershell
npm.cmd run build:static-pages
\`\`\`

入口文件：

- \`index.html\`：全量页面总览和搜索入口
- \`pages/*.html\`：每个小程序页面的浏览器静态快照
- \`assets/pages-data.json\`：由源码抽取出的页面、文案、交互和跳转索引

覆盖范围：

- app.json 正式页面：${pages.filter((item) => item.source === 'registered').length}
- miniprogram/pages 历史或未注册页面：${pages.filter((item) => item.source !== 'registered').length}
- 页面总数：${pages.length}

说明：该目录是浏览器可打开的静态页面组，用于走查页面结构、文案、交互方法和跳转关系；它不替代微信小程序运行时，不连接 api.pomer.cn，也不会触碰 pomer.cn 官网。
`

fs.writeFileSync(path.join(outputRoot, 'README.md'), readme, 'utf8')

console.log(`Static page pack generated: ${path.relative(repoRoot, outputRoot)}`)
console.log(`Pages: ${pages.length}`)
