# Legal Documents Update Summary

**Date:** January 20, 2026  
**Updated By:** TATU Development Team  
**Reason:** Reflect new MVP features (Unified Inbox & Unified Calendar)

---

## 📋 Documents Updated

1. **TERMS_AND_CONDITIONS.md** - Version 1.0 → 1.1
2. **PRIVACY_POLICY.md** - Version 1.0 → 1.1

---

## 🔄 Major Changes - Terms & Conditions

### 1. **Updated Subscription Tier Features (Section 7.1)**

**FREE Tier - Now Includes:**
- ✅ 50 portfolio images (unchanged)
- ✅ 5 portfolio collections
- ✅ 3 video consultations per month (480p, unlimited duration)
- ✅ **1 connected calendar** (NEW - Unified Calendar feature)
- ✅ 2 platform connections for Unified Inbox
- ✅ 15-minute consultations before appointments

**PRO Tier - Enhanced:**
- ✅ **Unlimited calendar syncs** (NEW - Google, Apple, Square, Calendly, AI email parsing)
- ✅ 3 platform connections for Unified Inbox (was 5, adjusted for balance)
- ✅ **Conflict detection and booking prevention** (NEW)
- ✅ **Video transcripts** (NEW - AI-generated transcripts)
- ✅ 720p HD video with recording
- ✅ All previous features retained

**STUDIO Tier - Premium Features:**
- ✅ **Multi-artist calendar view** (NEW - unified studio schedule)
- ✅ **Team inbox with message assignment** (NEW)
- ✅ **AI smart scheduling assistant** (NEW)
- ✅ **Two-way calendar sync** (NEW - sync back to external calendars)
- ✅ Unlimited inbox platform connections
- ✅ 1080p video with custom branding
- ✅ 100 SMS credits per month
- ✅ Dedicated account manager

### 2. **New Section 8: Unified Inbox and Unified Calendar (Expanded)**

**Section 8.1 - Unified Inbox Platform Connections:**
- Lists all supported platforms (Instagram, Email, Facebook, SMS, WhatsApp, TikTok, Twitter/X)
- Specifies connection limits by tier

**Section 8.2 - NEW: Unified Calendar Sync Connections:**
- Google Calendar
- Apple Calendar (iCloud)
- Microsoft Outlook Calendar
- Square Appointments
- Calendly
- Acuity Scheduling
- AI email parsing (extracts appointments from booking confirmations)
- Manual entry

**Section 8.3 - Third-Party Authorization:**
- Clarifies what data TATU accesses (messages, calendar events, contact info)
- Explains OAuth 2.0 authorization process
- States TATU not responsible for third-party outages

**Section 8.4 - Data Syncing and Synchronization:**
- **Inbox Syncing:** Polling intervals, encryption, disconnection process
- **Calendar Syncing:** One-way (PRO) vs. two-way (STUDIO), sync frequency, manual sync option

**Section 8.5 - NEW: Conflict Detection and Prevention:**
- Explains how TATU identifies overlapping appointments
- Warns users and suggests conflict-free times
- Disclaims ultimate responsibility (artist manages own schedule)

**Section 8.6 - Data Retention:**
- **Messages:** Retained 30 days after disconnection
- **Calendar Events:** Retained 30 days after disconnection, 12 months for past events (analytics)

### 3. **Updated Section 5.4: Artist Communication and Scheduling Standards**

Added new responsibilities:
- Keep calendars up-to-date and accurate
- Honor confirmed appointments
- Not intentionally double-book
- Notify clients promptly of scheduling conflicts

### 4. **Updated Section 7.4: Downgrades**

Added consequences for downgrading:
- Calendar connections beyond 1 will be disconnected (FREE tier limit)
- Portfolio collections beyond 5 will be archived
- Historical calendar data and messages remain accessible

### 5. **Updated Effective Date and Version**

- **Old:** December 28, 2025 | Version 1.0
- **New:** January 20, 2026 | Version 1.1

---

