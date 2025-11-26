@echo off
REM Juggernaut IDV Demo - Quick Start Script for Windows

echo Starting Juggernaut IDV Demo Application...
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed. Please install Docker Desktop for Windows first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create environment files if they don't exist
if not exist backend\.env (
    echo Creating backend .env file...
    copy backend\.env.example backend\.env
)

if not exist frontend\.env (
    echo Creating frontend .env file...
    copy frontend\.env.example frontend\.env
)

REM Stop any running containers
echo Stopping existing containers...
docker-compose down

REM Build and start containers
echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo Checking service health...
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend is healthy
) else (
    echo Backend might still be starting up...
)

echo.
echo ===============================================
echo Juggernaut IDV Demo is starting!
echo ===============================================
echo.
echo Access the application at:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000
echo   API Docs:  http://localhost:5000/api-docs
echo.
echo View logs with: docker-compose logs -f
echo Stop with: docker-compose down
echo.
pause