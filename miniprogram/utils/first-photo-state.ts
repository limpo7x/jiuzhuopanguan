export interface FirstPhotoStateLike {
  coverPhotoUrl?: string
  endedAt?: string
  firstPhotoUploadedAt?: string
  hasFirstPhoto?: boolean
  isActiveForResume?: boolean
  readyShareImageUrl?: string
  shareImageUrl?: string
  state?: string
  stateText?: string
  status?: string
}

export const isEndedFirstPhotoState = (item: FirstPhotoStateLike) => {
  const stateText = `${item.state || ''} ${item.status || ''} ${item.stateText || ''}`.trim()
  return Boolean(item.endedAt) || /已结束|结束|已完成|ended|finished|closed|complete|completed|done/i.test(stateText)
}

export const hasFirstPhotoEvidence = (item: FirstPhotoStateLike) =>
  item.hasFirstPhoto === true
  || Boolean(String(item.firstPhotoUploadedAt || '').trim())
  || Boolean(item.coverPhotoUrl)

export const isActiveForResumeByFirstPhoto = (item: FirstPhotoStateLike) => {
  if (isEndedFirstPhotoState(item)) return false
  return hasFirstPhotoEvidence(item)
}
