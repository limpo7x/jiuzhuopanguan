# PR-INT Clean Slate Manifest Sanitized Summary

- batch: `PRCS-20260618-003`
- product: `party-recorder`
- status: `partial-scan-before-only`
- source: local `node backend/scripts/smoke-clean-slate-phase1.js`
- private manifest: `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest.private.json` not created
- scan-before evidence: `docs/runtime/pr-int-clean-slate-PRCS-20260618-003-scan-before.json`
- cleanup: not run

## Profiles

| role | profileId | tokenTail | note |
| --- | --- | --- | --- |
| host | `user-1781507686650-a33705` | empty | token not read |
| memberA | `user-1781507686651-a46952` | empty | token not read |
| memberB | `user-1781507686651-000860` | empty | token not read |
| outsider | empty | empty | missing negative-case identity |

## Primary IDs

| type | id | note |
| --- | --- | --- |
| party/session | `session-1781507687012-e4343d` | local facade maps old session as party |
| inviteCode | `C56EVT` | local old fixture |
| brief | `brief-1781507687042-d1990edd` | local old fixture |
| photo | `moment-1781507687032-eb1806a4` | visible opening node |
| photo | `moment-1781507687039-ee0677bb` | baseline photo seed, filtered by share rules |
| ledger event | `event-1781507687041-e380feb7` | legacy `drink_debt` event type |
| share task | `share-task-it-moments-20260615-expired` | expired old task, not clean ready PNG |
| report | `moment-report-it-moments-20260615` | old report sample |

## Field Coverage

| domain | covered | missing |
| --- | --- | --- |
| party facade | `partyId,sessionId,inviteCode,members,photoHighlights,ledgerSummary,eventHighlights,shareContentFilter,visibleNodeIds,filteredNodeIds,permissionState` | new PRCS IDs, clean tokens |
| brief facade | `briefId,timeline,accountingHighlights,ledgerSummary,settlementSummary,eventHighlights,shareContentFilter` | `albumSummary`, non-empty `photoHighlights` |
| share facade | `taskId,status,layoutMode` | ready `imageUrl`, `imageSha256`, `imageSize`, `returnShareId` |
| moderation | `reportId` | `reviewCaseIds`, outsider/no-token proof |

## Frontend Queries From 14.46

| page | query |
| --- | --- |
| album | `/pages/album/index` |
| album unshared | `/pages/album/index?mode=unshared` |
| ledger | `/pages/ledger/index` |
| privacy filtered | `/pages/privacy-state/index?type=filtered` |

## Warnings

- The smoke passed, but it is explicitly `undeployed=true`.
- The source data still includes legacy `IT-MOMENTS`, `drink_debt`, and `share-task-it-moments-20260615-expired`.
- This is a sanitized scan-before summary, not a clean actual fixture pass.
- No cleanup was executed and no full token was read or written.
