#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# File: university-ai-platform/start-all.sh
# Purpose: Start all 3 services in the correct order with health checks.
# Usage:   bash start-all.sh          (from project root)
# Stop:    bash stop-all.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Preflight checks ──────────────────────────────────────────────────────────
command -v python3 >/dev/null 2>&1 || error "Python 3 not found"
command -v mvn     >/dev/null 2>&1 || error "Maven not found"
command -v npm     >/dev/null 2>&1 || error "Node/npm not found"
command -v psql    >/dev/null 2>&1 || warn  "psql not in PATH — ensure PostgreSQL is running"

echo ""
echo "  ██╗   ██╗███╗   ██╗██╗ █████╗ ██╗"
echo "  ██║   ██║████╗  ██║██║██╔══██╗██║"
echo "  ██║   ██║██╔██╗ ██║██║███████║██║"
echo "  ██║   ██║██║╚██╗██║██║██╔══██║██║"
echo "  ╚██████╔╝██║ ╚████║██║██║  ██║██║"
echo "   ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚═╝"
echo "  University AI Intelligence Platform"
echo ""

# ── 1. AI Service ─────────────────────────────────────────────────────────────
info "Starting AI Service (FastAPI)..."
cd "$ROOT/ai-service"

if [ ! -f ".env" ]; then
    warn ".env not found in ai-service. Copying from .env.example..."
    cp .env.example .env
    warn "⚠️  Edit ai-service/.env and add your GEMINI_API_KEY or OPENAI_API_KEY!"
fi

mkdir -p data/pdfs

nohup python3 main.py > "$LOG_DIR/ai-service.log" 2>&1 &
AI_PID=$!
echo $AI_PID > "$LOG_DIR/ai-service.pid"
info "AI Service starting (PID: $AI_PID) — logs: logs/ai-service.log"

# Wait for AI service health check
info "Waiting for AI service to be ready..."
for i in $(seq 1 20); do
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        info "✅ AI Service ready at http://localhost:8000"
        break
    fi
    if [ "$i" -eq 20 ]; then
        warn "AI Service didn't respond in 20s. Continuing anyway (may still be loading models)."
    fi
    sleep 1
done

# ── 2. Spring Boot Backend ────────────────────────────────────────────────────
info "Starting Spring Boot backend..."
cd "$ROOT/backend-spring"

nohup mvn spring-boot:run > "$LOG_DIR/backend.log" 2>&1 &
SPRING_PID=$!
echo $SPRING_PID > "$LOG_DIR/backend.pid"
info "Spring Boot starting (PID: $SPRING_PID) — logs: logs/backend.log"

# Wait for Spring Boot
info "Waiting for Spring Boot to be ready (this takes ~15 seconds)..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:8080/api/auth/me > /dev/null 2>&1; then
        info "✅ Spring Boot ready at http://localhost:8080"
        break
    fi
    if [ "$i" -eq 30 ]; then
        warn "Spring Boot didn't respond in 30s. Continuing..."
    fi
    sleep 1
done

# ── 3. React Frontend ─────────────────────────────────────────────────────────
info "Starting React frontend..."
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
    info "node_modules not found. Running npm install..."
    npm install
fi

nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
REACT_PID=$!
echo $REACT_PID > "$LOG_DIR/frontend.pid"
info "React frontend starting (PID: $REACT_PID) — logs: logs/frontend.log"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
info "All services launched:"
echo ""
echo "  🤖 AI Service:   http://localhost:8000"
echo "  ⚡ Spring Boot:  http://localhost:8080"
echo "  🌐 React App:    http://localhost:3000"
echo ""
echo "  Admin login:   admin@university.edu / admin123"
echo "  Student login: student@university.edu / student123"
echo ""
echo "  Stop all:  bash stop-all.sh"
echo "  Logs:      tail -f logs/ai-service.log"
echo "═══════════════════════════════════════════════"
echo ""
info "Opening browser in 3 seconds..."
sleep 3
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi
