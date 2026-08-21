# Google Review Assistant SaaS — Product Requirements Document

**Product Name:** Google Review Assistant
**Brand:** Mr Mahid
**Product Type:** SaaS Web Application
**Version:** 1.0 — MVP
**Status:** Planned
**Primary Domain:** `app.mrmahid.com`

---

## 1. Product Overview

Google Review Assistant is a SaaS platform that helps businesses make it easier for their customers to write genuine Google reviews.

A business creates a branded review page and QR code. Customers scan the QR code, answer a few simple questions about their actual experience, and receive an AI-assisted review draft based only on their answers.

The customer can edit the generated review, copy it, and continue to the business's Google review page where they manually paste and submit the review.

The platform does **not** automatically submit reviews to Google.

### Core Flow

```text
Business creates account
        ↓
Adds business information
        ↓
Adds Google Review URL
        ↓
Creates review questions
        ↓
Generates QR Code
        ↓
Customer scans QR
        ↓
Customer Review Assistant opens
        ↓
Customer answers questions
        ↓
AI generates review draft
        ↓
Customer edits/accepts draft
        ↓
Copy Review
        ↓
Open Google Review Page
        ↓
Customer pastes review
        ↓
Customer submits review manually
```

---

# 2. Problem Statement

Many customers are willing to leave a review but do not know what to write.

Common problems:

* Customer does not know how to start a review.
* Customer writes very short reviews such as "Good service".
* Customer spends too much time thinking about wording.
* Businesses have no simple branded workflow for guiding customers.
* Generic AI-generated reviews may sound artificial or contain invented information.

The product solves this by collecting the customer's own experience first and using AI to convert those answers into a natural review draft.

---

# 3. Product Goals

## Primary Goals

1. Make writing a Google review quick and simple.
2. Generate review drafts based on the customer's actual experience.
3. Allow customers to fully edit the generated review.
4. Make the final Google submission manual and user-controlled.
5. Give businesses a simple QR-based review collection system.
6. Provide basic usage and QR analytics.
7. Keep the MVP free.
8. Build the backend so future paid subscriptions can be added without redesigning the core system.

## Secondary Goals

1. Support multiple languages.
2. Support different business categories.
3. Allow businesses to customize questions.
4. Provide business branding on the review page.
5. Support multiple QR codes in the future.
6. Provide usage limits to protect AI API costs.

---

# 4. Non-Goals for MVP

The following features are intentionally excluded from the first version:

* Automatic Google review submission.
* Automatic filling of the Google review textbox.
* Google Business Profile OAuth integration.
* Automatic Google review retrieval.
* Automatic review replies.
* Payment/subscription system.
* Advanced CRM.
* Email marketing.
* WhatsApp automation.
* Loyalty/reward system.
* Review incentives.
* Fake review generation.
* Review manipulation based on hiding negative feedback.
* Mobile native application.
* Multi-tenant enterprise administration beyond basic business accounts.

These may be considered in future versions.

---

# 5. Target Users

## 5.1 Business Owner

Examples:

* Restaurants
* Cafes
* Salons
* Gyms
* Hotels
* Clinics
* Local shops
* Service providers
* Repair businesses
* Agencies
* Other local businesses

Business owners use the platform to create and manage their review assistant.

## 5.2 Customer

A customer scans a QR code provided by a business and uses the review assistant without needing to create an account.

## 5.3 Super Admin

The Mr Mahid platform administrator manages the SaaS system, users, usage, system configuration and future subscription plans.

---

# 6. User Roles

## Business Owner

Can:

* Register/login.
* Create business profile.
* Add business information.
* Add Google review URL.
* Configure review questions.
* Configure review language and tone.
* Generate QR code.
* View QR statistics.
* View review-generation usage.
* Update business settings.

## Customer

Can:

* Open review assistant using QR/link.
* View business information.
* Answer review questions.
* Generate review draft.
* Regenerate review.
* Edit review.
* Copy review.
* Open Google review page.

Customer does not need an account.

## Super Admin

Can:

* View registered businesses.
* Manage users.
* View platform usage.
* View AI usage.
* Manage system settings.
* Manage future plans/subscription configuration.
* Suspend/activate business accounts.

