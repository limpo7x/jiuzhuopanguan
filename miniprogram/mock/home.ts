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
  points: 0,
  searchPlaceholder: '',
  hero: {
    title: '',
    subtitle: '',
    imageUrl: '',
    shareTitle: '',
  },
  quickTools: [],
  recentTools: [],
  complianceCopy: '',
}