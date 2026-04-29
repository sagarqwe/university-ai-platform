#!/bin/bash
# File: docs/database/wait-for-db.sh
# Purpose: Waits until PostgreSQL is ready. Used in CI or manual startup order.
# Usage: bash wait-for-db.sh

HOST="${PGHOST:-localhost}"
PORT="${PGPORT:-5432}"
USER="${PGUSER:-postgres}"
DB="${PGDATABASE:-university_ai_db}"
TIMEOUT=60

echo "Waiting for PostgreSQL at $HOST:$PORT/$DB..."

for i in $(seq 1 $TIMEOUT); do
    pg_isready -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL is ready after ${i}s"
        exit 0
    fi
    sleep 1
done

echo "❌ PostgreSQL did not become ready in ${TIMEOUT}s"
exit 1
