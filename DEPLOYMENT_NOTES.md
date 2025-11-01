# Deployment Notes

## User Panel Vercel Deployment

### Environment Variables to Set in Vercel

Before deploying to Vercel, make sure to set the following environment variable in your Vercel project settings:

```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

Replace `your-backend.railway.app` with your actual Railway backend URL.

### Steps to Deploy:

1. **Connect Repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `user-panel` directory as the root directory

2. **Configure Build Settings:**
   - Framework Preset: Create React App
   - Root Directory: `user-panel`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` with your backend API URL
   - Make sure to set it for Production, Preview, and Development environments

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Important Notes:

- The API URL in `user-panel/src/api/api.ts` is configured to use environment variables
- For production, the backend URL should be your Railway deployment URL
- Make sure your Railway backend allows CORS from your Vercel domain
- Socket.IO connections will need to use the same backend URL

### Backend CORS Configuration:

Make sure your backend `server.js` has CORS configured to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3000' // For local development
  ],
  credentials: true
}));
```