---

# 7. MVP Feature Scope

## 7.1 Business Authentication

Business owners can:

* Sign up.
* Log in.
* Log out.
* Reset password.
* Access protected dashboard.

Authentication will be implemented using a secure authentication system integrated with Supabase.

Future:

* Google OAuth.
* Other social login providers.

---

# 8. Business Profile

Each business can configure:

* Business name.
* Business category.
* Business description.
* Business logo.
* Business address.
* Business phone number.
* Website URL.
* Google Review URL.
* Default review language.
* Default review tone.

Example:

```text
Business Name:
ABC Restaurant

Category:
Restaurant

Google Review URL:
https://g.page/...

Default Language:
English

Default Tone:
Friendly & Natural
```

---

# 9. Review Question Builder

The business owner can create questions that help collect the customer's genuine experience.

Example:

### Question 1

**How was the quality of our food?**

Options:

* Excellent
* Good
* Average
* Poor

### Question 2

**How was our staff's behaviour?**

Options:

* Very friendly
* Friendly
* Professional
* Average

### Question 3

**What did you like most?**

Options:

* Food
* Service
* Ambience
* Price
* Staff

### Question 4

**Would you recommend us?**

Options:

* Definitely
* Probably
* Not sure
* No

The question builder should support:

* Question text.
* Question type.
* Required/optional.
* Answer options.
* Question order.
* Enable/disable.
* Delete.
* Edit.

---

# 10. Customer Review Assistant

The customer-facing page should be simple and mobile-first because most customers will access it by scanning a QR code using a smartphone.

## Customer Flow

```text
Business Branding
       ↓
Welcome Message
       ↓
Question 1
       ↓
Question 2
       ↓
Question 3
       ↓
Question N
       ↓
Generate Review
       ↓
AI Review Draft
       ↓
Edit Review
       ↓
Copy & Continue to Google
```

---

# 11. AI Review Generation

The AI system converts customer answers into a natural review draft.

### AI Input

The backend may provide:

* Business name.
* Business category.
* Customer answers.
* Selected language.
* Selected tone.
* Optional customer-written notes.

### AI Rules

The AI must:

1. Use only information provided by the customer/business configuration.
2. Never invent experiences.
3. Never invent products, staff names, prices, locations, claims or events.
4. Avoid repetitive wording.
5. Produce natural human-readable text.
6. Respect the selected language.
7. Respect the selected tone.
8. Keep the review appropriate for Google.
9. Avoid unnecessary exaggeration.
10. Preserve the customer's actual sentiment and experience.

### Example

Customer answers:

```text
Food: Excellent
Staff: Friendly
Ambience: Great
Would recommend: Yes
```

Possible output:

```text
Had a really good experience here. The food was excellent,
the staff were friendly, and I really liked the ambience.
Overall, a great experience and I would definitely recommend
this place.
```

The customer must be able to modify the generated text before copying it.

---

# 12. AI Regeneration

The customer can request another version of the review.

Example button:

```text
Regenerate
```

Regeneration should create a different wording while preserving the same factual information.

The system must not use regeneration to change or falsify the customer's experience.

---

# 13. Review Editing

The generated review must be displayed inside an editable text area.

Customer can:

* Edit wording.
* Add information.
* Remove information.
* Change tone manually.
* Accept the review without changes.

The customer's edited version becomes the final review text used by the copy action.

---

# 14. Copy & Continue to Google

Primary CTA:

**Copy Review & Continue to Google**

When clicked:

1. Copy the final review text to clipboard.
2. Record the action in analytics.
3. Open the configured Google Review URL in a new tab/window.

The customer manually pastes the copied review into Google's review interface and submits it.

### Important Technical Limitation

The SaaS must not assume that it can automatically populate Google's review textbox.

Google controls the review page interface.

Therefore the supported workflow is:

```text
Copy
 ↓
Open Google
 ↓
Paste
 ↓
Customer submits
```

---

# 15. QR Code System

Each business can generate a QR code linked to its customer review page.

Example:

```text
https://app.mrmahid.com/review/abc123
```

QR code requirements:

