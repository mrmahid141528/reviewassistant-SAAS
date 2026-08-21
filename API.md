# API.md

# Review Assistant — API Architecture

## 1. Overview

Review Assistant exposes a secure REST API for the SaaS frontend, admin panel, external integrations, AI services, Google integrations, billing providers, and future third-party clients.

The API is responsible for:

* Authentication
* User and business management
* Multi-tenant access control
* Customer management
* Campaign management
* Feedback collection
* AI review generation
* Review request management
* Google integration
* Subscription and billing
* Usage tracking
* Analytics
* Notifications
* Webhooks
* Audit logging

---

# 2. API Base URL

Production:

```text
https://reviewassistant.mrmahid.com/api
```

Development:

```text
http://localhost:3000/api
```

All production API communication must use HTTPS.

---

# 3. API Architecture

```text
Browser / Mobile / External Client
                │
                ▼
          API Route Layer
                │
                ▼
        Authentication Layer
                │
                ▼
        Authorization Layer
                │
                ▼
       Validation Layer
                │
                ▼
        Business Services
                │
       ┌────────┼─────────┐
       ▼        ▼         ▼
   PostgreSQL   AI      Google
      │        Provider  APIs
      │
      ▼
   Audit Logs
```

The API must separate:

1. Route handling
2. Authentication
3. Authorization
4. Validation
5. Business logic
6. Database access
7. External integrations

---

# 4. API Versioning

The initial API version is:

```text
/api/v1
```

Example:

```text
https://reviewassistant.mrmahid.com/api/v1/business
```

Future versions may use:

```text
/api/v2
```

Breaking changes must never silently modify an existing API contract.

---

# 5. HTTP Methods

The API uses standard HTTP methods.

| Method | Purpose                         |
| ------ | ------------------------------- |
| GET    | Retrieve data                   |
| POST   | Create resource/action          |
| PATCH  | Partially update resource       |
| PUT    | Replace resource where required |
| DELETE | Remove/revoke resource          |

Example:

```text
GET    /api/v1/campaigns
POST   /api/v1/campaigns
GET    /api/v1/campaigns/:id
PATCH  /api/v1/campaigns/:id
DELETE /api/v1/campaigns/:id
```

---

# 6. Authentication

Authentication should use the application's authentication system.

Recommended:

```text
Auth.js
```

The frontend must not manually send passwords to ordinary business APIs after authentication.

Authenticated requests use the user's authenticated session.

Conceptually:

```text
User
 │
 ▼
Authentication
 │
 ▼
Session
 │
 ▼
API Request
 │
 ▼
User Identity
```

---

# 7. Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What can this user do?

Every protected endpoint must perform authorization.

Roles:

```text
owner
admin
manager
staff
```

Example:

```text
owner:
Full business control

admin:
Business management

manager:
Campaign/customer/review management

staff:
Limited operational access
```

---

# 8. Tenant Context

Every authenticated business request must resolve the active business/tenant.

Example:

```text
Request
   │
   ▼
Authenticated User
   │
   ▼
Business Membership
   │
   ▼
Current Business ID
   │
   ▼
Authorized Resource
```

Never trust a client-provided `businessId` without verifying membership.

---

# 9. Request Headers

Standard headers:

```http
Content-Type: application/json
Accept: application/json
```

Authenticated requests may use the application's session mechanism.

External API clients may use:

```http
Authorization: Bearer <API_KEY>
```

API keys must only be supported on endpoints explicitly designed for external API access.

---

# 10. Standard Success Response

API responses should use a predictable structure.

Example:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Example Business"
  }
}
```

For collections:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# 11. Standard Error Response

Errors should use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {}
  }
}
```

Do not expose:

* Database errors
* Stack traces
* Internal file paths
* API credentials
* OAuth tokens
* Sensitive provider responses

in production responses.

---

# 12. HTTP Status Codes

Use standard HTTP status codes.

