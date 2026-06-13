const fs = require('fs')
const path = require('path')

const outDir = __dirname

const slugs = [
  'overview-dashboard',
  'content-home-ops',
  'content-templates',
  'content-question-bank',
  'content-share-assets',
  'content-tools-ops',
  'user-profiles',
  'user-login-logs',
  'sessions',
  'reports',
  'commerce-points',
  'commerce-point-ledger',
  'commerce-membership',
  'commerce-merchants',
  'data-users',
  'data-content',
  'data-business',
  'system-permissions',
  'system-operation-logs',
  'system-config'
  ]

const makeShell = (slug) => `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f6f7f8" />
    <link rel="icon" href="data:," />
    <title>${slug} - 酒桌判官后台</title>
    <link rel="stylesheet" href="/admin/static/heatwave-ops/styles.css?v=20260611-admin-pagination-2" />
  </head>
  <body data-page="${slug}">
    <div id="app"></div>
    <script src="/admin/static/heatwave-ops/app.js?v=20260611-admin-pagination-2"></script>
  </body>
</html>
`

const loginHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f6f7f8" />
    <link rel="icon" href="data:," />
    <title>后台登录 - 酒桌判官</title>
    <link rel="stylesheet" href="/admin/static/heatwave-ops/styles.css?v=20260611-admin-pagination-2" />
  </head>
  <body class="login-page">
    <div class="login-card">
      <div class="brand">
        <span class="brand-badge">Heatwave Ops</span>
        <div class="brand-title">酒桌判官后台</div>
        <div class="brand-subtitle">登录后管理内容、模板、积分和系统配置。</div>
      </div>
      <form class="login-form" id="login-form">
        <div class="field">
          <label for="admin-username">账号</label>
          <input id="admin-username" name="username" placeholder="输入后台账号" autocomplete="username" spellcheck="false" />
        </div>
        <div class="field">
          <label for="admin-password">密码</label>
          <input id="admin-password" name="password" type="password" placeholder="输入后台密码" autocomplete="current-password" />
        </div>
        <button class="action-btn" type="submit">登录后台</button>
        <div class="login-note" id="login-note" role="status" aria-live="polite"></div>
      </form>
    </div>
    <script>
      const form = document.getElementById('login-form');
      const note = document.getElementById('login-note');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        note.textContent = '登录中…';
        const payload = {
          username: form.username.value,
          password: form.password.value,
        };
        try {
          const response = await fetch('/api/v1/admin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (!response.ok || result.code !== 0) {
            throw new Error(result.message || '登录失败，请检查账号和密码');
          }
          window.location.href = '/admin/pages/overview-dashboard';
        } catch (error) {
          note.textContent = error.message || '登录失败，请检查账号和密码';
        }
      });
    </script>
  </body>
</html>
`

const indexHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=/admin/pages/overview-dashboard" />
    <link rel="icon" href="data:," />
    <title>Redirecting</title>
  </head>
  <body></body>
</html>
`

slugs.forEach((slug) => {
  fs.writeFileSync(path.join(outDir, `${slug}.html`), makeShell(slug), 'utf8')
})

fs.writeFileSync(path.join(outDir, 'login.html'), loginHtml, 'utf8')
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml, 'utf8')

console.log(`Generated ${slugs.length + 2} lightweight admin shells`)
