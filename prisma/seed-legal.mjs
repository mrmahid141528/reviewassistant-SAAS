import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pages = [
    {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        status: 'published',
        content: `
# Privacy Policy
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

Welcome to **[CONFIGURABLE: BUSINESS_NAME]** ("we", "our", or "us"). We are committed to protecting your personal data and respecting your privacy in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000 of India.

This Privacy Policy explains how we collect, use, and process your data when you use the Smart Review Assistant platform as a Business customer, or when your end-customers interact with your Google Review generation flows across our systems.

## 1. Information We Collect

### A. Information Provided by Businesses (Our Customers)
When you register for a subscription, we collect information including your Full Name, Email Address, Business Name, Business Address, Contact Number, and Payment details (processed securely via our RBI-authorized payment aggregator, Razorpay). We also collect authentication tokens for your Google Business Profile explicitly when you authorize the connection, which are securely stored and utilized solely for generating review links and campaign workflows.

### B. Information Collected from End Users (Your Customers)
If you enable specific QR campaigns that request feedback, we may collect the end user's Name, Phone Number, and Email Address, along with their Customer Satisfaction (CSAT) rating and written feedback. **Note:** As a SaaS platform, we act solely as a Data Processor for end-user data. You (the Business) act as the Data Fiduciary under the DPDP Act.

### C. Automatically Collected Information
We use cookies and similar technologies (e.g., Supabase authentication tokens) to log activity such as your IP address, browser type, login timestamps, and system usage to monitor security events, audit logs, and account abuse.

## 2. Artificial Intelligence Processing (AI)
We utilize Google Gemini (Generative AI) strictly as an assistive tool to draft review templates based on the text inputs submitted by end-users. 
- We **do not** use your private end-user feedback to train public AI models. 
- All data passed to the AI provider is securely transmitted via API for immediate processing. The AI provider is contractually bound to process data temporarily and delete inputs without storing them for independent purposes.

## 3. How We Share Your Data
We do not sell your personal data. We share data only with trusted third-party service providers (Subprocessors) essential to service delivery, including:
- **Cloud Infrastructure & Authentication:** Supabase
- **Payments:** Razorpay Software Private Limited
- **AI Processing:** Google (Gemini API)

## 4. Your Rights Under Indian DPDP Act
You may request to:
- Access the personal data we hold about you.
- Correct inaccurate or incomplete data.
- Request deletion of your data (subject to legal, tax, or fraud-prevention retention laws).
- Withdraw your consent at any time (please note this may lead to termination of your account functionality).

To exercise these rights, please contact our Grievance Officer.

## 5. Security & Data Retention
Your data is securely isolated. We employ rigorous multi-tenant data partitioning, ensuring no Business has access to another Business's data. We retain your account data for as long as your subscription is active, and for a minimum legally mandated period thereafter (e.g. for financial audit purposes). If an account is deleted, your data will systematically be expunged from our operational databases.

## 6. Grievance Officer
Under the Information Technology rules and DPDP Act, our Grievance Officer details are as follows:

**Name:** [CONFIGURABLE: GRIEVANCE_OFFICER_NAME]
**Email:** [CONFIGURABLE: PRIVACY_EMAIL]
**Address:** [CONFIGURABLE: BUSINESS_ADDRESS], India.
    `
    },
    {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        status: 'published',
        content: `
# Terms of Service
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

These Terms of Service ("Terms") constitute a legally binding agreement between you and **[CONFIGURABLE: BUSINESS_NAME]** ("Company", "we", or "us") regarding your use of the Smart Review Assistant platform.

By registering for an account, accessing the platform, or making a payment, you agree to comply with these terms.

## 1. Description of Service
Smart Review Assistant provides a B2B SaaS platform that helps business owners manage their reputation, generate feedback campaigns, and facilitate the acquisition of authentic customer reviews on platforms like Google Business Profile.

## 2. Business Responsibilities & Authentic Reviews
You must only use our software to invite genuine customers to review your business based on their actual experiences.
- **No Review Gating (Where Prohibited):** You agree to use the software in full compliance with the terms of service of the third-party platforms you integrate with (e.g., Google). Google strictly forbids review gating (discouraging negative customers from leaving public reviews). 
- **Authenticity:** You shall not attempt to fabricate reviews, purchase fake reviews, or misuse the AI review drafting system to publish misleading content.
- **Compliance:** You are the Data Fiduciary regarding the personal data of your customers. You must ensure you have gathered appropriate consent under the DPDP Act from your end customers before feeding their contact data into our system for review requests.

## 3. Disclaimers for AI & Third Parts Integration
We utilize AI algorithms (Google Gemini) to assist users in drafting review content. The AI output is a suggestion. We **do not guarantee** that reviews will be published, nor do we guarantee your ranking, SEO metrics, or Google's acceptance of any submission. AI can occasionally generate unhelpful or irrelevant drafts, and the final responsibility for review submission lies with your end user.

## 4. Subscriptions, Payments & Billing
- Subscriptions are billed on a recurring basis (monthly or yearly) via Razorpay.
- You authorized us and our payment gateway to continuously charge your connected payment method at the beginning of each billing cycle.
- Manual billing arrangements (payments made via WhatsApp requests) will be approved by our administration manually, and service dates reflect from the date payment is verified.
- We reserve the right to suspend or delete accounts that fall into arrears or have suspicious payment origins.

## 5. Termination & System Abuse
We reserve the right to suspend or permanently terminate your access to our dashboard without a refund if we discover you are:
- Abusing the API limits or initiating denial-of-service behaviors (intentional or otherwise).
- Sharing account credentials inappropriately.
- Engaging in harassment, fraud, illegal activity, or impersonation.

## 6. Limitation of Liability
To the maximum extent permitted under Indian law, the maximum aggregate liability of the Company regarding any claims whatsoever under these Terms shall not exceed the total amount paid by you to the Company for the service during the preceding three (3) months.

## 7. Governing Law
These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in **[CONFIGURABLE: JURISDICTION_CITY]**, India.
    `
    },
    {
        title: 'Refund & Cancellation Policy',
        slug: 'refund-policy',
        status: 'published',
        content: `
# Refund & Cancellation Policy
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

Thank you for subscribing to **[CONFIGURABLE: BUSINESS_NAME]**. We strive to provide excellent service and software uptime to all our customers. Please read our cancellation and refund protocols carefully.

## 1. Cancellations
You may cancel your recurring SaaS subscription at any time via the "Billing" section in your Dashboard.
- When you cancel, you will continue to have full access to your account and premium features until the end of your current active billing cycle.
- We do not prorate cancellations. Once the billing cycle ends, your account will revert to a restricted state or be suspended based on your plan limits.

## 2. Refunds
Due to the digital nature of our software and immediate access to infrastructure and AI generation credits, **we generally do not offer refunds** after a charge has been successfully completed. 
- **Accidental Renewals:** If you forgot to cancel and a renewal charge was processed, you may reach out to support within **[CONFIGURABLE: REFUND_WINDOW_DAYS, e.g. 3 days]** of the charge. The granting of refunds for accidental renewals is solely at the discretion and determination of our billing team.
- **Non-Refundable Limitations:** Setup fees, customized domain setups, and excess usage charges are entirely non-refundable.

## 3. Service Interruptions
If a prolonged critical bug on our end completely prevents you from using the software, please contact our support team. We may, at our sole discretion, issue a credit note for lost days, but we are not legally obligated to provide financial refunds for standard temporary downtime.

For any payment disputes, please email **[CONFIGURABLE: BILLING_EMAIL]** before raising an arbitrary chargeback through your bank, as unwarranted chargebacks immediately result in a permanent ban from our platform.
    `
    },
    {
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        status: 'published',
        content: `
# Cookie Policy
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

This Cookie Policy explains how **[CONFIGURABLE: BUSINESS_NAME]** uses cookies and similar digital trackers on our proprietary application.

## 1. What Are Cookies?
Cookies are small text files that your browser securely saves to your computer or mobile device when you visit websites. 

## 2. Types of Cookies We Use

### A. Strictly Necessary (Essential) Cookies
These cookies are strictly required for our SaaS application to function. This primarily concerns authentication. We utilize Supabase as our authentication provider. When you log in, JWT (JSON Web Tokens) and session identifiers are stored in your browser to keep you logged in dynamically as you navigate the dashboard and perform administrative actions. The dashboard **cannot** function without these.

### B. Functional & Preference Cookies
We may store local identifiers to remember UI preferences, such as sidebar state or the last active workspace, improving your experience as you repeatedly open the app.

### C. Analytics Cookies
We may utilize basic telemetry and internal security metrics to detect application crashes and track usage of specific pages inside the platform. This helps us decide what features to build next. 

## 3. Third-Party Cookies
Our application integrates with Stripe/Razorpay for checkout mechanisms. These payment gateways may set their own secure cookies when processing transactions to prevent fraud. Furthermore, when your users connect their Google Business profile via OAuth, Google operates its own standard authenticating cookies.

## 4. Managing Cookies
Most web browsers allow you to manage and block cookies. However, blocking all cookies will break the authentication framework of our application, preventing you from logging into the dashboard. Therefore, navigating and using our internal dashboard represents your consent to operate these essential tracking mechanisms.
    `
    },
    {
        title: 'Acceptable Use Policy (AUP)',
        slug: 'acceptable-use',
        status: 'published',
        content: `
# Acceptable Use Policy
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

This Acceptable Use Policy defines strictly forbidden behaviors for businesses operating on the **[CONFIGURABLE: BUSINESS_NAME]** platform.

## 1. Review Integrity & Honesty
Our platform is expressly designed to collect **authentic, real experiences** from real customers. You MUST NOT:
- Ask employees, friends, or family to act as customers to leave fictitious reviews.
- Offer monetary compensation to strangers explicitly in exchange for a 5-star rating.
- Interfere with the natural customer dissatisfaction process or forcefully penalize customers who leave negative feedback.
- Harass, stalk, or send excessive unwanted automated SMS/Email review requests to customers who have asked to be removed from your communication list.

## 2. API & Infrastructure Abuse
You are prohibited from:
- Attempting to reverse engineer our backend APIs.
- Developing scripts that endlessly scrape our system or overwhelm our databases.
- Submitting malicious code (XSS payloads, SQL injections).
- Uploading content (such as business logos or QR templates) that infringes on trademark or intellectual property laws.

## 3. Consequence of Breach
Any violation of this Acceptable Use Policy may result in the immediate and permanent deletion of your business workspace, forfeiture of any remaining subscription balance, and where extreme (such as payment fraud or infrastructure attacks), reporting to Indian law enforcement and cybercrime authorities.
    `
    },
    {
        title: 'AI & Review Guidelines',
        slug: 'ai-guidelines',
        status: 'published',
        content: `
# AI Integration & Review Guidelines
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

As a core aspect of our value proposition, **[CONFIGURABLE: BUSINESS_NAME]** incorporates generative Artificial Intelligence (AI) to streamline the process for end-customers when they are drafting their thoughts about your business.

## 1. How the AI Functions
When an end-user submits brief notes or selects aspects they enjoyed (e.g., "fast service, good food"), our application uses an integrated LLM (Large Language Model) provided by Google (Gemini) to expand those notes into a fully articulated review draft.

## 2. Important Disclaimers regarding AI Output
- **Not Automated Submission:** The AI **only drafts** the text. It does not auto-post anything to Google on the user's behalf. The user must manually review, copy, and confirm the post on Google's native platform.
- **Accuracy and Hallucination:** Generative AI is prone to hallucinations. It may generate text that the user did not intend, or fabricate a specific detail (e.g. inventing a waitress's name). It is thoroughly disclosed to the end-user that they must review the AI output for total factual accuracy before submitting it online.
- **No Algorithmic Guarantee:** Using our AI drafting technology does NOT grant your business special privileges on Google search rankings or Maps algorithms.

We highly restrict our AI prompt mechanisms to enforce a neutral, polite, and constructive tone. 
    `
    },
    {
        title: 'Security & Data Protection',
        slug: 'security',
        status: 'published',
        content: `
# Security & Data Protection
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

At **[CONFIGURABLE: BUSINESS_NAME]**, protecting the digital confidentiality and integrity of your corporate and customer data is our operational priority.

## 1. Data Isolation Architecture 
We are a multi-tenant SaaS. However, we employ rigorous Row Level Security (RLS) policies at the database layer (Supabase PostgreSQL) to legally and comprehensively separate your Workspace data from all other users.
- A business owner can only read, update, or retrieve data strictly linked to their unique Business Identifier.
- Cross-tenant data leakage is fundamentally blocked at the database engine level.

## 2. Encrypted Transmissions
- All communications between your browser, our API servers, and external integrators (Google APIs/Razorpay) are strictly conducted over HTTPS (TLS v1.2+).
- We actively block insecure HTTP protocol attempts.

## 3. Subprocessors and Cloud Security
- Our database is hosted securely by Supabase.
- Source code and deployments run on Vercel's global computing network.
- Both hosting providers maintain immense compliance protocols, including SOC 2 Type 2 compliance and robust DDoS protection. 

## 4. Limited Staff Access (Superadmin Panel)
Our internal engineering and support staff only access production data via specialized audited Superadmin accounts.
- Administrative access to accounts in the backend is logged via our immutable Audit Logging system.
- We do not access your user's specific feedback or your connected Google tokens unless you specifically initiate a support ticket requiring technical assistance regarding that specific integration.
    `
    },
    {
        title: 'Contact & Grievance',
        slug: 'contact',
        status: 'published',
        content: `
# Contact & Grievance Mechanism
**Last Updated: [CONFIGURABLE: EFFECTIVE_DATE]**

For any queries regarding our software, sales, or compliance frameworks, please refer to the contact details below:

## 1. General & Support Inquiries
For technical issues, billing faults, or onboarding requests:
- **Email:** [CONFIGURABLE: SUPPORT_EMAIL]
- **Phone:** [CONFIGURABLE: SUPPORT_PHONE] (Available Mon - Fri, 10 AM to 6 PM IST)

## 2. Privacy & Data Protection (Grievance Officer)
Registered as per the requirements of the Information Technology Act (2000) and the Digital Personal Data Protection Act (2023) of India:
- **Officer Name:** [CONFIGURABLE: GRIEVANCE_OFFICER_NAME]
- **Direct Email:** [CONFIGURABLE: PRIVACY_EMAIL]

## 3. Corporate Registered Office
**[CONFIGURABLE: BUSINESS_NAME]**
[CONFIGURABLE: BUSINESS_ADDRESS],
India.
    `
    }
]

async function main() {
    console.log('Seeding Comprehensive Legal Pages...')

    for (const page of pages) {
        const exists = await prisma.legalPage.findUnique({
            where: { slug: page.slug }
        })

        if (exists) {
            await prisma.legalPage.update({
                where: { slug: page.slug },
                data: {
                    title: page.title,
                    content: page.content,
                    status: page.status
                }
            })
            console.log(\`Updated existing policy: \${page.title}\`)
    } else {
      await prisma.legalPage.create({
        data: page
      })
      console.log(\`Created new policy: \${page.title}\`)
    }
  }

  console.log('Legal Pages successfully seeded!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
