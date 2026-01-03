# TATU Safe Deployment Plan
**Date:** December 28, 2025  
**Goal:** Deploy subscription system and new features without breaking production

---

## Phase 1: Backup Current State (5 minutes)

### Save Your Working Version

```bash
# 1. Make sure you're on main/master branch
git checkout main

# 2. Create a safety tag for current working version
git tag -a v1.0-production-safe -m "Working production deployment - 12/28/25 - SAFE ROLLBACK POINT"

# 3. Create a backup branch
git checkout -b backup/production-12-28-25

# 4. Push both to GitHub
git push origin backup/production-12-28-25
git push origin v1.0-production-safe
```

**Result:** You now have TWO safety nets:
- ✅ Tag: `v1.0-production-safe` (easy to find and rollback to)
- ✅ Branch: `backup/production-12-28-25` (can checkout and redeploy anytime)

---

## Phase 2: Prepare New Code (10 minutes)

### Create Feature Branch

```bash
# 1. Go back to main
git checkout main

# 2. Create feature branch for new work
git checkout -b feature/subscription-system-2025-12-28

# 3. Check what files were created today
git status
```

### Expected New Files:
```
tatu-app/
├── prisma/
│   ├── schema.prisma (MODIFIED - added Subscription models)
│   └── migrations/add_subscriptions/migration.sql (NEW)
├── lib/
│   ├── subscription-config.ts (NEW)
│   ├── subscription-service.ts (NEW)
│   └── feature-gates.ts (NEW)
├── app/
│   ├── api/subscriptions/ (NEW - all routes)
│   ├── components/SubscriptionPricing.tsx (NEW)
│   └── dashboard/subscription/page.tsx (NEW)

Root Documentation:
├── TERMS_AND_CONDITIONS.md (NEW)
├── PRIVACY_POLICY.md (NEW)
├── TATU_REVENUE_STRATEGY.md (NEW)
├── UNIFIED_INBOX_FEATURE_SPEC.md (NEW)
├── TWO_SIDED_MARKETPLACE_STRATEGY.md (NEW)
└── ... (other docs)
```

### Commit New Code

```bash
# 4. Add all new files
git add .

# 5. Commit with descriptive message
git commit -m "feat: Add subscription system with FREE/PRO/STUDIO tiers

- Add Prisma schema for Subscription model
- Add Stripe integration for payment processing
- Add subscription management API routes
- Add SubscriptionPricing component
- Add feature gating system
- Add Unified Inbox feature specification
- Add Terms & Conditions and Privacy Policy
- Add comprehensive revenue strategy documentation

This is a major release (v2.0) introducing monetization"

# 6. Push feature branch to GitHub
git push origin feature/subscription-system-2025-12-28
```

---

## Phase 3: Test with Vercel Preview (30-60 minutes)

### Automatic Preview Deployment

Once you push the feature branch, Vercel automatically:
1. ✅ Creates a preview deployment
2. ✅ Gives you a unique URL
3. ✅ Runs all your build steps
4. ✅ Uses preview environment variables

### Find Your Preview URL

**Option A: GitHub PR**
1. Go to GitHub repo
2. Create a Pull Request: `feature/subscription-system-2025-12-28` → `main`
3. Vercel bot comments with preview URL

**Option B: Vercel Dashboard**
1. Go to vercel.com/dashboard
2. Click your TATU project
3. Click "Deployments" tab
4. Find the branch deployment
5. Click the URL

### Testing Checklist

**Preview URL:** `https://feature-subscription-system-tatufortattoos.vercel.app`

#### Phase 3A: Test Existing Features (Don't Break What Works!)
- [ ] Homepage loads correctly
- [ ] Artist profiles display properly
- [ ] Search functionality works
- [ ] Portfolio images load
- [ ] Contact/booking forms work
- [ ] Navigation works on all pages
- [ ] Mobile responsive design intact
- [ ] No console errors in browser dev tools

#### Phase 3B: Test New Features
- [ ] Subscription pricing page loads (`/pricing`)
- [ ] Subscription tiers display correctly
- [ ] Database migration ran successfully
- [ ] API routes respond (test with Postman/curl if needed)
- [ ] Terms & Conditions accessible
- [ ] Privacy Policy accessible
- [ ] No build errors in Vercel logs

