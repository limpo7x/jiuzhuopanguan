require('./load-env')

const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')
const QRCode = require('qrcode')
const url = require('url')
const { initAssetsManifest, listAdminAssets, saveAdminImage } = require('./data/assets')
const {
  activateMembershipPlan,
  adjustUserPointsByAdmin,
  claimPointsTask,
  getMembershipCatalog,
  getUserCommerceState,
  redeemPointsReward,
  unlockTemplateByAd,
} = require('./data/commerce')
const { getFeaturedReport, getLiveSessionConfig, getShareConfig, listFrontendTools, listUsageRecords } = require('./data/front')
const {
  getCompliance,
  getHomeConfig,
  initContentStore,
  getPointsConfig,
  getProfile,
  getTemplateConfig,
  getToolHistory,
  updateHomeHero,
  updatePointsConfig,
  updateTemplateConfig,
} = require('./data/content')
const {
  addFriend,
  bindPhoneToMiniUser,
  bindWechatUser,
  ensureProfile,
  getBootstrap,
  getMiniUserSession,
  initSocialStore,
  ignorePoke,
  replyPoke,
  searchProfiles,
  sendPoke,
  touchFriends,
  updateFriend,
  removeFriend,
} = require('./data/social')
const {
  createManagedSession,
  finishManagedSession,
  getPageData,
  getManagedSessionByInviteCode,
  initAdminStore,
  joinManagedSession,
  getSession,
  loginAdmin,
  logoutAdmin,
  savePageData,
  trackAnalyticsEvent,
  updateManagedSession,
} = require('./data/admin')

const port = Number(process.env.PORT || 3010)
const publicDir = path.join(__dirname, 'public')
const heatwaveDir = path.join(publicDir, 'admin', 'static', 'heatwave-ops')
const assetsDir = path.join(__dirname, '..', 'miniprogram', 'assets')
const publicStaticDir = path.join(publicDir, 'static')
const uploadsDir = path.join(publicDir, 'uploads')
const sessionCookieName = 'jiuzhuopanguan_admin_session'
const userSessionHeaderName = 'x-jzp-user-token'
const wechatConfig = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
}
const wechatAccessTokenCache = {
  token: '',
  expiresAt: 0,
}

const MIME_MAP = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const resolveFirstExistingPath = (...candidatePaths) => candidatePaths.find((candidatePath) => fs.existsSync(candidatePath))

const staticAssetMap = {
  '/static/avatar-host.png': resolveFirstExistingPath(
    path.join(publicStaticDir, 'avatar-1.png'),
    path.join(assetsDir, 'avatars', 'avatar-1.png'),
  ),
  '/static/party-hero.png': resolveFirstExistingPath(
    path.join(publicStaticDir, 'party-hero.png'),
    path.join(assetsDir, 'home', 'party-hero.png'),
  ),
  '/static/points-gift.png': resolveFirstExistingPath(
    path.join(publicStaticDir, 'points-gift.png'),
    path.join(assetsDir, 'home', 'points-gift.png'),
  ),
  '/static/report-poster.png': resolveFirstExistingPath(
    path.join(publicStaticDir, 'report-poster.png'),
    path.join(assetsDir, 'home', 'report-poster.png'),
  ),
  '/static/toolbox-hero.png': resolveFirstExistingPath(
    path.join(publicStaticDir, 'toolbox-hero.png'),
    path.join(assetsDir, 'home', 'toolbox-hero.png'),
  ),
  '/static/image-process-hero.png': resolveFirstExistingPath(
    path.join(publicStaticDir, 'image-process-hero.png'),
    path.join(assetsDir, 'home', 'image-process-hero.png'),
  ),
}

const sendJson = (response, statusCode, payload, cookieHeaders = []) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-JZP-User-Token',
  }
  if (cookieHeaders.length) {
    headers['Set-Cookie'] = cookieHeaders
  }
  response.writeHead(statusCode, headers)
  response.end(JSON.stringify(payload))
}

const sendOk = (response, data, statusCode = 200, cookieHeaders = []) =>
  sendJson(
    response,
    statusCode,
    {
      code: 0,
      message: 'ok',
      data,
    },
    cookieHeaders,
  )

const sendError = (response, statusCode, message) =>
  sendJson(response, statusCode, {
    code: statusCode,
    message,
    data: null,
  })

const sendBinary = (response, buffer, contentType, statusCode = 200) => {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store',
  })
  response.end(buffer)
}

