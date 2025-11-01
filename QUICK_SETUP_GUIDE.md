# ⚡ Quick Setup Guide - Cron Service & Environment Variables

## 📍 Your URLs

**Backend (Railway):**
- URL: `https://considerate-adventure-production.up.railway.app`
- API: `https://considerate-adventure-production.up.railway.app/api`

**User Panel (Vercel):**
- URL: `https://userpanel-lac.vercel.app`

**Admin Panel (Vercel):**
- URL: `https://admin-panel-phi-hazel.vercel.app`

---

## 🔧 1. Cron Service Location (Already Set Up!)

The cron service is **already configured** and will run automatically!

### Where it is:
- **File:** `backend/src/services/CronService.js`
- **Initialization:** `backend/src/server.js` (line 297)
- **Status:** ✅ Already set up, runs when backend starts

### What it does:
- Automatically starts when Railway backend starts
- No additional configuration needed
- Runs 6 cron jobs automatically

### To verify it's running:
1. Go to Railway Dashboard
2. Click on your backend project
3. Check **Logs** tab
4. You should see: `"All cron jobs initialized successfully"`

---

## 🌐 2. User Panel Environment Variable

### Where to Add:
**Vercel Dashboard** → Your User Panel Project → **Settings** → **Environment Variables**

### Exact Variable to Add:

```
Name: REACT_APP_API_URL
Value: https://considerate-adventure-production.up.railway.app/api
```

### Step-by-Step:

1. Go to: https://vercel.com/dashboard
2. Click on your **user panel project**
3. Go to **Settings** → **Environment Variables**
4. Click **"+ Add New"** or **"Add"**
5. Enter:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://considerate-adventure-production.up.railway.app/api`
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your user panel (Vercel will ask or do it automatically)

---

## ✅ Complete Environment Variables Checklist

### User Panel (Vercel):
```env
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app
```

### Admin Panel (Vercel):
```env
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app
```

### Backend (Railway):
Already configured - no changes needed for cron jobs!

---

## 🔍 Verify Everything Works

### 1. Check Cron Jobs (Railway):
- Railway Dashboard → Your Project → **Logs**
- Look for: `"All cron jobs initialized successfully"`

### 2. Test User Panel:
- Visit: `https://userpanel-lac.vercel.app`
- Try logging in (should use real API now)

### 3. Test Backend API:
```bash
# Test login endpoint
curl -X POST https://considerate-adventure-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

---

## 📝 Summary

### Cron Service:
- ✅ Already in `backend/src/services/CronService.js`
- ✅ Already initialized in `backend/src/server.js`
- ✅ Runs automatically when Railway starts
- ❌ **No action needed** - it's already set up!

### User Panel Variable:
- ⚠️ **Add this to Vercel:**
  - Name: `REACT_APP_API_URL`
  - Value: `https://considerate-adventure-production.up.railway.app/api`
- After adding, **redeploy** user panel

---

## 🎯 Quick Reference

| Component | Location | Action Needed |
|-----------|----------|--------------|
| Cron Service | `backend/src/services/CronService.js` | ✅ Already set up |
| User Panel Variable | Vercel Dashboard | ⚠️ Add `REACT_APP_API_URL` |
| Backend | Railway | ✅ Already configured |

---

## 🆘 Troubleshooting

### Cron jobs not running?
1. Check Railway logs
2. Verify backend server started successfully
3. Look for error messages in logs

### User panel can't connect?
1. Verify `REACT_APP_API_URL` is set in Vercel
2. Check value has `/api` at the end
3. Redeploy user panel after adding variable
4. Check browser console for errors

---

## ✅ You're Done When:

- [x] Cron service running (check Railway logs)
- [ ] `REACT_APP_API_URL` added to Vercel user panel
- [ ] User panel redeployed
- [ ] Login works from user panel

