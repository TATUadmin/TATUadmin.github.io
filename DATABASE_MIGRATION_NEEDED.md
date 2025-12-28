# 🔄 Database Migration Required

## ⚠️ Critical: Database Schema Update Needed

To enable Google OAuth, we made the `password` field **optional** in the User model. This allows OAuth users (Google, etc.) to sign in without having a password in the database.

---

## 📋 **What Changed:**

**Before:**
```prisma
password      String    // Required - breaks OAuth
```

**After:**
```prisma
password      String?   // Optional - allows OAuth users
```

---

## 🚀 **How to Apply the Migration:**

### **Option 1: Using Prisma (Recommended)**

Run this command in your terminal (you'll need the DATABASE_URL from Vercel environment variables):

```bash
cd tatu-app
npx prisma db push
```

This will update your Supabase database to make the password column nullable.

---

### **Option 2: Using Supabase Dashboard (Alternative)**

1. **Go to:** https://supabase.com/dashboard
2. **Select your project**
3. **Go to:** SQL Editor
4. **Run this SQL:**

```sql
-- Make password column optional (nullable)
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
```

5. **Click "Run"**

---

## ✅ **After Migration:**

Once the database is updated, Google OAuth will work! Users will be able to:
- ✅ Sign up with Google (no password needed)
- ✅ Sign in with Google
- ✅ Be created in the database with `password = null`
- ✅ Have default role of `CUSTOMER`

---

## 🔍 **How to Verify:**

After running the migration, check your database:

```sql
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'password';
```

You should see `is_nullable = 'YES'`

---

## 🎯 **Next Step:**

**Run the migration NOW**, then test Google OAuth again at:
https://www.tatufortattoos.com/login

---

**Note:** This migration is **safe** - existing users with passwords will continue to work normally. Only new OAuth users will have `null` passwords.