| Code | Meaning                 |
| ---- | ----------------------- |
| 200  | Success                 |
| 201  | Created                 |
| 204  | No Content              |
| 400  | Bad Request             |
| 401  | Unauthenticated         |
| 403  | Forbidden               |
| 404  | Not Found               |
| 409  | Conflict                |
| 422  | Validation Error        |
| 429  | Rate Limited            |
| 500  | Internal Server Error   |
| 502  | External Provider Error |
| 503  | Service Unavailable     |

---

# 13. Error Codes

Recommended application-level error codes:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
RESOURCE_EXISTS
TENANT_ACCESS_DENIED
RATE_LIMITED
PLAN_LIMIT_REACHED
INVALID_API_KEY
INVALID_SESSION
GOOGLE_NOT_CONNECTED
GOOGLE_AUTH_FAILED
AI_GENERATION_FAILED
PAYMENT_FAILED
WEBHOOK_INVALID
INTERNAL_ERROR
```

---

# 14. Authentication APIs

## Get Current User

```text
GET /api/v1/auth/me
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "User",
    "email": "user@example.com"
  }
}
```

---

# 15. Business APIs

## Create Business

```text
POST /api/v1/businesses
```

Request:

```json
{
  "name": "ABC Restaurant",
  "timezone": "Asia/Kolkata"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ABC Restaurant",
    "slug": "abc-restaurant"
  }
}
```

---

## List Businesses

```text
GET /api/v1/businesses
```

Returns businesses accessible to the authenticated user.

---

## Get Business

```text
GET /api/v1/businesses/:businessId
```

---

## Update Business

```text
PATCH /api/v1/businesses/:businessId
```

---

## Delete Business

```text
DELETE /api/v1/businesses/:businessId
```

Deletion should normally use soft deletion.

---

# 16. Business Member APIs

## List Members

```text
GET /api/v1/businesses/:businessId/members
```

## Invite Member

```text
POST /api/v1/businesses/:businessId/members
```

Request:

```json
{
  "email": "staff@example.com",
  "role": "staff"
}
```

## Update Member Role

```text
PATCH /api/v1/businesses/:businessId/members/:memberId
```

## Remove Member

```text
DELETE /api/v1/businesses/:businessId/members/:memberId
```

Only authorized roles can manage members.

---

# 17. Location APIs

## Create Location

```text
POST /api/v1/businesses/:businessId/locations
```

Request:

```json
{
  "name": "Main Branch",
  "address": "Example Road",
  "city": "Kolkata",
  "state": "West Bengal",
  "country": "India",
  "postalCode": "700001"
}
```

## List Locations

```text
GET /api/v1/businesses/:businessId/locations
```

## Get Location

```text
GET /api/v1/locations/:locationId
```

## Update Location

```text
PATCH /api/v1/locations/:locationId
```

## Delete Location

```text
DELETE /api/v1/locations/:locationId
```

---

# 18. Customer APIs

## Create Customer

```text
POST /api/v1/businesses/:businessId/customers
```

Request:

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+91XXXXXXXXXX"
}
```

## List Customers

```text
GET /api/v1/businesses/:businessId/customers
```

Supported query parameters:

```text
?page=1
&limit=20
&search=customer
&locationId=uuid
```

## Get Customer

```text
GET /api/v1/customers/:customerId
```

## Update Customer

```text
PATCH /api/v1/customers/:customerId
```

## Delete Customer

```text
DELETE /api/v1/customers/:customerId
```

---

# 19. Campaign APIs

## Create Campaign

```text
POST /api/v1/businesses/:businessId/campaigns
```

Request:

```json
{
  "name": "Post Purchase Feedback",
  "locationId": "uuid",
  "ratingThreshold": 4,
  "reviewPlatform": "google"
}
```

## List Campaigns

```text
GET /api/v1/businesses/:businessId/campaigns
```

## Get Campaign

```text
GET /api/v1/campaigns/:campaignId
```

## Update Campaign

```text
PATCH /api/v1/campaigns/:campaignId
```

## Delete Campaign

```text
DELETE /api/v1/campaigns/:campaignId
```

---

# 20. Campaign Question APIs

## Create Question

```text
POST /api/v1/campaigns/:campaignId/questions
```

Request:

```json
{
  "question": "How was your experience?",
  "questionType": "rating",
  "required": true,
  "sortOrder": 1
}
```

