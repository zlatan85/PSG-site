import { NextResponse } from 'next/server';
import {
  createVerificationCode,
  readUsers,
  verificationExpiry,
  writeUsers,
} from '../../../../lib/auth-store';
import { sendVerificationEmail } from '../../../../lib/email';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.json();
  if (!isNonEmptyString(payload?.email)) {
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

  const verificationCode = createVerificationCode();
  const updatedUser = {
    ...user,
    verificationCode,
    verificationExpiresAt: verificationExpiry(),
  };

  const nextUsers = [...users];
  nextUsers[index] = updatedUser;
  await writeUsers(nextUsers);

  try {
    await sendVerificationEmail(user.email, verificationCode);
  } catch (mailError) {
    console.error('Failed to resend verification email:', mailError);
    return NextResponse.json({ error: 'Email service unavailable' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
