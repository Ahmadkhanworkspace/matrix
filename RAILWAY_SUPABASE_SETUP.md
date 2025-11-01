# 🚀 Railway Backend - Supabase Setup

## Step-by-Step Instructions

### Step 1: Get Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ddpjrwoyjphumeenabyb`
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Copy the **`service_role`** key (⚠️ Keep this secret!)

### Step 2: Add Variables to Railway

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Select your backend project: `considerate-adventure-production`

2. **Open Variables Tab**
   - Click on your project
   - Click the **Variables** tab (or look for **+ Add** button)

3. **Add Each Variable** (one at a time):

#### Variable 1: DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
Environment: Production, Preview, Development (select all)
```

#### Variable 2: USE_PRISMA
```
Name: USE_PRISMA
Value: true
Environment: Production, Preview, Development (select all)
```

#### Variable 3: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://ddpjrwoyjphumeenabyb.supabase.co
Environment: Production, Preview, Development (select all)
```

#### Variable 4: SUPABASE_ANON_KEY
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
Environment: Production, Preview, Development (select all)
```

#### Variable 5: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Paste the service_role key from Supabase Dashboard]
Environment: Production, Preview, Development (select all)
```

4. **After Adding All Variables:**
   - Railway will automatically restart the service
   - Wait for deployment to complete
   - Check logs to verify connection

### Step 3: Run Database Migrations

After Railway has restarted with the new variables:

1. **Option A: Via Railway CLI** (if installed)
   ```bash
   railway link
   railway run npx prisma generate
   railway run npx prisma db push
   ```

2. **Option B: Via Supabase Dashboard**
   - Go to Supabase Dashboard → SQL Editor
   - Run the Prisma-generated SQL (if available)
   - Or manually create tables based on `prisma/schema.prisma`

3. **Option C: Local Migration** (then push)
   ```bash
   cd backend
   # Connect to Railway database locally
   npx prisma generate
   npx prisma db push
   ```

### Step 4: Verify Connection

1. **Check Railway Logs**
   - Railway Dashboard → Your Project → Deployments
   - Look for: `✅ Prisma/PostgreSQL connected` or `✅ Supabase connected`

2. **Test API Endpoint**
   - Visit: `https://considerate-adventure-production.up.railway.app/api/supabase/test`
   - Should return: `{ "success": true, "connected": true }`

3. **Check System Status**
   - Visit: `https://considerate-adventure-production.up.railway.app/api/system/status`
   - Look for `database.type: "Supabase (PostgreSQL via Prisma)"`

## Complete Variable List for Railway

Copy-paste this entire block (replace SERVICE_ROLE_KEY):

```env
DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
USE_PRISMA=true
SUPABASE_URL=https://ddpjrwoyjphumeenabyb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

## Troubleshooting

### ❌ "Connection refused"
- Check `DATABASE_URL` is correct
- Verify password: `matrixsystem123`
- Ensure Supabase project is active

### ❌ "Table does not exist"
- Run: `npx prisma db push` to create tables
- Or manually create tables via Supabase SQL Editor

### ❌ "Prisma client not generated"
- Run: `npx prisma generate`
- Then restart Railway service

### ❌ Variables not applying
- Restart Railway service manually
- Check variable names (case-sensitive)
- Verify environment selection (Production/Preview/Development)

## Next Steps

✅ Add all variables to Railway
✅ Get Service Role Key from Supabase
✅ Run database migrations
✅ Test connection
✅ Verify system status endpoint

---

**📖 See `SUPABASE_CREDENTIALS.md` for all credentials**

