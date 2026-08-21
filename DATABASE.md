# DATABASE.md

# Review Assistant — Database Architecture

## 1. Overview

Review Assistant is a multi-tenant SaaS platform where businesses can collect customer feedback, generate AI-assisted review content, and guide customers toward leaving reviews on supported platforms such as Google.

The database must be designed for:

* Multi-tenancy
* Strong tenant data isolation
* Secure authentication
* Business/workspace management
* Customer feedback collection
* AI-generated review content
* Review campaigns
* Google Business Profile integration
* Subscription and billing
* Usage tracking
* Analytics
* Audit logging
* Future scalability

Recommended primary database:

**PostgreSQL**

Recommended ORM:

**Prisma ORM**

---

# 2. Database Architecture

The application uses a relational PostgreSQL database.

```text
                    PostgreSQL
                        │
        ┌───────────────┼────────────────┐
        │               │                │
   Authentication    Tenant Data      Platform Data
        │               │                │
     Users          Businesses        Subscriptions
     Sessions       Locations         Plans
     Accounts        Campaigns        Usage
                    Customers         Audit Logs
                    Feedback
                    Reviews
```

All business-owned data must contain a tenant/business reference so that data belonging to one business cannot accidentally be accessed by another business.

---

# 3. Multi-Tenant Model

Review Assistant uses a tenant-based architecture.

A tenant represents a business/customer using the SaaS.

```text
User
 │
 ├── Membership
 │      │
 │      └── Business/Tenant
 │               │
 │               ├── Locations
 │               ├── Campaigns
 │               ├── Customers
 │               ├── Feedback
 │               ├── Reviews
 │               ├── Integrations
 │               └── Analytics
```

A user may belong to multiple businesses.

A business may have multiple users.

A business may also have multiple locations.

---

# 4. Core Tables

The initial production database should contain the following major tables.

```text
users
accounts
sessions
verification_tokens

businesses
business_members
business_locations

customers
campaigns
campaign_questions
feedback_submissions
feedback_answers

review_requests
generated_reviews
review_submissions

google_integrations

plans
subscriptions
payments
usage_records

notifications
audit_logs

api_keys
webhook_events
```

---

# 5. Users

Stores application users.

### Table: `users`

| Field          | Type      | Description              |
| -------------- | --------- | ------------------------ |
| id             | UUID      | Primary key              |
| name           | VARCHAR   | User name                |
| email          | VARCHAR   | Unique email             |
| email_verified | TIMESTAMP | Verification timestamp   |
| image          | TEXT      | Profile image            |
| status         | ENUM      | active/suspended/deleted |
| created_at     | TIMESTAMP | Creation time            |
| updated_at     | TIMESTAMP | Last update              |

### Rules

* `email` must be unique.
* Soft deletion is preferred.
* Passwords must never be stored in plain text.
* If OAuth is used, authentication credentials are managed through the authentication system.

---

# 6. Accounts

Used for OAuth providers such as Google.

### Table: `accounts`

| Field               | Type      | Description         |
| ------------------- | --------- | ------------------- |
| id                  | UUID      | Primary key         |
| user_id             | UUID      | User reference      |
| provider            | VARCHAR   | OAuth provider      |
| provider_account_id | VARCHAR   | Provider account ID |
| access_token        | TEXT      | Encrypted token     |
| refresh_token       | TEXT      | Encrypted token     |
| expires_at          | INTEGER   | Token expiration    |
| created_at          | TIMESTAMP | Creation time       |
| updated_at          | TIMESTAMP | Last update         |

### Security

OAuth tokens must be encrypted before storage.

Refresh tokens must never be exposed to the frontend.

---

# 7. Sessions

Stores authenticated sessions.

### Table: `sessions`

| Field         | Type      |
| ------------- | --------- |
| id            | UUID      |
| session_token | TEXT      |
| user_id       | UUID      |
| expires       | TIMESTAMP |
| created_at    | TIMESTAMP |

Expired sessions should be automatically cleaned.

---

# 8. Businesses

Represents a SaaS tenant.

### Table: `businesses`

