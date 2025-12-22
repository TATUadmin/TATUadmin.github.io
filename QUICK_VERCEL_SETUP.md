# ⚡ Quick Vercel Setup - merger-test-2 Branch

**Follow these exact steps to connect and deploy:**

---

## 🎯 **Step-by-Step (5 minutes)**

### **1. Go to Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Click on your **tatu-app** project

### **2. Set Root Directory** ⚠️ **CRITICAL**
1. Click **Settings** (gear icon)
2. Click **General** (left sidebar)
3. Scroll to **Root Directory**
4. Click **Edit**
5. Type: `tatu-app`
6. Click **Save**

### **3. Verify Git Connection**
1. In Settings, click **Git** (left sidebar)
2. Verify repository: `TATUadmin/TATUadmin.github.io`
3. If not connected, click **Connect Git Repository**

### **4. Check Branch Settings**
1. Still in **Settings** → **Git**
2. Scroll to **Preview Branches**
3. Ensure `merger-test-2` is listed (or auto-deploy is enabled)

### **5. Deploy**
**Option A: Auto-Deploy (Easiest)**
- The commit we just pushed should trigger deployment automatically
- Go to **Deployments** tab and watch for new deployment

**Option B: Manual Deploy**
1. Go to **Deployments** tab
2. Click **Create Deployment**
3. Select:
   - **Branch:** `merger-test-2`
   - **Root Directory:** `tatu-app`
4. Click **Deploy**

---

## ✅ **What Should Happen**

1. ✅ Vercel detects the push to `merger-test-2`
2. ✅ Finds `package.json` in `tatu-app/` directory
3. ✅ Detects Next.js 14.1.0
4. ✅ Builds successfully
5. ✅ Deploys to preview URL

---

## 📋 **Quick Checklist**

- [ ] Root Directory = `tatu-app` ✅
- [ ] Git repository connected ✅
- [ ] Branch `merger-test-2` will deploy ✅
- [ ] Environment variables set ✅
- [ ] Latest code pushed ✅

---

## 🚀 **Status**

**Latest Commit:** `4988db7` - Vercel branch connection guide  
**Branch:** `merger-test-2`  
**Pushed:** ✅ Just now

**Next:** Configure Vercel settings above, then deployment will start!

---

**That's it! Follow the steps above and your app will deploy.** 🎉

