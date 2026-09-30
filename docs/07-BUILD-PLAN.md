## 1. Purpose

This document converts the Aletheia project documentation into a practical implementation plan for the first working prototype.

The goal is NOT to build a complete production scholarship-management platform.

The goal is to build a convincing, functional V1 that demonstrates the complete student-to-administration workflow:

Student Profile
→ Scholarship Matching
→ Document Readiness
→ Application
→ Application Tracking
→ Admin Review
→ Document/Deficiency Action
→ Status Update

The application must feel like one coherent product rather than a collection of disconnected screens.

---

# 2. V1 Definition

Aletheia V1 is complete when a judge can:

1. Register/login as a student.
2. See a populated student profile.
3. View scholarships relevant to that student.
4. Open a scholarship and understand why it matches.
5. See required documents.
6. See which documents are already available.
7. Upload/add a missing document.
8. Start an application.
9. Complete/review the application.
10. Submit the application.
11. Track the application status.
12. Switch to an admin account.
13. See submitted applications.
14. Open an application.
15. Review student information and documents.
16. See AI-assisted document findings.
17. Mark a document/application as needing correction.
18. Update the application status.
19. See the student-side status update.

If these flows work reliably, V1 is successful.

---

# 3. Development Philosophy

## Build the workflow first.

Do not spend hours perfecting individual screens before the underlying workflow works.

Priority:

1. Functional workflow
2. Realistic data
3. Consistent UI
4. AI-assisted features
5. Visual polish
6. Extra features

A beautiful dashboard with broken application flow is worse than a simple dashboard with a complete working flow.

---

# 4. Priority System

## P0 — MUST BUILD

These features are mandatory for V1.

### Authentication
- Student login
- Admin login
- Demo accounts
- Role-based routing

### Student
- Dashboard
- Profile
- Scholarship discovery
- Scholarship detail
- Scholarship matching
- Document wallet
- Application creation
- Application submission
- Application tracking

### Admin
- Admin dashboard
- Application list
- Application detail
- Document review
- Status update
- Deficiency/correction flow

### Data
- Student profile
- Scholarship schemes
- Eligibility rules
- Required documents
- Student documents
- Applications
- Application documents
- Application activity

---

# 5. P1 — BUILD IF TIME ALLOWS

These features improve the demonstration significantly but should never delay P0.

- AI document classification
- AI field extraction
- AI consistency checks
- Document readiness percentage
- Notifications
- Activity timeline
- Mock DigiLocker connection
- Better admin statistics
- Search/filtering
- Application deficiency workflow
- Better empty states

---

# 6. P2 — ONLY IF V1 IS ALREADY STABLE

Do NOT start these early.

- Advanced analytics
- Complex configurable eligibility engine
- Real DigiLocker integration
- Real government authentication
- Advanced OCR infrastructure
- Real email/SMS notifications
- Multi-level government approval workflow
- Advanced fraud detection
- Mobile application
- Microservices
- Production cloud architecture
- Complex AI agents

---

# 7. Recommended Build Order

Build in exactly this general order.

## Phase 1 — Project Foundation

Set up:

- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- Lucide
- database
- environment variables
- base layout
- typography
- color tokens
- routing

Immediately establish:

- Maroon
- Beige
- Off-white
- Dark text
- Muted text

Do not create detailed pages yet.

---

# Phase 2 — Application Shell

Create:

### Student layout

Sidebar:

- Dashboard
- Scholarships
- Applications
- Documents
- Profile
- Notifications

### Admin layout

Sidebar:

- Overview
- Applications
- Review Queue
- Documents
- Activity

Build:

- Sidebar
- Header
- Breadcrumbs where useful
- Page container
- Responsive behavior
- User menu

The entire application should already feel visually consistent.

---

# Phase 3 — Database + Seed Data

Create the core database tables.

Minimum:

- users
- student_profiles
- scholarship_schemes
- eligibility_rules
- required_documents
- documents
- applications
- application_documents
- deficiencies
- application_activity

Seed:

### Student

Name:
Rahul Kumar

Category:
ST

State:
Gujarat

Education:
B.Tech, 3rd Year

Family income:
₹4,20,000

Use synthetic data only.

### Admin

Create one demo admin account.

### Scholarships

Create at least:

- Primary demo scholarship
- 2–3 additional schemes

Every scheme must have:

- Name
- Description
- Type
- Eligibility
- Required documents
- Application information
- Active/inactive status

Do not invent government facts.

Use verified scholarship information in the final implementation.

---

# Phase 4 — Student Profile

Build:

