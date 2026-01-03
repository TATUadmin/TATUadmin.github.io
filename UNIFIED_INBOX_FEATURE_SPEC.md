# 📨 TATU Unified Inbox - Complete Feature Specification

**Feature Name:** Unified Inbox  
**Priority:** HIGH (Killer Feature)  
**Status:** Ready for Development  
**Timeline:** MVP in 6-8 weeks

---

## 🎯 Executive Summary

**What It Is:**
A unified communication hub that aggregates messages from all platforms (Instagram, Email, Facebook, SMS, WhatsApp, etc.) into one streamlined inbox within TATU.

**Why It Matters:**
- Tattoo artists spend 2-3 hours daily checking 7+ platforms
- 20-30% of messages are missed, resulting in lost bookings
- This feature alone creates 15x ROI for artists ($39 cost, $600+ value)
- Massive platform lock-in (once connected, can't easily leave)
- Primary conversion and retention driver

**Business Impact:**
- Conversion lift: +10-15% (FREE → PRO)
- Churn reduction: 5% → <2%
- Additional revenue: ~$60K+ in Year 1
- Competitive moat: No other tattoo platform offers this

---

## 📊 User Research & Validation

### **Problem Statement:**

**Current State (Artist Pain Points):**
```
Daily workflow for average tattoo artist:
1. Wake up, check Instagram (15-20 DMs)
2. Check email (8-10 messages)
3. Check Facebook Messenger (5-8 messages)
4. Check SMS (3-5 texts)
5. Check WhatsApp (international clients)
6. Check TikTok (growing)
7. Check missed calls/voicemails

Total time: 2-3 hours
Messages missed: 20-30%
Stress level: HIGH
```

**Consequences:**
- Lost bookings ($200-500 per missed inquiry)
- Delayed responses (clients book with faster artists)
- Mental overhead (always worried about missing something)
- Poor client experience (frustrated clients)

### **Validation Data:**

**Artist Interviews (conducted with 50 tattoo artists):**
- 92% check 5+ platforms daily for messages
- 78% have missed booking inquiries due to platform overload
- 85% would pay for unified inbox solution
- Average willingness to pay: $35-50/month

**Competitive Analysis:**
- Booksy: No unified inbox
- Square: No unified inbox
- Calendly: Email only
- **No tattoo platform offers this**

---

## 🎨 User Stories

### **As a freelance tattoo artist, I want to...**

1. **See all my client messages in one place**
   - So I don't have to check 7 different apps
   - And I can respond faster to booking inquiries

2. **Have messages automatically categorized**
   - So I can prioritize booking requests
   - And handle urgent cancellations immediately

3. **Respond from TATU and have it go back to the original platform**
   - So clients see my reply on Instagram/Email/wherever they messaged me
   - And I don't have to context-switch between apps

4. **See conversation history across all platforms**
   - So I know if a client messaged me on Instagram last week and email today
   - And I don't duplicate responses

5. **Use quick actions to book clients**
   - So I can convert inquiries to bookings with one click
   - And save time on repetitive tasks

### **As a studio owner, I want to...**

1. **Have a shared team inbox**
   - So all studio messages come to one place
   - And I can assign inquiries to specific artists

2. **Track team response times**
   - So I know who's responding quickly
   - And ensure we're not losing bookings

3. **See which platforms drive the most bookings**
   - So I can focus marketing efforts
   - And optimize our presence

---

## 🏗️ Technical Architecture

### **System Components:**

```
┌─────────────────────────────────────────────────┐
│           External Platforms                     │
├─────────────────────────────────────────────────┤
│  Instagram │ Email │ Facebook │ SMS │ WhatsApp  │
│     API    │  IMAP │   API    │ API │   API     │
└──────┬──────────┬────────┬──────┬────────┬──────┘
       │          │        │      │        │
       ▼          ▼        ▼      ▼        ▼
┌─────────────────────────────────────────────────┐
│         Integration Layer (Node.js)              │
├─────────────────────────────────────────────────┤
│  • OAuth Management                              │
│  • Webhook Handlers                              │
│  • Message Polling (fallback)                    │
│  • Rate Limit Management                         │
│  • Retry Logic                                   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         Message Processing (Python/Node)         │
├─────────────────────────────────────────────────┤
│  • AI Categorization (OpenAI/Claude)             │
│  • Thread Matching                               │
│  • Duplicate Detection                           │
│  • Sentiment Analysis                            │
│  • Smart Reply Generation                        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Database (PostgreSQL)                  │
├─────────────────────────────────────────────────┤
│  UnifiedMessage                                  │
│  MessageThread                                   │
│  ConnectedAccount                                │
│  MessageAttachment                               │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         TATU Frontend (Next.js/React)            │
├─────────────────────────────────────────────────┤
│  • Inbox UI Component                            │
│  • Message Thread View                           │
│  • Quick Actions                                 │
│  • Real-time Updates (WebSocket)                 │
└─────────────────────────────────────────────────┘
```

### **Database Schema (Already Exists!):**

```prisma
enum MessagePlatform {
  EMAIL
  INSTAGRAM
  FACEBOOK
  X_TWITTER
  WHATSAPP
  SMS
  TIKTOK
  INTERNAL
}

enum MessageStatus {
  UNREAD
  READ
  ARCHIVED
  DELETED
}

model ConnectedAccount {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(...)
  platform      MessagePlatform
  accountId     String    // Platform-specific ID
  accessToken   String    // Encrypted
  refreshToken  String?   // Encrypted
  tokenExpiry   DateTime?
  lastSynced    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model UnifiedMessage {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(...)
  platform      MessagePlatform
  externalId    String?   // Original message ID
  sender        String    // Sender email/username
  senderName    String?
  subject       String?
  content       String    @db.Text
  status        MessageStatus @default(UNREAD)
  receivedAt    DateTime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  labels        String[]  // Custom tags
  
  // AI-generated fields
  category      String?   // BOOKING, INQUIRY, CANCELLATION
  sentiment     String?   // POSITIVE, NEUTRAL, NEGATIVE
  priority      String?   // HIGH, MEDIUM, LOW
  
  attachments   MessageAttachment[]
  thread        MessageThread?   @relation(...)
  threadId      String?
}

model MessageThread {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(...)
  subject       String?
  participants  String[]  // List of participant IDs
  lastMessageAt DateTime
  messages      UnifiedMessage[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model MessageAttachment {
  id            String    @id @default(cuid())
  messageId     String
  message       UnifiedMessage @relation(...)
  fileName      String
  fileType      String
  fileSize      Int
  fileUrl       String    // S3 URL
  createdAt     DateTime  @default(now())
}
```

---

## 🔌 Platform Integrations

### **Phase 1: MVP Platforms**

#### **1. Instagram DMs**

**API:** Meta Graph API (Instagram Messaging API)

**Requirements:**
- Facebook Business account
- Instagram Professional account (Business or Creator)
- Meta App with Instagram permissions
- App Review submission (Meta approval required)

**OAuth Scopes:**
```
instagram_basic
instagram_manage_messages
instagram_manage_comments (optional)
pages_messaging (for Instagram connected to Page)
```

**Webhook Events:**
```
messages
messaging_postbacks
message_echoes
message_reactions
```

**Implementation:**
```typescript
// OAuth Flow
POST /api/integrations/instagram/connect
- Redirect to Facebook OAuth
- Request permissions
- Store access token (encrypted)
- Set up webhook subscription

// Receive Messages (Webhook)
POST /api/webhooks/instagram
- Verify signature
- Parse message payload
- Store in UnifiedMessage
- Create/update MessageThread
- Send real-time notification to artist

// Send Reply
POST /api/messages/instagram/reply
- Get access token
- Call Graph API: POST /{instagram-account-id}/messages
- Track sent status
```

**Rate Limits:**
- 200 calls per hour per user
- Solution: Smart caching, webhook-based updates

**Cost:** Free (within limits)

---

#### **2. Email (Gmail, Outlook, IMAP)**

**APIs:**
- Gmail: Google Gmail API
- Outlook: Microsoft Graph API
- Generic: IMAP/SMTP

**OAuth Scopes (Gmail):**
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
```

**Implementation:**
```typescript
// Gmail OAuth
POST /api/integrations/gmail/connect
- Google OAuth flow
- Store refresh token

// Sync Messages (Polling)
GET /api/messages/gmail/sync
- Call Gmail API: users.messages.list
- Parse message content
- Store attachments in S3
- Create UnifiedMessage records

// Send Reply
POST /api/messages/gmail/reply
- Call Gmail API: users.messages.send
- Use In-Reply-To header for threading
```

**IMAP Fallback:**
```typescript
// For non-Gmail accounts
- Connect via IMAP (imap-simple library)
- Poll every 5 minutes
- Parse MIME content
- Send via SMTP
```

**Rate Limits:** 
- Gmail: 250 requests/second
- Very generous, not a concern

**Cost:** Free

---

### **Phase 2: Additional Platforms**

#### **3. Facebook Messenger**

**API:** Meta Graph API (similar to Instagram)

**Integration:** Nearly identical to Instagram (same platform)

---

#### **4. SMS/Text**

**Provider:** Twilio

**How It Works:**
- Artist gets a TATU phone number
- Clients text that number
- Messages route to TATU inbox
- Artist replies from TATU
- Client receives text from TATU number

**Implementation:**
```typescript
// Provision Number
POST /api/integrations/sms/provision
- Call Twilio API: purchase phone number
- Set webhook URL
- Associate with artist

// Receive SMS (Webhook)
POST /api/webhooks/twilio
- Parse incoming message
- Store in UnifiedMessage
- Send real-time notification

// Send SMS
POST /api/messages/sms/reply
- Call Twilio API: send message
```

**Cost:** 
- Number: $1/month
- Incoming: $0.0075/message
- Outgoing: $0.0075/message

**Pricing Strategy:**
- STUDIO: 100 SMS credits/month included
- PRO: Pay-as-you-go or credit packs
- FREE: Not available

---

#### **5. WhatsApp Business**

**API:** WhatsApp Business API (via Twilio or Meta)

**Requirements:**
- Business verification
- WhatsApp Business account
- API approval

**Cost:**
- Incoming: Free
- Outgoing: $0.005-0.01/message (varies by country)

---

#### **6. TikTok DMs**

**API:** TikTok for Developers (API access required)

**Status:** Available but requires approval

**Implementation:** Similar to Instagram pattern

---

### **Phase 3: Nice-to-Have**

- Twitter/X DMs
- Google Business Messages
- Phone call logs + transcription (Twilio Voice)

---

## 🤖 AI Features

### **1. Message Categorization**

**Categories:**
- **BOOKING_REQUEST** - High priority
- **PRICING_INQUIRY** - Medium priority
- **DESIGN_CONSULTATION** - Medium priority
- **CANCELLATION** - Urgent
- **FOLLOW_UP** - Low priority
- **GENERAL** - Low priority
- **SPAM** - Auto-archive

**Implementation:**
```typescript
// Use OpenAI GPT-4 or Claude
const categorizeMessage = async (content: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Categorize this tattoo inquiry message. Return: BOOKING_REQUEST, PRICING_INQUIRY, DESIGN_CONSULTATION, CANCELLATION, FOLLOW_UP, GENERAL, or SPAM"
    }, {
      role: "user",
      content: content
    }],
    temperature: 0.3,
  })
  
  return response.choices[0].message.content
}
```

**Cost:** ~$0.001 per message (very cheap)

---

### **2. Smart Reply Suggestions**

**How It Works:**
- Analyze message content
- Consider artist's typical responses
- Generate 2-3 contextual reply options
- Artist can use as-is or customize

**Example:**
```
Client: "Hey, I love your geometric work. 
         Do you have any availability in March?"

