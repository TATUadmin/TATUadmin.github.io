# Environment Variables - Deployment Checklist

**Last Updated:** December 2024  
**Status:** Ready for deployment configuration

---

## 🎯 **Deployment Readiness Status**

### ✅ **COMPLETED (Already Added)**
- ✅ `ENCRYPTION_KEY` - Encryption for sensitive data
- ✅ `NEXTAUTH_SECRET` - Authentication secret
- ✅ `NEXTAUTH_URL` - Application URL

### 🔴 **CRITICAL - Must Add for Deployment**
These are **REQUIRED** or the build/deployment will fail:
- ✅ `DATABASE_URL` - **ADDED** (TimescaleDB PostgreSQL)
- ✅ `RESEND_API_KEY` - **ADDED** (Email service)

### 🟡 **IMPORTANT - Core Features**
These are needed for core functionality to work:
- ❌ `GOOGLE_CLIENT_ID` - Google OAuth
- ❌ `GOOGLE_CLIENT_SECRET` - Google OAuth
- ❌ `STRIPE_SECRET_KEY` - Payment processing
- ❌ `STRIPE_WEBHOOK_SECRET` - Stripe webhooks
- ❌ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe frontend

### 🔴 **ENTERPRISE - Production Monitoring (NEW)**
These are **REQUIRED** for production error tracking:
- ✅ `SENTRY_DSN` - **ADDED** (Error tracking)
- ❌ `SENTRY_ENVIRONMENT` - **MUST ADD** (Set to `production`)
- ❌ `SENTRY_RELEASE` - Set to version (e.g., `1.0.0`)

### 🟡 **ENTERPRISE - Security (NEW - Recommended)**
- ❌ `HASH_SALT_ROUNDS` - Set to `12` (recommended for security)

---

## 📋 **Complete Variable List**

---

## ✅ **ALREADY ADDED - Don't Copy These**

These are already set in your Vercel project:

1. **ENCRYPTION_KEY** ✅
   - **Status:** Already added
   - **What it is:** 64-character hex string for encrypting sensitive data
   - **Action:** None needed

2. **NEXTAUTH_SECRET** ✅
   - **Status:** Already added
   - **What it is:** Secret key for NextAuth.js authentication
   - **Action:** None needed

3. **NEXTAUTH_URL** ✅
   - **Status:** Already added
   - **What it is:** Your application URL (e.g., `https://tatufortattoos.com`)
   - **Action:** None needed

---

## 🔴 **CRITICAL - Required for Build/Deployment**

**⚠️ DEPLOYMENT WILL FAIL WITHOUT THESE**

### 1. DATABASE_URL ⚠️ **READY TO ADD**
- **Status:** ⚠️ **CONNECTION STRING READY - JUST NEED TO ADD TO VERCEL**
- **What it is:** TimescaleDB (PostgreSQL) connection string
- **Why needed:** Required for Prisma to connect to database. Build will fail without this.
- **Your Connection String (Ready to Use):**
  ```
  postgres://tsdbadmin:h21blfnwk9oyk2x8@hz6gw1dce1.inz83dy7g3.tsdb.cloud.timescale.com:32245/tsdb?sslmode=require
  ```
- **Format:** `postgres://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require`
- **Note:** Prisma accepts both `postgres://` and `postgresql://` - both work the same
- **SSL:** Your connection requires SSL (`sslmode=require`) - this is already included ✓
- **Priority:** 🔴 **CRITICAL - Add to Vercel immediately**
- **✅ Verified:** TimescaleDB is 100% PostgreSQL compatible - perfect for Prisma!
- **Action:** Copy the connection string above and add it to Vercel environment variables
- **See:** `ADD_DATABASE_URL.md` for step-by-step instructions

### 2. RESEND_API_KEY ⚠️ **READY TO ADD**
- **Status:** ⚠️ **API KEY READY - JUST NEED TO ADD TO VERCEL**
- **What it is:** API key from Resend.com for sending emails
- **Why needed:** Required for email functionality (verification, password reset, notifications). App will crash if missing.
- **Your API Key (Ready to Use):**
  ```
  re_KbkKXSVe_7FpR1s6YqPXHm1FfJHgLnbm1
  ```
- **Format:** Starts with `re_...`
- **Priority:** 🔴 **CRITICAL - Add to Vercel immediately**
- **Action:** Copy the API key above and add it to Vercel environment variables
- **See:** `ADD_RESEND_API_KEY.md` for step-by-step instructions

---

## 🟡 **IMPORTANT - Required for Core Features**

**⚠️ Features won't work without these, but app will still deploy**

