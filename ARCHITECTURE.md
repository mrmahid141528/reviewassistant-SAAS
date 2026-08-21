# Google Review Assistant SaaS — Architecture

**Product:** Google Review Assistant
**Brand:** Mr Mahid
**Application:** `reviewassistant.mrmahid.com`
**Main Website:** `mrmahid.com`
**Architecture Version:** 1.0 — MVP
**Status:** Planned

---

# 1. Architecture Overview

Google Review Assistant will be built as a standalone SaaS application under the Mr Mahid brand.

The existing `mrmahid.com` portfolio website remains a separate application.

```text
                    MR MAHID ECOSYSTEM
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        mrmahid.com            reviewassistant.mrmahid.com
      Main Website                  SaaS Application
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                          ▼               ▼               ▼
                       Frontend        Backend         Customer
                       Dashboard       Services        Review UI
                          │               │               │
                          └───────────────┼───────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              ▼              ▼
                       Supabase        Prisma       Gemini API
                      PostgreSQL        ORM          AI Engine
```

---

# 2. Core Technology Stack

| Layer             | Technology                              |
| ----------------- | --------------------------------------- |
| Framework         | Next.js                                 |
| Language          | TypeScript                              |
| UI                | React                                   |
| Styling           | Tailwind CSS / project design system    |
| Database          | PostgreSQL                              |
| Database Platform | Supabase                                |
| ORM               | Prisma                                  |
| Authentication    | Supabase Auth                           |
| AI                | Google Gemini API                       |
| QR                | QR generation library                   |
| Validation        | Zod                                     |
| API               | Next.js Route Handlers / Server Actions |
| Hosting           | Next.js-compatible hosting              |
| Domain            | `reviewassistant.mrmahid.com`           |
| Future Payments   | Razorpay                                |

---

# 3. Application Separation

The main Mr Mahid website and Review Assistant SaaS should remain logically separate.

```text
mrmahid.com
│
└── Portfolio / Services / Marketing
```

```text
reviewassistant.mrmahid.com
│
├── Authentication
├── Business Dashboard
├── Customer Review Assistant
├── QR Management
├── Analytics
└── AI Review Generation
```

The SaaS should not depend on the existing portfolio website's frontend code.

The main website can link to the SaaS using:

```text
mrmahid.com/services/google-review-assistant
        ↓
reviewassistant.mrmahid.com
```

---

# 4. Multi-Tenant Architecture

The application will use a multi-tenant SaaS architecture.

A tenant represents a business.

```text
Platform
│
├── Business A
│   ├── Profile
│   ├── Questions
│   ├── QR Codes
│   ├── Review Sessions
│   └── Analytics
│
├── Business B
│   ├── Profile
│   ├── Questions
│   ├── QR Codes
│   ├── Review Sessions
│   └── Analytics
│
└── Business C
    ├── Profile
    ├── Questions
    ├── QR Codes
    ├── Review Sessions
    └── Analytics
```

A business must never be able to access another business's private data.

This isolation will be enforced through:

* Authentication.
* Authorization.
* Database relationships.
* Supabase Row Level Security where applicable.
* Server-side ownership checks.

---

# 5. Application Layers

The application will use a layered architecture.

```text
┌─────────────────────────────────────────────┐
│                Presentation                 │
│     Pages / Components / Forms / UI         │
├─────────────────────────────────────────────┤
│                Application                  │
│     Actions / API Routes / Validation       │
├─────────────────────────────────────────────┤
│                 Services                    │
│ AI Service / QR Service / Analytics        │
├─────────────────────────────────────────────┤
│               Data Access                   │
│          Prisma / Supabase                 │
├─────────────────────────────────────────────┤
│              External Services              │
│       Gemini / Supabase / Razorpay          │
└─────────────────────────────────────────────┘
```

---

# 6. Recommended Project Structure

The SaaS will be a separate Next.js project.

```text
review-assistant-saas/
│
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── business/
│   │   ├── questions/
│   │   ├── qr/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   ├── review/
│   │   └── [businessSlug]/
│   │
│   ├── api/
│   │   ├── ai/
│   │   ├── qr/
│   │   ├── analytics/
│   │   └── businesses/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── review/
│   ├── questions/
│   ├── qr/
│   └── analytics/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── ai/
│   ├── qr/
│   ├── analytics/
│   ├── validation/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── types/
│
├── public/
│
├── docs/
│
├── .env.local
├── .env.example
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

# 7. Next.js Architecture

Next.js will provide both the frontend and server-side application layer.

```text
Browser
   ↓
