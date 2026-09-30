import { redirect } from 'next/navigation';
import { getSessionUser, homePathForRole, type SessionUser } from '@/lib/auth/session';
import type { UserRole } from '@/types';

/**
 * Server-side authorization. UI visibility is never treated as security —
 * every protected route and server action calls one of these helpers
 * (docs/05-TECH-ARCHITECTURE.md §10).
 */

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== role) redirect(homePathForRole(user.role));
  return user;
}

export async function requireStudent(): Promise<SessionUser & { studentId: string }> {
  const user = await requireRole('STUDENT');
  if (!user.studentId) redirect('/student/profile');
  return user as SessionUser & { studentId: string };
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole('ADMIN');
}
