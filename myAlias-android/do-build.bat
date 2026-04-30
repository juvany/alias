@echo off
set "JAVA_HOME=C:\Program Files\PDF24\jre"
set "ANDROID_HOME=C:\Users\juvan\alias\myAlias-android\android-sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Java: %JAVA_HOME%
echo Android SDK: %ANDROID_HOME%
echo.
echo Building APK...
call gradlew.bat assembleDebug
