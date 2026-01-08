@echo off
chcp 65001 > nul
title 🚀 SPOT ACE PARK - Quick Start
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   🚗 SPOT ACE PARK - QUICK START                            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Đang khởi động Backend và Frontend...
echo.

:: Start backend in new window
start "🖥️ Backend Server" cmd /k "color 0A && echo. && echo ═══════════════════════════════════════════ && echo   BACKEND SERVER - Port 3000 && echo ═══════════════════════════════════════════ && echo. && node server.js"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend in new window
start "🌐 Frontend Dev Server" cmd /k "color 0B && echo. && echo ═══════════════════════════════════════════ && echo   FRONTEND SERVER - Port 5173 && echo ═══════════════════════════════════════════ && echo. && npm run dev"

:: Wait 5 seconds then open browser
timeout /t 5 /nobreak > nul

echo.
echo ✅ Đã khởi động xong!
echo.
echo 📍 Backend:  http://localhost:3000
echo 📍 Frontend: http://localhost:5173
echo.
echo 🌐 Đang mở trình duyệt...

start http://localhost:5173

echo.
echo ══════════════════════════════════════════════════════════════
echo   Nhấn phím bất kỳ để đóng cửa sổ này.
echo   (Backend và Frontend vẫn tiếp tục chạy)
echo ══════════════════════════════════════════════════════════════
echo.

pause > nul
