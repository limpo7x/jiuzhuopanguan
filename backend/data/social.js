const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { createStoreAccessor } = require('./store-accessor')

const storePath = path.join(__dirname, 'social-store.json')
const avatarPool = [
  '/static/avatar-1.png',
  '/static/avatar-2.png',
  '/static/avatar-3.png',
  '/static/avatar-4.png',
]
const USER_SESSION_TTL = 1000 * 60 * 60 * 24 * 30

const hashNameToAvatar = (name = '') => {
  const sum = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0)
  return avatarPool[sum % avatarPool.length]
}

const now = () => Date.now()
const normalizeAvatarUrl = (value = '', fallbackName = '') => {
  const raw = String(value || '').trim()
  if (!raw) {
    return hashNameToAvatar(fallbackName || '酒友')
  }
  if (raw.startsWith('/assets/avatars/')) {
    return `/static/${raw.split('/').pop()}`
  }
  return raw
}

const createDefaultStore = () => ({
  profiles: [
    { id: 'user-1001', name: '阿浩', avatarUrl: avatarPool[0], city: '上海', signature: '今晚这局不见不散。', identityTag: '气氛组长', phone: '', wechatOpenId: '', wechatUnionId: '', phoneBoundAt: '', lastLoginAt: '', loginCount: 0, createdAt: 1, updatedAt: 1 },
    { id: 'user-1002', name: '小熊', avatarUrl: avatarPool[1], city: '上海', signature: '喝归喝，整活不能少。', identityTag: '热场王者', phone: '', wechatOpenId: '', wechatUnionId: '', phoneBoundAt: '', lastLoginAt: '', loginCount: 0, createdAt: 2, updatedAt: 2 },
    { id: 'user-1003', name: 'Mika', avatarUrl: avatarPool[2], city: '杭州', signature: '负责点题，也负责拱火。', identityTag: '判官常驻', phone: '', wechatOpenId: '', wechatUnionId: '', phoneBoundAt: '', lastLoginAt: '', loginCount: 0, createdAt: 3, updatedAt: 3 },
    { id: 'user-1004', name: '可可', avatarUrl: avatarPool[3], city: '深圳', signature: '我只负责起哄。', identityTag: '酒局观察员', phone: '', wechatOpenId: '', wechatUnionId: '', phoneBoundAt: '', lastLoginAt: '', loginCount: 0, createdAt: 4, updatedAt: 4 },
  ],
  friendships: [],
  loginLogs: [],
  pokes: [],
  userSessions: [],
})

const isBrokenSample = (value) =>
  typeof value === 'string' && (!value.trim() || value.includes('?'))

const normalizeProfile = (profile = {}, fallback = {}) => {
  const timestamp = now()
  const name = isBrokenSample(profile.name)
    ? fallback.name || `酒友${String(profile.id || '').slice(-4) || '0000'}`
    : String(profile.name || fallback.name || `酒友${String(profile.id || '').slice(-4) || '0000'}`).trim()

  return {
    id: String(profile.id || fallback.id || `user-${timestamp}`),
    name,
    avatarUrl: normalizeAvatarUrl(profile.avatarUrl || fallback.avatarUrl, name),
    city: isBrokenSample(profile.city) ? fallback.city || '上海' : String(profile.city || fallback.city || '上海').trim(),
    signature: isBrokenSample(profile.signature) ? fallback.signature || '今晚这局不见不散。' : String(profile.signature || fallback.signature || '今晚这局不见不散。').trim(),
    identityTag: isBrokenSample(profile.identityTag) ? fallback.identityTag || '酒局常驻玩家' : String(profile.identityTag || fallback.identityTag || '酒局常驻玩家').trim(),
    phone: typeof profile.phone === 'string' ? profile.phone.trim() : typeof fallback.phone === 'string' ? fallback.phone.trim() : '',
    wechatOpenId:
      typeof profile.wechatOpenId === 'string'
        ? profile.wechatOpenId.trim()
        : typeof fallback.wechatOpenId === 'string'
          ? fallback.wechatOpenId.trim()
          : '',
    wechatUnionId:
      typeof profile.wechatUnionId === 'string'
        ? profile.wechatUnionId.trim()
        : typeof fallback.wechatUnionId === 'string'
          ? fallback.wechatUnionId.trim()
          : '',
    phoneBoundAt:
      typeof profile.phoneBoundAt === 'string'
        ? profile.phoneBoundAt
        : typeof fallback.phoneBoundAt === 'string'
          ? fallback.phoneBoundAt
          : '',
    lastLoginAt:
      typeof profile.lastLoginAt === 'string'
        ? profile.lastLoginAt
        : typeof fallback.lastLoginAt === 'string'
          ? fallback.lastLoginAt
          : '',
    loginCount: Math.max(0, Number(profile.loginCount ?? fallback.loginCount) || 0),
    createdAt: profile.createdAt || fallback.createdAt || timestamp,
    updatedAt: timestamp,
  }
}

