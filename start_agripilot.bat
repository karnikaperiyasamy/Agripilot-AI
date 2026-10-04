@echo off
echo =========================================================
echo 🌾 Starting AgriPilot AI — Production Agricultural Ecosystem
echo =========================================================

echo 1. Starting FastAPI Machine Learning Service on Port 8000...
start "AgriPilot AI - FastAPI Service" /D ai-service cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo 2. Starting Node.js Express Gateway Backend on Port 5000...
start "AgriPilot AI - Express Gateway" /D backend cmd /k "npm start"

echo 3. Launching Vite React Frontend on Port 3000...
start "AgriPilot AI - React Frontend" /D frontend cmd /k "npm run dev"

echo 4. Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo 5. Opening AgriPilot AI in Google Chrome...
start chrome "http://localhost:3000" 2>nul || start "http://localhost:3000"

echo =========================================================
echo 🚀 All AgriPilot AI services dispatched successfully!
echo 🌐 Frontend: http://localhost:3000
echo 📡 Backend API: http://localhost:5000/api/health
echo 🤖 ML Microservice: http://127.0.0.1:8000
echo =========================================================

