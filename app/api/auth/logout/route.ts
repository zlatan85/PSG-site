import { NextRequest, NextResponse } from 'next/server';
import { readSessions, writeSessions } from '../../../../lib/auth-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('psg_session')?.value;
  if (token) {
    const sessions = await readSessions();
    await writeSessions(sessions.filter((item) => item.token !== token));
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('psg_session', '', { maxAge: 0, path: '/' });
  return response;
}
