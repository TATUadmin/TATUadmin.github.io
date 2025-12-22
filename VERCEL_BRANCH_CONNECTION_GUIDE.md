# 🔗 Connect Vercel Project to merger-test-2 Branch

**Project:** `tatu-app`  
**Branch:** `merger-test-2`  
**Root Directory:** `tatu-app`

---

## ✅ **Step-by-Step: Connect Branch to Vercel**

### **Step 1: Verify Git Status** ✅

**Current Status:**
- ✅ Branch: `merger-test-2`
- ✅ All changes pushed to `origin/merger-test-2`
- ✅ Repository: `TATUadmin/TATUadmin.github.io`

---

### **Step 2: Go to Vercel Project Settings**

1. Go to: https://vercel.com/dashboard
2. Find and click on your **tatu-app** project
3. Click **Settings** (gear icon in top right)

---

### **Step 3: Configure Git Connection**

1. In Settings, click **Git** in the left sidebar
2. Verify the repository is connected:
   - Should show: `TATUadmin/TATUadmin.github.io`
   - If not connected, click **Connect Git Repository** and select it

---

### **Step 4: Set Production Branch (Optional)**

1. Still in **Settings** → **Git**
2. Find **Production Branch**
3. Set to: `main` (or `master` - your main branch)
   - This is for production deployments
   - Preview branches will deploy automatically

---

### **Step 5: Configure Preview Branches**

1. In **Settings** → **Git**
2. Scroll to **Preview Branches**
3. Ensure `merger-test-2` is listed (or add it)
4. If not listed:
   - Click **Add Branch**
   - Enter: `merger-test-2`
   - Save

**Note:** Vercel automatically deploys all branches by default, but you can specify which ones to deploy.

---

### **Step 6: Set Root Directory** ⚠️ **CRITICAL**

1. In Settings, click **General** in the left sidebar
2. Scroll down to **Root Directory**
3. Click **Edit**
4. Enter: `tatu-app`
5. Click **Save**

**⚠️ IMPORTANT:** 
- Type exactly: `tatu-app` (no trailing slash, no quotes)
- This tells Vercel where your `package.json` is located

---

### **Step 7: Verify Environment Variables**

1. In Settings, click **Environment Variables**
2. Verify these are set:
   - ✅ `DATABASE_URL`
   - ✅ `RESEND_API_KEY`
   - ✅ `SENTRY_DSN`
   - ✅ `SENTRY_ENVIRONMENT`
   - ✅ `ENCRYPTION_KEY`
   - ✅ `NEXTAUTH_SECRET`
   - ✅ `NEXTAUTH_URL`

---

### **Step 8: Trigger Deployment**

**Option A: Auto-Deploy (Recommended)**
- Push a new commit to `merger-test-2` branch
- Vercel will automatically detect and deploy

**Option B: Manual Deploy**
1. Go to **Deployments** tab
2. Click **Create Deployment**
3. Select:
   - **Branch:** `merger-test-2`
   - **Root Directory:** `tatu-app` (should auto-fill)
4. Click **Deploy**

**Option C: Redeploy Latest**
1. Go to **Deployments** tab
2. Find the latest deployment for `merger-test-2`
3. Click **⋯** (three dots menu)
4. Click **Redeploy**

---

## 📋 **Configuration Checklist**

Before deploying, verify:

- [ ] Git repository connected: `TATUadmin/TATUadmin.github.io`
- [ ] Root Directory set to: `tatu-app`
- [ ] Branch `merger-test-2` is in preview branches (or auto-deploy enabled)
- [ ] All environment variables are set
- [ ] Latest code is pushed to `merger-test-2` branch

---

## 🚀 **Quick Deploy Command**

If you want to trigger a deployment right now:

```bash
# Make a small change and push
echo "# Deployment trigger" >> tatu-app/README.md
git add tatu-app/README.md
git commit -m "Trigger Vercel deployment for merger-test-2"
git push origin merger-test-2
```

This will trigger Vercel's auto-deployment.

---

## ✅ **Expected Result**

After configuration:

1. ✅ Vercel detects `merger-test-2` branch
2. ✅ Finds `package.json` in `tatu-app/` directory
3. ✅ Detects Next.js version 14.1.0
4. ✅ Builds successfully
5. ✅ Deploys to preview URL

---

## 🔍 **Troubleshooting**

### **Build Still Fails: "No Next.js version detected"**

**Solution:**
1. Double-check Root Directory is exactly `tatu-app`
2. Make sure you saved the setting
3. Try redeploying

### **Branch Not Deploying**

**Solution:**
1. Check Git connection in Vercel
2. Verify branch exists: `git branch -a`
3. Push a new commit to trigger deployment

### **Wrong Branch Deploying**

**Solution:**
1. Check Production Branch setting
2. Verify Preview Branches includes `merger-test-2`
3. Or disable auto-deploy and deploy manually

---

## 📊 **Current Status**

**Repository:** `TATUadmin/TATUadmin.github.io`  
**Branch:** `merger-test-2`  
**Root Directory:** `tatu-app`  
**Status:** Ready to deploy

---

**Follow these steps to connect and deploy!** 🚀

