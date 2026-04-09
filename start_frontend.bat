@echo off
title Together^&Go - Frontend Server
cd /d "%~dp0frontend"
echo Starting Frontend Server (React + CRACO)...
echo Frontend will be available at http://localhost:3000
echo.
yarn start
pause

