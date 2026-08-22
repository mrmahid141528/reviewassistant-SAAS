# SMART REVIEW ASSISTANT — MASTER UI/UX DESIGN SYSTEM
## File: `DESIGN_SYSTEM.md`

> **Purpose:** This document is the single source of truth for the visual design, UI/UX, interaction, layout, component, icon, animation, responsive and accessibility rules of the Smart Review Assistant SaaS.
>
> **MANDATORY RULE:** Before designing, coding, modifying, or adding **any page, section, component, modal, form, dashboard, button, icon, animation, or responsive layout**, the developer/AI must read this file and follow it.
>
> This product must look like a **professionally designed SaaS product**, not a generic AI/vibe-coded website.

---

# 1. DESIGN NORTH STAR

Smart Review Assistant should communicate four things immediately:

1. **Trust** — businesses are comfortable connecting their customer-review workflow.
2. **Simplicity** — customers can create a review without effort.
3. **Intelligence** — AI helps turn customer experiences into natural reviews.
4. **Business value** — more genuine customer feedback and easier review collection.

### Design personality

**Premium + trustworthy + modern + friendly + efficient**

The product should feel closer to a polished SaaS product such as Stripe/Linear/Notion-style product quality than to a template website.

### Avoid

- Generic AI gradients everywhere
- Excessive glassmorphism
- Random floating blobs
- Excessive rounded cards
- Huge meaningless statistics
- Excessive animations
- Emoji-heavy UI
- Random icon styles
- Inconsistent spacing
- Huge text with little information
- “Vibe coding” layouts where every section looks independently designed
- Unnecessary dark sections
- Decorative elements that compete with the CTA

---

# 2. PRODUCT EXPERIENCE ARCHITECTURE

The product has three primary visual experiences:

## A. Public / Marketing Website

Audience:
- Business owners
- Decision makers
- Potential customers
- Visitors coming from search/social/referrals

Primary objective:
**Convert visitor → business signup/demo/trial**

Core pages:
- Home
- Features
- How It Works
- Pricing
- Use Cases
- FAQ
- Contact
- Login
- Signup

---

## B. Business Dashboard

Audience:
- Business owner
- Staff/manager

Primary objective:
**Help a business operate and measure its review-generation workflow.**

Core areas:
- Overview
- Review Generator
- Review Requests
- QR / Review Link
- Customers
- Analytics
- Reviews
- Business Profile
- Team
- Subscription/Billing
- Settings
- Help

---

## C. Super Admin Dashboard

Audience:
- Platform owner/admin

Primary objective:
**Operate, monitor and control the entire SaaS.**

Core areas:
- Overview
- Businesses
- Users
- Reviews
- Review Generation
- AI/API Usage
- Subscriptions
- Payments
- Coupons
- Plans
- Analytics
- Support
- System Logs
- Settings

---

# 3. DESIGN TOKEN SYSTEM

Never hard-code random colors in individual pages.

Use centralized design tokens.

## 3.1 Primary palette

```text
Primary Indigo:       #635BFF
Primary Dark:         #4F46E5
Primary Soft:         #EEF2FF

Google Blue:          #4285F4
Google Blue Soft:     #EFF6FF

Success:              #16A34A
Success Soft:         #F0FDF4

Warning:              #F59E0B
Warning Soft:         #FFFBEB

Danger:               #DC2626
Danger Soft:          #FEF2F2

Info:                 #0EA5E9
Info Soft:            #F0F9FF

Background:           #F8FAFC
Surface:              #FFFFFF
Surface Secondary:    #F1F5F9

Text Primary:         #111827
Text Secondary:       #64748B
Text Muted:            #94A3B8

Border:               #E2E8F0
Border Strong:        #CBD5E1
```

## 3.2 Dark mode

Dark mode is supported for the application/dashboard.

```text
Background:           #0B1120
Surface:              #111827
Surface Elevated:     #172033
Text Primary:         #F8FAFC
Text Secondary:       #CBD5E1
Text Muted:            #94A3B8
Border:               #1E293B
Primary:              #7C73FF
```

Marketing website may remain light-first unless a future requirement explicitly adds a full dark theme.

---

# 4. COLOR PSYCHOLOGY

