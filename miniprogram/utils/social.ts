import { getApiBase } from '../config/api'

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

interface UserAuthConfig {
  wechatLoginEnabled: boolean
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

export interface AuthorizedWechatProfile {
  avatarUrl: string
  name: string
}

const BACKEND_RETRY_INTERVAL = 30000
const CURRENT_PROFILE_KEY = 'social-current-profile'
const LOCAL_DIRECTORY_KEY = 'social-local-directory'
const LOCAL_POKE_THREADS_KEY = 'social-local-poke-threads'
const LOCAL_WINE_FRIENDS_KEY = 'social-local-wine-friends'
const PROFILE_ID_KEY = 'social-current-profile-id'
const USER_TOKEN_KEY = 'jzp-user-token'
const AUTHORIZED_WECHAT_PROFILE_KEY = 'social-authorized-wechat-profile'
const LEGACY_DEMO_PROFILE_IDS = new Set(['user-1001', 'user-1002', 'user-1003', 'user-1004', 'user-test-a', 'user-test-b', 'user-search-a', 'user-search-b'])
let backendDownUntil = 0

const normalizeSocialAvatarUrl = (value?: string) => {
  const text = String(value || '').trim()
  if (
    /^\/static\/avatar-(?:host|\d+)\.png$/i.test(text) ||
    text.startsWith('/assets/avatars/') ||
    /^https?:\/\/(?:127\.0\.0\.1(?::\d+)?\/__store__|store\/)/i.test(text) ||
    /\/__store__\//i.test(text) ||
    /\/__tmp__\//i.test(text)
  ) {
    return ''
  }
  return text
}

const sanitizeSocialName = (value?: string) => {
  const text = String(value || '').trim()
  return !text || /^微信用户\d*$/.test(text) || /^酒友\d{3,}$/.test(text) || text === '未登录' ? '' : text
}

const randomId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`

const createDefaultProfile = (): SocialProfile => ({
  id: `user-${randomId()}`,
  name: '',
  avatarUrl: '',
  signature: '',
  identityTag: '',
})

const isLegacyDemoProfile = (profile: Partial<SocialProfile> | null | undefined) => {
  const id = String(profile?.id || '').trim()
  if (!LEGACY_DEMO_PROFILE_IDS.has(id)) {
    return false
  }
  const openId = String(profile?.wechatOpenId || '').trim()
  const phone = String(profile?.phone || '').trim()
  return !openId && !phone
}

const normalizeProfile = (profile?: Partial<SocialProfile> | null): SocialProfile => ({
  id: String(profile?.id || `user-${randomId()}`).trim(),
  name: sanitizeSocialName(profile?.name),
  avatarUrl: normalizeSocialAvatarUrl(profile?.avatarUrl),
  signature: String(profile?.signature || '').trim(),
  identityTag: String(profile?.identityTag || '').trim(),
  phone: String(profile?.phone || '').trim(),
  phoneMasked: String(profile?.phoneMasked || '').trim(),
  wechatOpenId: String(profile?.wechatOpenId || '').trim(),
  lastLoginAt: profile?.lastLoginAt,
  loginCount: profile?.loginCount,
})

const normalizeFriend = (friend?: Partial<WineFriend> | null): WineFriend => ({
  id: String(friend?.id || `local-friend-${randomId()}`).trim(),
  profileId: String(friend?.profileId || `local-profile-${randomId()}`).trim(),
  avatarUrl: normalizeSocialAvatarUrl(friend?.avatarUrl),
  name: sanitizeSocialName(friend?.name) || String(friend?.name || '').trim(),
  meta: String(friend?.meta || '').trim(),
  updatedAt: Number(friend?.updatedAt) || Date.now(),
})

const normalizePokeThread = (thread?: Partial<PokeThread> | null): PokeThread => ({
  id: String(thread?.id || `poke-${randomId()}`).trim(),
  senderId: String(thread?.senderId || '').trim(),
  senderName: String(thread?.senderName || '').trim(),
  senderAvatarUrl: '',
  receiverId: String(thread?.receiverId || '').trim(),
  receiverName: String(thread?.receiverName || '').trim(),
  receiverAvatarUrl: '',
  counterpartId: String(thread?.counterpartId || '').trim(),
  counterpartName: String(thread?.counterpartName || '').trim(),
  counterpartAvatarUrl: '',
  actionState: thread?.actionState === 'incoming' || thread?.actionState === 'matched' ? thread.actionState : 'outgoing',
  status: thread?.status === 'matched' ? 'matched' : 'pending',
  updatedAt: Number(thread?.updatedAt) || Date.now(),
})

const getStoredArray = <T>(key: string): T[] => {
  const raw = wx.getStorageSync(key) as T[] | undefined
  return Array.isArray(raw) ? raw : []
}

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

export const clearUserSessionToken = () => cacheUserToken('')

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
        const fallbackMessage = response.statusCode === 502 ? '微信登录服务暂不可用，请检查服务器微信 AppID/AppSecret 配置' : 'request failed'
        reject(new Error(payload?.message || fallbackMessage))
      },
      fail: (error) => {
        backendDownUntil = Date.now() + BACKEND_RETRY_INTERVAL
        reject(error)
      },
    })
  })

const requestLoginCode = () =>
  new Promise<string>((resolve, reject) => {
    wx.login({
      success: (result) => {
        if (result.code) {
          resolve(result.code)
          return
        }
        reject(new Error('wx.login failed'))
      },
      fail: reject,
    })
  })

const isTempWechatAvatar = (value: string) => {
  const text = String(value || '').trim()
  return /^wxfile:\/\//i.test(text) || /^https?:\/\/tmp\//i.test(text) || /^file:\/\//i.test(text) || /\/tmp\//i.test(text) || /\/__tmp__\//i.test(text) || /\/__store__\//i.test(text)
}

const readLocalFileAsDataUrl = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (result) => {
        const data = String(result.data || '')
        if (!data) {
          reject(new Error('empty avatar file'))
          return
        }
        resolve(`data:image/png;base64,${data}`)
      },
      fail: reject,
    })
  })

const uploadAvatarDataUrl = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBase()}/user/avatar/upload`,
      method: 'POST',
      data: {
        dataUrl,
        fileName: `wechat-avatar-${Date.now()}.png`,
      },
      header: getUserAuthHeaders(),
      timeout: 5000,
      success: (response) => {
        const payload = response.data as ApiResponse<{ url: string }>
        if (response.statusCode >= 200 && response.statusCode < 300 && payload.code === 0 && payload.data?.url) {
          const url = payload.data.url
          resolve(url.startsWith('/') ? `${getApiBase().replace(/\/api\/v1$/, '')}${url}` : url)
          return
        }
        reject(new Error(payload?.message || 'avatar upload failed'))
      },
      fail: reject,
    })
  })

