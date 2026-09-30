export const SCHEMA_SQL = `-- Aletheia prototype schema (SQLite).
-- Mirrors docs/06-DATA-AI-SPECS.md. Government-scheme data lives in
-- scholarship_schemes / eligibility_rules / required_documents and is never
-- derived from user input.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL,
  date_of_birth        TEXT,
  gender               TEXT,
  mobile               TEXT,
  email                TEXT NOT NULL,
  state                TEXT,
  district             TEXT,
  category             TEXT,
  is_st                INTEGER NOT NULL DEFAULT 0,
  is_pvtg              INTEGER NOT NULL DEFAULT 0,
  education_level      TEXT,
  course               TEXT,
  institution          TEXT,
  academic_year        TEXT,
  previous_qualification TEXT,
  percentage_or_cgpa   TEXT,
  annual_family_income INTEGER,
  household_size       INTEGER,
  primary_occupation   TEXT,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scholarship_schemes (
  id                     TEXT PRIMARY KEY,
  slug                   TEXT NOT NULL UNIQUE,
  name                   TEXT NOT NULL,
  short_name             TEXT NOT NULL,
  description            TEXT NOT NULL,
  target_group           TEXT NOT NULL,
  type                   TEXT NOT NULL CHECK (type IN ('SCHOLARSHIP', 'FELLOWSHIP')),
  scheme_class           TEXT NOT NULL,
  provider               TEXT NOT NULL,
  is_active              INTEGER NOT NULL DEFAULT 1,
  application_start_date TEXT,
  application_end_date   TEXT,
  selection_year         TEXT,
  scheme_version         TEXT NOT NULL,
  last_verified_at       TEXT NOT NULL,
  source_url             TEXT NOT NULL,
  source_title           TEXT NOT NULL,
  benefits_json          TEXT NOT NULL DEFAULT '[]',
  notes_json             TEXT NOT NULL DEFAULT '[]',
  benefits_verification_note TEXT,
  application_channel_note TEXT NOT NULL DEFAULT '',
  sort_order             INTEGER NOT NULL DEFAULT 0,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS eligibility_rules (
  id          TEXT PRIMARY KEY,
  scheme_id   TEXT NOT NULL REFERENCES scholarship_schemes(id) ON DELETE CASCADE,
  rule_type   TEXT NOT NULL,
  operator    TEXT NOT NULL,
  value       TEXT,
  label       TEXT NOT NULL,
  description TEXT NOT NULL,
  required    INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS required_documents (
  id                 TEXT PRIMARY KEY,
  scheme_id          TEXT NOT NULL REFERENCES scholarship_schemes(id) ON DELETE CASCADE,
  document_type      TEXT NOT NULL,
  document_name      TEXT NOT NULL,
  required           INTEGER NOT NULL DEFAULT 1,
  description        TEXT NOT NULL DEFAULT '',
  requirement_source TEXT NOT NULL DEFAULT 'INDICATIVE',
  sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS documents (
  id                    TEXT PRIMARY KEY,
  student_id            TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  document_type         TEXT NOT NULL,
  document_name         TEXT NOT NULL,
  source                TEXT NOT NULL CHECK (source IN ('UPLOAD', 'DIGILOCKER', 'IMPORTED')),
  file_name             TEXT,
  storage_key           TEXT,
  mime_type             TEXT,
  file_size             INTEGER,
  status                TEXT NOT NULL,
  uploaded_at           TEXT NOT NULL,
  expiry_date           TEXT,
  extracted_data        TEXT,
  extraction_confidence REAL,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_student ON documents(student_id);

CREATE TABLE IF NOT EXISTS document_ai_findings (
  id          TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL,
  severity    TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence  REAL,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_findings_document ON document_ai_findings(document_id);

CREATE TABLE IF NOT EXISTS applications (
  id                  TEXT PRIMARY KEY,
  application_number  TEXT NOT NULL UNIQUE,
  student_id          TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  scheme_id           TEXT NOT NULL REFERENCES scholarship_schemes(id),
  status              TEXT NOT NULL,
  snapshot_json       TEXT,
  draft_json          TEXT,
  current_step        INTEGER NOT NULL DEFAULT 1,
  declaration_accepted INTEGER NOT NULL DEFAULT 0,
  cycle_label         TEXT,
  submitted_at        TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS application_documents (
  id                      TEXT PRIMARY KEY,
  application_id          TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_id             TEXT REFERENCES documents(id),
  required_document_type  TEXT NOT NULL,
  status                  TEXT NOT NULL,
  is_replacement          INTEGER NOT NULL DEFAULT 0,
  submitted_at            TEXT,
  reviewed_at             TEXT,
  review_notes            TEXT
);

CREATE INDEX IF NOT EXISTS idx_appdocs_application ON application_documents(application_id);

CREATE TABLE IF NOT EXISTS deficiencies (
  id                     TEXT PRIMARY KEY,
  application_id         TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_id            TEXT REFERENCES documents(id),
  required_document_type TEXT,
  type                   TEXT NOT NULL,
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL,
  required_action        TEXT NOT NULL,
  status                 TEXT NOT NULL,
  created_by             TEXT,
  created_at             TEXT NOT NULL,
  resolved_at            TEXT,
  resolved_document_id   TEXT
);

CREATE INDEX IF NOT EXISTS idx_deficiencies_application ON deficiencies(application_id);

CREATE TABLE IF NOT EXISTS application_activity (
  id             TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  actor_id       TEXT,
  actor_role     TEXT NOT NULL,
  event_type     TEXT NOT NULL,
  description    TEXT NOT NULL,
  metadata_json  TEXT,
  created_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_application ON application_activity(application_id);

CREATE TABLE IF NOT EXISTS notifications (
  id                     TEXT PRIMARY KEY,
  user_id                TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                   TEXT NOT NULL,
  title                  TEXT NOT NULL,
  message                TEXT NOT NULL,
  related_application_id TEXT,
  related_document_id    TEXT,
  is_read                INTEGER NOT NULL DEFAULT 0,
  created_at             TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS app_counters (
  key   TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);
`;
