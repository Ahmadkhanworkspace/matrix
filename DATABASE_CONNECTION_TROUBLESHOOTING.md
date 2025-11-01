# 🔧 Database Connection Troubleshooting Guide

## Current Issue
Prisma cannot connect to Supabase at `db.ddpjrwoyjphumeenabyb.supabase.co:5432`

## ✅ Solution 1: Verify Connection String in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **Settings** (gear icon) → **Database**
3. Scroll to **Connection string**
4. Select **URI** format
5. Copy the exact connection string
6. Update your `.env` file:

```env
DATABASE_URL="[Paste the connection string from Supabase here]"
```

## ✅ Solution 2: Check Supabase Project Status

1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Check if the project shows **"Active"** (not paused)
3. If paused, click **Resume** or **Restore**

## ✅ Solution 3: Use Supabase SQL Editor (Recommended for Now)

Since Prisma can't connect, use Supabase's SQL Editor to create tables:

### Step 1: Generate SQL from Prisma Schema

```bash
cd D:\NewMatrixSystem\NewMatrixSystem
npx prisma migrate dev --create-only --name init
```

This creates SQL files in `prisma/migrations/` folder.

### Step 2: Run SQL in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **SQL Editor** (left menu)
3. Click **New query**
4. Copy the SQL from the migration file
5. Paste and click **Run**

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma client even without a database connection.

## ✅ Solution 4: Check Network/Firewall

If you're behind a corporate firewall or VPN:

1. **Try from a different network** (mobile hotspot)
2. **Check if port 5432 is blocked**
3. **Contact IT/admin** to whitelist Supabase domains

## ✅ Solution 5: Use Connection Pooling Port (6543)

Try using Supabase's connection pooling port:

```env
DATABASE_URL="postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
```

## ✅ Solution 6: Verify Database Password

1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **Settings** → **Database**
3. Click **Reset database password** if needed
4. Update `.env` with the new password

## 🔍 Quick Diagnostic Commands

### Test DNS Resolution:
```powershell
nslookup db.ddpjrwoyjphumeenabyb.supabase.co
```

### Test Port Connectivity:
```powershell
Test-NetConnection -ComputerName db.ddpjrwoyjphumeenabyb.supabase.co -Port 5432
```

### Test Connection String Format:
```powershell
cd D:\NewMatrixSystem\NewMatrixSystem
node test-db-connection.js
```

## 📋 Current .env Configuration

Your current `.env` has:
```env
DATABASE_URL="postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres?sslmode=require"
```

## 🚀 Recommended Next Steps

1. **First**: Verify the connection string from Supabase Dashboard
2. **Second**: Check if project is active (not paused)
3. **Third**: Use Supabase SQL Editor to create tables (works even if Prisma can't connect)
4. **Last**: Once tables exist, generate Prisma client: `npx prisma generate`

---

## Alternative: Run Migrations on Railway Instead

If you're deploying to Railway:
1. Add `DATABASE_URL` to Railway environment variables
2. Railway will automatically run `npx prisma db push` during deployment
3. Railway's network should be able to reach Supabase

