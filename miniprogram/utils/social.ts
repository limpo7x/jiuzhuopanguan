import { getApiBase } from '../config/api'
import { avatarAsset } from '../config/assets'

export interface SocialProfile {
  avatarUrl: string
  id: string
  identityTag: string
  lastLoginAt?: string
  loginCount?: number
  name: string
  phone?: string
  phoneMasked?: string
  signature: string
  wechatOpenId?: string
}

export interface WineFriend {
  avatarUrl: string
  id: string
  meta: string
  name: string
  profileId: string
  updatedAt: number
}

export interface SearchUserResult {
  alreadyFriend: boolean
  avatarUrl: string
  id: string
  identityTag: string
  name: string
}

export interface PokeThread {
  actionState: 'incoming' | 'matched' | 'outgoing'
  counterpartAvatarUrl: string
  counterpartId: string
  counterpartName: string
  id: string
  receiverAvatarUrl: string
  receiverId: string
  receiverName: string
  senderAvatarUrl: string
  senderId: string
  senderName: string
  status: 'pending' | 'matched'
  updatedAt: number
}

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface SocialBootstrapResponse {
  currentProfile: SocialProfile
  pokeThreads: PokeThread[]
  wineFriends: WineFriend[]
}

export interface UserAuthSession {
  loggedIn: boolean
  profile: SocialProfile | null
}

export interface UserLoginPayload {
  loginCode: string
  phoneCode?: string
  profile: {
    avatarUrl: string
    identityTag?: string
    name: string
    signature?: string
  }
}

const BACKEND_RETRY_INTERVAL = 30000
const CURRENT_PROFILE_KEY = 'social-current-profile'
const LOCAL_DIRECTORY_KEY = 'social-local-directory'
const LOCAL_POKE_THREADS_KEY = 'social-local-poke-threads'
const LOCAL_WINE_FRIENDS_KEY = 'social-local-wine-friends'
const PROFILE_ID_KEY = 'social-current-profile-id'
const USER_TOKEN_KEY = 'jzp-user-token'
const AUTHORIZED_WECHAT_PROFILE_KEY = 'social-authorized-wechat-profile'
const AVATAR_POOL = [avatarAsset(1), avatarAsset(2), avatarAsset(3), avatarAsset(4)]
const DEFAULT_DIRECTORY: SocialProfile[] = []
const LEGACY_DEMO_PROFILE_IDS = new Set(['user-1001', 'user-1002', 'user-1003', 'user-1004', 'user-test-a', 'user-test-b', 'user-search-a', 'user-search-b'])
let backendDownUntil = 0

const isPlaceholderSocialName = (value: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^酒友\d{3,}$/.test(text) || text === '未登录'
}

const sanitizeSocialName = (value: string) => {
  const text = String(value || '').trim()
  return isPlaceholderSocialName(text) ? '' : text
}

const isLegacyDemoProfile = (profile: Partial<SocialProfile> | null | undefined) => {
  const id = String(profile?.id || '').trim()
  if (!LEGACY_DEMO_PROFILE_IDS.has(id)) {
    return false
  }
  const openId = String(profile?.wechatOpenId || '').trim()
  const phone = String(profile?.phone || '').trim()
  return !openId && !phone
}

const request = <T>(
  path: string,
  method: WechatMiniprogram.RequestOption['method'] = 'GET',
  data?: WechatMiniprogram.IAnyObject,
): Promise<T> =>
  new Promise((resolve, reject) => {
    if (backendDownUntil > Date.now()) {
      reject(new Error('backend unavailable'))
      return
    }

    wx.request({
      url: `${getApiBase()}${path}`,
      method,
      data,
      header: getUserAuthHeaders(),
      timeout: 3000,
      success: (response) => {
        const payload = response.data as ApiResponse<T>

        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0) {
          backendDownUntil = 0
          resolve(payload.data)
          return
        }

        reject(new Error((payload?.data as { error?: string } | undefined)?.error || payload.message || 'request failed'))
      },
      fail: (error) => {
        backendDownUntil = Date.now() + BACKEND_RETRY_INTERVAL
        reject(error)
      },
    })
  })

export const getUserSessionToken = () => String(wx.getStorageSync(USER_TOKEN_KEY) || '')

