

## 1. Purpose

This document defines the major user journeys and interaction flows for Aletheia.

It describes:

- Who performs an action
- Where the action starts
- What the user does
- What the system does
- What information changes
- Where the user goes next
- What happens in success, incomplete, and error states

These flows are the behavioral source of truth for the application.

The UI should be designed around these flows rather than creating isolated pages first.

---

# 2. User Roles

Aletheia has two primary roles.

## 2.1 Student

The student uses Aletheia to:

- Create and maintain a profile
- Discover relevant scholarships/fellowships
- Understand eligibility
- Manage documents
- Check document readiness
- Apply
- Track applications
- Respond to deficiencies

---

## 2.2 Administrator

The administrator uses Aletheia to:

- Monitor applications
- Review student applications
- Inspect documents
- Review AI-assisted findings
- Request corrections
- Update application status

The administrator is an authorized reviewer within the prototype.

---

# 3. Global Application Structure

## Student Navigation

The primary student navigation should contain:

```text
Dashboard
Scholarships
My Applications
Documents
Profile
Notifications
````

Optional:

```text
Help
Settings
```

---

## Administrator Navigation

The administrator navigation should contain:

```text
Overview
Applications
Review Queue
Documents / Verification
Activity
```

Optional:

```text
Analytics
Scheme Configuration
Settings
```

Optional modules should only be implemented if the P0 workflow is already complete.

---

# 4. Global Student Journey

The complete primary student journey is:

```text
Landing
   ↓
Register / Login
   ↓
Create Profile
   ↓
Student Dashboard
   ↓
Scholarship Matching
   ↓
Scholarship Details
   ↓
Eligibility + Document Readiness
   ↓
Document Wallet
   ↓
Upload / Add Documents
   ↓
Application
   ↓
Review
   ↓
Submit
   ↓
Application Tracking
   ↓
Possible Deficiency
   ↓
Correction
   ↓
Updated Application Status
```

This is the most important end-to-end flow in the application.

---

# 5. Flow A — Landing Page

## Entry

Unauthenticated user visits Aletheia.

## User sees

* Aletheia branding
* Short explanation of the platform
* Primary call-to-action
* Scholarship discovery value proposition
* Document wallet concept
* AI-assisted verification concept
* Login/Register actions

## Primary actions

```text
[Create Profile]
[Sign In]
[Explore Scholarships]
```

## Behavior

### Create Profile

Navigate to:

```text
/register
```

### Sign In

Navigate to:

```text
/login
```

### Explore Scholarships

Navigate to scholarship discovery.

If the user is not authenticated, the system may show general scheme information but must not display personalized eligibility.

---

# 6. Flow B — Student Registration

## Entry

Student selects:

```text
Create Profile
```

## Screen

Registration form.

Required:

* Name
* Email
* Mobile number
* Password

## Action

Student submits registration.

## System

1. Validate fields.
2. Check whether account already exists.
3. Create student account.
4. Create initial student profile.
5. Authenticate the user.
6. Redirect to profile setup.

## Next

```text
Profile Setup
```

## Error states

If email already exists:

```text
An account with this email already exists.
[Sign In]
```

If required information is invalid:

```text
Please correct the highlighted fields.
```

---

# 7. Flow C — Student Login

## Entry

Student selects:

```text
Sign In
```

## User enters

* Email
* Password

## System

1. Validate credentials.
2. Authenticate user.
3. Identify user role.
4. Redirect according to role.

### Student

```text
/student/dashboard
```

### Administrator

```text
/admin/dashboard
```

## Failed login

Display:

```text
Email or password is incorrect.
```

Do not reveal whether an account exists.

---

# 8. Flow D — Profile Setup

## Entry

New student finishes registration.

## Screen

Multi-section profile setup.

### Step 1 — Personal

```text
Full Name
Date of Birth
Gender
Mobile
Email
State
District
```

### Step 2 — Category

```text
Category
ST Status
PVTG Status (if applicable)
```

### Step 3 — Education

```text
Education Level
Course
Institution
Academic Year
Previous Qualification
Percentage / CGPA
```

### Step 4 — Household

```text
Annual Family Income
Household Size
Primary Occupation
```

## Action

Student saves profile.

## System

1. Validate required fields.
2. Save profile.
3. Calculate available scholarship matches.
4. Calculate initial document requirements.
5. Redirect to dashboard.

## Next

```text
Student Dashboard
```

---

# 9. Flow E — Student Dashboard

## Purpose

The dashboard should answer:

> "What should I do next?"

## Dashboard should show

### Profile Completion

Example:

```text
PROFILE
85% COMPLETE
```

### Scholarship Matches

Example:

```text
3 SCHOLARSHIPS MAY MATCH YOUR PROFILE
```

### Document Readiness

Example:

```text
6 / 8 DOCUMENTS READY
```

### Active Application

Example:

```text
1 APPLICATION UNDER REVIEW
```

### Actions Required

Example:

```text
1 ACTION REQUIRED

