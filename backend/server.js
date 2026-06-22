require('./load-env')

const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')
const QRCode = require('qrcode')
const sharp = require('sharp')
const url = require('url')
const { initAssetsManifest, listAdminAssets, saveAdminImage } = require('./data/assets')
const {
  activateMembershipPlan,
  adjustUserPointsByAdmin,
  claimInviteReward,
  claimPointsTask,
  grantFirstLoginBonus,
  getMembershipCatalog,
  getUserFeatureZones,
  getUserCommerceState,
  recordUserToolUsage,
  redeemPointsReward,
  toggleToolFavorite,
  unlockTemplateByAd,
  useMembershipBenefit,
  useTemplate,
} = require('./data/commerce')
const {
  getFeaturedReport,
  getLiveSessionConfig,
  getMerchantPartnersConfig,
  getQuestionBankConfig,
  getShareConfig,
  listFrontendTools,
  listUsageRecords,
} = require('./data/front')
const {
  getCleanSlateBaseline,
  getPartyLiveFacade,
  mapBrief,
  mapShareImage,
} = require('./data/clean-slate')
const {
  getCompliance,
  getHomeConfig,
  initContentStore,
  getPointsConfig,
  getProfile,
  getTemplateConfig,
  getToolHistory,
  recordToolUsage,
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
  listProfiles,
  replyPoke,
  searchProfiles,
  syncSessionContacts,
  sendPoke,
  touchFriends,
  updateFriend,
  removeFriend,
} = require('./data/social')
const {
  createManagedSession,
  deleteManagedSession,
  endManagedSession,
  finishManagedSession,
  getManagedReportById,
  getManagedSessionById,
  getUserJudgeStats,
  listManagedReports,
  getPageData,
  getManagedSessionByInviteCode,
  getSessionContactsByProfile,
  grantRankingRewardsByAdmin,
  handleManagedMomentReport,
  initAdminStore,
  joinManagedSession,
  kickManagedSessionMember,
  getSession,
  loginAdmin,
  logoutAdmin,
  retryManagedShareImageTask,
  resetAdminPassword,
  reviewManagedMoment,
  savePageData,
  trackAnalyticsEvent,
  updateManagedSession,
} = require('./data/admin')
const {
  createMoment,
  createMomentNomination,
  createOrRefreshSessionBrief,
  createSessionEvent,
  createShareImageTask,
  deleteMoment,
  getMomentNominationEligibility,
  getSessionBrief,
  getSessionTimeline,
  getShareImageTask,
  getUserShareImageSummaries,
  getUserSessionMomentSummaries,
  initMomentsStore,
  listTodayRankings,
  processShareImageTask,
  retryShareImageTask,
  updateMoment,
  uploadMomentImage,
} = require('./data/moments')
const {
  getLiveSessionConfigFromNormalized,
  listUserShareImageSummariesFromNormalized,
  listManagedReportsFromNormalized,
  listUserSessionMomentSummariesFromNormalized,
  shouldReadNormalized,
} = require('./data/normalized-read')

const port = Number(process.env.PORT || 3010)
const publicDir = path.join(__dirname, 'public')
const heatwaveDir = path.join(publicDir, 'admin', 'static', 'heatwave-ops')
const assetsDir = path.join(__dirname, '..', 'miniprogram', 'assets')
const publicStaticDir = path.join(publicDir, 'static')
const uploadsDir = path.join(publicDir, 'uploads')
const sharePosterMiniappCodePath = path.join(__dirname, '..', 'miniprogram', 'pages', 'share-poster', 'assets', 'share', 'share-poster-miniapp-code.png')
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
  '/static/share-miniapp-qr.png': resolveFirstExistingPath(
    path.join(publicStaticDir, 'share-miniapp-qr.png'),
    path.join(assetsDir, 'home', 'share-miniapp-qr.png'),
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

const asyncShareImageTaskIds = new Set()

const scheduleShareImageTaskProcessing = ({ task, profile }) => {
  const taskId = String(task?.id || task?.taskId || '').trim()
  const status = String(task?.status || '').trim()
  if (!taskId || status !== 'pending' || asyncShareImageTaskIds.has(taskId)) {
    return
  }
  asyncShareImageTaskIds.add(taskId)
  setImmediate(() => {
    processShareImageTask({ taskId, profile })
      .catch((error) => {
        console.error('[share-image-task] async processing failed:', {
          taskId,
          message: error instanceof Error ? error.message : String(error),
        })
      })
      .finally(() => {
        asyncShareImageTaskIds.delete(taskId)
      })
  })
}

const sendBinary = (response, buffer, contentType, statusCode = 200) => {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-JZP-User-Token',
    'Cache-Control': 'no-store',
  })
  response.end(buffer)
}

