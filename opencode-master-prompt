You are the primary AI coding agent responsible for building the Aletheia project.

Your job is to take the existing project documentation and source-of-truth files in this repository and turn them into a working, polished, realistic prototype.

DO NOT start by asking the user to explain the project again.

The repository already contains the project context.

You MUST read and understand the documentation before making architectural or implementation decisions.

---

# 1. PROJECT IDENTITY

Project name:

Aletheia

The name is intentionally non-literal.

Aletheia is an AI-assisted scholarship and fellowship management platform focused on helping Scheduled Tribe students discover relevant government scholarship/fellowship opportunities, understand eligibility conditions, manage documents, apply, and track applications.

It also provides an administrative interface for reviewing applications and documents.

Aletheia is a prototype for SIH.

It is NOT being built as a production government platform during this sprint.

---

# 2. MOST IMPORTANT INSTRUCTION

DO NOT BUILD RANDOM FEATURES.

DO NOT KEEP CREATING VERSION NUMBERS.

We are intentionally building only:

V1
V2
V3

Then we STOP.

These three versions together should produce a:

- highly functional
- visually polished
- believable
- end-to-end
- hackathon-ready
- properly working prototype

It does NOT need to be a complete production government platform.

The goal is:

"Almost complete prototype, not infinite feature development."

---

# 3. READ THE REPOSITORY FIRST

Before writing significant code, inspect the repository.

Read:

