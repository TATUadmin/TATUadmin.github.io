# API Credentials and Services Registry

Last Updated: 2026-02-20  
Last Verified Against Vercel Prod Env: 2026-02-19
Project: TATU - Tattoo Artist Marketplace  
Repository: `https://github.com/TATUadmin/TATUadmin.github.io`

## Purpose

This file is the source-of-truth inventory for:

- third-party services used by TATU
- where to log in
- which environment variables each service needs
- current setup status for production
- quick notes on how each credential is obtained

## Security Rules (Important)

- Never store raw secrets, full tokens, or unmasked connection strings in git.
- Store real values in Vercel environment variables and a secure password manager.
- If any secret has been pasted in chat/docs, rotate it immediately.
- Use separate credentials for development and production whenever possible.

---

## Service Inventory


| #   | Service                     | What It Is Used For                                          | Login / Account                                                                                      | Env Vars                                                                                                                                      | Current Status (Prod)           | Notes                                                                                                                    |
| --- | --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | Supabase (PostgreSQL)       | Database hosting                                             | [https://supabase.com/dashboard](https://supabase.com/dashboard)                                     | `DATABASE_URL`                                                                                                                                | Configured                      | Region: us-west-2. Project: `rdgbnzygadfxhptmacfg`. Keep URL secret and rotated if exposed.                              |
| 2   | Stripe                      | Payments, subscriptions, webhooks                            | [https://dashboard.stripe.com](https://dashboard.stripe.com)                                         | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS`, price IDs          | Not fully configured            | Webhooks: `/api/payments/webhook`, `/api/subscriptions/webhook`.                                                         |
| 3   | Google Cloud                | Google OAuth, Gmail API, Google Calendar API                 | [https://console.cloud.google.com](https://console.cloud.google.com)                                 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (`GOOGLE_REDIRECT_URI` optional)                                                                   | Configured                      | OAuth scopes include Gmail + Calendar read/write flows.                                                                  |
| 4   | Facebook / Instagram (Meta) | Instagram OAuth, Facebook Page Messenger, Graph API webhooks | [https://developers.facebook.com](https://developers.facebook.com)                                   | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_WEBHOOK_VERIFY_TOKEN` (legacy fallback: `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`) | Missing                         | Webhooks: `/api/webhooks/facebook`, `/api/webhooks/instagram`. Facebook support is Page-only (not personal profile DMs). |
| 5   | NextAuth.js                 | Auth + session signing                                       | Internal + Vercel env                                                                                | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (recommended: `JWT_SECRET` too)                                                                             | Configured                      | Keep secrets long and random.                                                                                            |
| 6   | Resend                      | Transactional email                                          | [https://resend.com](https://resend.com)                                                             | `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`                                                                                              | Configured                      | Used for verification/reset/notification emails.                                                                         |
| 7   | AWS S3                      | Message/asset file storage                                   | [https://aws.amazon.com/console](https://aws.amazon.com/console)                                     | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_IMAGES`, `AWS_S3_BUCKET_DOCUMENTS`, `AWS_S3_BUCKET_PORTFOLIO`      | Not fully configured            | Required for attachment uploads.                                                                                         |
| 8   | Sentry                      | Error tracking + alerting                                    | [https://sentry.io](https://sentry.io)                                                               | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`                                                                                          | Partially configured            | DSN should exist before launch cutover.                                                                                  |
| 9   | OpenAI                      | AI categorization/smart replies                              | [https://platform.openai.com](https://platform.openai.com)                                           | `OPENAI_API_KEY`                                                                                                                              | Missing                         | Used by message categorization services.                                                                                 |
| 10  | Twilio                      | SMS integration                                              | [https://www.twilio.com/console](https://www.twilio.com/console)                                     | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`                                                                              | Missing                         | Webhook: `/api/webhooks/twilio`. Number must be E.164 format.                                                            |
| 11  | Upstash Redis               | Rate limiting/cache (REST SDK paths)                         | [https://console.upstash.com](https://console.upstash.com)                                           | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                                                                                          | Missing                         | Optional if all code paths rely only on `REDIS_URL`, but recommended.                                                    |
| 12  | Redis Cloud / Redis URL     | Queue/cache backend                                          | [https://cloud.redis.io](https://cloud.redis.io)                                                     | `REDIS_URL` (or host/port/password set)                                                                                                       | Configured                      | Currently present in production env. Keep private.                                                                       |
| 13  | Mapbox                      | Optional maps/geocoding token                                | [https://account.mapbox.com](https://account.mapbox.com)                                             | `NEXT_PUBLIC_MAPBOX_TOKEN`                                                                                                                    | Optional / not required         | App currently supports Leaflet + OpenStreetMap flow.                                                                     |
| 14  | Vercel                      | Hosting + deployments                                        | [https://vercel.com/dashboard](https://vercel.com/dashboard)                                         | (env managed in project)                                                                                                                      | Active                          | Production project: `tatu-app`.                                                                                          |
| 15  | GitHub                      | Repo + CI source                                             | [https://github.com/TATUadmin/TATUadmin.github.io](https://github.com/TATUadmin/TATUadmin.github.io) | N/A                                                                                                                                           | Active                          | Main branch deploy flow.                                                                                                 |
| 16  | Nominatim (OSM)             | Geocoding                                                    | [https://nominatim.openstreetmap.org](https://nominatim.openstreetmap.org)                           | N/A                                                                                                                                           | Active                          | Public API; honor rate limits and User-Agent requirements.                                                               |
| 17  | Microsoft Azure (Outlook)   | Outlook OAuth + Graph                                        | [https://portal.azure.com/#home](https://portal.azure.com/#home)                                     | `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET`, `OUTLOOK_REDIRECT_URI`                                                                          | Configured                      | Tenant/domain details tracked in secure vault; do not store raw client secret here.                                      |
| 18  | Worker Auth                 | Protect worker sync endpoint                                 | Internal + Vercel env                                                                                | `WORKER_SYNC_TOKEN`                                                                                                                           | Configured                      | Required for `/api/worker/sync` authorization.                                                                           |
| 19  | Yahoo Mail                  | Unified inbox connect/sync/reply using user app password     | [https://login.yahoo.com/account/security](https://login.yahoo.com/account/security)                 | No shared server env required (per-user app password encrypted in DB)                                                                         | Implemented in code, QA pending | Uses IMAP (`imap.mail.yahoo.com`) + SMTP (`smtp.mail.yahoo.com`) per connected user.                                     |


---

## Credential Ownership and Rotation Register

Use this table for operational security tracking. Update it whenever a key is rotated, ownership changes, or a service is decommissioned.


| Service      | Secret / Credential Group         | Primary Owner              | Backup Owner                | Rotation Frequency | Last Rotated | Next Rotation Due | Stored In                 | Rotation Runbook                          |
| ------------ | --------------------------------- | -------------------------- | --------------------------- | ------------------ | ------------ | ----------------- | ------------------------- | ----------------------------------------- |
| Supabase     | `DATABASE_URL`                    | TATU Development Team      | Platform Backup Owner (TBD) | Every 90 days      | TBD          | TBD               | Vercel + password manager | Supabase project DB password rotation     |
| Stripe       | API keys + webhook secrets        | Billing Owner (TBD)        | TATU Development Team       | Every 90 days      | TBD          | TBD               | Vercel + Stripe Dashboard | Stripe key roll + webhook secret reissue  |
| Google Cloud | OAuth client credentials          | Integrations Owner (TBD)   | TATU Development Team       | Every 180 days     | TBD          | TBD               | Vercel + Google Cloud     | OAuth client secret regeneration          |
| Meta         | App secret + webhook verify token | Integrations Owner (TBD)   | TATU Development Team       | Every 90 days      | TBD          | TBD               | Vercel + Meta Developers  | Meta app secret reset + webhook re-verify |
| NextAuth/JWT | `NEXTAUTH_SECRET`, `JWT_SECRET`   | Platform Owner (TBD)       | TATU Development Team       | Every 180 days     | TBD          | TBD               | Vercel + password manager | Secret regen + session invalidation plan  |
| Resend       | `RESEND_API_KEY`                  | Communications Owner (TBD) | TATU Development Team       | Every 180 days     | TBD          | TBD               | Vercel + Resend           | API key revoke/recreate                   |
| AWS S3       | IAM access key pair               | Platform Owner (TBD)       | Security Owner (TBD)        | Every 90 days      | TBD          | TBD               | Vercel + AWS IAM          | New IAM key issue, old key disable/delete |
| Sentry       | `SENTRY_DSN` and org auth tokens  | Platform Owner (TBD)       | TATU Development Team       | Every 180 days     | TBD          | TBD               | Vercel + Sentry           | DSN/token rotation per project            |
| OpenAI       | `OPENAI_API_KEY`                  | AI Owner (TBD)             | TATU Development Team       | Every 90 days      | TBD          | TBD               | Vercel + OpenAI dashboard | Revoke old key, create scoped replacement |
| Twilio       | SID/auth token                    | Integrations Owner (TBD)   | TATU Development Team       | Every 90 days      | TBD          | TBD               | Vercel + Twilio Console   | Auth token rotation + webhook validation  |
| Upstash      | REST URL/token                    | Platform Owner (TBD)       | TATU Development Team       | Every 180 days     | TBD          | TBD               | Vercel + Upstash          | Token rotation and service check          |
| Redis Cloud  | `REDIS_URL` password              | Platform Owner (TBD)       | TATU Development Team       | Every 90 days      | TBD          | TBD               | Vercel + Redis Cloud      | Redis credential rotation runbook         |
| Worker Auth  | `WORKER_SYNC_TOKEN`               | Platform Owner (TBD)       | TATU Development Team       | Every 60 days      | TBD          | TBD               | Vercel + password manager | Token regen + cron/job caller update      |


---

## Detailed Service Notes (What, Use, Why)

### 1) Supabase (PostgreSQL)

- What it is: Managed Postgres database hosting platform.
- What we use it for: Primary relational data store for users, auth-linked records, messages, calendars, subscriptions, and business entities.
- Why we use it: Reliable managed Postgres with backup/management tooling and fast integration with Prisma/Next.js stack.

### 2) Stripe

- What it is: Payments and billing platform.
- What we use it for: Checkout/payment intents, subscription billing, webhook-driven payment state updates.
- Why we use it: Strong ecosystem for subscriptions and webhooks, good compliance posture, and mature production tooling.

### 3) Google Cloud (OAuth + APIs)

- What it is: Google developer platform with OAuth and API access.
- What we use it for: Gmail OAuth/login flow, Gmail message sync/send, and Google Calendar integration.
- Why we use it: Required by Google APIs and provides secure delegated access without storing user passwords.

### 4) Meta (Facebook/Instagram)

- What it is: Meta developer platform for Graph API and webhook events.
- What we use it for: Instagram account linking, Facebook Page Messenger send/receive, and webhook callbacks for near-real-time updates.
- Why we use it: Official integration path for Instagram and Facebook Page messaging with production-grade signature verification.

### 5) NextAuth.js

- What it is: Authentication/session framework for Next.js.
- What we use it for: Session management, user identity in API routes, sign-in flows.
- Why we use it: Native Next.js fit, secure defaults, and strong support for OAuth/credentials providers.

### 6) Resend

- What it is: Transactional email API provider.
- What we use it for: Verification emails, password resets, system notifications.
- Why we use it: Simple API, reliable deliverability for app-level transactional email, and easy template integration.

### 7) AWS S3

- What it is: Object storage service.
- What we use it for: File/attachment and image asset storage (message attachments, portfolio/document buckets).
- Why we use it: Durable scalable storage with predictable URLs and broad SDK/tooling support.

### 8) Sentry

- What it is: Error tracking and observability platform.
- What we use it for: Capturing backend/frontend runtime exceptions and release-level monitoring.
- Why we use it: Faster incident detection and diagnosis before users report issues.

### 9) OpenAI

- What it is: LLM API platform.
- What we use it for: AI-based message categorization and smart-response features.
- Why we use it: Speeds triage and user response workflows in unified inbox experiences.

### 10) Twilio

- What it is: Messaging communications platform.
- What we use it for: SMS send/receive and webhook-driven inbound message ingestion.
- Why we use it: Mature global SMS infrastructure and reliable webhook/auth signature support.

### 11) Upstash Redis

- What it is: Managed Redis with REST-style access.
- What we use it for: Rate limiting and cache-oriented flows where Upstash SDK is referenced.
- Why we use it: Serverless-friendly Redis usage model and lightweight operational overhead.

### 12) Redis Cloud / Redis URL

- What it is: Redis backend for queues and cache primitives.
- What we use it for: Background job queueing, retry/backoff behavior, and sync orchestration infrastructure.
- Why we use it: Required for BullMQ-style durable queues and scalable async processing.

### 13) Mapbox (Optional)

- What it is: Mapping/geocoding platform.
- What we use it for: Optional token-backed map rendering/geospatial features.
- Why we use it: Enhanced map UX if needed, while still allowing Leaflet + OSM as fallback.

### 14) Vercel

- What it is: Hosting/deployment platform for Next.js.
- What we use it for: Build/deploy pipeline, domain routing, cron jobs, environment variable management.
- Why we use it: First-class Next.js runtime support and straightforward release workflows.

### 15) GitHub

- What it is: Source control and collaboration platform.
- What we use it for: Repository hosting, branch workflows, change history, deployment source integration.
- Why we use it: Standard collaboration backbone and direct integration with Vercel.

### 16) Nominatim (OpenStreetMap)

- What it is: Public geocoding API based on OpenStreetMap data.
- What we use it for: Address/location to coordinate conversion for map/search visibility.
- Why we use it: No-key public geocoding option that reduces cost for baseline map functionality.

### 17) Microsoft Azure (Outlook Integration)

- What it is: Azure app registration + Microsoft Graph access model.
- What we use it for: Outlook OAuth and Graph API access for inbox/calendar sync/send.
- Why we use it: Required Microsoft-authenticated path for Outlook data access.

### 18) Worker Auth (`WORKER_SYNC_TOKEN`)

- What it is: Internal shared secret used as endpoint auth token.
- What we use it for: Authorizing `/api/worker/sync` calls from cron/worker contexts.
- Why we use it: Prevents unauthorized triggering of high-impact sync jobs.

### 19) Yahoo Mail

- What it is: Yahoo consumer mail integration using app passwords.
- What we use it for: Unified inbox connect/sync/reply for Yahoo accounts.
- Why we use it: Extends inbox coverage for non-Gmail/Outlook users without adding shared OAuth app credentials.

---

## Production Environment Status Snapshot

Snapshot source: Vercel production env list (checked 2026-02-19).

### Confirmed Present in Production

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `ENCRYPTION_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OUTLOOK_CLIENT_ID`
- `OUTLOOK_CLIENT_SECRET`
- `OUTLOOK_REDIRECT_URI`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `REDIS_URL`
- `WORKER_SYNC_TOKEN`

### Still Missing in Production (Launch-Critical)

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN` (recommended before launch)

---

## Quick Acquisition Guide

### Stripe

1. Open Stripe Dashboard -> Developers -> API keys.
2. Copy publishable and secret keys.
3. Configure webhooks -> add:
  - `https://www.tatufortattoos.com/api/payments/webhook`
  - `https://www.tatufortattoos.com/api/subscriptions/webhook`
4. Save signing secrets to Vercel env.

### Google Cloud

1. Open Google Cloud Console -> APIs & Services -> Credentials.
2. Create/choose OAuth Web Client.
3. Add redirect URI(s):
  - `https://www.tatufortattoos.com/api/auth/gmail/callback`
  - `https://www.tatufortattoos.com/api/integrations/google/callback` (if used)
4. Copy client ID + secret.

### Meta (Facebook/Instagram)

1. Open Meta Developers -> app settings.
2. Copy App ID + App Secret.
3. Generate a random verify token for webhooks.
4. Configure webhook callback endpoints:
  - `/api/webhooks/facebook`
  - `/api/webhooks/instagram`

### Twilio

1. Open Twilio Console.
2. Copy Account SID + Auth Token.
3. Choose/buy messaging number.
4. Set incoming webhook to `/api/webhooks/twilio`.

### X / Twitter

1. Open X Developer Portal -> app.
2. Enable OAuth 1.0a.
3. Set callback:
  - `https://www.tatufortattoos.com/api/integrations/twitter/callback`
4. Copy API Key + API Secret.

### Upstash Redis

1. Open Upstash Console -> create/select Redis DB.
2. Copy REST URL + REST token.
3. Set in Vercel as production env vars.

### Sentry

1. Open Sentry project settings.
2. Copy DSN.
3. Add DSN to Vercel production env.

---

## Launch Progress Tracker (Update This Section As Work Advances)

- [~] Signup API stability (active blocker: account creation 500 under investigation)
- Core DB + auth credentials in production
- Public app base URL (`NEXT_PUBLIC_APP_URL`) in production
- Outlook credentials in production
- Queue auth token (`WORKER_SYNC_TOKEN`) in production
- Meta credentials in production
- X/Twitter credentials in production
- Twilio credentials in production
- Upstash REST credentials in production
- Sentry DSN verified in production
- Stripe production keys and webhooks complete
- AWS S3 attachment credentials complete

---

## Maintenance Notes

- Update this file whenever a service is added, rotated, removed, or moved.
- Do not paste raw keys into this file; write "stored in Vercel + vault".
- Keep this aligned with `ENTERPRISE_LAUNCH_READINESS.md` and deployment checklists.

