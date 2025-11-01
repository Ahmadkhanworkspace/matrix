# 🔐 Environment Variables Setup Guide

## 📍 Where to Add Environment Variables

This guide shows exactly where to add environment variables for each service.

---

## 1️⃣ **Admin Panel (Vercel)**

### **Location**: Vercel Dashboard → Your Admin Panel Project → Settings → Environment Variables

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **admin panel project** (`admin-panel-phi-hazel`)
3. Click **Settings** → **Environment Variables**
4. Add the variables below
5. Select environment: **Production**, **Preview**, **Development** (or all)
6. Click **Save**
7. **Redeploy** the project for changes to take effect

### **Required Variables:**

```env
# Backend API URL
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api

# WebSocket URL (for real-time features)
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app

# Optional: Supabase (if using Supabase Auth)
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Screenshot Path in Vercel:**
```
Project → Settings → Environment Variables → Add New
```

---

## 2️⃣ **User Panel (Vercel)**

### **Location**: Vercel Dashboard → Your User Panel Project → Settings → Environment Variables

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **user panel project** (e.g., `userpanel-lac`)
3. Click **Settings** → **Environment Variables**
4. Add the variables below
5. Select environment: **Production**, **Preview**, **Development** (or all)
6. Click **Save**
7. **Redeploy** the project for changes to take effect

### **Required Variables:**

```env
# Backend API URL
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api

# WebSocket URL (for real-time features)
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app

# Optional: Supabase (if using Supabase Auth)
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 3️⃣ **Backend (Railway)**

### **Location**: Railway Dashboard → Your Backend Project → Variables Tab

**Steps:**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your **backend project** (`considerate-adventure-production`)
3. Click on the **project** → Go to **Variables** tab
4. Click **New Variable** or **+ Add**
5. Add each variable below (one at a time)
6. Variables are **automatically applied** (no redeploy needed for most vars, but restart helps)

### **Required Variables:**

#### **Database Configuration**
```env
# MySQL (Current Database - Optional)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mlm_system
DB_PORT=3306

# Supabase (PostgreSQL) - RECOMMENDED
DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
USE_PRISMA=true
SUPABASE_URL=https://ddpjrwoyjphumeenabyb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # Get from Supabase Dashboard → Settings → API
```

#### **Server Configuration**
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://userpanel-lac.vercel.app
ADMIN_URL=https://admin-panel-phi-hazel.vercel.app
```

#### **JWT Authentication**
```env
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
```

#### **Email Configuration**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM=noreply@matrixmlm.com
```

#### **Payment Gateways**
```env
# CoinPayments
COINPAYMENTS_PRIVATE_KEY=your_coinpayments_private_key
COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
COINPAYMENTS_MERCHANT_ID=your_coinpayments_merchant_id
COINPAYMENTS_IPN_SECRET=your_ipn_secret

# NOWPayments
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret

# Binance Pay
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
BINANCE_MERCHANT_ID=your_merchant_id
BINANCE_IPN_SECRET=your_ipn_secret
```

### **Screenshot Path in Railway:**
```
Project → Variables Tab → New Variable
```

---

## 📋 **Quick Reference Table**

| Variable | Admin Panel (Vercel) | User Panel (Vercel) | Backend (Railway) |
|----------|---------------------|---------------------|-------------------|
| `REACT_APP_API_URL` | ✅ Yes | ✅ Yes | ❌ No |
| `REACT_APP_WS_URL` | ✅ Optional | ✅ Optional | ❌ No |
| `JWT_SECRET` | ❌ No | ❌ No | ✅ Yes |
| `DATABASE_URL` | ❌ No | ❌ No | ✅ Yes |
| `SUPABASE_URL` | ✅ If using Supabase Auth | ✅ If using Supabase Auth | ✅ If using Supabase |
| Payment Gateway Keys | ❌ No (use public keys only) | ❌ No (use public keys only) | ✅ Yes (private keys) |
| `SMTP_*` | ❌ No | ❌ No | ✅ Yes |

---

## 🔒 **Security Notes**

### **Frontend (Vercel) - Public Variables**
- ⚠️ **All** environment variables starting with `REACT_APP_` are **exposed** in the browser
- **Never** put private keys, secrets, or API keys in frontend variables
- Only use **public keys** for payment gateways (e.g., `pk_live_...` for Stripe)
- Use **anon keys** for Supabase (not service role keys)

### **Backend (Railway) - Private Variables**
- ✅ All variables are **private** and not exposed
- ✅ Safe to use **private keys**, **secrets**, and **service role keys**
- ✅ Database credentials are secure

---

## 🚀 **Quick Setup Steps**

### **Step 1: Set Admin Panel Variables (Vercel)**
1. Vercel Dashboard → Admin Panel Project
2. Settings → Environment Variables
3. Add: `REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api`
4. Save → Redeploy

### **Step 2: Set User Panel Variables (Vercel)**
1. Vercel Dashboard → User Panel Project
2. Settings → Environment Variables
3. Add: `REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api`
4. Save → Redeploy

### **Step 3: Set Backend Variables (Railway)**
1. Railway Dashboard → Backend Project
2. Variables Tab
3. Add all required variables (see Backend section above)
4. Variables apply automatically (restart service if needed)

---

## 🔍 **How to Verify Environment Variables**

### **Vercel (Frontend)**
- Variables are available in `process.env.REACT_APP_*`
- Check in browser console: `console.log(process.env.REACT_APP_API_URL)`
- Or check build logs in Vercel deployment

### **Railway (Backend)**
- Variables are available in `process.env.*`
- Check logs: Railway Dashboard → Project → Deployments → View Logs
- Or add test endpoint: `GET /api/system/status` to see configuration

---

## 📝 **Example: Complete Setup**

### **Admin Panel (Vercel)**
```env
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app
```

### **User Panel (Vercel)**
```env
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app
```

### **Backend (Railway)**
```env
# Database
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
USE_PRISMA=true
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://userpanel-lac.vercel.app
ADMIN_URL=https://admin-panel-phi-hazel.vercel.app

# Auth
JWT_SECRET=your_super_secret_key_here_min_32_characters_long

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@matrixmlm.com

# Payment Gateways
COINPAYMENTS_PRIVATE_KEY=your_private_key
COINPAYMENTS_PUBLIC_KEY=your_public_key
COINPAYMENTS_MERCHANT_ID=your_merchant_id
COINPAYMENTS_IPN_SECRET=your_ipn_secret
NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret
```

---

## 🆘 **Troubleshooting**

### **Frontend Variables Not Working?**
1. ✅ Make sure variable starts with `REACT_APP_`
2. ✅ Redeploy after adding variables
3. ✅ Check Vercel build logs for errors
4. ✅ Clear browser cache

### **Backend Variables Not Working?**
1. ✅ Check Railway logs for errors
2. ✅ Restart the service in Railway
3. ✅ Verify variable names are correct (case-sensitive)
4. ✅ Check for typos in values

### **Still Having Issues?**
- Check `/api/system/status` endpoint for configuration
- Review Railway logs for startup errors
- Verify CORS configuration matches your frontend URLs

