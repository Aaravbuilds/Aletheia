import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Database access is isolated behind this module so the prototype can be moved
 * to Postgres/Supabase later without touching feature code
 * (docs/05-TECH-ARCHITECTURE.md — "keep database access isolated").
 */

const ROOT = process.cwd();
const DB_PATH = path.resolve(ROOT, process.env.DATABASE_PATH || '.data/aletheia.db');
const SCHEMA_PATH = path.resolve(ROOT, 'src/lib/db/schema.sql');

declare global {
  // eslint-disable-next-line no-var
  var __aletheiaDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const dir = path.dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(readFileSync(SCHEMA_PATH, 'utf8'));
  return db;
}

export function getDb(): Database.Database {
  if (!globalThis.__aletheiaDb) {
    globalThis.__aletheiaDb = createConnection();
  }
  return globalThis.__aletheiaDb;
}

export function isDatabaseSeeded(): boolean {
  try {
    const row = getDb().prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
    return row.count > 0;
  } catch {
    return false;
  }
}

/** Ensures a usable database exists before any request is served. */
export function ensureDatabase(): void {
  getDb();
}

export function nowIso(): string {
  return new Date().toISOString();
}

let idCounter = 0;
export function newId(prefix: string): string {
  idCounter = (idCounter + 1) % 1_000_000;
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${stamp}${idCounter.toString(36).padStart(3, '0')}${rand}`;
}

/* ------------------------------------------------------------------ */
/* Row mapping helpers                                                 */
/* ------------------------------------------------------------------ */

export function toBool(value: unknown): boolean {
  return value === 1 || value === true || value === '1';
}

export function fromBool(value: boolean | null | undefined): number {
  return value ? 1 : 0;
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}