export const getUserAuthHeaders = (): WechatMiniprogram.IAnyObject => {
  const token = getUserSessionToken()
  return token ? { 'X-JZP-User-Token': token } : {}
}

const cacheUserToken = (token: string) => {
  if (token) {
    wx.setStorageSync(USER_TOKEN_KEY, token)
  } else {
    wx.removeStorageSync(USER_TOKEN_KEY)
  }
}

export interface AuthorizedWechatProfile {
  avatarUrl: string
  name: string
}

const normalizeAuthorizedWechatProfile = (value: Partial<AuthorizedWechatProfile> | null | undefined): AuthorizedWechatProfile | null => {
  const name = String(value?.name || '').trim()
  const avatarUrl = String(value?.avatarUrl || '').trim()
  if (!name && !avatarUrl) {
    return null
  }
  return {
    name: sanitizeSocialName(name),
    avatarUrl,
  }
}

export const getAuthorizedWechatProfile = (): AuthorizedWechatProfile | null =>
  normalizeAuthorizedWechatProfile(wx.getStorageSync(AUTHORIZED_WECHAT_PROFILE_KEY) as Partial<AuthorizedWechatProfile> | undefined)

export const cacheAuthorizedWechatProfile = (value: Partial<AuthorizedWechatProfile> | null | undefined): AuthorizedWechatProfile | null => {
  const normalized = normalizeAuthorizedWechatProfile(value)
  if (normalized) {
    wx.setStorageSync(AUTHORIZED_WECHAT_PROFILE_KEY, normalized)
  } else {
    wx.removeStorageSync(AUTHORIZED_WECHAT_PROFILE_KEY)
  }
  return normalized
}

const resolveCurrentPageUrl = () => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (!current?.route) {
    return '/pages/index/index'
  }
  const route = `/${current.route}`
  const options = current.options || {}
  const query = Object.keys(options)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(options[key] || ''))}`)
    .join('&')
  return query ? `${route}?${query}` : route
}

const openLoginPage = (redirectUrl?: string) => {
  const target = `/pages/profile-edit/index?redirect=${encodeURIComponent(redirectUrl || resolveCurrentPageUrl())}`
  wx.navigateTo({
    url: target,
    fail: () => {
      wx.redirectTo({ url: target })
    },
  })
}

const hashNameToAvatar = (name: string) => {
  const sum = Array.from(name || '未登录').reduce((total, char) => total + char.charCodeAt(0), 0)
  return AVATAR_POOL[sum % AVATAR_POOL.length]
}

const randomId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`

const createDefaultProfile = (): SocialProfile => ({
  id: `user-${randomId()}`,
  name: '',
  avatarUrl: avatarAsset(1),
  signature: '',
  identityTag: '',
})

const getLocalProfile = (): SocialProfile => {
  const raw = wx.getStorageSync(CURRENT_PROFILE_KEY) as Partial<SocialProfile> | undefined
  const profileId = wx.getStorageSync(PROFILE_ID_KEY) as string | undefined
  if (isLegacyDemoProfile(raw)) {
    wx.removeStorageSync(CURRENT_PROFILE_KEY)
    wx.removeStorageSync(PROFILE_ID_KEY)
    return createDefaultProfile()
  }
  const normalizedName = sanitizeSocialName(raw?.name || '')
  const normalizedAvatarUrl = String(raw?.avatarUrl || '').trim()

  if (raw?.id) {
    return {
      avatarUrl: normalizedAvatarUrl || hashNameToAvatar(normalizedName || '未登录'),
      id: raw.id,
      identityTag: raw.identityTag || '',
      name: normalizedName,
      signature: raw.signature || '',
      phone: raw.phone || '',
      phoneMasked: raw.phoneMasked || '',
      wechatOpenId: raw.wechatOpenId || '',
    }
  }

  if (profileId) {
    if (LEGACY_DEMO_PROFILE_IDS.has(String(profileId || '').trim())) {
      wx.removeStorageSync(PROFILE_ID_KEY)
      return createDefaultProfile()
    }
    return {
      id: profileId,
      name: '',
      avatarUrl: avatarAsset(1),
      signature: '',
      identityTag: '',
    }
  }

  return createDefaultProfile()
}

