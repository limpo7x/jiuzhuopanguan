# PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-006-RUN Index

## Files

| Type | Path | Public token policy |
| --- | --- | --- |
| private manifest | `%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-006-manifest.private.json` | private only; not published |
| sanitized manifest | `docs/runtime/pr-int-clean-slate-PRCS-20260618-006-manifest-sanitized.json` | token tails only |
| sanitized summary | `docs/runtime/pr-int-clean-slate-PRCS-20260618-006-manifest-sanitized.md` | token tails only |
| scan-before | `docs/runtime/pr-int-clean-slate-PRCS-20260618-006-scan-before.json` | no full token |

## Run Order

1. Inspect seed before/after create:

   ```powershell
   node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
   ```

2. Create actual clean fixture and private manifest:

   ```powershell
   node backend/scripts/manage-clean-slate-actual-fixture.js --mode create --seed prcs-006 --output $env:TEMP\jiuzhuopanguan-private\pr-int-clean-slate-PRCS-20260618-006-manifest.private.json
   ```

3. Keep fixture for QA/frontend rerun; do not cleanup in 006-RUN.

## Current Residual Snapshot

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

## QA Entry Points

- API base: local helper/local backend data generated from JSON store. If QA needs HTTP calls, start the matching local backend and use the same local store; do not point this manifest at `api.pomer.cn` until an online seed task exists.
- Role storage: inject host/member token from private manifest only in QA window; logs may print only token tail.
- Recommended first pass: host token tail `a344ca32`, then memberA token tail `12d644a0`.
- Permission counterexamples: outsider token tail `4a136953` and no-token checks are reserved but not executed in this run.

## Cleanup Responsibility

Cleanup is deferred. When PM assigns cleanup, run:

```powershell
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-006
node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006
```

If the four private profiles/tokens are no longer needed:

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-006
```
