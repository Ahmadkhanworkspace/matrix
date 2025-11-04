# Fix Admin Panel API URL

## Problem
The admin panel is calling `localhost:3001/api` instead of the Railway backend URL, causing 404 errors.

## Solution: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your **admin panel project**: `admin-panel-phi-hazel`

### Step 2: Add Environment Variable
1. Go to **Settings** → **Environment Variables**
2. Click **"+ Add New"** or **"Add"**
3. Enter:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://considerate-adventure-production.up.railway.app/api`
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic redeploy

## Verify It's Working

After redeploy, check the browser console - you should see:
- ✅ API calls going to: `https://considerate-adventure-production.up.railway.app/api`
- ❌ NOT: `http://localhost:3001/api`

## Quick Test

After redeploy, open the admin panel and check:
1. Browser DevTools → Network tab
2. Look for API requests
3. They should all point to Railway backend (not localhost)

