const asset = (name) => `/static/${name}`

const profile = {
  nickname: '酒局发起人',
  avatarUrl: asset('avatar-host.png'),
  city: '上海',
  points: 168,
}

const homeConfig = {
  hero: {
    title: '酒桌判官',
    subtitle: '欠酒互怼 · 整活不断 · 气氛拉满',
    imageUrl: asset('party-hero.png'),
    imageUploadEndpoint: '/api/v1/admin/upload/home-hero',
    imageUpdateEndpoint: '/api/v1/admin/config/home/hero',
  },
  quickTools: [
    { id: 'image-compress', name: '图片压缩' },
    { id: 'text-count', name: '文字计数' },
    { id: 'qr-code', name: '二维码' },
    { id: 'loan-calc', name: '房贷计算' },
  ],
  banner: {
    title: '签到拿积分',
    imageUrl: asset('points-gift.png'),
  },
}

const getHomeConfig = () => homeConfig

const updateHomeHero = (payload = {}) => {
  const nextHero = { ...homeConfig.hero }

  if (typeof payload.title === 'string' && payload.title.trim()) {
    nextHero.title = payload.title.trim()
  }

  if (typeof payload.subtitle === 'string' && payload.subtitle.trim()) {
    nextHero.subtitle = payload.subtitle.trim()
  }

  if (typeof payload.imageUrl === 'string' && payload.imageUrl.trim()) {
    nextHero.imageUrl = payload.imageUrl.trim()
  }

  homeConfig.hero = nextHero
  return nextHero
}

const compliance = {
  copy: '理性饮酒，适量饮酒，未成年人禁止饮酒。',
}

const toolHistory = [
  { id: 'tool-1', name: '图片去水印', category: '图片工具', usedAt: '今天 18:30' },
  { id: 'tool-2', name: 'JSON 格式化', category: '开发工具', usedAt: '今天 15:08' },
  { id: 'tool-3', name: '汇率换算', category: '计算工具', usedAt: '昨天 22:10' },
]

module.exports = {
  compliance,
  getHomeConfig,
  profile,
  toolHistory,
  updateHomeHero,
}
