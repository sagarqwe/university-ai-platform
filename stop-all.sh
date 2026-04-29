#!/bin/bash
# File: stop-all.sh
# Usage: bash stop-all.sh

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/logs"

stop_service() {
    local name=$1
    local pid_file="$LOG_DIR/$2.pid"
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" && echo "✅ Stopped $name (PID: $pid)"
        fi
        rm -f "$pid_file"
    fi
    # Also kill by port as fallback
    local port=$3
    lsof -ti:"$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
}

echo "Stopping all services..."
stop_service "React Frontend"  "frontend"   3000
stop_service "Spring Boot"     "backend"    8080
stop_service "AI Service"      "ai-service" 8000
echo "All services stopped."
