@echo off
title ClipAI Free Live Tunnel Launcher
echo ===================================================
echo   Starting ClipAI Free Instant Public Live URL...
echo ===================================================
echo.

:: Ensure static build exists
if not exist "%~dp0frontend\out" (
    echo Building frontend static pages...
    call npm run build
)

:: Start Backend & Frontend combined server
start "ClipAI Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"

echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak >nul

echo.
echo ===================================================
echo  IMPORTANT:
echo  1. Open the Live URL in your browser.
echo  2. Click the BLUE "Click to Continue" button on the page!
echo ===================================================
echo.
call npx -y localtunnel --port 5000

pause
