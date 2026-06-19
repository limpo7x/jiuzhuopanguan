# PR-INT-LINK-CLEANUP-008G-NONWHITE-PHOTO-FIXTURE

## Scope

- Task: `PR-INT-LINK-CLEANUP-008G-NONWHITE-PHOTO-FIXTURE`
- Environment: local only
- API base: `http://127.0.0.1:3221/api/v1`
- Seed: `prcs-008g`
- Online access: not executed
- DevTools: not executed
- Cleanup: not executed
- Full token policy: full tokens stay in private/env; public evidence records token tails only.

## Commands

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-008g --output $env:TEMP\jiuzhuopanguan-private\pr-int-link-cleanup-PRCS-20260618-008g-manifest.private.json
node -e "<overwrite prcs-008g opening/highlight photo files with non-white 640x420 WebP and print stats>"
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
```

3221 runtime was restarted after sample creation so the local service reads the latest store:

| Item | Value |
| --- | --- |
| PID | `18088` |
| cwd | `F:\codexlist\jiuzhuopanguan` |
| command | `PORT=3221 npm.cmd --prefix backend start` |
| API base | `http://127.0.0.1:3221/api/v1` |
| stdout | `docs/runtime/pr-int-local-api-3221-008g.out.log` |
| stderr | `docs/runtime/pr-int-local-api-3221-008g.err.log` |

## Fixture IDs

| Field | Value |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| albumId | `album-session-1781787045680-8e406c` |
| briefId | `brief-1781787045693-bc8904b9` |
| ready shareTaskId | `share-task-1781787045694-9725ffeb` |
| failed shareTaskId | `share-task-1781787045808-5d5b28` |
| returnShareId | `share-return-session-1781787045680-8e406c` |

## Token Tails

| Role | Profile ID | Token tail |
| --- | --- | --- |
| host | `user-1781787045678-c892b9` | `ddceb616` |
| memberA | `user-1781787045679-f3f2eb` | `b8615971` |
| memberB | `user-1781787045679-4cd6ea` | `c9c5b046` |
| outsider | `user-1781787045679-2b860b` | `bf8bf64b` |

Recommended retest role: memberA, token tail `b8615971`.

## Non-White Photo Evidence

Both public photo files were replaced in place under the generated `prcs-008g` upload paths. The fixture IDs and image URLs remain stable and cleanup by seed can remove them later.

| Photo | imageUrl | File path | Size | SHA-256 | Pixel evidence |
| --- | --- | --- | --- | --- | --- |
| opening | `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `backend/public/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `640x420`, `14402` bytes | `4176f7a72273adc5a7edb25b91650c1fba337e82dedc0f0bd501c9a8626786ec` | RGB min/max/mean: R `11/255/89.74`, G `18/255/125.46`, B `6/255/98.37` |
| highlight | `/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `backend/public/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `640x420`, `15388` bytes | `b5b1c05139110a23fe965eebcc0fa8aae0e87fec10f63164c64ec32d559f9190` | RGB min/max/mean: R `10/255/125.42`, G `13/255/77.56`, B `13/255/130.31` |

Interpretation: both images are larger than `8x8`, not `1x1`, and not pure white. Channel min values are far below 255 and means are not all 255.

## Clean Facade Verification

Authorization: memberA token tail `b8615971`.

| Endpoint | HTTP / code | Summary |
| --- | --- | --- |
| `GET /api/v1/briefs/brief-1781787045693-bc8904b9` | `200 / 0` | `photoHighlights=2`, `accountingHighlights=4`, `keyEvents=2`, `ledgerSummary.entryCount=2`, `pendingCount=1`, `addedCount=1`, `hasLedgerData=true` |
| `GET /api/v1/share-images/share-task-1781787045694-9725ffeb` | `200 / 0` | `status=ready`, `imageUrl=/uploads/moments/share-tasks/share-task-1781787045694-9725ffeb.png`, `layoutMode=party_story`, `includeLedger=true` |
| `GET` opening/highlight image URLs | `200` | opening `14402` bytes, highlight `15388` bytes |

## Retest Page Queries

```text
/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9
/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb
/pages/share-preview/index?shareId=share-return-session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9
/pages/live-record/index?sessionId=session-1781787045680-8e406c&role=member
/pages/ledger/index?partyId=session-1781787045680-8e406c&ledgerId=ledger-session-1781787045680-8e406c
/pages/album/index?partyId=session-1781787045680-8e406c&albumId=album-session-1781787045680-8e406c
```

## Residual / Cleanup

Current inspect counts:

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

Cleanup was not executed. When PM explicitly assigns cleanup, run only this seed:

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
```

If PM also allows private profile cleanup:

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-008g
```

Do not cleanup existing `prcs-008` or other 006/009/011/final/share samples in this task.

## Warnings / Skipped

- DevTools was not used because it is frozen by PM context.
- No `api.pomer.cn` or `pomer.cn` access was executed.
- This proves API/photo fixture readiness only; it does not mark page, UI/UX, or release validation passed.
- The ready share PNG was generated before replacing the photo files; this task proves the page-consumed photo URLs are non-white, not that the generated PNG embeds the new photos.
