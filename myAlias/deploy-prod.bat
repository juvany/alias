@echo off
setlocal

rem Always run from the script's own directory, regardless of caller's cwd
cd /d "%~dp0"

set PROD_APP_ID=69bb0f318b7ad64ca3b003e7
set PROD_URL=https://alias-3b003e7.base44.app

echo.
echo [PROD DEPLOY] Verifying production config...
findstr /C:"%PROD_APP_ID%" .env > nul 2>&1
if errorlevel 1 (
    echo [WARN] .env does not contain production app ID. Fixing...
    (
      echo VITE_BASE44_APP_ID=%PROD_APP_ID%
      echo VITE_ENABLE_DEBUG=0
    ) > .env
)
findstr /C:"VITE_ENABLE_DEBUG=0" .env > nul 2>&1
if errorlevel 1 (
    echo [WARN] .env missing VITE_ENABLE_DEBUG=0. Rewriting...
    (
      echo VITE_BASE44_APP_ID=%PROD_APP_ID%
      echo VITE_ENABLE_DEBUG=0
    ) > .env
)
findstr /C:"%PROD_APP_ID%" base44\.app.jsonc > nul 2>&1
if errorlevel 1 (
    echo [WARN] base44\.app.jsonc does not contain production app ID. Fixing...
    (
      echo // Base44 App Configuration
      echo {
      echo   "id": "%PROD_APP_ID%"
      echo }
    ) > base44\.app.jsonc
)

echo [PROD DEPLOY] Bumping version...
call node bump-version.mjs
if errorlevel 1 (
    echo [ERROR] Version bump failed.
    exit /b 1
)

echo [PROD DEPLOY] Building...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed.
    exit /b 1
)

echo [PROD DEPLOY] Deploying to %PROD_URL% ...
call base44 site deploy -y
if errorlevel 1 (
    echo [ERROR] Deploy failed.
    exit /b 1
)

echo.
echo  Done^^! Visit: %PROD_URL%
echo.

endlocal