| Field       | Type      | Description              |
| ----------- | --------- | ------------------------ |
| id          | UUID      | Primary key              |
| name        | VARCHAR   | Business name            |
| slug        | VARCHAR   | Unique URL slug          |
| logo_url    | TEXT      | Business logo            |
| website_url | TEXT      | Website                  |
| phone       | VARCHAR   | Business phone           |
| email       | VARCHAR   | Business email           |
| timezone    | VARCHAR   | Business timezone        |
| status      | ENUM      | active/suspended/deleted |
| created_at  | TIMESTAMP | Creation time            |
| updated_at  | TIMESTAMP | Last update              |

### Example

```text
businesses
│
├── ABC Restaurant
├── XYZ Gym
└── Mr Mahid Digital Agency
```

---

# 9. Business Members

Connects users with businesses.

### Table: `business_members`

| Field       | Type      | Description               |
| ----------- | --------- | ------------------------- |
| id          | UUID      | Primary key               |
| business_id | UUID      | Business                  |
| user_id     | UUID      | User                      |
| role        | ENUM      | owner/admin/manager/staff |
| status      | ENUM      | invited/active/suspended  |
| joined_at   | TIMESTAMP | Joining date              |
| created_at  | TIMESTAMP | Creation time             |

### Constraints

```text
UNIQUE(business_id, user_id)
```

This prevents duplicate membership.

---

# 10. Business Locations

Allows one business to manage multiple physical locations.

### Table: `business_locations`

| Field              | Type      | Description                |
| ------------------ | --------- | -------------------------- |
| id                 | UUID      | Primary key                |
| business_id        | UUID      | Business                   |
| name               | VARCHAR   | Location name              |
| address            | TEXT      | Address                    |
| city               | VARCHAR   | City                       |
| state              | VARCHAR   | State                      |
| country            | VARCHAR   | Country                    |
| postal_code        | VARCHAR   | Postal code                |
| phone              | VARCHAR   | Phone                      |
| google_place_id    | VARCHAR   | Google Place ID            |
| google_business_id | VARCHAR   | Google Business Profile ID |
| status             | ENUM      | active/inactive            |
| created_at         | TIMESTAMP | Creation time              |
| updated_at         | TIMESTAMP | Last update                |

---

# 11. Customers

Stores customers who interact with a review campaign.

### Table: `customers`

| Field              | Type             |
| ------------------ | ---------------- |
| id                 | UUID             |
| business_id        | UUID             |
| location_id        | UUID nullable    |
| name               | VARCHAR nullable |
| email              | VARCHAR nullable |
| phone              | VARCHAR nullable |
| external_reference | VARCHAR nullable |
| metadata           | JSONB            |
| created_at         | TIMESTAMP        |
| updated_at         | TIMESTAMP        |

### Privacy

Only collect customer information that is required for the service.

Sensitive information should not be stored unnecessarily.

---

# 12. Campaigns

A campaign defines how customers are asked for feedback.

### Table: `campaigns`

| Field            | Type          |
| ---------------- | ------------- |
| id               | UUID          |
| business_id      | UUID          |
| location_id      | UUID nullable |
| name             | VARCHAR       |
| slug             | VARCHAR       |
| status           | ENUM          |
| rating_threshold | INTEGER       |
| review_platform  | VARCHAR       |
| settings         | JSONB         |
| created_at       | TIMESTAMP     |
| updated_at       | TIMESTAMP     |

### Example

```text
Campaign:
"Post Purchase Feedback"

Rating threshold:
4

Platform:
Google
```

---

# 13. Campaign Questions

Stores questions shown to customers.

### Table: `campaign_questions`

| Field         | Type      |
| ------------- | --------- |
| id            | UUID      |
| campaign_id   | UUID      |
| question      | TEXT      |
| question_type | ENUM      |
| options       | JSONB     |
| required      | BOOLEAN   |
| sort_order    | INTEGER   |
| created_at    | TIMESTAMP |

Possible question types:

```text
rating
text
multiple_choice
single_choice
yes_no
```

---

# 14. Feedback Submissions

Represents one customer's feedback session.

### Table: `feedback_submissions`

| Field        | Type          |
| ------------ | ------------- |
| id           | UUID          |
| business_id  | UUID          |
| campaign_id  | UUID          |
| customer_id  | UUID nullable |
| rating       | INTEGER       |
| status       | ENUM          |
| source       | VARCHAR       |
| submitted_at | TIMESTAMP     |
| created_at   | TIMESTAMP     |

