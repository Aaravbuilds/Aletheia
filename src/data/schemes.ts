import type { DocumentType, EligibilityRule, RequirementSource, RequiredDocument } from '@/types';

/**
 * Scheme data transcribed from docs/source-of-truth/*.md.
 *
 * HARD RULE: nothing in this file may be invented. Where the source does not
 * provide a value, the value is left null and the UI shows
 * "Information not available — please verify the current official requirements".
 *
 * `lastVerifiedAt` records when these files were transcribed into the prototype
 * dataset, not a government verification date.
 */

export const SCHEME_VERIFIED_AT = '2026-09-01T00:00:00.000Z';

export interface SeedDocument {
  documentType: DocumentType;
  documentName: string;
  description: string;
  requirementSource: RequirementSource;
}

export interface SeedRule {
  ruleType: EligibilityRule['ruleType'];
  operator: EligibilityRule['operator'];
  value: string | null;
  label: string;
  description: string;
  required?: boolean;
}

export interface SeedScheme {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  targetGroup: string;
  type: 'SCHOLARSHIP' | 'FELLOWSHIP';
  schemeClass: 'CENTRALLY_SPONSORED' | 'CENTRAL_SECTOR';
  provider: string;
  selectionYear: string | null;
  schemeVersion: string;
  sourceUrl: string;
  sourceTitle: string;
  benefits: string[];
  benefitsVerificationNote: string | null;
  importantNotes: string[];
  applicationChannelNote: string;
  rules: SeedRule[];
  documents: SeedDocument[];
  sourceFile: string;
}

