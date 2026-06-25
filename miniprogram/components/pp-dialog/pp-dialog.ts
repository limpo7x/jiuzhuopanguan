Component({
  properties: {
    loading: {
      type: Object,
      value: {},
    },
    state: {
      type: Object,
      value: {},
    },
    toast: {
      type: Object,
      value: {},
    },
  },

  methods: {
    noop() {},
    handleCancel() {
      this.triggerEvent('cancel')
    },
    handleConfirm() {
      this.triggerEvent('confirm')
    },
  },
})