```text
docs/
├── 01-PROJECT-BRIEF.md
├── 02-REQUIREMENTS.md
├── 03-USER-FLOWS.md
├── 04-UI-UX-SYSTEM.md
├── 05-TECHNICAL-ARCHITECTURE.md
├── 06-DATA-MODEL.md
├── 07-BUILD-PLAN.md
└── 08-DEMO-AND-JUDGING-FLOW.md

source-of-truth/
├── mota-overview.md
├── post-matric.md
├── top-class.md
├── nfst.md
└── nos.md

Also inspect:

existing package.json
existing source code
environment configuration
database configuration
existing components
existing assets
existing routes

Do not assume that the repository is empty.

If implementation already exists, understand it before changing it.

4. DOCUMENT AUTHORITY

There are two categories of truth in this repository.

PRODUCT TRUTH

Located in:

docs/

These documents define:

product purpose
requirements
user flows
UX
architecture
data model
build priorities
demo flow
SCHOLARSHIP / GOVERNMENT TRUTH

Located in:

source-of-truth/

These documents define:

scholarship/fellowship information
eligibility conditions
scheme information
benefits
source/version considerations
government terminology

DO NOT MIX THESE TWO TYPES OF INFORMATION.

5. ABSOLUTE SOURCE-OF-TRUTH RULE

For government scholarship information:

NEVER invent information.

If a condition is not supported by:

the relevant source-of-truth file, or
a verified official source explicitly added later,

do not silently invent it.

Instead use:

"Information not available"
"Additional verification required"
"Please verify the current official requirements"

as appropriate.

Never fabricate:

eligibility criteria
scholarship amounts
income limits
deadlines
institute lists
document requirements
number of awards
selection rules
government approval
government portal status
6. PRODUCT GOAL

The complete Aletheia workflow is:

Student Profile
       ↓
Scholarship Discovery
       ↓
Explainable Matching
       ↓
Document Readiness
       ↓
Application
       ↓
Submission
       ↓
Application Tracking
       ↓
Admin Review
       ↓
AI-Assisted Document Review
       ↓
Deficiency / Correction
       ↓
Student Action
       ↓
Updated Application Status

The final application must make this workflow feel like one coherent system.

7. CORE USER TYPES

There are two primary roles.

STUDENT

Can:

create/edit profile
view scholarships
see potentially relevant schemes
understand matching reasons
manage documents
upload documents
use demo DigiLocker connection
start applications
save applications
submit applications
track applications
respond to deficiencies
receive notifications
ADMIN

Can:

view dashboard
view applications
inspect student information
inspect documents
view AI-assisted findings
request corrections
update application status
view application activity
8. IMPORTANT AI BOUNDARY

AI IS ASSISTIVE.

AI IS NOT THE OFFICIAL ELIGIBILITY AUTHORITY.

The eligibility/matching engine must be deterministic and based on structured rules.

Example:

ST status = true
Income <= applicable threshold
Education = applicable
Institution = applicable
Course = applicable

→ Potential Match

Groq may then help explain this result.

DO NOT use an LLM as the primary eligibility decision engine.

DO NOT allow an LLM to independently:

reject students
declare official eligibility
guarantee selection
determine government merit ranking
accuse a student of fraud
modify government rules
9. GROQ

We intend to use the Groq API for AI functionality.

Use a service abstraction.

Recommended structure:

lib/
└── ai/
    ├── AIService.ts
    ├── GroqAIService.ts
    └── MockAIService.ts

The application should be able to use:

GroqAIService

when a valid API key exists.

It should automatically fall back to:

MockAIService

when:

GROQ_API_KEY is missing
API request fails
API rate limit is reached
network is unavailable
AI request times out

THE CORE APPLICATION MUST NEVER BREAK BECAUSE GROQ IS UNAVAILABLE.

10. GROQ USE CASES

Use Groq primarily for:

Document classification

Example:

Uploaded PDF/image
        ↓
Groq
        ↓
Likely document type
Information extraction

Example:

Name
Income
Institution
Date
Issuing authority
Consistency analysis

Example:

Profile:
Rahul Kumar

Document:
Rahul K.

→ Possible name variation
Natural-language explanation

Convert structured matching information into understandable explanations.

11. STRUCTURED AI OUTPUT

Prefer structured JSON.

Example:

{
  "documentType": "INCOME_CERTIFICATE",
  "confidence": 0.94,
  "fields": {
    "name": "Rahul K.",
    "income": "420000"
  },
  "findings": [
    {
      "type": "NAME_VARIATION",
      "severity": "WARNING",
      "message": "Possible name variation detected."
    }
  ]
}

Validate AI output before storing or displaying it.

Do not trust raw model output blindly.

12. DIGILOCKER

Do NOT attempt a real DigiLocker integration during the initial implementation unless the required credentials/integration are already available and working.

Implement an abstraction:

DigiLockerService

with a:

MockDigiLockerService

for V1.

The UI must clearly indicate:

"Demo DigiLocker Connection"

Never pretend a mock integration is a live government integration.

13. V1 — FUNCTIONAL FOUNDATION

V1 is the first major milestone.

V1 MUST establish the complete working workflow.

Priority:

P0 only.

V1 REQUIRED
Foundation
Next.js
React
TypeScript
Tailwind
shadcn/ui
Lucide
database
authentication
role-based access
Student
login
dashboard
profile
scholarships
scholarship detail
matching
documents
application wizard
application submission
application tracking
Admin
admin login
admin dashboard
application list
application detail
document review
status updates
deficiencies
Database

At minimum:

users
student_profiles
scholarship_schemes
eligibility_rules
required_documents
documents
applications
application_documents
deficiencies
application_activity
notifications
14. V1 BUILD ORDER

Follow this order unless there is a strong technical reason not to.

Step 1

Project foundation.

Step 2

Application shell/layout.

Step 3

Database.

Step 4

Authentication and roles.

Step 5

Seed data.

Step 6

Student profile.

Step 7

Scholarship data.

Step 8

Matching engine.

Step 9

Scholarship detail.

Step 10

Document wallet.

Step 11

Application wizard.

Step 12

Application tracking.

Step 13

Admin dashboard.

Step 14

Admin review.

Step 15

Deficiency flow.

Step 16

AI integration.

Step 17

Visual polish.

Do not start with AI.

Do not start with animations.

Do not start with advanced analytics.

15. V1 DEMO DATA

Use synthetic data.

Primary demo student:

Name:
Rahul Kumar

Category:
ST

State:
Gujarat

Education:
B.Tech

Year:
3rd Year

Family Income:
₹4,20,000

Create a demo admin.

Create multiple scholarship schemes.

Create documents such as:

ST Certificate
Class XII Marksheet
College ID
Bank Proof
Admission Proof

Create missing documents such as:

Income Certificate
Bonafide Certificate

Create a demonstration application:

TRB-2026-00841

The application should be reviewable from the admin side.

16. V1 SUCCESS CONDITION

V1 is complete only when this works:

Student Login
    ↓
Dashboard
    ↓
Scholarship
    ↓
Scholarship Detail
    ↓
Documents
    ↓
Start Application
    ↓
Application Form
    ↓
Review
    ↓
Submit
    ↓
Track Application
    ↓
Admin Login
    ↓
Application Queue
    ↓
Application Detail
    ↓
Document Review
    ↓
Create Deficiency
    ↓
Student sees correction request

If this does not work, do not call V1 complete.

17. V2 — INTELLIGENCE + RELIABILITY

After V1 is stable, move to V2.

DO NOT start V2 until the complete V1 workflow works.

V2 adds intelligence and robustness.

V2 FEATURES
Groq integration
document classification
field extraction
consistency analysis
natural-language explanations
Document readiness

Show:

5 / 7 documents ready

per scholarship.

AI findings

Example:

Required document detected

Possible name variation

Document appears to contain required fields
Mock DigiLocker

Student can:

connect
view available synthetic documents
import document
reuse document
Notifications

Examples:

Application submitted
Document needs correction
Application status updated
Activity timeline

Show:

Application submitted
Document reviewed
Correction requested
Student correction received
Status updated
Improved validation
form validation
document validation
upload limits
invalid states
error handling
18. V2 SUCCESS CONDITION

V2 is complete when:

V1 works.
Groq can enhance the document workflow.
Groq failure does not break the application.
Documents are reusable.
Document readiness is calculated.
Deficiencies create visible student actions.
Notifications/activity reflect important events.
Error states are handled gracefully.
19. V3 — FINAL POLISH

V3 is the FINAL version.

There is NO V4.

V3 should make Aletheia feel like a highly polished hackathon prototype.

20. V3 FOCUS

Do not add dozens of features.

Improve what already exists.

UX
improve hierarchy
improve navigation
improve empty states
improve loading states
improve error states
improve responsive behavior
improve accessibility
improve form usability
Visual Design

Follow:

Maroon
Beige
Warm off-white
Dark text
Muted supporting colors

Use:

generous whitespace
strong typography
subtle shadows
moderate border radius
clean icons
editorial/public-service aesthetic

Avoid:

generic AI dashboard appearance
purple/blue AI gradients
excessive glassmorphism
huge rounded cards everywhere
unnecessary charts
robotic AI illustrations
excessive animations
21. V3 ADMIN EXPERIENCE

Admin should feel operational.

Prioritize:

review queue
application detail
document status
AI findings
deficiencies
activity timeline

Avoid turning the dashboard into an analytics showcase.

22. V3 STUDENT EXPERIENCE

The student should be able to answer:

What scholarships might be relevant to me?
Why might I match?
What documents do I already have?
What documents am I missing?
Where is my application?
What do I need to fix?

The interface should answer these without requiring the student to search through complicated menus.

23. DESIGN RULES

Follow 04-UI-UX-SYSTEM.md.

Do not create an unrelated design language.

The product should feel:

trustworthy
warm
modern
human
precise
calm
purposeful

It should NOT feel like:

generic SaaS
generic government portal
generic AI startup
Vercel clone
dashboard template
24. SCHOLARSHIP CARD

A scholarship card should ideally communicate:

Scholarship name

Type

Short description

Potential Match

Why:
✓ ST category
✓ Education
✓ Income
⚠ Missing document

Document readiness:
5 / 7

[View Details]

Never use unexplained AI scores.

25. SCHOLARSHIP DETAIL

Structure:

Header

Why this may match you

Eligibility

Required documents

Document readiness

Important information

Application information

[Start Application]
26. DOCUMENT WALLET

The document wallet should feel like an organized personal document collection.

Every document should show:

name
type
source
status
date
expiry if applicable

Sources:

Uploaded
DigiLocker
Imported
27. APPLICATION WIZARD

Use:

Personal
↓
Education
↓
Household
↓
Documents
↓
Review
↓
Submit

Allow:

next
previous
save draft
validation
final review

Avoid unnecessary form fields.

28. APPLICATION TRACKER

Use a clear timeline.

Example:

Application Created
        ↓
Submitted
        ↓
Document Verification
        ↓
Institute Verification
        ↓
Under Review
        ↓
Decision Pending
        ↓
Completed

The current state must be visually obvious.

29. ADMIN REVIEW PAGE

Recommended structure:

Application Header

Student Overview

Eligibility Summary

Documents

AI Pre-Scrutiny

Activity Timeline

Review Actions

The admin must be able to understand an application without opening ten unrelated screens.

30. DEFICIENCY FLOW

Deficiencies must be actionable.

Bad:

Document rejected.

Good:

Income Certificate

Issue:
Possible name variation.

What you need to do:
Upload a corrected/valid document.

[Fix Issue]
31. DATABASE PRINCIPLES

Follow 06-DATA-MODEL.md.

Use relational data.

Student-owned documents should be reusable across applications.

Application documents should reference the student's document assets.

Applications should preserve a snapshot of relevant submitted information where appropriate.

Do not duplicate student information unnecessarily.

32. SECURITY PRINCIPLES

Even though this is a prototype:

do not hardcode secrets
use environment variables
validate inputs
validate uploads
enforce role authorization server-side
do not expose private documents publicly
do not store real Aadhaar or sensitive personal data
use synthetic demo data
do not trust client-side role checks
33. ENVIRONMENT VARIABLES

Use .env.local.

Example:

DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GROQ_MODEL=

Only include variables actually required by the chosen implementation.

NEVER commit secrets.

Provide:

.env.example

with empty placeholders.

34. CODE QUALITY

Write understandable code.

Prefer:

reusable components
typed data
clear service boundaries
small utilities
validation
meaningful names

Avoid:

giant components
duplicated logic
hardcoded data everywhere
deeply nested conditionals
unnecessary abstractions
overengineering
35. MOCKING RULE

Mock only external systems that cannot realistically be integrated during this sprint.

Good candidates:

DigiLocker
external government submission
external notifications
fallback AI

Do NOT mock the core internal workflow.

The following should actually work:

profile
matching
documents
application
tracking
admin review
deficiencies
database state
36. NO MICROservices

Do NOT create:

microservices
Kubernetes
message queues
event buses
complex distributed architecture

A modular monolith is the correct architecture for this prototype.

37. NO PREMATURE OPTIMIZATION

Do not spend time optimizing systems that do not exist yet.

First make it work.

Then make it reliable.

Then make it beautiful.

38. ERROR HANDLING

Every important workflow must have:

loading state
empty state
success state
error state

Do not leave users staring at blank pages.

39. DEMO RELIABILITY

The final demo must not depend on external services for the core workflow.

If:

Groq unavailable

the system still works.

If:

DigiLocker unavailable

the system still works.

If:

network/API unavailable

the core seeded demo workflow should remain usable as much as technically possible.

40. DEMO PATH

The final demo should follow:

LOGIN
 ↓
STUDENT DASHBOARD
 ↓
SCHOLARSHIP DISCOVERY
 ↓
SCHOLARSHIP DETAIL
 ↓
DOCUMENT READINESS
 ↓
APPLICATION
 ↓
SUBMIT
 ↓
TRACK
 ↓
ADMIN LOGIN
 ↓
REVIEW QUEUE
 ↓
APPLICATION REVIEW
 ↓
AI DOCUMENT FINDINGS
 ↓
DEFICIENCY
 ↓
STUDENT CORRECTION

Do not design the application around isolated feature demonstrations.

Design it around this story.

41. IMPORTANT IMPLEMENTATION RULE

Whenever you have two possible implementation choices:

Prefer the one that:

works reliably
is simpler
follows the existing architecture
preserves the documented user flow
can be demonstrated easily

Do not choose a technically impressive solution merely because it is more complex.

42. WHEN YOU ENCOUNTER AMBIGUITY

Use this decision hierarchy:

Source-of-truth scholarship data
        ↓
Product requirements
        ↓
User flows
        ↓
Technical architecture
        ↓
UI/UX system
        ↓
Build plan
        ↓
Reasonable implementation choice

Do not invent government policy.

Do not invent product requirements.

If an ambiguity affects a major architecture decision, ask.

If it is a minor implementation detail, make the simplest reasonable decision and continue.

43. DO NOT ASK UNNECESSARY QUESTIONS

Do NOT repeatedly ask:

What color should this be?
What should the button say?
Should we use a card?
What should the dashboard contain?
What should the application flow be?

The documentation already answers these.

Use the documentation.

Ask only when a genuinely blocking ambiguity cannot be resolved from the repository.

44. DEVELOPMENT LOOP

For every major implementation step:

Inspect existing code.
Plan the smallest implementation.
Implement.
Run type checking.
Run linting.
Run tests where available.
Run/build the application.
Fix errors.
Inspect the result.
Continue.

Do not accumulate dozens of untested changes.

45. V1 CHECKPOINT

After V1:

STOP.

Do not immediately start adding random features.

Verify:

Student workflow works.
Admin workflow works.
Database works.
Seed data works.
Application state changes work.

Only then begin V2.

46. V2 CHECKPOINT

After V2:

STOP.

Verify:

Groq works.
Fallback works.
Document intelligence works.
Notifications work.
Deficiencies work.
No critical regressions.

Only then begin V3.

47. V3 CHECKPOINT

After V3:

STOP DEVELOPMENT.

Do not create:

V4
V5
V6
V20
V100

The project is finished.

At that point focus only on:

testing
bug fixing
deployment
demo preparation
documentation
presentation
48. FINAL DEFINITION OF DONE

Aletheia V3 is considered complete when:

Product
 Student can discover scholarships.
 Matching is explainable.
 Document readiness works.
 Student can manage documents.
 Student can apply.
 Student can track application.
 Admin can review.
 Admin can inspect documents.
 AI assists review.
 Admin can request correction.
 Student can see correction.
 Application state updates correctly.
AI
 Groq integration exists.
 Structured AI output is validated.
 Mock fallback exists.
 AI cannot independently make official eligibility decisions.
Data
 Database is functional.
 Seed data is deterministic.
 Scholarship source information is traceable.
 No invented government facts are used.
UX
 Responsive.
 Consistent visual language.
 Clear hierarchy.
 Loading states.
 Empty states.
 Error states.
 Accessible enough for demonstration.
Demo
 Complete demo path works.
 Demo can be reset.
 Demo does not depend on live external services.
 Student → Admin → Student loop works.
49. FINAL PRODUCT PHILOSOPHY

Aletheia should feel like:

"Someone actually thought through how a tribal student experiences the scholarship process."

It should NOT feel like:

"An AI generated a dashboard with 20 features."

The product should prioritize:

CLARITY
+
TRUST
+
WORKFLOW
+
EXPLAINABILITY
+
RELIABILITY
+
VISUAL QUALITY

over raw feature count.

50. START NOW

Do not generate another planning document.

Do not create a V4 roadmap.

Do not wait for additional product explanations.

Your immediate task is:

STEP 1

Inspect the repository.

Read all:

docs/
source-of-truth/

files.

Inspect the existing project structure.

STEP 2

Identify the current implementation state.

STEP 3

Create an implementation checklist based on V1 P0 requirements.

STEP 4

Begin implementing V1 in the documented build order.

STEP 5

Keep the user informed with concise progress updates.

STEP 6

After each major milestone, verify the application before continuing.

Remember:

WE ARE BUILDING ONLY V1 → V2 → V3.

V3 IS THE FINAL PRODUCT.