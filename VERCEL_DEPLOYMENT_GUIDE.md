# 🚀 **MATRIX MLM SYSTEM - VERCEL DEPLOYMENT GUIDE**

## 📋 **OVERVIEW**

This guide provides step-by-step instructions for deploying the Matrix MLM System frontend to Vercel while keeping the backend on a separate server.

---

## 🏗️ **ARCHITECTURE**

### **Frontend (Vercel)**
- ✅ **User Panel** - React application for end users
- ✅ **Admin Panel** - React application for administrators
- ✅ **Static Assets** - Images, CSS, JavaScript bundles

### **Backend (Separate Server)**
- ✅ **API Server** - Node.js/Express backend
- ✅ **Database** - PostgreSQL with Prisma ORM
- ✅ **Redis** - Caching and sessions
- ✅ **Cron Jobs** - Matrix processing and automation

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Prepare Frontend for Vercel**

#### **1.1 User Panel Deployment**

1. **Create Vercel Project**
   ```bash
   # Navigate to user panel
   cd user-panel
   
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Configure Environment Variables**
   Create `.env.local` in user-panel:
   ```env
   # API Configuration
   REACT_APP_API_URL=https://your-backend-domain.com/api
   REACT_APP_WS_URL=wss://your-backend-domain.com
   
   # Authentication
   REACT_APP_JWT_STORAGE_KEY=user_token
   REACT_APP_REFRESH_TOKEN_KEY=user_refresh_token
   
   # Application Settings
   REACT_APP_NAME=Matrix MLM User Panel
   REACT_APP_VERSION=1.0.0
   REACT_APP_ENVIRONMENT=production
   
   # Feature Flags
   REACT_APP_ENABLE_REAL_TIME=true
   REACT_APP_ENABLE_NOTIFICATIONS=true
   REACT_APP_ENABLE_ANALYTICS=true
   
   # Payment Gateway Configuration
   REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
   REACT_APP_COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
   REACT_APP_NOWPAYMENTS_API_KEY=your_nowpayments_api_key
   
   # Matrix Configuration
   REACT_APP_MATRIX_LEVELS=3
   REACT_APP_MATRIX_POSITIONS_PER_LEVEL=3,9,27
   REACT_APP_MATRIX_CYCLE_BONUS=100,250,500
   
   # Referral System
   REACT_APP_REFERRAL_BONUS_PERCENTAGE=10
   REACT_APP_REFERRAL_DEPTH_LIMIT=5
   
   # Withdrawal Settings
   REACT_APP_MIN_WITHDRAWAL_AMOUNT=50
   REACT_APP_MAX_WITHDRAWAL_AMOUNT=10000
   REACT_APP_WITHDRAWAL_FEE_PERCENTAGE=2.5
   ```

3. **Deploy to Vercel**
   ```bash
   # Deploy user panel
   vercel --prod
   ```

#### **1.2 Admin Panel Deployment**

1. **Create Separate Vercel Project**
   ```bash
   # Navigate to admin panel
   cd admin-panel
   
   # Configure environment variables
   ```

2. **Configure Admin Environment Variables**
   Create `.env.local` in admin-panel:
   ```env
   # API Configuration
   REACT_APP_API_URL=https://your-backend-domain.com/api
   REACT_APP_WS_URL=wss://your-backend-domain.com
   
   # Authentication
   REACT_APP_JWT_STORAGE_KEY=admin_token
   REACT_APP_REFRESH_TOKEN_KEY=admin_refresh_token
   
   # Application Settings
   REACT_APP_NAME=Matrix MLM Admin Panel
   REACT_APP_VERSION=1.0.0
   REACT_APP_ENVIRONMENT=production
   
   # Feature Flags
   REACT_APP_ENABLE_REAL_TIME=true
   REACT_APP_ENABLE_NOTIFICATIONS=true
   REACT_APP_ENABLE_ANALYTICS=true
   
   # Payment Gateway Configuration
   REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
   REACT_APP_COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
   REACT_APP_NOWPAYMENTS_API_KEY=your_nowpayments_api_key
   
   # Email Configuration
   REACT_APP_SMTP_HOST=smtp.gmail.com
   REACT_APP_SMTP_PORT=587
   REACT_APP_SMTP_USER=your_email@gmail.com
   REACT_APP_SMTP_PASS=your_email_password
   
   # File Upload
   REACT_APP_MAX_FILE_SIZE=5242880
   REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
   
   # Analytics
   REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
   REACT_APP_FACEBOOK_PIXEL_ID=your_fb_pixel_id
   ```

3. **Deploy Admin Panel**
   ```bash
   # Deploy admin panel
   vercel --prod
   ```

### **Step 2: Configure Backend Server**

#### **2.1 Backend Environment Variables**
Create `.env` on your backend server:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/matrix_mlm

# JWT Secrets
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
JWT_VERIFICATION_SECRET=your_super_secret_jwt_verification_key
JWT_RESET_SECRET=your_super_secret_jwt_reset_key

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-user-panel-domain.vercel.app
ADMIN_URL=https://your-admin-panel-domain.vercel.app

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@yourdomain.com

# Payment Gateway Keys
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
COINPAYMENTS_PRIVATE_KEY=your_coinpayments_private_key
COINPAYMENTS_MERCHANT_ID=your_coinpayments_merchant_id
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_IPN_SECRET=your_nowpayments_ipn_secret

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

#### **2.2 Start Backend Services**

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### **Step 3: Configure Matrix System**

#### **3.1 Matrix Processing Requirements**

The matrix system requires several cron jobs to run automatically:

1. **Matrix Processing Job** (Every 2 minutes)
   - Processes matrix positions
   - Handles cycle completions
   - Updates user earnings

2. **Payment Processing Job** (Every 5 minutes)
   - Processes pending payments
   - Updates payment statuses
   - Handles webhooks

3. **Bonus Distribution Job** (Every 15 minutes)
   - Distributes referral bonuses
   - Processes matrix bonuses
   - Handles cycle bonuses

4. **Email Processing Job** (Every 10 minutes)
   - Sends notification emails
   - Processes email queue

#### **3.2 Start Cron Jobs**

The cron jobs are automatically started when the server starts:

```bash
# The CronService is initialized in server.ts
# No manual intervention needed
```

#### **3.3 Manual Matrix Processing**

You can also trigger matrix processing manually:

```bash
# Via API endpoint
curl -X POST https://your-backend-domain.com/api/admin/matrix/process

