@echo off
echo Starting NightVision AI Platform...
start http://localhost:8000
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
) else if exist "C:\Python314\python.exe" (
    "C:\Python314\python.exe" -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    echo Python not found. Please install Python or ensure it is in your PATH.
    pause
)
