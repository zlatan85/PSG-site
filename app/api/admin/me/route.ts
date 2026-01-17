import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth-store';

const parseAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('psg_session')?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false }, { status: 401 });
  }

  const admins = parseAdminEmails();
  const isAdmin = admins.length > 0 && admins.includes(user.email.toLowerCase());

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified ?? false,
    },
    isAdmin,
  });
}
