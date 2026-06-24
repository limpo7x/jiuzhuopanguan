import {
  getMembershipCatalog,
  getPointsConfig,
  getTemplateConfigFast,
  getUserCommerceState,
  type MembershipCatalog,
  type PointsConfig,
  type TemplateConfig,
  type UserCommerceState,
} from '../../services/content'
import { getUserFavorites, getUserFeatureZones, getUserUsageRecords, type FeatureZoneRecord } from '../../services/featureZones'
import { getManagedMerchantCatalog, type ManagedMerchantCatalog } from '../../services/operations'

type FeatureZoneKey = 'benefits' | 'membership' | 'merchants' | 'points' | 'favorites' | 'usage' | 'invite' | 'templates'

interface FeatureZoneEntry {
  actionLabel: string
  disabled: boolean
  meta: string
  route: string
  tag: string
  title: string
}

interface FeatureZoneState {
  actionHint: string
  entries: FeatureZoneEntry[]
  errorText: string
  loading: boolean
  loginRequired: boolean
  primaryLabel: string
  primaryDisabled: boolean
  summaryCards: FeatureZoneEntry[]
  subtitle: string
  title: string
  zone: FeatureZoneKey
}

interface FeatureZoneMethods {
  handleBackTap: () => void
  handleEntryTap: (event: WechatMiniprogram.BaseEvent) => void
  loadZone: () => Promise<void>
  showToast: (message: string) => void
}

const zoneTitles: Record<FeatureZoneKey, { title: string; subtitle: string }> = {
  benefits: { title: '我的权益', subtitle: '按真实权益、会员和奖励状态展示，不生成假权益。' },
  membership: { title: '用户权益与会员', subtitle: '会员能力以后台开关和目录配置为准。' },
  merchants: { title: '合作优惠', subtitle: '展示已配置商户内容，领取和核销待后台闭环。' },
  points: { title: '积分与奖励', subtitle: '读取真实积分、任务和奖励配置，写入动作不冒充成功。' },
  favorites: { title: '我的收藏', subtitle: '收藏内容接入新路径，旧历史页不再作为入口。' },
  usage: { title: '使用记录', subtitle: '只展示已归属当前用户的工具和内容记录。' },
  invite: { title: '邀请奖励', subtitle: '邀请奖励需后端结构化配置，未配置时显示待开通。' },
  templates: { title: '模板中心', subtitle: '主题模板按真实配置和解锁状态展示。' },
}

const normalizeZone = (value?: string): FeatureZoneKey =>
  value && value in zoneTitles ? (value as FeatureZoneKey) : 'benefits'

const cleanFeatureText = (value?: string) =>
  String(value || '')
    .replace(/酒桌判官/g, '聚会记录师')
    .replace(/酒局/g, '聚会')
    .replace(/战报/g, '分享图')
    .replace(/判官/g, '记录者')
    .replace(/欠酒|惩罚/g, '聚会账本')
    .trim()

const unwrapItems = (value: unknown): FeatureZoneRecord[] => {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: FeatureZoneRecord[] }).items
  }
  return []
}

const entry = (title: string, meta: string, tag = '', disabled = true, actionLabel = '查看', route = ''): FeatureZoneEntry => ({
  actionLabel,
  disabled,
  meta,
  route,
  tag,
  title: cleanFeatureText(title),
})

const entriesFromRecords = (records: FeatureZoneRecord[], emptyMeta: string) =>
  records.map((item) =>
    entry(item.title || item.name || '未命名记录', item.meta || item.status || item.updatedAt || item.createdAt || emptyMeta, item.tag || item.type || '', !item.route, item.route ? '打开' : '查看', item.route || ''),
  )

const buildBenefits = async () => {
  const [commerce, membership] = await Promise.all([
    getUserCommerceState().catch(() => null),
    getMembershipCatalog().catch(() => null),
  ])
  const summaryCards: FeatureZoneEntry[] = []
  const entries: FeatureZoneEntry[] = []
  if (commerce) {
    summaryCards.push(entry('当前积分', `${commerce.points || 0} 分`, '积分', false, '查看'))
    summaryCards.push(entry('可用模板', `${commerce.unlockedTemplateIds?.length || 0} 个已解锁`, '模板', false, '查看'))
  }
  if (membership) {
    summaryCards.push(entry('会员状态', membership.membershipEnabled ? (membership.membership?.active ? '已开通' : '未开通') : '暂未开放', '会员', !membership.membershipEnabled, membership.membershipEnabled ? '查看' : '待开通'))
    entries.push(...membership.benefits.map((item) => entry(item.name, item.note || item.status || '权益配置来自后台', item.scope || '权益', item.status !== 'active', item.status === 'active' ? '查看' : '待配置')))
  }
  return { entries, summaryCards }
}

const buildMembership = (catalog: MembershipCatalog) => ({
  entries: catalog.plans.map((item) => entry(item.name, `${item.duration || '有效期待配置'} · ${item.price || '价格待配置'}`, item.status || '会员', !catalog.membershipEnabled || item.status !== 'active', catalog.membershipEnabled ? '查看' : '暂未开放')),
  summaryCards: catalog.benefits.map((item) => entry(item.name, item.note || item.status || '权益配置来自后台', item.scope || '权益', item.status !== 'active', item.status === 'active' ? '查看' : '待配置')),
})

const buildMerchants = (catalog: ManagedMerchantCatalog) => ({
  entries: catalog.shops.map((item) => entry(item.name, item.meta || item.status || '合作优惠配置来自后台', item.status || '商户', true, '核销待配置')),
  summaryCards: catalog.categories.map((item) => entry(item.name, item.toneClass || '合作分类', '分类', false, '查看')),
})

