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
  </div>`

const renderField = (field, value, collectionKey, itemId) => {
  const common = `data-field="${field.key}" data-collection="${collectionKey || ''}" data-item-id="${itemId || ''}"`
  if (isAssetField(field)) {
    return renderAssetInput(field, value, collectionKey, itemId)
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
