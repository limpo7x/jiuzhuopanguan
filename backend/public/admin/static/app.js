const apiBase = '/api/v1'

const state = {
  home: null,
  points: null,
  templates: null,
}

const $ = (selector) => document.querySelector(selector)

const statusNode = $('#status')

const setStatus = (text, type = 'normal') => {
  statusNode.textContent = text
  statusNode.style.color = type === 'error' ? '#c8543f' : type === 'success' ? '#24875d' : '#8b735d'
}

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  const payload = await response.json()
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || payload.error || '请求失败')
  }

  return payload.data
}

const renderHome = () => {
  if (!state.home) return
  $('#home-title').value = state.home.hero.title || ''
  $('#home-subtitle').value = state.home.hero.subtitle || ''
  $('#home-image').value = state.home.hero.imageUrl || ''
  $('#home-image-preview').src = state.home.hero.imageUrl || ''
}

const buildInput = (value, field, index, section, type = 'text') =>
  `<input data-section="${section}" data-index="${index}" data-field="${field}" type="${type}" value="${String(value ?? '').replace(/"/g, '&quot;')}" />`

const renderPoints = () => {
  if (!state.points) return

  $('#points-balance').value = state.points.balance || 0
  $('#points-banner-image').value = state.points.bannerImageUrl || ''

  $('#points-tasks').innerHTML = `<div class="list">${state.points.tasks
    .map(
      (item, index) => `
        <div class="list-item grid-3">
          ${buildInput(item.title, 'title', index, 'tasks')}
          ${buildInput(item.value, 'value', index, 'tasks', 'number')}
          ${buildInput(item.iconClass, 'iconClass', index, 'tasks')}
          <div class="list-item-actions field-full">
            <button class="danger-btn" data-action="remove-task" data-index="${index}">删除</button>
          </div>
        </div>
      `,
    )
    .join('')}</div>`

  $('#points-rewards').innerHTML = `<div class="list">${state.points.rewards
    .map(
      (item, index) => `
        <div class="list-item grid-4">
          ${buildInput(item.title, 'title', index, 'rewards')}
          ${buildInput(item.subtitle, 'subtitle', index, 'rewards')}
          ${buildInput(item.cost, 'cost', index, 'rewards', 'number')}
          ${buildInput(item.iconClass, 'iconClass', index, 'rewards')}
          <div class="list-item-actions field-full">
            <button class="danger-btn" data-action="remove-reward" data-index="${index}">删除</button>
          </div>
        </div>
      `,
    )
    .join('')}</div>`
}

const renderTemplates = () => {
  if (!state.templates) return

  $('#unlock-title').value = state.templates.unlockCard.title || ''
  $('#unlock-progress').value = state.templates.unlockCard.progressText || ''

  $('#template-filters').innerHTML = `<div class="list">${state.templates.filters
    .map(
      (item, index) => `
        <div class="list-item grid-3">
          ${buildInput(item.id, 'id', index, 'filters')}
          ${buildInput(item.name, 'name', index, 'filters')}
          <div class="list-item-actions">
            <button class="danger-btn" data-action="remove-filter" data-index="${index}">删除</button>
          </div>
        </div>
      `,
    )
    .join('')}</div>`

  $('#template-items').innerHTML = `<div class="list">${state.templates.templates
    .map(
      (item, index) => `
        <div class="list-item grid-5">
          ${buildInput(item.title, 'title', index, 'templates')}
          ${buildInput(item.filterId, 'filterId', index, 'templates')}
          ${buildInput(item.meta, 'meta', index, 'templates')}
          ${buildInput(item.cost, 'cost', index, 'templates', 'number')}
          ${buildInput(item.imageUrl, 'imageUrl', index, 'templates')}
          <div class="list-item-actions field-full">
            <button class="danger-btn" data-action="remove-template" data-index="${index}">删除</button>
          </div>
        </div>
      `,
    )
    .join('')}</div>`
}

