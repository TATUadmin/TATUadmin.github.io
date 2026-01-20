# 🔍 Production Signup Error Troubleshooting

## Issue
Getting "Internal server error" when attempting to sign up on `tatufortattoos.com`

## 🔴 Most Common Causes

### 1. Missing DATABASE_URL
**Symptom:** Error occurs immediately when trying to create user in database

**Check in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for `DATABASE_URL`
3. Should be set for **Production** environment

**Fix:**
- Add `DATABASE_URL` with your PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`
- Make sure it's set for **Production** environment
- Redeploy after adding

### 2. Missing RESEND_API_KEY
**Symptom:** Error occurs after user is created (during email sending)

**Check in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for `RESEND_API_KEY`
3. Should start with `re_...`

**Fix:**
- Add `RESEND_API_KEY` with your Resend API key
- Make sure it's set for **Production** environment
- Redeploy after adding

### 3. Prisma Client Not Generated
**Symptom:** Module not found errors or Prisma client errors

**Check:**
- The `postinstall` script in `package.json` should run `prisma generate`
- This should happen automatically during Vercel build

**Fix:**
- Check Vercel build logs for `prisma generate` output
- If missing, ensure `package.json` has: `"postinstall": "prisma generate"`

### 4. Database Connection Issues
**Symptom:** Connection timeout or SSL errors

**Check:**
- Database URL format is correct
- Database allows connections from Vercel IPs
- SSL mode is set correctly (`?sslmode=require` for Supabase)

## 🔍 How to Debug

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "Functions" tab
4. Look for `/api/auth/signup` function logs
5. Check for error messages

### Check Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify these are set for **Production**:
   - ✅ `DATABASE_URL`
   - ✅ `RESEND_API_KEY`
   - ✅ `NEXTAUTH_SECRET`
   - ✅ `NEXTAUTH_URL` (should be `https://tatufortattoos.com`)

### Test Database Connection
You can test if the database is accessible by checking Vercel function logs or using Prisma Studio locally with the production DATABASE_URL.

## 📋 Quick Checklist

- [ ] `DATABASE_URL` is set in Vercel (Production)
- [ ] `RESEND_API_KEY` is set in Vercel (Production)
- [ ] `NEXTAUTH_SECRET` is set in Vercel (Production)
- [ ] `NEXTAUTH_URL` is set to `https://tatufortattoos.com` (Production)
- [ ] Latest code is deployed to main branch
- [ ] Build completed successfully (check Vercel deployment logs)
- [ ] No errors in Vercel function logs

## 🚀 After Fixing

1. **Redeploy:** After adding missing environment variables, trigger a new deployment
2. **Test:** Try signing up again
3. **Check Logs:** If it still fails, check Vercel function logs for the specific error

## 📞 Next Steps

If the error persists after checking all the above:
1. Copy the exact error message from Vercel logs
2. Check the timestamp of the error
3. Look for any Prisma error codes (P2002, P2003, etc.)
4. Share the error details for further debugging