* Generate unique URL.
* Display QR preview.
* Download QR as PNG.
* Download QR as SVG if supported.
* Copy review page URL.
* Regenerate QR if required.

Future:

* Multiple QR codes per business.
* Branch-specific QR codes.
* Counter/table-specific QR codes.
* Campaign-specific QR codes.

---

# 16. Business Dashboard

Dashboard should provide a simple overview.

## Dashboard Statistics

Example:

```text
Total QR Scans
1,245

Review Sessions
823

Reviews Generated
710

Copy Actions
642

Google Redirects
620
```

Possible conversion metric:

```text
Google Redirect Rate
87.3%
```

These numbers represent platform events and should not be presented as confirmed Google review submissions unless Google provides verified data.

---

# 17. Analytics Events

MVP analytics events:

```text
qr_scan
review_page_open
question_started
question_completed
review_generation_requested
review_generated
review_regenerated
review_edited
review_copied
google_redirect_clicked
```

The system should distinguish between:

**Google Redirect**

and

**Confirmed Google Review Submission**

The MVP does not claim to know whether the customer actually submitted the review.

---

# 18. Usage Tracking

Because AI API usage creates a cost, the backend must track usage.

Example:

```text
Monthly AI Generations
23 / 100
```

MVP can have a configurable free limit.

Example:

```text
Free Plan
100 AI generations/month
```

The exact limit should be configurable by the administrator.

### Usage Flow

```text
Customer requests AI generation
        ↓
Backend checks business usage
        ↓
Limit available?
    ├── Yes → Call Gemini API
    │          ↓
    │       Save usage
    │
    └── No → Return limit message
```

---

# 19. Free MVP Plan

The MVP will not charge customers.

Initial plan:

```text
Plan: Free
Price: ₹0
Status: Active
```

Possible MVP limits:

* 1 business.
* 1 Google Review URL.
* Limited AI generations per month.
* Basic QR code.
* Basic analytics.
* Standard review page.

The exact limits should be configurable.

---

# 20. Future Subscription System

Subscription/payment is intentionally excluded from MVP but the architecture must be subscription-ready.

Future plans may include:

```text
Free
Pro
Business
Enterprise
```

Future payment provider:

**Razorpay**

Potential future flow:

```text
Business
 ↓
Select Plan
 ↓
Razorpay Checkout
 ↓
Payment
 ↓
Webhook
 ↓
Backend
 ↓
Subscription Database
 ↓
Plan Activated
 ↓
Features Unlocked
```

The system must never rely only on frontend payment-success messages to activate a subscription.

Webhook verification will be required.

---

# 21. Database Requirements

The system will use:

**Supabase PostgreSQL**

Potential core entities:

```text
users
businesses
business_questions
question_options
qr_codes
review_sessions
review_answers
generated_reviews
usage_records
subscriptions
plans
analytics_events
```

Detailed database structure will be defined separately in:

`DATABASE.md`

---

# 22. Backend Requirements

Backend responsibilities:

* Authentication verification.
* Business authorization.
* Database operations.
* AI API calls.
* AI usage control.
* Review generation.
* Review regeneration.
* QR management.
* Analytics event recording.
* Rate limiting.
* Input validation.
* Security checks.

The Gemini API key must never be exposed to the browser.

---

# 23. AI API

Primary AI provider for MVP:

**Google Gemini API**

The AI integration must be server-side.

```text
Customer Browser
      ↓
Next.js Backend
      ↓
Gemini API
      ↓
Generated Review
      ↓
Next.js Backend
      ↓
Customer Browser
```

The application should keep the AI provider behind an internal service layer so the provider can be changed in the future if required.

Example abstraction:

```text
AIService
   ↓
GeminiProvider
```

Future:

```text
OpenAIProvider
AnthropicProvider
```

---

# 24. Security Requirements

The application must:

* Keep API keys server-side.
* Use environment variables for secrets.
* Enable Supabase Row Level Security where applicable.
* Validate all user input.
* Authorize every protected business resource.
* Rate-limit AI generation endpoints.
* Prevent unauthorized business data access.
* Sanitize user-generated content where required.
* Never expose database service-role keys to the client.
* Verify future payment webhooks.
* Log important security events.

Detailed security requirements will be defined in:

