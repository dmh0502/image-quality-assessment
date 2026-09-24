@echo off
cd /d "%~dp0"
title NRIQA Studio

echo ===================================================================
echo   KHOI CHAY WEB DEMO NRIQA STUDIO
echo ===================================================================

:: Giai phong port 8000 va 5173 neu bi tien trinh cu chiem dung
python -c "import subprocess; [subprocess.run(f'taskkill /F /PID {l.split()[4]}', shell=True, capture_output=True) for p in [8000, 5173] for l in subprocess.getoutput(f'netstat -ano | findstr :{p}').splitlines() if f':{p}' in l and 'LISTENING' in l]" >nul 2>nul

echo [1/2] Khoi chay Backend FastAPI (Port 8000)...
start "NRIQA Backend API (Port 8000)" cmd /k "python server.py"

echo [2/2] Khoi chay Frontend React (Port 5173)...
start "NRIQA Frontend React (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================================
echo   He thong da khoi chay!
echo   - Frontend: http://localhost:5173
echo   - Backend Docs: http://localhost:8000/docs
echo ===================================================================
echo Dang mo trinh duyet...
ping 127.0.0.1 -n 4 > nul
start http://localhost:5173
