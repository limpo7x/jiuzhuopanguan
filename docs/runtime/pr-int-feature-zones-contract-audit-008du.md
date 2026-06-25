{
  "taskId": "PR-INT-CLEAN-SLATE-ACTUAL-MANIFEST-006-RUN",
  "seed": "prcs-006",
  "marker": "prcs-clean-slate-actual-prcs-006",
  "environment": "local-json-store",
  "apiBase": "local helper, no api.pomer.cn write",
  "generatedAt": "2026-06-18T03:24:26.752Z",
  "scanCommand": "node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006",
  "source": {
    "script": "backend/scripts/manage-clean-slate-actual-fixture.js",
    "mode": "inspect",
    "privateManifestPath": "%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-006-manifest.private.json",
    "privateManifestContent": "not published"
  },
  "matches": {
    "liveSessions": [
      {
        "sessionId": "session-1781753066622-4b386b",
        "inviteCode": "YYRXUP",
        "source": "prcs-clean-slate-actual-prcs-006"
      }
    ],
    "counts": {
      "liveSessions": 1,
      "momentRecords": 3,
      "sessionEvents": 2,
      "sessionBriefs": 1,
      "shareImageTasks": 2,
      "uploadedAssets": 3,
      "photoFilesExisting": 3,
      "shareImageFilesExisting": 1
    },
    "photoFiles": [
      {
        "filePath": "backend/public/uploads/moments/session-1781753066622-4b386b/1781753066630-party-private-2de4c5.webp",
        "exists": true
      },
      {
        "filePath": "backend/public/uploads/moments/session-1781753066622-4b386b/1781753066628-party-highlight-54d0c8.webp",
        "exists": true
      },
      {
        "filePath": "backend/public/uploads/moments/session-1781753066622-4b386b/1781753066624-party-opening-92ada8.webp",
        "exists": true
      }
    ],
    "shareImageFiles": [
      {
        "filePath": "backend/public/uploads/moments/share-tasks/share-task-1781753066636-c3fc0fb3.png",
        "exists": true
      }
    ]
  },
  "warnings": [
    "local only; no api.pomer.cn write or deployment proof",
    "cleanup not executed; fixture remains for QA/frontend rerun"
  ],
  "skipped": [
    "reviewCaseIds",
    "reportId",
    "outsider API negative check",
    "no-token API negative check",
    "online scan"
  ],
  "cleanupPlan": {
    "inspectBeforeCleanup": "node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006",
    "cleanupActualFixture": "node backend/scripts/manage-clean-slate-actual-fixture.js --mode cleanup --seed prcs-006",
    "inspectAfterCleanup": "node backend/scripts/manage-clean-slate-actual-fixture.js --mode inspect --seed prcs-006",
    "optionalPrivateProfileCleanup": "node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-006",
    "expectedAfterCleanup": {
      "liveSessions": 0,
      "momentRecords": 0,
      "sessionEvents": 0,
      "sessionBriefs": 0,
      "shareImageTasks": 0,
      "uploadedAssets": 0,
      "photoFilesExisting": 0,
      "shareImageFilesExisting": 0
    }
  }
}
