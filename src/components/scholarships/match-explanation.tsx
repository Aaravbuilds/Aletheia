'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

import { getMatchExplanationAction } from '@/app/actions/ai';
import { Alert } from '@/components/ui/feedback';
import type { MatchExplanation } from '@/lib/matching/explain';
import { cn } from '@/lib/utils';

export function MatchExplanation({
  slug,
  status,
  initial,
  aiAvailable,
}: {
  slug: string;
  status: 'MATCH' | 'ACTION_REQUIRED' | 'NOT_MATCHING';
  initial: MatchExplanation;
  aiAvailable: boolean;
}) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  const explanation = aiText ? ({ ...initial, summary: aiText } as MatchExplanation) : initial;

  async function askAi(): Promise<void> {
    if (!aiAvailable) {
      setNotice('The AI provider is not configured. This explanation is written from the recorded rules — which is the source of truth.');
      return;
    }
    setState('loading');
    setNotice(null);
    try {
      const result = await getMatchExplanationAction(slug);
      if (result.text) {
        setAiText(result.text);
        setNotice('Phrased in plain language by the AI pre-screening assistant. The facts come from the rules, not from judgment.');
        setState('done');
      } else {
        setNotice('The AI provider was unavailable, so the rules-based explanation is shown. That explanation is always authoritative.');
        setState('idle');
      }
    } catch {
      setNotice('The AI provider could not be reached. The rules-based explanation below is shown instead.');
      setState('idle');
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'rounded-md border px-4 py-3',
          status === 'MATCH'
            ? 'border-status-success/30 bg-status-success/8'
            : status === 'ACTION_REQUIRED'
              ? 'border-status-warning/35 bg-status-warning/10'
              : 'border-line bg-canvas/60',
        )}
      >
        <p className="flex items-start gap-2 text-sm font-medium text-ink">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-maroon" aria-hidden />
          <span>{explanation.summary}</span>
        </p>
        {explanation.points.length > 0 ? (
          <ul className="mt-3 space-y-1.5 border-t border-line/60 pt-3">
            {explanation.points.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-maroon/60" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        ) : null}
        {explanation.footer ? <p className="mt-3 text-xs font-medium text-ink/80">{explanation.footer}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={askAi}
          disabled={state === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-maroon/40 hover:text-maroon disabled:opacity-60"
        >
          {state === 'loading' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Phrasing it in plain language…
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" aria-hidden />
              {aiAvailable ? 'Explain in plain language with AI' : 'AI is offline — explanation already shown'}
            </>
          )}
        </button>
        {!aiAvailable ? (
          <span className="text-xs text-muted">No GROQ_API_KEY is configured, so the rules-based explanation is used.</span>
        ) : null}
      </div>

      {notice && state !== 'loading' ? (
        <Alert tone={state === 'done' ? 'info' : 'warning'} className="py-2 text-xs">
          <p>{notice}</p>
        </Alert>
      ) : null}
    </div>
  );
}