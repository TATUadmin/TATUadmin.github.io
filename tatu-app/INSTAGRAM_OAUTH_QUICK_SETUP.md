# Instagram OAuth Quick Setup Guide

## Quick Steps to Configure Instagram OAuth

### 1. Create Facebook App (5 minutes)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type
4. Fill in:
   - **App Name**: TATU
   - **App Contact Email**: Your email
   - **Business Account**: Select or create one
5. Click **"Create App"**

### 2. Add Instagram Basic Display Product

1. In your Facebook App dashboard, go to **"Add Products"** (left sidebar)
2. Find **"Instagram Basic Display"** and click **"Set Up"**
3. Complete the setup wizard

### 3. Get Your App Credentials

1. Go to **Settings** → **Basic** in your Facebook App dashboard
2. Copy the **App ID** (this is your `FACEBOOK_APP_ID`)
3. Click **"Show"** next to **App Secret** → Copy it (this is your `FACEBOOK_APP_SECRET`)

### 4. Configure OAuth Redirect URI

1. Go to **Products** → **Instagram Basic Display** → **Basic Display**
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:3000/api/instagram/callback
   ```
   (For production, also add: `https://your-domain.com/api/instagram/callback`)
3. Click **"Save Changes"**

### 5. Add Environment Variables

Add these to your `.env.local` file in the `tatu-app` directory:

```bash
# Facebook/Instagram OAuth
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# Make sure NEXTAUTH_URL is set (should already be there)
NEXTAUTH_URL=http://localhost:3000
```

**To add them:**
1. Open `tatu-app/.env.local` in your editor
2. Add the two lines above with your actual App ID and Secret
3. Save the file
4. Restart your development server (`npm run dev`)

### 6. Add Test User (For Development)

1. Go to **Roles** → **Roles** → **Instagram Testers**
2. Click **"Add Instagram Testers"**
3. Enter your Instagram username
4. Accept the invitation from your Instagram app (check notifications)

### 7. Test It!

1. Restart your dev server: `npm run dev`
2. Go to your dashboard
3. Click **"Link Instagram"**
4. You should be redirected to Facebook/Instagram OAuth
5. After authorizing, you'll be redirected back

## Troubleshooting

**"Instagram OAuth is not configured"**
- Make sure you added `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` to `.env.local`
- Restart your dev server after adding variables

**"Redirect URI mismatch"**
- Make sure you added `http://localhost:3000/api/instagram/callback` in Facebook App settings
- Check that it matches exactly (no trailing slashes)

**"Invalid OAuth access token"**
- Make sure you added yourself as an Instagram Tester
- Check that you accepted the tester invitation in Instagram

## For Production (Vercel)

When deploying to production, add these environment variables in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `FACEBOOK_APP_ID` = your_app_id
   - `FACEBOOK_APP_SECRET` = your_app_secret
   - `NEXTAUTH_URL` = https://your-domain.com
3. Also add the production redirect URI in Facebook App settings:
   - `https://your-domain.com/api/instagram/callback`

## Need Help?

See the full guide: `INSTAGRAM_OAUTH_SETUP.md`

