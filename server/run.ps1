# Start the Smart Fleet omnichannel server on http://127.0.0.1:8000
# Run:  powershell -ExecutionPolicy Bypass -File run.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .venv)) {
    Write-Host "First run: creating .venv and installing packages..."
    python -m venv .venv
    .\.venv\Scripts\python -m pip install --quiet -r requirements.txt
}
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example. Fill in your keys (see SETUP_GUIDE.md), then run this again."
    exit 1
}
.\.venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000