#### Phase 3C: Test Stripe Integration (IMPORTANT!)
- [ ] Stripe API keys are configured in Vercel preview environment
- [ ] "Upgrade to PRO" button works
- [ ] Redirects to Stripe checkout
- [ ] Test mode works (use test card: 4242 4242 4242 4242)
- [ ] Webhook endpoint is configured
- [ ] Subscription status updates in database

**If ANY test fails:** Fix on the feature branch, push again, test preview again. **Do NOT merge to production.**

---

## Phase 4: Deploy to Production (5 minutes)

### Only When Preview Tests Pass!

```bash
# 1. Merge feature branch to main
git checkout main
git merge feature/subscription-system-2025-12-28

# 2. Tag the new version
git tag -a v2.0-subscriptions -m "Production release: Subscription system, unified inbox, legal docs"

# 3. Push to production
git push origin main
git push origin v2.0-subscriptions
```

### Vercel Deploys Automatically
- Vercel detects the push to `main`
- Builds and deploys (2-5 minutes)
- Your production site updates

### Monitor Deployment
1. Watch Vercel dashboard for build status
2. Check build logs for errors
3. Visit your production URL: `https://tatufortattoos.com`
4. Run through quick smoke test

---

## Phase 5: Post-Deployment Validation (10 minutes)

### Immediate Checks (First 5 minutes)
- [ ] Production site loads
- [ ] No 500 errors
- [ ] Homepage displays correctly
- [ ] Critical user flows work (search, profiles)
- [ ] Check Vercel logs for errors
- [ ] Check Sentry/error monitoring (if configured)

### Database Checks
- [ ] Prisma migration applied successfully
- [ ] `Subscription` table exists
- [ ] Existing data intact (no data loss)

### Stripe Integration
- [ ] Verify production Stripe keys are configured
- [ ] Test a subscription purchase (use real card or test mode)
- [ ] Verify webhook is receiving events

---

## Emergency Rollback Procedures

### If Something Goes Wrong:

#### Option 1: Vercel Instant Rollback (FASTEST - 30 seconds)
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." menu → "Promote to Production"
5. Site reverts in ~30 seconds

#### Option 2: Git Rollback (2 minutes)
```bash
# Rollback to tagged safe version
git checkout v1.0-production-safe

# Force push to main (EMERGENCY ONLY)
git push origin main --force

# Vercel will deploy the old version
```

#### Option 3: Restore from Backup Branch (3 minutes)
```bash
# Reset main to backup branch
git checkout main
git reset --hard backup/production-12-28-25
git push origin main --force
```

### After Rollback:
1. ✅ Production is safe again
2. 🔍 Investigate what went wrong
3. 🛠️ Fix issues on feature branch
4. 🧪 Test preview deployment again
5. 🚀 Try deploying again when ready

---

## Environment Variables Checklist

### Before Deploying, Ensure These Are Set in Vercel:

**Required for Subscription System:**
```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Database
DATABASE_URL=postgresql://xxx

# App
NEXT_PUBLIC_APP_URL=https://tatufortattoos.com
```

**Set Variables:**
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add each variable
4. **Important:** Set scope to "Production" and "Preview" separately
5. Redeploy after adding variables

---

## Risk Assessment

### Low Risk (Safe to Deploy)
- ✅ Documentation files only (no code changes)
- ✅ New features that don't touch existing code
- ✅ CSS/styling updates
- ✅ Content changes

### Medium Risk (Test Thoroughly)
- ⚠️ New API routes (can break if not tested)
- ⚠️ Database schema changes (migration could fail)
- ⚠️ New dependencies (could cause build errors)
- ⚠️ Environment variable changes

### High Risk (Be Very Careful)
- 🔴 Core functionality changes (authentication, routing)
- 🔴 Breaking changes to existing features
- 🔴 Major dependency upgrades
- 🔴 Database migrations that modify existing data

**Today's Deployment:** Medium-High Risk
- Database schema changes (Subscription model)
- New payment integration (Stripe)
- Multiple new API routes
- **Recommendation:** Thorough testing on preview before production

