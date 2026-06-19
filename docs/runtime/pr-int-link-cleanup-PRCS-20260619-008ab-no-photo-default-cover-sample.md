# PR-INT 008AB No-Photo Default Cover Sample

Task: `PR-INT-LINK-CLEANUP-008AB-NO-PHOTO-DEFAULT-COVER-SAMPLE`

Checked at: 2026-06-19

Scope:

- Read only local/runtime/fixture data.
- No DevTools, no online write, no cleanup.
- Full token was read only from local store for HTTP auth; public log keeps token tails only.

## Read Scope

PM objective row:

- `docs/runtime/pm-objective-coverage-20260619.md`: `Home recent album cover should show uploaded first photo, fallback if none`

QA row:

- `docs/gameplay-moments-test-acceptance-plan.md` 13.16.94

Confirmed context:

- 008g first-photo cover passed preview-stage in 13.16.94.
- Remaining explicit gap: no-photo default cover was not tested.

## Local API

| Item | Value |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| Store | `F:\codexlist\jiuzhuopanguan\backend\data` |

## Read-Only Commands

```powershell
rg -n "Home recent album cover should show uploaded first photo|fallback if none" docs/runtime/pm-objective-coverage-20260619.md
rg -n "13\.16\.94|008g|无图|默认封面|首图封面" docs/gameplay-moments-test-acceptance-plan.md
```

Local data/API scan:

```powershell
# Sanitized script: read admin-store / moments-store / social-store,
# call /config/home, /user/session-moment-summaries, /briefs/:briefId,
# and print token tails only.
node -e "<local read-only no-photo summary scan>"
```

## Findings

### Static no-photo sessions

Local `admin-store` has static sessions with no photos:

| sessionId | inviteCode | moment images | briefId | reportId | token tail | Reusable for recent album? |
| --- | --- | ---: | --- | --- | --- | --- |
| `session-1` | `A17K9Q` | `0` | empty | empty | empty | No |
| `session-2` | `N27K9Q` | `0` | empty | empty | empty | No |
| `session-3` | `N37K9Q` | `0` | empty | empty | empty | No |

Reason: these static sessions do not have session report / brief / accessible member token evidence, so they do not appear in `GET /user/session-moment-summaries` and cannot drive home recent album or album-list default-cover UI as a member summary sample.

### Member summary scan

| token tail | Endpoint | Status | Summary items | No-photo summary item found? |
| --- | --- | --- | ---: | --- |
| `b8615971` | `GET /user/session-moment-summaries` | `200 / code=0` | `1` | No; `session-1781787045680-8e406c` has photo data |
| `4ea6c85e` | `GET /user/session-moment-summaries` | `200 / code=0` | `2` | No; both summary items have local/brief photo data |
| `a9f69589` | `GET /user/session-moment-summaries` | `200 / code=0` | `1` | No; `session-1781507687012-e4343d` has photo data |
| `ddceb616` | `GET /user/session-moment-summaries` | `200 / code=0` | `1` | No; `session-1781787045680-8e406c` has photo data |
| `20cf10b7` | `GET /user/session-moment-summaries` | `200 / code=0` | `1` | No; `session-1781756527692-d277f0` has photo data |
| `a344ca32` | `GET /user/session-moment-summaries` | `200 / code=0` | `1` | No; `session-1781753066622-4b386b` has photo data |

Example near-miss:

| Field | Value |
| --- | --- |
| sessionId | `session-1781773386962-1c89d2` |
| briefId | `brief-1781773415317-72a8d020` |
| token tail | `4ea6c85e` |
| summary cover fields | `coverPhotoUrl=""`, `coverImageUrl=""` |
| brief photoHighlights | `2` |
| local moment images | `2` |
| conclusion | Not a no-photo sample |

## Conclusion

Current local/runtime/fixture data has no reusable "no photo but has session summary / album item" sample.

The static `session-1/2/3` records are no-photo, but they are not valid for the requested UI path because they lack member summary evidence: no `briefId`, no report, no token tail, and no `GET /user/session-moment-summaries` item.

Do not use existing 008/008g/006/INT-DATA samples to claim no-photo default-cover coverage. They all have photos.

## Minimal Fixture Plan

If PM wants 008AB to be testable, backend/API or interface fixture owner should create a small local-only seed such as `prcs-008ab-no-photo` with:

| Required field | Contract |
| --- | --- |
| `sessionId` / `inviteCode` | Stable IDs for page query and member summary |
| host/member profile + token | Public docs show token tail only |
| session report / summary row | `GET /user/session-moment-summaries` returns one item |
| `briefId` | Either valid empty brief or summary item with sessionId route fallback |
| cover fields | `coverPhotoUrl=""`, `coverImageUrl=""` |
| photo data | no `momentRecords.imageUrl`, no brief `photoHighlights`, no timeline image node |
| expected UI | home recent album / album list should show default cover asset |
| cleanup | exact seed cleanup and residual scan for session/report/brief/profile/token |

Suggested local-only page queries after fixture exists:

```text
/pages/index/index
/pages/album/index?partyId=<sessionId>&albumId=album-<sessionId>
```

No write was executed in this task. Creating the seed requires a follow-up fixture task or explicit PM authorization for local test-data write.

## Warnings / Skipped

- Skipped DevTools by instruction.
- Skipped online API and any write/cleanup.
- Did not print full tokens.
- Existing `prcs-008g` remains valid for non-white first-photo cover, but not for no-photo default cover.
