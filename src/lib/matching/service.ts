import { listDocuments } from '@/lib/db/documents';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeById, listAllRequiredDocuments, listAllRules, listSchemes } from '@/lib/db/schemes';
import { findOpenApplication, listApplicationsForStudent } from '@/lib/db/applications';
import { calculateReadiness } from '@/lib/documents/readiness';
import { evaluateRules, statusFromConditions } from '@/lib/matching/engine';
import { isOpenStatus } from '@/lib/domain/workflow';
import type { MatchStatus, RequiredDocument, SchemeMatchResult, StudentProfile } from '@/types';

/**
 * Composes the deterministic engine with document readiness and any existing
 * application. This is the single entry point used by the student dashboard,
 * the scholarship list and the scholarship detail page.
 */

const STATUS_RANK: Record<MatchStatus, number> = {
  MATCH: 0,
  ACTION_REQUIRED: 1,
  NOT_MATCHING: 2,
};

function buildResult(
  schemeId: string,
  profile: StudentProfile,
  rules: ReturnType<typeof listAllRules>,
  requiredDocuments: RequiredDocument[],
  documents: ReturnType<typeof listDocuments>,
  applications: ReturnType<typeof listApplicationsForStudent>,
): SchemeMatchResult | null {
  const scheme = getSchemeById(schemeId);
  if (!scheme) return null;

  const schemeRules = rules.filter((rule) => rule.schemeId === schemeId);
  const conditions = evaluateRules(schemeRules, profile);
  const readiness = calculateReadiness(
    requiredDocuments.filter((doc) => doc.schemeId === schemeId),
    documents,
  );

  let status: MatchStatus = statusFromConditions(conditions);
  if (status === 'MATCH' && readiness.availableCount < readiness.requiredCount) {
    status = 'ACTION_REQUIRED';
  }

  const existing = applications.find((app) => app.schemeId === schemeId && isOpenStatus(app.status));

  return {
    scheme,
    status,
    statusLabel: matchLabel(status),
    conditions,
    matchedConditions: conditions.filter((c) => c.outcome === 'MET'),
    unmetConditions: conditions.filter((c) => c.outcome === 'UNMET'),
    informationNeeded: conditions.filter(
      (c) => c.outcome === 'INFORMATION_REQUIRED' || c.outcome === 'VERIFICATION_REQUIRED',
    ),
    readiness,
    application: existing
      ? {
          id: existing.id,
          applicationNumber: existing.applicationNumber,
          status: existing.status,
        }
      : null,
  };
}

function matchLabel(status: MatchStatus): string {
  switch (status) {
    case 'MATCH':
      return 'Likely Match';
    case 'ACTION_REQUIRED':
      return 'Action Required';
    default:
      return 'Not Currently Matching';
  }
}

export function getStudentMatches(studentId: string): SchemeMatchResult[] {
  const profile = getProfileById(studentId);
  if (!profile) return [];

  const rules = listAllRules();
  const requiredDocuments = listAllRequiredDocuments();
  const documents = listDocuments(studentId);
  const applications = listApplicationsForStudent(studentId);

  return listSchemes()
    .map((scheme) => buildResult(scheme.id, profile, rules, requiredDocuments, documents, applications))
    .filter((result): result is SchemeMatchResult => result !== null)
    .sort((a, b) => {
      const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (byStatus !== 0) return byStatus;
      const aMissing = a.readiness.requiredCount - a.readiness.availableCount;
      const bMissing = b.readiness.requiredCount - b.readiness.availableCount;
      return aMissing - bMissing;
    });
}

export function getSchemeMatch(studentId: string, schemeId: string): SchemeMatchResult | null {
  const profile = getProfileById(studentId);
  if (!profile) return null;
  return buildResult(
    schemeId,
    profile,
    listAllRules(),
    listAllRequiredDocuments(),
    listDocuments(studentId),
    listApplicationsForStudent(studentId),
  );
}

export function getSchemeMatchBySlug(studentId: string, slug: string): SchemeMatchResult | null {
  const scheme = listSchemes(true).find((item) => item.slug === slug);
  if (!scheme) return null;
  return getSchemeMatch(studentId, scheme.id);
}

export function hasOpenApplication(studentId: string, schemeId: string): boolean {
  return findOpenApplication(studentId, schemeId) !== null;
}

export function matchCounts(results: SchemeMatchResult[]) {
  return {
    total: results.length,
    match: results.filter((r) => r.status === 'MATCH').length,
    actionRequired: results.filter((r) => r.status === 'ACTION_REQUIRED').length,
    notMatching: results.filter((r) => r.status === 'NOT_MATCHING').length,
  };
}
