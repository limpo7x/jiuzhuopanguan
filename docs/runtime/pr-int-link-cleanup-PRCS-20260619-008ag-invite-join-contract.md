# PR-INT 008AG Invite Join Contract

Task: `PR-INT-LINK-CLEANUP-008AG-INVITE-JOIN-CONTRACT`

Checked at: 2026-06-19

Scope:

- Read only local `127.0.0.1:3221` / jiuzhuopanguan data.
- No online write, no cleanup, no DevTools.
- No `POST /sessions/join` was executed.
- Full token was read only from local store for HTTP auth; public log keeps token tail `b8615971` only.

## Read Scope

- `AGENTS.md`
- `docs/api-spec.md` session invite/join section
- `docs/runtime/ai-thread-dispatch-queue.md` 008AG row
- `docs/gameplay-moments-interface-integration-test-plan.md` 3.42 008g sample section

## API Contract

Relevant endpoints from API spec and route scan:

| Endpoint | Auth | Behavior | Read/write |
| --- | --- | --- | --- |
| `GET /sessions/live?sessionId=...&inviteCode=...` | no login required for public safe summary | returns session public/live fields including `playerCount`, `joinedCount`, `joinedPlayers`, `joinStatusPlayers` | read |
| `GET /sessions/by-invite?inviteCode=...` | no login required | reads session by invite code and returns live session payload | read |
| `POST /sessions/join` | login required | joins current profile into session by invite code, then returns live session payload | write |

Backend route supports joining after login:

- `POST /api/v1/sessions/join`
- body `{ "inviteCode": "..." }`
- uses current authenticated profile
- errors handled by route: `403 not session player`, `404 session not found`

Backend data-layer note:

- Existing member rejoin updates that member to `status="已加入"`.
- New member can be appended if joined count is below `players/playerCount`.
- If session is already full, data layer throws `SESSION_FULL`; current route does not map this code explicitly in the inspected block, so follow-up should define stable full-session error if QA needs that branch.

Frontend route support:

- `invite-group` share path is `/pages/index/index?inviteCode=<code>&sessionId=<sessionId>`.
- `index.onLoad()` reads `inviteCode` and calls `joinByInviteCode()` after a short delay.
- `joinByInviteCode()` runs `ensureUserAuthorized('/pages/index/index?inviteCode=...')`; if login exists, it calls `joinManagedSession(inviteCode)`, which posts `/sessions/join`.

Interface judgment: current contract supports "friend opens invite link and, after login/authorization, semi-automatically joins by invite code". It does not support no-login automatic join because `POST /sessions/join` requires authenticated user session.

## 008g Read-Only Summary

Sample:

| Field | Value |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| memberA token tail used for auth check | `b8615971` |

Read-only probes:

| Request | Auth | HTTP / code | playerCount | joinedCount | joinedPlayers | joinStatusPlayers |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | none | `200 / 0` | `3` | `3` | `3` | `3` |
| `GET /sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | memberA `b8615971` | `200 / 0` | `3` | `3` | `3` | `3` |
| `GET /sessions/by-invite?inviteCode=J2BEL2` | none | `200 / 0` | `3` | `3` | `3` | `3` |
| `GET /sessions/by-invite?inviteCode=J2BEL2` | memberA `b8615971` | `200 / 0` | `3` | `3` | `3` | `3` |

Player fields in 008g response:

| profileId | name | avatarUrl | status | isHost |
| --- | --- | --- | --- | --- |
| `user-1781787045678-c892b9` | `聚会记录师房主` | empty | `已加入` | `false` in response |
| `user-1781787045679-f3f2eb` | `聚会记录师成员A` | empty | `已加入` | `false` |
| `user-1781787045679-4cd6ea` | `聚会记录师成员B` | empty | `已加入` | `false` |

Notes:

- `hostProfileId` is returned separately as `user-1781787045678-c892b9`.
- `joinStatusPlayers[].isHost` is not reliable in the current response because all rows are `false`; use `hostProfileId` for host UI.
- Avatars are empty in 008g. Frontend should render fallback initials/placeholder avatar from `name` or slot index.

## Avatar Slot Contract

Fields are sufficient for the joined/full state:

- `playerCount`: total configured seats.
- `joinedCount`: joined member count.
- `joinStatusPlayers`: ordered player/member list for slot rendering.
- `joinedPlayers`: joined-only list if frontend wants a compact avatar row.
- per player: `profileId`, `name`, `avatarUrl`, `status`.

Recommended rendering:

1. Build `playerCount` slots.
2. Fill slots from `joinStatusPlayers` in order.
3. Treat item as occupied when `status === "已加入"` or `profileId` exists.
4. Use `avatarUrl` when present; otherwise fallback to first character of `name`, then generic avatar placeholder.
5. For empty slots, show placeholder avatar and waiting state.

008g cannot prove empty-slot filling because it is already full: `joinedCount=3/playerCount=3`.

## Gaps / Owners

Current contract covers:

- invite card share path from `invite-group`;
- public read by `sessionId + inviteCode`;
- public read by `inviteCode`;
- login-gated join action via `/sessions/join`;
- member slot fields for an already full sample.

Current contract does not fully prove:

- "click and join with no login" because join requires login; product should phrase as "login/authorize then join", or frontend must add login gate copy.
- empty avatar slot fill after refresh, because 008g has no empty slots.
- full-session error branch because `SESSION_FULL` is not explicitly mapped in the inspected server route.

Recommended next fixture if QA needs empty-slot proof:

- Create local seed `prcs-008ag-invite-open-slot`.
- `playerCount=4`, `joinedCount=2` initially.
- host + one member joined, at least one non-joined slot or no member row for empty slot.
- outsider/member token not in session can call `/sessions/join` once under controlled write task, then `joinedCount` increments and `joinStatusPlayers` fills slot.
- cleanup must remove the seed and any joined profile side effects.

No write was executed in this task.

## Warnings / Skipped

- Skipped DevTools by instruction.
- Skipped online API and any write/cleanup.
- Did not execute `POST /sessions/join`.
- Did not print full token.
- This is contract/readiness evidence only; it is not a page pass.
