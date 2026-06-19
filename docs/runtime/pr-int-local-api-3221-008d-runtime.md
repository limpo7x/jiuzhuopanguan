# PR-INT-LOCAL-API-3221-008D-RUNTIME

## Scope

- Task: `PR-INT-LOCAL-API-3221-008D-RUNTIME`
- Environment: local only
- API base: `http://127.0.0.1:3221/api/v1`
- Workspace: `F:\codexlist\jiuzhuopanguan`
- Backend data store: `F:\codexlist\jiuzhuopanguan\backend\data`
- Online access: not executed
- Cleanup: not executed
- Full token policy: not printed; memberA token tail only.

## Runtime

Startup command:

```powershell
$env:PORT='3221'
Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' -ArgumentList '--prefix','backend','start' -WorkingDirectory 'F:\codexlist\jiuzhuopanguan' -RedirectStandardOutput 'docs/runtime/pr-int-local-api-3221-008d.out.log' -RedirectStandardError 'docs/runtime/pr-int-local-api-3221-008d.err.log' -WindowStyle Hidden
```

Runtime summary:

| Item | Value |
| --- | --- |
| Listen address | `::` |
| Port | `3221` |
| Owning PID | `30080` |
| Process | `node.exe` |
| Command line | `node server.js` |
| API base | `http://127.0.0.1:3221/api/v1` |
| stdout log | `docs/runtime/pr-int-local-api-3221-008d.out.log` |
| stderr log | `docs/runtime/pr-int-local-api-3221-008d.err.log` |

Log tail:

```text
jiuzhuopanguan backend listening on port 3221
```

## Token / Storage

Use memberA for 008D retest:

| Role | Profile ID | Token tail |
| --- | --- | --- |
| memberA | `user-1781756527691-ff0197` | `4ea6c85e` |

Required DevTools storage:

```text
runtime-api-base = http://127.0.0.1:3221/api/v1
jzp-user-token = <memberA-token-from-private-env>
social-current-profile-id = user-1781756527691-ff0197
```

Full token must be read from private/env only. Public logs may show only `4ea6c85e`.

## Read-Only API Checks

### `GET /api/v1/config/home`

| Field | Result |
| --- | --- |
| HTTP | `200` |
| code | `0` |
| quickTools | `4` |

### `GET /api/v1/briefs/brief-1781756527712-95eff999`

Authorization: memberA token tail `4ea6c85e`.

| Field | Result |
| --- | --- |
| HTTP | `200` |
| code | `0` |
| briefId | `brief-1781756527712-95eff999` |
| partyId | `session-1781756527692-d277f0` |
| photoHighlights | `2` |
| accountingHighlights | `4` |
| keyEvents | `2` |
| ledgerSummary | `entryCount=2`, `pendingCount=1`, `addedCount=1`, `hasLedgerData=true` |
| firstPhotoUrl | `/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` |

### `GET /api/v1/share-images/share-task-1781756527713-442cb75c`

Authorization: memberA token tail `4ea6c85e`.

| Field | Result |
| --- | --- |
| HTTP | `200` |
| code | `0` |
| shareImageId | `share-task-1781756527713-442cb75c` |
| status | `ready` |
| imageUrl | `/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png` |
| layoutMode | `party_story` |
| includeLedger | `true` |

### PNG `/uploads/moments/share-tasks/share-task-1781756527713-442cb75c.png`

| Method | Result |
| --- | --- |
| HEAD | `404`, `content-type=application/json; charset=utf-8` |
| GET | `200`, `content-type=image/png`, `byteLength=167268`, `pngSignature=89504e470d0a1a0a` |

Interpretation: PNG is reachable by GET. HEAD currently returns 404, so tests should not treat HEAD failure alone as PNG missing; record as backend static HEAD support gap if HEAD is required.

## Retest Page Queries

```text
/pages/session-brief/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999
/pages/share-poster/index?sessionId=session-1781756527692-d277f0&briefId=brief-1781756527712-95eff999&taskId=share-task-1781756527713-442cb75c
/pages/share-preview/index?shareId=share-return-session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999
/pages/live-record/index?sessionId=session-1781756527692-d277f0&role=member
/pages/ledger/index?partyId=session-1781756527692-d277f0&ledgerId=ledger-session-1781756527692-d277f0
/pages/album/index?partyId=session-1781756527692-d277f0&albumId=album-session-1781756527692-d277f0
```

## Warnings / Skipped

- This is local runtime readiness only; do not write page pass from API readability alone.
- No `api.pomer.cn` or `pomer.cn` access was executed.
- No cleanup was executed.
- HEAD for the PNG returns 404 while GET returns 200. If QA requires HEAD 200, return to backend/API for static HEAD support.
- Full token was read only inside local verification script; public output records token tail only.

## Cleanup / Stop Policy

This task did not stop PID `30080`, because QA needs `127.0.0.1:3221` for retest. If PM later asks to stop the local server:

```powershell
Stop-Process -Id 30080
```

Do not cleanup `prcs-008` unless PM explicitly assigns cleanup.
