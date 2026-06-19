import { getUserCommerceState } from '../services/content'
import type { SocialProfile } from './social'

const FIRST_LOGIN_TASK_ID = 'task-first-login'
const DEFAULT_FIRST_LOGIN_BONUS = 500

const resolveFirstLoginBonus = async () => {
  const state = await getUserCommerceState().catch(() => null)
  const ledger = state?.pointsLedger || []
  const entry = ledger.find((item) => item.sourceId === FIRST_LOGIN_TASK_ID)
  const delta = Math.abs(Number(entry?.delta) || 0)
  return delta || DEFAULT_FIRST_LOGIN_BONUS
}

const openPointsMall = () => {
  wx.navigateTo({
    url: '/pages/privacy-state/index?type=feature',
    fail: () => wx.redirectTo({ url: '/pages/privacy-state/index?type=feature' }),
  })
}

export const showFirstLoginBonusModal = async (profile: Pick<SocialProfile, 'loginCount'>) => {
  if (Number(profile.loginCount) !== 1) {
    return false
  }

  const bonus = await resolveFirstLoginBonus()
  await new Promise<void>((resolve) => {
    wx.showModal({
      title: `赠送 ${bonus} 积分已到账`,
      content: '首次登录奖励已自动发放。\n\n积分可用于：\n1. 解锁高级海报模板包\n2. 兑换免广告特权\n3. 兑换商户优惠券和专属头像框',
      confirmText: '去使用',
      cancelText: '知道了',
      success: (result) => {
        if (result.confirm) {
          openPointsMall()
        }
        resolve()
      },
      fail: () => resolve(),
    })
  })
  return true
}
