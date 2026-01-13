# ReSight Backend Server - Run Script
# Uses virtualenv Python explicitly

$python = "..\.venv\Scripts\python.exe"
$app = "app:app"

if (-not (Test-Path $python)) {
    Write-Host "Error: Python not found at $python" -ForegroundColor Red
    Write-Host "Please create virtualenv first:" -ForegroundColor Yellow
    Write-Host "  python -m venv .venv"
    Write-Host "  .venv\Scripts\pip install -r requirements.txt"
    exit 1
}

Write-Host "Starting ReSight API server..." -ForegroundColor Green
Write-Host "Python: $python" -ForegroundColor Cyan
Write-Host "App: $app" -ForegroundColor Cyan
Write-Host ""

& $python -m uvicorn $app --reload --port 8000 --host 0.0.0.0
