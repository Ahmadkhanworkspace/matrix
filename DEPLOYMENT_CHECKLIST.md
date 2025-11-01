# ✅ Deployment Checklist

## Before Pushing to Git

### Railway Variables (Must Have):
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase Dashboard
- [ ] `JWT_SECRET` - Use: `7a8633ce59a7d995c9b5fe2d841162b9d0748786c4e3ab75ca414981baaca618`
- [ ] `FRONTEND_URL` - Set to: `https://userpanel-lac.vercel.app`
- [ ] `DATABASE_URL` - Already set ✅
- [ ] `SUPABASE_URL` - Already set ✅
- [ ] `SUPABASE_ANON_KEY` - Already set ✅
- [ ] `USE_PRISMA` - Already set ✅

### Optional (Recommended):
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (for emails)
- [ ] Payment gateway keys (if using payments)

---

## Push to Git

1. **Stage all files**
2. **Commit message:**
   ```
   Add Supabase integration, cron job updates, and environment variable guides
   ```
3. **Push to repository**

See `GIT_PUSH_INSTRUCTIONS.md` for detailed steps.

---

## After Deployment

### Wait for Railway:
- [ ] Railway detects push (check GitHub webhook)
- [ ] Railway starts building (check deployment logs)
- [ ] Railway completes deployment (2-3 minutes)

### Test Endpoints:
- [ ] `/api/supabase/test` - Returns `{ "success": true, "connected": true }`
- [ ] `/api/system/status` - Shows Supabase as database type
- [ ] `/api/health` - Returns healthy status
- [ ] `/api/supabase/status` - Shows all configs are set

### Run Migrations:
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Push schema: `npx prisma db push`
- [ ] Verify tables created in Supabase

---

## Test Commands

### Quick Test Script:
```bash
node test-api.js
```

### Manual Tests:
```bash
# Test Supabase connection
curl https://considerate-adventure-production.up.railway.app/api/supabase/test

# Test system status
curl https://considerate-adventure-production.up.railway.app/api/system/status

# Test health
curl https://considerate-adventure-production.up.railway.app/api/health
```

---

## Troubleshooting

If tests fail:
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Check Supabase project is active
4. Verify DATABASE_URL format is correct
5. Ensure Service Role Key is correct

---

## Success Indicators

✅ Railway deployment successful (no errors in logs)  
✅ `/api/supabase/test` returns `connected: true`  
✅ `/api/system/status` shows `database.type: "Supabase (PostgreSQL via Prisma)"`  
✅ Database tables exist in Supabase  
✅ No authentication errors  

---

**Generated JWT Secret:** `7a8633ce59a7d995c9b5fe2d841162b9d0748786c4e3ab75ca414981baaca618`

