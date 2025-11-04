# ✅ Verify DATABASE_URL in Railway

## Current Error
```
Can't reach database server at db.ddpjrwoyjphumeenabyb.supabase.co:5432
```

## Steps to Verify

### 1. Check Railway Variables
1. Go to: https://railway.app/dashboard
2. Select project: **`considerate-adventure-production`**
3. Click **Variables** tab
4. Find **`DATABASE_URL`** variable

### 2. Verify the Exact Value
The `DATABASE_URL` should be **exactly**:
```
postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres?sslmode=require
```

**Important checks:**
- ✅ Must end with `?sslmode=require` (no trailing spaces)
- ✅ No extra characters before `?`
- ✅ Password is `matrixsystem123` (no typos)
- ✅ Host is `db.ddpjrwoyjphumeenabyb.supabase.co` (not missing `db.` prefix)

### 3. Alternative SSL Modes
If `?sslmode=require` doesn't work, try:
- `?sslmode=prefer` (allows non-SSL as fallback)
- `?ssl=true&sslmode=require` (explicit SSL flag)

### 4. Check Railway Deployment Status
1. Go to Railway Dashboard → Your Project
2. Click **Deployments** tab
3. Check if there's a recent deployment (should show "Deploying" or "Deployed")
4. Wait 2-5 minutes for deployment to complete

### 5. Check Railway Logs
1. In Railway Dashboard, click **Logs** tab
2. Look for:
   - `✅ Prisma connection test passed` (success)
   - `❌ Prisma connection test failed` (still failing)
   - Any SSL-related errors

### 6. Check Supabase Database Status
1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **Database** → **Connection Pooling**
3. Verify database is **not paused**
4. Check connection settings

### 7. Try Connection Pooling Port
If direct connection fails, try Supabase connection pooling (port 6543):
```
postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:6543/postgres?sslmode=require
```

### 8. Test After Railway Redeploys
After updating DATABASE_URL:
1. Save the variable
2. Wait 3-5 minutes for Railway to redeploy
3. Check Railway logs for "Container started" or "Deployment complete"
4. Run the test script again: `node test-auth.js`

## Still Not Working?

If after 5 minutes it still fails:
1. **Double-check the DATABASE_URL** - copy it exactly from this document
2. **Check Railway logs** for specific error messages
3. **Verify Supabase database** is not paused or restricted
4. **Try connection pooling port** (6543) instead of direct port (5432)

