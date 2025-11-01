# 👤 Create Admin & User Accounts - Instructions

## 🚀 Quick Method: Use Supabase SQL Editor

Since Prisma can't connect from your local machine (network issue), use Supabase SQL Editor instead.

---

## 📋 Step-by-Step

### Step 1: Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb/sql/new**
2. Click **"New query"** if needed

### Step 2: Copy SQL File
1. Open file: `create-users.sql` (in this folder)
2. **Select All** (Ctrl+A)
3. **Copy** (Ctrl+C)

### Step 3: Paste & Run
1. Paste into Supabase SQL Editor
2. Click **"Run"** button (or Ctrl+Enter)
3. Wait a few seconds

### Step 4: Verify ✅
You should see the users listed at the bottom of the results.

---

## 🔑 Login Credentials

### Admin User:
```
Username: admin
Password: admin123
Email: admin@matrixmlm.com
Type: PRO Member
```

### Regular User:
```
Username: user
Password: user123
Email: user@matrixmlm.com
Type: FREE Member
```

---

## 🧪 Test Login

### Test in User Panel:
1. Go to: **https://userpanel-lac.vercel.app**
2. Login with:
   - Username: `admin` or `user`
   - Password: `admin123` or `user123`

---

## ✅ What Gets Created

- ✅ Admin user (PRO member, ACTIVE status)
- ✅ Regular user (FREE member, ACTIVE status)
- ✅ Both have verified emails
- ✅ Passwords are bcrypt hashed
- ✅ All fields properly set

---

## 📝 SQL File Location

**File:** `D:\NewMatrixSystem\NewMatrixSystem\create-users.sql`

Just copy and paste into Supabase SQL Editor!

