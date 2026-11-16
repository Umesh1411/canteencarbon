Write-Host "===========================================" -ForegroundColor Green
Write-Host " Starting CanteenCarbon Full Stack System  " -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\ml'; Write-Host '--- ML Service (Port 8000) ---' -ForegroundColor Cyan; python serve.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; Write-Host '--- Backend API (Port 4000) ---' -ForegroundColor Yellow; node index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; Write-Host '--- Frontend Vite (Port 5173) ---' -ForegroundColor Green; npm run dev"

Write-Host "All 3 services launched in separate windows!" -ForegroundColor Cyan
Write-Host "Open your browser at: http://localhost:5173" -ForegroundColor Green
