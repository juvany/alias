@echo off
cd /d "%~dp0"

echo Building web app...
cd ..\myAlias
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Web build failed!
  pause
  exit /b 1
)
cd ..\myAlias-android

echo Copying built files to Android assets...
if not exist "app\src\main\assets" mkdir "app\src\main\assets"
xcopy /E /Y /Q "..\myAlias\dist\*" "app\src\main\assets\" >nul

echo Building APK...
node run-gradle.js

if %ERRORLEVEL% EQU 0 (
  echo.
  echo Opening APK folder...
  explorer "app\build\outputs\apk\debug"
) else (
  echo Build failed!
  pause
)
