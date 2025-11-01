# Quick Git Commit Script
# Run this if Git is available in PATH

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Committing and Pushing Changes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "❌ Git is not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please use:" -ForegroundColor Yellow
    Write-Host "1. VS Code: Ctrl+Shift+G → Commit → Push" -ForegroundColor Yellow
    Write-Host "2. GitHub Desktop: Commit → Push" -ForegroundColor Yellow
    Write-Host "3. See GIT_COMMIT_READY.md for instructions" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Git found!" -ForegroundColor Green
Write-Host ""

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch" -ForegroundColor Cyan
Write-Host ""

# Add all files
Write-Host "📁 Adding all files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files staged" -ForegroundColor Green
Write-Host ""

# Commit message
$commitMessage = "Remove dummy data and integrate real API for user panel`n`n- Remove hardcoded credentials and mock data from AuthContext`n- Update Dashboard to fetch real data from /users/stats API`n- Add create-admin-user.js script for database seeding`n- Fix Prisma schema (remove duplicate SystemConfig, VideoAdPurchase)`n- Update .env with Supabase DATABASE_URL`n- Add comprehensive documentation for cron jobs and environment setup`n- Enhance user data mapping to handle multiple API response formats"

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit successful!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🚀 Pushing to remote..." -ForegroundColor Yellow
    
    # Try main branch first
    git push origin main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Trying master branch..." -ForegroundColor Yellow
        git push origin master 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ Push completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Railway will auto-deploy in 2-3 minutes" -ForegroundColor Cyan
        Write-Host "⏳ Vercel will auto-deploy if connected" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Push failed. Check your git remote configuration." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ Commit failed. Check for errors above." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

