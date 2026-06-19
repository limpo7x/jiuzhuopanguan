# PR-INT 008AC Brief Image URL Reachability

Task: `PR-INT-LINK-CLEANUP-008AC-BRIEF-IMAGE-URL-REACHABILITY`

Checked at: 2026-06-19

Scope:

- Read only local `127.0.0.1:3221` / jiuzhuopanguan data.
- No DevTools, no online write, no cleanup.
- Full token was read only from local store for HTTP auth; public log keeps token tail `b8615971` only.

## Read Scope

QA row:

- `docs/gameplay-moments-test-acceptance-plan.md` 13.16.96

Dispatch row:

- `docs/runtime/ai-thread-dispatch-queue.md` 008AC

Confirmed context:

- QA 13.16.96: tapping `.brief-image-preview-probe` on 008g session brief sets `previewImageCount=2` and `previewImageUrl=http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp`.
- System `wx.previewImage` black preview layer then stays at loading state `1/2`.

## Local API

| Item | Value |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| Asset base | `http://127.0.0.1:3221` |
| sessionId | `session-1781787045680-8e406c` |
| briefId | `brief-1781787045693-bc8904b9` |
| memberA token tail | `b8615971` |

## Commands

```powershell
rg -n "13\.16\.96|008AC|previewImage|查看原图|查看大图|黑色预览|加载态" docs/gameplay-moments-test-acceptance-plan.md
rg -n "008AC|BRIEF-IMAGE-URL-REACHABILITY|previewImage|查看原图|查看大图" docs/runtime/ai-thread-dispatch-queue.md
```

Sanitized HTTP probe:

```powershell
# Script reads backend/data/social-store.json to find token tail b8615971.
# Output prints tokenTail only, then calls:
# GET /api/v1/briefs/brief-1781787045693-bc8904b9
# GET each normalized /uploads/... image URL
node -e "<local read-only 008g brief image reachability probe>"
```

## Field Source

`GET /api/v1/briefs/brief-1781787045693-bc8904b9`:

| Field | Value |
| --- | --- |
| HTTP / code | `200 / 0` |
| `sessionId` | `session-1781787045680-8e406c` |
| `photoHighlights.length` | `2` |
| `timeline` in backend response | absent |
| backend `timeline` image count | `0` |

The backend response does not return `http://store...` or `__store__` image URLs. Image sources are clean `/uploads/...` paths from `photoHighlights`. The mini program can build `timelineNodes` from these clean brief fields.

## Image Reachability

| Source field | Source URL | Normalized URL | GET | Content-Type | Bytes | Dimensions | SHA-256 |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| `photoHighlights[0].imageUrl` | `/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045687-party-highlight-a07ad1.webp` | `200` | `application/octet-stream` | `15388` | `640x420` WebP | `b5b1c05139110a23fe965eebcc0fa8aae0e87fec10f63164c64ec32d559f9190` |
| `photoHighlights[1].imageUrl` | `/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `http://127.0.0.1:3221/uploads/moments/session-1781787045680-8e406c/1781787045682-party-opening-c85a76.webp` | `200` | `application/octet-stream` | `14402` | `640x420` WebP | `4176f7a72273adc5a7edb25b91650c1fba337e82dedc0f0bd501c9a8626786ec` |

## Interface Judgment

The image URLs are reachable and are not `http://store` / `__store__` temporary store URLs.

Backend/API does not need to change the brief payload path shape for this sample: it already returns `/uploads/...` paths that normalize to HTTP GET `200` and real `640x420` WebP bytes.

However, the current static response header is `Content-Type: application/octet-stream`, not `image/webp`. This is acceptable for raw byte reachability evidence, but it is a possible compatibility risk for `wx.previewImage` system preview loading. If the frontend 008AC fix still spins after using the normalized HTTP URL, route the remaining issue to backend/API static asset MIME handling or local dev server static middleware to return `image/webp` for `.webp`.

Frontend 008AC recommendation:

- Do not pass `http://store...` or `__store__` values to `wx.previewImage`.
- For 008g, pass the normalized loadable URL: `http://127.0.0.1:3221/uploads/...webp` or a successfully cached local temp file path.
- Keep logging sanitized `previewImageUrl` and `previewImageCount`; do not log full token.

## Warnings / Skipped

- Skipped DevTools by instruction.
- Skipped online API and any write/cleanup.
- Did not print full token.
- This is URL reachability evidence only; it is not a page pass or `wx.previewImage` pass.