const attachDynamicHandlers = () => {
  document.querySelectorAll('input[data-section]').forEach((input) => {
    input.oninput = (event) => {
      const target = event.currentTarget
      const section = target.dataset.section
      const field = target.dataset.field
      const index = Number(target.dataset.index)
      const value = target.type === 'number' ? Number(target.value) || 0 : target.value

      if (section === 'tasks' || section === 'rewards') {
        state.points[section][index][field] = value
      }

      if (section === 'filters' || section === 'templates') {
        state.templates[section][index][field] = value
      }
    }
  })

  document.querySelectorAll('button[data-action="remove-task"]').forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index)
      state.points.tasks.splice(index, 1)
      renderPoints()
      attachDynamicHandlers()
    }
  })

  document.querySelectorAll('button[data-action="remove-reward"]').forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index)
      state.points.rewards.splice(index, 1)
      renderPoints()
      attachDynamicHandlers()
    }
  })

  document.querySelectorAll('button[data-action="remove-filter"]').forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index)
      state.templates.filters.splice(index, 1)
      renderTemplates()
      attachDynamicHandlers()
    }
  })

  document.querySelectorAll('button[data-action="remove-template"]').forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index)
      state.templates.templates.splice(index, 1)
      renderTemplates()
      attachDynamicHandlers()
    }
  })
}

const setSection = (section) => {
  document.querySelectorAll('.nav-item').forEach((node) => {
    node.classList.toggle('nav-item-active', node.dataset.section === section)
  })

  document.querySelectorAll('.panel').forEach((node) => {
    node.classList.toggle('panel-hidden', node.id !== `section-${section}`)
  })
}

const loadAll = async () => {
  setStatus('正在加载配置...')
  const [home, points, templates] = await Promise.all([
    request('/admin/config/home'),
    request('/admin/config/points'),
    request('/admin/config/templates'),
  ])

  state.home = home
  state.points = points
  state.templates = templates

  renderHome()
  renderPoints()
  renderTemplates()
  attachDynamicHandlers()
  setStatus('配置加载完成', 'success')
}

const bindEvents = () => {
  document.querySelectorAll('.nav-item').forEach((node) => {
    node.onclick = () => setSection(node.dataset.section)
  })

  $('#home-image').addEventListener('input', (event) => {
    $('#home-image-preview').src = event.target.value
  })

  $('#save-home').onclick = async () => {
    try {
      setStatus('正在保存 Banner...')
      await request('/admin/config/home/hero', {
        method: 'PUT',
        body: JSON.stringify({
          title: $('#home-title').value.trim(),
          subtitle: $('#home-subtitle').value.trim(),
          imageUrl: $('#home-image').value.trim(),
        }),
      })
      setStatus('Banner 已保存', 'success')
    } catch (error) {
      setStatus(error.message, 'error')
    }
  }

  $('#points-balance').addEventListener('input', (event) => {
    state.points.balance = Number(event.target.value) || 0
  })
  $('#points-banner-image').addEventListener('input', (event) => {
    state.points.bannerImageUrl = event.target.value
  })

  $('#add-task').onclick = () => {
    state.points.tasks.push({
      title: '新任务',
      value: 10,
      iconClass: 'points-icon-coin',
    })
    renderPoints()
    attachDynamicHandlers()
  }

  $('#add-reward').onclick = () => {
    state.points.rewards.push({
      title: '新商品',
      subtitle: '请输入兑换说明',
      cost: 300,
      iconClass: 'points-icon-coupon',
    })
    renderPoints()
    attachDynamicHandlers()
  }

  $('#save-points').onclick = async () => {
    try {
      setStatus('正在保存积分配置...')
      await request('/admin/config/points', {
        method: 'PUT',
        body: JSON.stringify(state.points),
      })
      setStatus('积分配置已保存', 'success')
    } catch (error) {
      setStatus(error.message, 'error')
    }
  }

  $('#unlock-title').addEventListener('input', (event) => {
    state.templates.unlockCard.title = event.target.value
  })
  $('#unlock-progress').addEventListener('input', (event) => {
    state.templates.unlockCard.progressText = event.target.value
  })

  $('#add-filter').onclick = () => {
    state.templates.filters.push({
      id: `filter-${Date.now()}`,
      name: '新分类',
    })
    renderTemplates()
    attachDynamicHandlers()
  }

  $('#add-template').onclick = () => {
    state.templates.templates.push({
      id: `template-${Date.now()}`,
      title: '新模板',
      filterId: 'all',
      meta: '请输入模板说明',
      cost: 800,
      imageUrl: '/assets/home/toolbox-hero.png',
    })
    renderTemplates()
    attachDynamicHandlers()
  }

  $('#save-templates').onclick = async () => {
    try {
      setStatus('正在保存模板配置...')
      await request('/admin/config/templates', {
        method: 'PUT',
        body: JSON.stringify(state.templates),
      })
      setStatus('模板配置已保存', 'success')
    } catch (error) {
      setStatus(error.message, 'error')
    }
  }
}

const bootstrap = async () => {
  bindEvents()
  setSection('home')
  try {
    await loadAll()
  } catch (error) {
    setStatus(error.message, 'error')
  }
}

bootstrap()
