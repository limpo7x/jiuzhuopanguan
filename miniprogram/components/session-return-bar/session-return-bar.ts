Component({
  properties: {
    meta: {
      type: String,
      value: '',
    },
    status: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    visible: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    handleTap() {
      this.triggerEvent('open')
    },
  },
})

export {}
