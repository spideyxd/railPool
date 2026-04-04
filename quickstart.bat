@echo off
REM RailPool Quick Start Script for Windows

echo.
echo ========================================
echo   RailPool - Quick Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    exit /b 1
)

echo [1/5] Setting up Backend...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt

echo [2/5] Copying backend environment file...
if not exist .env (
    copy .env.example .env
)

echo [3/5] Setting up Frontend...
cd ..\frontend
call npm install

echo [4/5] Ready to start!
echo.
echo To run the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   python run.py
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo Default test credentials (after seeding):
echo   Email: alice@railpool.com
echo   Password: password123
echo.
echo To seed sample data (run before first use):
echo   cd backend
echo   python seed.py
echo.
