import { getDb, parseJson } from '@/lib/db/client';
import type {
  EligibilityRule,
  RequiredDocument,
  ScholarshipScheme,
  SchemeWithRelations,
} from '@/types';

interface SchemeRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  target_group: string;
  type: ScholarshipScheme['type'];
  scheme_class: ScholarshipScheme['schemeClass'];
  provider: string;
  is_active: number;
  application_start_date: string | null;
  application_end_date: string | null;
  selection_year: string | null;
  scheme_version: string;
  last_verified_at: string;
  source_url: string;
  source_title: string;
  benefits_json: string;
  notes_json: string;
  benefits_verification_note: string | null;
  application_channel_note: string;
}

interface RuleRow {
  id: string;
  scheme_id: string;
  rule_type: EligibilityRule['ruleType'];
  operator: EligibilityRule['operator'];
  value: string | null;
  label: string;
  description: string;
  required: number;
  sort_order: number;
}

interface RequiredDocRow {
  id: string;
  scheme_id: string;
  document_type: RequiredDocument['documentType'];
  document_name: string;
  required: number;
  description: string;
  requirement_source: RequiredDocument['requirementSource'];
  sort_order: number;
}

function mapScheme(row: SchemeRow): ScholarshipScheme {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    targetGroup: row.target_group,
    type: row.type,
    schemeClass: row.scheme_class,
    provider: row.provider,
    isActive: row.is_active === 1,
    applicationStartDate: row.application_start_date,
    applicationEndDate: row.application_end_date,
    selectionYear: row.selection_year,
    schemeVersion: row.scheme_version,
    lastVerifiedAt: row.last_verified_at,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    benefits: parseJson<string[]>(row.benefits_json, []),
    importantNotes: parseJson<string[]>(row.notes_json, []),
    benefitsVerificationNote: row.benefits_verification_note,
    applicationChannelNote: row.application_channel_note,
  };
}

function mapRule(row: RuleRow): EligibilityRule {
  return {
    id: row.id,
    schemeId: row.scheme_id,
    ruleType: row.rule_type,
    operator: row.operator,
    value: row.value,
    label: row.label,
    description: row.description,
    required: row.required === 1,
    sortOrder: row.sort_order,
  };
}

function mapRequiredDocument(row: RequiredDocRow): RequiredDocument {
  return {
    id: row.id,
    schemeId: row.scheme_id,
    documentType: row.document_type,
    documentName: row.document_name,
    required: row.required === 1,
    description: row.description,
    requirementSource: row.requirement_source,
    sortOrder: row.sort_order,
  };
}

export function listSchemes(includeInactive = false): ScholarshipScheme[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM scholarship_schemes ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order, name`,
    )
    .all() as SchemeRow[];
  return rows.map(mapScheme);
}

export function getSchemeById(id: string): ScholarshipScheme | null {
  const row = getDb().prepare('SELECT * FROM scholarship_schemes WHERE id = ?').get(id) as
    | SchemeRow
    | undefined;
  return row ? mapScheme(row) : null;
}

export function getSchemeBySlug(slug: string): ScholarshipScheme | null {
  const row = getDb().prepare('SELECT * FROM scholarship_schemes WHERE slug = ?').get(slug) as
    | SchemeRow
    | undefined;
  return row ? mapScheme(row) : null;
}

export function getSchemeByIdWithRelations(id: string): SchemeWithRelations | null {
  const scheme = getSchemeById(id);
  if (!scheme) return null;
  return { ...scheme, rules: listRules(id), requiredDocuments: listRequiredDocuments(id) };
}

export function getSchemeBySlugWithRelations(slug: string): SchemeWithRelations | null {
  const scheme = getSchemeBySlug(slug);
  if (!scheme) return null;
  return { ...scheme, rules: listRules(scheme.id), requiredDocuments: listRequiredDocuments(scheme.id) };
}

export function listRules(schemeId: string): EligibilityRule[] {
  const rows = getDb()
    .prepare('SELECT * FROM eligibility_rules WHERE scheme_id = ? ORDER BY sort_order')
    .all(schemeId) as RuleRow[];
  return rows.map(mapRule);
}

export function listAllRules(): EligibilityRule[] {
  const rows = getDb().prepare('SELECT * FROM eligibility_rules ORDER BY scheme_id, sort_order').all() as RuleRow[];
  return rows.map(mapRule);
}

export function listRequiredDocuments(schemeId: string): RequiredDocument[] {
  const rows = getDb()
    .prepare('SELECT * FROM required_documents WHERE scheme_id = ? ORDER BY sort_order')
    .all(schemeId) as RequiredDocRow[];
  return rows.map(mapRequiredDocument);
}

export function listAllRequiredDocuments(): RequiredDocument[] {
  const rows = getDb()
    .prepare('SELECT * FROM required_documents ORDER BY scheme_id, sort_order')
    .all() as RequiredDocRow[];
  return rows.map(mapRequiredDocument);
}
