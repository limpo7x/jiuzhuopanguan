type ShareTaskStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'expired' | ''

interface ShareTaskLike {
  failedReason?: string
  id?: string
  imageUrl?: string
  retryCount?: number
  status?: ShareTaskStatus
}

const STATUS_TEXT: Record<Exclude<ShareTaskStatus, ''>, string> = {
  expired: '已过期',
  failed: '生成失败',
  pending: '排队中',
  processing: '生成中',
  ready: '已生成',
}

const STATUS_DESC: Record<Exclude<ShareTaskStatus, ''>, string> = {
  expired: '分享图已过期，可重新生成。',
  failed: '生成失败，可重试一次。',
  pending: '已进入队列，稍后刷新查看。',
  processing: '正在合成分享图。',
  ready: '分享图已就绪，可预览或分享。',
}

const normalizeStatus = (value?: string): ShareTaskStatus => {
  const status = String(value || '') as ShareTaskStatus
  return status === 'pending' || status === 'processing' || status === 'ready' || status === 'failed' || status === 'expired' ? status : ''
}

const toSafeFailedReason = (value: string) => {
  const raw = String(value || '').trim()
  const lower = raw.toLowerCase()

  if (!raw) {
    return ''
  }
  if (
    lower.includes('not session member') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('401') ||
    lower.includes('403')
  ) {
    return '当前账号暂不能查看这张分享页，请使用邀请入口加入聚会'
  }
  if (lower.includes('share task has no visible nodes') || lower.includes('no visible nodes')) {
    return '这张分享图还没有可展示内容'
  }
  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('network') || lower.includes('failed to fetch')) {
    return '网络开小差了，请稍后重试'
  }
  if (raw.includes('超时') || raw.includes('相册权限') || raw.includes('保存失败')) {
    return raw
  }
  return '分享图暂时无法展示，请稍后重试'
}

Component({
  data: {
    canPreview: false,
    canRetry: false,
    displayFailedReason: '',
    displayImageUrl: '',
    displayRetryCount: 0,
    statusClass: 'empty',
    statusDesc: '暂无分享图任务。',
    statusText: '未生成',
  },
  observers: {
    'task, status, imageUrl, failedReason, retryCount': function refresh() {
      this.refreshView()
    },
  },
  properties: {
    compact: {
      type: Boolean,
      value: false,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    failedReason: {
      type: String,
      value: '',
    },
    imageUrl: {
      type: String,
      value: '',
    },
    retryCount: {
      type: Number,
      value: 0,
    },
    status: {
      type: String,
      value: '',
    },
    task: {
      type: Object,
      value: {},
    },
  },
  lifetimes: {
    attached() {
      this.refreshView()
    },
  },
  methods: {
    getTask(): ShareTaskLike {
      return (this.data.task || {}) as ShareTaskLike
    },

    refreshView() {
      const task = this.getTask()
      const status = normalizeStatus(task.status || this.data.status)
      const imageUrl = String(task.imageUrl || this.data.imageUrl || '')
      const failedReason = String(task.failedReason || this.data.failedReason || '')
      const retryCount = Number(task.retryCount ?? this.data.retryCount) || 0
      this.setData({
        canPreview: status === 'ready' && !!imageUrl,
        canRetry: status === 'failed' || status === 'expired',
        displayFailedReason: toSafeFailedReason(failedReason),
        displayImageUrl: imageUrl,
        displayRetryCount: retryCount,
        statusClass: status || 'empty',
        statusDesc: status ? STATUS_DESC[status] : '暂无分享图任务。',
        statusText: status ? STATUS_TEXT[status] : '未生成',
      })
    },

    handlePreviewTap() {
      if (!this.data.canPreview || !this.data.displayImageUrl) {
        return
      }
      this.triggerEvent('preview', {
        imageUrl: this.data.displayImageUrl,
        task: this.getTask(),
      })
    },

    handleRetryTap() {
      if (!this.data.canRetry || this.data.disabled) {
        return
      }
      this.triggerEvent('retry', {
        task: this.getTask(),
      })
    },
  },
})

export {}
