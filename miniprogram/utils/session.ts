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
  city?: string
  currentUser: SessionUser | null
  district?: string
  inviteCode?: string
  isJudge: boolean
  latitude?: number | null
  locationLabel?: string
  longitude?: number | null
  playerCount: number
  playerReactions: SessionPlayerReaction[]
  playerStats: SessionPlayerStat[]
  province?: string
  reportId?: string
  selectedPlayers: SessionParticipant[]
  sessionId?: string
  sessionName: string
  startedAt: number
  templateName?: string
}

export const SESSION_RUNTIME_KEY = 'session-runtime'
export const SESSION_REPORT_KEY = 'session-report'

const DEFAULT_SESSION_RUNTIME: SessionRuntime = {
  city: '',
  currentUser: null,
  district: '',
  inviteCode: '',
  isJudge: true,
  latitude: null,
  locationLabel: '',
  longitude: null,
  playerCount: 6,
  playerReactions: [],
  playerStats: [],
  province: '',
  reportId: '',
  selectedPlayers: [],
  sessionId: '',
  sessionName: '今晚聚会不醉不归',
  startedAt: 0,
  templateName: '',
}

export const getSessionRuntime = (): SessionRuntime => {
  const raw = wx.getStorageSync(SESSION_RUNTIME_KEY) as Partial<SessionRuntime> | undefined
  const merged = {
    ...DEFAULT_SESSION_RUNTIME,
    ...raw,
  }

  return {
    ...merged,
    currentUser: merged.currentUser || null,
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
            avatarUrl: item?.avatarUrl || '',
            clearedCount: Number(item?.clearedCount) || 0,
            debtCount: Number(item?.debtCount) || 0,
            drinkCount: Number(item?.drinkCount) || 0,
            meta: item?.meta || '',
            name: item?.name || '',
            profileId: item?.profileId || '',
          }))
      : [],
  }
}

export const setSessionRuntime = (patch: Partial<SessionRuntime>): SessionRuntime => {
  const next = {
    ...getSessionRuntime(),
    ...patch,
  }

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
  if (!startedAt || now <= startedAt) {
    return '00:00:00'
  }

  const seconds = Math.floor((now - startedAt) / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainSeconds = seconds % 60

  return [hours, minutes, remainSeconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export const resolveSessionParticipants = (runtime = getSessionRuntime()): SessionParticipant[] => {
  const selectedPlayers = Array.isArray(runtime.selectedPlayers)
    ? runtime.selectedPlayers.filter((item) => item?.name).slice(0, runtime.playerCount)
    : []

  if (selectedPlayers.length) {
    return selectedPlayers
  }

  if (runtime.currentUser?.name) {
    return [
      {
        avatarUrl: runtime.currentUser.avatarUrl,
        name: runtime.currentUser.name,
        profileId: runtime.currentUser.id,
        status: '已加入',
      },
    ]
  }

  return []
}
