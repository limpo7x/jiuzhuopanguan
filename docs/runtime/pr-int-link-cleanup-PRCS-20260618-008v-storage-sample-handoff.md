# PR-INT-LINK-CLEANUP-008V-STORAGE-SAMPLE-HANDOFF

## Scope

- Task: `PR-INT-LINK-CLEANUP-008V-STORAGE-SAMPLE-HANDOFF`
- Mode: storage handoff only
- DevTools: not executed
- Online access: not executed
- Cleanup: not executed
- Full token policy: full token stays in private/env or local private store; public evidence records token tails only.

## Problem

QA retested the non-white `prcs-008g` query while DevTools storage still held old `prcs-008` memberA token tail `4ea6c85e`.

Mismatch:

| Sample | sessionId | memberA profileId | token tail |
| --- | --- | --- | --- |
| old `prcs-008` | `session-1781756527692-d277f0` | `user-1781756527691-ff0197` | `4ea6c85e` |
| non-white `prcs-008g` | `session-1781787045680-8e406c` | `user-1781787045679-f3f2eb` | `b8615971` |

Result: opening `prcs-008g` share return with the old token can produce empty `photoHighlights/accountingHighlights/keyEvents`. This is a login-state/sample mismatch, not a frontend broken-photo conclusion.

## Recommended Retest Setup

Use `prcs-008g` memberA.

| Storage key | Expected value |
| --- | --- |
| `runtime-api-base` | `http://127.0.0.1:3221/api/v1` |
| `jzp-user-token` | full `prcs-008g` memberA token from private/env only |
| `social-current-profile-id` | `user-1781787045679-f3f2eb` |
| `social-current-profile` | `{ "id": "user-1781787045679-f3f2eb", "name": "聚会记录师成员A", "avatarUrl": "", "signature": "", "identityTag": "" }` |

Public token tail:

```text
b8615971
```

Do not paste full storage output into test reports. If a storage summary is required, report only:

```json
{
  "apiBase": "http://127.0.0.1:3221/api/v1",
  "profileId": "user-1781787045679-f3f2eb",
  "tokenTail": "b8615971",
  "tokenPresent": true
}
```

## Retest Query

Primary 008V retest:

```text
/pages/share-preview/index?sessionId=session-1781787045680-8e406c&inviteCode=J2BEL2&briefId=brief-1781787045693-bc8904b9
```

Reference queries:

```text
/pages/session-brief/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9
/pages/share-poster/index?sessionId=session-1781787045680-8e406c&briefId=brief-1781787045693-bc8904b9&taskId=share-task-1781787045694-9725ffeb
```

## Safe Manual Steps for QA

This document does not execute DevTools. QA may perform these steps in the test window:

1. Read the full `prcs-008g` memberA token from the private/env handoff.
2. Set DevTools storage keys listed above.
3. Verify storage summary prints only token tail `b8615971`.
4. Open the primary 008V retest query.
5. After the single-point retest, restore previous storage if QA needs to continue old `prcs-008` checks.

Restore old `prcs-008` memberA state only if needed:

| Storage key | Expected value |
| --- | --- |
| `runtime-api-base` | `http://127.0.0.1:3221/api/v1` |
| `jzp-user-token` | full old `prcs-008` memberA token from private/env only |
| `social-current-profile-id` | `user-1781756527691-ff0197` |
| token tail | `4ea6c85e` |

## Verification

Local store read confirmed both tokens exist without printing full token:

| profileId | token tail | hasToken |
| --- | --- | --- |
| `user-1781787045679-f3f2eb` | `b8615971` | `true` |
| `user-1781756527691-ff0197` | `4ea6c85e` | `true` |

Local 3221 is listening:

| Field | Value |
| --- | --- |
| API base | `http://127.0.0.1:3221/api/v1` |
| PID | `18088` |

## Responsibility Judgment

Recommended path: switch storage to `prcs-008g` memberA token tail `b8615971` and use the 008g query.

No alternate sample is needed right now because the non-white `prcs-008g` sample already exists and is clean-facade readable. If QA cannot safely switch DevTools storage, the fallback is to ask interface/backend fixture owner to create a non-white sample under old `prcs-008` member token tail `4ea6c85e`; this task did not create that fallback.

## Warnings / Skipped

- DevTools storage was not modified by interface integration in this task.
- No full token was printed.
- No online API was accessed.
- No cleanup was executed.
- This does not mark page/test/UIUX pass; it only supplies the correct sample login-state handoff.
