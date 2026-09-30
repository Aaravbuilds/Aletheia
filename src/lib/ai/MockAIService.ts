import type { DocumentAnalysisResult, DocumentType } from '@/types';
import type { AIService, DocumentAnalysisRequest, MatchExplanationRequest } from './AIService';

/**
 * Deterministic offline provider. It is used when GROQ_API_KEY is absent, when
 * a request fails, times out or is rate limited. It always returns a valid
 * structure and never throws, so the document workflow keeps working
 * without any external service.
 */

const IDENTITY_HINTS = ['aadhaar', 'aadhar', 'pan card', 'ration card'];

const KEYWORDS: { type: DocumentType; keywords: string[]; confidence: number }[] = [
  { type: 'ST_CERTIFICATE', keywords: ['st certificate', 'scheduled tribe', 'tribal certificate', 'stcert'], confidence: 0.9 },
  { type: 'INCOME_CERTIFICATE', keywords: ['income certificate', 'income', 'salary', 'incomecert'], confidence: 0.88 },
  { type: 'MARKSHEET', keywords: ['marksheet', 'mark sheet', 'marks', 'transcript', 'grade card'], confidence: 0.86 },
  { type: 'COLLEGE_ID', keywords: ['college id', 'identity card', 'id card', 'student id'], confidence: 0.84 },
  { type: 'ADMISSION_PROOF', keywords: ['admission letter', 'admission', 'enrolment', 'enrollment', 'bonafide'], confidence: 0.84 },
  { type: 'ADMISSION_OFFER', keywords: ['offer letter', 'offer of admission'], confidence: 0.84 },
  { type: 'BANK_PROOF', keywords: ['passbook', 'bank statement', 'account proof', 'bank proof'], confidence: 0.86 },
  { type: 'FEE_RECEIPT', keywords: ['fee receipt', 'receipt'], confidence: 0.82 },
  { type: 'PASSPORT_DOCUMENT', keywords: ['passport'], confidence: 0.9 },
];

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Transparent name comparison: exact, initials, or shared tokens. */
function compareNames(profileName: string, documentName: string): 'MATCH' | 'VARIATION' | 'UNKNOWN' {
  const a = normalise(profileName);
  const b = normalise(documentName);
  if (!a || !b) return 'UNKNOWN';
  if (a === b) return 'MATCH';

  const aTokens = a.split(' ');
  const bTokens = b.split(' ');
  if (aTokens.length === bTokens.length && aTokens.map((t) => t[0]).join('') === bTokens.map((t) => t[0]).join('')) {
    return 'VARIATION';
  }
  const shared = bTokens.filter((token) => aTokens.includes(token)).length;
  if (shared > 0 && shared === Math.min(aTokens.length, bTokens.length)) return 'VARIATION';
  return 'UNKNOWN';
}

export class MockAIService implements AIService {
  readonly provider = 'MOCK' as const;

  isConfigured(): boolean {
    return true;
  }

  async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    const haystack = normalise(`${request.fileName} ${request.textHint ?? ''}`);
    const findings: DocumentAnalysisResult['findings'] = [];
    const fields: DocumentAnalysisResult['fields'] = {};

    let detected: DocumentType = request.selectedType ?? 'OTHER';
    let confidence = request.selectedType ? 0.55 : 0.35;
    let reason = request.selectedType
      ? 'Classification was taken from the document type selected by the student.'
      : 'No document type was selected, so the document needs to be classified by a person.';

    for (const candidate of KEYWORDS) {
      const hit = candidate.keywords.find((keyword) => haystack.includes(keyword));
      if (!hit) continue;
      if (request.selectedType && request.selectedType !== candidate.type) {
        findings.push({
          type: 'DOCUMENT_CLASSIFICATION',
          severity: 'WARNING',
          title: 'File name suggests a different document type',
          description: `The file name suggests "${candidate.type.replace(/_/g, ' ').toLowerCase()}" but "${request.selectedType.replace(/_/g, ' ').toLowerCase()}" was selected. Please confirm the correct document.`,
          confidence: candidate.confidence,
        });
      }
      if (!request.selectedType) {
        detected = candidate.type;
        confidence = candidate.confidence;
        reason = `The file name contains "${hit}".`;
      }
      break;
    }

    if (IDENTITY_HINTS.some((hint) => haystack.includes(hint))) {
      findings.push({
        type: 'DOCUMENT_CLASSIFICATION',
        severity: 'WARNING',
        title: 'This looks like a government identity document',
        description:
          'Aletheia is a prototype and must not store Aadhaar, PAN or ration card numbers. Please remove this file and upload only the documents listed as required for the scheme.',
        confidence: 0.75,
      });
    }

    if (request.declaredName && request.profile.fullName) {
      const state = compareNames(request.profile.fullName, request.declaredName);
      fields.name = request.declaredName;
      if (state === 'VARIATION') {
        findings.push({
          type: 'NAME_VARIATION',
          severity: 'WARNING',
          title: 'Possible name variation detected',
          description: `The name on this document ("${request.declaredName}") is not identical to the name in the profile ("${request.profile.fullName}"). A reviewer must confirm whether this is the same person.`,
          confidence: 0.7,
        });
      } else if (state === 'UNKNOWN') {
        findings.push({
          type: 'NAME_VARIATION',
          severity: 'INFO',
          title: 'Name on document could not be compared',
          description: 'The name typed on the document could not be compared with the profile name.',
          confidence: 0.4,
        });
      }
    } else {
      findings.push({
        type: 'MISSING_FIELD',
        severity: 'INFO',
        title: 'Name field not provided',
        description:
          'Enter the name exactly as printed on the document so the offline consistency check can compare it with your profile.',
        confidence: null,
      });
    }

    findings.push({
      type: 'FIELD_EXTRACTION',
      severity: 'INFO',
      title: 'Text extraction needs the AI provider',
      description: `Fields such as income, issue date and issuing authority are read by Groq when GROQ_API_KEY is configured. Without it, the offline provider only reports the checks above.`,
      confidence: null,
    });

    return {
      documentType: detected,
      documentName: reason,
      confidence,
      fields,
      findings,
      provider: 'MOCK',
      degraded: false,
      note: 'Processed by the offline demonstration provider. No AI request was made and no document content was read.',
    };
  }

  async explainMatch(_request: MatchExplanationRequest): Promise<string | null> {
    return null;
  }
}
