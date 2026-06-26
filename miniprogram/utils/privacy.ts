interface PrivacySetting {
  needAuthorization: boolean
  privacyContractName: string
}

interface PrivacySettingResult extends WechatMiniprogram.GeneralCallbackResult {
  needAuthorization?: boolean
  privacyContractName?: string
}

interface PrivacyResolvePayload {
  buttonId?: string
  event: 'agree' | 'disagree'
}

type PrivacyAuthorizationResolver = (payload: PrivacyResolvePayload) => void
type PrivacyAuthorizationHandler = (setting: PrivacySetting) => void

interface PrivacyWxApi {
  getPrivacySetting?: (option: {
    fail?: (error: WechatMiniprogram.GeneralCallbackResult) => void
    success?: (result: PrivacySettingResult) => void
  }) => void
  onNeedPrivacyAuthorization?: (
    listener: (resolve: PrivacyAuthorizationResolver, eventInfo?: WechatMiniprogram.IAnyObject) => void,
  ) => void
  openPrivacyContract?: (option: {
    fail?: (error: WechatMiniprogram.GeneralCallbackResult) => void
    success?: (result: WechatMiniprogram.GeneralCallbackResult) => void
  }) => void
  requirePrivacyAuthorize?: (option: {
    fail?: (error: WechatMiniprogram.GeneralCallbackResult) => void
    success?: (result: WechatMiniprogram.GeneralCallbackResult) => void
  }) => void
}

const DEFAULT_PRIVACY_CONTRACT_NAME = '用户隐私保护指引'

let bridgeInstalled = false
let latestPrivacySetting: PrivacySetting = {
  needAuthorization: false,
  privacyContractName: DEFAULT_PRIVACY_CONTRACT_NAME,
}
let privacyAuthorizationHandler: PrivacyAuthorizationHandler | null = null
let privacyAuthorizationResolver: PrivacyAuthorizationResolver | null = null

const getPrivacyApi = () => wx as unknown as PrivacyWxApi

const normalizePrivacySetting = (result?: PrivacySettingResult): PrivacySetting => ({
  needAuthorization: Boolean(result?.needAuthorization),
  privacyContractName: String(result?.privacyContractName || latestPrivacySetting.privacyContractName || DEFAULT_PRIVACY_CONTRACT_NAME).trim(),
})

const normalizePrivacyError = (error: unknown) => {
  const errMsg = String((error as WechatMiniprogram.GeneralCallbackResult)?.errMsg || (error as Error)?.message || '')
  if (/not declared in the privacy agreement|scope is not declared/i.test(errMsg)) {
    return new Error('小程序后台未声明头像昵称用途，请先补全隐私保护指引')
  }
  if (/disagree|deny|cancel/i.test(errMsg)) {
    return new Error('请先同意隐私保护指引')
  }
  return new Error(errMsg || '请先同意隐私保护指引')
}

export const initPrivacyAuthorizationBridge = () => {
  if (bridgeInstalled) return
  bridgeInstalled = true
  const privacyApi = getPrivacyApi()
  if (typeof privacyApi.onNeedPrivacyAuthorization !== 'function') return

  privacyApi.onNeedPrivacyAuthorization((resolve) => {
    privacyAuthorizationResolver = resolve
    if (privacyAuthorizationHandler) {
      privacyAuthorizationHandler(latestPrivacySetting)
    }
  })
}

export const setPrivacyAuthorizationHandler = (handler: PrivacyAuthorizationHandler | null) => {
  privacyAuthorizationHandler = handler
  if (handler && privacyAuthorizationResolver) {
    handler(latestPrivacySetting)
  }
}

export const getMiniProgramPrivacySetting = (): Promise<PrivacySetting> =>
  new Promise((resolve) => {
    const privacyApi = getPrivacyApi()
    if (typeof privacyApi.getPrivacySetting !== 'function') {
      resolve(latestPrivacySetting)
      return
    }
    privacyApi.getPrivacySetting({
      fail: () => resolve(latestPrivacySetting),
      success: (result) => {
        latestPrivacySetting = normalizePrivacySetting(result)
        resolve(latestPrivacySetting)
      },
    })
  })

export const requestMiniProgramPrivacyAuthorization = async (): Promise<PrivacySetting> => {
  const setting = await getMiniProgramPrivacySetting()
  if (!setting.needAuthorization) {
    return setting
  }

  const privacyApi = getPrivacyApi()
  if (typeof privacyApi.requirePrivacyAuthorize !== 'function') {
    throw new Error('当前微信版本不支持隐私授权，请升级微信后重试')
  }

  return new Promise((resolve, reject) => {
    privacyApi.requirePrivacyAuthorize?.({
      fail: (error) => reject(normalizePrivacyError(error)),
      success: () => resolve(setting),
    })
  })
}

export const resolveMiniProgramPrivacyAuthorization = (agreed: boolean, buttonId = 'agree-privacy') => {
  if (!privacyAuthorizationResolver) return
  privacyAuthorizationResolver(agreed ? { event: 'agree', buttonId } : { event: 'disagree' })
  privacyAuthorizationResolver = null
}

export const openMiniProgramPrivacyContract = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const privacyApi = getPrivacyApi()
    if (typeof privacyApi.openPrivacyContract !== 'function') {
      reject(new Error('当前微信版本不支持查看隐私保护指引'))
      return
    }
    privacyApi.openPrivacyContract({
      fail: (error) => reject(normalizePrivacyError(error)),
      success: () => resolve(),
    })
  })
