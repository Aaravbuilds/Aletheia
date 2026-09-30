## 1. Official Scheme Name

National Fellowship Scheme for Higher Education of ST Students

Common abbreviation:

NFST

The Fellowship component is part of the broader National Fellowship and Scholarship for Higher Education of ST Students framework.

---

# 2. Scheme Type

Central Sector Scheme.

Fully funded and implemented by the Central Government / Ministry of Tribal Affairs.

---

# 3. Official Portal

https://fellowship.tribal.gov.in/

Ministry of Tribal Affairs:

https://tribal.nic.in/ScholarshiP.aspx

---

# 4. Objective

The National Fellowship provides financial assistance to Scheduled Tribe students for pursuing higher research studies.

The Ministry describes the fellowship as supporting M.Phil and Ph.D studies.

---

# 5. Target Beneficiaries

Scheduled Tribe students pursuing eligible higher research programmes.

The applicant must satisfy the applicable academic and selection conditions.

---

# 6. Eligible Research Level

The Ministry currently describes the scheme as covering:

- M.Phil
- Ph.D

The current applicable scheme guidelines should be used for any changes resulting from changes in the national higher-education framework.

---

# 7. Institution Eligibility

The Ministry describes coverage including:

- Universities/Institutions/Colleges included under applicable UGC Act provisions
- Deemed Universities meeting applicable UGC requirements
- Universities/Institutions/Colleges funded by Central/State Government
- Institutes of National Importance

The exact current institutional coverage must be verified against the applicable guideline.

---

# 8. Number of Fellowships

The Ministry currently states:

750 fresh ST students are provided fellowship each year.

This is an annual number and should not be interpreted as a guaranteed number of available seats at any individual institution.

---

# 9. Selection

The Ministry states that fresh fellows are selected on merit based on marks obtained in the Master's degree.

Current Ministry material also states preference for:

- Girls
- Divyang students
- PVTGs

Preference does not mean automatic selection.

---

# 10. Income Criterion

The Ministry's annual report states:

There is no income ceiling in this fellowship scheme.

Aletheia should therefore NOT apply the ₹6 lakh or ₹2.5 lakh income ceiling used by other scholarship schemes to NFST.

This is an important cross-scheme distinction.

---

# 11. Fellowship Amount

The Ministry's current scholarship page states:

M.Phil:
₹25,000 per month

Ph.D:
₹28,000 per month

However, the Ministry's annual report documents revised rates effective from 01.01.2023:

### M.Phil

₹37,000 per month

### Ph.D

₹37,000 per month for the first two years

₹42,000 per month for the remaining three years

These revised rates should be treated as the current monetary reference where applicable.

The application must retain source/version metadata because fellowship rates can change.

---

# 12. Contingency

Current Ministry annual-report information specifies annual contingency amounts by stream.

M.Phil:

Humanities & Social Sciences:
₹10,000/year

Science/Engineering/Technology:
₹12,000/year

Ph.D:

Humanities & Social Sciences:
₹20,500/year

Science/Engineering/Technology:
₹25,000/year

These values must be verified against the latest current guideline before being presented as current entitlement.

---

# 13. HRA

HRA is provided according to applicable UGC rates.

The Ministry annual report states HRA for all courses is aligned with UGC rates and varies by city category.

Aletheia should not hard-code a permanent HRA percentage without a current source.

---

# 14. Divyanjan / Escort Assistance

The Ministry annual report states an escort allowance for Divyanjan fellows of:

₹2,000/month

This should be treated as a documented scheme benefit subject to applicable conditions.

---

# 15. Maximum Duration

The Ministry annual report states:

Ph.D:
Maximum 5 years

M.Phil:
Maximum 2 years

The exact duration and continuation conditions should follow the current guideline.

---

# 16. Continuation

The Ministry states that fellowship amounts are transferred through DBT mechanisms and scholars are required to submit continuation-related documentation/certification according to the applicable process.

Aletheia should represent continuation as a workflow/status rather than assuming automatic continuation.

---

# 17. Matching Inputs

NFST matching should use:

```text
stStatus
educationLevel
previousQualification
masterDegreeStatus
masterMarks
researchProgramme
institution
research/admission information
selection-year information

Family income should NOT be used as a disqualifying rule because the Ministry annual report states there is no income ceiling.

18. Suggested Preliminary Matching Logic
IF ST status = true
AND applicant has completed/holds the required Master's qualification
AND programme = eligible M.Phil/Ph.D
AND institution satisfies scheme requirements
AND applicant satisfies current selection conditions
THEN
    Potential Match
ELSE
    Information Needed / Not Currently Matching

Merit ranking must use the official selection process.

Aletheia must not claim to reproduce the government's final merit list unless explicitly implementing the current official selection rules and data.

19. Document Examples

The actual current application document list should come from the official fellowship application instructions.

Potential information/documents include:

ST certificate
Master's degree/marks
Admission/enrolment information
Research programme information
Institution information
Identity information
Bank information
Other documents specified by the application process

Do not present these as universally mandatory unless verified.

20. Application Portal

Official fellowship portal:

https://fellowship.tribal.gov.in/

Aletheia V1 may demonstrate an internal application workflow.

It must not claim that a submission made inside Aletheia has been submitted to the official government fellowship portal.

21. AI Usage

AI may:

explain fellowship requirements
summarize conditions
extract academic information from documents
detect possible inconsistencies
assist administrators

AI must not:

generate an official merit rank
guarantee selection
reject candidates
fabricate selection criteria
22. Student-Facing Example
Potential Match

You appear to meet the basic profile conditions for NFST:

✓ Scheduled Tribe status
✓ Master's-level qualification
✓ Eligible research programme
✓ Institution information provided

Selection is merit-based and subject to the current official scheme rules.
23. Critical Cross-Scheme Rule

Do NOT apply the income ceiling from:

Post-Matric
Top Class
National Overseas

to NFST.

NFST is documented by the Ministry as having no income ceiling.

24. Primary Sources

Ministry scholarship page:

https://tribal.nic.in/ScholarshiP.aspx

National Fellowship Portal:

https://fellowship.tribal.gov.in/

Current applicable NFST guidelines and amendments must override older guideline versions.

25. Versioning

Store:

schemeVersion
selectionYear
lastVerifiedAt
sourceUrl
sourceDocument