Possible status:

```text
started
completed
abandoned
```

---

# 15. Feedback Answers

Stores individual answers.

### Table: `feedback_answers`

| Field                  | Type           |
| ---------------------- | -------------- |
| id                     | UUID           |
| feedback_submission_id | UUID           |
| question_id            | UUID           |
| answer_text            | TEXT nullable  |
| answer_value           | JSONB nullable |
| created_at             | TIMESTAMP      |

This separates the feedback session from individual answers.

---

# 16. Review Requests

Tracks the process of requesting a review.

### Table: `review_requests`

| Field                  | Type               |
| ---------------------- | ------------------ |
| id                     | UUID               |
| business_id            | UUID               |
| location_id            | UUID               |
| customer_id            | UUID nullable      |
| feedback_submission_id | UUID               |
| platform               | VARCHAR            |
| status                 | ENUM               |
| review_url             | TEXT               |
| requested_at           | TIMESTAMP          |
| clicked_at             | TIMESTAMP nullable |
| completed_at           | TIMESTAMP nullable |
| created_at             | TIMESTAMP          |

Possible status:

```text
pending
generated
redirected
clicked
completed
expired
```

---

# 17. Generated Reviews

Stores AI-generated review suggestions.

### Table: `generated_reviews`

| Field                  | Type          |
| ---------------------- | ------------- |
| id                     | UUID          |
| business_id            | UUID          |
| feedback_submission_id | UUID          |
| customer_id            | UUID nullable |
| provider               | VARCHAR       |
| model                  | VARCHAR       |
| prompt_version         | VARCHAR       |
| review_text            | TEXT          |
| rating                 | INTEGER       |
| status                 | ENUM          |
| token_usage            | JSONB         |
| created_at             | TIMESTAMP     |

### Important

Generated review text should be treated as a suggestion.

The system must not falsely claim that a customer wrote something they did not provide.

---

# 18. Review Submissions

Tracks the final review flow.

### Table: `review_submissions`

| Field              | Type               |
| ------------------ | ------------------ |
| id                 | UUID               |
| business_id        | UUID               |
| review_request_id  | UUID               |
| platform           | VARCHAR            |
| status             | ENUM               |
| external_review_id | VARCHAR nullable   |
| submitted_at       | TIMESTAMP nullable |
| created_at         | TIMESTAMP          |

The system should only store an external review ID when the platform provides one.

---

# 19. Google Integrations

Stores business-level Google integration information.

### Table: `google_integrations`

| Field             | Type           |
| ----------------- | -------------- |
| id                | UUID           |
| business_id       | UUID           |
| location_id       | UUID nullable  |
| google_account_id | VARCHAR        |
| access_token      | TEXT encrypted |
| refresh_token     | TEXT encrypted |
| token_expires_at  | TIMESTAMP      |
| scopes            | JSONB          |
| status            | ENUM           |
| created_at        | TIMESTAMP      |
| updated_at        | TIMESTAMP      |

### Security

Tokens must be encrypted at rest.

Never expose:

```text
access_token
refresh_token
```

through normal API responses.

---

# 20. Plans

Stores SaaS subscription plans.

### Table: `plans`

| Field         | Type      |
| ------------- | --------- |
| id            | UUID      |
| name          | VARCHAR   |
| slug          | VARCHAR   |
| description   | TEXT      |
| price_monthly | DECIMAL   |
| price_yearly  | DECIMAL   |
| currency      | VARCHAR   |
| limits        | JSONB     |
| features      | JSONB     |
| status        | ENUM      |
| created_at    | TIMESTAMP |
| updated_at    | TIMESTAMP |

Example limits:

```json
{
  "feedback_submissions": 1000,
  "ai_reviews": 500,
  "locations": 3,
  "team_members": 5
}
```

---

# 21. Subscriptions

Stores business subscriptions.

### Table: `subscriptions`

