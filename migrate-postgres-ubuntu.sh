#!/usr/bin/env bash
set -Eeuo pipefail

# Source database (remote, read-only export)
SRC_HOST="101.33.75.223"
SRC_PORT="31812"
SRC_DB="zeabur"
SRC_USER="root"
SRC_PASS="d2507Rf6Vcb4NI9BUKpkLejoY1EmwP83"

# Target PostgreSQL container / database
PG_CONTAINER="1Panel-postgresql-Qt6y"
DST_HOST="127.0.0.1"
DST_PORT="5432"
DST_DB="newapi"
DST_USER="user_rmzsQn"
DST_PASS="password_bDWewb"
MAINT_DB="template1"

HOST_DUMP_DIR="/tmp/pg-migrate"
DUMP_FILE="/work/zeabur.dump"

step() {
  echo
  echo ">>> $1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1" >&2
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

run_client() {
  docker run --rm \
    --network "container:$PG_CONTAINER" \
    -v "$HOST_DUMP_DIR:/work" \
    "$@"
}

require_cmd docker
mkdir -p "$HOST_DUMP_DIR"

if ! docker inspect "$PG_CONTAINER" >/dev/null 2>&1; then
  echo "Container '$PG_CONTAINER' does not exist." >&2
  exit 1
fi

if [[ "$(docker inspect -f '{{.State.Running}}' "$PG_CONTAINER")" != "true" ]]; then
  echo "Container '$PG_CONTAINER' is not running." >&2
  exit 1
fi

PG_CLIENT_IMAGE="$(docker inspect -f '{{.Config.Image}}' "$PG_CONTAINER")"
if [[ -z "$PG_CLIENT_IMAGE" || "$PG_CLIENT_IMAGE" == "<no value>" ]]; then
  echo "Failed to resolve image for container '$PG_CONTAINER'." >&2
  exit 1
fi

step "Check source database connection from temporary client container (read-only)"
run_client \
  -e PGPASSWORD="$SRC_PASS" \
  "$PG_CLIENT_IMAGE" \
  psql \
  -h "$SRC_HOST" \
  -p "$SRC_PORT" \
  -U "$SRC_USER" \
  -d "$SRC_DB" \
  -v ON_ERROR_STOP=1 \
  -c "SELECT current_database(), current_user;"

step "Check target database connection through target container network"
run_client \
  -e PGPASSWORD="$DST_PASS" \
  "$PG_CLIENT_IMAGE" \
  psql \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  -d "$MAINT_DB" \
  -v ON_ERROR_STOP=1 \
  -c "SELECT current_database(), current_user;"

step "Check whether target database already exists"
DB_EXISTS="$(run_client \
  -e PGPASSWORD="$DST_PASS" \
  "$PG_CLIENT_IMAGE" \
  psql \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  -d "$MAINT_DB" \
  -tAc "SELECT 1 FROM pg_database WHERE datname = '$DST_DB';" | tr -d '[:space:]')"

if [[ "$DB_EXISTS" == "1" ]]; then
  echo "Target database '$DST_DB' already exists. Stop to avoid overwrite." >&2
  exit 1
fi

step "Export source database to dump file via temporary client container"
rm -f "$HOST_DUMP_DIR/zeabur.dump"
run_client \
  -e PGPASSWORD="$SRC_PASS" \
  "$PG_CLIENT_IMAGE" \
  pg_dump \
  -h "$SRC_HOST" \
  -p "$SRC_PORT" \
  -U "$SRC_USER" \
  -d "$SRC_DB" \
  -Fc \
  --no-owner \
  --no-privileges \
  -f "$DUMP_FILE"

if [[ ! -f "$HOST_DUMP_DIR/zeabur.dump" ]]; then
  echo "Export failed: dump file was not created." >&2
  exit 1
fi

step "Create target database"
run_client \
  -e PGPASSWORD="$DST_PASS" \
  "$PG_CLIENT_IMAGE" \
  createdb \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  "$DST_DB"

step "Restore data into target database"
run_client \
  -e PGPASSWORD="$DST_PASS" \
  "$PG_CLIENT_IMAGE" \
  pg_restore \
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
run_client \
  -e PGPASSWORD="$DST_PASS" \
  "$PG_CLIENT_IMAGE" \
  psql \
  -h "$DST_HOST" \
  -p "$DST_PORT" \
  -U "$DST_USER" \
  -d "$DST_DB" \
  -v ON_ERROR_STOP=1 \
  -c "\\dt"

echo
echo "Migration completed."
echo "Source database was not modified. Host dump file: $HOST_DUMP_DIR/zeabur.dump"