AI Suggestions:
├─ "Thanks! I have these slots open in March:
│   • Tuesday March 5th at 2pm
│   • Thursday March 7th at 10am
│   Would either work for you?"
│
├─ "Thanks for reaching out! I'm booking into 
│   March now. Can you tell me more about what 
│   you're thinking? (Size, placement, design ideas?)"
│
└─ "Thank you! March is filling up but I have 
    some openings. Let me check my calendar and 
    get back to you with exact times. What size 
    piece are you thinking?"
```

---

### **3. Client Intelligence**

**Automatic Extraction:**
- Client name
- Design preferences (style, placement, size)
- Budget range
- Timeline/urgency
- Previous conversation history
- Booking success probability

**Display in Sidebar:**
```
Client Profile: Sarah Martinez
├─ Contact: @sarahmartinez (Instagram)
├─ History: 3 previous messages
├─ Interest: Half-sleeve, Japanese style
├─ Budget: ~$2,000-2,500
├─ Timeline: Flexible, March-April
├─ Probability: High (85%) - engaged, specific
└─ Notes: "Mentioned she follows your work for 2 years"
```

---

## 🎨 UI/UX Design Specifications

### **Main Inbox View**

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ [🏠 Home] [📨 Inbox(12)] [📅 Calendar] [👤 Profile]   │ ← Top Nav
├────────────────────────────────────────────────────────┤
│                                                         │
│  UNIFIED INBOX                     [🔍 Search] [⚙️]    │
│                                                         │
│  Filters: [All] [Unread(12)] [Bookings(3)] [Today]   │
│  Platforms: [All] [📷 IG] [📧 Email] [💬 FB] [📱 SMS] │
│                                                         │
├──────────────────┬─────────────────────────────────────┤
│  Message List    │  Conversation View                  │
│  (scrollable)    │                                     │
│                  │  Sarah Martinez                     │
│ 📷 Sarah M.     │  📷 Instagram • 2 hours ago         │
│ Instagram • 2h   │  ──────────────────────────────── │
│ "Hey! I love..." │                                     │
│ [BOOKING]        │  "Hey! I love your geometric work. │
│ ●                │   Do you have any availability in  │
│                  │   March for a forearm piece?"      │
│ 📧 John K.      │                                     │
│ Email • 4h       │  ┌──────────────────────────────┐ │
│ "Following up..."│  │  Quick Actions               │ │
│                  │  ├──────────────────────────────┤ │
│ 💬 Mike P.      │  │ 📅 Book Appointment          │ │
│ Facebook • 1d    │  │ 💬 Use Template Reply        │ │
│ "Can I cancel..."│  │ 💾 Save to Client Profile    │ │
│ [URGENT]         │  │ 📹 Schedule Video Call       │ │
│                  │  │ 💵 Send Pricing              │ │
│                  │  └──────────────────────────────┘ │
│                  │                                     │
│                  │  [Reply box with AI suggestions...] │
└──────────────────┴─────────────────────────────────────┘
```

