@echo off
REM LIA Clean Final Startup Script for Windows
REM This script starts the clean LIA for Looply

setlocal EnableDelayedExpansion

REM Change to script directory
cd /d "%~dp0"

echo [LIA] Starting LIA Clean Final - Looply Intelligent Assistant...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version') do set python_version=%%i
echo [INFO] Python version: %python_version%
echo [INFO] No external dependencies required - using Python standard library only

REM Check if configuration exists
if not exist "lia_config.json" (
    echo [WARNING] Configuration file not found. Using defaults.
)

echo [LIA] Starting LIA Clean Final...
echo [INFO] Type 'exit' to quit LIA
echo.

REM Start LIA in interactive mode
python lia_enhanced_lia.py

REM If we get here, LIA has stopped
echo [WARNING] LIA Clean Final has stopped
pause