# 🔒 Fix Database Connection (SSL Required)

## Problem
Railway backend cannot connect to Supabase database:
```
Can't reach database server at db.ddpjrwoyjphumeenabyb.supabase.co:5432
```

## Solution
Supabase requires SSL connections. Update the `DATABASE_URL` in Railway to include SSL parameters.

## Steps

### 1. Go to Railway Dashboard
- Visit: https://railway.app/dashboard
- Select project: **`considerate-adventure-production`**
- Click **Variables** tab

### 2. Update DATABASE_URL
Find the `DATABASE_URL` variable and **update it** to include `?sslmode=require`:

#### Current (Missing SSL):
```
postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
```

#### Updated (With SSL):
```
postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres?sslmode=require
```

### 3. Alternative SSL Options
If `sslmode=require` doesn't work, try:
- `?sslmode=prefer` (allows non-SSL as fallback)
- `?ssl=true&sslmode=require` (explicit SSL)

### 4. Save and Wait
- Click **Save** or **Update**
- Railway will automatically restart the service
- Wait 2-3 minutes for redeploy
- Check logs to verify connection

## Expected Result
After updating, you should see in logs:
```
✅ Prisma connection test passed
```

Instead of:
```
❌ Prisma connection test failed: Can't reach database server
```

## If Still Not Working
1. **Check Supabase Dashboard** → Database → Connection pooling
   - Ensure database is not paused
   - Check connection settings
   
2. **Try Connection Pooling Port** (6543 instead of 5432):
   ```
   postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:6543/postgres?sslmode=require
   ```

3. **Check Railway Network** - Railway should allow outbound connections to Supabase by default

4. **Verify Password** - Ensure `matrixsystem123` is correct in Supabase Settings → Database

