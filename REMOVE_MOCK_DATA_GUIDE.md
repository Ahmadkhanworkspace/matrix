# 🧹 Remove Mock Data and Configure Real API Guide

## 📋 Overview

This guide will help you:
1. ✅ Remove mock/dummy credentials from frontend
2. ✅ Configure real API endpoints
3. ✅ Update cron jobs to use Prisma
4. ✅ Connect to production database

---

## 🔍 Mock Data Locations Found

### 1. **User Panel - AuthContext (CRITICAL)**
**File:** `user-panel/src/contexts/AuthContext.tsx`
- ❌ Dummy credentials (admin/admin123, user/user123, etc.)
- ❌ Mock user data creation

### 2. **Simple Server - Mock Dashboard Data**
**File:** `simple-server.js` (root directory)
- ❌ Mock data object with fake statistics
- This is a test server, can be removed or updated

### 3. **Admin Panel - MSW Mocks**
**File:** `admin-panel/src/mocks/handlers.ts`
- ⚠️ Used for development/testing
- Can disable in production build

---

## ✅ Step-by-Step Removal

### Step 1: Update User Panel AuthContext

**Current:** Uses dummy credentials  
**Change to:** Real API calls

Update `user-panel/src/contexts/AuthContext.tsx` to call:
```
POST /api/auth/login
```

### Step 2: Verify API Endpoints

Ensure these backend endpoints exist:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Step 3: Set Environment Variables

**User Panel (.env or Vercel):**
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

**Admin Panel (.env or Vercel):**
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### Step 4: Disable MSW in Production

**File:** `admin-panel/src/index.tsx` or `admin-panel/src/App.tsx`

```typescript
// Only enable MSW in development
if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser');
  worker.start();
}
```

---

## 🔧 What to Keep

✅ **Keep these for testing:**
- `TEST_CREDENTIALS.md` - Documentation only
- MSW mocks in development mode

❌ **Remove these:**
- Hardcoded dummy credentials in production code
- Mock data in production builds

---

## ✅ After Removal Checklist

- [ ] User panel uses real API for login
- [ ] Admin panel uses real API for login
- [ ] All API calls point to Railway backend
- [ ] Environment variables set correctly
- [ ] Test with real database connection
- [ ] Verify authentication tokens work
- [ ] Check that all dashboard data loads from API

