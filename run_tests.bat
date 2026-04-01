@echo off
REM Run pytest with test DB (use from cmd.exe; avoids PowerShell vs cmd confusion)
setlocal
cd /d "%~dp0"
set DB_NAME=together_go_test
set MONGO_URL=mongodb://127.0.0.1:27017
python -m pytest tests/ -v %*
endlocal
