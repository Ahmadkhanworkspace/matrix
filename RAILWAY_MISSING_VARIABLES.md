# 🔍 Missing Variables for Railway Backend

## ✅ Already Added (from screenshot)

You already have these:
- ✅ `DATABASE_URL`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `USE_PRISMA`
- ✅ `ADMIN_URL`
- ✅ `CORS_ORIGINS`
- ✅ `NODE_ENV`
- ✅ `PORT`

---

## ⚠️ **CRITICAL - Must Add:**

### 1. **SUPABASE_SERVICE_ROLE_KEY** ⚠️ **MOST IMPORTANT**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Get from Supabase Dashboard → Settings → API → service_role key]
```
**Why:** Needed for backend database operations and admin functions.

### 2. **JWT_SECRET** ⚠️ **REQUIRED**
```
Name: JWT_SECRET
Value: [Generate a random 32+ character string]
Example: your_super_secret_jwt_key_min_32_characters_long_12345
```
**Why:** Required for user authentication and token generation.

### 3. **FRONTEND_URL** ⚠️ **REQUIRED**
```
Name: FRONTEND_URL
Value: https://userpanel-lac.vercel.app
```
**Why:** Needed for CORS, password reset links, and frontend redirects.

---

## 📧 **Email Configuration (Highly Recommended):**

Add these for email functionality (welcome emails, password reset, purchase confirmations):

```
Name: SMTP_HOST
Value: smtp.gmail.com

Name: SMTP_PORT
Value: 587

Name: SMTP_USER
Value: your_email@gmail.com

Name: SMTP_PASS
Value: your_gmail_app_password

Name: SMTP_FROM
Value: noreply@matrixmlm.com
```

**Note:** For Gmail, you need an "App Password" (not your regular password).
- Go to: Google Account → Security → 2-Step Verification → App Passwords

---

## 💳 **Payment Gateway Keys (If Using Payment Features):**

### CoinPayments:
```
Name: COINPAYMENTS_PRIVATE_KEY
Value: [Your CoinPayments private key]

Name: COINPAYMENTS_PUBLIC_KEY
Value: [Your CoinPayments public key]

Name: COINPAYMENTS_MERCHANT_ID
Value: [Your CoinPayments merchant ID]

Name: COINPAYMENTS_IPN_SECRET
Value: [Your IPN secret]
```

### NOWPayments:
```
Name: NOWPAYMENTS_API_KEY
Value: [Your NOWPayments API key]

Name: NOWPAYMENTS_IPN_SECRET
Value: [Your IPN secret]
```

### Binance Pay:
```
Name: BINANCE_API_KEY
Value: [Your Binance API key]

Name: BINANCE_SECRET_KEY
Value: [Your Binance secret key]

Name: BINANCE_MERCHANT_ID
Value: [Your merchant ID]

Name: BINANCE_IPN_SECRET
Value: [Your IPN secret]
```

---

## 📋 **Quick Checklist:**

### Must Add (Critical):
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ← **GET THIS FIRST**
- [ ] `JWT_SECRET` ← **REQUIRED FOR LOGIN**
- [ ] `FRONTEND_URL` ← **REQUIRED FOR CORS**

### Recommended:
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (for emails)
- [ ] Payment gateway keys (if using payments)

### Optional:
- [ ] `LOG_LEVEL` (defaults to 'info' if not set)
- [ ] `REDIS_URL` (if using Redis for caching)

---

## 🚀 **How to Add:**

1. Click **"+ New Variable"** button in Railway
2. Enter **Name** and **Value**
3. Select environment: ✅ Production ✅ Preview ✅ Development
4. Click **Add**
5. Repeat for each variable

---

## 🔑 **Where to Get SUPABASE_SERVICE_ROLE_KEY:**

1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **Settings** (gear icon) → **API**
3. Scroll to **Project API keys**
4. Find **`service_role`** (⚠️ Secret key)
5. Copy the value
6. Add to Railway as `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔐 **How to Generate JWT_SECRET:**

You can use any of these methods:

**Option 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Online Generator**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated string

**Option 3: Random String**
- Use any random 32+ character string
- Example: `matrix_mlm_jwt_secret_2024_production_key_12345`

---

## ✅ **Minimum Required to Start:**

If you want to get started quickly, add at minimum:

1. ✅ `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Dashboard)
2. ✅ `JWT_SECRET` (generate random 32+ chars)
3. ✅ `FRONTEND_URL=https://userpanel-lac.vercel.app`

Then add email and payment gateway variables later as needed.

