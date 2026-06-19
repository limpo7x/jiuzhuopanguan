# PR-INT 008AH Invite Open-Slot Sample

Task: `PR-INT-LINK-CLEANUP-008AH-INVITE-OPEN-SLOT-SAMPLE`

Checked at: 2026-06-19

Scope:

- Read only local/runtime/fixture data.
- No DevTools, no online write, no cleanup.
- No `POST /sessions/join` was executed.
- Full tokens were read only from local store for HTTP auth; public log keeps token tails only.

## Search Criteria

Required by PM:

- `playerCount > joinedCount`
- stable `sessionId / inviteCode`
- at least one accessible member token tail for invite-group
- `GET /sessions/live` returns `playerCount / joinedCount / joinedPlayers` or `joinStatusPlayers`
- usable to see empty avatar slots

## Found Candidates

### Primary Candidate

| Field | Value |
| --- | --- |
| sessionId | `session-1781808709710-8f00b7` |
| inviteCode | `KB8DN6` |
| sessionName | `生'史'局` |
| accessible token tail | `b8615971` |
| source | local quick-create data |
| state | `邀请中` |

Read-only API:

`GET /api/v1/sessions/live?sessionId=session-1781808709710-8f00b7&inviteCode=KB8DN6`

| Auth | HTTP / code | playerCount | joinedCount | joinedPlayers | joinStatusPlayers | hostProfileId |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| none | `200 / 0` | `5` | `1` | `1` | `1` | `user-1781787045679-f3f2eb` |
| token tail `b8615971` | `200 / 0` | `5` | `1` | `1` | `1` | `user-1781787045679-f3f2eb` |

Slot source:

| slot source | profileId | name | avatarUrl | status |
| --- | --- | --- | --- | --- |
| `joinStatusPlayers[0]` | `user-1781787045679-f3f2eb` | `聚会记录师成员A` | empty | `已加入` |

Expected UI use:

- Build `5` avatar slots from `playerCount`.
- Fill the first slot from `joinStatusPlayers[0]`.
- Render the remaining `4` slots as empty placeholder avatars.
- Avatar URL is empty, so frontend should use initials/default placeholder for the occupied slot.

Suggested page query:

```text
/pages/invite-group/index?sessionId=session-1781808709710-8f00b7&inviteCode=KB8DN6
```

Limitations:

- This is an existing local quick-create sample, not a clean `prcs-*` fixture.
- The visible session title is not polished and may not be suitable for final UX screenshot copy.
- It can support empty-slot display read-only evidence, but it cannot prove "new user joined then refresh fills slot" unless a later task explicitly authorizes a join write.

### Fallback Candidate

| Field | Value |
| --- | --- |
| sessionId | `session-1781773386962-1c89d2` |
| inviteCode | `WGCNM8` |
| sessionName | `周五快乐局` |
| accessible token tail | `4ea6c85e` |
| source | local quick-create data |
| state | `邀请中` |

Read-only API:

`GET /api/v1/sessions/live?sessionId=session-1781773386962-1c89d2&inviteCode=WGCNM8`

| Auth | HTTP / code | playerCount | joinedCount | joinedPlayers | joinStatusPlayers | hostProfileId |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| none | `200 / 0` | `2` | `1` | `1` | `1` | `user-1781756527691-ff0197` |
| token tail `4ea6c85e` | `200 / 0` | `2` | `1` | `1` | `1` | `user-1781756527691-ff0197` |

Suggested page query:

```text
/pages/invite-group/index?sessionId=session-1781773386962-1c89d2&inviteCode=WGCNM8
```

Limitations:

- Only one empty slot, weaker than the primary candidate.
- Not a clean `prcs-*` fixture.
- Cannot prove new user join without authorized write.

## Rejected Static Candidates

Static local sessions `session-1`, `session-2`, `session-3` also have `playerCount > joinedCount`, but they have no accessible token tail and no stable profile IDs for member-role testing. They are not recommended for this task.

## Interface Judgment

Current local data has reusable open-slot read-only samples.

Recommended for QA read-only open-slot display:

- Primary: `session-1781808709710-8f00b7 / KB8DN6`, token tail `b8615971`, expected slots `5`, occupied `1`, empty `4`.
- Fallback: `session-1781773386962-1c89d2 / WGCNM8`, token tail `4ea6c85e`, expected slots `2`, occupied `1`, empty `1`.

Do not use these samples to claim join-after-refresh completion. They only prove the read side can provide `playerCount > joinedCount` and enough fields for empty avatar slots.

## Minimal Clean Fixture Plan

If PM wants a clean, reversible join-after-refresh sample, create a follow-up local seed:

`prcs-008ah-invite-open-slot`

Suggested contract:

| Field | Required value |
| --- | --- |
| initial `playerCount` | `4` |
| initial `joinedCount` | `2` |
| initial members | host + memberA joined |
| open slots | `2` placeholders before join |
| new user identity | memberB or outsider token not already in the session |
| read endpoint | `GET /sessions/live?sessionId=<id>&inviteCode=<code>` |
| write action, separate authorized task only | `POST /sessions/join` with inviteCode using new user token |
| expected after join | `joinedCount=3`, `joinStatusPlayers` includes new user; frontend refresh fills one placeholder |
| cleanup | exact seed cleanup plus scan-before / cleanup / scan-after for session, members, login/session token side effects |

Backend/API support is only needed if no existing helper can create this seed and cleanup precisely, or if PM wants a stable full-session / duplicate-join error contract.

## Warnings / Skipped

- Skipped DevTools by instruction.
- Skipped online API and any write/cleanup.
- Did not execute `POST /sessions/join`.
- Did not print full tokens.
- This is fixture/readiness evidence only; it is not a page pass.