export const resolveDisplayProfile = (profile: SocialProfile | null | undefined): SocialProfile => {
  const currentProfile = profile || createDefaultProfile()
  const authorizedWechatProfile = getAuthorizedWechatProfile()
  const displayName = sanitizeSocialName(authorizedWechatProfile?.name || currentProfile.name || '')
  const displayAvatar = String(authorizedWechatProfile?.avatarUrl || currentProfile.avatarUrl || '').trim()

  return {
    ...currentProfile,
    avatarUrl: displayAvatar || avatarAsset(1),
    name: displayName,
  }
}

export const getCurrentDisplayProfile = async (): Promise<SocialProfile> => resolveDisplayProfile(await ensureCurrentProfile())

const cacheProfile = (profile: SocialProfile) => {
  wx.setStorageSync(CURRENT_PROFILE_KEY, profile)
  wx.setStorageSync(PROFILE_ID_KEY, profile.id)
  return profile
}

const getLocalDirectory = (): SocialProfile[] => {
  const raw = wx.getStorageSync(LOCAL_DIRECTORY_KEY) as SocialProfile[] | undefined
  const merged = [...(Array.isArray(raw) ? raw : DEFAULT_DIRECTORY), getLocalProfile()]
  const map = new Map<string, SocialProfile>()

  merged.forEach((item) => {
    if (!item?.id || isLegacyDemoProfile(item)) {
      return
    }

    map.set(item.id, {
      id: item.id,
      name: item.name || '未命名用户',
      avatarUrl: item.avatarUrl || hashNameToAvatar(item.name || '未命名用户'),
      signature: item.signature || '',
      identityTag: item.identityTag || '',
      phone: item.phone || '',
      phoneMasked: item.phoneMasked || '',
      wechatOpenId: item.wechatOpenId || '',
    })
  })

  return Array.from(map.values())
}

const saveLocalDirectory = (profiles: SocialProfile[]) => {
  wx.setStorageSync(LOCAL_DIRECTORY_KEY, profiles)
  return profiles
}

const upsertLocalProfile = (profile: SocialProfile) => {
  const directory = getLocalDirectory()
  const next = [profile, ...directory.filter((item) => item.id !== profile.id)]
  saveLocalDirectory(next)
  return cacheProfile(profile)
}

const getLocalWineFriends = (): WineFriend[] => {
  const raw = wx.getStorageSync(LOCAL_WINE_FRIENDS_KEY) as WineFriend[] | undefined
  return Array.isArray(raw) ? raw : []
}

const saveLocalWineFriends = (friends: WineFriend[]) => {
  wx.setStorageSync(LOCAL_WINE_FRIENDS_KEY, friends)
  return friends
}

const getLocalPokeThreads = (): PokeThread[] => {
  const raw = wx.getStorageSync(LOCAL_POKE_THREADS_KEY) as PokeThread[] | undefined
  return Array.isArray(raw) ? raw : []
}

const saveLocalPokeThreads = (threads: PokeThread[]) => {
  wx.setStorageSync(LOCAL_POKE_THREADS_KEY, threads)
  return threads
}

const buildLocalThread = (
  sender: SocialProfile,
  receiver: SocialProfile,
  status: 'pending' | 'matched',
  updatedAt = Date.now(),
): PokeThread => ({
  id: [sender.id, receiver.id].sort().join('__'),
  senderId: sender.id,
  senderName: sender.name,
  senderAvatarUrl: sender.avatarUrl,
  receiverId: receiver.id,
  receiverName: receiver.name,
  receiverAvatarUrl: receiver.avatarUrl,
  counterpartId: receiver.id,
  counterpartName: receiver.name,
  counterpartAvatarUrl: receiver.avatarUrl,
  actionState: status === 'matched' ? 'matched' : 'outgoing',
  status,
  updatedAt,
})