## List Questions

```text
GET /api/v1/campaigns/:campaignId/questions
```

## Update Question

```text
PATCH /api/v1/campaign-questions/:questionId
```

## Delete Question

```text
DELETE /api/v1/campaign-questions/:questionId
```

---

# 21. Public Feedback APIs

Customer feedback pages do not require normal dashboard authentication.

Example public endpoint:

```text
GET /api/v1/public/campaigns/:campaignSlug
```

Returns only the information necessary to render the public feedback page.

Sensitive business information must never be exposed.

---

# 22. Submit Feedback

```text
POST /api/v1/public/feedback
```

Request:

```json
{
  "campaignId": "uuid",
  "customer": {
    "name": "Customer",
    "email": "customer@example.com"
  },
  "rating": 5,
  "answers": [
    {
      "questionId": "uuid",
      "answer": "Excellent service"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "feedbackId": "uuid",
    "nextAction": "generate_review"
  }
}
```

Public endpoints must have stronger abuse protection and rate limiting.

---

# 23. Feedback APIs

## List Feedback

```text
GET /api/v1/businesses/:businessId/feedback
```

Query parameters:

```text
?page=1
&limit=20
&rating=5
&campaignId=uuid
&locationId=uuid
&from=2026-08-01
&to=2026-08-31
```

## Get Feedback

```text
GET /api/v1/feedback/:feedbackId
```

---

# 24. AI Review Generation

## Generate Review

```text
POST /api/v1/feedback/:feedbackId/generate-review
```

Request:

```json
{
  "tone": "natural",
  "length": "medium",
  "language": "en"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "reviewText": "Example generated review...",
    "rating": 5
  }
}
```

The generated content must be based on actual customer feedback.

---

# 25. Review APIs

## List Generated Reviews

```text
GET /api/v1/businesses/:businessId/reviews
```

Query parameters:

```text
?page=1
&limit=20
&status=generated
&rating=5
```

## Get Generated Review

```text
GET /api/v1/reviews/:reviewId
```

## Regenerate Review

```text
POST /api/v1/reviews/:reviewId/regenerate
```

## Update Review Draft

```text
PATCH /api/v1/reviews/:reviewId
```

The customer/business user may edit a generated draft before using it.

---

# 26. Review Request APIs

## Create Review Request

```text
POST /api/v1/feedback/:feedbackId/review-request
```

Request:

```json
{
  "platform": "google"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "platform": "google",
    "reviewUrl": "https://..."
  }
}
```

---

## Get Review Request

```text
GET /api/v1/review-requests/:requestId
```

---

# 27. Review Redirect Flow

Public review redirect:

```text
GET /api/v1/public/review/:requestId
```

Flow:

```text
Customer
   │
   ▼
Feedback
   │
   ▼
Rating
   │
   ▼
AI Review Draft
   │
   ▼
Customer Reviews/Edits
   │
   ▼
Review Request
   │
   ▼
Google Review Destination
```

The system should track:

```text
redirected
clicked
completed
```

where technically possible.

---

# 28. Google Integration APIs

## Start Google Connection

```text
GET /api/v1/integrations/google/connect
```

The API generates the OAuth authorization flow.

---

## Google OAuth Callback

```text
GET /api/v1/integrations/google/callback
```

The callback:

1. Validates OAuth state.
2. Exchanges authorization code.
3. Retrieves required account information.
4. Encrypts tokens.
5. Stores integration.
6. Associates the integration with the correct business/location.
7. Redirects the user back to the dashboard.

---

# 29. Get Google Integration

```text
GET /api/v1/businesses/:businessId/integrations/google
```

Response must not expose OAuth tokens.

Example:

```json
{
  "success": true,
  "data": {
    "connected": true,
    "accountName": "Business Account",
    "locationConnected": true,
    "status": "active"
  }
}
```

---

# 30. Disconnect Google

```text
DELETE /api/v1/businesses/:businessId/integrations/google
```

The server should:

1. Revoke tokens where supported.
2. Remove/encrypt invalid credentials.
3. Mark integration disconnected.
4. Create an audit log.