Upload updated income certificate.
```

## Primary dashboard actions

```text
[View Matches]
[Complete Profile]
[Manage Documents]
[Track Application]
```

The dashboard should prioritize actions rather than displaying unnecessary statistics.

---

# 10. Flow F — Scholarship Discovery

## Entry

Student selects:

```text
Scholarships
```

## Screen

Scholarship discovery page.

Each scholarship card should show:

* Scheme name
* Short description
* Target group
* Match state
* Document readiness
* Application state

Example:

```text
TOP CLASS EDUCATION

Potential Match

5 / 7 documents ready

[View Details]
```

---

## Search

Student can search by:

* Scheme name
* Keyword

---

## Filters

Possible filters:

* Education level
* Scholarship type
* State
* Application status
* Match status

---

## Match states

Use understandable states such as:

```text
Potential Match
Action Required
Not Currently Matching
Already Applied
```

Do not rely only on numerical percentages.

---

# 11. Flow G — Scholarship Matching

## Entry

Student opens personalized scholarship results.

## System

The matching engine evaluates the student's profile against the configured scheme rules.

Relevant fields may include:

* ST status
* Education
* Course
* Institution
* Family income
* Scheme-specific requirements

## Result

Display:

```text
WHY THIS MAY MATCH

✓ ST category
✓ Education requirement
✓ Income condition
✓ Institution condition
```

If something is missing:

```text
NEEDS ATTENTION

○ Income information
○ Institution information
```

If a requirement is not satisfied:

```text
CURRENTLY NOT ELIGIBLE

Income condition is above the configured threshold.
```

The system should provide the reason.

---

# 12. Flow H — Scholarship Details

## Entry

Student selects:

```text
View Details
```

## Screen sections

```text
Scholarship Overview
Eligibility
Why You Match
Required Documents
Document Readiness
Application Status
```

---

## Eligibility Section

Show the relevant rules in readable language.

Example:

```text
ELIGIBILITY

✓ ST category
✓ Current undergraduate student
✓ Required academic level
✓ Income condition
```

---

## Document Section

Show required documents.

Example:

```text
DOCUMENTS

✓ ST Certificate
✓ Class XII Marksheet
✓ College ID
✓ Bank Proof
○ Income Certificate
○ Fee Receipt
```

---

## Primary action

If ready:

```text
[Start Application]
```

If documents are missing:

```text
[Complete Documents]
```

The user should still be able to start an application if the workflow permits incomplete preparation, but the system must clearly identify what is missing before final submission.

---

# 13. Flow I — Document Wallet

## Entry

Student selects:

```text
Documents
```

## Screen

The document wallet displays all stored documents.

Suggested grouping:

```text
Identity
Category
Education
Income
Bank
Institution
Other
```

Each document card should display:

* Document name
* Category
* Source
* Upload date
* Status
* Expiry date if applicable

---

## Example

```text
ST CERTIFICATE

Category:
ST / Category

Source:
Uploaded

Status:
Verified

Updated:
12 Sep 2026
```

---

# 14. Flow J — Add Document

## Entry

Student selects:

```text
Add Document
```

## Options

```text
Upload Document
Connect DigiLocker
```

---

## Upload flow

```text
Select Document Type
        ↓
Select File
        ↓
Upload
        ↓
Processing
        ↓
AI Classification / Extraction
        ↓
Review Extracted Information
        ↓
Save to Wallet
```

---

# 15. Flow K — Document Upload

## Step 1

Student selects document type.

Example:

```text
Income Certificate
```

## Step 2

Student selects file.

Supported prototype formats:

```text
PDF
JPG
JPEG
PNG
```

## Step 3

System uploads file.

Display:

```text
Uploading...
```

## Step 4

System processes the document.

Display:

```text
Analyzing document...
```

## Step 5

AI attempts classification and extraction.

Example:

```text
DOCUMENT DETECTED

