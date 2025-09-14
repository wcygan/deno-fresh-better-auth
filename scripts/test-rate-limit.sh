#!/usr/bin/env bash

BASE="${BASE:-http://localhost:5173}"
ORIGIN="${ORIGIN:-http://local.test}"
EMAIL="${EMAIL:-ratelimit.test@example.com}"
PASS="${PASS:-Bot12345_Bot12345}"
IP="${IP:-203.0.113.10}"
N="${N:-4}"

# Seed user (idempotent; 200/201 or 422 if exists)
curl -s -o /dev/null -w "Signup HTTP %{http_code}\n" \
  "$BASE/api/auth/sign-up/email" \
  -H "origin: $ORIGIN" -H "content-type: application/json" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"name\":\"RL\"}"

echo
hdrs="$(mktemp)"; trap 'rm -f "$hdrs"' EXIT
for i in $(seq 1 "$N"); do
  code="$(curl -s -o /dev/null -D "$hdrs" -w "%{http_code}" \
    "$BASE/api/auth/sign-in/email" \
    -H "origin: $ORIGIN" -H "x-forwarded-for: $IP" \
    -H "content-type: application/json" \
    --data "{\"email\":\"$EMAIL\",\"password\":\"WRONG\"}")"
  retry="$({ grep -i '^x-retry-after:' "$hdrs" || grep -i '^retry-after:' "$hdrs"; } \
    | head -n1 | cut -d':' -f2- | tr -d '\r' | xargs)"
  [ -z "$retry" ] && retry="-"
  echo "Attempt $i: $code (Retry-After: $retry)"
done
