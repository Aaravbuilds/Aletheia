'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createUser, endSession, findUserByEmail, homePathForRole, startSession } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createUserWithProfile } from '@/lib/services/accounts';
import { isDatabaseSeeded } from '@/lib/db/client';

export interface AuthState {
  error?: string;
  message?: string;
}

function ensureSeeded(): AuthState {
  if (isDatabaseSeeded()) return {};
  return {
    error: 'The prototype database is not seeded yet. Run "npm run db:reset" and try again.',
  };
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const seeded = ensureSeeded();
  if (seeded.error) return seeded;

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter both your email address and password.' };
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: 'Those details did not match an account. Check the demo credentials shown below.' };
  }

  await startSession(user.id, user.role);
  redirect(homePathForRole(user.role));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const seeded = ensureSeeded();
  if (seeded.error) return seeded;

  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (fullName.length < 3) return { error: 'Enter your full name as it appears on your records.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Use a password of at least 8 characters.' };
  if (password !== confirm) return { error: 'The two passwords do not match.' };
  if (findUserByEmail(email)) return { error: 'An account with that email already exists.' };

  const passwordHash = hashPassword(password);
  const userId = createUser({ email, passwordHash, fullName, role: 'STUDENT' });
  createUserWithProfile(userId, { fullName, email });

  await startSession(userId, 'STUDENT');
  revalidatePath('/', 'layout');
  redirect('/student/profile?welcome=1');
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect('/login');
}
