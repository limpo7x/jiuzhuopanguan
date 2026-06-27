Component({
  properties: {
    loading: {
      type: null,
      value: null,
    },
    state: {
      type: null,
      value: null,
    },
    toast: {
      type: null,
      value: null,
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