## 🔒 Major Changes - Privacy Policy

### 1. **New Data Collection Categories (Section 1)**

**Added: Calendar and Scheduling Data**
- Calendar events from connected calendars
- Appointment details (date, time, duration, client name, service type, notes)
- Availability and working hours
- Booking confirmations parsed from emails (AI-powered)
- Conflict detection data
- Calendar sync preferences
- Time zone information

**Enhanced: Communications Data**
- Added video consultation transcripts (PRO/STUDIO)
- Expanded platforms: Facebook, SMS, WhatsApp, TikTok, Twitter/X

### 2. **New Third-Party Data Sources (Section 1.3)**

**Connected Calendars (Unified Calendar) - NEW:**
- **Google Calendar:** Events, titles, descriptions, locations, attendees, reminders, recurring patterns
- **Apple Calendar (iCloud):** Events, details, attendees, reminders
- **Microsoft Outlook Calendar:** Events, meetings, attendee lists, locations
- **Square Appointments:** Bookings, client names, service types, payment status
- **Calendly:** Scheduled meetings, invitee info, event types
- **Acuity Scheduling:** Appointments, client info, service details
- **Email Booking Confirmations:** AI-extracted appointment details

**AI Processing Services - Enhanced:**
- OpenAI (message categorization, smart replies, **email parsing**)
- Deepgram or AssemblyAI (**transcription services** - NEW)

### 3. **New Service Providers (Section 3.3)**

**Calendar and Scheduling Services - NEW:**
- Google Calendar API
- Apple iCloud Calendar API
- Microsoft Outlook Calendar API
- Square Appointments API
- Calendly API
- Acuity Scheduling API
- CalDAV protocol (universal calendar sync)

**Additional Communication Services:**
- WhatsApp Business API
- Twitter/X API
- TikTok API

### 4. **Enhanced Data Usage (Section 2.1)**

Now includes:
- Provide the Unified Calendar feature
- Detect scheduling conflicts and prevent double bookings
- Parse booking confirmations from emails using AI
- Enable video consultations with **recording and transcription** (PRO/STUDIO)
- Sync calendar events across connected platforms
- Generate AI-powered message categorization and smart replies

### 5. **New Data Retention Policies (Section 4.2.1)**

**Calendar and Scheduling Data - NEW:**
- **Active Calendar Events:** Retained while account is active
- **Past Calendar Events:** Retained for 12 months for analytics
- **Disconnected Calendars:** Retained 30 days after disconnection, then deleted
- **Conflict Detection Logs:** Retained for 90 days
- **Booking Confirmations (Email Parsed):** Retained for 12 months

**Video Consultation Transcripts - NEW:**
- Retained for 12 months (PRO/STUDIO only)

### 6. **Comprehensive Section 14.1.1: Unified Calendar Data Handling - NEW**

**Calendar Syncing:**
- Encryption standards (TLS in transit, AES-256 at rest)
- Sync frequency by tier:
  - FREE: Every 60 minutes
  - PRO: Every 15 minutes
  - STUDIO: Every 5 minutes + real-time webhooks

**Calendar Data We Collect:**
- Event title, description, location
- Start/end times, duration
- Attendee names and emails
- Event status, recurring patterns
- Reminders, time zone

**Conflict Detection:**
- Automated analysis of overlapping appointments
- 90-day retention of conflict logs
- No human review (fully automated)

**AI Email Parsing (PRO/STUDIO):**
- Scans connected emails for booking confirmations
- Extracts appointment details automatically
- Supported platforms: Square, Calendly, Acuity, Booksy, Vagaro, generic emails
- Can be disabled in settings

**Two-Way Calendar Sync (STUDIO Only):**
- Changes in TATU sync back to external calendars
- Bidirectional editing, cancellations, reschedules
- Conflict resolution: "last write wins" or manual

### 7. **Enhanced Section 14.2: Video Consultation Privacy**

