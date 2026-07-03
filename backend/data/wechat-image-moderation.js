require('../load-env')

const https = require('https')

const DEFAULT_SERVICE_ID = 'wxd554a452661f30b7'
const DEFAULT_API_NAME = 'ImageModeration'
const DEFAULT_ENDPOINT = 'https://api.weixin.qq.com/wxa/servicemarket'

const accessTokenCache = {
  token: '',
  expiresAt: 0,
}

const cleanText = (value = '') => String(value || '').trim()

const getTimeoutMs = () =>
  Math.max(3000, Number(process.env.WECHAT_IMAGE_MODERATION_TIMEOUT_MS || process.env.WECHAT_API_TIMEOUT_MS || 10000) || 10000)

const getWechatConfig = () => ({
  appId: cleanText(process.env.WECHAT_APP_ID),
  appSecret: cleanText(process.env.WECHAT_APP_SECRET),
})

const requestJson = (requestUrl, options = {}, payload) =>
  new Promise((resolve, reject) => {
    const target = new URL(requestUrl)
    const body = payload ? JSON.stringify(payload) : ''
    const req = https.request(
      {
        method: body ? 'POST' : 'GET',
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        headers: body
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
            }
          : undefined,
        ...options,
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => {
          raw += chunk
        })
        res.on('end', () => {
          let parsed = {}
          try {
            parsed = JSON.parse(raw || '{}')
          } catch (error) {
            reject(Object.assign(new Error('微信图片审核返回格式异常'), { statusCode: 502 }))
            return
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(Object.assign(new Error(parsed.errmsg || `微信图片审核 HTTP ${res.statusCode}`), { statusCode: 502 }))
            return
          }
          resolve(parsed)
        })
      },
    )
    req.on('error', (error) => reject(Object.assign(error, { statusCode: error.statusCode || 502 })))
    req.setTimeout(getTimeoutMs(), () => {
      req.destroy(Object.assign(new Error('微信图片审核超时，请稍后再试'), { statusCode: 504 }))
    })
    if (body) {
      req.write(body)
    }
    req.end()
  })

const getWechatAccessToken = async () => {
  const { appId, appSecret } = getWechatConfig()
  if (!appId || !appSecret) {
    throw Object.assign(new Error('服务器未配置微信图片审核，暂不能推举'), { statusCode: 503 })
  }
  if (accessTokenCache.token && accessTokenCache.expiresAt > Date.now() + 60 * 1000) {
    return accessTokenCache.token
  }
  const payload = await requestJson(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(appSecret)}`,
  )
  if (!payload.access_token) {
    throw Object.assign(new Error(payload.errmsg || '获取微信图片审核凭证失败'), { statusCode: 502 })
  }
  accessTokenCache.token = payload.access_token
  accessTokenCache.expiresAt = Date.now() + Math.max(300, Number(payload.expires_in) || 7200) * 1000
  return accessTokenCache.token
}

const unwrapProviderResponse = (value = {}) => {
  if (!value || typeof value !== 'object') {
    return {}
  }
  if (value.Response && typeof value.Response === 'object') {
    return value.Response
  }
  return value
}

const parseProviderData = (payload = {}) => {
  const rawData = payload.data
  if (typeof rawData === 'string') {
    try {
      return unwrapProviderResponse(JSON.parse(rawData || '{}'))
    } catch {
      return {}
    }
  }
  return unwrapProviderResponse(rawData)
}

const normalizeSuggestion = (value = '') => {
  const text = cleanText(value)
  if (/^pass$/i.test(text)) return 'Pass'
  if (/^block$/i.test(text)) return 'Block'
  if (/^review$/i.test(text)) return 'Review'
  return text || 'Review'
}

const riskLabelMap = {
  Abuse: '谩骂风险',
  Ad: '广告或二维码风险',
  Custom: '自定义风险词',
  Normal: '正常',
  Porn: '色情风险',
}

const buildModerationReason = (result = {}) => {
  const suggestion = normalizeSuggestion(result.Suggestion)
  if (suggestion === 'Pass') {
    return ''
  }
  const label = cleanText(result.Label)
  const subLabel = cleanText(result.SubLabel)
  const score = Number(result.Score) || 0
  const labelText = riskLabelMap[label] || label || '图片内容风险'
  const detail = [labelText, subLabel].filter(Boolean).join(' / ')
  const prefix = suggestion === 'Block' ? '图片内容安全审核未通过' : '图片内容需要复审'
  return `${prefix}：${detail}${score ? `（置信度 ${Math.round(score)}）` : ''}`
}

const normalizeModerationResult = (payload = {}, clientMsgId = '') => {
  const providerData = parseProviderData(payload)
  const suggestion = normalizeSuggestion(providerData.Suggestion)
  return {
    clientMsgId: cleanText(providerData.client_msg_id || payload.client_msg_id || clientMsgId),
    fileMd5: cleanText(providerData.FileMD5),
    label: cleanText(providerData.Label),
    passed: suggestion === 'Pass',
    rawErrcode: Number(payload.errcode) || 0,
    rawErrmsg: cleanText(payload.errmsg),
    reason: buildModerationReason(providerData),
    requestId: cleanText(providerData.RequestId),
    score: Number(providerData.Score) || 0,
    subLabel: cleanText(providerData.SubLabel),
    suggestion,
  }
}

const moderateImage = async ({ fileContent = '', fileUrl = '', clientMsgId = '' } = {}) => {
  const normalizedFileContent = cleanText(fileContent).replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
  const normalizedFileUrl = cleanText(fileUrl)
  if (!normalizedFileContent && !normalizedFileUrl) {
    throw Object.assign(new Error('缺少可审核的图片内容'), { statusCode: 400 })
  }

  const accessToken = await getWechatAccessToken()
  const serviceId = cleanText(process.env.WECHAT_IMAGE_MODERATION_SERVICE_ID) || DEFAULT_SERVICE_ID
  const apiName = cleanText(process.env.WECHAT_IMAGE_MODERATION_API) || DEFAULT_API_NAME
  const endpoint = cleanText(process.env.WECHAT_IMAGE_MODERATION_ENDPOINT) || DEFAULT_ENDPOINT
  const requestId = clientMsgId || `jzp-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
  const data = {
    Action: apiName,
  }
  if (normalizedFileContent) {
    data.FileContent = normalizedFileContent
  } else {
    data.FileUrl = normalizedFileUrl
  }

  const payload = await requestJson(
    `${endpoint}?access_token=${encodeURIComponent(accessToken)}`,
    { method: 'POST' },
    {
      api: apiName,
      client_msg_id: requestId,
      data,
      service: serviceId,
    },
  )
  if (Number(payload.errcode) !== 0) {
    throw Object.assign(new Error(payload.errmsg || '微信图片审核失败'), { statusCode: 502 })
  }
  return normalizeModerationResult(payload, requestId)
}

module.exports = {
  buildModerationReason,
  moderateImage,
  normalizeModerationResult,
}
