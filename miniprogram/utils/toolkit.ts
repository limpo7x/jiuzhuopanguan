export interface ToolCategory {
  id: string
  name: string
}

export interface ToolDescriptor {
  id: string
  name: string
  categoryId: string
  iconClass: string
  toneClass: string
  imageUrl: string
  heroImage: string
  meta: string
  subtitle: string
  summary: string
  tips: Array<{ label: string; value: string }>
  steps: Array<{ title: string; desc: string }>
  mode:
    | 'image-compress'
    | 'text-count'
    | 'qr-code'
    | 'json'
    | 'loan'
    | 'currency'
    | 'unit'
    | 'nine-grid'
    | 'watermark'
}

export interface ToolCategoryCard {
  id: string
  name: string
  meta: string
  imageUrl: string
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: 'all', name: '全部' },
  { id: 'image', name: '图片处理' },
  { id: 'dev', name: '开发工具' },
  { id: 'calc', name: '计算工具' },
  { id: 'share', name: '分享生成' },
]

export const TOOL_ALIASES: Record<string, string> = {
  'tool-compress': 'image-compress',
  'tool-qr': 'qr-code',
  'tool-loan': 'loan-calc',
  'tool-currency': 'currency',
  'tool-unit': 'unit',
  loan: 'loan-calc',
  'tool-9-grid': 'nine-grid',
  'tool-json': 'json',
  'tool-watermark': 'watermark',
}

