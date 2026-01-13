import { NextResponse } from 'next/server';
import { readUsers, writeUsers } from '../../../../lib/auth-store';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.json();
  if (!isNonEmptyString(payload?.email) || !isNonEmptyString(payload?.code)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const users = await readUsers();
  const email = payload.email.trim().toLowerCase();
  const index = users.findIndex((user) => user.email.toLowerCase() === email);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const user = users[index];
  if (user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  if (!user.verificationCode || user.verificationCode !== payload.code.trim()) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  }

  if (user.verificationExpiresAt && new Date(user.verificationExpiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Code expired' }, { status: 410 });
  }

  const updatedUser = {
    ...user,
    emailVerified: true,
    verificationCode: undefined,
    verificationExpiresAt: undefined,
  };

  const nextUsers = [...users];
  nextUsers[index] = updatedUser;
  await writeUsers(nextUsers);

  return NextResponse.json({ ok: true });
}
