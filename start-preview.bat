@echo off
setlocal
chcp 65001 > nul
title SPOT ACE PARK - Preview Start
color 0D
cd /d "%~dp0"

echo.
echo ===============================================
echo   SPOT ACE PARK - PREVIEW START
echo ===============================================
echo.

where node > nul 2>&1
if errorlevel 1 (
  color 0C
  echo [ERROR] Node.js chua duoc cai.
  pause
  exit /b 1
)

where npm > nul 2>&1
if errorlevel 1 (
  color 0C
  echo [ERROR] npm khong tim thay.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] Chua co node_modules. Dang cai dependencies...
  call npm install
  if errorlevel 1 (
    color 0C
    echo [ERROR] npm install that bai.
    pause
    exit /b 1
  )
)

echo [INFO] Mo mock backend o port 3000...
start "Spot Ace Mock API" cmd /k "cd /d ""%~dp0"" && color 0A && npm run mock-api"

echo [INFO] Build frontend...
call npm run build
if errorlevel 1 (
  color 0C
  echo [ERROR] Build that bai.
  pause
  exit /b 1
)

echo [INFO] Mo frontend preview o port 8080...
start "Spot Ace Frontend Preview" cmd /k "cd /d ""%~dp0"" && color 0D && npm run preview:local"

timeout /t 5 /nobreak > nul

echo.
echo [OK] Preview dang khoi dong.
echo Frontend Preview: http://localhost:8080
echo Mock API: http://localhost:3000/api/parking-lots
echo.

start http://localhost:8080

echo Nhan phim bat ky de dong cua so nay.
pause > nul
