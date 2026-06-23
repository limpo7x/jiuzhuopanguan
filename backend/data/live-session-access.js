const cleanText = (value) => String(value || '').trim()

const getSessionId = (session = {}) => cleanText(session.id || session.partyId)

const getInviteCode = (session = {}) => cleanText(session.inviteCode).toUpperCase()

const isSessionMember = (session = {}, profileId = '') => {
  const normalizedProfileId = cleanText(profileId)
  const members = Array.isArray(session.members) ? session.members : []
  return Boolean(
    normalizedProfileId &&
      members.some((item) => cleanText(item?.profileId) === normalizedProfileId),
  )
}

const getInviteLiveSessionAccess = ({
  appStoreSession,
  liveSession,
  requestedInviteCode,
  viewerProfileId,
} = {}) => {
  if (!appStoreSession || !liveSession || !isSessionMember(appStoreSession, viewerProfileId)) {
    return 'public'
  }

  const appStoreSessionId = getSessionId(appStoreSession)
  const returnedSessionId = getSessionId(liveSession)
  const appStoreInviteCode = getInviteCode(appStoreSession)
  const returnedInviteCode = getInviteCode(liveSession)
  const normalizedRequestedInviteCode = cleanText(requestedInviteCode).toUpperCase()
  const sameSession = Boolean(appStoreSessionId && returnedSessionId && appStoreSessionId === returnedSessionId)
  const sameInviteCode = Boolean(
    normalizedRequestedInviteCode &&
      appStoreInviteCode === normalizedRequestedInviteCode &&
      returnedInviteCode === normalizedRequestedInviteCode,
  )

  return sameSession && sameInviteCode ? 'private' : 'public'
}

module.exports = {
  getInviteLiveSessionAccess,
}