Next.js
   ├── Server Components
   ├── Client Components
   ├── Server Actions
   └── Route Handlers
```

Use Server Components by default.

Use Client Components only where interactivity is required.

Examples:

### Server Components

* Dashboard data loading.
* Business profile display.
* Analytics summary.
* Review page initial data.

### Client Components

* Question interactions.
* Review editor.
* Copy-to-clipboard button.
* Regenerate button.
* QR preview.
* Interactive charts.

---

# 8. Authentication Architecture

Supabase Auth will handle business-owner authentication.

```text
Business Owner
      ↓
Signup/Login
      ↓
Supabase Auth
      ↓
Authenticated Session
      ↓
Next.js
      ↓
Dashboard
```

Authentication should support:

### MVP

* Email/password.
* Password reset.
* Logout.

### Future

* Google OAuth.
* Magic links.
* Team members.
* Multi-user business accounts.

Customer review users do not need authentication.

---

# 9. Customer Review Architecture

The customer journey must remain frictionless.

```text
QR Code
   ↓
reviewassistant.mrmahid.com/review/{slug}
   ↓
Load Business
   ↓
Load Active Questions
   ↓
Customer Answers
   ↓
Create Review Session
   ↓
Generate AI Review
   ↓
Edit
   ↓
Copy
   ↓
Google Redirect
```

No customer account should be required for the MVP.

---

# 10. Business Dashboard Architecture

The dashboard is protected.

```text
/login
   ↓
Authentication
   ↓
Session
   ↓
Dashboard
   ├── Overview
   ├── Business
   ├── Questions
   ├── QR
   ├── Analytics
   └── Settings
```

Every dashboard request must verify that the authenticated user has permission to access the requested business.

---

# 11. Business Ownership Model

The application should use explicit ownership relationships.

```text
User
 │
 └── Business
      │
      ├── Questions
      ├── QR Codes
      ├── Review Sessions
      ├── Reviews
      └── Analytics
```

A request such as:

```text
GET /api/businesses/{businessId}
```

must verify:

```text
authenticatedUser.businessId === requestedBusinessId
```

before returning private business data.

---

# 12. Supabase Architecture

Supabase will provide:

* PostgreSQL database.
* Authentication.
* Storage if required.
* Database security policies.
* Optional realtime features.

```text
Next.js
   │
   ├── Supabase Auth
   │
   └── PostgreSQL
          │
          └── SaaS Data
```

Supabase Storage can later store:

* Business logos.
* QR assets.
* Other business-uploaded files.

Large unnecessary files should not be stored in the database.

---

# 13. Prisma Architecture

Prisma will act as the application's primary database ORM.

```text
Next.js Server
      ↓
Service Layer
      ↓
Prisma
      ↓
PostgreSQL
```

Prisma should be used from server-side code only.

The browser must not directly use Prisma.

Prisma will handle:

* Queries.
* Inserts.
* Updates.
* Deletes.
* Relations.
* Transactions.
* Migrations/schema management.

---

# 14. Database Connection

Production database:

```text
Supabase PostgreSQL
        ↓
Prisma
        ↓
Next.js Backend
```

The database connection string must remain server-side.

Environment variables:

```env
DATABASE_URL=
DIRECT_URL=
```

The exact connection configuration will be defined in `DATABASE.md`.

---

# 15. AI Architecture

Gemini must never be called directly from the customer's browser.

Correct architecture:

```text
Customer Browser
       ↓
POST /api/ai/generate-review
       ↓
Authentication / Session Validation
       ↓
Input Validation
       ↓
Usage Limit Check
       ↓
Review Generation Service
       ↓
Gemini API
       ↓
Validate AI Response
       ↓
Save Generated Review
       ↓
Return Review
       ↓
Customer Browser
```

---

# 16. AI Service Abstraction

The AI integration should not be hardcoded throughout the application.

Use a dedicated service layer:

```text
lib/
└── ai/
    ├── index.ts
    ├── types.ts
    ├── prompts.ts
    └── providers/
        └── gemini.ts
```

Application code should call:

```text
generateReview()
```

instead of directly calling Gemini everywhere.

This makes future provider changes easier.

Future structure:

```text
AI Service
│
├── Gemini
├── OpenAI
└── Anthropic
```

---

# 17. AI Request Flow

```text
Customer Answers
       ↓