| Field                    | Type      |
| ------------------------ | --------- |
| id                       | UUID      |
| business_id              | UUID      |
| plan_id                  | UUID      |
| provider                 | VARCHAR   |
| provider_subscription_id | VARCHAR   |
| status                   | ENUM      |
| current_period_start     | TIMESTAMP |
| current_period_end       | TIMESTAMP |
| cancel_at_period_end     | BOOLEAN   |
| created_at               | TIMESTAMP |
| updated_at               | TIMESTAMP |

---

# 22. Payments

Stores payment transactions.

### Table: `payments`

| Field               | Type               |
| ------------------- | ------------------ |
| id                  | UUID               |
| business_id         | UUID               |
| subscription_id     | UUID nullable      |
| provider            | VARCHAR            |
| provider_payment_id | VARCHAR            |
| amount              | DECIMAL            |
| currency            | VARCHAR            |
| status              | ENUM               |
| metadata            | JSONB              |
| paid_at             | TIMESTAMP nullable |
| created_at          | TIMESTAMP          |

Never store raw card information.

---

# 23. Usage Records

Tracks SaaS feature consumption.

### Table: `usage_records`

| Field        | Type      |
| ------------ | --------- |
| id           | UUID      |
| business_id  | UUID      |
| metric       | VARCHAR   |
| quantity     | INTEGER   |
| period_start | DATE      |
| period_end   | DATE      |
| metadata     | JSONB     |
| created_at   | TIMESTAMP |

Examples:

```text
ai_review_generated
feedback_submission
review_request
api_request
sms_sent
email_sent
```

---

# 24. Notifications

Stores application notifications.

### Table: `notifications`

| Field       | Type               |
| ----------- | ------------------ |
| id          | UUID               |
| user_id     | UUID               |
| business_id | UUID nullable      |
| type        | VARCHAR            |
| title       | VARCHAR            |
| message     | TEXT               |
| data        | JSONB              |
| read_at     | TIMESTAMP nullable |
| created_at  | TIMESTAMP          |

---

# 25. Audit Logs

Tracks important system activity.

### Table: `audit_logs`

| Field       | Type          |
| ----------- | ------------- |
| id          | UUID          |
| business_id | UUID nullable |
| user_id     | UUID nullable |
| action      | VARCHAR       |
| entity_type | VARCHAR       |
| entity_id   | UUID nullable |
| metadata    | JSONB         |
| ip_address  | INET nullable |
| user_agent  | TEXT nullable |
| created_at  | TIMESTAMP     |

Examples:

```text
USER_LOGIN
BUSINESS_CREATED
MEMBER_INVITED
CAMPAIGN_CREATED
CAMPAIGN_UPDATED
GOOGLE_CONNECTED
GOOGLE_DISCONNECTED
SUBSCRIPTION_CHANGED
API_KEY_CREATED
```

---

# 26. API Keys

Used for future API access.

### Table: `api_keys`

| Field        | Type               |
| ------------ | ------------------ |
| id           | UUID               |
| business_id  | UUID               |
| name         | VARCHAR            |
| key_prefix   | VARCHAR            |
| key_hash     | TEXT               |
| last_used_at | TIMESTAMP nullable |
| expires_at   | TIMESTAMP nullable |
| revoked_at   | TIMESTAMP nullable |
| created_at   | TIMESTAMP          |

The actual API key must never be stored in plaintext.

Only a secure hash should be stored.

---

# 27. Webhook Events

Stores incoming webhook events for idempotency and debugging.

### Table: `webhook_events`

| Field        | Type               |
| ------------ | ------------------ |
| id           | UUID               |
| provider     | VARCHAR            |
| event_id     | VARCHAR            |
| event_type   | VARCHAR            |
| payload      | JSONB              |
| status       | ENUM               |
| processed_at | TIMESTAMP nullable |
| created_at   | TIMESTAMP          |

Constraint:

```text
UNIQUE(provider, event_id)
```

This prevents duplicate webhook processing.

---

# 28. Relationships

Core relationship structure:

```text
users
  │
  ├── accounts
  ├── sessions
  │
  └── business_members
          │
          ▼
      businesses
          │
          ├── business_locations
          │
          ├── customers
          │
          ├── campaigns
          │      │
          │      └── campaign_questions
          │
          ├── feedback_submissions
          │      │
          │      └── feedback_answers
          │
          ├── review_requests
          │      │
          │      └── generated_reviews
          │
          ├── google_integrations
          │
          ├── subscriptions
          │      │
          │      └── plans
          │
          ├── payments
          ├── usage_records
          ├── audit_logs
          └── api_keys
```

