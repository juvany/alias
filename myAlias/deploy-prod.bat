@echo off
setlocal

set PROD_APP_ID=69bb0f318b7ad64ca3b003e7
set PROD_URL=https://alias-3b003e7.base44.app

echo.
echo [PROD DEPLOY] Verifying production config...
findstr /C:"%PROD_APP_ID%" .env > nul 2>&1
if errorlevel 1 (
    echo [WARN] .env does not contain production app ID. Fixing...
    echo VITE_BASE44_APP_ID=%PROD_APP_ID% > .env
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
