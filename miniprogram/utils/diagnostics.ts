interface DiagnosticEntry {
  at: number
  detail?: Record<string, unknown>
  event: string
}

const DIAGNOSTIC_STORAGE_KEY = 'jzp-diagnostics'
const MAX_DIAGNOSTIC_ENTRIES = 30

const readDiagnostics = (): DiagnosticEntry[] => {
  const entries = wx.getStorageSync(DIAGNOSTIC_STORAGE_KEY) as DiagnosticEntry[] | undefined
  return Array.isArray(entries) ? entries : []
}

export const getRecentDiagnostics = () => readDiagnostics().slice(-10)

export const recordDiagnostic = (event: string, detail?: Record<string, unknown>) => {
  const entry: DiagnosticEntry = {
    at: Date.now(),
    detail,
    event,
  }
  const entries = [...readDiagnostics(), entry].slice(-MAX_DIAGNOSTIC_ENTRIES)
  wx.setStorageSync(DIAGNOSTIC_STORAGE_KEY, entries)
  console.info('[jzp-diagnostic]', event, detail || {})
}