const buildLocalBootstrap = (profile: SocialProfile): SocialBootstrapResponse => {
  const wineFriends = getLocalWineFriends()
  const pokeThreads = getLocalPokeThreads()
    .filter((item) => item.senderId === profile.id || item.receiverId === profile.id)
    .map((item) => {
      const isIncoming = item.receiverId === profile.id
      const counterpart = isIncoming
        ? {
            id: item.senderId,
            name: item.senderName,
            avatarUrl: item.senderAvatarUrl,
          }
        : {
            id: item.receiverId,
            name: item.receiverName,
            avatarUrl: item.receiverAvatarUrl,
          }

      const actionState: PokeThread['actionState'] = item.status === 'matched' ? 'matched' : isIncoming ? 'incoming' : 'outgoing'

      return {
        ...item,
        counterpartId: counterpart.id,
        counterpartName: counterpart.name,
        counterpartAvatarUrl: counterpart.avatarUrl,
        actionState,
      }
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)

  return {
    currentProfile: profile,
    pokeThreads,
    wineFriends,
  }
}

export const ensureCurrentProfile = async (): Promise<SocialProfile> => {
  const local = getLocalProfile()
  const token = getUserSessionToken()
  if (token) {
    try {
      const session = await request<UserAuthSession>('/user/auth/session')
      if (session.loggedIn && session.profile) {
        return upsertLocalProfile(session.profile)
      }
      cacheUserToken('')
      return upsertLocalProfile(local)
    } catch {
      if (local.wechatOpenId) {
        return upsertLocalProfile(local)
      }
      cacheUserToken('')
    }
  }

  try {
    const profile = await request<SocialProfile>('/social/profile', 'PUT', local)
    return upsertLocalProfile(profile)
  } catch {
    return upsertLocalProfile(local)
  }
}

export const bootstrapSocial = async (): Promise<SocialBootstrapResponse> => {
  const profile = await ensureCurrentProfile()

  try {
    const result = await request<SocialBootstrapResponse>(`/social/bootstrap?profileId=${encodeURIComponent(profile.id)}`)
    upsertLocalProfile(result.currentProfile)
    saveLocalWineFriends(result.wineFriends)
    saveLocalPokeThreads(result.pokeThreads)
    return result
  } catch {
    return buildLocalBootstrap(profile)
  }
}

export const getCurrentProfile = async (): Promise<SocialProfile> => ensureCurrentProfile()

export const getUserAuthSession = async (): Promise<UserAuthSession> => {
  const token = getUserSessionToken()
  if (!token) {
    return { loggedIn: false, profile: null }
  }
  const local = getLocalProfile()
  try {
    const session = await request<UserAuthSession>('/user/auth/session')
    if (session.loggedIn && session.profile) {
      upsertLocalProfile(session.profile)
      return session
    }
    cacheUserToken('')
    return { loggedIn: false, profile: null }
  } catch {
    return local.wechatOpenId ? { loggedIn: true, profile: local } : { loggedIn: false, profile: null }
  }
}

export const ensureUserAuthorized = async (redirectUrl?: string): Promise<SocialProfile | null> => {
  const session = await getUserAuthSession()
  if (session.loggedIn && session.profile?.wechatOpenId) {
    return session.profile
  }
  openLoginPage(redirectUrl)
  return null
}

export const loginWithWechat = async (payload: UserLoginPayload): Promise<SocialProfile> => {
  const result = await request<{ profile: SocialProfile; token: string }>('/user/auth/login', 'POST', payload as WechatMiniprogram.IAnyObject)
  cacheUserToken(result.token)
  const requestedName = String(payload.profile?.name || '').trim()
  const requestedAvatarUrl = String(payload.profile?.avatarUrl || '').trim()
  const resolvedName = sanitizeSocialName(requestedName) || sanitizeSocialName(result.profile?.name || '')
  const mergedProfile: SocialProfile = {
    ...result.profile,
    name: resolvedName,
    avatarUrl: requestedAvatarUrl || result.profile.avatarUrl,
  }
  const cached = upsertLocalProfile(mergedProfile)
  cacheAuthorizedWechatProfile({
    name: resolvedName,
    avatarUrl: requestedAvatarUrl || result.profile.avatarUrl,
  })

  if (cached.name !== result.profile.name || cached.avatarUrl !== result.profile.avatarUrl) {
    try {
      await request<SocialProfile>('/social/profile', 'PUT', cached as WechatMiniprogram.IAnyObject)
    } catch {
      void 0
    }
  }

  return cached
}

export const bindCurrentUserPhone = async (phoneCode: string): Promise<SocialProfile> => {
  const profile = await request<SocialProfile>('/user/auth/bind-phone', 'POST', {
    phoneCode,
  })
  return upsertLocalProfile(profile)
}

export const saveCurrentProfile = async (patch: Partial<SocialProfile>): Promise<SocialProfile> => {
  const current = getLocalProfile()
  const nextProfile = {
    ...current,
    ...patch,
  }

  try {
    const remote = await request<SocialProfile>('/social/profile', 'PUT', nextProfile as WechatMiniprogram.IAnyObject)
    return upsertLocalProfile(remote)
  } catch {
    return upsertLocalProfile(nextProfile)
  }
}

export const getWineFriends = async (): Promise<WineFriend[]> => {
  const result = await bootstrapSocial()
  return result.wineFriends
}

export const addWineFriend = async (name: string, meta = '最近添加'): Promise<WineFriend> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<WineFriend>('/social/friends', 'POST', {
      ownerId: profile.id,
      friendName: name.trim(),
      meta,
    })
    saveLocalWineFriends([remote, ...getLocalWineFriends().filter((item) => item.id !== remote.id)])
    return remote
  } catch {
    const trimmed = name.trim()
    const profileId = `local-profile-${randomId()}`
    const directoryProfile: SocialProfile = {
      id: profileId,
      name: trimmed,
      avatarUrl: hashNameToAvatar(trimmed),
      signature: '',
      identityTag: '',
    }
    saveLocalDirectory([directoryProfile, ...getLocalDirectory().filter((item) => item.id !== profileId)])
    const friend: WineFriend = {
      id: `local-friend-${randomId()}`,
      profileId,
      avatarUrl: directoryProfile.avatarUrl,
      name: trimmed,
      meta,
      updatedAt: Date.now(),
    }
    saveLocalWineFriends([friend, ...getLocalWineFriends().filter((item) => item.profileId !== profileId)])
    return friend
  }
}

