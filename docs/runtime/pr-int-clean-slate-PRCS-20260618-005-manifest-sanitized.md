# PR-INT Clean Slate 005 Sanitized Manifest Summary

- batch: `PRCS-20260618-005`
- status: `partial-token-manifest-generated`
- private manifest: `%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-005-manifest.private.json`
- sanitized manifest: `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-manifest-sanitized.json`
- scan-before evidence: `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-scan-before.json`
- cleanup: not run

## Token Handoff

| role | profileId | tokenTail |
| --- | --- | --- |
| host | `user-1781750973039-6bebeb` | `800c2717` |
| memberA | `user-1781750973040-d3b4a7` | `23a57387` |
| memberB | `user-1781750973040-280cc1` | `d07afc11` |
| outsider | `user-1781750973040-c4e5c8` | `c065ca91` |

Full tokens are only in the private manifest path. They are not present in this file.

## API / Smoke Summary

| area | summary |
| --- | --- |
| command | `node backend/scripts/smoke-clean-slate-phase1.js` |
| deployment | `undeployed=true`; no `api.pomer.cn` write or scan |
| party | `session-1781507687012-e4343d`, invite `C56EVT`, local clean facade payload |
| brief | `brief-1781507687042-d1990edd`, includes photo, ledger, settlement, key events and share notice fields |
| share image | `share-task-1781507687046-d1098582`, `status=ready`, local old image path |
| cleanup seed | `prcs-005`, retained for testing |

## Frontend Queries

| page | query |
| --- | --- |
| album | `/pages/album/index` |
| album unshared | `/pages/album/index?mode=unshared` |
| ledger | `/pages/ledger/index` |
| privacy filtered | `/pages/privacy-state/index?type=filtered` |
| brief | waiting frontend 004 actual query |
| share | waiting frontend 004 actual query |
| share return | waiting frontend 004 actual query |

## Warnings

- Private token handoff is unblocked.
- Actual clean party/photo/ledger/brief/shareImage creation is still blocked because backend 005 only provides token handoff.
- Primary party/brief/share IDs still come from legacy local `INT-DATA-001` data and must not be used as clean acceptance IDs.
- Cleanup was not run. To clean this token seed later: `node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-005`.
