const navGroups = [
  {
    key: 'overview',
    title: '概览台',
    items: [{ slug: 'overview-dashboard', title: '经营驾驶舱', icon: 'icon-dashboard' }],
  },
  {
    key: 'content',
    title: '内容运营',
    items: [
      { slug: 'content-home-ops', title: '首页装修', icon: 'icon-content' },
      { slug: 'content-templates', title: '酒局模板', icon: 'icon-template' },
      { slug: 'content-question-bank', title: '题库与任务', icon: 'icon-question' },
      { slug: 'content-share-assets', title: '分享素材', icon: 'icon-share' },
      { slug: 'content-tools-ops', title: '工具箱运营', icon: 'icon-tool' }
  ],
  },
  {
    key: 'community',
    title: '用户与酒局',
    items: [
      { slug: 'user-profiles', title: '用户中心', icon: 'icon-user' },
      { slug: 'user-login-logs', title: '用户登录记录', icon: 'icon-user' },
      { slug: 'sessions', title: '酒局管理', icon: 'icon-session' },
      { slug: 'reports', title: '战报中心', icon: 'icon-report' },
    ],
  },
  {
    key: 'commerce',
    title: '商业化',
    items: [
      { slug: 'commerce-points', title: '积分体系', icon: 'icon-points' },
      { slug: 'commerce-point-ledger', title: '积分变动记录', icon: 'icon-points' },
      { slug: 'commerce-membership', title: '会员体系', icon: 'icon-member' },
      { slug: 'commerce-merchants', title: '商户合作', icon: 'icon-store' },
    ],
  },
  {
    key: 'analytics',
    title: '增长与数据',
    items: [
      { slug: 'data-users', title: '用户分析', icon: 'icon-chart' },
      { slug: 'data-content', title: '内容分析', icon: 'icon-content' },
      { slug: 'data-business', title: '商业分析', icon: 'icon-member' },
    ],
  },
  {
    key: 'system',
    title: '系统设置',
    items: [
      { slug: 'system-permissions', title: '账号权限', icon: 'icon-security' },
      { slug: 'system-operation-logs', title: '后台积分操作日志', icon: 'icon-security' },
      { slug: 'system-config', title: '基础配置', icon: 'icon-settings' },
    ],
  },
]

const state = {
  slug: document.body.dataset.page || 'overview-dashboard',
  user: null,
  page: null,
  formData: {},
  collections: {},
  selected: {},
  meta: {},
  navOpen: {},
  tablePages: {},
  editor: null,
  editorReturnFocus: '',
}

const icon = (id, cls = 'ui-icon') => `<svg class="${cls}" aria-hidden="true"><use href="/admin/static/heatwave-ops/icons.svg#${id}"></use></svg>`

const clone = (value) => JSON.parse(JSON.stringify(value))
const navStateKey = 'heatwave-ops-nav-open-v2'
const imageUploadEndpoint = '/api/v1/admin/uploads/image'
const AUTO_COMPUTED_FIELD_KEYS = new Set([
  'shareRate',
  'replayRate',
  'openRate',
  'returnRate',
  'favoriteRate',
  'conversionRate',
  'renewRate',
  'completionRate',
  'verifyRate',
])
const FREE_TEMPLATE_PRESETS = [
  { id: 'free-happy-friday', filterId: 'free', title: '周五快乐局', meta: '轻松开局，朋友小聚，适合 2-8 人快速开玩。', cost: 0, imageUrl: '/static/templates/free-happy-friday.png' },
  { id: 'free-friend-party', filterId: 'free', title: '老友热闹局', meta: '熟人酒桌热闹局，主打互损、调侃和氛围破冰。', cost: 0, imageUrl: '/static/templates/free-friend-party.png' },
  { id: 'free-weekend-party', filterId: 'free', title: '周末放松局', meta: '周末聚会放松玩法，节奏轻，适合新老朋友混局。', cost: 0, imageUrl: '/static/templates/free-weekend-party.png' },
  { id: 'free-fun-challenge', filterId: 'free', title: '整活挑战局', meta: '互动整活不冷场，适合希望酒桌更热闹的场景。', cost: 0, imageUrl: '/static/templates/free-fun-challenge.png' },
  { id: 'free-casual-table', filterId: 'free', title: '随便喝两杯', meta: '低压轻量，新手友好，适合临时开局和轻松记录。', cost: 0, imageUrl: '/static/templates/free-casual-table.png' },
]
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const slugify = (value = '') =>
  String(value)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

const getFieldDomId = (field, collectionKey = 'form', itemId = '') =>
  `field-${slugify(collectionKey || 'form')}-${slugify(itemId || 'root')}-${slugify(field?.key || field?.label || 'value')}`

const getAutocomplete = (field) => {
  const key = String(field?.key || '').toLowerCase()
  if (key.includes('email')) return 'email'
  if (key.includes('phone') || key.includes('tel')) return 'tel'
  if (key.includes('url') || key.includes('link') || key.includes('path')) return 'off'
  if (key.includes('name') || key.includes('title')) return 'off'
  return 'off'
}

const getInputType = (field) => {
  const key = String(field?.key || '').toLowerCase()
  if (field?.type === 'number') return 'number'
  if (key.includes('email')) return 'email'
  if (key.includes('phone') || key.includes('tel')) return 'tel'
  if (key.includes('url') || key.includes('link')) return 'url'
  return 'text'
}

const getImageAttrs = (field = {}) => {
  const key = String(field?.key || '').toLowerCase()
  if (key.includes('avatar')) return 'width="512" height="512" loading="lazy"'
  if (state.slug === 'content-share-assets') return 'width="1080" height="1920" loading="lazy"'
  if (state.slug === 'content-home-ops' && key.includes('banner')) return 'width="1125" height="360" loading="lazy"'
  if (state.slug === 'content-tools-ops') return 'width="640" height="640" loading="lazy"'
  if (state.slug === 'commerce-points') return 'width="750" height="420" loading="lazy"'
  return 'width="960" height="540" loading="lazy"'
}

const isAssetField = (field) => field?.type === 'image' || /(?:image|avatar)url$/i.test(field?.key || '')

const getAssetCategory = (fieldKey = '') => {
  if (/avatar/i.test(fieldKey)) {
    return 'avatars'
  }
  if (state.slug === 'content-home-ops') {
    return 'home'
  }
  if (state.slug === 'content-templates') {
    return 'templates'
  }
  if (state.slug === 'commerce-points') {
    return 'points'
  }
  if (state.slug === 'content-share-assets') {
    return 'shares'
  }
  return 'general'
}

const getDefaultNavState = () => Object.fromEntries(navGroups.map((group) => [group.key, group.key === 'overview']))

const ensureNavState = () => {
  if (Object.keys(state.navOpen).length) {
    return
  }

  const fallback = getDefaultNavState()
  try {
    const raw = window.sessionStorage.getItem(navStateKey)
    if (!raw) {
      state.navOpen = fallback
      return
    }

    const parsed = JSON.parse(raw)
    state.navOpen = {
      ...fallback,
      ...Object.fromEntries(navGroups.map((group) => [group.key, Boolean(parsed?.[group.key])])),
    }
  } catch (error) {
    state.navOpen = fallback
  }
}