Normalize Input
       ↓
Validate Input
       ↓
Load Business Configuration
       ↓
Build Structured Prompt
       ↓
Gemini API
       ↓
Receive Output
       ↓
Validate Output
       ↓
Store Generated Review
       ↓
Return Result
```

The backend should never trust AI output blindly.

The generated response should be checked for:

* Empty response.
* Unexpected structure.
* Excessive length.
* Invalid content.
* Missing required output.

---

# 18. AI Usage Protection

Before every AI request:

```text
Request
  ↓
Identify Business
  ↓
Check Current Usage
  ↓
Usage Available?
   ├── No → Reject
   └── Yes
        ↓
     Gemini
        ↓
     Save Usage
```

Additional protection:

* Rate limiting.
* Request size limits.
* Maximum regeneration attempts.
* Timeout handling.
* Error handling.

---

# 19. Review Session Architecture

A customer review session represents one customer interaction.

```text
Review Session
│
├── Business
├── QR Code
├── Answers
├── Generated Reviews
├── Copy Event
└── Google Redirect Event
```

A session does not require customer identity.

The system should avoid collecting unnecessary personal information.

---

# 20. QR Architecture

QR codes should point to application URLs instead of directly to Google's review URL.

Example:

```text
QR
 ↓
https://reviewassistant.mrmahid.com/review/abc123
```

This allows the system to:

* Track scans.
* Show questions.
* Generate AI review.
* Track conversion events.
* Change Google Review URL later without reprinting QR.

The QR should therefore use a stable internal review URL.

---

# 21. Google Review Redirect

Final action:

```text
Customer clicks:
Copy Review & Continue to Google
```

Backend/client workflow:

```text
1. Copy review text
2. Record copy event
3. Open configured Google Review URL
```

The system must not claim successful Google submission.

Tracked event:

```text
google_redirect_clicked
```

Not:

```text
google_review_submitted
```

unless verified through an official integration in the future.

---

# 22. Analytics Architecture

Analytics should be event-based.

```text
Customer
   ↓
Action
   ↓
Analytics Event
   ↓
Database
```

Example:

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

Dashboard analytics will aggregate these events.

---

# 23. API Architecture

API endpoints should be organized by domain.

```text
/api
│
├── /auth
├── /businesses
├── /questions
├── /qr
├── /review
├── /ai
└── /analytics
```

Example:

```text
POST /api/ai/generate-review
POST /api/ai/regenerate-review
POST /api/review/session
POST /api/analytics/event
POST /api/qr
GET  /api/businesses
PATCH /api/businesses/{id}
```

Full API specifications will be defined in:

`API.md`

---

# 24. Validation Architecture

All external input must be validated.

Use Zod or an equivalent validation library.

```text
Request
   ↓
Zod Schema
   ↓
Valid?
 ├── No → 400 Error
 └── Yes
       ↓
    Service
