export interface NominationReasonLike {
  completionStatus?: string
  reason?: string
  reasonCode?: string
  reasonText?: string
  moderationReason?: string
  reviewStatus?: string
  secondaryReviewStatus?: string
  usageConsent?: { ranking?: boolean }
  visibility?: string
  nodeType?: string
  rankingEligible?: boolean
}

const reasonTextMap: Record<string, string> = {
  already_nominated_today: '今天已推举过这张照片',
  content_review_rejected: '图片内容安全审核未通过，请更换后再推举',
  content_review_required: '内容安全确认后可参与回忆榜',
  media_incomplete: '照片还没有保存完成',
  moment_removed: '这张照片已被移出榜单候选',
  ranking_consent_required: '需公开授权后可推举',
  ranking_not_enabled: '暂未满足回忆榜资格',
  visibility_not_public: '私密照片不能参与回忆榜',
}

const legacyReasonMap: Array<[RegExp, string]> = [
  [/already nominated/i, '今天已推举过这张照片'],
  [/consent|usage|authorization|authorize/i, '需公开授权后可推举'],
  [/private|selected|visibility/i, '私密照片不能参与回忆榜'],
  [/review|audit|safety/i, '内容安全确认后可参与回忆榜'],
  [/incomplete|media|image/i, '照片还没有保存完成'],
  [/not eligible|ranking/i, '暂未满足回忆榜资格'],
]

export const resolveNominationReasonText = (source: NominationReasonLike = {}) => {
  const reasonText = String(source.reasonText || '').trim()
  if (reasonText) return reasonText
  const moderationReason = String(source.moderationReason || '').trim()
  if (moderationReason) return moderationReason
  const reasonCode = String(source.reasonCode || '').trim()
  if (reasonCode && reasonTextMap[reasonCode]) return reasonTextMap[reasonCode]

  const usageConsent = source.usageConsent || {}
  if (source.completionStatus && source.completionStatus !== 'complete') return reasonTextMap.media_incomplete
  if (usageConsent.ranking === false) return reasonTextMap.ranking_consent_required
  const visibility = String(source.visibility || '').trim()
  if (source.nodeType === 'private' || visibility === 'private' || visibility === 'selected') return reasonTextMap.visibility_not_public
  if (
    (source.reviewStatus && source.reviewStatus !== 'approved') ||
    (source.secondaryReviewStatus && source.secondaryReviewStatus !== 'approved')
  ) {
    return reasonTextMap.content_review_required
  }
  if (source.rankingEligible === false) return reasonTextMap.ranking_not_enabled

  const reason = String(source.reason || '').trim()
  const mapped = legacyReasonMap.find(([pattern]) => pattern.test(reason))
  return mapped ? mapped[1] : reason || reasonTextMap.ranking_not_enabled
}

export const resolveNominationDisabledLabel = (source: NominationReasonLike = {}) => {
  const reasonCode = String(source.reasonCode || '').trim()
  if (reasonCode === 'already_nominated_today') return '已推举'
  if (reasonCode === 'ranking_consent_required') return '需授权'
  if (reasonCode === 'visibility_not_public') return '私密'
  if (reasonCode === 'content_review_rejected') return '已打回'
  if (reasonCode === 'content_review_required') return '待确认'
  return '不可推举'
}
