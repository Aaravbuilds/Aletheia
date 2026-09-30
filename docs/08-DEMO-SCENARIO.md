## 1. Purpose

This document defines how Aletheia V1 should be demonstrated.

The objective is to make the product understandable within a short presentation while showing the complete scholarship-management workflow.

The demo should feel like one continuous story.

---

# 2. Core Demo Story

The demo follows one synthetic student.

Example:

> Rahul Kumar is an ST student studying B.Tech in Gujarat. He wants to find scholarships for which he may qualify, understand what documents he needs, submit an application, and track its progress.

The system then demonstrates how Aletheia helps him through the process.

The story continues into the administrative side.

---

# 3. Demo Sequence

## STEP 1 — Landing Page

Show:

- Aletheia branding
- Short product statement
- Student login
- Admin login

Keep the landing page simple.

Do not spend presentation time explaining every UI element.

---

# 4. STEP 2 — Student Dashboard

Login as the demo student.

Show:

### Greeting

```text
Good morning, Rahul.
Here's what needs your attention.

Then show:

Profile completion
Scholarship matches
Document readiness
Current application
Important action

The dashboard should immediately communicate:

What should this student do next?

5. STEP 3 — Scholarship Discovery

Open:

Scholarships

Show multiple scholarship cards.

Each card should communicate:

Scholarship name
Type
Short description
Match status
Eligibility highlights
Document readiness

Example:

Potential Match

5 / 7 documents ready

✓ ST category
✓ B.Tech
✓ Income criteria
⚠ 2 documents required

The important demonstration is not simply that scholarships exist.

It is that the system explains why a scholarship is relevant.

6. STEP 4 — Scholarship Detail

Open the primary scholarship.

Show:

Why this may match you
✓ Scheduled Tribe category
✓ Undergraduate student
✓ Required course level
✓ Family income within listed criteria

Then:

Required Documents
✓ ST Certificate
✓ Marksheet
✓ College ID
✓ Bank Proof
✓ Admission Proof
○ Income Certificate
○ Bonafide Certificate

Then:

5 / 7 documents ready

Click:

Start Application

7. STEP 5 — Document Wallet

Before applying, open Documents.

Demonstrate:

My Documents

ST Certificate          Verified
Class XII Marksheet     Verified
College ID              Verified
Bank Proof              Verified
Admission Proof         Verified
Income Certificate      Missing
Bonafide Certificate    Missing

Optional:

Click:

Connect DigiLocker

Show the demo connection.

Import one synthetic document.

The important point:

The same document should become available for reuse in the scholarship application.

8. STEP 6 — Application

Start the application.

Show the wizard:

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

Do not manually fill every field during the presentation.

Pre-populate known student information where appropriate.

This makes the demonstration faster and shows that the profile is reusable.

9. STEP 7 — Application Review

Before submitting, show the review screen.

Sections:

Personal information
Education
Household
Documents
Eligibility
Declaration

Demonstrate:

The student can review everything before submission.

Then click:

Submit Application

10. STEP 8 — Application Tracking

Show:

Application #TRB-2026-00841

Submitted
      ✓
Document Verification
      ●
Institute Verification
      ○
Under Review
      ○
Decision Pending
      ○
Completed

This demonstrates transparency after submission.

11. STEP 9 — Switch to Admin

Log out.

Login as admin.

Show:

Admin Overview

Example statistics:

Total Applications       128
Pending Review            21
Documents Attention        8
Deficient Applications     5
Completed                 64

These numbers should be seeded demo data, not fake live government statistics.

Clearly treat them as demonstration data.

12. STEP 10 — Review Queue

Open:

Applications

Find:

TRB-2026-00841
Rahul Kumar
[Scholarship Name]
Under Review

Open it.

13. STEP 11 — Admin Application Review

This is one of the most important screens.

Show:

Student Overview

The administrator can inspect the student's submitted information.

Eligibility

Show the rules that matched.

Documents
ST Certificate          ✓ Verified
Marksheet               ✓ Verified
College ID              ✓ Verified
Income Certificate      ⚠ Needs Attention
AI Pre-Scrutiny

Show assistive findings.

Example:

Document classified as:
Income Certificate

Required fields detected:
✓ Student/Applicant name
✓ Income amount
✓ Issuing authority

Potential issue:
Name appears as "Rahul K."
while profile contains "Rahul Kumar."

The system should present this as something for human review.

14. STEP 12 — Deficiency

Admin clicks:

Request Correction

Create:

Income Certificate

Issue:
Document contains a name variation.

Action required:
Upload a corrected/valid document.

Application status becomes:

DEFICIENT
15. STEP 13 — Return to Student

Switch back to Rahul's account.

Open:

Applications

Show:

Action Required

Your application needs a correction.

Income Certificate
Reason: Name variation detected.

[Fix Issue]

This creates the strongest workflow connection in the demo:

Student
    ↓
Application
    ↓
Admin Review
    ↓
Deficiency
    ↓
Student Action
16. The Core Product Loop

The complete system should demonstrate:

PROFILE
   ↓
MATCH
   ↓
DOCUMENT READINESS
   ↓
APPLICATION
   ↓
SUBMISSION
   ↓
ADMIN REVIEW
   ↓
AI ASSISTANCE
   ↓
DEFICIENCY
   ↓
STUDENT CORRECTION
   ↓
STATUS TRACKING

This is the core Aletheia story.

17. What To Emphasize During Presentation

Emphasize these concepts:

1. Personalized discovery

The student does not need to manually search through every scholarship.

The system uses profile information to identify potentially relevant schemes.

2. Explainable matching

The system should explain:

Why does this scholarship appear for me?

Instead of producing an unexplained AI score.

3. Document readiness

The student can see:

What do I already have?

and:

What am I missing?

before starting the application.

4. Reusable documents

A document uploaded once can be reused across applications.

5. Guided application

The system reduces unnecessary repetition by using information already present in the student profile.

6. Transparent tracking

The student can see where the application currently stands.

7. Human-in-the-loop AI

AI assists administrators with document understanding and consistency checks.

It does not independently make consequential eligibility or rejection decisions.

8. Closed-loop workflow

A deficiency created by the administrator becomes an actionable task for the student.

This makes the system more than a scholarship search page.

18. What NOT To Say

Do not claim:

"This is fully integrated with DigiLocker" unless it actually is.
"AI verifies all documents automatically."
"AI detects fraud."
"The eligibility decision is made by AI."
"These are live government statistics" for seed data.
"This system is production-ready."
"This guarantees scholarship eligibility."
"This automatically approves applications."

Use:

"Prototype"
"AI-assisted"
"Rule-based eligibility matching"
"Mock DigiLocker integration"
"Human review"
"Demonstration data"

where appropriate.

19. Suggested 3–5 Minute Demo
0:00–0:30

Landing page + problem introduction.

0:30–1:15

Student dashboard.

1:15–2:00

Scholarship matching + explainable eligibility + document readiness.

2:00–2:45

Application + submission + tracking.

2:45–3:45

Admin review + AI document findings + deficiency.

3:45–4:15

Return to student + correction request.

4:15–5:00

Explain architecture, scalability direction, and future integrations.

20. Backup Demo Strategy

If something breaks during the presentation:

Use seeded data.

The application should have a deterministic demonstration state.

Do not depend on:

external APIs
live government websites
live AI APIs
live DigiLocker
internet connectivity for core workflow

The core demo should work without external services.

21. Demo Reset

Create a way to reset the demo database/state.

At minimum:

seed command
demo account
deterministic application
predictable document states

The demo should always return to:

Student:
Rahul Kumar

Application:
TRB-2026-00841

Status:
UNDER_REVIEW

Documents:
5 verified/available
2 requiring action
22. Final Presentation Principle

Do not present Aletheia as:

"Here are all the features we built."

Present it as:

"Here is what happens to a student from discovering an eligible opportunity to receiving feedback on their application."

Then demonstrate the entire journey.

The product should tell one continuous story.

23. Final V1 Success Condition

A person unfamiliar with the project should be able to understand the following after the demo:

I create my profile.
        ↓
Aletheia finds potentially relevant scholarships.
        ↓
It explains why they may match me.
        ↓
It tells me which documents I already have.
        ↓
I apply using those documents.
        ↓
I track the application.
        ↓
An administrator reviews it.
        ↓
AI assists the administrator.
        ↓
If something is wrong, I am told exactly what to fix.