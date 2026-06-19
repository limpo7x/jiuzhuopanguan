# PR-INT 008X First Photo Cover Contract

Task: `PR-FE-INT-LINK-CLEANUP-008X-FIRST-PHOTO-COVER-CONTRACT`

Checked at: 2026-06-19

Scope:

- Read only local `127.0.0.1:3221` / jiuzhuopanguan data.
- No DevTools, no online write, no cleanup.
- Full token was read only from local store for HTTP auth; public log keeps token tails only.

## Read Scope

PM objective row:

- `docs/runtime/pm-objective-coverage-20260619.md`
- `docs/runtime/ai-thread-dispatch-queue.md` 008X row

Queue requirement: confirm whether home recent album cover can strictly show the uploaded first photo. PM audit found frontend currently uses `coverPhotoUrl || first timeline image`; if backend `coverPhotoUrl` is not the first uploaded photo, the contract is not strict.

## Local API

| Item | Value |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| Local 3221 PID | `18088` |
| Store | `F:\codexlist\jiuzhuopanguan\backend\data` |

## Commands

Token lookup and HTTP calls used local store only. Output was sanitized to token tails.

```powershell
# Do not print full token. Script output keeps tokenTail only.
node -e "<local read-only script: read backend/data/social-store.json, call /user/session-moment-summaries and /briefs/:briefId, output tokenTail + field summary>"
```

Code contract snippets inspected:

- `miniprogram/pages/index/index.ts`: home recent album maps `firstPhotoUrl = item.coverPhotoUrl || ''`, then falls back to `findFirstBriefPhoto(brief)`.
- `miniprogram/pages/index/index.ts`: `findFirstBriefPhoto(brief)` returns the first timeline node where `nodeKind === 'moment'` and `imageUrl` exists.
- `backend/data/moments.js`: `getUserSessionMomentSummaries()` currently does not return `coverPhotoUrl` or `coverImageUrl`.
- `backend/data/moments.js`: generated brief data sets `coverPhotoUrl` from `photoHighlights[0]?.imageUrl`, but current clean facade response used by `/briefs/:id` exposes `photoHighlights` and frontend builds timeline from that when no `timeline` is present.
- `backend/data/clean-slate.js`: party live payload sets `coverPhotoUrl = liveSession.coverPhotoUrl || photoHighlights[0]?.imageUrl`, so a stored `liveSession.coverPhotoUrl` could override the first photo highlight.

## Field Matrix

| Sample | token tail | Endpoint | Status | Summary cover fields | Brief first photo field | Upload/order observation | Strict first-photo result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `prcs-008g` / `session-1781787045680-8e406c` / `brief-1781787045693-bc8904b9` | `b8615971` | `GET /user/session-moment-summaries` | `200 / code=0` | `coverPhotoUrl=""`, `coverImageUrl=""`; response keys do not include cover fields | n/a | summary found, but no cover contract returned | Cannot prove strict first uploaded photo from summary |
| `prcs-008g` / `session-1781787045680-8e406c` / `brief-1781787045693-bc8904b9` | `b8615971` | `GET /briefs/brief-1781787045693-bc8904b9` | `200 / code=0` | n/a | `photoHighlights[0].imageUrl=/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | local moment store has opening photo URL `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp`; opening and highlight have equal `createdAt`, store order places highlight first | Not strict: brief first highlight is not the intended first uploaded/opening photo |
| `prcs-008` / `session-1781756527692-d277f0` / `brief-1781756527712-95eff999` | `4ea6c85e` | `GET /user/session-moment-summaries` | `200 / code=0` | `coverPhotoUrl=""`, `coverImageUrl=""`; response keys do not include cover fields | n/a | summary found, but no cover contract returned | Cannot prove strict first uploaded photo from summary |
| `prcs-008` / `session-1781756527692-d277f0` / `brief-1781756527712-95eff999` | `4ea6c85e` | `GET /briefs/brief-1781756527712-95eff999` | `200 / code=0` | n/a | `photoHighlights[0].imageUrl=/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | local moment store opening photo is first by `createdAt` | Current old sample happens to match, but this is not enough to prove contract strictness |

## Conclusion

Current local `session-moment-summaries` response does not return `coverPhotoUrl`, so the home page path falls back to brief-derived first image for the checked samples.

However, the contract is not strict enough for "uploaded first photo":

1. Frontend source still prefers `item.coverPhotoUrl` if backend starts returning it.
2. `backend/data/clean-slate.js` allows `liveSession.coverPhotoUrl` to override `photoHighlights[0]`.
3. `prcs-008g` proves the fallback brief first photo can be `highlight` rather than the intended opening/first uploaded photo because equal `createdAt` values and store order put highlight first.

Interface judgment: do not mark 008X as covered. Current data can only prove "URL fallback exists"; it cannot prove the recent album cover strictly uses the uploaded first photo.

Recommended owner:

- Frontend 008X: select explicit first uploaded/timeline photo before any summary `coverPhotoUrl`, or require a new backend field whose semantics are `firstUploadedPhotoUrl`.
- Backend/API follow-up only if product wants `coverPhotoUrl` itself to be authoritative: define and return `coverPhotoUrl` as immutable first uploaded public/session photo, with deterministic tie-break by upload file timestamp or moment creation sequence.

## Warnings / Skipped

- Skipped DevTools by instruction.
- Skipped online API and any write/cleanup.
- Did not print full tokens.
- `prcs-008g` remains a valid non-white visual sample, but it is not valid evidence for strict first-uploaded-photo cover.
