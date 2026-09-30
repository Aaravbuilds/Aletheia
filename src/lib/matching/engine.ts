import type {
  EligibilityRule,
  MatchCondition,
  MatchStatus,
  RuleOutcome,
  ScholarshipScheme,
  StudentProfile,
} from '@/types';
import { EDUCATION_LEVEL_LABEL } from '@/lib/domain/workflow';
import { formatINR } from '@/lib/utils';

/**
 * Deterministic, rule-based matching engine.
 *
 * The LLM is NOT part of eligibility evaluation — see
 * docs/02-REQUIREMENTS.md §3.4 and docs/05-TECH-ARCHITECTURE.md §11.
 */

function parseValueList(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(',').map((item) => item.trim());
  }
}

function educationLabel(level: string | null): string {
  if (!level) return 'not provided';
  return (EDUCATION_LEVEL_LABEL as Record<string, string>)[level] ?? level;
}

function evaluateRule(rule: EligibilityRule, profile: StudentProfile): MatchCondition {
  const base = {
    ruleId: rule.id,
    label: rule.label,
    description: rule.description,
    required: rule.required,
  };

  switch (rule.operator) {
    case 'REQUIRES_VERIFICATION': {
      const hasContext =
        rule.ruleType === 'INSTITUTION'
          ? Boolean(profile.institution)
          : rule.ruleType === 'COURSE'
            ? Boolean(profile.course)
            : true;
      return {
        ...base,
        outcome: hasContext ? 'VERIFICATION_REQUIRED' : 'INFORMATION_REQUIRED',
        detail: hasContext
          ? 'Aletheia does not hold this list, so the condition must be verified against the official source.'
          : 'Add this information to your profile so the condition can be evaluated.',
      };
    }

    case 'EQUALS': {
      if (rule.ruleType === 'ST_STATUS') {
        const expected = rule.value === 'true';
        return {
          ...base,
          outcome: profile.isST === expected ? 'MET' : 'UNMET',
          detail:
            profile.isST === expected
              ? 'Your profile records Scheduled Tribe status.'
              : 'Your profile does not record Scheduled Tribe status. Aletheia never infers this from a name, location or language.',
        };
      }
      if (rule.ruleType === 'CATEGORY') {
        const expected = rule.value ?? '';
        const actual = profile.category ?? '';
        return {
          ...base,
          outcome: actual === expected ? 'MET' : 'UNMET',
          detail:
            actual === expected
              ? `Your recorded social category is ${actual}.`
              : `Your recorded social category is ${actual || 'not provided'}; this scheme expects ${expected}.`,
        };
      }
      if (rule.ruleType === 'PVTG_STATUS') {
        const expected = rule.value === 'true';
        return {
          ...base,
          outcome: profile.isPVTG === expected ? 'MET' : 'UNMET',
          detail: profile.isPVTG
            ? 'Your profile records PVTG status.'
            : 'Your profile does not record PVTG status.',
        };
      }
      const actual = String((profile as unknown as Record<string, unknown>)[rule.ruleType] ?? '');
      return {
        ...base,
        outcome: actual === (rule.value ?? '') ? 'MET' : 'UNMET',
        detail: actual ? `Recorded value: ${actual}.` : 'This information is not available in your profile.',
      };
    }

    case 'IN': {
      const allowed = parseValueList(rule.value);
      if (rule.ruleType === 'EDUCATION_LEVEL') {
        if (!profile.educationLevel) {
          return {
            ...base,
            outcome: 'INFORMATION_REQUIRED',
            detail: 'Add your current education level to your profile.',
          };
        }
        const met = allowed.includes(profile.educationLevel);
        return {
          ...base,
          outcome: met ? 'MET' : 'UNMET',
          detail: met
            ? `Your education level is ${educationLabel(profile.educationLevel)}, which is covered.`
            : `Your education level is ${educationLabel(profile.educationLevel)}. This scheme covers ${allowed
                .map(educationLabel)
                .join(', ')}.`,
        };
      }
      const actual = String((profile as unknown as Record<string, unknown>)[rule.ruleType] ?? '');
      return {
        ...base,
        outcome: actual && allowed.includes(actual) ? 'MET' : 'UNMET',
        detail: actual ? `Recorded value: ${actual}.` : 'This information is not available in your profile.',
      };
    }

    case 'LESS_THAN_OR_EQUAL': {
      if (rule.ruleType === 'FAMILY_INCOME') {
        if (profile.annualFamilyIncome === null) {
          return {
            ...base,
            outcome: 'INFORMATION_REQUIRED',
            detail: 'Add your annual family income to your profile so this condition can be checked.',
          };
        }
        const limit = Number(rule.value ?? 0);
        const income = profile.annualFamilyIncome;
        const met = income <= limit;
        return {
          ...base,
          outcome: met ? 'MET' : 'UNMET',
          detail: met
            ? `Your annual family income of ${formatINR(income)} is within the published limit of ${formatINR(limit)}.`
            : `Your annual family income of ${formatINR(income)} is above the published limit of ${formatINR(limit)}.`,
        };
      }
      return { ...base, outcome: 'INFORMATION_REQUIRED', detail: 'This condition could not be evaluated.' };
    }

    default:
      return { ...base, outcome: 'INFORMATION_REQUIRED', detail: 'This condition could not be evaluated.' };
  }
}

export interface RuleEvaluation {
  conditions: MatchCondition[];
  status: MatchStatus;
}

export function evaluateRules(rules: EligibilityRule[], profile: StudentProfile): MatchCondition[] {
  return rules.map((rule) => evaluateRule(rule, profile));
}

export function statusFromConditions(conditions: MatchCondition[]): MatchStatus {
  const blocking = conditions.filter((c) => c.required && c.outcome === 'UNMET');
  if (blocking.length > 0) return 'NOT_MATCHING';

  const needsAttention = conditions.some(
    (c) => c.outcome === 'INFORMATION_REQUIRED' || c.outcome === 'VERIFICATION_REQUIRED',
  );
  return needsAttention ? 'ACTION_REQUIRED' : 'MATCH';
}

export function summariseForStatus(conditions: MatchCondition[]): string[] {
  if (conditions.some((c) => c.required && c.outcome === 'UNMET')) {
    return ['A required published condition is not met by your current profile.'];
  }
  if (conditions.some((c) => c.outcome === 'VERIFICATION_REQUIRED')) {
    return ['At least one condition must be verified against the official source before you apply.'];
  }
  if (conditions.some((c) => c.outcome === 'INFORMATION_REQUIRED')) {
    return ['Some information is missing from your profile, so a full evaluation is not possible yet.'];
  }
  return ['Your profile meets every published condition recorded for this scheme.'];
}

export function matchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case 'MATCH':
      return 'Likely Match';
    case 'ACTION_REQUIRED':
      return 'Action Required';
    default:
      return 'Not Currently Matching';
  }
}

export function schemeHeadline(scheme: ScholarshipScheme, status: MatchStatus): string {
  return `${scheme.shortName} — ${matchStatusLabel(status)}`;
}