### 3. GOOGLE_CLIENT_ID ❌ **ADD FOR GOOGLE AUTH**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Google OAuth client ID
- **Why needed:** For Google authentication and Gmail integration
- **Where to find:** Google Cloud Console → APIs & Services → Credentials
- **Impact:** Google OAuth won't work without this

### 4. GOOGLE_CLIENT_SECRET ❌ **ADD FOR GOOGLE AUTH**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Google OAuth client secret
- **Why needed:** For Google authentication and Gmail integration
- **Where to find:** Google Cloud Console → APIs & Services → Credentials
- **Impact:** Google OAuth won't work without this

### 5. STRIPE_SECRET_KEY ❌ **ADD FOR PAYMENTS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Stripe secret key (server-side)
- **Why needed:** For payment processing
- **Format:** Starts with `sk_live_...` or `sk_test_...`
- **Where to get:** Stripe Dashboard → Developers → API keys
- **Impact:** Payments won't work without this

### 6. STRIPE_WEBHOOK_SECRET ❌ **ADD FOR PAYMENTS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Stripe webhook signing secret
- **Why needed:** For verifying Stripe webhook requests
- **Format:** Starts with `whsec_...`
- **Where to get:** Stripe Dashboard → Developers → Webhooks → Add endpoint → Copy signing secret
- **Impact:** Payment webhooks won't be verified without this

### 7. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ❌ **ADD FOR PAYMENTS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Stripe publishable key (client-side)
- **Why needed:** For Stripe payment forms on frontend
- **Format:** Starts with `pk_live_...` or `pk_test_...`
- **Where to get:** Stripe Dashboard → Developers → API keys
- **Note:** This is a `NEXT_PUBLIC_` variable, so it's exposed to the browser
- **Impact:** Payment forms won't work without this

---

## 🔴 **ENTERPRISE - Production Monitoring (NEW)**

**⚠️ REQUIRED for production error tracking**

### 30. SENTRY_DSN ❌ **MUST GET**
- **Status:** ❌ **NOT ADDED - REQUIRED FOR PRODUCTION**
- **What it is:** Sentry Data Source Name for error tracking
- **Why needed:** **REQUIRED** for production error tracking and monitoring. Without this, you won't see errors in production.
- **Where to get:**
  1. Go to https://sentry.io
  2. Sign up (free tier available) or log in
  3. Create new project → Select **Next.js**
  4. Name it: `TATU` or `tatu-app`
  5. Copy the **DSN** (shown after project creation)
- **Format:** `https://[KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]`
- **Priority:** 🔴 **CRITICAL - Add before production launch**
- **See:** `ADD_SENTRY.md` for detailed step-by-step instructions

### 31. SENTRY_ENVIRONMENT ❌ **ADD**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Environment name for Sentry
- **Why needed:** To filter errors by environment in Sentry dashboard
- **Options:** `production`, `staging`, `development`
- **Recommended:** Set to `production` for production deployment
- **Priority:** 🔴 **CRITICAL - Add with SENTRY_DSN**

### 32. SENTRY_RELEASE ❌ **ADD (Optional but Recommended)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Release version for Sentry tracking
- **Why needed:** To track which version has errors
- **Example:** `1.0.0`, `v2.1.3`, or Git commit hash
- **Note:** Can be auto-generated from Git commit
- **Priority:** 🟡 **Recommended**

---

## 🟡 **ENTERPRISE - Security (NEW - Recommended)**

### 46. HASH_SALT_ROUNDS ❌ **ADD (Recommended)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** bcrypt salt rounds for password hashing
- **Why needed:** Security best practice. Higher = more secure but slower.
- **Recommended:** `12` (balance of security and performance)
- **Default:** `10` (if not set, but 12 is recommended)
- **Priority:** 🟡 **Recommended for production**

### 47. CSRF_SECRET ❌ **ADD (Optional)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Secret key for CSRF protection
- **Why needed:** Additional security layer
- **Note:** Can use NEXTAUTH_SECRET if not set separately
- **Priority:** 🟢 **Optional**

---

## 🟢 **OPTIONAL - For Enhanced Features**

These are optional - features will work but may be limited without them:

### 8. UPSTASH_REDIS_REST_URL ❌ **ADD FOR CACHING**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Upstash Redis REST API URL
- **Why needed:** For rate limiting and caching (if using Upstash Redis)
- **Format:** `https://...upstash.io`
- **Impact:** Caching and rate limiting won't work without this

### 9. UPSTASH_REDIS_REST_TOKEN ❌ **ADD FOR CACHING**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Upstash Redis REST API token
- **Why needed:** For rate limiting and caching (if using Upstash Redis)
- **Impact:** Caching and rate limiting won't work without this