const persistNavState = () => {
  window.sessionStorage.setItem(navStateKey, JSON.stringify(state.navOpen))
}

const request = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.code !== 0) {
    const message = payload?.message || '请求失败'
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return payload.data
}

const getAssetSizeSuggestion = (field) => {
  const key = String(field?.key || '').toLowerCase()
  if (key.includes('avatar')) {
    return '推荐尺寸 512 x 512'
  }
  if (state.slug === 'content-home-ops') {
    if (key.includes('hero')) {
      return '推荐尺寸 1125 x 690'
    }
    if (key.includes('banner')) {
      return '推荐尺寸 1125 x 360'
    }
    return '推荐尺寸 1125 x 690'
  }
  if (state.slug === 'content-templates') {
    return '推荐尺寸 960 x 540'
  }
  if (state.slug === 'content-share-assets') {
    return '推荐尺寸 1080 x 1920'
  }
  if (state.slug === 'content-tools-ops') {
    return '推荐尺寸 640 x 640'
  }
  if (state.slug === 'commerce-points') {
    return '推荐尺寸 750 x 420'
  }
  return '推荐尺寸 960 x 540'
}

const getFieldCondition = (field) => {
  if (field?.condition) {
    return String(field.condition).trim()
  }
  const key = String(field?.key || '').toLowerCase()
  if (isAssetField(field)) {
    return '仅在对应前台模块引用该素材时生效；建议先上传，再保存页面配置。'
  }
  if (key.includes('status')) {
    return '状态变更保存后即时影响后台展示；前台是否生效取决于页面是否按状态过滤。'
  }
  if (key.includes('sort')) {
    return '仅在同一模块同类数据内比较排序，数值越小越靠前。'
  }
  if (key.includes('placement')) {
    return '仅对已启用内容生效；未命中的投放位不会在前台显示。'
  }
  if (key.includes('phone')) {
    return '手机号为可选绑定信息，不作为唯一识别标识；修改前请先核对用户授权状态。'
  }
  if (key.includes('openid') || key.includes('wechat')) {
    return 'OpenID 是小程序用户唯一身份标识，仅用于排障或核对，非必要不要手动更改。'
  }
  if (key.includes('invitecode')) {
    return '仅对当前酒局生效；重复邀请码可能导致用户入局错误。'
  }
  if (key.includes('point') || key.includes('cost') || key.includes('delta')) {
    return '积分类字段会直接影响用户资产或兑换门槛，保存前需确认数值单位。'
  }
  if (key.includes('rate') || key.includes('ctr') || key.includes('share')) {
    return '比例类字段建议统一使用百分比格式，便于经营页和列表页直接展示。'
  }
  if (key.includes('url') || key.includes('link') || key.includes('path')) {
    return '仅当地址可访问且被前台引用时生效；线上建议使用 HTTPS 或站内相对路径。'
  }
  if (field?.type === 'textarea') {
    return '长文本一般用于前台说明文案或运营备注，保存后请联动检查换行和截断效果。'
  }
  return '保存后作用于当前模块；如该字段被前台页面消费，则会在下次取数时生效。'
}

const getFieldUsageNote = (field) => {
  if (field?.usageNote) {
    return String(field.usageNote).trim()
  }
  const key = String(field?.key || '').toLowerCase()
  if (isAssetField(field)) {
    return `${getAssetSizeSuggestion(field)}；优先上传 JPG、PNG 或 WebP，命名尽量与素材用途一致，便于复用和排查。`
  }
  if (key.includes('title') || key.includes('name')) {
    return '建议控制在 6 到 18 个字内，优先使用可直接面向用户展示的正式名称。'
  }
  if (key.includes('subtitle') || key.includes('desc') || key.includes('summary') || key.includes('note')) {
    return '建议写结果导向文案，避免内部术语；超长内容需要同步检查前台换行表现。'
  }
  if (key.includes('status')) {
    return '推荐统一使用：启用、停用、灰度、待审核、已生效等固定值，避免同义状态并存。'
  }
  if (key.includes('sort')) {
    return '推荐按 10、20、30 递增预留插槽，后续新增项无需整体重排。'
  }
  if (key.includes('placement')) {
    return '推荐使用 both、home、tools 等约定值，不要临时自造投放位字符串。'
  }
  if (key.includes('phone')) {
    return '建议默认展示脱敏手机号；未绑定用户允许为空，不影响登录和积分归属。'
  }
  if (key.includes('openid') || key.includes('wechat')) {
    return 'OpenID 由微信授权后自动写入，建议只读查用，用于用户唯一身份和问题追踪。'
  }
  if (key.includes('invitecode')) {
    return '推荐使用 6 位大写字母数字组合，便于口头传播和线下手输。'
  }
  if (key.includes('point') || key.includes('cost') || key.includes('delta')) {
    return '默认单位为积分；涉及人工增减时建议在备注或原因字段同步记录操作背景。'
  }
  if (key.includes('url') || key.includes('link') || key.includes('path')) {
    return '可填写站内相对路径或完整地址；优先保持和当前线上域名、静态资源规则一致。'
  }
  if (field?.type === 'textarea') {
    return '可填写多行内容；若用于分享、弹窗或海报说明，建议先控制在 2 到 4 行视觉长度。'
  }
  return '建议保持格式稳定、命名清晰；改动后同步检查该字段在前台或经营页的实际展示。'
}

const renderFieldMeta = (field) => `
  <div class="field-meta">
    <div class="field-meta-row">
      <span class="field-meta-label">生效条件</span>
      <span class="field-meta-text">${escapeHtml(getFieldCondition(field))}</span>
    </div>
    <div class="field-meta-row">
      <span class="field-meta-label">使用备注</span>
      <span class="field-meta-text">${escapeHtml(getFieldUsageNote(field))}</span>
    </div>
  </div>`

const setStatus = (text, type = 'normal') => {
  const node = document.querySelector('[data-role="status"]')
  if (!node) return
  node.textContent = text
  node.dataset.type = type
}

const getCollectionState = (collection) => {
  if (!state.collections[collection.key]) {
    state.collections[collection.key] = clone(collection.items || [])
  }
  if (!state.selected[collection.key] && state.collections[collection.key][0]) {
    state.selected[collection.key] = state.collections[collection.key][0].id
  }
  return state.collections[collection.key]
}

const ensureMetaState = () => {
  if (!Object.keys(state.meta).length && state.page?.meta) {
    state.meta = clone(state.page.meta)
  }
}

const ensureFormState = () => {
  if (!Object.keys(state.formData).length && state.page?.data) {
    state.formData = clone(state.page.data)
  }
}

const getCollectionDefinition = (collectionKey) => {
  if (state.page?.view === 'collection' && state.page.collection?.key === collectionKey) {
    return state.page.collection
  }
  if (state.page?.view === 'multi-collection') {
    return (state.page.collections || []).find((collection) => collection.key === collectionKey) || null
  }
  return null
}

const getEditorCloseButton = () => `<button class="dialog-close-btn" type="button" data-action="close-editor">关闭</button>`