const sendRedirect = (response, location) => {
  response.writeHead(302, { Location: location })
  response.end()
}

const sendFile = (response, filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    sendError(response, 404, 'not found')
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_MAP[ext] || 'application/octet-stream'
  response.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  })
  response.end(fs.readFileSync(filePath))
}

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let raw = ''
    request.on('data', (chunk) => {
      raw += chunk
    })
    request.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((accumulator, item) => {
      const index = item.indexOf('=')
      if (index === -1) {
        return accumulator
      }
      const key = item.slice(0, index).trim()
      const value = decodeURIComponent(item.slice(index + 1))
      accumulator[key] = value
      return accumulator
    }, {})

const makeSessionCookie = (token) =>
  `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`

const clearSessionCookie = () =>
  `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`

const resolveAdminSession = (request) => {
  const cookies = parseCookies(request.headers.cookie || '')
  return getSession(cookies[sessionCookieName])
}

const resolveUserToken = (request) => {
  const directHeader = request.headers[userSessionHeaderName]
  if (typeof directHeader === 'string' && directHeader.trim()) {
    return directHeader.trim()
  }
  const authHeader = request.headers.authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }
  return ''
}

const resolveUserSession = (request) => getMiniUserSession(resolveUserToken(request))

const requireUserSession = (request, response) => {
  const session = resolveUserSession(request)
  if (!session) {
    sendError(response, 401, 'unauthorized')
    return null
  }
  return session
}

const httpsJsonRequest = (requestUrl, options = {}, payload) =>
  new Promise((resolve, reject) => {
    const target = new URL(requestUrl)
    const requestOptions = {
      method: payload ? 'POST' : 'GET',
      hostname: target.hostname,
      path: `${target.pathname}${target.search}`,
      headers: payload
        ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          }
        : undefined,
      ...options,
    }
    const req = https.request(requestOptions, (res) => {
      let raw = ''
      res.on('data', (chunk) => {
        raw += chunk
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw || '{}'))
        } catch (error) {
          reject(error)
        }
      })
    })
    req.on('error', reject)
    if (payload) {
      req.write(payload)
    }
    req.end()
  })

const getWechatAccessToken = async () => {
  if (!wechatConfig.appId || !wechatConfig.appSecret) {
    throw Object.assign(new Error('wechat login not configured'), { statusCode: 503 })
  }
  if (wechatAccessTokenCache.token && wechatAccessTokenCache.expiresAt > Date.now() + 60 * 1000) {
    return wechatAccessTokenCache.token
  }

  const payload = await httpsJsonRequest(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(wechatConfig.appId)}&secret=${encodeURIComponent(wechatConfig.appSecret)}`,
  )
  if (!payload.access_token) {
    throw Object.assign(new Error(payload.errmsg || 'failed to get wechat access token'), { statusCode: 502 })
  }
  wechatAccessTokenCache.token = payload.access_token
  wechatAccessTokenCache.expiresAt = Date.now() + Math.max(300, Number(payload.expires_in) || 7200) * 1000
  return wechatAccessTokenCache.token
}

const getWechatSessionByCode = async (loginCode) => {
  if (!loginCode) {
    throw Object.assign(new Error('missing login code'), { statusCode: 400 })
  }
  if (!wechatConfig.appId || !wechatConfig.appSecret) {
    throw Object.assign(new Error('wechat login not configured'), { statusCode: 503 })
  }
  const payload = await httpsJsonRequest(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(wechatConfig.appId)}&secret=${encodeURIComponent(wechatConfig.appSecret)}&js_code=${encodeURIComponent(loginCode)}&grant_type=authorization_code`,
  )
  if (!payload.openid) {
    throw Object.assign(new Error(payload.errmsg || 'failed to exchange wechat session'), { statusCode: 502 })
  }
  return payload
}

const getWechatPhoneNumber = async (phoneCode) => {
  if (!phoneCode) {
    throw Object.assign(new Error('missing phone code'), { statusCode: 400 })
  }
  const accessToken = await getWechatAccessToken()
  const payload = await httpsJsonRequest(
    `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${encodeURIComponent(accessToken)}`,
    { method: 'POST' },
    JSON.stringify({ code: phoneCode }),
  )
  if (!payload.phone_info?.phoneNumber) {
    throw Object.assign(new Error(payload.errmsg || 'failed to get wechat phone number'), { statusCode: 502 })
  }
  return payload.phone_info
}