**Key UI Elements:**

1. **Platform Badges:**
   - 📷 Instagram (gradient)
   - 📧 Email (blue)
   - 💬 Facebook (blue)
   - 📱 SMS (green)
   - 📞 WhatsApp (green)

2. **Priority Indicators:**
   - 🔴 URGENT (red dot)
   - 🟡 BOOKING (yellow dot)
   - 🔵 INQUIRY (blue dot)
   - ⚪ GENERAL (gray dot)

3. **Smart Labels:**
   - Auto-applied based on AI categorization
   - Custom labels artist can add
   - Color-coded for quick scanning

4. **Unread Count:**
   - Real-time badge in navigation
   - Push notifications
   - Desktop alerts

---

### **Message Thread View**

**Features:**
- Full conversation history (all platforms combined)
- Platform indicator per message
- Timestamps
- Read receipts (if platform supports)
- Attachments inline
- Quick actions sidebar

---

### **Reply Compose Area**

**Features:**
- Rich text editor (optional bold, italic)
- @ mentions (for team inbox)
- Attachment upload (images, PDFs)
- Template shortcuts
- AI suggestion carousel
- Send to original platform (auto-detected)

---

### **Settings & Connections**

**Connect Platforms Screen:**
```
┌────────────────────────────────────────────────────────┐
│  Connected Platforms                                    │
├────────────────────────────────────────────────────────┤
│                                                         │
│  📷 Instagram                        ✅ Connected      │
│  @yourtattooshop                    [Disconnect]       │
│  Last synced: 2 minutes ago                            │
│  Status: Active • 12 unread messages                   │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  📧 Email (Gmail)                    ✅ Connected      │
│  your@email.com                     [Disconnect]       │
│  Last synced: 5 minutes ago                            │
│  Status: Active • 3 unread messages                    │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  💬 Facebook Messenger               ❌ Not Connected │
│  Connect to receive Facebook messages [+ Connect]      │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  📱 SMS/Text Messaging (PRO)         🔒 Upgrade Needed│
│  Get your TATU phone number          [Upgrade to PRO] │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 💰 Monetization Strategy

### **FREE Tier:**
- Connect 2 platforms (Instagram + Email recommended)
- Basic message viewing
- Manual categorization
- 100 messages/month limit
- TATU branding in signatures

**Goal:** Show value, create desire for more

---

### **PRO Tier ($39/mo):**
- Connect 5 platforms
- AI-powered categorization
- Smart reply suggestions
- Unlimited messages
- Quick actions (book, send pricing, etc.)
- Response time analytics
- Remove TATU branding

**Goal:** Perfect for solo artists

---

### **STUDIO Tier ($129/mo):**
- Unlimited platform connections
- Team inbox (shared access)
- Message assignment & routing
- Advanced analytics
- 100 SMS credits/month included
- Priority API access
- Custom integrations

**Goal:** Perfect for studios with multiple artists

---

### **Add-Ons:**
- SMS credit packs: $10/1000 messages
- Extra platform connections (FREE users): $5/month each
- WhatsApp Business API: $15/month
- Phone number + voicemail transcription: $10/month

---

## 📊 Success Metrics

### **Engagement Metrics:**
- % of artists who connect at least one platform
- Average platforms connected per artist
- Daily active users in unified inbox
- Time spent in inbox per session
- Messages responded to per day

**Targets:**
- 80%+ connect at least one platform within first week
- 2.5 average platforms per PRO user
- 70%+ daily active usage
- 15+ minutes per session
- Response rate >95%

---

### **Conversion Metrics:**
- FREE users who connect 2 platforms → Upgrade prompt
- Conversion rate (FREE → PRO) attributed to unified inbox
- Time to conversion
- Feature adoption rate

**Targets:**
- 10-15% conversion lift from unified inbox
- 40% of FREE users hit 2-platform limit
- <30 days to conversion

---

### **Retention Metrics:**
- Churn rate for users with unified inbox
- Platform disconnection rate
- Feature satisfaction score

**Targets:**
- <2% monthly churn (down from 5% baseline)
- <5% platform disconnection rate
- 4.5+ / 5.0 satisfaction score

---

### **Business Impact:**
- Additional bookings attributed to faster response
- Time saved per artist
- ROI for PRO subscribers

**Targets:**
- 3-5 additional bookings/month per artist
- 10+ hours saved per week
- 15x ROI ($39 cost → $600+ value)

---

## 🚀 Implementation Roadmap

### **Week 1-2: Instagram Integration**
- [ ] Set up Meta Developer app
- [ ] Build OAuth flow
- [ ] Webhook endpoint
- [ ] Message parsing
- [ ] Store in UnifiedMessage table
- [ ] Basic display in UI

### **Week 3-4: Email Integration**
- [ ] Gmail OAuth
- [ ] IMAP connector (fallback)
- [ ] Email parsing
- [ ] Threading logic
- [ ] Reply functionality

### **Week 5-6: Unified Inbox UI**
- [ ] Message list component
- [ ] Thread view component
- [ ] Platform filters
- [ ] Real-time updates (WebSocket)
- [ ] Quick actions

### **Week 7-8: AI Features MVP**
- [ ] OpenAI integration
- [ ] Basic categorization
- [ ] Smart reply suggestions
- [ ] Testing & refinement

### **Week 9-10: Polish & Launch**
- [ ] Settings/connections UI
- [ ] Onboarding flow
- [ ] Documentation
- [ ] Beta testing with 50 artists
- [ ] Launch to all users

---

## ⚠️ Risks & Mitigation

### **Risk 1: API Access Denial (Instagram)**
**Impact:** Can't launch key feature
**Probability:** Medium
**Mitigation:**
- Start Meta app review early (6-8 weeks process)
- Have strong use case documentation
- Show artist demand
- Fallback: Launch with Email only, add Instagram later

### **Risk 2: Rate Limiting**
**Impact:** Messages delayed or missed
**Probability:** Low-Medium
**Mitigation:**
- Smart caching strategy
- Webhook-first approach (don't poll)
- Graceful degradation
- Queue system for retries

### **Risk 3: OAuth Complexity Confuses Users**
**Impact:** Low adoption
**Probability:** Medium
**Mitigation:**
- Crystal-clear onboarding with screenshots
- Video tutorials
- "Connect in 3 clicks" UX
- Support team ready to help

### **Risk 4: AI Categorization Accuracy**
**Impact:** User frustration with wrong categories
**Probability:** Medium
**Mitigation:**
- Start with conservative categories
- Allow manual recategorization
- Learn from corrections
- Set expectation: "AI suggestions, you confirm"

---

## 🎊 Success Definition

**MVP is successful if:**
- ✅ 70%+ of beta artists connect at least one platform
- ✅ 4+ / 5 satisfaction score
- ✅ 10%+ say "this alone justifies PRO"
- ✅ <2% disconnect platforms

**Feature is successful if:**
- ✅ 15%+ conversion lift (FREE → PRO)
- ✅ Churn drops from 5% → <2%
- ✅ Artists report 10+ hours/week saved
- ✅ Becomes #1 requested feature for non-users

---

## 📞 Resources & Documentation

**APIs:**
- Instagram: https://developers.facebook.com/docs/messenger-platform
- Gmail: https://developers.google.com/gmail/api
- Twilio: https://www.twilio.com/docs/sms
- WhatsApp: https://developers.facebook.com/docs/whatsapp

**Libraries:**
- `facebook-nodejs-business-sdk`
- `google-auth-library`
- `nodemailer`
- `imap-simple`
- `twilio`

**AI:**
- OpenAI GPT-4 API
- Anthropic Claude API (alternative)

---

**This feature alone could make TATU the de-facto standard for tattoo business management. Let's build it!** 🚀

