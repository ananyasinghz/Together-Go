@echo off
title Together^&Go - Backend Server
cd /d "%~dp0backend"
echo Starting Backend Server (FastAPI + Uvicorn)...
echo Backend will be available at http://localhost:8000
echo API docs at http://localhost:8000/docs
echo.
.venv\Scripts\uvicorn.exe server:app --host 0.0.0.0 --port 8000 --reload
pause
