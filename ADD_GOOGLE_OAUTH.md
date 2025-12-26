# 🔐 Add Google OAuth - Social Login Setup

**Priority:** High 🔥  
**Time Required:** 15-20 minutes  
**Difficulty:** Medium

---

## 📋 What This Does

Allows users to sign in with their Google account ("Sign in with Google" button):
- ✅ Easier for users (no password to remember)
- ✅ More secure (Google handles authentication)
- ✅ Faster registration process
- ✅ Professional appearance

---

## 🎯 What You Need

Three environment variables:
1. `GOOGLE_CLIENT_ID` - Public identifier
2. `GOOGLE_CLIENT_SECRET` - Private key (keep secret!)
3. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - For client-side

---

## ✅ Step-by-Step Instructions

### **Step 1: Go to Google Cloud Console**

1. Open https://console.cloud.google.com/
2. Sign in with your Google account

### **Step 2: Create a Project (or Select Existing)**

**If you don't have a project:**
1. Click the project dropdown at the top (says "Select a project")
2. Click **"New Project"**
3. Name it: `TATU` or `tatu-tattoo-app`
4. Click **"Create"**
5. Wait 30 seconds for it to be created
6. Select your new project from the dropdown

**If you already have a project:**
1. Just select it from the dropdown

### **Step 3: Enable Google+ API**

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for: `Google+ API`
3. Click on it
4. Click **"Enable"**
5. Wait for it to enable (takes 10-20 seconds)

### **Step 4: Create OAuth Consent Screen**

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**

**Fill in the form:**

```
App name: TATU Tattoo Platform
User support email: [your email]
App logo: [optional - skip for now]
App domain: 
  - Application home page: https://tatufortattoos.com
  - Privacy policy: https://tatufortattoos.com/privacy
  - Terms of service: https://tatufortattoos.com/terms
Developer contact email: [your email]
```

4. Click **"Save and Continue"**
5. On "Scopes" page, click **"Add or Remove Scopes"**
6. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
7. Click **"Update"** → **"Save and Continue"**
8. On "Test users" page, click **"Save and Continue"**
9. Review and click **"Back to Dashboard"**

### **Step 5: Create OAuth 2.0 Credentials**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**

**Fill in the form:**

```
Name: TATU Web App

Authorized JavaScript origins:
  - https://tatufortattoos.com
  - http://localhost:3000

Authorized redirect URIs:
  - https://tatufortattoos.com/api/auth/callback/google
  - http://localhost:3000/api/auth/callback/google
```

4. Click **"Create"**

### **Step 6: Copy Your Credentials**

You'll see a popup with:
- **Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456ghi789`)

**⚠️ IMPORTANT:** Copy these immediately! Keep them safe!

### **Step 7: Add to Vercel Environment Variables**

1. Go to https://vercel.com/dashboard
2. Open your **"tatu-app"** project
3. Go to **Settings** → **Environment Variables**

**Add Variable 1:**
```
Name: GOOGLE_CLIENT_ID
Value: [paste your Client ID]
Environments: ✅ Production  ✅ Preview  ✅ Development
```
Click **"Save"**

**Add Variable 2:**
```
Name: GOOGLE_CLIENT_SECRET
Value: [paste your Client Secret]
Environments: ✅ Production  ✅ Preview  ✅ Development
```
Click **"Save"**

**Add Variable 3:**
```
Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: [paste your Client ID again - same as Variable 1]
Environments: ✅ Production  ✅ Preview  ✅ Development
```
Click **"Save"**

---

## 🔄 Redeploy Required

**Yes!** You need to redeploy for these changes to take effect.

### **Option 1: Automatic (Recommended)**
If your Vercel project has auto-deploy enabled:
1. Just make a small commit and push to `main`
2. Or trigger a redeploy from Vercel dashboard

### **Option 2: Manual Redeploy**
From Vercel Dashboard:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Confirm

---

## ✅ Verification Checklist

After redeployment, verify:

- [ ] Go to https://tatufortattoos.com/login
- [ ] You should see a "Sign in with Google" button
- [ ] Click it - it should redirect to Google
- [ ] Authorize the app
- [ ] You should be redirected back and logged in

---

## 📊 Environment Variables Added

```
✅ GOOGLE_CLIENT_ID = 123456789-abc...apps.googleusercontent.com
✅ GOOGLE_CLIENT_SECRET = GOCSPX-abc123...
✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID = 123456789-abc...apps.googleusercontent.com
```

---

## 🆘 Troubleshooting

### **"Error 400: redirect_uri_mismatch"**
- Check your Authorized redirect URIs in Google Cloud Console
- Make sure they exactly match: `https://tatufortattoos.com/api/auth/callback/google`

### **"Sign in with Google" button doesn't appear**
- Clear browser cache
- Check browser console for errors
- Verify environment variables are set in Vercel

### **Can't find OAuth consent screen**
- Make sure you selected your project in Google Cloud Console
- Look under "APIs & Services" in the left sidebar

### **"Access blocked: TATU hasn't completed Google verification"**
- This is normal for new apps
- Add yourself as a test user in OAuth consent screen
- Or complete Google verification process (takes a few days)

---

## 🔒 Security Notes

- ✅ Keep `GOOGLE_CLIENT_SECRET` private - never commit it to Git
- ✅ Only add trusted redirect URIs
- ✅ Use HTTPS in production (Vercel handles this)
- ✅ Review Google Cloud Console security recommendations

---

## 📈 Publishing Your App (Optional - Later)

To allow anyone to use "Sign in with Google":

1. Go to Google Cloud Console → OAuth consent screen
2. Click **"Publish App"**
3. Submit for verification (if needed)
4. Wait for Google approval (1-3 days typically)

For now, you can add test users to allow specific people to sign in.

---

## ✅ Status

- [x] Google Cloud Project created
- [x] OAuth consent screen configured
- [x] OAuth credentials created
- [x] Client ID copied
- [x] Client Secret copied
- [x] Variables added to Vercel
- [ ] Redeployment triggered
- [ ] Tested on live site

**✅ Google OAuth setup complete!** 🎉

---

**Next Steps:**
1. Redeploy your app
2. Test "Sign in with Google" on your live site
3. Celebrate! 🎊

**Want to add Stripe payments next?** See `ADD_STRIPE_PAYMENTS.md` (we can create this when you're ready)

