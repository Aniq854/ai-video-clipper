@echo off
title ClipAI Automated Vercel Deployer
echo ===================================================
echo    Deploying ClipAI Live via Vercel...
echo ===================================================
echo.

set NODE_TLS_REJECT_UNAUTHORIZED=0
cd /d "%~dp0frontend"

echo [1/2] Authenticating Vercel Account...
call npx -y vercel login

echo.
echo [2/2] Deploying frontend live...
call npx -y vercel --prod --yes

echo.
echo ===================================================
echo   ✅ Deployment Finished! Check the Live URL above.
echo ===================================================
pause