const uploadWechatAvatarIfNeeded = async (avatarUrl: string): Promise<string> => {
  const raw = String(avatarUrl || '').trim()
  if (!raw) {
    return ''
  }
  if (/^wxfile:\/\//i.test(raw) || /^file:\/\//i.test(raw) || /\/tmp\//i.test(raw) || /\/__tmp__\//i.test(raw)) {
    try {
      return normalizeSocialAvatarUrl(await uploadAvatarDataUrl(await readLocalFileAsDataUrl(raw)))
    } catch {
      return normalizeSocialAvatarUrl(raw)
    }
  }
  const source = normalizeSocialAvatarUrl(raw)
  if (!source || isTempWechatAvatar(source)) return ''
  return source
}

export const persistShareAvatarUrl = async (avatarUrl: string): Promise<string> => {
  const raw = String(avatarUrl || '').trim()
  if (!raw) {
    return ''
  }
  const persisted = await uploadWechatAvatarIfNeeded(raw)
  if (!persisted || isTempWechatAvatar(persisted)) {
    return ''
  }
  return persisted
}

const normalizeAuthorizedWechatProfile = (value: Partial<AuthorizedWechatProfile> | null | undefined): AuthorizedWechatProfile | null => {
  const name = sanitizeSocialName(value?.name)
  const avatarUrl = normalizeSocialAvatarUrl(value?.avatarUrl)
  if (!name && !avatarUrl) {
    return null
  }
  return { name, avatarUrl }
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
  const current = redirectUrl || resolveCurrentPageUrl()
  wx.showToast({ title: current.includes('/pages/index/index') ? '请点击左上角未登录授权' : '请先回首页完成微信登录', icon: 'none' })
}