const normalizeStore = (store = {}) => {
  const defaults = createDefaultStore()
  return {
    profiles: Array.isArray(store.profiles) && store.profiles.length
      ? store.profiles.map((item, index) => normalizeProfile(item, defaults.profiles[index] || {}))
      : defaults.profiles,
    friendships: Array.isArray(store.friendships)
      ? store.friendships.map((item, index) => ({
          id: String(item.id || `friendship-${index + 1}`),
          ownerId: String(item.ownerId || ''),
          friendId: String(item.friendId || ''),
          alias: typeof item.alias === 'string' ? item.alias.trim() : '',
          meta: isBrokenSample(item.meta) ? '最近联系' : String(item.meta || '最近联系').trim(),
          updatedAt: Number(item.updatedAt) || now(),
        }))
      : [],
    loginLogs: Array.isArray(store.loginLogs)
      ? store.loginLogs
          .map((item, index) => ({
            id: String(item?.id || `login-log-${index + 1}`),
            profileId: String(item?.profileId || ''),
            phone: typeof item?.phone === 'string' ? item.phone.trim() : '',
            wechatOpenId: typeof item?.wechatOpenId === 'string' ? item.wechatOpenId.trim() : '',
            loginAt: typeof item?.loginAt === 'string' ? item.loginAt : '',
            source: typeof item?.source === 'string' ? item.source : 'wechat-miniapp',
          }))
          .filter((item) => item.profileId)
      : [],
    pokes: Array.isArray(store.pokes)
      ? store.pokes.map((item) => ({
          id: String(item.id || ''),
          senderId: String(item.senderId || ''),
          receiverId: String(item.receiverId || ''),
          status: item.status === 'matched' ? 'matched' : 'pending',
          createdAt: Number(item.createdAt) || now(),
          updatedAt: Number(item.updatedAt) || now(),
        }))
      : [],
    userSessions: Array.isArray(store.userSessions)
      ? store.userSessions
          .map((item) => ({
            token: String(item?.token || ''),
            profileId: String(item?.profileId || ''),
            createdAt: Number(item?.createdAt) || now(),
            expiresAt: Number(item?.expiresAt) || 0,
          }))
          .filter((item) => item.token && item.profileId && item.expiresAt > now())
      : [],
  }
}

const storeAccessor = createStoreAccessor({
  key: 'social_store',
  filePath: storePath,
  createDefaultStore,
  normalizeStore,
})

const readStore = () => storeAccessor.read()

const writeStore = (store) => storeAccessor.write(store)

const getProfileById = (store, profileId) => store.profiles.find((item) => item.id === profileId)
const getProfileByPhone = (store, phone) => store.profiles.find((item) => item.phone && item.phone === phone)
const getProfileByOpenId = (store, openId) => store.profiles.find((item) => item.wechatOpenId && item.wechatOpenId === openId)
const isoNow = () => new Date().toISOString()
const randomToken = () => crypto.randomBytes(24).toString('hex')
const maskPhone = (phone = '') => (phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone)

const remapProfileReferences = (store, sourceId, targetId) => {
  if (!sourceId || !targetId || sourceId === targetId) {
    return
  }
  store.friendships = store.friendships.map((item) => ({
    ...item,
    ownerId: item.ownerId === sourceId ? targetId : item.ownerId,
    friendId: item.friendId === sourceId ? targetId : item.friendId,
  }))
  store.pokes = store.pokes.map((item) => ({
    ...item,
    senderId: item.senderId === sourceId ? targetId : item.senderId,
    receiverId: item.receiverId === sourceId ? targetId : item.receiverId,
  }))
  store.userSessions = store.userSessions.map((item) => ({
    ...item,
    profileId: item.profileId === sourceId ? targetId : item.profileId,
  }))
}

