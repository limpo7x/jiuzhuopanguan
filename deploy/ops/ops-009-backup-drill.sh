#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/www/wwwroot/jiuzhuopanguan-git/backend}"
BACKUP_ROOT="${BACKUP_ROOT:-/www/backup/jiuzhuopanguan}"
STAMP="${STAMP:-$(date +%Y%m%d%H%M%S)}"
OUT_DIR="${BACKUP_ROOT}/ops-009-${STAMP}"
RESTORE_TABLE="ops_restore_app_store_${STAMP}"

mkdir -p "${OUT_DIR}/nginx" "${OUT_DIR}/mysql" "${OUT_DIR}/pm2" "${OUT_DIR}/health"

redact_pm2_json() {
  node -e 'let input = ""; process.stdin.on("data", (chunk) => { input += chunk }); process.stdin.on("end", () => { const secret = /(SECRET|PASSWORD|ACCESS_KEY|TOKEN|COOKIE|PRIVATE|CREDENTIAL|MYSQL_PWD)/i; const walk = (value, key = "") => { if (secret.test(key)) return "<redacted>"; if (Array.isArray(value)) return value.map((item) => walk(item)); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, walk(childValue, childKey)])); return value }; console.log(JSON.stringify(walk(JSON.parse(input)), null, 2)) })'
}

cd "${APP_ROOT}"
if [ ! -f ".env" ]; then
  echo "missing ${APP_ROOT}/.env" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DATABASE="${MYSQL_DATABASE:-jiuzhuopanguan}"
MYSQL_USER="${MYSQL_USER:-}"
MYSQL_PWD="${MYSQL_PASSWORD:-}"
export MYSQL_PWD

if [ -z "${MYSQL_USER}" ] || [ -z "${MYSQL_DATABASE}" ]; then
  echo "missing MYSQL_USER or MYSQL_DATABASE in .env" >&2
  exit 1
fi

{
  echo "target=api.pomer.cn"
  echo "app_root=${APP_ROOT}"
  echo "backup_dir=${OUT_DIR}"
  echo "mysql_database=${MYSQL_DATABASE}"
  echo "restore_table=${RESTORE_TABLE}"
  echo "started_at=$(date -Iseconds)"
} > "${OUT_DIR}/SUMMARY.txt"

for conf in \
  /etc/nginx/conf.d/jiuzhuopanguan.conf \
  /www/server/panel/vhost/nginx/api.pomer.cn.conf
do
  if [ -f "${conf}" ]; then
    cp -a "${conf}" "${OUT_DIR}/nginx/$(basename "${conf}").${STAMP}.bak"
  fi
done
nginx -t > "${OUT_DIR}/nginx/nginx-test.txt" 2>&1

pm2 describe jiuzhuopanguan-backend > "${OUT_DIR}/pm2/describe-jiuzhuopanguan-backend.txt" 2>&1 || true
pm2 jlist | redact_pm2_json > "${OUT_DIR}/pm2/pm2-jlist.redacted.json"
pm2 logs jiuzhuopanguan-backend --lines 120 --nostream > "${OUT_DIR}/pm2/logs-jiuzhuopanguan-backend.txt" 2>&1 || true

MYSQL_ARGS=(-h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_USER}" --default-character-set=utf8mb4)
DUMP_FILE="${OUT_DIR}/mysql/${MYSQL_DATABASE}.${STAMP}.sql"
mysqldump "${MYSQL_ARGS[@]}" --single-transaction --quick --routines --triggers --no-tablespaces "${MYSQL_DATABASE}" > "${DUMP_FILE}"
gzip -f "${DUMP_FILE}"

APP_STORE_DUMP="${OUT_DIR}/mysql/app_store.${STAMP}.sql"
mysqldump "${MYSQL_ARGS[@]}" --single-transaction --quick --no-tablespaces "${MYSQL_DATABASE}" app_store > "${APP_STORE_DUMP}"
gzip -f "${APP_STORE_DUMP}"

mysql "${MYSQL_ARGS[@]}" "${MYSQL_DATABASE}" -e "DROP TABLE IF EXISTS \`${RESTORE_TABLE}\`;"
gunzip -c "${APP_STORE_DUMP}.gz" \
  | sed "s/\`app_store\`/\`${RESTORE_TABLE}\`/g" \
  | mysql "${MYSQL_ARGS[@]}" "${MYSQL_DATABASE}"
mysql "${MYSQL_ARGS[@]}" "${MYSQL_DATABASE}" -e "SELECT COUNT(*) AS restored_app_store_rows FROM \`${RESTORE_TABLE}\`;" > "${OUT_DIR}/mysql/restore-app-store-count.txt"
mysql "${MYSQL_ARGS[@]}" "${MYSQL_DATABASE}" -e "DROP TABLE IF EXISTS \`${RESTORE_TABLE}\`;"

curl -fsS -o /dev/null -w "config_home http=%{http_code} content_type=%{content_type} size=%{size_download}\n" \
  https://api.pomer.cn/api/v1/config/home > "${OUT_DIR}/health/api-config-home.txt"
curl -fsS -o /dev/null -w "admin_login http=%{http_code} content_type=%{content_type} size=%{size_download}\n" \
  https://api.pomer.cn/admin/login > "${OUT_DIR}/health/admin-login.txt"
curl -fsSI https://cdn.pomer.cn/cdn-check.png > "${OUT_DIR}/health/cdn-check.headers.txt"

{
  echo "finished_at=$(date -Iseconds)"
  echo "nginx_backup_count=$(find "${OUT_DIR}/nginx" -type f -name '*.bak' | wc -l)"
  echo "mysql_dump=${DUMP_FILE}.gz"
  echo "app_store_dump=${APP_STORE_DUMP}.gz"
  echo "restore_check=${OUT_DIR}/mysql/restore-app-store-count.txt"
  echo "restore_table_dropped=${RESTORE_TABLE}"
  echo "pm2_jlist=${OUT_DIR}/pm2/pm2-jlist.redacted.json"
  echo "health_dir=${OUT_DIR}/health"
} >> "${OUT_DIR}/SUMMARY.txt"

echo "${OUT_DIR}"
