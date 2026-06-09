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
  'sessions',
  'reports',
  'commerce-points',
  'commerce-membership',
  'commerce-ads',
  'commerce-merchants',
  'commerce-campaigns',
  'data-users',
  'data-content',
  'data-business',
  'system-permissions',
  'system-config',
  'system-compliance',
]

const makeShell = (slug) => `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${slug}</title>
    <link rel="stylesheet" href="/admin/static/heatwave-ops/styles.css" />
  </head>
  <body data-page="${slug}">
    <div id="app"></div>
    <script src="/admin/static/heatwave-ops/app.js"></script>
  </body>
</html>
`

const loginHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Login</title>
    <link rel="stylesheet" href="/admin/static/heatwave-ops/styles.css" />
  </head>
  <body class="login-page">
    <div class="login-card">
      <div class="brand">
        <span class="brand-badge">Heatwave Ops</span>
        <div class="brand-title">Jiuzhuopanguan Admin</div>
      </div>
      <form class="login-form" id="login-form">
        <div class="field">
          <label>Username</label>
          <input name="username" placeholder="Enter username" autocomplete="username" />
        </div>
        <div class="field">
          <label>Password</label>
          <input name="password" type="password" placeholder="Enter password" autocomplete="current-password" />
        </div>
        <button class="action-btn" type="submit">Sign In</button>
        <div class="login-note" id="login-note"></div>
      </form>
    </div>
    <script>
      const form = document.getElementById('login-form');
      const note = document.getElementById('login-note');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        note.textContent = 'Signing in...';
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
            throw new Error(result.message || 'Sign in failed');
          }
          window.location.href = '/admin/pages/overview-dashboard';
        } catch (error) {
          note.textContent = error.message || 'Sign in failed';
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
