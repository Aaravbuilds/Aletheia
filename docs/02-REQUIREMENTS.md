
# Aletheia — Requirements Specification

## 1. Purpose

This document defines the functional and non-functional requirements for Aletheia, the SIH26239 prototype.

The requirements are divided into:

- MUST HAVE — required for the hackathon MVP
- SHOULD HAVE — useful if time remains
- WON'T HAVE — explicitly excluded from the one-day prototype

The application must prioritize a complete, demonstrable end-to-end workflow over a large number of partially implemented features.

---

# 2. Product Requirements

## 2.1 Core Product Goal

Aletheia must provide a unified scholarship/fellowship experience in which a student can:

1. Create a profile.
2. Discover potentially relevant scholarships/fellowships.
3. Understand why a scheme matches their profile.
4. See which required documents are already available.
5. Add or retrieve documents.
6. Complete an application.
7. Submit the application.
8. Track its progress.
9. Respond to deficiencies or correction requests.

Authorized administrators must be able to:

1. View application statistics.
2. View and filter applications.
3. Open an individual application.
4. Inspect submitted documents.
5. Review AI-assisted findings.
6. Request corrections/deficiencies.
7. Update application status.

---

# 3. MUST HAVE Requirements

# 3.1 Student Authentication

The system MUST provide a basic student authentication flow.

Required functionality:

- Student registration
- Login
- Logout
- Persistent user session
- Demo/test account support

For the prototype, authentication does not need to represent a production government identity system.

---

# 3.2 Student Profile

The system MUST allow students to create and edit a profile.

## Personal Information

Required fields:

- Full name
- Date of birth
- Gender
- Mobile number
- Email
- State
- District

## Category Information

Required fields:

- Social category
- ST status
- Optional PVTG indicator where relevant to the prototype

## Education Information

Required fields:

- Current education level
- Course/program
- Academic year
- Institution
- Previous qualification
- Percentage/CGPA

## Household Information

Required fields:

- Annual family income
- Number of household members
- Primary household occupation

The profile must be reusable throughout the application.

The student must not be required to repeatedly enter the same profile information for every scholarship.

---

# 3.3 Scholarship Discovery

The system MUST provide a scholarship/fellowship discovery interface.

Students MUST be able to:

- View potentially relevant schemes
- Search schemes
- Filter schemes
- Open scheme details
- View eligibility conditions
- View required documents
- See document readiness

The scholarship list must not simply display unrelated schemes.

The primary experience should be personalized using the student's profile.

---

# 3.4 Scholarship Matching

The system MUST compare the student's profile against configured scheme rules.

The matching system MUST consider relevant fields such as:

- ST/category status
- Education level
- Course
- Institution
- Family income
- Other configured scheme-specific conditions

The system MUST explain why a scholarship appears as a match.

Example:

```text
WHY THIS SCHOLARSHIP MAY MATCH

✓ ST category
✓ Education requirement
✓ Income condition
✓ Institution condition

ACTION REQUIRED

2 documents are still missing.
````

The system SHOULD distinguish between:

* Likely match
* Potential match / action required
* Not currently matching

The system MUST NOT present an unexplained AI score as the sole reason for eligibility.

---

# 3.5 Scholarship Detail

Every scholarship/fellowship detail page MUST display:

* Scheme name
* Short description
* Target student group
* Key eligibility conditions
* Required documents
* Student-specific eligibility status
* Student-specific document readiness
* Application call-to-action

The page SHOULD include a clear "Why this matches" section.

The interface MUST clearly distinguish official scheme information from prototype/demo content where necessary.

---

# 3.6 Document Wallet

The system MUST provide a reusable document wallet.

The wallet MUST allow students to:

* View documents
* Upload documents
* Categorize documents
* View document status
* Open document details
* Replace/update documents

Suggested categories:

* Identity
* Category / ST
* Education
* Income / Household
* Bank
* Institution / Admission
* Other

Each document SHOULD have a visible state.

Supported states:

```text
Available
Uploaded
Verified
Needs Attention
Missing
Expiring / Outdated
```

The document wallet must be reusable across multiple applications.

A document already present in the wallet SHOULD be available for reuse when another scholarship requires the same document.

---

# 3.7 Document Upload

The system MUST allow upload of common document types.

Prototype-supported formats:

* PDF
* JPG/JPEG
* PNG

The upload interface MUST show:

* Selected file
* Upload progress or loading state
* Upload completion
* Upload failure state

After successful upload, the document must appear in the student's document wallet.

---

# 3.8 AI-Assisted Document Processing

The system SHOULD use AI to assist with document processing.

AI functionality should include:

### Document Classification

Determine the likely document type.

Example:

```text
Uploaded file
↓
Likely document type:
Income Certificate
```

### Information Extraction

Where supported, extract useful fields such as:

* Name
* Income
* Financial year
* Institution
* Course
* Certificate type
* Issuing authority
* Relevant dates

### Confidence

The system SHOULD provide an extraction confidence indicator.

Example:

```text
Extraction Confidence
96%
```

AI output must be treated as assistance and not as an unquestionable source of truth.

---

# 3.9 Document Consistency Checking

The system SHOULD compare document information with:

* Student profile
* Other submitted documents
* Configured scheme requirements

Potential findings may include:

* Name variation
* Missing field
* Inconsistent information
* Potentially outdated document
* Unexpected document type

Example:

```text
PROFILE
Rahul Kumar