Income Certificate

Extracted Information

Name:
Rahul Kumar

Annual Income:
₹4,20,000

Financial Year:
2025–26

Confidence:
96%
```

## Step 6

Student reviews information.

Actions:

```text
[Confirm & Save]
[Edit Information]
[Replace Document]
```

## Step 7

Document enters wallet.

---

# 16. Flow L — Document Verification State

After upload, a document can have one of the following states:

```text
Uploaded
Processing
Verified
Needs Attention
Rejected / Invalid
```

The prototype should prefer:

```text
Needs Attention
```

rather than immediately declaring a document fraudulent.

---

# 17. Flow M — DigiLocker Prototype

## Entry

Student selects:

```text
Connect DigiLocker
```

## Prototype flow

Display:

```text
CONNECTING TO DIGILOCKER
```

Then:

```text
AVAILABLE DOCUMENTS

✓ Class XII Marksheet
✓ ST Certificate
○ Income Certificate
```

Student selects available documents.

## Action

```text
[Add Selected Documents]
```

## System

Adds selected documents to the student's document wallet.

Each document should retain a source label:

```text
Source: DigiLocker
```

The prototype must clearly indicate that this is a simulated/demo integration if a live authorized integration is not available.

---

# 18. Flow N — Document Readiness

## Entry

Student opens a scholarship.

## System

Compare:

```text
Required Documents
```

against:

```text
Student Document Wallet
```

## Result

Example:

```text
DOCUMENT READINESS

5 / 7 READY

✓ ST Certificate
✓ Marksheet
✓ College ID
✓ Bank Proof
✓ Admission Proof

MISSING

○ Income Certificate
○ Fee Receipt
```

## Action

Selecting a missing document should take the student directly to:

```text
Add Document
```

Selecting an available document should open its details.

---

# 19. Flow O — Start Application

## Entry

Student selects:

```text
Start Application
```

## System

1. Identify selected scholarship.
2. Load student profile.
3. Load required documents.
4. Load application fields.
5. Create draft application.
6. Open application wizard.

## Application status

```text
Draft
```

---

# 20. Flow P — Application Wizard

The application should use the following structure:

```text
01 Personal
02 Education
03 Household
04 Documents
05 Review
06 Submit
```

---

## Step 1 — Personal

Pre-fill information from the student profile.

Student can review/edit if permitted.

---

## Step 2 — Education

Pre-fill:

* Education level
* Course
* Institution
* Academic year
* Previous qualification

Student reviews the information.

---

## Step 3 — Household

Show:

* Family income
* Household size
* Occupation
* Other required scheme-specific information

---

## Step 4 — Documents

Show all required documents.

Example:

```text
✓ ST Certificate
✓ Marksheet
✓ Bank Proof
✓ Admission Proof
✓ College ID
✓ Income Certificate
✓ Fee Receipt
```

If a document is missing:

```text
○ Income Certificate

[Add Document]
```

---

# 21. Flow Q — Application Validation

Before allowing final submission, the system performs validation.

Check:

```text
Required profile fields
Required application fields
Required documents
Eligibility requirements
Document readiness
```

---

## If everything is complete

Display:

```text
APPLICATION READY

✓ Profile complete
✓ Required information complete
✓ Required documents available
✓ Eligibility requirements satisfied

[Review Application]
```

---

## If something is incomplete

Display:

```text
2 ITEMS REQUIRE ATTENTION

○ Income Certificate
○ Bank Information
```

Each issue should be clickable.

The user should be taken directly to the relevant correction point.

---

# 22. Flow R — Application Review

## Entry

Student reaches Review step.

## Display

A complete application summary.

Sections:

```text
Personal Information
Education
Household
Eligibility
Documents
Declaration
```

The student should be able to edit any section before submission.

---

# 23. Flow S — Application Submission

## Entry

Student selects:

```text
Submit Application
```

## System

1. Perform final validation.
2. Confirm required documents.
3. Save application.
4. Generate application ID.
5. Change status from Draft → Submitted.
6. Record submission time.
7. Create activity record.
8. Redirect to confirmation.

---

## Confirmation

Display:

```text
APPLICATION SUBMITTED

Your application has been successfully submitted.

Application ID

TRB-2026-00841

Current Status

Submitted

[Track Application]
```

---

# 24. Flow T — Application Tracking

## Entry

Student selects:

```text
Track Application
```

## Screen

Display a timeline.

Example:

```text
APPLICATION SUBMITTED
        ●
        │
