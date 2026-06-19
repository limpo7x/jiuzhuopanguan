# PR-INT-LINK-CLEANUP-008AL Invite Sample Drift Readonly

Date: 2026-06-19

Scope: interface integration readonly check only. No DevTools, no online write, no cleanup, no sample rebuild, no full token output.

## Target

QA 13.16.111 reported that opening:

```text
/pages/invite-group/index?sessionId=session-1781787045680-8e406c
```

with 008g memberA token tail `b8615971` showed:

```text
inviteCode=PNLGNK
sessionName=生'史'局
playerCount=5
joinedCount=1
```

Expected 008g business fixture:

```text
inviteCode=J2BEL2
playerCount=3
joinedCount=3
```

## Readonly Commands

Local store inspection:

```powershell
node -e "const fs=require('fs'); const store=JSON.parse(fs.readFileSync('backend/data/admin-store.json','utf8')); const sessions=store.sessions||[]; const target=sessions.filter(s=>s.id==='session-1781787045680-8e406c'); const open=sessions.filter(s=>s.id==='session-1781808709710-8f00b7'); const byInvite=c=>sessions.filter(s=>s.inviteCode===c).map(s=>({id:s.id,inviteCode:s.inviteCode,name:s.name,players:s.players,joinedCount:(s.members||[]).length,source:s.source,state:s.state})); console.log(JSON.stringify({target:target.map(s=>({id:s.id,inviteCode:s.inviteCode,name:s.name,players:s.players,joinedCount:(s.members||[]).length,hostProfileId:s.hostProfileId,source:s.source,state:s.state,memberTokenTails:(s.members||[]).map(m=>(m.token||'').slice(-8))})), open:open.map(s=>({id:s.id,inviteCode:s.inviteCode,name:s.name,players:s.players,joinedCount:(s.members||[]).length,hostProfileId:s.hostProfileId,source:s.source,state:s.state,memberTokenTails:(s.members||[]).map(m=>(m.token||'').slice(-8))})), inviteMatches:{J2BEL2:byInvite('J2BEL2'),PNLGNK:byInvite('PNLGNK'),KB8DN6:byInvite('KB8DN6')}} ,null,2))"
```

HTTP matrix:

```powershell
$base='http://127.0.0.1:3221/api/v1'
$tokenTail='b8615971'
# Full token is loaded only from local private source by the tester if needed; logs must print tail only.
curl.exe -s "$base/sessions/live?sessionId=session-1781787045680-8e406c"
curl.exe -s "$base/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2"
curl.exe -s "$base/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=PNLGNK"
curl.exe -s "$base/sessions/by-invite?inviteCode=J2BEL2"
curl.exe -s "$base/sessions/by-invite?inviteCode=PNLGNK"
curl.exe -s "$base/sessions/by-invite?inviteCode=KB8DN6"
curl.exe -s "$base/sessions/live?sessionId=session-1781808709710-8f00b7"
```

Code contract check:

```powershell
rg -n "onLoad\\(|hydrateLiveSession\\(|runtime\\.inviteCode|sessionRuntime|enableSessionLeaveAlert" miniprogram/pages/invite-group/index.ts miniprogram/utils/session-return.ts
```

## Field Summary

Current local store has exactly one `session-1781787045680-8e406c`:

| Field | Value |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| sessionName | `周末聚会记录` |
| playerCount | `3` |
| joinedCount | `3` |
| hostProfileId | `user-1781787045678-c892b9` |
| member token tails | `ddceb616`, `b8615971`, `c9c5b046` |
| source | `prcs-clean-slate-actual-prcs-008g` |
| state | `进行中` |

Current local open-slot quick-create sample:

| Field | Value |
| --- | --- |
| sessionId | `session-1781808709710-8f00b7` |
| inviteCode | `KB8DN6` |
| sessionName | `生'史'局` |
| playerCount | `5` |
| joinedCount | `1` |
| accessible token tail | `b8615971` |
| source | `快速创建` |
| state | `邀请中` |

Invite lookup:

