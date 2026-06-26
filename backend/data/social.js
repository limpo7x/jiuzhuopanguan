const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { createStoreAccessor } = require('./store-accessor')

const storePath = path.join(__dirname, 'social-store.json')
const adminStorePath = path.join(__dirname, 'admin-store.json')
const USER_SESSION_TTL = 1000 * 60 * 60 * 24 * 30

const now = () => Date.now()
const isoNow = () => new Date().toISOString()
const randomToken = () => crypto.randomBytes(24).toString('hex')
const randomId = (prefix) => `${prefix}-${now()}-${Math.random().toString(16).slice(2, 8)}`
const maskPhone = (phone = '') => (phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone)
const cleanText = (value = '') => String(value || '').trim()
const createHttpError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode })
const cleanAvatar = (value = '') => {
  const text = cleanText(value)
  if (!text) return ''
  if (/^\/static\/avatar-(?:host|\d+)\.png$/i.test(text) || text.startsWith('/assets/avatars/')) return ''
  if (/^(wxfile|file):\/\//i.test(text)) return ''
  if (/^https?:\/\/127\.0\.0\.1(?::\d+)?\/__store__\//i.test(text)) return ''
  if (/\/tmp\//i.test(text) || /\/__tmp__\//i.test(text) || /\/__store__\//i.test(text)) return ''
  return text
}

const hasProfileIdentity = (profile = {}) =>
  Boolean(
    cleanText(profile.name) ||
      cleanAvatar(profile.avatarUrl) ||
      cleanText(profile.phone) ||
      cleanText(profile.wechatOpenId) ||
      cleanText(profile.wechatUnionId),
  )

const isRegisteredProfile = (profile = {}) =>
  Boolean(cleanText(profile.wechatOpenId) || cleanText(profile.wechatUnionId) || cleanText(profile.phone))

const createDefaultStore = () => ({
  profiles: [],
  friendships: [],
  loginLogs: [],
  pokes: [],
  userSessions: [],
})

const normalizeProfile = (profile = {}, fallback = {}) => {
  const timestamp = now()
  return {
    id: cleanText(profile.id || fallback.id || randomId('user')),
    name: cleanText(profile.name || fallback.name),
    avatarUrl: cleanAvatar(profile.avatarUrl || fallback.avatarUrl),
    signature: cleanText(profile.signature || fallback.signature),
    identityTag: cleanText(profile.identityTag || fallback.identityTag),
    phone: cleanText(profile.phone || fallback.phone),
    wechatOpenId: cleanText(profile.wechatOpenId || fallback.wechatOpenId),
    wechatUnionId: cleanText(profile.wechatUnionId || fallback.wechatUnionId),
    phoneBoundAt: cleanText(profile.phoneBoundAt || fallback.phoneBoundAt),
    lastLoginAt: cleanText(profile.lastLoginAt || fallback.lastLoginAt),
    loginCount: Math.max(0, Number(profile.loginCount ?? fallback.loginCount) || 0),
    createdAt: Number(profile.createdAt || fallback.createdAt) || timestamp,
    updatedAt: timestamp,
  }
}

const normalizeStore = (store = {}) => ({
  profiles: Array.isArray(store.profiles) ? store.profiles.map((item) => normalizeProfile(item)).filter(hasProfileIdentity) : [],
  friendships: Array.isArray(store.friendships)
    ? store.friendships.map((item, index) => ({
        id: cleanText(item.id || `friendship-${index + 1}`),
        ownerId: cleanText(item.ownerId),
        friendId: cleanText(item.friendId),
        alias: cleanText(item.alias),
        meta: cleanText(item.meta),
        updatedAt: Number(item.updatedAt) || now(),
      }))
    : [],
  loginLogs: Array.isArray(store.loginLogs)
    ? store.loginLogs.map((item, index) => ({
        id: cleanText(item.id || `login-log-${index + 1}`),
        profileId: cleanText(item.profileId),
        phone: cleanText(item.phone),
        wechatOpenId: cleanText(item.wechatOpenId),
        loginAt: cleanText(item.loginAt),
        source: cleanText(item.source),
      }))
    : [],
  pokes: Array.isArray(store.pokes)
    ? store.pokes.map((item) => ({
        id: cleanText(item.id),
        senderId: cleanText(item.senderId),
        receiverId: cleanText(item.receiverId),
        status: item.status === 'matched' ? 'matched' : 'pending',
        createdAt: Number(item.createdAt) || now(),
        updatedAt: Number(item.updatedAt) || now(),
      }))
    : [],
  userSessions: Array.isArray(store.userSessions)
    ? store.userSessions
        .map((item) => ({
          token: cleanText(item.token),
          profileId: cleanText(item.profileId),
          createdAt: Number(item.createdAt) || now(),
          expiresAt: Number(item.expiresAt) || 0,
        }))
        .filter((item) => item.token && item.profileId && item.expiresAt > now())
    : [],
})

const storeAccessor = createStoreAccessor({
  key: 'social_store',
  filePath: storePath,
  createDefaultStore,
  normalizeStore,
})

const readStore = () => storeAccessor.read()
const writeStore = (store) => storeAccessor.write(normalizeStore(store))
const getProfileById = (store, profileId) => store.profiles.find((item) => item.id === profileId)
const getProfileByPhone = (store, phone) => store.profiles.find((item) => item.phone && item.phone === phone)
const getProfileByOpenId = (store, openId) => store.profiles.find((item) => item.wechatOpenId && item.wechatOpenId === openId)

const readAdminStoreForSocialStats = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(adminStorePath, 'utf8'))
    return {
      liveSessions: Array.isArray(parsed?.liveSessions) ? parsed.liveSessions : [],
    }
  } catch {
    return { liveSessions: [] }
  }
}