## Indigo / Purple

Represents:
- AI
- intelligence
- innovation
- premium technology

Use for:
- Primary CTA
- AI states
- active navigation
- important actions
- brand highlights

## Google Blue

Represents:
- trust
- Google ecosystem
- external review action

Use only where contextually appropriate:
- Google Review CTA
- Google-related integrations
- Google platform indicators

## Green

Represents:
- completed
- successful
- healthy
- verified

Use for:
- success states
- completed steps
- posted review
- active status
- positive metrics

## Red

Use sparingly:
- destructive actions
- errors
- failed payments
- critical warnings

Never use red as the primary brand color.

---

# 5. TYPOGRAPHY

## Primary font

**Inter**

Fallback:
```text
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

## Hierarchy

### Display
- Desktop: 56–64px
- Weight: 700–800
- Line-height: 1.05–1.1

### H1
- Desktop: 44–52px
- Mobile: 34–40px
- Weight: 700–800

### H2
- 32–40px
- Weight: 700

### H3
- 22–28px
- Weight: 650–700

### Body Large
- 18px
- Line-height: 1.6

### Body
- 15–16px
- Line-height: 1.5–1.6

### Small
- 13–14px

### Caption
- 12px

Never use more than 3–4 font weights in one interface.

---

# 6. SPACING SYSTEM

Use an 8px base spacing system.

```text
4px   — micro
8px   — tight
12px  — small
16px  — default
24px  — medium
32px  — large
40px  — section-small
48px  — section
64px  — section-large
80px  — major section
96px  — hero/major separation
```

Do not invent random spacing values unless a component requires optical correction.

---

# 7. CONTAINER SYSTEM

Marketing:

```text
Max width: 1200–1280px
Horizontal padding:
Desktop: 32px
Tablet: 24px
Mobile: 16–20px
```

Dashboard:

```text
Content max width: 1440px
Desktop padding: 32px
Tablet: 24px
Mobile: 16px
```

Content should never touch viewport edges.

---

# 8. BORDER RADIUS

Use a controlled radius system:

```text
4px   — tiny elements
8px   — inputs/small controls
10px  — buttons
12px  — standard cards
16px  — feature cards
20px  — hero/demo cards
24px  — large feature containers
```

Do not make every element `rounded-full`.

---

# 9. SHADOW SYSTEM

Prefer borders over heavy shadows.

### Small
```text
0 1px 2px rgba(15, 23, 42, 0.05)
```

### Card
```text
0 4px 16px rgba(15, 23, 42, 0.06)
```

### Elevated
```text
0 12px 32px rgba(15, 23, 42, 0.10)
```

### Rule

If a card already has a visible border, use a very subtle shadow.

---

# 10. ICON SYSTEM

## Primary icon library

Use **Lucide Icons** consistently.

Do not mix:
- Lucide
- Font Awesome
- random SVG icons
- emoji
- different icon packs

unless a specific brand logo requires its own official asset.

## Icon sizes

```text
12px — inline metadata
14px — compact UI
16px — standard controls
18px — buttons
20px — navigation
24px — feature icons
28–32px — hero/feature illustration
```

## Stroke

Default:
```text
1.8–2px
```

## Icon containers

Feature icon:

```text
40x40 or 44x44
radius: 10–12px
background: primary-soft
```

Dashboard navigation:
- no unnecessary container
- 18–20px icon
- icon aligned perfectly with text

## Icon meaning

Use semantically correct icons:

```text
Dashboard       LayoutDashboard
Reviews         MessageSquareQuote
Generate        Sparkles
Analytics       ChartNoAxesCombined
Customers       Users
QR Code         QrCode
Business        Store
Team            UserRoundCog
Billing         CreditCard
Settings        Settings
Help            CircleHelp
Search          Search
Notifications   Bell
Success         CircleCheck
Warning         TriangleAlert
Error           CircleX
Delete          Trash2
Edit            Pencil
Add             Plus
Export          Download
Filter          SlidersHorizontal
```

Do not use an icon simply because it visually looks nice.

---

# 11. BUTTON SYSTEM

Buttons must communicate hierarchy.

## Primary

Purpose:
- main conversion
- important action

Style:
- Indigo background
- White text
- 10–12px radius
- medium/bold font
- subtle hover elevation

Example:
**Generate My Review**

## Secondary

White/transparent surface + border.

Purpose:
- alternative action
- navigation

Example:
**View Demo**

## Tertiary

Text button.

Purpose:
- low-priority actions

Example:
**Learn more →**

## Destructive

Red only for irreversible actions.

Example:
**Delete Business**

## Google CTA

Google-related CTA uses Google Blue only where appropriate.

Example:
**Open Google Review**

Do not turn every button into a gradient.

---

# 12. BUTTON DIMENSIONS

Desktop:

```text
Height: 44–48px
Horizontal padding: 16–20px
```

Large CTA:

```text
Height: 52–56px
```

Mobile:

```text
Minimum height: 44px
Preferred: 48–52px
```

Buttons must have clear hover, active, focus and disabled states.

---

# 13. INPUT SYSTEM

Inputs:

```text
Height: 44–48px
Border: 1px solid #E2E8F0
Radius: 10px
Padding: 12–14px
```

Focus:

```text
border: primary
subtle focus ring
```

Never rely only on border color to communicate errors.

Error:
- icon
- border
- error text

---

# 14. CARD SYSTEM

Cards should have a reason to exist.

Standard:

```text
Background: white
Border: #E2E8F0
Radius: 16px
Padding: 20–24px
```

Avoid nested cards inside cards unless hierarchy genuinely requires it.

---

# 15. PUBLIC LANDING PAGE

## Navbar

Desktop:

```text
[Logo]   Product   Features   How It Works   Pricing
                              [Login] [Get Started]
