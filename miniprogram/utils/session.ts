export interface SessionParticipant {
  avatarUrl: string
  name: string
  profileId?: string
  status?: string
}

export interface SessionUser extends SessionParticipant {
  id: string
}

export interface SessionPlayerReaction {
  likeVoters: string[]
  playerName: string
  weakVoters: string[]
}

export interface SessionPlayerStat {
  avatarUrl: string
  clearedCount: number
  debtCount: number
  drinkCount: number
  meta?: string
  name: string
  profileId?: string
}

export interface SessionReportRank {
  avatarUrl: string
  name: string
  title: string
  value: string
}

export interface SessionReport {
  events: Array<{ text: string }>
  finishedAt: number
  playerCount: number
  ranks: SessionReportRank[]
  sessionName: string
}

export interface SessionRuntime {
  currentUser: SessionUser | null
  endedAt?: string
  inviteCode?: string
  isJudge: boolean
  playerCount: number
  playerReactions: SessionPlayerReaction[]
  playerStats: SessionPlayerStat[]
  reportId?: string
  selectedPlayers: SessionParticipant[]
  sessionId?: string
  sessionName: string
  startedAt: number
  state?: string
  status?: string
  templateImageUrl?: string
  templateName?: string
}

export const SESSION_RUNTIME_KEY = 'session-runtime'
export const SESSION_REPORT_KEY = 'session-report'

const DEFAULT_SESSION_RUNTIME: SessionRuntime = {
  currentUser: null,
  inviteCode: '',
  isJudge: false,
  playerCount: 0,
  playerReactions: [],
  playerStats: [],
  reportId: '',
  selectedPlayers: [],
  sessionId: '',
  sessionName: '',
  startedAt: 0,
  templateImageUrl: '',
  templateName: '',
}

const normalizeAvatarUrl = (value?: string) => {
  const text = String(value || '').trim()
  if (text.startsWith('/assets/avatars/') || /^https?:\/\/(?:127\.0\.0\.1(?::\d+)?\/__store__|store\/)/i.test(text) || /\/__tmp__\//i.test(text) || /\/__store__\//i.test(text)) {
    return ''
  }
  return text
}

export const getSessionRuntime = (): SessionRuntime => {
  const raw = wx.getStorageSync(SESSION_RUNTIME_KEY) as Partial<SessionRuntime> | undefined
  const merged = { ...DEFAULT_SESSION_RUNTIME, ...raw }
  return {
    ...merged,
    currentUser: merged.currentUser ? { ...merged.currentUser, avatarUrl: normalizeAvatarUrl(merged.currentUser.avatarUrl) } : null,
    playerReactions: Array.isArray(merged.playerReactions)
      ? merged.playerReactions.map((item) => ({
          playerName: item?.playerName || '',
          likeVoters: Array.isArray(item?.likeVoters) ? item.likeVoters : [],
          weakVoters: Array.isArray(item?.weakVoters) ? item.weakVoters : [],
        }))
      : [],
    playerStats: Array.isArray(merged.playerStats)
      ? merged.playerStats
          .filter((item) => item?.name)
          .map((item) => ({
            avatarUrl: normalizeAvatarUrl(item?.avatarUrl),
            clearedCount: Number(item?.clearedCount) || 0,
            debtCount: Number(item?.debtCount) || 0,
            drinkCount: Number(item?.drinkCount) || 0,
            meta: item?.meta || '',
            name: item?.name || '',
            profileId: item?.profileId || '',
          }))
      : [],
    selectedPlayers: Array.isArray(merged.selectedPlayers)
      ? merged.selectedPlayers.map((item) => ({ ...item, avatarUrl: normalizeAvatarUrl(item?.avatarUrl) }))
      : [],
  }
}

export const setSessionRuntime = (patch: Partial<SessionRuntime>): SessionRuntime => {
  const next = { ...getSessionRuntime(), ...patch }
  wx.setStorageSync(SESSION_RUNTIME_KEY, next)
  return next
}

export const clearSessionRuntime = (): SessionRuntime => {
  const currentUser = getSessionRuntime().currentUser
  const next = { ...DEFAULT_SESSION_RUNTIME, currentUser }
  wx.removeStorageSync(SESSION_REPORT_KEY)
  wx.removeStorageSync('judge-wheel-result')
  wx.setStorageSync(SESSION_RUNTIME_KEY, next)
  return next
}

export const getSessionReport = (): SessionReport | null => {
  const raw = wx.getStorageSync(SESSION_REPORT_KEY) as SessionReport | undefined
  return raw || null
}

export const setSessionReport = (report: SessionReport): SessionReport => {
  wx.setStorageSync(SESSION_REPORT_KEY, report)
  return report
}

export const formatElapsed = (startedAt: number, now = Date.now()): string => {
  if (!startedAt || now <= startedAt) return '00:00:00'
  const seconds = Math.floor((now - startedAt) / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainSeconds = seconds % 60
  return [hours, minutes, remainSeconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export const resolveSessionParticipants = (runtime = getSessionRuntime()): SessionParticipant[] => {
  const selectedPlayers = Array.isArray(runtime.selectedPlayers)
    ? runtime.selectedPlayers.filter((item) => item?.name).slice(0, runtime.playerCount)
    : []
  if (selectedPlayers.length) return selectedPlayers
  if (runtime.currentUser?.name) {
    return [{ avatarUrl: normalizeAvatarUrl(runtime.currentUser.avatarUrl), name: runtime.currentUser.name, profileId: runtime.currentUser.id, status: '' }]
  }
  return []
}
