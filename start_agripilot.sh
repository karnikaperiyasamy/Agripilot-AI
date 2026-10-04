#!/usr/bin/env bash
echo "========================================================="
echo "🌾 Starting AgriPilot AI — Production Agricultural Ecosystem"
echo "========================================================="

echo "1. Starting FastAPI Machine Learning Service on Port 8000..."
(cd ai-service && python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000) &

echo "2. Starting Node.js Express Gateway Backend on Port 5000..."
(cd backend && npm start) &

sleep 3

echo "3. Launching Vite React Frontend on Port 3000..."
(cd frontend && npm run dev) &

sleep 3

echo "4. Opening AgriPilot AI in Browser..."
if command -v google-chrome &> /dev/null; then
    google-chrome "http://localhost:3000" &
elif command -v open &> /dev/null; then
    open "http://localhost:3000" &
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" &
fi

echo "========================================================="
echo "🚀 All AgriPilot AI services dispatched successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend API: http://localhost:5000/api/health"
echo "🤖 ML Microservice: http://127.0.0.1:8000"
echo "========================================================="
