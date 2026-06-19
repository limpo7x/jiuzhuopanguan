type ShareStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'expired' | ''

interface SummaryItem {
  briefId?: string
  canResumeMomentIds?: string[]
  pendingMediaCount?: number
  rankingEntryEnabled?: boolean
  reportId?: string
  sessionId?: string
  sessionName?: string
  shareImageStatus?: ShareStatus | string
  shareImageTaskId?: string
  shareImageUrl?: string
  title?: string
}

interface DisplaySummaryItem extends SummaryItem {
  canResume: boolean
  key: string
  primaryTitle: string
  secondaryMeta: string
  shareTask: {
    id: string
    imageUrl: string
    status: ShareStatus
  }
}

const normalizeStatus = (value?: string): ShareStatus => {
  const status = String(value || '') as ShareStatus
  return status === 'pending' || status === 'processing' || status === 'ready' || status === 'failed' || status === 'expired'
    ? status
    : ''
}

const internalSummaryTitlePattern = /^(IT|PR|QA|DEV|TEST)[-_ ][A-Z0-9_-]+(?:\s+(opening|highlight|drinking|private|closing))?$/i
const internalProfilePattern = /^(PR|QA|DEV|TEST)\s+Seed\s+/i
const nodeTypeTitleMap: Record<string, string> = {
  closing: '收尾照片',
  drinking: '聚会账本',
  highlight: '聚会照片',
  opening: '开场照片',
  private: '私密记录',
}

const normalizeDisplayTitle = (title: string, sessionName: string, index: number) => {
  const match = title.match(internalSummaryTitlePattern)
  if (match) {
    const nodeType = String(match[2] || '').toLowerCase()
    return nodeTypeTitleMap[nodeType] || `聚会记录 ${index + 1}`
  }
  if (title && !internalProfilePattern.test(title)) {
    return title
  }
  if (sessionName && !internalSummaryTitlePattern.test(sessionName) && !internalProfilePattern.test(sessionName)) {
    return sessionName
  }
  return `聚会记录 ${index + 1}`
}

const normalizeItems = (items?: SummaryItem[]): DisplaySummaryItem[] =>
  (Array.isArray(items) ? items : []).map((item, index) => {
    const sessionName = String(item.sessionName || '').trim()
    const title = String(item.title || '').trim()
    const sessionId = String(item.sessionId || '').trim()
    const briefId = String(item.briefId || '').trim()
    const reportId = String(item.reportId || '').trim()
    const pendingMediaCount = Number(item.pendingMediaCount) || 0
    const canResumeMomentIds = Array.isArray(item.canResumeMomentIds) ? item.canResumeMomentIds.filter(Boolean) : []
    const shareImageTaskId = String(item.shareImageTaskId || '').trim()
    const shareImageUrl = String(item.shareImageUrl || '').trim()
    const shareImageStatus = normalizeStatus(item.shareImageStatus)

    return {
      ...item,
      briefId,
      canResume: canResumeMomentIds.length > 0,
      canResumeMomentIds,
      key: sessionId || briefId || reportId || `summary-${index}`,
      pendingMediaCount,
      primaryTitle: normalizeDisplayTitle(title, sessionName, index),
      rankingEntryEnabled: Boolean(item.rankingEntryEnabled),
      reportId,
      secondaryMeta: sessionName && !internalProfilePattern.test(sessionName) && sessionName !== title ? sessionName : '继续整理聚会照片和账本',
      sessionId,
      sessionName,
      shareImageStatus,
      shareImageTaskId,
      shareImageUrl,
      shareTask: {
        id: shareImageTaskId,
        imageUrl: shareImageUrl,
        status: shareImageStatus,
      },
      title,
    }
  })

Component({
  data: {
    displayItems: [] as DisplaySummaryItem[],
  },
  observers: {
    items() {
      this.refreshItems()
    },
  },
  properties: {
    compact: {
      type: Boolean,
      value: false,
    },
    emptyText: {
      type: String,
      value: '',
    },
    items: {
      type: Array,
      value: [],
    },
  },
  lifetimes: {
    attached() {
      this.refreshItems()
    },
  },
  methods: {
    getItem(event: WechatMiniprogram.BaseEvent): DisplaySummaryItem | null {
      const { index } = event.currentTarget.dataset as { index?: string | number }
      const itemIndex = Number(index)
      return Number.isInteger(itemIndex) ? this.data.displayItems[itemIndex] || null : null
    },

    handleBriefTap(event: WechatMiniprogram.BaseEvent) {
      const item = this.getItem(event)
      if (!item) return
      this.triggerEvent('brief', item)
    },

    handlePreviewTap(event: WechatMiniprogram.CustomEvent<{ imageUrl?: string }>) {
      const item = this.getItem(event)
      if (!item) return
      this.triggerEvent('preview', {
        ...item,
        imageUrl: event.detail?.imageUrl || item.shareImageUrl,
        shareImageTaskId: item.shareImageTaskId,
      })
    },

    handleResumeTap(event: WechatMiniprogram.BaseEvent) {
      const item = this.getItem(event)
      if (!item) return
      this.triggerEvent('resume', item)
    },

    handleRetryTap(event: WechatMiniprogram.CustomEvent<{ task?: { id?: string } }>) {
      const item = this.getItem(event)
      if (!item) return
      this.triggerEvent('retry', {
        ...item,
        shareImageTaskId: event.detail?.task?.id || item.shareImageTaskId,
      })
    },

    refreshItems() {
      this.setData({
        displayItems: normalizeItems(this.data.items as SummaryItem[]),
      })
    },
  },
})

export {}
