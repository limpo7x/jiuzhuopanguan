{
  "taskId": "PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-006-RUN",
  "manifestId": "prcs-clean-slate-actual-prcs-006",
  "seed": "prcs-006",
  "generatedAt": "2026-06-18T03:24:26.752Z",
  "source": "local-clean-slate-actual-fixture",
  "tokenSource": "local-bindWechatUser",
  "undeployed": true,
  "privateManifest": {
    "pathHint": "%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-006-manifest.private.json",
    "contentPolicy": "private only; full tokens are not published"
  },
  "apiBase": {
    "local": "local JSON store via backend/scripts/manage-clean-slate-actual-fixture.js",
    "online": "not executed"
  },
  "profiles": {
    "host": {
      "role": "host",
      "profileId": "user-1781753066620-ec7977",
      "memberId": "member-user-1781753066620-ec7977",
      "permission": "host",
      "tokenTail": "a344ca32"
    },
    "memberA": {
      "role": "memberA",
      "profileId": "user-1781753066620-f2c625",
      "memberId": "member-user-1781753066620-f2c625",
      "permission": "member",
      "tokenTail": "12d644a0"
    },
    "memberB": {
      "role": "memberB",
      "profileId": "user-1781753066621-109af2",
      "memberId": "member-user-1781753066621-109af2",
      "permission": "member",
      "tokenTail": "5803654d"
    },
    "outsider": {
      "role": "outsider",
      "profileId": "user-1781753066621-e5338a",
      "permission": "outsider",
      "tokenTail": "4a136953"
    }
  },
  "party": {
    "partyId": "session-1781753066622-4b386b",
    "sessionId": "session-1781753066622-4b386b",
    "inviteCode": "YYRXUP",
    "title": "周末聚会记录",
    "status": "live",
    "visibility": "session",
    "memberCount": 3,
    "joinedCount": 3,
    "sourceMarker": "prcs-clean-slate-actual-prcs-006"
  },
  "album": {
    "albumId": "album-session-1781753066622-4b386b",
    "partyId": "session-1781753066622-4b386b",
    "photos": [
      {
        "photoId": "moment-1781753066633-f2834ef5",
        "momentId": "moment-1781753066633-f2834ef5",
        "photoType": "opening",
        "visibility": "share",
        "reviewStatus": "approved",
        "imageUrl": "/uploads/moments/session-1781753066622-4b386b/1781753066624-party-opening-92ada8.webp"
      },
      {
        "photoId": "moment-1781753066633-77ed7c40",
        "momentId": "moment-1781753066633-77ed7c40",
        "photoType": "highlight",
        "visibility": "share",
        "reviewStatus": "approved",
        "imageUrl": "/uploads/moments/session-1781753066622-4b386b/1781753066628-party-highlight-54d0c8.webp"
      }
    ],
    "filteredPhotoIds": [
      "moment-1781753066634-f6807165"
    ]
  },
  "ledger": {
    "ledgerId": "ledger-session-1781753066622-4b386b",
    "expenseItemIds": [
      "event-1781753066634-5c3bb5cf",
      "event-1781753066635-7c858ae1"
    ],
    "settlementId": "settlement-session-1781753066622-4b386b",
    "memberBalanceIds": [
      "user-1781753066620-ec7977",
      "user-1781753066620-f2c625",
      "user-1781753066621-109af2"
    ],
    "ledgerSummary": {
      "participantCount": 3,
      "entryCount": 2,
      "pendingCount": 1,
      "completedCount": 0,
      "addedCount": 1,
      "clearedCount": 0,
      "keyEventCount": 0,
      "hasLedgerData": true
    },
    "accountingHighlights": [
      {
        "type": "pending",
        "value": 1,
        "text": "待处理记录 1条"
      },
      {
        "type": "completed",
        "value": 0,
        "text": "暂无完成记录"
      },
      {
        "type": "added",
        "value": 1,
        "text": "加酒记录 1条"
      },
      {
        "type": "cleared",
        "value": 0,
        "text": "暂无已消记录"
      }
    ]
  },
  "brief": {
    "briefId": "brief-1781753066635-243583c1",
    "partyId": "session-1781753066622-4b386b",
    "title": "聚会时间线简报",
    "coverMode": "photo_wall",
    "photoHighlightsCount": 2,
    "accountingHighlightsCount": 4,
    "keyEventCount": 2,
    "settlementSummary": {
      "status": "open",
      "text": "本场已记录 2 条账本高光，还有 1 条待处理记录。"
    },
    "shareNotice": "仅展示已授权且审核通过的公开内容；私密、待审、待补图和未授权内容不会进入分享图。"
  },
  "shareImage": {
    "ready": {
      "taskId": "share-task-1781753066636-c3fc0fb3",
      "status": "ready",
      "layoutMode": "party_story",
      "includeLedger": true,
      "imageUrl": "/uploads/moments/share-tasks/share-task-1781753066636-c3fc0fb3.png",
      "imageSha256": "0607c4e9536a12cbf01878ef0eb2099b39bbdedbfff738a240dae73a18aff8cc",
      "imageSize": {
        "width": 900,
        "height": 1400
      },
      "returnShareId": "share-return-session-1781753066622-4b386b"
    },
    "failed": {
      "taskId": "share-task-1781753066749-c7c56b",
      "status": "failed",
      "layoutMode": "brief_story",
      "includeLedger": true,
      "imageUrl": "",
      "message": "分享图暂时生成失败，请稍后重试。",
      "returnShareId": "share-return-session-1781753066622-4b386b"
    }
  },
  "shareReturn": {
    "shareId": "share-return-session-1781753066622-4b386b",
    "inviteCode": "YYRXUP",
    "partyId": "session-1781753066622-4b386b",
    "briefId": "brief-1781753066635-243583c1",
    "payloadSummary": {
      "photoHighlightsCount": 2,
      "accountingHighlightsCount": 4,
      "ledgerEntryCount": 2,
      "keyEventCount": 2,
      "shareNotice": true
    }
  },
  "pageQueries": {
    "album": "/pages/album/index?partyId=session-1781753066622-4b386b&albumId=album-session-1781753066622-4b386b",
    "albumUnshared": "/pages/album/index?mode=unshared&partyId=session-1781753066622-4b386b&albumId=album-session-1781753066622-4b386b",
    "ledger": "/pages/ledger/index?partyId=session-1781753066622-4b386b&ledgerId=ledger-session-1781753066622-4b386b",
    "privacyFiltered": "/pages/privacy-state/index?type=filtered&partyId=session-1781753066622-4b386b&shareId=share-return-session-1781753066622-4b386b",
    "brief": "/pages/session-brief/index?sessionId=session-1781753066622-4b386b&briefId=brief-1781753066635-243583c1",
    "sharePosterReady": "/pages/share-poster/index?briefId=brief-1781753066635-243583c1&taskId=share-task-1781753066636-c3fc0fb3",
    "sharePosterFailed": "/pages/share-poster/index?briefId=brief-1781753066635-243583c1&taskId=share-task-1781753066749-c7c56b",
    "shareReturn": "/pages/share-preview/index?shareId=share-return-session-1781753066622-4b386b&inviteCode=YYRXUP&briefId=brief-1781753066635-243583c1"
  },
  "warnings": [
    "Generated with backend 006 local helper; undeployed=true.",
    "Full tokens are only in private manifest or local env.",
    "Fixture remains in local JSON store for frontend/QA rerun; cleanup not executed."
  ],
  "skipped": [
    "reviewCaseIds",
    "reportId",
    "outsider/no-token API negative checks",
    "api.pomer.cn online write/read proof"
  ],
  "cleanupPlan": {
    "inspectBeforeCleanup": "node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006",
    "cleanupActualFixture": "node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-006",
    "inspectAfterCleanup": "node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006",
    "optionalPrivateProfileCleanup": "node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-006"
  }
}