const getDisplayValue = (field, value) => {
  if (value == null || value === '') {
    return '<span class="muted">未配置</span>'
  }
  if (isAssetField(field)) {
    return `
      <div class="readonly-asset">
        <img src="${escapeHtml(value)}" alt="${escapeHtml(field.label)}" ${getImageAttrs(field)} />
        <div class="readonly-asset-url">${escapeHtml(String(value))}</div>
      </div>`
  }
  return escapeHtml(String(value)).replace(/\n/g, '<br />')
}

const isMeaningfulItem = (item, fields = []) =>
  fields.some((field) => {
    if (field.key === 'id') {
      return false
    }
    const value = item?.[field.key]
    if (field.type === 'number') {
      return Number(value || 0) !== 0
    }
    return String(value || '').trim() !== ''
  })

const closeEditor = () => {
  const current = state.editor
  if (current?.mode === 'collection-item' && current?.isNew) {
    const collection = getCollectionDefinition(current.collectionKey)
    const items = state.collections[current.collectionKey] || []
    const item = items.find((entry) => entry.id === current.itemId)
    if (collection && item && !isMeaningfulItem(item, collection.fields || [])) {
      state.collections[current.collectionKey] = items.filter((entry) => entry.id !== current.itemId)
    }
  }
  const returnFocus = state.editorReturnFocus
  state.editor = null
  state.editorReturnFocus = ''
  render()
  if (returnFocus) {
    requestAnimationFrame(() => {
      document.querySelector(returnFocus)?.focus()
    })
  }
}

const captureEditorReturnFocus = () => {
  const active = document.activeElement
  if (!active?.dataset?.action) {
    state.editorReturnFocus = ''
    return
  }
  const selectorParts = [`[data-action="${active.dataset.action}"]`]
  if (active.dataset.sectionIndex) selectorParts.push(`[data-section-index="${active.dataset.sectionIndex}"]`)
  if (active.dataset.collection) selectorParts.push(`[data-collection="${active.dataset.collection}"]`)
  if (active.dataset.itemId) selectorParts.push(`[data-item-id="${active.dataset.itemId}"]`)
  state.editorReturnFocus = selectorParts.join('')
}

const openFormSectionEditor = (sectionIndex) => {
  ensureFormState()
  const section = state.page?.formSections?.[sectionIndex]
  if (!section) {
    return
  }
  captureEditorReturnFocus()
  state.editor = {
    mode: 'form-section',
    sectionIndex,
    title: `${section.title}编辑`,
  }
  render()
}

const openMetaEditor = () => {
  ensureMetaState()
  captureEditorReturnFocus()
  state.editor = {
    mode: 'meta',
    title: '基础配置编辑',
  }
  render()
}

const openCollectionItemEditor = (collectionKey, itemId, isNew = false) => {
  const collection = getCollectionDefinition(collectionKey)
  if (!collection) {
    return
  }
  captureEditorReturnFocus()
  state.selected[collectionKey] = itemId
  state.editor = {
    mode: 'collection-item',
    collectionKey,
    itemId,
    isNew,
    title: `${collection.itemLabel || '详情'}编辑`,
  }
  render()
}

const renderSidebar = () => {
  ensureNavState()
  return `
    <div class="sidebar-scroll">
      ${navGroups
        .map((group) => {
          const isOpen = Boolean(state.navOpen[group.key])
          return `
            <section class="nav-group ${isOpen ? 'nav-group-open' : ''}">
              <button class="nav-group-toggle" type="button" data-action="toggle-nav-group" data-group="${group.key}" aria-expanded="${isOpen}">
                <span class="nav-group-title">${group.title}</span>
                <span class="nav-group-caret" aria-hidden="true"></span>
              </button>
              <div class="nav-drawer">
                <div class="nav-list">
                  ${group.items
                    .map(
                      (item) => `
                    <a class="nav-item ${item.slug === state.slug ? 'nav-item-active' : ''}" href="/admin/pages/${item.slug}">
                      ${icon(item.icon, 'nav-item-icon')}
                      <div class="nav-item-copy">
                        <span class="nav-item-title">${item.title}</span>
                      </div>
                    </a>`,
                    )
                    .join('')}
                </div>
              </div>
            </section>`
        })
        .join('')}
    </div>`
}

const renderMetrics = () =>
  (state.page.metrics || [])
    .map(
      (item) => `
      <div class="metric-card">
        <span class="metric-label">${item.label}</span>
        <span class="metric-value">${item.value}</span>
        <span class="metric-trend ${item.tone === 'up' ? 'up' : ''}">
          ${item.tone === 'up' ? icon('icon-publish') : icon('icon-alert')}
          ${item.trend || ''}
        </span>
      </div>`,
    )
    .join('')

const DEFAULT_PAGE_SIZE = 15

const getPageSize = (source = {}) => Math.max(1, Number(source.pageSize || DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)

const getTableKey = (table = {}) => `table:${String(table.key || table.title || 'table')}`

const getCollectionPagerKey = (collection = {}) =>
  `collection:${String(collection.key || collection.title || collection.itemLabel || 'collection')}`

const getPagerParam = (pagerKey) => `p_${slugify(pagerKey).slice(0, 48)}`

const getCurrentPage = (pagerKey, pageCount) => {
  const queryPage = new URLSearchParams(window.location.search).get(getPagerParam(pagerKey))
  const currentPage = Math.min(Math.max(Number(state.tablePages[pagerKey] || queryPage) || 1, 1), pageCount)
  state.tablePages[pagerKey] = currentPage
  return currentPage
}

const setPagerPage = (pagerKey, page) => {
  state.tablePages[pagerKey] = Number(page) || 1
  const params = new URLSearchParams(window.location.search)
  params.set(getPagerParam(pagerKey), String(state.tablePages[pagerKey]))
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
}

const getPaginationPages = (currentPage, pageCount) => {
  const pages = new Set([1, pageCount, currentPage])
  if (currentPage > 1) pages.add(currentPage - 1)
  if (currentPage < pageCount) pages.add(currentPage + 1)
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b)
}

const renderPagination = ({ pagerKey, pageSize, totalRows, currentPage, pageCount }) => {
  const pages = getPaginationPages(currentPage, pageCount)
  const pageButtons = pages
    .map((page) => `<button class="pager-btn ${page === currentPage ? 'pager-btn-active' : ''}" type="button" data-action="table-page" data-table-key="${escapeHtml(pagerKey)}" data-page="${page}" aria-current="${page === currentPage ? 'page' : 'false'}">${page}</button>`)
    .join('')
  return `
    <div class="table-pagination">
      <div class="pager-summary">${totalRows} 条 · 每页 ${pageSize} 条 · 第 ${currentPage}/${pageCount} 页</div>
      <div class="pager-actions">
        <button class="pager-btn" type="button" data-action="table-page" data-table-key="${escapeHtml(pagerKey)}" data-page="1" ${currentPage <= 1 ? 'disabled' : ''}>&#39318;&#39029;</button>
        <button class="pager-btn" type="button" data-action="table-page" data-table-key="${escapeHtml(pagerKey)}" data-page="${Math.max(1, currentPage - 1)}" ${currentPage <= 1 ? 'disabled' : ''}>&#19978;&#19968;&#39029;</button>
        ${pageButtons}
        <button class="pager-btn" type="button" data-action="table-page" data-table-key="${escapeHtml(pagerKey)}" data-page="${Math.min(pageCount, currentPage + 1)}" ${currentPage >= pageCount ? 'disabled' : ''}>&#19979;&#19968;&#39029;</button>
      </div>
    </div>`
}