```

Logo left.

Navigation center/left.

Actions right.

Sticky on scroll with subtle background transition.

Mobile:

```text
[Logo]                         [Menu]
```

Do not squeeze desktop navigation into mobile.

---

# 16. HERO SECTION

Layout:

```text
Left: 50%
Right: 50%
```

Left:

- Eyebrow
- H1
- supporting paragraph
- Primary CTA
- Secondary CTA
- small trust statement

Right:

Interactive Review Generator preview.

Example:

```text
AI REVIEW ASSISTANT
────────────────────────
How was your experience?

★★★★★

What did you like?

[ Friendly Staff ]
[ Fast Service ]
[ Great Quality ]

        ✨ Generate Review
```

The product UI itself should sell the product.

---

# 17. HERO PSYCHOLOGY

Headline should communicate outcome, not technology.

Bad:
> AI-Powered Review Generation SaaS

Good:
> Turn Happy Customers Into Great Google Reviews

CTA should describe the result:

> Generate My Review

not:

> Get Started

---

# 18. SOCIAL PROOF SECTION

Place immediately below hero.

Possible structure:

```text
Trusted by businesses that care about customer feedback

[Business Logo] [Business Logo] [Business Logo] ...
```

Only use real businesses/logos with permission.

If real data is unavailable, use benefit statements instead of fake numbers.

---

# 19. HOW IT WORKS

Three steps.

```text
01
Answer a few questions

02
AI creates your review

03
Post it on Google
```

Use:
- number
- icon
- short title
- one sentence

Do not create large paragraphs.

---

# 20. FEATURE SECTION

Use 6 core features maximum per section.

Suggested:

1. AI Review Generator
2. Smart Questions
3. Google Review Flow
4. QR / Review Link
5. Analytics
6. Business Management

Feature card:

```text
[Icon]

Feature Name

One or two lines explaining
the business benefit.

Learn more →
```

---

# 21. INTERACTIVE PRODUCT DEMO

A major landing-page section should show the real product workflow.

Use tabs:

```text
Generate Review
        |
Review Ready
        |
Google
```

The animation should simulate the workflow.

This section replaces excessive marketing copy.

---

# 22. USE CASES

Use cards for:

- Restaurants
- Salons
- Clinics
- Hotels
- Local Shops
- Internet Cafes
- Service Businesses
- Agencies

Each card:
- icon
- business type
- one benefit

---

# 23. PRICING

Three or four plans maximum.

Recommended visual hierarchy:

```text
Starter
    |
Growth ⭐ Most Popular
    |
