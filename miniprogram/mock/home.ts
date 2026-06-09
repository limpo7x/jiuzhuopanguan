import { staticAsset } from '../config/assets'

const asset = (path: string): string => (path.startsWith('home/') ? staticAsset(path.replace(/^home\//, '')) : `/assets/${path}`)

export interface HomeHero {
  title: string
  subtitle: string
  imageUrl: string
  shareTitle: string
}

export interface QuickTool {
  id: string
  name: string
  iconClass: string
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
  points: 168,
  searchPlaceholder: '搜索工具或功能',
  hero: {
    title: '酒桌判官',
    subtitle: '欠酒互怼 · 整活不断 · 气氛拉满',
    imageUrl: asset('home/party-hero.png'),
    shareTitle: '酒桌判官：今晚这局谁先欠酒？',
  },
  quickTools: [
    {
      id: 'image-compress',
      name: '图片压缩',
      iconClass: 'icon-compress',
      toneClass: 'green',
    },
    {
      id: 'text-count',
      name: '文字计数',
      iconClass: 'icon-text',
      toneClass: '',
    },
    {
      id: 'qr-code',
      name: '二维码',
      iconClass: 'icon-qr',
      toneClass: '',
    },
    {
      id: 'loan-calc',
      name: '房贷计算',
      iconClass: 'icon-home',
      toneClass: '',
    },
  ],
  recentTools: [
    {
      id: 'nine-grid',
      name: '九宫格切图',
      usedAt: '刚刚使用',
      imageUrl: asset('home/image-process-hero.png'),
      badgeText: '常用',
      badgeClass: 'green',
    },
    {
      id: 'json',
      name: 'JSON格式化',
      usedAt: '1小时前',
      imageUrl: asset('home/toolbox-hero.png'),
      badgeText: '工具',
      badgeClass: '',
    },
    {
      id: 'watermark',
      name: '图片去水印',
      usedAt: '2小时前',
      imageUrl: asset('home/party-hero.png'),
      badgeText: '图片',
      badgeClass: '',
    },
  ],
  complianceCopy: '理性饮酒，适量饮酒，未成年人禁止饮酒。',
}