DOCUMENT VERIFICATION
        ◉ CURRENT
        │
INSTITUTE VERIFICATION
        ○
        │
UNDER REVIEW
        ○
        │
DECISION
        ○
```

---

## Current stage

The current stage should be visually prominent.

---

## Student action required

If a deficiency exists:

```text
ACTION REQUIRED

Income Certificate needs correction.

[Resolve Issue]
```

---

# 25. Flow U — Administrator Login

## Entry

Administrator opens admin login.

## User enters

* Email
* Password

## System

1. Authenticate.
2. Check administrator role.
3. Redirect to admin dashboard.

Unauthorized users must not access administrator routes.

---

# 26. Flow V — Administrator Dashboard

## Entry

Administrator logs in.

## Dashboard should show

```text
TOTAL APPLICATIONS

UNDER REVIEW

DEFICIENT

REQUIRES ATTENTION
```

---

## Recent activity

Show recent events such as:

```text
Application submitted
Correction received
Document uploaded
Deficiency created
Status updated
```

---

## Primary action

```text
[Review Applications]
```

The dashboard should prioritize operational information rather than decorative analytics.

---

# 27. Flow W — Administrator Application Queue

## Entry

Administrator selects:

```text
Applications
```

## List

Each row/card should show:

```text
Application ID
Student
Scholarship
Submitted Date
Status
Review State
```

---

## Search

Administrator can search:

* Application ID
* Student name

---

## Filters

Administrator can filter by:

* Scholarship
* Status
* Review state
* Deficiency state

---

## Open application

Selecting an application opens:

```text
Application Review
```

---

# 28. Flow X — Administrator Application Review

## Entry

Administrator selects an application.

## Layout

The review interface should organize information into:

```text
Student Overview
Application Details
Eligibility
Documents
AI Findings
Activity
Actions
```

---

# 29. Flow Y — Administrator Document Review

## Entry

Administrator opens Documents section.

## For each document show

```text
Document
Type
Source
Upload Date
Status
Extracted Information
```

Where available:

```text
AI EXTRACTION

Name:
Rahul Kumar

Income:
₹4,20,000

Financial Year:
2025–26

Confidence:
96%
```

---

# 30. Flow Z — AI Pre-Scrutiny

## Entry

Administrator opens an application.

## System

AI-assisted checks may run against:

* Required documents
* Extracted fields
* Student profile
* Scheme requirements
* Cross-document consistency

## Result

Example:

```text
AI PRE-SCRUTINY

✓ Required documents present
✓ Income information found
✓ Education information found
✓ Profile information consistent

⚠ Potential name variation detected
```

---

## Administrator response

Possible actions:

```text
[Review Issue]
[Request Correction]
[Mark Reviewed]
```

The AI finding must not automatically change the final application decision.

---

# 31. Flow AA — Deficiency Request

## Entry

Administrator identifies an issue.

## Administrator selects

```text
Request Correction
```

## Form

```text
Issue Type
Affected Document / Field
Description
Required Action
```

Example:

```text
Document:
Income Certificate

Issue:
Financial year does not match the required period.

Action:
Upload an updated income certificate.
```

## Action

Administrator selects:

```text
[Send Correction Request]
```

---

## System

1. Save deficiency.
2. Change application status to:

```text
Deficient
```

3. Create notification.
4. Add activity entry.
5. Display the deficiency to the student.

---

# 32. Flow AB — Student Receives Deficiency

## Entry

Student opens dashboard after administrator sends a correction request.

## Dashboard

Display:

```text
ACTION REQUIRED

Application TRB-2026-00841

Income Certificate needs correction.

[Resolve]
```

---

## Student opens issue

Display:

```text
CORRECTION REQUIRED

Income Certificate

Issue:
Financial year does not match the required period.

Action:
Upload an updated certificate.

[Upload Replacement]
```

---

# 33. Flow AC — Student Resolves Deficiency

## Entry

Student selects:

```text
Upload Replacement
```

## System

1. Open upload flow.
2. Student uploads new document.
3. Process document.
4. Associate new document with deficiency.
5. Update deficiency state.
6. Update application status.

Possible new status:

```text
Correction Received
```

---

## Student sees

```text
CORRECTION SUBMITTED

Your updated document has been submitted for review.