export const SEED_SCHEMES: SeedScheme[] = [
  /* ---------------------------------------------------------------- */
  /* Post-Matric Scholarship Scheme for ST Students                   */
  /* source-of-truth/post-matric.md                                  */
  /* ---------------------------------------------------------------- */
  {
    slug: 'post-matric-st',
    name: 'Post-Matric Scholarship Scheme for Scheduled Tribe Students',
    shortName: 'Post-Matric (PMS-ST)',
    description:
      'Centrally sponsored scheme for Scheduled Tribe students pursuing recognized post-matric courses from recognized institutions, for which the qualifying level is Matriculation/Class X or above. Implemented through States and Union Territories.',
    targetGroup: 'Scheduled Tribe students pursuing recognized post-matric courses',
    type: 'SCHOLARSHIP',
    schemeClass: 'CENTRALLY_SPONSORED',
    provider: 'Ministry of Tribal Affairs, Government of India — implemented through States / Union Territories',
    selectionYear: null,
    schemeVersion: 'Post-Matric guidelines (2023)',
    sourceUrl: 'https://tribal.nic.in/ScholarshiP.aspx',
    sourceTitle: 'Ministry of Tribal Affairs scholarship page; Post-Matric guidelines (2023)',
    benefits: [
      'Payment of compulsory fees charged by educational institutions, subject to the applicable limits fixed by the concerned State.',
      'Maintenance support that varies according to the course of study. The Ministry scholarship page states a range of ₹230 to ₹1,200 per month.',
    ],
    benefitsVerificationNote:
      'The exact maintenance amount must be determined from the applicable course / group / State rules rather than assumed universally.',
    importantNotes: [
      'Funding pattern: 75:25 Centre–State sharing for applicable States/UTs, 90:10 for North Eastern and specified special-category States/UTs, and 100% Central funding for UTs without a legislature. This is administrative funding information and is not the amount a student personally receives.',
      'Non-duplication: the 2023 guidelines state that students pursuing courses in notified Top Class institutions covered by the Top Class component are not entitled to Post-Matric benefits for the same applicable coverage. Aletheia flags possible overlap rather than making a final legal determination.',
      'Only one scholarship/stipend at a time: a scholarship holder under this scheme can hold only one scholarship or stipend at a time.',
      'Course duplication: a candidate who has completed a course in one stream is not eligible to take a diploma/degree course in a different stream under the specified rule (for example B.Com after B.A/B.Sc., or MBBS after B.Tech).',
    ],
    applicationChannelNote:
      'The scheme is described as implemented through State/UT systems and/or the National Scholarship Portal depending on the applicable process. Aletheia manages the workflow internally for demonstration and is not a submission to any government portal.',
    rules: [
      {
        ruleType: 'ST_STATUS',
        operator: 'EQUALS',
        value: 'true',
        label: 'Scheduled Tribe status',
        description: 'Applicant must belong to a Scheduled Tribe. Aletheia never infers ST status.',
      },
      {
        ruleType: 'EDUCATION_LEVEL',
        operator: 'IN',
        value: JSON.stringify([
          'POST_MATRIC',
          'UNDERGRADUATE',
          'POSTGRADUATE',
          'M_PHIL',
          'PH_D',
          'POST_DOCTORAL',
        ]),
        label: 'Recognized post-matric course',
        description:
          'The applicant must be pursuing a recognized course for which the qualifying level is Matriculation/Class X or above.',
      },
      {
        ruleType: 'FAMILY_INCOME',
        operator: 'LESS_THAN_OR_EQUAL',
        value: '250000',
        label: 'Parental income limit',
        description:
          'Parental income from all sources must not exceed ₹2,50,000 per annum (current Ministry scholarship information).',
      },
      {
        ruleType: 'INSTITUTION',
        operator: 'REQUIRES_VERIFICATION',
        value: null,
        label: 'Recognised institution',
        description:
          'The institution/course must satisfy the recognition conditions specified by the applicable scheme guidelines (for example UGC-recognised universities and colleges, deemed universities, recognised private universities and professional institutions, State/UT-recognised diploma institutions, and NCVT-affiliated vocational training institutes).',
      },
    ],
    documents: [
      {
        documentType: 'ST_CERTIFICATE',
        documentName: 'Scheduled Tribe Certificate',
        description: 'ST certificate issued by the competent authority.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'INCOME_CERTIFICATE',
        documentName: 'Income Certificate',
        description: 'Income certificate supporting the parental income information.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'MARKSHEET',
        documentName: 'Academic Records / Marksheets',
        description: 'Academic records or marksheets for the qualifying examination.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'ADMISSION_PROOF',
        documentName: 'Institution / Admission Information',
        description: 'Admission or enrolment information from the institution.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'BANK_PROOF',
        documentName: 'Bank / Account Information',
        description: 'Bank or account information required for disbursement.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'IDENTITY_DOCUMENT',
        documentName: 'Identity Information',
        description: 'Identity information of the applicant.',
        requirementSource: 'INDICATIVE',
      },
    ],
    sourceFile: 'docs/source-of-truth/post-matric.md',
  },

  /* ---------------------------------------------------------------- */
  /* National Scholarship Scheme (Top Class)                          */
  /* source-of-truth/top-class.md                                    */
  /* ---------------------------------------------------------------- */
  {
    slug: 'top-class-st',
    name: 'National Scholarship Scheme (Top Class) for Higher Education of ST Students',
    shortName: 'Top Class (NSS)',
    description:
      'Central sector scheme supporting eligible meritorious Scheduled Tribe students pursuing higher education in notified premier institutions. The Ministry currently describes coverage across 265 identified premier institutions.',
    targetGroup:
      'Eligible meritorious Scheduled Tribe students pursuing prescribed higher education courses in notified premier institutions',
    type: 'SCHOLARSHIP',
    schemeClass: 'CENTRAL_SECTOR',
    provider: 'Ministry of Tribal Affairs, Government of India',
    selectionYear: null,
    schemeVersion: 'Top Class — current Ministry scholarship page',
    sourceUrl: 'https://scholarships.gov.in/',
    sourceTitle: 'National Scholarship Portal; Ministry of Tribal Affairs scholarship page',
    benefits: [
      'Tuition fees',
      'Admission fees',
      'Non-refundable fees',
      'Stipend',
      'Allowances for books',
      'Computer-related allowance',
    ],
    benefitsVerificationNote:
      'The exact monetary ceilings must be taken from the latest applicable scheme guideline / amendment. Historical amounts from older webpages must not be used as current values.',
    importantNotes: [
      'Duration: the scholarship is provided for the entire eligible course duration, subject to the applicable scheme conditions.',
      'Institute requirement: the student must be pursuing an eligible course in an institute included in the current notified Top Class institute list. Aletheia deliberately does not store an institute list — the exact list must be obtained from the current official notified list.',
      'Course requirement: only prescribed courses covered by the current scheme are eligible. Not every course in every Top Class institute necessarily qualifies.',
      'Historical data warning: older Ministry documents may reference 213, 246 or 252 institutes, different income ceilings and different award numbers. Those are historical versions and must not overwrite current scheme data.',
      'Where the current source states preferences for categories such as girls, Divyang students or PVTGs, Aletheia shows them as documented preference information only. Preference is not guaranteed selection.',
    ],
    applicationChannelNote:
      'The Ministry currently directs applicants toward the National Scholarship Portal for this scheme. Aletheia manages the application workflow internally for demonstration and is not a submission to the Government portal.',
    rules: [
      {
        ruleType: 'ST_STATUS',
        operator: 'EQUALS',
        value: 'true',
        label: 'Scheduled Tribe status',
        description: 'ST status must be explicitly established. Aletheia never infers ST status.',
      },
      {
        ruleType: 'EDUCATION_LEVEL',
        operator: 'IN',
        value: JSON.stringify(['UNDERGRADUATE', 'POSTGRADUATE', 'M_PHIL', 'PH_D', 'POST_DOCTORAL']),
        label: 'Higher education course',
        description: 'Applicant must be pursuing a prescribed higher education course.',
      },
      {
        ruleType: 'FAMILY_INCOME',
        operator: 'LESS_THAN_OR_EQUAL',
        value: '600000',
        label: 'Family income limit',
        description: 'Family income from all sources should not exceed ₹6.00 lakh per annum.',
      },
      {
        ruleType: 'INSTITUTION',
        operator: 'REQUIRES_VERIFICATION',
        value: null,
        label: 'Notified premier institution',
        description:
          'The institution must appear in the current notified Top Class institute list. Aletheia does not store that list, so this condition must be verified against the official notified list.',
      },
    ],
    documents: [
      {
        documentType: 'ST_CERTIFICATE',
        documentName: 'Scheduled Tribe Certificate',
        description: 'ST certificate issued by the competent authority.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'INCOME_CERTIFICATE',
        documentName: 'Income Certificate',
        description: 'Income certificate supporting the declared family income.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'MARKSHEET',
        documentName: 'Academic Records / Marksheets',
        description: 'Academic records relevant to the current course.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'ADMISSION_PROOF',
        documentName: 'Admission / Institution Proof',
        description: 'Admission or institution proof for the current course.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'IDENTITY_DOCUMENT',
        documentName: 'Identity Information',
        description: 'Identity information of the applicant.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'BANK_PROOF',
        documentName: 'Bank / Account Information',
        description: 'Bank or account information required for disbursement.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'BONAFIDE_CERTIFICATE',
        documentName: 'Bonafide / Institution Certificate',
        description:
          'Other document specified by the current application process (for example a bonafide certificate from the institution).',
        requirementSource: 'INDICATIVE',
      },
    ],
    sourceFile: 'docs/source-of-truth/top-class.md',
  },

  /* ---------------------------------------------------------------- */
  /* National Fellowship Scheme (NFST)                               */
  /* source-of-truth/nfst.md                                         */
  /* ---------------------------------------------------------------- */
  {
    slug: 'nfst',
    name: 'National Fellowship Scheme for Higher Education of ST Students',
    shortName: 'NFST',
    description:
      'Central sector fellowship providing financial assistance to Scheduled Tribe students for M.Phil and Ph.D research studies, subject to the applicable academic and selection conditions.',
    targetGroup: 'Scheduled Tribe students pursuing eligible M.Phil / Ph.D research programmes',
    type: 'FELLOWSHIP',
    schemeClass: 'CENTRAL_SECTOR',
    provider: 'Ministry of Tribal Affairs, Government of India',
    selectionYear: null,
    schemeVersion: 'NFST — current Ministry material',
    sourceUrl: 'https://fellowship.tribal.gov.in/',
    sourceTitle: 'National Fellowship Portal; Ministry of Tribal Affairs scholarship page',
    benefits: [
      'M.Phil: ₹37,000 per month (revised rate effective from 01.01.2023).',
      'Ph.D: ₹37,000 per month for the first two years and ₹42,000 per month for the remaining three years (revised rates effective from 01.01.2023).',
      'Contingency (annual, by stream, per the Ministry annual report) — M.Phil: Humanities & Social Sciences ₹10,000, Science/Engineering/Technology ₹12,000. Ph.D: Humanities & Social Sciences ₹20,500, Science/Engineering/Technology ₹25,000.',
      'HRA at applicable UGC rates, aligned with UGC rates and varying by city category.',
      'Escort allowance for Divyanjan fellows: ₹2,000 per month.',
    ],
    benefitsVerificationNote:
      'The revised rates above are the current monetary reference where applicable. Contingency values must be verified against the latest current guideline before being presented as a current entitlement. Aletheia retains source and version metadata because fellowship rates can change.',
    importantNotes: [
      'Number of fellowships: 750 fresh ST students are provided a fellowship each year. This is an annual number and is not a guaranteed number of seats at any individual institution.',
      'Selection: fresh fellows are selected on merit based on marks obtained in the Master’s degree. Current Ministry material also states preference for girls, Divyang students and PVTGs. Preference does not mean automatic selection.',
      'Income criterion: the Ministry’s annual report states there is no income ceiling in this fellowship scheme. The income ceilings used by Post-Matric, Top Class and the National Overseas Scholarship must not be applied here.',
      'Maximum duration: Ph.D maximum 5 years, M.Phil maximum 2 years, per the Ministry annual report. Continuation requires submission of continuation-related documentation or certification according to the applicable process.',
      'Institution eligibility includes universities, institutions and colleges under applicable UGC Act provisions, deemed universities meeting UGC requirements, institutions funded by the Central/State Government, and institutes of national importance.',
    ],
    applicationChannelNote:
      'Official fellowship portal: https://fellowship.tribal.gov.in/. Aletheia demonstrates an internal application workflow and is not a submission to the official government fellowship portal.',
    rules: [
      {
        ruleType: 'ST_STATUS',
        operator: 'EQUALS',
        value: 'true',
        label: 'Scheduled Tribe status',
        description: 'Applicant must belong to a Scheduled Tribe.',
      },
      {
        ruleType: 'EDUCATION_LEVEL',
        operator: 'IN',
        value: JSON.stringify(['M_PHIL', 'PH_D']),
        label: 'Eligible research programme',
        description: 'The Ministry currently describes the fellowship as supporting M.Phil and Ph.D studies.',
      },
      {
        ruleType: 'INSTITUTION',
        operator: 'REQUIRES_VERIFICATION',
        value: null,
        label: 'Institution eligibility',
        description:
          'The institution must fall within the applicable UGC / deemed university / Government-funded / institute-of-national-importance coverage. The exact current coverage must be verified against the applicable guideline.',
      },
      {
        ruleType: 'ACADEMIC_SCORE',
        operator: 'REQUIRES_VERIFICATION',
        value: null,
        label: 'Merit selection condition',
        description:
          'Selection is merit-based using marks obtained in the Master’s degree. Aletheia does not reproduce the official merit list and cannot rank applicants.',
      },
    ],
    documents: [
      {
        documentType: 'ST_CERTIFICATE',
        documentName: 'Scheduled Tribe Certificate',
        description: 'ST certificate issued by the competent authority.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'IDENTITY_DOCUMENT',
        documentName: 'Identity Information',
        description: 'Identity information of the applicant.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'BANK_PROOF',
        documentName: 'Bank / Account Information',
        description: 'Bank or account information required for fellowship disbursement.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'MARKSHEET',
        documentName: 'Master’s Degree / Marks Document',
        description: 'Master’s degree or marks documentation used for merit selection.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'ADMISSION_PROOF',
        documentName: 'Admission / Enrolment Information',
        description: 'Admission or enrolment information for the research programme.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'OTHER',
        documentName: 'Research Programme Information',
        description: 'Institution and research programme information.',
        requirementSource: 'INDICATIVE',
      },
    ],
    sourceFile: 'docs/source-of-truth/nfst.md',
  },

  /* ---------------------------------------------------------------- */
  /* National Overseas Scholarship (NOS)                              */
  /* source-of-truth/nos.md                                          */
  /* ---------------------------------------------------------------- */
  {
    slug: 'nos',
    name: 'National Overseas Scholarship Scheme',
    shortName: 'NOS',
    description:
      'Central sector scheme providing financial assistance to eligible Scheduled Tribe candidates for higher studies abroad. The Ministry describes the scheme as supporting post-graduate, Ph.D and post-doctoral study. The exact courses covered are governed by the current scheme rules and amendments.',
    targetGroup:
      'Eligible Scheduled Tribe / PVTG candidates pursuing specified higher studies abroad under the current scheme',
    type: 'SCHOLARSHIP',
    schemeClass: 'CENTRAL_SECTOR',
    provider: 'Ministry of Tribal Affairs, Government of India',
    selectionYear: '2026-27',
    schemeVersion: 'NOS 2026-27 — amendment-aware',
    sourceUrl: 'https://overseas.tribal.gov.in/',
    sourceTitle: 'National Overseas Scholarship portal; Ministry of Tribal Affairs scholarship page',
    benefits: [
      'Tuition fee',
      'Annual maintenance allowance: USD 15,400',
      'Contingency charges: USD 1,532',
      'Poll tax where applicable',
      'Visa fee',
      'Medical insurance',
      'Cost of air journey',
      'Incidental journey expenses',
    ],
    benefitsVerificationNote:
      'Monetary values must be versioned because scheme benefits can change. Older Ministry NOS pages and guidelines must not be merged with current information.',
    importantNotes: [
      'Awards: 20 awards are given every year — 17 for ST candidates and 3 for candidates belonging to Particularly Vulnerable Tribal Groups (PVTGs). This is the scheme’s annual award structure, not a guarantee for an individual applicant.',
      '2026-27 amendment: the Ministry currently lists an “Amendment in eligibility criteria and courses covered under the NOS Scheme for ST Students from 2026-27”. That amendment must be treated as authoritative for eligibility and course coverage for the 2026-27 selection year.',
      'Selection: based on an interview-based merit list prepared by an Expert Committee. Aletheia’s matching result does not represent official NOS selection.',
      'Admission after selection: a selected student is given two years to seek admission to a foreign university after selection in the merit list.',
      'Family income: parental/family income from all sources should not exceed ₹6.00 lakh per annum.',
      'Disbursement: through Indian Missions abroad via the Ministry of External Affairs, reimbursed by the Ministry of Tribal Affairs. Aletheia does not perform this disbursement.',
    ],
    applicationChannelNote:
      'Official NOS portal: https://overseas.tribal.gov.in/. Aletheia demonstrates an internal application workflow and is not an official NOS submission.',
    rules: [
      {
        ruleType: 'ST_STATUS',
        operator: 'EQUALS',
        value: 'true',
        label: 'Scheduled Tribe status',
        description:
          'Eligible candidates are Scheduled Tribe candidates, and PVTG candidates under the designated allocation (3 of the 20 annual awards).',
      },
      {
        ruleType: 'FAMILY_INCOME',
        operator: 'LESS_THAN_OR_EQUAL',
        value: '600000',
        label: 'Family income limit',
        description: 'Parental/family income from all sources should not exceed ₹6.00 lakh per annum.',
      },
      {
        ruleType: 'EDUCATION_LEVEL',
        operator: 'IN',
        value: JSON.stringify(['POSTGRADUATE', 'PH_D', 'POST_DOCTORAL']),
        label: 'Study level covered',
        description:
          'The scheme supports higher studies abroad including post-graduation, Ph.D and post-doctoral study.',
      },
      {
        ruleType: 'COURSE',
        operator: 'REQUIRES_VERIFICATION',
        value: null,
        label: 'Course covered under current rules',
        description:
          'The specific courses covered must be taken from the current NOS rules for the applicable selection year, including the 2026-27 amendment on eligibility criteria and courses covered.',
      },
    ],
    documents: [
      {
        documentType: 'ST_CERTIFICATE',
        documentName: 'Scheduled Tribe / PVTG Certificate',
        description: 'ST or PVTG certificate issued by the competent authority.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'INCOME_CERTIFICATE',
        documentName: 'Income Certificate',
        description: 'Income certificate supporting the declared family income.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'MARKSHEET',
        documentName: 'Academic Certificates / Marksheets',
        description: 'Academic certificates and marksheets for qualifications held.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'ADMISSION_OFFER',
        documentName: 'Admission / Offer Information',
        description: 'Admission or offer information from the foreign institution.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'OTHER',
        documentName: 'Foreign Institution & Course Information',
        description: 'Proposed foreign institution, country and course information.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'PASSPORT_DOCUMENT',
        documentName: 'Passport Information',
        description: 'Passport or equivalent travel document information.',
        requirementSource: 'INDICATIVE',
      },
      {
        documentType: 'IDENTITY_DOCUMENT',
        documentName: 'Identity Information',
        description: 'Identity information of the applicant.',
        requirementSource: 'INDICATIVE',
      },
    ],
    sourceFile: 'docs/source-of-truth/nos.md',
  },
];

export const NOT_AVAILABLE = 'Information not available in the verified source. Please verify on the official scheme portal.';