Pro
```

Middle plan may be slightly emphasized.

Do not use manipulative fake countdown timers.

Pricing should clearly explain:
- review limits
- AI usage
- businesses
- team members
- analytics
- support

---

# 24. FAQ

Use accordion.

Only one or two open at a time.

Questions should remove purchase objections:

- How does it work?
- Does it connect to Google?
- Does the customer need an account?
- Can I customize the questions?
- Can I cancel?
- What happens if I exceed my plan?
- Is the review written by AI?
- Can I use QR codes?

---

# 25. FINAL CTA

Large but simple.

```text
Ready to collect better customer reviews?

Create your first review experience today.

[ ✨ Generate Your First Review ]
```

Do not overload this section with cards.

---

# 26. FOOTER

Four-column desktop layout:

```text
Brand
Short description

Product
Features
Pricing
How It Works

Company
About
Contact
Blog

Legal
Privacy
Terms
Refund Policy
```

Bottom:

```text
© Smart Review Assistant
```

---

# 27. BUSINESS DASHBOARD

## Application shell

Desktop:

```text
┌──────────────┬───────────────────────────────────┐
│              │ Topbar                            │
│   Sidebar    ├───────────────────────────────────┤
│              │                                   │
│              │ Main Content                      │
│              │                                   │
└──────────────┴───────────────────────────────────┘
```

Sidebar width:

```text
240–260px
```

Collapsed:

```text
72–80px
```

---

# 28. BUSINESS SIDEBAR

Order:

```text
Logo

Overview

Review Assistant
  Generate Review
  Review Requests
  QR & Review Link

Reviews

Customers

Analytics

Business Profile

Team

Billing

Settings

Help
```

Primary navigation should be grouped logically.

Do not put every page at the same hierarchy level.

---

# 29. BUSINESS TOPBAR

Left:
- breadcrumb/page title

Right:
- search if needed
- notifications
- help
- business selector
- avatar

Topbar height:

```text
64–72px
```

---

# 30. BUSINESS DASHBOARD HOME

Top:

```text
Good morning, [Business Name] 👋

Here's how your review activity is performing.
```

Then KPI cards:

```text
Reviews Generated
Reviews Posted
Average Rating
Conversion Rate
```

Each KPI card should contain:

- label
- large number
- trend
- small icon

Do not make every KPI visually identical if their importance differs.

---

# 31. REVIEW GENERATOR DASHBOARD

This is the core product feature.

Layout:

```text
Page Header

[Business Selector]

┌──────────────────────┬──────────────────────────┐
│ Question Builder     │ Live Review Preview      │
│                      │                          │
│ Step 1               │ ⭐⭐⭐⭐⭐                  │
│ Step 2               │                          │
│ Step 3               │ Generated review         │
│                      │                          │
│ [Generate]           │ [Copy] [Open Google]     │
└──────────────────────┴──────────────────────────┘
```

Desktop: two-column.

Mobile: stacked.

---

# 32. CUSTOMER REVIEW FLOW

This is not a dashboard.

It should feel like a guided assistant.

Top:

```text
Logo
Step 2 of 4
```

Center:

```text
How was your experience?
```

Large answer options.

Bottom:

```text
Back                         Continue →
```

On mobile, keep navigation at the bottom.

Avoid unnecessary sidebars.

---

# 33. REVIEW RESULT SCREEN

Hierarchy:

```text
✨ Review Ready

⭐⭐⭐⭐⭐

[Generated Review]

[ Edit Review ]

[ Copy Review ]

──────────────────

Ready to share?

[ ⭐ Open Google Review ]
```

The Google CTA should be visually dominant.

---

# 34. QR / REVIEW LINK PAGE

Purpose:
Allow business to distribute the review experience.

Main card:

```text
Your Review QR Code

[ LARGE QR ]

Scan to try the experience

