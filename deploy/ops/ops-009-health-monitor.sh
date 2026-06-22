#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/www/wwwroot/jiuzhuopanguan-git/backend}"
BACKUP_ROOT="${BACKUP_ROOT:-/www/backup/jiuzhuopanguan}"
STAMP="${STAMP:-$(date +%Y%m%d%H%M%S)}"
OUT_DIR="${BACKUP_ROOT}/ops-009-health-${STAMP}"
SERVICE_NAME="${SERVICE_NAME:-jiuzhuopanguan-backend}"
API_BASE="${API_BASE:-https://api.pomer.cn}"
CDN_CHECK_URL="${CDN_CHECK_URL:-https://cdn.pomer.cn/cdn-check.png}"

mkdir -p "${OUT_DIR}/nginx" "${OUT_DIR}/mysql" "${OUT_DIR}/pm2" "${OUT_DIR}/http"

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

status=0
record_fail() {
  status=1
  echo "$1" >> "${OUT_DIR}/FAILURES.txt"
}

run_check() {
  local name="$1"
  shift
  if "$@" > "${OUT_DIR}/${name}.out" 2> "${OUT_DIR}/${name}.err"; then
    echo "ok ${name}" >> "${OUT_DIR}/CHECKS.txt"
  else
    local code=$?
    echo "fail ${name} exit=${code}" >> "${OUT_DIR}/CHECKS.txt"
    record_fail "${name}"
  fi
}

{
  echo "target=api.pomer.cn"
  echo "service=${SERVICE_NAME}"
  echo "app_root=${APP_ROOT}"
  echo "out_dir=${OUT_DIR}"
  echo "started_at=$(date -Iseconds)"
} > "${OUT_DIR}/SUMMARY.txt"

nginx -t > "${OUT_DIR}/nginx/nginx-test.txt" 2>&1 || record_fail "nginx -t"
NGINX_FULL_TMP="$(mktemp)"
nginx -T > "${NGINX_FULL_TMP}" 2>&1 || true
grep -n "api.pomer.cn" "${NGINX_FULL_TMP}" > "${OUT_DIR}/nginx/api-pomer-cn-grep.txt" 2>&1 || record_fail "nginx api.pomer.cn config grep"
rm -f "${NGINX_FULL_TMP}"

MYSQL_ARGS=(-h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_USER}" --default-character-set=utf8mb4)
mysql "${MYSQL_ARGS[@]}" "${MYSQL_DATABASE}" \
  -e "SELECT COUNT(*) AS app_store_rows FROM app_store; SELECT COUNT(*) AS normalized_wine_sessions FROM wine_sessions; SELECT COUNT(*) AS normalized_moment_records FROM moment_records;" \
  > "${OUT_DIR}/mysql/counts.txt" 2> "${OUT_DIR}/mysql/counts.err" || record_fail "mysql counts"
node scripts/audit-normalized-tables.js > "${OUT_DIR}/mysql/audit-normalized-tables.json" 2> "${OUT_DIR}/mysql/audit-normalized-tables.err" || record_fail "audit normalized tables"

pm2 describe "${SERVICE_NAME}" > "${OUT_DIR}/pm2/describe.txt" 2> "${OUT_DIR}/pm2/describe.err" || record_fail "pm2 describe"
pm2 jlist 2> "${OUT_DIR}/pm2/jlist.err" | redact_pm2_json > "${OUT_DIR}/pm2/jlist.redacted.json" || record_fail "pm2 jlist"
pm2 logs "${SERVICE_NAME}" --lines 160 --nostream > "${OUT_DIR}/pm2/logs.txt" 2> "${OUT_DIR}/pm2/logs.err" || true
grep -Ei "error|exception|unhandled|fatal|ECONN|EADDR|ER_|timeout" "${OUT_DIR}/pm2/logs.txt" > "${OUT_DIR}/pm2/error-keywords.txt" 2>&1 || true

curl -fsS -o /dev/null -w "home http=%{http_code} content_type=%{content_type} size=%{size_download} time_total=%{time_total}\n" \
  "${API_BASE}/api/v1/config/home" > "${OUT_DIR}/http/config-home.txt" 2> "${OUT_DIR}/http/config-home.err" || record_fail "api config home"
curl -fsS -o /dev/null -w "admin_login http=%{http_code} content_type=%{content_type} size=%{size_download} time_total=%{time_total}\n" \
  "${API_BASE}/admin/login" > "${OUT_DIR}/http/admin-login.txt" 2> "${OUT_DIR}/http/admin-login.err" || record_fail "admin login"
curl -fsSI "${CDN_CHECK_URL}" > "${OUT_DIR}/http/cdn-check.headers.txt" 2> "${OUT_DIR}/http/cdn-check.err" || record_fail "cdn check"

{
  echo "finished_at=$(date -Iseconds)"
  echo "status=${status}"
  echo "nginx_test=${OUT_DIR}/nginx/nginx-test.txt"
  echo "mysql_counts=${OUT_DIR}/mysql/counts.txt"
  echo "normalized_audit=${OUT_DIR}/mysql/audit-normalized-tables.json"
  echo "pm2_describe=${OUT_DIR}/pm2/describe.txt"
  echo "pm2_logs=${OUT_DIR}/pm2/logs.txt"
  echo "http_dir=${OUT_DIR}/http"
  echo "failure_file=${OUT_DIR}/FAILURES.txt"
} >> "${OUT_DIR}/SUMMARY.txt"

echo "${OUT_DIR}"
exit "${status}"
