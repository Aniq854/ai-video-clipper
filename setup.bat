@echo off
title ClipAI Automated Setup
echo ===================================================
echo        ClipAI — New Laptop Automated Setup
echo ===================================================
echo.

echo [1/2] Installing Backend Dependencies...
cd /d "%~dp0backend"
call npm install --strict-ssl=false

echo.
echo [2/2] Installing Frontend Dependencies...
cd /d "%~dp0frontend"
call npm install --strict-ssl=false

echo.
echo ===================================================
echo     ✅ Setup Complete! Now double click start.bat
echo ===================================================
pause