export const addWineFriendByProfile = async (
  friendProfileId: string,
  friendName?: string,
  meta = '最近添加',
): Promise<WineFriend> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<WineFriend>('/social/friends', 'POST', {
      ownerId: profile.id,
      friendProfileId,
      friendName: friendName?.trim() || '',
      meta,
    })
    saveLocalWineFriends([remote, ...getLocalWineFriends().filter((item) => item.id !== remote.id)])
    return remote
  } catch {
    const target = getLocalDirectory().find((item) => item.id === friendProfileId)
    const localName = friendName?.trim() || target?.name || '未命名用户'
    const friend: WineFriend = {
      id: `local-friend-${randomId()}`,
      profileId: friendProfileId,
      avatarUrl: target?.avatarUrl || hashNameToAvatar(localName),
      name: localName,
      meta,
      updatedAt: Date.now(),
    }
    saveLocalWineFriends([friend, ...getLocalWineFriends().filter((item) => item.profileId !== friendProfileId)])
    return friend
  }
}

export const updateWineFriend = async (
  id: string,
  patch: Partial<Pick<WineFriend, 'meta' | 'name'>>,
): Promise<WineFriend> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<WineFriend>(`/social/friends/${encodeURIComponent(id)}`, 'PUT', {
      ownerId: profile.id,
      ...patch,
    })
    saveLocalWineFriends(getLocalWineFriends().map((item) => (item.id === id ? remote : item)))
    return remote
  } catch {
    const next = getLocalWineFriends().map((item) =>
      item.id === id
        ? {
            ...item,
            name: typeof patch.name === 'string' ? patch.name.trim() : item.name,
            meta: typeof patch.meta === 'string' ? patch.meta : item.meta,
            updatedAt: Date.now(),
          }
        : item,
    )
    saveLocalWineFriends(next)
    return next.find((item) => item.id === id) as WineFriend
  }
}

export const removeWineFriend = async (id: string): Promise<WineFriend[]> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<WineFriend[]>(
      `/social/friends/${encodeURIComponent(id)}?profileId=${encodeURIComponent(profile.id)}`,
      'DELETE',
    )
    saveLocalWineFriends(remote)
    return remote
  } catch {
    const next = getLocalWineFriends().filter((item) => item.id !== id)
    saveLocalWineFriends(next)
    return next
  }
}

