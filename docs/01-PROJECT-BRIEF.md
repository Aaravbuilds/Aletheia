
# Aletheia — Project Brief

## 1. Project Identity

**Project Name:** Aletheia

**Problem Statement:** SIH26239

**Problem Statement Title:** AI-Enabled Scholarship and Fellowship Management System for Scheduled Tribes

**Ministry:** Ministry of Tribal Affairs (MoTA), Government of India

**Category:** Software

**Theme:** Smart Education

---

## 2. Project Vision

Aletheia is a unified digital platform designed to simplify the scholarship and fellowship journey for Scheduled Tribe (ST) students while helping authorized scholarship administrators manage applications and verification more efficiently.

The platform brings together:

- Student profile management
- Scholarship discovery and matching
- Reusable document management
- Application submission
- Application tracking
- AI-assisted document scrutiny
- Deficiency identification
- Administrative application review

The central idea is:

> **One profile → relevant opportunities → reusable documents → simpler applications → clearer verification → transparent tracking**

---

## 3. Problem We Are Solving

The implementation of scholarship and fellowship schemes involves multiple stages such as registration, application, document submission, eligibility verification, scrutiny, selection, communication and post-selection management.

The SIH26239 problem statement identifies manual scrutiny, repeated correspondence, multiple verification stages, processing delays, limited visibility and errors in verification/workflow management as important challenges.

Aletheia addresses these challenges by creating a common digital workflow where student information and documents can be reused across relevant opportunities and where AI can assist with document processing and identification of incomplete or potentially inconsistent applications.

The platform is intended to support, not replace, human administrative decision-making.

---

## 4. Core Product Concept

Aletheia is built around two connected experiences.

### Student Experience

The student creates a profile once and uses that information throughout the scholarship journey.

```text
PROFILE
   ↓
SCHOLARSHIP MATCHING
   ↓
DOCUMENT READINESS
   ↓
APPLICATION
   ↓
TRACKING
````

### Administrator Experience

Authorized officers review and manage applications using the information already collected by the platform.

```text
APPLICATION QUEUE
   ↓
APPLICATION REVIEW
   ↓
DOCUMENT / ELIGIBILITY CHECK
   ↓
DEFICIENCY OR STATUS UPDATE
   ↓
CONTINUED PROCESSING
```

---

## 5. Core Student Features

### 5.1 Student Registration and Profile

Students create a profile containing information relevant to scholarship discovery and eligibility checks.

Profile categories include:

* Basic personal information
* State / location
* ST category information
* Educational information
* Institution and course information
* Household information
* Family income information

The profile acts as the central source of student information throughout the platform.

---

### 5.2 Scholarship Matching

Aletheia evaluates the student's profile against configured scholarship/fellowship eligibility criteria and presents potentially relevant opportunities.

For each opportunity, the student should be able to understand:

* Why the scheme may match their profile
* Which eligibility conditions are satisfied
* Which conditions require attention
* Which documents are required
* Which required documents are already available
* Which documents are still missing

The system should prioritize explainability over unexplained numerical scores.

Example:

```text
TOP CLASS EDUCATION

Why you may match

✓ ST category
✓ Education criteria
✓ Income criteria
✓ Institution criteria

Documents

5 / 7 available

Still needed

○ Income Certificate
○ Fee Receipt
```

---

### 5.3 Document Wallet

Aletheia provides students with a reusable document wallet.

Possible document categories include:

* Identity documents
* ST / category documents
* Educational documents
* Income / household documents
* Bank documents
* Admission / institutional documents

A document should have a visible state such as:

* Available
* Uploaded
* Verified
* Needs attention
* Missing
* Expiring / outdated

The purpose of the wallet is to avoid repeatedly collecting the same documents when the student applies for another relevant scheme.

---

### 5.4 Document Upload and Verification

Students can upload required documents individually.

The platform should capture useful metadata and, where AI processing is available, extract relevant information from uploaded documents.

Example extracted information:

```text
Document Type: Income Certificate