const renderTable = (table, rows) => {
  if (!table) return ''
  const allRows = Array.isArray(rows) ? rows : []
  const pageSize = getPageSize(table)
  const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize))
  const tableKey = getTableKey(table)
  const currentPage = getCurrentPage(tableKey, pageCount)
  const start = (currentPage - 1) * pageSize
  const displayRows = allRows.slice(start, start + pageSize)
  return `
  <div class="table-card">
    <div class="table-head">
      <div>
        <div class="section-title">${escapeHtml(table.title || '列表')}</div>
      </div>
    </div>
    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr>${table.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${
            displayRows.length
              ? displayRows
                  .map(
                    (row) => `
                <tr>
                  ${table.columns
                    .map((column) => `<td>${row[column.key] == null || row[column.key] === '' ? '<span class="muted">-</span>' : escapeHtml(String(row[column.key]))}</td>`)
                    .join('')}
                </tr>`,
                  )
                  .join('')
              : `<tr><td colspan="${table.columns.length}"><div class="empty-state">暂无数据</div></td></tr>`
          }
        </tbody>
      </table>
    </div>
    ${renderPagination({ pagerKey: tableKey, pageSize, totalRows: allRows.length, currentPage, pageCount })}
  </div>`
}
const renderAssetInput = (field, value, collectionKey, itemId, common) => `
  <div class="asset-field">
    <div class="asset-input-row">
      <input
        class="asset-input-control"
        type="text"
        value="${escapeHtml(value ?? '')}"
        ${common}
      />
      <label class="mini-btn asset-upload-btn">
        上传图片
        <input
          class="asset-upload-control"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          data-action="upload-asset"
          data-upload-field="${field.key}"
          data-upload-collection="${collectionKey || ''}"
          data-upload-item-id="${itemId || ''}"
          data-upload-category="${getAssetCategory(field.key)}"
        />
      </label>
    </div>
    <div class="asset-preview ${value ? '' : 'asset-preview-empty'}">
      ${value ? `<img src="${escapeHtml(value)}" alt="${escapeHtml(field.label)}" data-role="asset-preview" ${getImageAttrs(field)} />` : '<span>未上传图片</span>'}
    </div>
    ${renderFieldMeta(field)}
  </div>`

const renderTableCell = (column, item) => {
  const value = item[column.key] ?? ''
  if (column.type === 'image' || isAssetField(column)) {
    return value ? `<span class="table-avatar-cell"><img src="${escapeHtml(value)}" alt="${escapeHtml(column.label || '')}" ${getImageAttrs(column)} /></span>` : ''
  }
  return escapeHtml(value)
}

