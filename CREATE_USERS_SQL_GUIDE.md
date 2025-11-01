# 👤 Create Admin & User Accounts - SQL Method

## 🚀 Quick Method: Use Supabase SQL Editor

Since Prisma can't connect from your local machine, use Supabase SQL Editor instead.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb**
2. Click **SQL Editor** in the left sidebar
3. Click **New query** button

### Step 2: Copy SQL Script

1. Open the file: `create-users.sql` (in this folder)
2. **Select All** (Ctrl+A) and **Copy** (Ctrl+C)

### Step 3: Paste and Run

1. Paste the SQL into Supabase SQL Editor
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for execution

### Step 4: Verify Users Created

After running, you should see output showing:
- Admin user: `admin` / `admin@matrixmlm.com`
- Regular user: `user` / `user@matrixmlm.com`

---

## 🔑 Login Credentials

### Admin User:
```
Username: admin
Password: admin123
Email: admin@matrixmlm.com
Status: ACTIVE, PRO Member
```

### Regular User:
```
Username: user
Password: user123
Email: user@matrixmlm.com
Status: ACTIVE, FREE Member
```

---

## ✅ What the SQL Does

1. **Creates Admin User:**
   - Username: `admin`
   - Password: `admin123` (bcrypt hashed)
   - Member Type: PRO
   - Status: ACTIVE
   - Email Verified: Yes

2. **Creates Regular User:**
   - Username: `user`
   - Password: `user123` (bcrypt hashed)
   - Member Type: FREE
   - Status: ACTIVE
   - Email Verified: Yes

3. **Uses ON CONFLICT:**
   - Updates existing users if they already exist
   - Won't create duplicates

---

## 🧪 Test Login

### Test Admin Login:
1. Go to: https://userpanel-lac.vercel.app
2. Username: `admin`
3. Password: `admin123`

### Test User Login:
1. Go to: https://userpanel-lac.vercel.app
2. Username: `user`
3. Password: `user123`

---

## 🔍 Verify in Supabase Dashboard

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select `users` table
4. You should see both users listed

---

## 📝 SQL File Location

**File:** `create-users.sql` (in project root)

---

## ⚠️ Important Notes

1. **Passwords are hashed** using bcrypt (not plain text)
2. **Users are set to ACTIVE** immediately
3. **Email is verified** by default
4. **Balances start at 0** (expected for new users)

---

## 🎯 After Creating Users

1. ✅ Users created in database
2. ✅ Test login in user panel
3. ✅ Dashboard should show real data (may be $0.00 for new users)
4. ✅ Can add transactions/positions later to test with data