**Transcripts (PRO/STUDIO Only) - NEW:**
- Automatically transcribed using AI (Deepgram/AssemblyAI)
- Include speaker identification, timestamps, searchable text
- Stored for 12 months
- Artists can download, edit, or delete anytime
- NOT shared with third parties

**Updated Recording Details:**
- Explicit consent required
- 90-day retention (or until Artist deletes)
- AES-256 encryption
- NOT used for AI training

### 8. **New Section 14.7: Third-Party Calendar and Messaging Platform Privacy**

Lists all third-party privacy policies:
- Google (Gmail, Calendar)
- Apple (iCloud Calendar)
- Microsoft (Outlook)
- Meta (Instagram, Facebook)
- Square
- Calendly
- Twilio (SMS)

**TATU's Commitments:**
- Access third-party data ONLY for Unified Inbox/Calendar features
- Do NOT sell or share third-party data
- Use OAuth 2.0 (never store passwords)
- Users can revoke access anytime

### 9. **Expanded Section 18: Automated Decision-Making and AI Transparency**

**New AI Features:**
- **Email appointment parsing** - extracting booking details from confirmation emails
- **Smart scheduling assistant** (STUDIO) - suggests optimal appointment times
- **Client intelligence** - extracts preferences, budget, timeline from messages
- **Conflict detection** - identifies overlapping calendar events

**AI Accuracy Disclosures:**
- Message categorization: ~85-90% accuracy
- Email appointment parsing: ~80-85% accuracy
- Conflict detection: ~95%+ accuracy
- Smart replies: Suggestions only (user reviews before sending)

**Opt-Out Options:**
- Disable message categorization, smart replies, email parsing, scheduling suggestions
- Cannot disable search functionality or conflict detection (required for safety)

### 10. **Updated Effective Date and Version**

- **Old:** December 28, 2025 | Version 1.0
- **New:** January 20, 2026 | Version 1.1

---

## 📊 Key Legal Protections Added

### **For TATU:**
1. ✅ Clear disclaimers about third-party calendar/messaging platform outages
2. ✅ Limitation of liability for scheduling conflicts (ultimate responsibility on artist)
3. ✅ Explicit authorization for accessing calendar data via OAuth
4. ✅ Data retention policies protect against indefinite storage obligations
5. ✅ AI transparency disclosures protect against claims of hidden automation

### **For Users:**
1. ✅ Clear opt-out mechanisms for AI features
2. ✅ Explicit consent requirements for video recording
3. ✅ 30-day grace period before deleting data after disconnection
4. ✅ Transparency about what data is collected from external platforms
5. ✅ Encryption standards disclosed (TLS, AES-256)

---

## ⚖️ Compliance Considerations

### **GDPR (European Users):**
- ✅ Legal basis for processing: Consent + Contract + Legitimate Interests
- ✅ Data subject rights: Access, rectification, erasure, portability, object
- ✅ AI transparency: Automated decision-making disclosed
- ✅ Third-party data transfers: Standard Contractual Clauses (SCCs)

### **CCPA (California Users):**
- ✅ Categories of personal information collected: Disclosed
- ✅ Business purposes for collection: Disclosed
- ✅ Third parties we share with: Disclosed
- ✅ Sale of personal information: **We do NOT sell** (explicitly stated)

### **OAuth Best Practices:**
- ✅ Minimal scope requests (only access needed data)
- ✅ Explicit user consent for each platform connection
- ✅ Secure token storage (encrypted)
- ✅ Revocation mechanisms (users can disconnect anytime)

### **AI/ML Compliance:**
- ✅ Transparency about AI usage
- ✅ Accuracy disclosures (85-95% range)
- ✅ Opt-out mechanisms provided
- ✅ No discriminatory use of AI
- ✅ Data not used for third-party AI training

---

## 🚨 Action Items for Team

### **Before Public Launch:**

1. **Legal Review (High Priority):**
   - [ ] Have attorney review updated Terms & Conditions
   - [ ] Have attorney review updated Privacy Policy
   - [ ] Ensure GDPR compliance for EU users
   - [ ] Ensure CCPA compliance for California users
   - **Budget:** $500-1,500

