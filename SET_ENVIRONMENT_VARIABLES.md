# Setting Environment Variables in Vercel

## ✅ Already Set (by me)
- `NEXTAUTH_SECRET` - Secure random secret (generated)
- `NEXTAUTH_URL` - Set to `https://tatufortattoos.com`

## 🔴 Required - You Need to Set These

### 1. DATABASE_URL (Required)
**What it is:** Your database connection string  
**Where to get it:** From your database provider (PlanetScale, Supabase, etc.)

**To set it:**
```bash
cd tatu-app
echo "your_database_connection_string_here" | npx vercel env add DATABASE_URL production
```

**Or in Vercel Dashboard:**
1. Go to Project → Settings → Environment Variables
2. Click "Add New"
3. Name: `DATABASE_URL`
4. Value: Your database connection string
5. Environment: Production (and Preview/Development if needed)
6. Click "Save"

### 2. ENCRYPTION_KEY (Required for email/secure features)
**What it is:** A 64-character hex string for encrypting sensitive data  
**Generate one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Then set it:**
```bash
echo "your_64_char_hex_string" | npx vercel env add ENCRYPTION_KEY production
```

### 3. RESEND_API_KEY (Required for email functionality)
**What it is:** API key from Resend.com for sending emails  
**Where to get it:** Sign up at https://resend.com and get your API key

**To set it:**
```bash
echo "re_your_api_key_here" | npx vercel env add RESEND_API_KEY production
```

## 🟡 Optional - Set These If You're Using These Features

### 4. GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (For Google OAuth)
**Where to get:** Google Cloud Console → APIs & Services → Credentials

**To set:**
```bash
echo "your_google_client_id" | npx vercel env add GOOGLE_CLIENT_ID production
echo "your_google_client_secret" | npx vercel env add GOOGLE_CLIENT_SECRET production
```

### 5. STRIPE_PUBLIC_KEY & STRIPE_SECRET_KEY (For payments)
**Where to get:** Stripe Dashboard → Developers → API keys

**To set:**
```bash
echo "pk_live_..." | npx vercel env add STRIPE_PUBLIC_KEY production
echo "sk_live_..." | npx vercel env add STRIPE_SECRET_KEY production
```

### 6. UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN (For rate limiting/caching)
**Where to get:** Upstash Dashboard if you're using Redis

**To set:**
```bash
echo "your_redis_url" | npx vercel env add UPSTASH_REDIS_REST_URL production
echo "your_redis_token" | npx vercel env add UPSTASH_REDIS_REST_TOKEN production
```

## 📝 Quick Setup Guide

### Option 1: Using Vercel CLI (Command Line)
```bash
cd tatu-app

# Required variables
echo "your_database_url" | npx vercel env add DATABASE_URL production
echo "your_64_char_hex" | npx vercel env add ENCRYPTION_KEY production
echo "re_your_key" | npx vercel env add RESEND_API_KEY production

# Optional variables (if using these features)
echo "your_google_id" | npx vercel env add GOOGLE_CLIENT_ID production
echo "your_google_secret" | npx vercel env add GOOGLE_CLIENT_SECRET production
echo "pk_live_..." | npx vercel env add STRIPE_PUBLIC_KEY production
echo "sk_live_..." | npx vercel env add STRIPE_SECRET_KEY production
```

### Option 2: Using Vercel Dashboard (Easier)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your `tatu-app` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter each variable:
   - **Name**: The variable name (e.g., `DATABASE_URL`)
   - **Value**: Your actual value
   - **Environment**: Select **Production** (and optionally Preview/Development)
6. Click **Save**
7. Repeat for each variable

## ⚠️ Important Notes

1. **After adding variables, redeploy:**
   ```bash
   npx vercel --prod --yes
   ```

2. **Generate ENCRYPTION_KEY:**
   Run this command to generate a secure key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Minimum Required:**
   - `NEXTAUTH_SECRET` ✅ (already set)
   - `NEXTAUTH_URL` ✅ (already set)
   - `DATABASE_URL` ⚠️ (you need to set this)
   - `ENCRYPTION_KEY` ⚠️ (you need to set this)
   - `RESEND_API_KEY` ⚠️ (you need to set this for email)

4. **Test your deployment:**
   After setting variables, test at `https://tatu-app.vercel.app`

## 🔍 Check Current Variables

To see what's currently set:
```bash
npx vercel env ls
```