`/student/profile`

Sections:

### Personal
- Name
- DOB
- Gender
- Mobile
- Email

### Location
- State
- District

### Category
- Category
- ST status
- PVTG status

### Education
- Education level
- Course
- Institution
- Academic year
- Previous qualification
- Percentage/CGPA

### Household
- Family income
- Household size
- Primary occupation

Add:

- Edit
- Save
- Profile completion indicator

---

# Phase 5 — Scholarship Matching

Build:

`/student/scholarships`

Create a deterministic rules engine.

Example:

```text
IF student.category == scheme.requiredCategory
AND student.educationLevel satisfies scheme.educationLevel
AND student.familyIncome <= scheme.incomeLimit
AND student.state satisfies scheme.stateRequirement
THEN potential match

Do not use an LLM to decide eligibility.

The matching engine should return:

MATCH
ACTION_REQUIRED
NOT_MATCHING

Each result should explain itself.

Example:

Potential Match
✓ ST category
✓ B.Tech student
✓ Family income within listed limit
⚠ Income certificate required

Avoid unexplained AI scores.

Do NOT display:

AI Eligibility Score: 94.7%

Instead display:

Potential Match

and explain why.

Phase 6 — Scholarship Detail

Build:

/student/scholarships/[id]

Structure:

Scholarship header
Short description
Why this may match you
Eligibility criteria
Required documents
Document readiness
Important dates
Application information
Start Application button

Example:

DOCUMENT READINESS

5 / 7 documents ready

✓ ST Certificate
✓ Class XII Marksheet
✓ College ID
✓ Bank Proof
✓ Admission Proof
○ Income Certificate
○ Bonafide Certificate

The missing documents should directly connect to the document wallet/application flow.

Phase 7 — Document Wallet

Build:

/student/documents

The document page should feel like an organized document collection.

Each document should show:

Document name
Type
Source
Status
Upload date
Expiry if applicable
Verification state

Sources:

Uploaded
DigiLocker
Imported

For the first version:

DigiLocker is MOCKED.

The interface must clearly communicate:

Demo DigiLocker Connection

Never claim a real integration when one does not exist.

Phase 8 — Application Wizard

Build:

/student/applications/[id]/apply

Steps:

Personal
Education
Household
Documents
Review
Submit

Allow:

Save draft
Previous
Next
Validation
Final review

The application should reference reusable student documents rather than creating unrelated duplicate documents.

Phase 9 — Application Tracking

Build:

/student/applications/[id]

Display a timeline:

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

Highlight the current stage.

If a deficiency exists:

Action Required

Income Certificate needs correction.

What you need to do:
Upload a valid income certificate.

[Fix Issue]
Phase 10 — Admin Dashboard

Build:

/admin/dashboard

Keep it operational.

Top-level statistics:

Total Applications
Pending Review
Documents Requiring Attention
Deficient Applications
Completed Applications

Then:

Review Queue

Show:

Application number
Student
Scholarship
Submitted date
Current status
Action

Do not create a wall of unnecessary charts.

Phase 11 — Admin Application Review

Build:

/admin/applications/[id]

Recommended structure:

Application Header

Application number
Student
Scholarship
Current status

Student Overview

Basic student information.

Eligibility Summary

Show the rules that matched.

Documents

List every required document:

ST Certificate       ✓ Verified
Income Certificate   ⚠ Needs Attention
Marksheet             ✓ Verified
College ID            ✓ Verified
AI Pre-Scrutiny

Show assistive findings.

Examples:

✓ Required document detected

⚠ Name variation detected:
"Rahul K." vs "Rahul Kumar"

ℹ Document appears to contain required fields

AI findings must remain advisory.

The system should never automatically accuse a student of fraud.

Activity

Show application history.

Review Actions

Possible actions:

Accept document
Request correction
Mark deficient
Move to next stage
Update application status
12. AI Implementation Strategy

Do not spend the first half of the day trying to build sophisticated AI.

Create an abstraction:

AIService
 ├── classifyDocument()
 ├── extractDocumentData()
 └── checkDocumentConsistency()

Then implement:

MockAIService

first.

This allows the UI to demonstrate AI-assisted functionality even if the actual model integration is incomplete.

Example result:

{
  "documentType": "INCOME_CERTIFICATE",
  "confidence": 0.94,
  "findings": [
    {
      "type": "FIELD_DETECTED",
      "field": "income",
      "value": "420000"
    }
  ]
}

If time remains, replace the implementation behind the same interface with a real model.

Do not rewrite the UI.

13. DigiLocker Strategy

Do not build a real DigiLocker integration during the one-day sprint unless the team already has the required access and integration knowledge.

Instead:

Create:

DigiLockerService

with:

connect()
getDocuments()
importDocument()

Use:

MockDigiLockerService

for V1.

Demo:

Student opens Documents.
Clicks Connect DigiLocker.
Demo connection screen appears.
User sees available synthetic documents.
Selects a document.
Document appears in wallet.

Clearly label the integration as a prototype/demo.

14. Demo Data Strategy

Never rely on an empty database during the final presentation.

Create deterministic seed data.

The main demo student should already have:

ST Certificate
Class XII Marksheet
College ID
Bank Proof
Admission Proof

Missing:

Income Certificate
Bonafide Certificate

This creates an obvious document-readiness story.

The demo application should initially be in a reviewable state.

Example:

Application:
TRB-2026-00841

Status:
UNDER_REVIEW

The admin can then demonstrate a document issue and status update.

15. One-Day Timeline

Assuming approximately 10–12 focused development hours.

Hour 0–1
Foundation
Create project
Install dependencies
Configure Tailwind
Configure UI
Create layouts
Create theme
Create routes

CHECKPOINT:

The application loads and navigation works.

Hour 1–2
Database + Authentication
Database
User model
Student profile
Admin role
Demo login
Seed data

CHECKPOINT:

Student and admin can enter their respective dashboards.

Hour 2–4
Student Core

Build:

Dashboard
Scholarships
Scholarship detail
Profile
Documents

CHECKPOINT:

Student can see personalized scholarship results and document readiness.

Hour 4–6
Application Flow

Build:

Start application
Multi-step form
Document selection
Review
Submit
Application tracking

CHECKPOINT:

A student can complete the full application journey.

Hour 6–8
Admin

Build:

Admin dashboard
Application list
Application detail
Document review
Status update
Deficiency

CHECKPOINT:

Admin can review the exact application submitted by the student.

Hour 8–9
AI + DigiLocker

Add:

Mock AI findings
Document extraction display
Mock DigiLocker
Document readiness

CHECKPOINT:

AI/DigiLocker features enhance the existing workflow instead of being separate demos.

Hour 9–10
Visual Polish

Fix:

spacing
typography
hierarchy
buttons
icons
empty states
loading states
responsive layout
error states

Do NOT redesign the application.

Hour 10–11
Testing

Test the exact demo path.

Student:

Login
→ Dashboard
→ Scholarship
→ Documents
→ Application
→ Submit
→ Track

Admin:

Login
→ Dashboard
→ Application
→ Documents
→ AI findings
→ Deficiency
→ Status update

Hour 11–12
Final Demo Preparation

Prepare:

clean database
deterministic seed
demo credentials
screenshots
backup demo route if required
final build
final deployment

No new major features.

16. If We Fall Behind

If after 4 hours the student workflow is not working:

STOP.

Do not build AI.

Do not build DigiLocker.

Do not build analytics.

Finish:

Login
→ Scholarship
→ Documents
→ Application
→ Tracking

If after 7 hours the admin side is incomplete:

Prioritize:

Admin Dashboard
→ Application List
→ Application Detail
→ Document Review
→ Status Update

If after 9 hours the system works:

STOP adding features.

Polish the existing workflow.

17. Things We Will NOT Build in V1

Do not build:

Real Aadhaar verification
Real government authentication
Real DigiLocker integration unless already available
Real scholarship payment processing
Complex fraud detection
Blockchain
Microservices
Kubernetes
Native mobile app
Advanced recommendation AI
LLM-based eligibility decisions
Real SMS infrastructure
Real email infrastructure
Huge analytics system
Multi-state government hierarchy
Complex role-permission matrix

These can be future roadmap items.

18. Quality Gate

V1 cannot be considered complete until:

Student
 Login works
 Dashboard works
 Profile works
 Scholarships load
 Matching is explainable
 Scholarship detail works
 Documents load
 Missing documents are visible
 Application can be started
 Application can be submitted
 Tracking works
Admin
 Login works
 Dashboard works
 Applications load
 Application detail works
 Documents load
 AI findings display
 Deficiency can be created
 Status can be updated
System
 Seed data works
 No critical console errors
 No broken navigation
 No fake government claims
 No sensitive real user data
 Responsive enough for demonstration
 Demo can be repeated from a clean state
19. Final Rule

Every feature must answer:

Does this help demonstrate the scholarship journey?

If YES:
Build it if it fits the current priority.

If NO:
Do not build it during V1.