const bindWechatUser = ({
  phone,
  wechatOpenId,
  wechatUnionId = '',
  profile = {},
}) => {
  const store = readStore()
  const normalizedPhone = String(phone || '').trim()
  const normalizedOpenId = String(wechatOpenId || '').trim()
  const phoneProfile = normalizedPhone ? getProfileByPhone(store, normalizedPhone) : null
  const openIdProfile = normalizedOpenId ? getProfileByOpenId(store, normalizedOpenId) : null
  let targetProfile = phoneProfile || openIdProfile

  if (phoneProfile && openIdProfile && phoneProfile.id !== openIdProfile.id) {
    remapProfileReferences(store, openIdProfile.id, phoneProfile.id)
    store.profiles = store.profiles.filter((item) => item.id !== openIdProfile.id)
    targetProfile = phoneProfile
  }

  const timestamp = now()
  const loginAt = isoNow()
  const nextProfile = normalizeProfile(
    {
      ...(targetProfile || {}),
      id: targetProfile?.id || `user-${timestamp}`,
      name: profile.name || targetProfile?.name || `微信用户${String(normalizedPhone || timestamp).slice(-4)}`,
      avatarUrl: profile.avatarUrl || targetProfile?.avatarUrl || hashNameToAvatar(profile.name || normalizedPhone || '微信用户'),
      city: profile.city || targetProfile?.city || '上海',
      signature: profile.signature || targetProfile?.signature || '已使用微信登录',
      identityTag: profile.identityTag || targetProfile?.identityTag || '微信已绑定用户',
      phone: normalizedPhone,
      wechatOpenId: normalizedOpenId,
      wechatUnionId: wechatUnionId || targetProfile?.wechatUnionId || '',
      phoneBoundAt: targetProfile?.phoneBoundAt || loginAt,
      lastLoginAt: loginAt,
      loginCount: Math.max(0, Number(targetProfile?.loginCount) || 0) + 1,
      createdAt: targetProfile?.createdAt || timestamp,
      updatedAt: timestamp,
    },
    targetProfile || {},
  )

  if (targetProfile) {
    store.profiles = store.profiles.map((item) => (item.id === nextProfile.id ? { ...item, ...nextProfile, createdAt: item.createdAt } : item))
  } else {
    store.profiles.unshift(nextProfile)
  }

  const token = randomToken()
  store.userSessions = store.userSessions.filter((item) => item.profileId !== nextProfile.id && item.expiresAt > timestamp)
  store.userSessions.unshift({
    token,
    profileId: nextProfile.id,
    createdAt: timestamp,
    expiresAt: timestamp + USER_SESSION_TTL,
  })
  store.loginLogs = Array.isArray(store.loginLogs) ? store.loginLogs : []
  store.loginLogs.unshift({
    id: `login-log-${timestamp}`,
    profileId: nextProfile.id,
    phone: nextProfile.phone,
    wechatOpenId: nextProfile.wechatOpenId,
    loginAt: loginAt,
    source: 'wechat-miniapp',
  })
  writeStore(store)
  return {
    token,
    profile: {
      ...nextProfile,
      phoneMasked: maskPhone(nextProfile.phone),
    },
  }
}

const getMiniUserSession = (token) => {
  if (!token) {
    return null
  }
  const store = readStore()
  const session = store.userSessions.find((item) => item.token === token && item.expiresAt > now())
  if (!session) {
    return null
  }
  const profile = getProfileById(store, session.profileId)
  if (!profile) {
    return null
  }
  return {
    token: session.token,
    profile: {
      ...profile,
      phoneMasked: maskPhone(profile.phone),
    },
  }
}

