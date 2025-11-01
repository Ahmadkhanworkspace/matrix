# 👤 Create Admin & User Accounts - Guide

## 🚀 Quick Start

### Run the Script:
```bash
node create-admin-user.js
```

This will create:
- **Admin user:** `admin` / `admin123`
- **Regular user:** `user` / `user123`

---

## 📋 Default Credentials

### Admin User (for Admin Panel & User Panel):
```
Username: admin
Password: admin123
Email: admin@matrixmlm.com
```

### Regular User (for User Panel):
```
Username: user
Password: user123
Email: user@matrixmlm.com
```

---

## 🔧 Custom Credentials

You can set custom credentials using environment variables:

```bash
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=mypass123 USER_USERNAME=testuser USER_PASSWORD=test123 node create-admin-user.js
```

Or create a `.env` file:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@matrixmlm.com

USER_USERNAME=user
USER_PASSWORD=user123
USER_EMAIL=user@matrixmlm.com
```

---

## ✅ What the Script Does

1. **Connects to database** (Prisma/Supabase)
2. **Creates admin user:**
   - Status: ACTIVE
   - Member Type: PRO
   - Email verified: Yes
   - Password hashed with bcrypt
3. **Creates regular user:**
   - Status: ACTIVE
   - Member Type: FREE
   - Email verified: Yes
   - Password hashed with bcrypt
4. **Updates existing users** if they already exist

---

## 🧪 Testing Login

### Test Admin Login (Admin Panel):
1. Go to: https://admin-panel-phi-hazel.vercel.app
2. Username: `admin`
3. Password: `admin123`

### Test Admin Login (User Panel):
1. Go to: https://userpanel-lac.vercel.app
2. Username: `admin`
3. Password: `admin123`

### Test Regular User Login (User Panel):
1. Go to: https://userpanel-lac.vercel.app
2. Username: `user`
3. Password: `user123`

---

## 🔍 Verify Users Created

### Option 1: Check Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ddpjrwoyjphumeenabyb
2. Click **Table Editor**
3. Select `users` table
4. You should see the admin and user accounts

### Option 2: Use Prisma Studio
```bash
npx prisma studio
```
Then navigate to `User` table

### Option 3: Test API
```bash
curl -X POST https://considerate-adventure-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🛠️ Troubleshooting

### Error: "Can't reach database"
- Check `DATABASE_URL` in `.env` file
- Verify Supabase connection
- Run: `npx prisma generate` first

### Error: "User already exists"
- Script will update existing users automatically
- Or delete existing users from database first

### Error: "bcrypt not found"
- Install: `npm install bcryptjs`
- Or: `cd backend && npm install bcryptjs`

### Error: "Prisma client not generated"
```bash
npx prisma generate
```

---

## 📝 Script Location

- **File:** `create-admin-user.js` (root directory)
- **Can run from:** Anywhere (uses Prisma from root)

---

## ⚠️ Important Notes

1. **Change passwords** after first login in production
2. **Delete test users** before going live
3. **Set strong passwords** for production use
4. **Verify email verification** settings match your requirements

---

## ✅ After Running Script

1. ✅ Users created in database
2. ✅ Test login in admin panel
3. ✅ Test login in user panel
4. ✅ Verify users can access their dashboards
5. ✅ Change default passwords for security

