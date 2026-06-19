# PR-INT 008AD Ledger Forbidden Host Auth Check

Task: `PR-INT-LINK-CLEANUP-008AD-LEDGER-FORBIDDEN-HOST-AUTH-CHECK`

Checked at: 2026-06-19

Scope:

- Read only local `127.0.0.1:3221` / jiuzhuopanguan data.
- No DevTools, no online write, no cleanup.
- No `PUT /sessions/:sessionId` was executed.
- Full tokens were read only from local store for identity mapping; public log keeps token tails only.

## Read Scope

QA row:

- `docs/gameplay-moments-test-acceptance-plan.md` 13.16.96 ledger section

Dispatch rows:

- `docs/runtime/ai-thread-dispatch-queue.md` 008AA / 008AD

Confirmed context:

- QA 13.16.96 opened `/pages/ledger/index?sessionId=session-1781787045680-8e406c&role=judge`.
- Page data showed `ledgerEditable=true`, `isJudge=true`, `stats=[成员 3, 欠酒 1, 加酒 1]`, but QA did not click `+/-` in that run.
- User screenshot later shows `forbidden` toast after clicking ledger `+/-`.

## Sample Identity

| Field | Value |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| sessionName | `周末聚会记录` |
| backend hostProfileId | `user-1781787045678-c892b9` |
| host token tail | `ddceb616` |
| current common memberA profileId | `user-1781787045679-f3f2eb` |
| current common memberA token tail | `b8615971` |
| memberA is backend host | `false` |

Local store members:

| profileId | name | isHost in store | token tail |
| --- | --- | --- | --- |
| `user-1781787045678-c892b9` | `聚会记录师房主` | `true` | `ddceb616` |
| `user-1781787045679-f3f2eb` | `聚会记录师成员A` | `false` | `b8615971` |
| `user-1781787045679-4cd6ea` | `聚会记录师成员B` | `false` | `c9c5b046` |

Ledger events exist and were created by host:

| eventType | targetProfileId | operatorProfileId | scoreDelta |
| --- | --- | --- | ---: |
| `drink_debt` | `user-1781787045679-f3f2eb` | `user-1781787045678-c892b9` | `1` |
| `drink_add` | `user-1781787045679-4cd6ea` | `user-1781787045678-c892b9` | `1` |

## Read-Only API Summary

`GET /api/v1/sessions/live?sessionId=session-1781787045680-8e406c` with memberA token tail `b8615971`:

| Field | Value |
| --- | --- |
| HTTP / code | `200 / 0` |
| `hostProfileId` | `user-1781787045678-c892b9` |
| current token profile | `user-1781787045679-f3f2eb` |
| current token matches host | `false` |
| `joinStatusPlayers.length` | `3` |

Note: `joinStatusPlayers[].isHost` in this response was not reliable for write permission; all three rows came back `false`. The authoritative field available to frontend is `liveSession.hostProfileId`, compared with current login profile id.

## Why `PUT /sessions/:sessionId` Returns 403

Backend route contract in `backend/server.js`:

```js
const userProfileId = String(userSession.profile.id || '').trim()
const isHost = String(targetSession.members?.find((item) => item?.isHost)?.profileId || '').trim() === userProfileId

if (request.method === 'PUT') {
  if (!isHost) {
    sendError(response, 403, 'forbidden')
    return
  }
  ...
}
```

For token tail `b8615971`:

- authenticated profile is `user-1781787045679-f3f2eb`;
- session host profile is `user-1781787045678-c892b9`;
- `isHost=false`;
- therefore `PUT /api/v1/sessions/session-1781787045680-8e406c` is expected to return `403 forbidden`.

No PUT was executed in this task. The status is determined by read-only identity comparison and backend route code.

## Frontend Contract

For 008g ledger edit buttons:

- Write permission must be based on `liveSession.hostProfileId === currentUser.id`.
- `role=judge` query is a preview/testing display hint only; it must not grant write permission.
- runtime `isJudge` set from `role=judge` must not be used as backend write authorization.
- `joinStatusPlayers[].isHost` is not sufficient in the current response because it returns `false` for all rows.
- Showing `发起人可调整`, `ledgerEditable=true`, and `+/-` buttons under memberA token tail `b8615971` is a frontend permission mapping bug, not a backend auth failure.

If QA needs to verify editable host path, use host profile `user-1781787045678-c892b9` with token tail `ddceb616`. The full token must stay in private/env storage and must not be written to public docs.

## Warnings / Skipped

- Skipped DevTools by instruction.
- Skipped online API and any write/cleanup.
- Did not execute `PUT /sessions/:sessionId`.
- Did not print full tokens.
- This is auth-contract evidence only; it is not a page pass.