[ Download QR ]
[ Copy Link ]
```

Secondary:
- print sizes
- share options
- link status

Do not crowd the QR code with unrelated content.

---

# 35. ANALYTICS PAGE

Use:

```text
KPI cards
+
line/bar chart
+
recent activity
+
breakdown
```

Suggested metrics:

- Reviews Generated
- Reviews Posted
- Completion Rate
- Average Rating
- Conversion Rate
- AI Generations Used

Charts should be simple.

Never use charts just for decoration.

---

# 36. REVIEWS PAGE

Use a table desktop.

Columns:

```text
Customer
Rating
Review
Status
Created
Actions
```

Mobile transforms into cards.

Filters:

```text
Search
Rating
Status
Date
```

Actions:

```text
View
Copy
Delete
```

---

# 37. CUSTOMERS PAGE

Table:

```text
Customer
Contact
Reviews
Last Activity
Status
```

Avoid exposing unnecessary customer data.

Use privacy-first UI.

---

# 38. BUSINESS PROFILE

Sections:

```text
Business Information
Google Review Settings
Branding
Review Questions
Notifications
```

Use section cards rather than one giant form.

---

# 39. TEAM PAGE

Show:

```text
Member
Role
Status
Last Active
Actions
```

Primary button:

**+ Invite Member**

Roles should be visually represented with badges.

---

# 40. BILLING PAGE

Top:

```text
Current Plan
₹X / month
Next billing date
```

Then:

```text
Usage
AI Generations
Reviews
Team Members
```

Then:

```text
Upgrade Plan
Manage Billing
Invoices
```

Make usage understandable before asking for upgrade.

---

# 41. SUPER ADMIN DASHBOARD

Super Admin must visually feel more operational than the business dashboard.

Sidebar:

```text
Overview

Businesses
Users

Reviews
Review Requests

AI Usage

Subscriptions
Payments
Plans
Coupons

Analytics

Support

System Logs

Settings
```

Use a slightly denser information layout.

---

# 42. SUPER ADMIN OVERVIEW

Top KPIs:

```text
Total Businesses
Active Businesses
MRR
Total Reviews
AI Usage
Failed Payments
```

Second row:

```text
Revenue Chart
Business Growth Chart
```

Third row:

```text
Recent Businesses
Recent Payments
System Alerts
```

---

# 43. SUPER ADMIN TABLE DESIGN

Desktop table:

- compact but readable
- sticky header when appropriate
- pagination
- search
- filters
- column visibility where useful

Row actions should be inside a `...` menu rather than many visible buttons.

---

# 44. ADMIN BUSINESS DETAIL

Header:

```text
Business Name
Status Badge

[Impersonate/View]
[Edit]
[More]
```

Tabs:

```text
Overview
Reviews
Users
Usage
Subscription
Activity
```

This prevents an extremely long page.

---

# 45. ADMIN AI USAGE

Show:

```text
Total AI Generations
Tokens/usage if tracked
Estimated API Cost
Usage by Business
Usage by Date
```

Include warning thresholds.

Example:

```text
82% of monthly AI budget used
```

This is important for controlling SaaS margins.

---

# 46. STATUS BADGES

Use consistent semantic colors.

```text
Active       Green
Pending      Amber
Paused       Gray
Cancelled    Red
Trial        Blue
Expired      Red
Processing   Indigo
```

Badge style:

```text
12–13px
medium weight
soft background
pill radius
```

---

# 47. MODALS

Use modals only for focused decisions.

Good:

- Delete confirmation
- Invite user
- Upgrade confirmation
- Edit small settings

Bad:

- Long forms
- Full dashboards
- Multi-step complex workflows

Modal:

```text
Title
Short explanation

Content

[Cancel] [Primary Action]
```

Destructive modal must clearly explain consequence.

---

# 48. TOAST NOTIFICATIONS

Position:

```text
Desktop: bottom-right
Mobile: bottom-center
```

Duration:
- success: 3–4 sec
- info: 4 sec
- error: remain longer if action is required

Examples:

```text
✓ Review copied
✓ QR code downloaded
✓ Business profile updated
```

Do not use toasts for critical information that users must read.

---

# 49. LOADING STATES

Never show a blank page.

Use:

- skeleton loaders
- progress indicators
- contextual loading messages

Example AI:

```text
✨ Creating your personalized review...
```

Example dashboard:

Use skeleton cards matching final dimensions.

---

# 50. EMPTY STATES

Every data page must have an intentional empty state.

Structure:

```text
[Relevant icon]

No reviews yet

Once customers start using your
review link, their activity will appear here.