`SECURITY.md`

---

# 25. Privacy Requirements

The platform should collect only information necessary for operation.

Customer review sessions should not require customer accounts.

The system should avoid unnecessarily collecting:

* Customer phone number.
* Customer email.
* Customer address.
* Customer identity.

Review session data should have a configurable retention policy.

The business should be informed about what customer/session information is stored.

A proper Privacy Policy will be required before public production launch.

---

# 26. Review Authenticity Principles

The platform is an **assistant**, not a fake-review generator.

The system must:

* Base generated reviews on customer-provided experiences.
* Allow customer editing.
* Avoid fabricated claims.
* Avoid pretending that the customer experienced something they did not report.
* Not automatically submit reviews.
* Not claim that a Google review was successfully submitted when it only redirected the customer.

The product should encourage honest and genuine customer feedback.

---

# 27. Responsive Design Requirements

The customer review experience is mobile-first.

Supported:

* Mobile.
* Tablet.
* Desktop.

The QR customer flow should prioritize:

* Large touch targets.
* Minimal typing.
* Clear progress indication.
* Fast loading.
* Simple language.
* Accessible contrast.
* Clear CTA.

Business dashboard should support:

* Desktop.
* Tablet.
* Mobile responsive layout.

---

# 28. Branding

The SaaS will initially operate under the Mr Mahid ecosystem.

Main website:

```text
https://mrmahid.com
```

SaaS application:

```text
https://app.mrmahid.com
```

The customer review page may display:

* Business logo.
* Business name.
* Business category.
* Custom welcome message.

The Mr Mahid platform branding can be displayed subtly depending on the future plan.

---

# 29. Main Application Pages

## Public

```text
/
 /login
 /signup
 /forgot-password
 /review/[businessSlug]
```

## Business Dashboard

```text
/dashboard
/dashboard/business
/dashboard/questions
/dashboard/qr
/dashboard/analytics
/dashboard/settings
/dashboard/profile
```

## Future

```text
/dashboard/billing
/dashboard/team
/dashboard/locations
```

---

# 30. MVP Customer Pages

### Welcome

Displays:

* Business logo.
* Business name.
* Welcome message.
* Start button.

### Questions

Displays:

* Current question.
* Answer choices.
* Progress.
* Next button.

### Generating

Displays:

* Loading state.
* Short friendly message.

### Review Result

Displays:

* Generated review.
* Editable text area.
* Regenerate button.
* Copy & Continue to Google button.

### Completion

Displays:

```text
Your review has been copied.

Google has been opened in a new tab.
Paste your review there and submit it.
```

---

# 31. Error Handling

The application must handle:

* Invalid QR link.
* Business not found.
* Business inactive.
* Google Review URL missing.
* AI API failure.
* AI timeout.
* AI usage limit reached.
* Clipboard permission failure.
* Network failure.
* Invalid question configuration.

Example fallback:

```text
We couldn't generate your review right now.
Please try again.
```

The system should never expose raw API errors or secret information to customers.

---

# 32. Performance Requirements

Target:

* Fast customer review page loading.
* Minimal JavaScript where possible.
* Optimized images.
* Server-side API processing.
* AI requests should have reasonable timeout handling.
* Avoid unnecessary database queries.

QR scan → review page should feel almost immediate on a normal mobile connection.

---

# 33. Accessibility

The application should follow basic WCAG accessibility practices:

* Keyboard navigation.
* Proper labels.
* Accessible buttons.
* Sufficient contrast.
* Screen-reader-friendly form controls.
* Visible focus states.
* Error messages associated with inputs.

---

# 34. SEO

Public marketing pages should be SEO-friendly.

Customer review pages should generally not be treated as primary SEO landing pages.

Marketing site should target keywords related to:

* Google review assistant.
* QR review system.
* Customer review generator.
* Business review assistant.
* QR code for Google reviews.

SEO implementation should not expose private customer/business data.

---

# 35. Success Metrics

MVP success should be measured using:

### Acquisition

* Registered businesses.
* Active businesses.

### Usage

* QR scans.
* Review sessions.
* AI generations.
* Regenerations.

### Conversion

* Review generated → copy rate.
* Copy → Google redirect rate.