const toTimestamp = (value) => {
  const numeric = Number(value)
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric
  }
  const parsed = Date.parse(cleanText(value))
  return Number.isFinite(parsed) ? parsed : 0
}

const isEndedSessionState = (value = '') => {
  const text = cleanText(value).toLowerCase()
  return Boolean(text && (/结束/.test(text) || /ended|finished|closed|completed/.test(text)))
}

const isEndedLiveSession = (session = {}) =>
  Boolean(cleanText(session.endedAt)) || isEndedSessionState(session.state) || isEndedSessionState(session.status)

const isActiveSessionMember = (session = {}, member = {}) => {
  const profileId = cleanText(member.profileId)
  if (!profileId) {
    return false
  }
  const kickedProfileIds = new Set((Array.isArray(session.kickedProfileIds) ? session.kickedProfileIds : []).map(cleanText).filter(Boolean))
  if (kickedProfileIds.has(profileId)) {
    return false
  }
  const status = cleanText(member.status).toLowerCase()
  return !/踢|移出|移除|退出|kicked|removed|left/.test(status)
}

const getSessionParticipantIds = (session = {}) => {
  const ids = new Set()
  const members = Array.isArray(session.members) ? session.members : []
  members.forEach((member) => {
    if (isActiveSessionMember(session, member)) {
      ids.add(cleanText(member.profileId))
    }
  })
  const hostProfileId = cleanText(session.hostProfileId)
  if (hostProfileId && !ids.has(hostProfileId)) {
    const kickedProfileIds = new Set((Array.isArray(session.kickedProfileIds) ? session.kickedProfileIds : []).map(cleanText).filter(Boolean))
    if (!kickedProfileIds.has(hostProfileId)) {
      ids.add(hostProfileId)
    }
  }
  return ids
}

const buildCoPlayStatsForOwner = (ownerId) => {
  const normalizedOwnerId = cleanText(ownerId)
  const stats = new Map()
  if (!normalizedOwnerId) {
    return stats
  }

  readAdminStoreForSocialStats().liveSessions.forEach((session) => {
    if (!isEndedLiveSession(session)) {
      return
    }
    const participantIds = getSessionParticipantIds(session)
    if (!participantIds.has(normalizedOwnerId)) {
      return
    }

    const sessionAt = toTimestamp(session.endedAt) || toTimestamp(session.updatedAt) || toTimestamp(session.createdAt) || now()
    participantIds.forEach((profileId) => {
      if (!profileId || profileId === normalizedOwnerId) {
        return
      }
      const existed = stats.get(profileId) || { count: 0, latestAt: 0 }
      stats.set(profileId, {
        count: existed.count + 1,
        latestAt: Math.max(existed.latestAt, sessionAt),
      })
    })
  })

  return stats
}

const getLatestPairPokeAt = (store, leftId, rightId) => {
  const pairId = [cleanText(leftId), cleanText(rightId)].sort().join('__')
  if (!leftId || !rightId) {
    return 0
  }
  return Math.max(
    0,
    ...store.pokes
      .filter((item) => item.id === pairId || (new Set([item.senderId, item.receiverId]).has(cleanText(leftId)) && new Set([item.senderId, item.receiverId]).has(cleanText(rightId))))
      .map((item) => Number(item.updatedAt || item.createdAt) || 0),
  )
}

const canSendPokeForPair = ({ coPlayCount, latestCoPlayedAt, latestPokeAt }) =>
  coPlayCount <= 0 || latestPokeAt <= 0 || latestCoPlayedAt > latestPokeAt

