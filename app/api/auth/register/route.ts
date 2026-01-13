import { NextResponse } from 'next/server';
import {
  createVerificationCode,
  verificationExpiry,
  createSalt,
  createSessionToken,
  hashPassword,
  readUsers,
  writeUsers,
  readSessions,
  writeSessions,
  sessionExpiry,
} from '../../../../lib/auth-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.json();
  if (!isNonEmptyString(payload?.name) || !isNonEmptyString(payload?.email) || !isNonEmptyString(payload?.password)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const users = await readUsers();
  const email = payload.email.trim().toLowerCase();
  if (users.some((user) => user.email.toLowerCase() === email)) {
    return NextResponse.json({ error: 'Email already used' }, { status: 409 });
  }

  const salt = createSalt();
  const passwordHash = hashPassword(payload.password.trim(), salt);
  const verificationCode = createVerificationCode();
  const nextId = users.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1;
  const newUser = {
    id: nextId,
    name: payload.name.trim(),
    email,
    salt,
    passwordHash,
    emailVerified: false,
    verificationCode,
    verificationExpiresAt: verificationExpiry(),
    createdAt: new Date().toISOString(),
  };

  await writeUsers([...users, newUser]);

  const token = createSessionToken();
  const sessions = await readSessions();
  const newSession = {
    token,
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    expiresAt: sessionExpiry(),
  };
  await writeSessions([...sessions, newSession]);

  const response = NextResponse.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    emailVerified: false,
    verificationCode,
  });
  response.cookies.set('psg_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
