export interface HomeHero {
  title: string
  subtitle: string
  imageUrl: string
  shareTitle: string
}

export interface QuickTool {
  id: string
  imageUrl?: string
  name: string
  iconClass: string
  route?: string
  toneClass: string
}

export interface RecentTool {
  id: string
  name: string
  usedAt: string
  imageUrl: string
  badgeText: string
  badgeClass: string
  route?: string
}

export interface HomePageData {
  points: number
  searchPlaceholder: string
  hero: HomeHero
  quickTools: QuickTool[]
  recentTools: RecentTool[]
  complianceCopy: string
}

export const homePageMock: HomePageData = {
  points: 0,
  searchPlaceholder: '',
  hero: {
    title: '聚会记录师',
    subtitle: '轻松记录每一次聚会的美好时刻，三步创建房间并拍第一张照片。',
    imageUrl: 'https://cdn.pomer.cn/static/party-recorder/table-party-bg.jpg',
    shareTitle: '聚会记录师：一起记录今晚',
  },
  quickTools: [
    { id: 'create-session', iconClass: 'icon-flash', name: '创建聚会', route: '/pages/create-session/index', toneClass: '' },
    { id: 'ledger', iconClass: 'icon-home', name: '聚会账本', route: '/pages/ledger/index', toneClass: '' },
    { id: 'qr-code', iconClass: 'icon-qr', name: '口令二维码', route: '/pages/privacy-state/index?type=feature', toneClass: '' },
    { id: 'text-count', iconClass: 'icon-text', name: '分享文案', route: '/pages/privacy-state/index?type=feature', toneClass: 'green' },
  ],
  recentTools: [
    {
      id: 'last-party',
      name: '周五聚会相册',
      usedAt: '刚刚记录',
      imageUrl: 'https://cdn.pomer.cn/static/party-recorder/table-party-bg.jpg',
      badgeText: '相册',
      badgeClass: 'green',
      route: '/pages/album/index',
    },
    {
      id: 'recent-memory',
      name: '待补充记录',
      usedAt: '20 分钟前',
      imageUrl: '',
      badgeText: '记录',
      badgeClass: '',
      route: '/pages/album/index?mode=host',
    },
  ],
  complianceCopy: '记录聚会照片前，请确认已获得同行好友授权。',
}
