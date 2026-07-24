@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required.
  echo Download it from https://nodejs.org/
  pause
  exit /b 1
)

call npm.cmd install --omit=dev
if errorlevel 1 (
  echo Installation failed.
  pause
  exit /b 1
)

echo.
echo Installed. Run start.bat while OBS is open.
pause
