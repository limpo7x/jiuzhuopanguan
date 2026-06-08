interface SettingItem {
  desc: string
  name: string
  value: string
}

interface SettingsState {
  items: SettingItem[]
}

interface SettingsMethods {}

Page<SettingsState, SettingsMethods>({
  data: {
    items: [
      { name: '消息提醒', desc: '酒局进度、成员加入、战报生成提醒', value: '已开启' },
      { name: '隐私设置', desc: '控制昵称、头像和战报公开范围', value: '好友可见' },
      { name: '内容偏好', desc: '屏蔽过于激进的惩罚和话题模板', value: '标准模式' },
      { name: '版本信息', desc: '当前预览版本 0.1.0', value: '检查更新' },
    ],
  },
})

export {}
