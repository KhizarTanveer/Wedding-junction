@echo off
echo ===================================================
echo   Wedding Junction - Automated Setup Script
echo ===================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js (v18+) and try again.
    pause
    exit /b 1
)

:: 2. Install workspace dependencies
echo [1/3] Installing dependencies for all workspace projects (Frontend & Backend)...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo.

:: 3. Configure environment files
echo [2/3] Configuring environment files (.env)...

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo   Created backend\.env from template.
) else (
    echo   backend\.env already exists.
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env" >nul
    echo   Created frontend\.env from template.
) else (
    echo   frontend\.env already exists.
)
echo.

:: 4. Seeding the database (Optional)
echo [3/3] Database Seeding...
set /p seed=Do you want to seed the database with initial test data? (y/n): 
if /I "%seed%"=="y" (
    echo Running database seed script...
    call npm run seed
) else (
    echo Skipping database seeding. You can run 'npm run seed' later.
)

echo.
echo ===================================================
echo   Setup completed successfully!
echo   To run both backend and frontend concurrently, run:
echo   npm run dev
echo ===================================================
pause
