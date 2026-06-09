import { getManagedMerchantCatalog } from '../../services/operations'

interface MerchantTile {
  iconClass: string
  name: string
  toneClass: string
}

interface MerchantShop {
  id: string
  imageUrl: string
  meta: string
  name: string
  status: string
}

interface MerchantPartnersState {
  categories: MerchantTile[]
  notice: string
  safeBack: MerchantTile[]
  shops: MerchantShop[]
}

interface MerchantPartnersMethods {}

Page<MerchantPartnersState, MerchantPartnersMethods>({
  data: {
    categories: [],
    notice: '',
    safeBack: [],
    shops: [],
  },

  async onLoad() {
    try {
      const catalog = await getManagedMerchantCatalog()
      this.setData({
        categories: catalog.categories,
        notice: catalog.notice,
        safeBack: catalog.safeBack,
        shops: catalog.shops,
      })
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '商户数据加载失败',
        icon: 'none',
      })
    }
  },
})

export {}
