# PowerShell script to push changes to Git
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing to Git Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
try {
    $null = Get-Command git -ErrorAction Stop
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please use one of these methods:" -ForegroundColor Yellow
    Write-Host "1. Open VS Code and use Source Control (Ctrl+Shift+G)" -ForegroundColor Yellow
    Write-Host "2. Use GitHub Desktop" -ForegroundColor Yellow
    Write-Host "3. Install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking git status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "Adding all files..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
Add Supabase integration, cron job updates, and environment variable guides

- Add Supabase client configuration and routes
- Update cron job schedules (payment: 1min, matrix: 5min, withdrawal: 2min, email: 2min)
- Add comprehensive environment variable documentation
- Add Railway setup guides for Supabase integration
- Add test script for API verification
"@

git commit -m $commitMessage
Write-Host ""

Write-Host "Pushing to repository..." -ForegroundColor Yellow
try {
    git push origin main
} catch {
    Write-Host "Trying master branch instead..." -ForegroundColor Yellow
    git push origin master
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Push completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Railway will automatically detect changes and redeploy." -ForegroundColor Cyan
Write-Host "Wait 2-3 minutes for deployment to complete." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

