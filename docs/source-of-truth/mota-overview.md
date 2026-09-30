## 1. Purpose

This file provides the authoritative context for the scholarship information used by Aletheia.

Aletheia is an AI-assisted scholarship discovery, application and management platform focused on Scheduled Tribe students.

This document describes:

- Ministry of Tribal Affairs context
- Scholarship ecosystem
- Scheme terminology
- Source hierarchy
- How scholarship information must be represented inside Aletheia
- Rules for handling uncertain or changing information

---

# 2. Ministry

## Ministry Name

Ministry of Tribal Affairs (MoTA)

Government of India

The Ministry is responsible for policy, planning and coordination of programmes for the development of Scheduled Tribes.

For Aletheia, MoTA is the primary government source for the scholarship schemes represented in this prototype.

Official website:

https://tribal.nic.in/

---

# 3. Scholarship Ecosystem Relevant to Aletheia

The Ministry currently lists scholarship schemes including:

1. Pre-Matric Scholarship Scheme for ST Students
2. Post-Matric Scholarship Scheme for ST Students
3. National Scholarship Scheme / Top Class Scholarship for Higher Education of ST Students
4. National Fellowship Scheme for Higher Education of ST Students
5. National Overseas Scholarship Scheme

Aletheia V1 focuses on:

- Post-Matric Scholarship
- Top Class Scholarship
- National Fellowship
- National Overseas Scholarship

Pre-Matric is outside the initial V1 scope.

---

# 4. Scheme Types

Aletheia should distinguish between:

## Centrally Sponsored Scheme

A scheme where implementation involves States/UTs and funding follows the prescribed Centre-State funding pattern.

Example:

Post-Matric Scholarship for ST Students.

## Central Sector Scheme

A scheme fully funded and implemented by the Central Government.

Examples:

- Top Class Scholarship
- National Fellowship
- National Overseas Scholarship

---

# 5. Important Terminology

## ST

Scheduled Tribe.

Aletheia must not infer ST status from surname, location, language, appearance, or any other indirect characteristic.

ST status must be represented using explicit user-provided or verified information.

---

## PVTG

Particularly Vulnerable Tribal Group.

PVTG status may affect eligibility or preference in some schemes.

Aletheia must treat PVTG status as an explicit profile field.

It must never infer PVTG status.

---

## DBT

Direct Benefit Transfer.

The Ministry uses DBT mechanisms for scholarship disbursement in the schemes described on its scholarship pages.

Aletheia V1 may represent DBT-related information as part of scheme information but must not claim that Aletheia itself performs government DBT processing.

---

# 6. Official Source Hierarchy

When information conflicts, use this hierarchy:

1. Current official Ministry of Tribal Affairs scheme guideline
2. Current official amendment/order issued by MoTA
3. Current official scheme portal
4. Current official MoTA scholarship page
5. Official Ministry annual report
6. Older official guideline
7. Secondary source

Never prefer a secondary website over a current official government source.

---

# 7. Date Sensitivity

Scholarship rules can change.

Examples of changeable information:

- Income ceiling
- Number of institutes
- Number of awards
- Covered courses
- Scholarship amount
- Application dates
- Selection process
- Required documents
- Eligibility conditions

Therefore every scheme record in Aletheia should support:

```text
effectiveFrom
effectiveTo
lastVerifiedAt
sourceUrl
sourceTitle
sourceVersion
8. No Invented Government Information

Aletheia must NEVER invent:

Eligibility criteria
Income limits
Scholarship amounts
Number of awards
Institute lists
Application deadlines
Government approval status
Selection rules
Required documents
Government portal status

If information is unavailable:

Information not available in the verified source.
Please verify on the official scheme portal.
9. Eligibility vs Matching

Aletheia's matching engine is a decision-support feature.

It should communicate:

Potential Match
Action Required
Not Currently Matching
Information Needed

It must not claim:

"You are officially eligible."

Only the competent authority can make the final determination.

10. AI Boundary

AI may:

explain scheme information
summarize verified eligibility conditions
classify documents
extract fields from documents
detect possible inconsistencies
generate user-friendly explanations

AI must NOT independently:

determine official eligibility
reject an applicant
accuse a student of fraud
alter government eligibility rules
invent missing requirements
11. Aletheia Data Model Principle

Government information should be stored separately from user information.

Example:

Scholarship Scheme
        |
        ├── Eligibility Rules
        ├── Required Documents
        ├── Benefits
        ├── Important Dates
        └── Sources

Student Profile
        |
        ├── Education
        ├── Income
        ├── Category
        ├── State
        └── Documents

The matching engine compares these two datasets.

12. Primary Official Sources

Ministry scholarship page:

https://tribal.nic.in/ScholarshiP.aspx

Ministry Knowledge Hub:

https://tribal.nic.in/KnowledgeHub.aspx

National Scholarship Portal:

https://scholarships.gov.in/

National Fellowship Portal:

https://fellowship.tribal.gov.in/

National Overseas Scholarship Portal:

https://overseas.tribal.gov.in/

13. Aletheia V1 Scheme Scope

The first version should contain:

Post-Matric

Target:
ST students pursuing recognized post-matric courses.

Top Class

Target:
Eligible meritorious ST students pursuing higher education in notified premier institutions.

National Fellowship

Target:
Eligible ST students pursuing M.Phil/Ph.D-level research as specified by current scheme rules.

National Overseas Scholarship

Target:
Eligible ST/PVTG candidates pursuing specified higher studies abroad under the current scheme.

14. Source-of-Truth Rule

The following files are authoritative for Aletheia scholarship matching:

source-of-truth/
├── mota-overview.md
├── post-matric.md
├── top-class.md
├── nfst.md
└── nos.md

If application code conflicts with these files:

The verified scheme information takes priority.

If these files conflict with each other:

The more recent verified official source takes priority.

If no source resolves the conflict:

Do not guess.

15. Product Disclaimer

Aletheia is a prototype.

Aletheia provides informational and workflow assistance.

Aletheia does not replace:

Government authorities
Official scholarship portals
Institutional verification
State/UT verification
Final scholarship selection
Government document verification

Users should verify current information through official sources before submitting an actual application.