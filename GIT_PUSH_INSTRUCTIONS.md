# 📤 Git Push Instructions

## Quick Push Commands

Since git is not available in the current terminal, use one of these methods:

---

## Option 1: VS Code (Recommended)

1. **Open VS Code** in the project folder
2. Click **Source Control** icon (or press `Ctrl+Shift+G`)
3. You'll see all changed files
4. Click **+** next to "Changes" to stage all files
5. Enter commit message:
   ```
   Add Supabase integration, cron job updates, and environment variable guides
   ```
6. Click **✓ Commit** button
7. Click **Sync Changes** or **Push** button

---

## Option 2: GitHub Desktop

1. Open **GitHub Desktop**
2. You'll see all changed files on the left
3. Enter commit message at bottom
4. Click **Commit to main**
5. Click **Push origin** button

---

## Option 3: Command Line (Git Bash / PowerShell)

Open **Git Bash** or **PowerShell** in the project root and run:

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Add Supabase integration, cron job updates, and environment variable guides"

# Push to repository
git push origin main
```

**Note:** If you're on `master` branch, use:
```bash
git push origin master
```

---

## Option 4: GitHub Web Interface

1. Go to your repository on GitHub
2. Click **Upload files**
3. Drag and drop the new/changed files:
   - `backend/src/config/supabase.js`
   - `backend/src/routes/supabase.js`
   - `backend/src/config/databaseHybrid.js`
   - `backend/src/middleware/auth.js`
   - `SUPABASE_SETUP.md`
   - `SUPABASE_CREDENTIALS.md`
   - `RAILWAY_SUPABASE_SETUP.md`
   - `QUICK_SUPABASE_SETUP.md`
   - `RAILWAY_MISSING_VARIABLES.md`
   - `ENVIRONMENT_VARIABLES_GUIDE.md`
   - `TEST_AND_DEPLOY.md`
   - `test-api.js`
   - `backend/src/server.js` (modified)
   - `backend/src/services/CronService.js` (modified)
4. Enter commit message
5. Click **Commit changes**

---

## Files to Commit

### New Files:
- ✅ `backend/src/config/supabase.js`
- ✅ `backend/src/routes/supabase.js`
- ✅ `backend/src/config/databaseHybrid.js`
- ✅ `backend/src/middleware/auth.js`
- ✅ `SUPABASE_SETUP.md`
- ✅ `SUPABASE_CREDENTIALS.md`
- ✅ `RAILWAY_SUPABASE_SETUP.md`
- ✅ `QUICK_SUPABASE_SETUP.md`
- ✅ `RAILWAY_MISSING_VARIABLES.md`
- ✅ `ENVIRONMENT_VARIABLES_GUIDE.md`
- ✅ `TEST_AND_DEPLOY.md`
- ✅ `test-api.js`
- ✅ `GIT_PUSH_INSTRUCTIONS.md` (this file)

### Modified Files:
- ✅ `backend/src/server.js`
- ✅ `backend/src/services/CronService.js`
- ✅ `backend/package.json`
- ✅ `DEPLOYMENT_URLS.md`

---

## After Pushing

1. **Wait 2-3 minutes** for Railway to detect changes and redeploy
2. **Check Railway logs** to see deployment progress
3. **Run tests** using `node test-api.js` or test endpoints manually
4. **Verify** all environment variables are set in Railway

---

## Commit Message Suggestions

```
Add Supabase integration, cron job updates, and environment variable guides

- Add Supabase client configuration and routes
- Update cron job schedules (payment: 1min, matrix: 5min, withdrawal: 2min, email: 2min)
- Add comprehensive environment variable documentation
- Add Railway setup guides for Supabase integration
- Add test script for API verification
```

---

## Troubleshooting

### ❌ "Git is not recognized"
- Install Git: https://git-scm.com/download/win
- Or use VS Code / GitHub Desktop instead

### ❌ "Repository not found"
- Make sure you're in the correct directory
- Check remote: `git remote -v`

### ❌ "Permission denied"
- Check GitHub credentials
- Use personal access token if needed

---

## Next Steps After Push

1. ✅ Wait for Railway deployment (check logs)
2. ✅ Run `node test-api.js` to test API
3. ✅ Verify Supabase connection works
4. ✅ Run Prisma migrations to create tables

