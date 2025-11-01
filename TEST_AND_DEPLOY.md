# 🧪 Test & Deploy Guide

## Generated JWT Secret

Use this JWT_SECRET for Railway:

```
7a8633ce59a7d995c9b5fe2d841162b9d0748786c4e3ab75ca414981baaca618
```

Add it to Railway as: `JWT_SECRET`

---

## 📋 Step 1: Add Missing Variables to Railway

Make sure you have these 3 critical variables in Railway:

1. ✅ `SUPABASE_SERVICE_ROLE_KEY` (get from Supabase Dashboard)
2. ✅ `JWT_SECRET` = `7a8633ce59a7d995c9b5fe2d841162b9d0748786c4e3ab75ca414981baaca618`
3. ✅ `FRONTEND_URL` = `https://userpanel-lac.vercel.app`

---

## 🚀 Step 2: Push to Git (Triggers Deployment)

Since git is not available in this terminal, use one of these methods:

### Option A: Using Git GUI (Easiest)

1. Open **GitHub Desktop** or **SourceTree** or **VS Code Git**
2. Stage all files (or select new files)
3. Commit message: `Add Supabase integration and configuration files`
4. Push to repository

### Option B: Using Command Line

Open PowerShell or Git Bash in project root and run:

```bash
# Add all files
git add .

# Commit
git commit -m "Add Supabase integration, cron job updates, and environment variable guides"

# Push to trigger deployment
git push origin main
```

### Option C: Using VS Code

1. Open VS Code in project folder
2. Go to **Source Control** tab (Ctrl+Shift+G)
3. Stage all changes (+ icon)
4. Enter commit message: `Add Supabase integration and configuration`
5. Click **✓ Commit**
6. Click **Sync Changes** or **Push**

---

## ✅ Step 3: Test After Deployment

After Railway redeploys (wait 2-3 minutes), test these endpoints:

### Test 1: Supabase Connection
```
URL: https://considerate-adventure-production.up.railway.app/api/supabase/test
Expected: { "success": true, "connected": true }
```

### Test 2: System Status
```
URL: https://considerate-adventure-production.up.railway.app/api/system/status
Expected: database.type = "Supabase (PostgreSQL via Prisma)"
```

### Test 3: Health Check
```
URL: https://considerate-adventure-production.up.railway.app/api/health
Expected: { "status": "ok", "database": "connected" }
```

### Test 4: Supabase Status
```
URL: https://considerate-adventure-production.up.railway.app/api/supabase/status
Expected: { "success": true, "configured": true, "usePrisma": true }
```

---

## 🗄️ Step 4: Run Database Migrations

After Railway redeploys and variables are set:

### Option A: Via Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **SQL Editor**
3. Click **New query**
4. Run this command locally to generate SQL:

```bash
cd backend
set DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
npx prisma migrate dev --create-only --name init
```

5. Copy SQL from `backend/prisma/migrations/[timestamp]_init/migration.sql`
6. Paste into Supabase SQL Editor and run

### Option B: Via Prisma Push (Recommended)

```bash
cd backend

# Set DATABASE_URL (Windows PowerShell)
$env:DATABASE_URL="postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres"

# Or (Windows CMD)
set DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres

# Generate Prisma client
npx prisma generate

# Push schema to Supabase (creates all tables)
npx prisma db push
```

---

## 📝 Files Changed (Ready to Commit)

New files created:
- ✅ `backend/src/config/supabase.js` - Supabase client
- ✅ `backend/src/routes/supabase.js` - Supabase routes
- ✅ `backend/src/config/databaseHybrid.js` - Hybrid DB support
- ✅ `backend/src/middleware/auth.js` - Auth middleware
- ✅ `SUPABASE_SETUP.md` - Setup guide
- ✅ `SUPABASE_CREDENTIALS.md` - Credentials reference
- ✅ `RAILWAY_SUPABASE_SETUP.md` - Railway setup
- ✅ `QUICK_SUPABASE_SETUP.md` - Quick guide
- ✅ `RAILWAY_MISSING_VARIABLES.md` - Missing vars checklist
- ✅ `ENVIRONMENT_VARIABLES_GUIDE.md` - Complete env guide
- ✅ `TEST_AND_DEPLOY.md` - This file

Modified files:
- ✅ `backend/src/server.js` - Added Supabase initialization
- ✅ `backend/src/services/CronService.js` - Updated cron schedules
- ✅ `backend/package.json` - Added @supabase/supabase-js
- ✅ `DEPLOYMENT_URLS.md` - Updated with Supabase info

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Railway deployment completed successfully
- [ ] All 3 critical variables added (SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, FRONTEND_URL)
- [ ] `/api/supabase/test` returns `{ "success": true, "connected": true }`
- [ ] `/api/system/status` shows Supabase as database type
- [ ] Database tables created via Prisma migrations
- [ ] No errors in Railway logs

---

## 🆘 Troubleshooting

### ❌ "Supabase not configured"
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Verify values are correct (no extra spaces)

### ❌ "Table does not exist"
- Run `npx prisma db push` to create tables
- Or create tables manually via Supabase SQL Editor

### ❌ "JWT_SECRET missing"
- Add `JWT_SECRET` variable to Railway
- Use the generated secret: `7a8633ce59a7d995c9b5fe2d841162b9d0748786c4e3ab75ca414981baaca618`

### ❌ Deployment not triggered
- Push to the correct branch (usually `main` or `master`)
- Check Railway is connected to your GitHub repo
- Verify Railway is watching the correct branch

---

## 🎯 Quick Test Script

Save this as `test-api.js` and run: `node test-api.js`

```javascript
const https = require('https');

const BASE_URL = 'https://considerate-adventure-production.up.railway.app';

async function test(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Testing Railway Backend...\n');
  
  try {
    console.log('1. Testing Supabase connection...');
    const supabaseTest = await test('/api/supabase/test');
    console.log('   Result:', supabaseTest);
    
    console.log('\n2. Testing system status...');
    const status = await test('/api/system/status');
    console.log('   Database:', status.database?.type || 'Unknown');
    
    console.log('\n3. Testing health check...');
    const health = await test('/api/health');
    console.log('   Status:', health.status || 'Unknown');
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
```

