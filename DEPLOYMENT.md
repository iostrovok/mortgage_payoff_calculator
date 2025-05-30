# Deployment Guide - GitHub to Vercel

This guide will walk you through deploying the Mortgage Payoff Calculator to Vercel from a GitHub repository.

## Prerequisites

- GitHub account with the project repository
- Vercel account (free tier available)
- OpenAI API key

## Step 1: Prepare Your Repository

### 1.1 Create `.gitignore` (if not exists)

Make sure your `.gitignore` includes:

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
.expo/
dist/
build/
web-build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### 1.2 Update package.json

Ensure your `package.json` has the correct build scripts:

```json
{
    "scripts": {
        "start": "expo start",
        "web": "expo start --web",
        "build": "expo export:web",
        "server": "node server.js",
        "dev": "concurrently \"npm run server\" \"npm run web\""
    }
}
```

### 1.3 Create `vercel.json` Configuration

```json
{
    "version": 2,
    "builds": [
        {
            "src": "server.js",
            "use": "@vercel/node"
        },
        {
            "src": "package.json",
            "use": "@vercel/static-build",
            "config": {
                "distDir": "dist"
            }
        }
    ],
    "routes": [
        {
            "src": "/api/(.*)",
            "dest": "/server.js"
        },
        {
            "src": "/(.*)",
            "dest": "/dist/$1"
        }
    ],
    "env": {
        "OPENAI_API_KEY": "@openai_api_key"
    }
}
```

### 1.4 Add Build Script for Vercel

Create a `build` script in package.json:

```json
{
    "scripts": {
        "build": "expo export:web && cp -r web-build/* dist/"
    }
}
```

## Step 2: Push to GitHub

### 2.1 Initialize Git Repository (if not done)

```bash
git init
git add .
git commit -m "Initial commit: Mortgage Payoff Calculator"
```

### 2.2 Create GitHub Repository

1. Go to GitHub.com
2. Click "New repository"
3. Name it `mortgage-payoff-calculator`
4. Make it public or private
5. Don't initialize with README (since you have files)

### 2.3 Connect and Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/mortgage-payoff-calculator.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `mortgage-payoff-calculator` repository

### 3.2 Configure Project Settings

**Framework Preset:** Other
**Root Directory:** `./` (leave default)
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### 3.3 Set Environment Variables

In Vercel project settings, add:

- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key
- **Environment:** Production, Preview, Development

### 3.4 Advanced Settings (Optional)

- **Node.js Version:** 18.x
- **Build & Development Settings:**
    - Build Command: `expo export:web`
    - Output Directory: `web-build`

## Step 4: Configure for Production

### 4.1 Update API URL for Production

In your deployed app, the API calls should point to your Vercel domain:

```javascript
// In utils/openaiService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production'
	? 'https://your-app-name.vercel.app'
	: 'http://localhost:3001');
```

### 4.2 Environment Variables for Client

Add to Vercel environment variables:

- **Name:** `REACT_APP_API_URL`
- **Value:** `https://your-app-name.vercel.app`

## Step 5: Alternative Deployment Methods

### Method A: Separate Frontend/Backend Deployment

#### Deploy Frontend Only

1. Build web version: `expo export:web`
2. Deploy `web-build` folder to Vercel
3. Set API URL to external backend service

#### Deploy Backend Separately

1. Create separate repository for server.js
2. Deploy to Vercel Functions or other Node.js hosting
3. Update frontend API URL

### Method B: Serverless Functions

Convert server.js to Vercel serverless functions:

Create `api/chat.js`:

```javascript
export default async function handler(req, res) {
	// Move your /api/chat logic here
	// This becomes a Vercel serverless function
}
```

## Step 6: Custom Domain (Optional)

1. In Vercel project settings
2. Go to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 7: Monitoring and Logs

- **Vercel Dashboard:** Monitor deployments and performance
- **Function Logs:** View serverless function execution logs
- **Analytics:** Track usage and performance metrics

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   npm install --production
   ```

2. **Environment Variables:**
   ```bash
   # Verify in Vercel project settings
   # Redeploy after adding new variables
   ```

3. **API Endpoint Issues:**
   ```bash
   # Check serverless function limits
   # Verify API routes in vercel.json
   ```

4. **CORS Errors:**
   ```javascript
   // Ensure CORS is configured in server.js
   app.use(cors({
     origin: ['https://your-app.vercel.app', 'http://localhost:8081']
   }));
   ```

## Post-Deployment Checklist

- [ ] App loads correctly
- [ ] Mortgage calculations work
- [ ] AI assistant responds (if API key configured)
- [ ] Chart visualizations display
- [ ] Mobile responsive design works
- [ ] All API endpoints functional
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)

## Production Optimizations

1. **Performance:**
    - Enable Vercel Analytics
    - Optimize bundle size
    - Use CDN for static assets

2. **SEO:**
    - Add meta tags
    - Configure Open Graph tags
    - Add robots.txt

3. **Security:**
    - Validate all user inputs
    - Rate limit API endpoints
    - Use HTTPS only

## Continuous Deployment

Once connected to GitHub:

1. Push changes to `main` branch
2. Vercel automatically deploys
3. Preview deployments for pull requests
4. Rollback capabilities available

Your mortgage calculator will be live at: `https://your-app-name.vercel.app`