const getLocalProfile = (): SocialProfile => {
  const raw = wx.getStorageSync(CURRENT_PROFILE_KEY) as Partial<SocialProfile> | undefined
  const profileId = String(wx.getStorageSync(PROFILE_ID_KEY) || '')
  if (isLegacyDemoProfile(raw)) {
    wx.removeStorageSync(CURRENT_PROFILE_KEY)
    wx.removeStorageSync(PROFILE_ID_KEY)
    return createDefaultProfile()
  }
  if (raw?.id) {
    return normalizeProfile(raw)
  }
  if (profileId && !LEGACY_DEMO_PROFILE_IDS.has(profileId)) {
    return normalizeProfile({ id: profileId })
  }
  return createDefaultProfile()
}

const cacheProfile = (profile: SocialProfile) => {
  const normalized = normalizeProfile(profile)
  wx.setStorageSync(CURRENT_PROFILE_KEY, normalized)
  wx.setStorageSync(PROFILE_ID_KEY, normalized.id)
  return normalized
}

const getLocalDirectory = (): SocialProfile[] => {
  const profiles = getStoredArray<SocialProfile>(LOCAL_DIRECTORY_KEY).map(normalizeProfile)
  const current = getLocalProfile()
  const map = new Map<string, SocialProfile>()
  ;[current, ...profiles].forEach((profile) => {
    if (profile.id && !isLegacyDemoProfile(profile)) {
      map.set(profile.id, normalizeProfile(profile))
    }
  })
  return Array.from(map.values())
}

const saveLocalDirectory = (profiles: SocialProfile[]) => {
  const normalized = profiles.map(normalizeProfile)
  wx.setStorageSync(LOCAL_DIRECTORY_KEY, normalized)
  return normalized
}

const upsertLocalProfile = (profile: SocialProfile) => {
  const normalized = normalizeProfile(profile)
  const directory = getLocalDirectory()
  saveLocalDirectory([normalized, ...directory.filter((item) => item.id !== normalized.id)])
  return cacheProfile(normalized)
}

const getLocalWineFriends = (): WineFriend[] => getStoredArray<WineFriend>(LOCAL_WINE_FRIENDS_KEY).map(normalizeFriend)
const saveLocalWineFriends = (friends: WineFriend[]) => {
  const normalized = friends.map(normalizeFriend)
  wx.setStorageSync(LOCAL_WINE_FRIENDS_KEY, normalized)
  return normalized
}

const getLocalPokeThreads = (): PokeThread[] => getStoredArray<PokeThread>(LOCAL_POKE_THREADS_KEY).map(normalizePokeThread)
const saveLocalPokeThreads = (threads: PokeThread[]) => {
  const normalized = threads.map(normalizePokeThread)
  wx.setStorageSync(LOCAL_POKE_THREADS_KEY, normalized)
  return normalized
}

export const resolveDisplayProfile = (profile: SocialProfile | null | undefined): SocialProfile => {
  const currentProfile = normalizeProfile(profile || createDefaultProfile())
  const authorizedWechatProfile = getAuthorizedWechatProfile()
  return {
    ...currentProfile,
    avatarUrl: normalizeSocialAvatarUrl(authorizedWechatProfile?.avatarUrl || currentProfile.avatarUrl),
    name: sanitizeSocialName(authorizedWechatProfile?.name || currentProfile.name),
  }
}