2. **Cookie Consent Banner (Medium Priority):**
   - [ ] Implement cookie consent banner on website
   - [ ] Allow users to opt out of non-essential cookies
   - [ ] Link to Cookie Policy in banner

3. **Privacy Settings Page (High Priority):**
   - [ ] Build UI for AI opt-out (Settings > Privacy > AI Preferences)
   - [ ] Build UI for email parsing opt-out (Settings > Calendar > Email Parsing)
   - [ ] Build UI for connected platforms management (Settings > Connected Platforms)
   - [ ] Build UI for data download (Settings > Download My Data)
   - [ ] Build UI for account deletion (Settings > Delete Account)

4. **User Notifications (High Priority):**
   - [ ] Email all existing users about updated Terms & Privacy Policy (30-day notice)
   - [ ] In-app notification banner: "We've updated our Terms and Privacy Policy"
   - [ ] Require acceptance on next login (checkbox + link to full docs)

5. **Third-Party Data Processing Agreements (Medium Priority):**
   - [ ] Review OpenAI Data Processing Addendum
   - [ ] Review Stripe Data Processing Addendum
   - [ ] Review Twilio Data Processing Addendum
   - [ ] Ensure all agreements prohibit third-party training on user data

6. **OAuth Consent Screens (High Priority):**
   - [ ] Update Google OAuth consent screen with accurate scopes and privacy policy link
   - [ ] Update Meta (Instagram/Facebook) app review submission with privacy policy
   - [ ] Submit for Apple Developer review if using Sign in with Apple
   - [ ] Ensure all OAuth flows link to PRIVACY_POLICY.md

7. **Transparency Report Page (Low Priority - Post-Launch):**
   - [ ] Build page: transparency.tatufortattoos.com
   - [ ] Publish annual report: law enforcement requests, data breaches, etc.
   - [ ] Update annually

---

## 📄 Document Locations

**Legal Documents (Website):**
- `https://tatufortattoos.com/terms` → TERMS_AND_CONDITIONS.md
- `https://tatufortattoos.com/privacy` → PRIVACY_POLICY.md

**Source Files (Repository):**
- `TERMS_AND_CONDITIONS.md` (root directory)
- `PRIVACY_POLICY.md` (root directory)

**Related Documents:**
- `TWO_SIDED_MARKETPLACE_STRATEGY.md` - Business model context
- `TATU_REVENUE_STRATEGY.md` - Subscription tiers and pricing
- `UNIFIED_INBOX_FEATURE_SPEC.md` - Technical implementation
- `UNIFIED_CALENDAR_FEATURE_SPEC.md` - Technical implementation

---

## ✅ Summary of Updates

| Document | Old Version | New Version | Lines Added | Key Changes |
|----------|-------------|-------------|-------------|-------------|
| **Terms & Conditions** | 1.0 (Dec 28, 2025) | 1.1 (Jan 20, 2026) | ~150 | Unified Calendar, updated tiers, conflict detection, two-way sync |
| **Privacy Policy** | 1.0 (Dec 28, 2025) | 1.1 (Jan 20, 2026) | ~200 | Calendar data collection, AI email parsing, transcripts, third-party integrations |

**Total Legal Document Coverage:** ~1,400 lines of comprehensive legal protection

---

## 🎯 Next Steps

1. **Review:** Team lead reviews this summary
2. **Legal:** Attorney reviews updated documents ($500-1,500 budget)
3. **Implement:** Build privacy settings UI and cookie banner
4. **Notify:** Email users about updated policies (30-day notice)
5. **Deploy:** Update live website with new legal docs
6. **Monitor:** Track user acceptance rates and feedback

---

**Prepared by:** TATU Development Team  
**Date:** January 20, 2026  
**Status:** Ready for Legal Review

---

*These updates reflect our commitment to transparency, user privacy, and compliance with data protection laws.*
