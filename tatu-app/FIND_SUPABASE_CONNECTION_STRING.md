# 🔍 How to Find Supabase Connection Pooler URL

## 📍 Where to Find It

The connection strings are **NOT** in the "Connection pooling configuration" section. They're in a different part of the Database settings.

### Step-by-Step:

1. **You're already in the right place:**
   - You're in **Settings** → **Database**
   - You can see "Connection pooling configuration"

2. **Scroll UP or look for "Connection string" section:**
   - Above the "Connection pooling configuration" section
   - Look for a section titled **"Connection string"** or **"Connection info"**
   - This section shows the actual connection URLs

3. **What you should see:**
   - **Direct connection** (for migrations)
   - **Connection pooling** with two modes:
     - **Session mode** (port 5432)
     - **Transaction mode** (port 6543) ← **This is what you need!**

4. **Copy the Transaction mode URL:**
   - It will look like:
     ```
     postgresql://postgres.rdgbnzygadfxhptmacfg:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Make sure to copy the **full URL** including the password placeholder

5. **Replace `[YOUR-PASSWORD]`:**
   - Use the database password you set when creating the project
   - Or use the "Reset database password" button if you don't remember it

---

## 🎯 Alternative: If You Can't Find It

If the "Connection string" section isn't visible, try:

### Option 1: Check Connection Info Tab
1. In the Database settings page
2. Look for tabs at the top: "General", "Connection info", "Pooling", etc.
3. Click on **"Connection info"** or **"Connection string"** tab

### Option 2: Use Project Settings
1. Go to **Settings** → **Project Settings** (not Database)
2. Look for **"Database"** section
3. Find **"Connection string"** or **"Connection pooling"**

### Option 3: Construct It Manually
If you can't find it, you can construct it using your project details:

1. **Get your project reference:**
   - It's in your Supabase URL: `https://supabase.com/dashboard/project/[PROJECT-REF]`
   - Your project ref appears to be: `rdgbnzygadfxhptmacfg` (from the error message)

2. **Get your region:**
   - Check your project settings or the Supabase URL
   - Common regions: `us-east-1`, `us-west-1`, `eu-west-1`, etc.

3. **Get your database password:**
   - Use the password you set when creating the project
   - Or reset it using the "Reset database password" button

4. **Construct the URL:**
   ```
   postgresql://postgres.rdgbnzygadfxhptmacfg:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   
   Replace:
   - `[PASSWORD]` with your actual database password
   - `[REGION]` with your region (e.g., `us-east-1`)

---

## 🔍 Quick Check: What Section Are You In?

The Supabase Database Settings page typically has these sections (in order):

1. ✅ **Database password** (you can see this)
2. ❓ **Connection string** (this is what you need - might be above or below)
3. ✅ **Connection pooling configuration** (you can see this)

**Try scrolling up** - the connection strings are usually above the pooling configuration!

---

## 📸 What to Look For

The "Connection string" section should show something like:

```
Connection string
─────────────────
URI (Transaction mode)
postgresql://postgres.rdgbnzygadfxhptmacfg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

URI (Session mode)
postgresql://postgres.rdgbnzygadfxhptmacfg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Copy the Transaction mode one (port 6543)!**

---

## ✅ Once You Have It

1. Copy the **full URL** (Transaction mode, port 6543)
2. Replace `[YOUR-PASSWORD]` with your actual password
3. Go to Vercel → Settings → Environment Variables
4. Update `DATABASE_URL` with this new URL
5. Redeploy

