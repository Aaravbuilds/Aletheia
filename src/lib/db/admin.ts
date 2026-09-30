import { getDb } from '@/lib/db/client';
import { mapApplication, type ApplicationRow } from '@/lib/db/applications';
import type { ApplicationRecord } from '@/types';

/**
 * Aggregations for the admin surfaces (review queue, dashboard). Joins live in
 * SQL so the list page stops doing a getProfileById/getSchemeById per row.
 */

export interface ApplicationWithMeta {
  application: ApplicationRecord;
  student: { fullName: string; category: string | null; state: string | null; isST: boolean } | null;
  scheme: { id: string; name: string; shortName: string } | null;
  openDeficiencies: number;
}

interface ApplicationMetaRow extends Record<string, unknown> {
  open_count: number;
  student_full_name: string | null;
  student_category: string | null;
  student_state: string | null;
  student_is_st: number;
  scheme_id: string | null;
  scheme_name: string | null;
  scheme_short_name: string | null;
}

export function listApplicationsWithMeta(): ApplicationWithMeta[] {
  const rows = getDb()
    .prepare(
      `SELECT a.*,
              (SELECT COUNT(*) FROM deficiencies d WHERE d.application_id = a.id AND d.status = 'OPEN') AS open_count,
              p.full_name AS student_full_name,
              p.category AS student_category,
              p.state AS student_state,
              p.is_st AS student_is_st,
              s.id AS scheme_id,
              s.name AS scheme_name,
              s.short_name AS scheme_short_name
       FROM applications a
       LEFT JOIN student_profiles p ON p.id = a.student_id
       LEFT JOIN scholarship_schemes s ON s.id = a.scheme_id
       ORDER BY a.created_at DESC`,
    )
    .all() as (ApplicationMetaRow & ApplicationRow)[];

  return rows.map((row) => ({
    application: mapApplication(row),
    student:
      row.student_full_name !== null
        ? {
            fullName: row.student_full_name,
            category: row.student_category,
            state: row.student_state,
            isST: row.student_is_st === 1,
          }
        : null,
    scheme:
      row.scheme_id !== null
        ? { id: row.scheme_id, name: row.scheme_name!, shortName: row.scheme_short_name! }
        : null,
    openDeficiencies: row.open_count,
  }));
}

export interface ApplicationDocumentStats {
  total: number;
  missing: number;
  submitted: number;
  underReview: number;
  accepted: number;
  needsCorrection: number;
  pendingReview: number;
}

interface StatusCountRow {
  status: string;
  count: number;
}

export function getApplicationDocumentStats(): ApplicationDocumentStats {
  const rows = getDb()
    .prepare('SELECT status, COUNT(*) AS count FROM application_documents GROUP BY status')
    .all() as StatusCountRow[];
  const byStatus = new Map(rows.map((row) => [row.status, row.count]));

  const submitted = byStatus.get('SUBMITTED') ?? 0;
  const underReview = byStatus.get('UNDER_REVIEW') ?? 0;
  const accepted = byStatus.get('ACCEPTED') ?? 0;
  const needsCorrection = byStatus.get('NEEDS_CORRECTION') ?? 0;
  const missing = byStatus.get('MISSING') ?? 0;

  return {
    total: submitted + underReview + accepted + needsCorrection + missing,
    missing,
    submitted,
    underReview,
    accepted,
    needsCorrection,
    pendingReview: submitted + underReview,
  };
}

export interface SchemeApplicationCount {
  id: string;
  shortName: string;
  applications: number;
  queued: number;
}

export function listSchemeApplicationCounts(): SchemeApplicationCount[] {
  const rows = getDb()
    .prepare(
      `SELECT s.id,
              s.short_name AS shortName,
              COUNT(a.id) AS applications,
              SUM(CASE WHEN a.status IN (
                'SUBMITTED','DOCUMENT_VERIFICATION','INSTITUTE_VERIFICATION','UNDER_REVIEW','DECISION_PENDING'
              ) THEN 1 ELSE 0 END) AS queued
       FROM scholarship_schemes s
       LEFT JOIN applications a ON a.scheme_id = s.id
       GROUP BY s.id
       ORDER BY applications DESC, s.short_name`,
    )
    .all() as { id: string; shortName: string; applications: number; queued: number }[];
  return rows.map((row) => ({
    id: row.id,
    shortName: row.shortName,
    applications: row.applications,
    queued: row.queued ?? 0,
  }));
}