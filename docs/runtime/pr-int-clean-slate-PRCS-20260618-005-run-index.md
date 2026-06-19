# PR-INT Clean Slate 005 Run Index

| Item | Value |
| --- | --- |
| Task | `PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-005-RUN` |
| Batch | `PRCS-20260618-005` |
| Seed | `prcs-005` |
| Private manifest | `%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-005-manifest.private.json` |
| Sanitized manifest | `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-manifest-sanitized.json` |
| Sanitized summary | `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-manifest-sanitized.md` |
| Scan-before | `docs/runtime/pr-int-clean-slate-PRCS-20260618-005-scan-before.json` |
| Cleanup | Not run |
| Online write | Not run |
| `pomer.cn` | Not touched |

## Commands

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode generate --seed prcs-005 --output %TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-005-manifest.private.json
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs-005
node backend/scripts/smoke-clean-slate-phase1.js
```

## Cleanup Plan

```powershell
node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-005
node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs-005
```

Cleanup is intentionally not executed in this run because the private manifest seed is retained for follow-up testing.