### 10. AWS_ACCESS_KEY_ID ❌ **ADD FOR FILE UPLOADS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** AWS access key for S3
- **Why needed:** For file uploads to S3 (portfolio images, documents)
- **Impact:** File uploads won't work without this

### 11. AWS_SECRET_ACCESS_KEY ❌ **ADD FOR FILE UPLOADS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** AWS secret key for S3
- **Why needed:** For file uploads to S3
- **Impact:** File uploads won't work without this

### 12. AWS_REGION ❌ **ADD FOR FILE UPLOADS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** AWS region (e.g., `us-east-1`)
- **Why needed:** For S3 file uploads
- **Impact:** File uploads won't work without this

### 13. AWS_BUCKET_NAME ❌ **ADD FOR FILE UPLOADS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** AWS S3 bucket name
- **Why needed:** For file uploads
- **Alternative variables that might exist:**
  - `AWS_S3_BUCKET_IMAGES`
  - `AWS_S3_BUCKET_DOCUMENTS`
  - `AWS_S3_BUCKET_PORTFOLIO`
- **Impact:** File uploads won't work without this

### 14. TWITTER_API_KEY ❌ **ADD FOR TWITTER INTEGRATION**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Twitter/X API key
- **Why needed:** For Twitter/X message syncing (if using)
- **Impact:** Twitter integration won't work without this

### 15. TWITTER_API_SECRET ❌ **ADD FOR TWITTER INTEGRATION**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Twitter/X API secret
- **Why needed:** For Twitter/X message syncing (if using)
- **Impact:** Twitter integration won't work without this

### 16. NEXT_PUBLIC_MAPBOX_TOKEN ❌ **ADD FOR MAPS**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Mapbox API token
- **Why needed:** For map functionality on explore page
- **Format:** Starts with `pk.eyJ...`
- **Note:** This is a `NEXT_PUBLIC_` variable
- **Impact:** Map features won't work without this

### 17. NEXT_PUBLIC_API_URL ❌ **ADD (Optional)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Public API URL
- **Why needed:** For API client configuration
- **Example:** `https://tatufortattoos.com` or `https://tatu-app.vercel.app`
- **Impact:** May affect API client configuration

### 18. NEXT_PUBLIC_APP_URL ❌ **ADD (Optional)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Public app URL
- **Why needed:** For WebSocket connections
- **Example:** `https://tatufortattoos.com`
- **Impact:** WebSocket features may not work without this

### 19. NEXT_PUBLIC_GOOGLE_CLIENT_ID ❌ **ADD FOR GOOGLE AUTH**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Google OAuth client ID (public version)
- **Why needed:** For Google OAuth on frontend
- **Note:** This is a `NEXT_PUBLIC_` variable
- **Impact:** Google OAuth frontend won't work without this

### 20. EMAIL_FROM ❌ **ADD (Optional)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Email sender address
- **Default:** `TATU <noreply@tatu.app>`
- **Example:** `TATU <noreply@tatufortattoos.com>`
- **Impact:** Uses default if not set

### 21. EMAIL_REPLY_TO ❌ **ADD (Optional)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Email reply-to address
- **Default:** `support@tatu.app`
- **Example:** `support@tatufortattoos.com`
- **Impact:** Uses default if not set

### 22. LOG_LEVEL ❌ **ADD (Optional)**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Logging level
- **Options:** `debug`, `info`, `warn`, `error`
- **Default:** `info`
- **Impact:** Uses default if not set

### 23-27. REDIS Variables ❌ **ADD (Optional)**
- **Status:** ❌ **NOT ADDED**
- **Variables:**
  - `REDIS_URL` - Redis connection URL (alternative to Upstash)
  - `REDIS_HOST` - Redis host (default: `localhost`)
  - `REDIS_PORT` - Redis port (default: `6379`)
  - `REDIS_PASSWORD` - Redis password
  - `REDIS_DB` - Redis database number (default: `0`)
- **Impact:** BullMQ background jobs need Redis. If not set, jobs may not work.

### 28. INSTAGRAM_CLIENT_ID ❌ **ADD FOR INSTAGRAM**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Instagram API client ID
- **Why needed:** For Instagram message syncing (if using)
- **Impact:** Instagram integration won't work without this

### 29. INSTAGRAM_CLIENT_SECRET ❌ **ADD FOR INSTAGRAM**
- **Status:** ❌ **NOT ADDED**
- **What it is:** Instagram API client secret
- **Why needed:** For Instagram message syncing (if using)
- **Impact:** Instagram integration won't work without this

---

## 🟢 **ENTERPRISE - Optional Enhanced Services**

These are optional enterprise features for scale (not needed for initial deployment):