const getFriendPairState = (store, friendship, pairStats) => {
  const stats = pairStats?.get(friendship.friendId) || { count: 0, latestAt: 0 }
  const coPlayCount = Math.max(0, Number(stats.count) || 0)
  const latestCoPlayedAt = Number(stats.latestAt) || 0
  const latestPokeAt = getLatestPairPokeAt(store, friendship.ownerId, friendship.friendId)
  const canPokeAgain = canSendPokeForPair({ coPlayCount, latestCoPlayedAt, latestPokeAt })
  return {
    canPokeAgain,
    coPlayCount,
    latestCoPlayedAt: latestCoPlayedAt ? new Date(latestCoPlayedAt).toISOString() : '',
    latestPokeAt,
    pokeLockedReason: canPokeAgain ? '' : '完成新一场共同聚会后再合拍',
  }
}

const upsertProfile = (store, profile) => {
  const existed = getProfileById(store, profile.id)
  const normalized = normalizeProfile(profile, existed || {})
  if (!hasProfileIdentity(normalized)) {
    throw new Error('empty profile is not allowed')
  }
  if (existed) {
    store.profiles = store.profiles.map((item) => (item.id === normalized.id ? { ...item, ...normalized, createdAt: item.createdAt } : item))
  } else {
    store.profiles.unshift(normalized)
  }
  return normalized
}

const ensureProfile = (inputProfile = {}) => {
  const store = readStore()
  const profile = upsertProfile(store, inputProfile)
  writeStore(store)
  return profile
}

const bindWechatUser = ({ phone, wechatOpenId, wechatUnionId = '', profile = {} }) => {
  const store = readStore()
  const normalizedPhone = cleanText(phone)
  const normalizedOpenId = cleanText(wechatOpenId)
  if (!normalizedOpenId) {
    throw new Error('missing wechat openid')
  }

  const targetProfile = (normalizedPhone && getProfileByPhone(store, normalizedPhone)) || getProfileByOpenId(store, normalizedOpenId)
  const loginAt = isoNow()
  const nextProfile = upsertProfile(store, {
    ...(targetProfile || {}),
    id: targetProfile?.id || randomId('user'),
    name: cleanText(profile.name || targetProfile?.name),
    avatarUrl: cleanAvatar(profile.avatarUrl || targetProfile?.avatarUrl),
    signature: cleanText(profile.signature || targetProfile?.signature),
    identityTag: cleanText(profile.identityTag || targetProfile?.identityTag),
    phone: normalizedPhone || targetProfile?.phone || '',
    wechatOpenId: normalizedOpenId,
    wechatUnionId: cleanText(wechatUnionId || targetProfile?.wechatUnionId),
    phoneBoundAt: normalizedPhone ? targetProfile?.phoneBoundAt || loginAt : targetProfile?.phoneBoundAt || '',
    lastLoginAt: loginAt,
    loginCount: Math.max(0, Number(targetProfile?.loginCount) || 0) + 1,
  })

  const token = randomToken()
  store.userSessions = store.userSessions.filter((item) => item.profileId !== nextProfile.id && item.expiresAt > now())
  store.userSessions.unshift({ token, profileId: nextProfile.id, createdAt: now(), expiresAt: now() + USER_SESSION_TTL })
  store.loginLogs.unshift({
    id: randomId('login-log'),
    profileId: nextProfile.id,
    phone: nextProfile.phone,
    wechatOpenId: nextProfile.wechatOpenId,
    loginAt,
    source: 'wechat-miniapp',
  })
  writeStore(store)
  return { token, profile: { ...nextProfile, phoneMasked: maskPhone(nextProfile.phone) } }
}

const bindPhoneToMiniUser = ({ profileId, phone }) => {
  const store = readStore()
  const target = getProfileById(store, cleanText(profileId))
  if (!target) {
    throw new Error('profile not found')
  }
  const nextProfile = upsertProfile(store, { ...target, phone: cleanText(phone), phoneBoundAt: target.phoneBoundAt || isoNow() })
  writeStore(store)
  return { ...nextProfile, phoneMasked: maskPhone(nextProfile.phone) }
}

const getMiniUserSession = (token) => {
  const store = readStore()
  const session = store.userSessions.find((item) => item.token === token && item.expiresAt > now())
  if (!session) {
    return null
  }
  const profile = getProfileById(store, session.profileId)
  return profile ? { token: session.token, profile: { ...profile, phoneMasked: maskPhone(profile.phone) } } : null
}