const buildPoints = (config: PointsConfig, commerce: UserCommerceState | null) => ({
  entries: [
    ...config.tasks.map((item) => entry(item.title, `奖励 ${item.value || 0} 积分`, '任务', true, '领取待联调')),
    ...config.rewards.map((item) => entry(item.title, item.subtitle || `消耗 ${item.cost || 0} 积分`, '奖励', true, '兑换待联调')),
  ],
  summaryCards: [
    entry('积分余额', `${commerce?.points || config.balance || 0} 分`, '积分', false, '查看'),
    entry('积分流水', `${commerce?.pointsLedger?.length || 0} 条记录`, '流水', false, '查看'),
  ],
})

const buildTemplates = (config: TemplateConfig, commerce: UserCommerceState | null) => ({
  entries: config.templates.map((item) => {
    const unlocked = !item.cost || commerce?.unlockedTemplateIds?.includes(item.id)
    return entry(item.title, item.meta || (item.cost ? `${item.cost} 积分` : '免费模板'), item.filterId || '模板', !unlocked, unlocked ? '查看' : '解锁待联调')
  }),
  summaryCards: [
    entry('模板总数', `${config.templates.length} 个`, '模板', false, '查看'),
    entry('已解锁', `${commerce?.unlockedTemplateIds?.length || config.templates.filter((item) => !item.cost).length} 个`, '权益', false, '查看'),
  ],
})

const defaultStateForZone = (zone: FeatureZoneKey) => ({
  ...zoneTitles[zone],
  actionHint: '',
  entries: [],
  errorText: '',
  loading: true,
  loginRequired: false,
  primaryDisabled: true,
  primaryLabel: '仅展示真实状态',
  summaryCards: [],
  zone,
})

Page<FeatureZoneState, FeatureZoneMethods>({
  data: defaultStateForZone('benefits'),

  async onLoad(query) {
    const zone = normalizeZone(typeof query?.zone === 'string' ? query.zone : '')
    this.setData(defaultStateForZone(zone))
    await this.loadZone()
  },

  async loadZone() {
    const { zone } = this.data
    this.setData({ errorText: '', loading: true })

    try {
      let entries: FeatureZoneEntry[] = []
      let summaryCards: FeatureZoneEntry[] = []
      let actionHint = '写入动作需接口、流水和后台配置闭环后再开放。'

      if (zone === 'benefits') {
        const result = await buildBenefits()
        entries = result.entries
        summaryCards = result.summaryCards
      } else if (zone === 'membership') {
        const result = buildMembership(await getMembershipCatalog())
        entries = result.entries
        summaryCards = result.summaryCards
        actionHint = '会员开通和权益使用以后台开关为准，关闭时不展示成功动作。'
      } else if (zone === 'merchants') {
        const result = buildMerchants(await getManagedMerchantCatalog())
        entries = result.entries
        summaryCards = result.summaryCards
        actionHint = '商户领取、核销和报表仍待后台动作页闭环。'
      } else if (zone === 'points') {
        const [config, commerce] = await Promise.all([getPointsConfig(), getUserCommerceState().catch(() => null)])
        const result = buildPoints(config, commerce)
        entries = result.entries
        summaryCards = result.summaryCards
      } else if (zone === 'favorites') {
        entries = entriesFromRecords(unwrapItems(await getUserFavorites()), '收藏记录')
        actionHint = '收藏新增和移除需前端具体业务入口接入后开放。'
      } else if (zone === 'usage') {
        entries = entriesFromRecords(unwrapItems(await getUserUsageRecords()), '使用记录')
        actionHint = '只展示新路径记录，旧历史页不作为入口。'
      } else if (zone === 'invite') {
        const aggregate = await getUserFeatureZones().catch(() => null)
        entries = entriesFromRecords(unwrapItems(aggregate?.inviteRewards), '邀请奖励')
        actionHint = entries.length ? '奖励领取动作待后台配置和流水证据闭环。' : '邀请奖励配置未闭环，当前仅展示待开通状态。'
      } else if (zone === 'templates') {
        const [config, commerce] = await Promise.all([getTemplateConfigFast(), getUserCommerceState().catch(() => null)])
        const result = buildTemplates(config, commerce)
        entries = result.entries
        summaryCards = result.summaryCards
      }

      this.setData({
        actionHint,
        entries,
        errorText: '',
        loading: false,
        loginRequired: false,
        primaryDisabled: true,
        summaryCards,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '功能区暂时不可用'
      this.setData({
        actionHint: /登录/.test(message) ? '登录后可查看该功能区的个人数据。' : '该功能区依赖接口或后台配置，当前按不可用状态展示。',
        entries: [],
        errorText: message,
        loading: false,
        loginRequired: /登录/.test(message),
        primaryDisabled: true,
        summaryCards: [],
      })
    }
  },

  handleEntryTap(event) {
    const { disabled, route, title } = event.currentTarget.dataset as { disabled?: boolean | string; route?: string; title?: string }
    const isDisabled = disabled === true || disabled === 'true'
    if (isDisabled || !route) {
      this.showToast(title ? `${title} 当前不可用` : '当前不可用')
      return
    }
    wx.navigateTo({
      url: route,
      fail: () => this.showToast('入口暂时不可达'),
    })
  },

  handleBackTap() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/me/index' }),
    })
  },

  showToast(message) {
    wx.showToast({ title: message, icon: 'none' })
  },
})