### 33-36. Datadog/New Relic (Optional)
- `DATADOG_API_KEY` + `DATADOG_APP_KEY` - Full observability
- `NEW_RELIC_LICENSE_KEY` + `NEW_RELIC_APP_NAME` - APM monitoring
- **Priority:** 🟢 Optional - Sentry is sufficient for error tracking

### 37-40. Enhanced Email (Optional)
- `SENDGRID_API_KEY` - Enterprise email at scale
- `AWS_SES_*` - Cost-effective email at massive scale
- **Priority:** 🟢 Optional - Resend is fine for now

### 41-42. Enhanced Redis (Optional)
- `REDIS_CLOUD_URL` + `REDIS_CLOUD_PASSWORD` - Enterprise Redis
- **Priority:** 🟢 Optional - Upstash is fine for now

### 43-45. Supabase (Optional)
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- **Note:** You're already using Supabase for database, but these are for Supabase client features
- **Priority:** 🟢 Optional - Only if using Supabase client features

### 49-50. Cloudflare (Optional)
- `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` - Edge rate limiting
- **Priority:** 🟢 Optional - Only if using Cloudflare

---

## 📝 **How to Add Variables**

### **Option 1: Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter **Name** and **Value**
6. Select **Environments** (Production, Preview, Development)
7. Click **Save**

### **Option 2: Vercel CLI**
```bash
cd tatu-app
npx vercel env add VARIABLE_NAME production
# Paste the value when prompted
```

---

## 🎯 **Deployment Priority Checklist**

### **🔴 Phase 1: Critical (Deploy Won't Work Without These)**
- [x] `DATABASE_URL` - ✅ **ADDED** (TimescaleDB connection)
- [x] `RESEND_API_KEY` - ✅ **ADDED** (Email service)
- [x] `SENTRY_DSN` - ✅ **ADDED** (Error tracking)
- [ ] `SENTRY_ENVIRONMENT` - ❌ **MUST ADD** (Set to `production`)

**Progress:** 3/4 complete, 1/4 remaining

### **🟡 Phase 2: Core Features (Add Before Launch)**
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` - Google OAuth
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Payments
- [ ] `HASH_SALT_ROUNDS` - Set to `12` (security)

### **🟢 Phase 3: Enhanced Features (Add As Needed)**
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` - Caching/Rate limiting
- [ ] `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `AWS_REGION` + `AWS_BUCKET_NAME` - File uploads
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` - Maps
- [ ] `TWITTER_API_KEY` + `TWITTER_API_SECRET` - Twitter integration
- [ ] `INSTAGRAM_CLIENT_ID` + `INSTAGRAM_CLIENT_SECRET` - Instagram integration

---

## ⚠️ **Important Notes**

- **Minimum Required:** At minimum, you MUST add `DATABASE_URL` and `RESEND_API_KEY` or the build will fail
- **Check All Environments:** Some variables might be in Production, Preview, or Development - copy from all environments where they exist
- **Sensitive Data:** These are all sensitive values - handle them carefully
- **Already Added:** Don't re-add `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, or `NEXTAUTH_URL` - they're already set
- **Database:** You're using **TimescaleDB (PostgreSQL)** - your connection string is ready to use!

---

## 📚 **Related Documentation**

- **`DATABASE_MIGRATION_COMPLETE.md`** - Database configuration details
- **`DATABASE_SETUP_GUIDE.md`** - Supabase setup guide
- **`ENTERPRISE_TECH_STACK_EVALUATION.md`** - Complete tech stack analysis
- **`ENTERPRISE_IMPROVEMENTS_SUMMARY.md`** - Enterprise features added

---

## ✅ **Quick Status Summary**

**Already Done:**
- ✅ 3 variables added (ENCRYPTION_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL)
- ✅ 2 critical variables added (DATABASE_URL, RESEND_API_KEY)

**Must Get and Add for Deployment:**
- ❌ 2 enterprise variables (SENTRY_DSN, SENTRY_ENVIRONMENT - need to get from sentry.io)

**Should Add for Launch:**
- ❌ 5 core feature variables (Google OAuth, Stripe, Security)

**Can Add Later:**
- ❌ 20+ optional variables (as features are needed)

**Total Remaining:** ~29 variables to add (1 ready, 3 need to get, 7 important, 20+ optional)

---

## 🎯 **Next Action: Phase 1 Deployment**

**See `DEPLOYMENT_ACTION_PLAN.md` for step-by-step instructions!**

**Quick Start:**
1. Add `DATABASE_URL` to Vercel (connection string ready above)
2. Get `RESEND_API_KEY` from https://resend.com
3. Get `SENTRY_DSN` from https://sentry.io
4. Add `SENTRY_ENVIRONMENT` = `production`

**Time to Deploy:** ~30 minutes  
**Ready to deploy once Phase 1 variables are added!** 🚀