---

## Deployment Timeline

### Conservative Approach (Recommended):
- **Day 1 (Today):** Commit to feature branch, deploy preview, test
- **Day 2:** Continue testing preview, fix any bugs
- **Day 3:** Deploy to production, monitor closely

### Aggressive Approach (If Confident):
- **Today:** Full deployment cycle (backup → test preview → deploy production)
- **Risk:** Less time to catch issues
- **Only if:** Preview tests pass 100%

---

## Communication Plan

### If You Have Users:
- [ ] Announce new features (blog post, email, social media)
- [ ] Notify existing artists of new subscription options
- [ ] Provide migration guide (everyone starts on FREE tier)
- [ ] Offer launch discount (optional: "First 100 PRO subscribers get 50% off first month")

### Transparency:
- [ ] Mention in announcement: "We've updated our Terms & Privacy Policy"
- [ ] Link to TERMS_AND_CONDITIONS.md and PRIVACY_POLICY.md
- [ ] Give users 30 days notice before enforcing new terms (best practice)

---

## Success Metrics

### Track These After Deployment:
- [ ] Deployment succeeded without errors
- [ ] Zero downtime during deployment
- [ ] No increase in error rates
- [ ] Page load times similar or better
- [ ] All existing features still work
- [ ] New features accessible and functional
- [ ] No user complaints about broken features

---

## Rollback Triggers

### Rollback Immediately If:
- 🚨 Site is completely down (500 errors)
- 🚨 Critical features broken (search, profiles, auth)
- 🚨 Data loss or corruption
- 🚨 Security vulnerability exposed
- 🚨 Payment processing broken

### Can Fix Forward If:
- ✅ Minor styling issues
- ✅ Non-critical feature bug
- ✅ Typos or content errors
- ✅ Single API endpoint issue

---

## Next Steps After Successful Deployment

1. **Monitor for 24-48 hours**
   - Watch error logs
   - Monitor user feedback
   - Check analytics for issues

2. **Update documentation**
   - Mark deployment as successful
   - Document any issues encountered
   - Update runbook for future deployments

3. **Start implementing Unified Inbox MVP**
   - Begin with Instagram + Email integrations
   - Follow same deployment process

4. **Marketing launch**
   - Announce new subscription tiers
   - Promote platform capabilities
   - Drive PRO tier conversions

---

## Important Notes

### Vercel's Deployment Safety:
- ✅ **Atomic deployments:** All-or-nothing (no half-deployed state)
- ✅ **Instant rollback:** One-click revert to previous version
- ✅ **Zero downtime:** New version swaps in seamlessly
- ✅ **Build failures are safe:** If build fails, production unchanged

### Database Migrations Safety:
- ⚠️ **Migrations are permanent:** Once run, database is changed
- ⚠️ **Always backup database before major migrations**
- ⚠️ **Test migrations on preview environment first**
- ⚠️ **Have rollback migration ready** (in case of issues)

```bash
# Backup database before migration
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# If migration fails, restore from backup
psql $DATABASE_URL < backup-20251228.sql
```

---

## Confidence Level Assessment

**Before deploying, ask yourself:**

1. ✅ Do I have a backup of the working state? (Tag + Branch)
2. ✅ Have I tested on a preview deployment?
3. ✅ Are all environment variables configured?
4. ✅ Do I know how to rollback if needed?
5. ✅ Is this a good time to deploy? (Not late Friday night!)
6. ✅ Am I available to monitor for the next 1-2 hours?

**If all YES:** ✅ Go ahead and deploy!  
**If any NO:** ⚠️ Address concerns first, then deploy.

---

## Summary

**The Safe Path:**
```
Backup (tag + branch)
  ↓
Create feature branch
  ↓
Push to GitHub
  ↓
Vercel creates preview deployment automatically
  ↓
Test preview thoroughly (30-60 min)
  ↓
If tests pass: Merge to main
  ↓
Vercel deploys to production automatically
  ↓
Monitor for issues
  ↓
If issues: Instant rollback in Vercel dashboard
```

**Result:** You can't lose! Your working version is safe, and you can always rollback.

---

**Ready to deploy? Let me know and I can help you through each step!** 🚀

