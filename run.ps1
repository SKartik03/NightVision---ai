# NightVision AI Launcher
Write-Host "Launching NightVision AI Platform..." -ForegroundColor Cyan
Start-Process "http://localhost:8000"
$pythonCmd = if (Test-Path "C:\Python314\python.exe") { "C:\Python314\python.exe" } else { "python" }
& $pythonCmd -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
