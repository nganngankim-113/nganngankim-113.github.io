@echo off
echo ============================================
echo   Build Portfolio Data
echo ============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download from: https://nodejs.org
    echo.
    pause
    exit
)

echo Scanning portfolio folders...
echo.
node build-portfolio.js
echo.
echo ============================================
echo   Done! You can now open index.html directly
echo   or deploy to GitHub Pages / Netlify.
echo ============================================
echo.
pause
