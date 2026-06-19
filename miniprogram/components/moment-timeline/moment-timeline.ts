Component({
  properties: {
    emptyText: {
      type: String,
      value: '还没有精彩瞬间',
    },
    loading: {
      type: Boolean,
      value: false,
    },
    nodes: {
      type: Array,
      value: [],
    },
  },
  methods: {
    handleSelect(event: WechatMiniprogram.CustomEvent<{ id: string; nodeKind: string }>) {
      this.triggerEvent('select', event.detail)
    },
  },
})

export {}
