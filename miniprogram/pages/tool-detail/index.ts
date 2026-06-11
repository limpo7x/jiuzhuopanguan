import { getToolById, resolveToolId, type ToolDescriptor } from '../../utils/toolkit'
import { getApiBase } from '../../config/api'
import { recordManagedToolUsage } from '../../services/operations'

interface ToolDetailState {
  compressQuality: number
  currencyAmount: string
  currencyFromIndex: number
  currencyFromLabel: string
  currencyOptions: string[]
  currencyResult: string
  currencyToIndex: number
  currencyToLabel: string
  heroImage: string
  imagePreviewSrc: string
  imageResult: string
  imageSource: string
  isImageTool: boolean
  jsonError: string
  originalSizeText: string
  qrCode: string
  qrImageUrl: string
  qrInput: string
  qrRows: Array<Array<{ active: boolean; id: string }>>
  resultSizeText: string
  steps: Array<{ title: string; desc: string }>
  subtitle: string
  summary: string
  tips: Array<{ label: string; value: string }>
  canvasHeight: number
  canvasWidth: number
  toolError: string
  toolId: string
  toolInput: string
  toolMode: ToolDescriptor['mode'] | ''
  toolName: string
  toolOutput: string
  unitAmount: string
  unitDimensionLabel: string
  unitDimensionIndex: number
  unitDimensions: string[]
  unitFromLabel: string
  unitFromIndex: number
  unitOptions: string[]
  unitResult: string
  unitToLabel: string
  unitToIndex: number
  watermarkLabel: string
  watermarkMaskClass: string
  watermarkPosition: string
  watermarkPositions: string[]
  nineGridTiles: Array<{ id: number; style: string }>
  loanAmount: string
  loanRate: string
  loanYears: string
  loanMonthly: string
  loanTotalInterest: string
  loanTotalPayment: string
}

interface ToolDetailMethods {
  applyToolConfig: (tool?: ToolDescriptor) => void
  calculateCurrency: () => void
  calculateLoan: () => void
  calculateTextStats: (value: string) => void
  calculateUnit: () => void
  handleChooseImage: () => void
  handleCompressQualityChange: (event: { detail: { value: number } }) => void
  handleCopyOutput: () => void
  handleCopyShareCode: () => void
  handleCurrencyAmountInput: (event: WechatMiniprogram.Input) => void
  handleCurrencyPickerChange: (event: WechatMiniprogram.PickerChange) => void
  handleDownloadQrCode: () => Promise<void>
  handleFormatJson: () => void
  handleGenerateShareCode: () => void
  handleJsonInput: (event: WechatMiniprogram.Input) => void
  handleLoanInput: (event: WechatMiniprogram.Input) => void
  handleMinifyJson: () => void
  handlePrimaryTap: () => void
  handleQrInput: (event: WechatMiniprogram.Input) => void
  handleRunCompress: () => void
  handleSaveImageResult: () => void
  handleSecondaryTap: () => void
  handleSwapCurrency: () => void
  handleTextInput: (event: WechatMiniprogram.Input) => void
  handleUnitAmountInput: (event: WechatMiniprogram.Input) => void
  handleUnitDimensionChange: (event: WechatMiniprogram.PickerChange) => void
  handleUnitPickerChange: (event: WechatMiniprogram.PickerChange) => void
  handleWatermarkPositionTap: (event: WechatMiniprogram.BaseEvent) => void
  drawCanvasToFile: (width: number, height: number, drawer: (ctx: WechatMiniprogram.CanvasContext) => void) => Promise<string>
  exportNineGridImages: () => Promise<void>
  exportWatermarkImage: () => Promise<void>
  getImageInfo: (src: string) => Promise<WechatMiniprogram.GetImageInfoSuccessCallbackResult>
  openPage: (url: string) => void
  prepareImageToolState: (path: string) => Promise<void>
  saveImageFile: (filePath: string) => Promise<void>
}


const CURRENCY_OPTIONS = ['CNY', 'USD', 'EUR', 'HKD', 'JPY']
const CURRENCY_RATE_MAP: Record<string, number> = {
  CNY: 1,
  USD: 7.12,
  EUR: 7.78,
  HKD: 0.91,
  JPY: 0.048,
}

const UNIT_DIMENSIONS = ['长度', '重量', '温度']
const UNIT_GROUPS = [
  ['米', '厘米', '公里'],
  ['千克', '克', '斤'],
  ['摄氏度', '华氏度', '开尔文'],
]

