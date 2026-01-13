import { NextResponse } from 'next/server';
import {
  createSessionToken,
  hashPassword,
  readSessions,
  readUsers,
  sessionExpiry,
  writeSessions,
} from '../../../../lib/auth-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.json();
  if (!isNonEmptyString(payload?.email) || !isNonEmptyString(payload?.password)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const users = await readUsers();
  const email = payload.email.trim().toLowerCase();
  const user = users.find((item) => item.email.toLowerCase() === email);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const passwordHash = hashPassword(payload.password.trim(), user.salt);
  if (passwordHash !== user.passwordHash) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (user.emailVerified === false) {
    return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
  }

  const token = createSessionToken();
  const sessions = await readSessions();
  const newSession = {
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: sessionExpiry(),
  };
  await writeSessions([...sessions, newSession]);

  const response = NextResponse.json({ id: user.id, name: user.name, email: user.email });
  response.cookies.set('psg_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
