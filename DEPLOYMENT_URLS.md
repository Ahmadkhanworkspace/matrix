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
```
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
```

### User Panel (Vercel - To be set)
```
REACT_APP_API_URL=https://considerate-adventure-production.up.railway.app/api
```

### Backend (Railway)
- Set CORS origins to include:
  - `https://admin-panel-phi-hazel.vercel.app`
  - User panel Vercel URL (after deployment)
  - Localhost origins for development

## Next Steps

1. ✅ Admin panel deployed
2. ✅ Backend deployed on Railway
3. ⏳ Deploy user panel to Vercel
4. ⏳ Add user panel URL to backend CORS
5. ⏳ Redeploy backend with updated CORS