const WATERMARK_POSITIONS = ['左上角', '右上角', '左下角', '右下角', '居中']

const decodeParam = (value?: string) => {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const toNumber = (value: string) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : 0
}

const toMoney = (value: number) => `¥ ${value.toFixed(2)}`

const parseFileSize = async (path: string) =>
  new Promise<string>((resolve) => {
    wx.getFileInfo({
      filePath: path,
      success: (result) => {
        const kb = result.size / 1024
        if (kb >= 1024) {
          resolve(`${(kb / 1024).toFixed(2)} MB`)
          return
        }

        resolve(`${kb.toFixed(0)} KB`)
      },
      fail: () => resolve('--'),
    })
  })

const buildTextStats = (value: string) => {
  const trimmed = value.trim()
  const paragraphCount = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0
  const chineseCount = (value.match(/[\u4e00-\u9fa5]/g) || []).length
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
  const punctuationCount = (value.match(/[，。！？；：,.!?;:'"()（）【】\[\]-]/g) || []).length

  return [
    { label: '总字数', value: String(value.length) },
    { label: '中文字符', value: String(chineseCount) },
    { label: '词数', value: String(wordCount) },
    { label: '段落', value: String(paragraphCount) },
    { label: '空格', value: String((value.match(/\s/g) || []).length) },
    { label: '标点', value: String(punctuationCount) },
  ]
}

const buildQrRows = (seed: string) => {
  const content = seed || 'JIUZHUOPANGUAN'
  return Array.from({ length: 21 }, (_, row) =>
    Array.from({ length: 21 }, (_, col) => {
      const code = content.charCodeAt((row * 21 + col) % content.length)
      const active = ((row * 13 + col * 7 + code) % 5) < 2
      return {
        id: `${row}-${col}`,
        active,
      }
    }),
  )
}

const buildShareCode = (text: string) => {
  const normalized = (text || '酒桌判官').replace(/\s+/g, '').toUpperCase()
  let total = 0
  for (let index = 0; index < normalized.length; index += 1) {
    total += normalized.charCodeAt(index) * (index + 3)
  }

  return `JZ${String(total).slice(-6).padStart(6, '0')}`
}

const buildQrImageUrl = (text: string) => `${getApiBase()}/tools/qr-code.png?text=${encodeURIComponent(text)}&ts=${Date.now()}`

const buildNineGridTiles = (path: string) => {
  const positions = [0, 50, 100]
  const rows: Array<{ id: number; style: string }> = []

  positions.forEach((top) => {
    positions.forEach((left) => {
      rows.push({
        id: rows.length,
        style: `background-image:url(${path});background-size:300% 300%;background-position:${left}% ${top}%;`,
      })
    })
  })

  return rows
}

const getWatermarkLabel = (position: string) => `${position} 遮挡预览`

const getWatermarkMaskClass = (position: string) => {
  switch (position) {
    case '右上角':
      return 'tool-watermark-mask-top-right'
    case '左下角':
      return 'tool-watermark-mask-bottom-left'
    case '右下角':
      return 'tool-watermark-mask-bottom-right'
    case '居中':
      return 'tool-watermark-mask-center'
    case '左上角':
    default:
      return 'tool-watermark-mask-top-left'
  }
}

Page<ToolDetailState, ToolDetailMethods>({
  data: {
    toolId: '',
    toolName: '工具详情',
    toolMode: '',
    heroImage: '',
    subtitle: '',
    summary: '',
    tips: [],
    steps: [],
    toolInput: '',
    toolOutput: '',
    toolError: '',
    canvasHeight: 320,
    canvasWidth: 320,
    jsonError: '',
    imageSource: '',
    imageResult: '',
    originalSizeText: '--',
    resultSizeText: '--',
    compressQuality: 80,
    imagePreviewSrc: '',
    isImageTool: true,
    qrInput: '',
    qrCode: buildShareCode('酒桌判官'),
    qrImageUrl: buildQrImageUrl('酒桌判官'),
    qrRows: buildQrRows('酒桌判官'),
    currencyAmount: '100',
    currencyOptions: CURRENCY_OPTIONS,
    currencyFromIndex: 0,
    currencyFromLabel: CURRENCY_OPTIONS[0],
    currencyToIndex: 1,
    currencyToLabel: CURRENCY_OPTIONS[1],
    currencyResult: '',
    unitDimensions: UNIT_DIMENSIONS,
    unitDimensionIndex: 0,
    unitDimensionLabel: UNIT_DIMENSIONS[0],
    unitOptions: UNIT_GROUPS[0],
    unitAmount: '1',
    unitFromIndex: 0,
    unitFromLabel: UNIT_GROUPS[0][0],
    unitToIndex: 1,
    unitToLabel: UNIT_GROUPS[0][1],
    unitResult: '',
    watermarkPositions: WATERMARK_POSITIONS,
    watermarkPosition: WATERMARK_POSITIONS[0],
    watermarkLabel: getWatermarkLabel(WATERMARK_POSITIONS[0]),
    watermarkMaskClass: getWatermarkMaskClass(WATERMARK_POSITIONS[0]),
    nineGridTiles: [],
    loanAmount: '120',
    loanRate: '3.85',
    loanYears: '30',
    loanMonthly: '',
    loanTotalInterest: '',
    loanTotalPayment: '',
  },

  onLoad(query) {
    const toolId = resolveToolId(decodeParam(query?.id))
    const tool = getToolById(toolId)
    void recordManagedToolUsage(toolId)
    this.applyToolConfig(tool)
  },

  applyToolConfig(tool) {
    if (!tool) {
      this.setData({
        toolId: '',
        toolName: '',
        toolMode: '',
        heroImage: '',
        subtitle: '',
        summary: '',
        tips: [],
        steps: [],
        toolInput: '',
        toolOutput: '',
        toolError: '',
      })
      return
    }
    this.setData(
      {
        toolId: tool.id,
        toolName: tool.name,
        toolMode: tool.mode,
        heroImage: tool.heroImage,
        subtitle: tool.subtitle,
        summary: tool.summary,
        tips: tool.tips,
        steps: tool.steps,
        toolInput: '',
        toolOutput: '',
        toolError: '',
        jsonError: '',
        isImageTool: tool.mode === 'image-compress' || tool.mode === 'nine-grid' || tool.mode === 'watermark',
        imageSource: '',
        imageResult: '',
        imagePreviewSrc: '',
        originalSizeText: '--',
        resultSizeText: '--',
        qrInput: '',
        qrCode: buildShareCode(tool.name),
        qrImageUrl: buildQrImageUrl(tool.name),
        qrRows: buildQrRows(tool.name),
        watermarkPosition: WATERMARK_POSITIONS[0],
        watermarkLabel: getWatermarkLabel(WATERMARK_POSITIONS[0]),
        watermarkMaskClass: getWatermarkMaskClass(WATERMARK_POSITIONS[0]),
        nineGridTiles: [],
      },
      () => {
        if (tool.mode === 'text-count') {
          this.calculateTextStats('')
        }
        if (tool.mode === 'currency') {
          this.calculateCurrency()
        }
        if (tool.mode === 'unit') {
          this.calculateUnit()
        }
        if (tool.mode === 'loan') {
          this.calculateLoan()
        }
      },
    )
  },

  handlePrimaryTap() {
    this.openPage('/pages/usage-history/index')
  },

  handleSecondaryTap() {
    this.openPage('/pages/tools/index')
  },

  openPage(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({ url })
      },
    })
  },

  handleTextInput(event) {
    const value = event.detail.value
    this.setData({ toolInput: value })
    this.calculateTextStats(value)
  },

  calculateTextStats(value) {
    this.setData({
      tips: buildTextStats(value),
    })
  },

  handleJsonInput(event) {
    this.setData({
      toolInput: event.detail.value,
      jsonError: '',
    })
  },

  handleFormatJson() {
    try {
      const output = JSON.stringify(JSON.parse(this.data.toolInput || '{}'), null, 2)
      this.setData({
        toolOutput: output,
        jsonError: '',
      })
    } catch {
      this.setData({
        jsonError: 'JSON 结构有误，请先检查逗号、引号和括号。',
        toolOutput: '',
      })
    }
  },

  handleMinifyJson() {
    try {
      const output = JSON.stringify(JSON.parse(this.data.toolInput || '{}'))
      this.setData({
        toolOutput: output,
        jsonError: '',
      })
    } catch {
      this.setData({
        jsonError: 'JSON 结构有误，无法压缩输出。',
        toolOutput: '',
      })
    }
  },

  handleCopyOutput() {
    const value = this.data.toolOutput || this.data.toolInput
    if (!value) {
      wx.showToast({ title: '没有可复制的内容', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: value,
    })
  },

  handleLoanInput(event) {
    const { field } = event.currentTarget.dataset as { field: 'loanAmount' | 'loanRate' | 'loanYears' }
    this.setData(
      {
        [field]: event.detail.value,
      } as unknown as Pick<ToolDetailState, never>,
      () => {
        this.calculateLoan()
      },
    )
  },

  calculateLoan() {
    const amountWan = toNumber(this.data.loanAmount)
    const annualRate = toNumber(this.data.loanRate)
    const years = toNumber(this.data.loanYears)
    if (!amountWan || !annualRate || !years) {
      this.setData({
        loanMonthly: '--',
        loanTotalInterest: '--',
        loanTotalPayment: '--',
      })
      return
    }

    const principal = amountWan * 10000
    const monthlyRate = annualRate / 100 / 12
    const months = years * 12
    const factor = Math.pow(1 + monthlyRate, months)
    const monthly = (principal * monthlyRate * factor) / (factor - 1)
    const totalPayment = monthly * months
    const totalInterest = totalPayment - principal

    this.setData({
      loanMonthly: toMoney(monthly),
      loanTotalInterest: toMoney(totalInterest),
      loanTotalPayment: toMoney(totalPayment),
    })
  },

  handleCurrencyAmountInput(event) {
    this.setData(
      {
        currencyAmount: event.detail.value,
      },
      () => {
        this.calculateCurrency()
      },
    )
  },

  handleCurrencyPickerChange(event) {
    const { field } = event.currentTarget.dataset as { field: 'currencyFromIndex' | 'currencyToIndex' }
    this.setData(
      {
        [field]: Number(event.detail.value),
      } as unknown as Pick<ToolDetailState, never>,
      () => {
        this.calculateCurrency()
      },
    )
  },

  handleSwapCurrency() {
    this.setData(
      {
        currencyFromIndex: this.data.currencyToIndex,
        currencyToIndex: this.data.currencyFromIndex,
      },
      () => {
        this.calculateCurrency()
      },
    )
  },

  calculateCurrency() {
    const amount = toNumber(this.data.currencyAmount)
    const from = this.data.currencyOptions[this.data.currencyFromIndex]
    const to = this.data.currencyOptions[this.data.currencyToIndex]
    const fromRate = CURRENCY_RATE_MAP[from]
    const toRate = CURRENCY_RATE_MAP[to]
    const result = fromRate && toRate ? (amount * fromRate) / toRate : 0

    this.setData({
      currencyFromLabel: from,
      currencyToLabel: to,
      currencyResult: `${amount || 0} ${from} ≈ ${result.toFixed(2)} ${to}`,
    })
  },

  handleUnitDimensionChange(event) {
    const unitDimensionIndex = Number(event.detail.value)
    this.setData(
      {
        unitDimensionIndex,
        unitOptions: UNIT_GROUPS[unitDimensionIndex],
        unitFromIndex: 0,
        unitToIndex: 1,
      },
      () => {
        this.calculateUnit()
      },
    )
  },

  handleUnitAmountInput(event) {
    this.setData(
      {
        unitAmount: event.detail.value,
      },
      () => {
        this.calculateUnit()
      },
    )
  },

  handleUnitPickerChange(event) {
    const { field } = event.currentTarget.dataset as { field: 'unitFromIndex' | 'unitToIndex' }
    this.setData(
      {
        [field]: Number(event.detail.value),
      } as unknown as Pick<ToolDetailState, never>,
      () => {
        this.calculateUnit()
      },
    )
  },

  calculateUnit() {
    const amount = toNumber(this.data.unitAmount)
    const dimension = this.data.unitDimensionIndex
    const from = this.data.unitOptions[this.data.unitFromIndex]
    const to = this.data.unitOptions[this.data.unitToIndex]
    let result = amount

    if (dimension === 0) {
      const map: Record<string, number> = { 米: 1, 厘米: 0.01, 公里: 1000 }
      result = (amount * map[from]) / map[to]
    } else if (dimension === 1) {
      const map: Record<string, number> = { 千克: 1, 克: 0.001, 斤: 0.5 }
      result = (amount * map[from]) / map[to]
    } else {
      const toCelsius = (value: number, unit: string) => {
        if (unit === '华氏度') {
          return ((value - 32) * 5) / 9
        }
        if (unit === '开尔文') {
          return value - 273.15
        }
        return value
      }
      const fromCelsius = (value: number, unit: string) => {
        if (unit === '华氏度') {
          return value * 1.8 + 32
        }
        if (unit === '开尔文') {
          return value + 273.15
        }
        return value
      }
      result = fromCelsius(toCelsius(amount, from), to)
    }

    this.setData({
      unitDimensionLabel: this.data.unitDimensions[this.data.unitDimensionIndex],
      unitFromLabel: from,
      unitToLabel: to,
      unitResult: `${amount || 0} ${from} = ${result.toFixed(2)} ${to}`,
    })
  },

  handleGenerateShareCode() {
    const seed = this.data.qrInput.trim() || this.data.toolName
    this.setData({
      qrCode: buildShareCode(seed),
      qrImageUrl: buildQrImageUrl(seed),
      qrRows: buildQrRows(seed),
    })
  },

  handleQrInput(event) {
    this.setData({
      qrInput: event.detail.value,
    })
  },

  handleCopyShareCode() {
    wx.setClipboardData({
      data: `${this.data.qrCode}\n${this.data.qrInput || this.data.toolName}`,
    })
  },

  async handleDownloadQrCode() {
    if (!this.data.qrImageUrl) {
      wx.showToast({ title: '请先生成二维码', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存二维码...' })
    try {
      const download = await new Promise<WechatMiniprogram.DownloadFileSuccessCallbackResult>((resolve, reject) => {
        wx.downloadFile({
          url: this.data.qrImageUrl,
          success: resolve,
          fail: reject,
        })
      })

      if (download.statusCode !== 200) {
        throw new Error('download failed')
      }

      await this.saveImageFile(download.tempFilePath)
      wx.hideLoading()
      wx.showToast({ title: '二维码已保存', icon: 'success' })
    } catch {
      wx.hideLoading()
      wx.showToast({ title: '二维码生成失败，请确认后端已启动', icon: 'none' })
    }
  },

  handleChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      success: (result) => {
        const file = result.tempFiles[0]
        const path = file?.tempFilePath
        if (!path) {
          return
        }

        void this.prepareImageToolState(path)
      },
    })
  },

  async prepareImageToolState(path) {
    const originalSizeText = await parseFileSize(path)
    const nextData: Partial<ToolDetailState> = {
      imageSource: path,
      imageResult: this.data.toolMode === 'watermark' ? path : '',
      imagePreviewSrc: path,
      originalSizeText,
      resultSizeText: '--',
      toolError: '',
      nineGridTiles: this.data.toolMode === 'nine-grid' ? buildNineGridTiles(path) : [],
    }

    if (this.data.toolMode === 'watermark') {
      nextData.resultSizeText = '已生成遮挡预览'
    }

    this.setData(nextData as ToolDetailState)
  },

  handleCompressQualityChange(event) {
    this.setData({
      compressQuality: Number(event.detail.value),
    })
  },

  handleRunCompress() {
    if (!this.data.imageSource) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    wx.compressImage({
      src: this.data.imageSource,
      quality: this.data.compressQuality,
      success: async (result) => {
        const resultSizeText = await parseFileSize(result.tempFilePath)
        this.setData({
          imageResult: result.tempFilePath,
          imagePreviewSrc: result.tempFilePath,
          resultSizeText,
        })
      },
      fail: () => {
        wx.showToast({ title: '压缩失败，请重试', icon: 'none' })
      },
    })
  },

  handleSaveImageResult() {
    if (this.data.toolMode === 'nine-grid') {
      void this.exportNineGridImages()
      return
    }

    if (this.data.toolMode === 'watermark') {
      void this.exportWatermarkImage()
      return
    }

    const imagePath = this.data.imageResult || this.data.imageSource
    if (!imagePath) {
      wx.showToast({ title: '当前没有可保存的图片', icon: 'none' })
      return
    }

    void this.saveImageFile(imagePath)
      .then(() => {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      })
      .catch(() => {
        wx.showToast({ title: '保存失败，请检查权限', icon: 'none' })
      })
  },

  handleWatermarkPositionTap(event) {
    const { position } = event.currentTarget.dataset as { position: string }
    this.setData({
      watermarkPosition: position,
      watermarkLabel: getWatermarkLabel(position),
      watermarkMaskClass: getWatermarkMaskClass(position),
      imageResult: this.data.imageSource,
      imagePreviewSrc: this.data.imageSource,
      resultSizeText: this.data.imageSource ? '已生成遮挡预览' : '--',
    })
  },

  getImageInfo(src) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: resolve,
        fail: reject,
      })
    })
  },

  saveImageFile(filePath) {
    return new Promise<void>((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(),
        fail: reject,
      })
    })
  },

  drawCanvasToFile(width, height, drawer) {
    return new Promise((resolve, reject) => {
      this.setData(
        {
          canvasWidth: width,
          canvasHeight: height,
        },
        () => {
          const ctx = wx.createCanvasContext('toolExportCanvas')
          drawer(ctx)
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              canvasId: 'toolExportCanvas',
              width,
              height,
              destWidth: width,
              destHeight: height,
              success: (result) => resolve(result.tempFilePath),
              fail: reject,
            })
          })
        },
      )
    })
  },

  async exportNineGridImages() {
    if (!this.data.imageSource) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    wx.showLoading({ title: '导出九宫格...' })
    try {
      const info = await this.getImageInfo(this.data.imageSource)
      const cropSize = Math.min(info.width, info.height)
      const offsetX = Math.floor((info.width - cropSize) / 2)
      const offsetY = Math.floor((info.height - cropSize) / 2)
      const tileSize = cropSize / 3
      const exportSize = 900

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const sx = offsetX + tileSize * col
          const sy = offsetY + tileSize * row
          const tempFilePath = await this.drawCanvasToFile(exportSize, exportSize, (ctx) => {
            ctx.drawImage(this.data.imageSource, sx, sy, tileSize, tileSize, 0, 0, exportSize, exportSize)
          })
          await this.saveImageFile(tempFilePath)
        }
      }

      wx.hideLoading()
      this.setData({
        resultSizeText: '已导出 9 张切图',
      })
      wx.showToast({ title: '九宫格已保存', icon: 'success' })
    } catch {
      wx.hideLoading()
      wx.showToast({ title: '导出失败，请重试', icon: 'none' })
    }
  },

  async exportWatermarkImage() {
    if (!this.data.imageSource) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    wx.showLoading({ title: '导出图片...' })
    try {
      const info = await this.getImageInfo(this.data.imageSource)
      const maxWidth = 1080
      const scale = info.width > maxWidth ? maxWidth / info.width : 1
      const canvasWidth = Math.round(info.width * scale)
      const canvasHeight = Math.round(info.height * scale)
      const maskWidth = Math.max(150, Math.round(canvasWidth * 0.24))
      const maskHeight = Math.max(56, Math.round(canvasHeight * 0.08))
      const margin = 18
      let x = margin
      let y = margin

      if (this.data.watermarkPosition === '右上角') {
        x = canvasWidth - maskWidth - margin
      } else if (this.data.watermarkPosition === '左下角') {
        y = canvasHeight - maskHeight - margin
      } else if (this.data.watermarkPosition === '右下角') {
        x = canvasWidth - maskWidth - margin
        y = canvasHeight - maskHeight - margin
      } else if (this.data.watermarkPosition === '居中') {
        x = Math.round((canvasWidth - maskWidth) / 2)
        y = Math.round((canvasHeight - maskHeight) / 2)
      }

      const tempFilePath = await this.drawCanvasToFile(canvasWidth, canvasHeight, (ctx) => {
        ctx.drawImage(this.data.imageSource, 0, 0, canvasWidth, canvasHeight)
        ctx.setFillStyle('rgba(255,250,243,0.94)')
        ctx.fillRect(x, y, maskWidth, maskHeight)
        ctx.setStrokeStyle('rgba(255,255,255,0.96)')
        ctx.setLineWidth(2)
        ctx.strokeRect(x, y, maskWidth, maskHeight)
        ctx.setFillStyle('#8f7f6d')
        ctx.setFontSize(18)
        ctx.fillText('已处理', x + 18, y + Math.round(maskHeight / 2) + 6)
      })

      const resultSizeText = await parseFileSize(tempFilePath)
      this.setData({
        imageResult: tempFilePath,
        imagePreviewSrc: tempFilePath,
        resultSizeText,
      })
      await this.saveImageFile(tempFilePath)

      wx.hideLoading()
      wx.showToast({ title: '图片已保存', icon: 'success' })
    } catch {
      wx.hideLoading()
      wx.showToast({ title: '导出失败，请重试', icon: 'none' })
    }
  },
})

export {}
