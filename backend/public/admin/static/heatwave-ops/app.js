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
      { slug: 'content-tools-ops', title: '工具箱运营', icon: 'icon-tool' },
    ],
  },
  {
    key: 'community',
    title: '用户与酒局',
    items: [
      { slug: 'user-profiles', title: '用户中心', icon: 'icon-user' },
      { slug: 'user-login-logs', title: '用户登录记录', icon: 'icon-user' },
      { slug: 'social-friends', title: '酒友社交', icon: 'icon-friends' },
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
      { slug: 'commerce-ads', title: '广告运营', icon: 'icon-ads' },
      { slug: 'commerce-merchants', title: '商户合作', icon: 'icon-store' },
      { slug: 'commerce-campaigns', title: '裂变活动', icon: 'icon-share' },
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
      { slug: 'system-compliance', title: '合规风控', icon: 'icon-alert' },
    ],
  },
]

const state = {
  slug: document.body.dataset.page || 'overview-dashboard',
  user: null,
  page: null,
  collections: {},
  selected: {},
  meta: {},
  navOpen: {},
}

const icon = (id, cls = 'ui-icon') => `<svg class="${cls}" aria-hidden="true"><use href="/admin/static/heatwave-ops/icons.svg#${id}"></use></svg>`

const clone = (value) => JSON.parse(JSON.stringify(value))
const navStateKey = 'heatwave-ops-nav-open-v2'
const imageUploadEndpoint = '/api/v1/admin/uploads/image'
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

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
    return '手机号作为用户唯一识别信息使用，修改后会影响用户绑定与后台检索。'
  }
  if (key.includes('openid') || key.includes('wechat')) {
    return '仅用于微信用户强绑定和审计追踪，非排障场景不要手动改写。'
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
    return '展示时建议使用脱敏手机号；仅在确需修正绑定关系时修改原始手机号。'
  }
  if (key.includes('openid') || key.includes('wechat')) {
    return '如需排障，优先复制后核对，不建议直接手填，避免破坏用户与微信身份映射。'
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

const renderTable = (table, rows = table.rows || []) => `
  <div class="table-card">
    <div class="table-head">
      <div>
        <div class="section-title">${table.title || '列表'}</div>
      </div>
    </div>
    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr>${table.columns.map((column) => `<th>${column.label}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(
                    (row) => `
                <tr>
                  ${table.columns
                    .map((column) => `<td>${row[column.key] == null || row[column.key] === '' ? '<span class="muted">-</span>' : String(row[column.key])}</td>`)
                    .join('')}
                </tr>`,
                  )
                  .join('')
              : `<tr><td colspan="${table.columns.length}"><div class="empty-state">暂无数据</div></td></tr>`
          }
        </tbody>
      </table>
    </div>
  </div>`

const renderAssetInput = (field, value, collectionKey, itemId) => `
  <div class="asset-field">
    <div class="asset-input-row">
      <input
        class="asset-input-control"
        type="text"
        value="${value ?? ''}"
        data-field="${field.key}"
        data-collection="${collectionKey || ''}"
        data-item-id="${itemId || ''}"
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
      ${value ? `<img src="${value}" alt="${field.label}" data-role="asset-preview" />` : '<span>未上传图片</span>'}
    </div>
    ${renderFieldMeta(field)}
  </div>`

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
  const common = `data-field="${field.key}" data-collection="${collectionKey || ''}" data-item-id="${itemId || ''}"`
  if (isAssetField(field)) {
    return renderAssetInput(field, value, collectionKey, itemId)
  }
  if (field.type === 'select') {
    return renderSelectField(field, value, common)
  }
  if (field.type === 'textarea') {
    return `<textarea ${common}>${value || ''}</textarea>`
  }
  return `<input type="${field.type === 'number' ? 'number' : 'text'}" value="${value ?? ''}" ${common} />`
}

const renderFormSections = () =>
  (state.page.formSections || [])
    .map(
      (section) => `
      <section class="section-card">
        <div class="section-head">
          <div class="section-title">${section.title}</div>
        </div>
        <div class="field-grid">
          ${section.fields
            .map(
              (field) => `
            <div class="field">
              <label>${field.label}</label>
              ${renderField(field, state.page.data?.[field.key], 'form', 'form')}
              ${isAssetField(field) ? '' : renderFieldMeta(field)}
            </div>`,
            )
            .join('')}
        </div>
      </section>`,
    )
    .join('')

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

const renderCollectionEditor = (collection, options = {}) => {
  const items = getCollectionState(collection)
  const selected = getSelectedItem(collection)
  const readOnly = Boolean(options.readOnly)
  return `
    <section class="collection-card">
      <div class="collection-head">
        <div class="section-title">${collection.title || collection.itemLabel || '列表'}</div>
        ${readOnly ? '' : `<div class="inline-actions"><button class="mini-btn" data-action="add-item" data-collection="${collection.key}">新增${collection.itemLabel || '项'}</button></div>`}
      </div>
      <div class="collection-layout">
        <div class="table-card">
          <div class="table-scroll">
            <table class="table table-selectable">
              <thead>
                <tr>${collection.columns.map((column) => `<th>${column.label}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${
                  items.length
                    ? items
                        .map(
                          (item) => `
                        <tr class="${item.id === selected?.id ? 'row-active' : ''}" data-action="select-item" data-collection="${collection.key}" data-item-id="${item.id}">
                          ${collection.columns.map((column) => `<td>${item[column.key] ?? ''}</td>`).join('')}
                        </tr>`,
                        )
                        .join('')
                    : `<tr><td colspan="${collection.columns.length}"><div class="empty-state">暂无${collection.itemLabel || '数据'}</div></td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
        <aside class="editor-panel">
          ${
            selected
              ? `
            <div class="panel-head">
              <div class="section-title">${collection.itemLabel || '详情'}编辑</div>
              ${readOnly ? '' : `<button class="danger-inline" data-action="remove-item" data-collection="${collection.key}" data-item-id="${selected.id}">删除</button>`}
            </div>
            <div class="field-grid">
              ${collection.fields
                .map(
                  (field) => `
                <div class="field">
                  <label>${field.label}</label>
                  ${readOnly ? `<div class="readonly-value">${selected[field.key] ?? ''}</div>` : renderField(field, selected[field.key], collection.key, selected.id)}
                  ${readOnly || !isAssetField(field) ? renderFieldMeta(field) : ''}
                </div>`,
                )
                .join('')}
            </div>`
              : `<div class="empty-state">请选择${collection.itemLabel || '项'}</div>`
          }
        </aside>
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
        </div>
        <div class="field-grid">
          ${state.page.metaFields
            .map(
              (field) => `
            <div class="field">
              <label>${field.label}</label>
              ${renderField(field, state.meta[field.key], 'meta', 'meta')}
              ${isAssetField(field) ? '' : renderFieldMeta(field)}
            </div>`,
            )
            .join('')}
        </div>
      </section>`
        : ''
    }
    <div class="section-stack">
      ${(state.page.collections || []).map((collection) => renderCollectionEditor(collection)).join('')}
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

const isEditable = () => ['form', 'collection', 'multi-collection'].includes(state.page?.view)

const buildPayload = () => {
  if (state.page.view === 'form') {
    const data = {}
    document.querySelectorAll('[data-collection="form"]').forEach((node) => {
      data[node.dataset.field] = node.value
    })
    return { data }
  }

  if (state.page.view === 'collection') {
    return { items: state.collections[state.page.collection.key] || [] }
  }

  if (state.page.view === 'multi-collection') {
    const meta = {}
    document.querySelectorAll('[data-collection="meta"]').forEach((node) => {
      meta[node.dataset.field] = node.value
    })
    const collections = {}
    ;(state.page.collections || []).forEach((collection) => {
      collections[collection.key] = state.collections[collection.key] || []
    })
    return { meta, collections }
  }

  return {}
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
  preview.innerHTML = `<img src="${value}" alt="asset preview" data-role="asset-preview" />`
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
    setStatus('上传图片中...', 'normal')
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
          <label class="topbar-search">
            ${icon('icon-search')}
            <input value="${page.title}" readonly />
          </label>
          <div class="topbar-actions">
            <span class="status-badge" data-role="status" data-type="normal">已连接后台</span>
            <span class="user-pill">${icon('icon-user')} ${state.user.name}</span>
            <button class="ghost-btn ghost-btn-dark" data-action="logout">${icon('icon-settings')} 退出</button>
          </div>
        </header>

        <section class="metric-grid">${renderMetrics()}</section>

        <div class="toolbar">
          <div class="toolbar-head">
            <div class="toolbar-title">${page.title}</div>
            <div class="toolbar-copy">当前页面已接入真实后台接口</div>
          </div>
          <div class="toolbar-actions">
            ${isEditable() ? `<button class="action-btn" data-action="save-page">${icon('icon-publish')} 保存修改</button>` : ''}
            <a class="ghost-btn ghost-btn-light" href="/admin/ui-kit">${icon('icon-eye')} UI Kit</a>
          </div>
        </div>

        <section class="page-stack">
          ${renderWorkspace()}
        </section>
      </main>
    </div>`

  bindEvents()
}

const bindEvents = () => {
  document.querySelector('[data-action="logout"]')?.addEventListener('click', async () => {
    await request('/api/v1/admin/auth/logout', { method: 'POST' }).catch(() => null)
    window.location.href = '/admin/login'
  })

  document.querySelector('[data-action="save-page"]')?.addEventListener('click', savePage)

  document.querySelectorAll('[data-action="toggle-nav-group"]').forEach((node) => {
    node.addEventListener('click', () => {
      state.navOpen[node.dataset.group] = !state.navOpen[node.dataset.group]
      persistNavState()
      render()
    })
  })

  document.querySelectorAll('[data-action="select-item"]').forEach((node) => {
    node.addEventListener('click', () => {
      state.selected[node.dataset.collection] = node.dataset.itemId
      render()
    })
  })

  document.querySelectorAll('[data-action="add-item"]').forEach((node) => {
    node.addEventListener('click', () => {
      const collection = state.page.collections
        ? state.page.collections.find((item) => item.key === node.dataset.collection)
        : state.page.collection
      const items = getCollectionState(collection)
      const blank = buildBlankItem(collection)
      items.unshift(blank)
      state.selected[collection.key] = blank.id
      render()
    })
  })

  document.querySelectorAll('[data-action="remove-item"]').forEach((node) => {
    node.addEventListener('click', () => {
      const key = node.dataset.collection
      state.collections[key] = (state.collections[key] || []).filter((item) => item.id !== node.dataset.itemId)
      state.selected[key] = state.collections[key]?.[0]?.id || ''
      render()
    })
  })

  document.querySelectorAll('[data-collection]').forEach((node) => {
    if (node.dataset.collection === 'form' || node.dataset.collection === 'meta') {
      if (node.classList.contains('asset-input-control')) {
        node.addEventListener('input', () => {
          syncAssetPreview(node)
        })
      }
      return
    }
    node.addEventListener('input', (event) => {
      const target = event.currentTarget
      const items = state.collections[target.dataset.collection] || []
      const item = items.find((entry) => entry.id === target.dataset.itemId)
      if (!item) return
      item[target.dataset.field] = target.type === 'number' ? Number(target.value) || 0 : target.value
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
    setStatus('保存中...', 'normal')
    const data = await request(`/api/v1/admin/pages/${state.slug}`, {
      method: 'PUT',
      body: JSON.stringify(buildPayload()),
    })
    state.user = data.user
    state.page = data.page
    state.collections = {}
    state.selected = {}
    state.meta = {}
    render()
    setStatus('保存成功', 'success')
  } catch (error) {
    setStatus(error.message || '保存失败', 'error')
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
