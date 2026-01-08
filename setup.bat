@echo off
chcp 65001 > nul
title 🚀 SPOT ACE PARK - Auto Setup Script
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   🚗 SPOT ACE PARK - AUTOMATIC SETUP SCRIPT                 ║
echo ║                                                              ║
echo ║   Script tự động kiểm tra và cài đặt môi trường             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: ===== CHECK NODE.JS =====
echo [1/6] Kiểm tra Node.js...
where node > nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo     ❌ Node.js CHƯA CÀI ĐẶT!
    echo.
    echo     👉 Vui lòng tải và cài đặt từ: https://nodejs.org
    echo     👉 Sau khi cài xong, chạy lại script này
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo     ✅ Node.js đã cài đặt: %NODE_VER%
)

:: ===== CHECK NPM =====
echo [2/6] Kiểm tra npm...
where npm > nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo     ❌ npm CHƯA CÀI ĐẶT!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo     ✅ npm đã cài đặt: v%NPM_VER%
)

:: ===== CHECK GIT =====
echo [3/6] Kiểm tra Git...
where git > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo     ⚠️  Git chưa cài đặt (không bắt buộc nếu đã có source code)
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VER=%%i
    echo     ✅ Git đã cài đặt: %GIT_VER%
)

:: ===== CHECK NODE_MODULES =====
echo [4/6] Kiểm tra node_modules...
if exist "node_modules\" (
    echo     ✅ node_modules đã tồn tại
) else (
    echo     ⏳ Đang cài đặt dependencies...
    echo     (Quá trình này mất 2-5 phút)
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo     ❌ Lỗi khi cài đặt dependencies!
        pause
        exit /b 1
    )
    echo     ✅ Đã cài đặt xong dependencies
)

:: ===== CHECK .ENV FILE =====
echo [5/6] Kiểm tra file .env...
if exist ".env" (
    echo     ✅ File .env đã tồn tại
) else (
    echo     ⚠️  File .env chưa tồn tại, đang tạo...
    (
        echo # ============================
        echo # DATABASE CONFIGURATION
        echo # ============================
        echo DB_HOST=localhost
        echo DB_PORT=1433
        echo DB_USER=sa
        echo DB_PASSWORD=YOUR_PASSWORD_HERE
        echo DB_NAME=spot_ace_park
        echo.
        echo # ============================
        echo # SERVER CONFIGURATION
        echo # ============================
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # ============================
        echo # SUPABASE
        echo # ============================
        echo VITE_SUPABASE_URL=
        echo VITE_SUPABASE_ANON_KEY=
    ) > .env
    color 0E
    echo     ⚠️  ĐÃ TẠO FILE .env
    echo     👉 VUI LÒNG MỞ FILE .env VÀ SỬA DB_PASSWORD!
)

:: ===== CHECK PORT 3000 =====
echo [6/6] Kiểm tra Port 3000...
netstat -ano | findstr :3000 | findstr LISTENING > nul 2>&1
if %errorlevel% equ 0 (
    color 0E
    echo     ⚠️  Port 3000 đang bị chiếm bởi chương trình khác
    echo     👉 Bạn có thể cần tắt chương trình đó hoặc đổi port
) else (
    echo     ✅ Port 3000 sẵn sàng
)

:: ===== SUMMARY =====
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    📋 KẾT QUẢ KIỂM TRA                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo   ✅ Node.js:     %NODE_VER%
echo   ✅ npm:         v%NPM_VER%
echo   ✅ Dependencies đã cài đặt
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo   📌 CÁC BƯỚC TIẾP THEO:
echo.
echo   1. Đảm bảo SQL Server đang chạy
echo   2. Kiểm tra file .env (sửa DB_PASSWORD)
echo   3. Tạo database 'spot_ace_park' trong SSMS
echo   4. Chạy file database_schema.sql
echo.
echo ══════════════════════════════════════════════════════════════
echo.

set /p START_NOW="Bạn có muốn khởi động server ngay bây giờ? (Y/N): "
if /i "%START_NOW%"=="Y" (
    echo.
    echo 🚀 Đang khởi động...
    echo.
    echo ══════════════════════════════════════════════════════════════
    echo   Terminal 1: Backend Server (node server.js)
    echo   Terminal 2: Frontend (npm run dev) - MỞ THỦ CÔNG
    echo ══════════════════════════════════════════════════════════════
    echo.
    echo 👉 Mở thêm 1 terminal mới và chạy: npm run dev
    echo 👉 Sau đó truy cập: http://localhost:5173
    echo.
    echo ══════════════════════════════════════════════════════════════
    echo.
    node server.js
) else (
    echo.
    echo 👋 Tạm biệt! Để chạy dự án sau này:
    echo    Terminal 1: node server.js
    echo    Terminal 2: npm run dev
    echo.
)

pause
