import { getSessionRuntime, isSessionRuntimeInProgress, type SessionRuntime } from './session'

export type SessionReturnRole = 'judge' | 'viewer'

export interface SessionReturnBarData {
  meta: string
  role: SessionReturnRole
  route: string
  sessionId: string
  status: string
  title: string
  visible: boolean
}

export interface SessionReturnSource {
  meta?: string
  name?: string
  role?: 'host' | 'member'
  sessionId?: string
  status?: string
  subtitle?: string
}

export const EMPTY_SESSION_RETURN: SessionReturnBarData = {
  meta: '',
  role: 'viewer',
  route: '',
  sessionId: '',
  status: '',
  title: '',
  visible: false,
}

const normalizeText = (value?: string) => String(value || '').trim()

const buildLiveRecordRoute = (sessionId: string, role: SessionReturnRole) =>
  `/pages/live-record/index?sessionId=${encodeURIComponent(sessionId)}&role=${encodeURIComponent(role)}`

const normalizeRuntimeStatus = (runtime: SessionRuntime) => {
  const status = normalizeText((runtime as SessionRuntime & { sessionStatus?: string; status?: string }).status)
  const sessionStatus = normalizeText((runtime as SessionRuntime & { sessionStatus?: string }).sessionStatus)
  return status || sessionStatus
}

const isActiveHistoryStatus = (value?: string) => {
  const status = normalizeText(value)
  if (!status) return false
  return !/已结束|结束|已完成|closed|ended|finished|deleted/i.test(status)
}

const isEndedRuntime = (runtime: SessionRuntime) => {
  const state = normalizeText((runtime as SessionRuntime & { sessionState?: string; state?: string }).state)
  const status = normalizeRuntimeStatus(runtime)
  return Boolean(state && !isActiveHistoryStatus(state)) || Boolean(status && !isActiveHistoryStatus(status))
}

export const buildSessionReturnFromRuntime = (runtime: SessionRuntime = getSessionRuntime()): SessionReturnBarData => {
  const sessionId = normalizeText(runtime.sessionId)
  if (!sessionId) {
    return EMPTY_SESSION_RETURN
  }

  const role: SessionReturnRole = runtime.isJudge ? 'judge' : 'viewer'
  if (!isSessionRuntimeInProgress(runtime)) {
    return EMPTY_SESSION_RETURN
  }
  if (isEndedRuntime(runtime)) {
    return EMPTY_SESSION_RETURN
  }
  const joinedCount = Math.min(runtime.selectedPlayers.filter((item) => !!item?.name).length || 0, runtime.playerCount || 0)
  const status = normalizeRuntimeStatus(runtime)
  const title = normalizeText(runtime.sessionName) || '当前聚会'
  const progressMeta = `${joinedCount || runtime.playerCount || 0}/${runtime.playerCount || 0} 人 · 回到记录页继续拍照`

  return {
    meta: [normalizeText(runtime.sessionSubtitle), progressMeta].filter(Boolean).join(' · '),
    role,
    route: buildLiveRecordRoute(sessionId, role),
    sessionId,
    status,
    title,
    visible: true,
  }
}

export const buildSessionReturnFromHistory = (rows: SessionReturnSource[]): SessionReturnBarData => {
  const current = rows.find((item) => isActiveHistoryStatus(item.status) && normalizeText(item.sessionId))
  if (!current) {
    return EMPTY_SESSION_RETURN
  }

  const sessionId = normalizeText(current.sessionId)
  const role: SessionReturnRole = current.role === 'host' ? 'judge' : 'viewer'
  const meta = normalizeText(current.meta) || '回到记录页继续拍照'

  return {
    meta: [normalizeText(current.subtitle), meta].filter(Boolean).join(' · '),
    role,
    route: buildLiveRecordRoute(sessionId, role),
    sessionId,
    status: normalizeText(current.status),
    title: normalizeText(current.name) || '当前聚会',
    visible: true,
  }
}

export const openSessionReturn = (target: Pick<SessionReturnBarData, 'route'>) => {
  if (!target.route) {
    wx.showToast({
      title: '未找到当前聚会',
      icon: 'none',
    })
    return
  }

  wx.navigateTo({
    url: target.route,
    fail: () => {
      wx.redirectTo({
        url: target.route,
        fail: () => {
          wx.reLaunch({ url: target.route })
        },
      })
    },
  })
}
