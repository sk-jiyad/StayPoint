@echo off
REM ============================================================
REM  StayPoint one-click launcher
REM  Double-click this file to start the backend + frontend.
REM  Each runs in its own window; close a window to stop it.
REM ============================================================

echo Starting StayPoint...

REM --- Backend (Spring Boot, http://localhost:1004) ---
REM Reads StayPoint\.env for the DB password and JWT secret.
start "StayPoint Backend" cmd /k "cd /d %~dp0StayPoint && mvnw.cmd spring-boot:run"

REM --- Frontend (Vite dev server, http://localhost:3000) ---
start "StayPoint Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Give the backend time to boot, then open the app in the browser.
echo Waiting for the backend to start...
timeout /t 25 /nobreak >nul
start "" http://localhost:3000

echo.
echo Opened two windows: "StayPoint Backend" and "StayPoint Frontend".
echo Close those windows (or press Ctrl+C in them) to stop the servers.