Status:
Correction Received
```

---

# 34. Flow AD — Administrator Reviews Correction

## Entry

Administrator opens application with correction received.

## System highlights:

```text
NEW CORRECTION RECEIVED
```

Administrator opens the updated document.

## Actions

```text
[Accept Correction]
[Request Further Correction]
```

---

## If accepted

Application continues to the next configured status.

---

## If more information is needed

A new deficiency can be created.

---

# 35. Flow AE — Application Status Update

## Entry

Administrator selects a new application status.

## System

1. Validate allowed transition.
2. Save new status.
3. Add activity record.
4. Notify student.
5. Update student tracking timeline.

Example:

```text
Previous:
Document Verification

New:
Institute Verification
```

Student immediately sees the updated stage.

---

# 36. Flow AF — Student Notification

When an important application event occurs, the student should receive an in-app notification.

Examples:

```text
Application Submitted
Document Verified
Correction Required
Correction Received
Application Status Updated
```

Notifications should link directly to the relevant application or action.

---

# 37. Flow AG — Profile Update After Application

If a student updates profile information after submitting an application, the system must avoid silently changing already-submitted application data.

The prototype should treat:

```text
Student Profile
```

and

```text
Submitted Application Snapshot
```

as separate records.

This prevents a later profile edit from unexpectedly modifying historical application information.

---

# 38. Flow AH — Multiple Scholarship Applications

A student may apply to multiple schemes.

The student should have:

```text
My Applications
```

with each application displayed separately.

Example:

```text
TOP CLASS EDUCATION
Application:
TRB-2026-00841
Status:
Under Review

POST-MATRIC SCHOLARSHIP
Application:
TRB-2026-00912
Status:
Submitted
```

Documents should remain reusable through the document wallet.

The same document should not need to be uploaded repeatedly unless the scheme requires a different version.

---

# 39. Flow AI — Returning Student

When an existing student logs in:

```text
Login
 ↓
Dashboard
 ↓
Existing Profile
 ↓
Existing Documents
 ↓
Existing Applications
```

The system must not force the student through registration again.

---

# 40. Flow AJ — Missing Profile Information

If the student tries to use scholarship matching with an incomplete profile:

Display:

```text
COMPLETE YOUR PROFILE

We need a few more details to identify relevant scholarships.

Profile:
68% complete

Missing:
○ Education information
○ Family income

[Complete Profile]
```

The student should be taken directly to the missing sections.

---

# 41. Flow AK — Missing Document During Application

If a required document is missing:

```text
REQUIRED DOCUMENT MISSING

Income Certificate

This document is required before final submission.

[Add Document]
```

After the student adds the document:

```text
Document added successfully.

Application readiness updated.
```

The user returns to the application.

---

# 42. Flow AL — Failed Upload

If a document upload fails:

```text
UPLOAD FAILED

The document could not be uploaded.

Possible reasons:
- Unsupported file type
- File too large
- Temporary server issue

[Try Again]
```

The application must not lose previously completed information.

---

# 43. Flow AM — AI Processing Failure

If AI extraction fails:

```text
DOCUMENT COULD NOT BE ANALYZED

We could not reliably extract information from this document.

You can still:
[Enter Information Manually]
[Replace Document]
```

AI failure must not make the entire application unusable.

---

# 44. Flow AN — Low AI Confidence

If extraction confidence is low:

```text
MANUAL VERIFICATION RECOMMENDED

The system could not confidently read this document.

Confidence:
Low

[Review Document]
```

The system must not automatically reject the document.

---

# 45. Flow AO — Unauthorized Admin Access

If a student attempts to open an administrator route:

```text
ACCESS RESTRICTED

You do not have permission to access this area.

[Return to Dashboard]
```

The route must also be protected at the application/backend level where applicable.

---

# 46. Flow AP — Empty Document Wallet

If the student has no documents:

```text
YOUR DOCUMENT WALLET IS EMPTY

Add your important documents once and reuse them across applications.

[Upload Document]
[Connect DigiLocker]
```

---

# 47. Flow AQ — No Scholarship Matches

If no scholarship currently matches:

```text
NO CURRENT MATCHES

We could not find a scholarship that currently matches the information in your profile.

You can:

[Review Profile]
[Explore All Schemes]
```

Do not display a misleading match.

---

# 48. Flow AR — Application Completed

When the application reaches its final configured state:

```text
APPLICATION COMPLETED

Application:
TRB-2026-00841

Status:
Completed

