# Railway DATABASE_URL - Connection Pooling Format

## Complete Connection String

Copy this **EXACT** string into Railway Variables → `DATABASE_URL`:

```
postgresql://postgres.ddpjrwoyjphumeenabyb:matrixsystem123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## Steps to Update in Railway

1. Go to: https://railway.app/dashboard
2. Select project: **`considerate-adventure-production`**
3. Click **Variables** tab
4. Find **`DATABASE_URL`** variable
5. Click **Edit** or **Update**
6. Replace the entire value with the string above
7. Click **Save**
8. Wait 3-5 minutes for Railway to redeploy

## What This Does

- ✅ Uses Supabase connection pooling (port 6543)
- ✅ Correct format: `postgres.[PROJECT]` as username
- ✅ Correct host: `aws-1-ap-southeast-1.pooler.supabase.com`
- ✅ Includes SSL: `?sslmode=require`
- ✅ Password: `matrixsystem123`

## After Updating

1. Railway will automatically redeploy
2. Check Railway logs for: `✅ Connection Pooling (6543) client created successfully`
3. Test connection: `node quick-check.js`

