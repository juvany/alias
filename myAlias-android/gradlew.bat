@rem Gradle startup script for Windows
@if "%DEBUG%"=="" @echo off
setlocal EnableDelayedExpansion

set "DIRNAME=%~dp0"
if "%DIRNAME%"=="" set "DIRNAME=."

@rem Find java.exe - quote the path to handle spaces
if defined JAVA_HOME (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
    set "JAVA_EXE=java"
)

set "GRADLE_OPTS=%GRADLE_OPTS% -Xmx512m -Xms64m"
set "CLASSPATH=%DIRNAME%gradle\wrapper\gradle-wrapper.jar"

"%JAVA_EXE%" %GRADLE_OPTS% -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

endlocal
