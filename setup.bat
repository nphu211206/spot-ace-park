@echo off
setlocal
chcp 65001 > nul
title SPOT ACE PARK - Windows Setup
color 0A
cd /d "%~dp0"

echo.
echo ===============================================
echo   SPOT ACE PARK - WINDOWS SETUP
echo ===============================================
echo.

echo [1/5] Kiem tra Node.js...
where node > nul 2>&1
if errorlevel 1 (
  color 0C
  echo [ERROR] Node.js chua duoc cai.
  echo Tai tai: https://nodejs.org
  pause
  exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js: %NODE_VER%

echo [2/5] Kiem tra npm...
where npm > nul 2>&1
if errorlevel 1 (
  color 0C
  echo [ERROR] npm khong tim thay.
  pause
  exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo [OK] npm: %NPM_VER%

echo [3/5] Kiem tra Git...
where git > nul 2>&1
if errorlevel 1 (
  color 0E
  echo [WARN] Git khong tim thay. Van co the chay neu source da co san.
  echo.
)

echo [4/5] Cai dependencies neu can...
if not exist "node_modules\" (
  call npm install
  if errorlevel 1 (
    color 0C
    echo [ERROR] npm install that bai.
    echo Neu loi o package native nhu msnodesqlv8, hay cai them:
    echo Visual Studio Build Tools ^(Desktop development with C++^)
    pause
    exit /b 1
  )
) else (
  echo [OK] node_modules da ton tai.
)

echo [5/5] Kiem tra file .env...
if exist ".env" (
  echo [OK] .env da san sang.
) else (
  > .env echo VITE_GOOGLE_MAPS_API_KEY=""
  echo [OK] Da tao .env toi thieu cho local test.
)

echo.
echo ===============================================
echo   SETUP XONG
echo ===============================================
echo.
echo Cach chay nhanh:
echo 1. Double-click start.bat  ^(dev server + mock api^)
echo 2. Hoac double-click start-preview.bat ^(build + preview 8080 + mock api^)
echo.
choice /C YN /N /M "Ban co muon mo app local ngay bay gio khong? [Y/N]: "
if errorlevel 2 goto :end
call start.bat

:end
echo.
echo Nhan phim bat ky de dong cua so nay.
pause > nul