[Create Review Link]
```

Empty state must always answer:

**What happened + What can I do next?**

---

# 51. ERROR STATES

Never only show:

> Something went wrong.

Instead:

```text
We couldn't generate your review.

Please try again.

[Try Again]
```

If actionable:
- explain
- provide recovery action
- provide support route if needed

---

# 52. ANIMATION SYSTEM

Animation is for feedback and hierarchy, not decoration.

## Timing

```text
Micro interaction: 120–180ms
Standard transition: 180–250ms
Page/section reveal: 300–500ms
Major state transition: 400–700ms
```

Use easing similar to:

```text
ease-out
cubic-bezier(0.16, 1, 0.3, 1)
```

---

# 53. APPROVED ANIMATIONS

Use:

- fade
- slide-up
- subtle scale
- progress animation
- button hover
- card hover
- skeleton shimmer
- review text reveal
- number count-up for meaningful KPI values
- sidebar transition

Avoid:
- constant floating
- spinning decorative objects
- excessive parallax
- bouncing buttons
- infinite glowing borders
- animation on every scroll element

---

# 54. LANDING PAGE SCROLL ANIMATION

Recommended:

Hero:
- subtle entrance

How it works:
- cards reveal sequentially

Features:
- fade/slide

Product demo:
- interactive workflow

Testimonials:
- subtle carousel if needed

Final CTA:
- simple reveal

Do not animate everything simultaneously.

---

# 55. MICROCOPY PSYCHOLOGY

Use outcome-oriented copy.

Bad:

> Submit

Better:

> Generate My Review

Bad:

> Continue

Better:

> Continue to Review

Bad:

> Create

Better:

> Create Review Link

Bad:

> Upgrade

Better:

> Upgrade to Growth

Buttons should tell users what happens next.

---

# 56. CUSTOMER FLOW PSYCHOLOGY

Customer-facing flow must follow:

```text
LOW EFFORT
   ↓
SMALL DECISION
   ↓
PROGRESS FEEDBACK
   ↓
AI MAGIC
   ↓
VISIBLE RESULT
   ↓
