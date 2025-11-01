# User Panel Vercel Deployment Guide

## 📋 Reference Configuration

**Admin Panel (Deployed)**: https://admin-panel-phi-hazel.vercel.app/

**Backend (Railway)**: https://considerate-adventure-production.up.railway.app/

**API URL for Environment Variable**: `https://considerate-adventure-production.up.railway.app/api`

## ✅ Current Configuration Status

- ✅ User panel API configuration matches admin panel
- ✅ Backend CORS updated to include admin panel URL
- ✅ Socket.IO CORS updated
- ✅ Ready for deployment

## 🚀 Deployment Steps

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "feat: Configure user panel for Vercel deployment and update backend CORS"
git push origin main
```

### Step 2: Deploy User Panel on Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project Settings** (Match Admin Panel)
   - **Framework Preset**: Create React App
   - **Root Directory**: `user-panel` ⚠️ **CRITICAL - Must set this!**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Environment Variables** (Same as Admin Panel)
   - Variable Name: `REACT_APP_API_URL`
   - Variable Value: `https://considerate-adventure-production.up.railway.app/api`
   - **Apply to**: ✅ Production, ✅ Preview, ✅ Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your new Vercel URL (e.g., `https://user-panel-xxx.vercel.app`)

### Step 3: Update Backend CORS with User Panel URL

After deployment, update `backend/src/server.js` with your new user panel URL:

```javascript
app.use(cors({
  origin: [
    'https://admin-panel-phi-hazel.vercel.app',  // Existing admin panel
    'https://your-user-panel.vercel.app',       // ⬅️ Add your new user panel URL here
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Also update Socket.IO CORS:
```javascript
const io = new Server(server, {
  cors: {
    origin: [
      'https://admin-panel-phi-hazel.vercel.app',
      'https://your-user-panel.vercel.app',  // ⬅️ Add here too
      // ... rest of origins
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

**Then redeploy your Railway backend.**

## 📊 Configuration Comparison

| Setting | Admin Panel | User Panel | Status |
|---------|-------------|------------|--------|
| Vercel URL | https://admin-panel-phi-hazel.vercel.app | (after deployment) | ✅ |
| Framework | Create React App | Create React App | ✅ Match |
| Root Directory | `admin-panel` | `user-panel` | ✅ Match |
| API URL Config | `REACT_APP_API_URL` | `REACT_APP_API_URL` | ✅ Match |
| Backend | Railway | Railway | ✅ Same |

## 🎯 Post-Deployment Checklist

- [ ] User panel deployed on Vercel
- [ ] Environment variable `REACT_APP_API_URL` set in Vercel
- [ ] User panel URL added to backend CORS
- [ ] Railway backend redeployed with updated CORS
- [ ] User panel loads successfully
- [ ] Login/Register works
- [ ] API calls go to Railway backend
- [ ] No CORS errors in browser console
- [ ] Real-time features (Socket.IO) work

## 🔗 Deployment URLs

- **Admin Panel**: https://admin-panel-phi-hazel.vercel.app/ ✅
- **User Panel**: https://your-user-panel.vercel.app/ (after deployment)
- **Backend**: https://considerate-adventure-production.up.railway.app/ (Railway) ✅

---

**The user panel is configured and ready for deployment! 🚀**
