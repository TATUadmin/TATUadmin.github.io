# Deploy to Production on Vercel

Your domain `tatufortattoos.com` is properly configured! Now you need to deploy your app to production.

## Option 1: Deploy via Vercel CLI (Quickest)

This is the fastest way to deploy without needing to set up Git.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Or if you prefer using npx (no installation needed):
```bash
npx vercel --prod
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open a browser window for you to authenticate.

### Step 3: Navigate to Your Project

```bash
cd tatu-app
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

This will:
- Build your Next.js app
- Deploy it to production
- Connect it to your custom domain `tatufortattoos.com`

**Note:** If this is your first deployment, Vercel will ask you some questions:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **Yes** (if you already created the project in Vercel dashboard)
- What's your project's name? **tatu-app** (or whatever you named it)
- In which directory is your code located? **./** (current directory)

### Step 5: Set Environment Variables (If Needed)

If you haven't set environment variables in Vercel dashboard yet:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all your environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to `https://tatufortattoos.com`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `STRIPE_PUBLIC_KEY`
   - `STRIPE_SECRET_KEY`
   - Any other variables your app needs

3. After adding variables, redeploy:
   ```bash
   vercel --prod
   ```

## Option 2: Deploy via GitHub (Recommended for Ongoing Development)

This is better for ongoing development as it automatically deploys when you push to main.

### Step 1: Initialize Git Repository (If Not Already Done)

```bash
cd tatu-app
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it (e.g., `tatu-app` or `TATUadmin.github.io`)
3. Don't initialize with README (you already have files)

### Step 3: Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

### Step 4: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `tatu-app` (if your repo is at the root) or leave blank if `tatu-app` is the root
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
5. Add environment variables (see Step 5 in Option 1)
6. Click **Deploy**

### Step 5: Set Production Branch

1. In Vercel Dashboard → Settings → Git
2. Set **Production Branch** to `main`
3. Now every push to `main` will automatically deploy to production

## Important: Update NEXTAUTH_URL

After deployment, make sure your `NEXTAUTH_URL` environment variable in Vercel is set to:

```
https://tatufortattoos.com
```

**Not** `http://localhost:3000` or the Vercel preview URL.

## Verify Deployment

After deploying:

1. Visit `https://tatufortattoos.com` - your site should be live!
2. Check Vercel Dashboard → Deployments to see your production deployment
3. The domain should now show as "Valid" with a production deployment

## Troubleshooting

### "Build Failed"
- Check the build logs in Vercel dashboard
- Make sure all environment variables are set
- Verify `package.json` has correct build scripts

### "Environment Variables Missing"
- Go to Vercel Dashboard → Settings → Environment Variables
- Add all required variables
- Redeploy after adding variables

### "Domain Not Working After Deployment"
- Wait a few minutes for DNS/CDN propagation
- Clear browser cache
- Check Vercel deployment logs for errors

## Next Steps

Once deployed:
- ✅ Your site will be live at `https://tatufortattoos.com`
- ✅ SSL certificate is automatically provided by Vercel
- ✅ Future deployments happen automatically (if using GitHub) or via `vercel --prod`

## Quick Command Reference

```bash
# Deploy to production (CLI)
vercel --prod

# Deploy to preview (for testing)
vercel

# View deployment logs
vercel logs

# List all deployments
vercel ls
```

