# PR-INT-LINK-CLEANUP-DATA-008 Sanitized Summary

## Scope

- Seed: `prcs-008`
- Source: `backend/scripts/manage-clean-slate-actual-fixture.js`
- Environment: local JSON store
- Online write: not executed
- Private manifest: `%TEMP%/jiuzhuopanguan-private/pr-int-link-cleanup-PRCS-20260618-008-manifest.private.json`
- Token policy: full tokens stay in private manifest/local env; public docs show token tails only.

## Commands

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-008 --output $env:TEMP\jiuzhuopanguan-private\pr-int-link-cleanup-PRCS-20260618-008-manifest.private.json
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
```

## Token Tails

| Role | Profile ID | Permission | Token tail |
| --- | --- | --- | --- |
| host | `user-1781756527689-f2fbe0` | host | `20cf10b7` |
| memberA | `user-1781756527691-ff0197` | member | `4ea6c85e` |
| memberB | `user-1781756527691-ee3294` | member | `15b29b2c` |
| outsider | `user-1781756527692-596050` | outsider | `65792002` |

## Fixture IDs

| Area | ID / summary |
| --- | --- |
| party/session | `session-1781756527692-d277f0` |
| inviteCode | `E52MK5` |
| createdAt | `2026-06-18T04:22:07.692Z` |
| state/status | `进行中` / `live` |
| album | `album-session-1781756527692-d277f0` |
| first photo cover | `/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` |
| second photo | `/uploads/moments/session-1781756527692-d277f0/1781756527702-party-highlight-19e9f0.webp` |
| filtered/private photo | `moment-1781756527709-4710b3e9` |
| ledger | `ledger-session-1781756527692-d277f0` |
| raw ledger events | `drink_debt`, `drink_add` |
| clean ledger summary | `entryCount=2`, `pendingCount=1`, `addedCount=1`, `hasLedgerData=true` |
| brief | `brief-1781756527712-95eff999` |
| ready shareImage | `share-task-1781756527713-442cb75c`, PNG `900x1400`, sha256 `670fe376736b43f3ffd8e98d0ec33c18685c127341635e06ae265fa52a3392d0` |
| failed shareImage | `share-task-1781756527876-8bd75f`, message `分享图暂时生成失败，请稍后重试。` |
| share return | `share-return-session-1781756527692-d277f0` |

## 008 Coverage

| 008 requirement | Field / query |
| --- | --- |
| 首页最近相册封面取第一张上传照片 | Use `photoHighlights[0].imageUrl` / `album.firstPhoto.imageUrl`: `/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp`. |
| 真实欠酒/加酒账本数据 | Raw event types `drink_debt` and `drink_add`; clean summary maps to `pending=1`, `added=1`. |
| 创建时间 | Session `createdAt=2026-06-18T04:22:07.692Z`; share task `createdAt=2026-06-18T04:22:07.713Z`; brief `generatedAt=2026-06-18T04:22:07.875Z`. |
| 我创建的聚会简报图片 | `brief.photoHighlights[0].imageUrl` and `[1].imageUrl`; use host token tail `20cf10b7`. |
| 图片直显参与相册/简报/分享 | Same first/second photo URLs appear in album, brief photoHighlights and share return payload; ready PNG exists for share poster. |
| 工具箱接口 | `/pages/tools/index`; primary API `GET /tools/catalog`; usage APIs `/tools/history`, `/tools/usage-records`, `/tools/qr-code.png?text=...`; frontend has local fallback catalog. |
| 拍第一张后进入进行中 | Start `/pages/moment-editor/index?sessionId=session-1781756527692-d277f0&nodeType=opening`; expected post-save page `/pages/live-record/index?sessionId=session-1781756527692-d277f0`. |

## Page Queries

```text
/pages/index/index
/pages/moment-editor/index?sessionId=session-1781756527692-d277f0&nodeType=opening
/pages/live-record/index?sessionId=session-1781756527692-d277f0
/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=host
/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0
/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0
/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999
/pages/share-poster/index?briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c
/pages/share-poster/index?briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527876-8bd75f
/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999
/pages/tools/index
```

## Scan / Residual

`inspect --seed prcs-008` current counts:

| Metric | Count |
| --- | ---: |
| liveSessions | 1 |
| momentRecords | 3 |
| sessionEvents | 2 |
| sessionBriefs | 1 |
| shareImageTasks | 2 |
| uploadedAssets | 3 |
| photoFilesExisting | 3 |
| shareImageFilesExisting | 1 |

## Warnings / Skipped

- No separate backend 008 helper was found in local docs; this run uses backend 006 actual fixture helper to create a dedicated 008 seed.
- `party.payload.coverImageUrl` is empty. For 008 retest, use `photoHighlights[0].imageUrl` / `album.firstPhoto.imageUrl` as first-photo cover unless backend 008 returns a dedicated cover field.
- The helper still labels photos `reviewStatus=approved`; 4.2 direct-display acceptance should verify frontend no longer blocks uploaded images on manual review state.
- `undeployed=true`; this is local fixture evidence, not `api.pomer.cn` online acceptance.
- Skipped: online proof, `reviewCaseIds`, `reportId`, outsider/no-token API negative checks, no-photo default-cover sample.

## Cleanup Plan

Do not cleanup in this run. When PM assigns cleanup:

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-008
```

Only clean `seed=prcs-008`; do not clean 006/009/011/final/share samples unless PM separately assigns.
