@echo off
setlocal

rem Always run from the script's own directory, regardless of caller's cwd
cd /d "%~dp0"

set PROD_APP_ID=69bb0f318b7ad64ca3b003e7
set DEBUG_APP_ID=69c1cdab5828d16e9b07fbb8
set DEBUG_URL=https://alias-debug-9b07fbb8.base44.app

echo.
echo [DEBUG DEPLOY] Saving production config...
copy /Y .env .env.prod.bak > nul
copy /Y base44\.app.jsonc base44\.app.prod.bak.jsonc > nul

echo [DEBUG DEPLOY] Switching to debug app...
echo VITE_BASE44_APP_ID=%DEBUG_APP_ID% > .env
(
  echo // Base44 App Configuration - DEBUG
  echo {
  echo   "id": "%DEBUG_APP_ID%"
  echo }
) > base44\.app.jsonc

echo [DEBUG DEPLOY] Building...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed.
    goto :restore
)

echo [DEBUG DEPLOY] Deploying to %DEBUG_URL% ...
call base44 site deploy -y
if errorlevel 1 (
    echo [ERROR] Deploy failed.
    goto :restore
)

echo.
echo  Done^^! Visit: %DEBUG_URL%
echo.

:restore
echo [DEBUG DEPLOY] Restoring production config...
copy /Y .env.prod.bak .env > nul
copy /Y base44\.app.prod.bak.jsonc base44\.app.jsonc > nul
del .env.prod.bak > nul 2>&1
del base44\.app.prod.bak.jsonc > nul 2>&1
echo [DEBUG DEPLOY] Production config restored.
echo.

endlocal
