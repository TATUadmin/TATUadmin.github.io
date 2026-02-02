# Instagram OAuth Setup Guide

This guide will walk you through configuring Instagram OAuth for the TATU application. Instagram integration uses Facebook OAuth (Instagram Basic Display API requires Facebook Login).

## Prerequisites

- A Facebook Developer account
- An Instagram Business or Creator account (for Instagram Basic Display API)
- Access to your application's environment variables

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type
4. Fill in:
   - **App Name**: TATU (or your preferred name)
   - **App Contact Email**: Your email
   - **Business Account**: Select or create one
5. Click **"Create App"**

## Step 2: Add Instagram Basic Display Product

1. In your Facebook App dashboard, go to **"Add Products"**
2. Find **"Instagram Basic Display"** and click **"Set Up"**
3. Click **"Create New App"** or select an existing one
4. Complete the setup wizard

## Step 3: Configure OAuth Settings

1. In your Facebook App dashboard, go to **Settings** → **Basic**
2. Note your **App ID** and **App Secret** (you'll need these for environment variables)
3. Click **"Add Platform"** → **"Website"**
4. Add your site URL:
   - **Site URL**: `https://your-domain.com` (or `http://localhost:3000` for development)
   - **App Domains**: `your-domain.com` (or `localhost` for development)

## Step 4: Configure Instagram Basic Display

1. Go to **Products** → **Instagram Basic Display** → **Basic Display**
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   https://your-domain.com/api/instagram/callback
   ```
   For development:
   ```
   http://localhost:3000/api/instagram/callback
   ```
3. Click **"Save Changes"**

## Step 5: Add Instagram Test Users (Development Only)

For development/testing, you need to add Instagram test users:

1. Go to **Roles** → **Roles** → **Instagram Testers**
2. Click **"Add Instagram Testers"**
3. Enter Instagram usernames of test accounts
4. Test users must accept the invitation from their Instagram app

**Note**: In production, users will authenticate with their own Instagram accounts.

## Step 6: Set Environment Variables

Add these to your `.env.local` file (for development) or your hosting platform (Vercel, etc.):

```bash
# Facebook/Instagram OAuth (Required for Instagram integration)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Optional fallback (if you prefer these names)
INSTAGRAM_CLIENT_ID=your_facebook_app_id_here
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret_here

# Base URL (should already be set)
NEXTAUTH_URL=http://localhost:3000  # Development
# NEXTAUTH_URL=https://your-domain.com  # Production
```

### Getting Your App ID and Secret

1. Go to **Settings** → **Basic** in your Facebook App dashboard
2. Copy the **App ID** → This is your `FACEBOOK_APP_ID`
3. Click **"Show"** next to App Secret → Copy this → This is your `FACEBOOK_APP_SECRET`

⚠️ **Security Note**: Never commit these values to version control. Always use environment variables.

## Step 7: Request Permissions (Production)

For production, you need to submit your app for review:

1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - `instagram_basic` - Access basic profile information
   - `instagram_manage_messages` - Access to Instagram Direct Messages (if needed)
3. Fill out the required forms and submit for review

**Note**: For development, you can use test users without review.

## Step 8: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to your dashboard
3. Navigate to the dashboard where Instagram linking is available
4. Click **"Link Instagram"**
5. You should be redirected to Facebook/Instagram OAuth
6. After authorization, you'll be redirected back to your dashboard

## Troubleshooting

### Error: "Instagram integration not configured"
- **Solution**: Make sure `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are set in your environment variables
- Restart your development server after adding environment variables

### Error: "Redirect URI mismatch"
- **Solution**: Ensure the redirect URI in your Facebook App settings matches exactly:
  - Development: `http://localhost:3000/api/instagram/callback`
  - Production: `https://your-domain.com/api/instagram/callback`

### Error: "Invalid OAuth access token"
- **Solution**: 
  - Make sure you're using a valid Instagram Business/Creator account
  - Check that your app has the correct permissions
  - Verify your App Secret is correct

### Mock Mode in Development
If Instagram OAuth is not configured, the app will use mock mode in development:
- Mock tokens are generated automatically
- No actual Instagram data is fetched
- This allows development without OAuth setup

To disable mock mode, configure the environment variables above.

## API Endpoints

The Instagram OAuth flow uses these endpoints:

- **POST `/api/instagram/auth`** - Initiates OAuth flow
- **GET `/api/instagram/callback`** - Handles OAuth callback
- **GET `/api/instagram/images`** - Fetches Instagram images
- **POST `/api/instagram/unlink`** - Unlinks Instagram account

## Additional Resources

- [Facebook Developers Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Basic Display API Guide](https://developers.facebook.com/docs/instagram-basic-display-api/overview)
- [OAuth 2.0 Flow](https://developers.facebook.com/docs/instagram-basic-display-api/overview#authentication)

## Production Checklist

Before going to production:

- [ ] App is submitted for review (if using production permissions)
- [ ] Environment variables are set in production environment
- [ ] Redirect URIs are configured for production domain
- [ ] Test with real Instagram accounts
- [ ] Verify token refresh logic works (tokens expire after 60 days)
- [ ] Set up error monitoring for OAuth failures



