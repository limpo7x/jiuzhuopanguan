{
  "manifestVersion": "clean-slate-phase1-scan-before",
  "batch": "PRCS-20260618-003",
  "product": "party-recorder",
  "status": "partial-scan-before-only",
  "apiBase": "local-node-script",
  "sourceCommand": "node backend/scripts/smoke-clean-slate-phase1.js",
  "privateManifestPath": "docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest.private.json",
  "privateManifestCreated": false,
  "sanitizedManifestPath": "docs/runtime/pr-int-clean-slate-PRCS-20260618-003-manifest-sanitized.json",
  "scanBeforeEvidence": "docs/runtime/pr-int-clean-slate-PRCS-20260618-003-scan-before.json",
  "profiles": {
    "host": {
      "profileId": "user-1781507686650-a33705",
      "tokenTail": "",
      "role": "host"
    },
    "memberA": {
      "profileId": "user-1781507686651-a46952",
      "tokenTail": "",
      "role": "member"
    },
    "memberB": {
      "profileId": "user-1781507686651-000860",
      "tokenTail": "",
      "role": "member"
    },
    "outsider": {
      "profileId": "",
      "tokenTail": "",
      "role": "outsider"
    }
  },
  "primaryIds": {
    "partyId": "session-1781507687012-e4343d",
    "sessionId": "session-1781507687012-e4343d",
    "inviteCode": "C56EVT",
    "briefId": "brief-1781507687042-d1990edd",
    "photoIds": [
      "moment-1781507687032-eb1806a4",
      "moment-1781507687039-ee0677bb"
    ],
    "ledgerEventId": "event-1781507687041-e380feb7",
    "shareTaskId": "share-task-it-moments-20260615-expired",
    "reportId": "moment-report-it-moments-20260615"
  },
  "frontendQueries": {
    "album": "/pages/album/index",
    "albumUnshared": "/pages/album/index?mode=unshared",
    "ledger": "/pages/ledger/index",
    "privacyFiltered": "/pages/privacy-state/index?type=filtered"
  },
  "fieldCoverage": {
    "covered": [
      "party.partyId",
      "party.sessionId",
      "party.inviteCode",
      "party.members",
      "party.photoHighlights",
      "party.ledgerSummary",
      "party.eventHighlights",
      "party.shareContentFilter",
      "party.visibleNodeIds",
      "party.filteredNodeIds",
      "party.permissionState",
      "brief.briefId",
      "brief.timeline",
      "brief.accountingHighlights",
      "brief.ledgerSummary",
      "brief.settlementSummary",
      "brief.eventHighlights",
      "brief.shareContentFilter",
      "share.taskId",
      "share.status",
      "share.layoutMode",
      "moderation.reportId"
    ],
    "missing": [
      "new PRCS IDs",
      "complete private token manifest",
      "brief.albumSummary",
      "non-empty brief.photoHighlights",
      "share.ready imageUrl",
      "share.imageSha256",
      "share.imageSize",
      "share.returnShareId",
      "moderation.reviewCaseIds",
      "outsider profile/token negative case"
    ]
  },
  "warnings": [
    "This sanitized manifest is a scan-before summary over local clean facade smoke, not a clean actual fixture pass.",
    "IDs still come from legacy INT-DATA-001 local store and must not be used as PRCS final acceptance IDs.",
    "No full token was read or written.",
    "No cleanup was executed."
  ],
  "skipped": [
    "private manifest generation",
    "cleanup",
    "api.pomer.cn scan"
  ]
}