---

# 29. Foreign Key Rules

Foreign keys should be enforced at the database level.

Recommended behavior:

```text
User deletion
    ↓
Soft delete preferred

Business deletion
    ↓
Soft delete
    ↓
Retain financial/audit records

Campaign deletion
    ↓
Restrict if historical feedback exists

Location deletion
    ↓
Restrict if historical records exist

Subscription deletion
    ↓
Never hard delete financial history
```

Historical records should generally be preserved.

---

# 30. UUID Strategy

Use UUIDs for primary keys.

Example:

```text
id UUID PRIMARY KEY
```

UUIDs make IDs difficult to guess and are suitable for distributed SaaS systems.

Prefer UUIDv7 where supported because it provides better index locality than fully random UUIDv4.

---

# 31. Timestamps

All database timestamps should be stored in UTC.

Use:

```text
TIMESTAMP WITH TIME ZONE
```

Application-level timezone conversion should happen when displaying dates to users.

Business timezone should be stored separately in:

```text
businesses.timezone
```

---

# 32. Soft Deletion

Important business records should use soft deletion rather than immediate hard deletion.

Example:

```text
deleted_at TIMESTAMP NULL
```

Recommended for:

```text
users
businesses
business_members
customers
campaigns
locations
```

Financial and audit records should generally never be physically deleted automatically.

---

# 33. Indexing Strategy

Important indexes should include:

```text
users(email)

businesses(slug)

business_members(business_id)
business_members(user_id)

business_locations(business_id)

customers(business_id)
customers(email)
customers(phone)

campaigns(business_id)
campaigns(slug)

feedback_submissions(business_id)
feedback_submissions(campaign_id)
feedback_submissions(created_at)

review_requests(business_id)
review_requests(status)

generated_reviews(business_id)
generated_reviews(created_at)

subscriptions(business_id)
subscriptions(status)

payments(business_id)
payments(provider_payment_id)

usage_records(business_id, period_start, period_end)

audit_logs(business_id, created_at)

webhook_events(provider, event_id)
```

Indexes should be added based on actual query patterns as the platform grows.

---

# 34. Tenant Isolation

Every tenant-scoped query must verify the current business context.

Example:

```text
SELECT *
FROM campaigns
WHERE id = :campaignId
AND business_id = :currentBusinessId;
```

Never fetch a business resource using only:

```text
WHERE id = :id
```

without validating tenant ownership.

This is one of the most important security requirements in the application.

---

# 35. Prisma Schema Strategy

Prisma should represent database relationships explicitly.

Conceptual example:

```text
User
 └── BusinessMember
       └── Business
             ├── Location
             ├── Campaign
             ├── Customer
             ├── FeedbackSubmission
             ├── ReviewRequest
             └── Subscription
```

The Prisma schema should use:

* Explicit relations
* Enums
* Unique constraints
* Composite indexes
* Foreign keys
* Cascading rules only where safe

---

# 36. JSONB Usage

PostgreSQL `JSONB` should be used only for flexible data.

Good candidates:

```text
campaign.settings
campaign_questions.options
customers.metadata
feedback_answers.answer_value
generated_reviews.token_usage
plans.features
plans.limits
payments.metadata
usage_records.metadata
audit_logs.metadata
```

Do not put core relational data into JSONB unnecessarily.

---

# 37. Data Retention

Retention policies should be configurable.

Suggested initial approach:

```text
Audit logs:
12–24 months+

Payment records:
According to applicable financial/legal requirements

Customer data:
Business-controlled retention

Feedback:
Retain while business account is active

Generated reviews:
Retain while business account is active

Expired sessions:
Delete automatically

Old webhook events:
Delete/archive after retention period
```

The final retention period should be aligned with the application's privacy policy and applicable law.

---

# 38. Backup Strategy

Production PostgreSQL must have automated backups.

Minimum requirements:

```text
Daily automated backup
Point-in-time recovery where supported
Backup encryption
Off-server backup storage
Backup monitoring
Periodic restore testing
```

