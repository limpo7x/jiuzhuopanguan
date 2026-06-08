interface ToolConfig {
  heroImage: string
  summary: string
  subtitle: string
  tips: Array<{ label: string; value: string }>
  steps: Array<{ title: string; desc: string }>
}

interface ToolDetailState {
  heroImage: string
  summary: string
  subtitle: string
  tips: Array<{ label: string; value: string }>
  steps: Array<{ title: string; desc: string }>
  toolId: string
  toolName: string
}

interface ToolDetailMethods {
  handlePrimaryTap: () => void
  handleSecondaryTap: () => void
}

const DEFAULT_TOOL_CONFIG: ToolConfig = {
  heroImage: '/assets/home/toolbox-hero.png',
  subtitle: '实用工具随手开，用完即走。',
  summary: '支持快速处理常见的小任务，适合在聚会前后或日常场景里直接使用。',
  tips: [
    { label: '适合场景', value: '临时处理' },
    { label: '使用门槛', value: '零学习成本' },
    { label: '推荐方式', value: '单次即用' },
  ],
  steps: [
    { title: '选择输入内容', desc: '按当前页面提示放入文本、图片或参数。' },
    { title: '确认处理方式', desc: '根据常用模板直接执行，减少重复操作。' },
    { title: '保存结果', desc: '处理后的内容可进入最近使用和历史记录继续查看。' },
  ],
}

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  'image-compress': {
    heroImage: '/assets/home/image-process-hero.png',
    subtitle: '批量压缩图片，适合分享、上传和朋友圈场景。',
    summary: '支持在保证清晰度的前提下压缩体积，减少图片发送和上传等待时间。',
    tips: [
      { label: '压缩模式', value: '标准/高清' },
      { label: '输出形式', value: '覆盖或另存' },
      { label: '推荐用途', value: '群分享/活动海报' },
    ],
    steps: [
      { title: '选择图片', desc: '从相册或最近使用里选择要压缩的图片。' },
      { title: '设置尺寸质量', desc: '根据用途选择清晰优先或体积优先。' },
      { title: '导出分享', desc: '压缩后可直接保存或继续分享到群。' },
    ],
  },
  'text-count': {
    heroImage: '/assets/home/toolbox-hero.png',
    subtitle: '实时统计字数、段落、空格和标点。',
    summary: '适合文案校对、投稿检查和日常输入统计，打开即用。',
    tips: [
      { label: '统计内容', value: '字数/段落/空格' },
      { label: '输入方式', value: '粘贴文本' },
      { label: '推荐场景', value: '文案检查' },
    ],
    steps: [
      { title: '粘贴文本', desc: '把要统计的文案直接贴入输入区。' },
      { title: '查看结果', desc: '页面会实时计算字数、行数和段落数。' },
      { title: '继续调整', desc: '按照限制要求删改文案后再复核。' },
    ],
  },
  'qr-code': {
    heroImage: '/assets/home/report-poster.png',
    subtitle: '快速生成分享二维码或活动口令码。',
    summary: '适合酒局口令、群邀请、活动海报等轻量传播场景。',
    tips: [
      { label: '生成对象', value: '链接/文本/口令' },
      { label: '输出样式', value: '纯净码图' },
      { label: '推荐搭配', value: '分享海报' },
    ],
    steps: [
      { title: '输入内容', desc: '放入链接、活动说明或加入口令。' },
      { title: '生成二维码', desc: '系统按当前样式直接输出码图。' },
      { title: '保存海报', desc: '可配合战报或邀请页一起分享。' },
    ],
  },
  'loan-calc': {
    heroImage: '/assets/home/report-poster.png',
    subtitle: '按月供、总利息和还款计划快速试算。',
    summary: '适合日常购房测算，输入总价、首付和年限后即可查看结果。',
    tips: [
      { label: '支持方式', value: '等额本息' },
      { label: '常见用途', value: '预算试算' },
      { label: '推荐输出', value: '月供概览' },
    ],
    steps: [
      { title: '输入贷款信息', desc: '填写总额、利率和年限等基础信息。' },
      { title: '生成试算结果', desc: '自动展示月供、总利息和总还款。' },
      { title: '对比方案', desc: '可重复调整参数做多方案比较。' },
    ],
  },
  'nine-grid': {
    heroImage: '/assets/home/image-process-hero.png',
    subtitle: '一张图自动切成九宫格，适合朋友圈排版。',
    summary: '支持快速分割、导出和检查边缘位置，减少手动裁剪。',
    tips: [
      { label: '输出规格', value: '3x3 九宫格' },
      { label: '推荐素材', value: '封面大图' },
      { label: '常见用途', value: '朋友圈排版' },
    ],
    steps: [
      { title: '上传原图', desc: '选择一张需要切割的大图。' },
      { title: '预览切分线', desc: '检查重点内容是否落在安全区域。' },
      { title: '保存全部', desc: '一次导出九张图，直接使用。' },
    ],
  },
  'watermark': {
    heroImage: '/assets/home/party-hero.png',
    subtitle: '快速去水印并保留主体区域。',
    summary: '适合素材整理和二次制作前的初步清理，减少重复修图成本。',
    tips: [
      { label: '处理方式', value: '框选修补' },
      { label: '输出模式', value: '即时预览' },
      { label: '推荐场景', value: '素材清理' },
    ],
    steps: [
      { title: '选择图片', desc: '导入需要处理的图片素材。' },
      { title: '圈定区域', desc: '标记水印所在位置进行清理。' },
      { title: '导出结果', desc: '保存处理后的图片继续编辑。' },
    ],
  },
  json: {
    heroImage: '/assets/home/toolbox-hero.png',
    subtitle: 'JSON 一键格式化，便于阅读和调试。',
    summary: '适合开发调试和接口联调时使用，贴入内容即可自动整理结构。',
    tips: [
      { label: '适合对象', value: '接口数据' },
      { label: '使用方式', value: '粘贴后整理' },
      { label: '推荐搭配', value: '开发工具' },
    ],
    steps: [
      { title: '粘贴 JSON', desc: '复制原始内容后直接贴入输入区。' },
      { title: '自动排版', desc: '系统按标准缩进输出整齐结构。' },
      { title: '复制继续使用', desc: '可直接复制到接口文档或代码中。' },
    ],
  },
  image: {
    heroImage: '/assets/home/image-process-hero.png',
    subtitle: '图片工具合集，覆盖压缩、裁剪和格式转换。',
    summary: '把高频图像处理能力汇总在一个入口里，适合日常快速处理。',
    tips: [
      { label: '工具数量', value: '12 个' },
      { label: '主要用途', value: '内容发布' },
      { label: '推荐用户', value: '运营/设计' },
    ],
    steps: [
      { title: '选择工具方向', desc: '先确定是压缩、切图还是去水印。' },
      { title: '处理素材', desc: '进入对应能力进行快速处理。' },
      { title: '保存结果', desc: '输出结果会进入最近使用。' },
    ],
  },
  dev: {
    heroImage: '/assets/home/toolbox-hero.png',
    subtitle: '开发常用小工具集合，一页集中打开。',
    summary: '覆盖 JSON、编码解码和文本处理等高频需求，适合联调时快速调用。',
    tips: [
      { label: '工具数量', value: '16 个' },
      { label: '主要用途', value: '联调与排错' },
      { label: '推荐用户', value: '前后端开发' },
    ],
    steps: [
      { title: '选择能力', desc: '根据当前工作进入 JSON、编码或文本模块。' },
      { title: '输入原始内容', desc: '贴入需要处理的数据或文本。' },
      { title: '输出结果', desc: '复制处理结果继续开发工作。' },
    ],
  },
}

const decodeParam = (value?: string): string => {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

Page<ToolDetailState, ToolDetailMethods>({
  data: {
    toolId: '',
    toolName: '工具详情',
    heroImage: DEFAULT_TOOL_CONFIG.heroImage,
    subtitle: DEFAULT_TOOL_CONFIG.subtitle,
    summary: DEFAULT_TOOL_CONFIG.summary,
    tips: DEFAULT_TOOL_CONFIG.tips,
    steps: DEFAULT_TOOL_CONFIG.steps,
  },

  onLoad(query) {
    const toolId = decodeParam(query?.id)
    const toolName = decodeParam(query?.name) || '工具详情'
    const config = TOOL_CONFIGS[toolId] || TOOL_CONFIGS[toolName] || DEFAULT_TOOL_CONFIG

    this.setData({
      toolId,
      toolName,
      heroImage: config.heroImage,
      subtitle: config.subtitle,
      summary: config.summary,
      tips: config.tips,
      steps: config.steps,
    })
  },

  handlePrimaryTap() {
    wx.navigateTo({
      url: '/pages/usage-history/index',
    })
  },

  handleSecondaryTap() {
    wx.navigateTo({
      url: '/pages/tools/index',
    })
  },
})

export {}
