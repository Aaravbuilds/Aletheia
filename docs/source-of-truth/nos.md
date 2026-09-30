## 1. Official Scheme Name

National Overseas Scholarship Scheme

Common abbreviation:

NOS

---

# 2. Scheme Type

Central Sector Scheme.

The scheme is administered by the Ministry of Tribal Affairs.

---

# 3. Official Portal

https://overseas.tribal.gov.in/

Ministry of Tribal Affairs:

https://tribal.nic.in/ScholarshiP.aspx

---

# 4. Objective

The National Overseas Scholarship provides financial assistance to eligible Scheduled Tribe candidates for higher studies abroad.

The Ministry describes the scheme as supporting:

- Post Graduate study
- Ph.D
- Post-Doctoral study

The exact courses covered are governed by the current scheme rules and amendments.

---

# 5. Important 2026-27 Update

The Ministry currently lists:

"Amendment in eligibility criteria and courses covered under the NOS Scheme for ST Students from 2026-27"

Therefore:

The 2026-27 amendment must be treated as authoritative for eligibility and course coverage for the 2026-27 selection year.

Older NOS guideline values must not automatically be treated as current.

---

# 6. Number of Awards

The Ministry currently states:

20 awards are given every year.

Distribution:

17 awards for ST candidates

3 awards for candidates belonging to Particularly Vulnerable Tribal Groups (PVTGs)

This number represents the scheme's annual award structure, not a guarantee for an individual applicant.

---

# 7. Target Beneficiaries

Eligible:

- Scheduled Tribe candidates
- PVTG candidates under the designated allocation/category

The exact eligibility requirements must follow the current applicable NOS guideline and amendment.

---

# 8. Family Income

The current Ministry scholarship page states:

Parental/family income from all sources should not exceed:

₹6.00 lakh per annum.

This should be used as a current matching rule unless superseded by a newer official amendment.

---

# 9. Study Level

The scheme supports higher studies abroad including:

- Post Graduation
- Ph.D
- Post-Doctoral study

The specific courses covered must be taken from the current NOS rules.

---

# 10. Selection

The Ministry states that selection is based on an interview-based merit list prepared by an Expert Committee.

Aletheia must therefore NOT claim that its own matching score represents official NOS selection.

---

# 11. Admission After Selection

The Ministry currently states that a selected student is given two years to seek admission to a foreign university after selection in the merit list.

The exact current process must follow the latest scheme guidelines and selection-year instructions.

---

# 12. Scholarship Benefits

The Ministry currently describes the scholarship as including:

- Tuition fee
- Annual maintenance allowance
- Contingency charges
- Poll tax where applicable
- Visa fee
- Medical insurance
- Cost of air journey
- Incidental journey expenses

The Ministry scholarship page currently lists:

Annual Maintenance Allowance:
USD 15,400

Contingency Charges:
USD 1,532

These monetary values should be versioned because scheme benefits can change.

---

# 13. Disbursement

The Ministry states that scholarship disbursement is made through Indian Missions abroad through the Ministry of External Affairs, which is reimbursed by the Ministry of Tribal Affairs.

Aletheia must not claim to perform this disbursement.

---

# 14. Matching Inputs

NOS matching should consider:

```text
stStatus
pvtgStatus
educationLevel
highestQualification
proposedStudyLevel
course
foreignInstitution
country
admission/status
familyIncome
selectionYear

The exact course and academic conditions must come from the current NOS rules.

15. Suggested Preliminary Matching Logic
IF ST/PVTG status satisfies scheme category
AND family income <= 600000
AND proposed study level is covered
AND proposed course is covered under current selection-year rules
AND applicant satisfies current academic/other requirements
THEN
    Potential Match
ELSE
    Not Currently Matching / Information Needed

This is only a preliminary information-matching layer.

It is not an official selection mechanism.

16. Documents

The exact required document list must be taken from the current NOS application instructions.

Potential application information may include:

ST/PVTG certificate
Income certificate
Academic certificates/marksheets
Admission/offer information
Foreign institution information
Course information
Passport/identity information
Other documents specified by the current application process

Do not mark every item above as universally mandatory without source verification.

17. Application Portal

Official NOS portal:

https://overseas.tribal.gov.in/

Aletheia may demonstrate an internal application workflow.

It must not represent an internal Aletheia submission as an official NOS submission.

18. Important Dates

Application windows change by selection year.

Do not hard-code a permanent deadline.

The database should support:

applicationOpenDate
applicationCloseDate
selectionYear
lastVerifiedAt
sourceUrl
19. AI Usage

AI may:

explain NOS requirements
summarize current eligibility
help users understand missing information
classify uploaded documents
extract academic/document fields
detect possible inconsistencies

AI must not:

guarantee selection
generate an official merit position
replace the Expert Committee
claim that a candidate is officially selected
invent course eligibility
20. Student-Facing Example
Potential Match

Based on the information you've provided:

✓ ST status
✓ Family income within the published limit
✓ Postgraduate/PhD study objective

Before applying, verify that your proposed course is covered under the current NOS rules for your selection year.
21. Current vs Historical Information

Older Ministry NOS pages and guidelines may contain historical:

course lists
income rules
award details
application dates
selection procedures
benefit amounts

Do not merge historical information with current information.

Every NOS record should contain:

selectionYear
schemeVersion
lastVerifiedAt
sourceUrl
22. Current Source Priority

For current NOS eligibility:

Current 2026-27 amendment
Current NOS guidelines
Current NOS official portal
Current Ministry scholarship page
Older Ministry documents
23. Primary Sources

Ministry of Tribal Affairs:

https://tribal.nic.in/ScholarshiP.aspx

National Overseas Scholarship portal:

https://overseas.tribal.gov.in/

Ministry Knowledge Hub:

https://tribal.nic.in/KnowledgeHub.aspx

24. Critical Implementation Rule

The application must not assume that an applicant is eligible merely because:

They are ST
Their income is below ₹6 lakh
They want to study abroad

All current academic, course, selection-year and other applicable conditions must also be satisfied.

25. Final Eligibility Language

Use:

Potential Match

or:

Additional Information Required

or:

Does Not Currently Match Known Criteria

Do NOT use:

Guaranteed Eligible

or:

Guaranteed Selection
26. Selection-Year Awareness

NOS is particularly sensitive to yearly amendments.

Therefore Aletheia should always know:

selectionYear

before determining which eligibility rules to apply.

Example:

NOS 2026-27

must not silently use a course list from:

NOS 2021-22