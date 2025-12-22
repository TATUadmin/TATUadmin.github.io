# 📧 Adding RESEND_API_KEY to Vercel

**API Key:** `re_KbkKXSVe_7FpR1s6YqPXHm1FfJHgLnbm1`  
**Status:** Ready to add

---

## 🎯 **Method 1: Vercel Dashboard (Recommended)**

### **Step-by-Step:**

1. **Go to Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Log in if needed

2. **Select Your Project**
   - Click on your TATU project (or the project you're deploying)

3. **Navigate to Environment Variables**
   - Click **Settings** (top navigation)
   - Click **Environment Variables** (left sidebar)

4. **Add New Variable**
   - Click **Add New** button (top right)

5. **Enter Variable Details**
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_KbkKXSVe_7FpR1s6YqPXHm1FfJHgLnbm1`
   - **Environments:** Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

6. **Save**
   - Click **Save** button
   - You should see the variable appear in the list

**✅ Done!** Your RESEND_API_KEY is now added.

---

## 🎯 **Method 2: Vercel CLI (Alternative)**

If you prefer command line:

```bash
cd tatu-app
npx vercel env add RESEND_API_KEY production
```

When prompted, paste:
```
re_KbkKXSVe_7FpR1s6YqPXHm1FfJHgLnbm1
```

Then repeat for Preview and Development:
```bash
npx vercel env add RESEND_API_KEY preview
npx vercel env add RESEND_API_KEY development
```

---

## ✅ **Verification**

### **Check It's Added:**
1. Go back to Vercel Dashboard
2. Settings → Environment Variables
3. You should see `RESEND_API_KEY` in the list
4. Verify it shows for all three environments

### **Test Email Functionality:**
After deployment, test that emails work:
- Sign up a new user (should send verification email)
- Request password reset (should send reset email)
- Create appointment (should send confirmation email)

---

## 🔒 **Security Notes**

- ✅ API key is now stored securely in Vercel
- ✅ Never commit this key to Git
- ✅ Key is encrypted in Vercel's system
- ✅ Only accessible to your project

---

## 📋 **Next Steps**

After adding RESEND_API_KEY:

1. ✅ Add `DATABASE_URL` (if not already added)
2. ✅ Add `SENTRY_DSN` (get from sentry.io)
3. ✅ Add `SENTRY_ENVIRONMENT` = `production`
4. ✅ Test deployment

---

**Your email service is now configured!** 📧✅

