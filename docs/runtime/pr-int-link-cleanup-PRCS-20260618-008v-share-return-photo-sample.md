# PR-INT-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-SAMPLE

## Scope

- Task: `PR-INT-LINK-CLEANUP-008V-SHARE-RETURN-PHOTO-SAMPLE`
- Mode: read-only verification
- API base: `http://127.0.0.1:3221/api/v1`
- Online access: not executed
- Cleanup: not executed
- Full token policy: not printed; token tails only.

## Source Failure

QA 13.16.91 reported this share return query:

```text
/pages/share-preview/index?sessionId=session-1781756527692-d277f0&inviteCode=E52MK5&briefId=brief-1781756527712-95eff999
```

Data result:

| Field | Value |
| --- | --- |
| `shareReturnMode` | `true` |
| `briefId` | `brief-1781756527712-95eff999` |
| `photoHighlights` | `2`, both `imageBroken=true` |
| `accountingHighlights` | `4` |
| `keyEvents` | `2` |
| `previewLoadFailed` | `false` |
| `errorText` | empty |

## Original `prcs-008` Read-Only API Summary

Authorization: memberA token tail `4ea6c85e`.

`GET /api/v1/briefs/brief-1781756527712-95eff999`:

| Field | Result |
| --- | --- |
| HTTP / code | `200 / 0` |
| partyId | `session-1781756527692-d277f0` |
| photoHighlights | `2` |
| accountingHighlights | `4` |
| keyEvents | `2` |
| ledgerSummary | `entryCount=2`, `pendingCount=1`, `addedCount=1` |

Photo fields returned by the API:

| Photo | imageUrl | Local GET | byteLength |
| --- | --- | --- | ---: |
| opening | `/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | `200` | `44` |
| highlight | `/uploads/moments/session-1781756527692-d277f0/1781756527702-party-highlight-19e9f0.webp` | `200` | `44` |

Local file / pixel summary:

| imageUrl | File path | Size | SHA-256 | Pixel summary |
| --- | --- | --- | --- | --- |
| `/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | `backend/public/uploads/moments/session-1781756527692-d277f0/1781756527696-party-opening-1a4f80.webp` | `1x1`, `44` bytes | `eac5d3acc16c45bcc21ffe69595acdf4a7ad06758c3a180d08ec60a93cc4ee3a` | RGB all `min=255`, `max=255`, `mean=255` |
| `/uploads/moments/session-1781756527692-d277f0/1781756527702-party-highlight-19e9f0.webp` | `backend/public/uploads/moments/session-1781756527692-d277f0/1781756527702-party-highlight-19e9f0.webp` | `1x1`, `44` bytes | `eac5d3acc16c45bcc21ffe69595acdf4a7ad06758c3a180d08ec60a93cc4ee3a` | RGB all `min=255`, `max=255`, `mean=255` |

## Frontend Field Consistency

Frontend `share-preview` consumes `photoHighlights[].imageUrl`.

Relevant behavior:

- `buildSharePreviewPhotoHighlights()` maps timeline moment `imageUrl` into page `photoHighlights`.
- Share return path assigns `briefPreview.photoHighlights` directly to page data.
- `handlePhotoImageLoad()` sets `imageBroken=true` when loaded image detail has both width and height below `8`.
- `handlePhotoImageError()` also sets `imageBroken=true` on image load error.

Conclusion: the original 008 API fields are present and locally GET-readable, but the two file bodies are `1x1` pure white. This is enough to explain `imageBroken=true` without blaming invite/share return data branching.

## Responsibility Judgment

Original `prcs-008` is not a valid visual sample for 008V because both returned photo files are `1x1` pure white.

Responsibility:

- Sample responsibility: interface fixture / sample data.
- Frontend responsibility: keep consuming `photoHighlights[].imageUrl`; no evidence from this read-only check that the field name is wrong.
- Backend/API responsibility: no new backend fix required if testing switches to the existing non-white `prcs-008g` sample. If PM requires the exact `brief-1781756527712-95eff999` to become visual, backend/API or interface fixture owner must replace those two image files or regenerate that seed.

## Recommended Replacement Sample

Use the already prepared non-white local sample from `PR-INT-LINK-CLEANUP-008G-NONWHITE-PHOTO-FIXTURE`:

| Field | Value |
| --- | --- |
| sessionId | `session-1781787045680-8e406c` |
| inviteCode | `J2BEL2` |
| briefId | `brief-1781787045693-bc8904b9` |
| ready shareTaskId | `share-task-1781787045694-9725ffeb` |
| memberA token tail | `b8615971` |
| API base | `http://127.0.0.1:3221/api/v1` |

Non-white photo URLs:

```text
/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp
/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp
```

008G evidence:

- both files are `640x420`;
- both files have non-white pixel stats;
- clean facade returns `photoHighlights=2`, `accountingHighlights=4`, `keyEvents=2`;
- both image URLs return HTTP `200`.

Recommended retest query:

```text
/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9
```

Additional reference queries:

```text
/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9
/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb
```

## Cleanup / Residual

No cleanup executed.

Current recommendation: keep both `prcs-008` and `prcs-008g` until 008V retest finishes.

Cleanup command for replacement sample only, after PM explicitly assigns:

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-008g
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-008g
```

Do not cleanup `prcs-008`, 006/009/011/final/share samples, or `INT-DATA-001` unless PM separately assigns.

## Warnings / Skipped

- DevTools was not used.
- No `api.pomer.cn` or `pomer.cn` access was executed.
- This is sample/API responsibility judgment only; it does not mark 008V visual retest passed.
- No new sample was generated in 008V because the existing `prcs-008g` sample already satisfies the non-white photo requirement.
