{
  "manifestVersion": "clean-slate-actual-manifest-005-sanitized",
  "batch": "PRCS-20260618-005",
  "product": "party-recorder",
  "status": "partial-token-manifest-generated",
  "apiBase": "local-node-script",
  "privateManifestPath": "%TEMP%/jiuzhuopanguan-private/pr-int-clean-slate-PRCS-20260618-005-manifest.private.json",
  "privateManifestCreated": true,
  "sanitizedManifestPath": "docs/runtime/pr-int-clean-slate-PRCS-20260618-005-manifest-sanitized.json",
  "scanBeforeEvidence": "docs/runtime/pr-int-clean-slate-PRCS-20260618-005-scan-before.json",
  "profiles": {
    "host": {
      "profileId": "user-1781750973039-6bebeb",
      "tokenTail": "800c2717",
      "role": "host"
    },
    "memberA": {
      "profileId": "user-1781750973040-d3b4a7",
      "tokenTail": "23a57387",
      "role": "member"
    },
    "memberB": {
      "profileId": "user-1781750973040-280cc1",
      "tokenTail": "d07afc11",
      "role": "member"
    },
    "outsider": {
      "profileId": "user-1781750973040-c4e5c8",
      "tokenTail": "c065ca91",
      "role": "outsider"
    }
  },
  "primaryIds": {
    "partyId": "session-1781507687012-e4343d",
    "sessionId": "session-1781507687012-e4343d",
    "inviteCode": "C56EVT",
    "briefId": "brief-1781507687042-d1990edd",
    "photoIds": [
      "moment-1781507687032-eb1806a4"
    ],
    "ledgerEventId": "event-1781507687041-e380feb7",
    "shareImageId": "share-task-1781507687046-d1098582",
    "reportId": "moment-report-it-moments-20260615"
  },
  "frontendQueries": {
    "album": "/pages/album/index",
    "albumUnshared": "/pages/album/index?mode=unshared",
    "ledger": "/pages/ledger/index",
    "privacyFiltered": "/pages/privacy-state/index?type=filtered",
    "brief": "waiting frontend 004 actual query",
    "share": "waiting frontend 004 actual query",
    "shareReturn": "waiting frontend 004 actual query"
  },
  "apiSummary": {
    "sourceCommand": "node backend/scripts/smoke-clean-slate-phase1.js",
    "undeployed": true,
    "payloadWhitelists": {
      "partiesLive": [
        "partyId",
        "inviteCode",
        "title",
        "coverImageUrl",
        "status",
        "memberCount",
        "joinedCount",
        "photoHighlights",
        "accountingHighlights",
        "ledgerSummary",
        "keyEvents",
        "shareNotice",
        "summary"
      ],
      "briefs": [
        "briefId",
        "partyId",
        "title",
        "coverMode",
        "generatedAt",
        "photoHighlights",
        "accountingHighlights",
        "ledgerSummary",
        "settlementSummary",
        "keyEvents",
        "shareNotice",
        "summary"
      ],
      "shareImages": [
        "shareImageId",
        "partyId",
        "briefId",
        "status",
        "renderMode",
        "imageUrl",
        "includeLedger",
        "createdAt",
        "finishedAt",
        "message"
      ]
    }
  },
  "warnings": [
    "Private token handoff is unblocked, but clean actual party/photo/ledger/brief/shareImage data is still not generated.",
    "Primary IDs still point to legacy INT-DATA-001 local data and must not be used as clean acceptance IDs.",
    "Full tokens are stored only in the private manifest path, not in this sanitized file.",
    "Cleanup has not been run."
  ],
  "skipped": [
    "cleanup",
    "online write",
    "online scan",
    "actual clean data creation"
  ],
  "cleanupPlan": {
    "seed": "prcs-005",
    "command": "node backend/scripts/manage-clean-slate-private-manifest.js --mode cleanup --seed prcs-005",
    "residualCheck": "node backend/scripts/manage-clean-slate-private-manifest.js --mode inspect --seed prcs-005",
    "notRun": true
  }
}
