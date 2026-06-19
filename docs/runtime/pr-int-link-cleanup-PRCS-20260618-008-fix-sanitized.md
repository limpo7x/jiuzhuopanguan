# PR-INT-LINK-CLEANUP-DATA-008-FIX Sanitized Evidence

## Scope

- Task: `PR-INT-LINK-CLEANUP-DATA-008-FIX`
- Environment: local JSON store only
- Online write/read: not executed
- Cleanup: not executed
- Private token policy: full tokens are not available in this public evidence; use private/env only in QA window.

## Reported DevTools Failure

| Page | Query from frontend 14.52 | Reported result |
| --- | --- | --- |
| session brief | `/pages/session-brief/index?briefId=brief-1781756527712-95eff999` | `errorText=brief not found`, `timelineNodes=[]` |
| share poster | `/pages/share-poster/index?briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c` | `shareTask.status=failed`, `failedReason=分享图暂时无法展示，请稍后重试`, `photoHighlights=[]`, `accountingHighlights=[]`, `keyEvents=[]`, `readyShareImageUrl=""` |

## Root Cause

The `prcs-008` fixture still exists in the local JSON store. The failure is not caused by fixture cleanup.

Primary causes:

1. The 008 sample is local-only (`undeployed=true`). DevTools must point to a local backend that reads the same JSON store. If it uses `https://api.pomer.cn/api/v1`, the local `brief-1781756527712-95eff999` will not exist and returns `brief not found`.
2. The brief query used by frontend 14.52 omitted `sessionId`. Use the full query below so page state has both IDs.
3. The clean aggregated contract is exposed by clean facade routes:
   - `GET /api/v1/briefs/brief-1781756527712-95eff999`
   - `GET /api/v1/share-images/share-task-1781756527713-442cb75c`
   The legacy/raw routes still exist:
   - `GET /api/v1/session-briefs/brief-1781756527712-95eff999`
   - `GET /api/v1/share-image-tasks/share-task-1781756527713-442cb75c`
   Raw routes can be used for legacy task status, but they are not the source of the clean `photoHighlights/accountingHighlights/keyEvents` contract.

## Read-Only Verification

Commands executed:

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node -e "<local data function verification, profileId only>"
```

Inspect summary:

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

Local memberA raw contract check:

| Field | Result |
| --- | --- |
| member profile | `user-1781756527691-ff0197` |
| member token tail | `4ea6c85e` |
| raw brief id | `brief-1781756527712-95eff999` |
| raw brief sessionId | `session-1781756527692-d277f0` |
| raw timeline nodes | `5` |
| raw share task id | `share-task-1781756527713-442cb75c` |
| raw share task status | `ready` |
| raw imageUrl | `/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` |

Local clean facade contract check:

| Field | Result |
| --- | --- |
| clean brief id | `brief-1781756527712-95eff999` |
| partyId | `session-1781756527692-d277f0` |
| photoHighlights | `2` |
| accountingHighlights | `4` |
| keyEvents | `2` |
| ledgerSummary | `entryCount=2`, `pendingCount=1`, `addedCount=1`, `hasLedgerData=true` |
| clean share image id | `share-task-1781756527713-442cb75c` |
| clean share image status | `ready` |
| clean share image url | `/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` |
| clean share image layoutMode | `party_story` |

## Retest Package

Use local API base that reads this workspace store. If QA starts backend on port `3221`, set:

```text
runtime-api-base = http://127.0.0.1:3221/api/v1
```

Storage/token precondition:

| Role | Profile ID | Token tail |
| --- | --- | --- |
| host | `user-1781756527689-f2fbe0` | `20cf10b7` |
| memberA | `user-1781756527691-ff0197` | `4ea6c85e` |
| memberB | `user-1781756527691-ee3294` | `15b29b2c` |
| outsider | `user-1781756527692-596050` | `65792002` |

Full tokens must be injected from private/env only. Public logs may print only token tails.

Recommended page queries:

```text
/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999
/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c
/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999
/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0
/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0
```

Recommended clean facade read checks if the local backend is running:

```powershell
curl.exe -H "Authorization: Bearer <memberA-token-from-private-env>" http://127.0.0.1:3221/api/v1/briefs/brief-1781756527712-95eff999
curl.exe -H "Authorization: Bearer <memberA-token-from-private-env>" http://127.0.0.1:3221/api/v1/share-images/share-task-1781756527713-442cb75c
```

## Warnings / Skipped

- Private manifest file was not available in `%TEMP%` during FIX verification, so this run did not reprint or rederive full tokens. Use the existing private/env handoff only.
- No `api.pomer.cn` read/write was executed. No `pomer.cn` operation was executed.
- No cleanup was executed.
- No DevTools command was executed in this FIX because PM asked to avoid approval-blocking work; frontend 14.52 failure text is recorded from PM dispatch.
- If frontend continues to call raw `/session-briefs/:id` and `/share-image-tasks/:id`, it may not receive the clean facade aggregate fields. Frontend/API need to align on either clean facade routes or raw route field parity.

## Cleanup Plan

Do not cleanup in this task. When PM explicitly assigns cleanup:

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-008
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008
```

Only clean `seed=prcs-008`; do not clean 006/009/011/final/share samples unless PM separately assigns.