export const TOOL_MAP: Record<string, ToolDescriptor> = {
  'image-compress': {
    id: 'image-compress',
    name: '图片压缩',
    categoryId: 'image',
    iconClass: 'tools-icon-compress',
    toneClass: '',
    imageUrl: '',
    heroImage: '',
    meta: '压缩、转发、上传前快速减小图片体积',
    subtitle: '批量压缩图片，适合分享、上传和朋友圈场景。',
    summary: '调用微信原生压缩能力，选择图片后按质量生成更小体积版本。',
    tips: [
      { label: '压缩模式', value: '原生压缩' },
      { label: '推荐用途', value: '群分享/上传' },
      { label: '输出结果', value: '压缩后预览' },
    ],
    steps: [
      { title: '选择图片', desc: '从相册选择一张需要处理的图片。' },
      { title: '调整质量', desc: '拖动压缩质量，兼顾清晰度和体积。' },
      { title: '生成结果', desc: '执行后可预览压缩前后差异，并保存结果。' },
    ],
    mode: 'image-compress',
  },
  'text-count': {
    id: 'text-count',
    name: '文字计数',
    categoryId: 'dev',
    iconClass: 'tools-icon-text',
    toneClass: '',
    imageUrl: '',
    heroImage: '',
    meta: '实时统计字数、段落、空格和标点',
    subtitle: '粘贴文本后实时统计字数、段落和空格。',
    summary: '适合投稿、文案审核和日常输入统计，粘贴即可计算。',
    tips: [
      { label: '统计内容', value: '字数/段落/空格' },
      { label: '输入方式', value: '粘贴文本' },
      { label: '推荐场景', value: '文案检查' },
    ],
    steps: [
      { title: '粘贴文本', desc: '把要统计的文本直接贴入输入区。' },
      { title: '查看结果', desc: '页面会实时计算字数、词数和段落。' },
      { title: '继续调整', desc: '可根据限制继续删改文案。' },
    ],
    mode: 'text-count',
  },
  'qr-code': {
    id: 'qr-code',
    name: '二维码生成',
    categoryId: 'share',
    iconClass: 'tools-icon-qr',
    toneClass: '',
    imageUrl: '',
    heroImage: '',
    meta: '分享口令、链接和活动信息快速出码',
    subtitle: '输入口令或链接，立即生成分享码卡片。',
    summary: '当前提供轻量码阵预览和分享口令生成，适合酒局邀人和活动卡片场景。',
    tips: [
      { label: '输入对象', value: '链接/口令/文本' },
      { label: '输出形式', value: '分享码卡片' },
      { label: '适合场景', value: '拉群/邀局' },
    ],
    steps: [
      { title: '输入分享内容', desc: '填写加入口令、链接或提示文案。' },
      { title: '生成分享码', desc: '页面会按输入生成一组可复制的分享码。' },
      { title: '复制继续分享', desc: '复制文案或截图分享卡片继续使用。' },
    ],
    mode: 'qr-code',
  },
  json: {
    id: 'json',
    name: 'JSON格式化',
    categoryId: 'dev',
    iconClass: 'tools-icon-code',
    toneClass: 'tools-tile-blue',
    imageUrl: '',
    heroImage: '',
    meta: '粘贴 JSON 后一键格式化或压缩',
    subtitle: 'JSON 一键格式化，便于阅读和调试。',
    summary: '适合接口联调、日志查看和结构排查，支持格式化、压缩和复制输出。',
    tips: [
      { label: '适合对象', value: '接口数据' },
      { label: '操作方式', value: '粘贴即用' },
      { label: '输出结果', value: '格式化文本' },
    ],
    steps: [
      { title: '粘贴 JSON', desc: '把原始 JSON 内容贴入输入区。' },
      { title: '选择处理方式', desc: '可格式化缩进，也可压缩成单行。' },
      { title: '复制结果', desc: '输出后直接复制到代码或文档。' },
    ],
    mode: 'json',
  },
  'loan-calc': {
    id: 'loan-calc',
    name: '房贷计算',
    categoryId: 'calc',
    iconClass: 'tools-icon-home',
    toneClass: '',
    imageUrl: '',
    heroImage: '',
    meta: '月供、总利息和总还款快速试算',
    subtitle: '按月供、总利息和还款计划快速试算。',
    summary: '支持等额本息试算，适合预算判断和多方案对比。',
    tips: [
      { label: '支持方式', value: '等额本息' },
      { label: '适合用途', value: '预算试算' },
      { label: '输出结果', value: '月供概览' },
    ],
    steps: [
      { title: '输入贷款信息', desc: '填写贷款总额、年利率和年限。' },
      { title: '执行试算', desc: '即时得到月供、总还款和总利息。' },
      { title: '对比方案', desc: '继续调整参数测试不同方案。' },
    ],
    mode: 'loan',
  },
  currency: {
    id: 'currency',
    name: '汇率换算',
    categoryId: 'calc',
    iconClass: 'tools-icon-currency',
    toneClass: 'tools-tile-green',
    imageUrl: '',
    heroImage: '',
    meta: '常用货币之间快速换算',
    subtitle: '输入金额后，按预置参考汇率快速换算。',
    summary: '适合日常旅行预算、活动结算和简单估算场景。',
    tips: [
      { label: '支持币种', value: 'CNY/USD/EUR' },
      { label: '汇率类型', value: '参考值' },
      { label: '适合场景', value: '预算估算' },
    ],
    steps: [
      { title: '输入金额', desc: '填写需要换算的数值。' },
      { title: '选择币种', desc: '选择来源和目标货币。' },
      { title: '查看结果', desc: '页面即时给出换算结果。' },
    ],
    mode: 'currency',
  },
  unit: {
    id: 'unit',
    name: '单位换算',
    categoryId: 'calc',
    iconClass: 'tools-icon-scale',
    toneClass: 'tools-tile-green',
    imageUrl: '',
    heroImage: '',
    meta: '长度、重量和温度常见单位换算',
    subtitle: '快速完成长度、重量和温度的常用换算。',
    summary: '适合日常估算、活动准备和轻量计算场景。',
    tips: [
      { label: '支持维度', value: '长度/重量/温度' },
      { label: '操作方式', value: '即时换算' },
      { label: '适合场景', value: '日常估算' },
    ],
    steps: [
      { title: '选择维度', desc: '长度、重量或温度三种模式切换。' },
      { title: '输入数值', desc: '填写要换算的原始数值。' },
      { title: '查看结果', desc: '即时得到目标单位结果。' },
    ],
    mode: 'unit',
  },
  'nine-grid': {
    id: 'nine-grid',
    name: '九宫格切图',
    categoryId: 'image',
    iconClass: 'tools-icon-grid',
    toneClass: 'tools-tile-blue',
    imageUrl: '',
    heroImage: '',
    meta: '朋友圈九宫格预览与分区检查',
    subtitle: '一张图自动切成九宫格，适合朋友圈排版。',
    summary: '提供九宫格切片预览，便于检查主视觉是否被切开。',
    tips: [
      { label: '输出规格', value: '3 x 3' },
      { label: '适合场景', value: '朋友圈排版' },
      { label: '处理方式', value: '预览切片' },
    ],
    steps: [
      { title: '选择原图', desc: '上传一张准备发圈的大图。' },
      { title: '查看九宫格', desc: '检查重点内容是否落在安全区域。' },
      { title: '确认使用', desc: '按预览结果决定是否更换图片。' },
    ],
    mode: 'nine-grid',
  },
  watermark: {
    id: 'watermark',
    name: '图片去水印',
    categoryId: 'image',
    iconClass: 'tools-icon-eraser',
    toneClass: '',
    imageUrl: '',
    heroImage: '',
    meta: '快速预览遮盖处理，适合轻量内容整理',
    subtitle: '快速处理图片角标或小面积水印区域。',
    summary: '当前提供水印位置遮挡预览，适合素材初筛和快速整理。',
    tips: [
      { label: '处理方式', value: '区域遮挡' },
      { label: '适合场景', value: '轻量预览' },
      { label: '输出结果', value: '预览效果' },
    ],
    steps: [
      { title: '选择图片', desc: '导入需要处理的图片。' },
      { title: '选择位置', desc: '指定水印更接近的区域位置。' },
      { title: '应用预览', desc: '快速预览遮挡后的呈现效果。' },
    ],
    mode: 'watermark',
  },
}

export const TOOL_LIST = Object.values(TOOL_MAP)

export const resolveToolId = (rawId?: string) => {
  if (!rawId) {
    return ''
  }

  return TOOL_ALIASES[rawId] || rawId
}

export const getToolById = (rawId?: string) => {
  const toolId = resolveToolId(rawId)
  return TOOL_MAP[toolId]
}

export const getToolCategoryCards = (): ToolCategoryCard[] =>
  TOOL_CATEGORIES
    .filter((category) => category.id !== 'all')
    .map((category) => {
      const tools = TOOL_LIST.filter((item) => item.categoryId === category.id)
      return {
        id: category.id,
        name: category.name,
        meta: `${tools.length} 个工具 · ${tools.map((item) => item.name).slice(0, 3).join(' / ')}`,
        imageUrl: tools[0]?.imageUrl || '',
      }
    })