const ensureProfile = (inputProfile) => {
  const store = readStore()
  const existed = store.profiles.find((item) => item.id === String(inputProfile?.id || ''))
  const normalized = normalizeProfile(inputProfile, existed)

  if (existed) {
    store.profiles = store.profiles.map((item) => (item.id === normalized.id ? { ...item, ...normalized, createdAt: item.createdAt } : item))
  } else {
    store.profiles.unshift(normalized)
  }

  writeStore(store)
  return normalized
}

const getOrCreatePlaceholderProfile = (store, name) => {
  const trimmed = String(name || '').trim()
  const existed = store.profiles.find((item) => item.name.toLowerCase() === trimmed.toLowerCase())
  if (existed) {
    return existed
  }

  const profile = normalizeProfile(
    {
      id: `user-${now()}`,
      name: trimmed,
      signature: '刚加入酒局圈子。',
      identityTag: '最近酒友',
    },
    {},
  )
  store.profiles.unshift(profile)
  return profile
}

const serializeFriend = (store, friendship) => {
  const profile = getProfileById(store, friendship.friendId)
  return {
    id: friendship.id,
    profileId: friendship.friendId,
    ownerId: friendship.ownerId,
    avatarUrl: profile?.avatarUrl || hashNameToAvatar(friendship.alias || profile?.name || '酒友'),
    name: friendship.alias || profile?.name || '酒友',
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

const listProfiles = () => {
  return readStore().profiles
}

const listFriendships = () => {
  const store = readStore()
  return store.friendships
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((item) => serializeFriend(store, item))
}

const searchProfiles = ({ ownerId, keyword = '' }) => {
  const store = readStore()
  const trimmed = String(keyword || '').trim().toLowerCase()
  if (!trimmed) {
    return []
  }

  const friendIds = new Set(store.friendships.filter((item) => item.ownerId === ownerId).map((item) => item.friendId))
  return store.profiles
    .filter((item) => item.id !== ownerId)
    .filter((item) => [item.name, item.city, item.identityTag].join(' ').toLowerCase().includes(trimmed))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      name: item.name,
      avatarUrl: item.avatarUrl,
      city: item.city,
      identityTag: item.identityTag,
      alreadyFriend: friendIds.has(item.id),
    }))
}

const addFriend = ({ ownerId, friendName, friendProfileId, meta = '最近添加' }) => {
  const store = readStore()
  if (!ownerId) {
    throw new Error('missing ownerId')
  }

  let targetProfile = friendProfileId ? getProfileById(store, friendProfileId) : null
  if (!targetProfile && friendName) {
    targetProfile = getOrCreatePlaceholderProfile(store, friendName)
  }
  if (!targetProfile) {
    throw new Error('friend not found')
  }
  if (targetProfile.id === ownerId) {
    throw new Error('cannot add self')
  }

  const existed = store.friendships.find((item) => item.ownerId === ownerId && item.friendId === targetProfile.id)
  const updatedAt = now()

  if (existed) {
    const nextFriendship = {
      ...existed,
      alias: friendName && friendName.trim() ? friendName.trim() : existed.alias,
      meta: meta || existed.meta,
      updatedAt,
    }
    store.friendships = store.friendships.map((item) => (item.id === existed.id ? nextFriendship : item))
    writeStore(store)
    return serializeFriend(store, nextFriendship)
  }

  const friendship = {
    id: `friendship-${updatedAt}`,
    ownerId,
    friendId: targetProfile.id,
    alias: friendName && friendName.trim() ? friendName.trim() : '',
    meta,
    updatedAt,
  }
  store.friendships.unshift(friendship)
  writeStore(store)
  return serializeFriend(store, friendship)
}

const updateFriend = ({ ownerId, friendshipId, name, meta }) => {
  const store = readStore()
  const target = store.friendships.find((item) => item.id === friendshipId && item.ownerId === ownerId)
  if (!target) {
    throw new Error('friendship not found')
  }

  const nextFriendship = {
    ...target,
    alias: typeof name === 'string' ? name.trim() : target.alias,
    meta: typeof meta === 'string' ? meta.trim() : target.meta,
    updatedAt: now(),
  }
  store.friendships = store.friendships.map((item) => (item.id === friendshipId ? nextFriendship : item))
  writeStore(store)
  return serializeFriend(store, nextFriendship)
}