---

# 31. Google Review URL

The API may provide a Google review destination URL for the connected business/location.

```text
GET /api/v1/locations/:locationId/google-review-url
```

Response:

```json
{
  "success": true,
  "data": {
    "reviewUrl": "https://..."
  }
}
```

The implementation must follow Google's current API and platform policies.

---

# 32. Billing APIs

## Get Plans

```text
GET /api/v1/plans
```

Publicly accessible plans can be returned without authentication.

---

## Get Current Subscription

```text
GET /api/v1/businesses/:businessId/subscription
```

---

## Create Checkout

```text
POST /api/v1/businesses/:businessId/subscription/checkout
```

Request:

```json
{
  "planId": "uuid",
  "billingCycle": "monthly"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://..."
  }
}
```

---

## Cancel Subscription

```text
POST /api/v1/businesses/:businessId/subscription/cancel
```

---

## Change Subscription

```text
POST /api/v1/businesses/:businessId/subscription/change-plan
```

---

# 33. Payment Webhooks

Provider webhook endpoint:

```text
POST /api/v1/webhooks/payment
```

Webhook handling:

```text
Provider
   │
   ▼
Webhook Endpoint
   │
   ▼
Signature Verification
   │
   ▼
Idempotency Check
   │
   ▼
Store Event
   │
   ▼
Process Event
   │
   ▼
Update Subscription/Payment
```

Never trust webhook data before verifying its signature.

---

# 34. Usage APIs

## Get Current Usage

```text
GET /api/v1/businesses/:businessId/usage
```

Response:

```json
{
  "success": true,
  "data": {
    "feedbackSubmissions": {
      "used": 120,
      "limit": 1000
    },
    "aiReviews": {
      "used": 75,
      "limit": 500
    }
  }
}
```

---

# 35. Analytics APIs

## Dashboard Analytics

```text
GET /api/v1/businesses/:businessId/analytics/overview
```

Possible response:

```json
{
  "success": true,
  "data": {
    "totalFeedback": 1200,
    "averageRating": 4.6,
    "positiveFeedback": 1080,
    "reviewRequests": 950,
    "reviewClicks": 720,
    "conversionRate": 75.8
  }
}
```

---

## Analytics by Date

```text
GET /api/v1/businesses/:businessId/analytics/timeseries
```

Query:

```text
?from=2026-08-01
&to=2026-08-31
&interval=day
```

---

# 36. Notification APIs

## List Notifications

```text
GET /api/v1/notifications
```

## Mark Notification Read

```text
PATCH /api/v1/notifications/:notificationId/read
```

## Mark All Read

```text
POST /api/v1/notifications/read-all
```

---

# 37. Audit Log APIs

## List Audit Logs

```text
GET /api/v1/businesses/:businessId/audit-logs
```

Query:

```text
?page=1
&limit=50
&action=GOOGLE_CONNECTED
```

Audit logs should normally be read-only.

---

# 38. API Key APIs

## Create API Key

```text
POST /api/v1/businesses/:businessId/api-keys
```

Request:

```json
{
  "name": "Production API"
}
```

The full API key should only be displayed once after creation.

---

## List API Keys

```text
GET /api/v1/businesses/:businessId/api-keys
```

Only metadata should be returned.

---

## Revoke API Key

```text
DELETE /api/v1/api-keys/:keyId
```

---

# 39. Pagination

Collection endpoints should support:

```text
?page=1
&limit=20
```

Default:

```text
page = 1
limit = 20
```

Maximum:

```text
limit = 100
```

The API must prevent excessively large requests.

---

# 40. Filtering

Use query parameters.

Example:

```text
GET /api/v1/businesses/:businessId/feedback
?rating=5
&status=completed
&locationId=uuid
```

Filters must be validated before reaching the database.

---

# 41. Sorting

Supported sorting example:

```text
?sortBy=createdAt
&sortOrder=desc
```

Only whitelisted fields may be used for sorting.

Never directly inject user-provided sort fields into SQL.

---

# 42. Search

Example:

```text
GET /api/v1/businesses/:businessId/customers
?search=rahul
```