```

Validation should apply to:

* Business information.
* Questions.
* Answers.
* AI requests.
* QR configuration.
* Analytics events.
* Future payment/webhook payloads.

---

# 25. Error Architecture

Use consistent application errors.

```text
Application Error
│
├── Validation Error
├── Authentication Error
├── Authorization Error
├── Not Found
├── Rate Limit
├── Usage Limit
├── AI Error
├── Database Error
└── External Service Error
```

The frontend should receive safe user-friendly messages.

Internal technical details should be logged server-side only.

---

# 26. Rate Limiting

Rate limiting should be implemented for sensitive/high-cost endpoints.

Priority endpoints:

```text
/api/ai/generate-review
/api/ai/regenerate-review
/api/auth/*
```

Possible limits:

* Per IP.
* Per business.
* Per session.
* Per user.

Exact values can be configured later.

---

# 27. Caching Strategy

Cache data that changes infrequently.

Potentially cache:

* Public business profile.
* Active question configuration.
* Static marketing content.

Do not cache sensitive user-specific data without proper isolation.

AI-generated review responses should not be globally cached between different customers.

---

# 28. File Storage

Supabase Storage may be used for:

```text
Business Logo
QR Assets
```

File flow:

```text
Browser
 ↓
Secure Upload
 ↓
Supabase Storage
 ↓
File URL
 ↓
Business Record
```

File uploads must have:

* Size limits.
* Type validation.
* Authentication/authorization.
* Safe filenames.
* Access control.

---

# 29. Environment Architecture

Development:

```text
Local Next.js
      ↓
Supabase Development Project
      ↓
Gemini API
```

Production:

```text
reviewassistant.mrmahid.com
      ↓
Production Next.js
      ↓
Production Supabase
      ↓
Gemini API
```

Development and production credentials must be separated.

---

# 30. Environment Variables

Example:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=
DIRECT_URL=

# Gemini
GEMINI_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=https://reviewassistant.mrmahid.com
```

Future:

```env
# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Never commit `.env.local` to Git.

---

# 31. Domain Architecture

Final SaaS domain:

```text
reviewassistant.mrmahid.com
```

Main website:

```text
mrmahid.com
```

Customer review page:

```text
reviewassistant.mrmahid.com/review/{businessSlug}
```

Dashboard:

```text
reviewassistant.mrmahid.com/dashboard
```

Authentication:

```text
reviewassistant.mrmahid.com/login
reviewassistant.mrmahid.com/signup
```

---

# 32. DNS Architecture

The subdomain will point to the hosting provider used for the SaaS.

Conceptually:

```text
reviewassistant.mrmahid.com
        ↓
DNS
        ↓
SaaS Hosting
        ↓
Next.js Application
```

The exact DNS record depends on the chosen hosting provider.

The main `mrmahid.com` DNS configuration must remain unaffected.

---

# 33. Deployment Architecture

Production:

```text
Git Repository
      ↓
CI/CD
      ↓
Build
      ↓
Next.js Deployment
      ↓
reviewassistant.mrmahid.com
```

Environment variables are configured in the production hosting platform.

Database migrations:

```text
Prisma Migration
      ↓
Production PostgreSQL
```

Database migrations must be tested before production deployment.

Detailed deployment instructions will be defined in:

`DEPLOYMENT.md`

---

# 34. Future Subscription Architecture

Subscription is not enabled in MVP.

However, architecture should support:

```text
Business
   ↓
Subscription
   ↓
Plan
   ↓
Usage Limits
   ↓
Feature Access
```

Future payment flow:

```text
Business
   ↓
Choose Plan
   ↓
Razorpay
   ↓
Payment
   ↓
Webhook
   ↓
Backend Verification
   ↓
Subscription Update
   ↓
Feature Access
```

Frontend payment status must never be the source of truth.

The backend/database subscription status is the source of truth.

---

# 35. Feature Access Architecture

Future feature access should be centralized.

Example:

```text
canGenerateReview(business)
canCreateQR(business)
canUseAnalytics(business)
canUseMultipleLocations(business)
```

Avoid scattering plan checks throughout UI components.

Preferred:

```text
Feature Access Service
        ↓
Plan / Subscription
        ↓
Allowed Features
```

This makes future plan changes easier.

---

# 36. Security Architecture

Security layers:

```text
                    Request
                       ↓
                HTTPS / TLS
                       ↓
                Authentication
                       ↓
                Authorization
                       ↓
                 Validation
                       ↓
                Rate Limiting
                       ↓
                  Service Layer
                       ↓
              Database / External API
```

Secrets:

```text
API Keys
Database Credentials
Service Role Keys
Payment Secrets
```

must remain server-side.

Detailed security policies will be documented in:

`SECURITY.md`

---

# 37. Data Flow — Complete Customer Journey

```text
                  QR SCAN
                     │
                     ▼
       reviewassistant.mrmahid.com
                     │
                     ▼
              Business Lookup
                     │
                     ▼
             Question Configuration
                     │
                     ▼
              Customer Answers
                     │
                     ▼
              Review Session
                     │
                     ▼
              Next.js Backend
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          Usage Check    Validation
              │             │
              └──────┬──────┘
                     ▼
                 Gemini API
                     │
                     ▼
              Generated Review
                     │
                     ▼
               Review Editor
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          Regenerate       Edit
              │             │
              └──────┬──────┘
                     ▼
                 Copy Review
                     │
                     ▼
             Google Review URL
                     │
                     ▼
          Customer Manually Pastes
                     │
                     ▼
                 Google Submit
```

---

# 38. Data Flow — Business Dashboard

```text
Business Owner
      ↓
Login
      ↓
Supabase Auth
      ↓
Authenticated Session
      ↓
Dashboard
      ↓
Next.js Server
      ↓
Authorization
      ↓
Prisma
      ↓
Supabase PostgreSQL
      ↓
Business Data
```

---

# 39. Data Flow — AI Generation

```text
Customer
   ↓
Answers
   ↓
Frontend
   ↓
POST /api/ai/generate-review
   ↓
Authentication/Session
   ↓
Business/Session Validation
   ↓
Usage Check
   ↓
Zod Validation
   ↓
AI Service
   ↓
Gemini Provider
   ↓
Gemini API
   ↓
Response Validation
   ↓
Prisma
   ↓
generated_reviews
   ↓
Frontend
```

---

# 40. Data Isolation

Every business-owned record should ultimately be traceable to a business.

Example:

```text
business_id
```

should exist directly or indirectly for:

* Questions.
* QR codes.
* Review sessions.
* Generated reviews.
* Analytics.
* Usage.
* Subscriptions.

This allows secure tenant isolation and efficient querying.

---

# 41. Scalability Strategy

MVP architecture should remain simple.

Initial:

```text
Next.js
+
Supabase
+
Prisma
+
Gemini
```

As usage grows:

```text
CDN
Caching
Queue
Background Jobs
Dedicated AI limits
Database optimization
Monitoring
```

Do not introduce microservices during MVP unless there is a concrete requirement.

The initial architecture should be a modular monolith.

---

# 42. Modular Monolith

The SaaS will initially use a modular monolith rather than microservices.

Modules:

```text
Authentication
Business
Questions
QR
Review
AI
Analytics
Usage
Subscription
```

Each module should have clear responsibilities.

Example:

```text
lib/
├── ai/
├── business/
├── questions/
├── qr/
├── review/
├── analytics/
├── usage/
└── subscription/
```

This provides clean architecture while keeping deployment and development simple.

---

# 43. Logging and Monitoring

The production system should log:

* Authentication errors.
* API errors.
* AI failures.
* Database failures.
* Rate-limit events.
* Usage-limit events.
* Important security events.
* Payment webhook events in the future.

Do not log:

* API keys.
* Passwords.
* Database credentials.
* Sensitive authentication tokens.

---

# 44. Backup Strategy

Supabase PostgreSQL backups should be enabled according to the production plan.

Important production data:

* Businesses.
* Questions.
* QR configurations.
* Review sessions.
* Generated reviews.
* Usage.
* Subscriptions.

Before major schema migrations:

1. Backup database.
2. Test migration.
3. Run migration.
4. Verify application.

---

# 45. Architecture Principles

The project must follow these principles:

### Principle 1 — Security First

Never expose secrets or private business data.

### Principle 2 — Server-Side AI

Gemini API calls must happen on the backend.

### Principle 3 — Tenant Isolation

One business must never access another business's private data.

### Principle 4 — Modular Code

Separate business logic into services/modules.

### Principle 5 — Simple MVP

Avoid unnecessary microservices and infrastructure.

### Principle 6 — Future Ready

Support future subscriptions without rebuilding the core architecture.

### Principle 7 — Provider Abstraction

Keep AI and payment providers replaceable.

### Principle 8 — Customer Control

Customer reviews remain editable and manually submitted.

---

# 46. Final Architecture

```text
                           MR MAHID
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
        mrmahid.com              reviewassistant.mrmahid.com
        Main Website                    SaaS Application
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                         ▼                    ▼                    ▼
                    Business              Customer             Future
                    Dashboard             Review UI            Admin
                         │                    │
                         └──────────┬─────────┘
                                    ▼
                              Next.js App
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
                 Supabase        Prisma        Gemini API
                 PostgreSQL        ORM           AI
                     │
                     ▼
                SaaS Database
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
    Businesses    Reviews       Analytics
        │
        ▼
   Future Subscription
        │
        ▼
     Razorpay
```

---

# 47. Architecture Summary

The MVP will use a **Next.js modular monolith** with:

* Next.js for frontend and backend.
* Supabase PostgreSQL for persistent data.
* Supabase Auth for business authentication.
* Prisma as the database ORM.
* Gemini API for AI-assisted review generation.
* QR codes pointing to internal review URLs.
* Server-side validation and security.
* Event-based analytics.
* Free-only MVP with usage limits.
* Future-ready subscription architecture.
* `reviewassistant.mrmahid.com` as the dedicated SaaS subdomain.

The architecture intentionally keeps the existing Mr Mahid website separate while keeping the SaaS under the same brand ecosystem.
