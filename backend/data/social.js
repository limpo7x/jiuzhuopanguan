const crypto = require('crypto')
const path = require('path')
const { createStoreAccessor } = require('./store-accessor')

const storePath = path.join(__dirname, 'social-store.json')
const USER_SESSION_TTL = 1000 * 60 * 60 * 24 * 30

const now = () => Date.now()
const isoNow = () => new Date().toISOString()
const randomToken = () => crypto.randomBytes(24).toString('hex')
const randomId = (prefix) => `${prefix}-${now()}-${Math.random().toString(16).slice(2, 8)}`
const maskPhone = (phone = '') => (phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone)
const cleanText = (value = '') => String(value || '').trim()
const cleanAvatar = (value = '') => {
  const text = cleanText(value)
  if (!text) return ''
  if (/^\/static\/avatar-(?:host|\d+)\.png$/i.test(text) || text.startsWith('/assets/avatars/')) return ''
  if (/^(wxfile|file):\/\//i.test(text)) return ''
  if (/^https?:\/\/127\.0\.0\.1(?::\d+)?\/__store__\//i.test(text)) return ''
  if (/\/tmp\//i.test(text) || /\/__tmp__\//i.test(text) || /\/__store__\//i.test(text)) return ''
  return text
}

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
  profiles: Array.isArray(store.profiles) ? store.profiles.map((item) => normalizeProfile(item)) : [],
  friendships: Array.isArray(store.friendships)
    ? store.friendships.map((item, index) => ({
        id: cleanText(item.id || `friendship-${index + 1}`),
        ownerId: cleanText(item.ownerId),
        friendId: cleanText(item.friendId),
        alias: cleanText(item.alias),
        meta: cleanText(item.meta || '最近联系'),
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
        source: cleanText(item.source || 'wechat-miniapp'),
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

const upsertProfile = (store, profile) => {
  const existed = getProfileById(store, profile.id)
  const normalized = normalizeProfile(profile, existed || {})
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

const serializeFriend = (store, friendship) => {
  const profile = getProfileById(store, friendship.friendId)
  return {
    id: friendship.id,
    profileId: friendship.friendId,
    ownerId: friendship.ownerId,
    avatarUrl: cleanAvatar(profile?.avatarUrl),
    name: friendship.alias || profile?.name || '未命名用户',
    meta: friendship.meta || '最近联系',
    updatedAt: friendship.updatedAt,
  }
}

const listFriends = (profileId) => {
  const store = readStore()
  return store.friendships
    .filter((item) => item.ownerId === profileId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((item) => serializeFriend(store, item))
}

const getOrCreatePlaceholderProfile = (store, name) => {
  const trimmed = cleanText(name)
  const existed = store.profiles.find((item) => item.name.toLowerCase() === trimmed.toLowerCase())
  if (existed) {
    return existed
  }
  return upsertProfile(store, { id: randomId('user'), name: trimmed, avatarUrl: '', identityTag: '好友' })
}

const addFriend = ({ ownerId, friendName, friendProfileId, meta = '最近添加' }) => {
  const store = readStore()
  const normalizedOwnerId = cleanText(ownerId)
  if (!normalizedOwnerId) {
    throw new Error('missing ownerId')
  }
  let targetProfile = friendProfileId ? getProfileById(store, cleanText(friendProfileId)) : null
  if (!targetProfile && friendName) {
    targetProfile = getOrCreatePlaceholderProfile(store, friendName)
  }
  if (!targetProfile) {
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
    return serializeFriend(store, nextFriendship)
  }

  const friendship = {
    id: randomId('friendship'),
    ownerId: normalizedOwnerId,
    friendId: targetProfile.id,
    alias: cleanText(friendName),
    meta: cleanText(meta) || '最近添加',
    updatedAt,
  }
  store.friendships.unshift(friendship)
  writeStore(store)
  return serializeFriend(store, friendship)
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
  return serializeFriend(store, next)
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
      addFriend({ ownerId, friendName: item?.name || '', friendProfileId: item?.profileId || '', meta: item?.meta || '酒局联系人' })
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
  return store.friendships.map((item) => serializeFriend(store, item))
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
