@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM File: university-ai-platform/start-all.bat
REM Usage: Double-click or run from project root in cmd
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo  ===========================================
echo   University AI Intelligence Platform
echo  ===========================================
echo.

REM Check .env exists
if not exist "ai-service\.env" (
    copy "ai-service\.env.example" "ai-service\.env"
    echo [WARN] Created ai-service\.env from example.
    echo [WARN] Add your GEMINI_API_KEY or OPENAI_API_KEY to ai-service\.env
    echo.
)

echo [1/3] Starting AI Service (port 8000)...
start "UniAI - AI Service" cmd /k "cd ai-service && python main.py"
timeout /t 8 /nobreak > nul

echo [2/3] Starting Spring Boot Backend (port 8080)...
start "UniAI - Spring Boot" cmd /k "cd backend-spring && mvn spring-boot:run"
timeout /t 15 /nobreak > nul

echo [3/3] Starting React Frontend (port 3000)...
if not exist "frontend\node_modules" (
    echo Installing npm packages...
    cd frontend && npm install && cd ..
)
start "UniAI - React" cmd /k "cd frontend && npm start"

echo.
echo  ===========================================
echo   All services launched in separate windows
echo.
echo   AI Service:   http://localhost:8000
echo   Spring Boot:  http://localhost:8080
echo   React App:    http://localhost:3000
echo.
echo   Admin:   admin@university.edu / admin123
echo   Student: student@university.edu / student123
echo  ===========================================
echo.
pause
