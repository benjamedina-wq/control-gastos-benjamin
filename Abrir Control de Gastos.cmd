@echo off
setlocal
cd /d "%~dp0"
start "Control de gastos servidor" /min python -m http.server 4174 --bind 127.0.0.1
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4174/"
