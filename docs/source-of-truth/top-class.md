# Aletheia Source of Truth
# National Scholarship Scheme (Top Class)
# For Higher Education of ST Students

## 1. Official Scheme Name

National Scholarship Scheme (Top Class)
for Higher Education of ST Students

The scheme is part of the Central Sector framework for higher education of ST students.

---

# 2. Scheme Type

Central Sector Scheme.

The scheme is fully funded and implemented by the Central Government / Ministry of Tribal Affairs.

---

# 3. Official Portal

National Scholarship Portal:

https://scholarships.gov.in/

Ministry of Tribal Affairs:

https://tribal.nic.in/ScholarshiP.aspx

---

# 4. Objective

The scheme supports eligible meritorious Scheduled Tribe students pursuing higher education in notified premier institutions.

The Ministry currently describes coverage across 265 identified premier institutions.

Examples of institution types mentioned by the Ministry include:

- IITs
- AIIMS
- IIMs
- NIITs
- Other institutions identified/notified by the Ministry

The exact institute list must come from the current official notified list.

---

# 5. Target Beneficiaries

Eligible Scheduled Tribe students pursuing prescribed higher education courses in notified premier institutions.

ST status must be explicitly established.

Aletheia must not infer ST status.

---

# 6. Current Income Criterion

The current Ministry scholarship page states:

Family income from all sources should not exceed:

₹6.00 lakh per annum.

This is the current value to use for V1 unless a newer official amendment changes it.

---

# 7. Institute Requirement

The student must be studying/pursuing an eligible course in an institute included in the current notified Top Class institute list.

Do NOT hard-code old lists.

The current Ministry page refers to 265 premier institutes.

The application database should therefore support:

```text
institutionId
institutionName
institutionStatus
schemeVersion
effectiveFrom
effectiveTo
8. Course Requirement

Only prescribed courses covered by the current scheme are eligible.

The exact course coverage should be loaded from the latest official scheme documentation.

Aletheia must not assume that every course in every Top Class institute qualifies.

9. Scholarship Duration

The Ministry states that the scholarship is provided for the entire duration of the course, subject to the applicable scheme conditions.

Aletheia should represent this as:

Duration:
Entire eligible course duration
Subject to applicable scheme conditions
10. Scholarship Components

The Ministry currently describes the scholarship amount as including:

Tuition fees
Admission fees
Non-refundable fees
Stipend
Allowances for books
Computer-related allowance

The exact monetary ceilings should be taken from the latest applicable scheme guideline/amendment.

Do not use historical amounts from older webpages as current values.

11. Important Historical Data Warning

Older Ministry documents may contain:

213 institutes
246 institutes
252 institutes
Different income ceilings
Different award numbers
Different benefit ceilings

These are historical versions.

They must NOT overwrite current scheme data.

For Aletheia V1:

CURRENT OFFICIAL SOURCE > HISTORICAL OFFICIAL SOURCE
12. Current Institute Count

Current Ministry scholarship page:

265 identified premier institutions.

The actual institution names must be obtained from the current official notified list.

Do not manually invent the list.

13. Matching Inputs

Aletheia should consider:

stStatus
familyIncome
institution
course
educationLevel
previousQualification
academicInformation

The exact academic merit/selection conditions must be taken from the current applicable guideline.

14. Suggested Matching Logic

Example:

IF ST status = true
AND family income <= 600000
AND institution is in current Top Class institute list
AND course is covered
AND other applicable conditions are satisfied
THEN
    Potential Match
ELSE
    Not Currently Matching / Information Needed

This is a preliminary matching system.

It is NOT an official eligibility decision.

15. Document Readiness

Potential documents may include:

ST certificate
Income certificate
Academic records
Admission/institution proof
Identity information
Bank information
Other documents specified by the current application process

The exact required document list must be sourced from the current application instructions.

16. Preference / Selection Information

Historical and current Ministry materials may specify preferences or merit-selection provisions.

Aletheia must use the latest applicable official rules.

If the current source specifies preference for categories such as:

Girls
Divyang students
PVTGs

the application may display these as documented selection/preference information.

Do not convert preference into guaranteed selection.

17. Application Channel

The Ministry currently directs users toward the National Scholarship Portal for the National Scholarship/Top Class scheme.

Official portal:

https://scholarships.gov.in/

Aletheia V1 may simulate or manage the application workflow internally for demonstration.

It must not claim that the prototype submission is a real submission to the Government portal.

18. Student-Facing Explanation

Preferred:

Potential Match

Your profile appears to meet several published conditions:

✓ ST category
✓ Family income within the published limit
✓ Institution listed under the Top Class scheme

Please verify the current course and document requirements before applying.

Avoid:

You are 100% eligible.
19. Data Versioning

Every Top Class scheme record should store:

schemeVersion
lastVerifiedAt
sourceUrl
sourceDocument

Institute lists must also be versioned.

20. Primary Sources

Current Ministry scholarship page:

https://tribal.nic.in/ScholarshiP.aspx

National Scholarship Portal:

https://scholarships.gov.in/

Ministry Knowledge Hub:

https://tribal.nic.in/KnowledgeHub.aspx

Latest official Top Class guideline/amendment and current institute list should be treated as authoritative over older documents.

21. Implementation Rule

If a student is in an IIT/IIM/AIIMS/etc., do not automatically classify them as eligible.

The matching engine must verify:

ST status
Income
Institution appears in current notified list
Course is covered
Other applicable scheme conditions
22. Critical Warning

Do not copy old Top Class values from historical Ministry pages into the current database.

For example:

Old documents may say:

213 institutions
₹2 lakh income limit

while current Ministry information states:

265 institutions
₹6 lakh income limit

The current official information must be used for V1.

The database should retain source/version metadata so that future amendments can be applied safely