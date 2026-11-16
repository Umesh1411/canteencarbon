@echo off
echo Starting CanteenCarbon Full Stack System...
echo ===========================================

start "ML Service (FastAPI)" cmd /k "cd ml && python serve.py"
start "Backend API (Express)" cmd /k "cd backend && node index.js"
start "Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo All 3 services launched in separate windows!
echo Access web app at http://localhost:5173
