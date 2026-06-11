const profile = {
  nickname: '',
  avatarUrl: '',
  points: 0,
}

const homeConfig = {
  hero: {
    title: '',
    subtitle: '',
    imageUrl: '',
    imageUploadEndpoint: '/api/v1/admin/upload/home-hero',
    imageUpdateEndpoint: '/api/v1/admin/config/home/hero',
  },
  quickTools: [],
  banner: {
    title: '',
    imageUrl: '',
  },
}

const getHomeConfig = () => homeConfig

const updateHomeHero = (payload = {}) => {
  homeConfig.hero = {
    ...homeConfig.hero,
    title: typeof payload.title === 'string' ? payload.title.trim() : homeConfig.hero.title,
    subtitle: typeof payload.subtitle === 'string' ? payload.subtitle.trim() : homeConfig.hero.subtitle,
    imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl.trim() : homeConfig.hero.imageUrl,
  }
  return homeConfig.hero
}

const compliance = {
  copy: '',
}

const toolHistory = []

module.exports = {
  compliance,
  getHomeConfig,
  profile,
  toolHistory,
  updateHomeHero,
}