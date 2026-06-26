import { recordDiagnostic } from './diagnostics'

interface PrivacySetting {
  needAuthorization: boolean
  privacyContractName: string
}

interface PrivacySettingResult extends WechatMiniprogram.GeneralCallbackResult {
  needAuthorization?: boolean
  privacyContractName?: string
}

interface PrivacyWxApi {
  getPrivacySetting?: (option: {
    fail?: (error: WechatMiniprogram.GeneralCallbackResult) => void
    success?: (result: PrivacySettingResult) => void
  }) => void
  requirePrivacyAuthorize?: (option: {
    fail?: (error: WechatMiniprogram.GeneralCallbackResult) => void
    success?: (result: WechatMiniprogram.GeneralCallbackResult) => void
  }) => void
}

const DEFAULT_PRIVACY_CONTRACT_NAME = '用户隐私保护指引'

const getPrivacyApi = () => wx as unknown as PrivacyWxApi

const normalizePrivacySetting = (result?: PrivacySettingResult): PrivacySetting => ({
  needAuthorization: Boolean(result?.needAuthorization),
  privacyContractName: String(result?.privacyContractName || DEFAULT_PRIVACY_CONTRACT_NAME).trim(),
})

const normalizePrivacyError = (error: unknown) => {
  const errMsg = String((error as WechatMiniprogram.GeneralCallbackResult)?.errMsg || (error as Error)?.message || '')
  if (/not declared in the privacy agreement|scope is not declared/i.test(errMsg)) {
    return new Error('小程序后台隐私指引未声明当前接口，请确认头像昵称隐私项已生效')
  }
  if (/disagree|deny|cancel/i.test(errMsg)) {
    return new Error('请先同意隐私保护指引')
  }
  return new Error(errMsg || '请先同意隐私保护指引')
}

export const getMiniProgramPrivacySetting = (): Promise<PrivacySetting> =>
  new Promise((resolve) => {
    const privacyApi = getPrivacyApi()
    if (typeof privacyApi.getPrivacySetting !== 'function') {
      resolve({
        needAuthorization: false,
        privacyContractName: DEFAULT_PRIVACY_CONTRACT_NAME,
      })
      return
    }
    privacyApi.getPrivacySetting({
      fail: () => {
        resolve({
          needAuthorization: false,
          privacyContractName: DEFAULT_PRIVACY_CONTRACT_NAME,
        })
      },
      success: (result) => resolve(normalizePrivacySetting(result)),
    })
  })

export const requestMiniProgramPrivacyAuthorization = async (): Promise<PrivacySetting> => {
  const privacyApi = getPrivacyApi()
  if (typeof privacyApi.requirePrivacyAuthorize !== 'function') {
    throw new Error('当前微信版本不支持隐私授权，请升级微信后重试')
  }

  recordDiagnostic('privacy.authorize.start')
  const setting = await getMiniProgramPrivacySetting()
  recordDiagnostic('privacy.setting.loaded', {
    needAuthorization: setting.needAuthorization,
  })
  return new Promise((resolve, reject) => {
    privacyApi.requirePrivacyAuthorize?.({
      fail: (error) => {
        recordDiagnostic('privacy.authorize.fail', {
          errMsg: String(error?.errMsg || ''),
        })
        reject(normalizePrivacyError(error))
      },
      success: () => {
        recordDiagnostic('privacy.authorize.success')
        resolve(setting)
      },
    })
  })
}
