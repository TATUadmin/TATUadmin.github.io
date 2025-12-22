# 🗄️ Adding DATABASE_URL to Vercel

**Database:** TimescaleDB (PostgreSQL)  
**Status:** Ready to add

---

## 🎯 **Method 1: Vercel Dashboard (Recommended)**

### **Step-by-Step:**

1. **Go to Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Log in if needed

2. **Select Your Project**
   - Click on your TATU project

3. **Navigate to Environment Variables**
   - Click **Settings** (top navigation)
   - Click **Environment Variables** (left sidebar)

4. **Add New Variable**
   - Click **Add New** button (top right)

5. **Enter Variable Details**
   - **Key:** `DATABASE_URL`
   - **Value:** `postgres://tsdbadmin:h21blfnwk9oyk2x8@hz6gw1dce1.inz83dy7g3.tsdb.cloud.timescale.com:32245/tsdb?sslmode=require`
   - **Environments:** Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

6. **Save**
   - Click **Save** button
   - You should see the variable appear in the list

**✅ Done!** Your DATABASE_URL is now added.

---

## 🎯 **Method 2: Vercel CLI (Alternative)**

If you prefer command line:

```bash
cd tatu-app
npx vercel env add DATABASE_URL production
```

When prompted, paste:
```
postgres://tsdbadmin:h21blfnwk9oyk2x8@hz6gw1dce1.inz83dy7g3.tsdb.cloud.timescale.com:32245/tsdb?sslmode=require
```

Then repeat for Preview and Development:
```bash
npx vercel env add DATABASE_URL preview
# Paste the same connection string when prompted

npx vercel env add DATABASE_URL development
# Paste the same connection string when prompted
```

---

## ✅ **Verification**

### **Check It's Added:**
1. Go back to Vercel Dashboard
2. Settings → Environment Variables
3. You should see `DATABASE_URL` in the list
4. Verify it shows for all three environments

### **Test Database Connection:**
After deployment, you can test the connection:
- The app should connect to TimescaleDB successfully
- Prisma migrations will run automatically
- Database queries should work

---

## 🔒 **Security Notes**

- ✅ Connection string is now stored securely in Vercel
- ✅ Never commit this to Git
- ✅ Contains database credentials (encrypted in Vercel)
- ✅ SSL is required (`sslmode=require`) - already included ✓

---

## 📋 **Next Steps**

After adding DATABASE_URL:

1. ✅ Add `RESEND_API_KEY` (if not already added)
2. ✅ Add `SENTRY_DSN` (get from sentry.io)
3. ✅ Add `SENTRY_ENVIRONMENT` = `production`
4. ✅ Test deployment

---

## 🎯 **What This Enables**

After adding this variable, your app can:
- ✅ Connect to TimescaleDB database
- ✅ Run Prisma migrations
- ✅ Store and retrieve user data
- ✅ Handle authentication
- ✅ Manage appointments, portfolios, etc.

---

**Your database connection is now configured!** 🗄️✅

