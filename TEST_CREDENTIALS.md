# 🧪 Matrix MLM System - Test Credentials

## 🚀 **System Status: READY FOR TESTING**

Your Matrix MLM system is now running locally with dummy credentials for testing purposes.

---

## 👤 **User Panel Test Accounts**

**Access URL:** http://localhost:3000

### **Available Test Accounts:**

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| 👑 **Admin User** | `admin` | `admin123` | Pro member with high balance |
| 👤 **Regular User** | `user` | `user123` | Free member with standard balance |
| 🎯 **Demo User** | `demo` | `demo123` | Demo account for testing |
| 🧪 **Test User** | `test` | `test123` | Test account for development |

### **User Account Features:**
- Dashboard with statistics
- Wallet management
- Matrix positions
- Referral tracking
- Withdrawal requests
- Profile management

---

## 👨‍💼 **Admin Panel Test Accounts**

**Access URL:** http://localhost:3002

### **Available Admin Accounts:**

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| 👑 **Admin** | `admin` | `admin123` | Full admin access |
| 🚀 **Super Admin** | `superadmin` | `super123` | Super admin privileges |
| 👨‍💼 **Manager** | `manager` | `manager123` | Manager level access |
| 🎯 **Demo Admin** | `demo` | `demo123` | Demo admin account |

### **Admin Panel Features:**
- User management
- Matrix oversight
- Financial management
- System configuration
- Statistics and reporting
- Content management

---

## 🔧 **Backend API**

**API URL:** http://localhost:3001

### **Available Endpoints:**
- `GET /api/health` - Health check
- `GET /api/dashboard` - Dashboard data
- `GET /api/members` - Member statistics
- `GET /api/boards` - Matrix board data
- `GET /api/financial` - Financial statistics
- `GET /api/testimonials` - Testimonial data
- `GET /api/promotional` - Promotional content
- `GET /api/system` - System status

---

## 🚀 **How to Test the System**

### **1. Start All Services:**
```bash
# Terminal 1: Backend API
cd NewMatrixSystem
node simple-server.js

# Terminal 2: User Panel
cd user-panel
npm start

# Terminal 3: Admin Panel
cd admin-panel
npm start
```

### **2. Test User Panel:**
1. Open http://localhost:3000
2. Use any of the test credentials above
3. Navigate through different sections
4. Test matrix positions, wallet, etc.

### **3. Test Admin Panel:**
1. Open http://localhost:3002
2. Login with admin credentials
3. Access user management
4. View system statistics
5. Test matrix management

### **4. Test API Endpoints:**
1. Visit http://localhost:3001/api/health
2. Test other endpoints for data
3. Verify JSON responses

---

## 📊 **Test Data Included**

### **User Data:**
- Mock user profiles
- Transaction history
- Matrix positions
- Referral networks
- Financial balances

### **System Data:**
- Matrix configurations
- Payment statistics
- Member counts
- Board statuses
- Promotional content

---

## ⚠️ **Important Notes**

1. **This is a TEST system** - All data is mock data
2. **No real transactions** - All financial data is simulated
3. **No database persistence** - Data resets on restart
4. **Use test credentials only** - Don't use real passwords
5. **Development mode** - Not optimized for production

---

## 🔍 **Troubleshooting**

### **If User Panel Shows JSON Error:**
- Ensure React dev server is running on port 3000
- Check that backend API is running on port 3001
- Verify no proxy conflicts

### **If Admin Panel Won't Load:**
- Check if admin panel is running on port 3002
- Verify API endpoints are accessible
- Check browser console for errors

### **If API Endpoints Fail:**
- Ensure simple-server.js is running
- Check port 3001 is not blocked
- Verify CORS configuration

---

## 🎯 **Next Steps**

1. **Test all user features** with different accounts
2. **Explore admin panel** functionality
3. **Test matrix operations** and calculations
4. **Verify payment flows** and transactions
5. **Check responsive design** on different devices

---

**🎉 Your Matrix MLM System is now ready for comprehensive testing!**

Use the credentials above to explore all features and functionality.
