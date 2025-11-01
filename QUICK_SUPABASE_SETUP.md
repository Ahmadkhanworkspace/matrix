# ⚡ Quick Supabase Setup for Railway

## Your Supabase Credentials

✅ **Project URL**: `https://ddpjrwoyjphumeenabyb.supabase.co`  
✅ **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90`  
✅ **Database Password**: `matrixsystem123`

---

## 🚀 Step 1: Get Service Role Key

1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **Settings** (gear icon) → **API**
3. Scroll to **Project API keys**
4. Find **`service_role`** key (⚠️ Secret key - copy it)
5. Save it somewhere safe

---

## 🚀 Step 2: Add Variables to Railway

### Go to Railway Dashboard:
1. Visit: https://railway.app/dashboard
2. Select project: **`considerate-adventure-production`**
3. Click **Variables** tab (or look for **+ Add** button)

### Add These 5 Variables:

#### Variable 1: DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
Environment: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2: USE_PRISMA
```
Name: USE_PRISMA
Value: true
Environment: ✅ Production ✅ Preview ✅ Development
```

#### Variable 3: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://ddpjrwoyjphumeenabyb.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

#### Variable 4: SUPABASE_ANON_KEY
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
Environment: ✅ Production ✅ Preview ✅ Development
```

#### Variable 5: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Paste the service_role key from Step 1]
Environment: ✅ Production ✅ Preview ✅ Development
```

---

## 🚀 Step 3: Wait for Railway to Restart

- Railway will automatically restart your service
- Wait 1-2 minutes for deployment
- Check logs to see: `✅ Prisma/PostgreSQL connected`

---

## 🚀 Step 4: Run Database Migrations

After Railway restarts, create the database tables:

### Option A: Via Supabase SQL Editor (Easiest)
1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **SQL Editor** (in left menu)
3. Click **New query**
4. Run this to generate SQL from Prisma:
   ```bash
   cd backend
   npx prisma migrate dev --create-only --name init
   ```
5. Copy the generated SQL from `prisma/migrations` folder
6. Paste into Supabase SQL Editor and run

### Option B: Via Prisma (Recommended)
```bash
cd backend

# Set local DATABASE_URL temporarily
set DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres

# Generate Prisma client
npx prisma generate

# Push schema to Supabase (creates all tables)
npx prisma db push
```

---

## ✅ Step 5: Verify Connection

1. **Check Railway Logs**
   - Railway Dashboard → Your Project → View Logs
   - Look for: `✅ Supabase connected` or `✅ Prisma/PostgreSQL connected`

2. **Test API Endpoint**
   - Visit: `https://considerate-adventure-production.up.railway.app/api/supabase/test`
   - Should show: `{ "success": true, "connected": true }`

3. **Check System Status**
   - Visit: `https://considerate-adventure-production.up.railway.app/api/system/status`
   - Look for: `"database": { "type": "Supabase (PostgreSQL via Prisma)" }`

---

## 📋 Complete Variable List (Copy-Paste Ready)

Once you have the Service Role Key, you can add all variables at once:

```env
DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
USE_PRISMA=true
SUPABASE_URL=https://ddpjrwoyjphumeenabyb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY_FROM_STEP_1]
```

---

## 🆘 Troubleshooting

### ❌ Connection Error
- Verify password is correct: `matrixsystem123`
- Check `DATABASE_URL` format
- Ensure Supabase project is active

### ❌ Tables Not Found
- Run `npx prisma db push` to create tables
- Or use Supabase SQL Editor to create manually

### ❌ Variables Not Working
- Restart Railway service manually
- Check variable names (case-sensitive)
- Verify all 3 environments are selected

---

## 📖 Related Files

- `SUPABASE_CREDENTIALS.md` - All credentials
- `RAILWAY_SUPABASE_SETUP.md` - Detailed setup
- `ENVIRONMENT_VARIABLES_GUIDE.md` - Complete env var guide

