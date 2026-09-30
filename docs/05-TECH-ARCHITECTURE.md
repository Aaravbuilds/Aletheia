## 1. Purpose

This document defines the technical structure of Aletheia.

The architecture is intentionally designed for:

- One-day implementation
- Fast development
- Reliable demo
- Simple deployment
- Easy modification
- Clear separation of concerns

The system should avoid unnecessary enterprise complexity.

---

# 2. Architecture Principle

The prototype should follow:

```text
Simple
Modular
Demo-stable
Easy to understand
Easy to extend

The goal is NOT to build a production government platform in one day.

The goal is to build a convincing functional prototype that demonstrates the intended system architecture.

3. Recommended Stack

Unless the existing project has already established a different stack, use:

Frontend
Next.js
React
TypeScript
Tailwind CSS
UI Components

Use a consistent component system.

Recommended:

shadcn/ui
Lucide icons

Only use components that support the established Aletheia design system.

Do not allow shadcn defaults to determine the final visual identity.

Backend

For the one-day prototype:

Next.js server routes / server actions

Use the same project rather than creating an unnecessary separate backend.

Database

Preferred:

Supabase PostgreSQL

if credentials/setup are available.

Otherwise:

SQLite / local development database

may be used for the prototype.

The application architecture should keep database access isolated so the database can be changed later.

Storage

Preferred:

Supabase Storage

for uploaded documents if available.

For a purely local prototype, use a local storage abstraction.

4. High-Level Architecture
┌──────────────────────────────────────────┐
│              Aletheia UI                 │
│                                          │
│ Next.js + React + TypeScript + Tailwind │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│          Application Logic               │
│                                          │
│ Matching                                 │
│ Document Processing                      │
│ Application Workflow                     │
│ Notifications                            │
│ Validation                               │
└────────────────────┬─────────────────────┘
                     │
          ┌──────────┼───────────┐
          ▼          ▼           ▼
     Database     Storage       AI Layer
          │          │           │
          └──────────┼───────────┘
                     ▼
              External Services
              where available
5. Application Layers

The codebase should conceptually separate:

UI
↓
Feature Logic
↓
Services
↓
Data Access
↓
Database / External Services

Do not place all business logic directly inside page components.

6. Suggested Project Structure

Recommended:

src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── student/
│   │   ├── dashboard/
│   │   ├── scholarships/
│   │   ├── applications/
│   │   ├── documents/
│   │   ├── profile/
│   │   └── notifications/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── applications/
│   │   ├── review/
│   │   ├── documents/
│   │   └── activity/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── scholarship/
│   ├── documents/
│   ├── applications/
│   ├── admin/
│   └── shared/
│
├── lib/
│   ├── db/
│   ├── auth/
│   ├── matching/
│   ├── documents/
│   ├── ai/
│   ├── notifications/
│   └── validation/
│
├── types/
│
└── data/
    ├── schemes/
    └── demo/

The exact structure may change based on the existing repository, but feature separation must remain.

7. Routing Structure
Public
/
 /login
 /register
Student
/student/dashboard

/student/scholarships
/student/scholarships/[id]

/student/documents
/student/documents/[id]

/student/applications
/student/applications/[id]

/student/applications/[id]/apply

/student/profile
/student/notifications
Administrator
/admin/login

/admin/dashboard

/admin/applications
/admin/applications/[id]

/admin/applications/[id]/review

/admin/documents

/admin/activity
8. Authentication Architecture

Authentication should identify:

user_id
role
session

Roles:

STUDENT
ADMIN

Authorization must be enforced separately from UI visibility.

Hiding an admin link is not sufficient security.

9. Demo Authentication

Because this is a hackathon prototype, the application may provide demo credentials.

Example:

Student
demo.student@aletheia.app

Admin
demo.admin@aletheia.app

Actual credentials should be configured through environment variables or seed data rather than hardcoded throughout the application.

10. Authorization

Student routes:

/student/*

must require:

role = STUDENT

Admin routes:

/admin/*

must require:

role = ADMIN

Users must not be able to access another user's applications by simply changing an ID in the URL.

11. Scholarship Matching Architecture

Matching should use a deterministic rules engine for the prototype.

Do NOT use an LLM as the primary eligibility decision engine.

Example:

Student Profile
      ↓
Matching Engine
      ↓
Scheme Rules
      ↓
Requirement Evaluation
      ↓
Match Result
12. Matching Result Structure

Each scheme evaluation should produce something conceptually similar to:

{
  schemeId,
  status,
  matchedConditions,
  unmetConditions,
  missingInformation,
  requiredDocuments
}

Possible statuses:

MATCH
ACTION_REQUIRED
NOT_MATCHING
13. Explainable Matching

The matching engine should generate structured reasons.

Example:

matchedConditions:
- ST category
- Undergraduate education

unmetConditions:
[]

missingInformation:
- Income certificate

The UI converts these into human-readable explanations.

14. Scholarship Rule Model

A scheme should contain configurable rules.

Example:

Scheme
├── categoryRequirement
├── educationRequirement
├── incomeRequirement
├── stateRequirement
├── courseRequirement
└── requiredDocuments

The rule structure should remain extensible.

15. Document Architecture

Documents should be treated as reusable user-owned assets.

Conceptually:

Student
   │
   ├── Document
   ├── Document
   └── Document

Applications reference the relevant documents rather than duplicating the actual files unnecessarily.

16. Document Processing Pipeline
Upload
   ↓
Storage
   ↓
Document Record
   ↓
Classification
   ↓
Extraction
   ↓
Validation
   ↓
Document Status
17. AI Layer

AI functionality should be isolated behind service functions.

Example conceptual interface:

classifyDocument(file)
extractDocumentData(file)
checkDocumentConsistency(profile, document)

The rest of the application should not depend directly on a specific AI provider.

18. AI Provider Abstraction

The application should conceptually support:

AI Service
     ↓
Provider Adapter
     ↓
Model

This makes it possible to replace the model later.

Do not scatter provider-specific API calls across UI components.

19. AI Failure Handling

AI is an optional assistive layer.

If AI fails:

Upload
   ↓
AI Failure
   ↓
Manual Review / Manual Entry

The application must continue functioning.

20. DigiLocker Architecture

DigiLocker should be represented through an integration abstraction.

Conceptually:

DigiLockerService
       ↓
getAvailableDocuments()
       ↓
importDocument()

For the hackathon:

MockDigiLockerService

may be used.

The UI must not falsely represent mock data as a live government integration.

21. Application Workflow Architecture

Application status should be state-driven.

Example:

DRAFT
 ↓
SUBMITTED
 ↓
DOCUMENT_VERIFICATION
 ↓
INSTITUTE_VERIFICATION
 ↓
UNDER_REVIEW
 ↓
DECISION_PENDING
 ↓
COMPLETED

Alternative branch:

UNDER_REVIEW
 ↓
DEFICIENT
 ↓
CORRECTION_RECEIVED
 ↓
UNDER_REVIEW
22. Status Transitions

The system should maintain allowed transitions.

Example:

DRAFT → SUBMITTED

SUBMITTED → DOCUMENT_VERIFICATION

DOCUMENT_VERIFICATION → INSTITUTE_VERIFICATION

INSTITUTE_VERIFICATION → UNDER_REVIEW

UNDER_REVIEW → DEFICIENT

DEFICIENT → CORRECTION_RECEIVED

CORRECTION_RECEIVED → UNDER_REVIEW

UNDER_REVIEW → DECISION_PENDING

DECISION_PENDING → COMPLETED

Do not allow arbitrary status changes from any state unless explicitly configured.

23. Deficiency Architecture

A deficiency belongs to an application.

Conceptually:

Application
   │
   ├── Deficiency
   ├── Deficiency
   └── Deficiency

Each deficiency should contain:

id
applicationId
type
description
requiredAction
status
createdAt
resolvedAt
24. Notification Architecture

Notifications should be generated by important events.

Examples:

ApplicationSubmitted
DeficiencyCreated
CorrectionReceived
StatusChanged
DocumentVerified

The notification service creates an in-app notification.

25. Activity / Audit Architecture

Important application actions should create activity records.

Examples:

APPLICATION_SUBMITTED
DOCUMENT_UPLOADED
DOCUMENT_REVIEWED
DEFICIENCY_CREATED
CORRECTION_SUBMITTED
STATUS_CHANGED

This provides a basic history for the demo.

26. File Upload Architecture

Upload flow:

Browser
 ↓
Upload API / Server Action
 ↓
Validation
 ↓
Storage
 ↓
Document Record
 ↓
Processing

Validate:

File type
File size
Document category

Do not trust the filename alone.

27. Document Security

Uploaded documents must not be publicly exposed by default.

Use protected storage or controlled access wherever the selected storage provider supports it.

Document URLs should not be permanently exposed in public UI data.

28. Data Validation

Use schema validation for important forms and API inputs.

Recommended:

Zod

Validate:

Registration
Profile
Application
Document metadata
Deficiency
Status updates
29. API Design

API routes should be grouped by domain.

Conceptual structure:

/api/auth

/api/profile

/api/scholarships
/api/scholarships/[id]/match

/api/documents
/api/documents/upload

/api/applications
/api/applications/[id]

/api/applications/[id]/deficiencies

/api/admin/applications
/api/admin/applications/[id]/review

Do not create dozens of unnecessary endpoints.

30. Server vs Client Logic

Sensitive logic should remain server-side.

Server-side:

Authorization
Database operations
Matching calculations
AI API calls
Document processing
Status transitions

Client-side:

UI state
Form interactions
Visual feedback
Navigation
Non-sensitive display logic
31. Environment Variables

Secrets must not be committed.

Potential environment variables:

DATABASE_URL
AUTH_SECRET
AI_API_KEY
STORAGE_URL
STORAGE_KEY

If using Supabase:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

Use only the variables actually required by the selected implementation.

32. Demo Mode

The application SHOULD support a deterministic demo mode.

Demo mode can provide:

Seeded student
Seeded admin
Seeded scholarship schemes
Seeded documents
Seeded application
Predictable AI responses

This is extremely important for hackathon reliability.

33. Mock Services

When a real integration is unavailable, create mock services.

Examples:

MockDigiLockerService
MockAIService
MockNotificationService

These should use the same interface that a real service would use.

This prevents the UI from being tightly coupled to mock data.

34. Seed Data

The project should include seed data for:

Demo student
Demo administrator
Scholarships
Eligibility rules
Documents
Applications
Notifications
Deficiencies

The demo should work immediately after setup.

35. Error Handling

All major service functions should return controlled errors.

The UI should translate them into human-readable messages.

Avoid exposing:

Stack traces
API keys
Database errors
Internal implementation details
36. Logging

During development, logs may be used for debugging.

Never log:

Passwords
API keys
Full sensitive document contents
Sensitive personal identifiers unnecessarily
37. Performance Strategy

For the one-day prototype:

Prefer:

Simple queries
Small datasets
Server-side filtering where appropriate
Lazy loading of heavy document previews
Minimal animations

Do not prematurely optimize.

38. Deployment Architecture

Preferred:

GitHub
   ↓
Vercel
   ↓
Next.js Application

Supabase
   ├── PostgreSQL
   └── Storage

If external services are unavailable, use the simplest working deployment architecture.

39. Architecture Rule

Do not create:

Separate microservices
Kubernetes
Message queues
Complex event buses
Multiple backend repositories
Unnecessary abstraction layers

for the one-day prototype.

40. One-Day Architecture Priority

Priority:

P0
Working Next.js application
Authentication
Database
Scholarships
Documents
Applications
Admin review

P1
AI processing
Mock DigiLocker
Notifications
Activity history

P2
Advanced analytics
Configurable scheme engine
Additional integrations
41. Architecture Success Condition

The architecture is successful if a developer can understand:

Where the UI lives
Where business logic lives
Where data lives
Where documents live
Where AI lives
Where integrations live

within a few minutes of opening the repository.

42. Final Architecture Principle

Build a modular monolith.

For this hackathon:

ONE APPLICATION
+
CLEAR MODULES
+
CLEAR DATA MODEL
+
MOCKABLE SERVICES
+
REALISTIC WORKFLOW