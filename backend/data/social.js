const fs = require('fs')
const path = require('path')

const storePath = path.join(__dirname, 'social-store.json')
const avatarPool = [
  '/assets/avatars/avatar-1.png',
  '/assets/avatars/avatar-2.png',
  '/assets/avatars/avatar-3.png',
  '/assets/avatars/avatar-4.png',
]

const hashNameToAvatar = (name = '') => {
  const sum = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0)
  return avatarPool[sum % avatarPool.length]
}

const now = () => Date.now()

const createDefaultStore = () => ({
  profiles: [
    {
      id: 'user-1001',
      name: '阿浩',
      avatarUrl: '/assets/avatars/avatar-1.png',
      city: '上海',
      signature: '今晚这局不见不散。',
      identityTag: '气氛组',
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: 'user-1002',
      name: '小熊',
      avatarUrl: '/assets/avatars/avatar-2.png',
      city: '上海',
      signature: '喝归喝，整活不能少。',
      identityTag: '热场王',
      createdAt: 2,
      updatedAt: 2,
    },
    {
      id: 'user-1003',
      name: 'Mika',
      avatarUrl: '/assets/avatars/avatar-3.png',
      city: '杭州',
      signature: '负责点题，也负责拱火。',
      identityTag: '判官常驻',
      createdAt: 3,
      updatedAt: 3,
    },
    {
      id: 'user-1004',
      name: '可可',
      avatarUrl: '/assets/avatars/avatar-4.png',
      city: '深圳',
      signature: '我只负责起哄。',
      identityTag: '酒局观察员',
      createdAt: 4,
      updatedAt: 4,
    },
  ],
  friendships: [],
  pokes: [],
})

const ensureStoreFile = () => {
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(createDefaultStore(), null, 2), 'utf8')
  }
}

const readStore = () => {
  ensureStoreFile()
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf8'))
  } catch {
    const next = createDefaultStore()
    fs.writeFileSync(storePath, JSON.stringify(next, null, 2), 'utf8')
    return next
  }
}

const writeStore = (store) => {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8')
  return store
}

const normalizeProfile = (profile = {}) => {
  const timestamp = now()
  const name = String(profile.name || '').trim() || `酒友${String(profile.id || '').slice(-4) || '0000'}`

  return {
    id: String(profile.id || `user-${timestamp}`),
    name,
    avatarUrl: profile.avatarUrl || hashNameToAvatar(name),
    city: profile.city || '上海',
    signature: profile.signature || '今晚这局不见不散。',
    identityTag: profile.identityTag || '酒局常驻玩家',
    createdAt: profile.createdAt || timestamp,
    updatedAt: timestamp,
  }
}

const ensureProfile = (inputProfile) => {
  const store = readStore()
  const normalized = normalizeProfile(inputProfile)
  const existed = store.profiles.find((item) => item.id === normalized.id)

  if (existed) {
    const nextProfile = {
      ...existed,
      ...normalized,
      createdAt: existed.createdAt || normalized.createdAt,
    }
    store.profiles = store.profiles.map((item) => (item.id === normalized.id ? nextProfile : item))
    writeStore(store)
    return nextProfile
  }

  store.profiles.unshift(normalized)
  writeStore(store)
  return normalized
}

const getProfileById = (store, profileId) => store.profiles.find((item) => item.id === profileId)

const getOrCreatePlaceholderProfile = (store, name) => {
  const trimmed = String(name || '').trim()
  const existed = store.profiles.find((item) => item.name.toLowerCase() === trimmed.toLowerCase())

  if (existed) {
    return existed
  }

  const profile = normalizeProfile({
    id: `user-${now()}`,
    name: trimmed,
    signature: '刚加入酒局圈子。',
    identityTag: '最近酒友',
  })
  store.profiles.unshift(profile)
  return profile
}

const serializeFriend = (store, friendship) => {
  const profile = getProfileById(store, friendship.friendId)

  return {
    id: friendship.id,
    profileId: friendship.friendId,
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

const searchProfiles = ({ ownerId, keyword = '' }) => {
  const store = readStore()
  const trimmed = String(keyword || '').trim().toLowerCase()

  if (!trimmed) {
    return []
  }

  const friendIds = new Set(
    store.friendships.filter((item) => item.ownerId === ownerId).map((item) => item.friendId),
  )

  return store.profiles
    .filter((item) => item.id !== ownerId)
    .filter((item) => {
      const haystack = [item.name, item.city, item.identityTag].join(' ').toLowerCase()
      return haystack.includes(trimmed)
    })
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

  const existed = store.friendships.find(
    (item) => item.ownerId === ownerId && item.friendId === targetProfile.id,
  )
  const updatedAt = now()

  if (existed) {
    const nextFriendship = {
      ...existed,
      alias: friendName && friendName.trim() ? friendName.trim() : existed.alias,
      meta,
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
    meta: typeof meta === 'string' ? meta : target.meta,
    updatedAt: now(),
  }
  store.friendships = store.friendships.map((item) => (item.id === friendshipId ? nextFriendship : item))
  writeStore(store)
  return serializeFriend(store, nextFriendship)
}

const removeFriend = ({ ownerId, friendshipId }) => {
  const store = readStore()
  store.friendships = store.friendships.filter(
    (item) => !(item.id === friendshipId && item.ownerId === ownerId),
  )
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
  ensureProfile,
  getBootstrap,
  ignorePoke,
  listPokes,
  removeFriend,
  replyPoke,
  searchProfiles,
  sendPoke,
  touchFriends,
  updateFriend,
}