const renderSelectField = (field, value, common) => {
  const options = Array.isArray(field?.options) ? field.options : []
  const currentValue = value == null ? '' : String(value)
  return `<select ${common}>
    <option value="">请选择</option>
    ${options
      .map((option) => {
        const optionValue = option && typeof option === 'object' ? String(option.value ?? '') : String(option ?? '')
        const optionLabel = option && typeof option === 'object' ? String(option.label ?? optionValue) : optionValue
        return `<option value="${escapeHtml(optionValue)}" ${optionValue === currentValue ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>`
      })
      .join('')}
  </select>`
}

const renderField = (field, value, collectionKey, itemId) => {
  const fieldId = getFieldDomId(field, collectionKey, itemId)
  const common = `id="${fieldId}" name="${escapeHtml(field.key)}" data-field="${escapeHtml(field.key)}" data-collection="${escapeHtml(collectionKey || '')}" data-item-id="${escapeHtml(itemId || '')}"`
  if (isAssetField(field)) {
    return renderAssetInput(field, value, collectionKey, itemId, `${common} autocomplete="off"`)
  }
  if (AUTO_COMPUTED_FIELD_KEYS.has(field.key)) {
    return `<div class="readonly-value readonly-rich">${getDisplayValue(field, value)}</div>`
  }
  if (field.type === 'select') {
    return renderSelectField(field, value, common)
  }
  if (field.type === 'textarea') {
    return `<textarea ${common} autocomplete="${getAutocomplete(field)}">${escapeHtml(value || '')}</textarea>`
  }
  return `<input type="${getInputType(field)}" value="${escapeHtml(value ?? '')}" autocomplete="${getAutocomplete(field)}" ${common} />`
}

const renderSummaryField = (field, value) => `
  <div class="field summary-field">
    <label>${field.label}</label>
    <div class="readonly-value readonly-rich">${getDisplayValue(field, value)}</div>
    ${renderFieldMeta(field)}
  </div>`

const getCompactValue = (field, value) => {
  if (value == null || value === '') {
    return '未配置'
  }
  if (isAssetField(field)) {
    return '已配置图片'
  }
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text.length > 48 ? `${text.slice(0, 48)}…` : text
}

const getFormSectionSummaryFields = (section) => {
  const fields = section.fields || []
  const textFields = fields.filter((field) => !isAssetField(field) && !AUTO_COMPUTED_FIELD_KEYS.has(field.key))
  const assetFields = fields.filter((field) => isAssetField(field))
  return [...textFields, ...assetFields].slice(0, 3)
}

const isConfiguredValue = (value) => {
  if (value == null) {
    return false
  }
  return String(value).trim() !== ''
}

const hasSectionDraftChanges = (section) =>
  (section.fields || []).some((field) => JSON.stringify(state.formData?.[field.key] ?? '') !== JSON.stringify(state.page?.data?.[field.key] ?? ''))

const renderFormSectionRow = (section, index) => {
  const fields = section.fields || []
  const summaryFields = getFormSectionSummaryFields(section)
  const configuredCount = fields.filter((field) => isConfiguredValue(state.formData?.[field.key])).length
  const hasDraft = hasSectionDraftChanges(section)
  return `
    <tr>
      <td>
        <div class="form-section-name">
          <span class="form-section-title">${escapeHtml(section.title || `配置项 ${index + 1}`)}</span>
          <span class="form-section-meta">${configuredCount}/${fields.length} 项已配置${hasDraft ? ' · 有未保存修改' : ''}</span>
        </div>
      </td>
      <td>
        <div class="form-section-summary">
          ${
            summaryFields.length
              ? summaryFields
                  .map(
                    (field) => `
                      <span class="summary-chip ${isConfiguredValue(state.formData?.[field.key]) ? '' : 'summary-chip-muted'}">
                        <span>${escapeHtml(field.label)}</span>
                        <strong>${escapeHtml(getCompactValue(field, state.formData?.[field.key]))}</strong>
                      </span>`,
                  )
                  .join('')
              : '<span class="muted">暂无摘要字段</span>'
          }
        </div>
      </td>
      <td>
        <div class="inline-actions form-section-actions">
          <button class="mini-btn" type="button" data-action="open-form-editor" data-section-index="${index}">编辑</button>
        </div>
      </td>
    </tr>`
}

const renderFormSections = () => {
  ensureFormState()
  const sections = state.page.formSections || []
  return `
    <div class="table-card form-section-card">
      <div class="table-head">
        <div>
          <div class="section-title">配置类目</div>
          <div class="section-copy">按类目编辑并单独保存，列表只展示关键摘要。</div>
        </div>
      </div>
      <div class="table-scroll">
        <table class="table form-section-table">
          <thead>
            <tr>
              <th>类目</th>
              <th>重要信息</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${
              sections.length
                ? sections.map((section, index) => renderFormSectionRow(section, index)).join('')
                : '<tr><td colspan="3"><div class="empty-state">暂无配置类目</div></td></tr>'
            }
          </tbody>
        </table>
      </div>
    </div>`
}

const getSelectedItem = (collection) => {
  const items = getCollectionState(collection)
  const selectedId = state.selected[collection.key]
  return items.find((item) => item.id === selectedId) || items[0] || null
}

const buildBlankItem = (collection) => {
  const blank = { id: `${collection.key}-${Date.now()}` }
  ;(collection.fields || []).forEach((field) => {
    blank[field.key] = field.type === 'number' ? 0 : ''
  })
  return blank
}

const ensureFreeTemplateFilterOption = () => {
  const templateCollection = (state.page?.collections || []).find((collection) => collection.key === 'templates')
  const filterField = templateCollection?.fields?.find((field) => field.key === 'filterId')
  if (!filterField) {
    return
  }
  const options = Array.isArray(filterField.options) ? filterField.options : []
  if (!options.some((option) => String(option?.value ?? option) === 'free')) {
    filterField.options = [{ value: 'free', label: '免费模板 (free)' }, ...options]
  }
}

const openFreeTemplateCreator = () => {
  if (state.slug !== 'content-templates') {
    return
  }
  captureEditorReturnFocus()
  state.editor = {
    mode: 'custom-view',
    context: {
      title: '创建免费模板',
      copy: '确认后会直接写入后台数据，刷新页面也会保留。',
      view: 'table',
      rows: FREE_TEMPLATE_PRESETS,
      columns: [
        { key: 'title', label: '模板名称' },
        { key: 'filterId', label: '分类' },
        { key: 'cost', label: '积分' },
        { key: 'meta', label: '描述' },
      ],
      saveAction: 'save-free-templates',
      saveLabel: '创建并保存',
      canDelete: false,
    },
  }
  render()
}

const renderCollectionEditor = (collection, options = {}) => {
  const items = getCollectionState(collection)
  const readOnly = Boolean(options.readOnly)
  const customActions = Array.isArray(collection.customActions) ? collection.customActions : []
  const pageSize = getPageSize(collection)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const pagerKey = getCollectionPagerKey(collection)
  const currentPage = getCurrentPage(pagerKey, pageCount)
  const start = (currentPage - 1) * pageSize
  const displayItems = items.slice(start, start + pageSize)
  return `
    <section class="collection-card">
      <div class="collection-head">
        <div class="section-title">${collection.title || collection.itemLabel || '&#21015;&#34920;'}</div>
        ${
          readOnly
            ? ''
            : `<div class="inline-actions">
                ${state.slug === 'content-templates' && collection.key === 'templates' ? '<button class="mini-btn mini-btn-hot" type="button" data-action="create-free-templates">创建免费模板</button>' : ''}
                <button class="mini-btn" type="button" data-action="add-item" data-collection="${collection.key}">&#26032;&#22686;${collection.itemLabel || '&#39033;'}</button>
              </div>`
        }
      </div>
      <div class="collection-layout">
        <div class="table-card">
          <div class="table-scroll">
            <table class="table table-selectable">
              <thead>
                <tr>
                  ${collection.columns.map((column) => `<th>${column.label}</th>`).join('')}
                  ${readOnly ? '' : '<th>&#25805;&#20316;</th>'}
                </tr>
              </thead>
              <tbody>
                ${
                  displayItems.length
                    ? displayItems
                        .map(
                          (item) => `
                        <tr>
                          ${collection.columns.map((column) => `<td>${renderTableCell(column, item)}</td>`).join('')}
                          ${
                            readOnly
                              ? ''
                              : `<td>
                                  <div class="table-actions">
                                    ${customActions
                                      .map(
                                        (action) => `<button class="mini-btn" type="button" data-action="custom-item-action" data-collection="${collection.key}" data-item-id="${item.id}" data-custom-action="${action.key}">${item[action.labelKey] || action.label}</button>`,
                                      )
                                      .join('')}
                                    <button class="mini-btn" type="button" data-action="edit-item" data-collection="${collection.key}" data-item-id="${item.id}">&#32534;&#36753;</button>
                                  </div>
                                </td>`
                          }
                        </tr>`,
                        )
                        .join('')
                    : `<tr><td colspan="${collection.columns.length + (readOnly ? 0 : 1)}"><div class="empty-state">暂无数据</div></td></tr>`
                }
              </tbody>
            </table>
          </div>
          ${renderPagination({ pagerKey, pageSize, totalRows: items.length, currentPage, pageCount })}
        </div>
      </div>
    </section>`
}
const renderMultiCollection = () => {
  ensureMetaState()
  return `
    ${
      state.page.metaFields?.length
        ? `
      <section class="section-card">
        <div class="section-head">
          <div class="section-title">基础配置</div>
          <div class="inline-actions">
            <button class="mini-btn" type="button" data-action="open-meta-editor">编辑</button>
          </div>
        </div>
        <div class="field-grid">
          ${state.page.metaFields.map((field) => renderSummaryField(field, state.meta[field.key])).join('')}
        </div>
      </section>`
        : ''
    }
    <div class="section-stack">
      ${(state.page.collections || []).map((collection) => renderCollectionEditor(collection, { readOnly: Boolean(collection.readOnly) })).join('')}
    </div>`
}

const renderReadonlyTables = () =>
  (state.page.tables || [])
    .map((table) => renderTable(table, table.rows || []))
    .join('')

const renderNotes = () =>
  (state.page.notes || [])
    .map((note) => `<div class="notice-item"><div class="notice-item-copy">${note}</div></div>`)
    .join('')

const renderWorkspace = () => {
  if (state.page.view === 'dashboard') {
    return `
      ${renderTable(state.page.table)}
      <section class="notice-card" style="margin-top:18px;">
        <div class="section-head"><div class="section-title">运营提示</div></div>
        <div class="notice-list">${renderNotes()}</div>
      </section>`
  }

  if (state.page.view === 'form') {
    return renderFormSections()
  }

  if (state.page.view === 'collection') {
    return renderCollectionEditor(state.page.collection)
  }

  if (state.page.view === 'multi-collection') {
    return renderMultiCollection()
  }

  if (state.page.view === 'readonly') {
    return renderReadonlyTables()
  }

  return `<div class="empty-state">未识别页面类型</div>`
}

const getEditorContext = () => {
  if (!state.editor) {
    return null
  }
  if (state.editor.mode === 'form-section') {
    ensureFormState()
    const section = state.page?.formSections?.[state.editor.sectionIndex]
    if (!section) {
      return null
    }
    return {
      title: state.editor.title,
      copy: '编辑完成后保存当前类目，不会提交其他类目的未保存修改。',
      fields: section.fields || [],
      collectionKey: 'form',
      itemId: 'form',
      values: state.formData,
      saveAction: 'save-form-section',
      sectionIndex: state.editor.sectionIndex,
    }
  }
  if (state.editor.mode === 'meta') {
    ensureMetaState()
    return {
      title: state.editor.title,
      copy: '编辑完成后保存当前配置，不会提交第一页的整页内容。',
      fields: state.page?.metaFields || [],
      collectionKey: 'meta',
      itemId: 'meta',
      values: state.meta,
      saveAction: 'save-meta',
    }
  }
  if (state.editor.mode === 'collection-item') {
    const collection = getCollectionDefinition(state.editor.collectionKey)
    const item = (state.collections[state.editor.collectionKey] || []).find((entry) => entry.id === state.editor.itemId)
    if (!collection || !item) {
      return null
    }
    return {
      title: state.editor.title,
      copy: '编辑完成后保存当前项，不会提交第一页的整页内容。',
      fields: collection.fields || [],
      collectionKey: collection.key,
      itemId: item.id,
      values: item,
      canDelete: true,
      saveAction: 'save-collection-item',
    }
  }
  if (state.editor.mode === 'custom-view') {
    return state.editor.context || null
  }
  return null
}

const renderEditorOverlay = () => {
  const context = getEditorContext()
  if (!context) {
    return ''
  }
  return `
    <div class="editor-overlay-shell">
      <div class="editor-overlay-backdrop"></div>
      <section class="editor-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(context.title)}" tabindex="-1">
        <div class="editor-dialog-head">
          <div>
            <div class="editor-dialog-title">${context.title}</div>
            <div class="editor-dialog-copy">${context.copy}</div>
          </div>
          ${getEditorCloseButton()}
        </div>
        <div class="editor-dialog-body">
          ${
            context.view === 'table'
              ? renderTable(
                  {
                    title: '',
                    columns: context.columns || [],
                  },
                  context.rows || [],
                )
              : `<div class="field-grid editor-dialog-grid">
                  ${context.fields
                    .map(
                      (field) => {
                        const fieldId = getFieldDomId(field, context.collectionKey, context.itemId)
                        return `
                    <div class="field">
                      <label for="${fieldId}">${escapeHtml(field.label)}</label>
                      ${renderField(field, context.values?.[field.key], context.collectionKey, context.itemId)}
                      ${isAssetField(field) || AUTO_COMPUTED_FIELD_KEYS.has(field.key) ? '' : renderFieldMeta(field)}
                    </div>`
                      },
                    )
                    .join('')}
                </div>`
          }
        </div>
        ${
          context.canDelete || context.saveAction
            ? `<div class="editor-dialog-foot">
                ${context.canDelete ? `<button class="danger-inline" type="button" data-action="remove-item" data-collection="${context.collectionKey}" data-item-id="${context.itemId}" data-close-editor="1">删除当前项</button>` : '<span></span>'}
                ${context.saveAction ? `<button class="action-btn" type="button" data-action="${context.saveAction}" data-section-index="${context.sectionIndex ?? ''}" data-collection="${context.collectionKey || ''}" data-item-id="${context.itemId || ''}">${icon('icon-publish')} ${context.saveLabel || '保存此项'}</button>` : ''}
              </div>`
            : ''
        }
      </section>
    </div>`
}

const isEditable = () => ['form', 'collection', 'multi-collection'].includes(state.page?.view)

const getCurrentMetaState = () => {
  if (Object.keys(state.meta).length) {
    return clone(state.meta)
  }
  return clone(state.page?.meta || {})
}

const getOriginalItemsForCollection = (collectionKey) => {
  if (state.page?.view === 'collection' && state.page.collection?.key === collectionKey) {
    return clone(state.page.collection.items || [])
  }
  const collection = (state.page?.collections || []).find((entry) => entry.key === collectionKey)
  return clone(collection?.items || [])
}

const getCurrentItemsForCollection = (collectionKey) => {
  if (state.collections[collectionKey]) {
    return clone(state.collections[collectionKey])
  }
  return getOriginalItemsForCollection(collectionKey)
}

const buildCollectionPayload = ({ collectionKey, items, meta }) => {
  if (state.page.view === 'collection') {
    return {
      meta: meta || getCurrentMetaState(),
      items: clone(items || getCurrentItemsForCollection(collectionKey || state.page.collection.key)),
    }
  }

  if (state.page.view === 'multi-collection') {
    const collections = {}
    ;(state.page.collections || []).forEach((collection) => {
      collections[collection.key] =
        collection.key === collectionKey
          ? clone(items || getCurrentItemsForCollection(collection.key))
          : getOriginalItemsForCollection(collection.key)
    })
    return { meta: meta || getCurrentMetaState(), collections }
  }

  return buildPayload()
}

const buildPayload = () => {
  if (state.page.view === 'form') {
    ensureFormState()
    return { data: clone(state.formData) }
  }

  if (state.page.view === 'collection') {
    return buildCollectionPayload({ collectionKey: state.page.collection.key })
  }

  if (state.page.view === 'multi-collection') {
    return buildCollectionPayload({})
  }

  return {}
}

const buildFormSectionPayload = (sectionIndex) => {
  ensureFormState()
  const section = state.page?.formSections?.[sectionIndex]
  if (!section) {
    return { data: clone(state.page?.data || {}) }
  }
  const nextData = clone(state.page?.data || {})
  ;(section.fields || []).forEach((field) => {
    nextData[field.key] = state.formData?.[field.key]
  })
  return { data: nextData }
}

const buildCollectionItemPayload = (collectionKey, itemId) => {
  const currentItem = (state.collections[collectionKey] || []).find((entry) => entry.id === itemId)
  if (!currentItem) {
    return buildCollectionPayload({ collectionKey })
  }
  return buildCollectionPayload({ collectionKey, items: getCurrentItemsForCollection(collectionKey) })
}

const buildCollectionDeletePayload = (collectionKey, itemId) => {
  const nextItems = getCurrentItemsForCollection(collectionKey).filter((item) => item.id !== itemId)
  return buildCollectionPayload({ collectionKey, items: nextItems })
}

const buildMetaPayload = () => buildCollectionPayload({ meta: getCurrentMetaState() })

const buildFreeTemplatesPayload = () => {
  const filters = getCurrentItemsForCollection('filters')
  if (!filters.some((item) => item.id === 'free')) {
    filters.unshift({ id: 'free', name: '免费模板' })
  }

  const templates = getCurrentItemsForCollection('templates')
  const byId = new Map(templates.map((item) => [item.id, item]))
  const presetIds = new Set(FREE_TEMPLATE_PRESETS.map((preset) => preset.id))
  const freeTemplates = FREE_TEMPLATE_PRESETS.map((preset) => ({
    ...preset,
    ...(byId.get(preset.id) || {}),
  }))
  const payload = buildCollectionPayload({
    collectionKey: 'templates',
    items: [
      ...freeTemplates,
      ...templates.filter((item) => !presetIds.has(item.id)),
    ],
  })
  if (payload.collections) {
    payload.collections.filters = filters
  }
  return payload
}

const syncAssetPreview = (input) => {
  const wrapper = input.closest('.asset-field')
  const preview = wrapper?.querySelector('.asset-preview')
  if (!preview) {
    return
  }
  const value = String(input.value || '').trim()
  if (!value) {
    preview.classList.add('asset-preview-empty')
    preview.innerHTML = '<span>未上传图片</span>'
    return
  }
  preview.classList.remove('asset-preview-empty')
  preview.innerHTML = `<img src="${escapeHtml(value)}" alt="素材预览" data-role="asset-preview" width="960" height="540" loading="lazy" />`
}

const applyFieldValue = ({ collectionKey, itemId, fieldKey, value }) => {
  const input = document.querySelector(
    `[data-field="${fieldKey}"][data-collection="${collectionKey || ''}"][data-item-id="${itemId || ''}"]`,
  )
  if (input) {
    input.value = value
    syncAssetPreview(input)
  }

  if (collectionKey === 'form' || collectionKey === 'meta') {
    if (collectionKey === 'form') {
      state.formData[fieldKey] = value
    }
    if (collectionKey === 'meta') {
      state.meta[fieldKey] = value
    }
    return
  }

  const items = state.collections[collectionKey] || []
  const item = items.find((entry) => entry.id === itemId)
  if (item) {
    item[fieldKey] = value
  }
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })

