@echo off
echo ============================================
echo   Nguyen Kim Ngan — Portfolio Website
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org
    echo.
    echo After installing, double-click this file again.
    echo.
    pause
    exit
)

echo Starting server...
echo.
echo Website will open at: http://localhost:3000
echo To stop: close this window or press Ctrl+C
echo.

:: Open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Start server
node server.js
pause
