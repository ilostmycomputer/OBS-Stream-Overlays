@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Dependencies are not installed. Run install.bat first.
  pause
  exit /b 1
)
if not exist config.json (
  echo config.json is missing. Re-extract the ZIP.
  pause
  exit /b 1
)
node src\index.js
pause