DOCUMENT
Rahul Kumar Singh

RESULT
Potential name discrepancy

RECOMMENDATION
Manual verification
```

The system MUST NOT automatically label a discrepancy as fraud.

The system MUST NOT automatically reject an applicant solely because of an AI-detected discrepancy.

---

# 3.10 DigiLocker Experience

The system SHOULD provide a DigiLocker connection experience.

For the one-day prototype:

* The connector MAY be simulated.
* The interface MUST clearly communicate that it is a prototype/mock connector if no authorized production integration is available.
* The system MUST NOT falsely claim to have live government integration.

The prototype flow should demonstrate:

```text
Connect DigiLocker
↓
Documents available
↓
Select documents
↓
Add selected documents to wallet
```

The UI SHOULD distinguish between:

* DigiLocker-sourced documents
* User-uploaded documents

---

# 3.11 Document Readiness

The system MUST calculate document readiness for each scholarship.

Example:

```text
TOP CLASS EDUCATION

DOCUMENT READINESS

5 / 7 READY

✓ ST Certificate
✓ Marksheet
✓ Bank Proof
✓ Admission Proof
✓ Bonafide

○ Income Certificate
○ Fee Receipt
```

The readiness view MUST clearly tell the student:

* Number of required documents
* Number already available
* Number missing
* Which documents are missing

The student SHOULD be able to directly navigate from a missing document to the upload/add-document flow.

---

# 3.12 Application Wizard

The system MUST provide a structured multi-step application flow.

Recommended steps:

```text
01 Personal
02 Education
03 Household
04 Documents
05 Review
06 Submit
```

The application MUST reuse information already present in the student's profile where appropriate.

The application MUST validate required information before allowing final submission.

The system MUST identify:

* Missing information
* Missing required documents
* Invalid/incomplete fields
* Outstanding issues

---

# 3.13 Application Review Before Submission

Before final submission, the system MUST display a summary.

Example:

```text
APPLICATION READINESS

Profile                 ✓
Education               ✓
Household               ✓
Documents               7/7
Eligibility             ✓

No outstanding issues.

[SUBMIT APPLICATION]
```

If problems exist:

```text
2 ITEMS REQUIRE ATTENTION

○ Income Certificate
○ Bank Information
```

The student MUST be able to navigate back and correct the identified issues.

---

# 3.14 Application Submission

The system MUST allow the student to submit a completed application.

On submission:

* Generate an application ID.
* Store the application.
* Store the associated documents.
* Change application status.
* Display confirmation to the student.

Example:

```text
APPLICATION SUBMITTED

Application ID:
TRB-2026-00841

Status:
Submitted
```

---

# 3.15 Application Tracking

The system MUST provide an application tracking interface.

The tracker SHOULD use a visual timeline.

Prototype statuses:

```text
Draft
Submitted
Document Verification
Institute Verification
Under Review
Deficient
Correction Received
Verified
Decision Pending
Completed
```

The system MUST clearly show:

* Current status
* Completed stages
* Pending stages
* Student action required, if any

Example:

```text
SUBMITTED
    ●
    │
