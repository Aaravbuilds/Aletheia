import type { MatchStatus, RuleOutcome } from '@/types';

/**
 * Deterministic, natural-language match explanation.
 *
 * Every sentence is derived from the structured rule evaluation and document
 * readiness — never invented by a model. Groq can rephrase the same facts when
 * available (`getMatchExplanationAction`), but this offline builder is the
 * source of truth and always renders first.
 */

export interface MatchExplanationInput {
  schemeName: string;
  status: MatchStatus;
  conditions: { label: string; outcome: RuleOutcome; detail: string }[];
  readiness: { availableCount: number; requiredCount: number; missing: string[] };
  hasApplication: boolean;
}

export interface MatchExplanation {
  summary: string;
  points: string[];
  footer: string | null;
}

export function buildMatchExplanation(input: MatchExplanationInput): MatchExplanation {
  const met = input.conditions.filter((condition) => condition.outcome === 'MET');
  const verify = input.conditions.filter((condition) => condition.outcome === 'VERIFICATION_REQUIRED');
  const info = input.conditions.filter((condition) => condition.outcome === 'INFORMATION_REQUIRED');
  const unmet = input.conditions.filter((condition) => condition.outcome === 'UNMET');

  const points: string[] = [];
  for (const condition of met) points.push(`${condition.label} — ${condition.detail}`);
  for (const condition of verify) points.push(`${condition.label} — ${condition.detail}`);
  for (const condition of info) points.push(`${condition.label} — ${condition.detail}`);
  for (const condition of unmet) points.push(`${condition.label} — ${condition.detail}`);

  if (input.readiness.requiredCount > 0) {
    if (input.readiness.missing.length === 0 && input.readiness.availableCount >= input.readiness.requiredCount) {
      points.push(
        `Document readiness — every required document (${input.readiness.requiredCount} of ${input.readiness.availableCount}) is in your wallet.`,
      );
    } else {
      points.push(
        `Document readiness — ${input.readiness.availableCount} of ${input.readiness.requiredCount} required documents are ready${
          input.readiness.missing.length ? `; still missing ${input.readiness.missing.join(', ')}` : ''
        }.`,
      );
    }
  }

  let footer: string | null = null;
  if (input.hasApplication) {
    footer = 'You already have an open application for this scheme.';
  } else if (input.status === 'MATCH') {
    footer = 'You can start the application now.';
  } else if (input.readiness.missing.length > 0) {
    footer = 'Add the missing documents to your wallet, then you can start the application.';
  } else if (input.status === 'ACTION_REQUIRED') {
    footer = 'Resolve the points above, update your profile, then you can apply.';
  }

  return { summary: summaryFor(input), points, footer };
}

function summaryFor(input: MatchExplanationInput): string {
  const name = input.schemeName;
  switch (input.status) {
    case 'MATCH':
      return `Based on the information in your profile, ${name} is a likely match — every published condition recorded for this scheme is met.`;
    case 'ACTION_REQUIRED':
      return `You are close to matching ${name}, but a few things need attention before you apply.`;
    default:
      return `${name} is not currently matching your profile because at least one required published condition is unmet.`;
  }
}