import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('psg_session')?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified !== false,
    },
  });
}
