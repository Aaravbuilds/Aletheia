# Aletheia Source of Truth
# Post-Matric Scholarship Scheme for ST Students

## 1. Official Scheme Name

Post-Matric Scholarship Scheme for Scheduled Tribe Students

Short name:

PMS-ST

---

# 2. Scheme Type

Centrally Sponsored Scheme.

The scheme is implemented through States/Union Territories.

States/UTs are responsible for activities including:

- Inviting applications
- Eligibility verification
- Processing/verification
- Disbursement to eligible students through DBT mechanisms

---

# 3. Official Source

Ministry of Tribal Affairs:

https://tribal.nic.in/ScholarshiP.aspx

Current guideline source:

https://tribal.nic.in/downloads/guidelines/post-matric/Post-matric-guidelines-15032023.pdf

The official Ministry scholarship page should be checked for subsequent amendments.

---

# 4. Target Beneficiaries

Scheduled Tribe students pursuing recognized post-matric courses.

The current Ministry description states that the scheme applies to students pursuing recognized courses from recognized institutions for which the qualification is Matriculation/Class X or above.

---

# 5. Core Eligibility

Aletheia should consider the following verified conditions.

## ST Status

Applicant must belong to a Scheduled Tribe.

The system must not infer ST status.

---

## Educational Level

The applicant must be pursuing a recognized course for which the qualifying level is Matriculation/Class X or above.

---

## Institution

The institution/course must satisfy the recognition conditions specified by the applicable scheme guidelines.

The 2023 guidelines include categories such as:

- Central/State Universities
- Autonomous colleges recognized by UGC
- Universities/colleges recognized under applicable UGC provisions
- Deemed Universities meeting the applicable requirements
- Recognized private universities
- Recognized private professional institutions
- Recognized schools/colleges for applicable higher-secondary study
- Diploma institutions recognized by State/UT Governments
- Vocational Training Institutes affiliated with NCVT
- Institutions approved by appropriate regulatory bodies for particular courses

The exact recognition requirement must be evaluated using the applicable guideline.

---

# 6. Income Criterion

Current Ministry scholarship information states:

Parental income from all sources must not exceed:

₹2.50 lakh per annum.

The income criterion must be treated as a current-source field.

Do not hard-code this value permanently without recording the source/version.

---

# 7. Scholarship Components

The current Ministry description identifies two major components:

## 1. Compulsory Fees

Payment of compulsory fees charged by educational institutions, subject to the applicable limits fixed by the concerned State.

## 2. Maintenance Amount

Maintenance support varies according to the course of study.

The current Ministry page states a range of:

₹230 to ₹1,200 per month.

The exact amount should be determined from the applicable course/group/state rules rather than assumed universally.

---

# 8. Funding Pattern

The current Ministry description states:

- 75:25 Centre-State sharing for applicable States/UTs
- 90:10 for North Eastern and specified special-category States/UTs
- 100% Central funding for UTs without legislature

This is administrative funding information.

It should not be presented to a student as the amount they personally receive.

---

# 9. Important Non-Duplication Rule

The 2023 Post-Matric guidelines state that students pursuing courses in notified Top Class institutions covered by the National Fellowship & Scholarship for Higher Education of ST Students / Top Class component are not entitled to Post-Matric benefits for the same applicable coverage.

Students already registered under Post-Matric before the relevant transition provisions may continue according to the applicable rules.

Aletheia should therefore include a cross-scheme check.

Example:

```text
Student
  ↓
Post-Matric Match
  ↓
Institution = Top Class institution?
  ↓
Check applicable transition/coverage rules

Do not simply show both schemes as simultaneously claimable.

10. Multiple Scholarship Rule

The guidelines state that a scholarship holder under this scheme can hold only one scholarship/stipend at a time.

If awarded another scholarship/stipend, the student may need to exercise an option according to the applicable rules.

Aletheia should flag possible overlap rather than making a final legal determination.

11. Course Duplication Rule

The 2023 guidelines state that a candidate who has completed a course in one stream is not eligible to take a diploma/degree course in a different stream under the specified rule.

The guideline gives examples such as:

B.Com after B.A/B.Sc.
MBBS after B.Tech.

Aletheia should treat previous qualification as a matching input.

12. Matching Inputs

For V1, Post-Matric matching can use:

category
stStatus
educationLevel
course
institution
previousQualification
familyIncome
state
13. Suggested Rule Representation
{
  "scheme": "POST_MATRIC_ST",
  "rules": [
    {
      "type": "ST_STATUS",
      "operator": "EQUALS",
      "value": true
    },
    {
      "type": "FAMILY_INCOME",
      "operator": "LESS_THAN_OR_EQUAL",
      "value": 250000
    },
    {
      "type": "EDUCATION_LEVEL",
      "operator": "POST_MATRIC_OR_ABOVE",
      "value": true
    }
  ]
}

Institution and course recognition should not be reduced to an oversimplified rule if the relevant source requires more detailed verification.

14. Required/Useful Documents

The exact document list may vary by implementation authority and application process.

Aletheia must not invent a universal document list.

Potential application information may include:

ST certificate
Income certificate
Academic records/marksheets
Institution/admission information
Bank/account information
Identity information

These should be marked as:

Required according to current application process

only when verified against the relevant official application instructions.

15. Application Channel

The Ministry describes the scheme as being implemented through State/UT systems and/or the National Scholarship Portal depending on the applicable process.

Aletheia must display the current official application route rather than assuming a single route permanently.

16. Aletheia UI Representation

Recommended student card:

Post-Matric Scholarship for ST Students

Potential Match

✓ ST category
✓ Post-matric course
⚠ Income certificate required for verification

Document readiness:
5 / 6
17. Important Implementation Rule

Aletheia should distinguish:

Potentially eligible based on known profile

from:

Officially eligible

The first is permitted.

The second must not be claimed by Aletheia.

18. Source Verification

Primary source:

Ministry of Tribal Affairs

Official scholarship page:

https://tribal.nic.in/ScholarshiP.aspx

Guideline:

https://tribal.nic.in/downloads/guidelines/post-matric/Post-matric-guidelines-15032023.pdf

Before production use, verify whether a newer guideline/amendment has superseded the 2023 document.