| inviteCode | Result |
| --- | --- |
| `J2BEL2` | maps to 008g `session-1781787045680-8e406c` |
| `KB8DN6` | maps to open-slot `session-1781808709710-8f00b7` |
| `PNLGNK` | no match in current `backend/data/admin-store.json`; API returns 404 |

HTTP summary:

| Request | Result |
| --- | --- |
| `/sessions/live?sessionId=session-1781787045680-8e406c` | `200 / code=0`, `J2BEL2`, `playerCount=3`, `joinedCount=3`, `joinStatusPlayers=3` |
| `/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2` | `200 / code=0`, same 008g fields |
| `/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=PNLGNK` | `404 / code=404` |
| `/sessions/by-invite?inviteCode=J2BEL2` | `200 / code=0`, maps to 008g |
| `/sessions/by-invite?inviteCode=PNLGNK` | `404 / code=404` |
| `/sessions/by-invite?inviteCode=KB8DN6` | `200 / code=0`, maps to open-slot `生'史'局`, `5/1` |

## Drift Judgment

The current local store/API did not overwrite or reuse 008g `sessionId`. 008g still returns `J2BEL2 / 3 of 3`.

The reported `PNLGNK / 生'史'局 / 5 / 1` is not present in current backend data. `生'史'局 / 5 / 1` matches the existing open-slot quick-create shape, while `PNLGNK` looks like a stale transient invite code retained in page runtime/storage from an earlier quick-create or invite flow.

The invite page currently derives `sessionId` from query, but passes `runtime.inviteCode` into `hydrateLiveSession`. If runtime has stale `inviteCode=PNLGNK`, the page can call `/sessions/live?sessionId=session-1781787045680-8e406c&inviteCode=PNLGNK`, receive 404, then fall back to runtime fields such as `runtime.inviteCode`, `runtime.sessionName`, `runtime.playerCount`, and selected players. This explains the page data drift without backend fixture drift.

Responsibility judgment:

- Not local backend store overwrite: store contains 008g as `J2BEL2 / 3 / 3`.
- Not sessionId reuse: only one current store session has `session-1781787045680-8e406c`.
- Not current mock/API data update: local API returns 008g fields and 404 for `PNLGNK`.
- Most likely source: frontend/runtime storage fallback drift. `invite-group` should not let stale `runtime.inviteCode` poison a query-driven `sessionId`, and fallback should not replace queried session content with unrelated runtime session data.

## Reproducible Test Guidance

For strict 008g business sample verification:

```text
/pages/invite-group/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2
```

Expected API fields:

```text
inviteCode=J2BEL2
playerCount=3
joinedCount=3
joinStatusPlayers.length=3
token tail=b8615971
```

Frontend caveat: current `invite-group` code path must consume query `inviteCode`, or avoid passing stale runtime inviteCode when a fresh `sessionId` is present. Storage cleanup/overwrite may be needed in QA window, but this task did not touch DevTools storage.

For open-slot display only, use the explicit 008AH candidate:

```text
/pages/invite-group/index?sessionId=session-1781808709710-8f00b7&inviteCode=KB8DN6
```

Expected read-only fields:

```text
inviteCode=KB8DN6
sessionName=生'史'局
playerCount=5
joinedCount=1
token tail=b8615971
```

Do not use this open-slot quick-create sample to claim 008g business fixture pass.

## Minimal Follow-up If Needed

If PM wants a stable open-slot sample that can also prove "new user joins, refresh fills one empty avatar slot", open a separate authorized task:

```text
prcs-008al-or-008ah-invite-open-slot-stable
```

Minimum contract:

| Field | Requirement |
| --- | --- |
| initial playerCount | `4` or `5` |
| initial joinedCount | `1` or `2`, strictly less than `playerCount` |
| identities | host/member already joined plus one separate joiner token |
| actions | readonly scan-before, authorized `POST /sessions/join`, readonly scan-after |
| cleanup | exact seed cleanup plus residual scan for session, members, join logs and upload side effects |

This task did not execute the write path.

## Warnings / Skipped

- Skipped DevTools and storage injection.
- Skipped online API, write, cleanup, and sample rebuild.
- Did not print full tokens.
- Current conclusion is interface/data contract only; it is not a page pass.
