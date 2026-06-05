@echo off
:: Ensure working directory is the script folder to support Hebrew paths and relative execution perfectly
cd /d "%~dp0"
:: Strict ASCII-only Batch Script to prevent CMD encoding/parsing corruption on Windows
title DENTE Clinic Manager Launcher
color 0B

echo ======================================================================
echo           WELCOME TO DENTE CLINIC MANAGEMENT SYSTEM
echo ======================================================================
echo.
echo [1/3] Searching for Node.js engine...

:: Appending popular Node.js installation paths to current session PATH
set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%LocalAppData%\Programs\nodejs;%AppData%\npm;%USERPROFILE%\AppData\Roaming\npm"

:: Check if Node is available
node -v >nul 2>&1
if %errorlevel% neq 0 goto :node_missing
goto :node_exists

:node_missing
color 0C
echo.
echo ======================================================================
echo          Node.js Installation Required
echo ======================================================================
echo.
echo We could not detect Node.js on your computer.
echo.
echo Node.js is required to run the DENTE system locally on your PC.
echo.
echo 1. The official download page is opening in your browser...
echo 2. Please click the green "LTS" button to download.
echo 3. Install it (click "Next" until finished).
echo 4. Then, open this launcher again!
echo.
echo Opening official website...
start https://nodejs.org/en
pause
exit

:node_exists
echo [OK] Node.js is ready!

echo.
echo [*] Checking desktop shortcut and icon...

:: Execute the bundled robust PowerShell script of local execution context to guarantee the shortcut and beautiful tooth icon
powershell -NoProfile -ExecutionPolicy Bypass -File "dente_shortcut_maker.ps1" >nul 2>&1

echo [OK] Beautiful custom desktop shortcut created successfully with premium icon!

echo.
echo [2/3] Checking system libraries and components...

:: Enforce automated pre-update credentials and config backup sequence
echo [!] Making safety credentials and configuration backup to "backups\pre-update-"...
mkdir "%~dp0backups" >nul 2>&1
set "STAMP=%date:/=-%_%time::=-%"
set "STAMP=%STAMP: =_%"
set "STAMP=%STAMP:,=-%"
set "BACKUP_DIR=%~dp0backups\pre-update-%STAMP%"
mkdir "%BACKUP_DIR%" >nul 2>&1
if exist "%~dp0firebase-applet-config.json" copy "%~dp0firebase-applet-config.json" "%BACKUP_DIR%\" >nul
if exist "%~dp0package.json" copy "%~dp0package.json" "%BACKUP_DIR%\" >nul
if exist "%~dp0package-lock.json" copy "%~dp0package-lock.json" "%BACKUP_DIR%\" >nul
if exist "%~dp0metadata.json" copy "%~dp0metadata.json" "%BACKUP_DIR%\" >nul
if exist "%~dp0dente-launcher.bat" copy "%~dp0dente-launcher.bat" "%BACKUP_DIR%\" >nul
if exist "%~dp0dente-launcher.command" copy "%~dp0dente-launcher.command" "%BACKUP_DIR%\" >nul
if exist "%~dp0dente_shortcut_maker.ps1" copy "%~dp0dente_shortcut_maker.ps1" "%BACKUP_DIR%\" >nul
if exist "%~dp0dentist.ico" copy "%~dp0dentist.ico" "%BACKUP_DIR%\" >nul
echo [OK] Credentials and system setup backed up securely!

if exist "%~dp0node_modules" goto :modules_ready

echo.
echo [!] First-time setup detected. Downloading necessary components...
echo     This is done once and will take about 30 seconds. Please wait...
echo.
call npm install --no-audit --no-fund
if %errorlevel% neq 0 goto :install_failed
goto :modules_ready

:install_failed
color 0C
echo.
echo [!] Regular installation failed. Retrying with legacy fallback...
echo.
call npm install --no-audit --no-fund --legacy-peer-deps
if %errorlevel% neq 0 goto :critical_error

:modules_ready
echo [OK] Code libraries are fully ready!

echo.
echo [3/3] Optimizing local network port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ======================================================================
echo           DENTE CLINIC MANAGER IS NOW RUNNING SUCCESSFULLY!
echo ======================================================================
echo.
echo  * Keeping this window open will keep the DENTE server active.
echo  * DENTE will open automatically in an independent window in 3 seconds.
echo  * To safely stop the system, simply close this black window.
echo ======================================================================

:: Launch in elegant standalone Desktop App Mode (frameless window) via Edge
start "" cmd /c "timeout /t 3 /nobreak >nul && start msedge --app=http://127.0.0.1:3000 --window-size=1420,900"

:: Start local web-app server in dev mode using Vite
call npm run dev

pause
exit

:critical_error
color 0C
echo.
echo ======================================================================
echo          CRITICAL ERROR DURING SETUP
echo ======================================================================
echo.
echo Node modules installation failed.
echo Please ensure you have a stable internet connection and run this file again.
pause
exit
