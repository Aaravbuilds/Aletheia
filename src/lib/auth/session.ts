import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getDb, nowIso } from '@/lib/db/client';
import type { UserRole } from '@/types';

const SESSION_COOKIE = 'aletheia_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentId: string | null;
}

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

/**
 * Demo-only fallback so the prototype logs in even when AUTH_SECRET has not
 * been configured (e.g. a fresh Vercel deployment). Set AUTH_SECRET in the
 * .env.local / hosting environment to sign sessions with your own key.
 */
const DEMO_SESSION_SECRET = 'aletheia-demo-session-secret-change-me-in-production';

let warnedAboutSecret = false;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 32) return value;
  if (!warnedAboutSecret) {
    warnedAboutSecret = true;
    // eslint-disable-next-line no-console
    console.warn('[aletheia] AUTH_SECRET missing or too short — using the demo fallback secret for session signing.');
  }
  return DEMO_SESSION_SECRET;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function encodeSession(userId: string, role: UserRole): string {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const body = Buffer.from(JSON.stringify({ uid: userId, role, exp: expiresAt })).toString('base64url');
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string | undefined): { uid: string; role: UserRole } | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      uid: string;
      role: UserRole;
      exp: number;
    };
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return { uid: parsed.uid, role: parsed.role };
  } catch {
    return null;
  }
}

export function findUserByEmail(email: string): UserRow | null {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE')
    .get(email.trim()) as UserRow | undefined;
  return row ?? null;
}

export function findUserById(id: string): UserRow | null {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return row ?? null;
}

export function findStudentProfileId(userId: string): string | null {
  const row = getDb()
    .prepare('SELECT id FROM student_profiles WHERE user_id = ?')
    .get(userId) as { id: string } | undefined;
  return row?.id ?? null;
}

export function createUser(input: {
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
}): string {
  const db = getDb();
  const id = `usr_${input.email.replace(/[^a-z0-9]/gi, '').slice(0, 18).toLowerCase()}`;
  const now = nowIso();
  db.prepare(
    'INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(id, input.email.trim().toLowerCase(), input.passwordHash, input.fullName, input.role, now, now);
  return id;
}

export async function startSession(userId: string, role: UserRole): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(userId, role), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Reads the signed session cookie and resolves the current user. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const parsed = decodeSession(store.get(SESSION_COOKIE)?.value);
  if (!parsed) return null;

  const user = findUserById(parsed.uid);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    studentId: user.role === 'STUDENT' ? findStudentProfileId(user.id) : null,
  };
}

export function homePathForRole(role: UserRole): string {
  return role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
}