Search should be indexed appropriately as the dataset grows.

---

# 43. Rate Limiting

Rate limiting is required.

Recommended categories:

```text
Authentication:
Strict

Public feedback:
Strict

AI generation:
Plan-based

Google integration:
Moderate

Dashboard APIs:
Moderate

Admin APIs:
Strict

Webhooks:
Provider-based
```

Example:

```text
429 Too Many Requests
```

Response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests"
  }
}
```

---

# 44. Plan-Based Limits

AI and other metered features must check subscription limits before execution.

Flow:

```text
Request
   │
   ▼
Authentication
   │
   ▼
Tenant
   │
   ▼
Subscription
   │
   ▼
Usage Check
   │
 ┌─┴──────────┐
 │            │
Allowed     Exceeded
 │            │
 ▼            ▼
Execute    402/403
```

The exact status code should remain consistent across the application.

---

# 45. Validation

All incoming API data must be validated.

Recommended validation library:

```text
Zod
```

Example:

```text
Request
   ↓
Zod schema
   ↓
Validated data
   ↓
Service
```

Never pass raw request bodies directly into database operations.

---

# 46. API Security Rules

The API must:

```text
[ ] Validate authentication
[ ] Validate authorization
[ ] Validate tenant ownership
[ ] Validate request body
[ ] Validate query parameters
[ ] Rate limit sensitive endpoints
[ ] Sanitize user-controlled output where required
[ ] Never expose secrets
[ ] Never expose database errors
[ ] Verify webhook signatures
[ ] Protect OAuth state
[ ] Encrypt OAuth tokens
[ ] Hash API keys
[ ] Log security-sensitive actions
```

---

# 47. Idempotency

Critical POST operations should support an idempotency key.

Header:

```http
Idempotency-Key: <unique-key>
```

Recommended for:

```text
Payment creation
Subscription changes
Review request creation
External webhook processing
Other retry-sensitive operations
```

Repeated requests with the same valid key should not create duplicate resources.

---

# 48. External API Failure Handling

External providers can fail.

Examples:

```text
Google API unavailable
AI provider unavailable
Payment provider unavailable
Network timeout
Rate limit
Invalid provider token
```

The API should return controlled errors.

Example:

```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_PROVIDER_ERROR",
    "message": "The external service is temporarily unavailable."
  }
}
```

Internal provider details should be logged server-side.

---

# 49. AI API Architecture

AI generation should not be directly implemented inside route handlers.

Recommended:

```text
API Route
   │
   ▼
Review Service
   │
   ▼
AI Service
   │
   ├── Provider Adapter
   │
   ├── Prompt Manager
   │
   ├── Safety Validation
   │
   └── Usage Tracking
```

This allows the AI provider to be changed later without rewriting API routes.

---

# 50. Background Jobs

Long-running operations should use background jobs.

Possible jobs:

```text
AI review generation
Email delivery
Notification delivery
Analytics aggregation
Webhook processing
Token refresh
Usage aggregation
Cleanup jobs
```

The API should return quickly when an operation is intentionally asynchronous.

Example:

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "queued"
  }
}
```

---

# 51. API Logging

Log:

```text
request ID
user ID
business ID
endpoint
HTTP method
status code
response time
error code
```

Do not log:

```text
passwords
access tokens
refresh tokens
API keys
payment card information
sensitive customer information
```

---

# 52. Request ID

Every API request should have a unique request ID.

Example:

```text
X-Request-ID: req_01J...
```

If the client provides a valid request ID, the server may preserve it.

Otherwise, the server generates one.

This ID should appear in server logs and, where appropriate, error responses.

---

# 53. API Route Organization

Recommended Next.js structure:

```text
app/
└── api/
    └── v1/
        ├── auth/
        ├── businesses/
        ├── customers/
        ├── campaigns/
        ├── feedback/
        ├── reviews/
        ├── review-requests/
        ├── integrations/
        │   └── google/
        ├── plans/
        ├── subscriptions/
        ├── payments/
        ├── usage/
        ├── analytics/
        ├── notifications/
        ├── audit-logs/
        ├── api-keys/
        ├── public/
        └── webhooks/
```