A backup that has never been restored/tested should not be considered reliable.

---

# 39. Migration Strategy

All schema changes must be performed through Prisma migrations.

Example workflow:

```text
Modify Prisma schema
        ↓
Create migration
        ↓
Test migration locally
        ↓
Run migration in staging
        ↓
Validate application
        ↓
Run production migration
```

Never manually modify production tables unless absolutely necessary and documented.

---

# 40. Environment Separation

Use separate databases or database environments for:

```text
Development
Staging
Production
```

Production credentials must never be committed to GitHub.

Example environment variables:

```text
DATABASE_URL
DIRECT_DATABASE_URL
```

Secrets should be stored using the hosting platform's secure environment-variable system.

---

# 41. Transaction Strategy

Use database transactions for operations that must succeed or fail together.

Example:

```text
Create feedback submission
        +
Create feedback answers
        +
Create review request
```

These should be handled atomically when appropriate.

If one critical operation fails, the transaction should roll back.

---

# 42. Idempotency

Payment webhooks, external integrations, and important API operations must support idempotency.

Examples:

```text
Payment webhook
Google webhook
Review request creation
Subscription update
```

Use unique external event IDs wherever possible.

---

# 43. Analytics Data

Initially, analytics can be generated from transactional tables.

Example metrics:

```text
Total feedback submissions
Average rating
Positive feedback percentage
Review requests
Review link clicks
Generated reviews
Conversion rate
AI usage
```

As data volume increases, analytics can be moved to dedicated aggregation tables or an analytics database.

---

# 44. Database Security Checklist

```text
[ ] PostgreSQL authentication enabled
[ ] Strong database credentials
[ ] Production database not publicly exposed unnecessarily
[ ] SSL/TLS database connection
[ ] OAuth tokens encrypted
[ ] API keys hashed
[ ] Tenant isolation implemented
[ ] Foreign keys enabled
[ ] Sensitive fields protected
[ ] Database backups enabled
[ ] Point-in-time recovery configured where possible
[ ] Backup restoration tested
[ ] Production credentials excluded from Git
[ ] Database migrations version controlled
[ ] Audit logging enabled
```

---

# 45. Initial MVP Database Scope

For the first MVP, prioritize:

```text
users
accounts
sessions

businesses
business_members
business_locations

customers

campaigns
campaign_questions

feedback_submissions
feedback_answers

review_requests
generated_reviews

google_integrations

plans
subscriptions
payments

usage_records

audit_logs
```

The following can be introduced later if not required by the initial MVP:

```text
api_keys
webhook_events
notifications
advanced analytics tables
```

---

# 46. Scalability Strategy

The database architecture should support future growth without requiring a complete rewrite.

Future optimizations may include:

```text
Read replicas
Connection pooling
Redis caching
Database partitioning
Dedicated analytics database
Background job processing
Materialized views
Archival storage
```

These should only be introduced when actual scale requires them.

---

# 47. Database Design Principles

The implementation must follow these principles:

1. PostgreSQL is the source of truth.
2. Prisma is the primary ORM.
3. Every tenant-owned record must be tenant-scoped.
4. Foreign keys must enforce relationships.
5. Sensitive credentials must be encrypted or hashed.
6. Financial records must be preserved.
7. Audit logs must be append-oriented.
8. UTC must be used for stored timestamps.
9. Production schema changes must use migrations.
10. Backups must be automated and tested.
11. Database queries must be optimized using appropriate indexes.
12. JSONB must not replace normal relational modeling.
13. Customer data collection must follow data-minimization principles.
14. The database architecture must remain compatible with future SaaS scaling.

---

# 48. Final Database Architecture

```text
                         REVIEW ASSISTANT
                               │
                         PostgreSQL DB
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
 Authentication            SaaS Core              Platform
        │                      │                      │
   Users/Accounts          Businesses              Plans
   Sessions                Members                 Subscriptions
                           Locations               Payments
                           Customers               Usage
                           Campaigns               Audit Logs
                           Feedback
                           Reviews
                           Google Integration
```

This architecture provides the foundation for a secure, scalable, multi-tenant Review Assistant SaaS while keeping the MVP implementation practical and extensible.