ONE CLEAR CTA
```

Never ask for unnecessary information.

---

# 57. BUSINESS OWNER PSYCHOLOGY

Dashboard should answer these questions immediately:

1. How am I doing?
2. How many reviews am I getting?
3. Are customers completing the flow?
4. What should I do next?
5. Am I using my plan efficiently?

The dashboard is not a place to display every database field.

---

# 58. SUPER ADMIN PSYCHOLOGY

Admin should prioritize:

1. Revenue
2. Growth
3. Active businesses
4. System health
5. AI/API cost
6. Payment failures
7. Support issues

Critical problems must be visually prioritized.

---

# 59. RESPONSIVE BREAKPOINTS

Use:

```text
Mobile: < 640px
Tablet: 640–1024px
Desktop: 1024–1440px
Large Desktop: > 1440px
```

Do not simply shrink desktop.

At mobile:
- sidebar becomes drawer
- tables become cards
- two-column layouts stack
- buttons may become full width
- navigation simplifies
- modal widths become near-full screen
- charts become horizontally scrollable or simplified

---

# 60. MOBILE PRIORITY

Customer review generation is **mobile-first**.

Priority:

```text
Question
Answer
Continue
Progress
```

Everything else is secondary.

Business dashboard is desktop-first but must remain highly usable on mobile.

---

# 61. ACCESSIBILITY

Minimum requirements:

- WCAG-aware contrast
- keyboard navigation
- visible focus states
- labels for inputs
- accessible buttons
- icons with accessible labels
- no color-only status communication
- reduced-motion support
- readable font sizes

Never hide critical information behind hover only.

---

# 62. COMPONENT REUSE RULE

Before creating a new UI component, check whether an existing component can be reused.

Shared components should include:

```text
Button
Input
Select
Checkbox
Radio
Badge
Card
Modal
Dialog
Toast
Tooltip
Dropdown
Tabs
Table
Pagination
Breadcrumb
Sidebar
Topbar
EmptyState
ErrorState
LoadingState
StatCard
ChartCard
ReviewCard
```

If a new component is necessary, add it to the design system rather than creating a one-page-only visual style.

---

# 63. DESIGN CONSISTENCY RULE

A user should be able to move:

```text
Landing → Login → Business Dashboard
```

without feeling that they entered three different products.

Maintain:

- typography
- color language
- radius
- button behavior
- icon language
- spacing
- animation philosophy

---

# 64. PAGE DESIGN PROCESS — MANDATORY

Before building any page:

### Step 1
Read `DESIGN_SYSTEM.md`.

### Step 2
Identify page type:

```text
Marketing
Customer Flow
Business Dashboard
Super Admin
Authentication
Utility
```

### Step 3
Identify the primary user goal.

### Step 4
Identify the primary CTA.

### Step 5
Choose an existing layout/component pattern.

### Step 6
Build desktop hierarchy.

### Step 7
Build mobile hierarchy separately.

### Step 8
Add interaction states.

### Step 9
Add loading/empty/error states.

### Step 10
Review visual consistency.

---

# 65. PAGE QUALITY CHECK

Before considering a page complete, verify:

```text
[ ] Correct typography
[ ] Correct colors
[ ] Correct spacing
[ ] Correct icon system
[ ] Correct button hierarchy
[ ] Correct component reuse
[ ] Clear primary CTA
[ ] Responsive mobile layout
[ ] Hover states
[ ] Focus states
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Accessible labels
[ ] No unnecessary animation
[ ] No random gradients
[ ] No inconsistent radius
[ ] No random icon library
[ ] No fake statistics
[ ] No unnecessary cards
```

---

# 66. AI / VIBE CODING SAFETY RULE

When AI generates a page, it must NOT invent a new design language.

Before generating UI, AI must internally map:

```text
Page
→ Layout
→ Existing Components
→ Design Tokens
→ Interaction Pattern
→ Responsive Pattern
```

If a requirement is not specified here:

1. Prefer an existing pattern.
2. Prefer simplicity.
3. Preserve consistency.
4. Do not invent decorative UI without a functional reason.

---

# 67. DO NOT DO THIS

Never produce a page containing:

- random purple gradients behind every section
- 10+ floating glass cards
- huge glowing blobs
- excessive rounded pills
- emoji as primary icons
- giant “AI” text everywhere
- random dashboard charts
- meaningless metrics
- excessive shadows
- multiple competing CTAs
- inconsistent card sizes
- random animations
- arbitrary colors
- random typography
- generic “Welcome to our platform” copy
- unnecessary sidebar items
- dense forms without progressive disclosure

---

# 68. PROFESSIONAL DESIGN PRINCIPLE

Every element must answer at least one question:

**Why is this here?**

It should provide one of:

- information
- navigation
- action
- feedback
- trust
- hierarchy
- context

If it does none of these, remove it.

---

# 69. VISUAL HIERARCHY RULE

Every page must have:

```text
Primary attention
      ↓
Secondary attention
      ↓
Supporting information
      ↓
Low-priority actions
```

A page must never have five “primary” buttons.

There can be only one dominant action per major section.

---

# 70. FINAL PRODUCT DESIGN FORMULA

Smart Review Assistant should visually communicate:

```text
TRUST
  +
SIMPLICITY
  +
AI INTELLIGENCE
  +
BUSINESS VALUE
  =
PREMIUM REVIEW SAAS
```

The final interface should feel:

**Clean enough for a customer  
Powerful enough for a business owner  
Operational enough for a super admin  
Premium enough to charge for**

---

# 71. MANDATORY INSTRUCTION FOR ALL FUTURE PAGES

Every future page request for Smart Review Assistant must follow this document.

### Required workflow:

```text
1. READ DESIGN_SYSTEM.md
2. Identify user type
3. Identify page purpose
4. Identify primary CTA
5. Reuse design tokens
6. Reuse components
7. Follow spacing/radius/typography
8. Follow icon system
9. Add interaction states
10. Add responsive behavior
11. Add loading/empty/error states
12. Perform final design consistency check
```

### Priority order when making design decisions:

```text
1. Usability
2. Clarity
3. Conversion / task completion
4. Consistency
5. Accessibility
6. Performance
7. Visual polish
8. Decoration
```

**Decoration is always the lowest priority.**

---

# 72. ONE-LINE DESIGN RULE

> **Do not design each page separately. Design Smart Review Assistant as one complete product system.**
