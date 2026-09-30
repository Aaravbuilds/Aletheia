import { z } from 'zod';
import { DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import type { DocumentAnalysisResult, ExtractedDocumentData } from '@/types';

/**
 * AI output is untrusted input. Every model response passes through this schema
 * before it is stored or displayed (opencode-master-prompt §11).
 */

const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABEL) as [string, ...string[]];

export const aiAnalysisSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES),
  confidence: z.number().min(0).max(1),
  fields: z
    .object({
      name: z.string().nullable().optional(),
      income: z.union([z.string(), z.number(), z.null()]).optional(),
      financialYear: z.string().nullable().optional(),
      institution: z.string().nullable().optional(),
      course: z.string().nullable().optional(),
      certificateType: z.string().nullable().optional(),
      issuingAuthority: z.string().nullable().optional(),
      issueDate: z.string().nullable().optional(),
      expiryDate: z.string().nullable().optional(),
      documentNumber: z.string().nullable().optional(),
    })
    .passthrough(),
  findings: z
    .array(
      z.object({
        type: z.enum([
          'DOCUMENT_CLASSIFICATION',
          'FIELD_EXTRACTION',
          'NAME_VARIATION',
          'MISSING_FIELD',
          'POSSIBLE_EXPIRY',
          'CONSISTENCY_CHECK',
        ]),
        severity: z.enum(['INFO', 'WARNING', 'HIGH']),
        message: z.string().min(1).max(400),
        confidence: z.number().min(0).max(1).nullable().default(null),
      }),
    )
    .max(12)
    .default([]),
});

export type AiAnalysisPayload = z.infer<typeof aiAnalysisSchema>;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON object.');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export function parseAiAnalysis(raw: string, documentName: string): AiAnalysisPayload {
  const parsed = aiAnalysisSchema.safeParse(extractJson(raw));
  if (!parsed.success) {
    throw new Error(`Model response failed validation: ${parsed.error.issues[0]?.message ?? 'unknown issue'}`);
  }
  return parsed.data;
}

export function toAnalysisResult(
  payload: AiAnalysisPayload,
  provider: 'GROQ' | 'MOCK',
  documentName: string,
  options: { degraded?: boolean; note?: string | null } = {},
): DocumentAnalysisResult {
  const fields: ExtractedDocumentData = {};
  for (const [key, value] of Object.entries(payload.fields)) {
    if (value === undefined || value === null || value === '') continue;
    fields[key] = value as string | number;
  }

  return {
    documentType: payload.documentType as DocumentAnalysisResult['documentType'],
    documentName,
    confidence: payload.confidence,
    fields,
    findings: payload.findings.map((finding) => ({
      type: finding.type,
      severity: finding.severity,
      title: titleFromMessage(finding.message),
      description: finding.message,
      confidence: finding.confidence,
    })),
    provider,
    degraded: options.degraded ?? false,
    note: options.note ?? null,
  };
}

function titleFromMessage(message: string): string {
  const firstSentence = message.split(/[.!?]/)[0]?.trim() ?? message;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 67)}…` : firstSentence;
}