const escapeXml = (value = '') =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const trimText = (value = '', maxLength = 18) => {
  const text = String(value || '').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

const getImageMimeType = (filePath = '') => {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.svg') return 'image/svg+xml'
  return 'image/png'
}

const resolvePosterLocalImagePath = (imageUrl = '') => {
  const text = String(imageUrl || '').trim()
  if (!text) return ''
  if (/^(wxfile|file):\/\//i.test(text) || /^https?:\/\/(?:127\.0\.0\.1(?::\d+)?\/__store__|store\/)/i.test(text) || /\/__store__\//i.test(text) || /\/__tmp__\//i.test(text)) {
    return ''
  }

  let pathname = text
  if (/^https?:\/\//i.test(text)) {
    try {
      pathname = new URL(text).pathname
    } catch {
      return ''
    }
  }

  if (staticAssetMap[pathname]) {
    return staticAssetMap[pathname]
  }

  if (pathname.startsWith('/uploads/')) {
    return sanitizePathWithin(uploadsDir, pathname.replace('/uploads/', '')) || ''
  }

  if (pathname.startsWith('/static/')) {
    return sanitizePathWithin(publicStaticDir, pathname.replace('/static/', '')) || ''
  }

  return ''
}

const resolvePosterImageDataUri = async (imageUrl = '') => {
  const imagePath = resolvePosterLocalImagePath(imageUrl)
  if (!imagePath || !fs.existsSync(imagePath)) return ''
  try {
    const pngBuffer = await sharp(imagePath).png().toBuffer()
    return `data:image/png;base64,${pngBuffer.toString('base64')}`
  } catch (error) {
    console.warn('[share-poster] avatar transcode failed', {
      imageUrl,
      message: error instanceof Error ? error.message : String(error),
    })
    return ''
  }
}

const renderPosterAvatar = ({ dataUri, id, cx, cy, radius }) => {
  if (!dataUri) {
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#ffd7c4"/>`
  }

  const size = radius * 2
  return `
    <clipPath id="${id}">
      <circle cx="${cx}" cy="${cy}" r="${radius}"/>
    </clipPath>
    <image href="${dataUri}" xlink:href="${dataUri}" x="${cx - radius}" y="${cy - radius}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
  `
}

const buildReportPosterSvg = async (report) => {
  const width = 900
  const ranks = Array.isArray(report.ranks) ? report.ranks.slice(0, 5) : []
  const avatarDataUris = await Promise.all(ranks.map((rank) => resolvePosterImageDataUri(rank?.avatarUrl)))
  const events = Array.isArray(report.events) ? report.events.slice(0, 4) : []
  const secondaryRanks = ranks.slice(1)
  const secondaryRows = Math.ceil(secondaryRanks.length / 2)
  const eventRows = Math.max(events.length, 1)
  const height = 610 + (ranks[0] ? 250 : 0) + secondaryRows * 210 + eventRows * 44 + 220
  const inviteCode = trimText(report.inviteCode || '已结算', 12)
  const qrDataUri = fs.existsSync(sharePosterMiniappCodePath)
    ? `data:image/png;base64,${fs.readFileSync(sharePosterMiniappCodePath).toString('base64')}`
    : ''
  const eventsY = 318 + (ranks[0] ? 236 : 0) + secondaryRows * 210 + 20
  const eventItems = (events.length ? events : [{ text: '本局暂未记录精彩事件' }])
    .map((event, index) => `<text x="122" y="${eventsY + 88 + index * 42}" font-size="22" fill="#7b3926">· ${escapeXml(trimText(event.text, 32))}</text>`)
    .join('')
  const rankCards = secondaryRanks
    .map((rank, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const x = 90 + col * 364
      const y = 318 + (ranks[0] ? 236 : 0) + row * 210
      const bg = index % 2 === 0 ? '#fff8f0' : '#f8fbff'
      const tagBg = index % 2 === 0 ? '#fff0dc' : '#edf4ff'
      const tagColor = index % 2 === 0 ? '#ff6b42' : '#3b6cff'
      return `
        <rect x="${x}" y="${y}" width="336" height="184" rx="24" fill="${bg}"/>
        <rect x="${x + 18}" y="${y + 18}" width="118" height="38" rx="19" fill="${tagBg}"/>
        <text x="${x + 77}" y="${y + 44}" text-anchor="middle" font-size="20" font-weight="700" fill="${tagColor}">${escapeXml(trimText(rank.title || `榜单 ${index + 2}`, 7))}</text>
        ${renderPosterAvatar({ dataUri: avatarDataUris[index + 1] || '', id: `avatar-${index + 1}`, cx: x + 57, cy: y + 113, radius: 31 })}
        <text x="${x + 106}" y="${y + 116}" font-size="24" font-weight="800" fill="#24160f">${escapeXml(trimText(rank.name, 8))}</text>
        <text x="${x + 106}" y="${y + 150}" font-size="22" font-weight="700" fill="#ff5b3d">${escapeXml(trimText(rank.value || '-', 12))}</text>
      `
    })
    .join('')
  const featured = ranks[0]
    ? `
      <rect x="90" y="318" width="720" height="206" rx="28" fill="#7b1f17"/>
      <rect x="118" y="342" width="180" height="44" rx="22" fill="#ffefcd" fill-opacity="0.16"/>
      <text x="208" y="372" text-anchor="middle" font-size="24" font-weight="800" fill="#ffe5b3">${escapeXml(trimText(ranks[0].title || '欠酒大王', 8))}</text>
      <rect x="640" y="342" width="140" height="44" rx="22" fill="#ffffff" fill-opacity="0.14"/>
      <text x="710" y="372" text-anchor="middle" font-size="22" font-weight="800" fill="#ffffff">全场焦点</text>
      ${renderPosterAvatar({ dataUri: avatarDataUris[0] || '', id: 'avatar-featured', cx: 168, cy: 454, radius: 42 })}
      <text x="236" y="454" font-size="34" font-weight="900" fill="#ffffff">${escapeXml(trimText(ranks[0].name, 10))}</text>
      <text x="236" y="494" font-size="24" font-weight="700" fill="#ffe0d5">${escapeXml(trimText(ranks[0].value || '-', 18))}</text>
    `
    : ''
  return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="'SimHei', 'DengXian', 'Microsoft YaHei', 'SimSun', 'Noto Sans CJK SC', sans-serif">
      <defs>
        <style>
          text { font-family: 'SimHei', 'DengXian', 'Microsoft YaHei', 'SimSun', 'Noto Sans CJK SC', sans-serif; }
        </style>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#4f120d"/>
          <stop offset="0.45" stop-color="#8d2418"/>
          <stop offset="1" stop-color="#ff8b4d"/>
        </linearGradient>
        <linearGradient id="header" x1="0" y1="40" x2="0" y2="280">
          <stop offset="0" stop-color="#ff7e4d"/>
          <stop offset="0.58" stop-color="#d83e28"/>
          <stop offset="1" stop-color="#7d1f16"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="120" cy="140" r="150" fill="#ffe19e" fill-opacity="0.14"/>
      <circle cx="760" cy="180" r="180" fill="#ffe19e" fill-opacity="0.14"/>
      <rect x="40" y="40" width="820" height="${height - 80}" rx="34" fill="#fff3e8"/>
      <rect x="40" y="40" width="820" height="240" rx="34" fill="url(#header)"/>
      <rect x="40" y="140" width="820" height="140" fill="url(#header)"/>
      <circle cx="168" cy="98" r="72" fill="#ffffff" fill-opacity="0.12"/>
      <circle cx="742" cy="118" r="84" fill="#ffffff" fill-opacity="0.12"/>
      <text x="90" y="122" font-size="48" font-weight="900" fill="#fff">查看谁是今晚欠酒王？</text>
      <text x="90" y="170" font-size="24" font-weight="700" fill="#fff">${escapeXml(trimText(report.sessionName || '', 20))}</text>
      <text x="90" y="208" font-size="24" font-weight="700" fill="#fff">${escapeXml(trimText(report.title || '这局快乐就完事了', 20))}</text>
      <rect x="620" y="116" width="190" height="72" rx="20" fill="#ffffff" fill-opacity="0.16"/>
      <text x="715" y="160" text-anchor="middle" font-size="28" font-weight="900" fill="#fff">${escapeXml(inviteCode)}</text>
      ${featured}
      ${rankCards}
      <rect x="90" y="${eventsY}" width="720" height="${70 + eventRows * 42}" rx="24" fill="#fff8f0"/>
      <text x="122" y="${eventsY + 44}" font-size="28" font-weight="900" fill="#24160f">本局精彩事件</text>
      ${eventItems}
      <rect x="652" y="${height - 212}" width="134" height="170" rx="24" fill="#fffaf4"/>
      ${qrDataUri ? `<image href="${qrDataUri}" x="666" y="${height - 198}" width="106" height="106"/>` : ''}
      <text x="719" y="${height - 60}" text-anchor="middle" font-size="18" font-weight="700" fill="#7b3926">扫一扫看看怎么个事</text>
      <text x="90" y="${height - 128}" font-size="22" font-weight="700" fill="#8f7f6d">分享图仅保留展示数据，不包含按钮与操作入口</text>
    </svg>
  `
}

const enrichReportPosterAvatars = (report = {}) => {
  const profileMap = new Map(listProfiles().map((profile) => [String(profile.id || '').trim(), profile]))
  const ranks = Array.isArray(report.ranks)
    ? report.ranks.map((rank) => {
        if (rank?.avatarUrl) {
          return rank
        }
        const profileId = String(rank?.profileId || '').trim()
        const profileAvatarUrl = profileId ? String(profileMap.get(profileId)?.avatarUrl || '').trim() : ''
        return {
          ...rank,
          avatarUrl: profileAvatarUrl,
        }
      })
    : []
  return {
    ...report,
    ranks,
  }
}

const renderReportPosterPng = async (report) => {
  const resolvedReport = enrichReportPosterAvatars(report)
  const avatarChecks = await Promise.all(
    (Array.isArray(resolvedReport?.ranks) ? resolvedReport.ranks : []).map(async (rank) => ({
      name: rank?.name || rank?.title || 'unknown',
      url: rank?.avatarUrl || '',
      readable: rank?.avatarUrl ? Boolean(await resolvePosterImageDataUri(rank.avatarUrl)) : true,
    })),
  )
  const missingAvatarNames = avatarChecks.filter((item) => item.url && !item.readable).map((item) => item.name)
  if (missingAvatarNames.length) {
    console.warn('[share-poster] rank avatar not readable', {
      reportId: resolvedReport?.id || '',
      names: missingAvatarNames,
    })
  }
  const svg = await buildReportPosterSvg(resolvedReport)
  return sharp(Buffer.from(svg)).png().toBuffer()
}

const buildEtag = (stats) => `W/"${stats.size}-${Number(stats.mtimeMs || 0).toString(16)}"`

const sendRedirect = (response, location) => {
  response.writeHead(302, { Location: location })
  response.end()
}

const sendFile = (request, response, filePath, options = {}) => {
  if (!filePath || !fs.existsSync(filePath)) {
    sendError(response, 404, 'not found')
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_MAP[ext] || 'application/octet-stream'
  const stats = fs.statSync(filePath)
  const etag = buildEtag(stats)
  const lastModified = stats.mtime.toUTCString()
  const requestEtag = request.headers['if-none-match']
  const requestModifiedSince = request.headers['if-modified-since']

  if (requestEtag === etag || (requestModifiedSince && new Date(requestModifiedSince).getTime() >= stats.mtime.getTime())) {
    response.writeHead(304, {
      ETag: etag,
      'Last-Modified': lastModified,
      'Cache-Control': options.cacheControl || 'no-store',
    })
    response.end()
    return
  }

  response.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': options.cacheControl || 'no-store',
    ETag: etag,
    'Last-Modified': lastModified,
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
    const errcode = Number(payload.errcode) || 0
    const hintMap = {
      40013: '微信 AppID 无效，请检查服务器 WECHAT_APP_ID 是否为当前小程序 AppID',
      40029: '微信登录 code 无效或已过期，请重新点击登录，并确认开发工具 AppID 与服务器 WECHAT_APP_ID 一致',
      40125: '微信 AppSecret 无效，请检查服务器 WECHAT_APP_SECRET',
      40226: '微信账号登录受限，请检查小程序账号状态',
    }
    const hint = hintMap[errcode] || '微信登录凭证换取 OpenID 失败，请检查 AppID/AppSecret 与小程序主体配置'
    console.error('wechat jscode2session failed', {
      errcode: payload.errcode,
      errmsg: payload.errmsg,
      appIdTail: wechatConfig.appId ? wechatConfig.appId.slice(-6) : '',
    })
    throw Object.assign(new Error(`${hint}${payload.errmsg ? `：${payload.errmsg}` : ''}`), { statusCode: 502 })
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
  if (typeof relativePath !== 'string') {
    return null
  }
  const resolvedBase = path.resolve(baseDir)
  const resolvedPath = path.resolve(resolvedBase, relativePath)
  if (!resolvedPath.startsWith(`${resolvedBase}${path.sep}`)) {
    return null
  }
  return resolvedPath
}

const normalizeAdminPageSlug = (rawSlug = '') => {
  const slug = String(rawSlug || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
  return /^[a-z0-9-]+$/i.test(slug) ? slug : null
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
      sendFile(request, response, staticAssetMap[pathname], {
        cacheControl: 'public, max-age=86400, stale-while-revalidate=604800',
      })
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/static/')) {
      const relativePath = pathname.replace('/static/', '')
      const staticFilePath = sanitizePathWithin(publicStaticDir, relativePath)
      if (staticFilePath && fs.existsSync(staticFilePath)) {
        sendFile(request, response, staticFilePath, {
          cacheControl: 'public, max-age=86400, stale-while-revalidate=604800',
        })
        return
      }
      if (staticAssetMap[pathname]) {
        sendFile(request, response, staticAssetMap[pathname], {
          cacheControl: 'public, max-age=86400, stale-while-revalidate=604800',
        })
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
      sendFile(request, response, path.join(heatwaveDir, 'login.html'))
      return
    }

    if (request.method === 'GET' && pathname === '/admin/ui-kit') {
      sendRedirect(response, '/admin/static/heatwave-ops/ui-kit.html')
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/admin/pages/')) {
      const slug = normalizeAdminPageSlug(pathname.replace('/admin/pages/', ''))
      if (!slug) {
        sendError(response, 404, 'not found')
        return
      }
      const filePath = sanitizePathWithin(heatwaveDir, `${slug}.html`)
      if (!filePath) {
        sendError(response, 403, 'forbidden')
        return
      }
      sendFile(request, response, filePath)
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
      sendFile(request, response, filePath, {
        cacheControl: 'no-store',
      })
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/uploads/')) {
      const relativePath = pathname.replace('/uploads/', '')
      const filePath = sanitizePathWithin(uploadsDir, relativePath)
      if (!filePath) {
        sendError(response, 403, 'forbidden')
        return
      }
      sendFile(request, response, filePath, {
        cacheControl: 'public, max-age=2592000, immutable',
      })
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/admin/auth/login') {
      const payload = await readJsonBody(request)
      const session = loginAdmin({
        ...payload,
        ip: request.headers['x-forwarded-for'] || request.socket?.remoteAddress || '',
        userAgent: request.headers['user-agent'] || '',
      })
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

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/admin/users/') && pathname.endsWith('/reset-password')) {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      if (session.user?.roleId !== 'role-super-admin') {
        sendError(response, 403, 'forbidden')
        return
      }
      const userId = pathname.replace('/api/v1/admin/users/', '').replace('/reset-password', '').replace(/^\/+|\/+$/g, '')
      const payload = await readJsonBody(request)
      sendOk(response, resetAdminPassword({
        userId,
        newPassword: payload.newPassword,
        operator: session.user?.username || session.user?.name || 'admin-console',
        preserveToken: session.token,
      }))
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

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/admin/moments/')) {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const parts = pathname.replace('/api/v1/admin/moments/', '').split('/').filter(Boolean)
      const momentId = parts[0] || ''
      const actionName = parts[1] || ''
      const payload = await readJsonBody(request)
      if (actionName === 'review') {
        sendOk(response, reviewManagedMoment({
          momentId,
          action: payload.action,
          reason: payload.reason,
          operator: session.user?.username || session.user?.name || 'admin-console',
        }))
        return
      }
      if (actionName === 'require-resubmit') {
        sendOk(response, reviewManagedMoment({
          momentId,
          action: 'require_resubmit',
          reason: payload.reason,
          operator: session.user?.username || session.user?.name || 'admin-console',
        }))
        return
      }
    }

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/admin/moment-reports/')) {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const parts = pathname.replace('/api/v1/admin/moment-reports/', '').split('/').filter(Boolean)
      const reportId = parts[0] || ''
      const actionName = parts[1] || ''
      const payload = await readJsonBody(request)
      if (actionName === 'handle') {
        sendOk(response, handleManagedMomentReport({
          reportId,
          action: payload.action,
          reason: payload.reason,
          operator: session.user?.username || session.user?.name || 'admin-console',
        }))
        return
      }
    }

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/admin/share-image-tasks/')) {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const parts = pathname.replace('/api/v1/admin/share-image-tasks/', '').split('/').filter(Boolean)
      const taskId = parts[0] || ''
      const actionName = parts[1] || ''
      const payload = await readJsonBody(request)
      if (actionName === 'retry') {
        sendOk(response, retryManagedShareImageTask({
          taskId,
          reason: payload.reason,
          operator: session.user?.username || session.user?.name || 'admin-console',
        }))
        return
      }
    }

    if (request.method === 'POST' && pathname === '/api/v1/admin/ranking-rewards/grant') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, grantRankingRewardsByAdmin({
        category: payload.category,
        limit: payload.limit,
        operator: session.user?.username || session.user?.name || 'admin-console',
      }))
      return
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

    if (request.method === 'GET' && pathname === '/api/v1/user/auth/config') {
      sendOk(response, {
        wechatLoginEnabled: Boolean(wechatConfig.appId && wechatConfig.appSecret),
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
          signature: payload.profile?.signature || '',
          identityTag: payload.profile?.identityTag || '',
        },
      })
      if (Number(session.profile?.loginCount) === 1) {
        grantFirstLoginBonus(session.profile.id)
      }
      sendOk(response, session)
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/user/avatar/upload') {
      const payload = await readJsonBody(request)
      const asset = await saveAdminImage({
        category: 'user-avatars',
        dataUrl: payload.dataUrl,
        fileName: payload.fileName || 'wechat-avatar.png',
      })
      sendOk(response, {
        url: asset.url,
      })
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
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
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

    if (request.method === 'GET' && pathname === '/api/v1/user/feature-zones') {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      sendOk(response, getUserFeatureZones(session.profile.id))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/favorites') {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const favorites = getUserFeatureZones(session.profile.id).favorites
      sendOk(response, {
        items: favorites,
        favorites,
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/usage-records') {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const usageRecords = getUserFeatureZones(session.profile.id).usageRecords
      sendOk(response, {
        items: usageRecords,
        usageRecords,
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/judge-stats') {
      const session = resolveUserSession(request)
      sendOk(response, getUserJudgeStats(session?.profile?.id || ''))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/tools/history') {
      sendOk(response, getToolHistory())
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/tools/history') {
      const payload = await readJsonBody(request)
      sendOk(response, recordToolUsage(payload))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/tools/catalog') {
      sendOk(response, listFrontendTools())
      return
    }

    if ((request.method === 'POST' || request.method === 'DELETE') && pathname && pathname.startsWith('/api/v1/tools/') && pathname.endsWith('/favorite')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const toolId = pathname.replace('/api/v1/tools/', '').replace('/favorite', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, toggleToolFavorite(session.profile.id, toolId, request.method === 'POST'))
      return
    }

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/tools/') && pathname.endsWith('/usage')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const toolId = pathname.replace('/api/v1/tools/', '').replace('/usage', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, recordUserToolUsage(session.profile.id, toolId))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/tools/usage-records') {
      sendOk(response, listUsageRecords())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/questions/catalog') {
      sendOk(response, getQuestionBankConfig(query.type))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/merchants/catalog') {
      sendOk(response, getMerchantPartnersConfig())
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

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/membership/benefits/') && pathname.endsWith('/use')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const benefitId = pathname.replace('/api/v1/membership/benefits/', '').replace('/use', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, useMembershipBenefit(session.profile.id, benefitId))
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

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/templates/') && pathname.endsWith('/use')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const templateId = pathname.replace('/api/v1/templates/', '').replace('/use', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, useTemplate(session.profile.id, templateId))
      return
    }

    if (request.method === 'POST' && pathname && pathname.startsWith('/api/v1/invite-rewards/') && pathname.endsWith('/claim')) {
      const session = requireUserSession(request, response)
      if (!session) {
        return
      }
      const inviteCode = pathname.replace('/api/v1/invite-rewards/', '').replace('/claim', '').replace(/^\/+|\/+$/g, '')
      sendOk(response, claimInviteReward(session.profile.id, inviteCode))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/share/config') {
      sendOk(response, getShareConfig())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/rankings/today') {
      sendOk(response, listTodayRankings({ category: query.category, limit: query.limit }))
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/moments/uploads/image') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      const asset = await uploadMomentImage({ profile: userSession.profile, payload })
      sendOk(response, asset, 201)
      return
    }

    if (pathname && pathname.startsWith('/api/v1/moments/')) {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const momentSegments = pathname.split('/').filter(Boolean)
      const momentId = momentSegments[3]
      const momentAction = momentSegments[4]
      if (request.method === 'GET' && momentId && momentAction === 'nomination-eligibility') {
        sendOk(response, getMomentNominationEligibility({ momentId, profile: userSession.profile, category: query.category }))
        return
      }
      if (request.method === 'POST' && momentId && momentAction === 'nominations') {
        const payload = await readJsonBody(request)
        sendOk(response, createMomentNomination({ momentId, profile: userSession.profile, payload }), 201)
        return
      }
      if (request.method === 'PUT' && momentId) {
        const payload = await readJsonBody(request)
        sendOk(response, updateMoment({ momentId, profile: userSession.profile, payload }))
        return
      }
      if (request.method === 'DELETE' && momentId) {
        sendOk(response, deleteMoment({ momentId, profile: userSession.profile }))
        return
      }
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/session-moment-summaries') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      if (shouldReadNormalized('summaries')) {
        try {
          sendOk(response, await listUserSessionMomentSummariesFromNormalized({ profile: userSession.profile }))
          return
        } catch (error) {
          console.error('[normalized-read] user/session-moment-summaries fallback:', error)
        }
      }
      sendOk(response, getUserSessionMomentSummaries({ profile: userSession.profile }))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/user/share-image-summaries') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      if (shouldReadNormalized('share-images')) {
        try {
          sendOk(response, await listUserShareImageSummariesFromNormalized({ profile: userSession.profile }))
          return
        } catch (error) {
          console.error('[normalized-read] user/share-image-summaries fallback:', error)
        }
      }
      sendOk(response, getUserShareImageSummaries({ profile: userSession.profile }))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/sessions/live') {
      if (query.sessionId && !query.inviteCode) {
        const userSession = requireUserSession(request, response)
        if (!userSession) {
          return
        }
        const directSession = getManagedSessionById(String(query.sessionId || '').trim())
        const directProfileId = String(userSession.profile.id || '').trim()
        const directIsMember = directProfileId && (directSession?.members || []).some((item) => String(item?.profileId || '').trim() === directProfileId)
        if (!directSession) {
          sendError(response, 404, 'session not found')
          return
        }
        if (!directIsMember) {
          sendError(response, 403, 'not session member')
          return
        }
      }
      if (shouldReadNormalized('sessions')) {
        try {
          const liveSession = await getLiveSessionConfigFromNormalized(query.sessionId, query.inviteCode)
          if (!query.sessionId && !query.inviteCode) {
            sendOk(response, liveSession)
            return
          }
          if (liveSession.id) {
            sendOk(response, liveSession)
            return
          }
          console.warn('[normalized-read] sessions/live miss, fallback to app_store:', {
            inviteCode: query.inviteCode ? String(query.inviteCode).slice(-6) : '',
            sessionId: query.sessionId || '',
          })
        } catch (error) {
          console.error('[normalized-read] sessions/live fallback:', error)
        }
      }
      if (query.sessionId && !getManagedSessionById(String(query.sessionId || '').trim())) {
        sendError(response, 404, 'session not found')
        return
      }
      if (query.inviteCode && !getManagedSessionByInviteCode(String(query.inviteCode || '').trim())) {
        sendError(response, 404, 'session not found')
        return
      }
      sendOk(response, getLiveSessionConfig(query.sessionId, query.inviteCode))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/clean-slate/baseline') {
      sendOk(response, getCleanSlateBaseline())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/parties/live') {
      if (query.partyId && !query.inviteCode) {
        const userSession = requireUserSession(request, response)
        if (!userSession) {
          return
        }
        const directParty = getManagedSessionById(String(query.partyId || '').trim())
        const directProfileId = String(userSession.profile.id || '').trim()
        const directIsMember = directProfileId && (directParty?.members || []).some((item) => String(item?.profileId || '').trim() === directProfileId)
        if (!directParty) {
          sendError(response, 404, 'party not found')
          return
        }
        if (!directIsMember) {
          sendError(response, 403, 'not party member')
          return
        }
      }
      if (query.partyId && !getManagedSessionById(String(query.partyId || '').trim())) {
        sendError(response, 404, 'party not found')
        return
      }
      if (query.inviteCode && !getManagedSessionByInviteCode(String(query.inviteCode || '').trim())) {
        sendError(response, 404, 'party not found')
        return
      }
      sendOk(response, getPartyLiveFacade(query.partyId, query.inviteCode))
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/parties/by-invite') {
      const session = getManagedSessionByInviteCode(String(query.inviteCode || ''))
      if (!session) {
        sendError(response, 404, 'party not found')
        return
      }
      sendOk(response, getPartyLiveFacade(session.id, session.inviteCode))
      return
    }

    if (pathname && pathname.startsWith('/api/v1/session-briefs/')) {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const segments = pathname.split('/').filter(Boolean)
      const briefId = segments[3]
      const action = segments[4]
      if (request.method === 'GET' && briefId && !action) {
        sendOk(response, getSessionBrief({ briefId, profile: userSession.profile }))
        return
      }
      if (request.method === 'POST' && briefId && action === 'share-image-tasks') {
        const payload = await readJsonBody(request)
        const task = createShareImageTask({ briefId, profile: userSession.profile, payload })
        scheduleShareImageTaskProcessing({ task, profile: userSession.profile })
        sendOk(response, task, 201)
        return
      }
    }

    if (pathname && pathname.startsWith('/api/v1/briefs/')) {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const segments = pathname.split('/').filter(Boolean)
      const briefId = segments[3]
      const action = segments[4]
      if (request.method === 'GET' && briefId && !action) {
        sendOk(response, mapBrief(getSessionBrief({ briefId, profile: userSession.profile })))
        return
      }
      if (request.method === 'POST' && briefId && action === 'share-images') {
        const payload = await readJsonBody(request)
        const task = createShareImageTask({ briefId, profile: userSession.profile, payload })
        scheduleShareImageTaskProcessing({ task, profile: userSession.profile })
        sendOk(response, mapShareImage(task), 201)
        return
      }
    }

    if (pathname && pathname.startsWith('/api/v1/share-image-tasks/')) {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const segments = pathname.split('/').filter(Boolean)
      const taskId = segments[3]
      const action = segments[4]
      if (request.method === 'GET' && taskId && !action) {
        sendOk(response, getShareImageTask({ taskId, profile: userSession.profile }))
        return
      }
      if (request.method === 'POST' && taskId && action === 'retry') {
        const task = retryShareImageTask({ taskId, profile: userSession.profile })
        scheduleShareImageTaskProcessing({ task, profile: userSession.profile })
        sendOk(response, task)
        return
      }
      if (request.method === 'POST' && taskId && action === 'process') {
        sendOk(response, await processShareImageTask({ taskId, profile: userSession.profile }))
        return
      }
    }

    if (pathname && pathname.startsWith('/api/v1/share-images/')) {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const segments = pathname.split('/').filter(Boolean)
      const taskId = segments[3]
      const action = segments[4]
      if (request.method === 'GET' && taskId && !action) {
        sendOk(response, mapShareImage(getShareImageTask({ taskId, profile: userSession.profile })))
        return
      }
      if (request.method === 'POST' && taskId && action === 'retry') {
        const task = retryShareImageTask({ taskId, profile: userSession.profile })
        scheduleShareImageTaskProcessing({ task, profile: userSession.profile })
        sendOk(response, mapShareImage(task))
        return
      }
      if (request.method === 'POST' && taskId && action === 'process') {
        sendOk(response, mapShareImage(await processShareImageTask({ taskId, profile: userSession.profile })))
        return
      }
    }

    if (request.method === 'GET' && pathname === '/api/v1/reports/featured') {
      sendOk(response, getFeaturedReport())
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/reports/history') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      if (shouldReadNormalized('reports')) {
        try {
          sendOk(response, await listManagedReportsFromNormalized(userSession.profile.id, String(query.mode || 'all')))
          return
        } catch (error) {
          console.error('[normalized-read] reports/history fallback:', error)
        }
      }
      sendOk(response, listManagedReports(userSession.profile.id, String(query.mode || 'all')))
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/api/v1/reports/') && pathname.endsWith('/poster.png')) {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const reportId = pathname.replace('/api/v1/reports/', '').replace('/poster.png', '').replace(/^\/+|\/+$/g, '')
      const report = getManagedReportById(reportId)
      if (!report) {
        sendError(response, 404, 'report not found')
        return
      }
      sendBinary(response, await renderReportPosterPng(report), 'image/png')
      return
    }

    if (request.method === 'GET' && pathname && pathname.startsWith('/api/v1/reports/')) {
      const reportId = pathname.replace('/api/v1/reports/', '').trim()
      if (reportId && reportId !== 'featured' && reportId !== 'history') {
        const report = getManagedReportById(reportId)
        if (!report) {
          sendError(response, 404, 'report not found')
          return
        }
        sendOk(response, report)
        return
      }
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
      const created = createManagedSession({
        ...payload,
        hostAvatarUrl: userSession.profile.avatarUrl || payload.hostAvatarUrl || '',
        hostName: userSession.profile.name,
        hostPhone: userSession.profile.phone || '',
        hostProfileId: userSession.profile.id,
      })
      sendOk(
        response,
        getLiveSessionConfig(created.id, created.inviteCode),
        201,
      )
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/parties') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      const created = createManagedSession({
        ...payload,
        hostAvatarUrl: userSession.profile.avatarUrl || payload.hostAvatarUrl || '',
        hostName: userSession.profile.name,
        hostPhone: userSession.profile.phone || '',
        hostProfileId: userSession.profile.id,
      })
      sendOk(response, getPartyLiveFacade(created.id, created.inviteCode), 201)
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

    if (request.method === 'POST' && pathname === '/api/v1/parties/join') {
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
        sendOk(response, getPartyLiveFacade(session.id, inviteCode))
      } catch (error) {
        if (error?.code === 'NOT_SESSION_PLAYER') {
          sendError(response, 403, 'not party member')
          return
        }
        if (error?.code === 'SESSION_NOT_FOUND') {
          sendError(response, 404, 'party not found')
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

    if (pathname && pathname.startsWith('/api/v1/parties/')) {
      const partySegments = pathname.split('/').filter(Boolean)
      const partyId = partySegments[3]
      const partyAction = partySegments[4]
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const targetParty = getManagedSessionById(partyId)
      if (!targetParty) {
        sendError(response, 404, 'party not found')
        return
      }
      if (request.method === 'POST' && partyAction === 'briefs') {
        sendOk(response, mapBrief(createOrRefreshSessionBrief({ sessionId: partyId, profile: userSession.profile })), 201)
        return
      }
    }

    if (pathname && pathname.startsWith('/api/v1/sessions/')) {
      const sessionSegments = pathname.split('/').filter(Boolean)
      const sessionId = sessionSegments[3]
      const sessionAction = sessionSegments[4]
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const targetSession = getManagedSessionById(sessionId)
      if (!targetSession) {
        sendError(response, 404, 'session not found')
        return
      }
      const userProfileId = String(userSession.profile.id || '').trim()
      const isHost = String(targetSession.members?.find((item) => item?.isHost)?.profileId || '').trim() === userProfileId
      const isMember = userProfileId && (targetSession.members || []).some((item) => String(item?.profileId || '') === userProfileId)

      if (request.method === 'POST' && sessionAction === 'end') {
        if (!isHost) {
          sendError(response, 403, 'forbidden')
          return
        }
        const payload = await readJsonBody(request)
        const updated = endManagedSession(sessionId, payload)
        if (!updated) {
          sendError(response, 404, 'session not found')
          return
        }
        sendOk(response, updated)
        return
      }
      if (request.method === 'POST' && sessionAction === 'members' && sessionSegments[6] === 'kick') {
        if (!isHost) {
          sendError(response, 403, 'forbidden')
          return
        }
        const targetProfileId = decodeURIComponent(sessionSegments[5] || '')
        try {
          const updated = kickManagedSessionMember({
            operatorProfileId: userProfileId,
            profileId: targetProfileId,
            sessionId,
          })
          if (!updated) {
            sendError(response, 404, 'session not found')
            return
          }
          sendOk(response, getLiveSessionConfig(updated.id, updated.inviteCode))
        } catch (error) {
          if (error?.code === 'HOST_CANNOT_BE_KICKED') {
            sendError(response, 400, 'host cannot be kicked')
            return
          }
          if (error?.code === 'FORBIDDEN') {
            sendError(response, 403, 'forbidden')
            return
          }
          throw error
        }
        return
      }
      if (request.method === 'POST' && sessionAction === 'moments') {
        const payload = await readJsonBody(request)
        sendOk(response, createMoment({ sessionId, profile: userSession.profile, payload }), 201)
        return
      }
      if (request.method === 'GET' && sessionAction === 'timeline') {
        sendOk(response, getSessionTimeline({ sessionId, profile: userSession.profile }))
        return
      }
      if (request.method === 'POST' && sessionAction === 'events') {
        const payload = await readJsonBody(request)
        sendOk(response, createSessionEvent({ sessionId, profile: userSession.profile, payload }), 201)
        return
      }
      if (request.method === 'POST' && sessionAction === 'brief') {
        const payload = await readJsonBody(request)
        sendOk(response, createOrRefreshSessionBrief({ sessionId, profile: userSession.profile, payload }), 201)
        return
      }

      if (request.method === 'PUT') {
        if (!isHost) {
          sendError(response, 403, 'forbidden')
          return
        }
        const payload = await readJsonBody(request)
        const updated = updateManagedSession(sessionId, payload)
        if (!updated) {
          sendError(response, 404, 'session not found')
          return
        }
        sendOk(response, updated)
        return
      }
      if (request.method === 'DELETE') {
        if (!isHost) {
          sendError(response, 403, 'forbidden')
          return
        }
        if (!deleteManagedSession(sessionId)) {
          sendError(response, 404, 'session not found')
          return
        }
        sendOk(response, { id: sessionId, removed: true })
        return
      }
    }

    if (request.method === 'POST' && pathname === '/api/v1/reports') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(
        response,
        finishManagedSession({
          ...payload,
          profileId: userSession.profile.id,
        }),
        201,
      )
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
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
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
      const asset = await saveAdminImage({
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
      const asset = await saveAdminImage(payload)
      sendOk(response, {
        uploaded: true,
        asset,
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/admin/config/points') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      sendOk(response, getPointsConfig())
      return
    }

    if (request.method === 'PUT' && pathname === '/api/v1/admin/config/points') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, {
        pointsConfig: updatePointsConfig(payload),
        updatedAt: new Date().toISOString(),
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/admin/config/templates') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      sendOk(response, getTemplateConfig())
      return
    }

    if (request.method === 'PUT' && pathname === '/api/v1/admin/config/templates') {
      const session = requireAdminSession(request, response)
      if (!session) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, {
        templateConfig: updateTemplateConfig(payload),
        updatedAt: new Date().toISOString(),
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/social/bootstrap') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const profileId = userSession.profile.id
      const sessionContacts = getSessionContactsByProfile(profileId)
      const allowedFriendIds = new Set(sessionContacts.map((item) => String(item.profileId || item.id || '').trim()).filter(Boolean))
      if (sessionContacts.length) {
        try {
          syncSessionContacts({
            ownerId: profileId,
            participants: sessionContacts,
          })
        } catch {
          void 0
        }
      }

      const bootstrap = getBootstrap(profileId)
      bootstrap.wineFriends = bootstrap.wineFriends.filter((item) => allowedFriendIds.has(String(item.profileId || '').trim()))
      sendOk(response, bootstrap)
      return
    }

    if (request.method === 'GET' && pathname === '/api/v1/social/users/search') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const ownerId = userSession.profile.id
      const requestOwnerId = String(query.profileId || '').trim()
      if (requestOwnerId && requestOwnerId !== ownerId) {
        sendError(response, 403, 'forbidden')
        return
      }
      sendOk(
        response,
        searchProfiles({
          ownerId,
          keyword: String(query.keyword || ''),
        }),
      )
      return
    }

    if (request.method === 'PUT' && pathname === '/api/v1/social/profile') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, ensureProfile({ ...payload, id: userSession.profile.id }))
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/social/friends') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, addFriend({ ...payload, ownerId: userSession.profile.id }))
      return
    }

    if (request.method === 'POST' && pathname === '/api/v1/social/friends/touch') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, touchFriends({ ...payload, ownerId: userSession.profile.id }))
      return
    }

    if (pathname && pathname.startsWith('/api/v1/social/friends/')) {
      const friendshipId = pathname.replace('/api/v1/social/friends/', '')
      if (request.method === 'PUT') {
        const userSession = requireUserSession(request, response)
        if (!userSession) {
          return
        }
        const payload = await readJsonBody(request)
        sendOk(response, updateFriend({ ...payload, ownerId: userSession.profile.id, friendshipId }))
        return
      }
      if (request.method === 'DELETE') {
        const userSession = requireUserSession(request, response)
        if (!userSession) {
          return
        }
        sendOk(response, removeFriend({ ownerId: userSession.profile.id, friendshipId }))
        return
      }
    }

    if (request.method === 'POST' && pathname === '/api/v1/social/pokes') {
      const userSession = requireUserSession(request, response)
      if (!userSession) {
        return
      }
      const payload = await readJsonBody(request)
      sendOk(response, sendPoke({ ...payload, ownerId: userSession.profile.id }))
      return
    }

    if (pathname && pathname.startsWith('/api/v1/social/pokes/')) {
      const segments = pathname.split('/').filter(Boolean)
      const threadId = segments[4]
      const action = segments[5]
      if (request.method === 'POST' && action === 'reply') {
        const userSession = requireUserSession(request, response)
        if (!userSession) {
          return
        }
        const payload = await readJsonBody(request)
        sendOk(response, replyPoke({ profileId: userSession.profile.id, threadId }))
        return
      }
      if (request.method === 'DELETE' && threadId) {
        const userSession = requireUserSession(request, response)
        if (!userSession) {
          return
        }
        sendOk(response, ignorePoke({ profileId: userSession.profile.id, threadId }))
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

Promise.all([initContentStore(), initSocialStore(), initAdminStore(), initAssetsManifest(), initMomentsStore()])
  .then(() => {
    server.listen(port, () => {
      console.log(`jiuzhuopanguan backend listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('failed to initialize stores', error)
    process.exit(1)
  })
