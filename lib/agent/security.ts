import { NextResponse } from 'next/server';

export const requireAdminToken = (request: Request) => {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
  const expected = process.env.ADMIN_TOKEN || '';
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
};
