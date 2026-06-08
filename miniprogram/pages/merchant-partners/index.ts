interface MerchantTile {
  iconClass: string
  name: string
  toneClass: string
}

interface MerchantShop {
  imageUrl: string
  meta: string
  name: string
}

interface MerchantPartnersState {
  categories: MerchantTile[]
  safeBack: MerchantTile[]
  shops: MerchantShop[]
}

interface MerchantPartnersMethods {}

Page<MerchantPartnersState, MerchantPartnersMethods>({
  data: {
    categories: [
      { name: '酒吧夜店', iconClass: 'merchant-icon-goblet', toneClass: '' },
      { name: 'KTV', iconClass: 'merchant-icon-mic', toneClass: 'merchant-tile-blue' },
      { name: '餐饮美食', iconClass: 'merchant-icon-food', toneClass: '' },
      { name: '桌游轰趴', iconClass: 'merchant-icon-briefcase', toneClass: '' },
    ],
    shops: [
      { name: '夜色 Livehouse', meta: '酒水 95 折 / 限量 8 折 · 1.2km', imageUrl: '/assets/home/party-hero.png' },
      { name: '胡桃里音乐酒馆', meta: '全单 88 折 · 1.8km', imageUrl: '/assets/home/toolbox-hero.png' },
      { name: '星聚会 KTV', meta: '小包 69 元起 · 2.1km', imageUrl: '/assets/home/report-poster.png' },
      { name: '桌面玩家 · 桌游馆', meta: '人均立减 20 元 · 2.3km', imageUrl: '/assets/home/image-process-hero.png' },
    ],
    safeBack: [
      { name: '代驾优惠券', iconClass: 'merchant-icon-taxi', toneClass: 'merchant-tile-blue' },
      { name: '满减出行券', iconClass: 'merchant-icon-coupon', toneClass: 'merchant-tile-green' },
      { name: '公交地铁指南', iconClass: 'merchant-icon-map', toneClass: '' },
    ],
  },
})

export {}
