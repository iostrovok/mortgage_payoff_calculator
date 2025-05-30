# 🚀 Vercel Deployment Checklist

## Pre-Deployment Setup ✅

- [x] `package.json` has build script: `"build": "expo export:web"`
- [x] `vercel.json` configuration file created
- [x] `.gitignore` excludes sensitive files (`.env`, `node_modules`)
- [x] Environment variables documented
- [x] All dependencies listed in `package.json`

## Required Files ✅

- [x] `server.js` - Express API server
- [x] `vercel.json` - Vercel configuration
- [x] `package.json` - Dependencies and scripts
- [x] `.env.example` - Environment template
- [x] `README.md` - Project documentation

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Framework:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `web-build`

### 3. Set Environment Variables
Add in Vercel dashboard:
```
OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_API_URL=https://your-app-name.vercel.app
```

### 4. Test Deployment
- [ ] App loads at `https://your-app-name.vercel.app`
- [ ] Mortgage calculator works
- [ ] AI assistant responds
- [ ] No console errors
- [ ] Mobile responsive

## Environment Variables Needed

### Server (Vercel Functions)
- `OPENAI_API_KEY` - Your OpenAI API key

### Client (React App)  
- `REACT_APP_API_URL` - API server URL (auto-set for Vercel)

## Troubleshooting Common Issues

### Build Fails
- Check Node.js version in Vercel settings
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard

### API Errors
- Verify environment variables set correctly
- Check serverless function logs
- Confirm CORS configuration

### Chart Errors (transform-origin)
- Remove `react-native-chart-kit` if causing issues
- Use custom chart components instead

## Production URLs

- **Development:** `http://localhost:8081`
- **Production:** `https://your-app-name.vercel.app`
- **API Health:** `https://your-app-name.vercel.app/api/health`

## Post-Deployment

- [ ] Test all features
- [ ] Check performance in Vercel Analytics
- [ ] Monitor error logs
- [ ] Set up custom domain (optional)
- [ ] Configure alerts for downtime

## One-Click Deploy Button

Add to README.md:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mortgage-payoff-calculator)
```