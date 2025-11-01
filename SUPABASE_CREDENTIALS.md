# Supabase Credentials

## Your Supabase Project Details

```
Project URL: https://ddpjrwoyjphumeenabyb.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
Database Password: matrixsystem123
```

## Connection String (DATABASE_URL)

```
postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
```

## Where to Add These

### Backend (Railway)

1. Go to Railway Dashboard → Your Backend Project
2. Click **Variables** tab
3. Add these variables:

```env
# Supabase Configuration
SUPABASE_URL=https://ddpjrwoyjphumeenabyb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
USE_PRISMA=true
```

**Note:** Get the **Service Role Key** from Supabase Dashboard (Settings → API → service_role key) and add:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Admin Panel (Vercel) - Optional

If you want to use Supabase Auth in frontend:

```env
REACT_APP_SUPABASE_URL=https://ddpjrwoyjphumeenabyb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
```

### User Panel (Vercel) - Optional

If you want to use Supabase Auth in frontend:

```env
REACT_APP_SUPABASE_URL=https://ddpjrwoyjphumeenabyb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
```

## Next Steps

1. ✅ Add variables to Railway backend
2. ✅ Get Service Role Key from Supabase Dashboard
3. ✅ Run Prisma migrations: `cd backend && npx prisma db push`
4. ✅ Test connection: Visit `/api/supabase/test` after deployment

