'use server';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeMatchBySlug } from '@/lib/matching/service';
import { explainMatchSafely } from '@/lib/ai';

export interface MatchExplanationResult {
  text: string | null;
  provider: 'GROQ' | null;
}

/**
 * Client-invokable server action (Groq has no public client-side endpoint for
 * this prototype). Rebuilds the deterministic match server-side and asks Groq
 * to phrase it in plain language. Returns null when Groq is unavailable, so
 * the UI keeps showing the offline explanation.
 */
export async function getMatchExplanationAction(slug: string): Promise<MatchExplanationResult> {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  if (!profile) return { text: null, provider: null };
  const result = getSchemeMatchBySlug(profile.id, slug);
  if (!result) return { text: null, provider: null };

  const text = await explainMatchSafely({
    schemeName: result.scheme.name,
    status: result.status,
    conditions: result.conditions.map((condition) => ({
      label: condition.label,
      outcome: condition.outcome,
      detail: condition.detail,
    })),
    readiness: {
      availableCount: result.readiness.availableCount,
      requiredCount: result.readiness.requiredCount,
      missing: result.readiness.items
        .filter((item) => item.state === 'MISSING')
        .map((item) => item.requiredDocument.documentName),
    },
  });

  return { text, provider: text ? 'GROQ' : null };
}