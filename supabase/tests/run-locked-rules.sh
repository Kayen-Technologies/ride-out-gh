#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
DATA=$(mktemp -d)
PORT=54329

cleanup() {
  pg_ctl -D "$DATA/pg" stop -m fast >/dev/null 2>&1 || true
  rm -rf "$DATA"
}
trap cleanup EXIT

initdb -D "$DATA/pg" --username=postgres --auth=trust --no-sync >/dev/null
pg_ctl -D "$DATA/pg" -o "-p $PORT -k $DATA" -l "$DATA/pg.log" start >/dev/null
psql -h "$DATA" -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -c "create database ride_out_test" >/dev/null
psql -h "$DATA" -p "$PORT" -U postgres -d ride_out_test -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/bootstrap.sql" >/dev/null
psql -h "$DATA" -p "$PORT" -U postgres -d ride_out_test -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20261028000000_init.sql" >/dev/null
psql -h "$DATA" -p "$PORT" -U postgres -d ride_out_test -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20261028000100_cms.sql" >/dev/null
psql -h "$DATA" -p "$PORT" -U postgres -d ride_out_test -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/locked_rules.sql" >/dev/null

echo "locked rules passed"
