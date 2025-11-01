# ✅ Cron Service & Environment Variables - Complete Guide

## 🎯 Quick Answers

### Q: Where to put cron service?
**A: Already done!** It's in `backend/src/services/CronService.js` and automatically runs when Railway starts.

### Q: What variable in user panel?
**A: Add this to Vercel:**
```
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
```

---

## 📍 1. Cron Service Location

### ✅ Already Set Up - No Action Needed!

**File:** `backend/src/services/CronService.js`  
**Initialized in:** `backend/src/server.js` (line 297)

**How it works:**
```javascript
// In backend/src/server.js
async function initializeSystem() {
  // ...
  await CronService.initialize();  // ← Line 297 - Already here!
  // ...
}
```

**What happens:**
1. Railway starts your backend
2. Backend calls `CronService.initialize()`
3. All 6 cron jobs start automatically
4. They run in the background

**Verify it's working:**
- Go to Railway Dashboard → Your Project → **Logs**
- Look for: `"All cron jobs initialized successfully"`

---

## 🌐 2. User Panel Environment Variable

### ⚠️ Action Required: Add to Vercel

**Variable Name:**
```
REACT_APP_API_URL
```

**Variable Value:**
```
https://considerate-adventure-production.up.railway.app/api
```

**Where to Add:**

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your **user panel project**

### Step 2: Add Environment Variable
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Click **"+ Add New"** button

### Step 3: Enter Values
```
Name:  REACT_APP_API_URL
Value: https://considerate-adventure-production.up.railway.app/api
```

### Step 4: Select Environments
Check all boxes:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Step 5: Save & Redeploy
1. Click **Save**
2. Vercel will ask to redeploy - click **Redeploy**
3. Wait 2-3 minutes for deployment

---

## 📋 Complete Checklist

### Cron Service:
- [x] CronService.js exists ✅
- [x] Initialized in server.js ✅
- [ ] Check Railway logs to verify it's running

### User Panel:
- [ ] Go to Vercel Dashboard
- [ ] Add `REACT_APP_API_URL` variable
- [ ] Set value to: `https://considerate-adventure-production.up.railway.app/api`
- [ ] Redeploy user panel
- [ ] Test login from user panel

---

## 🔍 Verify Setup

### Check Cron Jobs:
```bash
# In Railway Dashboard → Logs, you should see:
✅ "Initializing cron jobs..."
✅ "Scheduled cron job: payment-processing with schedule: * * * * *"
✅ "Scheduled cron job: matrix-processing with schedule: */5 * * * *"
✅ "All cron jobs initialized successfully"
```

### Check User Panel:
1. Visit: `https://userpanel-lac.vercel.app`
2. Open browser console (F12)
3. Type: `console.log(process.env.REACT_APP_API_URL)`
4. Should show: `https://considerate-adventure-production.up.railway.app/api`

### Test API Connection:
1. Go to user panel
2. Try to login
3. Check network tab (F12 → Network)
4. Should see requests to: `considerate-adventure-production.up.railway.app`

---

## 📝 Summary

| What | Location | Status | Action |
|------|----------|--------|--------|
| Cron Service | `backend/src/services/CronService.js` | ✅ Ready | None - runs automatically |
| User Panel Variable | Vercel Dashboard | ⚠️ Missing | Add `REACT_APP_API_URL` |

---

## 🆘 Troubleshooting

### Cron jobs not in logs?
- Check Railway dashboard
- Look for any error messages
- Verify backend started successfully

### User panel can't connect?
- Double-check `REACT_APP_API_URL` value (must include `/api`)
- Ensure you redeployed after adding variable
- Check Vercel deployment logs
- Verify backend is running on Railway

---

## ✅ Done When:

1. ✅ Cron jobs visible in Railway logs
2. ✅ `REACT_APP_API_URL` added to Vercel
3. ✅ User panel redeployed
4. ✅ Login works from user panel

