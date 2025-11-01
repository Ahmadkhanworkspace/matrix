# Deployment URLs

## Current Deployments

### ✅ Admin Panel (Vercel)
- **URL**: https://admin-panel-phi-hazel.vercel.app/
- **Status**: Deployed and Live
- **Configuration**: Root directory `admin-panel`, uses `REACT_APP_API_URL`

### ✅ Backend (Railway)
- **URL**: https://considerate-adventure-production.up.railway.app/
- **API Base**: https://considerate-adventure-production.up.railway.app/api
- **Status**: Deployed and Live
- **CORS**: Configured for admin panel and localhost

### 🚀 User Panel (Vercel)
- **URL**: (To be deployed)
- **Configuration**: Root directory `user-panel`, uses `REACT_APP_API_URL`
- **Environment Variable**: `REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api`

## Environment Variables

### Admin Panel (Vercel)
**Location**: Vercel Dashboard → Project Settings → Environment Variables
```
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app
```

### User Panel (Vercel)
**Location**: Vercel Dashboard → Project Settings → Environment Variables
```
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
REACT_APP_WS_URL=wss://considerate-adventure-production.up.railway.app
```

### Backend (Railway)
**Location**: Railway Dashboard → Project → Variables Tab

**Required Variables:**
```env
# Database - Supabase (PostgreSQL)
DATABASE_URL=postgresql://postgres:matrixsystem123@db.ddpjrwoyjphumeenabyb.supabase.co:5432/postgres
USE_PRISMA=true
SUPABASE_URL=https://ddpjrwoyjphumeenabyb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGpyd295anBodW1lZW5hYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTE4OTMsImV4cCI6MjA3NzU2Nzg5M30.zWME9ah-ZnPA3fpW4wn7-5RMLolkWwh_4ZF42YQXp90
SUPABASE_SERVICE_ROLE_KEY=get_from_supabase_dashboard

# OR MySQL (if not using Supabase)
# DB_HOST=...
# DB_USER=...
# DB_PASSWORD=...
# DB_NAME=mlm_system

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://userpanel-lac.vercel.app
ADMIN_URL=https://admin-panel-phi-hazel.vercel.app

# Auth
JWT_SECRET=your_secret_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@matrixmlm.com

# Payment Gateways (add keys for CoinPayments, NOWPayments, Binance)
COINPAYMENTS_PRIVATE_KEY=...
COINPAYMENTS_PUBLIC_KEY=...
NOWPAYMENTS_API_KEY=...
# etc.
```

**CORS Origins** (configured in code):
- `https://admin-panel-phi-hazel.vercel.app`
- `https://userpanel-lac.vercel.app`
- Localhost origins for development

**📖 See `ENVIRONMENT_VARIABLES_GUIDE.md` for complete setup instructions**

## Next Steps

1. ✅ Admin panel deployed
2. ✅ Backend deployed on Railway
3. ⏳ Deploy user panel to Vercel
4. ⏳ Add user panel URL to backend CORS
5. ⏳ Redeploy backend with updated CORS

