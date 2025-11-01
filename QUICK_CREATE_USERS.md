# ⚡ Quick Guide: Create Admin & User Accounts

## 🚀 Fastest Method: Supabase SQL Editor

### Step 1: Open SQL Editor
1. Go to: **https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb/sql/new**
2. Click **"New query"** if needed

### Step 2: Copy & Paste SQL
Open `create-users.sql` file and copy all content, then paste into SQL Editor.

### Step 3: Run
Click **"Run"** button (or Ctrl+Enter)

### Step 4: Done! ✅
Users are created. Test login:
- **Admin:** `admin` / `admin123`
- **User:** `user` / `user123`

---

## 📋 Credentials

| Account | Username | Password | Email | Type |
|---------|----------|----------|-------|------|
| **Admin** | `admin` | `admin123` | admin@matrixmlm.com | PRO |
| **User** | `user` | `user123` | user@matrixmlm.com | FREE |

---

## ✅ Verify

After running SQL, you should see:
```
2 rows inserted/updated
```

Then check users table:
```sql
SELECT username, email, status, "memberType" FROM users WHERE username IN ('admin', 'user');
```

---

## 🎯 Test Login

1. Go to: **https://userpanel-lac.vercel.app**
2. Login with:
   - Username: `admin` or `user`
   - Password: `admin123` or `user123`

---

**File to use:** `create-users.sql`