Name: Rahul Kumar
Annual Income: ₹4,20,000
Financial Year: 2025–26
Issuing Authority: Detected

Extraction Confidence: 96%
```

AI results are intended to assist verification and highlight information requiring attention.

---

### 5.5 DigiLocker Connection

Aletheia should provide a DigiLocker connection experience for retrieving documents that are already available to the student.

For the hackathon prototype, government integrations must not be represented as production integrations unless actual authorized credentials and integration access are available.

The prototype should therefore clearly distinguish:

* Simulated / prototype connector
* User-uploaded documents
* Future production integration

The interface should communicate which documents are already available and which still need to be supplied.

---

### 5.6 Document Readiness

For every scholarship/fellowship opportunity, Aletheia calculates document readiness based on the configured document requirements.

Example:

```text
TOP CLASS EDUCATION

Document Readiness

5 / 7 documents available

✓ ST Certificate
✓ Class XII Marksheet
✓ Bank Proof
✓ Admission Proof
✓ College / Bonafide Proof

○ Income Certificate
○ Fee Receipt
```

The student should be able to understand what remains before starting or completing an application.

---

### 5.7 Application and Tracking

Students complete applications using a structured multi-step flow.

Suggested structure:

```text
01 Personal
02 Education
03 Household
04 Documents
05 Review
06 Submit
```

Before submission, the platform should clearly identify incomplete information or outstanding documents.

After submission, the student can track the application's current status through a visual timeline.

Example:

```text
Application Submitted
        ↓
Document Verification
        ↓
Institute Verification
        ↓
Ministry Review
        ↓
Final Decision
```

The tracker should clearly distinguish between:

* Current status
* Completed stages
* Pending stages
* Actions required from the student

---

## 6. Core Administrator Features

SIH26239 requires separate applicant and administrator experiences.

The administrator side of Aletheia is intentionally focused for the prototype rather than attempting to recreate a complete government enterprise system.

### 6.1 Administrator Dashboard

The dashboard provides an overview of application processing.

Possible indicators:

* Total applications
* Applications under review
* Deficient applications
* Applications requiring attention
* Applications ready for the next stage

---

### 6.2 Application Queue

Authorized administrators can view and filter submitted applications.

Useful filters may include:

* Scheme
* Application status
* Verification state
* Deficiency state
* Review priority

---

### 6.3 Application Review

Administrators can open an application and inspect:

* Student profile
* Application details
* Submitted documents
* Extracted document information
* Eligibility checks
* AI-generated verification findings
* Deficiencies / discrepancies

The review interface should allow administrators to make or record the actual administrative decision.

---

### 6.4 Deficiency Management

Administrators can identify missing or problematic information and send a correction request to the student.

Example:

```text
Issue:
Income Certificate

Reason:
Required financial-year document not found.

Action:
Please upload an updated income certificate.
```

The student should then see this as an actionable notification in their account.

---

### 6.5 Application Status Management

Authorized administrators can move an application through the configured workflow.

Possible prototype states:

* Draft
* Submitted
* Under Verification
* Deficient
* Correction Received
* Verified
* Under Review
* Decision Pending
* Completed

The exact production workflow may vary by scheme.

---

## 7. AI-Assisted Capabilities

Aletheia uses AI where it provides clear operational value.

### 7.1 Document Classification

Determine the likely type of an uploaded document.

Example:

```text
uploaded_file.jpg
        ↓
AI
        ↓
Likely document:
ST Certificate
```

---

### 7.2 Information Extraction

Extract structured information from supported documents.

Potential fields include:

* Name
* Date
* Income
* Financial year
* Institution
* Course
* Certificate type
* Issuing authority

---

### 7.3 Cross-Document Consistency Checks

Compare extracted information against the student's profile and other submitted documents.

Example:

```text
Profile:
Rahul Kumar

Marksheet:
Rahul Kumar

