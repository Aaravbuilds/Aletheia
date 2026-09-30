import { GroqAIService } from './GroqAIService';
import { MockAIService } from './MockAIService';
import type { AIService, DocumentAnalysisRequest, MatchExplanationRequest } from './AIService';
import type { DocumentAnalysisResult } from '@/types';

/**
 * Provider resolution with automatic fallback (opencode-master-prompt §9).
 *
 * Groq is used when a key exists. Any failure — missing key, network error,
 * rate limit, timeout, invalid output — silently falls back to the offline
 * provider so the core workflow never breaks.
 */

const mock = new MockAIService();
let groq: GroqAIService | null = null;
let groqChecked = false;

function getGroq(): GroqAIService | null {
  if (!groqChecked) {
    groq = new GroqAIService();
    groqChecked = true;
  }
  return groq && groq.isConfigured() ? groq : null;
}

export function activeAiProvider(): 'GROQ' | 'MOCK' {
  return getGroq() ? 'GROQ' : 'MOCK';
}

export function aiProviderLabel(): string {
  return activeAiProvider() === 'GROQ'
    ? 'Groq (pre-screening assistant)'
    : 'Offline demonstration provider';
}

export async function withFallback<T>(
  operation: (service: AIService) => Promise<T>,
): Promise<{ value: T; provider: 'GROQ' | 'MOCK'; degraded: boolean; error: string | null }> {
  const service = getGroq();
  if (service) {
    try {
      return { value: await operation(service), provider: 'GROQ', degraded: false, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const value = await operation(mock);
      return { value, provider: 'MOCK', degraded: true, error: message };
    }
  }
  return { value: await operation(mock), provider: 'MOCK', degraded: false, error: null };
}

export async function analyzeDocumentSafely(
  request: DocumentAnalysisRequest,
): Promise<{ result: DocumentAnalysisResult; degraded: boolean; error: string | null }> {
  const outcome = await withFallback((service) => service.analyzeDocument(request));
  return {
    result: {
      ...outcome.value,
      provider: outcome.provider,
      degraded: outcome.degraded,
      note: outcome.degraded
        ? `AI pre-screening was unavailable (${outcome.error}). The offline provider produced a reduced result.`
        : outcome.value.note,
    },
    degraded: outcome.degraded,
    error: outcome.error,
  };
}

export async function explainMatchSafely(request: MatchExplanationRequest): Promise<string | null> {
  const service = getGroq();
  if (!service) return null;
  return service.explainMatch(request);
}

export type { AIService, DocumentAnalysisRequest, MatchExplanationRequest };