### Retention

* Weekly active businesses.
* Monthly active businesses.
* Repeat customer review sessions.

### Cost

* AI API cost per generated review.
* Average AI generations per business.
* Infrastructure cost per active business.

---

# 36. MVP Acceptance Criteria

The MVP is considered functional when:

* [ ] Business can create an account.
* [ ] Business can create/update its profile.
* [ ] Business can add Google Review URL.
* [ ] Business can configure questions.
* [ ] Business can generate a QR code.
* [ ] Customer can scan/open the QR URL.
* [ ] Customer can answer questions.
* [ ] Backend can send answers to Gemini.
* [ ] AI can generate a review draft.
* [ ] Customer can edit the review.
* [ ] Customer can regenerate the review.
* [ ] Customer can copy the review.
* [ ] Customer can open Google Review URL.
* [ ] QR scan events are recorded.
* [ ] Review generation usage is recorded.
* [ ] AI usage limits are enforced.
* [ ] Business can view basic analytics.
* [ ] API keys remain server-side.
* [ ] Unauthorized users cannot access another business's data.
* [ ] Application works on mobile and desktop.
* [ ] Free MVP requires no payment.

---

# 37. Future Roadmap

## Phase 1 — MVP

```text
Authentication
Business Profile
Questions
QR
AI Review Generation
Review Editing
Copy + Google Redirect
Basic Analytics
Free Plan
```

## Phase 2 — SaaS Monetization

```text
Subscription Plans
Razorpay
Usage-based Limits
Premium Features
Billing Dashboard
Invoices
Subscription Webhooks
```

## Phase 3 — Advanced Business Features

```text
Multiple Locations
Multiple QR Codes
Branch Analytics
Custom Branding
Team Members
Advanced Analytics
Custom Question Templates
```

## Phase 4 — Google Business Integration

Potential features:

```text
Google Business Profile OAuth
Review Retrieval
Review Analytics
Review Reply Assistant
```

These require separate Google Business Profile API integration and should not be assumed to be part of the MVP.

---

# 38. Technical Stack

## Frontend

**Next.js**

## Language

**TypeScript**

## Styling

Existing project design system / Tailwind CSS if configured.

## Backend

**Next.js server-side APIs / Server Actions where appropriate**

## Database

**Supabase PostgreSQL**

## ORM

**Prisma**

## Authentication

**Supabase Auth or compatible authentication layer**

## AI

**Google Gemini API**

## QR

Client/server QR generation library.

## Future Payment

**Razorpay**

## Hosting

Compatible Next.js hosting environment.

## Domain

```text
app.mrmahid.com
```

---

# 39. Environment Variables

Secrets must be stored in environment variables.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

DATABASE_URL=

DIRECT_URL=
```

Future:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Never commit secrets to Git.

---

# 40. Development Principles

The project must follow these principles:

1. Security first.
2. Mobile-first customer experience.
3. Clean separation between public customer pages and authenticated dashboard.
4. Server-side AI integration.
5. Database access through a controlled data layer.
6. Business data isolation.
7. Scalable multi-tenant architecture.
8. Subscription-ready database design.
9. Provider-independent AI service abstraction.
10. Genuine customer feedback over artificial review generation.

---

# 41. Final MVP Architecture

```text
                    MR MAHID
                       │
              ┌────────┴────────┐
              │                 │
       mrmahid.com       reviewassistant.mrmahid.com
       Marketing Site       SaaS App
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Business Owner         Customer
                    │                   │
                    ▼                   ▼
               Dashboard          Review Page
                    │                   │
                    └─────────┬─────────┘
                              ▼
                       Next.js Backend
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
          Supabase          Prisma         Gemini API
         PostgreSQL           ORM          AI Reviews
              │
              ▼
        SaaS Data Layer
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
    Users  Business  Analytics
```

---

# 42. MVP Product Definition

The first release is a **free, QR-based AI-assisted Google Review Assistant for businesses**.

Its core promise:

> **Help customers turn their real experience into a natural review draft in seconds, then let them choose, edit, copy, and manually submit it to Google.**

The product should remain simple in Phase 1 and focus on making this single workflow reliable, fast, secure, and easy to use.
