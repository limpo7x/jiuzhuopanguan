#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/www/wwwroot/jiuzhuopanguan-git/backend}"
BACKUP_ROOT="${BACKUP_ROOT:-/www/backup/jiuzhuopanguan}"
STAMP="${STAMP:-$(date +%Y%m%d%H%M%S)}"
OUT_DIR="${BACKUP_ROOT}/ops-009-oss-env-${STAMP}"
ENV_FILE="${APP_ROOT}/.env"

required_vars=(
  OSS_ACCESS_KEY_ID
  OSS_ACCESS_KEY_SECRET
)

for name in "${required_vars[@]}"; do
  if [ -z "${!name:-}" ]; then
    echo "missing required environment variable: ${name}" >&2
    exit 2
  fi
done

mkdir -p "${OUT_DIR}"

write_redacted_env() {
  local source_file="$1"
  local target_file="$2"
  awk -F= '
    /^[[:space:]]*#/ || NF < 2 { print; next }
    {
      key=$1
      value=substr($0, length(key) + 2)
      if (key ~ /(SECRET|PASSWORD|ACCESS_KEY|TOKEN|COOKIE|PRIVATE|CREDENTIAL)/) {
        print key "=<redacted len=" length(value) ">"
      } else {
        print
      }
    }
  ' "${source_file}" > "${target_file}"
}

write_redacted_env "${ENV_FILE}" "${OUT_DIR}/env.before.redacted"

set_kv() {
  local key="$1"
  local value="$2"
  local escaped
  escaped="$(printf '%s' "${value}" | sed 's/[\/&]/\\&/g')"
  if grep -qE "^${key}=" "${ENV_FILE}"; then
    sed -i "s/^${key}=.*/${key}=${escaped}/" "${ENV_FILE}"
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${ENV_FILE}"
  fi
}

set_kv UPLOAD_PROVIDER "oss"
set_kv UPLOAD_BUCKET "${UPLOAD_BUCKET:-pomer-party-recorder-prod}"
set_kv UPLOAD_REGION "${UPLOAD_REGION:-oss-cn-beijing}"
set_kv UPLOAD_PUBLIC_BASE_URL "${UPLOAD_PUBLIC_BASE_URL:-https://cdn.pomer.cn}"
set_kv OSS_SOURCE_HOST "${OSS_SOURCE_HOST:-pomer-party-recorder-prod.oss-cn-beijing.aliyuncs.com}"
set_kv OSS_ACCESS_KEY_ID "${OSS_ACCESS_KEY_ID}"
set_kv OSS_ACCESS_KEY_SECRET "${OSS_ACCESS_KEY_SECRET}"
set_kv OSS_TIMEOUT_MS "${OSS_TIMEOUT_MS:-60000}"
set_kv OSS_AUTHORIZATION_V4 "${OSS_AUTHORIZATION_V4:-1}"
set_kv UPLOAD_LOCAL_MIRROR "${UPLOAD_LOCAL_MIRROR:-1}"

write_redacted_env "${ENV_FILE}" "${OUT_DIR}/env.after.redacted"

cd "${APP_ROOT}"
node -e "require('./data/object-storage'); console.log('object-storage load ok')"
pm2 restart jiuzhuopanguan-backend --update-env
sleep 2
pm2 describe jiuzhuopanguan-backend > "${OUT_DIR}/pm2-describe-after.txt" 2>&1 || true
node -e "require('./load-env'); const s=require('./data/object-storage'); console.log(JSON.stringify({provider:s.getUploadProvider(), sample:s.getPublicUrl('moments/ops009-env-check.txt')}))" > "${OUT_DIR}/provider-after.json"

echo "${OUT_DIR}"