ST Certificate:
Rahul Kumar

Result:
No significant name discrepancy detected
```

Another example:

```text
Profile:
Rahul Kumar

Marksheet:
Rahul Kumar

ST Certificate:
Rahul Kumar Singh

Result:
Potential identity discrepancy

Recommended action:
Manual verification
```

A discrepancy must not automatically mean fraud or rejection.

---

### 7.4 Deficiency Detection

AI and rule-based checks can identify:

* Missing documents
* Potentially outdated documents
* Missing fields
* Inconsistencies
* Documents that require manual inspection

---

### 7.5 Explainable Scholarship Matching

The matching system should explain its result using the configured eligibility criteria rather than presenting an unexplained AI score.

Example:

```text
WHY THIS SCHOLARSHIP MATCHES

✓ ST category
✓ Education level
✓ Income condition
✓ Institution condition

DOCUMENTS

5 / 7 available

ACTION REQUIRED

Upload:
- Income Certificate
- Fee Receipt
```

---

### 7.6 AI-Assisted Administrative Review

The system may provide review recommendations or flags that help an administrator prioritize applications.

The administrator remains responsible for the final decision.

AI should act as:

> **Decision support**

and not:

> **Autonomous scholarship authority**

---

## 8. Configurable Scheme Architecture

The platform should be designed around a common application system with scheme-specific rules.

A scheme can define:

* Eligibility conditions
* Required documents
* Education requirements
* Income conditions
* Institution requirements
* Application workflow
* Verification stages

The purpose is to avoid creating a completely separate application system for every scholarship/fellowship scheme.

Example:

```text
SCHEME A
ST + Income Rule + Document Set A

SCHEME B
ST + Education Rule + Institution Rule + Document Set B

SCHEME C
ST + Overseas Study Rule + Document Set C
```

All can use the same underlying platform.

---

## 9. Initial Prototype Scope

For the one-day SIH prototype, priority is given to a complete working journey rather than maximum feature count.

### Must Work

* Student registration
* Student profile
* Scholarship matching
* Eligibility explanation
* Document wallet
* Document upload
* Prototype DigiLocker connection
* Document readiness
* Application form
* Application review
* Application submission
* Application tracking
* Administrator dashboard
* Administrator application review
* Deficiency request
* Status update

### Secondary / Time-Permitting

* Scheme configuration UI
* Advanced analytics
* Grievance module
* Multilingual support
* Additional accessibility refinements
* Additional scheme workflows

### Explicitly Out of Scope for the Prototype

* Real government payment processing
* Real PFMS / DBT transactions
* Real Aadhaar authentication unless authorized integration is available
* Production DigiLocker credentials/integration unless authorized access is available
* Production government API integrations
* Large-scale machine-learning model training
* Native mobile application

---

## 10. Prototype Philosophy

The project should prioritize:

### 1. Complete workflow over feature quantity

A working end-to-end journey is more important than many disconnected modules.

### 2. Explainability over black-box AI

Students and administrators should understand why the system identified a scholarship, document issue or review flag.

### 3. Reusable information

A student's profile and document wallet should reduce repeated data entry and document submission.

### 4. Human-in-the-loop verification

AI should assist administrators rather than silently making consequential decisions.

### 5. Configuration over hardcoding

Scheme-specific requirements should be represented as configurable rules wherever practical.

### 6. Privacy-conscious design

Sensitive student information should be minimized, appropriately masked in the interface, and handled carefully.

---

## 11. Primary Product Journey

The ideal demonstration journey is:

```text
NEW STUDENT
    ↓
CREATE PROFILE
    ↓
3 SCHOLARSHIP MATCHES FOUND
    ↓
OPEN A SCHOLARSHIP
    ↓
"5 OF 7 DOCUMENTS READY"
    ↓
OPEN DOCUMENT WALLET
    ↓
UPLOAD / CONNECT DIGITAL DOCUMENTS
    ↓
