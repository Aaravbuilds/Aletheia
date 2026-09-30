## 1. Purpose

This document defines the core entities and relationships used by Aletheia.

The data model must support:

- Student profiles
- Scholarship matching
- Document management
- Applications
- Application documents
- Deficiencies
- Notifications
- Application activity
- AI-assisted findings

The model should remain simple enough for the one-day prototype while being structured enough to demonstrate a realistic system.

---

# 2. Core Entity Relationship

The primary relationship is:

```text
User
 │
 └── Student Profile
       │
       ├── Documents
       │
       ├── Applications
       │       │
       │       ├── Application Documents
       │       ├── Deficiencies
       │       └── Activity
       │
       └── Notifications


Scholarship Scheme
 │
 ├── Eligibility Rules
 └── Required Documents
          │
          └── Application Documents
3. User

Represents an authenticated account.

Fields:

id
email
passwordHash / authProviderId
role
createdAt
updatedAt

Role:

STUDENT
ADMIN
4. Student Profile

Represents reusable information about a student.

Fields:

id
userId

fullName
dateOfBirth
gender

mobile
email

state
district

category
isST
isPVTG

educationLevel
course
institution
academicYear
previousQualification
percentageOrCGPA

annualFamilyIncome
householdSize
primaryOccupation

profileCompletion

createdAt
updatedAt
5. Profile Completion

Profile completion should be calculated from required fields.

Example:

profileCompletion = 85

This should represent:

85%

Do not manually store the value if it can reliably be calculated.

6. Scholarship Scheme

Represents a scholarship/fellowship available in the system.

Fields:

id

name
shortName

description
type

provider
targetGroup

isActive

applicationStartDate
applicationEndDate

createdAt
updatedAt

Possible types:

SCHOLARSHIP
FELLOWSHIP
7. Scholarship Eligibility Rule

Represents an individual eligibility requirement.

Fields:

id
schemeId

ruleType
operator
value

description

required

Example:

ruleType:
CATEGORY

operator:
EQUALS

value:
ST

description:
Applicant must belong to ST category.
8. Supported Rule Types

Potential rule types:

CATEGORY
EDUCATION_LEVEL
COURSE
INSTITUTION
STATE
FAMILY_INCOME
ACADEMIC_SCORE
PVTG_STATUS

Additional rule types can be added later.

9. Scholarship Required Document

Represents a document required for a particular scholarship.

Fields:

id
schemeId

documentType
documentName

required

description

Example:

schemeId:
scheme_001

documentType:
ST_CERTIFICATE

documentName:
Scheduled Tribe Certificate

required:
true
10. Document

Represents a reusable document belonging to a student.

Fields:

id
studentId

documentType
documentName

source

fileName
fileUrl

mimeType
fileSize

status

uploadedAt
updatedAt

expiryDate

extractedData
extractionConfidence

createdAt
updatedAt
11. Document Source

Supported sources:

UPLOAD
DIGILOCKER
IMPORTED

For the prototype:

DIGILOCKER

may represent simulated DigiLocker data.

12. Document Status

Possible states:

UPLOADED
PROCESSING
VERIFIED
NEEDS_ATTENTION
INVALID
EXPIRED
13. Document Type

Suggested types:

ST_CERTIFICATE
INCOME_CERTIFICATE
MARKSHEET
COLLEGE_ID
ADMISSION_PROOF
BONAFIDE_CERTIFICATE
BANK_PROOF
FEE_RECEIPT
IDENTITY_DOCUMENT
OTHER
14. Extracted Document Data

AI-extracted information may include:

name
income
financialYear
institution
course
certificateType
issuingAuthority
issueDate
expiryDate
documentNumber

The exact extracted fields depend on the document type.

Do not assume every document contains every field.

15. Extraction Confidence

The AI extraction service may produce:

extractionConfidence

Example:

0.96

or:

96

Choose one representation and use it consistently.

16. Document AI Finding

Represents an AI-assisted observation about a document.

Fields:

id
documentId

findingType
severity

title
description

confidence

createdAt

Possible finding types:

DOCUMENT_CLASSIFICATION
FIELD_EXTRACTION
NAME_VARIATION
MISSING_FIELD
POSSIBLE_EXPIRY
CONSISTENCY_CHECK
17. Finding Severity

Possible values:

INFO
WARNING
HIGH

Do not use:

FRAUD

as an automatic AI finding.

AI findings are observations requiring appropriate human review.

18. Application

Represents a student's application to a scholarship.

Fields:

id

applicationNumber

studentId
schemeId

status

submittedAt

createdAt
updatedAt
19. Application Status

Possible states:

DRAFT
SUBMITTED
DOCUMENT_VERIFICATION
INSTITUTE_VERIFICATION
UNDER_REVIEW
DEFICIENT
CORRECTION_RECEIVED
DECISION_PENDING
COMPLETED
20. Application Snapshot

When an application is submitted, important student information should be preserved as part of the application record/snapshot.

This prevents later profile changes from silently changing historical applications.

Relevant snapshot information may include:

fullName
dateOfBirth
category
state
district
educationLevel
course
institution
academicYear
annualFamilyIncome
householdSize

The exact implementation may use:

JSON snapshot
dedicated application profile table
normalized application fields

Choose the simplest reliable implementation.

21. Application Document

Connects a reusable student document to a specific application.

Fields:

id

applicationId
documentId

requiredDocumentType

status

submittedAt
reviewedAt

reviewNotes

This allows one document to be reused across multiple applications.

22. Application Document Status

Possible states:

MISSING
SUBMITTED
UNDER_REVIEW
ACCEPTED
NEEDS_CORRECTION
23. Deficiency

Represents a correction/request raised by an administrator.

Fields:

id

applicationId
documentId

type

title
description
requiredAction

status

createdBy
createdAt
resolvedAt
24. Deficiency Status

Possible values:

OPEN
RESOLVED
REVIEWED
25. Deficiency Types

Possible types:

MISSING_DOCUMENT
INVALID_DOCUMENT
OUTDATED_DOCUMENT
INCONSISTENT_INFORMATION
MISSING_INFORMATION
OTHER
26. Notification

Represents an in-app notification.

Fields:

id

userId

type
title
message

relatedApplicationId
relatedDocumentId

isRead

createdAt
27. Notification Types

Possible types:

APPLICATION_SUBMITTED
DOCUMENT_UPDATE
DEFICIENCY_CREATED
CORRECTION_RECEIVED
STATUS_CHANGED
DOCUMENT_VERIFIED
SYSTEM
28. Application Activity

Represents an important event in an application's lifecycle.

Fields:

id

applicationId

actorId
actorRole

eventType

description

metadata

createdAt
29. Activity Event Types

Possible values:

APPLICATION_CREATED
APPLICATION_SUBMITTED
DOCUMENT_UPLOADED
DOCUMENT_REVIEWED
DOCUMENT_VERIFIED
DEFICIENCY_CREATED
CORRECTION_SUBMITTED
STATUS_CHANGED
APPLICATION_COMPLETED
30. Actor Role

Possible values:

STUDENT
ADMIN
SYSTEM
AI

This helps explain who or what produced an event.

31. Scholarship Match Result

Matching results may be generated dynamically rather than permanently stored.

Conceptual structure:

schemeId

status

matchedConditions[]
unmetConditions[]
missingInformation[]

requiredDocuments[]
availableDocuments[]
missingDocuments[]
32. Match Status

Possible values:

MATCH
ACTION_REQUIRED
NOT_MATCHING
33. Document Readiness

Document readiness should be calculated from:

Required Scheme Documents
        vs
Student Documents

Example:

requiredDocuments = 7
availableDocuments = 5
missingDocuments = 2

Result:

5 / 7 READY

Avoid permanently storing derived values unless there is a performance reason.

34. User → Student Profile

Relationship:

User
  1
  │
  │
  1
  ▼
StudentProfile

One user account has one student profile.

35. Student → Documents

Relationship:

Student
  1
  │
  │
  ├──── Document
  ├──── Document
  └──── Document

A student can have many documents.

36. Student → Applications

Relationship:

Student
  1
  │
  ├──── Application
  ├──── Application
  └──── Application

A student can have multiple applications.

37. Scholarship → Applications

Relationship:

Scholarship
  1
  │
  ├──── Application
  ├──── Application
  └──── Application

Many students can apply to the same scholarship.

38. Scholarship → Eligibility Rules

Relationship:

Scholarship
  1
  │
  ├──── Eligibility Rule
  ├──── Eligibility Rule
  └──── Eligibility Rule

A scholarship can have many rules.

39. Scholarship → Required Documents

Relationship:

Scholarship
  1
  │
  ├──── Required Document
  ├──── Required Document
  └──── Required Document
40. Application → Application Documents

Relationship:

Application
  1
  │
  ├──── Application Document
  ├──── Application Document
  └──── Application Document
41. Application → Deficiencies

Relationship:

Application
  1
  │
  ├──── Deficiency
  ├──── Deficiency
  └──── Deficiency
42. Application → Activity

Relationship:

Application
  1
  │
  ├──── Activity
  ├──── Activity
  └──── Activity
43. Student → Notifications

Relationship:

Student
  1
  │
  ├──── Notification
  ├──── Notification
  └──── Notification
44. Simplified Database Schema

Conceptually:

users
│
├── student_profiles
│
├── documents
│      │
│      └── document_ai_findings
│
├── applications
│      │
│      ├── application_documents
│      ├── deficiencies
│      └── application_activity
│
└── notifications


scholarship_schemes
│
├── eligibility_rules
└── required_documents
45. Recommended MVP Tables

For the one-day prototype, the minimum database tables are:

users
student_profiles
scholarship_schemes
eligibility_rules
required_documents
documents
applications
application_documents
deficiencies
notifications
application_activity

AI findings can be:

document_ai_findings

if implemented as a real persisted feature.

46. Database Simplification Rule

Do not create a database table simply because a concept exists in the UI.

Only create separate entities when they need:

Independent lifecycle
Relationships
Queries
Persistence
Reuse

Avoid unnecessary normalization during the one-day prototype.

47. Demo Seed Data

The database should contain:

Student
Rahul Kumar
ST
Gujarat
B.Tech
3rd Year
₹4,20,000 annual family income
Admin
Demo Administrator
Scholarship

At least:

Primary Demonstration Scholarship

plus several additional schemes for the scholarship discovery screen.

The scheme information should be based on verified source material rather than invented government policy.

Documents

Seed several documents:

ST Certificate
Class XII Marksheet
College ID
Bank Proof
Admission Proof

Leave at least one or two required documents missing so the demo can demonstrate document readiness.

48. Demo Application

Seed one application:

Application Number:
TRB-2026-00841

Suggested initial state:

SUBMITTED

This allows the admin review flow to be demonstrated immediately.

49. Data Integrity Rules

The application should enforce:

An application must belong to a student.
An application must reference a scholarship.
An application document must reference a valid application.
An application document must reference a valid student document.
A deficiency must belong to an application.
Notifications must belong to a user.
Admin-only operations must require an admin role.
50. Deletion Rules

Avoid destructive deletion of submitted application information.

For documents used by submitted applications:

Prefer:

Archive / Replace

over:

Hard Delete

The one-day prototype may simplify this if necessary, but submitted application history should remain understandable.

51. Sensitive Data Rules

Potentially sensitive fields include:

Date of birth
Mobile
Family income
Identity documents
Bank information
Document files

These must not be unnecessarily exposed in:

Logs
Public URLs
Client-side debugging
Demo screenshots

Use synthetic data for demonstrations.

52. AI Data Rules

AI-extracted information should be stored as:

Extracted Data
+
Confidence
+
Finding

rather than automatically overwriting the student's profile.

The user or administrator should be able to review AI-extracted information.

53. Source of Truth

For each type of information:

Student profile
→ StudentProfile

Uploaded document
→ Document

Scholarship requirements
→ ScholarshipScheme + EligibilityRule + RequiredDocument

Submitted application
→ Application + Application Snapshot

AI observations
→ AI findings

Administrative actions
→ Application Activity

Do not create competing copies of the same information without a clear reason.

54. Data Flow

The primary data flow is:

Student Profile
       ↓
Matching Engine
       ↓
Scholarship
       ↓
Required Documents
       ↓
Document Wallet
       ↓
Application
       ↓
Application Documents
       ↓
Administrator Review
       ↓
Deficiency / Verification
       ↓
Application Status
       ↓
Notification
55. Data Model Principle

The most important design principle is:

Reusable student information should be stored once and reused wherever possible, while submitted applications should preserve their own historical state.

This prevents unnecessary repetition while protecting application history.

56. Final MVP Data Model

The one-day prototype should prioritize these relationships:

USER
 │
 ▼
STUDENT PROFILE
 │
 ├───────────────┐
 ▼               ▼
DOCUMENTS     APPLICATIONS
                 │
                 ▼
        APPLICATION DOCUMENTS
                 │
        ┌────────┴─────────┐
        ▼                  ▼
  DEFICIENCIES          ACTIVITY
        │
        ▼
  CORRECTIONS


SCHOLARSHIP
 │
 ├── ELIGIBILITY RULES
 │
 └── REQUIRED DOCUMENTS