DOCUMENT VERIFICATION
    ●
    │
INSTITUTE VERIFICATION
    ◉ CURRENT
    │
MINISTRY REVIEW
    ○
    │
FINAL DECISION
    ○
```

---

# 3.16 Notifications / Student Actions

The system MUST provide a basic in-app notification/action area.

Students should be able to see:

* Application updates
* Document verification results
* Deficiency requests
* Correction requests
* Important application actions

Notifications SHOULD be actionable.

Example:

```text
ACTION REQUIRED

Income Certificate required

[Upload Document]
```

---

# 3.17 Administrator Authentication

The system MUST support a separate administrator interface.

The prototype may use:

* Demo administrator account
* Role-based login
* Protected admin route

The interface MUST NOT imply that the prototype is an actual Ministry production portal.

---

# 3.18 Administrator Dashboard

The administrator dashboard MUST display basic application statistics.

Required statistics:

* Total applications
* Applications under review
* Deficient applications
* Applications requiring attention

Additional statistics MAY be added if time permits.

The dashboard SHOULD allow navigation to the application queue.

---

# 3.19 Administrator Application Queue

Administrators MUST be able to view submitted applications.

The queue MUST display information such as:

* Application ID
* Student name
* Scheme
* Current status
* Review state
* Deficiency state

The queue SHOULD support:

* Search
* Scheme filter
* Status filter
* Review filter

---

# 3.20 Administrator Application Review

Administrators MUST be able to open an application.

The review page MUST display:

* Student information
* Education information
* Household information
* Scheme
* Eligibility information
* Submitted documents
* AI-assisted findings
* Application status

The administrator SHOULD be able to inspect document metadata and extracted information.

---

# 3.21 Administrator Document Review

The application review interface SHOULD provide a clear document-review experience.

Preferred layout:

```text
ORIGINAL DOCUMENT
        │
        │
        └──────────────
        │
EXTRACTED INFORMATION

Name
Income
Financial Year
Document Type
Issuing Authority
```

Where AI findings exist, display them clearly.

Example:

```text
AI PRE-SCRUTINY

✓ Required document present
✓ Income information extracted
✓ Income appears within configured limit
⚠ Name variation detected

RECOMMENDATION

Manual verification
```

---

# 3.22 Deficiency Management

Administrators MUST be able to create a deficiency/correction request.

A deficiency should include:

* Document/information involved
* Issue description
* Action required
* Status

Example:

```text
DOCUMENT REQUIRED

Income Certificate

Issue:
Required financial year not found.

