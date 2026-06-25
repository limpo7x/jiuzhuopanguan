# 聚会记录师 Clean-Room 功能矩阵

生成时间：2026-06-25

依据：PRD.md、miniprogram/app.json、docs/prototypes/party-recorder-static-pages/assets/pages-data.json、已注册页面源码事件。以下 0 字节文档不得作为完成证据：docs/business-flow.md、docs/party-recorder-redesign-requirements.md、docs/gameplay-moments-frontend-development-plan.md、docs/gameplay-moments-progress-tracker.md、docs/gameplay-moments-test-acceptance-plan.md、docs/gameplay-moments-ui-ux-development-plan.md、docs/gameplay-moments-development-spec.md。

| 注册页 | 页面 | 必保留功能 | 必保留事件 | 风险/状态合同 |
| --- | --- | --- | --- | --- |
| `pages/index/index` | 首页 | 创建聚会、有效进行中入口、最近相册、登录授权、底部导航 | handlePrimaryTap, handleContinueRecordTap, handleJoinByCodeTap, handleAlbumTap, handleTabTap, handleLoginSubmit | 无进行中聚会不展示继续卡；最近相册无真实图用新插画兜底 |
| `pages/create-session/index` | 创建聚会 | 聚会名预设、手动输入、人数步进、当前时间、高级设置禁用说明 | handleSessionNameInput, handlePresetTap, handlePlayerCountTap, handleNextTap, handleMoreTemplatesTap | 高级设置不可做伪入口 |
| `pages/invite-group/index` | 邀请好友 | 邀请码、成员头像槽、复制、刷新、分享、首拍入口、踢出确认 | handleCopyTap, handleRefreshTap, handleNextTap, handleKickTap | 成员未满展示空槽；踢出走 pp-dialog |
| `pages/moment-editor/index` | 首拍/照片记录 | 选择照片、上传状态、一句话说明、可见范围、授权四项、成员选择、提交 | handleChooseImage, handleCaptionInput, handleVisibilityTap, handleConsentTap, handleMemberTap, handleSubmitTap | 不提供仅自己选项；无图无说明不能提交 |
| `pages/waiting-room/index` | 等待开局 | 成员列表、空位、刷新、继续邀请、首拍前门禁、查看邀请卡 | handleRefreshTap, handleInviteTap, handleOpeningMomentTap, handleStartTap | 首拍前不能直接进入记录页 |
| `pages/live-record/index` | 进行中聚会 | 记录/相册/聚会账本/分享四分段、时间线、照片墙、账本确认、结束聚会 | handleSegmentTap, handleTimelineSelect, handleAdjustTap, handleConfirmLedgerTap, handleHighlightMomentTap, handleFinishTap | 分享未结束只解释入口；结束确认走 pp-dialog |
| `pages/ledger/index` | 独立账本 | 进行中聚会账本、发起人加减、参与者只读、确认写入时间线 | handleAdjustTap, handleConfirmTap, handleRecordTap, handleCreateTap | 无首拍证据时提示先拍第一张照片 |
| `pages/album/index` | 相册 | 全部/进行中/已结束筛选、封面、继续记录、待分享、分享图入口 | handleFilterTap, handleItemTap, handleNominateTap, handleCreateTap, handleBottomTabTap | 进行中数量必须按首拍证据判断 |
| `pages/session-brief/index` | 聚会简报 | 时间线、照片预览、账本摘要、推举资格、刷新 | handleRefreshTap, handleRankingTap, handleNominatePhotoTap, handlePreviewFirstImageTap, handleTimelineSelect | 不展示不可解释的审核伪状态 |
| `pages/share-preview/index` | 邀请/分享预览 | 口令状态、公开回忆、隐私说明、相册返回 | handleTabTap, handleRetryTap, handleReturnAlbumTap, handleBackTap | 未开通举报反馈只做说明，不做操作入口 |
| `pages/share-poster/index` | 分享图 | 权限态、任务态、时间线节点、保存、刷新、重试、小程序码 | handleSaveTap, handleTaskPrimaryTap, handlePermissionPrimaryTap, handlePermissionSecondaryTap, handleExitShareTap | 无权限/被踢出/未结束必须隐藏内容 |
| `pages/tools/index` | 工具箱 | 搜索、功能区、分类、热门工具、工具列表 | handleSearchInput, handleSearchClear, handleFeatureZoneTap, handleCategoryTap, handleToolTap, handleTabTap | 死入口必须显示不可用原因或不展示 |
| `pages/tool-detail/index` | 工具详情 | 文本/JSON/贷款/汇率/单位/二维码/图片工具表单与输出 | handleTextInput, handleFormatJson, handleLoanInput, handleGenerateShareCode, handleChooseImage, handleRunCompress | 保留现有工具表单和 canvas |
| `pages/rankings/index` | 今日回忆榜 | 分类榜单、照片预览、推举确认、空态、积分入口 | handleCategoryTap, handleNominateTap, handleImageTap, handleFeatureZoneTap, handleTabTap | 榜单围绕回忆，不恢复旧玩法主心智 |
| `pages/feature-zones/index` | 功能区 | 权益/会员/商户/积分/收藏/使用记录/邀请奖励/模板配置入口 | handleEntryTap, handleBackTap | 配置不足展示不可用原因，不伪造成功 |
| `pages/me/index` | 我的 | 统计、待分享回忆、分享图合集、更多服务、登录授权 | handleMePanelTap, handleAssetTap, handlePendingAlbumTap, handleShareGalleryTap, handleFeatureTap, handleLoginSubmit, handleTabTap | 已结束统计不得本地硬凑 |
| `pages/settings/index` | 设置 | 资料、隐私、通知、数据、安全相关设置项 | 仅静态展示或原页面未暴露事件 | 设置页为空数据也保持清楚空态 |
| `pages/friend-hub/index` | 我的聚友 | 好友输入、匹配列表、拍一拍、删除 | handleNewFriendInput, handlePokeTap, handleDeleteFriendTap | 不展示旧“酒友”语言 |
| `pages/invalid-state/index` | 无效/结束状态 | 查看相册、再开一场、隐私提示、快捷入口 | handleReportTap, handleRestartTap, handleQuickTap | 只展示安全可解释动作 |
| `pages/privacy-state/index` | 隐私状态 | 隐私/权限/不可见说明、主次动作 | handlePrimaryTap, handleSecondaryTap | 不泄露聚会内容 |
| `pages/compliance-guide/index` | 新手引导 | 合规提示、服务说明、确认进入 | handleConfirmTap | 理性聚会提示必须可见 |

## 弹层合同

| 场景 | 原业务入口 | 新视觉 |
| --- | --- | --- |
| 登录授权 | 首页、我的 authPanelVisible | pp-auth-panel |
| 确认结束聚会 | live-record wx.showModal | pp-dialog |
| 踢出成员 | invite-group wx.showModal | pp-dialog |
| 放弃编辑/返回 | moment-editor wx.showModal | pp-dialog |
| 推举确认 | rankings/session-brief wx.showModal | pp-dialog |
| 首拍前/口令异常 | index/waiting-room/create-session wx.showModal | pp-dialog |
| 保存/加载中 | wx.showLoading 或按钮状态 | pp-loading 或按钮 loading 文案 |

## 参考图

新的功能参考图保存在 docs/runtime/party-pop-clean-20260625/functional-reference-*.png。旧视觉草稿不作为功能依据。
