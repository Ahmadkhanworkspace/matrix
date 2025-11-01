# User Panel Vercel Deployment Guide

## Configuration (Matches Admin Panel Setup)

The user panel is configured exactly like the admin panel for consistency:

### API URL Configuration
- Uses `REACT_APP_API_URL` environment variable (same as admin panel)
- Falls back to `http://localhost:5000/api` for local development
- Set the Railway backend URL in Vercel environment variables

## Deployment Steps

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "feat: Configure user panel for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Create React App
   - **Root Directory**: `user-panel` ⚠️ **IMPORTANT - Set this!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables** (Same as Admin Panel)
   - Click "Environment Variables"
   - Add: `REACT_APP_API_URL`
   - Value: Your Railway backend URL (e.g., `https://your-backend.railway.app/api`)
   - **Apply to**: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Update Backend CORS (If Not Already Done)

Update `backend/src/server.js` to include your Vercel user panel domain:

```javascript
app.use(cors({
  origin: [
    'https://your-user-panel.vercel.app',  // Add your user panel Vercel URL
    'https://your-admin-panel.vercel.app', // Your existing admin panel URL
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
```

**Note**: Make sure to redeploy your Railway backend after updating CORS settings.

## Verification Checklist

After deployment:

- [ ] Build completes successfully in Vercel
- [ ] App loads at Vercel URL
- [ ] Login/Register pages load
- [ ] API calls go to Railway backend (check browser Network tab)
- [ ] No CORS errors in console
- [ ] Authentication works
- [ ] Dashboard loads with data

## Environment Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL (Railway) | `https://your-backend.railway.app/api` |

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Verify `package.json` has all dependencies
- Ensure root directory is set to `user-panel`

### API Calls Return 404
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check Railway backend is running and accessible
- Verify backend route imports are correct (should be fixed)

### CORS Errors
- Update backend CORS to include your Vercel domain
- Redeploy Railway backend after CORS update
- Check browser console for specific CORS error messages

### Environment Variable Not Working
- Variable must start with `REACT_APP_`
- Redeploy after adding/updating environment variables
- Check that variable is applied to correct environment (Production/Preview/Development)
