# Supabase Integration Guide

## Current Status

The system currently uses:
- **MySQL** as the primary database (via `backend/src/config/database.js`)
- **Prisma** configured for PostgreSQL (ready for Supabase)
- **Railway** for backend deployment (can switch to Supabase)

## Supabase Setup Steps

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com)
2. Create a new project
3. Note your project credentials:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: Found in Settings > API
   - **Service Role Key**: Found in Settings > API (keep secret!)

### 2. Configure Environment Variables

Add to `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database URL (for Prisma)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# Use Prisma/Supabase instead of MySQL
USE_PRISMA=true
```

Or get connection string from Supabase Dashboard:
- Settings > Database > Connection string
- Select "URI" format
- Replace `[YOUR-PASSWORD]` with your database password

### 3. Run Database Migrations

#### Option A: Using Prisma (Recommended)

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init
```

#### Option B: Using Supabase SQL Editor

1. Go to Supabase Dashboard > SQL Editor
2. Run the Prisma-generated SQL or create tables manually
3. Use the schema from `prisma/schema.prisma` as reference

### 4. Update Backend Configuration

The backend now supports both MySQL and Supabase:

- **If `USE_PRISMA=true` or `DATABASE_URL` contains "supabase"**: Uses Prisma with Supabase
- **Otherwise**: Uses MySQL as fallback

### 5. Update Railway Environment Variables

If deploying to Railway:

1. Go to Railway project settings
2. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (Supabase PostgreSQL connection string)
   - `USE_PRISMA=true`

### 6. Test Supabase Connection

The backend will automatically:
- Try to use Prisma/Supabase if configured
- Fall back to MySQL if Supabase is not configured
- Log which database is being used

## Supabase Features to Enable

### 1. Row Level Security (RLS)

Enable RLS in Supabase Dashboard for security:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id::uuid);
```

### 2. Realtime Subscriptions

Supabase provides real-time updates. Update Socket.IO to use Supabase Realtime:

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Subscribe to changes
supabase
  .channel('users')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
    // Broadcast update via Socket.IO
  })
  .subscribe();
```

### 3. Supabase Auth (Optional)

You can replace JWT auth with Supabase Auth:

```javascript
// User registration
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// User login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

## Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Prisma schema matches Supabase tables
- [ ] Database migrations run (`npx prisma db push`)
- [ ] Test connection in backend
- [ ] Update Railway environment variables
- [ ] Test all API endpoints
- [ ] Enable Row Level Security (RLS)
- [ ] Configure backups in Supabase

## Current Database Status

✅ **Prisma Schema**: Ready (PostgreSQL/Supabase compatible)
✅ **Supabase Client**: Installed (`@supabase/supabase-js`)
✅ **Hybrid Database Config**: Created (supports both MySQL and Supabase)
⚠️ **Backend Code**: Currently uses MySQL, but ready for Supabase

## Next Steps

1. **Set up Supabase project** (if not done)
2. **Add environment variables** to backend
3. **Run Prisma migrations** to create tables in Supabase
4. **Test connection** and switch database usage
5. **Update routes** to use Prisma instead of raw MySQL queries (optional)

## Testing Supabase Connection

Add this endpoint to test:

```javascript
// In backend/src/server.js or routes
app.get('/api/test/supabase', async (req, res) => {
  try {
    const supabase = require('./config/supabase').getSupabase();
    if (!supabase) {
      return res.json({ status: 'not_configured', using: 'mysql' });
    }
    
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    res.json({
      status: 'connected',
      using: 'supabase',
      error: error?.message
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Notes

- The system can work with **both** MySQL and Supabase
- Prisma acts as the ORM for Supabase (PostgreSQL)
- Raw MySQL queries need to be converted to Prisma methods for full Supabase support
- Most routes already have Prisma fallback code

