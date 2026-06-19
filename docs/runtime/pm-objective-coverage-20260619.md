# PM Objective Coverage Audit - 2026-06-19

Scope: user objective for the clean party-recorder link cleanup. PM audit only; no business source edits.

## Evidence Read

- Home: `miniprogram/pages/index/index.ts`, `miniprogram/pages/index/index.wxml`
- Tools: `miniprogram/pages/tools/index.*`, `miniprogram/pages/tool-detail/index.*`
- Live record / ledger: `miniprogram/pages/live-record/index.*`, `miniprogram/pages/ledger/index.*`
- Brief: `miniprogram/pages/session-brief/index.*`
- Create: `miniprogram/pages/create-session/index.*`
- First photo: `miniprogram/pages/moment-editor/index.*`
- Invite / share return: `miniprogram/pages/share-preview/index.*`
- Profile: `miniprogram/pages/me/index.*`
- PM preview evidence: `docs/runtime/pr-pm-link-cleanup-008v-share-return-photo-008g-auth-valid-20260618.png`

## Coverage Matrix

| Requirement | Current evidence | PM status |
| --- | --- | --- |
| Home recent album cover should show uploaded first photo, fallback if none | Frontend 14.74 changed home and album cover selection to prefer the earliest real photo from brief timeline by `createdAt/updatedAt`, tie-breaking `opening` first, then fallback to summary `coverPhotoUrl`, and default only when no photo exists. Test 13.16.94 confirmed home and album list both show 008g `opening` cover in right preview, Console `[]`. | Preview-stage passed for 008g / no-photo default still untested |
| Record / ledger page shows debt and add-drink data, editable by host | User screenshot on 2026-06-19 showed memberA could see "发起人可调整" and `+/-`, then tapping returned `forbidden`. Frontend 14.77 fixed editability to use `liveSession.hostProfileId === 当前 profileId`, hides steppers for non-host, and converts 403/`forbidden` to Chinese copy. Interface 3.48 confirms memberA token tail `b8615971` is not host and host token tail is `ddceb616`; backend 403 for memberA is expected. Test 13.16.100 confirms memberA / non-host `live-record` ledger tab and standalone `ledger` page are read-only, with no `+/-`, no "发起人可调整", and no English `forbidden`. | Non-host preview-stage passed / host write untested |
| Remove "save key event" button from record / ledger | Current `live-record.wxml` inspected section has no "保存关键事件" button; ledger page uses row steppers and return/create actions. | Source aligned |
| Home bottom ledger becomes toolbox; toolbox list uses old tools and tools usable | Home and tools bottom nav show `首页 / 工具箱 / 我的`; tools page links to `tool-detail`. 008O preview had passed. | Preview-stage passed |
| Profile page reduces duplicate album-like entrances | `me.wxml` has clearer create/tool actions, stats, pending albums, and feature routes. Some stat taps still show "choose specific album below", so duplicate-entry cleanup is improved but needs UX/runtime check. | Partial / needs UX check |
| My created party brief images can be tapped for big preview and tap back | User and test 13.16.96 confirmed spinner in system preview. Frontend 14.76 now resolves preview URLs via `normalizeManagedAssetPath` + `resolveCachedManagedImagePath` before `wx.previewImage`; interface 3.47 confirms 008g image URLs GET 200 and are real 640x420 WebP. Test 13.16.98 confirms tapping the probe shows a non-white big image and no longer spins; user confirmed on 2026-06-19 that big image display and return both pass. | Preview-stage passed |
| Overall image audit/review mechanism removed; images display directly and join share flow | UGC 6.24.2 allows legacy review fields as internal compatibility only. Frontend 14.74 removed user-visible audit / pending-media wording from target album, brief, moment-card, and summary components; test 13.16.94 static scan and home / album / brief screenshots found no audit / pending-media wording. | Preview-stage passed for target nodes / PNG OCR still untested |
| Create party page uses current real time for list display | `create-session.ts` sets `currentTimeText` from `new Date()` and `startedAt: Date.now()`; home recent album displays brief created time. Runtime list proof is missing. | Source aligned / runtime evidence missing |
| Create party page can edit tonight party headcount | Frontend 14.78 added a visible "今晚聚会人数" stepper on `create-session`, with selectors `.create-player-count-minus` / `.create-player-count-plus` / `.create-player-count-value`; existing 2-12 clamp and create payload/runtime `playerCount` are reused. | Frontend fixed / QA retest pending |
| Create party page can fill party name from presets | Frontend 14.79 renders `sessionNamePresets` as chips under the name input; tapping a chip fills `sessionName` and selected state. Current presets include `今晚的聚会`, `朋友小聚`, `复仇局`, `生'史'局`, `翻盘局`, `决战到天亮`, `家庭聚会`, `下班放松局`. | Frontend fixed / QA retest pending |
| Create party lightweight theme selection removed | `create-session.wxml` has no theme/template card section, only name/time/advanced settings. | Source aligned |
| Invite friend page has invite card, friend share, joined avatar slots, and refresh | Frontend 14.80 restored `invite-group` as a concise invite card with invite code, join status, `playerCount`-sized `avatarSlots`, copy, refresh, native share button, and first-photo CTA. Interface 3.49 confirms share link return supports login/authorization then `POST /sessions/join`, not silent no-login join. Test 13.16.104 confirms the 008g full sample renders invite card, 3/3 filled avatar slots, refresh keeps data intact, share button tap has Console `[]`, and no photo/ledger thick modules or debug copy appear. | Preview-stage passed for full sample / empty-slot join evidence missing |
| Invite preview removes photo record + ledger module and reserved safe-area module | `share-preview.wxml` pure invite branch only shows brand, title, invite code, and join status text. No photo/ledger thick module. | Source aligned / 008T preview passed |
| Join-status tab removes share-to-friend, share-to-group, save-poster buttons | `share-preview.wxml` join-status branch only shows member status list/empty state, no share/save buttons. | Source aligned / 008T preview passed |
| First photo save enters live ongoing page instead of home | `moment-editor.ts` redirects to `/pages/live-record/index?sessionId=...&role=judge` after `createManagedMoment`. | Source aligned / runtime evidence missing |
| One-sentence description is compact and has default selectable copy | `moment-editor.wxml` has one `textarea` and `captionPresets` chips. CSS two-line visual compaction was not audited in this pass. | Source aligned / visual evidence missing |
| Visibility removes "only self"; authorization defaults all four selected | `moment-editor.ts` defaults `selectedAuthorizations` from all consent items; `moment-editor.wxml` says "默认 4 项全选". Visibility options include session/public/selected but no visible "仅自己". 008R preview had passed. | Preview-stage passed |
| Share return photo+ledger display is non-broken | PM single check on 008g: `photoHighlights=2`, both `imageBroken=false`, ledger highlights 4, events 2, Console `[]`; screenshot shows non-white photos. | Data passed / pending UIUX visual acceptance |
| Share return layout is cool, short, and suitable for screenshot saving | User confirmed on 2026-06-19 that the previous crop finding came from PM screenshot-region selection, and the page is actually normal. Frontend 14.73 also added safe-width layout fixes and passed static checks. | Misread corrected / no longer 008W blocked |

## Next Responsibility

1. Frontend / interface: tighten first-photo cover contract if `coverPhotoUrl` can differ from first timeline photo.
2. Frontend / UGC: apply the 008Y rule that legacy review fields may remain internal but must not block or appear in user-facing photo, album, brief, share page, or saved PNG flows.
3. Frontend: fix `session-brief` original-image preview spinner by passing preview-loadable URLs to `wx.previewImage`; interface gives URL reachability proof; test retests only that single point.
4. Frontend / interface / test: execute 008AG for invite friend page card, share path, click-to-join contract, avatar slots, and refresh.
5. Test / PM: retest only changed weak nodes; do not repeat 008O / 008R / pure invite matrix.
6. UIUX: when available, review share return using the correct right-preview capture area; do not reopen 008W based on the old wrong crop.