const uploadAsset = async (fileInput) => {
  const file = fileInput.files?.[0]
  if (!file) {
    return
  }

  try {
    setStatus('上传图片中…', 'normal')
    const dataUrl = await readFileAsDataUrl(file)
    const payload = await request(imageUploadEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        category: fileInput.dataset.uploadCategory || 'general',
        dataUrl,
        fileName: file.name,
      }),
    })

    applyFieldValue({
      collectionKey: fileInput.dataset.uploadCollection,
      itemId: fileInput.dataset.uploadItemId,
      fieldKey: fileInput.dataset.uploadField,
      value: payload.asset.url,
    })
    setStatus('图片上传成功', 'success')
  } catch (error) {
    setStatus(error.message || '图片上传失败', 'error')
  } finally {
    fileInput.value = ''
  }
}

const render = () => {
  const page = state.page
  const showPageSave = false
  document.title = `${page.title} - 酒桌判官后台`
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-badge">${icon('icon-dashboard')} Heatwave Ops</span>
          <div class="brand-title">酒桌判官后台</div>
        </div>
        ${renderSidebar()}
      </aside>
      <main class="content">
        <header class="topbar">
          <div class="topbar-context">
            <span class="topbar-kicker">管理后台</span>
            <h1>${escapeHtml(page.title)}</h1>
          </div>
          <div class="topbar-actions">
            <span class="status-badge" data-role="status" role="status" aria-live="polite" data-type="normal">已连接后台</span>
            <span class="user-pill">${icon('icon-user')} ${escapeHtml(state.user.name)}</span>
            <button class="ghost-btn ghost-btn-dark" type="button" data-action="logout">${icon('icon-settings')} 退出</button>
          </div>
        </header>

        <section class="metric-grid">${renderMetrics()}</section>

        <div class="toolbar">
          <div class="toolbar-head">
            <div class="toolbar-title">${escapeHtml(page.title)}</div>
            <div class="toolbar-copy">当前页面已接入真实后台接口</div>
          </div>
          <div class="toolbar-actions">
            ${showPageSave ? `<button class="action-btn" type="button" data-action="save-page">${icon('icon-publish')} 保存修改</button>` : ''}
            <a class="ghost-btn ghost-btn-light" href="/admin/ui-kit">${icon('icon-eye')} UI Kit</a>
          </div>
        </div>

        <section class="page-stack">
          ${renderWorkspace()}
        </section>
      </main>
    </div>`
    + renderEditorOverlay()

  bindEvents()
}

const bindEvents = () => {
  document.querySelector('[data-action="logout"]')?.addEventListener('click', async () => {
    await request('/api/v1/admin/auth/logout', { method: 'POST' }).catch(() => null)
    window.location.href = '/admin/login'
  })

  document.querySelector('[data-action="create-free-templates"]')?.addEventListener('click', openFreeTemplateCreator)

  document.querySelectorAll('[data-action="toggle-nav-group"]').forEach((node) => {
    node.addEventListener('click', () => {
      state.navOpen[node.dataset.group] = !state.navOpen[node.dataset.group]
      persistNavState()
      render()
    })
  })

  document.querySelectorAll('[data-action="table-page"]').forEach((node) => {
    node.addEventListener('click', () => {
      if (node.disabled) {
        return
      }
      setPagerPage(node.dataset.tableKey, node.dataset.page)
      render()
    })
  })
  document.querySelectorAll('[data-action="add-item"]').forEach((node) => {
    node.addEventListener('click', () => {
      const collection = getCollectionDefinition(node.dataset.collection)
      if (!collection) {
        return
      }
      const items = getCollectionState(collection)
      const blank = buildBlankItem(collection)
      items.unshift(blank)
      state.selected[collection.key] = blank.id
      openCollectionItemEditor(collection.key, blank.id, true)
    })
  })

  document.querySelectorAll('[data-action="open-form-editor"]').forEach((node) => {
    node.addEventListener('click', () => {
      openFormSectionEditor(Number(node.dataset.sectionIndex))
    })
  })

  document.querySelectorAll('[data-action="save-form-section"]').forEach((node) => {
    node.addEventListener('click', () => {
      void saveFormSection(Number(node.dataset.sectionIndex))
    })
  })

  document.querySelectorAll('[data-action="save-meta"]').forEach((node) => {
    node.addEventListener('click', () => {
      void saveMeta()
    })
  })

  document.querySelectorAll('[data-action="save-collection-item"]').forEach((node) => {
    node.addEventListener('click', () => {
      void saveCollectionItem(node.dataset.collection, node.dataset.itemId)
    })
  })

  document.querySelectorAll('[data-action="save-free-templates"]').forEach((node) => {
    node.addEventListener('click', () => {
      void saveFreeTemplates()
    })
  })

  document.querySelectorAll('[data-action="open-meta-editor"]').forEach((node) => {
    node.addEventListener('click', () => {
      openMetaEditor()
    })
  })

  document.querySelectorAll('[data-action="edit-item"]').forEach((node) => {
    node.addEventListener('click', () => {
      openCollectionItemEditor(node.dataset.collection, node.dataset.itemId)
    })
  })

  document.querySelectorAll('[data-action="custom-item-action"]').forEach((node) => {
    node.addEventListener('click', () => {
      const collection = getCollectionDefinition(node.dataset.collection)
      const item = (state.collections[node.dataset.collection] || []).find((entry) => entry.id === node.dataset.itemId)
      const action = (collection?.customActions || []).find((entry) => entry.key === node.dataset.customAction)
      if (!collection || !item || !action) {
        return
      }
      state.editor = {
        mode: 'custom-view',
        context: {
          title: action.title || action.label,
          copy: '该列表为后台真实绑定数据，仅用于查看。',
          view: action.mode,
          rows: Array.isArray(item[action.rowsKey]) ? item[action.rowsKey] : [],
          columns: action.columns || [],
          canDelete: false,
        },
      }
      captureEditorReturnFocus()
      render()
    })
  })

  document.querySelectorAll('[data-action="close-editor"]').forEach((node) => {
    node.addEventListener('click', () => {
      closeEditor()
    })
  })

  const dialog = document.querySelector('.editor-dialog')
  if (dialog) {
    const focusTarget =
      dialog.querySelector('.editor-dialog-body input:not([type="hidden"]), .editor-dialog-body select, .editor-dialog-body textarea') ||
      dialog.querySelector('button, a[href]') ||
      dialog
    requestAnimationFrame(() => focusTarget.focus())
    window.onkeydown = (event) => {
      if (event.key === 'Escape') closeEditor()
    }
  } else {
    window.onkeydown = null
  }

  document.querySelectorAll('[data-action="remove-item"]').forEach((node) => {
    node.addEventListener('click', () => {
      void removeCollectionItem(node.dataset.collection, node.dataset.itemId)
    })
  })

  document.querySelectorAll('[data-collection]').forEach((node) => {
    node.addEventListener('input', (event) => {
      const target = event.currentTarget
      const nextValue = target.type === 'number' ? Number(target.value) || 0 : target.value
      if (target.dataset.collection === 'form') {
        state.formData[target.dataset.field] = nextValue
        if (target.classList.contains('asset-input-control')) {
          syncAssetPreview(target)
        }
        return
      }
      if (target.dataset.collection === 'meta') {
        state.meta[target.dataset.field] = nextValue
        if (target.classList.contains('asset-input-control')) {
          syncAssetPreview(target)
        }
        return
      }
      const items = state.collections[target.dataset.collection] || []
      const item = items.find((entry) => entry.id === target.dataset.itemId)
      if (!item) return
      item[target.dataset.field] = nextValue
      if (target.classList.contains('asset-input-control')) {
        syncAssetPreview(target)
      }
    })
  })

  document.querySelectorAll('[data-action="upload-asset"]').forEach((node) => {
    node.addEventListener('change', () => {
      void uploadAsset(node)
    })
  })
}

const savePage = async () => {
  try {
    setStatus('保存中…', 'normal')
    const data = await request(`/api/v1/admin/pages/${state.slug}`, {
      method: 'PUT',
      body: JSON.stringify(buildPayload()),
    })
    state.user = data.user
    state.page = data.page
    state.formData = {}
    state.collections = {}
    state.selected = {}
    state.meta = {}
    state.editor = null
    render()
    setStatus('保存成功', 'success')
  } catch (error) {
    setStatus(error.message || '保存失败', 'error')
  }
}

const saveFormSection = async (sectionIndex) => {
  const section = state.page?.formSections?.[sectionIndex]
  if (!section) {
    setStatus('未找到要保存的类目', 'error')
    return
  }

  try {
    setStatus(`${section.title}保存中…`, 'normal')
    const data = await request(`/api/v1/admin/pages/${state.slug}`, {
      method: 'PUT',
      body: JSON.stringify(buildFormSectionPayload(sectionIndex)),
    })
    state.user = data.user
    state.page = data.page
    state.formData = clone(data.page.data || {})
    if (state.editor?.mode === 'form-section' && Number(state.editor.sectionIndex) === sectionIndex) {
      state.editor = null
    }
    render()
    setStatus(`${section.title}已保存`, 'success')
  } catch (error) {
    setStatus(error.message || `${section.title}保存失败`, 'error')
  }
}

const resetPageState = (data) => {
  state.user = data.user
  state.page = data.page
  state.formData = {}
  state.collections = {}
  state.selected = {}
  state.meta = {}
  state.editor = null
}

const saveMeta = async () => {
  try {
    setStatus('基础配置保存中…', 'normal')
    const data = await request(`/api/v1/admin/pages/${state.slug}`, {
      method: 'PUT',
      body: JSON.stringify(buildMetaPayload()),
    })
    resetPageState(data)
    render()
    setStatus('基础配置已保存', 'success')
  } catch (error) {
    setStatus(error.message || '基础配置保存失败', 'error')
  }
}

const saveCollectionItem = async (collectionKey, itemId) => {
  const collection = getCollectionDefinition(collectionKey)
  const item = (state.collections[collectionKey] || []).find((entry) => entry.id === itemId)
  if (!collection || !item) {
    setStatus('未找到要保存的记录', 'error')
    return
  }
  if (!isMeaningfulItem(item, collection.fields || [])) {
    setStatus('请先填写当前项内容', 'error')
    return
  }

  try {
    setStatus(`${collection.itemLabel || '当前项'}保存中…`, 'normal')
    const data = await request(`/api/v1/admin/pages/${state.slug}`, {
      method: 'PUT',
      body: JSON.stringify(buildCollectionItemPayload(collectionKey, itemId)),
    })
    resetPageState(data)
    render()
    setStatus(`${collection.itemLabel || '当前项'}已保存`, 'success')
  } catch (error) {
    setStatus(error.message || `${collection.itemLabel || '当前项'}保存失败`, 'error')
  }
}

const saveFreeTemplates = async () => {
  if (state.slug !== 'content-templates') {
    setStatus('当前页面不能创建免费模板', 'error')
    return
  }
  const templatesCollection = (state.page.collections || []).find((collection) => collection.key === 'templates')
  try {
    setStatus('免费模板创建中…', 'normal')
    const data = await request(`/api/v1/admin/pages/${state.slug}`, {
      method: 'PUT',
      body: JSON.stringify(buildFreeTemplatesPayload()),
    })
    if (templatesCollection) {
      setPagerPage(getCollectionPagerKey(templatesCollection), 1)
    }
    resetPageState(data)
    render()
    setStatus('免费模板已创建并保存', 'success')
  } catch (error) {
    setStatus(error.message || '免费模板创建失败', 'error')
  }
}

const removeCollectionItem = async (collectionKey, itemId) => {
  const collection = getCollectionDefinition(collectionKey)
  if (!collection || !itemId) {
    setStatus('未找到要删除的记录', 'error')
    return
  }
  if (!window.confirm('确认删除这条记录？')) {
    return
  }

  try {
    setStatus(`${collection.itemLabel || '当前项'}删除中…`, 'normal')
    const data = await request(`/api/v1/admin/pages/${state.slug}`, {
      method: 'PUT',
      body: JSON.stringify(buildCollectionDeletePayload(collectionKey, itemId)),
    })
    resetPageState(data)
    render()
    setStatus(`${collection.itemLabel || '当前项'}已删除`, 'success')
  } catch (error) {
    setStatus(error.message || `${collection.itemLabel || '当前项'}删除失败`, 'error')
  }
}

const init = async () => {
  try {
    const session = await request('/api/v1/admin/auth/session')
    state.user = session.user
    const data = await request(`/api/v1/admin/pages/${state.slug}`)
    state.page = data.page
    render()
  } catch (error) {
    if (error.status === 401) {
      window.location.href = '/admin/login'
      return
    }
    document.getElementById('app').innerHTML = `<div class="error-screen">${error.message || '后台加载失败'}</div>`
  }
}

init()