Action:
Please upload the updated certificate.
```

The student must be able to see the request in their notification/action area.

---

# 3.23 Application Status Management

Administrators MUST be able to update application status.

The status update must be reflected on the student's tracking interface.

The prototype MUST maintain a basic record of status changes.

---

# 3.24 Basic Audit Information

The prototype SHOULD retain a basic activity history for important actions.

Examples:

```text
Application submitted
Document uploaded
Document reviewed
Deficiency requested
Correction received
Status updated
```

This may be implemented as a simple activity timeline rather than a complex enterprise audit system.

---

# 4. SHOULD HAVE Requirements

These features should only be implemented after all MUST HAVE requirements work end-to-end.

## 4.1 Scheme Configuration

Administrators MAY be able to configure:

* Scheme name
* Eligibility rules
* Income conditions
* Education conditions
* Required documents
* Workflow stages

---

## 4.2 Advanced Analytics

Optional analytics may include:

* Applications by scheme
* Applications by state
* Verification completion rate
* Deficiency frequency
* Processing status distribution

Charts must remain simple and useful.

---

## 4.3 Grievance Support

A basic grievance/contact workflow MAY be implemented if time remains.

---

## 4.4 Multilingual Support

The interface MAY support Indian languages in a future version.

This is not required for the one-day MVP.

---

## 4.5 Accessibility Enhancements

The system SHOULD follow accessible UI practices where practical.

Examples:

* Clear text contrast
* Keyboard navigation
* Visible focus states
* Descriptive labels
* Accessible form errors

Advanced accessibility certification is outside the one-day scope.

---

# 5. WON'T HAVE Requirements

The following are explicitly excluded from the one-day prototype unless an actual authorized integration already exists.

## 5.1 Real Aadhaar Authentication

The prototype will not implement production Aadhaar authentication.

Aadhaar-related information must be minimized and masked where displayed.

---

## 5.2 Real DigiLocker Production Integration

The prototype may demonstrate the workflow using mocked/simulated data.

It must not claim live DigiLocker integration without authorized credentials/access.

---

## 5.3 Real PFMS / DBT Transactions

The prototype will not execute:

* Real scholarship payments
* Real DBT transfers
* Real PFMS transactions

Payment integration may be shown conceptually in the architecture/presentation only.

---

## 5.4 Real Government Production APIs

No production government API should be fabricated.

Unavailable integrations must be represented as:

* Mock
* Demo
* Prototype adapter
* Future integration

---

## 5.5 Autonomous AI Decisions

AI MUST NOT:

* Automatically reject applicants
* Declare fraud
* Make final scholarship decisions
* Override administrator decisions

AI should provide:

* Extraction
* Matching assistance
* Deficiency detection
* Consistency flags
* Review recommendations

---

## 5.6 Complex Machine Learning Training

We will not spend the hackathon building or training a large custom ML model.

The prototype should use appropriate AI services/models and deterministic rule logic where suitable.

---

## 5.7 Native Mobile Application

A responsive web application is sufficient for the prototype.

A separate Android/iOS application is out of scope.

---

## 5.8 Large Enterprise Administration Suite

The prototype will not implement:

* Complex organizational hierarchies
* Dozens of administrative roles
* Full government procurement workflows
* Complex financial accounting
* Enterprise identity management

The administrator interface should remain focused on scholarship application review and monitoring.

---

# 6. Data Rules

## 6.1 Demo Data

The prototype MUST use clearly labeled synthetic/demo student data.

The application MUST NOT depend on real students' sensitive personal data for the hackathon demonstration.

---

## 6.2 Example Demo Student

Use a consistent synthetic student for the primary demonstration.

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

The exact demo profile may be changed later if required by the demo flow.

---

# 7. AI Rules

## 7.1 AI Is Assistive

AI is an assistive component.

The application MUST distinguish:

```text
AI finding
```

from

```text
Final administrative decision
```

---

## 7.2 AI Uncertainty

Where confidence is low, the UI SHOULD indicate that manual verification is appropriate.

Example:

```text
LOW CONFIDENCE EXTRACTION

Manual verification recommended.
```

---

## 7.3 No Unsupported Claims

The application MUST NOT present AI-generated information as officially verified government data unless it actually comes from an authoritative integrated source.

---

# 8. UX Requirements

## 8.1 Primary Student Question

The student dashboard should answer:

> "What should I do next?"

The interface should prioritize:

* Relevant scholarships
* Document readiness
* Required actions
* Current application status

---

## 8.2 Minimal Repetition

The student should enter information once whenever possible.

Existing profile information and documents SHOULD be reusable.

---

## 8.3 Clear Status

Every important process should have a visible state.

Examples:

* Complete
* Pending
* Missing
* Needs attention
* Under review
* Action required

---

## 8.4 Explainability

Whenever the platform makes a recommendation or flags an issue, the user should be able to understand the reason.

Avoid unexplained numbers or black-box decisions.

---

# 9. UI Requirements

The UI MUST follow the design system defined in:

```text
docs/04-UI-UX-SYSTEM.md
```

The implementation MUST NOT introduce unrelated visual styles.

The UI SHOULD use:

* Warm off-white / ivory base
* Deep maroon primary colour
* Muted earthy supporting colours
* Restrained status colours
* Strong typography
* Generous whitespace
* Clear information hierarchy

Avoid:

* Generic AI SaaS visuals
* Excessive glassmorphism
* Excessive gradients
* Excessive rounded cards
* Random decorative elements
* Unnecessary AI/robot imagery
* Overloaded dashboards

---

# 10. Technical Requirements

## 10.1 Responsive Web Application

The application MUST work on:

* Desktop
* Tablet
* Mobile-width layouts

Desktop should be the primary hackathon demonstration environment.

---

## 10.2 Component Reuse

Repeated UI elements MUST be implemented as reusable components.

Examples:

* Buttons
* Cards
* Document cards
* Scholarship cards
* Status badges
* Timeline
* Sidebar
* Header
* Modal
* Form fields
* Tables/lists

---

## 10.3 Loading States

Every asynchronous operation SHOULD have a visible loading state.

---

## 10.4 Error States

Important operations MUST have error handling.

Examples:

* Upload failure
* Invalid form
* Failed AI extraction
* Missing document
* Unauthorized route

---

## 10.5 Empty States

Empty screens SHOULD provide useful guidance.

Example:

```text
NO DOCUMENTS YET

