import type { DocumentAnalysisResult, DocumentType } from '@/types';

/**
 * Service contract for every AI provider. The rest of the application only
 * ever talks to this interface, so a missing or failing provider can never
 * break the core workflow (opencode-master-prompt §9).
 */

export interface DocumentAnalysisRequest {
  fileName: string;
  mimeType: string;
  /** Type the student selected when uploading. Used as a cross-check. */
  selectedType: DocumentType | null;
  /** Name printed on the document, when the student typed it in. */
  declaredName: string | null;
  /** Any text already available (never real OCR in the prototype). */
  textHint: string | null;
  expectedTypes: { type: DocumentType; label: string }[];
  profile: {
    fullName: string;
    institution: string | null;
    course: string | null;
    annualFamilyIncome: number | null;
  };
}

export interface MatchExplanationRequest {
  schemeName: string;
  status: string;
  conditions: { label: string; outcome: string; detail: string }[];
  readiness: { availableCount: number; requiredCount: number; missing: string[] };
}

export interface AIService {
  readonly provider: 'GROQ' | 'MOCK';
  /** Cheap synchronous check so callers can display the active provider. */
  isConfigured(): boolean;
  analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult>;
  explainMatch(request: MatchExplanationRequest): Promise<string | null>;
}

export class AiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiUnavailableError';
  }
}