export const touchWineFriends = async (
  participants: Array<{ avatarUrl: string; name: string }>,
): Promise<WineFriend[]> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<WineFriend[]>('/social/friends/touch', 'POST', {
      ownerId: profile.id,
      participants,
    })
    saveLocalWineFriends(remote)
    return remote
  } catch {
    let friends = getLocalWineFriends()
    participants.forEach((item, index) => {
      const existed = friends.find((friend) => friend.name === item.name)
      const friend: WineFriend = {
        id: existed?.id || `local-friend-${randomId()}`,
        profileId: existed?.profileId || `local-profile-${randomId()}`,
        avatarUrl: item.avatarUrl || existed?.avatarUrl || hashNameToAvatar(item.name),
        name: item.name,
        meta: index < 2 ? '刚一起开过局' : '最近联系',
        updatedAt: Date.now() + index,
      }
      friends = [friend, ...friends.filter((current) => current.id !== friend.id)]
    })
    saveLocalWineFriends(friends)
    return friends
  }
}

export const getVisiblePokeThreads = async (): Promise<PokeThread[]> => {
  const result = await bootstrapSocial()
  return result.pokeThreads
}

export const searchRegisteredUsers = async (keyword: string): Promise<SearchUserResult[]> => {
  const profile = await ensureCurrentProfile()
  const trimmed = keyword.trim()

  if (!trimmed) {
    return []
  }

  try {
    return await request<SearchUserResult[]>(
      `/social/users/search?profileId=${encodeURIComponent(profile.id)}&keyword=${encodeURIComponent(trimmed)}`,
    )
  } catch {
    const friends = getLocalWineFriends()
    return getLocalDirectory()
      .filter((item) => item.id !== profile.id)
      .filter((item) => [item.name, item.identityTag].join(' ').toLowerCase().includes(trimmed.toLowerCase()))
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        name: item.name,
        avatarUrl: item.avatarUrl,
        identityTag: item.identityTag,
        alreadyFriend: friends.some((friend) => friend.profileId === item.id),
      }))
  }
}

export const sendPokeToFriend = async (friendId: string): Promise<PokeThread | null> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<PokeThread>('/social/pokes', 'POST', {
      ownerId: profile.id,
      friendshipId: friendId,
    })
    saveLocalPokeThreads([remote, ...getLocalPokeThreads().filter((item) => item.id !== remote.id)])
    return remote
  } catch {
    const friend = getLocalWineFriends().find((item) => item.id === friendId)
    if (!friend || friend.profileId === profile.id) {
      return null
    }
    const receiver = getLocalDirectory().find((item) => item.id === friend.profileId) || {
      id: friend.profileId,
      name: friend.name,
      avatarUrl: friend.avatarUrl,
      signature: '',
      identityTag: '',
    }
    const threadId = [profile.id, receiver.id].sort().join('__')
    const existed = getLocalPokeThreads().find((item) => item.id === threadId)
    const next =
      existed && existed.status === 'pending' && existed.receiverId === profile.id
        ? {
            ...existed,
            status: 'matched' as const,
            updatedAt: Date.now(),
            actionState: 'matched' as const,
          }
        : buildLocalThread(profile, receiver, existed?.status === 'matched' ? 'matched' : 'pending', Date.now())
    const all = [next, ...getLocalPokeThreads().filter((item) => item.id !== next.id)]
    saveLocalPokeThreads(all)
    return next
  }
}

export const ignorePokeThread = async (threadId: string): Promise<PokeThread[]> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<PokeThread[]>(
      `/social/pokes/${encodeURIComponent(threadId)}?profileId=${encodeURIComponent(profile.id)}`,
      'DELETE',
    )
    saveLocalPokeThreads(remote)
    return remote
  } catch {
    const next = getLocalPokeThreads().filter((item) => item.id !== threadId)
    saveLocalPokeThreads(next)
    return next
  }
}

export const replyPokeThread = async (threadId: string): Promise<PokeThread | null> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<PokeThread>(`/social/pokes/${encodeURIComponent(threadId)}/reply`, 'POST', {
      profileId: profile.id,
    })
    saveLocalPokeThreads([remote, ...getLocalPokeThreads().filter((item) => item.id !== remote.id)])
    return remote
  } catch {
    const target = getLocalPokeThreads().find((item) => item.id === threadId)
    if (!target) {
      return null
    }
    const next = {
      ...target,
      status: 'matched' as const,
      actionState: 'matched' as const,
      updatedAt: Date.now(),
    }
    saveLocalPokeThreads([next, ...getLocalPokeThreads().filter((item) => item.id !== next.id)])
    return next
  }
}
