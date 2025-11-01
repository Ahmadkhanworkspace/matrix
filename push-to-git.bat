@echo off
echo ========================================
echo Pushing to Git Repository
echo ========================================
echo.

REM Check if git is available
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH
    echo.
    echo Please use one of these methods:
    echo 1. Open VS Code and use Source Control (Ctrl+Shift+G)
    echo 2. Use GitHub Desktop
    echo 3. Install Git from https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo Checking git status...
git status
echo.

echo Adding all files...
git add .
echo.

echo Committing changes...
git commit -m "Add Supabase integration, cron job updates, and environment variable guides

- Add Supabase client configuration and routes
- Update cron job schedules (payment: 1min, matrix: 5min, withdrawal: 2min, email: 2min)
- Add comprehensive environment variable documentation
- Add Railway setup guides for Supabase integration
- Add test script for API verification"
echo.

echo Pushing to repository...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Trying master branch instead...
    git push origin master
)

echo.
echo ========================================
echo Push completed!
echo ========================================
echo.
echo Railway will automatically detect changes and redeploy.
echo Wait 2-3 minutes for deployment to complete.
echo.
pause