const removeFriend = ({ ownerId, friendshipId }) => {
  const store = readStore()
  store.friendships = store.friendships.filter((item) => !(item.id === friendshipId && item.ownerId === ownerId))
  writeStore(store)
  return listFriends(ownerId)
}

const touchFriends = ({ ownerId, participants = [] }) => {
  participants.forEach((item, index) => {
    addFriend({
      ownerId,
      friendName: item.name,
      meta: index < 2 ? '刚一起开过局' : '最近联系',
    })
  })
  return listFriends(ownerId)
}

const getThreadId = (senderId, receiverId) => [senderId, receiverId].sort().join('__')

const serializeThread = (store, profileId, thread) => {
  const isIncoming = thread.receiverId === profileId
  const counterpart = getProfileById(store, isIncoming ? thread.senderId : thread.receiverId)

  return {
    id: thread.id,
    senderId: thread.senderId,
    senderName: getProfileById(store, thread.senderId)?.name || '酒友',
    senderAvatarUrl: getProfileById(store, thread.senderId)?.avatarUrl || hashNameToAvatar('酒友'),
    receiverId: thread.receiverId,
    receiverName: getProfileById(store, thread.receiverId)?.name || '酒友',
    receiverAvatarUrl: getProfileById(store, thread.receiverId)?.avatarUrl || hashNameToAvatar('酒友'),
    status: thread.status,
    updatedAt: thread.updatedAt,
    counterpartId: counterpart?.id || '',
    counterpartName: counterpart?.name || '酒友',
    counterpartAvatarUrl: counterpart?.avatarUrl || hashNameToAvatar('酒友'),
    actionState: thread.status === 'matched' ? 'matched' : isIncoming ? 'incoming' : 'outgoing',
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
  return store.pokes
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((item) => serializeThread(store, item.receiverId, item))
}

const sendPoke = ({ ownerId, friendshipId }) => {
  const store = readStore()
  const friendship = store.friendships.find((item) => item.id === friendshipId && item.ownerId === ownerId)
  if (!friendship) {
    throw new Error('friendship not found')
  }

  const receiverId = friendship.friendId
  if (receiverId === ownerId) {
    throw new Error('cannot poke self')
  }

  const id = getThreadId(ownerId, receiverId)
  const existed = store.pokes.find((item) => item.id === id)
  const updatedAt = now()

  if (existed) {
    const nextThread =
      existed.status === 'pending' && existed.receiverId === ownerId
        ? { ...existed, status: 'matched', updatedAt }
        : { ...existed, senderId: ownerId, receiverId, updatedAt }
    store.pokes = store.pokes.map((item) => (item.id === id ? nextThread : item))
    writeStore(store)
    return serializeThread(store, ownerId, nextThread)
  }

  const thread = {
    id,
    senderId: ownerId,
    receiverId,
    status: 'pending',
    createdAt: updatedAt,
    updatedAt,
  }
  store.pokes.unshift(thread)
  writeStore(store)
  return serializeThread(store, ownerId, thread)
}

const replyPoke = ({ profileId, threadId }) => {
  const store = readStore()
  const target = store.pokes.find((item) => item.id === threadId)
  if (!target) {
    throw new Error('thread not found')
  }
  if (target.receiverId !== profileId && target.senderId !== profileId) {
    throw new Error('forbidden')
  }

  const nextThread = {
    ...target,
    status: 'matched',
    updatedAt: now(),
  }
  store.pokes = store.pokes.map((item) => (item.id === threadId ? nextThread : item))
  writeStore(store)
  return serializeThread(store, profileId, nextThread)
}

const ignorePoke = ({ profileId, threadId }) => {
  const store = readStore()
  const target = store.pokes.find((item) => item.id === threadId)
  if (!target) {
    return listPokes(profileId)
  }
  if (target.receiverId !== profileId && target.senderId !== profileId) {
    throw new Error('forbidden')
  }

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
    currentProfile,
    wineFriends: listFriends(profileId),
    pokeThreads: listPokes(profileId),
  }
}

module.exports = {
  addFriend,
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
  replyPoke,
  searchProfiles,
  sendPoke,
  touchFriends,
  updateFriend,
  writeSocialStore: writeStore,
}