# Or via server console
npm run matrix:process
```

---

## 🔧 **VERCEL-SPECIFIC CONFIGURATIONS**

### **1. Custom Domain Setup**

1. **Add Custom Domain in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Domains
   - Add your custom domain

2. **Configure DNS**
   - Point your domain to Vercel's nameservers
   - Or add CNAME record pointing to your Vercel deployment

### **2. Environment Variables in Vercel**

1. **Add Environment Variables**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add all the environment variables listed above

2. **Environment-Specific Variables**
   - Production: Add variables for production environment
   - Preview: Add variables for staging environment

### **3. Build Configuration**

1. **User Panel Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "installCommand": "npm install"
   }
   ```

2. **Admin Panel Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "installCommand": "npm install"
   }
   ```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **1. CORS Configuration**

Update your backend CORS settings to allow Vercel domains:

```typescript
// In your backend server.ts
app.use(cors({
  origin: [
    'https://your-user-panel.vercel.app',
    'https://your-admin-panel.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### **2. Environment Variables Security**

- ✅ Never commit `.env` files to Git
- ✅ Use Vercel's environment variable system
- ✅ Rotate secrets regularly
- ✅ Use different keys for staging and production

### **3. API Security**

- ✅ Implement rate limiting
- ✅ Use HTTPS for all API calls
- ✅ Validate all input data
- ✅ Implement proper authentication

---

## 📊 **MONITORING & MAINTENANCE**

### **1. Health Checks**

Monitor your backend API:
```bash
curl https://your-backend-domain.com/health
```

### **2. Matrix System Monitoring**

Check matrix processing status:
```bash
curl https://your-backend-domain.com/api/admin/matrix/status
```

### **3. Log Monitoring**

Monitor server logs for:
- Matrix processing errors
- Payment processing issues
- Email delivery failures
- Database connection problems

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify domain URLs in environment variables

2. **API Connection Issues**
   - Verify backend server is running
   - Check API URL in frontend environment variables
   - Ensure HTTPS is properly configured

3. **Matrix Processing Not Working**
   - Check cron job logs
   - Verify database connections
   - Ensure all required environment variables are set

4. **Payment Gateway Issues**
   - Verify API keys are correct
   - Check webhook configurations
   - Ensure SSL certificates are valid

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Backend server running and accessible
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] User panel deployed to Vercel
- [ ] Admin panel deployed to Vercel
- [ ] Custom domains configured
- [ ] SSL certificates installed
- [ ] Cron jobs running
- [ ] Payment gateways configured
- [ ] Email service working
- [ ] Health checks passing
- [ ] Matrix system processing correctly

---

## 🎉 **SUCCESS INDICATORS**

- ✅ User panel accessible at your domain
- ✅ Admin panel accessible at admin subdomain
- ✅ Users can register and login
- ✅ Matrix positions can be purchased
- ✅ Payments are processed correctly
- ✅ Bonuses are distributed automatically
- ✅ Emails are sent successfully
- ✅ Real-time updates work
- ✅ All features function properly

**🚀 Your Matrix MLM System is now fully deployed and operational!** 