const buildCachedWechatLoginProfile = (profile?: Partial<SocialProfile>): UserLoginPayload['profile'] | null => {
  const authorizedWechatProfile = getAuthorizedWechatProfile()
  const name = sanitizeSocialName(authorizedWechatProfile?.name || profile?.name)
  const avatarUrl = normalizeSocialAvatarUrl(authorizedWechatProfile?.avatarUrl || profile?.avatarUrl)
  if (!name && !avatarUrl) {
    return null
  }
  return {
    avatarUrl,
    identityTag: String(profile?.identityTag || '').trim(),
    name,
    signature: String(profile?.signature || '').trim(),
  }
}

const finalizeWechatLogin = async (payload: UserLoginPayload): Promise<SocialProfile> => {
  const uploadedAvatarUrl = await uploadWechatAvatarIfNeeded(payload.profile?.avatarUrl || '')
  const loginPayload = {
    ...payload,
    profile: {
      ...payload.profile,
      avatarUrl: uploadedAvatarUrl || '',
      name: sanitizeSocialName(payload.profile?.name),
    },
  }
  const result = await request<{ profile: SocialProfile; token: string }>('/user/auth/login', 'POST', loginPayload as WechatMiniprogram.IAnyObject)
  cacheUserToken(result.token)
  const mergedProfile = normalizeProfile({
    ...result.profile,
    name: loginPayload.profile.name || result.profile?.name || '',
    avatarUrl: loginPayload.profile.avatarUrl || result.profile?.avatarUrl || '',
  })
  cacheAuthorizedWechatProfile({ name: mergedProfile.name, avatarUrl: mergedProfile.avatarUrl })
  return upsertLocalProfile(mergedProfile)
}

const trySilentWechatLogin = async (profile?: Partial<SocialProfile>): Promise<SocialProfile | null> => {
  const loginProfile = buildCachedWechatLoginProfile(profile)
  if (!loginProfile) {
    return null
  }
  try {
    const loginCode = await requestLoginCode()
    return await finalizeWechatLogin({ loginCode, profile: loginProfile })
  } catch {
    return null
  }
}

const ensureWechatLoginConfigured = async () => {
  const config = await request<UserAuthConfig>('/user/auth/config')
  if (!config.wechatLoginEnabled) {
    throw new Error('服务器未配置微信登录，请先配置 WECHAT_APP_ID 与 WECHAT_APP_SECRET')
  }
}

export const ensureCurrentProfile = async (): Promise<SocialProfile> => {
  const local = getLocalProfile()
  const token = getUserSessionToken()
  if (token) {
    try {
      const session = await request<UserAuthSession>('/user/auth/session')
      if (session.loggedIn && session.profile) {
        return upsertLocalProfile(normalizeProfile(session.profile))
      }
      cacheUserToken('')
    } catch {
      if (local.wechatOpenId) {
        return upsertLocalProfile(local)
      }
      cacheUserToken('')
    }
  }

  const restoredProfile = await trySilentWechatLogin(local)
  if (restoredProfile) {
    return restoredProfile
  }

  return upsertLocalProfile(local)
}

export const getCurrentDisplayProfile = async (): Promise<SocialProfile> => resolveDisplayProfile(await ensureCurrentProfile())
export const getCurrentProfile = async (): Promise<SocialProfile> => ensureCurrentProfile()