Upload your first document
to start building your document wallet.

[Add Document]
```

---

# 11. Performance Requirements

The prototype should:

* Load quickly
* Avoid unnecessary API calls
* Avoid loading large documents unnecessarily
* Use lightweight animations
* Avoid unnecessary client-side complexity

Visual polish must not come at the expense of basic responsiveness.

---

# 12. Security and Privacy Requirements

The prototype should follow privacy-conscious design.

The system SHOULD:

* Minimize sensitive information
* Mask sensitive identifiers where appropriate
* Restrict administrator routes
* Avoid exposing documents publicly
* Avoid placing sensitive information in client-side logs
* Use synthetic data during demonstration

The prototype MUST NOT claim regulatory or government security certification unless such certification actually exists.

---

# 13. Acceptance Criteria

The MVP will be considered functional only when the following complete workflow works:

```text
1. Student registers
        ↓
2. Student creates profile
        ↓
3. Scholarship matching returns relevant schemes
        ↓
4. Student opens a scholarship
        ↓
5. Eligibility explanation is visible
        ↓
6. Required documents are displayed
        ↓
7. Existing document count is shown
        ↓
8. Student opens document wallet
        ↓
9. Student uploads or adds a document
        ↓
10. Document becomes associated with profile/wallet
        ↓
11. Document readiness updates
        ↓
12. Student completes application
        ↓
13. Student reviews application
        ↓
14. Student submits application
        ↓
15. Application receives an ID
        ↓
16. Student sees tracking timeline
        ↓
17. Administrator logs in
        ↓
18. Administrator sees application in queue
        ↓
19. Administrator opens application
        ↓
20. Administrator inspects documents
        ↓
21. AI-assisted findings are visible
        ↓
22. Administrator requests correction/deficiency
        ↓
23. Student receives action request
        ↓
24. Student can respond to the request
```

If this workflow is not functioning, additional features must not take priority over fixing it.

---

# 14. Priority Order

Development priority is:

## P0 — Critical

* Application foundation
* Student authentication
* Student profile
* Scholarship matching
* Scholarship detail
* Document wallet
* Document upload
* Document readiness
* Application wizard
* Application submission
* Application tracking
* Admin login
* Admin dashboard
* Admin application review
* Deficiency workflow

## P1 — Important

* AI extraction
* AI consistency checking
* Explainable matching
* DigiLocker prototype connector
* Notifications
* Basic activity history

## P2 — Optional

* Scheme configuration
* Analytics
* Grievance
* Additional accessibility features
* Multilingual support

---

# 15. One-Day Rule

The following rule overrides all other development decisions:

> A working P0 workflow is more valuable than an unfinished P1/P2 feature.

If time becomes limited:

1. Finish the complete student journey.
2. Finish the administrator review journey.
3. Add AI-assisted document intelligence.
4. Add DigiLocker prototype experience.
5. Polish the UI.
6. Only then add secondary features.

Never sacrifice a working end-to-end workflow to add another dashboard, chart, animation or experimental feature.

---

# 16. Definition of Done

A feature is considered DONE only when:

* The UI exists.
* The user interaction works.
* Data is stored/retrieved where necessary.
* Relevant states are handled.
* Loading/error states are handled where applicable.
* The feature connects to the rest of the product.
* The feature does not break existing flows.
* The feature follows the established design system.

A visually complete page with fake or non-functional primary actions is NOT considered DONE.

---

# 17. Core Product Principle

Aletheia should never feel like a collection of independent pages.

The following concepts must remain connected throughout the application:

```text
PROFILE
   ↓
MATCHING
   ↓
DOCUMENT WALLET
   ↓
DOCUMENT READINESS
   ↓
APPLICATION
   ↓
VERIFICATION
   ↓
TRACKING
```

The same student profile, documents and application data should flow through these stages.

That continuity is a core part of the product and must be preserved during implementation.

```


