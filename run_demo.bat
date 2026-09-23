@echo off
chcp 65001 > nul
echo ===================================================================
echo   KHỞI CHẠY WEB DEMO NRIQA (AI ĐÁNH GIÁ CHẤT LƯỢNG ẢNH & NHẬN DIỆN LỖI)
echo ===================================================================
echo [1/2] Đang khởi chạy Backend FastAPI...
start "NRIQA Backend API (Port 8000)" cmd /k "python server.py"

echo [2/2] Đang khởi chạy Frontend React + TypeScript...
cd frontend
start "NRIQA Frontend React (Port 5173)" cmd /k "npm run dev"

echo.
echo ===================================================================
echo   Hệ thống đã khởi chạy thành công!
echo   - Frontend: http://localhost:5173
echo   - Backend API Docs: http://localhost:8000/docs
echo ===================================================================
timeout /t 5
start http://localhost:5173

