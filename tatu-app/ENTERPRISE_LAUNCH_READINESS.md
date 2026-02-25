# Enterprise Launch Readiness (Phase 0)

## Production environment variables (Vercel)

Confirm these are set in the Vercel project (Settings → Environment Variables) for Production:

### Database
- `DATABASE_URL` – PostgreSQL connection string (Supabase or other). Run migrations in prod: `npx prisma migrate deploy`.

### Auth & app
- `NEXTAUTH_URL` – Production app URL (e.g. `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` – Strong secret for NextAuth
- `JWT_SECRET` or `NEXTAUTH_SECRET` – For WebSocket token signing

### Inbox / messaging
- **Gmail:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Outlook:** `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET`, `OUTLOOK_REDIRECT_URI`
- **Yahoo (app password):** no server env vars required; each user connects with Yahoo email + app password
- **Meta (Facebook/Instagram):** `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
- **X (Twitter):** `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_OAUTH_CALLBACK`
- **SMS (Twilio):** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### Background worker (queue + cron)
- **Upstash Redis:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (used by Ratelimit and optional BullMQ)
- **Optional (BullMQ):** `REDIS_URL` or `REDIS_HOST` + `REDIS_PORT` + `REDIS_PASSWORD` for sync queue

### Calendar
- Google Calendar uses same OAuth as Gmail. Outlook calendar uses Outlook OAuth. Apple (CalDAV) and Square use their own credentials per integration.

### Monitoring
- `SENTRY_DSN` – For error tracking (optional but recommended)

### Migrations in production
After setting `DATABASE_URL` in Vercel, run migrations from a machine that can reach the DB:
```bash
cd tatu-app && npx prisma migrate deploy
```

## Background worker layer

- **Vercel Cron** is configured in `vercel.json`:
  - `/api/cron/sync-messages` – every 10 minutes
  - `/api/cron/sync-calendars` – every 15 minutes
  - `/api/worker/sync` – every 5 minutes
  - `/api/cron/appointment-reminders` – daily at 9:00
- **Queue:** Sync routes use `addSyncJob()` from `lib/bullmq-jobs.ts` to enqueue work when Redis is available; otherwise they run inline when the cron hits the route.
- **Retry:** Sync jobs use BullMQ default retries with exponential backoff when the queue is used.

## Architecture snapshot (updated)

```mermaid
flowchart LR
  user[User] --> web[NextJS_UI]
  web --> api[NextJS_API]
  api --> db[(Postgres)]
  api --> queue[Redis_Queue]
  queue --> worker[Worker_Sync]

  worker --> gmail[Gmail]
  worker --> outlook[Outlook / Microsoft]
  worker --> hotmail[Hotmail]
  worker --> msn[MSN]
  worker --> yahoo[Yahoo (IMAP/SMTP + app password)]
  worker --> meta[Meta API]
  worker --> twilio[Twilio]
  worker --> gcal[Google Calendar]
  worker --> ocal[Outlook Calendar]
  worker --> apple[Apple CalDAV]
  worker --> square[Square]

  api --> ws[WebSocket]
  ws --> web
```

## Current launch to-do list

- [~] Stabilize auth signup flow (remove signup 500 blocker; verify email resend path end-to-end)
- [x] Implement Yahoo inbox connect/sync/reply flow (app password)
- [ ] Set missing production env vars (Stripe, Meta, Twilio, Twitter, Upstash, Sentry, S3, OpenAI)
- [~] Validate Hotmail/MSN connect path and end-to-end message sync/send (code complete, waiting on live prod credential validation)
- [~] Add integration and e2e tests for Outlook aliases + Yahoo flow (manual cutover checklist added; automated tests pending)

## Build status snapshot

### Completed in code
- Unified inbox providers: Gmail, Outlook, Hotmail/MSN aliases, Yahoo (app password), Instagram, Facebook, X, SMS.
- Platform sync pipelines and reply routes implemented for current launch scope.
- Webhook signature validation hardened (Meta/Twilio paths).
- Queue + cron + worker sync orchestration in place.
- Launch cutover plan and command sheet added.

### Still required for launch
- Auth signup/login baseline stability in production (no 500 on account creation).
- Production env/secrets completion in Vercel.
- Live provider QA in production for each integration.
- Webhook end-to-end delivery verification in production.
- Post-cutover monitoring baseline confirmation.

## Provider QA matrix (launch)

| Provider | Connect | Sync | Reply/Send | Webhook/Realtime | Status |
|---|---|---|---|---|---|
| Gmail | Implemented | Implemented | Implemented | Poll + sync route | Pending live QA |
| Outlook | Implemented | Implemented | Implemented | Poll + sync route | Pending live QA |
| Hotmail/MSN | Implemented via Outlook alias | Implemented | Implemented | Poll + sync route | Pending live QA |
| Yahoo | Implemented (app password) | Implemented (IMAP) | Implemented (SMTP) | Poll + sync route | Pending live QA |
| Facebook | Implemented | Implemented | Implemented | Webhook | Pending live QA |
| Instagram | Implemented | Implemented | Implemented | Webhook | Pending live QA |
| X/Twitter | Implemented | Implemented | Implemented | Poll + sync route | Pending live QA |
| SMS (Twilio) | Implemented | Webhook-driven | Implemented | Webhook | Pending live QA |

## Launch cutover plan

### Roles and ownership
- **Release Commander:** Drives timeline, runs go/no-go checkpoints, owns rollback decision.
- **Backend Owner:** Handles env vars, DB migration, cron/worker checks, provider health.
- **Frontend Owner:** Verifies inbox/calendar/map UX and critical user flows.
- **QA Owner:** Runs smoke/e2e checklist and records pass/fail.
- **Observer:** Watches logs/alerts and reports incidents.

### T-24h (pre-launch prep)
- Confirm all launch-critical Vercel production env vars are present.
- Verify provider app settings and callback URLs:
  - Meta webhooks, Outlook callback, Twitter callback, Twilio webhook, Stripe webhooks.
- Ensure DNS/domain and SSL are healthy.
- Confirm Redis/queue connectivity and Sentry DSN ingestion.
- Freeze risky non-launch changes.

### T-2h (staging-like production validation)
- Run production-safe checks:
  - Connect test accounts for Gmail, Outlook/Hotmail/MSN, Yahoo, SMS.
  - Send and receive at least one test message per provider.
  - Trigger manual sync routes and validate results.
- Confirm cron jobs are visible and configured in Vercel.
- Verify attachment upload and retrieval.

### T-30m (final readiness gate)
- Run DB migrations:
```bash
cd tatu-app && npx prisma migrate deploy
```
- Verify app boot and API health endpoints/routes.
- Confirm no elevated error rates in Sentry.
- **Go/No-Go #1:** Proceed only if migration + smoke checks are green.

### T-0 (cutover window)
- Announce launch start in team channel.
- Enable/confirm all production integrations and webhook subscriptions.
- Start live smoke test sequence:
  - auth/login
  - connect account
  - inbound message
  - outbound reply
  - calendar sync
  - map/search visibility
- **Go/No-Go #2:** If core flows pass, declare launch complete.

### T+15m to T+2h (hypercare)
- Monitor:
  - Sentry error rate and top new exceptions
  - queue depth/retry/fail counts
  - sync route success/error ratios
  - webhook delivery failures
- Re-run smoke tests every 30 minutes for first 2 hours.
- Capture incidents and mitigations in launch log.

### Rollback plan
- If severe issue occurs:
  - Disable cron-triggered sync temporarily (`/api/worker/sync`, sync crons).
  - Disable problematic provider webhook/app integration only (not whole app).
  - Revert latest deployment in Vercel.
  - If migration is incompatible, apply prepared rollback SQL/manual fix before re-enable.
- **Rollback trigger examples:**
  - sustained 5xx spike for >10 minutes
  - data corruption risk
  - auth/session breakage
  - payment/webhook security validation failures

### Launch exit criteria
- No Sev-1/Sev-2 incidents open.
- End-to-end messaging works for Gmail, Outlook aliases, Yahoo, and SMS.
- Calendar sync functioning for configured providers.
- Webhooks passing signature validation and delivering events.
- Observability active (Sentry + logs) with acceptable error baseline.

## Launch command sheet (runbook)

Use this section as the live launch checklist.

### People and window
- [ ] Release Commander assigned: `________________`
- [ ] Backend Owner assigned: `________________`
- [ ] Frontend Owner assigned: `________________`
- [ ] QA Owner assigned: `________________`
- [ ] Observer assigned: `________________`
- [ ] Launch window confirmed: `________________`

### Pre-flight (T-24h to T-2h)
- [ ] All required Vercel production env vars verified.
- [ ] Stripe webhook endpoints verified and secrets set.
- [ ] Meta webhook verify token + callback validation complete.
- [ ] Twilio webhook set to `/api/webhooks/twilio`.
- [ ] Outlook/Twitter callback URLs verified.
- [ ] Redis/Upstash connectivity verified.
- [ ] Sentry receives test event.

### Final gate (T-30m)
- [ ] `npx prisma migrate deploy` ran successfully on production DB.
- [ ] Production deployment healthy (no boot/runtime errors).
- [ ] Go/No-Go #1 approved by Release Commander.

### Cutover sequence (T-0)
- [ ] Announce cutover start.
- [ ] Confirm cron jobs active (`sync-messages`, `sync-calendars`, `worker/sync`).
- [ ] Connect and validate Gmail flow.
- [ ] Connect and validate Outlook/Hotmail/MSN flow.
- [ ] Connect and validate Yahoo flow (app password).
- [ ] Validate Twilio SMS inbound/outbound.
- [ ] Validate one Facebook/Instagram inbound event.
- [ ] Validate one X/Twitter message flow.
- [ ] Validate one calendar sync cycle.
- [ ] Validate map/search artist visibility.
- [ ] Go/No-Go #2 approved; launch declared.

### Hypercare (first 2 hours)
- [ ] Sentry error rate reviewed every 15 minutes.
- [ ] Queue retry/failure metrics reviewed every 15 minutes.
- [ ] Sync route success/error ratio reviewed every 30 minutes.
- [ ] Webhook delivery logs reviewed every 30 minutes.
- [ ] Smoke tests re-run at +30m, +60m, +90m, +120m.

### Rollback quick actions (if needed)
- [ ] Disable sync crons temporarily.
- [ ] Disable failing provider webhook/integration.
- [ ] Roll back latest Vercel deployment.
- [ ] Communicate incident + ETA to stakeholders.

### Sign-off
- [ ] No Sev-1/Sev-2 incidents open.
- [ ] Exit criteria met.
- [ ] Release Commander final sign-off: `________________`

## Signup smoke test checklist

Run this before provider QA to confirm auth baseline is stable.

- [ ] Create new customer account from `/signup` (expect HTTP 201, no 500).
- [ ] Confirm signup response includes `userId` and `verificationEmailSent` flag.
- [ ] If `verificationEmailSent` is false, test login page **Resend verification** action.
- [ ] Verify email link opens `/verify-email?token=...` and returns success.
- [ ] Confirm verified user can sign in via `/login`.
- [ ] Confirm unverified user sees “verify your email” guidance instead of generic failure.
- [ ] Confirm no signup/auth Sev-1 errors appear in Sentry during test.

## Meta (Facebook/Instagram) done checklist

Use this to confirm Meta configuration is truly launch-ready.

### App configuration
- [ ] Meta app has `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` mapped in Vercel.
- [ ] App domain configured in Meta settings.
- [ ] Privacy Policy URL and Terms URL configured in Meta app settings.
- [ ] Environment has `FACEBOOK_WEBHOOK_VERIFY_TOKEN` set and matches Meta webhook config.

### OAuth / login setup
- [ ] Valid OAuth redirect URI added:
  - `https://<your-domain>/api/integrations/facebook/callback`
- [ ] Facebook Login product is enabled and correctly configured.
- [ ] App can complete `/api/integrations/facebook/auth` flow end-to-end.

### Webhooks
- [ ] Webhook callback for Facebook configured:
  - `https://<your-domain>/api/webhooks/facebook`
- [ ] Webhook callback for Instagram configured:
  - `https://<your-domain>/api/webhooks/instagram`
- [ ] Verification handshake succeeds for both endpoints.
- [ ] Subscribed objects/fields cover required messaging events.
- [ ] Signature validation succeeds in runtime for incoming webhook events.

### Permissions / access
- [ ] Requested scopes confirmed:
  - `pages_show_list`
  - `pages_messaging`
  - `instagram_basic`
  - `instagram_manage_messages`
- [ ] Development-mode testing complete with app roles/test users.
- [ ] Required App Review approvals complete for production use.
- [ ] Business verification completed if required by granted scopes/features.

### Asset linkage + runtime checks
- [ ] Facebook Page is linked and available to authorized user.
- [ ] Instagram professional account is linked to a Facebook Page.
- [ ] Connected account record is created in app after OAuth callback.
- [ ] Inbound message from Facebook appears in unified inbox.
- [ ] Inbound message from Instagram appears in unified inbox.
- [ ] Outbound reply from app succeeds for both channels.

### Go-live criteria (Meta)
- [ ] No 401 signature errors on webhook traffic.
- [ ] No token exchange/auth callback failures.
- [ ] At least one successful inbound + outbound roundtrip per channel in production.