const serializeFriend = (store, friendship, pairStats) => {
  const profile = getProfileById(store, friendship.friendId)
  if (!profile || !isRegisteredProfile(profile)) {
    return null
  }
  const pairState = getFriendPairState(store, friendship, pairStats)
  return {
    id: friendship.id,
    profileId: friendship.friendId,
    ownerId: friendship.ownerId,
    avatarUrl: cleanAvatar(profile?.avatarUrl),
    canPokeAgain: pairState.canPokeAgain,
    coPlayCount: pairState.coPlayCount,
    latestCoPlayedAt: pairState.latestCoPlayedAt,
    name: friendship.alias || profile?.name || '',
    meta: friendship.meta || '',
    pokeLockedReason: pairState.pokeLockedReason,
    updatedAt: friendship.updatedAt,
  }
}

const listFriends = (profileId) => {
  const store = readStore()
  const pairStats = buildCoPlayStatsForOwner(profileId)
  return store.friendships
    .filter((item) => item.ownerId === profileId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((item) => serializeFriend(store, item, pairStats))
    .filter(Boolean)
}

const addFriend = ({ ownerId, friendName, friendProfileId, meta = '' }) => {
  const store = readStore()
  const normalizedOwnerId = cleanText(ownerId)
  if (!normalizedOwnerId) {
    throw new Error('missing ownerId')
  }
  const targetProfile = friendProfileId ? getProfileById(store, cleanText(friendProfileId)) : null
  if (!targetProfile || !isRegisteredProfile(targetProfile)) {
    throw new Error('friend not found')
  }
  if (targetProfile.id === normalizedOwnerId) {
    throw new Error('cannot add self')
  }

  const existed = store.friendships.find((item) => item.ownerId === normalizedOwnerId && item.friendId === targetProfile.id)
  const updatedAt = now()
  if (existed) {
    const nextFriendship = { ...existed, alias: cleanText(friendName) || existed.alias, meta: cleanText(meta) || existed.meta, updatedAt }
    store.friendships = store.friendships.map((item) => (item.id === existed.id ? nextFriendship : item))
    writeStore(store)
    return serializeFriend(store, nextFriendship, buildCoPlayStatsForOwner(normalizedOwnerId))
  }

  const friendship = {
    id: randomId('friendship'),
    ownerId: normalizedOwnerId,
    friendId: targetProfile.id,
    alias: cleanText(friendName),
    meta: cleanText(meta),
    updatedAt,
  }
  store.friendships.unshift(friendship)
  writeStore(store)
  return serializeFriend(store, friendship, buildCoPlayStatsForOwner(normalizedOwnerId))
}

const updateFriend = ({ ownerId, friendshipId, patch = {} }) => {
  const store = readStore()
  const target = store.friendships.find((item) => item.id === friendshipId && item.ownerId === ownerId)
  if (!target) {
    throw new Error('friend not found')
  }
  const next = { ...target, alias: cleanText(patch.name || target.alias), meta: cleanText(patch.meta || target.meta), updatedAt: now() }
  store.friendships = store.friendships.map((item) => (item.id === friendshipId ? next : item))
  writeStore(store)
  return serializeFriend(store, next, buildCoPlayStatsForOwner(ownerId))
}

const removeFriend = ({ ownerId, friendshipId }) => {
  const store = readStore()
  store.friendships = store.friendships.filter((item) => !(item.id === friendshipId && item.ownerId === ownerId))
  writeStore(store)
  return listFriends(ownerId)
}

const touchFriends = ({ ownerId, participants = [] }) => {
  participants.forEach((item) => {
    if (item?.profileId && item.profileId === ownerId) {
      return
    }
    try {
      addFriend({ ownerId, friendName: item?.name || '', friendProfileId: item?.profileId || '', meta: item?.meta || '' })
    } catch {
      void 0
    }
  })
  return listFriends(ownerId)
}

const syncSessionContacts = ({ ownerId, participants = [] }) => touchFriends({ ownerId, participants })

const listProfiles = () => readStore().profiles.map((item) => ({ ...item, avatarUrl: cleanAvatar(item.avatarUrl) }))
const listFriendships = () => {
  const store = readStore()
  const statsByOwner = new Map()
  return store.friendships
    .map((item) => {
      if (!statsByOwner.has(item.ownerId)) {
        statsByOwner.set(item.ownerId, buildCoPlayStatsForOwner(item.ownerId))
      }
      return serializeFriend(store, item, statsByOwner.get(item.ownerId))
    })
    .filter(Boolean)
}

const searchProfiles = ({ ownerId, keyword = '' }) => {
  const store = readStore()
  const trimmed = cleanText(keyword).toLowerCase()
  if (!trimmed) {
    return []
  }
  const friendIds = new Set(store.friendships.filter((item) => item.ownerId === ownerId).map((item) => item.friendId))
  return store.profiles
    .filter((item) => item.id !== ownerId)
    .filter((item) => isRegisteredProfile(item))
    .filter((item) => [item.name, item.identityTag].join(' ').toLowerCase().includes(trimmed))
    .slice(0, 8)
    .map((item) => ({ id: item.id, name: item.name, avatarUrl: cleanAvatar(item.avatarUrl), identityTag: item.identityTag, alreadyFriend: friendIds.has(item.id) }))
}

const serializeThread = (store, viewerId, thread) => {
  const sender = getProfileById(store, thread.senderId) || {}
  const receiver = getProfileById(store, thread.receiverId) || {}
  const isIncoming = thread.receiverId === viewerId
  const counterpart = isIncoming ? sender : receiver
  return {
    id: thread.id,
    senderId: thread.senderId,
    senderName: sender.name || '',
    senderAvatarUrl: cleanAvatar(sender.avatarUrl),
    receiverId: thread.receiverId,
    receiverName: receiver.name || '',
    receiverAvatarUrl: cleanAvatar(receiver.avatarUrl),
    counterpartId: counterpart.id || '',
    counterpartName: counterpart.name || '',
    counterpartAvatarUrl: cleanAvatar(counterpart.avatarUrl),
    status: thread.status,
    actionState: thread.status === 'matched' ? 'matched' : isIncoming ? 'incoming' : 'outgoing',
    updatedAt: thread.updatedAt,
  }
}

const listPokes = (profileId) => {
  const store = readStore()
  return store.pokes
    .filter((item) => item.senderId === profileId || item.receiverId === profileId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((item) => serializeThread(store, profileId, item))
}

const listAllPokes = () => {
  const store = readStore()
  return store.pokes.map((item) => serializeThread(store, item.senderId, item))
}

const sendPoke = ({ ownerId, friendshipId }) => {
  const store = readStore()
  const friendship = store.friendships.find((item) => item.id === friendshipId && item.ownerId === ownerId)
  if (!friendship) {
    throw new Error('friend not found')
  }
  const senderId = ownerId
  const receiverId = friendship.friendId
  const pairState = getFriendPairState(store, friendship, buildCoPlayStatsForOwner(senderId))
  if (!pairState.canPokeAgain) {
    throw createHttpError(pairState.pokeLockedReason || '完成新一场共同聚会后再合拍', 409)
  }
  const id = [senderId, receiverId].sort().join('__')
  const existed = store.pokes.find((item) => item.id === id)
  const thread = existed
    ? { ...existed, status: existed.receiverId === senderId ? 'matched' : existed.status, updatedAt: now() }
    : { id, senderId, receiverId, status: 'pending', createdAt: now(), updatedAt: now() }
  store.pokes = [thread, ...store.pokes.filter((item) => item.id !== id)]
  writeStore(store)
  return serializeThread(store, ownerId, thread)
}

const replyPoke = ({ profileId, threadId }) => {
  const store = readStore()
  const target = store.pokes.find((item) => item.id === threadId)
  if (!target) {
    throw new Error('thread not found')
  }
  const next = { ...target, status: 'matched', updatedAt: now() }
  store.pokes = store.pokes.map((item) => (item.id === threadId ? next : item))
  writeStore(store)
  return serializeThread(store, profileId, next)
}

const ignorePoke = ({ profileId, threadId }) => {
  const store = readStore()
  store.pokes = store.pokes.filter((item) => item.id !== threadId)
  writeStore(store)
  return listPokes(profileId)
}

const getBootstrap = (profileId) => {
  const store = readStore()
  const currentProfile = getProfileById(store, profileId)
  if (!currentProfile) {
    throw new Error('profile not found')
  }
  return {
    currentProfile: { ...currentProfile, avatarUrl: cleanAvatar(currentProfile.avatarUrl) },
    wineFriends: listFriends(profileId),
    pokeThreads: listPokes(profileId),
  }
}

module.exports = {
  addFriend,
  bindPhoneToMiniUser,
  bindWechatUser,
  ensureProfile,
  flushSocialStore: storeAccessor.flush,
  getBootstrap,
  getMiniUserSession,
  getProfileById,
  initSocialStore: storeAccessor.init,
  ignorePoke,
  listAllPokes,
  listFriendships,
  listPokes,
  listProfiles,
  readSocialStore: readStore,
  removeFriend,
  syncSessionContacts,
  replyPoke,
  searchProfiles,
  sendPoke,
  touchFriends,
  updateFriend,
  writeSocialStore: writeStore,
}
