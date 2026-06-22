#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/www/wwwroot/jiuzhuopanguan-git/backend}"
BACKUP_ROOT="${BACKUP_ROOT:-/www/backup/jiuzhuopanguan}"
FLOCK_BIN="$(command -v flock || true)"

if [ -z "${FLOCK_BIN}" ]; then
  echo "missing flock command" >&2
  exit 1
fi

if [ ! -d "${APP_ROOT}" ]; then
  echo "missing app root: ${APP_ROOT}" >&2
  exit 1
fi

mkdir -p "${BACKUP_ROOT}"

TMP_CRON="$(mktemp)"
CURRENT_CRON="$(mktemp)"
CRON_BACKUP="${BACKUP_ROOT}/crontab.before-ops009-$(date +%Y%m%d%H%M%S).txt"
cleanup() {
  rm -f "${TMP_CRON}" "${CURRENT_CRON}"
}
trap cleanup EXIT

crontab -l > "${CURRENT_CRON}" 2>/dev/null || true
cp -a "${CURRENT_CRON}" "${CRON_BACKUP}"
awk '
  $0 == "# BEGIN jiuzhuopanguan ops-009" { skip = 1; next }
  $0 == "# END jiuzhuopanguan ops-009" { skip = 0; next }
  skip != 1 { print }
' "${CURRENT_CRON}" > "${TMP_CRON}"

cat >> "${TMP_CRON}" <<EOF
# BEGIN jiuzhuopanguan ops-009
SHELL=/bin/bash
*/15 * * * * cd ${APP_ROOT} && ${FLOCK_BIN} -n /tmp/jiuzhuopanguan-ops009-health.lock bash -lc 'STAMP=latest BACKUP_ROOT=${BACKUP_ROOT} scripts/ops-009-health-monitor.sh >> ${BACKUP_ROOT}/ops-009-cron-health.log 2>&1'
20 3 * * * cd ${APP_ROOT} && ${FLOCK_BIN} -n /tmp/jiuzhuopanguan-ops009-backup.lock bash -lc 'BACKUP_ROOT=${BACKUP_ROOT} scripts/ops-009-backup-drill.sh >> ${BACKUP_ROOT}/ops-009-cron-backup.log 2>&1'
# END jiuzhuopanguan ops-009
EOF

crontab "${TMP_CRON}"
crontab -l | sed -n '/# BEGIN jiuzhuopanguan ops-009/,/# END jiuzhuopanguan ops-009/p'