[View Application]
```

The full activity timeline remains available.

---

# 49. Primary Hackathon Demo Flow

The primary demo should use one synthetic student and one primary scholarship.

Recommended flow:

```text
1. Login as Rahul Kumar
          ↓
2. Open Student Dashboard
          ↓
3. Show 3 potential scholarship matches
          ↓
4. Open primary scholarship
          ↓
5. Show eligibility explanation
          ↓
6. Show "5 / 7 documents ready"
          ↓
7. Open Document Wallet
          ↓
8. Upload Income Certificate
          ↓
9. Show AI extraction
          ↓
10. Document readiness changes to "6 / 7"
          ↓
11. Add final required document
          ↓
12. Readiness becomes "7 / 7"
          ↓
13. Start Application
          ↓
14. Show pre-filled profile information
          ↓
15. Complete application
          ↓
16. Review
          ↓
17. Submit
          ↓
18. Show generated Application ID
          ↓
19. Open Tracking
          ↓
20. Switch to Administrator
          ↓
21. Open same application
          ↓
22. Show AI pre-scrutiny
          ↓
23. Demonstrate a potential discrepancy
          ↓
24. Administrator requests correction
          ↓
25. Switch back to Student
          ↓
26. Show "Action Required"
          ↓
27. Upload corrected document
          ↓
28. Switch back to Administrator
          ↓
29. Review correction
          ↓
30. Update application status
          ↓
31. Show updated student tracking timeline
```

This is the primary end-to-end demonstration path.

---

# 50. Demo Data Requirements

The prototype should use deterministic synthetic data so that the demo behaves consistently.

Primary demo student:

```text
Name:
Rahul Kumar

Category:
ST

State:
Gujarat

Course:
B.Tech

Academic Year:
3rd Year

Family Income:
₹4,20,000
```

Primary demo application:

```text
Application ID:
TRB-2026-00841
```

The exact scholarship name and eligibility values should be based on the configured prototype scheme data and verified source-of-truth documents.

---

# 51. Navigation Principles

The user should never become trapped in a flow.

Every major process should provide:

* Back
* Save/Continue where appropriate
* Cancel where appropriate
* Clear next action

Long forms should preserve entered information when navigating between steps.

---

# 52. State Persistence

The following information must persist appropriately:

## Student

* Profile
* Documents
* Scholarship matches
* Applications
* Notifications

## Application

* Draft data
* Submitted data
* Status
* Required documents
* Deficiencies
* Activity history

## Documents

* File reference
* Document type
* Source
* Metadata
* Processing status
* Verification state

---

# 53. Important Data Separation

The application must distinguish between:

```text
Student Profile
```

```text
Document Wallet
```

```text
Scholarship Scheme
```

```text
Application
```

```text
Application Document Association
```

```text
Deficiency
```

```text
Notification
```

These should not be treated as one giant object.

A student's reusable profile and documents are separate from an individual submitted application.

---

# 54. General Error Principle

Errors should be recoverable whenever possible.

The system should:

* Explain what went wrong.
* Preserve existing user input.
* Provide a clear next action.
* Avoid generic "Something went wrong" messages when a useful explanation is possible.

---

# 55. General AI Principle

AI should appear as an assistant within existing workflows.

It should not create a separate "AI page" that has no connection to the application.

AI should appear where it provides value:

```text
Document Upload
       ↓
AI Extraction
       ↓
Document Wallet
       ↓
Application Verification
       ↓
Administrator Review
```

The AI layer should remain integrated with the actual product workflow.

---

# 56. General UX Principle

Every major screen should answer one of these questions:

```text
What can I do here?
What is my current status?
What is missing?
Why is this relevant?
What should I do next?
```

If a screen does not answer a useful user question, it should not exist merely for visual completeness.

---

# 57. End-to-End Product Model

The complete Aletheia experience should behave as one connected system:

```text
                 ┌─────────────────┐
                 │  STUDENT PROFILE│
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    MATCHING     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ SCHOLARSHIP     │
                 │    DETAILS      │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ DOCUMENT WALLET │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    READINESS    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   APPLICATION   │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    SUBMIT       │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    TRACKING     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ ADMIN REVIEW    │
                 └────────┬────────┘
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
          ┌──────────────┐  ┌───────────────┐
          │   VERIFIED   │  │  DEFICIENCY   │
          └──────────────┘  └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │   CORRECTION  │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │ ADMIN REVIEW   │
                            └───────────────┘
```

This connected workflow is the core behavioral architecture of Aletheia.

```