DOCUMENT READINESS INCREASES
    ↓
COMPLETE APPLICATION
    ↓
REVIEW
    ↓
SUBMIT
    ↓
TRACK APPLICATION
    ↓
ADMIN OPENS SAME APPLICATION
    ↓
AI-ASSISTED PRE-SCRUTINY
    ↓
ISSUE / DEFICIENCY IDENTIFIED
    ↓
ADMIN REQUESTS CORRECTION
    ↓
STUDENT RECEIVES ACTION
```

This complete loop represents the core experience we should optimize for during development.

---

## 12. Product Positioning

Aletheia is not positioned as simply another scholarship listing website.

Its central proposition is:

> **A student's profile and documents become a reusable foundation for discovering, preparing and managing scholarship and fellowship applications.**

The platform connects:

**Opportunity Discovery**
→ **Eligibility Understanding**
→ **Document Readiness**
→ **Application**
→ **Verification**
→ **Tracking**

The interface should make this journey feel like one continuous product rather than a collection of unrelated government forms.

---

## 13. Design Direction

The visual system should be modern, calm and trustworthy.

Primary visual direction:

* Warm ivory / off-white foundation
* Deep maroon as the primary brand colour
* Muted earthy accents
* Restrained supporting status colours
* Strong typography
* Generous whitespace
* Modular information blocks
* Subtle cultural/geometric visual references

Avoid:

* Generic AI-dashboard aesthetics
* Excessive gradients
* Excessive glassmorphism
* Excessive rounded cards
* Random decorative tribal artwork
* Giant AI/robot imagery
* Visually noisy government-portal styling

The UI should feel like a carefully designed digital public-service product.

---

## 14. Source-of-Truth Principle

Eligibility requirements, scheme details and document requirements must not be invented by the application.

Where information is represented in the prototype, it should be tied to an identified scheme source or clearly labeled as prototype/demo data.

The source-of-truth documentation will be maintained separately in:

```text
docs/source-of-truth/
```

---

## 15. Success Criteria for the Hackathon Prototype

The prototype is successful when a judge can understand and experience the complete value proposition without requiring a technical explanation.

A judge should be able to see:

1. A student creating a profile.
2. Relevant scholarship opportunities being identified.
3. Eligibility being explained.
4. Existing and missing documents being shown.
5. Documents being uploaded/reused.
6. An application being completed.
7. The application being tracked.
8. An administrator reviewing the same application.
9. AI-assisted issues or deficiencies being surfaced.
10. A correction request being sent back to the student.

The goal is not to simulate every operation of a production government system.

The goal is to demonstrate a coherent, credible and extensible solution to SIH26239.

```

### One thing I deliberately did differently

I **didn't claim that every feature above is directly stated in the SIH PS**. The PS itself calls for a common platform covering application, eligibility verification, document scrutiny, selection, communication and post-selection management, configurable scheme requirements, and appropriate use of automation/AI. :contentReference[oaicite:2]{index=2}

Features like your **student-facing scholarship matcher, reusable document wallet, readiness percentage and the exact UI flow are our product design choices** built around that requirement. That's how we should continue writing these MDs: **never confuse our innovation with an official requirement.**

Also, your DigiLocker idea is particularly credible because MoTA's current National Overseas Scholarship portal explicitly says it is integrated with DigiLocker, fetches available documents, permits uploading unavailable ones, and has notifications and a monitoring dashboard. :contentReference[oaicite:3]{index=3}

And MoTA's current scholarship portal confirms the broader ecosystem includes Pre-Matric, Post-Matric, National Scholarship, National Fellowship and National Overseas Scholarship schemes. :contentReference[oaicite:4]{index=4}



[1]: https://www.elpissoftlabs.com/about.php?utm_source=chatgpt.com "Elpis Softlabs"
[2]: https://phronesis.co.in/?utm_source=chatgpt.com "Phronesis | Responsible AI Services"
