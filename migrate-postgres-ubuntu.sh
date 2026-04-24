#!/usr/bin/env bash
set -Eeuo pipefail

# Source database (remote)
SRC_HOST="101.33.75.223"
SRC_PORT="31812"
SRC_DB="zeabur"
SRC_USER="root"
SRC_PASS="d2507Rf6Vcb4NI9BUKpkLejoY1EmwP83"

# Target database (run this script on the Ubuntu target server)
DST_HOST="127.0.0.1"
DST_PORT="5432"
DST_DB="newapi"
DST_USER="user_rmzsQn"
DST_PASS="password_bDWewb"

DUMP_FILE="/tmp/zeabur.dump"

step() {
  echo
  echo ">>> $1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1" >&2
    echo "Install PostgreSQL client tools first:" >&2
    echo "  sudo apt update && sudo apt install -y postgresql-client" >&2
    exit 1
  fi
}

cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo
    echo "Migration failed with exit code $exit_code" >&2
  fi
}
trap cleanup EXIT

require_cmd psql
require_cmd pg_dump
require_cmd pg_restore
require_cmd createdb

step "Check source database connection (read-only)"
PGPASSWORD="$SRC_PASS" psql \
  -h "$SRC_HOST" \
  -p "$SRC_PORT" \
  -U "$SRC_USER" \
  -d "$SRC_DB" \
  -v ON_ERROR_STOP=1 \
  -c "SELECT current_database(), current_user;"

step "Check target database connection"
PGPASSWORD="$DST_PASS" psql \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  -d postgres \
  -v ON_ERROR_STOP=1 \
  -c "SELECT current_database(), current_user;"

step "Check whether target database already exists"
if PGPASSWORD="$DST_PASS" psql \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  -d postgres \
  -tAc "SELECT 1 FROM pg_database WHERE datname = '$DST_DB';" | grep -q '^1$'; then
  echo "Target database '$DST_DB' already exists. Stop to avoid overwrite." >&2
  exit 1
fi

step "Export source database to local dump file"
rm -f "$DUMP_FILE"
PGPASSWORD="$SRC_PASS" pg_dump \
  -h "$SRC_HOST" \
  -p "$SRC_PORT" \
  -U "$SRC_USER" \
  -d "$SRC_DB" \
  -Fc \
  --no-owner \
  --no-privileges \
  -f "$DUMP_FILE"

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Export failed: dump file was not created." >&2
  exit 1
fi

step "Create target database"
PGPASSWORD="$DST_PASS" createdb \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  "$DST_DB"

step "Restore data into target database"
PGPASSWORD="$DST_PASS" pg_restore \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  -d "$DST_DB" \
  --exit-on-error \
  --single-transaction \
  --no-owner \
  --no-privileges \
  "$DUMP_FILE"

step "Verify migrated tables"
PGPASSWORD="$DST_PASS" psql \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  -d "$DST_DB" \
  -v ON_ERROR_STOP=1 \
  -c "\\dt"

echo
echo "Migration completed."
echo "Source database was not modified. Local dump file: $DUMP_FILE"