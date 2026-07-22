@echo off
title ClipAI Launcher
echo ===================================================
echo              Starting ClipAI Tool...
echo ===================================================
echo.

:: Start Backend Server
start "ClipAI Backend" cmd /k "cd /d "%~dp0backend" && npm start"

:: Start Worker Process
start "ClipAI Worker" cmd /k "cd /d "%~dp0backend" && npm run worker"

:: Start Frontend UI
start "ClipAI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for servers to spin up...
timeout /t 5 /nobreak >nul

echo Opening ClipAI in browser...
start http://localhost:3001

echo.
echo ===================================================
echo    ClipAI is running! Browser should open automatically.
echo    Keep the 3 opened terminal windows running while using.
echo ===================================================
pause