---

# 54. Service Layer

Business logic should be placed in services.

Example:

```text
src/
├── services/
│   ├── business.service.ts
│   ├── customer.service.ts
│   ├── campaign.service.ts
│   ├── feedback.service.ts
│   ├── review.service.ts
│   ├── ai.service.ts
│   ├── google.service.ts
│   ├── billing.service.ts
│   └── analytics.service.ts
```

Routes should remain thin.

---

# 55. API Request Lifecycle

Standard request lifecycle:

```text
HTTP Request
     │
     ▼
Middleware
     │
     ▼
Authentication
     │
     ▼
Tenant Resolution
     │
     ▼
Authorization
     │
     ▼
Input Validation
     │
     ▼
Controller / Route
     │
     ▼
Service Layer
     │
     ▼
Database / External API
     │
     ▼
Audit / Usage Logging
     │
     ▼
Response
```

---

# 56. Public API Security

Public feedback endpoints are particularly sensitive because they can be accessed without authentication.

They must use:

```text
Rate limiting
Bot protection where necessary
Short-lived/public-safe tokens
Input validation
Request size limits
Abuse detection
Duplicate submission protection
```

Public URLs must never expose internal database IDs where avoidable.

Use secure public identifiers/tokens where appropriate.

---

# 57. CORS

If frontend and API are hosted on the same origin:

```text
https://reviewassistant.mrmahid.com
```

CORS configuration should remain restrictive.

If external clients are later supported, allow only explicitly configured origins.

Never use unrestricted production CORS unless there is a documented reason.

---

# 58. API Documentation

The production API should eventually have machine-readable OpenAPI documentation.

Recommended:

```text
OpenAPI 3.x
```

The API specification should document:

* Endpoints
* Authentication
* Request schemas
* Response schemas
* Error codes
* Pagination
* Rate limits
* Webhooks

---

# 59. Testing Requirements

Every API module should have tests.

Minimum:

```text
Authentication tests
Authorization tests
Tenant isolation tests
Validation tests
CRUD tests
Rate-limit tests
Webhook tests
Billing tests
Google integration tests
AI service tests
Public endpoint abuse tests
```

Especially important:

```text
User A must never access Business B's resources.
```

---

# 60. API Development Rules

Developers must follow these rules:

1. Never trust client-provided tenant IDs.
2. Never skip authorization checks.
3. Never expose secrets.
4. Never directly trust request bodies.
5. Never put business logic inside UI components.
6. Never allow unrestricted database queries.
7. Never process payment webhooks without signature verification.
8. Never store plaintext API keys.
9. Never expose OAuth refresh tokens.
10. Never bypass usage limits.
11. Never create duplicate resources during retries.
12. Never return internal stack traces in production.

---

# 61. MVP API Priority

The MVP should prioritize:

```text
Authentication
Business management
Business members
Locations

Customers

Campaigns
Campaign questions

Public feedback
Feedback submissions

AI review generation
Generated reviews

Review requests

Google integration

Plans
Subscriptions
Payments

Usage tracking

Dashboard analytics
```

Advanced APIs can be added after the core product is stable.

---

# 62. Final API Architecture

```text
                    REVIEW ASSISTANT API
                           │
                     /api/v1/*
                           │
          ┌────────────────┼────────────────┐
          │                │                │
     Authentication     Business          Public
          │             APIs              APIs
          │                │                │
          │          ┌─────┼─────┐          │
          │          │     │     │          │
          │       Campaign Feedback      Feedback
          │       Customer  Review       Submission
          │          │      │
          │          └──────┘
          │
          ├──────── Google Integration
          ├──────── AI Service
          ├──────── Billing
          ├──────── Usage
          ├──────── Analytics
          ├──────── Notifications
          ├──────── Audit Logs
          └──────── Webhooks
                           │
                           ▼
                     Service Layer
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
             PostgreSQL       External APIs
```

This API architecture provides a secure, versioned, multi-tenant foundation for Review Assistant and is designed to support the initial MVP while remaining extensible for future mobile apps, public APIs, additional review platforms, integrations, and enterprise functionality.