const requireAdminSession = (request, response) => {
  const session = resolveAdminSession(request)
  if (!session) {
    sendError(response, 401, 'unauthorized')
    return null
  }
  return session
}

const sanitizePathWithin = (baseDir, relativePath) => {
  const normalized = path.normalize(path.join(baseDir, relativePath))
  return normalized.startsWith(baseDir) ? normalized : null
}

const server = http.createServer((request, response) => {
  const respond = async () => {
    if (!request.url) {
      sendError(response, 400, 'missing url')
      return
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-JZP-User-Token',
      })
      response.end()
      return
    }

    const { pathname, query } = url.parse(request.url, true)

    if (request.method === 'GET' && pathname && staticAssetMap[pathname]) {
      sendFile(response, staticAssetMap[pathname])
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/static/')) {
      const relativePath = pathname.replace('/static/', '')
      const staticFilePath = sanitizePathWithin(publicStaticDir, relativePath)
      if (staticFilePath && fs.existsSync(staticFilePath)) {
        sendFile(response, staticFilePath)
        return
      }
      if (staticAssetMap[pathname]) {
        sendFile(response, staticAssetMap[pathname])
        return
      }
      sendError(response, 404, 'not found')
      return
    }

    if (request.method === 'GET' && (pathname === '/admin' || pathname === '/admin/')) {
      const session = resolveAdminSession(request)
      sendRedirect(response, session ? '/admin/pages/overview-dashboard' : '/admin/login')
      return
    }

    if (request.method === 'GET' && pathname === '/admin/login') {
      sendFile(response, path.join(heatwaveDir, 'login.html'))
      return
    }

    if (request.method === 'GET' && pathname === '/admin/ui-kit') {
      sendRedirect(response, '/admin/static/heatwave-ops/ui-kit.html')
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/admin/pages/')) {
      const slug = pathname.replace('/admin/pages/', '').trim()
      const filePath = path.join(heatwaveDir, `${slug}.html`)
      sendFile(response, filePath)
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/admin/static/')) {
      const relativePath = pathname.replace('/admin/static/', '')
      const staticDir = path.join(publicDir, 'admin', 'static')
      const filePath = sanitizePathWithin(staticDir, relativePath)
      if (!filePath) {
        sendError(response, 403, 'forbidden')
        return
      }
      sendFile(response, filePath)
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/uploads/')) {
      const relativePath = pathname.replace('/uploads/', '')
      const filePath = sanitizePathWithin(uploadsDir, relativePath)
      if (!filePath) {
        sendError(response, 403, 'forbidden')
        return
      }
      sendFile(response, filePath)
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/admin/auth/login') {
      const payload = await readJsonBody(request)
      const session = loginAdmin(payload)
      sendOk(response, { user: session.user }, 200, [makeSessionCookie(session.token)])
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/admin/auth/session') {
      const session = resolveAdminSession(request)
      if (!session) {
        sendError(response, 401, 'unauthorized')
        return
      }
      sendOk(response, session)
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/admin/auth/logout') {
      const session = resolveAdminSession(request)
      if (session) {
        logoutAdmin(session.token)
      }
      sendOk(response, { loggedOut: true }, 200, [clearSessionCookie()])
      return
    }

    if (pathname && pathname.startsWith('/api/v1/admin/pages/')) {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const slug = pathname.replace('/api/v1/admin/pages/', '').trim()
      if (request.method === 'GET') {
        sendOk(response, {
          user: session.user,
          page: getPageData(slug),
        })
        return
      }
      if (request.method === 'PUT') {
        const payload = await readJsonBody(request)
        sendOk(response, {
          user: session.user,
          page: savePageData(slug, payload),
        })
        return
      }
    }

    if (request.method === 'GET' && pathname === '/api/v1/admin/assets') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      sendOk(response, listAdminAssets())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/auth/session') {
      const session = resolveUserSession(request)
      sendOk(response, {
        loggedIn: Boolean(session),
        profile: session?.profile || null,
      })
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/user/auth/login') {
      const payload = await readJsonBody(request)
      const wechatSession = await getWechatSessionByCode(String(payload.loginCode || '').trim())
      const phoneCode = String(payload.phoneCode || '').trim()
      const phoneInfo = phoneCode ? await getWechatPhoneNumber(phoneCode) : null
      const session = bindWechatUser({
        phone: phoneInfo?.phoneNumber || '',
        wechatOpenId: wechatSession.openid,
        wechatUnionId: wechatSession.unionid || '',
        profile: {
          name: payload.profile?.name || payload.profile?.nickName || '',
          avatarUrl: payload.profile?.avatarUrl || '',
          city: payload.profile?.city || '',
          signature: payload.profile?.signature || '',
          identityTag: payload.profile?.identityTag || '',
        },
      })
      sendOk(response, session)
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/user/auth/bind-phone') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      const phoneCode = String(payload.phoneCode || '').trim()
      const phoneInfo = await getWechatPhoneNumber(phoneCode)
      const profile = bindPhoneToMiniUser({
        profileId: userSession.profile.id,
        phone: phoneInfo?.phoneNumber || '',
      })
      sendOk(response, profile)
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/config/home') {
      sendOk(response, getHomeConfig())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/admin/config/home') {
      sendOk(response, getHomeConfig())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/config/compliance') {
      sendOk(response, getCompliance())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/profile') {
      const session = resolveUserSession(request)
      sendOk(
        response,
        session
          ? {
              ...session.profile,
              points: getUserCommerceState(session.profile.id).points,
            }
          : {
              ...getProfile(),
              points: 0,
            },
      )
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/commerce') {
      const session = resolveUserSession(request)
      sendOk(response, getUserCommerceState(session?.profile?.id || ''))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/tools/history') {
      sendOk(response, getToolHistory())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/tools/catalog') {
      sendOk(response, listFrontendTools())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/tools/usage-records') {
      sendOk(response, listUsageRecords())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/config/points') {
      sendOk(response, getPointsConfig())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/config/templates') {
      sendOk(response, getTemplateConfig())
      return
    }

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/points/tasks/') && pathname.endsWith('/claim')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const taskId = pathname.replace('/api/v1/points/tasks/', '').replace('/claim', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, claimPointsTask(session.profile.id, taskId))
      return
    }

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/points/rewards/') && pathname.endsWith('/redeem')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const rewardId = pathname.replace('/api/v1/points/rewards/', '').replace('/redeem', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, redeemPointsReward(session.profile.id, rewardId))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/membership/catalog') {
      const session = resolveUserSession(request)
      sendOk(response, getMembershipCatalog(session?.profile?.id || ''))
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/membership/activate') {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, activateMembershipPlan(session.profile.id, String(payload.planId || '')))
      return
    }

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/templates/') && pathname.endsWith('/unlock')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const templateId = pathname.replace('/api/v1/templates/', '').replace('/unlock', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, unlockTemplateByAd(session.profile.id, templateId))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/share/config') {
      sendOk(response, getShareConfig())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/sessions/live') {
      sendOk(response, getLiveSessionConfig(query.sessionId, query.inviteCode))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/reports/featured') {
      sendOk(response, getFeaturedReport())
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/analytics/events') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      trackAnalyticsEvent({
        ...payload,
        profileId: userSession.profile.id,
      })
      sendOk(response, { tracked: true })
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/sessions') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(
        response,
        createManagedSession({
          ...payload,
          hostAvatarUrl: userSession.profile.avatarUrl,
          hostName: userSession.profile.name,
          hostPhone: userSession.profile.phone || '',
          hostProfileId: userSession.profile.id,
        }),
        201,
      )
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/sessions/join') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      try {
        const inviteCode = String(payload.inviteCode || '').trim()
        const session = joinManagedSession({
          inviteCode,
          profile: userSession.profile,
        })
        sendOk(response, getLiveSessionConfig(session.id, inviteCode))
      } catch (error) {
        if (error?.code === 'NOT_SESSION_PLAYER') {
          sendError(response, 403, 'not session player')
          return
        }
        if (error?.code === 'SESSION_NOT_FOUND') {
          sendError(response, 404, 'session not found')
          return
        }
        throw error
      }
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/sessions/by-invite') {
      const session = getManagedSessionByInviteCode(String(query.inviteCode || ''))
      if (!session) {
        sendError(response, 404, 'session not found')
        return
      }
      sendOk(response, getLiveSessionConfig(session.id, session.inviteCode))
      return
    }

    if (pathname && pathname.startsWith('/api/v1/sessions/')) {
      const sessionId = pathname.replace('/api/v1/sessions/', '').trim()
      if (request.method === 'PUT') {
        const payload = await readJsonBody(request)
        const updated = updateManagedSession(sessionId, payload)
        if (!updated) {
          sendError(response, 404, 'session not found')
          return
        }
        sendOk(response, updated)
        return
      }
    }

    if (request.method === 'POST' && pathname === '/api/v1/reports') {
      const payload = await readJsonBody(request)
      sendOk(response, finishManagedSession(payload), 201)
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/tools/qr-code.png') {
      const text = String(query.text || '').trim() || '酒桌判官'
      const buffer = await QRCode.toBuffer(text, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 8,
        color: {
          dark: '#24160f',
          light: '#FFFFFFFF',
        },
        type: 'png',
        width: 640,
      })
      sendBinary(response, buffer, 'image/png')
      return
    }

    if (request.method === 'PUT' && pathname === '/api/v1/admin/config/home/hero') {
      const payload = await readJsonBody(request)
      sendOk(response, {
        hero: updateHomeHero(payload),
        updatedAt: new Date().toISOString(),
      })
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/admin/upload/home-hero') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const payload = await readJsonBody(request)
      const asset = saveAdminImage({
        category: payload.category || 'home',
        dataUrl: payload.dataUrl,
        fileName: payload.fileName || 'home-hero.png',
      })
      sendOk(response, {
        uploaded: true,
        asset,
        nextAction: '/api/v1/admin/config/home/hero',
      })
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/admin/uploads/image') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const payload = await readJsonBody(request)
      const asset = saveAdminImage(payload)
      sendOk(response, {
        uploaded: true,
        asset,
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/admin/config/points') {
      sendOk(response, getPointsConfig())
      return
    }

    if (request.method === 'PUT' && pathname === '/api/v1/admin/config/points') {
      const payload = await readJsonBody(request)
      sendOk(response, {
        pointsConfig: updatePointsConfig(payload),
        updatedAt: new Date().toISOString(),
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/admin/config/templates') {
      sendOk(response, getTemplateConfig())
      return
    }

    if (request.method === 'PUT' && pathname === '/api/v1/admin/config/templates') {
      const payload = await readJsonBody(request)
      sendOk(response, {
        templateConfig: updateTemplateConfig(payload),
        updatedAt: new Date().toISOString(),
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/social/bootstrap') {
      sendOk(response, getBootstrap(String(query.profileId || '')))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/social/users/search') {
      sendOk(
        response,
        searchProfiles({
          ownerId: String(query.profileId || ''),
          keyword: String(query.keyword || ''),
        }),
      )
      return
    }

    if (request.method === 'PUT' && pathname === '/api/v1/social/profile') {
      const payload = await readJsonBody(request)
      sendOk(response, ensureProfile(payload))
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/social/friends') {
      const payload = await readJsonBody(request)
      sendOk(response, addFriend(payload))
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/social/friends/touch') {
      const payload = await readJsonBody(request)
      sendOk(response, touchFriends(payload))
      return
    }

    if (pathname && pathname.startsWith('/api/v1/social/friends/')) {
      const friendshipId = pathname.replace('/api/v1/social/friends/', '')
      if (request.method === 'PUT') {
        const payload = await readJsonBody(request)
        sendOk(response, updateFriend({ ...payload, friendshipId }))
        return
      }
      if (request.method === 'DELETE') {
        sendOk(response, removeFriend({ ownerId: String(query.profileId || ''), friendshipId }))
        return
      }
    }

    if (request.method === 'POST' && pathname === '/api/v1/social/pokes') {
      const payload = await readJsonBody(request)
      sendOk(response, sendPoke(payload))
      return
    }

    if (pathname && pathname.startsWith('/api/v1/social/pokes/')) {
      const segments = pathname.split('/').filter(Boolean)
      const threadId = segments[4]
      const action = segments[5]
      if (request.method === 'POST' && action === 'reply') {
        const payload = await readJsonBody(request)
        sendOk(response, replyPoke({ profileId: payload.profileId, threadId }))
        return
      }
      if (request.method === 'DELETE' && threadId) {
        sendOk(response, ignorePoke({ profileId: String(query.profileId || ''), threadId }))
        return
      }
    }

    sendError(response, 404, 'not found')
  }

  respond().catch((error) => {
    const statusCode =
      error && typeof error === 'object' && typeof error.statusCode === 'number' ? error.statusCode : 500
    sendError(response, statusCode, error instanceof Error ? error.message : 'internal server error')
  })
})

Promise.all([initContentStore(), initSocialStore(), initAdminStore(), initAssetsManifest()])
  .then(() => {
    server.listen(port, () => {
      console.log(`jiuzhuopanguan backend listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('failed to initialize stores', error)
    process.exit(1)
  })