export const getUserAuthSession = async (): Promise<UserAuthSession> => {
  const local = getLocalProfile()
  const token = getUserSessionToken()
  if (!token) {
    const restoredProfile = await trySilentWechatLogin(local)
    return restoredProfile ? { loggedIn: true, profile: restoredProfile } : { loggedIn: false, profile: null }
  }
  try {
    const session = await request<UserAuthSession>('/user/auth/session')
    if (session.loggedIn && session.profile) {
      return { loggedIn: true, profile: upsertLocalProfile(normalizeProfile(session.profile)) }
    }
    cacheUserToken('')
    return { loggedIn: false, profile: null }
  } catch {
    cacheUserToken('')
    const restoredProfile = await trySilentWechatLogin(local)
    return restoredProfile ? { loggedIn: true, profile: restoredProfile } : { loggedIn: false, profile: null }
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

export const loginWithWechat = async (payload: UserLoginPayload): Promise<SocialProfile> => finalizeWechatLogin(payload)

export const loginWithWechatProfile = async (profile: UserLoginPayload['profile']): Promise<SocialProfile> => {
  await ensureWechatLoginConfigured()
  const loginCode = await requestLoginCode()
  return finalizeWechatLogin({ loginCode, profile })
}

export const bindCurrentUserPhone = async (phoneCode: string): Promise<SocialProfile> => {
  const profile = await request<SocialProfile>('/user/auth/bind-phone', 'POST', { phoneCode })
  return upsertLocalProfile(normalizeProfile(profile))
}

export const saveCurrentProfile = async (patch: Partial<SocialProfile>): Promise<SocialProfile> => {
  const current = getLocalProfile()
  const uploadedAvatarUrl = typeof patch.avatarUrl === 'string' ? await uploadWechatAvatarIfNeeded(patch.avatarUrl) : patch.avatarUrl
  const nextProfile = normalizeProfile({ ...current, ...patch, avatarUrl: uploadedAvatarUrl || patch.avatarUrl || current.avatarUrl })
  if (!getUserSessionToken()) {
    return upsertLocalProfile(nextProfile)
  }
  try {
    const remote = await request<SocialProfile>('/social/profile', 'PUT', nextProfile as WechatMiniprogram.IAnyObject)
    return upsertLocalProfile(normalizeProfile(remote))
  } catch {
    return upsertLocalProfile(nextProfile)
  }
}

const buildLocalBootstrap = (profile: SocialProfile): SocialBootstrapResponse => ({
  currentProfile: profile,
  wineFriends: getLocalWineFriends(),
  pokeThreads: getLocalPokeThreads()
    .filter((item) => item.senderId === profile.id || item.receiverId === profile.id)
    .map((item) => {
      const isIncoming = item.receiverId === profile.id
      return {
        ...item,
        actionState: item.status === 'matched' ? 'matched' : isIncoming ? 'incoming' : 'outgoing',
        counterpartId: isIncoming ? item.senderId : item.receiverId,
        counterpartName: isIncoming ? item.senderName : item.receiverName,
        counterpartAvatarUrl: '',
      }
    }),
})

export const bootstrapSocial = async (): Promise<SocialBootstrapResponse> => {
  const profile = await ensureCurrentProfile()
  if (!getUserSessionToken()) {
    return buildLocalBootstrap(profile)
  }
  try {
    const result = await request<SocialBootstrapResponse>(`/social/bootstrap?profileId=${encodeURIComponent(profile.id)}`)
    const currentProfile = upsertLocalProfile(normalizeProfile(result.currentProfile))
    const wineFriends = saveLocalWineFriends((result.wineFriends || []).map(normalizeFriend))
    const pokeThreads = saveLocalPokeThreads((result.pokeThreads || []).map(normalizePokeThread))
    return { currentProfile, wineFriends, pokeThreads }
  } catch {
    return buildLocalBootstrap(profile)
  }
}

export const getWineFriends = async (): Promise<WineFriend[]> => (await bootstrapSocial()).wineFriends

export const addWineFriendByProfile = async (
  friendProfileId: string,
  friendName?: string,
  meta = '',
): Promise<WineFriend> => {
  const profile = await ensureCurrentProfile()
  const remote = await request<WineFriend>('/social/friends', 'POST', {
    ownerId: profile.id,
    friendProfileId,
    friendName: friendName?.trim() || '',
    meta,
  })
  const friend = normalizeFriend(remote)
  saveLocalWineFriends([friend, ...getLocalWineFriends().filter((item) => item.id !== friend.id)])
  return friend
}

export const updateWineFriend = async (
  id: string,
  patch: Partial<Pick<WineFriend, 'meta' | 'name'>>,
): Promise<WineFriend> => {
  const profile = await ensureCurrentProfile()
  const remote = await request<WineFriend>(`/social/friends/${encodeURIComponent(id)}`, 'PUT', { ownerId: profile.id, ...patch })
  const friend = normalizeFriend(remote)
  saveLocalWineFriends(getLocalWineFriends().map((item) => (item.id === id ? friend : item)))
  return friend
}

export const removeWineFriend = async (id: string): Promise<WineFriend[]> => {
  const profile = await ensureCurrentProfile()
  const remote = await request<WineFriend[]>(`/social/friends/${encodeURIComponent(id)}?profileId=${encodeURIComponent(profile.id)}`, 'DELETE')
  return saveLocalWineFriends((remote || []).map(normalizeFriend))
}

export const touchWineFriends = async (participants: Array<{ avatarUrl: string; name: string; profileId?: string }>): Promise<WineFriend[]> => {
  const profile = await ensureCurrentProfile()
  const normalizedParticipants = participants.map((item) => ({ ...item, avatarUrl: normalizeSocialAvatarUrl(item.avatarUrl) }))
  const remote = await request<WineFriend[]>('/social/friends/touch', 'POST', { ownerId: profile.id, participants: normalizedParticipants })
  return saveLocalWineFriends((remote || []).map(normalizeFriend))
}

export const searchRegisteredUsers = async (keyword: string): Promise<SearchUserResult[]> => {
  const profile = await ensureCurrentProfile()
  const trimmed = keyword.trim()
  if (!trimmed) {
    return []
  }
  const remote = await request<SearchUserResult[]>(
    `/social/users/search?profileId=${encodeURIComponent(profile.id)}&keyword=${encodeURIComponent(trimmed)}`,
  )
  return (remote || []).map((item) => ({ ...item, avatarUrl: normalizeSocialAvatarUrl(item.avatarUrl) }))
}

export const getVisiblePokeThreads = async (): Promise<PokeThread[]> => (await bootstrapSocial()).pokeThreads

export const sendPokeToFriend = async (friendId: string): Promise<PokeThread | null> => {
  const profile = await ensureCurrentProfile()
  const remote = await request<PokeThread>('/social/pokes', 'POST', { ownerId: profile.id, friendshipId: friendId })
  const thread = normalizePokeThread(remote)
  saveLocalPokeThreads([thread, ...getLocalPokeThreads().filter((item) => item.id !== thread.id)])
  return thread
}

export const ignorePokeThread = async (threadId: string): Promise<PokeThread[]> => {
  const profile = await ensureCurrentProfile()
  const remote = await request<PokeThread[]>(`/social/pokes/${encodeURIComponent(threadId)}?profileId=${encodeURIComponent(profile.id)}`, 'DELETE')
  return saveLocalPokeThreads((remote || []).map(normalizePokeThread))
}

export const replyPokeThread = async (threadId: string): Promise<PokeThread | null> => {
  const profile = await ensureCurrentProfile()
  try {
    const remote = await request<PokeThread>(`/social/pokes/${encodeURIComponent(threadId)}/reply`, 'POST', { profileId: profile.id })
    const thread = normalizePokeThread(remote)
    saveLocalPokeThreads([thread, ...getLocalPokeThreads().filter((item) => item.id !== thread.id)])
    return thread
  } catch {
    const target = getLocalPokeThreads().find((item) => item.id === threadId)
    if (!target) {
      return null
    }
    const next = normalizePokeThread({ ...target, status: 'matched', actionState: 'matched', updatedAt: Date.now() })
    saveLocalPokeThreads([next, ...getLocalPokeThreads().filter((item) => item.id !== next.id)])
    return next
  }
}

